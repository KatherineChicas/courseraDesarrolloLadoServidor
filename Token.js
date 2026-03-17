const mongoose = require("mongoose");

const TokenSchema = new mongoose.Schema({
  _userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
    expires: 3600, // El token expira en 1 hora (3600 segundos)
  },
});

module.exports = mongoose.model("Token", TokenSchema);
