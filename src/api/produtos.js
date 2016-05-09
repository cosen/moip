var db = require('./db.js');

module.exports.findAll = function(callback) {
  var sql = "select * from produtos";
  db.executeQuery(sql, function(error, results, fields) {
    callback(error, results);
  });
}
