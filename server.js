const http = require("http");
const path = require("path");
const fs = require("fs");
const requestToService = require("./service-requests").requestToService;


const server = http.createServer((req, res) => {

  if (req.method === "POST" && req.url === "/") {

    const serviceName = req.headers["service-name"];
    const chunks = [];
    req.on('data', (data) => {
      chunks.push(data);
    });
    req.on('end', () => {
      const data = Buffer.concat(chunks);

      requestToService(serviceName, data).then((text) => {
        res.writeHead(200, {
          "Content-type": "text/plain",
        })
        res.end(text);
      })
    })

  } else if (req.method === "GET") {

    const filePath = path.join(__dirname, "public", (req.url === "/") ? "index.html" : req.url);
    let ext = path.extname(filePath);
    let contentType = "text/html";

    switch (ext) {
      case '.css':
        contentType = "text/css";
        break;
      case '.js':
        contentType = "text/js";
        break
      case '.svg':
        contentType = "image/svg+xml";
        break;
      default:
        contentType = "text/html";
        break;
    }

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end("Error: response cannot be sent");
      } else {
        res.writeHead(200, {
          "Content-type": contentType,
        })
        res.end(data);
      }
    })
  }

});



const PORT = process.env.port || 3000;

server.listen(PORT, (error) => {
  if (error) {
    console.log("Error: Server is not started");
  } else {
    console.log("Server has been started...");
  }
});