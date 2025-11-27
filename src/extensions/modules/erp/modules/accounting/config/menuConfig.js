/**
 * Accounting Module - Dashboard Menu Configuration
 * กำหนด menu items สำหรับ Accounting Dashboard
 */

export const accountingMenuItems = [
  {
    key: 'back',
    label: 'Back',
    icon: 'arrow-left',
    to: '/',
    opacity: true
  },
  {
    key: 'journal-entries',
    label: 'Journal Entries',
    icon: 'pen-alt',
    to: '/accounting/journal-entries'
  },
  {
    key: 'general-ledger',
    label: 'General Ledger',
    icon: 'book',
    to: '/accounting/general-ledger'
  },
  {
    key: 'accounts-receivable',
    label: 'Accounts Receivable',
    icon: 'hand-holding-usd',
    to: '/accounting/accounts-receivable'
  },
  {
    key: 'accounts-payable',
    label: 'Accounts Payable',
    icon: 'file-invoice',
    to: '/accounting/accounts-payable'
  },
  {
    key: 'cash-bank',
    label: 'Cash & Bank',
    icon: 'money-bill-wave',
    to: '/accounting/cash-bank'
  },
  {
    key: 'tax',
    label: 'Tax Management',
    icon: 'file-invoice-dollar',
    to: '/accounting/tax-management'
  },
  {
    key: 'fixed-assets',
    label: 'Fixed Assets',
    icon: 'building',
    to: '/accounting/fixed-assets'
  },
  {
    key: 'trial-balance',
    label: 'Trial Balance',
    icon: 'balance-scale',
    to: '/accounting/trial-balance'
  },
  {
    key: 'reports',
    label: 'Financial Reports',
    icon: 'chart-line',
    to: '/accounting/reports'
  },
  {
    key: 'chart-of-accounts',
    label: 'Chart of Accounts',
    icon: 'list-alt',
    to: '/accounting/chart-of-accounts'
  },
  {
    key: 'fiscal-periods',
    label: 'Fiscal Periods',
    icon: 'calendar-alt',
    to: '/accounting/fiscal-periods'
  },
  {
    key: 'settings',
    label: 'Settings',
    icon: 'sliders-h',
    to: '/accounting/settings'
  }
]

export default accountingMenuItems
