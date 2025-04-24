import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Paper,
  Typography,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import { API_URL } from "../constants";

function CostCenterPage() {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentCostCenter, setCurrentCostCenter] = useState(null);
  const [costCenterToDelete, setCostCenterToDelete] = useState("");
  const [name, setName] = useState("");
  const [costCenters, setCostCenters] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadCostCenters();
  }, []);

  const loadCostCenters = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(API_URL + "/cost-centers");
      setCostCenters(res.data);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (costCenter) => {
    setCurrentCostCenter(costCenter);
    setName(costCenter.name);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (id) => {
    setCostCenterToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await axios.put(`${API_URL}/cost-centers/${currentCostCenter._id}`, {
        name,
      });
      setName("");
      setEditDialogOpen(false);
      await loadCostCenters();
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await axios.delete(`${API_URL}/cost-centers/${costCenterToDelete}`);
      setDeleteDialogOpen(false);
      await loadCostCenters();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await axios.post(API_URL + "/cost-centers", { name });
      setName("");
      await loadCostCenters();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {" "}
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
          Cost Center Management
        </Typography>

        <Paper
          elevation={3}
          sx={{ padding: "2rem", marginBottom: "2rem", borderRadius: "12px" }}
        >
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", gap: "1rem" }}
          >
            <TextField
              fullWidth
              label="New Cost Center Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              sx={{ marginBottom: 2 }}
              disabled={isLoading}
            />
            <Button
              variant="contained"
              color="primary"
              type="submit"
              disabled={isLoading}
              sx={{ height: "56px" }}
            >
              {isLoading ? <CircularProgress size={24} /> : "Add"}
            </Button>
          </form>
        </Paper>

        <Typography
          variant="h5"
          component="h2"
          gutterBottom
          sx={{ marginBottom: "1rem" }}
        >
          Existing Cost Centers
        </Typography>
        <Paper elevation={3} sx={{ borderRadius: "12px" }}>
          <List>
            {isLoading ? (
              <ListItem sx={{ justifyContent: "center" }}>
                <CircularProgress />
              </ListItem>
            ) : (
              costCenters?.map((cc, index) => (
                <ListItem
                  key={cc._id}
                  sx={{
                    backgroundColor: index % 2 === 0 ? "#f5f5f5" : "#ffffff",
                    "&:hover": { backgroundColor: "#e3f2fd" },
                  }}
                >
                  <ListItemText
                    primary={cc.name}
                    primaryTypographyProps={{
                      fontWeight: 500,
                      fontSize: "1rem",
                    }}
                  />
                  <div>
                    <IconButton onClick={() => handleEditClick(cc)}>
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteClick(cc._id)}>
                      <Delete fontSize="small" color="error" />
                    </IconButton>
                  </div>
                </ListItem>
              ))
            )}
          </List>
        </Paper>
      </div>
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Edit Cost Center</DialogTitle>
        <DialogContent>
          <form onSubmit={handleEditSubmit} style={{ marginTop: "1rem" }}>
            <TextField
              fullWidth
              label="Cost Center Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isLoading}
            />
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleEditSubmit}
            color="primary"
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={24} /> : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this cost center?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" disabled={isLoading}>
            {isLoading ? <CircularProgress size={24} /> : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default CostCenterPage;
