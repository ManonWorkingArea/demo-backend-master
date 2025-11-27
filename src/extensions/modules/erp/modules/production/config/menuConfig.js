/**
 * Production Module - Dashboard Menu Configuration
 * กำหนด menu items สำหรับ Production Dashboard
 */

export const productionMenuItems = [
  {
    key: 'back',
    label: 'Back',
    icon: 'arrow-left',
    to: '/',
    opacity: true
  },
  {
    key: 'production-plan',
    label: 'Production Plan',
    icon: 'calendar-alt',
    to: '/production/production-plan'
  },
  {
    key: 'work-orders',
    label: 'Work Orders',
    icon: 'clipboard-list',
    to: '/production/work-orders'
  },
  {
    key: 'work-orders-manage',
    label: 'จัดการ Work Orders',
    icon: 'tasks',
    to: '/production/work-orders/manage'
  },
  {
    key: 'production-progress',
    label: 'Production Progress',
    icon: 'tasks',
    to: '/production/production-progress'
  },
  {
    key: 'production-result',
    label: 'Production Result / FG Output',
    icon: 'check-circle',
    to: '/production/production-result'
  },
  {
    key: 'production-qc',
    label: 'Production QC',
    icon: 'search',
    to: '/production/production-qc'
  },
  {
    key: 'reports',
    label: 'Reports & Analytics',
    icon: 'chart-bar',
    to: '/production/reports'
  },
  {
    key: 'settings',
    label: 'Settings',
    icon: 'cog',
    to: '/production/settings'
  }
]

export default productionMenuItems
