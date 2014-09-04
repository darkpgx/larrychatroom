var app = require('express')();
app.set('view engine', 'ejs');
var OpenTok = require('opentok'),
    opentok = new OpenTok('44956442','9461b7c9ced22aa397f23bb91564d3ddf5e88e1f');

var chat = {};
var room_session = {};

app.get('/', function(req, res){
  res.render('index');
});

app.get('/room/:rmname', function(req, res){
  res.render('chatroom', {rmname: req.params.rmname});
});

app.get('/chat', function(req, res){
  if(!(req.query.rmname in chat)) {
    chat[req.query.rmname] = [];
    chat[req.query.rmname].push({user: req.query.user, msg: req.query.msg});
  }
  else{
    chat[req.query.rmname].push({user: req.query.user, msg: req.query.msg});
  };
console.log(chat);
res.send("success");
});

app.get('/getchat', function(req, res){
  res.send(chat[req.query.rmname]);
});

// app to insert videochat
app.get('/videochat/:rmname', function(req, res){
  if (typeof room_session[req.params.rmname] === "string" && room_session[req.params.rmname] !== ""){
    var session_id = room_session[req.params.rmname];
    var TK = opentok.generateToken(session_id);
    res.send({api_key: process.env.api_key, session_id: session_id, token: TK});
  }
  else {
    opentok.createSession(function(err, session) {
      if (err) return console.log(err);
      var session_id = session.sessionId;
      room_session[req.params.rmname] = session_id;
      var TK = opentok.generateToken(session_id);
      res.send({api_key: process.env.api_key, session_id: session_id, token: TK});
    });
  };
});

app.listen(8888);
