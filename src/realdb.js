const connection = require("../config");

var failed = 0;

//Saving To DB
function savedb2(row) {
  // Making the array suitable for the MYSQL query
  var result = row.reduce(function (cl, a, currIndex, arr) {
    return (
      cl +
      (currIndex == 0 ? "" : ",") +
      "'" +
      a +
      "'" +
      (currIndex == arr.length - 1 ? ")" : "")
    );
  }, "(");

  connection.query(
    `INSERT INTO e_real_sales (
          customer_id,
          customer_name,
          customer_name_kana,
          customer_postal_code,
          customer_address1,
          customer_tel1,
          customer_birthday,
          store_id,
          payment_date,
          payment_money,
          payment_item_cnt,
          coming_cnt,
          mobile_e_mail
          )
          VALUES
           ${result}`,
    function (err, result) {
      if (err) {
        failed = failed + 1;
      }
    }
  );
  return failed;
}

module.exports = savedb2;
