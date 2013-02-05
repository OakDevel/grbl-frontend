var skateboard = require('skateboard'),
    grbl = require('grbl'),
    activeMachine = null;

var hookup = function(stream) {
  stream.pipe(activeMachine).pipe(stream);
  activeMachine.pipe(process.stdout);
};

skateboard({ dir: __dirname + '/public' }, function(stream) {

  if (!activeMachine) {
    grbl(function(machine) {
      machine.on('end', function() {
        activeMachine = false;
      });
      activeMachine = machine;
      hookup(stream);
      stream.write('ready\n')
    });
  } else {
    hookup(stream);
  }
});
