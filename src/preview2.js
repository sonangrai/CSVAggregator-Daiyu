const fs = require("fs");
const iconv = require("iconv-lite");
const savedb2 = require("./common/realdb");
const filelog = require("./common/csvlog");

//Shift to UTF
var paths = localStorage.getItem("file");

//Shift to UTF8 for table creation
readFile(paths);
function readFile(path) {
  fs.readFile(path, function (error, text) {
    if (error != null) {
      alert("error : " + error);
      return;
    }
    //Decoding
    var str = iconv.decode(text, "Shift_JIS");
    //Spliting the csv with line break
    var lines = str.split("\n");
    //Spliting lines by delimiter comma
    var result = lines.map(function (line) {
      return line.split(",");
    });
    result.pop();
    createTable(result);
  });
}

//A function that renders the table after the file is loaded
function createTable(tableData) {
  var container = document.createElement("div");
  container.classList.add("table-box");
  container.id = "tbl-part";
  var table = document.createElement("table");
  table.id = "tbl";
  var tableBody = document.createElement("tbody");

  tableData.forEach(function (rowData, i) {
    if (i <= 10) {
      var row = document.createElement("tr");

      rowData.forEach(function (cellData) {
        var cell = document.createElement("td");
        cell.appendChild(document.createTextNode(cellData));
        row.appendChild(cell);
      });

      tableBody.appendChild(row);
    }
  });

  container.appendChild(table);
  table.appendChild(tableBody);
  document.getElementById("here").appendChild(container);
}

//Saving to Database
document.getElementById("savedb").addEventListener("click", () => {
  //Loading screen invoke
  document.getElementById("model").style.display = "flex";

  //Using Daiyu
  savedb2(paths)
    .then((result) => {
      filelog("real");
      document.getElementById("model").style.display = "flex";
    })
    .catch((err) => console.log(err));
});
