var https = require('https');

var headers = {
  "Authorization": "Basic: VFlFUUdDQ0JOQzBQRFhKNkpPU0JJSzlWV1RSTDlRWTc6S1FVNUxTRUtLWVFSV0NBVzNBOUs4TTMwSVZJNEdIVUE5WE1MT01JWg==",
  "Content-Type": "application/json"      
};

module.exports.createOrder = function(order, callback) {
  var options = {
    host: "sandbox.moip.com.br",
    path: "/v2/orders",
    method: "POST",
    headers: headers    
  };

  var request = https.request(options, function(response) {
    var data = "";

    response.on('data', function(chunk) {
      data += chunk;
    });

    response.on('end', function() {
      data = JSON.parse(data);
      if(data.errors) {
        callback(data.errors);
        return;
      }
      var pedidoMoipId = data.id;

      callback(null, pedidoMoipId);
    });      
  });

  request.on('error', function(error) {
    callback(error);
    return;
  });

  request.write(JSON.stringify(order));

  request.end();
};

module.exports.createPayment = function(payment, pedidoMoipId, callback) {
  var options = {
    host: "sandbox.moip.com.br",
    path: "/v2/orders/" + pedidoMoipId + "/payments",
    method: "POST",
    headers: headers    
  };

/*  var request = https.request(options, function(response) {
    var data = "";

    response.on('data', function(chunk) {
      data += chunk;
    });

    response.on('end', function() {
      data = JSON.parse(data);
      if(data.errors) {
        callback(data.errors);
        return;
      }

      var pagamentoId = data.id;

      callback(null, pagamentoId);
    });      
  });

  request.on('error', function(error) {
    callback(error);
  });
*/
  console.log(pedidoMoipId);
  console.log(JSON.stringify(payment));
  //request.write(JSON.stringify(payment));

  //request.end();
};
