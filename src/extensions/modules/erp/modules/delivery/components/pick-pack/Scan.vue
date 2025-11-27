<template>
  <div class="pick-pack-scan">
    <h2>Scan Items</h2>
    <!-- Barcode scanning interface -->
  </div>
</template>

<script>
/**
 * ✅ CORE COMPLIANT - Pick Pack Scan
 * ใช้ Dynamic Module Loading
 */
export default {
  name: 'PickPackScan',
  setup() {
    const getDeliveryModule = () => {
      return window.ERP_CORE?.modules?.delivery || {}
    }

    const getProductModule = () => {
      return window.ERP_CORE?.modules?.product || {}
    }

    const delivery = getDeliveryModule()
    const product = getProductModule()
    
    return {
      PICK_PACK_STATES: delivery.PICK_PACK_STATES || {},
      BARCODE_FORMATS: product.BARCODE_FORMATS || {}
    }
  }
}
</script>