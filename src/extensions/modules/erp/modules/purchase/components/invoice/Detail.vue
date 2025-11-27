<template>
  <div class="invoice-detail">
    <h2>Purchase Invoice Detail</h2>
    <!-- Invoice detail view -->
  </div>
</template>

<script>
export default {
  name: 'InvoiceDetail',
  props: ['id'],
  data() {
    return {
      invoice: null
    }
  }
}
</script>