const connection = require("../config");
const getmember = require("./getmember");
const getmoney = require("./getmoney");
const getitem = require("./getitem");
const iconv = require("iconv-lite");

const Clusterize = require('clusterize.js');

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
    address = "address = address or address is null ";
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
  ,ifnull(GROUP_CONCAT(DISTINCT v_temp.ec_payment_date SEPARATOR ','),"") as 'ec_payment_date'
  ,ifnull(GROUP_CONCAT(DISTINCT v_temp.real_payment_date SEPARATOR ','),"") as 'real_payment_date'
  ,sum(v_temp.payment_money_sum) as 'payment_money_sum'
  ,sum(v_temp.payment_item_cnt_sum) as 'payment_item_cnt_sum'
  ,sum(v_temp.payment_money_real_sum) as 'payment_money_real_sum'
  ,sum(v_temp.payment_item_cnt_real_sum) as 'payment_item_cnt_real_sum'
  ,sum(v_temp.payment_money_ec_sum) as 'payment_money_ec_sum'
  ,sum(v_temp.payment_item_cnt_ec_sum) as 'payment_item_cnt_ec_sum'
  ,ifnull(GROUP_CONCAT(DISTINCT v_temp.ec_name SEPARATOR ','),"") as 'ec_name'
  ,sum(v_temp.real_coming_cnt) as 'real_coming_cnt'
  ,sum(v_temp.ec_coming_cnt) as 'ec_coming_cnt'
  ,ifnull(GROUP_CONCAT(DISTINCT v_temp.store_id SEPARATOR ','),"") as 'store_id'
  ,ifnull(GROUP_CONCAT(DISTINCT v_temp.store_name SEPARATOR ','),"") as 'store_name'
  ,ifnull(max(v_temp.app),"") as 'app'
  
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

//  console.log("get_data_sql:" + query);


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
        var cl =[];
        for (var i = 0; i < data.length; i++) {
//          console.log("i:" + i + "/" + data.length);
          cl[i] = createTable(data[i]);
          //          createTable(data[i]);
        }

//        console.log("temp1=" + cl[1]);

//        console.log("temp2="+cl);
//        console.log("temp3="+cl);

/*
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
*/

        // Cluster
        var data_t = [];

        for (let i = 0; i < cl.length; i++){
//          data_t[i] = "<tr>" + cl[i] + "</tr>";
          data_t[i] =  cl[i];
        }


        // JavaScript
        var lorem = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.Lorem ipsum dolor sit amet.';

        var $scroll = $('#scrollArea');
        var $content = $('#contentArea');
        var $headers = $("#headersArea");

        /**
         * Makes header columns equal width to content columns
         */
        var fitHeaderColumns = (function() {
          var prevWidth = [];
          return function() {
            var $firstRow = $content.find('tr:not(.clusterize-extra-row):first');
            var columnsWidth = [];
            $firstRow.children().each(function() {
              columnsWidth.push($(this).width());
            });
            if (columnsWidth.toString() == prevWidth.toString()) return;
            $headers.find('tr').children().each(function(i) {
              $(this).width(columnsWidth[i]);
            });
            prevWidth = columnsWidth;
          }
        })();

        /**
         * Keep header equal width to tbody
         */
        var setHeaderWidth = function() {
          $headers.width($content.width());
        }

        /**
         * Set left offset to header to keep equal horizontal scroll position
         */
        var setHeaderLeftMargin = function(scrollLeft) {
          $headers.css('margin-left', -scrollLeft);
        }

        var clusterize = new Clusterize({
          rows: data_t,
          scrollId: 'scrollArea',
          contentId: 'contentArea',
          callbacks: {
            clusterChanged: function() {
              fitHeaderColumns();
              setHeaderWidth();
            }
          }
        });

        var debounce = function(fn, interval) {
          var timer
          return function() {
            clearTimeout(timer)
            timer = setTimeout(function() {
              fn()
            }, interval)
          }
        }

        /**
         * Update header columns width on window resize
         */
        $(window).resize(debounce(fitHeaderColumns, 150));

        /**
         * Update header left offset on scroll
         */
        $scroll.on('scroll', (function() {
          var prevScrollLeft = 0;
          return function() {
            var scrollLeft = $(this).scrollLeft();
            if (scrollLeft == prevScrollLeft) return;
            prevScrollLeft = scrollLeft;

            setHeaderLeftMargin(scrollLeft);
          }
        }()));




/*
        var clusterize = new Clusterize({
          rows: data_t,
          scrollId: 'scrollArea',
          contentId: 'contentArea',
        });
*/

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
    
    /*
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
*/
    
    var row = "<tr>";

    row = row + "<td id='td'>" + tableData.customer_category + "</td>";
    row = row + "<td id='td'>" + tableData.customer_name + "</td>";
    row = row + "<td id='td' class='numtd'>" + tableData.age + "</td>";
    row = row + "<td id='td' class='numtd'>" + tableData.customer_tel + "</td>";
    row = row + "<td id='td' class='numtd'>" + tableData.postal_code + "</td>";
    row = row + "<td id='td'>" + tableData.address + "</td>";
    row = row + "<td id='td'>" + tableData.ec_payment_date + "</td>";
    row = row + "<td id='td'>" + tableData.real_payment_date + "</td>";
    row = row + "<td id='td'>" + tableData.payment_money_sum + "</td>";
    row = row + "<td id='td' class='numtd'>" +
          tableData.payment_item_cnt_sum.toLocaleString() +
          "</td>";
    row = row + "<td id='td' class='numtd'>" +
          tableData.payment_money_real_sum.toLocaleString() +
          "</td>";
    row = row + 
        "<td id='td' class='numtd'>" +
          tableData.payment_item_cnt_real_sum.toLocaleString() +
          "</td>"

    row = row + 
        "<td id='td' class='numtd'>" +
          tableData.payment_money_ec_sum.toLocaleString() +
          "</td>"

    row = row + 
        "<td id='td' class='numtd'>" +
          tableData.payment_item_cnt_ec_sum +
          "</td>"

    row = row + "<td id='td' class='numtd'>" + tableData.ec_name + "</td>";
    row = row + "<td id='td'>" + tableData.real_coming_cnt.toLocaleString() + "</td>";
    row = row + "<td id='td'>" + tableData.ec_coming_cnt.toLocaleString() + "</td>";

    row = row + "<td id='td'>" + tableData.store_id + "</td>";
    row = row + "<td id='td'>" + tableData.store_name + "</td>";
    row = row + "<td id='td'>" + tableData.app + "</td>";

    ret = row;

    return ret;
  }
}

//Generate the csv
document.getElementById("csv_exp").addEventListener("click", () => {
  //Loading screen invoke
  document.getElementById("loading").innerHTML = "CSVを作成しています。";
  document.getElementById("loading").style.display = "flex";

  var items = [];

  items.push({
    customer_category:"会員種別"
    ,customer_name:"名前"
    ,age:"年齢"
    ,customer_tel:"電話番号"
    ,postal_code:"郵便番号"
    ,address:"エリア"
    ,ec_payment_date:"EC購入月"
    ,real_payment_date:"店舗購入月"
    ,payment_money_sum:"購入金額(合計)"
    ,payment_item_cnt_sum:"購入点数(合計)"
    ,payment_money_real_sum:"購入金額(店舗)"
    ,payment_item_cnt_real_sum:"購入点数(店舗)"
    ,payment_money_ec_sum:"購入金額(EC)"
    ,payment_item_cnt_ec_sum:"購入点数(EC)"
    ,ec_name:"EC店舗名"
    ,real_coming_cnt:"来店回数"
    ,ec_coming_cnt:"ECの購入回数"
    ,store_id:"店コード"
    ,store_name:"店舗名称"
    ,app:"アプリ会員"
  });

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
  element.setAttribute("download", "顧客情報CSV.csv");
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
