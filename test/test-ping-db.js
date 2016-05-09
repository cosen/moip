var assert = require('assert');
var db     = require('../src/api/db.js');

describe('MySQL', function() {
  it('Criar uma conexão com o MySQL deve executar sem erro', function(done) {
	db.ping(function(err) {
      assert.equal(null, err);
      done();
	});
  });
});
