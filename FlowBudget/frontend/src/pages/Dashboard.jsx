import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, DollarSign, PieChart as PieIcon, Plus as PlusIcon } from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area, PieChart, Pie, Cell, Legend
} from 'recharts';
import { X } from 'lucide-react';
import MoneyRadar from '../components/MoneyRadar';
import SmartActions from '../components/SmartActions';
import SmartAlerts from '../components/SmartAlerts';
import FlowRank from '../components/FlowRank';
import { getWalletOperations, getWalletBalance } from '../services/walletAPI';

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1'];

const Dashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        balance: 0,
        income: 0,
        expense: 0,
        transactionsCount: 0
    });
    const [monthlyData, setMonthlyData] = useState([]);
    const [expenseCategories, setExpenseCategories] = useState([]);
    const [incomeCategories, setIncomeCategories] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 0. Fetch User
                const userResponse = await fetch('/FlowBudget/pages/api/getUser.php');
                if (userResponse.ok) {
                    const userData = await userResponse.json();
                    setUser(userData);
                }

                // 1. Fetch Transactions for Stats
                const transResponse = await fetch('/FlowBudget/pages/api/getTransactions.php');
                const transactions = await transResponse.json();

                let income = 0;
                let expense = 0;
                transactions.forEach(t => {
                    if (t.type === 'Revenu') income += parseFloat(t.montant);
                    else expense += parseFloat(t.montant);
                });

                setStats({
                    balance: income - expense,
                    income,
                    expense,
                    transactionsCount: transactions.length
                });

                // 2. Fetch Monthly Data (Line Chart)
                const monthlyResponse = await fetch('/FlowBudget/pages/api/getDepenseData.php');
                const monthlyRaw = await monthlyResponse.json();

                // Transform { labels: [], data: [], revenu: [] } to [{ name: 'Jan', income: 100, expense: 50 }, ...]
                const formattedMonthly = monthlyRaw.labels.map((label, index) => ({
                    name: label,
                    expense: parseFloat(monthlyRaw.data[index] || 0),
                    income: parseFloat(monthlyRaw.revenu[index] || 0)
                }));
                setMonthlyData(formattedMonthly);

                // 3. Fetch Expense Categories (Pie Chart)
                const expCatResponse = await fetch('/FlowBudget/pages/api/getExpenseCategories.php');
                const expCatData = await expCatResponse.json();
                setExpenseCategories(expCatData);

                // 4. Fetch Income Categories (Pie Chart)
                // We can reuse getRevenuData.php but we need to adapt the response format or create a new endpoint.
                // getRevenuData.php returns { categories: [], totaux: [] }
                const incCatResponse = await fetch('/FlowBudget/pages/api/getRevenuData.php');
                const incCatRaw = await incCatResponse.json();
                const formattedIncCat = incCatRaw.categories.map((cat, index) => ({
                    name: cat,
                    value: parseFloat(incCatRaw.totaux[index] || 0)
                }));
                setIncomeCategories(formattedIncCat);

                // 5. Fetch CIH Wallet Operations (Mock API)
                try {
                    const walletOps = await getWalletOperations("LAN193541347060000000001");
                    console.log("CIH Wallet Operations:", walletOps);

                    // 6. Fetch CIH Wallet Balance (Mock API)
                    const walletBalance = await getWalletBalance("LAN193541347060000000001");
                    console.log("CIH Wallet Balance:", walletBalance);

                    // TODO: Merge wallet operations with existing transactions
                    // TODO: Update balance with wallet balance
                } catch (walletError) {
                    console.error("Wallet API error:", walletError);
                }

                setLoading(false);
            } catch (error) {
                console.error("Error fetching data:", error);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <div className="flex justify-center items-center h-full">Loading...</div>;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary font-display tracking-tighter">
                        Hey, {user?.nom || 'User'} <span className="animate-pulse">👋</span>
                    </h2>
                    <p className="text-gray-400 mt-1 font-medium">Welcome to your financial dashboard</p>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div onClick={() => navigate('/flow-rank')}>
                        <FlowRank userId={user?.id} mode="mini" />
                    </div>
                    <button
                        onClick={() => navigate('/add-transaction')}
                        className="flex-1 md:flex-none flex items-center justify-center px-6 py-3 bg-primary text-white rounded-2xl font-bold hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(0,168,204,0.4)]"
                    >
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Add Transaction
                    </button>
                </div>
            </div>

            {/* Money Radar Section (Now includes Stats) */}
            <MoneyRadar userId={user?.id} stats={stats} />

            {/* Alerts & SmartActions Horizontal Split */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                <SmartAlerts userId={user?.id} />
                <SmartActions userId={user?.id} />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Income vs Expense Chart */}
                <div className="bg-dark-lighter/50 backdrop-blur-xl rounded-3xl p-8 border border-white/5 shadow-lg">
                    <h3 className="text-xl font-bold text-white mb-6 font-display">Cash Flow 💸</h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={monthlyData}>
                                <defs>
                                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#00A8CC" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#00A8CC" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#FF6B35" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#FF6B35" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#71717a', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#71717a', fontSize: 12 }}
                                    tickFormatter={(value) => `${value / 1000}k`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#18181B',
                                        borderRadius: '16px',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)'
                                    }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="income"
                                    stroke="#00A8CC"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorIncome)"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="expense"
                                    stroke="#FF6B35"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorExpense)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Categories Chart */}
                <div className="bg-dark-lighter/50 backdrop-blur-xl rounded-3xl p-8 border border-white/5 shadow-lg">
                    <h3 className="text-xl font-bold text-white mb-6 font-display">Expense Breakdown 📊</h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={expenseCategories}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={110}
                                    paddingAngle={5}
                                    dataKey="value"
                                    nameKey="name"
                                    stroke="none"
                                >
                                    {expenseCategories.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#18181B',
                                        borderRadius: '16px',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)'
                                    }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Legend
                                    verticalAlign="bottom"
                                    height={36}
                                    iconType="circle"
                                    formatter={(value) => <span className="text-gray-400 text-sm ml-1">{value}</span>}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>




            {/* Gamification Modal Removed - Now a separate page */}
        </div >
    );
};

export default Dashboard;
