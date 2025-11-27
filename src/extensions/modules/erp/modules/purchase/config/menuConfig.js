/**
 * Purchase Module - Dashboard Menu Configuration
 * กำหนด menu items สำหรับ Purchase Dashboard
 */

export const purchaseMenuItems = [
  {
    key: 'back',
    label: 'Back',
    icon: 'arrow-left',
    to: '/',
    opacity: true
  },
  {
    key: 'purchase-request',
    label: 'Purchase Request (PR)',
    icon: 'file-alt',
    to: '/purchase/purchase-request'
  },
  {
    key: 'purchase-order',
    label: 'Purchase Order (PO)',
    icon: 'shopping-bag',
    to: '/purchase/purchase-order'
  },
  {
    key: 'goods-receipt',
    label: 'Goods Receipt (GRN)',
    icon: 'truck-loading',
    to: '/purchase/goods-receipt'
  },
  {
    key: 'invoice',
    label: 'Purchase Invoice (AP)',
    icon: 'file-invoice',
    to: '/purchase/invoice'
  },
  {
    key: 'suppliers',
    label: 'Supplier Master',
    icon: 'users',
    to: '/purchase/suppliers'
  },
  {
    key: 'reports',
    label: 'Reports & Analytics',
    icon: 'chart-bar',
    to: '/purchase/reports'
  },
  {
    key: 'settings',
    label: 'Settings',
    icon: 'cog',
    to: '/purchase/settings'
  }
]

export default purchaseMenuItems
