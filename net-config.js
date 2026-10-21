/**
 * Online 1v1 configuration.
 *
 * Leave both keys empty to use the built-in test transport, which works
 * between tabs/windows of the same browser and needs no account.
 *
 * For real play across devices, create a free PubNub keyset and paste the
 * PUBLIC keys below (https://admin.pubnub.com -> your app -> Keys).
 *
 * Only publish/subscribe keys belong in this file: it is served to every
 * player. Never put the PubNub secret key here.
 */
window.XO_NET_CONFIG = {
  pubnubPublishKey: 'pub-c-c8b0ab32-777c-4ff5-9106-66c884ec5b79',
  pubnubSubscribeKey: 'sub-c-341c98c7-e476-44d9-b0bc-6f73dc9a5af2'
};
