var db = require('./db.js');
var moip = require('./moip.js');
var logger = require('./logger.js')(module);

var wss = [];
logger.debug("Array dos Websockets Criado");

// UTILIZAREI MOEDA E FRETE FIXOS
var amount = {
  currency: "BRL",
  subtotals: {
    shipping: 1000
  }
};

// UTILIZAREI CLIENTE FIXO
var customer = {
  ownId: "1",
  fullname: "Ana Maria",
  email: "ana.maria@email.com",
  birthDate: "1984-10-30",
  taxDocument: {
    type: "CPF",
    number: "22222222222"
  },
  phone: {
    countryCode: "55",
    areaCode: "11",
    number: "55555555"
  },
  shippingAddress: {
    street: "Avenida Faria Lima",
    streetNumber: "2927",
    complement: "8",
    district: "Itaim",
    city: "Sao Paulo",
    state: "SP",
    country: "BRA",
    zipCode: "01234000"
  }
};

module.exports.addCheckout = function(checkout, callback) {
  logger.info("Executando o método: addCheckout()");

  // DADOS FIXOS
  checkout.order.amount = amount;
  checkout.order.customer = customer;
  checkout.payment.fundingInstrument.method = "CREDIT_CARD";

  var query = {
    sql: "insert into pedidos values()"
  };

  logger.info("Inserindo um Pedido no BD"); 
  db.executeQuery(query, function(error, results) {
    if(error) {
      callback(error);
      return;
    }

    logger.info("Pedido Inserido com Id: " + results.insertId);

    var pedidoId = results.insertId;
    checkout.order.ownId = pedidoId;
 
    logger.info("Calculando o Fator do Pedido");

    var fator = 1;
    if(checkout.payment.installmentCount > 1) {
      logger.info("Pagamento em 2 ou mais Vezes");
      logger.info("Acrescentando 2.5% ao Fator do Pedido");
  
      fator += 0.025;
    }

    if(checkout.payment.cupom && checkout.payment.cupom.startsWith("A")) {
      logger.info("Pagamento Utilizando Cupom Válido");
      logger.info("Diminuindo 5% do Fator do Pedido");

      fator -= 0.05;
    } 

    logger.info("O Fator calculado foi: " + fator);
    logger.info("Inserindo os Itens do Pedido no BD: " + [values]);

    var values = [];
    for(var i = 0; i < checkout.order.items.length; i++) {
      var produto = checkout.order.items[i];
      produto.price = parseInt(produto.price * 100 * fator);
      values.push([produto.id, pedidoId, produto.quantity, produto.price]);
    }

    query = {
      sql: "insert into itens (produto_id, pedido_id, quantidade, unitario) values ?",
      values: [values]
    };

    db.executeQuery(query, function(error, results) {
      if(error) {
        callback(error);
        return;
      }

      logger.info("Itens do Pedido Inseridos no BD: " + [values]);
      logger.info("Criando Pedido na Moip");

      moip.createOrder(checkout.order, function(error, pedidoMoipId) {
        if(error) {
          callback(error);
          return; 
        }

        logger.info("Pedido Criado na Moip com Id: " + pedidoMoipId);
        logger.info("Inserindo o moip_id no BD");

        query = {
          sql: "update pedidos set moip_id = ? where id = ?",
          values: [pedidoMoipId, pedidoId]
        };

        db.executeQuery(query, function(error, results) {
          if(error) {
            callback(error);
            return;
          }

          logger.info("O moip_id do Pedido foi Inserido no BD");
          logger.info("Criando Pagamento na Moip");

          moip.createPayment(checkout.payment, pedidoMoipId, function(error, pagamentoId) {
            if(error) {
              callback(error);
              return;
            }
    
            logger.info("Pagamento Criado na Moip com Id: " + pagamentoId);
            logger.info("Inserindo o pagamento_id no BD");

            query = {
              sql: "update pedidos set pagamento_id = ? where id = ?",
              values: [pagamentoId, pedidoId]
            };

            db.executeQuery(query, function(error, results) {
              if(error) {
                callback(error);
                return;
              }

              logger.info("O pagamento_id do Pedido foi Inserido no BD");

              callback(null, pagamentoId);
            });
          });
        }); 
      });
    });
  });
};

module.exports.addWebsocket = function(ws) {
  var pagamentoId = ws.upgradeReq.url.split('=')[1];

  logger.info("Websocket Aberto. Pagamento: " + pagamentoId);
  
  wss[pagamentoId] = ws;

  var ping = setInterval(function() {
    ws.send("ping", function() {  });
  }, 2000);

  ws.on("close", function() {
    logger.info("Websocket Fechado. Pagamento: " + pagamentoId);
    clearInterval(ping);
  });
};

module.exports.notificationMoip = function(notification) {
  var pagamentoId = notification.resource.payment.id;

  logger.info("Recebendo Notificação da Moip. Pagamento: " + pagamentoId);
  logger.info("Evento: " + notification.event);

  if(notification.event == "PAYMENT.AUTHORIZED") {
    if(wss[pagamentoId]) {
      logger.info("Enviando a Notificação pelo Websocket");      
      
      wss[pagamentoId].send("true", function() {});
    } else {
      logger.error("Websocket não Existe");
    }
  } else if(notification.event == "PAYMENT.CANCELLED") {
    if(wss[pagamentoId]) {
      logger.info("Enviando a Notificação pelo Websocket");

      wss[pagamentoId].send("false", function() {});
    } else {
      logger.error("Websocket não Existe");
    }
  }
};
