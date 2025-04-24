import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  TextField,
  MenuItem,
  Button,
  Select,
  FormControl,
  InputLabel,
  Paper,
  Typography,
  CircularProgress,
} from "@mui/material";
import { API_URL } from "../constants";

const ledgerGroups = {
  "Sales Account": ["Sales"],
  "Fixed Expenses": [
    "Salary",
    "Travelling- Local",
    "Business Travel and Accomodation",
    "Food and Refreshments",
    "Hotel , Lodging and Rent",
    "Provident Fund",
    "ESIC",
    "Telephone and Mobile Expenses",
    "Electricity Expenses",
    "Water Charges",
    "Printing, Stationary and Postage",
  ],
  "Variable Expenses - Material": [
    "Purchase - Raw Material",
    "Purchase - SME Material",
    "Purchase - MIS Material",
    "Purchase - SKD Material",
    "Purchase - Capital",
    "Loading & Unloading Charges",
    "Freight and Transportation Charges",
  ],
  "Variable Expenses - Operational Expenses": [
    "Wages",
    "Travelling- Local",
    "Business Travel and Accomodation",
    "Food and Refreshments",
    "Hotel , Lodging and Rent",
    "Telephone and Mobile Expenses",
    "Printing, Stationary and Postage",
    "Maintenance - Plant and Machinery",
    "Penalty",
    "Director Remuneration",
    "Corporate Tax",
    "Market Expenses - Registration / Renewal / Tender Cost",
    "Professional Fees - CA/CS/MCA Charges",
    "Panchayat Tax / Municipal Tax / Road Tax",
    "HR and Training Expenses",
    "Research & Development Expenses",
    "Insurance",
    "Canteen Expenses",
    "Housekeeping Expenses",
    "Maintenance - Vehicle",
    "Fuel - Generator",
  ],
  "Variable Expenses - Sub contractor": ["Sub-contractor charges"],
  "Variable Expenses - Statutory": [
    "Business Promotion Expenses",
    "CGST/ SGST / IGST",
    "Interest on WC - Bank OCC",
    "Bank Charges - PG/BG/Solvency/NEFT etc",
  ],
};
function AddTransaction() {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    ledgerGroup: "",
    ledger: "",
    costCenter: "",
    amount: "",
  });
  const [costCenters, setCostCenters] = useState([]);
  useEffect(() => {
    axios.get(API_URL + "/cost-centers").then((res) => {
      if (res.status === 200) {
        console.log("dsl", res.data);
        return setCostCenters(res.data);
      }
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(API_URL + "/transactions", formData);
      alert("Transaction added successfully!");
      setFormData({
        ...formData,
        ledgerGroup: "",
        ledger: "",
        costCenter: "",
        amount: "",
      });
    } catch (error) {
      alert("Error submitting transaction: " + error.message);
    }
  };
  console.log(costCenters);
  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem" }}>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{
          color: "#1976d2",
          fontWeight: 600,
          marginBottom: "2rem",
          paddingBottom: "1rem",
          borderBottom: "1px solid #e0e0e0",
        }}
      >
        Add New Transaction
      </Typography>
      <Paper elevation={3} sx={{ padding: "2rem", borderRadius: "12px" }}>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            type="date"
            label="Date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            margin="normal"
            required
            sx={{ marginBottom: 2 }}
          />

          <FormControl
            fullWidth
            margin="normal"
            required
            sx={{ marginBottom: 2 }}
          >
            <InputLabel>Ledger Group</InputLabel>
            <Select
              value={formData.ledgerGroup}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  ledgerGroup: e.target.value,
                  ledger: "",
                })
              }
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 300,
                  },
                },
              }}
            >
              <MenuItem value="">
                <em>Select Group</em>
              </MenuItem>
              {Object.keys(ledgerGroups).map((group) => (
                <MenuItem key={group} value={group}>
                  {group}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl
            fullWidth
            margin="normal"
            required
            sx={{ marginBottom: 2 }}
          >
            <InputLabel>Ledger</InputLabel>
            <Select
              value={formData.ledger}
              onChange={(e) =>
                setFormData({ ...formData, ledger: e.target.value })
              }
              disabled={!formData.ledgerGroup}
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 300,
                  },
                },
              }}
            >
              <MenuItem value="">
                <em>Select Ledger</em>
              </MenuItem>
              {formData.ledgerGroup &&
                ledgerGroups[formData.ledgerGroup].map((ledger) => (
                  <MenuItem key={ledger} value={ledger}>
                    {ledger}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>

          <FormControl
            fullWidth
            margin="normal"
            required
            sx={{ marginBottom: 2 }}
          >
            <InputLabel>Cost Center</InputLabel>
            <Select
              value={formData.costCenter}
              onChange={(e) =>
                setFormData({ ...formData, costCenter: e.target.value })
              }
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 300,
                  },
                },
              }}
            >
              {costCenters &&
                costCenters?.map((cc) => (
                  <MenuItem key={cc._id} value={cc._id}>
                    {cc.name}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            type="number"
            label="Amount"
            value={formData.amount}
            onChange={(e) =>
              setFormData({ ...formData, amount: e.target.value })
            }
            margin="normal"
            required
            inputProps={{ step: "0.01" }}
            sx={{ marginBottom: 2 }}
          />

          <Button
            variant="contained"
            color="primary"
            type="submit"
            fullWidth
            size="large"
            sx={{ marginTop: "2rem", padding: "1rem" }}
          >
            Submit Transaction
          </Button>
        </form>
      </Paper>
    </div>
  );
}

export default AddTransaction;
