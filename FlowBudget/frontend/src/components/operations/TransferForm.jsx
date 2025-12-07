import React, { useState } from 'react';
import { Building2, CheckCircle, Loader } from 'lucide-react';
import { transferSimulation, transferOTP, transferConfirmation } from '../../services/walletAPI';

const TransferForm = ({ onClose }) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        ContractId: 'LAN193541347060000000001',
        Amount: '',
        destinationPhone: '',
        mobileNumber: '212666233333',
        RIB: '',
        clientNote: 'Virement'
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
            const result = await transferSimulation(formData);
            setSimulationResult(result.result[0]);
            setStep(2);
        } catch (error) {
            console.error('Simulation error:', error);
        }
        setLoading(false);
    };

    const handleRequestOTP = async () => {
        setLoading(true);
        try {
            const result = await transferOTP(formData.mobileNumber);
            setGeneratedOTP(result.result);
            alert(`OTP sent: ${result.result}`);
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
                ...formData,
                Otp: otp,
                referenceId: '0152475499',
                NumBeneficiaire: formData.destinationPhone,
                DestinationFirstName: 'Beneficiaire',
                DestinationLastName: 'Test'
            };
            const result = await transferConfirmation(confirmData);
            if (result.result.reference) {
                // Save to database
                try {
                    await fetch('/FlowBudget/pages/api/add_operation_transaction.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            montant: formData.Amount,
                            type: 'Dépense',
                            categorie: 'Virement Bancaire',
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
                <h3 className="text-2xl font-bold text-white mb-2">Transfer Successful!</h3>
                <p className="text-gray-400 mb-6">Your transfer has been completed successfully.</p>
                <button onClick={onClose} className="bg-primary hover:bg-primary/90 text-dark font-bold py-3 px-6 rounded-xl transition-all">
                    Back
                </button>
            </div>
        );
    }

    return (
        <div className="bg-dark-lighter/50 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
            <div className="flex items-center gap-4 mb-6">
                <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-secondary">
                    <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-white">Bank Transfer</h3>
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
                            value={formData.Amount}
                            onChange={(e) => setFormData({ ...formData, Amount: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl bg-dark border border-white/10 text-white focus:outline-none focus:border-primary"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Bank Account Number (RIB)</label>
                        <input
                            type="text"
                            value={formData.RIB}
                            onChange={(e) => setFormData({ ...formData, RIB: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl bg-dark border border-white/10 text-white focus:outline-none focus:border-primary"
                            placeholder="230780530712622100950179"
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
                            <span className="text-white font-bold">{formData.Amount} MAD</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Fees:</span>
                            <span className="text-white font-bold">{simulationResult.frais} MAD</span>
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
                            {otpError && <p className="text-xs text-red-400 mt-2">❌ {otpError}</p>}
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

export default TransferForm;
