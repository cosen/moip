var assert = require('assert');
var sinon = require('sinon');
var winston = require('winston');
var nock = require("nock");
var rewire = require("rewire");

var checkout = rewire("../src/api/checkout.js");
var moip = require("../src/api/moip.js");
var db = require("../src/api/db.js");

describe('Checkout', function() {
  before(function() {
    winston.level = 'error';

    var values = [];
    values.push(["Bola", "Uma bola...", "1"]);
    values.push(["Caneta", "Uma caneta...", "2"]);

    query = {
      sql: "insert into produtos (nome, descricao, preco) values ?",
      values: [values]
    };

    db.executeQuery(query, function() {});

    var scope = nock("https://sandbox.moip.com.br", {
      reqheaders: {
        "Authorization": "Basic: VFlFUUdDQ0JOQzBQRFhKNkpPU0JJSzlWV1RSTDlRWTc6S1FVNUxTRUtLWVFSV0NBVzNBOUs4TTMwSVZJNEdIVUE5WE1MT01JWg==",
        "Content-Type": "application/json"
      }
    });

    scope.post("/v2/orders", function(body) {
      var order = body;

      if(!order.items) {
        return false;
      }

      for(var i = 0; i < order.items.length; i++) {
        if(!order.items[i].id ||
           !order.items[i].product ||
           !order.items[i].quantity ||
           !order.items[i].detail ||
           !order.items[i].price) {
           return false;
        }
      }
      return true;
    }).reply(201, {
      "id": "ORD-1"
    });

    scope.post("/v2/orders/ORD-1/payments", function(body) {
      var payment = body;

      if(!payment.installmentCount ||
         !payment.fundingInstrument ||
         !payment.fundingInstrument.method ||
         !payment.fundingInstrument.creditCard ||
         !payment.fundingInstrument.creditCard.hash ||
         !payment.fundingInstrument.creditCard.holder ||
         !payment.fundingInstrument.creditCard.holder.fullname ||
         !payment.fundingInstrument.creditCard.holder.birthdate ||
         !payment.fundingInstrument.creditCard.holder.taxDocument ||
         !payment.fundingInstrument.creditCard.holder.taxDocument.type ||
         !payment.fundingInstrument.creditCard.holder.taxDocument.number) {
        return false;
      }
    
      return true;
    }).reply(201, {
      "id": "PAY-1"
    });
  });

  after(function() {
    winston.level = 'info';
    nock.cleanAll();
  });

  it('addCheckout deve devolver PAY-1', function(done) {
    var createOrderSpy = sinon.spy(moip, "createOrder");
    var createPaymentSpy = sinon.spy(moip, "createPayment");

    var novoCheckout = {
      order: {
        items: [
          {
            id: "1",
            product: "Bola",
            quantity: "2",
            detail: "Uma bola...",
            price: "100"
          },
          {
            id: "2",
            product: "Caneta",
            quantity: "3",
            detail: "Uma caneta...",
            price: "200"
          }
        ]
      },
      payment: {
        installmentCount: "1",
        fundingInstrument: {
          method: "CREDIT_CARD",
          creditCard: {
            hash: "Y8/8QzRu1Y1XQI3ad0CwMdj2J9yq+cTW9DtLQeY8SXtx12Xq1B38JqlL7Q8czMRLWHwi9bEgrMoOoMVVtpVJZXJaOFpDmJHabfE/QH3cEbSDwbZkvyxprWVoyqrttmjyr5Z1HH5UVYGeUbosoGrV9D3xGtLKu7zZzLJDl2+giNpsp4q41fAITTdyipDZtrqfZqhAFbPNMqqgcq4KM71duHuzMofT6KUvUOwTn2NmYYA0df0m7Fhll68yVxVnXEbX0fClVftNc6+4Br0nvoPptbx78QL/JnD4MilTXyWf6EEcs4WyJkBQd+BmgUM7LCJDEyV3+xVY0R2moNfFuTCwjg==",
            holder: {
              fullname: "José da Silva",
              birthdate: "1984-10-10",
              taxDocument: {
                type: "CPF",
                number: "11111111111"
              }
            }
          }
        }
      }
    };
   
    checkout.addCheckout(novoCheckout, function(error, pagamentoId) {
      assert.equal(1, createOrderSpy.callCount);
      assert.equal(1, createPaymentSpy.callCount);
      assert.equal(null, error);
      assert.equal("PAY-1", pagamentoId);
      assert.equal("1", novoCheckout.order.ownId);    
      done();
    });
  });

  it('calculaFator deve devolver 0.95', function(done) {
    var payment = {
      installmentCount: "1",
      cupom: "Ajashdhgsd"
    };

    var calculaFator = checkout.__get__("calculaFator");
    assert.equal(0.95, calculaFator(payment));
    done();
  });

  it('calculaFator deve devolver 1', function(done) {
    var payment = {
      installmentCount: "1",
      cupom: "ajashdhgsd"
    };

    var calculaFator = checkout.__get__("calculaFator");
    assert.equal(1, calculaFator(payment));
    done();
  });

  it('calculaFator deve devolver 1', function(done) {
    var payment = {
      installmentCount: "1",
    };

    var calculaFator = checkout.__get__("calculaFator");
    assert.equal(1, calculaFator(payment));
    done();
  });

  it('calculaFator deve devolver 0.975', function(done) {
    var payment = {
      installmentCount: "2",
      cupom: "Ajashdhgsd"
    };

    var calculaFator = checkout.__get__("calculaFator");
    assert.equal(0.975, calculaFator(payment));
    done();
  });

  it('calculaFator deve devolver 1.025', function(done) {
    var payment = {
      installmentCount: "2",
      cupom: "sadasd"
    };

    var calculaFator = checkout.__get__("calculaFator");
    assert.equal(1.025, calculaFator(payment));
    done();
  });

  it('calculaFator deve devolver 1.025', function(done) {
    var payment = {
      installmentCount: "2",
    };

    var calculaFator = checkout.__get__("calculaFator");
    assert.equal(1.025, calculaFator(payment));
    done();
  });

  it('enviaNotificacao deve chamar send com "true" uma vez', function(done) {
    var wss = checkout.__get__("wss");
    
    var paymentId = "PAY-1";

    wss[paymentId] = {
      send: function() {}
    };

    var sendSpy = sinon.spy(wss[paymentId], "send");

    var notification = {
      event: "PAYMENT.AUTHORIZED",
      resource: {
        payment: {
          id: paymentId
        }
      }
    };

    var enviaNotificacao = checkout.__get__("enviaNotificacao");

    enviaNotificacao(notification);

    assert(sendSpy.withArgs("true").calledOnce);
    assert(!wss[paymentId]);
    done();
  });

  it('enviaNotificacao deve chamar send com "false" uma vez', function(done) {
    var wss = checkout.__get__("wss");
    
    var paymentId = "PAY-2";

    wss[paymentId] = {
      send: function() {}
    };

    var sendSpy = sinon.spy(wss[paymentId], "send");

    var notification = {
      event: "PAYMENT.CANCELLED",
      resource: {
        payment: {
          id: paymentId
        }
      }
    };

    var enviaNotificacao = checkout.__get__("enviaNotificacao");

    enviaNotificacao(notification);

    assert(sendSpy.withArgs("false").calledOnce);
    assert(!wss[paymentId]);
    done();
  });

  it('enviaNotificacao não deve chamar o send', function(done) {
    var wss = checkout.__get__("wss");
    
    var paymentId = "PAY-3";

    wss[paymentId] = {
      send: function() {}
    };

    var sendSpy = sinon.spy(wss[paymentId], "send");

    var notification = {
      event: "",
      resource: {
        payment: {
          id: paymentId
        }
      }
    };

    var enviaNotificacao = checkout.__get__("enviaNotificacao");

    enviaNotificacao(notification);

    assert.equal(0, sendSpy.callCount);
    assert(!wss[paymentId]);
    done();
  });

  it('notificationMoip deve guardar a notificação', function(done) {
    var paymentId = "PAY-4";

    var notification = {
      event: "",
      resource: {
        payment: {
          id: paymentId
        }
      }
    };

    checkout.notificationMoip(notification);

    var notifications = checkout.__get__("notifications");

    assert.equal(notification, notifications[paymentId]);
    done();
  });

  it('notificationMoip deve enviar a notificação', function(done) {
    var paymentId = "PAY-5";

    var wss = checkout.__get__("wss");

    wss[paymentId] = {
      send: function() {}
    };

    var notification = {
      event: "PAYMENT.AUTHORIZED",
      resource: {
        payment: {
          id: paymentId
        }
      }
    };

    checkout.notificationMoip(notification);

    var notifications = checkout.__get__("notifications");

    assert(!wss[paymentId]);
    assert(!notifications[paymentId]);
    done();
  });

  it('addWebsocket deve enviar a notificação armazenada', function(done) {
    var paymentId = "PAY-6";
    var ws = {
      upgradeReq: {
        url: "payment=" + paymentId
      },
      send: function() {},
      on: function() {}
    };

    var notifications = checkout.__get__("notifications");

    var notification = {
      event: "PAYMENT.AUTHORIZED",
      resource: {
        payment: {
          id: paymentId
        }
      }
    };

    notifications[paymentId] = notification;

    var sendSpy = sinon.spy(ws, "send");

    checkout.addWebsocket(ws);

    assert(sendSpy.withArgs("true").calledOnce);
    assert(!notifications[paymentId]);
    done();
  });
});
