var assert = require('assert');
var db     = require('../src/api/db.js');

describe('MySQL', function() {
  it('Testando ping', function(done) {
	db.ping(function(err) {
      assert.equal(null, err);
      done();
	});
  });
});
