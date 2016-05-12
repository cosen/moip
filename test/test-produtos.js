var assert   = require('assert');
var produtos = require('../src/api/produtos.js');

describe('Produtos', function() {
  it('Executar o findAll() sem registros no BD deve devolver results vazio', function(done) {
	produtos.findAll(function(error, results) {
      assert.equal(0, results.length);
      done();
    });
  });
});
