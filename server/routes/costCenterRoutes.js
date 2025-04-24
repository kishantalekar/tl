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

// Update Cost Center
router.put("/:id", async (req, res) => {
  try {
    const { name } = req.body;
    const updatedCostCenter = await CostCenter.findByIdAndUpdate(
      req.params.id,
      { name },
      { new: true }
    );
    res.json(updatedCostCenter);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete Cost Center
router.delete("/:id", async (req, res) => {
  try {
    await CostCenter.findByIdAndDelete(req.params.id);
    res.json({ message: "Cost center deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
