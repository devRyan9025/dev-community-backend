const pool = require('./connect');

module.exports.query = (sql, params) => {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, conn) => {
      if (err) return reject(err);

      conn.query(sql, params, (err, results) => {
        conn.release();
        if (err) return reject(err);
        resolve(results);
      });
    });
  });
};
