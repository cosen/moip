var db = require('./db.js');
var moip = require('./moip.js');

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
  // DADOS FIXOS
  checkout.order.amount = amount;
  checkout.order.customer = customer;
  checkout.payment.fundingInstrument.method = "CREDIT_CARD";

  var query = {
    sql: "insert into pedidos values()"
  };

  console.log("Inserindo pedido no BD");
  db.executeQuery(query, function(error, results) {
    if(error) {
      callback(error);
      return;
    }

    var pedidoId = results.insertId;
    checkout.order.ownId = pedidoId;
    console.log("Pedido inserido com id: " + pedidoId);
 
    var values = [];
    for(var i = 0; i < checkout.order.items.length; i++) {
      var produto = checkout.order.items[i];
      produto.price = parseInt(produto.price * 100);
      values.push([produto.id, pedidoId, produto.quantity]);
    }

    query = {
      sql: "insert into itens (produto_id, pedido_id, quantidade) values ?",
      values: [values]
    };

    console.log("Inserindo os itens no BD: " + [values]);
    db.executeQuery(query, function(error, results) {
      if(error) {
        callback(error);
        return;
      }

      console.log("Itens inseridos no BD: " + [values]);

      console.log("Criando pedido no Moip");
      moip.createOrder(checkout.order, function(error, pedidoMoipId) {
        if(error) {
          callback(error);
          return; 
        }

        console.log("Pedido criado no Moip com id: " + pedidoMoipId);

        console.log("Inserindo o moip_id no BD");
        query = {
          sql: "update pedidos set moip_id = ? where id = ?",
          values: [pedidoMoipId, pedidoId]
        };

        db.executeQuery(query, function(error, results) {
          if(error) {
            callback(error);
            return;
          }

          console.log("O moip_id do pedido foi inserido no BD");

          console.log("Criando pagamento no Moip");
          moip.createPayment(checkout.payment, pedidoMoipId, function(error, pagamentoId) {
            if(error) {
              callback(error);
              return;
            }
    
            console.log("Pagamento criado no Moip com id: " + pagamentoId);

            console.log("Inserindo o pagamento_id no BD");
            query = {
              sql: "update pedidos set pagamento_id = ? where id = ?",
              values: [pagamentoId, pedidoId]
            };

            db.executeQuery(query, function(error, results) {
              if(error) {
                callback(error);
                return;
              }

              console.log("O pagamento_id do pedido foi inserido no BD");

              callback(null, pagamentoId);
            });
          });
        }); 
      });
    });
  });
};












