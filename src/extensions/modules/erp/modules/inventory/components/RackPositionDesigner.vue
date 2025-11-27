<template>
  <div class="rack-position-designer">
    <!-- Compact Header -->
    <div class="flex items-center justify-between mb-4">
      <div>
        <h3 class="text-base font-semibold text-gray-900">ออกแบบตำแหน่ง Rack</h3>
        <p class="text-xs text-gray-500">{{ config.rows }}×{{ config.columns }}<span v-if="config.layout === 'both'"> ×2</span> = {{ totalPositions }} ช่อง</p>
      </div>
      <button 
        @click="autoGenerateCodes"
        class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-xs font-medium transition-colors"
      >
        <i class="fas fa-magic mr-1"></i>สร้างรหัส
      </button>
    </div>

    <!-- Compact Configuration -->
    <div class="grid grid-cols-3 gap-3 mb-4">
      <div>
        <label class="block text-xs font-medium text-gray-700 mb-1">รูปแบบ</label>
        <select 
          v-model="config.layout"
          @change="regenerateRack"
          class="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="left">ซ้าย (L)</option>
          <option value="right">ขวา (R)</option>
          <option value="both">2 ฝั่ง (L+R)</option>
        </select>
      </div>

      <div>
        <label class="block text-xs font-medium text-gray-700 mb-1">แถว</label>
        <input 
          type="number" 
          v-model.number="config.rows"
          @change="regenerateRack"
          min="1"
          max="20"
          class="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
      </div>

      <div>
        <label class="block text-xs font-medium text-gray-700 mb-1">คอลัมน์</label>
        <input 
          type="number" 
          v-model.number="config.columns"
          @change="regenerateRack"
          min="1"
          max="20"
          class="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
      </div>
    </div>

    <!-- Compact Rack Grid -->
    <div class="bg-gray-50 border border-gray-200 rounded p-3 mb-3 overflow-x-auto max-h-[60vh] overflow-y-auto">
      <!-- Both Sides Layout -->
      <div v-if="config.layout === 'both'" class="flex gap-3 justify-center">
        <!-- Left Side -->
        <div class="flex-1 max-w-sm">
          <div class="text-center mb-2 text-xs font-medium text-blue-600">
            <i class="fas fa-arrow-left mr-1"></i>ซ้าย
          </div>
          <div class="rack-grid-compact" :style="gridStyleCompact">
            <div v-for="(position, index) in leftPositions" :key="`left-${index}`" class="rack-cell-compact">
              <div class="text-xs text-blue-600 font-medium mb-1">R{{ position.row }}C{{ position.col }}</div>
              <input 
                type="text" 
                v-model="position.code"
                :placeholder="`L${position.row}${String(position.col).padStart(2, '0')}`"
                class="w-full px-1 py-0.5 text-xs border border-gray-300 rounded text-center focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
            </div>
          </div>
        </div>

        <!-- Divider -->
        <div class="w-px bg-gray-300"></div>

        <!-- Right Side -->
        <div class="flex-1 max-w-sm">
          <div class="text-center mb-2 text-xs font-medium text-green-600">
            ขวา<i class="fas fa-arrow-right ml-1"></i>
          </div>
          <div class="rack-grid-compact" :style="gridStyleCompact">
            <div v-for="(position, index) in rightPositions" :key="`right-${index}`" class="rack-cell-compact">
              <div class="text-xs text-green-600 font-medium mb-1">R{{ position.row }}C{{ position.col }}</div>
              <input 
                type="text" 
                v-model="position.code"
                :placeholder="`R${position.row}${String(position.col).padStart(2, '0')}`"
                class="w-full px-1 py-0.5 text-xs border border-gray-300 rounded text-center focus:ring-1 focus:ring-green-500 focus:border-green-500"
              >
            </div>
          </div>
        </div>
      </div>

      <!-- Single Side Layout -->
      <div v-else class="max-w-xl mx-auto">
        <div class="text-center mb-2 text-xs font-medium" :class="config.layout === 'left' ? 'text-blue-600' : 'text-green-600'">
          <i class="fas mr-1" :class="config.layout === 'left' ? 'fa-arrow-left' : 'fa-arrow-right'"></i>
          {{ config.layout === 'left' ? 'ซ้าย' : 'ขวา' }}
        </div>
        
        <div class="rack-grid-compact" :style="gridStyleCompact">
          <div v-for="(position, index) in positions" :key="index" class="rack-cell-compact">
            <div class="text-xs font-medium mb-1" :class="config.layout === 'left' ? 'text-blue-600' : 'text-green-600'">
              R{{ position.row }}C{{ position.col }}
            </div>
            <input 
              type="text" 
              v-model="position.code"
              :placeholder="`${config.layout === 'left' ? 'L' : 'R'}${position.row}${String(position.col).padStart(2, '0')}`"
              class="w-full px-1 py-0.5 text-xs border border-gray-300 rounded text-center focus:ring-1 focus:border-blue-500"
              :class="config.layout === 'left' ? 'focus:ring-blue-500' : 'focus:ring-green-500'"
            >
          </div>
        </div>
      </div>
    </div>

    <!-- Compact Actions -->
    <div class="flex justify-between items-center">
      <button 
        @click="clearAllCodes"
        class="text-gray-600 hover:text-gray-800 text-xs font-medium transition-colors"
      >
        <i class="fas fa-eraser mr-1"></i>ล้างทั้งหมด
      </button>
      <div class="flex space-x-2">
        <button 
          @click="$emit('close')"
          class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded text-sm font-medium transition-colors"
        >
          ยกเลิก
        </button>
        <button 
          @click="saveRackDesign"
          class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
        >
          <i class="fas fa-check mr-1"></i>บันทึก
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'RackPositionDesigner',
  props: {
    initialDesign: {
      type: Object,
      default: () => null
    }
  },
  emits: ['save', 'close'],
  setup(props, { emit }) {
    const config = ref({
      layout: 'left', // 'left', 'right', or 'both'
      rows: 4,
      columns: 3
    })

    const positions = ref([])
    const leftPositions = ref([])
    const rightPositions = ref([])

    const totalPositions = computed(() => {
      if (config.value.layout === 'both') {
        return config.value.rows * config.value.columns * 2
      }
      return config.value.rows * config.value.columns
    })

    const gridStyle = computed(() => ({
      display: 'grid',
      gridTemplateColumns: `repeat(${config.value.columns}, minmax(120px, 1fr))`,
      gap: '12px'
    }))

    const gridStyleCompact = computed(() => ({
      display: 'grid',
      gridTemplateColumns: `repeat(${config.value.columns}, minmax(70px, 1fr))`,
      gap: '6px'
    }))

    const getLayoutText = (layout) => {
      const texts = {
        left: 'ซ้ายเท่านั้น',
        right: 'ขวาเท่านั้น',
        both: 'ทั้งสองฝั่ง'
      }
      return texts[layout] || layout
    }

    const generatePositions = () => {
      const newPositions = []
      const newLeftPositions = []
      const newRightPositions = []

      for (let row = 1; row <= config.value.rows; row++) {
        for (let col = 1; col <= config.value.columns; col++) {
          if (config.value.layout === 'both') {
            // สร้างทั้ง 2 ฝั่ง
            newLeftPositions.push({
              row,
              col,
              code: '',
              side: 'left'
            })
            newRightPositions.push({
              row,
              col,
              code: '',
              side: 'right'
            })
          } else {
            // สร้างฝั่งเดียว
            newPositions.push({
              row,
              col,
              code: '',
              side: config.value.layout
            })
          }
        }
      }

      positions.value = newPositions
      leftPositions.value = newLeftPositions
      rightPositions.value = newRightPositions
    }

    const regenerateRack = () => {
      // ถ้ามีข้อมูลเก่า ให้พยายามเก็บไว้
      const oldPositions = [...positions.value]
      const oldLeftPositions = [...leftPositions.value]
      const oldRightPositions = [...rightPositions.value]
      
      generatePositions()
      
      // คืนค่า code เก่าถ้าตำแหน่งยังมีอยู่
      if (config.value.layout === 'both') {
        leftPositions.value.forEach(pos => {
          const oldPos = oldLeftPositions.find(
            old => old.row === pos.row && old.col === pos.col && old.side === 'left'
          )
          if (oldPos && oldPos.code) {
            pos.code = oldPos.code
          }
        })
        rightPositions.value.forEach(pos => {
          const oldPos = oldRightPositions.find(
            old => old.row === pos.row && old.col === pos.col && old.side === 'right'
          )
          if (oldPos && oldPos.code) {
            pos.code = oldPos.code
          }
        })
      } else {
        positions.value.forEach(pos => {
          const oldPos = oldPositions.find(
            old => old.row === pos.row && old.col === pos.col
          )
          if (oldPos && oldPos.code) {
            pos.code = oldPos.code
          }
        })
      }
    }

    const autoGenerateCodes = () => {
      if (config.value.layout === 'both') {
        // สร้างรหัสสำหรับซ้าย
        leftPositions.value.forEach(pos => {
          pos.code = `L${pos.row}${String(pos.col).padStart(2, '0')}`
        })
        // สร้างรหัสสำหรับขวา
        rightPositions.value.forEach(pos => {
          pos.code = `R${pos.row}${String(pos.col).padStart(2, '0')}`
        })
      } else {
        const sidePrefix = config.value.layout === 'left' ? 'L' : 'R'
        positions.value.forEach(pos => {
          pos.code = `${sidePrefix}${pos.row}${String(pos.col).padStart(2, '0')}`
        })
      }
    }

    const clearAllCodes = () => {
      if (config.value.layout === 'both') {
        leftPositions.value.forEach(pos => { pos.code = '' })
        rightPositions.value.forEach(pos => { pos.code = '' })
      } else {
        positions.value.forEach(pos => { pos.code = '' })
      }
    }

    const getPositionLabel = (position) => {
      const sideLabel = position.side === 'left' ? 'ซ้าย' : 'ขวา'
      return `${sideLabel} แถว${position.row} คอลัมน์${position.col}`
    }

    const saveRackDesign = () => {
      // รวม positions จากทั้ง 2 ฝั่งถ้าเป็น both
      let allPositions = []
      if (config.value.layout === 'both') {
        allPositions = [...leftPositions.value, ...rightPositions.value]
      } else {
        allPositions = [...positions.value]
      }

      // ตรวจสอบว่ามีการกรอกรหัสครบทุกช่องหรือไม่
      const hasEmptyCodes = allPositions.some(pos => !pos.code || pos.code.trim() === '')
      
      if (hasEmptyCodes) {
        if (!confirm('มีบางช่องที่ยังไม่ได้กรอกรหัส\nต้องการบันทึกต่อหรือไม่?')) {
          return
        }
      }

      const rackDesign = {
        config: { ...config.value },
        positions: allPositions.map(pos => ({
          row: pos.row,
          col: pos.col,
          code: pos.code,
          side: pos.side
        })),
        totalPositions: totalPositions.value,
        createdAt: new Date().toISOString()
      }

      emit('save', rackDesign)
    }

    // Initialize
    if (props.initialDesign) {
      config.value = { ...props.initialDesign.config }
      
      if (config.value.layout === 'both') {
        leftPositions.value = props.initialDesign.positions
          .filter(pos => pos.side === 'left')
          .map(pos => ({ ...pos }))
        rightPositions.value = props.initialDesign.positions
          .filter(pos => pos.side === 'right')
          .map(pos => ({ ...pos }))
      } else {
        positions.value = props.initialDesign.positions.map(pos => ({ ...pos }))
      }
    } else {
      generatePositions()
    }

    return {
      config,
      positions,
      leftPositions,
      rightPositions,
      totalPositions,
      gridStyle,
      gridStyleCompact,
      getLayoutText,
      regenerateRack,
      autoGenerateCodes,
      clearAllCodes,
      getPositionLabel,
      saveRackDesign
    }
  }
}
</script>

<style scoped>
.rack-grid-compact {
  margin: 0 auto;
}

.rack-cell-compact {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  padding: 6px;
  transition: all 0.15s;
}

.rack-cell-compact:hover {
  border-color: #3b82f6;
  box-shadow: 0 1px 3px rgba(59, 130, 246, 0.1);
  transform: translateY(-1px);
}

/* Responsive */
@media (max-width: 768px) {
  .rack-grid-compact {
    grid-template-columns: repeat(auto-fit, minmax(60px, 1fr)) !important;
  }
}
</style>
