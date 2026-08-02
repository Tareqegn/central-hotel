const http = require("http");

const pages = [
  "/?room=101",
  "/services?room=101",
  "/services/food?room=101",
  "/services/taxi?room=101",
  "/services/laundry?room=101",
  "/services/checkout?room=101",
  "/services/feedback?room=101",
  "/confirmation?room=101&type=food",
];

let done = 0;
pages.forEach((path) => {
  const start = Date.now();
  http.get(`http://localhost:3000${path}`, (res) => {
    let body = "";
    res.on("data", (d) => (body += d));
    res.on("end", () => {
      const ms = Date.now() - start;
      console.log(`${res.statusCode} ${path} (${ms}ms, ${body.length} bytes)`);
      done++;
      if (done === pages.length) process.exit(0);
    });
  }).on("error", (e) => {
    console.log(`ERROR ${path}: ${e.message}`);
    done++;
    if (done === pages.length) process.exit(1);
  });
});
