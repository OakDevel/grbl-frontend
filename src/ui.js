var weld = require('weld').weld;

module.exports = function(machine) {
  machine.stream.on('status', function(d) {
    weld(document.getElementById('machine-status'), d)
  });



  var running = true;
  document.querySelector('#machine-status button').addEventListener('click', function(ev) {
    machine.run(running ? '!' : '~');
    running = !running;
    ev.target.innerHTML = running ? 'Pause' : 'Resume';
  });



};
