const redux = require('redux');
const Finder = require('./finder');
const Parser = require('./parser');
const RPC = require('./rpc');
const status = require('./modules/status');

const statusStore = redux.createStore(status.reducer);

const f = new Finder();
const r = new RPC(statusStore);

let p;

f.on('new-file', (filePath) => {
  if (p) {
    p.shutdown = true;
    p = null;
  }

  p = new Parser({ filePath, updateFrequency: 1000 });

  p.on('error', (e) => {
    console.error(e);
  });

  p.on('shutdown', () => {
    console.log('Elite: Dangerous shutting down!');
    statusStore.dispatch(status.actions.reset());
  });

  p.on('scene-change', (event) => {
    statusStore.dispatch(status.actions.sceneChange(event));
  });

  p.on('launch-srv', (event) => {
    statusStore.dispatch(status.actions.launchSrv(event));
  })

  p.on('unknown-event', (event) => {
    console.error(`unknown event: ${JSON.stringify(event)}`);
  });
});
