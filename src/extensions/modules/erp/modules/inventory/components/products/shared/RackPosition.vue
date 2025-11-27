<template>
  <!-- Rack Position Card - Terminal Style -->
  <div class="bg-white border border-dashed border-gray-400 rounded-lg p-4 w-full font-mono flex flex-col h-full shadow-md hover:shadow-lg transition-shadow duration-300">
    <!-- Header -->
    <div class="text-center mb-3 border-b border-dashed border-black pb-2">
      <div class="text-sm font-bold text-black uppercase">RACK POSITION</div>
      <div class="text-xs text-gray-700">Location System</div>
    </div>
    
    <!-- 2 Column Layout: Rack (Left) + Stats (Right) -->
    <div class="grid grid-cols-2 gap-4 flex-1">
      
      <!-- Left Column: Rack Visualization -->
      <div class="border-r border-dashed border-black pr-3">
        <div class="border border-dashed border-black p-2">
          
          <!-- Rack Frame -->
          <div class="border border-black p-1">
            
            <!-- Top Shelf (A) -->
            <div class="flex items-center border-b border-dashed border-black py-1">
              <div class="w-3 text-xs font-bold text-black mr-1">A</div>
              <div class="flex-1 flex justify-between items-center">
                <div class="w-2 h-2 border border-black" 
                     :class="getRackPositionClass('A1')" title="Rack A1">
                </div>
                <div class="text-black text-xs">│</div>
                <div class="w-2 h-2 border border-black" 
                     :class="getRackPositionClass('A2')" title="Rack A2">
                </div>
                <div class="text-black text-xs">│</div>
                <div class="w-2 h-2 border border-black" 
                     :class="getRackPositionClass('A3')" title="Rack A3">
                </div>
              </div>
            </div>
            
            <!-- Middle Shelf (B) -->
            <div class="flex items-center border-b border-dashed border-black py-1">
              <div class="w-3 text-xs font-bold text-black mr-1">B</div>
              <div class="flex-1 flex justify-between items-center">
                <div class="w-2 h-2 border border-black" 
                     :class="getRackPositionClass('B1')" title="Rack B1">
                </div>
                <div class="text-black text-xs">│</div>
                <div class="w-2 h-2 border border-black" 
                     :class="getRackPositionClass('B2')" title="Rack B2">
                </div>
                <div class="text-black text-xs">│</div>
                <div class="w-2 h-2 border border-black" 
                     :class="getRackPositionClass('B3')" title="Rack B3">
                </div>
              </div>
            </div>
            
            <!-- Bottom Shelf (C) -->
            <div class="flex items-center py-1">
              <div class="w-3 text-xs font-bold text-black mr-1">C</div>
              <div class="flex-1 flex justify-between items-center">
                <div class="w-2 h-2 border border-black" 
                     :class="getRackPositionClass('C1')" title="Rack C1">
                </div>
                <div class="text-black text-xs">│</div>
                <div class="w-2 h-2 border border-black" 
                     :class="getRackPositionClass('C2')" title="Rack C2">
                </div>
                <div class="text-black text-xs">│</div>
                <div class="w-2 h-2 border border-black" 
                     :class="getRackPositionClass('C3')" title="Rack C3">
                </div>
              </div>
            </div>
          </div>
          
          <!-- Current Rack Indicator -->
          <div class="text-center mt-2 border-t border-dashed border-black pt-1">
            <div class="text-xs text-black font-bold">{{ getCurrentRackId() }}</div>
            <div class="text-xs text-gray-700">MAIN RACK ID</div>
          </div>
        </div>
      </div>
      
      <!-- Right Column: Stats -->
      <div class="pl-1 space-y-2">
        <div class="border border-dashed border-black p-2">
          <div class="text-xs text-center text-black font-bold mb-1">{{ getCurrentRackPosition() }}</div>
          <div class="text-xs text-center text-gray-700">{{ getCurrentShelfLevel() }} SHELF</div>
        </div>
        
        <div class="text-xs space-y-1">
          <div class="flex justify-between">
            <span>SHELF:</span>
            <span class="font-bold">{{ getCurrentShelf() }}</span>
          </div>
          <div class="flex justify-between">
            <span>SLOT:</span>
            <span class="font-bold">{{ getCurrentSlot() }}</span>
          </div>
          <div class="flex justify-between">
            <span>LEVEL:</span>
            <span class="font-bold">{{ getCurrentShelfLevel() }}</span>
          </div>
        </div>
        
        <div class="border-t border-dashed border-black pt-2 text-xs">
          <div class="flex justify-between">
            <span>STATUS:</span>
            <span class="font-bold">● ACTIVE</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RackPosition',
  props: {
    product: {
      type: Object,
      default: () => ({})
    }
  },
  setup(props) {
    // Virtual Rack Position Functions
    const getMockRackPosition = () => {
      // Generate mock position based on product SKU for consistency
      if (!props.product?.sku && !props.product?.product_code) return 'B2'
      
      const sku = props.product.sku || props.product.product_code || ''
      const positions = ['A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'C1', 'C2', 'C3']
      const hash = sku.split('').reduce((a, b) => a + b.charCodeAt(0), 0)
      return positions[hash % positions.length]
    }
    
    const getMockShelfLevel = () => {
      const position = getMockRackPosition()
      const shelfMap = {
        'A1': 'TOP', 'A2': 'TOP', 'A3': 'TOP',
        'B1': 'MID', 'B2': 'MID', 'B3': 'MID', 
        'C1': 'BOT', 'C2': 'BOT', 'C3': 'BOT'
      }
      return shelfMap[position] || 'MID'
    }
    
    const getRackPositionClass = (position) => {
      const currentPosition = getMockRackPosition()
      
      if (position === currentPosition) {
        return 'bg-black border-black' // Current position - Black (terminal friendly)
      } else {
        return 'bg-white border-gray-400' // Other positions - White
      }
    }
    
    const getMockMainRackCode = () => {
      // Generate main rack code based on product for consistency
      if (!props.product?.sku && !props.product?.product_code) return 'RCK005'
      
      const sku = props.product.sku || props.product.product_code || ''
      const rackCodes = ['RCK001', 'RCK002', 'RCK003', 'RCK004', 'RCK005', 'RCK006', 'RCK007', 'RCK008', 'RCK009']
      const hash = sku.split('').reduce((a, b) => a + b.charCodeAt(0), 0)
      return rackCodes[hash % rackCodes.length]
    }
    
    // Additional Rack Position Functions
    const getCurrentRackId = () => {
      return getMockMainRackCode()
    }
    
    const getCurrentRackPosition = () => {
      return getMockRackPosition()
    }
    
    const getCurrentShelf = () => {
      const position = getMockRackPosition()
      return position.charAt(0) // A, B, or C
    }
    
    const getCurrentSlot = () => {
      const position = getMockRackPosition()
      return position.charAt(1) // 1, 2, or 3
    }
    
    const getCurrentShelfLevel = () => {
      return getMockShelfLevel()
    }
    
    return {
      getMockRackPosition,
      getMockShelfLevel,
      getRackPositionClass,
      getMockMainRackCode,
      getCurrentRackId,
      getCurrentRackPosition,
      getCurrentShelf,
      getCurrentSlot,
      getCurrentShelfLevel
    }
  }
}
</script>

<style scoped>
/* Rack Position Card Styles - Match StockCard */
.bg-white.border.border-dashed {
  position: relative;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  animation: fadeInUp 0.6s ease-out;
}

.bg-white.border.border-dashed:hover {
  box-shadow: 0 4px 12px -2px rgba(0, 0, 0, 0.12), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transform: translateY(-1px);
  border-color: #6b7280 !important;
}

/* Terminal-friendly styling for rack positions */
.transition-colors {
  transition-property: background-color, border-color, color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>