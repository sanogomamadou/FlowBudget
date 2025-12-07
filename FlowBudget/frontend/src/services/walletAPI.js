// Mock CIH Wallet API Service
// This service mocks the CIH Wallet Management API endpoints
// IMPORTANT: Respects EXACT API signatures for future production integration

const BASE_URL = '/wallet';

/**
 * Mock data generator for transaction history
 * Generates transactions for TODAY only, with a new transaction every 1 hour
 */
const generateMockTransactions = () => {
    const types = ['MMD', 'W2W', 'CASHIN', 'CASHOUT', 'BILL'];
    const statuses = ['000']; // Only successful transactions

    const transactions = [];
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);

    // Calculate how many 1-hour intervals have passed since midnight
    const minutesSinceMidnight = (now - todayStart) / (1000 * 60);
    const intervalsPassed = Math.floor(minutesSinceMidnight / 60);

    // Generate one transaction per 1-hour interval
    for (let i = 0; i <= intervalsPassed && i < 24; i++) { // Max 24 transactions per day
        const transactionTime = new Date(todayStart);
        transactionTime.setHours(i);

        // Don't generate future transactions
        if (transactionTime > now) break;

        const amount = (Math.random() * 500 + 10).toFixed(2);
        const fees = (parseFloat(amount) * 0.02).toFixed(2);
        const totalAmount = (parseFloat(amount) + parseFloat(fees)).toFixed(2);
        const type = types[Math.floor(Math.random() * types.length)];

        transactions.push({
            amount: amount,
            Fees: fees,
            beneficiaryFirstName: `User${i}`,
            beneficiaryLastName: `Test${i}`,
            beneficiaryRIB: null,
            clientNote: type,
            contractId: null,
            currency: "MAD",
            date: transactionTime.toLocaleString('en-US'),
            dateToCompare: "0001-01-01T00:00:00Z",
            frais: [],
            numTel: null,
            operation: null,
            referenceId: `${Date.now()}-${i}`,
            sign: null,
            srcDestNumber: `2126${Math.floor(Math.random() * 100000000)}`,
            status: statuses[0],
            totalAmount: totalAmount,
            totalFrai: fees,
            type: type,
            isCanceled: false,
            isTierCashIn: false,
            totalPage: intervalsPassed + 1
        });
    }

    return transactions;
};

/**
 * GET /wallet/operations
 * Retrieve transaction history by contract number
 * 
 * @param {string} contractId - Contract ID (e.g., "LAN193541347060000000001")
 * @returns {Promise<Object>} Transaction history response
 */
export const getWalletOperations = async (contractId) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Mock response matching EXACT API structure
    return {
        result: generateMockTransactions()
    };
};

/**
 * Mock: Get wallet balance
 * (This will be replaced with real API endpoint later)
 */
export const getWalletBalance = async (contractId) => {
    await new Promise(resolve => setTimeout(resolve, 300));

    return {
        balance: 1250.50,
        currency: "MAD",
        contractId: contractId
    };
};

/**
 * Mock: Simulate transfer
 * (Placeholder for future /wallet/transfer/virement endpoint)
 */
export const simulateTransfer = async (amount, beneficiary) => {
    await new Promise(resolve => setTimeout(resolve, 400));

    const currentBalance = 1250.50;
    const fees = amount * 0.015; // 1.5% fees
    const newBalance = currentBalance - amount - fees;

    return {
        success: true,
        simulation: {
            currentBalance,
            amount,
            fees,
            newBalance,
            warning: newBalance < 200 ? "Attention: Solde faible après ce transfert" : null
        }
    };
};

// ============================================
// BANKING OPERATIONS MOCK APIs
// ============================================

/**
 * WALLET TO WALLET - Simulation
 * POST /wallet/transfer/wallet?step=simulation
 */
export const walletToWalletSimulation = async (data) => {
    await new Promise(resolve => setTimeout(resolve, 500));

    const referenceId = Math.floor(Math.random() * 9999999999).toString();
    const fees = parseFloat(data.amout) * 0.05; // 5% fees
    const totalFees = fees + (fees * 0.2); // fees + TVA

    return {
        result: {
            amount: data.amout,
            Fees: fees.toFixed(1),
            beneficiaryFirstName: "User",
            beneficiaryLastName: "Demo",
            beneficiaryRIB: null,
            contractId: null,
            currency: null,
            date: null,
            dateToCompare: "0001-01-01T00:00:00Z",
            frais: [
                {
                    currency: "MAD",
                    fullName: "",
                    name: "COM",
                    referenceId: referenceId,
                    value: Math.round(fees)
                },
                {
                    currency: "MAD",
                    fullName: "",
                    name: "TVA",
                    referenceId: referenceId,
                    value: Math.round(fees * 0.2)
                }
            ],
            numTel: null,
            operation: null,
            referenceId: referenceId,
            sign: null,
            srcDestNumber: null,
            status: null,
            totalAmount: (parseFloat(data.amout) + totalFees).toFixed(2),
            totalFrai: totalFees.toFixed(2),
            type: "TT",
            isCanceled: false,
            isTierCashIn: false
        }
    };
};

/**
 * WALLET TO WALLET - OTP
 * POST /wallet/transfer/wallet/otp
 */
export const walletToWalletOTP = async (phoneNumber) => {
    await new Promise(resolve => setTimeout(resolve, 300));

    return {
        result: [{
            codeOtp: Math.floor(100000 + Math.random() * 900000).toString()
        }]
    };
};

/**
 * WALLET TO WALLET - Confirmation
 * POST /wallet/transfer/wallet?step=confirmation
 */
export const walletToWalletConfirmation = async (data) => {
    await new Promise(resolve => setTimeout(resolve, 600));

    return {
        result: {
            item1: {
                creditAmounts: null,
                debitAmounts: null,
                depot: null,
                retrait: null,
                value: "-" + (parseFloat(data.fees) + parseFloat(data.amount || 0)).toFixed(3)
            },
            item2: "000",
            item3: "Successful"
        }
    };
};

/**
 * TRANSFER - Simulation
 * POST /wallet/transfer/virement?step=simulation
 */
export const transferSimulation = async (data) => {
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
        result: [{
            frais: "0",
            fraisSms: null,
            totalAmountWithFee: data.Amount,
            deviseEmissionCode: null,
            fraisInclus: false,
            montantDroitTimbre: 0,
            montantFrais: 0,
            montantFraisSMS: 0,
            montantFraisTotal: 0,
            montantTVA: 0,
            montantTVASMS: 0,
            tauxChange: 0
        }]
    };
};

/**
 * TRANSFER - OTP
 * POST /wallet/transfer/virement/otp
 */
export const transferOTP = async (phoneNumber) => {
    await new Promise(resolve => setTimeout(resolve, 300));

    return {
        result: Math.floor(100000 + Math.random() * 900000).toString()
    };
};

/**
 * TRANSFER - Confirmation
 * POST /wallet/transfer/virement?step=confirmation
 */
export const transferConfirmation = async (data) => {
    await new Promise(resolve => setTimeout(resolve, 600));

    return {
        result: {
            contractId: data.ContractId,
            reference: Math.floor(Math.random() * 999999999999).toString()
        }
    };
};

/**
 * WALLET TO MERCHANT - Simulation
 * POST /wallet/Transfer/WalletToMerchant?step=simulation
 */
export const walletToMerchantSimulation = async (data) => {
    await new Promise(resolve => setTimeout(resolve, 500));

    const referenceId = Math.floor(Math.random() * 9999999999).toString();

    return {
        result: {
            amount: data.Amout,
            beneficiaryFirstName: "Merchant",
            beneficiaryLastName: "Demo",
            beneficiaryRIB: null,
            clientNote: data.clientNote,
            contractId: null,
            currency: null,
            date: null,
            dateToCompare: "0001-01-01T00:00:00Z",
            frais: [],
            numTel: null,
            operation: null,
            referenceId: referenceId,
            sign: null,
            srcDestNumber: null,
            status: null,
            totalAmount: data.Amout,
            totalFrai: "0",
            type: "TM",
            isCanceled: false,
            isTierCashIn: false,
            feeDetails: null,
            token: null,
            optFieldOutput1: null,
            optFieldOutput2: null,
            cardId: null,
            isSwitch: false
        }
    };
};

/**
 * WALLET TO MERCHANT - OTP
 * POST /wallet/walletToMerchant/cash/out/otp
 */
export const walletToMerchantOTP = async (phoneNumber) => {
    await new Promise(resolve => setTimeout(resolve, 300));

    return {
        result: [{
            codeOtp: Math.floor(100000 + Math.random() * 900000).toString()
        }]
    };
};

/**
 * WALLET TO MERCHANT - Confirmation
 * POST /wallet/Transfer/WalletToMerchant?step=confirmation
 */
export const walletToMerchantConfirmation = async (data) => {
    await new Promise(resolve => setTimeout(resolve, 600));

    return {
        result: {
            item1: {
                creditAmounts: null,
                debitAmounts: null,
                depot: null,
                retrait: null,
                value: "17.460",
                transactionId: null,
                cardId: null,
                optFieldOutput2: null,
                optFieldOutput1: null,
                transactionReference: null,
                amount: null,
                token: null,
                fee: null,
                feeDetails: null
            },
            item2: "000",
            item3: "Successful"
        }
    };
};

export default {
    getWalletOperations,
    getWalletBalance,
    simulateTransfer,
    // Wallet to Wallet
    walletToWalletSimulation,
    walletToWalletOTP,
    walletToWalletConfirmation,
    // Transfer
    transferSimulation,
    transferOTP,
    transferConfirmation,
    // Wallet to Merchant
    walletToMerchantSimulation,
    walletToMerchantOTP,
    walletToMerchantConfirmation
};
