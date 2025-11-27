/**
 * Dummy Module - Dashboard Menu Configuration
 * กำหนด menu items สำหรับ Dummy Dashboard
 */

export const dummyMenuItems = [
  {
    key: 'back',
    label: 'Back',
    icon: 'arrow-left',
    to: '/',
    opacity: true
  },
  {
    key: 'overview',
    label: 'Overview',
    icon: 'chart-line',
    to: '/dummy/overview'
  },
  {
    key: 'items',
    label: 'Items Management',
    icon: 'list',
    to: '/dummy/items'
  },
  {
    key: 'datatable',
    label: 'Data Table Template',
    icon: 'table',
    to: '/dummy/datatable'
  },
  {
    key: 'templates',
    label: 'Layout Templates',
    icon: 'th-large',
    to: '/dummy/templates'
  },
  {
    key: 'elements',
    label: 'UI Elements',
    icon: 'palette',
    to: '/dummy/elements'
  },
  {
    key: 'reports',
    label: 'Reports & Analytics',
    icon: 'chart-bar',
    to: '/dummy/reports'
  },
  {
    key: 'settings',
    label: 'Settings',
    icon: 'cog',
    to: '/dummy/settings'
  }
]

export default dummyMenuItems
