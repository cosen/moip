var assert   = require('assert');
var produtos = require('../src/api/produtos.js');

describe('Produtos', function() {
  it('Executar o findAll() sem registros no BD deve devolver results vazio', function(done) {
	produtos.findAll(function(error, results) {
      assert.equal(0, results.length);
      done();
    });
  });

  it('Executar o add() com dados corretos deve executar sem erro', function(done) {
    var produto = {
      nome: "Bola",
      descricao: "Uma bola de futebol",
      preco: "10.75"
    };

	produtos.add(produto, function(error, results) {
      assert.equal(null, error);
      done();
    });
  });
});
