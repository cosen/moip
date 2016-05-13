var express    = require('express');
var bodyParser = require('body-parser');
var app        = express();

var WebSocketServer = require("ws").Server;

var logger = require('./src/api/logger.js')(module);

var produtos = require('./src/api/produtos.js');
var checkout = require('./src/api/checkout.js');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
logger.debug("Express e BodyParser Integrados");

app.set('port', (process.env.PORT || 5000));
logger.debug("Porta da Aplicação é: " + app.get('port'));

app.use(express.static(__dirname + '/public'));

app.get('/produtos', function(req, res) {
  produtos.findAll(function(error, results) {
    if(error) {
      logger.error("Houve um Erro:");
      logger.error(error);

      res.status(500).send('Algo errado!');
    } else {
      logger.debug("Devolvendo os Produtos: ");
      logger.debug(results);

      res.json(results);
    }
  });
});

app.post('/checkout', function(req, res) {
  var novoCheckout = req.body;
  checkout.addCheckout(novoCheckout, function(error, pagamentoId) {
    if(error) {
      logger.error("Houve um Erro:");
      logger.error(error);

      res.status(500).send('Algo errado!');
    } else {
      logger.debug("Devolvendo o Id do Pagamento: " + pagamentoId);

      res.json({pagamentoId: pagamentoId});
    }
  });
});

app.post('/payments', function(req, res) {
  checkout.notificationMoip(req.body);
  res.send("");
});

process.on('uncaughtException', function (err) {
  logger.error(err);
});

var server = app.listen(app.get('port'), function() {
  logger.info('Aplicação Executando na Porta: ' + app.get('port'));
});

var wss = new WebSocketServer({server: server});
logger.info("Websocket Server Criado");

wss.on("connection", function(ws) {
  checkout.addWebsocket(ws);
});
