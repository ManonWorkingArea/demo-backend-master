/**
 * Sales Module - Dashboard Menu Configuration
 * กำหนด menu items สำหรับ Sales Dashboard
 */

export const salesMenuItems = [
  {
    key: 'back',
    label: 'Back',
    icon: 'arrow-left',
    to: '/',
    opacity: true
  },
  {
    key: 'quotation',
    label: 'Quotation',
    icon: 'file-alt',
    to: '/sales/quotation'
  },
  {
    key: 'invoice',
    label: 'Invoice',
    icon: 'file-invoice',
    to: '/sales/invoice'
  },
  {
    key: 'sales-order',
    label: 'Sales Order',
    icon: 'shopping-cart',
    to: '/sales/sales-order'
  },
  {
    key: 'customers',
    label: 'Customer Master',
    icon: 'users',
    to: '/sales/customers'
  }
]

export default salesMenuItems
