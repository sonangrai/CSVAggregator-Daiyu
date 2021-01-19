const fs = require("fs");
const iconv = require("iconv-lite");
const savedb2 = require("./common/realdb");
var csv = require("csv");
var path = require("path");
const filelog = require("./common/csvlog");

//Shift to UTF
var paths = localStorage.getItem("file");
var filename = paths.replace(/^.*[\\\/]/, "");
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
  var container = document.createElement("section");
  container.classList.add("table-container");
  container.id = "tbl-part";
  var title = document.createElement("h2");
  var titletext = document.createTextNode("登録する情報を確認してください。");
  title.appendChild(titletext);
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
  document.body.appendChild(container);

  var getbl = document.getElementById("tbl-part");
  var getbl2 = document.getElementById("tbl");
  getbl.insertBefore(title, getbl2);
}

//Saving to Database
document.getElementById("savedb").addEventListener("click", () => {
  //Loading screen invoke
  document.getElementById("model").style.display = "flex";
  //Creating new csv
  var ws = fs.createWriteStream("new" + filename); //出力ファイル名は new+元ファイル名

  // For Production
  const newfilepath = path.join(__dirname, "../../../") + "\\new" + filename;
  // For Development
  //const newfilepath = path.join(__dirname, "..") + "\\new" + filename;

  var parser = csv
    .parse({ trim: true }, function (err, data) {
      //For Row
      for (var i = 0; i < data.length; i++) {
        var outdata = "";
        //FOr Column
        for (var j = 0; j < data[i].length; j++) {
          //outdata = outdata + data[i][j].replace(/,/g, "");
          outdata =
            outdata +
            data[i][j]
              .replace(/(?:\r\n|\r|\n)/g, "")
              .replace(/,/g, "")
              .replace(/['"]+/g, "");
          if (j + 1 == data[i].length) {
            outdata = outdata + "\n";
          } else {
            outdata = outdata + ",";
          }
        }
        ws.write(outdata);
      }
    })
    .on("end", () => {
      ws.end();
      const stream = fs
        .createReadStream(newfilepath)
        .pipe(
          csv.parse({ delimiter: ",", from_line: 2, trim: true, bom: true })
        );

      let count = 0; // 読み込み回数
      let total = 0; // 合計byte数
      var ret; // Gets error Count

      stream.on("readable", () => {
        let chunk;
        while ((chunk = stream.read()) !== null) {
          count++;
          total += chunk.length;
          //Spliting lines by delimiter comma
          var result = chunk.toString("utf-8").split(",");
          ret = savedb2(result);
        }
      });

      stream.on("end", () => {
        console.log(`${count} Obtained in divided times`);
        console.log(`I got a total of ${total} bytes`);
        fs.unlinkSync(newfilepath);
        filelog("real");
      });
    });

  fs.createReadStream(paths)
    .pipe(iconv.decodeStream("SJIS"))
    .pipe(iconv.encodeStream("UTF-8"))
    .pipe(parser);
});
