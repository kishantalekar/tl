import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Paper,
} from "@mui/material";
import { API_URL } from "../constants";

function CostCenterPage() {
  const [name, setName] = useState("");
  const [costCenters, setCostCenters] = useState([]);

  useEffect(() => {
    loadCostCenters();
  }, []);

  const loadCostCenters = async () => {
    const res = await axios.get(API_URL + "/cost-centers");
    setCostCenters(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post(API_URL + "/cost-centers", { name });
    setName("");
    loadCostCenters();
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
      <h2>Cost Center Management</h2>

      <Paper style={{ padding: "1rem", marginBottom: "2rem" }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", gap: "1rem" }}>
          <TextField
            fullWidth
            label="New Cost Center Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Button variant="contained" color="primary" type="submit">
            Add
          </Button>
        </form>
      </Paper>

      <h3>Existing Cost Centers</h3>
      <Paper>
        <List>
          {costCenters?.map((cc) => (
            <ListItem key={cc._id}>
              <ListItemText primary={cc.name} />
            </ListItem>
          ))}
        </List>
      </Paper>
    </div>
  );
}

export default CostCenterPage;
