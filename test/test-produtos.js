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

  it('Executar o findById() com o id de um produto existente deve devolver esse produto', function(done) {
	produtos.findById(1, function(error, results) {
      assert.equal("Bola", results[0].nome);
      assert.equal("Uma bola de futebol", results[0].descricao);
      assert.equal("10.75", results[0].preco);
      done();
    });
  });

  it('Executar o findById() com o id de um produto inexistente deve devolver results vazio', function(done) {
	produtos.findById(2, function(error, results) {
      assert.equal(0, results.length);
      done();
    });
  });

  it('Executar o delete() com o id de um produto existente deve remover esse produto do banco', function(done) {
	produtos.delete(1, function(error, results) {
      produtos.findById(1, function(error, results) {
        assert.equal(0, results.length);
        done();
      });
    });
  });
});
