import React, { useState, useEffect } from "react";
import { Plus, Trash2, DollarSign, Calendar, Users, TrendingUp } from "lucide-react";
import { ExpensesAPI } from './apiService';

export default function ExpenseTab({ currentTrip, setCurrentTrip, trips, setTrips }) {
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState({});
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("FOOD");
  const [currency, setCurrency] = useState("USD");
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (currentTrip?.id) {
      fetchExpenses();
      fetchBalances();
      fetchTotal();
    }
  }, [currentTrip?.id]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const data = await ExpensesAPI.getExpensesForTrip(currentTrip.id);
      setExpenses(data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      setError('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  const fetchBalances = async () => {
    try {
      const data = await ExpensesAPI.getExpenseBalances(currentTrip.id);
      setBalances(data);
    } catch (error) {
      console.error('Error fetching balances:', error);
    }
  };

  const fetchTotal = async () => {
    try {
      const response = await fetch(`/api/trips/${currentTrip.id}/expenses/total`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        }
      });
      const data = await response.json();
      setTotalExpenses(data.total || 0);
    } catch (error) {
      console.error('Error fetching total:', error);
    }
  };

  const addExpense = async () => {
    setError("");

    if (!amount || !description) {
      setError("Please fill in amount and description");
      return;
    }

    if (parseFloat(amount) <= 0) {
      setError("Amount must be greater than 0");
      return;
    }

    setCreating(true);

    try {
      const expenseData = {
        amount: parseFloat(amount),
        currency: currency,
        description: description,
        category: category,
        expenseDate: expenseDate
      };

      await ExpensesAPI.createExpense(currentTrip.id, expenseData);

      await fetchExpenses();
      await fetchBalances();
      await fetchTotal();

      setAmount("");
      setDescription("");
      setCategory("FOOD");
      setCurrency("USD");
      setExpenseDate(new Date().toISOString().split('T')[0]);
      setError("");
    } catch (err) {
      console.error('Error creating expense:', err);
      setError('Failed to create expense. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const deleteExpense = async (expenseId) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) {
      return;
    }

    try {
      await ExpensesAPI.deleteExpense(expenseId);
      
      await fetchExpenses();
      await fetchBalances();
      await fetchTotal();
    } catch (error) {
      console.error('Error deleting expense:', error);
      setError('Failed to delete expense');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading expenses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Total Expenses Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">Total Expenses</p>
              <p className="text-3xl font-bold text-gray-900">${totalExpenses.toFixed(2)}</p>
              <p className="text-gray-500 text-xs mt-2">{expenses.length} transactions</p>
            </div>
            <div className="bg-indigo-100 rounded-lg p-3">
              <DollarSign className="text-indigo-600" size={28} />
            </div>
          </div>
        </div>

        {/* Balances Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-green-100 rounded-lg p-1.5">
              <TrendingUp className="text-green-600" size={18} />
            </div>
            <h4 className="text-base font-semibold text-gray-900">Balances</h4>
          </div>
          {Object.keys(balances).length === 0 ? (
            <p className="text-gray-500 text-sm">No balances yet</p>
          ) : (
            <div className="space-y-2">
              {Object.entries(balances).map(([name, balance]) => (
                <div key={name} className="flex justify-between items-center py-1">
                  <span className="text-sm text-gray-700">{name}</span>
                  <span className={`text-sm font-semibold ${
                    balance > 0 ? 'text-green-600' : balance < 0 ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {balance > 0 ? '+' : ''}{balance.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Expense Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="bg-indigo-100 rounded-lg p-2">
            <Plus className="text-indigo-600" size={18} />
          </div>
          <h4 className="text-lg font-semibold text-gray-900">Add New Expense</h4>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Amount *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                <input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 pl-9 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="INR">INR (₹)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Description *
            </label>
            <input
              type="text"
              placeholder="e.g., Dinner at The Italian Place"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              >
                <option value="FOOD">Food & Dining</option>
                <option value="TRANSPORTATION">Transportation</option>
                <option value="ACCOMMODATION">Accommodation</option>
                <option value="ENTERTAINMENT">Entertainment</option>
                <option value="SHOPPING">Shopping</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Date *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                <input
                  type="date"
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                  className="w-full px-3 py-2 pl-9 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <button
  onClick={addExpense}
  disabled={creating}
  className="bg-indigo-600 text-white py-2 rounded-lg font-medium text-sm hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed w-40"
>
  {creating ? (
    <>
      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
      Adding...
    </>
  ) : (
    <>
      <Plus size={16} />
      Add Expense
    </>
  )}
</button>
        </div>
      </div>

      {/* Expenses List */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-5">Expense History</h4>
        {expenses.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
              <DollarSign className="text-gray-400" size={32} />
            </div>
            <p className="text-gray-900 font-medium mb-1">No expenses yet</p>
            <p className="text-gray-500 text-sm">Add your first expense to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {expenses.map((exp) => (
              <div
                key={exp.id}
                className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h5 className="font-semibold text-gray-900 text-base mb-1">{exp.description}</h5>
                        <span className="inline-block px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-medium">
                          {exp.category}
                        </span>
                      </div>
                      <span className="text-xl font-bold text-indigo-600 ml-4">
                        {exp.currency} {exp.amount.toFixed(2)}
                      </span>
                    </div>
                    
                    <div className="space-y-1.5 mt-3">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                          Paid by {exp.paidBy.firstName} {exp.paidBy.lastName}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(exp.expenseDate).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </span>
                        <span className="text-gray-400">
                          Added {new Date(exp.createdAt).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => deleteExpense(exp.id)}
                    className="ml-3 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    title="Delete expense"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}