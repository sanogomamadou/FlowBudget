import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, CreditCard, User, Bot, LogOut, ArrowRightLeft, PiggyBank } from 'lucide-react';
import { cn } from '../lib/utils';

const Layout = ({ children }) => {
    const location = useLocation();

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: CreditCard, label: 'Transactions', path: '/transactions' },
        { icon: ArrowRightLeft, label: 'Operations', path: '/operations' },
        { icon: PiggyBank, label: 'Budget & Savings', path: '/budget-savings' },
        { icon: Bot, label: 'AI Advice', path: '/ai-advice' },
        { icon: User, label: 'Profile', path: '/profile' },
    ];

    return (
        <div className="flex min-h-screen bg-dark text-white font-sans selection:bg-primary selection:text-dark">
            {/* Sidebar */}
            <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-dark-lighter/50 backdrop-blur-xl border-r border-white/10 shadow-2xl transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-auto">
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-8">
                        <img src="/FlowBudget/frontend/dist/logo.png" alt="FlowBudget Logo" className="w-10 h-10 rounded-xl shadow-[0_0_15px_rgba(0,168,204,0.4)]" />
                        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary font-display tracking-tighter">
                            FlowBudget
                        </h1>
                    </div>
                    <nav className="space-y-2">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={cn(
                                        "flex items-center px-4 py-3.5 text-sm font-medium rounded-2xl transition-all duration-300 group",
                                        isActive
                                            ? "bg-primary text-white shadow-[0_0_20px_rgba(0,168,204,0.3)] scale-[1.02]"
                                            : "text-gray-400 hover:bg-white/5 hover:text-white hover:scale-[1.02]"
                                    )}
                                >
                                    <Icon className={cn("w-5 h-5 mr-3 transition-transform group-hover:rotate-12", isActive ? "text-dark" : "text-gray-500 group-hover:text-primary")} />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
                <div className="absolute bottom-0 w-full p-4 border-t border-white/10">
                    <a
                        href="http://localhost/FlowBudget/pages/logout.php"
                        className="flex items-center px-4 py-3 text-sm font-medium text-red-500 rounded-2xl hover:bg-red-500/10 transition-all duration-300 hover:scale-[1.02] group"
                    >
                        <LogOut className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform" />
                        Log Out
                    </a>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-8 relative flex flex-col">
                {/* Background Gradients */}
                <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
                <div className="max-w-7xl mx-auto relative z-10 w-full flex-1 flex flex-col">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
