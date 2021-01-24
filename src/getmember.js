const connection = require("../config");

var data = [];

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

  var query = connection.query(`SELECT 
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
  ;`);
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
      //   processRow(row, function () {
      //     connection.resume();
      //   });
      data.push(row);
      connection.resume();
    })
    .on("end", function () {
      document.getElementById("loading").style.display = "none";
      // all rows have been received
      for (var i = 0; i < data.length; i++) {
        createRow(data[i]);
      }
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
      );
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
        console.log(tableData.cnt.toLocaleString());
      }
    });
  }

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

    connection.query(
      `SELECT 
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
    
    `,
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          console.log(result);
          var commoncnt = 0;

          for (var i = 0; i > result.length; i++) {
            if (
              result[i].key1 == result[i + 1].key1 ||
              result[i].key2 == result[i + 1].key2
            ) {
              commoncnt++;
            }
          }
          console.log(commoncnt);
          //    document.getElementById("cmn").innerHTML = `${commoncnt} 名`;
        }
      }
    );
  }
}

module.exports = getmember;
