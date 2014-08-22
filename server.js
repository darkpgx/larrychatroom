var app = require('express')();
app.set('view engine', 'ejs');

app.get('/', function(req, res){
  res.render('index');
});

app.get('/room/:rmname', function(req, res){
  res.render('chatroom', {rmname: req.params.rmname});
});

app.listen(8888);
