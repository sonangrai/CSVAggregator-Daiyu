const connection = require("../../config");

var failed = 0;

//Saving To DB
function savedb1(paths) {
  //Adding the paths slashes back for mysql query
  function addslashes(str) {
    return (str + "").replace(/[\\"']/g, "\\$&").replace(/\u0000/g, "\\0");
  }
  var newpath = addslashes(paths);
  // Making the array suitable for the MYSQL query
  var query = `SET GLOBAL local_infile = 1;
  SET character_set_database=sjis;

    LOAD DATA LOCAL INFILE "${newpath}" 
    INTO TABLE e_ec_sales 
    CHARACTER SET sjis 
    FIELDS TERMINATED BY ',' 
    ENCLOSED BY '"' 
    LINES TERMINATED BY '\\r\\n' 
    IGNORE 1 LINES 
    (@1,@2,@3,@4,@5,@6,@7,@8,@9,@10,@11,@12,@13,@14,@15,@16,@17,@18,@19,@20,@21,@22,@23,@24,@25,@26,@27,@28,@29,@30,@31,@32,@33,@34,@35,@36,@37,@38,@39,@40,@41,@42,@43,@44,@45,@46,@47,@48,@49,@50,@51,@52,@53,@54,@55,@56,@57,@58,@59,@60,@61,@62,@63,@64,@65,@66,@67,@68,@69,@70,@71,@72,@73,@74,@75,@76,@77,@78,@79,@80,@81,@82,@83,@84,@85)
    SET 
    order_id=@1,
    manage_id=@2,
    complaint_flg=@3,
    today_tomorrow_flg=@4,
    shop_name=@5,
    order_date=@6,
    payment_category=@7,
    payment_cnt=@8,
    payment_limit_date=@9,
    payment_date=@10,
    rebate_date=@11,
    delivery_category=@12,
    delivery_cool_category=@13,
    delivery_preferred_date=@14,
    delivery_preferred_time=@15,
    estimated_shipping_date=@16,
    settlement_date=@17,
    settlement_cancel_date=@18,
    delivery_box_cnt=@19,
    customer_name=@20,
    customer_name_kana=@21,
    customer_payment_name=@22,
    customer_postal_code=@23,
    customer_pref=@24,
    customer_city=@25,
    customer_details_address1=@26,
    customer_details_address2=@27,
    customer_company=@28,
    customer_official_position=@29,
    customer_tel=@30,
    customer_mobile_phone=@31,
    customer_fax=@32,
    customer_order_cnt=@33,
    customer_e_mail=@34,
    customer_id=@35,
    delivery_name=@36,
    delivery_name_kana=@37,
    delivery_postal_code=@38,
    delivery_pref=@39,
    delivery_city=@40,
    delivery_details_address1=@41,
    delivery_details_address2=@42,
    delivery_company=@43,
    delivery_official_position=@43,
    delivery_tel=@45,
    delivery_mobile_phone=@46,
    delivery_fax=@47,
    delivery_memo1=@48,
    delivery_memo2=@49,
    memo=@50,
    in_house_comment=@51,
    staff_comment=@52,
    subtotal=@53,
    postage=@54,
    commission=@55,
    tax=@56,
    discount=@57,
    use_point=@58,
    coupon=@59,
    total=@60,
    status=@61,
    in_house_goods_id=@62,
    sku=@63,
    goods_name=@64,
    goods_name_abbreviation=@65,
    unit_price=@66,
    quantity=@67,
    color=@68,
    size=@69,
    goods_option=@70,
    shipping_date=@71,
    trace_no=@72,
    cost_price=@73,
    purchase_order_date=@74,
    loading_date=@75,
    location_rack_no=@76,
    supplier_name=@77,
    supplier_code=@78,
    brand_name=@79,
    brand_code=@80,
    including_no=@81,
    cancel_date=@82,
    return_date=@83,
    cancel_reason=@84,
    set_goods=@85 
    ;`;

  console.log(query);
  return new Promise(function (myResolve, myReject) {
    connection.query(query, (err, result) => {
      if (err) {
        myReject(err);
      } else {
        myResolve(result);
      }
    });
  });
}

module.exports = savedb1;
