import React, { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from "@mui/material";

interface Transaction {
  _id: string;
  date: string;
  ledgerGroup: string;
  ledger: string;
  costCenter: { _id: string; name: string };
  amount: number;
}

function ReportsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [groupBy, setGroupBy] = useState<
    "ledgerGroup" | "costCenter" | "ledger"
  >("ledgerGroup");

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3000/api/transactions"
      );
      setTransactions(response.data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  const generateReport = () => {
    const groupedData = transactions.reduce((acc, transaction) => {
      const key =
        groupBy === "costCenter"
          ? transaction.costCenter?.name || "Unassigned"
          : transaction[groupBy];

      if (!acc[key]) {
        acc[key] = {
          total: 0,
          count: 0,
        };
      }

      acc[key].total += transaction.amount;
      acc[key].count += 1;

      return acc;
    }, {});

    return Object.entries(groupedData).map(([key, value]: [string, any]) => ({
      category: key,
      total: value.total,
      count: value.count,
      average: value.total / value.count,
    }));
  };

  const exportToExcel = () => {
    const workbook = XLSX.utils.book_new();

    // Convert report data to Excel format
    const excelData = reportData.map((row) => ({
      [groupBy === "costCenter"
        ? "Cost Center"
        : groupBy === "ledger"
        ? "Ledger"
        : "Ledger Group"]: row.category,
      "Total Amount": `₹${row.total.toFixed(2)}`,
      "Number of Transactions": row.count,
      "Average Amount": `₹${row.average.toFixed(2)}`,
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Financial Report");

    // Generate and download the file
    XLSX.writeFile(
      workbook,
      `financial_report_${groupBy}_${
        new Date().toISOString().split("T")[0]
      }.xlsx`
    );
  };

  const reportData = generateReport();

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <h2>Financial Reports</h2>
        <Button
          variant="contained"
          color="primary"
          onClick={exportToExcel}
          style={{ marginLeft: "1rem" }}
        >
          Export to Excel
        </Button>
      </div>

      <FormControl style={{ minWidth: 200, marginBottom: "2rem" }}>
        <InputLabel>Group By</InputLabel>
        <Select
          value={groupBy}
          onChange={(e) =>
            setGroupBy(
              e.target.value as "ledgerGroup" | "costCenter" | "ledger"
            )
          }
        >
          <MenuItem value="ledgerGroup">Ledger Group</MenuItem>
          <MenuItem value="costCenter">Cost Center</MenuItem>
          <MenuItem value="ledger">Ledger</MenuItem>
        </Select>
      </FormControl>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                {groupBy === "costCenter"
                  ? "Cost Center"
                  : groupBy === "ledger"
                  ? "Ledger"
                  : "Ledger Group"}
              </TableCell>
              <TableCell align="right">Total Amount</TableCell>
              <TableCell align="right">Number of Transactions</TableCell>
              <TableCell align="right">Average Amount</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reportData.map((row) => (
              <TableRow key={row.category}>
                <TableCell>{row.category}</TableCell>
                <TableCell align="right">₹{row.total.toFixed(2)}</TableCell>
                <TableCell align="right">{row.count}</TableCell>
                <TableCell align="right">₹{row.average.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}

export default ReportsPage;
