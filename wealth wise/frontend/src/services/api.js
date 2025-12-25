import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

// Auth
export const updatePassword = (currentPassword, newPassword) =>
  axios.put(`${API_URL}/auth/password`, { currentPassword, newPassword });

// Accounts
export const getAccounts = () => axios.get(`${API_URL}/accounts`);
export const getAvailableBanks = () => axios.get(`${API_URL}/accounts/banks`);
export const linkBankAccount = (bankName, accountNumber) =>
  axios.post(`${API_URL}/accounts/link-bank`, { bankName, accountNumber });
export const unlinkAccount = (id) => axios.delete(`${API_URL}/accounts/${id}`);

// Transactions
export const getTransactions = (params) =>
  axios.get(`${API_URL}/transactions`, { params });
export const createTransaction = (data) =>
  axios.post(`${API_URL}/transactions`, data);
export const updateTransaction = (id, data) =>
  axios.put(`${API_URL}/transactions/${id}`, data);
export const deleteTransaction = (id) =>
  axios.delete(`${API_URL}/transactions/${id}`);
export const deleteAllTransactions = () =>
  axios.delete(`${API_URL}/transactions/all`);

// Budgets
export const getBudgets = () => axios.get(`${API_URL}/budgets`);
export const getBudgetStatus = () => axios.get(`${API_URL}/budgets/status`);
export const createBudget = (data) => axios.post(`${API_URL}/budgets`, data);
export const updateBudget = (id, data) =>
  axios.put(`${API_URL}/budgets/${id}`, data);
export const deleteBudget = (id) => axios.delete(`${API_URL}/budgets/${id}`);

// Dashboard
export const getDashboardSummary = () =>
  axios.get(`${API_URL}/dashboard/summary`);
export const getByCategory = (params) =>
  axios.get(`${API_URL}/dashboard/by-category`, { params });
export const getByDate = (params) =>
  axios.get(`${API_URL}/dashboard/by-date`, { params });
export const getTrends = () => axios.get(`${API_URL}/dashboard/trends`);

// Goals
export const getGoals = () => axios.get(`${API_URL}/goals`);
export const createGoal = (data) => axios.post(`${API_URL}/goals`, data);
export const updateGoal = (id, data) =>
  axios.put(`${API_URL}/goals/${id}`, data);
export const updateGoalProgress = (id, amount) =>
  axios.put(`${API_URL}/goals/${id}/progress`, { amount });
export const deleteGoal = (id) => axios.delete(`${API_URL}/goals/${id}`);

// Export
export const exportToExcel = (params) =>
  axios.get(`${API_URL}/export/excel`, {
    params,
    responseType: "blob",
  });
export const exportToPDF = (params) =>
  axios.get(`${API_URL}/export/pdf`, {
    params,
    responseType: "blob",
  });
