var mysql = require("mysql");

//mysql connection setup
var connection = mysql.createConnection({
  host: "localhost",
  port: "3306",
  user: "root",
  password: "root",
  database: "db_aggregator",
  multipleStatements: true,
});

module.exports = connection;
