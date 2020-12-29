const http = require("http");
const app = require("../../src/app.js");

require("../../src/database")();

const port = process.env.PORT || 3000;

const server = http.createServer(app);

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
