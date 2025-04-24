import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import AddTransaction from "./pages/AddTransactionPage";
import CostCenterPage from "./pages/CostCenterPage";
import ViewTransactions from "./pages/ViewTransaction";
import ReportsPage from "./pages/ReportsPage";
import DetailedReportPage from "./pages/DetailedReportPage";
import logo from "./assets/logo.png"; // Import the logo

function App() {
  return (
    <Router>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          // marginBottom: "2rem",
          // backgroundColor: "red",
        }}
      >
        <img
          src={logo}
          alt="Website Logo"
          style={{ height: "40px", marginRight: "1rem", marginTop: -30 }}
        />
        <nav
          style={{
            padding: "1rem",
            background: "#1976d2", // Changed back from "transparent" to "#1976d2"
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            marginBottom: "2rem",
            display: "flex",
            alignItems: "center",
            // justifyContent: "center",
          }}
        >
          <Link
            to="/add-transaction"
            style={{
              marginRight: "2rem",
              color: "white",
              textDecoration: "none",
              fontWeight: 500,
              fontSize: "1rem",
              padding: "0.5rem 1rem",
              borderRadius: "4px",
              transition: "background-color 0.3s",
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.2)",
              },
            }}
          >
            Add Transaction
          </Link>
          <Link
            to="/view-transactions"
            style={{
              marginRight: "2rem",
              color: "white",
              textDecoration: "none",
              fontWeight: 500,
              fontSize: "1rem",
              padding: "0.5rem 1rem",
              borderRadius: "4px",
              transition: "background-color 0.3s",
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.2)",
              },
            }}
          >
            View Transactions
          </Link>
          <Link
            to="/cost-centers"
            style={{
              marginRight: "2rem",
              color: "white",
              textDecoration: "none",
              fontWeight: 500,
              fontSize: "1rem",
              padding: "0.5rem 1rem",
              borderRadius: "4px",
              transition: "background-color 0.3s",
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.2)",
              },
            }}
          >
            Cost Centers
          </Link>
          <Link
            to="/reports"
            style={{
              marginRight: "2rem",
              color: "white",
              textDecoration: "none",
              fontWeight: 500,
              fontSize: "1rem",
              padding: "0.5rem 1rem",
              borderRadius: "4px",
              transition: "background-color 0.3s",
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.2)",
              },
            }}
          >
            Summary Reports
          </Link>
          <Link
            to="/detailed-reports"
            style={{
              color: "white",
              textDecoration: "none",
              fontWeight: 500,
              fontSize: "1rem",
              padding: "0.5rem 1rem",
              borderRadius: "4px",
              transition: "background-color 0.3s",
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.2)",
              },
            }}
          >
            Detailed Reports
          </Link>
        </nav>
      </div>

      <div style={{ padding: "2rem" }}>
        <Routes>
          <Route path="/" element={<AddTransaction />} />
          <Route path="/add-transaction" element={<AddTransaction />} />
          <Route path="/view-transactions" element={<ViewTransactions />} />
          <Route path="/cost-centers" element={<CostCenterPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/detailed-reports" element={<DetailedReportPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
