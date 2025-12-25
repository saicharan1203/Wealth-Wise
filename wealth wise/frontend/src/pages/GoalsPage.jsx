import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  LinearProgress,
  IconButton,
  Chip,
  InputAdornment,
  Alert,
  Snackbar,
} from "@mui/material";
import { Add, Edit, Delete, Flag, CheckCircle } from "@mui/icons-material";
import {
  getGoals,
  createGoal,
  updateGoal,
  updateGoalProgress,
  deleteGoal,
} from "../services/api";
import AnimatedSnackbar from "../components/AnimatedSnackbar";

const GoalsPage = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [progressDialogOpen, setProgressDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [progressAmount, setProgressAmount] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [form, setForm] = useState({
    name: "",
    targetAmount: "",
    currentAmount: 0,
    deadline: "",
    category: "",
  });

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const res = await getGoals();
      setGoals(res.data.data);
    } catch (error) {
      console.error("Error fetching goals:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (goal = null) => {
    if (goal) {
      setEditingGoal(goal);
      setForm({
        name: goal.name,
        targetAmount: goal.targetAmount.toString(),
        currentAmount: goal.currentAmount,
        deadline: goal.deadline
          ? new Date(goal.deadline).toISOString().split("T")[0]
          : "",
        category: goal.category || "",
      });
    } else {
      setEditingGoal(null);
      setForm({
        name: "",
        targetAmount: "",
        currentAmount: 0,
        deadline: "",
        category: "",
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingGoal(null);
  };

  const handleSubmit = async () => {
    try {
      const data = {
        ...form,
        targetAmount: parseFloat(form.targetAmount),
      };

      if (editingGoal) {
        await updateGoal(editingGoal._id, data);
        setSnackbar({
          open: true,
          message: "Goal updated!",
          severity: "success",
        });
      } else {
        await createGoal(data);
        setSnackbar({
          open: true,
          message: "Goal created!",
          severity: "success",
        });
      }
      handleCloseDialog();
      fetchGoals();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Error saving goal",
        severity: "error",
      });
    }
  };

  const handleOpenProgressDialog = (goal) => {
    setEditingGoal(goal);
    setProgressAmount("");
    setProgressDialogOpen(true);
  };

  const handleAddProgress = async () => {
    try {
      await updateGoalProgress(editingGoal._id, parseFloat(progressAmount));
      setSnackbar({
        open: true,
        message: "Progress updated!",
        severity: "success",
      });
      setProgressDialogOpen(false);
      fetchGoals();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Error updating progress",
        severity: "error",
      });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this goal?")) {
      try {
        await deleteGoal(id);
        setSnackbar({
          open: true,
          message: "Goal deleted!",
          severity: "success",
        });
        fetchGoals();
      } catch (error) {
        setSnackbar({
          open: true,
          message: "Error deleting goal",
          severity: "error",
        });
      }
    }
  };

  const getProgress = (goal) => {
    if (!goal.targetAmount) return 0;
    return Math.round((goal.currentAmount / goal.targetAmount) * 100);
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
          Financial Goals
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Create Goal
        </Button>
      </Box>

      {/* Goals Grid */}
      <Grid container spacing={3}>
        {goals.length === 0 ? (
          <Grid size={{ xs: 12 }}>
            <Card sx={{ textAlign: "center", py: 6 }}>
              <Flag sx={{ fontSize: 60, color: "text.secondary", mb: 2 }} />
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                No financial goals yet
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => handleOpenDialog()}
              >
                Create Your First Goal
              </Button>
            </Card>
          </Grid>
        ) : (
          goals.map((goal) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={goal._id}>
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
                      <Typography variant="h6">{goal.name}</Typography>
                      {goal.deadline && (
                        <Typography variant="caption" color="text.secondary">
                          Deadline:{" "}
                          {new Date(goal.deadline).toLocaleDateString()}
                        </Typography>
                      )}
                    </Box>
                    <Chip
                      size="small"
                      label={goal.status}
                      color={
                        goal.status === "completed" ? "success" : "primary"
                      }
                      icon={
                        goal.status === "completed" ? (
                          <CheckCircle />
                        ) : undefined
                      }
                    />
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
                        ₹{goal.currentAmount?.toLocaleString()} / ₹
                        {goal.targetAmount?.toLocaleString()}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, color: "primary.main" }}
                      >
                        {getProgress(goal)}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(getProgress(goal), 100)}
                      color={
                        goal.status === "completed" ? "success" : "primary"
                      }
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>

                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleOpenProgressDialog(goal)}
                      disabled={goal.status === "completed"}
                    >
                      Add Progress
                    </Button>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(goal)}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(goal._id)}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
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
        <DialogTitle>{editingGoal ? "Edit Goal" : "Create Goal"}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              fullWidth
              label="Goal Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g., Vacation Fund, New Car"
            />
            <TextField
              fullWidth
              label="Target Amount"
              type="number"
              value={form.targetAmount}
              onChange={(e) =>
                setForm({ ...form, targetAmount: e.target.value })
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">₹</InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              type="date"
              label="Deadline"
              value={form.deadline}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="Category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              placeholder="e.g., Travel, Vehicle, Emergency"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {editingGoal ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Progress Dialog */}
      <Dialog
        open={progressDialogOpen}
        onClose={() => setProgressDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Add Progress</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Amount to Add"
              type="number"
              value={progressAmount}
              onChange={(e) => setProgressAmount(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">₹</InputAdornment>
                ),
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setProgressDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddProgress}>
            Add
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

export default GoalsPage;
