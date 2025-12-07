import React, { useState } from 'react';
import { AlertTriangle, TrendingDown, Zap, Shield } from 'lucide-react';

const SmartAlerts = ({ userId }) => {
    const [alerts, setAlerts] = React.useState([
        { id: 1, type: 'warning', icon: AlertTriangle, message: 'Food budget exceeded by 15% (850 DH / 700 DH)', severity: 'high' },
        { id: 2, type: 'danger', icon: TrendingDown, message: 'Your balance will drop below 500 DH on Wednesday if you continue', severity: 'high' },
        { id: 3, type: 'info', icon: Zap, message: 'Spotify subscription (99 DH) will be charged in 3 days', severity: 'medium' },
        { id: 4, type: 'warning', icon: AlertTriangle, message: '3 ATM withdrawals made this week (fees: 15 DH)', severity: 'low' },
    ]);

    return (
        <div className="bg-dark-lighter/50 backdrop-blur-xl rounded-2xl p-6 border border-white/5 shadow-lg h-full">
            <h3 className="text-xl font-bold text-white mb-6 font-display flex items-center gap-2">
                <Shield className="w-5 h-5 text-orange-400" />
                Smart Alerts
            </h3>
            <div className="space-y-4">
                {alerts.map((alert) => {
                    const Icon = alert.icon;
                    const severityColors = {
                        high: 'border-red-500/30 bg-red-500/10 hover:bg-red-500/20',
                        medium: 'border-orange-500/30 bg-orange-500/10 hover:bg-orange-500/20',
                        low: 'border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20'
                    };
                    const iconColors = {
                        high: 'text-red-400',
                        medium: 'text-orange-400',
                        low: 'text-blue-400'
                    };

                    return (
                        <div
                            key={alert.id}
                            className={`flex items-start gap-4 p-4 rounded-xl border transition-colors ${severityColors[alert.severity]}`}
                        >
                            <div className={`p-2 rounded-lg bg-black/20 ${iconColors[alert.severity]}`}>
                                <Icon className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-gray-200 text-sm font-medium leading-snug">{alert.message}</p>
                                <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-bold opacity-70">
                                    {alert.severity === 'high' ? 'High Priority' : alert.severity === 'medium' ? 'Warning' : 'Tip'}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default SmartAlerts;
