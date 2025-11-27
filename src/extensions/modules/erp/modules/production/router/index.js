/**
 * Production Module Router
 * Routes สำหรับ Work Order Management
 */

import ProductionManager from '../shared/ProductionManager.vue'
import WorkOrderList from '../components/WorkOrderList.vue'
import WorkOrderDetail from '../components/WorkOrderDetail.vue'

export default [
  {
    path: '/production',
    name: 'production',
    component: ProductionManager,
    meta: {
      title: 'Production Management',
      requiresAuth: false
    }
  },
  {
    path: '/production/dashboard',
    name: 'production-dashboard',
    component: ProductionManager,
    meta: {
      title: 'Production Dashboard', 
      requiresAuth: false
    }
  },
  {
    path: '/production/work-orders',
    name: 'production-work-orders',
    component: WorkOrderList,
    meta: {
      title: 'Work Orders',
      requiresAuth: false // เปลี่ยนเป็น true ถ้าต้องการ authentication
    }
  },
  {
    path: '/production/work-order/:id',
    name: 'production-work-order-detail',
    component: WorkOrderDetail,
    props: true,
    meta: {
      title: 'รายละเอียด Work Order',
      requiresAuth: false
    }
  }
]