var mysql = require('mysql');
var logger = require('./logger.js')(module);

var config = {
  connectionLimit: 100,
  host: (process.env.DB_MYSQL_HOST || 'localhost'),
  user: (process.env.DB_MYSQL_USER || 'root'),
  password: (process.env.DB_MYSQL_NO_PASSWORD ? '' : (process.env.DB_MYSQL_PASSWORD || 'root')),
  database: 'j2w1xpr3s01xy8ob',
  debug: false
}

var pool = mysql.createPool(config);

logger.debug("MySQL Pool Criado");
logger.debug(config);

module.exports.executeQuery = function(query, callback) {
  logger.debug("Executando a Query:");
  logger.debug(query);
  pool.query(query, function(err, results) {
    if(err) {
      logger.debug("Query com Erro:");
      logger.debug(err);

      callback(err);
    } else {
      logger.debug("Query executada com sucesso");

      callback(err, results);
    }
  });
}

module.exports.ping = function(callback) {
  logger.debug("Executando um Ping:");
  pool.getConnection(function(err, connection) {
    if(err) {
      logger.debug("Conexão com Erros: ");
      logger.debug(err);

      callback(err);
    } else {
      logger.debug("Conexão Criada");

      connection.ping(function(err) {
        if(err) {
          logger.debug("Ping com Erros: ");
          logger.debug(err);

          connection.release();
          callback(err);       
        } else {
          logger.debug("Ping Realizado com Sucesso");

          connection.release();
          callback();
        }
      });
    }
  });
}
