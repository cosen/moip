var publicIp = require('public-ip');
var assert = require('assert');

describe('IP', function() {
  it('IP', function(done) {
    publicIp.v4().then(function(ip) {
      console.log(ip);
      done();
    });	
  });
});
