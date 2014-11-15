var express = require('express');
var haml = require('hamljs'), 
    path = require('path'),
    fs = require('fs');


// setup //

var app = express();
app.use(express.static(path.join(__dirname, 'public')));


// routes //

app.get('/', function(req, res) {
  var hamlView = fs.readFileSync('views/main.haml', 'utf8');
  res.end( haml.render(hamlView) );
});

app.get('/dict_en', function(req, res) {
  var data = fs.readFileSync('public/dict_en.txt');
  var json = JSON.stringify( data.toString().split(/\W+/) );
  res.setHeader('Content-Type', 'application/json');
  res.end(json);
});


app.listen(process.env.PORT || 3000);
