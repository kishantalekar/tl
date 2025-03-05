// server/models/Transaction.js
const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  ledgerGroup: String,
  ledger: String,
  costCenter: { type: mongoose.Schema.Types.ObjectId, ref: "CostCenter" },
  amount: Number,
});

module.exports = mongoose.model("Transaction", TransactionSchema);
