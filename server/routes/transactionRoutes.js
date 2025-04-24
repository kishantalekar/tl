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
    const { costCenter } = req.query;
    const query = {};

    if (costCenter) {
      query.costCenter = costCenter;
    }

    const transactions = await Transaction.find(query)
      .populate("costCenter", "name")
      .sort({ date: -1 });

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Delete Transaction
router.delete("/:id", async (req, res) => {
  try {
    const deletedTransaction = await Transaction.findByIdAndDelete(
      req.params.id
    );
    if (!deletedTransaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }
    res.json({ message: "Transaction deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
