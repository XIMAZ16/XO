/**
 * Online transport for Ultimate XO.
 *
 * Two interchangeable transports behind one interface:
 *   - "local":  BroadcastChannel. Works between tabs/windows of the same
 *               browser with zero setup. Used for testing and as a fallback.
 *   - "pubnub": real WebSockets across devices. Enabled automatically when
 *               net-config.js holds a publish + subscribe key.
 *
 * Wire protocol (small JSON messages, no server-side logic):
 *   hello   guest announces itself so the host can send a fresh snapshot
 *   state   host -> guest, authoritative board snapshot
 *   move    guest -> host, move request
 *   restart rematch request
 *   leave   player left the room
 *   ping    liveness heartbeat
 */
class XONet {
  constructor(options = {}) {
    this.onMessage = options.onMessage || function () {};
    this.onPeerChange = options.onPeerChange || function () {};
    this.onStatus = options.onStatus || function () {};

    this.id = 'xo-' + Math.random().toString(36).slice(2, 10);
    this.code = null;
    this.transport = null;
    this.heartbeatTimer = null;
    this.watchdogTimer = null;
    this.sdkPromise = null;
    this.peerLastSeen = 0;
    this.peerOnline = false;
  }

  static configured() {
    const cfg = window.XO_NET_CONFIG || {};
    return Boolean(cfg.pubnubPublishKey && cfg.pubnubSubscribeKey);
  }

  static transportName() {
    return XONet.configured() ? 'pubnub' : 'local';
  }

  channelName(code) {
    return 'ultimate-xo-' + String(code).toUpperCase();
  }

  async connect(code) {
    this.disconnect();
    this.code = String(code).toUpperCase();
    this.peerLastSeen = 0;
    this.subscriptionReady = false;

    const wanted = XONet.transportName();
    this.onStatus({ state: 'connecting', transport: wanted });

    if (wanted === 'pubnub') {
      try {
        await this.loadPubNubSdk();
        this.transport = this.createPubNubTransport();
      } catch (err) {
        this.onStatus({
          state: 'error',
          transport: 'local',
          message: 'เชื่อมต่อ PubNub ไม่ได้ ใช้โหมดทดสอบในเบราว์เซอร์แทน'
        });
        this.transport = this.createLocalTransport();
      }
    } else {
      this.transport = this.createLocalTransport();
    }

    if (!this.transport) {
      this.onStatus({
        state: 'error',
        transport: wanted,
        message: 'เบราว์เซอร์นี้ไม่รองรับการเชื่อมต่อออนไลน์'
      });
      return false;
    }

    this.onStatus({ state: 'connected', transport: this.transport.name });
    this.startHeartbeat();

    // A wrong PubNub key never reports an error, it just never subscribes.
    // If the connection event does not arrive, say so instead of hanging.
    if (this.transport.name === 'pubnub') {
      if (this.connectTimer) clearTimeout(this.connectTimer);
      this.connectTimer = setTimeout(() => {
        if (this.subscriptionReady) return;
        this.onStatus({
          state: 'error',
          transport: 'pubnub',
          message: 'เชื่อมต่อ PubNub ไม่สำเร็จ — ตรวจสอบคีย์ใน net-config.js และอินเทอร์เน็ต'
        });
      }, 8000);
    }

    return true;
  }

  disconnect() {
    this.stopHeartbeat();
    if (this.connectTimer) {
      clearTimeout(this.connectTimer);
      this.connectTimer = null;
    }
    this.subscriptionReady = false;
    if (this.transport) {
      try {
        this.transport.close();
      } catch (e) {}
      this.transport = null;
    }
    this.setPeerOnline(false);
    this.code = null;
  }

  send(message) {
    if (!this.transport || !this.code) return false;
    try {
      this.transport.send(Object.assign({}, message, { from: this.id, room: this.code }));
      return true;
    } catch (e) {
      return false;
    }
  }

  handleIncoming(raw) {
    if (!raw || typeof raw !== 'object') return;
    if (raw.from === this.id) return;

    // Any message, including a heartbeat, proves the opponent is still there.
    this.peerLastSeen = Date.now();
    this.setPeerOnline(true);

    if (raw.type === 'ping') return;
    if (raw.type === 'leave') {
      this.peerLastSeen = 0;
      this.setPeerOnline(false);
      return;
    }

    this.onMessage(raw);
  }

  setPeerOnline(value) {
    if (this.peerOnline === value) return;
    this.peerOnline = value;
    this.onPeerChange(value);
  }

  startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      this.send({ type: 'ping' });
    }, 2000);

    // No word from the opponent for 7s means they closed the tab or dropped.
    this.watchdogTimer = setInterval(() => {
      if (!this.peerLastSeen) return;
      if (Date.now() - this.peerLastSeen > 7000) this.setPeerOnline(false);
    }, 2000);
  }

  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    if (this.watchdogTimer) {
      clearInterval(this.watchdogTimer);
      this.watchdogTimer = null;
    }
  }

  /* ------------------------------------------------------------------ */
  /* Local transport (same browser only, zero setup)                     */
  /* ------------------------------------------------------------------ */

  createLocalTransport() {
    if (typeof BroadcastChannel === 'undefined') return null;

    let channel;
    try {
      channel = new BroadcastChannel(this.channelName(this.code));
    } catch (e) {
      return null;
    }

    channel.onmessage = (event) => this.handleIncoming(event.data);

    return {
      name: 'local',
      send: (msg) => channel.postMessage(msg),
      close: () => {
        try {
          channel.close();
        } catch (e) {}
      }
    };
  }

  /* ------------------------------------------------------------------ */
  /* PubNub transport (real remote play)                                 */
  /* ------------------------------------------------------------------ */

  loadPubNubSdk() {
    if (window.PubNub) return Promise.resolve(window.PubNub);
    if (this.sdkPromise) return this.sdkPromise;

    this.sdkPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.pubnub.com/sdk/javascript/pubnub.13.1.2.js';
      script.async = true;
      script.onload = () => resolve(window.PubNub);
      script.onerror = () => reject(new Error('PubNub SDK failed to load'));
      document.head.appendChild(script);
    });

    return this.sdkPromise;
  }

  handlePubNubStatus(event) {
    const category = event && event.category;

    if (category === 'PNConnectedCategory') {
      this.subscriptionReady = true;
      if (this.connectTimer) {
        clearTimeout(this.connectTimer);
        this.connectTimer = null;
      }
      this.onStatus({ state: 'connected', transport: 'pubnub' });
      return;
    }

    if (category === 'PNAccessDeniedCategory' || category === 'PNBadRequestCategory') {
      this.onStatus({
        state: 'error',
        transport: 'pubnub',
        message: 'คีย์ PubNub ไม่ถูกต้องหรือไม่มีสิทธิ์ — ตรวจสอบ net-config.js'
      });
      return;
    }

    if (category === 'PNNetworkIssuesCategory') {
      this.onStatus({
        state: 'error',
        transport: 'pubnub',
        message: 'การเชื่อมต่อ PubNub ขาดหาย กำลังลองใหม่...'
      });
    }
  }

  createPubNubTransport() {
    const cfg = window.XO_NET_CONFIG || {};
    const PubNubCtor = window.PubNub && window.PubNub.PubNub ? window.PubNub.PubNub : window.PubNub;
    if (!PubNubCtor) throw new Error('PubNub SDK unavailable');

    const pubnub = new PubNubCtor({
      subscribeKey: cfg.pubnubSubscribeKey,
      publishKey: cfg.pubnubPublishKey,
      userId: this.id,
      ssl: true
    });

    const channel = this.channelName(this.code);
    pubnub.addListener({
      message: (event) => this.handleIncoming(event.message),
      status: (event) => this.handlePubNubStatus(event)
    });
    pubnub.subscribe({ channels: [channel] });

    return {
      name: 'pubnub',
      send: (msg) => {
        const result = pubnub.publish({ channel, message: msg });
        if (result && typeof result.catch === 'function') result.catch(() => {});
      },
      close: () => {
        try {
          pubnub.unsubscribeAll();
        } catch (e) {}
        try {
          pubnub.destroy();
        } catch (e) {}
      }
    };
  }
}
