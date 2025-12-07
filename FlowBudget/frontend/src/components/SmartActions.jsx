import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    TrendingDown,
    PiggyBank,
    Zap,
    ShoppingBag,
    CheckCircle2,
    XCircle,
    Clock,
    Sparkles
} from 'lucide-react';

const SmartActions = ({ userId }) => {
    const navigate = useNavigate();
    const [actions, setActions] = useState([
        {
            id: 1,
            type: 'limit_spending',
            title: 'Limit your Food spending',
            description: 'You spent 850 DH on food this month.',
            impact: 'high',
            savings: 250,
        },
        {
            id: 2,
            type: 'save_money',
            title: 'Automatic savings',
            description: 'Schedule a 200 DH transfer to your savings.',
            impact: 'medium',
            savings: 200,
        },
        {
            id: 3,
            type: 'optimize',
            title: 'Optimize subscriptions',
            description: 'Cancel Netflix (99 DH/month) if you use Shahid.',
            impact: 'medium',
            savings: 99,
        },
        {
            id: 4,
            type: 'reduce',
            title: 'Reduce outings',
            description: 'Limit to 2 outings max this weekend.',
            impact: 'low',
            savings: 150,
        }
    ]);

    const iconMap = {
        'limit_spending': TrendingDown,
        'save_money': PiggyBank,
        'optimize': Zap,
        'reduce': ShoppingBag,
    };

    const impactColor = {
        high: 'text-green-400',
        medium: 'text-yellow-400',
        low: 'text-blue-400'
    };

    const borderColor = {
        high: 'border-green-500/30 bg-green-500/5',
        medium: 'border-yellow-500/30 bg-yellow-500/5',
        low: 'border-blue-500/30 bg-blue-500/5'
    };

    return (
        <div className="bg-dark-lighter/50 backdrop-blur-xl rounded-2xl p-6 border border-white/5 shadow-lg h-full">
            <h3 className="text-xl font-bold text-white mb-6 font-display flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                SmartActions
            </h3>
            <div className="space-y-4">
                {actions.map((action) => {
                    const Icon = iconMap[action.type] || Sparkles;
                    return (
                        <div
                            key={action.id}
                            onClick={() => navigate('/')}
                            className={`flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer ${borderColor[action.impact]} hover:bg-white/10 hover:scale-[1.02] active:scale-[0.98]`}
                        >
                            <div className={`p-2 rounded-lg bg-black/20 ${impactColor[action.impact]}`}>
                                <Icon className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-gray-200 text-sm font-medium leading-snug">{action.title} - {action.description}</p>
                                <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-bold opacity-70">
                                    Savings: +{action.savings} DH
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default SmartActions;
