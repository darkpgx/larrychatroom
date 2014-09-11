var app = require('express')();
app.set('view engine', 'ejs');
var OpenTok = require('opentok'),
    opentok = new OpenTok(process.env.api_key, process.env.api_secret ); 
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
  service: 'gmail',
    auth: {
      user: process.env.nodemail_key,
    pass: process.env.nodemail_pass
    }
});

var term_chat = {};
var chat = {};
var room_session = {};

//if no room exists, create one, else join room and send roomname and password
app.get('/termchat/join', function(req, res){
  if (!(req.query.roomname in term_chat)) {
    term_chat[req.query.roomname] = { 
      "roomname" : req.query.roomname,
      "password" : req.query.password,
      "chat"     : []
    };
    res.send('Room Created with roomname: ' + term_chat[req.query.roomname]["roomname"] + 
      ' and password: ' + term_chat[req.query.roomname]["password"]);
  };
  if (req.query.password !== term_chat[req.query.roomname]["password"]) {res.send("Wrong password");};
  res.send("Joining room " + req.query.roomname);
});

//chatsession handler
app.get('/termchat/chat', function(req, res){
  term_chat[req.query.roomname]["chat"].push({"username": req.query.username, "send_msg": req.query.send_msg});
  res.end();
});

app.get('/termchat/get', function(req, res){
  if (!(req.query.roomname in term_chat)) {res.end();};
  if (req.query.password !== term_chat[req.query.roomname]["password"]) {res.end();};
  res.send(term_chat[req.query.roomname]["chat"]);
});

//sending email
app.get('/mailmsg', function(req, res){
  var mail_text = '';
  var chat_array = chat[req.query.rmname];
  for (var i = 0; i< chat_array.length; i++) {
    mail_text = mail_text + chat_array[i].user + ': ' + chat_array[i].msg + '\n';
  };
  transporter.sendMail({
    from: process.env.nodemail_key,
    to: req.query.email,
    subject: "Transcript from Chatroom: " + req.query.rmname,
    text: mail_text
  });
  res.send('success');
});

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

var port = process.env.PORT || 8888;
app.listen(port);
