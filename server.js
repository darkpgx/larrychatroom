var app = require('express')();
app.set('view engine', 'ejs');
var OpenTok = require('opentok'),
    opentok = new OpenTok("44956442", "9461b7c9ced22aa397f23bb91564d3ddf5e88e1f");

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

app.get('/videochat/:rmname', function(req, res){
  if (typeof room_session[req.query.rmname] === "string" && room_session[req.query.rmname] !== ""){
    SID = room_session[req.query.rmname];
    var TK = opentok.generateToken(SID);
    res.render('videochat', {session: SID, token: TK});
  }
  else {
    opentok.createSession(function(err, session) {
      if (err) return console.log(err);
      SID = session.sessionId;
      room_session[req.query.rmname] = SID;
      console.log(SID);
      var TK = opentok.generateToken(SID);
      res.render('videochat', {session: SID, token: TK});
    });
  };
});

app.listen(8888);
