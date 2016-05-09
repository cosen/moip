var db = require('./db.js');

module.exports.findAll = function(callback) {
  var sql = "select * from produtos";
  db.executeQuery(sql, function(error, results, fields) {
    callback(error, results);
  });
}

module.exports.findById = function(id, callback) {
  var query = {
    sql: "select * from produtos where id = ?",
    values: [id]
  };

  db.executeQuery(query, function(error, results, fields) {
    callback(error, results);
  });
}

module.exports.add = function(produto, callback) {
  var query = {
    sql: "insert into produtos set ?",
    values: produto
  };

  db.executeQuery(query, function(error, results, fields) {
    callback(error, results);
  });
}

module.exports.delete = function(id, callback) {
  var query = {
    sql: "delete from produtos where id = ?",
    values: [id]
  };

  db.executeQuery(query, function(error, results, fields) {
    callback(error, results);
  });
}
