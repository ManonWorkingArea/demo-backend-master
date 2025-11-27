/**
 * HR Module - Dashboard Menu Configuration
 * กำหนด menu items สำหรับ HR Dashboard
 */

export const hrMenuItems = [
  {
    key: 'back',
    label: 'Back',
    icon: 'arrow-left',
    to: '/',
    opacity: true // จะมี opacity-60
  },
  {
    key: 'employees',
    label: 'Employee Management',
    icon: 'id-badge',
    to: '/hr/employees'
  },
  {
    key: 'user-management',
    label: 'User Management',
    icon: 'users-cog',
    to: '/hr/user-management'
  },
  {
    key: 'departments',
    label: 'Departments',
    icon: 'sitemap',
    to: '/hr/departments'
  },
  {
    key: 'positions',
    label: 'Positions',
    icon: 'briefcase',
    to: '/hr/positions'
  },
  {
    key: 'attendance',
    label: 'Attendance',
    icon: 'clock',
    to: '/hr/attendance'
  },
  {
    key: 'payroll',
    label: 'Payroll',
    icon: 'money-check-alt',
    to: '/hr/payroll'
  },
  {
    key: 'leave',
    label: 'Leave Management',
    icon: 'calendar-check',
    to: '/hr/leave'
  },
  {
    key: 'reports',
    label: 'HR Reports',
    icon: 'chart-bar',
    to: '/hr/reports'
  },
  {
    key: 'settings',
    label: 'HR Settings',
    icon: 'cog',
    to: '/hr/settings'
  }
]

export default hrMenuItems
