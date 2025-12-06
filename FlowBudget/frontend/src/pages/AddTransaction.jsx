import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, ArrowLeft } from 'lucide-react';

const CATEGORIES = {
    Revenu: ["Investissement", "Don", "Salaire"],
    Dépense: ["Abonnement", "Alimentation", "Factures", "Fournitures", "Loyer", "Santé", "Soins corporels", "Loisir", "Transport", "Vêtements", "Autres"]
};

const AddTransaction = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        type: 'Dépense',
        categorie: CATEGORIES['Dépense'][0],
        montant: '',
        date: new Date().toISOString().split('T')[0]
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newData = { ...prev, [name]: value };
            if (name === 'type') {
                newData.categorie = CATEGORIES[value][0];
            }
            return newData;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/FlowBudget/pages/api/add_transaction.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                navigate('/');
            } else {
                const data = await response.json();
                setError(data.error || 'Failed to add transaction');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <header className="flex items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div>
                    <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary font-display tracking-tighter">Add Transaction</h2>
                    <p className="text-gray-400 font-medium">Record a new income or expense.</p>
                </div>
            </header>

            <div className="bg-dark-lighter/50 backdrop-blur-xl rounded-3xl shadow-sm border border-white/5 p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="p-4 rounded-xl bg-red-500/10 text-red-500 text-sm font-medium border border-red-500/20">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400">Type</label>
                        <div className="grid grid-cols-2 gap-4">
                            {['Revenu', 'Dépense'].map((type) => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => handleChange({ target: { name: 'type', value: type } })}
                                    className={`py-3 px-4 rounded-xl text-sm font-bold transition-all ${formData.type === type
                                        ? type === 'Revenu'
                                            ? 'bg-primary text-dark shadow-[0_0_20px_rgba(204,255,0,0.3)] scale-[1.02]'
                                            : 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.3)] scale-[1.02]'
                                        : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                                        }`}
                                >
                                    {type === 'Revenu' ? 'Income' : 'Expense'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">Category</label>
                            <select
                                name="categorie"
                                value={formData.categorie}
                                onChange={handleChange}
                                className="w-full p-3 rounded-xl bg-dark border border-white/10 text-white focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none"
                            >
                                {CATEGORIES[formData.type].map(cat => (
                                    <option key={cat} value={cat} className="bg-dark">{cat}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">Amount (MAD)</label>
                            <input
                                type="number"
                                name="montant"
                                value={formData.montant}
                                onChange={handleChange}
                                step="0.01"
                                required
                                placeholder="0.00"
                                className="w-full p-3 rounded-xl bg-dark border border-white/10 text-white focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none placeholder:text-gray-600"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400">Date</label>
                        <input
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            required
                            className="w-full p-3 rounded-xl bg-dark border border-white/10 text-white focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-primary text-dark rounded-xl font-bold shadow-[0_0_20px_rgba(204,255,0,0.3)] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? 'Adding...' : (
                            <>
                                <PlusCircle className="w-5 h-5" />
                                Add Transaction
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddTransaction;
