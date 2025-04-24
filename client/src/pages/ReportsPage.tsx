import React, { useState, useEffect } from "react";
import axios from "axios";
import { utils, writeFile } from "xlsx";
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
  CircularProgress,
  Typography,
} from "@mui/material";
import { API_URL } from "../constants";

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
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(API_URL + "/transactions");
      setTransactions(response.data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setIsLoading(false);
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
    const workbook = utils.book_new(); // Change XLSX.utils to utils

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

    const worksheet = utils.json_to_sheet(excelData); // Change XLSX.utils to utils
    utils.book_append_sheet(workbook, worksheet, "Financial Report"); // Change XLSX.utils to utils

    // Generate and download the file
    writeFile(
      // Change XLSX.writeFile to writeFile
      workbook,
      `financial_report_${groupBy}_${
        new Date().toISOString().split("T")[0]
      }.xlsx`
    );
  };

  const reportData = generateReport();

  return (
    <div
      style={{
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "2rem",
        backgroundColor: "#f9f9f9",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
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
          Financial Reports
        </Typography>
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

      <TableContainer
        component={Paper}
        elevation={3}
        sx={{
          marginTop: "2rem",
          borderRadius: "12px",
          marginBottom: "2rem",
          "& .MuiTableCell-root": {
            fontSize: "0.95rem",
          },
          "& .MuiTableCell-head": {
            fontWeight: 600,
            backgroundColor: "#1976d2",
            color: "white",
          },
        }}
      >
        <Table stickyHeader>
          <colgroup>
            <col style={{ width: "40%" }} />
            <col style={{ width: "20%" }} />
            <col style={{ width: "20%" }} />
            <col style={{ width: "20%" }} />
          </colgroup>
          <TableHead>
            <TableRow>
              <TableCell
                sx={{ fontSize: "1.1rem", fontWeight: 600, padding: 3 }}
              >
                {groupBy === "costCenter"
                  ? "Cost Center"
                  : groupBy === "ledger"
                  ? "Ledger"
                  : "Ledger Group"}
              </TableCell>
              <TableCell
                sx={{ fontSize: "1.1rem", fontWeight: 600, padding: 3 }}
                align="right"
              >
                Total Amount
              </TableCell>
              <TableCell
                sx={{ fontSize: "1.1rem", fontWeight: 600, padding: 3 }}
                align="right"
              >
                Transactions
              </TableCell>
              <TableCell
                sx={{ fontSize: "1.1rem", fontWeight: 600, padding: 3 }}
                align="right"
              >
                Average
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody
            sx={{ "& tr:nth-of-type(even)": { backgroundColor: "#f5f5f5" } }}
          >
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : (
              reportData.map((row) => (
                <TableRow key={row.category}>
                  <TableCell sx={{ padding: 2 }}>{row.category}</TableCell>
                  <TableCell sx={{ padding: 2 }} align="right">
                    ₹{row.total.toFixed(2)}
                  </TableCell>
                  <TableCell sx={{ padding: 2 }} align="right">
                    {row.count}
                  </TableCell>
                  <TableCell sx={{ padding: 2 }} align="right">
                    ₹{row.average.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}

export default ReportsPage;
