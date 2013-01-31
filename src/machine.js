var split = require('split');


function Machine(stream) {
  this.stream = stream;
  this.settings = {};
  this.commandQueue = [];
  this.lineStream = stream.pipe(split());

  this.run('$$', function(lines) {});
}


Machine.prototype.collectUntilOk = function(fn) {
  var lines = [], lineStream = this.lineStream;

  lineStream.once('data', function handle(line) {
    line = line.trim();
    if (line === 'ok') {
      fn && fn(lines.concat([]));
      lines = [];
    } else {
      lines.push(line);
      lineStream.once('data', handle);
    }
  });
};

Machine.prototype.status = function(fn) {
  this.run('?', function(lines) {
    var line = lines.shift();
    var parts = line.replace(/\<|\>/g, '').split(',');
    var ret = {
      status : parts.shift().toLowerCase(),
      position: {
        machine : {
          x : parseFloat(parts.shift().replace(/^[a-z:]+/gi,'')),
          y : parseFloat(parts.shift()),
          z : parseFloat(parts.shift()),
        },
        work : {
          x : parseFloat(parts.shift().replace(/^[a-z:]+/gi,'')),
          y : parseFloat(parts.shift()),
          z : parseFloat(parts.shift()),
        }
      }
    };

    fn && fn(ret);
  });
};

Machine.prototype.run = function(cmd, fn) {
  console.log('run', cmd);
  this.stream.write(cmd + '\n');
  this.collectUntilOk(fn);
};

module.exports = Machine;