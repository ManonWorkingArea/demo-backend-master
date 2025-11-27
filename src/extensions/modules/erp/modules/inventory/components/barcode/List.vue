<template>
  <div class="barcode-list">
    <h2>Barcode Management</h2>
    <!-- Barcode list and scanner -->
  </div>
</template>

<script>
/**
 * ✅ CORE COMPLIANT - Barcode List
 * ใช้ Dynamic Module Loading
 */
export default {
  name: 'BarcodeList',
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