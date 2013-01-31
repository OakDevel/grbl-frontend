var skateboard = require('skateboard/client'),
    Machine = require('./machine');

skateboard(function(socket) {
  machine = new Machine(socket);
  window.machine = machine;
});
