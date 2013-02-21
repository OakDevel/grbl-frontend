var weld = require('weld').weld,
    $ = require('qwery');

var on = function(sel, name, fn) {
  var el = $(sel);
  if (el.length) {
    for (var i=0; i<el.length; i++) {
      el[i].addEventListener(name, fn);
    }
  }
};

var off = function(sel, name, fn) {
  var el = $(sel);
  if (el.length) {
    for (var i=0; i<el.length; i++) {
      el[i].addEventListener(name, fn);
    }
  }
};

module.exports = function(machine) {
  document.getElementById('machine-status').setAttribute('class', "status connected");


  var running = true;
  machine.stream.on('status', function(d) {

    if (d.status === 'hold') {
      running = false;
      document.querySelector('#machine-status button').innerHTML = 'Pausing...';
    } else if (d.status === 'queue') {
      running = false;
      document.querySelector('#machine-status button').innerHTML = 'Resume';
    } else {
      running = true;
      document.querySelector('#machine-status button').innerHTML = 'Pause';
    }

    weld(document.getElementById('machine-status'), d)
  });

  machine.stream.on('settings', function(d) {
    weld(document.querySelector('#machine-settings'), d)
  });

  document.querySelector('#machine-status button').addEventListener('click', function(ev) {
    machine.run(running ? '!' : '~');
  });
};
