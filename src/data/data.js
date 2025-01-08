// Dashboard
export const dashboardData = [
    { label: "Cotisation", value: 14660080 },
    { label: "Social", value: 571224 },
    { label: "Loan Delivered", value: 108680000 },
    { label: "Interest Receivable", value: 5434000 },
    { label: "Paid Capital", value: 90010000 },
    { label: "Paid Interest", value: 5134000 },
    { label: "Penalties", value: 187955 },
    { label: "Expenses", value: 660942 },
    { label: "Balance", value: 1222317 },
];

// Members
export const membersData = [
    {
        type: 'member',
        role: 'member',
        husband: {
            firstName: "Bizumuremyi",
            lastName: "Jean Damascène",
            phone: "(+250) 728 764 792",
            email: "jeandamascène05@gmail.com",
            avatar: "images/members/b_j.damascene.jpeg",
            // avatar: "images/man_avatar_image.jpg",
        },
        wife: {
            firstName: "Uwamahoro",
            lastName: "Germaine",
            phone: "(+250) 783 712 889",
            email: "uwamahoroger64@gmail.com",
            avatar: "images/members/u_germaine.jpeg",
            // avatar: "images/woman_avatar_image.jpg",
        },
        shares: 88,
        cotisation: 1700060,
        social: 74563,
    },
    {
        type: 'admin',
        role: 'accountant',
        husband: {
            firstName: "Mugabe",
            lastName: "Alain",
            phone: "(+250) 788 443 226",
            email: "alain18@gmail.com",
            avatar: "images/members/m_alain.jpg",
            // avatar: "images/man_avatar_image.jpg",
        },
        wife: {
            firstName: "Ingabire",
            lastName: "Laetitia",
            phone: "(+250) 788 898 989",
            email: "laetitiaIn97@gmail.com",
            avatar: "images/woman_avatar_image.jpg",
            // avatar: "images/woman_avatar_image.jpg",
        },
        shares: 105,
        cotisation: 2060040,
        social: 74653,
    },
    {
        type: 'member',
        role: 'member',
        husband: {
            firstName: "Ndayizeye",
            lastName: "Leonard",
            phone: "(+250) 788 221 404",
            email: "leonard15@gmail.com",
            avatar: "images/members/n_leonard.jpeg",
            // avatar: "images/man_avatar_image.jpg",
        },
        wife: {
            firstName: "Anathali",
            lastName: "Anathalie",
            phone: "(+250) 788 672 489",
            email: "anathalie@gmail.com",
            avatar: "images/members/u_anathalie.jpeg",
            // avatar: "images/woman_avatar_image.jpg",
        },
        shares: 86,
        cotisation: 1700020,
        social: 72653,
    },
    {
        type: 'member',
        role: 'member',
        husband: {
            firstName: "Dusabimana",
            lastName: "Leonidas",
            phone: "(+250) 788 838 617",
            email: "leonidas36@gmail.com",
            avatar: "images/members/d_leonidas.jpeg",
            // avatar: "images/man_avatar_image.jpg",
        },
        wife: {
            firstName: "Nyirahabimana",
            lastName: "Christine",
            phone: "(+250) 788 655 467",
            email: "christine21@gmail.com",
            avatar: "images/members/n_christine.jpeg",
            // avatar: "images/woman_avatar_image.jpg",
        },
        shares: 86,
        cotisation: 1700020,
        social: 72653,
    },
    {
        type: 'member',
        role: 'member',
        husband: {
            firstName: "Rukundo",
            lastName: "Nelly Lambert",
            phone: "N/A",
            email: "N/A",
            avatar: "images/members/r_nelly.jpeg",
            // avatar: "images/man_avatar_image.jpg",
        },
        wife: {
            firstName: "N",
            lastName: "N/A",
            phone: "N/A",
            email: "N/A",
            avatar: "images/woman_avatar_image.jpg",
            // avatar: "images/woman_avatar_image.jpg",
        },
        shares: 86,
        cotisation: 1700020,
        social: 72653,
    },
    {
        type: 'admin',
        role: 'president',
        husband: {
            firstName: "Ngoboka",
            lastName: "Innocent",
            phone: "(+250) 788 505 755",
            email: "innocent46@gmail.com",
            avatar: "images/members/n_innocent.jpeg",
            // avatar: "images/man_avatar_image.jpg",
        },
        wife: {
            firstName: "N",
            lastName: "N/A",
            phone: "N/A",
            email: "N/A",
            avatar: "images/woman_avatar_image.jpg",
            // avatar: "images/woman_avatar_image.jpg",
        },
        shares: 104,
        cotisation: 2060020,
        social: 72653,
    },
    {
        type: 'member',
        role: 'member',
        husband: {
            firstName: "Nzeyimana",
            lastName: "Bonaventure",
            phone: "(+250) 788 585 815",
            email: "bonaventure57@gmail.com",
            avatar: "images/members/n_bonaventure.jpeg",
            // avatar: "images/man_avatar_image.jpg",
        },
        wife: {
            firstName: "Uwimbabazi",
            lastName: "Adrie",
            phone: "(+250) 788 858 981",
            email: "N/A",
            avatar: "images/members/u_adrie.jpeg",
            // avatar: "images/woman_avatar_image.jpg",
        },
        shares: 104,
        cotisation: 2060020,
        social: 72653,
    },
    {
        type: 'member',
        role: 'member',
        husband: {
            firstName: "Ruzindana",
            lastName: "Théogene",
            phone: "(+250) 788 485 873",
            email: "ntwaribosco@gmail.com",
            avatar: "images/members/r_theogene.jpeg",
            // avatar: "images/man_avatar_image.jpg",
        },
        wife: {
            firstName: "Henriette",
            lastName: "Henriette",
            phone: "(+250) 781 876 432",
            email: "ishimwe.vanessa@gmail.com",
            avatar: "images/members/u_henriette.jpeg",
            // avatar: "images/woman_avatar_image.jpg",
        },
        shares: 86,
        cotisation: 1700020,
        social: 72653,
    },
];

// Credits
export const credits = [
    {
        id: 0, // The default column's incrementing id
        memberId: 5, // As defined
        creditAmount: 3000000, // As defined
        requestDate: "04-01-2025", // Default is the current timestamp
        dueDate: "04-04-2025", // As defined
        tranches: 3, // Tranches number as defined
        comment: "Requesting a loan", // Loan requesting comment
        status: "pending", // Enum of "pending", "approved", "rejected", with pending as the default
        rejectionMessage: "Insufficient balance", // Default is null.
        creditPayment: [ // Will have all tranches details according to tranches number defined
            {
                tranchNumber: 1,
                tranchDueDate: '04-02-2025',
                paid: false, // Default is false
                slipUrl: 'url of the uploaded file', // Default is null
                finesCount: 0, // Default is 0
            },
            {
                tranchNumber: 2,
                tranchDueDate: '04-03-2025',
                paid: false, // Default is false
                slipUrl: 'url of the uploaded file', // Default is null
                finesCount: 0, // Default is 0
            },
            {
                tranchNumber: 3,
                tranchDueDate: '04-04-2025',
                paid: false, // Default is false
                slipUrl: 'url of the uploaded file', // Default is null
                finesCount: 0, // Default is 0
            },
        ],
        fullyPaid: false, // Default is false
    }
];

// Expenses
export const expenses = [
    {
        id: 0,
        type: "SMS charges",
        amount: 74,
        comment: 'SMS charges',
        date: '2022-12-16 16:15:32',
    },
    {
        id: 1,
        type: "Cheque book",
        amount: 15000,
        comment: 'Cheque book',
        date: '2022-12-16 16:20:07',
    },
    {
        id: 2,
        type: "Withdrawal fee",
        amount: 10127,
        comment: 'Fais de rettrait',
        date: '2022-12-16 16:37:32',
    },
    {
        id: 3,
        type: "Withdrawal fee",
        amount: 300,
        comment: 'Withdrawal',
        date: '2022-12-31 16:15:32',
    },
    {
        id: 4,
        type: "Withdrawal fee",
        amount: 200,
        comment: 'Withdrawal fee Leonidas',
        date: '2023-01-17 16:15:32',
    },
    {
        id: 5,
        type: "Withdrawal fee",
        amount: 800,
        comment: 'Withdrawal fee Mugabe (Application/Software fee)',
        date: '2023-01-17 16:15:32',
    },
    {
        id: 6,
        type: "Application expenses",
        amount: 70000,
        comment: 'Recognition of a developer',
        date: '2023-01-17 16:15:32',
    },
    {
        id: 7,
        type: "Social",
        amount: 242000,
        comment: 'Reception assemble generalle',
        date: '2023-01-26 16:15:32',
    },
    {
        id: 8,
        type: "Withdrawal fee",
        amount: 200,
        comment: 'Withdrawal fee Gatesi',
        date: '2023-02-01 16:15:32',
    },
    {
        id: 9,
        type: "Withdrawal fee",
        amount: 200,
        comment: 'Withdrawal fee mn Patrick',
        date: '2023-02-01 16:15:32',
    },
    {
        id: 10,
        type: "Withdrawal fee",
        amount: 200,
        comment: 'Withdrawal fee Nelly',
        date: '2023-02-07 16:15:32',
    },
    {
        id: 11,
        type: "Withdrawal fee",
        amount: 200,
        comment: 'Withdrawal fee Germaine',
        date: '2023-03-11 16:15:32',
    },
    {
        id: 12,
        type: "Withdrawal fee",
        amount: 200,
        comment: 'Withdrawal fee Rukundo',
        date: '2023-03-30 16:15:32',
    },
    {
        id: 13,
        type: "Withdrawal fee",
        amount: 200,
        comment: 'Withdrawal fee Leonard',
        date: '2023-04-19 16:15:32',
    },
    {
        id: 14,
        type: "Withdrawal fee",
        amount: 200,
        comment: 'Withdrawal fee Nelly',
        date: '2023-05-02 16:15:32',
    },
    {
        id: 15,
        type: "Withdrawal fee",
        amount: 200,
        comment: 'Withdrawal fee Alain',
        date: '2023-05-02 16:15:32',
    },
    {
        id: 16,
        type: "Withdrawal fee",
        amount: 200,
        comment: 'Withdrawal fee Germaine',
        date: '2023-07-06 16:15:32',
    },
    {
        id: 17,
        type: "Withdrawal fee",
        amount: 200,
        comment: 'Withdrawal fee Leonidas',
        date: '2023-07-28 16:15:32',
    },
    {
        id: 18,
        type: "Withdrawal fee",
        amount: 200,
        comment: 'Withdrawal fee Nelly',
        date: '2023-07-31 16:15:32',
    },
    {
        id: 19,
        type: "Application expenses",
        amount: 1500,
        comment: 'Different withdrawer expenses',
        date: '2023-09-28 16:15:32',
    },
    {
        id: 20,
        type: "Withdrawal fee",
        amount: 200,
        comment: 'Withdrawal fee Maxine',
        date: '2023-10-03 16:15:32',
    },
    {
        id: 21,
        type: "Withdrawal fee",
        amount: 200,
        comment: 'Withdrawal fee Germaine',
        date: '2023-10-12 16:15:32',
    },
    {
        id: 22,
        type: "Withdrawal fee",
        amount: 894,
        comment: 'Withdrawal fee Damascène',
        date: '2023-10-13 16:15:32',
    },
    {
        id: 23,
        type: "Withdrawal fee",
        amount: 300,
        comment: 'Withdrawal fee Bonaventure',
        date: '2023-10-23 16:15:32',
    },
    {
        id: 24,
        type: "Withdrawal fee",
        amount: 200,
        comment: 'Withdrawal fee BOUBOU',
        date: '2023-11-15 16:15:32',
    },
    {
        id: 25,
        type: "Withdrawal fee",
        amount: 200,
        comment: 'Withdrawal fee Nelly',
        date: '2023-11-21 16:15:32',
    },
    {
        id: 26,
        type: "Withdrawal fee",
        amount: 200,
        comment: 'Withdrawal fee Dr Leonard',
        date: '2023-12-15 16:15:32',
    },
    {
        id: 27,
        type: "Cheque book",
        amount: 5300,
        comment: 'Cheque book',
        date: '2023-12-15 16:17:32',
    },
    {
        id: 28,
        type: "Application expenses",
        amount: 200,
        comment: 'Withdrawal fee',
        date: '2023-12-15 16:25:32',
    },
];

export const expensesTypes = [
    "Social",
    "Withdraw Fee",
    "Checque Book",
    "SMS Charges",
    "Application Expense",
    "Leaving Member Interest",
];

// Deposits
export const deposits = [
    {
        id: 0,
        member: 'Ndayizeye Leonard',
        type: "Cotisation",
        amount: 30000,
        comment: 'Saving deposit',
        date: '2022-12-16 16:15:32',
    },
    {
        id: 1,
        member: 'Bizumuremyi Jean Damascène',
        type: 'Cotisation',
        amount: 15000,
        comment: 'Saving deposit',
        date: '2022-12-16 16:20:07',
    },
    {
        id: 2,
        member: 'Ndayizeye Leonard',
        type: 'Social',
        amount: 5000,
        comment: 'Saving deposit',
        date: '2022-12-16 16:37:32',
    },
    {
        id: 3,
        member: 'Ngoboka Innocent',
        type: 'Cotisation',
        amount: 20000,
        comment: 'Saving deposit',
        date: '2022-12-31 16:15:32',
    },
    {
        id: 4,
        member: 'Ndayizeye Leonard',
        type: 'Social',
        amount: 5000,
        comment: 'Saving deposit',
        date: '2023-01-17 16:15:32',
    },
    {
        id: 5,
        member: 'Dusabimana Leonidas',
        type: 'Social',
        amount: 5000,
        comment: 'Saving deposit',
        date: '2023-01-17 16:15:32',
    },
    {
        id: 6,
        member: 'Bizumuremyi Jean Damascène',
        type: 'Social',
        amount: 5000,
        comment: 'Saving deposit',
        date: '2023-01-17 16:15:32',
    },
    {
        id: 7,
        member: 'Nzeyimana Bonaventure',
        type: 'Cotisation',
        amount: 20000,
        comment: 'Saving deposit',
        date: '2023-01-26 16:15:32',
    },
    {
        id: 8,
        member: 'Ruzindana Théogene',
        type: 'Social',
        amount: 5000,
        comment: 'Saving deposit',
        date: '2023-02-01 16:15:32',
    },
    {
        id: 9,
        member: 'Ngoboka Innocent',
        type: 'Cotisation',
        amount: 20000,
        comment: 'Saving deposit',
        date: '2023-02-01 16:15:32',
    },
    {
        id: 10,
        member: 'Nzeyimana Bonaventure',
        type: 'Social',
        amount: 5000,
        comment: 'Saving deposit',
        date: '2023-02-07 16:15:32',
    },
    {
        id: 11,
        member: 'Mugabe Alain',
        type: 'Social',
        amount: 5000,
        comment: 'Saving deposit',
        date: '2023-03-11 16:15:32',
    },
    {
        id: 12,
        member: 'Bizumuremyi Jean Damascène',
        type: 'Social',
        amount: 5000,
        comment: 'Saving deposit',
        date: '2023-03-30 16:15:32',
    },
    {
        id: 13,
        member: 'Nzeyimana Bonaventure',
        type: 'Cotisation',
        amount: 20000,
        comment: 'Saving deposit',
        date: '2023-04-19 16:15:32',
    },
    {
        id: 14,
        member: 'Bizumuremyi Jean Damascène',
        type: 'Social',
        amount: 5000,
        comment: 'Saving deposit',
        date: '2023-05-02 16:15:32',
    },
    {
        id: 15,
        member: 'Mugabe Alain',
        type: 'Cotisation',
        amount: 20000,
        comment: 'Saving deposit',
        date: '2023-05-02 16:15:32',
    },
    {
        id: 16,
        member: 'Dusabimana Leonidas',
        type: 'Cotisation',
        amount: 20000,
        comment: 'Saving deposit',
        date: '2023-07-06 16:15:32',
    },
    {
        id: 17,
        member: 'Ndayizeye Leonard',
        type: 'Cotisation',
        amount: 20000,
        comment: 'Saving deposit',
        date: '2023-07-28 16:15:32',
    },
    {
        id: 18,
        member: 'Nzeyimana Bonaventure',
        type: 'Social',
        amount: 5000,
        comment: 'Saving deposit',
        date: '2023-07-31 16:15:32',
    },
    {
        id: 19,
        member: 'Ruzindana Théogene',
        type: 'Social',
        amount: 5000,
        comment: 'Saving deposit',
        date: '2023-09-28 16:15:32',
    },
    {
        id: 20,
        member: 'Mugabe Alain',
        type: 'Cotisation',
        amount: 20000,
        comment: 'Saving deposit',
        date: '2023-10-03 16:15:32',
    },
    {
        id: 21,
        member: 'Mugabe Alain',
        type: 'Social',
        amount: 5000,
        comment: 'Saving deposit',
        date: '2023-10-12 16:15:32',
    },
    {
        id: 22,
        member: 'Dusabimana Leonidas',
        type: 'Cotisation',
        amount: 20000,
        comment: 'Saving deposit',
        date: '2023-10-13 16:15:32',
    },
    {
        id: 23,
        member: 'Rukundo Nelly Lambert',
        type: 'Cotisation',
        amount: 20000,
        comment: 'Saving deposit',
        date: '2023-10-23 16:15:32',
    },
    // {
    //     id: 24,
    //     member: 'Rukundo Nelly Lambert',
    //     type: 'Cotisation',
    //     amount: 20000,
    //     comment: 'Saving deposit',
    //     date: '2023-11-15 16:15:32',
    // },
    // {
    //     id: 25,
    //     member: 'Ndayizeye Leonard',
    //     type: 'Social',
    //     amount: 5000,
    //     comment: 'Saving deposit',
    //     date: '2023-11-21 16:15:32',
    // },
    // {
    //     id: 26,
    //     member: 'Ndayizeye Leonard',
    //     type: 'Cotisation',
    //     amount: 20000,
    //     comment: 'Saving deposit',
    //     date: '2023-12-15 16:15:32',
    // },
    // {
    //     id: 27,
    //     member: 'Ndayizeye Leonard',
    //     type: 'Social',
    //     amount: 5000,
    //     comment: 'Saving deposit',
    //     date: '2023-12-15 16:15:32',
    // },
    // {
    //     id: 28,
    //     member: 'Ndayizeye Leonard',
    //     type: 'Social',
    //     amount: 5000,
    //     comment: 'Saving deposit',
    //     date: '2023-12-15 16:15:32',
    // },
];

export const depositsTypes = [
    "Social",
    "Cotisation",
    // "Checque Book",
    // "SMS Charges",
    // "Application Expense",
    // "Leaving Member Interest",
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
    balance: 3061477,
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