/**
 * Finance Module - Dashboard Menu Configuration
 * กำหนด menu items สำหรับ Finance Dashboard
 */

export const financeMenuItems = [
  {
    key: 'back',
    label: 'Back',
    icon: 'arrow-left',
    to: '/',
    opacity: true
  },
  {
    key: 'accounts-payable',
    label: 'Accounts Payable (AP)',
    icon: 'file-invoice-dollar',
    to: '/finance/accounts-payable'
  },
  {
    key: 'accounts-receivable',
    label: 'Accounts Receivable (AR)',
    icon: 'hand-holding-usd',
    to: '/finance/accounts-receivable'
  },
  {
    key: 'credit-debit-notes',
    label: 'Credit Note / Debit Note',
    icon: 'exchange-alt',
    to: '/finance/credit-debit-notes'
  },
  {
    key: 'tax-documents',
    label: 'Tax Documents',
    icon: 'file-contract',
    to: '/finance/tax-documents'
  },
  {
    key: 'ledger-view',
    label: 'Ledger View / Summary',
    icon: 'book-open',
    to: '/finance/ledger-view'
  },
  {
    key: 'journal-entries',
    label: 'Journal Entries',
    icon: 'pen-alt',
    to: '/finance/journal-entries'
  },
  {
    key: 'banking',
    label: 'Banking & Payments',
    icon: 'university',
    to: '/finance/banking'
  },
  {
    key: 'reports',
    label: 'Reports & Analytics',
    icon: 'chart-bar',
    to: '/finance/reports'
  },
  {
    key: 'settings',
    label: 'Settings',
    icon: 'cog',
    to: '/finance/settings'
  }
]

export default financeMenuItems
