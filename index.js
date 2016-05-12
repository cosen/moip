var express    = require('express');
var bodyParser = require('body-parser');
var app        = express();

var WebSocketServer = require("ws").Server

var util = require('util');

var produtos = require('./src/api/produtos.js');
var checkout = require('./src/api/checkout.js');

var wss = [];

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

app.post('/checkout', function(req, res) {
  var novoCheckout = req.body;
  checkout.addCheckout(novoCheckout, function(error, pagamentoId) {
    if(error) {
      console.log(error);
      res.status(500).send('Algo errado!');
    } else {
      res.json({pagamentoId: pagamentoId});
    }
  });
});

app.post('/payments', function(req, res) {
  console.log(util.inspect(req.body, {showHidden: false, depth: null}));
  var pagamentoId = req.body.resource.payment.id;

  if(req.body.event == "PAYMENT.AUTHORIZED") {
    wss[pagamentoId].send(true, function() )
  } else if(req.body.event == "PAYMENT.CANCELLED") {
    wss[pagamentoId].send(true, function() )
  }

  res.send("");
});

process.on('uncaughtException', function (err) {
  console.log(err);
})

var server = app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

var wss = new WebSocketServer({server: server});
console.log("Websocket server created")

wss.on("connection", function(ws) {
  var pagamentoId = ws.upgradeReq.url.split('=')[1];

  console.log("websocket connection open: " + pagamentoId);
  
  wss[pagamentoId] = ws;

  ws.on("close", function() {
    console.log("websocket connection close");
  })
});

