const mysql = require('mysql');
const dbConfig = require('../config/db_config');

const pool = mysql.createPool({
  connectionLimit: 10,
  ...dbConfig,
});

module.exports = pool;
