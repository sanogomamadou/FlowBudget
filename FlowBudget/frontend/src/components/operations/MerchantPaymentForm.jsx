import React, { useState } from 'react';
import { Store, CheckCircle, Loader } from 'lucide-react';
import { walletToMerchantSimulation, walletToMerchantOTP, walletToMerchantConfirmation } from '../../services/walletAPI';

const MerchantPaymentForm = ({ onClose }) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        clientContractId: 'LAN193541347060000000001',
        Amout: '',
        clientPhoneNumber: '212665873350',
        merchantPhoneNumber: '',
        clientNote: 'Paiement marchand'
    });
    const [simulationResult, setSimulationResult] = useState(null);
    const [otp, setOtp] = useState('');
    const [generatedOTP, setGeneratedOTP] = useState('');
    const [success, setSuccess] = useState(false);
    const [otpError, setOtpError] = useState('');

    const handleSimulation = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const result = await walletToMerchantSimulation(formData);
            setSimulationResult(result.result);
            setStep(2);
        } catch (error) {
            console.error('Simulation error:', error);
        }
        setLoading(false);
    };

    const handleRequestOTP = async () => {
        setLoading(true);
        try {
            const result = await walletToMerchantOTP(formData.clientPhoneNumber);
            setGeneratedOTP(result.result[0].codeOtp);
            alert(`OTP sent: ${result.result[0].codeOtp}`);
        } catch (error) {
            console.error('OTP error:', error);
        }
        setLoading(false);
    };

    const handleConfirmation = async (e) => {
        e.preventDefault();

        if (otp !== generatedOTP) {
            setOtpError('Incorrect OTP code. Please try again.');
            return;
        }

        setOtpError('');
        setLoading(true);
        try {
            const confirmData = {
                ClientPhoneNumber: formData.clientPhoneNumber,
                ClientContractId: formData.clientContractId,
                OTP: otp,
                ReferenceId: simulationResult.referenceId,
                DestinationPhone: formData.merchantPhoneNumber,
                QrCode: 'QR123456789',
                MCC: '5411',
                AmountInputMode: 'ENTERED',
                fees: '0'
            };
            const result = await walletToMerchantConfirmation(confirmData);
            if (result.result.item2 === '000') {
                // Save to database
                try {
                    await fetch('/FlowBudget/pages/api/add_operation_transaction.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            montant: simulationResult.amount,
                            type: 'Dépense',
                            categorie: 'Paiement Marchand',
                            date: new Date().toISOString().split('T')[0]
                        })
                    });
                } catch (dbError) {
                    console.error('Database save error:', dbError);
                }
                setSuccess(true);
            }
        } catch (error) {
            console.error('Confirmation error:', error);
            setOtpError('Confirmation error. Please try again.');
        }
        setLoading(false);
    };

    if (success) {
        return (
            <div className="bg-dark-lighter/50 backdrop-blur-xl rounded-3xl p-8 border border-white/10 text-center">
                <CheckCircle className="w-16 h-16 text-secondary mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">Payment Successful!</h3>
                <p className="text-gray-400 mb-6">Your merchant payment has been completed successfully.</p>
                <button onClick={onClose} className="bg-primary hover:bg-primary/90 text-dark font-bold py-3 px-6 rounded-xl transition-all">
                    Back
                </button>
            </div>
        );
    }

    return (
        <div className="bg-dark-lighter/50 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
            <div className="flex items-center gap-4 mb-6">
                <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-red-500">
                    <Store className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-white">Merchant Payment</h3>
                    <p className="text-gray-400 text-sm">Step {step}/3</p>
                </div>
            </div>

            <div className="flex items-center gap-2 mb-8">
                {[1, 2, 3].map((s) => (
                    <div key={s} className="flex-1">
                        <div className={`h-2 rounded-full ${s <= step ? 'bg-primary' : 'bg-gray-700'}`}></div>
                    </div>
                ))}
            </div>

            {step === 1 && (
                <form onSubmit={handleSimulation} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Amount (MAD)</label>
                        <input
                            type="number"
                            value={formData.Amout}
                            onChange={(e) => setFormData({ ...formData, Amout: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl bg-dark border border-white/10 text-white focus:outline-none focus:border-primary"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Merchant Phone</label>
                        <input
                            type="tel"
                            value={formData.merchantPhoneNumber}
                            onChange={(e) => setFormData({ ...formData, merchantPhoneNumber: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl bg-dark border border-white/10 text-white focus:outline-none focus:border-primary"
                            placeholder="212XXXXXXXXX"
                            required
                        />
                    </div>
                    <button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/90 text-dark font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
                        {loading ? <Loader className="w-5 h-5 animate-spin" /> : 'Simulate'}
                    </button>
                </form>
            )}

            {step === 2 && simulationResult && (
                <div className="space-y-4">
                    <div className="bg-white/5 rounded-xl p-4 space-y-2">
                        <div className="flex justify-between">
                            <span className="text-gray-400">Amount:</span>
                            <span className="text-white font-bold">{simulationResult.amount} MAD</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Fees:</span>
                            <span className="text-white font-bold">{simulationResult.totalFrai} MAD</span>
                        </div>
                    </div>

                    <button onClick={handleRequestOTP} disabled={loading} className="w-full bg-secondary hover:bg-secondary/90 text-dark font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
                        {loading ? <Loader className="w-5 h-5 animate-spin" /> : 'Request OTP'}
                    </button>

                    <form onSubmit={handleConfirmation} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">OTP Code</label>
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-dark border border-white/10 text-white focus:outline-none focus:border-primary text-center text-2xl tracking-widest"
                                placeholder="000000"
                                maxLength="6"
                                required
                            />
                            {generatedOTP && <p className="text-xs text-gray-500 mt-2">Generated OTP: {generatedOTP}</p>}
                        </div>
                        <button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/90 text-dark font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
                            {loading ? <Loader className="w-5 h-5 animate-spin" /> : 'Confirm'}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default MerchantPaymentForm;
