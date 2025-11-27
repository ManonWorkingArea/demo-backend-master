<template>
  <div class="goods-receipt-detail">
    <h2>Goods Receipt Detail</h2>
    <!-- Goods Receipt detail view -->
  </div>
</template>

<script>
export default {
  name: 'GoodsReceiptDetail',
  props: ['id'],
  data() {
    return {
      receipt: null
    }
  }
}
</script>