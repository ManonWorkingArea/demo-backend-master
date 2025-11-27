<template>
  <div class="purchase-order-edit">
    <h2>Edit Purchase Order</h2>
    <!-- Purchase Order edit form -->
  </div>
</template>

<script>
export default {
  name: 'PurchaseOrderEdit',
  props: ['id'],
  data() {
    return {
      formData: {}
    }
  }
}
</script>