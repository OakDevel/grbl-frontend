var skateboard = require('skateboard'),
    grbl = require('grbl'),
    activeMachine = null;

var hookup = function(stream) {
  stream.pipe(activeMachine, {end: false}).pipe(stream);
};

skateboard({ dir: __dirname + '/public' }, function(stream) {
  stream.pipe(process.stdout);
  if (!activeMachine) {
    grbl(function(machine) {
      machine.pipe(process.stdout);
      machine.on('end', function() {
        activeMachine = false;
      });
      activeMachine = machine;
      hookup(stream);
      stream.write('ready\n')
    });
  } else {
    hookup(stream);
    stream.write('ready\n')
  }
});
