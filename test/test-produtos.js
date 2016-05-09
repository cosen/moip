var assert   = require('assert');
var produtos = require('../src/api/produtos.js');

describe('Produtos', function() {
  it('O findAll deve devolver results vazio', function(done) {
	produtos.findAll(function(error, results) {
      assert.equal(0, results.length);
      done();
    });
  });
});
