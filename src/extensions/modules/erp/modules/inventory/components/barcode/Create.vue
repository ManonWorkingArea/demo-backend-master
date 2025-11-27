<template>
  <div class="barcode-create">
    <h2>Generate Barcode</h2>
    <!-- Barcode generation form -->
  </div>
</template>

<script>
/**
 * ✅ CORE COMPLIANT - Barcode Create
 * ใช้ Dynamic Module Loading
 */
export default {
  name: 'BarcodeCreate',
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