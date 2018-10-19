const DiscordRPC = require('discord-rpc');
const defaultClientId = '499075138617212938';
DiscordRPC.register(defaultClientId);

class RPC {
  constructor(store, clientId = defaultClientId) {
    DiscordRPC.register(clientId);
    this.rpc = new DiscordRPC.Client({ transport: 'ipc' });

    let lastUpdateSent = 0;

    this.status = {};

    store.subscribe(() => {
      const state = store.getState();

      this.status = {
        startTimestamp: state.timestamp,
        state: state.generalStatus,
        smallImageKey: 'ed_logo_white',
        largeImageKey: 'test_image',
        largeImageText: state.location,
      }

      if ((Date.now() - lastUpdateSent) > 15000) {
        this.setActivity();
      } else {
        if (!this.timeout) {
          this.timeout = setTimeout(this.setActivity, 15000 - (Date.now() - lastUpdateSent));
        }
      }
    });

    this.setActivity = this.setActivity.bind(this);

    this.rpc.on('ready', () => {
      this.setActivity();
    });

    this.rpc.login({ clientId }).catch(console.error);
  }

  shutdown() {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }

    this.rpc.clearActivity();
    this.rpc.destroy();
  }

  setActivity() {
    if (!this.rpc) {
      return;
    }

    this.lastUpdateSent = Date.now();
    this.rpc.setActivity(this.status);
  }
}

module.exports = RPC;
