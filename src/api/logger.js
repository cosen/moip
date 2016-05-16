var winston = require('winston');

winston.level = 'info';

module.exports = function (module) {
  var filename = module.id;
  return {
    info: function (data) { 
      winston.info(filename + ': ' + JSON.stringify(data)); 
    },
    debug: function(data) {
      winston.debug(filename + ': ' + JSON.stringify(data)); 
    },
    error: function(data) {
      winston.error(filename + ': ' + JSON.stringify(data)); 
    } 
  };
};
