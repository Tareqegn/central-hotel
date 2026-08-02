const http = require("http");

function testPage(path) {
  return new Promise((resolve) => {
    const start = Date.now();
    const req = http.get(`http://localhost:3000${path}`, (res) => {
      let body = "";
      res.on("data", (d) => (body += d));
      res.on("end", () => {
        const ms = Date.now() - start;
        console.log(`${res.statusCode} ${path} (${ms}ms) ${res.statusCode === 200 ? 'OK' : 'FAIL'}`);
        resolve();
      });
    });
    req.on("error", (e) => { console.log(`ERROR ${path}: ${e.message}`); resolve(); });
    req.setTimeout(60000, () => { console.log(`TIMEOUT ${path}`); req.destroy(); resolve(); });
  });
}

(async () => {
  for (const path of [
    "/services/taxi?room=101",
    "/services/laundry?room=101",
    "/services/checkout?room=101",
    "/services/feedback?room=101",
  ]) {
    await testPage(path);
  }
  process.exit(0);
})();
