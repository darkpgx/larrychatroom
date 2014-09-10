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

//receive message on terminal request

app.get('/receivemessage', function(req, res) {
  if(!(req.query.username) in term_chat) {res.send("User does not exist");}
  res.send("Messages");
});

//send res to terminal request

app.get('/getmessage', function(req,res) {
  if(req.query.rec_name == "") {res.send("No Recepient")};
  if(!(req.query.rec_name in term_chat)){
    term_chat[req.query.rec_name] = [];
    term_chat[req.query.rec_name].push({sender: req.query.username, msg: req.query.send_msg});
  }
  else{
    term_chat[req.query.rec_name].push({sender: req.query.username, msg: req.query.send_msg});
  };
  res.send(term_chat[req.query.rec_name]);
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
