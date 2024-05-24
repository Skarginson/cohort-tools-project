const { handleNotFound } = require("../utils");

function catchAll(_, res) {
  handleNotFound(res);
}

function errorHandler(err, req, res, next) {
  console.error(err);

  if (res.headersSend) {
    return;
  }

  if (err.message.includes("validation")) {
    res.status(400).json({ message: err.message });
  } else {
    res.status(500).json({ message: "Internal Server Error" });
  }
}

module.exports = { catchAll, errorHandler };
