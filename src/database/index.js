const mysql = require("mysql");
const { host, user, password, database, port } = require("../config");

class Database {
  constructor() {
    this.connection = mysql.createConnection({
      host,
      user,
      password,
      database,
      port,
      multipleStatements: true
    });
  }

  query(sql, args) {
    return new Promise((resolve, reject) => {
      this.connection.query(sql, args, (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  }
  close() {
    return new Promise((resolve, reject) => {
      this.connection.end((err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }
  beginTransaction() {
    return new Promise((resolve, reject) => {
      this.connection.beginTransaction((err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }
  rollback() {
    return new Promise((resolve, reject) => {
      this.connection.rollback((err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }
  commit() {
    return new Promise((resolve, reject) => {
      this.connection.commit((err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }
}

const db = new Database();
db.connection.connect(function (err) {
  if (err) {
    console.error("Connection error: " + err.stack);
    return;
  }

  console.log(`Connected to ${db.connection.config.host} DB successfully!`);
});
module.exports = db;
