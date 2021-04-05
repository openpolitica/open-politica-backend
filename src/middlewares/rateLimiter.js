//Rate limiter based on express-rate-limit to prevent DDoS attack
//based on https://blog.logrocket.com/rate-limiting-node-js/

const rateLimit = require("express-rate-limit");

const rateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 1000,
  message: "Has excedido la máxima cantidad de peticiones por segundo",
  headers: true,
});

module.exports = rateLimiter;
