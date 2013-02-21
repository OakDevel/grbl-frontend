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

  var that = this;

  stream.once('ready', function() {
    that.settings();

    var timer = null;
    that.stream.on('status', function(status) {
      that._status = status;
      var tickTime = (status.status !== 'idle') ? 100 : 1000;
      clearTimeout(timer);
      timer = setTimeout(function statusTick() {
        that.status();
      }, 100);
    });

    that.status();
  });

  this.lineStream = stream.pipe(split());


  var lines = [], lineStream = this.lineStream, that = this;

  this.lineStream.once('data', function(d) {
    if (d.indexOf('ready') > -1) {
      console.log('ready');
      stream.emit('ready');

      lineStream.on('data', function handle(line) {
        console.log(line);
        line = line.trim();
        if (line === 'ok') {
          if (commandQueue.length > 0) {
            var fn = commandQueue.shift();
            fn && fn.call(that, lines.concat([]));
            lines = [];
          }
        } else if (line.substring(0,1) === '<') {

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

          that.stream.emit('status', ret);

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
  this.stream.write('?');
};



Machine.prototype.settings = function(fn) {
  var matcher = /\$([0-9]+)=([^ ]+)/;
  this.run('$$', function(lines) {

    var settings = {};
    lines.forEach(function(line) {
      var matches = line.match(matcher);
      if (matches) {
        var val = matches.pop();

        if (line.indexOf('bool') > -1) {
          val = val === '0' ? false : true;
        }
        settings['index-' + matches[1]] = val;
      }
    });
    console.log(JSON.stringify(settings));

    this._settings = settings;
    this.stream.emit('settings', settings);
  });
}

Machine.prototype.run = function(cmd, fn) {
  this.stream.write(cmd + '\n');
  this.collectUntilOk(fn);
};

module.exports = Machine;