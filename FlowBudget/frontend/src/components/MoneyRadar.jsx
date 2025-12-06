import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle, Zap, Target, Shield } from 'lucide-react';

const MoneyRadar = () => {
    // Mock data for predictive balance
    const balanceData = [
        { day: 'Aujourd\'hui', balance: 1250, predicted: 1250 },
        { day: 'J+1', balance: null, predicted: 1180 },
        { day: 'J+2', balance: null, predicted: 1120 },
        { day: 'J+3', balance: null, predicted: 980 },
        { day: 'J+4', balance: null, predicted: 920 },
        { day: 'J+5', balance: null, predicted: 850 },
        { day: 'J+6', balance: null, predicted: 780 },
        { day: 'J+7', balance: null, predicted: 720 },
    ];

    // Radar data for spending categories
    const radarData = [
        { category: 'Food', value: 65, max: 100 },
        { category: 'Transport', value: 45, max: 100 },
        { category: 'Loisirs', value: 80, max: 100 },
        { category: 'Abonnements', value: 30, max: 100 },
        { category: 'Autres', value: 50, max: 100 },
    ];

    // Smart alerts
    const alerts = [
        { id: 1, type: 'warning', icon: AlertTriangle, message: 'Tes dépenses Food augmentent de 25% cette semaine', severity: 'medium' },
        { id: 2, type: 'danger', icon: TrendingDown, message: 'Risque de dépassement jeudi si tu continues ce rythme', severity: 'high' },
        { id: 3, type: 'info', icon: Zap, message: 'Tu peux économiser 50 DH en optimisant tes sorties', severity: 'low' },
    ];

    const currentBalance = 1250;
    const predictedBalance7d = 720;
    const trend = predictedBalance7d - currentBalance;
    const trendPercent = ((trend / currentBalance) * 100).toFixed(1);

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 via-secondary/20 to-primary/10 p-8 border border-white/10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/30 rounded-full blur-[100px] -z-10"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/30 rounded-full blur-[100px] -z-10"></div>

                <div className="flex items-start justify-between mb-6">
                    <div>
                        <h2 className="text-3xl font-bold text-white mb-2 font-display">Money Radar</h2>
                        <p className="text-gray-400">Ton tableau de bord prédictif intelligent</p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-gray-300">Live</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Current Balance */}
                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                        <p className="text-gray-400 text-sm mb-2 uppercase tracking-wider font-bold">Solde Actuel</p>
                        <p className="text-4xl font-bold text-white mb-1">{currentBalance} DH</p>
                        <p className="text-xs text-gray-500">Mis à jour il y a 2 min</p>
                    </div>

                    {/* Predicted 7d */}
                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                        <p className="text-gray-400 text-sm mb-2 uppercase tracking-wider font-bold">Prévu dans 7j</p>
                        <p className="text-4xl font-bold text-orange-400 mb-1">{predictedBalance7d} DH</p>
                        <div className="flex items-center gap-2">
                            {trend < 0 ? <TrendingDown className="w-4 h-4 text-red-400" /> : <TrendingUp className="w-4 h-4 text-green-400" />}
                            <p className={`text-sm font-semibold ${trend < 0 ? 'text-red-400' : 'text-green-400'}`}>
                                {trendPercent}%
                            </p>
                        </div>
                    </div>

                    {/* Risk Level */}
                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                        <p className="text-gray-400 text-sm mb-2 uppercase tracking-wider font-bold">Niveau de Risque</p>
                        <div className="flex items-center gap-3 mb-2">
                            <Shield className="w-8 h-8 text-orange-400" />
                            <p className="text-2xl font-bold text-orange-400">Moyen</p>
                        </div>
                        <p className="text-xs text-gray-500">Attention aux dépenses</p>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Balance Prediction Chart */}
                <div className="bg-dark-lighter/50 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        Évolution Prédictive
                    </h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={balanceData}>
                            <defs>
                                <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#CCFF00" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#CCFF00" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                            <XAxis dataKey="day" stroke="#888" style={{ fontSize: '12px' }} />
                            <YAxis stroke="#888" style={{ fontSize: '12px' }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#18181B',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '12px',
                                    color: '#fff'
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="predicted"
                                stroke="#CCFF00"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorPredicted)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Spending Radar */}
                <div className="bg-dark-lighter/50 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Target className="w-5 h-5 text-secondary" />
                        Répartition des Dépenses
                    </h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <RadarChart data={radarData}>
                            <PolarGrid stroke="#ffffff20" />
                            <PolarAngleAxis dataKey="category" stroke="#888" style={{ fontSize: '12px' }} />
                            <PolarRadiusAxis stroke="#888" />
                            <Radar name="Dépenses" dataKey="value" stroke="#D946EF" fill="#D946EF" fillOpacity={0.6} />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Smart Alerts */}
            <div className="bg-dark-lighter/50 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-primary" />
                    Alertes Intelligentes
                </h3>
                <div className="space-y-3">
                    {alerts.map((alert) => {
                        const Icon = alert.icon;
                        const severityColors = {
                            high: 'border-red-500/30 bg-red-500/10',
                            medium: 'border-orange-500/30 bg-orange-500/10',
                            low: 'border-blue-500/30 bg-blue-500/10'
                        };
                        const iconColors = {
                            high: 'text-red-400',
                            medium: 'text-orange-400',
                            low: 'text-blue-400'
                        };

                        return (
                            <div
                                key={alert.id}
                                className={`flex items-center gap-4 p-4 rounded-xl border ${severityColors[alert.severity]}`}
                            >
                                <Icon className={`w-5 h-5 flex-shrink-0 ${iconColors[alert.severity]}`} />
                                <p className="text-gray-300 text-sm flex-1">{alert.message}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default MoneyRadar;
