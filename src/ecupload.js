var element = document.getElementById("ec");
var nextbtn = document.getElementById("nextbtn");
const connection = require("../config");

var fl = element.value;
if (fl == "") {
  document.getElementById("msg").innerHTML = "設定されていません。";
  //Making Next Button Disbaled
  nextbtn.href = "#";
}

nextbtn.addEventListener("click", () => {
  if (element.files[0] == null) {
    alert("File Not Chossen. Please Select File");
  }
});

function check(e) {
  //Enabling link after file select
  nextbtn.href = "preview.html";
  var f2 = element.files[0].name;

  //CSV checking validation
  var allowed_extensions = "csv";
  var file_extension = f2.split(".").pop().toLowerCase();
  if (allowed_extensions == file_extension) {
    document.getElementById("msg").innerHTML = f2;
    localStorage.setItem("file", element.files[0].path);
    return true;
  } else {
    document.getElementById("msg").innerHTML = "Only CSV are allowed";
    nextbtn.href = "#";
    return false;
  }
}

connection.query(
  `SELECT * FROM e_csv_import WHERE record_type = "ec" ORDER BY import_timestamp DESC LIMIT 5;`,
  function (err, result) {
    if (err) throw err;
    createLog(result);
  }
);

//A function that renders the log of uploads
function createLog(data) {
  var container = document.createElement("section");
  container.classList.add("list-container");
  container.id = "list-part";
  var title = document.createElement("h2");
  var titletext = document.createTextNode("登録済履歴");
  title.appendChild(titletext);

  var row = document.createElement("ul");

  data.forEach((element) => {
    var list = document.createElement("li");
    var fname = document.createElement("span");
    var ftime = document.createElement("span");
    var listins = document.createElement("div");
    fname.appendChild(document.createTextNode(element.file_name));
    ftime.appendChild(
      document.createTextNode(formatDate(element.import_timestamp))
    );
    listins.appendChild(fname);
    listins.appendChild(ftime);
    list.appendChild(listins);
    row.appendChild(list);
  });

  container.appendChild(title);
  container.appendChild(row);
  document.body.appendChild(container);
}

//Date Formating
function formatDate(date) {
  var d = new Date(date),
    month = "" + (d.getMonth() + 1),
    day = "" + d.getDate(),
    year = d.getFullYear(),
    hour = d.getHours(),
    minute = d.getMinutes(),
    second = d.getSeconds();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  var finaldate =
    [year, month, day].join("-") + " " + [hour, minute, second].join(":");

  return finaldate;
}
