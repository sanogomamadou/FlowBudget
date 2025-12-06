import React, { useEffect, useState } from 'react';
import { User, Mail, Shield, CreditCard } from 'lucide-react';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [formData, setFormData] = useState({ nom: '', email: '' });
    const [passwordData, setPasswordData] = useState({ password: '', confirmPassword: '' });
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch('/FlowBudget/pages/api/getUser.php');
                if (response.ok) {
                    const data = await response.json();
                    setUser(data);
                    setFormData({ nom: data.nom, email: data.email });
                }
            } catch (error) {
                console.error("Error fetching user:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        try {
            const response = await fetch('/FlowBudget/pages/api/updateUser.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await response.json();

            if (response.ok) {
                setUser(prev => ({ ...prev, ...formData }));
                setIsEditing(false);
                setMessage({ type: 'success', text: 'Profile updated successfully!' });
            } else {
                setMessage({ type: 'error', text: data.error || 'Failed to update profile' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'An error occurred' });
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        if (passwordData.password !== passwordData.confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match' });
            return;
        }

        try {
            const response = await fetch('/FlowBudget/pages/api/updateUser.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: passwordData.password })
            });
            const data = await response.json();

            if (response.ok) {
                setShowPasswordModal(false);
                setPasswordData({ password: '', confirmPassword: '' });
                setMessage({ type: 'success', text: 'Password updated successfully!' });
            } else {
                setMessage({ type: 'error', text: data.error || 'Failed to update password' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'An error occurred' });
        }
    };

    if (loading) return <div className="flex justify-center items-center h-full">Loading...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <header>
                <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary font-display tracking-tighter">Profile</h2>
                <p className="text-gray-400 font-medium">Manage your account settings.</p>
            </header>

            {message.text && (
                <div className={`p-4 rounded-xl border ${message.type === 'success' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                    {message.text}
                </div>
            )}

            <div className="bg-dark-lighter/50 backdrop-blur-xl rounded-3xl shadow-sm border border-white/5 overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-primary/20 to-secondary/20"></div>
                <div className="px-8 pb-8">
                    <div className="relative -mt-16 mb-6 flex justify-between items-end">
                        <div className="w-32 h-32 rounded-full border-4 border-dark bg-dark-lighter flex items-center justify-center shadow-2xl">
                            <User className="w-16 h-16 text-gray-500" />
                        </div>
                        {!isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-bold text-white hover:bg-white/10 transition-colors"
                            >
                                Edit Profile
                            </button>
                        )}
                    </div>

                    <div className="space-y-6">
                        <div>
                            <h3 className="text-2xl font-bold text-white font-display">{user?.nom || 'User'}</h3>
                            <p className="text-gray-400">{user?.email || 'email@example.com'}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Personal Info */}
                            <div className="p-6 rounded-3xl bg-dark/50 border border-white/5 space-y-4">
                                <div className="flex items-center gap-3 text-white font-bold">
                                    <div className="p-2 bg-white/5 rounded-xl">
                                        <User className="w-5 h-5 text-primary" />
                                    </div>
                                    Personal Information
                                </div>

                                {isEditing ? (
                                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Full Name</label>
                                            <input
                                                type="text"
                                                value={formData.nom}
                                                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                                                className="w-full p-2 rounded-lg bg-dark border border-white/10 text-white focus:outline-none focus:border-primary"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Email</label>
                                            <input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="w-full p-2 rounded-lg bg-dark border border-white/10 text-white focus:outline-none focus:border-primary"
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <button type="submit" className="px-4 py-2 bg-primary text-dark rounded-lg text-sm font-bold hover:scale-105 transition-transform">Save</button>
                                            <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 bg-white/5 border border-white/10 text-white rounded-lg text-sm font-bold hover:bg-white/10">Cancel</button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase">Full Name</label>
                                            <p className="text-white font-medium">{user?.nom}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase">Email</label>
                                            <p className="text-white font-medium">{user?.email}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Security */}
                            <div className="p-6 rounded-3xl bg-dark/50 border border-white/5 space-y-4">
                                <div className="flex items-center gap-3 text-white font-bold">
                                    <div className="p-2 bg-white/5 rounded-xl">
                                        <Shield className="w-5 h-5 text-primary" />
                                    </div>
                                    Security
                                </div>

                                {showPasswordModal ? (
                                    <form onSubmit={handleUpdatePassword} className="space-y-4">
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase block mb-1">New Password</label>
                                            <input
                                                type="password"
                                                value={passwordData.password}
                                                onChange={(e) => setPasswordData({ ...passwordData, password: e.target.value })}
                                                className="w-full p-2 rounded-lg bg-dark border border-white/10 text-white focus:outline-none focus:border-primary"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Confirm Password</label>
                                            <input
                                                type="password"
                                                value={passwordData.confirmPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                                className="w-full p-2 rounded-lg bg-dark border border-white/10 text-white focus:outline-none focus:border-primary"
                                                required
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <button type="submit" className="px-4 py-2 bg-primary text-dark rounded-lg text-sm font-bold hover:scale-105 transition-transform">Update Password</button>
                                            <button type="button" onClick={() => setShowPasswordModal(false)} className="px-4 py-2 bg-white/5 border border-white/10 text-white rounded-lg text-sm font-bold hover:bg-white/10">Cancel</button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="space-y-3">
                                        <button
                                            onClick={() => setShowPasswordModal(true)}
                                            className="w-full text-left px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-sm font-bold text-white"
                                        >
                                            Change Password
                                        </button>
                                        <button className="w-full text-left px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-500 text-sm font-bold opacity-50 cursor-not-allowed">
                                            Two-Factor Authentication (Coming Soon)
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
