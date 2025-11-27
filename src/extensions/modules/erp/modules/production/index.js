/**
 * Production Module Entry Point
 * ทดสอบ Work Order System
 */

// Import router
import productionRoutes from './router/index.js'

// Export modules
export { productionRoutes }

// Export components as dynamic imports
export const WorkOrderList = () => import('./components/WorkOrderList.vue')
export const WorkOrderDetail = () => import('./components/WorkOrderDetail.vue')

// Register routes if router is available
if (window.Vue && window.VueRouter) {
  console.log('📦 Production module loaded with routes:', productionRoutes.length)
}