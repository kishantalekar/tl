import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import AddTransaction from "./pages/AddTransactionPage";
import CostCenterPage from "./pages/CostCenterPage";
import ViewTransactions from "./pages/ViewTransaction";
import ReportsPage from "./pages/ReportsPage";
import DetailedReportPage from "./pages/DetailedReportPage";

function App() {
  return (
    <Router>
      <nav style={{ padding: "1rem", background: "#f0f0f0" }}>
        <Link to="/add-transaction" style={{ marginRight: "1rem" }}>
          Add Transaction
        </Link>
        <Link to="/view-transactions" style={{ marginRight: "1rem" }}>
          View Transactions
        </Link>
        <Link to="/cost-centers" style={{ marginRight: "1rem" }}>
          Cost Centers
        </Link>
        <Link to="/reports" style={{ marginRight: "1rem" }}>Summary Reports</Link>
        <Link to="/detailed-reports">Detailed Reports</Link>
      </nav>

      <div style={{ padding: "2rem" }}>
        <Routes>
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
