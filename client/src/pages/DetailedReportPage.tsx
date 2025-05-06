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
  CircularProgress,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { utils, writeFile } from "xlsx";
import { API_URL } from "../constants";

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
  const [costCenters, setCostCenters] = useState([]);
  const [selectedCostCenter, setSelectedCostCenter] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );
  const [endDate, setEndDate] = useState<Date | null>(new Date());

  useEffect(() => {
    fetchCostCenters();
    fetchTransactions();
  }, [startDate, endDate, selectedCostCenter]);

  const fetchCostCenters = async () => {
    try {
      const response = await axios.get(API_URL + "/cost-centers");
      setCostCenters(response.data);
    } catch (error) {
      console.error("Error fetching cost centers:", error);
    }
  };

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      const params = {
        costCenter: selectedCostCenter || undefined,
      };

      const response = await axios.get(API_URL + "/transactions", { params });
      // Remove client-side date filtering since backend should handle it
      setTransactions(response.data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const calculateExpenseStructure = () => {
    const totalSales = summary.income;
    const expenseGroups = transactions.reduce((acc, t) => {
      acc[t.ledgerGroup] = (acc[t.ledgerGroup] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

    // Calculate sub-components for Variable Expenses - Statutory
    const statutoryComponents = transactions.reduce((acc, t) => {
      if (t.ledgerGroup === "Variable Expenses - Statutory") {
        acc[t.ledger] = (acc[t.ledger] || 0) + t.amount;
      }
      return acc;
    }, {} as Record<string, number>);
    console.log("statutoryComponents", statutoryComponents);
    return [
      {
        srno: "A",
        details: "Sales Value",
        amount: totalSales,
      },
      {
        srno: "B",
        details: "Fixed Expenses",
        amount: expenseGroups["Fixed Expenses"] || 0,
      },
      {
        srno: "C",
        details: "Variable Expenses - Execution",
        amount:
          (expenseGroups["Variable Expenses - Material"] || 0) +
          (expenseGroups["Variable Expenses - Sub contractor"] || 0) +
          (expenseGroups["Variable Expenses - Operational Expenses"] || 0),
        children: [
          {
            srno: "1",
            details: "Material",
            amount: expenseGroups["Variable Expenses - Material"] || 0,
          },
          {
            srno: "2",
            details: "Sub Contractor",
            amount: expenseGroups["Variable Expenses - Sub contractor"] || 0,
          },
          {
            srno: "3",
            details: "Operational Expenses",
            amount:
              expenseGroups["Variable Expenses - Operational Expenses"] || 0,
          },
        ],
      },
      {
        srno: "D",
        details: "Variable Expenses - Statutory",
        amount: expenseGroups["Variable Expenses - Statutory"] || 0,
        children: [
          {
            srno: "4",
            details: "Business Promotion",
            amount: statutoryComponents["Business Promotion Expenses"] || 0,
          },
          {
            srno: "5",
            details: "Gem E-marketspace",
            amount: 0, // Add actual value if available
          },
          {
            srno: "6",
            details: "CGST/SGST/IGST",
            amount: statutoryComponents["CGST/ SGST / IGST"] || 0,
          },
          {
            srno: "7",
            details: "Interest on WC - Bank OCC",
            amount: statutoryComponents["Interest on WC - Bank OCC"] || 0,
          },
          {
            srno: "8",
            details: "Bank Charges",
            amount:
              statutoryComponents["Bank Charges - PG/BG/Solvency/NEFT etc"] ||
              0,
          },
        ],
      },
    ];
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

  const renderRows = (rows: ExpenseRow[], level = 0) => {
    return rows.flatMap((row) => [
      <TableRow key={row.srno}>
        <TableCell style={{ paddingLeft: `${level * 20}px` }}>
          {row.srno}. {row.details}
        </TableCell>
        <TableCell align="right">₹{row.amount.toFixed(2)}</TableCell>
        <TableCell align="right">
          {summary.income > 0
            ? `${((row.amount / summary.income) * 100).toFixed(2)}%`
            : "-"}
        </TableCell>
      </TableRow>,
      ...(row.children ? renderRows(row.children, level + 1) : []),
    ]);
  };
  const calculateProjectSummary = () => {
    const expenseGroups = transactions.reduce((acc, t) => {
      acc[t.ledgerGroup] = (acc[t.ledgerGroup] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

    const salesValue = summary.income;
    const fixedExpenses = expenseGroups["Fixed Expenses"] || 0;
    const variableExpensesExecution =
      (expenseGroups["Variable Expenses - Material"] || 0) +
      (expenseGroups["Variable Expenses - Sub contractor"] || 0) +
      (expenseGroups["Variable Expenses - Operational Expenses"] || 0);
    const variableExpensesStatutory =
      expenseGroups["Variable Expenses - Statutory"] || 0;
    const totalExpenses =
      fixedExpenses + variableExpensesExecution + variableExpensesStatutory;
    const grossProfit = salesValue - totalExpenses;
    const directorRemuneration = grossProfit * 0.1;
    const corporateTax = grossProfit * 0.3;
    const netProfit = grossProfit - directorRemuneration - corporateTax;

    return [
      { srno: "A", details: "Sales Value", amount: salesValue },
      { srno: "B", details: "Fixed Expenses", amount: fixedExpenses },
      {
        srno: "C",
        details: "Variable Expenses - Execution",
        amount: variableExpensesExecution,
      },
      {
        srno: "D",
        details: "Variable Expenses - Statutory",
        amount: variableExpensesStatutory,
      },
      { srno: "E", details: "Total Expenses (B+C+D)", amount: totalExpenses },
      { srno: "F", details: "Gross Profit (A-E)", amount: grossProfit },
      {
        srno: "G",
        details: "Director Remuneration @10% on Gross Profit",
        amount: directorRemuneration,
      },
      {
        srno: "H",
        details: "Corporate Tax 30% on (F-G)",
        amount: corporateTax,
      },
      { srno: "I", details: "Net Profit (F-G-H)", amount: netProfit },
    ];
  };

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
          NIRAKAR ENGINEERING PRIVATE LIMITED <br /> PROJECT BUDGET
        </Typography>
        <Button variant="contained" color="primary" onClick={exportToExcel}>
          Export to Excel
        </Button>
      </div>

      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Grid container spacing={2} style={{ marginBottom: "2rem" }}>
          <Grid item xs={4}>
            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={setStartDate}
            />
          </Grid>
          <Grid item xs={4}>
            <DatePicker
              label="End Date"
              value={endDate}
              onChange={setEndDate}
            />
          </Grid>
          <Grid item xs={4}>
            <FormControl fullWidth>
              <InputLabel>Cost Center</InputLabel>
              <Select
                value={selectedCostCenter}
                onChange={(e) => {
                  console.log("hell", e.target.value);
                  return setSelectedCostCenter(
                    e.target.value ?? ("" as string)
                  );
                }}
                label="Cost Center"
              >
                <MenuItem value="">All Cost Centers</MenuItem>
                {costCenters.map((center) => (
                  <MenuItem key={center._id} value={center._id}>
                    {center.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </LocalizationProvider>

      {/*  <Grid container spacing={3}>
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
      </Grid> */}
      <Grid item xs={12}>
        <Paper>
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
                <col style={{ width: "60%" }} />
                <col style={{ width: "20%" }} />
                <col style={{ width: "20%" }} />
              </colgroup>
              <TableHead>
                <TableRow
                  sx={{
                    "& th": { backgroundColor: "#1976d2", color: "white" },
                  }}
                >
                  <TableCell
                    sx={{ fontSize: "1.2rem", fontWeight: 700, padding: 3 }}
                  >
                    Details
                  </TableCell>
                  <TableCell
                    sx={{ fontSize: "1.2rem", fontWeight: 700, padding: 3 }}
                    align="right"
                  >
                    Amount
                  </TableCell>
                  <TableCell
                    sx={{ fontSize: "1.2rem", fontWeight: 700, padding: 3 }}
                    align="right"
                  >
                    % of Sales
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody
                sx={{
                  "& tr:nth-of-type(even)": { backgroundColor: "#f9f9f9" },
                  "& tr:hover": { backgroundColor: "#f0f7ff" },
                }}
              >
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : (
                  renderRows(calculateExpenseStructure(), 1)
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Grid>

      <Grid item xs={12}>
        <Paper>
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
                <col style={{ width: "60%" }} />
                <col style={{ width: "20%" }} />
                <col style={{ width: "20%" }} />
              </colgroup>
              <TableHead>
                <TableRow
                  sx={{
                    "& th": { backgroundColor: "#1976d2", color: "white" },
                  }}
                >
                  <TableCell
                    sx={{ fontSize: "1.2rem", fontWeight: 700, padding: 3 }}
                  >
                    Project Summary
                  </TableCell>
                  <TableCell
                    sx={{ fontSize: "1.2rem", fontWeight: 700, padding: 3 }}
                    align="right"
                  >
                    Amount
                  </TableCell>
                  <TableCell
                    sx={{ fontSize: "1.2rem", fontWeight: 700, padding: 3 }}
                    align="right"
                  >
                    % of Sales
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody
                sx={{
                  "& tr:nth-of-type(even)": { backgroundColor: "#f9f9f9" },
                  "& tr:hover": { backgroundColor: "#f0f7ff" },
                }}
              >
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : (
                  renderRows(calculateProjectSummary(), 1)
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Grid>
    </div>
  );
}

export default DetailedReportPage;
