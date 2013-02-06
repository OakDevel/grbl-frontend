var skateboard = require('skateboard/client'),
    Machine = require('./machine'),
    ui = require('./ui');

skateboard(function(socket) {

  machine = new Machine(socket);

  ui(machine);

  window.machine = machine;
});
