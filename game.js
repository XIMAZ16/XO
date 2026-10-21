/**
 * Ultimate Tic-Tac-Toe Game Engine & UI Controller
 */

class UltimateTicTacToeGame {
  constructor() {
    this.mode = 'bot'; // 'bot' | 'pvp'
    this.difficulty = 'medium'; // 'easy' | 'medium' | 'hard'
    this.aiPlayer = 'O';
    this.humanPlayer = 'X';

    this.WIN_LINES = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
      [0, 4, 8], [2, 4, 6]             // diags
    ];

    this.BOARD_NAMES = [
      'บนซ้าย (Top-Left)', 'บนกลาง (Top-Center)', 'บนขวา (Top-Right)',
      'กลางซ้าย (Mid-Left)', 'ตรงกลาง (Center)', 'กลางขวา (Mid-Right)',
      'ล่างซ้าย (Bottom-Left)', 'ล่างกลาง (Bottom-Center)', 'ล่างขวา (Bottom-Right)'
    ];

    this.scores = this.loadScores();

    this.dialogue = {
      thinking: [
        'อืม... ตานี้ต้องสุขุม คิดลึกแป๊บนะเพื่อน...',
        'ขอเวลาจิบน้ำแป๊บ หมากนี้ซับซ้อนจัดเลย!',
        'กำลังคำนวณความเป็นไปได้ 81 ช่อง... อย่าเพิ่งใจร้อนนะ!',
        'หมากตานี้ส่งมาลึกนะเนี่ย ขอตั้งสมาธิแป๊บ!',
        'อย่าเพิ่งเร่งสิ ระดับโปรเขาต้องวางแผนรอบคอบ!',
        'กำลังอ่านเกมล่วงหน้า 5 ตา... แป๊บเดียวนะเพื่อน!',
        'กระดานนี้กำลังเดือด ขอเล็งมุมพิฆาตก่อน...',
        'หืม... มีเหลี่ยมที่น่าสนใจ ขอประเมินความเสี่ยงแป๊บ!'
      ],
      playerTurnStart: [
        'ตาเธอแล้วเพื่อน! ค่อยๆ คิด ไม่ต้องรีบนะ',
        'เล็งช่องไหนอยู่เอ่ย? เดินสวยๆ ให้ดูหน่อย!',
        'ตาเธอแล้ว... อย่าส่งฉันไปจุดอันตรายนะ หึๆ',
        'ลุยเลยเพื่อน วางแผนให้ดีนะ!'
      ],
      playerIdle: [
        'คิดนานจังเพื่อน กาแฟฉันจะหมดแก้วแล้วเนี่ย 555 ☕',
        'แอบเปิดสูตรมารึเปล่าเนี่ย? เงียบไปนานเลยนะ!',
        'ค่อย ๆ คิดได้ ไม่ต้องรีบ... แต่เดินไว ๆ หน่อยก็ดีนะ 😆',
        'กำลังคำนวณสูตรลับระดับโปรอยู่ใช่ไหมเนี่ย?',
        'อย่าลืมหายใจนะเพื่อน ตานี้ลุ้นระทึกจริง!',
        'กวาดตามองครบ 9 กระดานรึยังน้อ?'
      ],
      botMoved: [
        'จัดไป! ดูซิว่าจะแก้หมากนี้ยังไง!',
        'ลงช่องนี้แหละ สวยงามตามตำรา!',
        'ส่งไปกระดานนั้นนะ... ขอให้โชคดีเพื่อน!',
        'วางแผนไว้หมดแล้ว ตาเธอแล้วเพื่อน!',
        'ทีนี้ก็ตาเธอแล้ว โชว์ฝีมือหน่อย!'
      ],
      playerMiniWin: [
        'ตานี้เดินดีนะเนี่ย! คว้ากระดานนี้ไปจนได้!',
        'โอ้โห! เฉียบขาดจริง ฝีมือไม่เบานี่นา!',
        'ยอมใจเลย ชนะกระดานนี้ไปได้ แต่กระดานใหญ่ยังไม่จบนะ!'
      ],
      botMiniWin: [
        'ฮ่าๆ กระดานนี้ขอรับไปล่ะนะเพื่อน!',
        'เยส! กระดานนี้เสร็จฉันจนได้!'
      ],
      playerGameWin: [
        'สุดยอดไปเลยเพื่อน! ยอมรับในฝีมือเลย คารวะ 1 จอก! 🏆',
        'เฉียบขาดมาก! แอบเปิดสูตรมารึเปล่าเนี่ย เก่งเกินไปแล้ว! 👑'
      ],
      botGameWin: [
        'เกมนี้สนุกมากเพื่อน! ตาหน้าแก้ตัวใหม่นะ! 🤖',
        'เกือบไปเหมือนกันนะเนี่ย! ฝีมือเธอพัฒนาขึ้นเยอะมาก!'
      ],
      gameTie: [
        'สูสีสุด ๆ เสมอกันแบบโปรทั้งคู่เลยเพื่อน! 🤝'
      ]
    };

    this.playerIdleTimer = null;
    this.aiMidThinkTimer = null;

    this.initDOM();
    this.resetGame();
    this.bindEvents();
    this.handleInviteLink();
  }

  loadScores() {
    const defaultScores = {
      bot: { x: 0, o: 0, tie: 0 },
      pvp: { x: 0, o: 0, tie: 0 },
      online: { x: 0, o: 0, tie: 0 }
    };
    try {
      const saved = localStorage.getItem('retro_xo_scores');
      if (!saved) return defaultScores;
      const parsed = JSON.parse(saved);
      // Saves written before online mode existed have no online bucket.
      const merged = {};
      Object.keys(defaultScores).forEach((key) => {
        merged[key] = Object.assign({}, defaultScores[key], parsed[key] || {});
      });
      return merged;
    } catch (e) {
      return defaultScores;
    }
  }

  saveScores() {
    try {
      localStorage.setItem('retro_xo_scores', JSON.stringify(this.scores));
    } catch (e) {}
  }

  initDOM() {
    this.mainBoardEl = document.getElementById('main-board');
    this.turnIndicatorEl = document.getElementById('turn-indicator');
    this.turnPlayerMarkEl = document.getElementById('turn-player-mark');
    this.turnTextEl = document.getElementById('turn-text');
    this.boardHintEl = document.getElementById('board-hint');

    this.scoreXEl = document.getElementById('score-x');
    this.scoreOEl = document.getElementById('score-o');
    this.scoreTieEl = document.getElementById('score-tie');
    this.labelXEl = document.getElementById('label-x');
    this.labelOEl = document.getElementById('label-o');

    this.modeSelectBtns = document.querySelectorAll('.mode-btn');
    this.diffSelectBtns = document.querySelectorAll('.diff-btn');
    this.diffContainerEl = document.getElementById('difficulty-container');

    this.botChatSectionEl = document.getElementById('bot-chat-section');
    this.botAvatarEl = document.getElementById('bot-avatar');
    this.speechTextEl = document.getElementById('speech-text');
    this.chatToggleBtn = document.getElementById('chat-toggle-btn');

    this.isChatMuted = localStorage.getItem('retro_xo_chat_muted') === 'true';
    if (this.isChatMuted && this.botChatSectionEl) {
      this.botChatSectionEl.classList.add('chat-hidden');
      if (this.chatToggleBtn) this.chatToggleBtn.textContent = '🤫';
    }

    this.modalEl = document.getElementById('result-modal');
    this.modalTitleEl = document.getElementById('modal-title');
    this.modalSubtitleEl = document.getElementById('modal-subtitle');
    this.modalIconEl = document.getElementById('modal-icon');
    this.playAgainBtn = document.getElementById('play-again-btn');

    this.rulesModalEl = document.getElementById('rules-modal');
    this.openRulesBtn = document.getElementById('open-rules-btn');
    this.closeRulesBtn = document.getElementById('close-rules-btn');
    this.restartBtn = document.getElementById('restart-btn');
    this.muteBtn = document.getElementById('mute-btn');

    // Online 1v1 UI
    this.onlineBarEl = document.getElementById('online-bar');
    this.onlineCodeEl = document.getElementById('online-room-code');
    this.onlineRoleEl = document.getElementById('online-role');
    this.onlineStatusEl = document.getElementById('online-status');
    this.copyLinkBtn = document.getElementById('copy-link-btn');
    this.leaveRoomBtn = document.getElementById('leave-room-btn');

    this.lobbyModalEl = document.getElementById('lobby-modal');
    this.lobbyCreateBtn = document.getElementById('lobby-create-btn');
    this.lobbyCloseBtn = document.getElementById('lobby-close-btn');
    this.lobbyCodeBoxEl = document.getElementById('lobby-code-box');
    this.lobbyCodeDisplayEl = document.getElementById('lobby-code-display');
    this.lobbyCopyBtn = document.getElementById('lobby-copy-btn');
    this.lobbyCodeInputEl = document.getElementById('lobby-code-input');
    this.lobbyJoinBtn = document.getElementById('lobby-join-btn');
    this.lobbyStatusEl = document.getElementById('lobby-status');
    this.lobbyTransportEl = document.getElementById('lobby-transport');

    this.initOnline();
  }

  /* ======================================================================
     ONLINE 1v1
     Host (room creator) is X and owns the authoritative board. The guest is
     O and sends move requests; the host applies them and broadcasts a
     snapshot. Both clients therefore always agree on the position.
     ====================================================================== */

  initOnline() {
    this.online = {
      active: false,
      code: null,
      isHost: false,
      myMark: null,
      peerOnline: false,
      joined: false
    };

    this.net = new XONet({
      onMessage: (msg) => this.handleNetMessage(msg),
      onPeerChange: (online) => this.handlePeerChange(online),
      onStatus: (status) => this.handleNetStatus(status)
    });

    this.updateOnlineBar();
  }

  generateRoomCode() {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
    return code;
  }

  markModeButton(mode) {
    this.modeSelectBtns.forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.mode === mode);
    });
  }

  applyModeUI() {
    const isBot = this.mode === 'bot';
    this.diffContainerEl.style.display = isBot ? 'flex' : 'none';
    if (this.botChatSectionEl) {
      this.botChatSectionEl.style.display = isBot ? 'flex' : 'none';
    }
    this.updateOnlineBar();
  }

  canPlayNow() {
    if (this.gameOver) return false;
    if (this.mode === 'bot') return !this.isAiThinking;
    if (this.mode === 'online') {
      if (!this.online.active || !this.online.joined || !this.online.peerOnline) return false;
      return this.currentPlayer === this.online.myMark;
    }
    return true;
  }

  openLobby() {
    this.lobbyStatusEl.textContent = '';
    this.lobbyCodeBoxEl.classList.add('hidden');
    this.lobbyTransportEl.textContent = XONet.transportName() === 'pubnub'
      ? 'โหมดออนไลน์: PubNub — เล่นข้ามเครื่องได้'
      : 'โหมดทดสอบ: ใช้ได้เฉพาะแท็บ/หน้าต่างในเบราว์เซอร์เดียวกัน (ใส่คีย์ PubNub ใน net-config.js เพื่อเล่นข้ามเครื่อง)';
    this.lobbyModalEl.classList.remove('hidden');
    this.updateOnlineBar();
  }

  closeLobby() {
    this.lobbyModalEl.classList.add('hidden');
  }

  cancelLobby() {
    this.closeLobby();
    if (!this.online.active && this.mode === 'online') {
      this.mode = 'bot';
      this.markModeButton('bot');
      this.applyModeUI();
      this.resetGame();
    }
  }

  createRoom() {
    const code = this.generateRoomCode();
    this.transportWarning = null;
    this.online = { active: true, code, isHost: true, myMark: 'X', peerOnline: false, joined: true };
    this.mode = 'online';
    this.markModeButton('online');
    this.applyModeUI();

    this.lobbyCodeBoxEl.classList.remove('hidden');
    this.lobbyCodeDisplayEl.textContent = code;
    this.lobbyStatusEl.textContent = 'รอคู่แข่งเข้าห้อง...';

    this.updateOnlineBar();
    this.resetGame();
    this.net.connect(code);
  }

  joinRoom(input) {
    const code = String(input || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    if (code.length !== 6) {
      this.lobbyStatusEl.textContent = 'รหัสห้องต้องมี 6 ตัวอักษร';
      return;
    }

    this.transportWarning = null;
    this.online = { active: true, code, isHost: false, myMark: 'O', peerOnline: false, joined: true };
    this.mode = 'online';
    this.markModeButton('online');
    this.applyModeUI();

    this.lobbyCodeBoxEl.classList.remove('hidden');
    this.lobbyCodeDisplayEl.textContent = code;
    this.lobbyStatusEl.textContent = `กำลังเข้าห้อง ${code}...`;
    this.updateOnlineBar();
    this.resetGame();

    this.net.connect(code).then((ok) => {
      if (ok) this.net.send({ type: 'hello' });
    });
  }

  leaveRoom() {
    if (this.net) {
      this.net.send({ type: 'leave' });
      this.net.disconnect();
    }
    this.online = { active: false, code: null, isHost: false, myMark: null, peerOnline: false, joined: false };
    this.closeLobby();
    this.updateOnlineBar();
  }

  getRoomLink() {
    const base = location.origin && location.origin !== 'null'
      ? location.origin + location.pathname
      : null;
    return base ? `${base}?room=${this.online.code}` : null;
  }

  async copyRoomLink() {
    if (!this.online.code) return;
    const link = this.getRoomLink();
    const text = link || this.online.code;
    let copied = false;

    try {
      await navigator.clipboard.writeText(text);
      copied = true;
    } catch (e) {
      copied = false;
    }

    const message = copied
      ? (link ? 'คัดลอกลิงก์เชิญแล้ว ส่งให้เพื่อนได้เลย!' : `คัดลอกรหัส ${this.online.code} แล้ว`)
      : (link ? `ส่งลิงก์นี้ให้เพื่อน: ${link}` : `รหัสห้อง: ${this.online.code}`);

    this.lobbyStatusEl.textContent = message;
    this.onlineStatusEl.title = message;
  }

  handleInviteLink() {
    let raw = null;
    try {
      raw = new URLSearchParams(location.search).get('room');
    } catch (e) {
      raw = null;
    }
    if (!raw) return;

    const code = raw.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    if (code.length !== 6) return;

    this.markModeButton('online');
    this.openLobby();
    this.joinRoom(code);
  }

  updateOnlineBar() {
    if (!this.onlineBarEl) return;
    const active = this.mode === 'online' && this.online.active;
    this.onlineBarEl.classList.toggle('hidden', !active);
    if (!active) return;

    this.onlineCodeEl.textContent = this.online.code || '------';
    this.onlineRoleEl.textContent = this.online.isHost ? 'เจ้าของห้อง (X)' : 'ผู้เข้าร่วม (O)';

    const transport = XONet.transportName() === 'pubnub' ? 'PubNub' : 'ทดสอบในเบราว์เซอร์';

    if (this.transportWarning) {
      this.onlineStatusEl.textContent = 'เชื่อมต่อไม่สำเร็จ';
      this.onlineStatusEl.className = 'online-status is-error';
      this.onlineStatusEl.title = this.transportWarning;
      return;
    }

    this.onlineStatusEl.textContent = this.online.peerOnline ? 'คู่แข่งออนไลน์' : 'รอคู่แข่ง...';
    this.onlineStatusEl.className = this.online.peerOnline
      ? 'online-status is-online'
      : 'online-status is-waiting';
    this.onlineStatusEl.title = this.online.peerOnline
      ? `คู่แข่งเชื่อมต่อแล้ว — ช่องทาง: ${transport}`
      : `กำลังรอคู่แข่งเข้าห้อง — ช่องทาง: ${transport}`;
  }

  handleNetStatus(status) {
    if (status.state === 'error' && status.message) {
      this.transportWarning = status.message;
      if (this.lobbyStatusEl) this.lobbyStatusEl.textContent = status.message;
      this.updateOnlineBar();
      return;
    }

    if (status.state === 'connected' && status.transport === 'pubnub') {
      this.transportWarning = null;
      this.updateOnlineBar();
    }
  }

  handlePeerChange(peerOnline) {
    if (!this.online.active) return;
    this.online.peerOnline = peerOnline;

    if (peerOnline) {
      this.lobbyStatusEl.textContent = 'คู่แข่งเชื่อมต่อแล้ว เริ่มเกมได้เลย!';
      this.closeLobby();
    } else {
      this.lobbyStatusEl.textContent = 'คู่แข่งหลุดการเชื่อมต่อ...';
    }

    this.updateOnlineBar();
    this.renderBoard();
    this.updateStatus();
  }

  handleNetMessage(msg) {
    if (!this.online.active || !msg || typeof msg.type !== 'string') return;

    switch (msg.type) {
      case 'hello':
        if (this.online.isHost) {
          this.broadcastState();
          this.lobbyStatusEl.textContent = 'คู่แข่งเข้าห้องแล้ว! เริ่มเกมได้เลย';
          this.closeLobby();
        }
        break;

      case 'state':
        if (!this.online.isHost) {
          this.applyRemoteState(msg.state);
          this.closeLobby();
        }
        break;

      case 'move':
        if (this.online.isHost) this.applyGuestMove(msg.b, msg.c);
        break;

      case 'restart':
        if (this.online.isHost) this.resetGame();
        break;

      case 'leave':
        this.lobbyStatusEl.textContent = 'คู่แข่งออกจากห้องแล้ว';
        this.updateOnlineBar();
        break;
    }
  }

  broadcastState() {
    if (!this.online || !this.online.active || !this.online.isHost || !this.net) return;
    this.net.send({
      type: 'state',
      state: {
        board: this.board,
        miniBoardStatus: this.miniBoardStatus,
        activeBoard: this.activeBoard,
        currentPlayer: this.currentPlayer,
        gameOver: this.gameOver,
        winner: this.winner,
        mainWinLine: this.mainWinLine,
        lastMove: this.lastMove
      }
    });
  }

  applyGuestMove(b, c) {
    if (this.gameOver) return;
    if (typeof b !== 'number' || typeof c !== 'number') return;
    if (this.currentPlayer !== 'O') return;
    if (!this.isMoveLegal(b, c)) return;

    this.executeMove(b, c);
    this.broadcastState();
  }

  applyRemoteState(state) {
    if (!state) return;

    const wasOver = this.gameOver;
    const previousMove = this.lastMove ? `${this.lastMove.b}-${this.lastMove.c}` : null;

    this.board = state.board.map((row) => row.slice());
    this.miniBoardStatus = state.miniBoardStatus.slice();
    this.activeBoard = state.activeBoard;
    this.currentPlayer = state.currentPlayer;
    this.gameOver = state.gameOver;
    this.winner = state.winner;
    this.mainWinLine = state.mainWinLine ? state.mainWinLine.slice() : null;
    this.isAiThinking = false;

    const nextMove = state.lastMove ? `${state.lastMove.b}-${state.lastMove.c}` : null;
    this.lastMove = state.lastMove || null;
    if (nextMove && nextMove !== previousMove && window.retroAudio) {
      window.retroAudio.playMove(state.lastMove.player);
    }

    // A snapshot with no winner means a fresh round: clear the old overlay.
    if (!this.gameOver) this.hideModal();

    this.renderBoard();
    this.updateStatus();
    this.updateScoreboardDisplay();

    if (!wasOver && this.gameOver) {
      this.handleGameOver(this.winner);
    }
  }

  requestRematch() {
    if (this.mode !== 'online') {
      this.resetGame();
      return;
    }
    if (this.online.isHost) {
      this.resetGame();
    } else {
      this.net.send({ type: 'restart' });
      this.lobbyStatusEl.textContent = 'ขอเล่นใหม่อีกครั้ง...';
    }
  }

  botSpeak(category, customText = null) {
    if (!this.speechTextEl || this.mode !== 'bot') return;

    let text = customText;
    if (!text && this.dialogue[category]) {
      const list = this.dialogue[category];
      text = list[Math.floor(Math.random() * list.length)];
    }
    if (!text) return;

    this.speechTextEl.textContent = text;

    if (this.botAvatarEl) {
      this.botAvatarEl.classList.remove('is-speaking');
      void this.botAvatarEl.offsetWidth; // trigger reflow
      this.botAvatarEl.classList.add('is-speaking');
    }
  }

  startPlayerIdleTimer() {
    this.clearPlayerIdleTimer();
    if (this.mode !== 'bot' || this.gameOver || this.currentPlayer !== this.humanPlayer) return;

    // After player takes 6.5s to think, bot drops a friendly/humorous remark
    this.playerIdleTimer = setTimeout(() => {
      if (!this.gameOver && this.currentPlayer === this.humanPlayer && !this.isAiThinking) {
        this.botSpeak('playerIdle');
      }
    }, 6500);
  }

  clearPlayerIdleTimer() {
    if (this.playerIdleTimer) {
      clearTimeout(this.playerIdleTimer);
      this.playerIdleTimer = null;
    }
  }

  resetGame() {
    if (this.aiTimer) {
      clearTimeout(this.aiTimer);
      this.aiTimer = null;
    }
    if (this.aiMidThinkTimer) {
      clearTimeout(this.aiMidThinkTimer);
      this.aiMidThinkTimer = null;
    }
    this.clearPlayerIdleTimer();

    if (this.botAvatarEl) {
      this.botAvatarEl.classList.remove('is-thinking', 'is-speaking');
    }

    this.board = Array(9).fill(null).map(() => Array(9).fill(null));
    this.miniBoardStatus = Array(9).fill(null); // 'X' | 'O' | 'TIE' | null
    this.miniBoardWinLines = Array(9).fill(null);
    this.currentPlayer = 'X';
    this.activeBoard = -1; // -1 means free choice on any active mini-board
    this.gameOver = false;
    this.winner = null;
    this.mainWinLine = null;
    this.isAiThinking = false;
    this.lastMove = null;

    this.hideModal();
    this.renderBoard();
    this.updateStatus();
    this.updateScoreboardDisplay();

    if (this.mode === 'bot') {
      this.botSpeak('playerTurnStart');
      this.startPlayerIdleTimer();
    }

    if (this.mode === 'online' && this.online.active && this.online.isHost) {
      this.broadcastState();
    }
  }

  renderBoard() {
    this.mainBoardEl.innerHTML = '';

    for (let b = 0; b < 9; b++) {
      const miniBoardEl = document.createElement('div');
      miniBoardEl.className = 'mini-board';
      miniBoardEl.dataset.board = b;

      // Check if mini-board is won or tied
      const status = this.miniBoardStatus[b];
      if (status) {
        miniBoardEl.classList.add(`won-${status.toLowerCase()}`);
        if (status === 'TIE') miniBoardEl.classList.add('won-tie');
      }

      // Check if this board is active for playing
      const isActive = !this.gameOver && (this.activeBoard === -1 || this.activeBoard === b) && status === null;
      if (isActive) {
        miniBoardEl.classList.add('active-target');
      }

      // Check main win line highlight
      if (this.mainWinLine && this.mainWinLine.includes(b)) {
        miniBoardEl.classList.add('main-win-highlight');
      }

      // 9 cells inside
      for (let c = 0; c < 9; c++) {
        const cellEl = document.createElement('button');
        cellEl.className = 'cell';
        cellEl.dataset.board = b;
        cellEl.dataset.cell = c;
        cellEl.setAttribute('aria-label', `กระดาน ${b+1} ช่อง ${c+1}`);

        const val = this.board[b][c];
        if (val) {
          cellEl.textContent = val;
          cellEl.classList.add(`marked-${val.toLowerCase()}`);
        } else if (isActive && this.canPlayNow()) {
          cellEl.classList.add('cell-clickable');
        } else {
          cellEl.classList.add('cell-disabled');
        }

        // Highlight last move
        if (this.lastMove && this.lastMove.b === b && this.lastMove.c === c) {
          cellEl.classList.add('cell-last-move');
        }

        cellEl.addEventListener('click', (e) => this.handleCellClick(b, c, cellEl));
        miniBoardEl.appendChild(cellEl);
      }

      // Large overlay watermark if mini-board resolved
      if (status) {
        const overlay = document.createElement('div');
        overlay.className = `mini-board-overlay overlay-${status.toLowerCase()}`;
        if (status === 'TIE') {
          overlay.innerHTML = `<span class="tie-text">XO</span><span class="tie-sub">TIE</span>`;
        } else {
          overlay.textContent = status;
        }
        miniBoardEl.appendChild(overlay);
      }

      this.mainBoardEl.appendChild(miniBoardEl);
    }
  }

  handleCellClick(b, c, cellEl) {
    if (this.gameOver) return;
    if (this.mode === 'bot' && this.currentPlayer === this.aiPlayer) return;
    if (this.isAiThinking) return;

    // Online: only on your own turn, and only once the opponent is here
    if (this.mode === 'online' && !this.canPlayNow()) {
      this.shakeElement(cellEl);
      return;
    }

    // Validate if move is legal
    const isLegal = this.isMoveLegal(b, c);
    if (!isLegal) {
      if (window.retroAudio) window.retroAudio.playInvalid();
      this.shakeElement(cellEl);
      return;
    }

    // Online: the host applies moves and broadcasts; the guest only asks.
    if (this.mode === 'online') {
      if (this.online.isHost) {
        this.executeMove(b, c);
        this.broadcastState();
      } else {
        this.net.send({ type: 'move', b, c });
      }
      return;
    }

    this.executeMove(b, c);

    // If vs Bot and not game over, trigger bot move
    if (this.mode === 'bot' && !this.gameOver && this.currentPlayer === this.aiPlayer) {
      this.triggerAiMove();
    }
  }

  isMoveLegal(b, c) {
    // Cell must be empty
    if (this.board[b][c] !== null) return false;
    // Mini-board must not be finished
    if (this.miniBoardStatus[b] !== null) return false;
    // Must be in active board or free choice
    if (this.activeBoard !== -1 && this.activeBoard !== b) return false;

    return true;
  }

  executeMove(b, c) {
    this.clearPlayerIdleTimer();
    const player = this.currentPlayer;
    this.board[b][c] = player;
    this.lastMove = { b, c, player };

    if (window.retroAudio) window.retroAudio.playMove(player);

    // Check if this mini-board is now won or tied
    let miniBoardJustResolved = false;
    const mbStatus = this.checkMiniBoardWin(this.board[b]);
    if (mbStatus && this.miniBoardStatus[b] === null) {
      this.miniBoardStatus[b] = mbStatus;
      miniBoardJustResolved = true;
      if (window.retroAudio && mbStatus !== 'TIE') {
        window.retroAudio.playMiniWin();
      }
      if (this.mode === 'bot') {
        if (mbStatus === this.humanPlayer) {
          this.botSpeak('playerMiniWin');
        } else if (mbStatus === this.aiPlayer) {
          this.botSpeak('botMiniWin');
        }
      }
    }

    // Check main board win
    const mainWinner = this.checkMainWinCondition();
    if (mainWinner) {
      this.gameOver = true;
      this.winner = mainWinner.winner;
      this.mainWinLine = mainWinner.line;
      this.handleGameOver(this.winner);
      this.renderBoard();
      this.updateStatus();
      return;
    }

    // Check if entire game is a tie (all mini-boards closed or no valid moves)
    const validMoves = window.ultimateAI.getValidMoves(this.board, this.miniBoardStatus, -1);
    if (validMoves.length === 0 || this.miniBoardStatus.every(s => s !== null)) {
      this.gameOver = true;
      this.winner = 'TIE';
      this.handleGameOver('TIE');
      this.renderBoard();
      this.updateStatus();
      return;
    }

    // Determine next active mini-board
    const targetBoard = c;
    if (this.miniBoardStatus[targetBoard] !== null) {
      // Target board already won/tied -> Free choice!
      this.activeBoard = -1;
    } else {
      this.activeBoard = targetBoard;
    }

    // Switch player
    this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';

    this.renderBoard();
    this.updateStatus();

    // If it is now player's turn in bot mode, start player thinking remarks timer
    if (this.mode === 'bot' && !this.gameOver && this.currentPlayer === this.humanPlayer) {
      this.startPlayerIdleTimer();
    }
  }

  checkMiniBoardWin(cells) {
    for (const [a, b, c] of this.WIN_LINES) {
      if (cells[a] && cells[a] === cells[b] && cells[a] === cells[c]) {
        return cells[a];
      }
    }
    if (cells.every(c => c !== null)) {
      return 'TIE';
    }
    return null;
  }

  checkMainWinCondition() {
    // Check for 3-in-a-row on main board
    // As per user selection: TIE counts as BOTH X and O
    for (const player of [this.currentPlayer, this.currentPlayer === 'X' ? 'O' : 'X']) {
      for (const [a, b, c] of this.WIN_LINES) {
        const sa = this.miniBoardStatus[a];
        const sb = this.miniBoardStatus[b];
        const sc = this.miniBoardStatus[c];

        const matchA = sa === player || sa === 'TIE';
        const matchB = sb === player || sb === 'TIE';
        const matchC = sc === player || sc === 'TIE';

        if (matchA && matchB && matchC) {
          return { winner: player, line: [a, b, c] };
        }
      }
    }
    return null;
  }

  getAiThinkingDelay() {
    // Pro Competitive Deliberation Mode
    // Easy: 2.0s - 4.0s
    // Medium: 3.5s - 6.0s
    // Hard: 5.0s - 9.0s
    let min, max;
    if (this.difficulty === 'easy') {
      min = 2000;
      max = 4000;
    } else if (this.difficulty === 'medium') {
      min = 3500;
      max = 6000;
    } else {
      min = 5000;
      max = 9000;
    }

    // When the board is open for free choice, pro players take extra time to survey all 9 boards
    if (this.activeBoard === -1) {
      min += 1000;
      max += 2000;
    }

    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  triggerAiMove() {
    this.clearPlayerIdleTimer();
    this.isAiThinking = true;

    // Avatar thinking animation
    if (this.botAvatarEl) {
      this.botAvatarEl.classList.add('is-thinking');
    }

    // Bot speaks a random thinking remark
    this.botSpeak('thinking');
    this.updateStatus();

    const delay = this.getAiThinkingDelay();

    if (this.aiTimer) clearTimeout(this.aiTimer);
    if (this.aiMidThinkTimer) clearTimeout(this.aiMidThinkTimer);

    // If deliberation is deep (>= 4200ms), update thought halfway through to feel alive
    if (delay >= 4200) {
      this.aiMidThinkTimer = setTimeout(() => {
        if (this.isAiThinking && !this.gameOver) {
          const midThoughts = [
            'กำลังวิเคราะห์ทางเลือกกระดานใหญ่... 🤔',
            'โอเค ใกล้ได้ตาเดินที่เฉียบคมแล้ว!',
            'อืมมม... จุดนี้สำคัญมาก ขอล็อคเป้าแป๊บ!',
            'อ่านเกมทะลุปรุโปร่งแล้ว พร้อมลุย!'
          ];
          const midText = midThoughts[Math.floor(Math.random() * midThoughts.length)];
          this.botSpeak(null, midText);
        }
      }, Math.floor(delay * 0.52));
    }

    this.aiTimer = setTimeout(() => {
      this.aiTimer = null;
      if (this.gameOver) {
        this.isAiThinking = false;
        if (this.botAvatarEl) this.botAvatarEl.classList.remove('is-thinking');
        return;
      }

      const bestMove = window.ultimateAI.getBestMove(
        this.board,
        this.miniBoardStatus,
        this.activeBoard,
        this.aiPlayer,
        this.difficulty
      );

      this.isAiThinking = false;
      if (this.botAvatarEl) this.botAvatarEl.classList.remove('is-thinking');

      if (bestMove) {
        this.botSpeak('botMoved');
        this.executeMove(bestMove.b, bestMove.c);
      }
    }, delay);
  }

  handleGameOver(winner) {
    this.clearPlayerIdleTimer();
    const currentMode = this.mode; // 'bot' or 'pvp'
    if (winner === 'X') {
      this.scores[currentMode].x++;
      if (window.retroAudio) window.retroAudio.playGameWin();
      if (this.mode === 'bot') this.botSpeak('playerGameWin');
    } else if (winner === 'O') {
      this.scores[currentMode].o++;
      if (this.mode === 'bot') {
        if (window.retroAudio) window.retroAudio.playDraw(); // Bot won
        this.botSpeak('botGameWin');
      } else {
        if (window.retroAudio) window.retroAudio.playGameWin();
      }
    } else {
      this.scores[currentMode].tie++;
      if (window.retroAudio) window.retroAudio.playDraw();
      if (this.mode === 'bot') this.botSpeak('gameTie');
    }

    this.saveScores();
    this.updateScoreboardDisplay();

    // Show victory modal after brief delay
    setTimeout(() => {
      this.showModal(winner);
    }, 500);
  }

  updateStatus() {
    // Update turn header
    if (this.gameOver) {
      this.turnIndicatorEl.classList.remove('is-thinking');
      this.turnPlayerMarkEl.textContent = '🏁';
      this.turnPlayerMarkEl.className = 'player-badge';
      if (this.winner === 'TIE') {
        this.turnTextEl.textContent = 'เกมเสมอกัน! (DRAW)';
      } else {
        const winnerName = this.mode === 'bot' && this.winner === 'O' ? 'บอท (CPU)' : `ผู้เล่น ${this.winner}`;
        this.turnTextEl.textContent = `${winnerName} ชนะเกม!`;
      }
      this.boardHintEl.textContent = 'กดเริ่มเกมใหม่เพื่อประลองอีกครั้ง';
      return;
    }

    // Active player mark
    this.turnPlayerMarkEl.textContent = this.currentPlayer;
    this.turnPlayerMarkEl.className = `player-badge badge-${this.currentPlayer.toLowerCase()}`;

    // Status text
    if (this.isAiThinking) {
      this.turnIndicatorEl.classList.add('is-thinking');
      this.turnTextEl.innerHTML = `<span class="thinking-text">${this.currentThinkingMsg || '🤖 บอทกำลังคิด...'}</span><span class="thinking-dots"></span>`;
    } else {
      this.turnIndicatorEl.classList.remove('is-thinking');
      if (this.mode === 'bot') {
        this.turnTextEl.textContent = this.currentPlayer === 'X' ? 'ตาของคุณ (X)' : 'ตาของบอท (O)';
      } else if (this.mode === 'online') {
        if (!this.online.peerOnline) {
          this.turnTextEl.textContent = 'รอคู่แข่งเชื่อมต่อ...';
        } else if (this.currentPlayer === this.online.myMark) {
          this.turnTextEl.textContent = `ตาคุณ (${this.currentPlayer})`;
        } else {
          this.turnTextEl.textContent = `ตาคู่แข่ง (${this.currentPlayer})`;
        }
      } else {
        this.turnTextEl.textContent = `ตาผู้เล่น ${this.currentPlayer}`;
      }
    }

    // Board hint
    if (this.activeBoard === -1) {
      this.boardHintEl.innerHTML = `<span class="badge-free">★ เลือกเดินอิสระ</span> ในกระดานเล็กที่ยังว่างกระดานใดก็ได้!`;
    } else {
      const name = this.BOARD_NAMES[this.activeBoard];
      this.boardHintEl.innerHTML = `ต้องเดินในกระดาน: <strong>${name}</strong>`;
    }
  }

  updateScoreboardDisplay() {
    const curScores = this.scores[this.mode] || { x: 0, o: 0, tie: 0 };
    this.scoreXEl.textContent = curScores.x;
    this.scoreOEl.textContent = curScores.o;
    this.scoreTieEl.textContent = curScores.tie;

    if (this.mode === 'bot') {
      this.labelXEl.textContent = 'ผู้เล่น X';
      this.labelOEl.textContent = 'บอท (O)';
    } else if (this.mode === 'online') {
      this.labelXEl.textContent = this.online.myMark === 'X' ? 'คุณ (X)' : 'คู่แข่ง (X)';
      this.labelOEl.textContent = this.online.myMark === 'O' ? 'คุณ (O)' : 'คู่แข่ง (O)';
    } else {
      this.labelXEl.textContent = 'ผู้เล่น X';
      this.labelOEl.textContent = 'ผู้เล่น O';
    }
  }

  showModal(winner) {
    if (winner === 'TIE') {
      this.modalTitleEl.textContent = 'DRAW MATCH!';
      this.modalSubtitleEl.textContent = 'ไม่มีผู้ชนะในกระดานนี้ ทั้งสองฝ่ายเสมออย่างสูสี!';
      this.modalIconEl.textContent = '⚖️';
      this.modalIconEl.className = 'modal-icon tie-glow';
    } else {
      const isPlayerWinner = (this.mode === 'bot' && winner === 'X') || this.mode === 'pvp' ||
        (this.mode === 'online' && winner === this.online.myMark);
      if (isPlayerWinner) {
        this.modalTitleEl.textContent = `VICTORY! ${winner} WINS`;
        if (this.mode === 'bot') {
          this.modalSubtitleEl.textContent = `ยอดเยี่ยมมาก! คุณเอาชนะบอทระดับ ${this.getDifficultyThai()} ได้สำเร็จ!`;
        } else if (this.mode === 'online') {
          this.modalSubtitleEl.textContent = 'คุณเอาชนะคู่แข่งออนไลน์ได้สำเร็จ! สุดยอดมาก!';
        } else {
          this.modalSubtitleEl.textContent = `ขอแสดงความยินดีกับ ผู้เล่น ${winner} คว้าชัยชนะกระดานใหญ่!`;
        }
        this.modalIconEl.textContent = winner === 'X' ? '⚡' : '👑';
        this.modalIconEl.className = `modal-icon ${winner.toLowerCase()}-glow`;
      } else {
        this.modalTitleEl.textContent = 'GAME OVER!';
        this.modalSubtitleEl.textContent = this.mode === 'online'
          ? 'คู่แข่งชนะในรอบนี้ ลองใหม่อีกครั้ง!'
          : `บอทระดับ ${this.getDifficultyThai()} ชนะในรอบนี้ ลองใหม่อีกครั้ง!`;
        this.modalIconEl.textContent = '🤖';
        this.modalIconEl.className = 'modal-icon o-glow';
      }
    }
    this.modalEl.classList.remove('hidden');
  }

  hideModal() {
    this.modalEl.classList.add('hidden');
  }

  getDifficultyThai() {
    if (this.difficulty === 'easy') return 'ง่าย (Easy)';
    if (this.difficulty === 'medium') return 'ปานกลาง (Medium)';
    return 'ยาก (Hard)';
  }

  shakeElement(el) {
    el.classList.remove('shake-anim');
    void el.offsetWidth; // trigger reflow
    el.classList.add('shake-anim');
  }

  bindEvents() {
    // Mode toggle
    this.modeSelectBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        if (window.retroAudio) window.retroAudio.playClick();
        const newMode = btn.dataset.mode;
        if (newMode === this.mode && newMode !== 'online') return;

        if (this.mode === 'online' && newMode !== 'online') this.leaveRoom();
        if (this.mode === 'online' && newMode === 'online') {
          this.openLobby();
          return;
        }

        this.modeSelectBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.mode = newMode;
        this.applyModeUI();

        if (newMode === 'online') {
          this.openLobby();
        } else {
          this.resetGame();
        }
      });
    });

    // Bot Chat Speech Toggle
    if (this.chatToggleBtn) {
      this.chatToggleBtn.addEventListener('click', () => {
        this.isChatMuted = !this.isChatMuted;
        localStorage.setItem('retro_xo_chat_muted', this.isChatMuted);
        if (this.botChatSectionEl) {
          this.botChatSectionEl.classList.toggle('chat-hidden', this.isChatMuted);
        }
        this.chatToggleBtn.textContent = this.isChatMuted ? '🤫' : '💬';
        this.chatToggleBtn.setAttribute('title', this.isChatMuted ? 'เปิดคำพูดบอท' : 'ปิดคำพูดบอท');
        if (window.retroAudio) window.retroAudio.playClick();
      });
    }

    // Difficulty toggle
    this.diffSelectBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        if (window.retroAudio) window.retroAudio.playClick();
        this.diffSelectBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.difficulty = btn.dataset.diff;
        this.resetGame();
      });
    });

    // Restart button
    this.restartBtn.addEventListener('click', () => {
      if (window.retroAudio) window.retroAudio.playClick();
      this.requestRematch();
    });

    // Play again modal button
    this.playAgainBtn.addEventListener('click', () => {
      if (window.retroAudio) window.retroAudio.playClick();
      this.requestRematch();
    });

    // Online lobby controls
    this.lobbyCreateBtn.addEventListener('click', () => {
      if (window.retroAudio) window.retroAudio.playClick();
      this.createRoom();
    });

    this.lobbyJoinBtn.addEventListener('click', () => {
      if (window.retroAudio) window.retroAudio.playClick();
      this.joinRoom(this.lobbyCodeInputEl.value);
    });

    this.lobbyCodeInputEl.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        this.joinRoom(this.lobbyCodeInputEl.value);
      }
    });

    this.lobbyCodeInputEl.addEventListener('input', () => {
      this.lobbyCodeInputEl.value = this.lobbyCodeInputEl.value
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
        .slice(0, 6);
    });

    this.lobbyCloseBtn.addEventListener('click', () => {
      if (window.retroAudio) window.retroAudio.playClick();
      this.cancelLobby();
    });

    this.lobbyModalEl.addEventListener('click', (event) => {
      if (event.target === this.lobbyModalEl) this.cancelLobby();
    });

    this.lobbyCopyBtn.addEventListener('click', () => {
      if (window.retroAudio) window.retroAudio.playClick();
      this.copyRoomLink();
    });

    this.copyLinkBtn.addEventListener('click', () => {
      if (window.retroAudio) window.retroAudio.playClick();
      this.copyRoomLink();
    });

    this.leaveRoomBtn.addEventListener('click', () => {
      if (window.retroAudio) window.retroAudio.playClick();
      this.leaveRoom();
      this.mode = 'bot';
      this.markModeButton('bot');
      this.applyModeUI();
      this.resetGame();
    });

    // Rules Modal
    this.openRulesBtn.addEventListener('click', () => {
      if (window.retroAudio) window.retroAudio.playClick();
      this.rulesModalEl.classList.remove('hidden');
    });

    this.closeRulesBtn.addEventListener('click', () => {
      if (window.retroAudio) window.retroAudio.playClick();
      this.rulesModalEl.classList.add('hidden');
    });

    // Close modal on background click
    this.rulesModalEl.addEventListener('click', (e) => {
      if (e.target === this.rulesModalEl) {
        this.rulesModalEl.classList.add('hidden');
      }
    });

    // Mute toggle
    this.muteBtn.addEventListener('click', () => {
      const isMuted = window.retroAudio.toggleMute();
      this.muteBtn.textContent = isMuted ? '🔇' : '🔊';
      this.muteBtn.setAttribute('title', isMuted ? 'เปิดเสียง' : 'ปิดเสียง');
    });

    // Initial mute icon check
    if (window.retroAudio && window.retroAudio.isMuted) {
      this.muteBtn.textContent = '🔇';
    }
  }
}

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  window.game = new UltimateTicTacToeGame();
});
