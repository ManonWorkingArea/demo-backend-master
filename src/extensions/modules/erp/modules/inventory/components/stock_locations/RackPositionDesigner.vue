<template>
  <div class="rack-position-designer">
    <!-- Header -->
    <div class="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-lg">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-xl font-bold">Rack Position Designer</h3>
          <p class="text-indigo-100 text-sm mt-1">ออกแบบตำแหน่งชั้นวางสินค้า (Rack)</p>
        </div>
        <button 
          @click="$emit('close')"
          class="bg-white/20 hover:bg-white/30 rounded-lg p-2 transition-colors"
        >
          <i class="fas fa-times text-xl"></i>
        </button>
      </div>
    </div>

    <!-- Configuration Panel -->
    <div class="bg-white border-b border-gray-200 p-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <!-- Rack Side -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            <i class="fas fa-arrows-alt-h mr-1 text-purple-600"></i>
            ด้านของ Rack
          </label>
          <select 
            v-model="rackConfig.side"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="left">ซ้าย (Left)</option>
            <option value="right">ขวา (Right)</option>
          </select>
        </div>

        <!-- Number of Rows -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            <i class="fas fa-grip-lines mr-1 text-blue-600"></i>
            จำนวนแถว (Rows)
          </label>
          <input 
            type="number" 
            v-model.number="rackConfig.rows"
            @change="generateRackPositions"
            min="1"
            max="20"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
        </div>

        <!-- Number of Columns -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            <i class="fas fa-grip-vertical mr-1 text-green-600"></i>
            จำนวนคอลัมน์ (Columns)
          </label>
          <input 
            type="number" 
            v-model.number="rackConfig.columns"
            @change="generateRackPositions"
            min="1"
            max="20"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
        </div>

        <!-- Auto Naming -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            <i class="fas fa-magic mr-1 text-yellow-600"></i>
            รูปแบบตั้งชื่ออัตโนมัติ
          </label>
          <div class="flex space-x-2">
            <select 
              v-model="namingPattern"
              class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
            >
              <option value="row-col">R1-C1</option>
              <option value="letter-number">A1</option>
              <option value="number-number">1-1</option>
            </select>
            <button 
              @click="autoGenerateNames"
              class="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition-colors"
              title="สร้างชื่ออัตโนมัติ"
            >
              <i class="fas fa-bolt"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="mt-4 flex items-center space-x-6 text-sm">
        <div class="flex items-center">
          <span class="text-gray-600">Total Positions:</span>
          <span class="ml-2 font-bold text-purple-600">{{ rackConfig.rows * rackConfig.columns }}</span>
        </div>
        <div class="flex items-center">
          <span class="text-gray-600">Named:</span>
          <span class="ml-2 font-bold text-green-600">{{ namedPositionsCount }}</span>
        </div>
        <div class="flex items-center">
          <span class="text-gray-600">Empty:</span>
          <span class="ml-2 font-bold text-orange-600">{{ emptyPositionsCount }}</span>
        </div>
      </div>
    </div>

    <!-- Rack Grid -->
    <div class="bg-gray-50 p-6 overflow-auto" style="max-height: 600px;">
      <div class="inline-block min-w-full">
        <!-- Side Indicator -->
        <div class="text-center mb-4">
          <span :class="[
            'inline-flex items-center px-4 py-2 rounded-full font-medium text-sm',
            rackConfig.side === 'left' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
          ]">
            <i :class="[
              'fas mr-2',
              rackConfig.side === 'left' ? 'fa-arrow-left' : 'fa-arrow-right'
            ]"></i>
            {{ rackConfig.side === 'left' ? 'Rack ด้านซ้าย' : 'Rack ด้านขวา' }}
          </span>
        </div>

        <!-- Grid Table -->
        <table class="border-collapse bg-white shadow-lg rounded-lg overflow-hidden">
          <thead>
            <tr class="bg-gradient-to-r from-gray-700 to-gray-800 text-white">
              <th class="px-4 py-3 text-center font-semibold border border-gray-600">
                <i class="fas fa-hashtag mr-1"></i>Row/Col
              </th>
              <th 
                v-for="col in rackConfig.columns" 
                :key="'col-' + col"
                class="px-4 py-3 text-center font-semibold border border-gray-600"
              >
                Col {{ col }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="row in rackConfig.rows" 
              :key="'row-' + row"
              class="hover:bg-blue-50 transition-colors"
            >
              <!-- Row Header -->
              <td class="px-4 py-3 text-center font-semibold bg-gray-100 border border-gray-300">
                Row {{ row }}
              </td>
              
              <!-- Position Cells -->
              <td 
                v-for="col in rackConfig.columns" 
                :key="'cell-' + row + '-' + col"
                class="border border-gray-300 p-2"
              >
                <div class="relative group">
                  <input 
                    type="text" 
                    v-model="positions[`${row}-${col}`]"
                    :placeholder="`R${row}C${col}`"
                    class="w-full px-3 py-2 text-center border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                    :class="getPositionClass(row, col)"
                  >
                  
                  <!-- Quick Action Buttons (show on hover) -->
                  <div class="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      @click="clearPosition(row, col)"
                      v-if="positions[`${row}-${col}`]"
                      class="bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-lg"
                      title="Clear"
                    >
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="bg-gray-100 px-6 py-4 flex justify-between items-center rounded-b-lg">
      <div class="flex space-x-2">
        <button 
          @click="clearAllPositions"
          class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors inline-flex items-center"
        >
          <i class="fas fa-eraser mr-2"></i>
          ล้างทั้งหมด
        </button>
        <button 
          @click="exportPositions"
          class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors inline-flex items-center"
        >
          <i class="fas fa-download mr-2"></i>
          Export
        </button>
      </div>
      
      <div class="flex space-x-2">
        <button 
          @click="$emit('close')"
          class="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-lg transition-colors font-medium"
        >
          ยกเลิก
        </button>
        <button 
          @click="saveRackDesign"
          class="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-2 rounded-lg transition-colors font-medium inline-flex items-center"
        >
          <i class="fas fa-save mr-2"></i>
          บันทึก Rack Design
        </button>
      </div>
    </div>

    <!-- Position Summary Panel -->
    <div v-if="showSummary" class="bg-white border-t border-gray-200 p-4">
      <div class="flex items-center justify-between mb-3">
        <h4 class="font-semibold text-gray-900">
          <i class="fas fa-list-ul mr-2 text-indigo-600"></i>
          Position Summary
        </h4>
        <button 
          @click="showSummary = false"
          class="text-gray-400 hover:text-gray-600"
        >
          <i class="fas fa-chevron-down"></i>
        </button>
      </div>
      <div class="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 max-h-40 overflow-auto">
        <div 
          v-for="(code, key) in positions" 
          :key="key"
          v-show="code"
          class="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded px-2 py-1 text-xs text-center"
        >
          <div class="font-mono font-semibold text-purple-700">{{ code }}</div>
          <div class="text-gray-500 text-xs">{{ key }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue'

export default {
  name: 'RackPositionDesigner',
  props: {
    locationCode: {
      type: String,
      required: true
    },
    existingRackData: {
      type: Object,
      default: () => null
    }
  },
  emits: ['save', 'close'],
  setup(props, { emit }) {
    // Rack Configuration
    const rackConfig = ref({
      side: 'left',
      rows: 5,
      columns: 4
    })

    // Position codes storage (key: "row-col", value: "position code")
    const positions = ref({})
    const namingPattern = ref('row-col')
    const showSummary = ref(true)

    // Computed
    const namedPositionsCount = computed(() => {
      return Object.values(positions.value).filter(code => code && code.trim() !== '').length
    })

    const emptyPositionsCount = computed(() => {
      const total = rackConfig.value.rows * rackConfig.value.columns
      return total - namedPositionsCount.value
    })

    // Methods
    const generateRackPositions = () => {
      // Keep existing positions that are still valid
      const newPositions = {}
      for (let row = 1; row <= rackConfig.value.rows; row++) {
        for (let col = 1; col <= rackConfig.value.columns; col++) {
          const key = `${row}-${col}`
          newPositions[key] = positions.value[key] || ''
        }
      }
      positions.value = newPositions
    }

    const autoGenerateNames = () => {
      const newPositions = {}
      
      for (let row = 1; row <= rackConfig.value.rows; row++) {
        for (let col = 1; col <= rackConfig.value.columns; col++) {
          const key = `${row}-${col}`
          
          switch (namingPattern.value) {
            case 'row-col':
              newPositions[key] = `R${row}-C${col}`
              break
            case 'letter-number': {
              // A-Z for columns, numbers for rows
              const letter = String.fromCharCode(64 + col) // A=65
              newPositions[key] = `${letter}${row}`
              break
            }
            case 'number-number':
              newPositions[key] = `${row}-${col}`
              break
            default:
              newPositions[key] = `R${row}C${col}`
          }
        }
      }
      
      positions.value = newPositions
    }

    const getPositionClass = (row, col) => {
      const key = `${row}-${col}`
      const hasValue = positions.value[key] && positions.value[key].trim() !== ''
      
      return hasValue 
        ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300 font-medium text-green-800' 
        : 'bg-white hover:bg-gray-50'
    }

    const clearPosition = (row, col) => {
      const key = `${row}-${col}`
      positions.value[key] = ''
    }

    const clearAllPositions = () => {
      if (confirm('ต้องการล้างรหัสตำแหน่งทั้งหมดหรือไม่?')) {
        generateRackPositions() // Reset to empty
      }
    }

    const exportPositions = () => {
      const rackData = {
        config: rackConfig.value,
        positions: positions.value,
        locationCode: props.locationCode,
        exportedAt: new Date().toISOString()
      }
      
      const blob = new Blob([JSON.stringify(rackData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `rack-design-${props.locationCode}-${Date.now()}.json`
      a.click()
      URL.revokeObjectURL(url)
    }

    const saveRackDesign = () => {
      // Validate
      const totalPositions = rackConfig.value.rows * rackConfig.value.columns
      if (namedPositionsCount.value === 0) {
        alert('กรุณากำหนดรหัสตำแหน่งอย่างน้อย 1 ตำแหน่ง')
        return
      }

      // Prepare data
      const rackDesignData = {
        side: rackConfig.value.side,
        rows: rackConfig.value.rows,
        columns: rackConfig.value.columns,
        positions: positions.value,
        totalPositions,
        namedPositions: namedPositionsCount.value,
        createdAt: new Date().toISOString()
      }

      // Emit save event
      emit('save', rackDesignData)
    }

    // Initialize
    onMounted(() => {
      if (props.existingRackData) {
        // Load existing rack data
        rackConfig.value = {
          side: props.existingRackData.side || 'left',
          rows: props.existingRackData.rows || 5,
          columns: props.existingRackData.columns || 4
        }
        positions.value = props.existingRackData.positions || {}
      } else {
        // Generate initial positions
        generateRackPositions()
      }
    })

    // Watch for config changes
    watch([() => rackConfig.value.rows, () => rackConfig.value.columns], () => {
      generateRackPositions()
    })

    return {
      rackConfig,
      positions,
      namingPattern,
      showSummary,
      namedPositionsCount,
      emptyPositionsCount,
      generateRackPositions,
      autoGenerateNames,
      getPositionClass,
      clearPosition,
      clearAllPositions,
      exportPositions,
      saveRackDesign
    }
  }
}
</script>

<style scoped>
.rack-position-designer {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

/* Smooth transitions for inputs */
input[type="text"] {
  transition: all 0.2s ease;
}

input[type="text"]:focus {
  transform: scale(1.05);
}

/* Custom scrollbar */
.overflow-auto::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.overflow-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.overflow-auto::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.overflow-auto::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Animation for position cells */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

tbody tr {
  animation: slideIn 0.3s ease;
}
</style>
