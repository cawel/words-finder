var express = require('express');
var haml = require('hamljs'), 
    path = require('path'),
    fs = require('fs'), 
    bodyParser = require('body-parser');
var engine = require('./libs/words_finder_engine');
engine.setReferenceWordsList();


// setup //

var app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use( bodyParser.json() );


// routes //

app.get('/', function(req, res) {
  var hamlView = fs.readFileSync('views/main.haml', 'utf8');
  res.end( haml.render(hamlView) );
});

app.post('/find-words', function(req, res) {
  res.end( JSON.stringify(engine.findWords(req.body)) );
});

app.listen(process.env.PORT || 3000);