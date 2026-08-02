const http = require("http");

function testPage(path) {
  return new Promise((resolve) => {
    const start = Date.now();
    const req = http.get(`http://localhost:3000${path}`, (res) => {
      let body = "";
      res.on("data", (d) => (body += d));
      res.on("end", () => {
        const ms = Date.now() - start;
        if (res.statusCode !== 200) {
          const match = body.match(/Module not found[^<]*/);
          console.log(`${res.statusCode} ${path} (${ms}ms) ${match ? match[0] : "no match info"}`);
        } else {
          console.log(`${res.statusCode} ${path} (${ms}ms, ${body.length} bytes) OK`);
        }
        resolve();
      });
    });
    req.on("error", (e) => {
      console.log(`ERROR ${path}: ${e.message}`);
      resolve();
    });
    req.setTimeout(60000, () => {
      console.log(`TIMEOUT ${path}`);
      req.destroy();
      resolve();
    });
  });
}

(async () => {
  for (const path of [
    "/?room=101",
    "/services?room=101",
    "/services/food?room=101",
    "/confirmation?room=101&type=food",
  ]) {
    await testPage(path);
  }
  process.exit(0);
})();
