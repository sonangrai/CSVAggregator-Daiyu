const connection = require("../config");

//Saving To DB
function deletetmp() {
  return new Promise((resolve, reject) => {
    connection.query(`TRUNCATE TABLE v_temp;`, function (err, result) {
      if (err) {
        console.log("Error, Maybe table was empty");
      } else {
        console.log("Old Vtemp data deleted");
      }
    });
  });
}

module.exports = deletetmp;
