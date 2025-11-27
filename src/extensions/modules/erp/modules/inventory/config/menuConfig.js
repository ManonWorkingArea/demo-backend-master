/**
 * Inventory Module - Dashboard Menu Configuration
 * กำหนด menu items สำหรับ Inventory Dashboard
 */

export const inventoryMenuItems = [
  {
    key: 'back',
    label: 'Back',
    icon: 'arrow-left',
    to: '/',
    opacity: true
  },
  {
    key: 'barcode-scanner',
    label: 'สแกน Barcode',
    icon: 'camera',
    action: 'openBarcodeScanner'
  },
  {
    key: 'stock-overview',
    label: 'Stock Overview',
    icon: 'boxes',
    to: '/inventory/stock-overview'
  },
  {
    key: 'stock-locations',
    label: 'จัดการตำแหน่งคลัง',
    icon: 'map-marker-alt',
    to: '/inventory/stock-locations'
  },
  {
    key: 'products',
    label: 'จัดการสินค้า',
    icon: 'box',
    to: '/inventory/products'
  },
  {
    key: 'goods-receipt',
    label: 'รับเข้าสินค้า',
    icon: 'truck-loading',
    to: '/inventory/goods-receipt'
  },
  {
    key: 'stock-movement',
    label: 'Stock Movement / Transfer',
    icon: 'exchange-alt',
    to: '/inventory/stock-movement'
  },
  {
    key: 'stock-adjustment',
    label: 'Stock Adjustment',
    icon: 'edit',
    to: '/inventory/stock-adjustment'
  },
  {
    key: 'stock-reservation',
    label: 'Stock Reservation',
    icon: 'bookmark',
    to: '/inventory/stock-reservation'
  },
  {
    key: 'inventory-log',
    label: 'Inventory Log',
    icon: 'history',
    to: '/inventory/inventory-log'
  },
  {
    key: 'reports',
    label: 'Reports & Analytics',
    icon: 'chart-bar',
    to: '/inventory/reports'
  },
  {
    key: 'settings',
    label: 'Settings',
    icon: 'cog',
    to: '/inventory/settings'
  }
]

export default inventoryMenuItems
