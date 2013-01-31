var skateboard = require('skateboard'),
    grbl = require('grbl');

grbl(function(machine) {
  skateboard({ dir: __dirname + '/public' }, function(stream) {
    stream.pipe(machine);
    machine.pipe(stream);
  });
});
