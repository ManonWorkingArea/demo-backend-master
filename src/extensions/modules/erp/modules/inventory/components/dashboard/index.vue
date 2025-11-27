<template>
  <div>
    <ModuleDashboard
      title="Inventory Module"
      subtitle="ระบบจัดการเคลื่อนไหวของสินค้าและการตรวจนับ"
      module-name="inventory"
      :menu-items="inventoryMenuItems"
      footer-icon="boxes"
      footer-text="Inventory Module v.1.0"
      @menu-action="handleMenuAction"
    />

    <!-- Barcode Scanner Modal -->
    <BarcodeScannerModal
      v-if="showBarcodeScanner"
      @close="closeBarcodeScanner"
    />
  </div>
</template>

<script>
import { ModuleDashboard } from '@/extensions/modules/erp'
import BarcodeScannerModal from '../products/BarcodeScannerModal.vue'

export default {
  name: 'InventoryDashboard',
  
  components: {
    ModuleDashboard,
    BarcodeScannerModal
  },
  
  data() {
    return {
      inventoryMenuItems: [],
      showBarcodeScanner: false
    }
  },
  
  methods: {
    handleMenuAction(action) {
      if (action === 'openBarcodeScanner') {
        this.showBarcodeScanner = true
      }
    },
    
    closeBarcodeScanner() {
      this.showBarcodeScanner = false
    }
  },
  
  async mounted() {
    const moduleRegistry = window.ERP_CORE?.modules
    if (!moduleRegistry) return
    
    await moduleRegistry.autoRegisterModule('inventory')
    const config = await moduleRegistry.getModuleConfig('inventory', 'menuConfig') || 
                   await moduleRegistry.getByPath('inventory.config.menuConfig')
    
    if (config) {
      this.inventoryMenuItems = config.default || config.inventoryMenuItems || config
    }
  }
}
</script>

