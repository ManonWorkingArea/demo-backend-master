<template>
  <div class="pick-pack-packing">
    <h2>Packing Process</h2>
    <!-- Item packing interface -->
  </div>
</template>

<script>
/**
 * ✅ CORE COMPLIANT - Pick Pack Packing
 * ใช้ Dynamic Module Loading
 */
export default {
  name: 'PickPackPacking',
  setup() {
    const getDeliveryModule = () => {
      return window.ERP_CORE?.modules?.delivery || {}
    }

    const delivery = getDeliveryModule()
    
    return {
      PICK_PACK_STATES: delivery.PICK_PACK_STATES || {},
      PACKAGE_TYPES: delivery.PACKAGE_TYPES || {}
    }
  }
}
</script>