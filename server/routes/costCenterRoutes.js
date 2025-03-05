const express = require("express");
const router = express.Router();
const CostCenter = require("../models/CostCenter");

// Create Cost Center
router.post("/", async (req, res) => {
  try {
    const { name } = req.body;
    const newCostCenter = new CostCenter({ name });
    await newCostCenter.save();
    res.status(201).json(newCostCenter);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get All Cost Centers
router.get("/", async (req, res) => {
  try {
    const costCenters = await CostCenter.find().sort({ name: 1 });
    res.json(costCenters);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
