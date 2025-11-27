<template>
  <div class="barcode-detail">
    <h2>Barcode Detail</h2>
    <!-- Barcode detail and scanner -->
  </div>
</template>

<script>
/**
 * ✅ CORE COMPLIANT - Barcode Detail
 * ใช้ Dynamic Module Loading
 */
export default {
  name: 'BarcodeDetail',
  setup() {
    const getProductModule = () => {
      return window.ERP_CORE?.modules?.product || {}
    }

    const product = getProductModule()
    
    return {
      BARCODE_FORMATS: product.BARCODE_FORMATS || {}
    }
  }
}
</script>