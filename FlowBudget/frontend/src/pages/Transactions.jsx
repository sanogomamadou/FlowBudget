import React, { useEffect, useState } from 'react';
import { ArrowUpRight, ArrowDownLeft, Search, Filter, Wallet } from 'lucide-react';
import { cn } from '../lib/utils';
import { getWalletOperations } from '../services/walletAPI';

const Transactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [sortBy, setSortBy] = useState('date-desc'); // date-desc, date-asc, amount-desc, amount-asc
    const [dateRange, setDateRange] = useState('all'); // all, this-month, last-month
    const [lastSync, setLastSync] = useState(null);

    // Transform wallet operation to transaction format
    const transformWalletOperation = (op) => ({
        id: `wallet-${op.referenceId}`,
        type: op.type === 'MMD' || op.type === 'CASHIN' ? 'Revenu' : 'Dépense',
        categorie: op.clientNote || op.type,
        montant: op.amount,
        date: new Date(op.date).toISOString(),
        description: `${op.beneficiaryFirstName || ''} ${op.beneficiaryLastName || ''}`.trim() || 'Wallet Transaction',
        source: 'wallet', // Mark as wallet transaction
        fees: op.Fees,
        status: op.status,
        referenceId: op.referenceId
    });

    const fetchTransactions = async () => {
        try {
            // 1. Fetch manual transactions from PHP API
            const manualResponse = await fetch('/FlowBudget/pages/api/getTransactions.php');
            const manualData = await manualResponse.json();

            // 2. Fetch wallet operations from CIH API (mock)
            const walletData = await getWalletOperations("LAN193541347060000000001");
            const walletOperations = walletData.result.filter(op => op.status === '000');

            // 3. Sync wallet transactions to database (only new ones)
            for (const op of walletOperations) {
                try {
                    await fetch('/FlowBudget/pages/api/saveWalletTransaction.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(op)
                    });
                } catch (syncError) {
                    console.error('Error syncing transaction:', syncError);
                }
            }

            // 4. Re-fetch manual transactions (now includes synced wallet transactions)
            const updatedResponse = await fetch('/FlowBudget/pages/api/getTransactions.php');
            const updatedData = await updatedResponse.json();

            // 5. Transform wallet operations for display
            const walletTransactions = walletOperations.map(transformWalletOperation);

            // 6. Merge both sources (DB transactions + live wallet display)
            const allTransactions = [
                ...updatedData.map(t => ({ ...t, source: 'manual' })),
                ...walletTransactions
            ];

            setTransactions(allTransactions);
            setLastSync(new Date());
            setLoading(false);
        } catch (error) {
            console.error("Error fetching transactions:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();

        // Auto-refresh every 30 seconds
        const interval = setInterval(() => {
            fetchTransactions();
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    const filteredTransactions = transactions.filter(t => {
        // 1. Type Filter
        const matchesType = filter === 'All' || t.type === filter;

        // 2. Search Filter
        const matchesSearch = t.categorie.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.montant.toString().includes(searchQuery);

        // 3. Date Range Filter
        let matchesDate = true;
        const tDate = new Date(t.date);
        const now = new Date();
        if (dateRange === 'this-month') {
            matchesDate = tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear();
        } else if (dateRange === 'last-month') {
            const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            matchesDate = tDate.getMonth() === lastMonth.getMonth() && tDate.getFullYear() === lastMonth.getFullYear();
        }

        return matchesType && matchesSearch && matchesDate;
    }).sort((a, b) => {
        // 4. Sorting
        if (sortBy === 'date-desc') return new Date(b.date) - new Date(a.date);
        if (sortBy === 'date-asc') return new Date(a.date) - new Date(b.date);
        if (sortBy === 'amount-desc') return parseFloat(b.montant) - parseFloat(a.montant);
        if (sortBy === 'amount-asc') return parseFloat(a.montant) - parseFloat(b.montant);
        return 0;
    });

    if (loading) return <div className="flex justify-center items-center h-full">Loading...</div>;

    return (
        <div className="space-y-6">
            <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary font-display tracking-tighter">Transactions</h2>
                    <div className="flex items-center gap-2 mt-1">
                        <p className="text-gray-400 font-medium">Manage your income and expenses.</p>
                        {lastSync && (
                            <span className="text-xs text-gray-500">
                                • Synced {Math.floor((new Date() - lastSync) / 1000)}s ago
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-3 relative">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 rounded-xl border border-white/10 bg-dark-lighter/50 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary w-full md:w-64 placeholder:text-gray-600"
                        />
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={cn(
                            "p-2 rounded-xl border transition-colors",
                            showFilters ? "bg-primary text-dark border-primary" : "border-white/10 bg-dark-lighter/50 text-gray-400 hover:bg-white/5 hover:text-white"
                        )}
                    >
                        <Filter className="w-5 h-5" />
                    </button>

                    {/* Filter Dropdown */}
                    {showFilters && (
                        <div className="absolute top-full right-0 mt-2 w-64 bg-dark-lighter border border-white/10 rounded-xl shadow-xl p-4 z-10 space-y-4 backdrop-blur-xl">
                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Sort By</label>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="w-full p-2 rounded-lg border border-white/10 bg-dark text-white text-sm focus:outline-none focus:border-primary"
                                >
                                    <option value="date-desc">Date (Newest First)</option>
                                    <option value="date-asc">Date (Oldest First)</option>
                                    <option value="amount-desc">Amount (High to Low)</option>
                                    <option value="amount-asc">Amount (Low to High)</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Date Range</label>
                                <select
                                    value={dateRange}
                                    onChange={(e) => setDateRange(e.target.value)}
                                    className="w-full p-2 rounded-lg border border-white/10 bg-dark text-white text-sm focus:outline-none focus:border-primary"
                                >
                                    <option value="all">All Time</option>
                                    <option value="this-month">This Month</option>
                                    <option value="last-month">Last Month</option>
                                </select>
                            </div>
                        </div>
                    )}
                </div>
            </header>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 border-b border-white/10 pb-1">
                {['All', 'Revenu', 'Dépense'].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={cn(
                            "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                            filter === f
                                ? "bg-primary/10 text-primary"
                                : "text-gray-500 hover:text-white hover:bg-white/5"
                        )}
                    >
                        {f === 'Revenu' ? 'Income' : f === 'Dépense' ? 'Expense' : 'All'}
                    </button>
                ))}
            </div>

            {/* Transactions List */}
            <div className="bg-dark-lighter/50 backdrop-blur-xl rounded-3xl shadow-sm border border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-white/5 border-b border-white/5">
                            <tr>
                                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-400 uppercase tracking-wider">Type</th>
                                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-400 uppercase tracking-wider">Category</th>
                                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</th>
                                <th className="text-right py-4 px-6 text-xs font-semibold text-gray-400 uppercase tracking-wider">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredTransactions.map((t) => (
                                <tr key={t.id || Math.random()} className="hover:bg-white/5 transition-colors group">
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "w-10 h-10 rounded-full flex items-center justify-center transition-transform group-hover:scale-110",
                                                t.type === 'Revenu' ? "bg-secondary/10 text-secondary" : "bg-primary/10 text-primary"
                                            )}>
                                                {t.type === 'Revenu' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                                            </div>
                                            <span className="font-medium text-white">{t.type}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-2">
                                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/5 text-gray-300 border border-white/5">
                                                {t.categorie}
                                            </span>
                                            {t.source === 'wallet' && (
                                                <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/30">
                                                    <Wallet className="w-3 h-3" />
                                                    CIH
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-gray-400 text-sm">{new Date(t.date).toLocaleDateString()}</td>
                                    <td className={cn(
                                        "py-4 px-6 text-right font-bold font-display",
                                        t.type === 'Revenu' ? "text-secondary" : "text-primary"
                                    )}>
                                        {t.type === 'Revenu' ? '+' : '-'}{parseFloat(t.montant).toFixed(2)} MAD
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Transactions;
