import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import FlowRank from '../components/FlowRank';

const FlowRankPage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userResponse = await fetch('/FlowBudget/pages/api/getUser.php');
                if (userResponse.ok) {
                    const userData = await userResponse.json();
                    setUser(userData);
                }
            } catch (error) {
                console.error("Error fetching user:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <header className="flex items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div>
                    <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 font-display tracking-tighter">Gamification</h2>
                    <p className="text-gray-400 font-medium">Your level, badges, and objectives.</p>
                </div>
            </header>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <FlowRank userId={user?.id} mode="full" />
            )}
        </div>
    );
};

export default FlowRankPage;
