const connection = require("../config");

//Saving To DB
function savedb3() {
  return new Promise((resolve, reject) => {
    connection.query(
      `
      INSERT INTO v_temp 

      SELECT 
      case 
        when view.customer_category = 1 then '共通会員' 
        when view.customer_category = 3 then '店舗のみ会員' 
         when view.customer_category = 2 then 'ECのみ会員' 
        else view.customer_category 
      end as 'customer_category' 
      
      ,view.customer_name as 'customer_name'  
      ,max(view.age) as 'age' 
      ,view.customer_tel  AS 'customer_tel' 
      ,view.postal_code  AS 'postal_code' 
      ,view.address as 'address'
      
      ,view.ec_payment_date as 'ec_payment_date' 
      ,view.real_payment_date as 'real_payment_date' 
      
      ,sum(view.payment_money_sum) as 'payment_money_sum' 
      ,sum(view.payment_item_cnt_sum) as 'payment_item_cnt_sum'
      
      ,sum(view.payment_money_real_sum) as 'payment_money_real_sum'
      ,sum(view.payment_item_cnt_real_sum) as 'payment_item_cnt_real_sum'
      
      ,sum(view.payment_money_ec_sum) as 'payment_money_ec_sum'
      ,sum(view.payment_item_cnt_ec_sum) as 'payment_item_cnt_ec_sum'
      
      ,view.ec_name as 'ec_name' 
      
      ,view.real_coming_cnt as 'real_coming_cnt'
      ,view.ec_coming_cnt as 'ec_coming_cnt'
      
      ,view.store_id as 'store_id' 
      ,view.store_name as 'store_name'
      ,view.mobile_e_mail as 'app'
      
      ,view.customer_category as sort_key 
      
      
      FROM 
      (
          SELECT         
              
              CASE WHEN EXISTS(select * FROM e_ec_sales WHERE e_ec_sales.customer_name = e_real_sales.customer_name AND (replace(e_ec_sales.customer_postal_code,'-','') = e_real_sales.customer_postal_code OR replace(e_ec_sales.customer_tel,'-','') = replace(e_real_sales.customer_tel1,'-','') ) ) = true THEN 1 ELSE 3 END  AS customer_category,
              
              case when e_real_sales.customer_name = '' then e_real_sales.customer_id else e_real_sales.customer_name end AS customer_name,
              CASE WHEN e_real_sales.customer_birthday = '1900-01-01' 
              THEN -2 
          ELSE TIMESTAMPDIFF(YEAR,e_real_sales.customer_birthday, CURDATE() ) 
              END AS age,
             replace(e_real_sales.customer_tel1,'-','') AS customer_tel,
             CONCAT(LEFT(e_real_sales.customer_postal_code,
                         3),
                     '-',
                     RIGHT(e_real_sales.customer_postal_code,
                         4)) AS postal_code,
             CONCAT(r_zip.ken_name,
                     r_zip.city_name) AS address,
           null as ec_payment_date,
             LEFT(e_real_sales.payment_date,
                 7) AS real_payment_date,
             SUM(e_real_sales.payment_money) AS payment_money_sum,
             SUM(e_real_sales.payment_item_cnt) AS payment_item_cnt_sum,
             SUM(e_real_sales.payment_money) AS payment_money_real_sum,
             SUM(e_real_sales.payment_item_cnt) AS payment_item_cnt_real_sum,
             0 AS payment_money_ec_sum,
             0 AS payment_item_cnt_ec_sum,
          
             null AS ec_name,
      
          sum(e_real_sales.coming_cnt) as real_coming_cnt,
              0 as ec_coming_cnt,
             
             e_real_sales.store_id,
          e_real_sales.store_name,
           case when e_real_sales.mobile_e_mail = '' then '' else '〇' end as mobile_e_mail 
           FROM
               (e_real_sales
               LEFT JOIN r_zip ON ((e_real_sales.customer_postal_code = CONVERT( r_zip.zip_key USING UTF8MB4))))
          
              
          GROUP BY 
        case when e_real_sales.customer_name = '' then e_real_sales.customer_id else e_real_sales.customer_name end ,
              CASE WHEN e_real_sales.customer_birthday = '1900-01-01' 
              THEN -2 
          ELSE TIMESTAMPDIFF(YEAR,e_real_sales.customer_birthday, CURDATE() ) 
              END ,
              e_real_sales.customer_tel1 , CONCAT(LEFT(e_real_sales.customer_postal_code,
                      3),
                  '-',
                  RIGHT(e_real_sales.customer_postal_code,
                      4)) , CONCAT(r_zip.ken_name,
                  r_zip.city_name) , LEFT(e_real_sales.payment_date,
              7) ,
          case when e_real_sales.mobile_e_mail = '' then '' else '〇' end 
              
          UNION ALL SELECT 
              
          CASE WHEN EXISTS(select * FROM e_real_sales WHERE e_ec_sales.customer_name = e_real_sales.customer_name AND ( replace(e_ec_sales.customer_postal_code,'-','') = e_real_sales.customer_postal_code OR replace(e_ec_sales.customer_tel,'-','') = replace(e_real_sales.customer_tel1,'-','') ) ) = true THEN 1 ELSE 2 END  AS customer_category,
          
          e_ec_sales.customer_name AS customer_name,
               -1 AS age,
              replace(e_ec_sales.customer_tel,'-','') AS customer_tel,
              e_ec_sales.customer_postal_code AS postal_code,
              CONCAT(r_zip.ken_name,
                      r_zip.city_name) AS address,
              DATE_FORMAT(e_ec_sales.shipping_date,
                      '%Y-%m') AS ec_payment_date,
          null AS real_payment_date,
              SUM(e_ec_sales.subtotal) AS payment_money_sum,
              SUM(e_ec_sales.quantity) AS payment_item_cnt_sum,
              0 AS payment_money_real_sum,
              0 AS payment_item_cnt_real_sum,
              SUM(e_ec_sales.subtotal) AS payment_money_ec_sum,
              SUM(e_ec_sales.quantity) AS payment_item_cnt_ec_sum,
            CASE 
              WHEN e_ec_sales.shop_name = '[F]ダイユーエイト' THEN '自社サイト' 
              WHEN e_ec_sales.shop_name = '[A]ダイユーエイト' THEN 'アマゾン' 
                      WHEN e_ec_sales.shop_name = '[R]ダイユーエイト楽天市場店' THEN '楽天'
                      WHEN e_ec_sales.shop_name = '[W]ダイユーエイト.com' THEN 'au PAY マーケット'
                      WHEN e_ec_sales.shop_name = '[Y]ダイユーエイト.com' THEN 'Yahoo!'
                      WHEN e_ec_sales.shop_name = '[Y]収納ナビ.com' THEN 'Yahoo!'
                      WHEN e_ec_sales.shop_name = '[Y]ダイユーエイト.com ヤフー店' THEN 'Yahoo!'
                      WHEN e_ec_sales.shop_name = '[ｄ]ダイユーエイト' THEN 'dショッピング'
                      ELSE e_ec_sales.shop_name 
            END 
            AS ec_name,
                  
            0 as real_coming_cnt,
            count(e_ec_sales.shipping_date) as ec_coming_cnt,
                  
            null as store_id,
            null as store_name,
            null as mobile_e_mail 
          FROM
              (e_ec_sales
              LEFT JOIN r_zip ON ((e_ec_sales.customer_postal_code = CONVERT( r_zip.zip USING UTF8MB4))))
              
              WHERE e_ec_sales.shipping_date + '' != ''
              
          GROUP BY e_ec_sales.customer_name , e_ec_sales.customer_tel , e_ec_sales.customer_postal_code , CONCAT(r_zip.ken_name,
                  r_zip.city_name) , DATE_FORMAT(e_ec_sales.shipping_date,
                  '%Y-%m')
      ) as view
      
      GROUP BY 
       view.customer_name 
      ,view.address
      ,view.ec_payment_date
      ,view.real_payment_date 
      
      ,view.ec_name 
      ,view.store_id 
      ,view.store_name 
      ,case when view.mobile_e_mail = '' then '' else '〇' end 
      
      ORDER BY 
      customer_name
      ;`,
      function (err, result) {
        if (err) {
          console.log("failed", err);
        } else {
          console.log("Vtemp inserted");
          alert("会員判定が終了致しました。");
          window.location.reload();
        }
      }
    );
  });
}

module.exports = savedb3;
