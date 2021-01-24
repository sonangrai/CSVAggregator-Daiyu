const connection = require("../config");

var data = [];
var data2 = [];
var common_first = 0;
var cnt = 0;

//Saving To DB
function getmember(
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

  $("#member #loading-item").css("display", "flex");

  //Function Common counter
  function commoncnt(
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

    var query2 = `SELECT 
      customer_category
      ,customer_name
      ,GROUP_CONCAT(DISTINCT v_temp.customer_tel SEPARATOR ',') as 'customer_tel' 
      ,postal_code
      
      ,CONCAT (customer_name , GROUP_CONCAT(DISTINCT v_temp.customer_tel SEPARATOR ',')) as key1 
      ,CONCAT (customer_name , postal_code) as key2 
      
      FROM db_aggregator.v_temp 
      
      WHERE 
      customer_category = '共通会員'
      
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
      customer_category
      ,customer_name
      ,postal_code
      ,CONCAT (customer_name , postal_code)
      
      ORDER BY 
      sort_key
      ,customer_name
      
      `;

    return new Promise((resolve, reject) => {
      connection.query(query2, function (err, result2) {
        if (err) {
          reject(err);
        } else {
          //         console.log("sql=" +　query2);

          /*
                    for (let i = 0; i < result2.length; i++) {
                      data2.push(result2[i]);
                      console.log("i=" + i);
                    }
            */

          //        console.log("result2[0].key1 = " + result2[0].key1);

          console.log(result2);
          if (result2.length != 0) {
            common_first = result2;
          }

          var i2_n = 0;
          for (let i2 = 0; i2 < result2.length - 1; i2++) {
            i2_n = i2 + 1;
            //          console.log("i2=" + i2);
            //          console.log("i2_n=" + i2_n);
            if (
              result2[i2].key1 == result2[i2_n].key1 ||
              result2[i2].key2 == result2[i2_n].key2
            ) {
              cnt++;
            }
          }

          //        console.log("result[i].key1=" + result[i].key1);
          resolve(cnt);
        }
      });
    });
  }

  var query = connection.query(
    `SELECT 
    view.customer_category 
    ,count(0) as cnt 

    FROM 
    (
      SELECT 
      customer_category 
      ,customer_name 
      ,GROUP_CONCAT(DISTINCT v_temp.customer_tel SEPARATOR ',') as 'customer_tel' 
      ,postal_code 

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
      customer_category 
      ,customer_name 
      ,postal_code 

    ) as view 

    GROUP BY 
    view.customer_category 
  ;`
  );
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
      data.push(row);
      connection.resume();
    })
    .on("end", function () {
      document.getElementById("loading").style.display = "none";

      var edit_cnt = 0;

      commoncnt(
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
      )
        .then((cnt) => {
          console.log("cnt = " + cnt + "Common First = " + common_first);
          edit_cnt = common_first - cnt;
          document.getElementById("cmn").innerHTML = `${edit_cnt} 名`;
        })
        .catch((err) => {
          alert(err);
        });

      // all rows have been received
      for (var i = 0; i < data.length; i++) {
        createRow(data[i]);
      }

      var sum = 0;
      $(".member_cnt").each(function () {
        sum += parseFloat($(this).text().replace(/\D/g, "")); // Or this.innerHTML, this.innerText
      });
      $("#member_total").append(
        $("<div></div>").text(sum.toLocaleString() + " 名")
      );
      $("#member #loading-item").css("display", "none");
    });

  //A function that renders the value
  function createRow(tableData) {
    $("#member  .res").each(function () {
      var ht = $(this).find("span").html();
      if (ht === tableData.customer_category) {
        $(this)
          .find(".member_cnt")
          .html(tableData.cnt.toLocaleString() + " 名");
      }
    });
  }
}
module.exports = getmember;
