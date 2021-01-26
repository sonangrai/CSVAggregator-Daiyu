const path = require("path");
var $ = require("jquery");
const connection = require("../config");
const getdata = require("./getdata");
const savedb3 = require("./common/tempdb");
const deletetmp = require("./deletetmp");
require("datatables.net-dt")(window, $);
require("datatables.net-buttons-dt")(window, $);
require("datatables.net-buttons/js/buttons.flash.js")(window, $);
require("jszip");
require("datatables.net-buttons/js/buttons.html5.js")(window, $);

var click_cnt = 0;

//Cheking emptiness of the table
var ec_datas_row;
var real_datas_row;

function getec() {
  document.getElementById("loading").innerHTML =
    "データベースのデータをチェックしています。しばらくお待ちください。";
  document.getElementById("loading").style.display = "flex";
  return new Promise(function (myResolve, myReject) {
    connection.query(`SELECT * FROM e_ec_sales LIMIT 1`, (err, result) => {
      if (err) {
        myReject(err);
      } else {
        myResolve(result);
      }
    });
  });
}
getec().then((result) => {
  ec_datas_row = result;
  console.log("ec data " + ec_datas_row.length);
  if (result.length == 0) {
    document.getElementById("checkbox").style.display = "block";
    document.getElementById("checkec").style.display = "block";
  }
});

function getreal() {
  return new Promise(function (myResolve, myReject) {
    connection.query(`SELECT * FROM e_real_sales LIMIT 1`, (err, result) => {
      if (err) {
        myReject(err);
      } else {
        myResolve(result);
      }
    });
  });
}
getreal().then((result) => {
  real_datas_row = result;
  console.log("real data " + real_datas_row.length);
  if (result.length == 0) {
    document.getElementById("checkbox").style.display = "block";
    document.getElementById("checkrl").style.display = "block";
  }
  document.getElementById("loading").innerHTML = "読み込み中です...";
  document.getElementById("loading").style.display = "none";
});

//EC_Del CLick
document.getElementById("ec_del").addEventListener("click", () => {
  click_cnt = 0;
  document.getElementById("msg_check").checked = false;
  document.getElementById("msg_del").className = "msgbtn_del_loc";
  document.getElementById("msg_title").innerHTML =
    "ECのCSV会員データを全て削除します";
  document.getElementById("msg_massage").innerHTML =
    "一度削除すると元に戻せません。";
  document.getElementById("conformradio").innerHTML =
    "CSV会員データを全て削除します";
  document.getElementById("msg_del").innerHTML = "削除する";
  document.getElementById("msg").style.display = "flex";
  document.getElementById("msg_del").dataset.type = "ec";
});

//Real_Del CLick
document.getElementById("vc_del").addEventListener("click", () => {
  click_cnt = 0;
  document.getElementById("msg_check").checked = false;
  document.getElementById("msg_del").className = "msgbtn_del_loc";
  document.getElementById("msg_title").innerHTML =
    "店舗のCSV会員データを全て削除します";
  document.getElementById("msg_massage").innerHTML =
    "一度削除すると元に戻せません。";
  document.getElementById("conformradio").innerHTML =
    "CSV会員データを全て削除します";
  document.getElementById("msg_del").innerHTML = "削除する";
  document.getElementById("msg").style.display = "flex";
  document.getElementById("msg_del").dataset.type = "real";
});

//Msg_Cancel CLick
document.getElementById("msg_del").disabled = true;
document.getElementById("msg_check").addEventListener("change", () => {
  click_cnt++;
  if (click_cnt % 2 != 0) {
    document.getElementById("msg_del").className = "msgbtn_del";
    document.getElementById("msg_del").disabled = false;
  } else {
    document.getElementById("msg_del").className = "msgbtn_del_loc";
    document.getElementById("msg_del").disabled = true;
  }
});

//Msg_Check CLick
document.getElementById("msg_cancel").addEventListener("click", () => {
  document.getElementById("msg").style.display = "none";
  click_cnt = 0;
});

//Temp Save Click
var sv_click = 0;
document.getElementById("process").addEventListener("click", () => {
  sv_click++;
  //Calling Model
  document.getElementById("msg_check").checked = false;
  document.getElementById("msg_del").className = "msgbtn_del_loc";
  document.getElementById("msg_title").innerHTML = "会員判定の処理を実施します";
  document.getElementById("msg_massage").innerHTML =
    "一度実施すると元に戻せません。<br> ※処理中は、画面操作ができません。";
  document.getElementById("conformradio").innerHTML =
    "会員判定の処理を実施します。";
  document.getElementById("msg_del").innerHTML = "実施する";
  document.getElementById("msg").style.display = "flex";
  document.getElementById("msg_del").dataset.type = "v_temp";
});

//Delete Data CSV
document.getElementById("msg_del").addEventListener("click", () => {
  var tp = document.getElementById("msg_del").dataset.type;
  if (tp === "ec") {
    //Checking tbl
    connection.query(
      `SELECT * FROM e_ec_sales LIMIT 1`,
      function (err, result) {
        if (err) {
          console.log(err);
        } else {
          if (result.length > 0) {
            document.getElementById("loading").innerHTML =
              "CSVデーターを削除しています。";
            document.getElementById("loading").style.display = "flex";
            var query = connection.query(`TRUNCATE TABLE e_ec_sales`);
            query
              .on("error", function (err) {
                // Handle error, an 'end' event will be emitted after this as well
                console.log(err);
              })
              .on("fields", function (fields) {
                // the field packets for the rows to follow
              })
              .on("result", function (row) {
                // Pausing the connnection is useful if your processing involves I/O
                connection.pause();
                connection.resume();
              })
              .on("end", function () {
                document.getElementById("msg").style.display = "none";
                document.getElementById("loading").style.display = "none";
                alert("ECのCSVデータを削除致しました。");
                window.location.reload();
              });
          } else {
            alert("ECのCSVデータは0件です。");
            window.location.reload();
          }
        }
      }
    );
  } else if (tp === "real") {
    //Checking tbl
    connection.query(
      `SELECT * FROM e_real_sales LIMIT 1`,
      function (err, result) {
        if (err) {
          console.log(err);
        } else {
          if (result.length > 0) {
            document.getElementById("loading").innerHTML =
              "CSVデーターを削除しています。";
            document.getElementById("loading").style.display = "flex";
            var query = connection.query(`TRUNCATE TABLE e_real_sales`);
            query
              .on("error", function (err) {
                // Handle error, an 'end' event will be emitted after this as well
                console.log(err);
              })
              .on("fields", function (fields) {
                // the field packets for the rows to follow
              })
              .on("result", function (row) {
                // Pausing the connnection is useful if your processing involves I/O
                connection.pause();
                connection.resume();
              })
              .on("end", function () {
                document.getElementById("msg").style.display = "none";
                document.getElementById("loading").style.display = "flex";
                alert("実店舗のCSVデータを削除致しました。");
                window.location.reload();
              });
          } else {
            alert("実店舗のCSVデータは0件です。");
            window.location.reload();
          }
        }
      }
    );
  } else if (tp === "v_temp") {
    document.getElementById("loading").style.display = "flex";
    //Checking the table
    if (real_datas_row.length == 0 || ec_datas_row.length == 0) {
      alert("ECか店舗のCSVが0件です。双方のデータを登録して下さい。");
      window.location.reload();
    } else {
      //First Delete Previous Data
      deletetmp();

      //Removing Whitespace
      new Promise((resolve, reject) => {
        connection.query(
          `UPDATE e_real_sales SET customer_name = replace(replace(e_real_sales.customer_name,' ',''),'　','');
          UPDATE e_ec_sales SET customer_name = replace(replace(e_ec_sales.customer_name,' ',''),'　','');`,
          function (err, result) {
            if (err) {
              console.log(err);
            } else {
              console.log("inserting");
              //Save new Data
              savedb3();
            }
          }
        );
      });
    }
  }
});

//EC CLick
document.getElementById("ec").addEventListener("click", () => {
  const upload = path.join("file://" + __dirname + "/ecupload.html");
  window.location.href = upload;
});

//Real CLick
document.getElementById("vc").addEventListener("click", () => {
  const upload = path.join("file://" + __dirname + "/reupload.html");
  window.location.href = upload;
});

//Get Data click
document.getElementById("getdata").addEventListener("click", (e) => {
  e.preventDefault();
  var a = $("form").serializeArray();
  var from;
  var to;
  var type = [];
  var age1;
  var age2;
  var age3;
  var address1;
  var address2;
  var address3;
  var store_name1;
  var store_name2;
  var store_name3;
  a.forEach((data) => {
    if (data.name === "from") {
      from = data.value;
    } else if (data.name === "to") {
      to = data.value;
    } else if (data.name === "customer_category") {
      type.push(data.value);
    } else if (data.name === "age1") {
      age1 = data.value;
    } else if (data.name === "age2") {
      age2 = data.value;
    } else if (data.name === "age3") {
      age3 = data.value;
    } else if (data.name === "address1") {
      address1 = data.value;
    } else if (data.name === "address2") {
      address2 = data.value;
    } else if (data.name === "address3") {
      address3 = data.value;
    } else if (data.name === "store_name1") {
      store_name1 = data.value;
    } else if (data.name === "store_name2") {
      store_name2 = data.value;
    } else if (data.name === "store_name3") {
      store_name3 = data.value;
    }
  });
  getdata(
    from,
    to,
    type,
    age1,
    age2,
    age3,
    address1,
    address2,
    address3,
    store_name1,
    store_name2,
    store_name3
  );
  $("#refresh").css("display", "inline-block");
  document.getElementById("getdata").style.display = "none";
});
