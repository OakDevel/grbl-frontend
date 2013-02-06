var split = require('split');


function Machine(stream) {
  this.stream = stream;
  this._settings = {};
  var commandQueue = this.commandQueue = [];
  this.ready = false;
  this._status = {};

  stream.on('close', function() {
    console.log('CLOSED');
  })


  stream.on('error', function() {
    console.log('CLOSED');
  })

  stream.once('ready', function() {

    var that = this;
    setTimeout(function statusTick() {

      that.status(function(status) {
        that._status = status;
        var tickTime = (status.status === 'run') ? 100 : 1000;

        setTimeout(statusTick, tickTime);
      });
    }, 100);

  }.bind(this));

  this.lineStream = stream.pipe(split());


  var lines = [], lineStream = this.lineStream, that = this;

  this.lineStream.once('data', function(d) {
    if (d.indexOf('ready') > -1) {
      console.log('ready');
      stream.emit('ready');

      lineStream.on('data', function handle(line) {
        line = line.trim();
        if (line === 'ok') {
          if (commandQueue.length > 0) {
            var fn = commandQueue.shift();
            fn && fn.call(that, lines.concat([]));
            lines = [];
          }
        } else {
          lines.push(line);
        }
      });
    }
  });
}

Machine.prototype.collectUntilOk = function(fn) {
  this.commandQueue.push(fn);
};

Machine.prototype.move = function(obj) {
  var parts = [obj.op || 'G0'];
  delete obj.op;
  Object.keys(obj).forEach(function(key) {
    parts.push(key + obj[key]);
  });

  this.run(parts.join(' '));
};

Machine.prototype.status = function(fn) {
  this.run('?', function(lines) {
    var line = lines.shift();
    if (!line) { return; }

    var parts = line.replace(/\<|\>/g, '').split(',');
    var ret = {
      status : parts.shift().toLowerCase(),
      position: {
        machine : {
          x : parseFloat(parts.shift().replace(/^[a-z:]+/gi,'')).toFixed(3),
          y : parseFloat(parts.shift()).toFixed(3),
          z : parseFloat(parts.shift()).toFixed(3),
        },
        work : {
          x : parseFloat(parts.shift().replace(/^[a-z:]+/gi,'')).toFixed(3),
          y : parseFloat(parts.shift()).toFixed(3),
          z : parseFloat(parts.shift()).toFixed(3),
        }
      }
    };

    this.stream.emit('status', ret);

    fn && fn(ret);
  });
};



Machine.prototype.settings = function(fn) {
  var matcher = /\$([0-9]+)=([^ ]+) \(([^\)]+)/;
  this.run('$$', function(lines) {

    console.log('made it to here');
    var settings = [];
    lines.forEach(function(line) {
      var matches = line.match(matcher);
      if (matches) {
        settings.push({
          label : matches.pop(),
          value : matches.pop(),
          index : matches.pop()
        });
      }
    });

    this._settings = settings;
    this.stream.emit('settings', settings);
  });
}

Machine.prototype.run = function(cmd, fn) {
  this.stream.write(cmd + '\n');
  this.collectUntilOk(fn);
};

module.exports = Machine;