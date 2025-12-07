import React, { useState } from 'react';
import { ArrowRightLeft, Building2, Banknote, Store, Wallet, ArrowRight } from 'lucide-react';
import WalletToWalletForm from '../components/operations/WalletToWalletForm';
import TransferForm from '../components/operations/TransferForm';
import MerchantPaymentForm from '../components/operations/MerchantPaymentForm';

const Operations = () => {
    const [selectedOperation, setSelectedOperation] = useState(null);

    const operations = [
        {
            id: 'w2w',
            title: 'Wallet to Wallet',
            description: 'Transfer money to another wallet',
            icon: ArrowRightLeft,
            color: 'from-blue-500 to-cyan-500',
            component: WalletToWalletForm
        },
        {
            id: 'transfer',
            title: 'Bank Transfer',
            description: 'Make a transfer to a bank account',
            icon: Building2,
            color: 'from-primary to-secondary',
            component: TransferForm
        },
        {
            id: 'merchant',
            title: 'Merchant Payment',
            description: 'Pay a merchant via wallet',
            icon: Store,
            color: 'from-orange-500 to-red-500',
            component: MerchantPaymentForm
        }
    ];

    if (selectedOperation) {
        const OperationComponent = selectedOperation.component;
        return (
            <div className="space-y-6">
                <button
                    onClick={() => setSelectedOperation(null)}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                    ← Back to operations
                </button>
                <OperationComponent onClose={() => setSelectedOperation(null)} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary font-display tracking-tighter">
                    Banking Operations
                </h2>
                <p className="text-gray-400 mt-2">Perform your transactions securely</p>
            </div>

            {/* Operations Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {operations.map((operation) => {
                    const Icon = operation.icon;
                    return (
                        <div
                            key={operation.id}
                            onClick={() => setSelectedOperation(operation)}
                            className="group relative bg-dark-lighter/50 backdrop-blur-xl rounded-3xl p-6 border border-white/10 hover:border-primary/50 transition-all duration-300 cursor-pointer hover:scale-[1.05] hover:shadow-[0_0_30px_rgba(204,255,0,0.2)]"
                        >
                            {/* Gradient Background */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${operation.color} opacity-0 group-hover:opacity-10 rounded-3xl transition-opacity duration-300`}></div>

                            {/* Content */}
                            <div className="relative z-10 text-center">
                                <div className="flex justify-center mb-4">
                                    <div className={`p-5 rounded-2xl bg-gradient-to-br ${operation.color} shadow-lg`}>
                                        <Icon className="w-10 h-10 text-white" />
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors">
                                    {operation.title}
                                </h3>
                                <p className="text-gray-400 text-sm mb-4">
                                    {operation.description}
                                </p>

                                <div className="flex items-center justify-center gap-2 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-sm font-medium">Start</span>
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Info Card */}
            <div className="bg-primary/10 border border-primary/30 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                    <Wallet className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                    <div>
                        <h4 className="text-white font-bold mb-1">Enhanced Security</h4>
                        <p className="text-gray-400 text-sm">
                            All operations are secured by OTP (One-Time Password) sent to your phone.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Operations;
