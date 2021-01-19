const connection = require("../config");
const getmember = require("./getmember");
const getmoney = require("./getmoney");
const getitem = require("./getitem");
const iconv = require("iconv-lite");

var data = [];

//Saving To DB
function getdata(
  from,
  to,
  type,
  age1,
  age2,
  age3,
  address1,
  address2,
  address3,
  ec_name1,
  ec_name2,
  ec_name3
) {
  //customer_cotegory
  var ask;
  if (
    type.indexOf("common") > -1 &&
    type.indexOf("real") > -1 &&
    type.indexOf("ec") > -1
  ) {
    ask = "customer_category = customer_category";
  } else if (type.indexOf("common") > -1 && type.indexOf("real") > -1) {
    ask = `customer_category = '共通会員'
    OR customer_category = '店舗のみ会員'`;
  } else if (type.indexOf("real") > -1 && type.indexOf("ec") > -1) {
    ask = `customer_category = 'ECのみ会員'
    OR customer_category = '店舗のみ会員'`;
  } else if (type.indexOf("ec") > -1 && type.indexOf("common") > -1) {
    ask = `customer_category = 'ECのみ会員'
    OR customer_category = '共通会員'`;
  } else if (type.indexOf("common") > -1) {
    ask = `customer_category = '共通会員'`;
  } else if (type.indexOf("real") > -1) {
    ask = `customer_category = '店舗のみ会員'`;
  } else if (type.indexOf("ec") > -1) {
    ask = `customer_category = 'ECのみ会員'`;
  } else {
    ask = "customer_category = 'none'";
  }

  var age;
  if (age1 === "" && age2 === "" && age3 !== "") {
    age = `${age3}`;
  } else if (age1 === "" && age2 !== "" && age3 === "") {
    age = `${age2} `;
  } else if (age1 !== "" && age2 === "" && age3 === "") {
    age = `${age1} `;
  } else if (age1 === "" && age2 !== "" && age3 !== "") {
    age = `${age2} OR ${age3}`;
  } else if (age1 !== "" && age2 !== "" && age3 !== "") {
    age = `${age1} OR ${age3} `;
  } else if (age1 !== "" && age2 !== "" && age3 === "") {
    age = `${age1} OR ${age2} `;
  } else if (age1 !== "" && age2 !== "" && age3 !== "") {
    age = `${age1} OR ${age2} OR ${age3}`;
  } else {
    age = `${age1} OR ${age2} OR ${age3}`;
    age = "age = age";
  }

  var address;
  if (address1 === "" && address2 === "" && address3 !== "") {
    address = `address like '${address3}%'`;
  } else if (address1 === "" && address2 !== "" && address3 === "") {
    address = `address like '${address2}%' `;
  } else if (address1 !== "" && address2 === "" && address3 === "") {
    address = `address like '${address1}%' `;
  } else if (address1 === "" && address2 !== "" && address3 !== "") {
    address = `address like '${address2}%' OR address like '${address3}%'`;
  } else if (address1 !== "" && address2 === "" && address3 !== "") {
    address = `address like '${address1}%' OR address like  '${address3}%' `;
  } else if (address1 !== "" && address2 !== "" && address3 === "") {
    address = `address like '${address1}%' OR address like  '${address2}%' `;
  } else if (address1 !== "" && address2 !== "" && address3 !== "") {
    address = `address like '${address1}' OR address like  '${address2}' OR address like  '${address3}'`;
  } else {
    address = "address = address";
  }

  //ec name
  var ec_name;
  if (ec_name1 === "" && ec_name2 === "" && ec_name3 !== "") {
    ec_name = `ec_name = '${ec_name3}'`;
  } else if (ec_name1 === "" && ec_name2 !== "" && ec_name3 === "") {
    ec_name = `ec_name = '${ec_name2}' `;
  } else if (ec_name1 !== "" && ec_name2 === "" && ec_name3 === "") {
    ec_name = `ec_name = '${ec_name1}' `;
  } else if (ec_name1 === "" && ec_name2 !== "" && ec_name3 !== "") {
    ec_name = `ec_name = '${ec_name2}' OR ec_name = '${ec_name3}'`;
  } else if (ec_name1 !== "" && ec_name2 === "" && ec_name3 !== "") {
    ec_name = `ec_name = '${ec_name1}' OR ec_name = '${ec_name3}' `;
  } else if (ec_name1 !== "" && ec_name2 !== "" && ec_name3 === "") {
    ec_name = `ec_name = '${ec_name1}' OR  ec_name = '${ec_name2}' `;
  } else if (ec_name1 !== "" && ec_name2 !== "" && ec_name3 !== "") {
    ec_name = `ec_name = '${ec_name1}' OR ec_name = '${ec_name2}' OR ec_name = '${ec_name3}'`;
  } else {
    ec_name = "ec_name = ec_name or ec_name is null ";
  }

  //date
  var date;
  if (from <= to) {
    date = `((v_temp.ec_payment_date >= '${from}' AND v_temp.ec_payment_date <= '${to}') OR (v_temp.real_payment_date >= '${from}' AND v_temp.real_payment_date <= '${to}')) `;
  } else {
    date = `((v_temp.ec_payment_date >= '${to}' AND v_temp.ec_payment_date <= '${from}') OR (v_temp.real_payment_date >= '${to}' AND v_temp.real_payment_date <= '${from}')) `;
  }

  document.getElementById("loading").style.display = "flex";

  var query = `SELECT 
  v_temp.customer_category
  ,v_temp.customer_name
  ,case when max(v_temp.age) < 0 then 'その他(未登録)' else max(v_temp.age) end as 'age'
  ,GROUP_CONCAT(DISTINCT v_temp.customer_tel SEPARATOR ',') as 'customer_tel' 
  ,v_temp.postal_code as 'postal_code' 
  ,v_temp.address as 'address'
  ,GROUP_CONCAT(DISTINCT v_temp.ec_payment_date SEPARATOR ',') as 'ec_payment_date'
  ,GROUP_CONCAT(DISTINCT v_temp.real_payment_date SEPARATOR ',') as 'real_payment_date'
  ,sum(v_temp.payment_money_sum) as 'payment_money_sum'
  ,sum(v_temp.payment_item_cnt_sum) as 'payment_item_cnt_sum'
  ,sum(v_temp.payment_money_real_sum) as 'payment_money_real_sum'
  ,sum(v_temp.payment_item_cnt_real_sum) as 'payment_item_cnt_real_sum'
  ,sum(v_temp.payment_money_ec_sum) as 'payment_money_ec_sum'
  ,sum(v_temp.payment_item_cnt_ec_sum) as 'payment_item_cnt_ec_sum'
  ,GROUP_CONCAT(DISTINCT v_temp.ec_name SEPARATOR ',') as 'ec_name'
  ,sum(v_temp.real_coming_cnt) as 'real_coming_cnt'
  ,sum(v_temp.ec_coming_cnt) as 'ec_coming_cnt'
  ,GROUP_CONCAT(DISTINCT v_temp.store_id SEPARATOR ',') as 'store_id'
  ,GROUP_CONCAT(DISTINCT v_temp.store_name SEPARATOR ',') as 'store_name'
  ,max(v_temp.app) as 'app'
  
  FROM db_aggregator.v_temp 
  
  WHERE 
  
  (
    ${ask}
  )
  
  AND 

  (
    ${age}      
  )
  
  AND 
  
  (
    ${address}
  )
  
  AND 

  (
    ${ec_name}
  )

  AND 
  
  (
    ${date}
  )
  
  
  
  
  GROUP BY 
  
  v_temp.customer_category
  ,v_temp.customer_name 
  ,v_temp.postal_code
  ,v_temp.address 
  
  ORDER BY 
  
  v_temp.sort_key ASC 
  ,v_temp.customer_name ASC
  
  ;`;
  
  console.log("ask:" + ask);
  console.log("age:" + age);
  console.log("address:" + address);
  console.log("ec_name:" + ec_name);
  console.log("date:" + date);

  new Promise((resolve, reject) => {
    connection.query(query, function (err, result) {
      if (err) {
        console.log(err);
      } else {
        for (let i = 0; i < result.length; i++) {
          data.push(result[i]);
        }
        document.getElementById("loading").style.display = "none";
        // all rows have been received
        for (var i = 0; i < data.length; i++) {
          console.log("i:" + i + "/" + data.length);
          createTable(data[i]);
        }
        //Replacing the " " with blank
        var x = document.querySelectorAll("#td");
        for (var i = 0; i < x.length; i++) {
          var res = x[i].innerHTML.replace("null", "");
          x[i].innerHTML = res;
        }

        //Make Data Table
        $("#data").DataTable({
          searching: false,
          info: false,
          lengthMenu: [50, 100, 300, 500, 1000],
          language: {
            lengthMenu: " _MENU_ 件表示",
            zeroRecords: "該当するデータがありません。",
            info: "Showing page _PAGE_ of _PAGES_",
            infoEmpty: "No records available",
            infoFiltered: "(filtered from _MAX_ total records)",
            oPaginate: {
              sNext: '<i class="fa fa-chevron-right"></i>',
              sPrevious: '<i class="fa fa-chevron-left"></i>',
              sFirst: '<i class="fa fa-step-backward"></i>',
              sLast: '<i class="fa fa-step-forward"></i>',
            },
          },
        });

        //Caling other queries
        getmember(
          from,
          to,
          type,
          age1,
          age2,
          age3,
          address1,
          address2,
          address3,
          ec_name1,
          ec_name2,
          ec_name3
        );
        getmoney(
          from,
          to,
          type,
          age1,
          age2,
          age3,
          address1,
          address2,
          address3,
          ec_name1,
          ec_name2,
          ec_name3
        );
        getitem(
          from,
          to,
          type,
          age1,
          age2,
          age3,
          address1,
          address2,
          address3,
          ec_name1,
          ec_name2,
          ec_name3
        );

        //Visible Export Button
        document.getElementById("csv_exp").style.display = "block";
      }
    });
  });

  //A function that renders the table after the file is loaded
  function createTable(tableData) {
    var row = $("<tr />");
    $("#testtbl").append(row);
    row.append($("<td id='td'>" + tableData.customer_category + "</td>"));
    row.append($("<td id='td'>" + tableData.customer_name + "</td>"));
    row.append($("<td id='td' class='numtd'>" + tableData.age + "</td>"));
    row.append(
      $("<td id='td' class='numtd'>" + tableData.customer_tel + "</td>")
    );
    row.append(
      $("<td id='td' class='numtd'>" + tableData.postal_code + "</td>")
    );
    row.append($("<td id='td'>" + tableData.address + "</td>"));
    row.append($("<td id='td'>" + tableData.ec_payment_date + "</td>"));
    row.append($("<td id='td'>" + tableData.real_payment_date + "</td>"));
    row.append($("<td id='td'>" + tableData.payment_money_sum + "</td>"));
    row.append(
      $(
        "<td id='td' class='numtd'>" +
          tableData.payment_item_cnt_sum.toLocaleString() +
          "</td>"
      )
    );
    row.append(
      $(
        "<td id='td' class='numtd'>" +
          tableData.payment_money_real_sum.toLocaleString() +
          "</td>"
      )
    );
    row.append(
      $(
        "<td id='td' class='numtd'>" +
          tableData.payment_item_cnt_real_sum.toLocaleString() +
          "</td>"
      )
    );
    row.append(
      $(
        "<td id='td' class='numtd'>" +
          tableData.payment_money_ec_sum.toLocaleString() +
          "</td>"
      )
    );
    row.append(
      $(
        "<td id='td' class='numtd'>" +
          tableData.payment_item_cnt_ec_sum +
          "</td>"
      )
    );
    row.append($("<td id='td' class='numtd'>" + tableData.ec_name + "</td>"));
    row.append(
      $("<td id='td'>" + tableData.real_coming_cnt.toLocaleString() + "</td>")
    );
    row.append(
      $("<td id='td'>" + tableData.ec_coming_cnt.toLocaleString() + "</td>")
    );
    row.append($("<td id='td'>" + tableData.store_id + "</td>"));
    row.append($("<td id='td'>" + tableData.store_name + "</td>"));
    row.append($("<td id='td'>" + tableData.app + "</td>"));
  }
}

//Generate the csv
document.getElementById("csv_exp").addEventListener("click", () => {
  //Loading screen invoke
  document.getElementById("loading").innerHTML = "CSVを作成しています。";
  document.getElementById("loading").style.display = "flex";

  var items = [];
  for (let i = 0; i < data.length; i++) {
    items.push(data[i]);
  }
  var sjisArray = ConvertToCSV(JSON.stringify(items));
  //var shifencoded = Encoding.convert(sjisArray, {
  //   to: "SJIS",
  // });
  var shifencoded = iconv.encode(sjisArray, "SJIS");
  var blob = new Blob([shifencoded], { type: "text/csv" });
  //Creating Download
  var element = document.createElement("a");
  element.setAttribute("href", URL.createObjectURL(blob));
  element.setAttribute("download", "newcsv.csv");
  element.style.display = "none";
  document.getElementById("loading").style.display = "none";

  element.click();
});
function ConvertToCSV(objArray) {
  var array = typeof objArray != "object" ? JSON.parse(objArray) : objArray;
  var str = "";

  for (var i = 0; i < array.length; i++) {
    var line = "";
    for (var index in array[i]) {
      if (line != "") line += ",";
      //Checking for the null value to replace with blank
      if (array[i][index] === null) array[i][index] = "";
      line += `"` + array[i][index] + `"`;
    }

    str += line + "\r\n";
  }

  return str;
}

module.exports = getdata;
