import React, { useState, useEffect } from 'react';
import { Trophy, Star, Crown, Zap, Shield, Sparkles } from 'lucide-react';

const FlowRank = ({ userId, mode = 'full' }) => {
    const [stats, setStats] = useState({
        level: 1,
        xp: 0,
        nextLevelXp: 1000,
        streak: 0,
        badges: []
    });

    // Mock badges for now - in real app, fetch from API
    // Need backend endpoint for this
    useEffect(() => {
        // Simulating data fetch
        setStats({
            level: 3,
            xp: 2450,
            nextLevelXp: 3000,
            streak: 12,
            badges: [
                { id: 1, name: 'No-Stress', icon: '😌', description: 'Finish the month without exceeding budget', descriptionLong: 'You manage like a boss! Finish the month in the green.' },
                { id: 4, name: 'Streak King', icon: '👑', description: '7 days without impulse purchase', descriptionLong: 'Discipline is key. Keep it up!' }
            ],
            nextBadges: [
                { id: 2, name: 'Budget Ninja', icon: '🥷', xpRequired: 500, current: 200, target: 500, description: 'Follow 3 SmartActions' },
                { id: 3, name: 'Money Surfer', icon: '🏄', xpRequired: 300, current: 0, target: 1, description: 'Save 50DH via SmartActions' }
            ]
        });
    }, [userId]);

    const progress = (stats.xp / stats.nextLevelXp) * 100;

    if (mode === 'mini') {
        return (
            <div className="flex items-center gap-3 bg-dark-lighter/80 backdrop-blur-md rounded-2xl px-4 py-2 border border-white/10 hover:border-yellow-500/50 transition-colors cursor-pointer group">
                <div className="p-2 bg-yellow-500/10 rounded-lg group-hover:bg-yellow-500/20 transition-colors">
                    <Trophy className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Level {stats.level}</p>
                    <div className="w-24 h-1.5 bg-white/10 rounded-full mt-1 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-yellow-400 to-orange-500" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Main Card */}
            <div className="bg-dark-lighter/50 backdrop-blur-xl rounded-3xl p-8 border border-white/10 relative overflow-hidden">
                {/* Background Glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -z-10"></div>

                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-white font-display flex items-center gap-2">
                            <Trophy className="w-6 h-6 text-yellow-400" />
                            FlowRank
                        </h2>
                        <p className="text-gray-400 text-sm mt-1">Your journey to wealth 🚀</p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500/10 border border-orange-500/30">
                        <Zap className="w-5 h-5 text-orange-400 fill-orange-400 animate-pulse" />
                        <span className="text-orange-400 font-bold">{stats.streak} Days Streak</span>
                    </div>
                </div>

                {/* Level Progress */}
                <div className="bg-white/5 rounded-2xl p-6 border border-white/5 mb-8">
                    <div className="flex justify-between items-end mb-4">
                        <div>
                            <span className="text-sm text-gray-400 font-bold uppercase tracking-wider">Current Level</span>
                            <p className="text-4xl font-bold text-white font-display">{stats.level}</p>
                        </div>
                        <div className="text-right">
                            <span className="text-sm text-gray-400 font-bold uppercase tracking-wider">Total XP</span>
                            <p className="text-xl font-bold text-primary font-display">{stats.xp} XP</p>
                        </div>
                    </div>

                    <div className="relative h-6 bg-black/40 rounded-full overflow-hidden border border-white/5 box-inner-shadow">
                        <div
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary via-yellow-400 to-orange-500 transition-all duration-1000 ease-out flex items-center justify-end px-2"
                            style={{ width: `${progress}%` }}
                        >
                            <span className="text-[10px] font-bold text-black">{Math.round(progress)}%</span>
                        </div>
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-gray-500 font-mono">
                        <span>{stats.xp} XP</span>
                        <span>{stats.nextLevelXp} XP (Next Level)</span>
                    </div>
                </div>

                {/* Badges Grid */}
                <div>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Crown className="w-4 h-4 text-yellow-500" />
                        Unlocked Badges
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {stats.badges.map((badge) => (
                            <div
                                key={badge.id}
                                className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-gradient-to-b from-white/10 to-white/5 border border-white/10 hover:border-yellow-400/50 hover:shadow-[0_0_20px_rgba(250,204,21,0.1)] transition-all cursor-pointer group"
                            >
                                <div className="text-4xl group-hover:scale-110 transition-transform duration-300 filter drop-shadow-xl p-2">
                                    {badge.icon}
                                </div>
                                <div className="text-center">
                                    <span className="text-sm font-bold text-white block">{badge.name}</span>
                                    <span className="text-[10px] text-gray-400 leading-tight block mt-1">{badge.description}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Next Objectives Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-dark-lighter/50 backdrop-blur-xl rounded-3xl p-6 border border-white/10 flex flex-col justify-center">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Star className="w-4 h-4 text-primary" />
                        Next Objectives
                    </h3>
                    <div className="space-y-4">
                        {stats.nextBadges?.map(badge => (
                            <div key={badge.id} className="flex items-center gap-4 bg-white/5 p-3 rounded-xl border border-white/5">
                                <div className="text-2xl grayscale opacity-50">{badge.icon}</div>
                                <div className="flex-1">
                                    <div className="flex justify-between mb-1">
                                        <span className="text-sm font-bold text-gray-300">{badge.name}</span>
                                        <span className="text-xs text-gray-500">{badge.current}/{badge.target}</span>
                                    </div>
                                    <div className="h-1.5 bg-black/40 rounded-full overflow-hidden">
                                        <div className="h-full bg-gray-600 rounded-full" style={{ width: `${(badge.current / badge.target) * 100}%` }}></div>
                                    </div>
                                    <p className="text-[10px] text-gray-500 mt-1">{badge.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-dark-lighter/50 backdrop-blur-xl rounded-3xl p-6 border border-white/10 bg-gradient-to-br from-primary/5 to-transparent">
                    <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Boost my score
                    </h3>
                    <ul className="space-y-3">
                        <li className="flex items-center gap-3 text-sm text-gray-300">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                            Scan a receipt (+10 XP)
                        </li>
                        <li className="flex items-center gap-3 text-sm text-gray-300">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                            Validate a SmartAction (+50 XP)
                        </li>
                        <li className="flex items-center gap-3 text-sm text-gray-300">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                            7 consecutive days without overdraft (+100 XP)
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default FlowRank;
