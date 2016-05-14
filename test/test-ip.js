var publicIp = require('public-ip');
var assert = require('assert');
var http = require('http');

describe('IP', function() {
  it('IP', function(done) {
    this.timeout(10000);
    var server = http.createServer(function (request, response) {
      response.writeHead(200, {"Content-Type": "text/plain"});
      response.end("Hello World\n");
    });

    server.listen(8888);

    publicIp.v4().then(function(ip) {
      var options = {
        host: ip,
        path: "/",
        port: "8888",
        method: "GET",
      };      

      console.log(options);
      var request = http.request(options, function(response) {
        var data = "";

        response.on('data', function(chunk) {
          data += chunk;
        });

        response.on('end', function() {
          console.log("RESPONSE: " + data);
          done();
        });
      });

      request.end();
    });
  });
});
