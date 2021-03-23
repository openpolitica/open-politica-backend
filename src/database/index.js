const mysql = require("mysql");
const { host, user, password, database, port } = require("../config");

const dbpool = mysql.createPool({
  host,
  user,
  password,
  database,
  port,
  multipleStatements: true,
  acquireTimeout: 30000,
  waitForConnections: true,
});

const attemptConnection = () =>
  dbpool.getConnection((err, connection) => {
    if (err) {
      console.error('Error on connection. retrying ...');
      if (process.env.NODE_ENV !== "production") console.log(err.stack);
      setTimeout(attemptConnection, 2500);
    } else {
      console.log(`Connected to ${connection.config.host} DB successfully!`);
      return connection;
    }
  });


attemptConnection();

const dbActions = {
  query: function (sql, args) {
    return new Promise((resolve, reject) => {
      dbpool.query(sql, args, (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  }
}
module.exports = dbActions;