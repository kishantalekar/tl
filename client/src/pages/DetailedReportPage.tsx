import React, { useState, useEffect } from "react";
import axios from "axios";
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
  Grid,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { utils, writeFile } from "xlsx";

interface Transaction {
  _id: string;
  date: string;
  ledgerGroup: string;
  ledger: string;
  costCenter: { _id: string; name: string };
  amount: number;
}

interface GroupSummary {
  income: number;
  expenses: number;
  profit: number;
  salesBreakdown: Record<string, number>;
  expenseBreakdown: Record<string, number>;
}

function DetailedReportPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );
  const [endDate, setEndDate] = useState<Date | null>(new Date());

  useEffect(() => {
    fetchTransactions();
  }, [startDate, endDate]);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3000/api/transactions"
      );
      const filteredTransactions = response.data.filter((t: Transaction) => {
        const transactionDate = new Date(t.date);
        return (
          (!startDate || transactionDate >= startDate) &&
          (!endDate || transactionDate <= endDate)
        );
      });
      setTransactions(filteredTransactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  const calculateSummary = (): GroupSummary => {
    const summary: GroupSummary = {
      income: 0,
      expenses: 0,
      profit: 0,
      salesBreakdown: {},
      expenseBreakdown: {},
    };

    transactions.forEach((transaction) => {
      if (transaction.ledgerGroup === "Sales Account") {
        summary.income += transaction.amount;
        summary.salesBreakdown[transaction.ledger] =
          (summary.salesBreakdown[transaction.ledger] || 0) +
          transaction.amount;
      } else {
        summary.expenses += transaction.amount;
        summary.expenseBreakdown[transaction.ledgerGroup] =
          (summary.expenseBreakdown[transaction.ledgerGroup] || 0) +
          transaction.amount;
      }
    });

    summary.profit = summary.income - summary.expenses;
    return summary;
  };

  const summary = calculateSummary();

  const exportToExcel = () => {
    const workbook = utils.book_new();

    // Summary Sheet
    const summaryData = [
      ["Financial Summary Report", ""],
      [
        "Period",
        `${startDate?.toLocaleDateString()} - ${endDate?.toLocaleDateString()}`,
      ],
      ["", ""],
      ["Total Income", `₹${summary.income.toFixed(2)}`],
      ["Total Expenses", `₹${summary.expenses.toFixed(2)}`],
      ["Net Profit/Loss", `₹${summary.profit.toFixed(2)}`],
      ["", ""],
      ["Expense Breakdown", ""],
      ...Object.entries(summary.expenseBreakdown).map(([category, amount]) => [
        category,
        `₹${amount.toFixed(2)}`,
      ]),
    ];

    const ws = utils.aoa_to_sheet(summaryData); // Change XLSX.utils to utils
    utils.book_append_sheet(workbook, ws, "Summary"); // Change XLSX.utils to utils

    // Detailed Transactions Sheet
    const detailedData = transactions.map((t) => ({
      Date: new Date(t.date).toLocaleDateString(),
      "Ledger Group": t.ledgerGroup,
      Ledger: t.ledger,
      "Cost Center": t.costCenter?.name || "Unassigned",
      Amount: `₹${t.amount.toFixed(2)}`,
    }));

    const ws2 = utils.json_to_sheet(detailedData); // Change XLSX.utils to utils
    utils.book_append_sheet(workbook, ws2, "Detailed Transactions"); // Change XLSX.utils to utils

    writeFile(
      // Change XLSX.writeFile to writeFile
      workbook,
      `financial_report_${startDate?.toISOString().split("T")[0]}_${
        endDate?.toISOString().split("T")[0]
      }.xlsx`
    );
  };

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
        <Typography variant="h4">Detailed Financial Report</Typography>
        <Button variant="contained" color="primary" onClick={exportToExcel}>
          Export to Excel
        </Button>
      </div>

      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Grid container spacing={2} style={{ marginBottom: "2rem" }}>
          <Grid item xs={6}>
            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={setStartDate}
            />
          </Grid>
          <Grid item xs={6}>
            <DatePicker
              label="End Date"
              value={endDate}
              onChange={setEndDate}
            />
          </Grid>
        </Grid>
      </LocalizationProvider>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper style={{ padding: "1rem", marginBottom: "2rem" }}>
            <Typography variant="h6" gutterBottom>
              Financial Summary
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Typography variant="subtitle1">Total Income</Typography>
                <Typography variant="h6" color="primary">
                  ₹{summary.income.toFixed(2)}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="subtitle1">Total Expenses</Typography>
                <Typography variant="h6" color="error">
                  ₹{summary.expenses.toFixed(2)}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="subtitle1">Net Profit/Loss</Typography>
                <Typography
                  variant="h6"
                  color={summary.profit >= 0 ? "success" : "error"}
                >
                  ₹{summary.profit.toFixed(2)}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Expense Category</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell align="right">% of Total Expenses</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(summary.expenseBreakdown).map(
                    ([category, amount]) => (
                      <TableRow key={category}>
                        <TableCell>{category}</TableCell>
                        <TableCell align="right">
                          ₹{amount.toFixed(2)}
                        </TableCell>
                        <TableCell align="right">
                          {((amount / summary.expenses) * 100).toFixed(2)}%
                        </TableCell>
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
}

export default DetailedReportPage;
