<template>
  <div class="purchase-order-detail">
    <h2>Purchase Order Detail</h2>
    <!-- Purchase Order detail view -->
  </div>
</template>

<script>
export default {
  name: 'PurchaseOrderDetail',
  props: ['id'],
  data() {
    return {
      purchaseOrder: null
    }
  }
}
</script>