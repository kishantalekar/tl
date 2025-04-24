import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Typography,
  Checkbox,
  Button,
  Box,
} from "@mui/material";
import { API_URL } from "../constants";

function ViewTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get(API_URL + "/transactions");
        setTransactions(res.data);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem" }}>
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
        All Transactions
      </Typography>

      {isLoading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            margin: "2rem 0",
          }}
        >
          <CircularProgress />
        </div>
      ) : (
        <TableContainer
          component={Paper}
          elevation={3}
          sx={{
            borderRadius: "12px",
            "& .MuiTableCell-root": {
              fontSize: "0.95rem",
            },
            "& .MuiTableCell-head": {
              fontWeight: 600,
              backgroundColor: "#1976d2",
              color: "white",
            },
            "& .MuiTableRow-root:nth-of-type(odd)": {
              backgroundColor: "#f9f9f9",
            },
            "& .MuiTableRow-root:hover": {
              backgroundColor: "#f0f0f0",
            },
          }}
        >
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={
                      selected.length > 0 &&
                      selected.length < transactions.length
                    }
                    checked={
                      selected.length === transactions.length &&
                      transactions.length > 0
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelected(transactions.map((t) => t._id));
                      } else {
                        setSelected([]);
                      }
                    }}
                  />
                </TableCell>
                <TableCell sx={{ padding: 3 }}>Date</TableCell>
                <TableCell sx={{ padding: 3 }}>Ledger Group</TableCell>
                <TableCell sx={{ padding: 3 }}>Ledger</TableCell>
                <TableCell sx={{ padding: 3 }}>Cost Center</TableCell>
                <TableCell sx={{ padding: 3 }}>Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction._id}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selected.includes(transaction._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelected([...selected, transaction._id]);
                        } else {
                          setSelected(
                            selected.filter((id) => id !== transaction._id)
                          );
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(transaction.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{transaction.ledgerGroup}</TableCell>
                  <TableCell>{transaction.ledger}</TableCell>
                  <TableCell>{transaction.costCenter?.name}</TableCell>
                  <TableCell>{transaction.amount.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {selected.length > 0 && (
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
          <Button
            variant="contained"
            color="error"
            disabled={isLoading}
            onClick={async () => {
              try {
                setIsLoading(true);
                await Promise.all(
                  selected.map((id) =>
                    axios.delete(`${API_URL}/transactions/${id}`)
                  )
                );
                const res = await axios.get(API_URL + "/transactions");
                setTransactions(res.data);
                setSelected([]);
              } catch (error) {
                console.error("Error deleting transactions:", error);
              } finally {
                setIsLoading(false);
              }
            }}
          >
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              `Delete Selected (${selected.length})`
            )}
          </Button>
        </Box>
      )}
    </div>
  );
}

export default ViewTransactions;
