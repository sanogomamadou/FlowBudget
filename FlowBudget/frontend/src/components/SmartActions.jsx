import React, { useState } from 'react';
import {
    TrendingDown,
    PiggyBank,
    Calendar,
    Zap,
    ShoppingBag,
    Coffee,
    CheckCircle2,
    XCircle,
    Clock,
    Sparkles
} from 'lucide-react';

const SmartActionCard = ({ action, onAccept, onReject }) => {
    const [status, setStatus] = useState('pending'); // pending, accepted, rejected

    const iconMap = {
        'limit_spending': TrendingDown,
        'save_money': PiggyBank,
        'postpone_transfer': Calendar,
        'optimize_subscription': Zap,
        'reduce_category': ShoppingBag,
        'cash_in': Coffee,
    };

    const Icon = iconMap[action.type] || Sparkles;

    const handleAccept = () => {
        setStatus('accepted');
        if (onAccept) onAccept(action);
    };

    const handleReject = () => {
        setStatus('rejected');
        if (onReject) onReject(action);
    };

    const impactColor = {
        high: 'text-green-400',
        medium: 'text-yellow-400',
        low: 'text-blue-400'
    };

    const borderColor = {
        high: 'border-green-500/30',
        medium: 'border-yellow-500/30',
        low: 'border-blue-500/30'
    };

    if (status === 'accepted') {
        return (
            <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-6 flex items-center gap-4">
                <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0" />
                <div className="flex-1">
                    <p className="text-green-400 font-semibold">Action acceptée !</p>
                    <p className="text-gray-400 text-sm mt-1">{action.title}</p>
                </div>
            </div>
        );
    }

    if (status === 'rejected') {
        return (
            <div className="bg-gray-500/10 border border-gray-500/30 rounded-2xl p-6 flex items-center gap-4 opacity-50">
                <XCircle className="w-6 h-6 text-gray-400 flex-shrink-0" />
                <div className="flex-1">
                    <p className="text-gray-400 font-semibold">Action ignorée</p>
                    <p className="text-gray-500 text-sm mt-1">{action.title}</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-dark-lighter/50 backdrop-blur-xl border ${borderColor[action.impact]} rounded-2xl p-6 hover:scale-[1.02] transition-all duration-300`}>
            <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`bg-gradient-to-br from-primary/20 to-secondary/20 p-3 rounded-xl flex-shrink-0`}>
                    <Icon className="w-6 h-6 text-primary" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="text-white font-bold text-lg leading-tight">{action.title}</h4>
                        <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-lg bg-white/5 ${impactColor[action.impact]} flex-shrink-0`}>
                            {action.impact === 'high' ? '🔥 High' : action.impact === 'medium' ? '⚡ Medium' : '💡 Low'}
                        </span>
                    </div>

                    <p className="text-gray-400 text-sm mb-4 leading-relaxed">{action.description}</p>

                    {/* Impact Preview */}
                    <div className="bg-white/5 rounded-xl p-3 mb-4 border border-white/10">
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Impact estimé</p>
                        <p className={`text-lg font-bold ${impactColor[action.impact]}`}>
                            {action.savings > 0 ? '+' : ''}{action.savings} DH
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{action.timeframe}</p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={handleAccept}
                            className="flex-1 bg-primary hover:bg-primary/90 text-dark font-bold py-3 px-4 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(204,255,0,0.3)] flex items-center justify-center gap-2"
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            Appliquer
                        </button>
                        <button
                            onClick={handleReject}
                            className="flex-1 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white font-bold py-3 px-4 rounded-xl transition-all hover:scale-105 active:scale-95 border border-white/10 flex items-center justify-center gap-2"
                        >
                            <XCircle className="w-4 h-4" />
                            Ignorer
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const SmartActions = () => {
    // Mock SmartActions data (will come from AI later)
    const [actions, setActions] = useState([
        {
            id: 1,
            type: 'limit_spending',
            title: 'Limite tes dépenses Food',
            description: 'Tu as dépensé 180 DH en nourriture cette semaine. Si tu réduis à 30 DH/jour, tu seras safe pour le week-end.',
            impact: 'high',
            savings: 50,
            timeframe: 'Cette semaine'
        },
        {
            id: 2,
            type: 'save_money',
            title: 'Déplace 20 DH en épargne',
            description: 'Ton solde actuel te permet de mettre de côté 20 DH sans risque. Petit geste, grand impact !',
            impact: 'medium',
            savings: 20,
            timeframe: 'Maintenant'
        },
        {
            id: 3,
            type: 'postpone_transfer',
            title: 'Repousse ton transfert à demain',
            description: 'Si tu fais ce virement maintenant, tu risques un dépassement jeudi. Attends demain pour plus de sécurité.',
            impact: 'high',
            savings: 0,
            timeframe: 'Demain'
        },
        {
            id: 4,
            type: 'optimize_subscription',
            title: 'Optimise ton abonnement Spotify',
            description: 'Ton abonnement tombe le 5 du mois, juste avant ton revenu. Change la date au 10 pour éviter les galères.',
            impact: 'medium',
            savings: 0,
            timeframe: 'Ce mois-ci'
        },
        {
            id: 5,
            type: 'cash_in',
            title: 'Cash-in intelligent suggéré',
            description: 'Fais un cash-in de 100 DH maintenant pour éviter que ton budget explose jeudi.',
            impact: 'high',
            savings: -100,
            timeframe: 'Aujourd\'hui'
        }
    ]);

    const handleAccept = (action) => {
        console.log('Action accepted:', action);
        // Here we'll trigger the actual backend action later
    };

    const handleReject = (action) => {
        console.log('Action rejected:', action);
    };

    const pendingActions = actions.filter(a =>
        !['accepted', 'rejected'].includes(a.status)
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-white font-display flex items-center gap-3">
                        <Sparkles className="w-8 h-8 text-primary" />
                        SmartActions
                    </h2>
                    <p className="text-gray-400 mt-1">
                        Micro-actions bancaires recommandées par l'IA
                    </p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/30">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="text-sm text-primary font-bold">{pendingActions.length} actions</span>
                </div>
            </div>

            {/* Actions Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {actions.map(action => (
                    <SmartActionCard
                        key={action.id}
                        action={action}
                        onAccept={handleAccept}
                        onReject={handleReject}
                    />
                ))}
            </div>

            {/* Empty State */}
            {pendingActions.length === 0 && (
                <div className="bg-dark-lighter/50 backdrop-blur-xl rounded-3xl p-12 border border-white/10 text-center">
                    <Sparkles className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-400 mb-2">Aucune action pour le moment</h3>
                    <p className="text-gray-500">L'IA analyse tes dépenses et reviendra avec des recommandations.</p>
                </div>
            )}
        </div>
    );
};

export default SmartActions;
