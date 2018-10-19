const fs = require('fs');
const parseTime = require('date-fns/parse');
const EventEmitter = require('eventemitter3');
const jsonlines = require('jsonlines');

class Parser extends EventEmitter {
  constructor({ filePath, updateFrequency = 1000 }) {
    super();

    this.options = {
      filePath,
      updateFrequency,
    };

    this.jsonLinesParser = jsonlines.parse({ emitInvalidLines: true });
    this.jsonLinesParser.on('data', d => this.parseLine(d));

    this.shutdown = false;
    this.linesSeen = [];

    this.parseFile(filePath);

    this.parseFile = this.parseFile.bind(this);
    this.shouldParseLine = this.shouldParseLine.bind(this);
    this.parseLine = this.parseLine.bind(this);
  }

  parseFile(filePath) {
    if (!this.shutdown) {
      const fStream = fs.createReadStream(filePath);
      fStream.on('data', d => this.jsonLinesParser.write(d.toString()));
      fStream.on('error', (e) => {
        this.shutdown = true; // forcefully shutdown so we don't just repeatedly fail.
        this.emit('error', e);
      });

      setTimeout(() => {
        process.nextTick(() => {
          this.parseFile(filePath);
        });
      }, this.options.updateFrequency);
    }
  }

  shouldParseLine(line) {
    return !this.linesSeen.includes(JSON.stringify(line));
  }

  parseLine(line) {
    if (!this.shouldParseLine(line)) {
      return;
    }

    this.linesSeen.push(JSON.stringify(line));

    line.timestamp = parseTime(line.timestamp) || new Date();

    switch (line.event) {
      case 'Music':
        this.emit('scene-change', { timestamp: line.timestamp, scene: line.MusicTrack });
        return;

      case 'LaunchSRV':
        this.emit('launch-srv', { timestamp: line.timestamp });
        return;

      case 'Shutdown':
        this.shutdown = true;
        this.emit('shutdown');
        return;

      default:
        this.emit('unknown-event', line);
        return;
    }
  }
}

module.exports = Parser;
