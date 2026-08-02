const http = require("http");
http.get("http://localhost:3000/?room=101", (res) => {
  let body = "";
  res.on("data", (d) => (body += d));
  res.on("end", () => {
    console.log("Status:", res.statusCode);
    console.log(body.substring(0, 2000));
    process.exit(0);
  });
}).on("error", (e) => {
  console.log("ERROR:", e.message);
  process.exit(1);
});
