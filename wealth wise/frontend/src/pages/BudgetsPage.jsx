import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  LinearProgress,
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  InputAdornment,
  Alert,
  Snackbar,
} from "@mui/material";
import { Add, Edit, Delete, Warning, CheckCircle } from "@mui/icons-material";
import {
  getBudgetStatus,
  createBudget,
  updateBudget,
  deleteBudget,
} from "../services/api";
import AnimatedSnackbar from "../components/AnimatedSnackbar";

const categories = [
  "Food",
  "Transport",
  "Shopping",
  "Bills",
  "Entertainment",
  "Health",
  "Education",
  "Other",
];

const BudgetsPage = () => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [form, setForm] = useState({
    category: "Food",
    limit: "",
    alertThreshold: 80,
    resetDay: 1,
  });

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
      const res = await getBudgetStatus();
      setBudgets(res.data.data);
    } catch (error) {
      console.error("Error fetching budgets:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (budget = null) => {
    if (budget) {
      setEditingBudget(budget);
      setForm({
        category: budget.category,
        limit: budget.limit.toString(),
        alertThreshold: budget.alertThreshold,
        resetDay: budget.resetDay || 1,
      });
    } else {
      setEditingBudget(null);
      setForm({
        category: "Food",
        limit: "",
        alertThreshold: 80,
        resetDay: 1,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingBudget(null);
  };

  const handleSubmit = async () => {
    try {
      const data = {
        ...form,
        limit: parseFloat(form.limit),
      };

      if (editingBudget) {
        await updateBudget(editingBudget._id, data);
        setSnackbar({
          open: true,
          message: "Budget updated!",
          severity: "success",
        });
      } else {
        await createBudget(data);
        setSnackbar({
          open: true,
          message: "Budget created!",
          severity: "success",
        });
      }
      handleCloseDialog();
      fetchBudgets();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Error saving budget",
        severity: "error",
      });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this budget?")) {
      try {
        await deleteBudget(id);
        setSnackbar({
          open: true,
          message: "Budget deleted!",
          severity: "success",
        });
        fetchBudgets();
      } catch (error) {
        setSnackbar({
          open: true,
          message: "Error deleting budget",
          severity: "error",
        });
      }
    }
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 100) return "error";
    if (percentage >= 80) return "warning";
    return "success";
  };

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Budgets
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Create Budget
        </Button>
      </Box>

      {/* Budgets Grid */}
      <Grid container spacing={3}>
        {budgets.length === 0 ? (
          <Grid size={{ xs: 12 }}>
            <Card sx={{ textAlign: "center", py: 6 }}>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                No budgets set yet
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => handleOpenDialog()}
              >
                Create Your First Budget
              </Button>
            </Card>
          </Grid>
        ) : (
          budgets.map((budget) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={budget._id}>
              <Card>
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      mb: 2,
                    }}
                  >
                    <Box>
                      <Typography variant="h6">{budget.category}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Resets on day {budget.resetDay} •{" "}
                        {budget.daysUntilReset} days left
                      </Typography>
                    </Box>
                    <Box>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(budget)}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(budget._id)}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 1,
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        ₹{budget.currentSpent.toLocaleString()} / ₹
                        {budget.limit.toLocaleString()}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          color: `${getProgressColor(budget.percentage)}.main`,
                        }}
                      >
                        {budget.percentage}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(budget.percentage, 100)}
                      color={getProgressColor(budget.percentage)}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Remaining: ₹{budget.remaining.toLocaleString()}
                    </Typography>
                    {budget.isOverBudget ? (
                      <Chip
                        icon={<Warning />}
                        label="Over Budget"
                        color="error"
                        size="small"
                      />
                    ) : budget.isNearLimit ? (
                      <Chip
                        icon={<Warning />}
                        label="Near Limit"
                        color="warning"
                        size="small"
                      />
                    ) : (
                      <Chip
                        icon={<CheckCircle />}
                        label="On Track"
                        color="success"
                        size="small"
                      />
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {/* Create/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingBudget ? "Edit Budget" : "Create Budget"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            <FormControl fullWidth disabled={!!editingBudget}>
              <InputLabel>Category</InputLabel>
              <Select
                value={form.category}
                label="Category"
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {categories.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Budget Limit"
              type="number"
              value={form.limit}
              onChange={(e) => setForm({ ...form, limit: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">₹</InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="Alert Threshold"
              type="number"
              value={form.alertThreshold}
              onChange={(e) =>
                setForm({ ...form, alertThreshold: parseInt(e.target.value) })
              }
              InputProps={{
                endAdornment: <InputAdornment position="end">%</InputAdornment>,
              }}
              helperText="Get alerted when spending reaches this percentage"
            />
            <TextField
              fullWidth
              label="Reset Day"
              type="number"
              value={form.resetDay}
              onChange={(e) =>
                setForm({ ...form, resetDay: parseInt(e.target.value) })
              }
              inputProps={{ min: 1, max: 28 }}
              helperText="Day of month when budget resets (1-28)"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {editingBudget ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <AnimatedSnackbar
        open={snackbar.open}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
        severity={snackbar.severity}
      />
    </Box>
  );
};

export default BudgetsPage;
