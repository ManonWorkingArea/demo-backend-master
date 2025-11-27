const slug = "accounting";
const title = "Accounting";

export default [
  {
    path: `/${slug}`,
    name: `${slug}`,
    redirect: `/${slug}/dashboard`,
    description: "ระบบบัญชีและการเงิน - Chart of Accounts, Journal Entries, Financial Reports",
    groups: 'erp',
    default: false,
    hasSubmenu: false,
    hasDashboard: false,
    inApp: 'yes',
    inTop: 'yes',
    meta: {
      inMenu: true,
      title: title,
      parent: slug,
      key: 'dashboard',
      main: title,
      icon: "calculator",
      role: ['admin', 'manager', 'accountant', 'finance'],
    },
    children: [
      // === DASHBOARD ===
      {
        path: 'dashboard',
        name: `${slug}-dashboard`,
        component: () => import('./components/dashboard'),
        meta: {
          inMenu: true,
          inFront: true,
          parent: slug,
          main: title,
          key: 'dashboard',
          title: "Dashboard",
          type: 'page',
          auth: true,
          icon: "chart-line",
          role: ['admin', 'manager', 'accountant', 'finance'],
        }
      },

      // === TRANSACTIONS ===
      {
        path: 'journal-entries',
        name: `${slug}-journal-entries`,
        component: () => import('./components/journal-entries/List.vue'),
        meta: {
          inMenu: true,
          parent: slug,
          main: title,
          key: 'journal-entries',
          title: "Journal Entries",
          type: 'page',
          auth: true,
          icon: "pen-alt",
          role: ['admin', 'manager', 'accountant'],
        }
      },
      {
        path: 'general-ledger',
        name: `${slug}-general-ledger`,
        component: () => import('./components/general-ledger/List.vue'),
        meta: {
          inMenu: true,
          parent: slug,
          main: title,
          key: 'general-ledger',
          title: "General Ledger",
          type: 'page',
          auth: true,
          icon: "book",
          role: ['admin', 'manager', 'accountant', 'finance'],
        }
      },

      // === AP / AR ===
      {
        path: 'accounts-receivable',
        name: `${slug}-accounts-receivable`,
        component: () => import('./components/accounts-receivable/List.vue'),
        meta: {
          inMenu: true,
          parent: slug,
          main: title,
          key: 'accounts-receivable',
          title: "Accounts Receivable",
          type: 'page',
          auth: true,
          icon: "hand-holding-usd",
          role: ['admin', 'manager', 'accountant', 'finance', 'sales'],
        }
      },
      {
        path: 'accounts-payable',
        name: `${slug}-accounts-payable`,
        component: () => import('./components/accounts-payable/List.vue'),
        meta: {
          inMenu: true,
          parent: slug,
          main: title,
          key: 'accounts-payable',
          title: "Accounts Payable",
          type: 'page',
          auth: true,
          icon: "file-invoice",
          role: ['admin', 'manager', 'accountant', 'finance', 'purchase'],
        }
      },

      // === CASH & BANK ===
      {
        path: 'cash-bank',
        name: `${slug}-cash-bank`,
        component: () => import('./components/cash-bank/List.vue'),
        meta: {
          inMenu: true,
          parent: slug,
          main: title,
          key: 'cash-bank',
          title: "Cash & Bank",
          type: 'page',
          auth: true,
          icon: "money-bill-wave",
          role: ['admin', 'manager', 'accountant', 'finance'],
        }
      },

      // === TAX MANAGEMENT ===
      {
        path: 'tax-management',
        name: `${slug}-tax-management`,
        component: () => import('./components/tax/List.vue'),
        meta: {
          inMenu: true,
          parent: slug,
          main: title,
          key: 'tax-management',
          title: "Tax Management",
          type: 'page',
          auth: true,
          icon: "file-invoice-dollar",
          role: ['admin', 'manager', 'accountant'],
        }
      },

      // === FIXED ASSETS ===
      {
        path: 'fixed-assets',
        name: `${slug}-fixed-assets`,
        component: () => import('./components/fixed-assets/List.vue'),
        meta: {
          inMenu: true,
          parent: slug,
          main: title,
          key: 'fixed-assets',
          title: "Fixed Assets",
          type: 'page',
          auth: true,
          icon: "building",
          role: ['admin', 'manager', 'accountant'],
        }
      },

      // === REPORTS ===
      {
        path: 'trial-balance',
        name: `${slug}-trial-balance`,
        component: () => import('./components/reports/TrialBalance.vue'),
        meta: {
          inMenu: true,
          parent: slug,
          main: title,
          key: 'trial-balance',
          title: "Trial Balance",
          type: 'page',
          auth: true,
          icon: "balance-scale",
          role: ['admin', 'manager', 'accountant'],
        }
      },
      {
        path: 'reports',
        name: `${slug}-reports`,
        component: () => import('./components/reports/List.vue'),
        meta: {
          inMenu: true,
          parent: slug,
          main: title,
          key: 'reports',
          title: "Financial Reports",
          type: 'page',
          auth: true,
          icon: "chart-line",
          role: ['admin', 'manager', 'accountant'],
        }
      },

      // === SETUP ===
      {
        path: 'chart-of-accounts',
        name: `${slug}-chart-of-accounts`,
        component: () => import('./components/chart-of-accounts/List.vue'),
        meta: {
          inMenu: true,
          parent: slug,
          main: title,
          key: 'chart-of-accounts',
          title: "Chart of Accounts",
          type: 'page',
          auth: true,
          icon: "list-alt",
          role: ['admin', 'manager', 'accountant'],
        }
      },
      {
        path: 'fiscal-periods',
        name: `${slug}-fiscal-periods`,
        component: () => import('./components/fiscal-periods/List.vue'),
        meta: {
          inMenu: true,
          parent: slug,
          main: title,
          key: 'fiscal-periods',
          title: "Fiscal Periods",
          type: 'page',
          auth: true,
          icon: "calendar-alt",
          role: ['admin', 'accountant'],
        }
      },
      {
        path: 'settings',
        name: `${slug}-settings`,
        component: () => import('./components/settings/List.vue'),
        meta: {
          inMenu: true,
          parent: slug,
          main: title,
          key: 'settings',
          title: "Settings",
          type: 'page',
          auth: true,
          icon: "sliders-h",
          role: ['admin'],
        }
      },
      
      // === HIDDEN DETAIL ROUTES (ไม่แสดงในเมนู) ===
      {
        path: 'chart-of-accounts/create',
        name: `${slug}-coa-create`,
        component: () => import('./components/chart-of-accounts/Create.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'coa-create',
          title: "เพิ่มบัญชีใหม่",
          type: 'page',
          auth: true,
          icon: "plus",
          role: ['admin', 'accountant'],
        }
      },
      {
        path: 'chart-of-accounts/:id',
        name: `${slug}-coa-detail`,
        component: () => import('./components/chart-of-accounts/Detail.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'coa-detail',
          title: "รายละเอียดบัญชี",
          type: 'page',
          auth: true,
          icon: "eye",
          role: ['admin', 'manager', 'accountant', 'finance'],
        }
      },

      // === JOURNAL ENTRIES ===
      {
        path: 'journal-entries/create',
        name: `${slug}-journal-create`,
        component: () => import('./components/journal-entries/Create.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'journal-create',
          title: "สร้างรายการบัญชี",
          type: 'page',
          auth: true,
          icon: "plus",
          role: ['admin', 'accountant'],
        }
      },
      {
        path: 'journal-entries/:id',
        name: `${slug}-journal-detail`,
        component: () => import('./components/journal-entries/Detail.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'journal-detail',
          title: "รายละเอียดรายการบัญชี",
          type: 'page',
          auth: true,
          icon: "eye",
          role: ['admin', 'manager', 'accountant', 'finance'],
        }
      },

      // === GENERAL LEDGER ===
      {
        path: 'general-ledger/:account_code',
        name: `${slug}-ledger-detail`,
        component: () => import('./components/general-ledger/Detail.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'ledger-detail',
          title: "Account Ledger",
          type: 'page',
          auth: true,
          icon: "file-alt",
          role: ['admin', 'manager', 'accountant', 'finance'],
        }
      },

      // === ACCOUNTS PAYABLE (AP) ===
      {
        path: 'accounts-payable/:id',
        name: `${slug}-ap-detail`,
        component: () => import('./components/accounts-payable/Detail.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'ap-detail',
          title: "รายละเอียด AP",
          type: 'page',
          auth: true,
          icon: "eye",
          role: ['admin', 'manager', 'accountant', 'finance', 'purchase'],
        }
      },

      // === ACCOUNTS RECEIVABLE (AR) ===
      {
        path: 'accounts-receivable/:id',
        name: `${slug}-ar-detail`,
        component: () => import('./components/accounts-receivable/Detail.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'ar-detail',
          title: "รายละเอียด AR",
          type: 'page',
          auth: true,
          icon: "eye",
          role: ['admin', 'manager', 'accountant', 'finance', 'sales'],
        }
      },

      // === TRIAL BALANCE ===
      {
        path: 'reports/balance-sheet',
        name: `${slug}-balance-sheet`,
        component: () => import('./components/reports/BalanceSheet.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'balance-sheet',
          title: "งบดุล (Balance Sheet)",
          type: 'page',
          auth: true,
          icon: "chart-area",
          role: ['admin', 'manager', 'accountant'],
        }
      },
      {
        path: 'reports/income-statement',
        name: `${slug}-income-statement`,
        component: () => import('./components/reports/IncomeStatement.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'income-statement',
          title: "งบกำไรขาดทุน (Income Statement)",
          type: 'page',
          auth: true,
          icon: "chart-line",
          role: ['admin', 'manager', 'accountant'],
        }
      },
      {
        path: 'reports/cash-flow',
        name: `${slug}-cash-flow`,
        component: () => import('./components/reports/CashFlow.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'cash-flow',
          title: "งบกระแสเงินสด (Cash Flow)",
          type: 'page',
          auth: true,
          icon: "hand-holding-water",
          role: ['admin', 'manager', 'accountant'],
        }
      },

      // === FISCAL PERIOD ===
      {
        path: 'fiscal-periods/create',
        name: `${slug}-period-create`,
        component: () => import('./components/fiscal-periods/Create.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'period-create',
          title: "สร้างงวดบัญชี",
          type: 'page',
          auth: true,
          icon: "plus",
          role: ['admin'],
        }
      },

      // === SETTINGS ===
      {
        path: 'number-series',
        name: `${slug}-number-series`,
        component: () => import('./components/number-series/List.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'number-series',
          title: "Number Series",
          type: 'page',
          auth: true,
          icon: "hashtag",
          role: ['admin'],
        }
      },
    ]
  }
]
