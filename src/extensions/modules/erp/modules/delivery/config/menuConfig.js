/**
 * Delivery Module - Dashboard Menu Configuration
 * กำหนด menu items สำหรับ Delivery Dashboard
 */

export const deliveryMenuItems = [
  {
    key: 'back',
    label: 'Back',
    icon: 'arrow-left',
    to: '/',
    opacity: true
  },
  {
    key: 'delivery-request',
    label: 'Delivery Request',
    icon: 'clipboard-list',
    to: '/delivery/delivery-request'
  },
  {
    key: 'delivery-queue',
    label: 'คิวจัดส่งสินค้า',
    icon: 'truck-loading',
    to: '/delivery/delivery-queue'
  },
  {
    key: 'pick-pack',
    label: 'Pick & Pack',
    icon: 'boxes',
    to: '/delivery/pick-pack'
  },
  {
    key: 'shipment-tracking',
    label: 'Shipment Tracking',
    icon: 'map-marked-alt',
    to: '/delivery/shipment-tracking'
  },
  {
    key: 'delivery-confirmation',
    label: 'Delivery Confirmation',
    icon: 'check-circle',
    to: '/delivery/delivery-confirmation'
  },
  {
    key: 'route-planning',
    label: 'Route Planning',
    icon: 'route',
    to: '/delivery/route-planning'
  },
  {
    key: 'vehicle-management',
    label: 'Vehicle & Driver',
    icon: 'car',
    to: '/delivery/vehicle-management'
  },
  {
    key: 'reports',
    label: 'Reports & Analytics',
    icon: 'chart-bar',
    to: '/delivery/reports'
  },
  {
    key: 'settings',
    label: 'Settings',
    icon: 'cog',
    to: '/delivery/settings'
  }
]

export default deliveryMenuItems
