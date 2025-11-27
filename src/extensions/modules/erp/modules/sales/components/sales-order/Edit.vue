<template>
  <div class="sales-order-edit">
    <ErpBreadcrumb :nav="breadcrumbNav" />
    
    <h2>Edit Sales Order</h2>
    <!-- Sales order edit form -->
  </div>
</template>

<script>
import { ref } from 'vue'
import { ErpBreadcrumb } from '@/extensions/modules/erp'

/**
 * ✅ CORE COMPLIANT - Sales Order Edit
 * ใช้ Dynamic Module Loading
 */
export default {
  name: 'SalesOrderEdit',
  components: {
    ErpBreadcrumb
  },
  setup() {
    const getSalesModule = () => {
      return window.ERP_CORE?.modules?.sales || {}
    }

    const sales = getSalesModule()
    
    const breadcrumbNav = ref([
      { name: 'Home', path: '/', icon: 'fas fa-home' },
      { name: 'Sales', path: '/sales', icon: 'fas fa-shopping-cart' },
      { name: 'Sales Orders', path: '/sales/sales-order', icon: 'fas fa-file-invoice' },
      { name: 'Edit Sales Order' }
    ])
    
    return {
      SALES_ORDER_STATES: sales.SALES_ORDER_STATES || {},
      DELIVERY_STATES: sales.DELIVERY_STATES || {},
      breadcrumbNav
    }
  }
}
</script>