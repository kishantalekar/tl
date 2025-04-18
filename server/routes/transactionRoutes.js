const express = require("express");
const router = express.Router();
const Transaction = require("../models/Transaction");

// Create Transaction
router.post("/", async (req, res) => {
  try {
    const { date, ledgerGroup, ledger, costCenter, amount } = req.body;

    const newTransaction = new Transaction({
      date,
      ledgerGroup,
      ledger,
      costCenter,
      amount,
    });

    await newTransaction.save();
    res.status(201).json(newTransaction);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get All Transactions
router.get("/", async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate("costCenter", "name")
      .sort({ date: -1 });

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
