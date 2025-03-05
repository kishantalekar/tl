// server/models/CostCenter.js
const mongoose = require("mongoose");

const CostCenterSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
});

module.exports = mongoose.model("CostCenter", CostCenterSchema);
