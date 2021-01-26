const connection = require("../../config");

//Saving To DB
function savedb2(paths) {
  //Adding the paths slashes back for mysql query
  function addslashes(str) {
    return (str + "").replace(/[\\"']/g, "\\$&").replace(/\u0000/g, "\\0");
  }
  var newpath = addslashes(paths);
  //Using Daiyu
  var query = `SET GLOBAL local_infile = 1;
  SET character_set_database=sjis;

    LOAD DATA LOCAL INFILE "${newpath}" 
    INTO TABLE e_real_sales 
    CHARACTER SET sjis
    FIELDS TERMINATED BY ',' 
    LINES TERMINATED BY '\\r\\n' 
    IGNORE 1 LINES 
    (@1,@2,@3,@4,@5,@6,@7,@8,@9,@10,@11,@12,@13)
    SET 
    customer_id=replace(replace(@1,' ',''),'　','') 
    ,customer_name=replace(replace(@2,' ',''),'　','') 
    ,customer_name_kana=replace(replace(@3,' ',''),'　','') 
    ,customer_postal_code=replace(replace(@4,' ',''),'　','') 
    ,customer_address1=replace(replace(@5,' ',''),'　','') 
    ,customer_tel1=replace(replace(@6,' ',''),'　','') 
    ,customer_birthday=replace(replace(@7,' ',''),'　','') 
    ,store_id=replace(replace(@8,' ',''),'　','') 
    ,payment_date=replace(replace(@9,' ',''),'　','') 
    ,payment_money=replace(replace(@10,' ',''),'　','') 
    ,payment_item_cnt=replace(replace(@11,' ',''),'　','') 
    ,coming_cnt=replace(replace(@12,' ',''),'　','') 
    ,mobile_e_mail=replace(replace(@13,' ',''),'　','') 
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

module.exports = savedb2;
