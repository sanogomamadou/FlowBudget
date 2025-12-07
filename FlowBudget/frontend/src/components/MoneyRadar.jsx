import React from 'react';
import { TrendingUp, TrendingDown, Coins, PieChart as PieIcon, Shield } from 'lucide-react';

const MoneyRadar = ({ userId, stats }) => {
    // State for predictive balance
    const [balanceData, setBalanceData] = React.useState([]);
    const [currentBalance, setCurrentBalance] = React.useState(0);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        if (!userId) return;

        const fetchDashboardData = async () => {
            try {
                const response = await fetch(`http://localhost:8000/dashboard-data/${userId}`);
                const data = await response.json();

                if (data.money_radar && !data.money_radar.error) {
                    setBalanceData(data.money_radar.predictions);
                    setCurrentBalance(data.money_radar.current_balance);
                }
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [userId]);

    const predictedBalance7d = balanceData.length > 0 ? balanceData[balanceData.length - 1].predicted : 0;

    // Use passed stats if available, otherwise fallback to local fetch data
    const displayBalance = stats?.balance || currentBalance;

    // Calculate prediction as 75% of current balance
    const calculatedPrediction = displayBalance * 0.75;
    const finalPrediction = predictedBalance7d || calculatedPrediction;
    const trend = finalPrediction - displayBalance;
    const trendPercent = displayBalance !== 0 ? ((trend / displayBalance) * 100).toFixed(1) : 0;
    const displayIncome = stats?.income || 0;
    const displayExpense = stats?.expense || 0;
    const displayCount = stats?.transactionsCount || 0;

    return (
        <div className="space-y-6">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-dark-lighter to-secondary/10 p-1 border border-white/10 shadow-xl">
                {/* Background Blurs */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[120px] -z-10 animate-pulse-slow"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/20 rounded-full blur-[120px] -z-10 animate-pulse-slow delay-1000"></div>

                <div className="bg-dark/80 backdrop-blur-md rounded-[22px] p-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-3xl font-bold text-white font-display tracking-tight flex items-center gap-3">
                                Money Radar <span className="text-sm font-normal text-gray-400 bg-white/5 px-3 py-1 rounded-full border border-white/5 tracking-normal flex items-center gap-2">
                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                    Live Monitoring
                                </span>
                            </h2>
                        </div>
                        <div className="flex items-center gap-4">
                            {/* Risk badge */}
                            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500/10 border border-orange-500/30">
                                <Shield className="w-4 h-4 text-orange-400" />
                                <span className="font-bold text-orange-400 text-sm">Medium Risk</span>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                        {/* 1. Current Balance */}
                        <div className="group bg-white/5 hover:bg-white/10 transition-all duration-300 rounded-2xl p-5 border border-white/5 hover:border-primary/30">
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Current Balance</p>
                            <div className="flex items-end justify-between">
                                <h3 className="text-2xl font-bold text-white font-display group-hover:text-primary transition-colors">
                                    {displayBalance.toFixed(2)} <span className="text-sm">DH</span>
                                </h3>
                                <Coins className="w-8 h-8 text-white/10 group-hover:text-primary/50 transition-colors -mb-1 -mr-1" />
                            </div>
                        </div>

                        {/* 2. Income */}
                        <div className="group bg-white/5 hover:bg-white/10 transition-all duration-300 rounded-2xl p-5 border border-white/5 hover:border-secondary/30">
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Total Income</p>
                            <div className="flex items-end justify-between">
                                <h3 className="text-2xl font-bold text-secondary font-display">
                                    +{displayIncome.toFixed(2)} <span className="text-sm">DH</span>
                                </h3>
                                <TrendingUp className="w-8 h-8 text-white/10 group-hover:text-secondary/50 transition-colors -mb-1 -mr-1" />
                            </div>
                        </div>

                        {/* 3. Expenses */}
                        <div className="group bg-white/5 hover:bg-white/10 transition-all duration-300 rounded-2xl p-5 border border-white/5 hover:border-primary/30">
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Total Expenses</p>
                            <div className="flex items-end justify-between">
                                <h3 className="text-2xl font-bold text-primary font-display">
                                    -{displayExpense.toFixed(2)} <span className="text-sm">DH</span>
                                </h3>
                                <TrendingDown className="w-8 h-8 text-white/10 group-hover:text-primary/50 transition-colors -mb-1 -mr-1" />
                            </div>
                        </div>

                        {/* 4. Prediction */}
                        <div className="group bg-gradient-to-br from-primary/10 to-transparent hover:from-primary/20 transition-all duration-300 rounded-2xl p-5 border border-primary/20 hover:border-primary/40">
                            <p className="text-primary/80 text-xs font-bold uppercase tracking-widest mb-1">7-Day Forecast</p>
                            <div className="flex items-end justify-between">
                                <div>
                                    <h3 className="text-2xl font-bold text-primary font-display">
                                        {finalPrediction.toFixed(2)} <span className="text-sm">DH</span>
                                    </h3>
                                    <div className="flex items-center gap-1 mt-1">
                                        {trend < 0 ? <TrendingDown className="w-3 h-3 text-primary" /> : <TrendingUp className="w-3 h-3 text-secondary" />}
                                        <span className={`text-xs font-bold ${trend < 0 ? 'text-primary' : 'text-secondary'}`}>
                                            {trendPercent}% vs today
                                        </span>
                                    </div>
                                </div>
                                <PieIcon className="w-8 h-8 text-primary/20 group-hover:text-primary/50 transition-colors -mb-1 -mr-1" />
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default MoneyRadar;
