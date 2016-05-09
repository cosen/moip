var mysql = require('mysql');

var pool = mysql.createPool({
  connectionLimit: 100,
  host: (process.env.DB_MYSQL_HOST || 'localhost'),
  user: (process.env.DB_MYSQL_HOST || 'root'),
  password: (process.env.DB_MYSQL_PASSWORD || 'root'),
  database: (process.env.DB_MYSQL_DATABASE || 'j2w1xpr3s01xy8ob'),
  debug: false
});

module.exports.executeQuery = function(query, callback) {
  pool.query(query, callback);
}

module.exports.ping = function(callback) {
  pool.getConnection(function(err, connection) {
    if(err) {
      callback(err);
    } else {
      connection.ping(function(err) {
        if(err) {
          connection.release();
          callback(err);          
        } else {
          connection.release();
          callback();
        }
      });
    }
  });
}
