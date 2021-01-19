const connection = require("../../config");

var failed = 0;

//Saving To DB
function savedb1(row) {
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
    `INSERT INTO e_ec_sales (
          order_id,
          manage_id,
          complaint_flg,
          today_tomorrow_flg,
          shop_name,
          order_date,
          payment_category,
          payment_cnt,
          payment_limit_date,
          payment_date,
          rebate_date,
          delivery_category,
          delivery_cool_category,
          delivery_preferred_date,
          delivery_preferred_time,
          estimated_shipping_date,
          settlement_date,
          settlement_cancel_date,
          delivery_box_cnt,
          customer_name,
          customer_name_kana,
          customer_payment_name,
          customer_postal_code,
          customer_pref,
          customer_city,
          customer_details_address1,
          customer_details_address2,
          customer_company,
          customer_official_position,
          customer_tel,
          customer_mobile_phone,
          customer_fax,
          customer_order_cnt,
          customer_e_mail,
          customer_id,
          delivery_name,
          delivery_name_kana,
          delivery_postal_code,
          delivery_pref,
          delivery_city,
          delivery_details_address1,
          delivery_details_address2,
          delivery_company,
          delivery_official_position,
          delivery_tel,
          delivery_mobile_phone,
          delivery_fax,
          delivery_memo1,
          delivery_memo2,
          memo,
          in_house_comment,
          staff_comment,
          subtotal,
          postage,
          commission,
          tax,
          discount,
          use_point,
          coupon,
          total,
          status,
          in_house_goods_id,
          sku,
          goods_name,
          goods_name_abbreviation,
          unit_price,
          quantity,
          color,
          size,
          goods_option,
          shipping_date,
          trace_no,
          cost_price,
          purchase_order_date,
          loading_date,
          location_rack_no,
          supplier_name,
          supplier_code,
          brand_name,
          brand_code,
          including_no,
          cancel_date,
          return_date,
          cancel_reason,
          set_goods
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

module.exports = savedb1;
