var assert = require('assert');
var nock = require("nock");
var winston = require('winston');

var moip = require("../src/api/moip.js");

describe('Moip', function() {
  before(function() {
    winston.level = 'error';

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

  it('createOrder deve devolver ORD-1', function(done) {
    var order = {
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
    };

    moip.createOrder(order, function(error, pedidoMoipId) {
      assert.equal(null, error);
      assert.equal("ORD-1", pedidoMoipId);
      done();
    });
  });

  it('createOrder deve devolver erro quando order vazio', function(done) {
    var order = {
    };

    moip.createOrder(order, function(error, pedidoMoipId) {
      assert.notEqual(null, error);
      done();
    });
  });

  it('createOrder deve devolver erro quando item inválido', function(done) {
    var order = {
      items: [
        {
          id: "1",
          product: "Bola",
          quantity: "2",
          detail: "Uma bola...",
        },
        {
          id: "2",
          product: "Caneta",
          quantity: "3",
          detail: "Uma caneta...",
          price: "200"
        }
      ]
    };

    moip.createOrder(order, function(error, pedidoMoipId) {
      assert.notEqual(null, error);
      done();
    });
  });

  it('createPayment deve devolver PAY-1', function(done) {
    var payment = {
      installmentCount: "1",
      fundingInstrument: {
        method: "CREDIT_CARD",
        creditCard: {
          hash: "hash",
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
    };

    moip.createPayment(payment, "ORD-1", function(error, pagamentoId) {
      assert.equal(null, error);
      assert.equal("PAY-1", pagamentoId);
      done();
    });
  });

  it('createPayment deve devolver erro quando payment vazio', function(done) {
    var payment = {
    };

    moip.createPayment(payment, "ORD-1", function(error, pagamentoId) {
      assert.notEqual(null, error);
      done();
    });
  });

  it('createPayment deve devolver erro quando fundingInstrument inválido', function(done) {
    var payment = {
      installmentCount: "1",
      fundingInstrument: {
        method: "CREDIT_CARD",
        creditCard: {
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
    };

    moip.createPayment(payment, "ORD-1", function(error, pagamentoId) {
      assert.notEqual(null, error);
      done();
    });
  });
});
