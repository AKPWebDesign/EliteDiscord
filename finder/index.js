const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const EventEmitter = require('eventemitter3');

class Finder extends EventEmitter {
  constructor() {
    super();

    this.find = this.find.bind(this);

    this.find();
  }

  async find() {
    const folder = path.join(os.homedir(), 'Saved Games', 'Frontier Developments', 'Elite Dangerous');

    const file = await fs.readdir(folder)
      .then(f => f.filter(s => s.endsWith('.log')))
      .then(f => f.pop());

      if (file !== this.currentFile) {
        this.currentFile = file;

        this.emit('new-file', path.join(folder, file));
      }

    setTimeout(this.find, 1000);
  }
}

module.exports = Finder;
