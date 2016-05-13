var https = require('https');
var logger = require('./logger.js')(module);

var headers = {
  "Authorization": "Basic: VFlFUUdDQ0JOQzBQRFhKNkpPU0JJSzlWV1RSTDlRWTc6S1FVNUxTRUtLWVFSV0NBVzNBOUs4TTMwSVZJNEdIVUE5WE1MT01JWg==",
  "Content-Type": "application/json"      
};

logger.debug("Headers Inicializados:");
logger.debug(headers);

module.exports.createOrder = function(order, callback) {
  logger.info("Executando o método: createOrder()");
  logger.info("Registrando um Pedido na Moip. Dados do Pedido:");
  logger.info(order);

  var options = {
    host: "sandbox.moip.com.br",
    path: "/v2/orders",
    method: "POST",
    headers: headers    
  };

  logger.info("Dados da Request:");
  logger.info(options);

  var request = https.request(options, function(response) {
    var data = "";

    response.on('data', function(chunk) {
      logger.debug("Recebendo um Pedaço do Corpo da Response:");
      logger.debug(chunk);

      data += chunk;
    });

    response.on('end', function() {
      data = JSON.parse(data);
      
      logger.info("Corpo da Response:");
      logger.info(data);

      if(data.errors) {
        logger.info("Response com Erros:");
        logger.info(data.errors);

        callback(data.errors);
        return;
      }

      logger.info("Pedido Criando na Moip com Id: " + data.id);

      var pedidoMoipId = data.id;

      callback(null, pedidoMoipId);
    });      
  });

  request.on('error', function(error) {
    logger.info("Request com Erros:");
    logger.info(error);

    callback(error);
    return;
  });

  logger.info("Escrevendo o Conteúdo da Request:");
  logger.info(JSON.stringify(order));
  
  request.write(JSON.stringify(order));

  logger.info("Terminando a Request:");

  request.end();
};

module.exports.createPayment = function(payment, pedidoMoipId, callback) {
  logger.info("Executando o método: createPayment()");
  logger.info("Registrando um Pagamento na Moip. Dados do Pagamento:");
  logger.info(payment);

  var options = {
    host: "sandbox.moip.com.br",
    path: "/v2/orders/" + pedidoMoipId + "/payments",
    method: "POST",
    headers: headers    
  };

  logger.info("Dados da Request:");
  logger.info(options);

  var request = https.request(options, function(response) {
    var data = "";

    response.on('data', function(chunk) {
      logger.debug("Recebendo um Pedaço do Corpo da Response:");
      logger.debug(chunk);

      data += chunk;
    });

    response.on('end', function() {
      data = JSON.parse(data);

      logger.info("Corpo da Response:");
      logger.info(data);

      if(data.errors) {
        logger.info("Response com Erros:");
        logger.info(data.errors);

        callback(data.errors);
        return;
      }

      logger.info("Pagamento Criando na Moip com Id: " + data.id);

      var pagamentoId = data.id;

      callback(null, pagamentoId);
    });      
  });

  request.on('error', function(error) {
    logger.info("Request com Erros:");
    logger.info(error);

    callback(error);
  });

  logger.info("Escrevendo o Conteúdo da Request:");
  logger.info(JSON.stringify(payment));

  request.write(JSON.stringify(payment));

  logger.info("Terminando a Request:");

  request.end();
};
