var OpenTok = require('opentok'),
    opentok = new OpenTok("44956442", "9461b7c9ced22aa397f23bb91564d3ddf5e88e1f");

opentok.createSession(function(err, session) {
  if (err) return console.log(err);
  db.save('session', session.sessionId, done);
});
