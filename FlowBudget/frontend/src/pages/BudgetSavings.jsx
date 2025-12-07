import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, PiggyBank, Target, Plus, TrendingUp, Lock, Unlock, Calendar, Coins, X, Trash2 } from 'lucide-react';

const EXPENSE_CATEGORIES = ["Abonnement", "Alimentation", "Factures", "Fournitures", "Loyer", "Santé", "Soins corporels", "Loisir", "Transport", "Vêtements", "Autres"];

const BudgetSavings = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('budgets');
    const [budgets, setBudgets] = useState([]);
    const [savingsGoals, setSavingsGoals] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal states
    const [showBudgetModal, setShowBudgetModal] = useState(false);
    const [showSavingsModal, setShowSavingsModal] = useState(false);
    const [showContributeModal, setShowContributeModal] = useState(false);
    const [selectedGoal, setSelectedGoal] = useState(null);

    // Form states
    const [budgetForm, setBudgetForm] = useState({ category: EXPENSE_CATEGORIES[0], amount: '' });
    const [savingsForm, setSavingsForm] = useState({
        name: '',
        target_amount: '',
        target_date: '',
        auto_contribute: false,
        contribution_amount: '',
        contribution_frequency: 'monthly'
    });
    const [contributeAmount, setContributeAmount] = useState('');

    useEffect(() => {
        fetchUser();
        fetchBudgets();
        fetchSavingsGoals();
    }, []);

    const fetchUser = async () => {
        try {
            const response = await fetch('/FlowBudget/pages/api/getUser.php');
            if (response.ok) {
                const userData = await response.json();
                setUser(userData);
            }
        } catch (error) {
            console.error("Error fetching user:", error);
        }
    };

    const fetchBudgets = async () => {
        try {
            const response = await fetch('/FlowBudget/pages/api/budgets.php');
            if (response.ok) {
                const data = await response.json();
                setBudgets(data);
            }
        } catch (error) {
            console.error("Error fetching budgets:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSavingsGoals = async () => {
        try {
            const response = await fetch('/FlowBudget/pages/api/savings_goals.php');
            if (response.ok) {
                const data = await response.json();
                setSavingsGoals(data);
            }
        } catch (error) {
            console.error("Error fetching savings goals:", error);
        }
    };

    const handleCreateBudget = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/FlowBudget/pages/api/budgets.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(budgetForm)
            });
            if (response.ok) {
                fetchBudgets();
                setShowBudgetModal(false);
                setBudgetForm({ category: EXPENSE_CATEGORIES[0], amount: '' });
            }
        } catch (error) {
            console.error("Error creating budget:", error);
        }
    };

    const handleDeleteBudget = async (id) => {
        if (!confirm('Delete this budget?')) return;
        try {
            const response = await fetch(`/FlowBudget/pages/api/budgets.php?id=${id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                fetchBudgets();
            }
        } catch (error) {
            console.error("Error deleting budget:", error);
        }
    };

    const handleCreateSavingsGoal = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/FlowBudget/pages/api/savings_goals.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(savingsForm)
            });
            if (response.ok) {
                fetchSavingsGoals();
                setShowSavingsModal(false);
                setSavingsForm({
                    name: '',
                    target_amount: '',
                    target_date: '',
                    auto_contribute: false,
                    contribution_amount: '',
                    contribution_frequency: 'monthly'
                });
            }
        } catch (error) {
            console.error("Error creating savings goal:", error);
        }
    };

    const handleContribute = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/FlowBudget/pages/api/savings_goals.php', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: selectedGoal.id, contribute: parseFloat(contributeAmount) })
            });
            if (response.ok) {
                fetchSavingsGoals();
                setShowContributeModal(false);
                setContributeAmount('');
                setSelectedGoal(null);
            }
        } catch (error) {
            console.error("Error contributing:", error);
        }
    };

    const handleWithdraw = async (goal) => {
        if (goal.is_locked) {
            alert('Cannot withdraw before target date!');
            return;
        }
        const amount = prompt('Enter amount to withdraw:');
        if (!amount) return;

        try {
            const response = await fetch('/FlowBudget/pages/api/savings_goals.php', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: goal.id, withdraw: parseFloat(amount) })
            });
            const data = await response.json();
            if (response.ok) {
                fetchSavingsGoals();
            } else {
                alert(data.error || 'Withdrawal failed');
            }
        } catch (error) {
            console.error("Error withdrawing:", error);
        }
    };

    const handleDeleteGoal = async (id) => {
        if (!confirm('Delete this savings goal?')) return;
        try {
            const response = await fetch(`/FlowBudget/pages/api/savings_goals.php?id=${id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                fetchSavingsGoals();
            }
        } catch (error) {
            console.error("Error deleting goal:", error);
        }
    };

    const getBudgetStatus = (spent, limit) => {
        const percentage = (spent / limit) * 100;
        if (percentage >= 100) return { color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/30', label: 'Exceeded' };
        if (percentage >= 80) return { color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', label: 'Warning' };
        return { color: 'text-secondary', bg: 'bg-secondary/10', border: 'border-secondary/30', label: 'On Track' };
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <header className="flex items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div>
                    <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary font-display tracking-tighter">
                        Budget & Savings
                    </h2>
                    <p className="text-gray-400 font-medium">Manage your spending limits and savings goals</p>
                </div>
            </header>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-white/10">
                <button
                    onClick={() => setActiveTab('budgets')}
                    className={`px-6 py-3 font-bold transition-all relative ${activeTab === 'budgets' ? 'text-primary' : 'text-gray-400 hover:text-white'
                        }`}
                >
                    <Target className="w-5 h-5 inline mr-2" />
                    Category Budgets
                    {activeTab === 'budgets' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>}
                </button>
                <button
                    onClick={() => setActiveTab('savings')}
                    className={`px-6 py-3 font-bold transition-all relative ${activeTab === 'savings' ? 'text-secondary' : 'text-gray-400 hover:text-white'
                        }`}
                >
                    <PiggyBank className="w-5 h-5 inline mr-2" />
                    Savings Goals
                    {activeTab === 'savings' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary"></div>}
                </button>
            </div>

            {/* Content */}
            {activeTab === 'budgets' ? (
                <div className="space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <p className="text-gray-400">Set monthly spending limits for each category</p>
                        <button
                            onClick={() => setShowBudgetModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(255,107,53,0.3)] hover:scale-[1.02] w-fit"
                        >
                            <Plus className="w-5 h-5" />
                            Add Budget
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : budgets.length === 0 ? (
                        <div className="bg-dark-lighter/50 backdrop-blur-xl rounded-3xl p-12 border border-white/5 text-center">
                            <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-white mb-2">No Budgets Yet</h3>
                            <p className="text-gray-400 mb-6">Start by creating your first budget to track spending</p>
                            <button
                                onClick={() => setShowBudgetModal(true)}
                                className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all"
                            >
                                Create Budget
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {budgets.map((budget) => {
                                const status = getBudgetStatus(parseFloat(budget.spent), parseFloat(budget.amount));
                                const percentage = Math.min((parseFloat(budget.spent) / parseFloat(budget.amount)) * 100, 100);

                                return (
                                    <div key={budget.id} className={`bg-dark-lighter/50 backdrop-blur-xl rounded-2xl p-6 border ${status.border} hover:scale-[1.02] transition-all group`}>
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <h3 className="text-lg font-bold text-white">{budget.category}</h3>
                                                <span className={`text-xs font-bold uppercase tracking-wider ${status.color}`}>{status.label}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className={`p-2 rounded-lg ${status.bg}`}>
                                                    <Coins className={`w-5 h-5 ${status.color}`} />
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteBudget(budget.id)}
                                                    className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-400">Spent</span>
                                                <span className={`font-bold ${status.color}`}>{parseFloat(budget.spent).toFixed(2)} DH</span>
                                            </div>
                                            <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full ${status.bg.replace('/10', '')} transition-all duration-500`}
                                                    style={{ width: `${percentage}%` }}
                                                ></div>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Budget</span>
                                                <span className="text-white font-bold">{parseFloat(budget.amount).toFixed(2)} DH</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <p className="text-gray-400">Create savings goals with automated contributions</p>
                        <button
                            onClick={() => setShowSavingsModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-xl hover:bg-secondary/90 transition-all shadow-[0_0_20px_rgba(0,168,204,0.3)] hover:scale-[1.02] w-fit"
                        >
                            <Plus className="w-5 h-5" />
                            Add Savings Goal
                        </button>
                    </div>

                    {savingsGoals.length === 0 ? (
                        <div className="bg-dark-lighter/50 backdrop-blur-xl rounded-3xl p-12 border border-white/5 text-center">
                            <PiggyBank className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-white mb-2">No Savings Goals Yet</h3>
                            <p className="text-gray-400 mb-6">Start saving for your dreams with automated goals</p>
                            <button
                                onClick={() => setShowSavingsModal(true)}
                                className="px-6 py-3 bg-secondary text-white rounded-xl hover:bg-secondary/90 transition-all"
                            >
                                Create Savings Goal
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {savingsGoals.map((goal) => {
                                const percentage = Math.min((parseFloat(goal.current_amount) / parseFloat(goal.target_amount)) * 100, 100);
                                const isLocked = goal.is_locked;

                                return (
                                    <div key={goal.id} className="bg-dark-lighter/50 backdrop-blur-xl rounded-2xl p-6 border border-secondary/20 hover:border-secondary/40 transition-all group">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <h3 className="text-xl font-bold text-white mb-1">{goal.name}</h3>
                                                <div className="flex items-center gap-2 text-sm">
                                                    {isLocked ? (
                                                        <span className="flex items-center gap-1 text-yellow-500">
                                                            <Lock className="w-4 h-4" />
                                                            {goal.days_remaining} days left
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1 text-green-400">
                                                            <Unlock className="w-4 h-4" />
                                                            Unlocked
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="p-2 rounded-lg bg-secondary/10">
                                                    <PiggyBank className="w-6 h-6 text-secondary" />
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteGoal(goal.id)}
                                                    className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex justify-between items-end">
                                                <span className="text-gray-400 text-sm">Progress</span>
                                                <span className="text-2xl font-bold text-secondary font-display">
                                                    {parseFloat(goal.current_amount).toFixed(0)} / {parseFloat(goal.target_amount).toFixed(0)} DH
                                                </span>
                                            </div>

                                            <div className="h-3 bg-black/40 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-secondary to-primary transition-all duration-500"
                                                    style={{ width: `${percentage}%` }}
                                                ></div>
                                            </div>

                                            {goal.auto_contribute && (
                                                <div className="flex items-center gap-2 text-xs text-gray-400 bg-white/5 px-3 py-2 rounded-lg">
                                                    <TrendingUp className="w-4 h-4 text-secondary" />
                                                    Auto: {parseFloat(goal.contribution_amount).toFixed(0)} DH / {goal.contribution_frequency}
                                                </div>
                                            )}

                                            <div className="flex gap-2 mt-4">
                                                <button
                                                    onClick={() => {
                                                        setSelectedGoal(goal);
                                                        setShowContributeModal(true);
                                                    }}
                                                    className="flex-1 px-4 py-2 bg-secondary/10 text-secondary rounded-xl hover:bg-secondary/20 transition-all text-sm font-bold"
                                                >
                                                    Contribute
                                                </button>
                                                {!isLocked && (
                                                    <button
                                                        onClick={() => handleWithdraw(goal)}
                                                        className="flex-1 px-4 py-2 bg-primary/10 text-primary rounded-xl hover:bg-primary/20 transition-all text-sm font-bold"
                                                    >
                                                        Withdraw
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Budget Modal */}
            {showBudgetModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-dark-lighter border border-white/10 rounded-3xl p-8 max-w-md w-full">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-white">Create Budget</h3>
                            <button onClick={() => setShowBudgetModal(false)} className="text-gray-400 hover:text-white">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateBudget} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-400 mb-2 block">Category</label>
                                <select
                                    value={budgetForm.category}
                                    onChange={(e) => setBudgetForm({ ...budgetForm, category: e.target.value })}
                                    className="w-full p-3 rounded-xl bg-dark border border-white/10 text-white focus:border-primary transition-all outline-none"
                                >
                                    {EXPENSE_CATEGORIES.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-400 mb-2 block">Monthly Limit (DH)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={budgetForm.amount}
                                    onChange={(e) => setBudgetForm({ ...budgetForm, amount: e.target.value })}
                                    className="w-full p-3 rounded-xl bg-dark border border-white/10 text-white focus:border-primary transition-all outline-none"
                                    placeholder="0.00"
                                />
                            </div>
                            <button type="submit" className="w-full py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all font-bold">
                                Create Budget
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Savings Goal Modal */}
            {showSavingsModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-dark-lighter border border-white/10 rounded-3xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-white">Create Savings Goal</h3>
                            <button onClick={() => setShowSavingsModal(false)} className="text-gray-400 hover:text-white">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateSavingsGoal} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-400 mb-2 block">Goal Name</label>
                                <input
                                    type="text"
                                    required
                                    value={savingsForm.name}
                                    onChange={(e) => setSavingsForm({ ...savingsForm, name: e.target.value })}
                                    className="w-full p-3 rounded-xl bg-dark border border-white/10 text-white focus:border-secondary transition-all outline-none"
                                    placeholder="e.g., Vacation Fund"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-400 mb-2 block">Target Amount (DH)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={savingsForm.target_amount}
                                    onChange={(e) => setSavingsForm({ ...savingsForm, target_amount: e.target.value })}
                                    className="w-full p-3 rounded-xl bg-dark border border-white/10 text-white focus:border-secondary transition-all outline-none"
                                    placeholder="0.00"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-400 mb-2 block">Target Date</label>
                                <input
                                    type="date"
                                    required
                                    value={savingsForm.target_date}
                                    onChange={(e) => setSavingsForm({ ...savingsForm, target_date: e.target.value })}
                                    className="w-full p-3 rounded-xl bg-dark border border-white/10 text-white focus:border-secondary transition-all outline-none"
                                />
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl">
                                <input
                                    type="checkbox"
                                    id="auto"
                                    checked={savingsForm.auto_contribute}
                                    onChange={(e) => setSavingsForm({ ...savingsForm, auto_contribute: e.target.checked })}
                                    className="w-5 h-5"
                                />
                                <label htmlFor="auto" className="text-white font-medium">Enable Auto-Contribution</label>
                            </div>
                            {savingsForm.auto_contribute && (
                                <>
                                    <div>
                                        <label className="text-sm font-medium text-gray-400 mb-2 block">Contribution Amount (DH)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={savingsForm.contribution_amount}
                                            onChange={(e) => setSavingsForm({ ...savingsForm, contribution_amount: e.target.value })}
                                            className="w-full p-3 rounded-xl bg-dark border border-white/10 text-white focus:border-secondary transition-all outline-none"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-400 mb-2 block">Frequency</label>
                                        <select
                                            value={savingsForm.contribution_frequency}
                                            onChange={(e) => setSavingsForm({ ...savingsForm, contribution_frequency: e.target.value })}
                                            className="w-full p-3 rounded-xl bg-dark border border-white/10 text-white focus:border-secondary transition-all outline-none"
                                        >
                                            <option value="daily">Daily</option>
                                            <option value="weekly">Weekly</option>
                                            <option value="monthly">Monthly</option>
                                        </select>
                                    </div>
                                </>
                            )}
                            <button type="submit" className="w-full py-3 bg-secondary text-white rounded-xl hover:bg-secondary/90 transition-all font-bold">
                                Create Savings Goal
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Contribute Modal */}
            {showContributeModal && selectedGoal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-dark-lighter border border-white/10 rounded-3xl p-8 max-w-md w-full">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-white">Contribute to {selectedGoal.name}</h3>
                            <button onClick={() => { setShowContributeModal(false); setSelectedGoal(null); }} className="text-gray-400 hover:text-white">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleContribute} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-400 mb-2 block">Amount (DH)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={contributeAmount}
                                    onChange={(e) => setContributeAmount(e.target.value)}
                                    className="w-full p-3 rounded-xl bg-dark border border-white/10 text-white focus:border-secondary transition-all outline-none"
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="p-4 bg-secondary/10 rounded-xl">
                                <p className="text-sm text-gray-400">Current: {parseFloat(selectedGoal.current_amount).toFixed(2)} DH</p>
                                <p className="text-sm text-gray-400">Target: {parseFloat(selectedGoal.target_amount).toFixed(2)} DH</p>
                            </div>
                            <button type="submit" className="w-full py-3 bg-secondary text-white rounded-xl hover:bg-secondary/90 transition-all font-bold">
                                Contribute
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BudgetSavings;
