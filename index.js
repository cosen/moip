var express    = require('express');
var bodyParser = require('body-parser');
var app        = express();

var produtos = require('./src/api/produtos.js');

// express e body-parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));

app.get('/produtos', function(req, res) {
  produtos.findAll(function(error, results) {
    if(error) {
      console.log(error);
      res.status(500).send('Algo errado!');
    } else {
      res.json(results);
    }
  });
});

app.get('/produtos/:id', function(req, res) {
  produtos.findById(req.params.id, function(error, results) {
    if(error) {
      console.log(error);
      res.status(500).send('Algo errado!');
    } else if(results.length == 0) {
      res.status(404).send("Produto Inexistente");
    } else {
      res.json(results);
    }
  });
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
