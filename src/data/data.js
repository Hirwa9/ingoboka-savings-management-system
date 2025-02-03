export const memberRoles = [
    'member', 'accountant', 'president', 'umuhwituzi',
];

export const expensesTypes = [
    "Social",
    "Withdraw Fee",
    "Checque Book",
    "SMS Charges",
    "Application Expense",
    "Leaving Member Interest",
];

// Reports
// I & E
export const incomeExpenses = [
    {
        label: 'Application expenses',
        type: 'expense',
        amount: 71700
    },
    {
        label: 'Cheque Books',
        type: 'expense',
        amount: 20300
    },
    {
        label: 'Leaving Members Interest',
        type: 'expense',
        amount: 0
    },
    {
        label: 'SMS Charges',
        type: 'expense',
        amount: 74
    },
    {
        label: 'Social',
        type: 'income',
        amount: 553047
    },
    {
        label: 'Withdrawal fee',
        type: 'expense',
        amount: 15821
    },
    {
        label: 'Penalities',
        type: 'income',
        amount: 187955
    },
];

// General
export const generalReport = {
    balance: 6236077,
    report: [
        { member: 'Bizumuremyi Jean Damascène', credit: 1545000, part: 1700060, social: 74653, },
        { member: 'Dusabimana Leonidas', credit: 5900000, part: 1700020, social: 72653, },
        { member: 'Mugabe Alain', credit: 2500000, part: 1700040, social: 74653, },
        { member: 'Ndayizeye Leonard', credit: 3850000, part: 1700020, social: 72653, },
        { member: 'Ngoboka Innocent', credit: 0, part: 1700020, social: 72653, },
        { member: 'Nzeyimana Bonaventure', credit: 2200000, part: 1700020, social: 72653, },
        { member: 'Rukundo Nelly Lambert', credit: 1260000, part: 1700020, social: 72653, },
        { member: 'Ruzindana Théogene', credit: 0, part: 1700060, social: 72653, },
    ],
    cotisationAndSocial: 15245464,
    verify: 5071013,
    generalTotal: 20316477,
};