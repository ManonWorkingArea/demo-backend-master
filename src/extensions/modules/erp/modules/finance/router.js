const slug = "finance";
const title = "Finance";

export default [
  {
    path: `/${slug}`,
    name: `${slug}`,
    redirect: `/${slug}/dashboard`,
    description: "ระบบการเงินและบัญชี ครอบคลุม AP (เจ้าหนี้) → AR (ลูกหนี้) → Credit/Debit Note → Tax Documents → Ledger View",
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
      role: ['admin', 'manager', 'accountant', 'finance', 'purchase', 'sales'],
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

      // === ACCOUNTS PAYABLE (AP) ===
      {
        path: 'accounts-payable',
        name: `${slug}-accounts-payable`,
        component: () => import('./components/accounts-payable/List.vue'),
        meta: {
          inMenu: true,
          parent: slug,
          main: title,
          key: 'accounts-payable',
          title: "Accounts Payable (AP)",
          type: 'page',
          auth: true,
          icon: "file-invoice-dollar",
          role: ['admin', 'manager', 'accountant', 'finance', 'purchase'],
        }
      },
      {
        path: 'accounts-payable/purchase-invoices',
        name: `${slug}-ap-purchase-invoices`,
        component: () => import('./shared/FinanceManager.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'ap-purchase-invoices',
          title: "ใบแจ้งหนี้ขาเข้า (จาก Purchase)",
          type: 'page',
          auth: true,
          icon: "file-import",
          role: ['admin', 'manager', 'accountant', 'finance', 'purchase'],
        }
      },
      {
        path: 'accounts-payable/create-invoice',
        name: `${slug}-ap-create-invoice`,
        component: () => import('./components/accounts-payable/Create.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'ap-create-invoice',
          title: "สร้างใบแจ้งหนี้เจ้าหนี้",
          type: 'page',
          auth: true,
          icon: "plus",
          role: ['admin', 'manager', 'accountant', 'finance'],
        }
      },
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
      {
        path: 'accounts-payable/:id/payment',
        name: `${slug}-ap-payment`,
        component: () => import('./shared/FinanceManager.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'ap-payment',
          title: "ชำระเงิน Supplier",
          type: 'page',
          auth: true,
          icon: "money-check-alt",
          role: ['admin', 'manager', 'accountant', 'finance'],
        }
      },
      {
        path: 'accounts-payable/payments',
        name: `${slug}-ap-payments`,
        component: () => import('./shared/FinanceManager.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'ap-payments',
          title: "รายการชำระเจ้าหนี้",
          type: 'page',
          auth: true,
          icon: "list-alt",
          role: ['admin', 'manager', 'accountant', 'finance'],
        }
      },

      // === ACCOUNTS RECEIVABLE (AR) ===
      {
        path: 'accounts-receivable',
        name: `${slug}-accounts-receivable`,
        component: () => import('./components/accounts-receivable/List.vue'),
        meta: {
          inMenu: true,
          parent: slug,
          main: title,
          key: 'accounts-receivable',
          title: "Accounts Receivable (AR)",
          type: 'page',
          auth: true,
          icon: "hand-holding-usd",
          role: ['admin', 'manager', 'accountant', 'finance', 'sales'],
        }
      },
      {
        path: 'accounts-receivable/sales-invoices',
        name: `${slug}-ar-sales-invoices`,
        component: () => import('./shared/FinanceManager.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'ar-sales-invoices',
          title: "ใบแจ้งหนี้ขาออก (จาก Sales)",
          type: 'page',
          auth: true,
          icon: "file-export",
          role: ['admin', 'manager', 'accountant', 'finance', 'sales'],
        }
      },
      {
        path: 'accounts-receivable/create-invoice',
        name: `${slug}-ar-create-invoice`,
        component: () => import('./components/accounts-receivable/Create.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'ar-create-invoice',
          title: "สร้างใบแจ้งหนี้ลูกหนี้",
          type: 'page',
          auth: true,
          icon: "plus",
          role: ['admin', 'manager', 'accountant', 'finance'],
        }
      },
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
      {
        path: 'accounts-receivable/:id/receipt',
        name: `${slug}-ar-receipt`,
        component: () => import('./shared/FinanceManager.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'ar-receipt',
          title: "รับชำระเงินจากลูกค้า",
          type: 'page',
          auth: true,
          icon: "money-bill-wave",
          role: ['admin', 'manager', 'accountant', 'finance'],
        }
      },
      {
        path: 'accounts-receivable/receipts',
        name: `${slug}-ar-receipts`,
        component: () => import('./shared/FinanceManager.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'ar-receipts',
          title: "รายการรับชำระ",
          type: 'page',
          auth: true,
          icon: "receipt",
          role: ['admin', 'manager', 'accountant', 'finance'],
        }
      },

      // === CREDIT NOTE / DEBIT NOTE ===
      {
        path: 'credit-debit-notes',
        name: `${slug}-credit-debit-notes`,
        component: () => import('./components/credit-debit-notes/List.vue'),
        meta: {
          inMenu: true,
          parent: slug,
          main: title,
          key: 'credit-debit-notes',
          title: "Credit Note / Debit Note",
          type: 'page',
          auth: true,
          icon: "exchange-alt",
          role: ['admin', 'manager', 'accountant', 'finance'],
        }
      },
      {
        path: 'credit-debit-notes/credit-note/create',
        name: `${slug}-credit-note-create`,
        component: () => import('./shared/FinanceManager.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'credit-note-create',
          title: "สร้าง Credit Note",
          type: 'page',
          auth: true,
          icon: "plus-circle",
          role: ['admin', 'manager', 'accountant', 'finance'],
        }
      },
      {
        path: 'credit-debit-notes/debit-note/create',
        name: `${slug}-debit-note-create`,
        component: () => import('./shared/FinanceManager.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'debit-note-create',
          title: "สร้าง Debit Note",
          type: 'page',
          auth: true,
          icon: "plus-square",
          role: ['admin', 'manager', 'accountant', 'finance'],
        }
      },
      {
        path: 'credit-debit-notes/:id',
        name: `${slug}-note-detail`,
        component: () => import('./shared/FinanceManager.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'note-detail',
          title: "รายละเอียดใบปรับยอด",
          type: 'page',
          auth: true,
          icon: "eye",
          role: ['admin', 'manager', 'accountant', 'finance'],
        }
      },
      {
        path: 'credit-debit-notes/:id/edit',
        name: `${slug}-note-edit`,
        component: () => import('./shared/FinanceManager.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'note-edit',
          title: "แก้ไขใบปรับยอด",
          type: 'page',
          auth: true,
          icon: "edit",
          role: ['admin', 'manager', 'accountant'],
        }
      },
      {
        path: 'credit-debit-notes/:id/apply',
        name: `${slug}-note-apply`,
        component: () => import('./shared/FinanceManager.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'note-apply',
          title: "ปรับยอดภายหลัง",
          type: 'page',
          auth: true,
          icon: "sync-alt",
          role: ['admin', 'manager', 'accountant', 'finance'],
        }
      },

      // === TAX DOCUMENTS ===
      {
        path: 'tax-documents',
        name: `${slug}-tax-documents`,
        component: () => import('./components/tax-documents/List.vue'),
        meta: {
          inMenu: true,
          parent: slug,
          main: title,
          key: 'tax-documents',
          title: "Tax Documents",
          type: 'page',
          auth: true,
          icon: "file-contract",
          role: ['admin', 'manager', 'accountant', 'finance'],
        }
      },
      {
        path: 'tax-documents/tax-invoices',
        name: `${slug}-tax-invoices`,
        component: () => import('./shared/FinanceManager.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'tax-invoices',
          title: "ใบกำกับภาษี",
          type: 'page',
          auth: true,
          icon: "file-invoice",
          role: ['admin', 'manager', 'accountant', 'finance'],
        }
      },
      {
        path: 'tax-documents/withholding-tax',
        name: `${slug}-withholding-tax`,
        component: () => import('./shared/FinanceManager.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'withholding-tax',
          title: "ใบหัก ณ ที่จ่าย",
          type: 'page',
          auth: true,
          icon: "percentage",
          role: ['admin', 'manager', 'accountant', 'finance'],
        }
      },
      {
        path: 'tax-documents/create/:type',
        name: `${slug}-tax-create`,
        component: () => import('./shared/FinanceManager.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'tax-create',
          title: "สร้างเอกสารภาษี",
          type: 'page',
          auth: true,
          icon: "plus",
          role: ['admin', 'manager', 'accountant', 'finance'],
        }
      },
      {
        path: 'tax-documents/:id',
        name: `${slug}-tax-detail`,
        component: () => import('./shared/FinanceManager.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'tax-detail',
          title: "รายละเอียดเอกสารภาษี",
          type: 'page',
          auth: true,
          icon: "eye",
          role: ['admin', 'manager', 'accountant', 'finance'],
        }
      },
      {
        path: 'tax-documents/:id/edit',
        name: `${slug}-tax-edit`,
        component: () => import('./shared/FinanceManager.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'tax-edit',
          title: "แก้ไขเอกสารภาษี",
          type: 'page',
          auth: true,
          icon: "edit",
          role: ['admin', 'manager', 'accountant'],
        }
      },
      {
        path: 'tax-documents/reports',
        name: `${slug}-tax-reports`,
        component: () => import('./shared/FinanceManager.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'tax-reports',
          title: "รายงานภาษี",
          type: 'page',
          auth: true,
          icon: "chart-line",
          role: ['admin', 'manager', 'accountant'],
        }
      },

      // === LEDGER VIEW / SUMMARY ===
      {
        path: 'ledger-view',
        name: `${slug}-ledger-view`,
        component: () => import('./components/ledger-view/List.vue'),
        meta: {
          inMenu: true,
          parent: slug,
          main: title,
          key: 'ledger-view',
          title: "Ledger View / Summary",
          type: 'page',
          auth: true,
          icon: "book-open",
          role: ['admin', 'manager', 'accountant', 'finance'],
        }
      },
      {
        path: 'ledger-view/general-ledger',
        name: `${slug}-general-ledger`,
        component: () => import('./shared/FinanceManager.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'general-ledger',
          title: "รายงานรายการบัญชี",
          type: 'page',
          auth: true,
          icon: "book",
          role: ['admin', 'manager', 'accountant'],
        }
      },
      {
        path: 'ledger-view/trial-balance',
        name: `${slug}-trial-balance`,
        component: () => import('./shared/FinanceManager.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'trial-balance',
          title: "งบทดลอง",
          type: 'page',
          auth: true,
          icon: "balance-scale",
          role: ['admin', 'manager', 'accountant'],
        }
      },
      {
        path: 'ledger-view/balance-sheet',
        name: `${slug}-balance-sheet`,
        component: () => import('./shared/FinanceManager.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'balance-sheet',
          title: "งบดุล",
          type: 'page',
          auth: true,
          icon: "chart-area",
          role: ['admin', 'manager', 'accountant'],
        }
      },
      {
        path: 'ledger-view/income-statement',
        name: `${slug}-income-statement`,
        component: () => import('./shared/FinanceManager.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'income-statement',
          title: "งบกำไรขาดทุน",
          type: 'page',
          auth: true,
          icon: "chart-line",
          role: ['admin', 'manager', 'accountant'],
        }
      },
      {
        path: 'ledger-view/cash-flow',
        name: `${slug}-cash-flow`,
        component: () => import('./shared/FinanceManager.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'cash-flow',
          title: "งบกระแสเงินสด",
          type: 'page',
          auth: true,
          icon: "hand-holding-water",
          role: ['admin', 'manager', 'accountant'],
        }
      },
      {
        path: 'ledger-view/transaction-snapshot',
        name: `${slug}-transaction-snapshot`,
        component: () => import('./shared/FinanceManager.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'transaction-snapshot',
          title: "Snapshot จาก Transactions",
          type: 'page',
          auth: true,
          icon: "camera",
          role: ['admin', 'manager', 'accountant', 'finance'],
        }
      },

      // === JOURNAL ENTRIES ===
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
        path: 'journal-entries/create',
        name: `${slug}-journal-create`,
        component: () => import('./shared/FinanceManager.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'journal-create',
          title: "สร้างรายการบัญชี",
          type: 'page',
          auth: true,
          icon: "plus",
          role: ['admin', 'manager', 'accountant'],
        }
      },
      {
        path: 'journal-entries/:id',
        name: `${slug}-journal-detail`,
        component: () => import('./shared/FinanceManager.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'journal-detail',
          title: "รายละเอียดรายการบัญชี",
          type: 'page',
          auth: true,
          icon: "eye",
          role: ['admin', 'manager', 'accountant'],
        }
      },
      {
        path: 'journal-entries/:id/edit',
        name: `${slug}-journal-edit`,
        component: () => import('./shared/FinanceManager.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'journal-edit',
          title: "แก้ไขรายการบัญชี",
          type: 'page',
          auth: true,
          icon: "edit",
          role: ['admin', 'manager', 'accountant'],
        }
      },

      // === BANKING & PAYMENTS ===
      {
        path: 'banking',
        name: `${slug}-banking`,
        component: () => import('./components/banking/List.vue'),
        meta: {
          inMenu: true,
          parent: slug,
          main: title,
          key: 'banking',
          title: "Banking & Payments",
          type: 'page',
          auth: true,
          icon: "university",
          role: ['admin', 'manager', 'accountant', 'finance'],
        }
      },
      {
        path: 'banking/bank-accounts',
        name: `${slug}-bank-accounts`,
        component: () => import('./shared/FinanceManager.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'bank-accounts',
          title: "บัญชีธนาคาร",
          type: 'page',
          auth: true,
          icon: "piggy-bank",
          role: ['admin', 'manager', 'accountant'],
        }
      },
      {
        path: 'banking/reconciliation',
        name: `${slug}-bank-reconciliation`,
        component: () => import('./shared/FinanceManager.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'bank-reconciliation',
          title: "กระทบยอดธนาคาร",
          type: 'page',
          auth: true,
          icon: "sync",
          role: ['admin', 'manager', 'accountant'],
        }
      },

      // === REPORTS & ANALYTICS ===
      {
        path: 'reports',
        name: `${slug}-reports`,
        component: () => import('./components/reports/List.vue'),
        meta: {
          inMenu: true,
          parent: slug,
          main: title,
          key: 'reports',
          title: "Reports & Analytics",
          type: 'page',
          auth: true,
          icon: "chart-bar",
          role: ['admin', 'manager', 'accountant'],
        }
      },

      // === SETTINGS ===
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
          icon: "cog",
          role: ['admin'],
        }
      },

      // === PRINT & EXPORT ===
      {
        path: 'accounts-payable/:id/print',
        name: `${slug}-ap-print`,
        component: () => import('./shared/FinanceManager.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'ap-print',
          title: "พิมพ์ใบแจ้งหนี้เจ้าหนี้",
          type: 'page',
          auth: false,
          mode: 'blank',
          icon: "print",
          role: ['admin', 'manager', 'accountant', 'finance'],
        }
      },
      {
        path: 'accounts-receivable/:id/print',
        name: `${slug}-ar-print`,
        component: () => import('./shared/FinanceManager.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'ar-print',
          title: "พิมพ์ใบแจ้งหนี้ลูกหนี้",
          type: 'page',
          auth: false,
          mode: 'blank',
          icon: "print",
          role: ['admin', 'manager', 'accountant', 'finance'],
        }
      },
      {
        path: 'credit-debit-notes/:id/print',
        name: `${slug}-note-print`,
        component: () => import('./shared/FinanceManager.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'note-print',
          title: "พิมพ์ใบปรับยอด",
          type: 'page',
          auth: false,
          mode: 'blank',
          icon: "print",
          role: ['admin', 'manager', 'accountant', 'finance'],
        }
      },
      {
        path: 'tax-documents/:id/print',
        name: `${slug}-tax-print`,
        component: () => import('./shared/FinanceManager.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'tax-print',
          title: "พิมพ์เอกสารภาษี",
          type: 'page',
          auth: false,
          mode: 'blank',
          icon: "print",
          role: ['admin', 'manager', 'accountant', 'finance'],
        }
      }
    ]
  }
]