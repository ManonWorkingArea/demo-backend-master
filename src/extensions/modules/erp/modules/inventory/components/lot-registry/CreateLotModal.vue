<!-- Create Lot Modal Component -->
<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-screen overflow-y-auto">
      <div class="px-6 py-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900 flex items-center">
            <i class="fas fa-plus-circle mr-2 text-green-600"></i>
            สร้าง Lot Registry ใหม่
          </h3>
          <button
            @click="$emit('close')"
            class="text-gray-400 hover:text-gray-600"
          >
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>
      </div>

      <form @submit.prevent="createLot" class="p-6">
        <!-- Product Selection -->
        <div class="mb-6">
          <h4 class="text-md font-medium text-gray-900 mb-4">เลือกสินค้า</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">สินค้า</label>
              <select
                v-model="formData.product_id"
                @change="onProductChange"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              >
                <option value="">เลือกสินค้า...</option>
                <option v-for="product in textileProducts" :key="product.id" :value="product.id">
                  {{ product.product_name }} ({{ product.sku }})
                </option>
              </select>
            </div>

            <div v-if="selectedProduct">
              <label class="block text-sm font-medium text-gray-700 mb-2">ข้อมูลสินค้า</label>
              <div class="bg-gray-50 p-3 rounded-lg">
                <p class="text-sm"><strong>ประเภท:</strong> {{ formatFabricType(selectedProduct.fabric_type) }}</p>
                <p class="text-sm"><strong>น้ำหนัก/เมตร:</strong> {{ selectedProduct.weight_per_meter }} kg/m</p>
                <p class="text-sm"><strong>ความกว้าง:</strong> {{ selectedProduct.fabric_width_cm }} cm</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Lot Identification -->
        <div class="mb-6">
          <h4 class="text-md font-medium text-gray-900 mb-4">รหัส Lot</h4>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                รหัสรุ่น <span class="text-red-500">*</span>
              </label>
              <input
                type="text"
                v-model="formData.model_code"
                @input="generateLotId"
                placeholder="402"
                maxlength="3"
                pattern="[0-9]{3}"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                รหัสสี <span class="text-red-500">*</span>
              </label>
              <input
                type="text"
                v-model="formData.color_code"
                @input="generateLotId"
                placeholder="177"
                maxlength="3"
                pattern="[0-9]{3}"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                ความกว้าง (cm) <span class="text-red-500">*</span>
              </label>
              <input
                type="number"
                v-model.number="formData.width_cm"
                @input="generateLotId"
                placeholder="152"
                min="50"
                max="500"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">ลำดับ Lot</label>
              <input
                type="text"
                v-model="formData.lot_sequence"
                placeholder="08883"
                maxlength="5"
                pattern="[0-9]{5}"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-gray-50"
                readonly
              />
            </div>
          </div>

          <!-- Generated Lot ID Preview -->
          <div v-if="previewLotId" class="mt-4">
            <div class="bg-green-50 border border-green-200 rounded-lg p-4">
              <h5 class="text-sm font-medium text-green-800 mb-2">Lot ID ที่จะสร้าง:</h5>
              <div class="text-xl font-mono text-green-900 bg-green-100 px-3 py-2 rounded border">
                {{ previewLotId }}
              </div>
            </div>
          </div>
        </div>

        <!-- Physical Properties -->
        <div class="mb-6">
          <h4 class="text-md font-medium text-gray-900 mb-4">ข้อมูลทางกายภาพ</h4>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                น้ำหนักเดิม (kg) <span class="text-red-500">*</span>
              </label>
              <input
                type="number"
                v-model.number="formData.original_weight_kg"
                @input="calculateMeters"
                placeholder="25.500"
                min="0.001"
                step="0.001"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                น้ำหนักต่อเมตร (kg/m) <span class="text-red-500">*</span>
              </label>
              <input
                type="number"
                v-model.number="formData.weight_per_meter"
                @input="calculateMeters"
                placeholder="0.300"
                min="0.001"
                step="0.001"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">เมตรที่คำนวณได้</label>
              <input
                type="number"
                v-model.number="formData.calculated_meters"
                placeholder="85.000"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                readonly
              />
            </div>
          </div>
        </div>

        <!-- Fabric Details -->
        <div class="mb-6">
          <h4 class="text-md font-medium text-gray-900 mb-4">รายละเอียดผ้า</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">ประเภทผ้า</label>
              <select
                v-model="formData.fabric_type"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">เลือกประเภทผ้า...</option>
                <option value="cotton">ผ้าฝ้าย</option>
                <option value="polyester">ผ้าโพลีเอสเตอร์</option>
                <option value="silk">ผ้าไหม</option>
                <option value="wool">ผ้าขนสัตว์</option>
                <option value="linen">ผ้าลินิน</option>
                <option value="blend">ผ้าผสม</option>
                <option value="synthetic">ผ้าสังเคราะห์</option>
                <option value="natural">ผ้าธรรมชาติ</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">เกรดคุณภาพ</label>
              <select
                v-model="formData.quality_grade"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">เลือกเกรดคุณภาพ...</option>
                <option value="premium">พรีเมียม</option>
                <option value="grade_a">เกรด A</option>
                <option value="grade_b">เกรด B</option>
                <option value="grade_c">เกรด C</option>
                <option value="standard">มาตรฐาน</option>
                <option value="economy">ประหยัด</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">องค์ประกอบผ้า</label>
              <input
                type="text"
                v-model="formData.fabric_composition"
                placeholder="Cotton 60%, Polyester 40%"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">GSM</label>
              <input
                type="number"
                v-model.number="formData.gsm"
                placeholder="180"
                min="50"
                max="1000"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>
        </div>

        <!-- Supplier & Location -->
        <div class="mb-6">
          <h4 class="text-md font-medium text-gray-900 mb-4">ข้อมูลผู้จำหน่ายและตำแหน่ง</h4>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">ผู้จำหน่าย</label>
              <select
                v-model="formData.supplier_id"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">เลือกผู้จำหน่าย...</option>
                <option v-for="supplier in suppliers" :key="supplier.id" :value="supplier.id">
                  {{ supplier.name }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">ตำแหน่งจัดเก็บ</label>
              <input
                type="text"
                v-model="formData.current_location"
                placeholder="WH01-A-001"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">คลังสินค้า</label>
              <input
                type="text"
                v-model="formData.warehouse"
                placeholder="WH01"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>
        </div>

        <!-- Notes -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">หมายเหตุ</label>
          <textarea
            v-model="formData.notes"
            rows="3"
            placeholder="ระบุหมายเหตุเพิ่มเติม..."
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          ></textarea>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-end space-x-4">
          <button
            type="button"
            @click="$emit('close')"
            class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            :disabled="creating || !canCreate"
            class="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white rounded-lg font-medium transition-colors flex items-center"
          >
            <i v-if="creating" class="fas fa-spinner fa-spin mr-2"></i>
            <i v-else class="fas fa-plus mr-2"></i>
            {{ creating ? 'กำลังสร้าง...' : 'สร้าง Lot' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { LotRegistryService } from '../../../services/LotRegistryService.js'

export default {
  name: 'CreateLotModal',
  emits: ['close', 'created'],
  setup(props, { emit }) {
    // State
    const creating = ref(false)
    const textileProducts = ref([])
    const suppliers = ref([])
    const selectedProduct = ref(null)
    
    const formData = reactive({
      // Product info
      product_id: '',
      product_code: '',
      sku: '',
      product_name: '',
      
      // Lot identification  
      model_code: '',
      color_code: '',
      width_cm: null,
      lot_sequence: '',
      
      // Physical properties
      original_weight_kg: null,
      weight_per_meter: null,
      calculated_meters: null,
      current_weight_kg: null,
      current_meters: null,
      
      // Fabric details
      fabric_type: '',
      quality_grade: '',
      fabric_composition: '',
      gsm: null,
      thread_count: '',
      
      // Supplier & location
      supplier_id: '',
      supplier_name: '',
      current_location: '',
      warehouse: '',
      
      // Additional info
      notes: ''
    })

    // Service
    const lotService = new LotRegistryService()

    // Computed
    const previewLotId = computed(() => {
      if (!formData.model_code || !formData.color_code || !formData.width_cm) {
        return ''
      }
      
      const model = formData.model_code.padStart(3, '0')
      const color = formData.color_code.padStart(3, '0')
      const width = String(formData.width_cm).padStart(3, '0')
      const sequence = formData.lot_sequence || 'XXXXX'
      
      return `${model}-${color}-${width}-${sequence}`
    })

    const canCreate = computed(() => {
      return formData.product_id &&
             formData.model_code &&
             formData.color_code &&
             formData.width_cm &&
             formData.original_weight_kg &&
             formData.weight_per_meter &&
             formData.calculated_meters
    })

    // Watch for product selection
    watch(() => formData.product_id, (newProductId) => {
      if (newProductId) {
        const product = textileProducts.value.find(p => p.id === newProductId)
        if (product) {
          selectedProduct.value = product
          
          // Auto-fill from product
          formData.product_code = product.product_code || product.sku
          formData.sku = product.sku
          formData.product_name = product.product_name
          formData.fabric_type = product.fabric_type || ''
          formData.weight_per_meter = product.weight_per_meter || null
          formData.width_cm = product.fabric_width_cm || null
          formData.fabric_composition = product.fabric_composition || ''
          formData.gsm = product.gsm || null
          
          // Auto-fill from product model/color codes if available
          if (product.model_code) formData.model_code = product.model_code
          if (product.color_code) formData.color_code = product.color_code
          
          // Calculate meters if we have weight per meter
          calculateMeters()
        }
      }
    })

    // Methods
    const loadTextileProducts = async () => {
      try {
        // TODO: Load textile products from API
        // For now, mock data
        textileProducts.value = [
          {
            id: '1',
            product_name: 'ผ้าฝ้าย 100% สีกรม',
            sku: 'FAB-001',
            product_code: 'PRD000001',
            fabric_type: 'cotton',
            weight_per_meter: 0.3,
            fabric_width_cm: 152,
            fabric_composition: 'Cotton 100%',
            gsm: 180,
            model_code: '402',
            color_code: '177'
          }
        ]
      } catch (error) {
        console.error('❌ Error loading textile products:', error)
        textileProducts.value = []
      }
    }

    const loadSuppliers = async () => {
      try {
        // TODO: Load suppliers from API
        suppliers.value = [
          { id: '1', name: 'บริษัท ผ้าไทย จำกัด' },
          { id: '2', name: 'บริษัท เท็กซ์ไทล์ อินดัสตรี่ จำกัด' }
        ]
      } catch (error) {
        console.error('❌ Error loading suppliers:', error)
        suppliers.value = []
      }
    }

    const generateLotId = async () => {
      if (!formData.model_code || !formData.color_code || !formData.width_cm) {
        return
      }
      
      try {
        // Initialize service if needed
        if (window.$apiRequest) {
          lotService.initialize(window.$apiRequest)
        }
        
        const sequence = await lotService.getNextSequence(
          formData.model_code,
          formData.color_code,
          formData.width_cm
        )
        
        formData.lot_sequence = String(sequence).padStart(5, '0')
      } catch (error) {
        console.error('❌ Error generating lot sequence:', error)
        formData.lot_sequence = '00001'
      }
    }

    const calculateMeters = () => {
      if (formData.original_weight_kg && formData.weight_per_meter && formData.weight_per_meter > 0) {
        formData.calculated_meters = Math.round((formData.original_weight_kg / formData.weight_per_meter) * 100) / 100
        formData.current_weight_kg = formData.original_weight_kg
        formData.current_meters = formData.calculated_meters
      }
    }

    const onProductChange = () => {
      // Generate lot ID when product changes
      setTimeout(() => {
        generateLotId()
      }, 100)
    }

    const createLot = async () => {
      if (!canCreate.value) return
      
      creating.value = true
      
      try {
        // Initialize service if needed
        if (window.$apiRequest) {
          lotService.initialize(window.$apiRequest)
        }

        // Prepare lot data
        const lotData = {
          ...formData,
          lot_id: previewLotId.value,
          lot_status: 'active'
        }

        const result = await lotService.createLotRegistry(lotData)
        
        if (result.success) {
          emit('created', result.data)
          emit('close')
          
          if (window.$toast) {
            window.$toast.success(`สร้าง Lot ${previewLotId.value} สำเร็จ`)
          }
        } else {
          throw new Error(result.error)
        }
      } catch (error) {
        console.error('❌ Error creating lot:', error)
        if (window.$toast) {
          window.$toast.error('ไม่สามารถสร้าง Lot ได้: ' + error.message)
        }
      } finally {
        creating.value = false
      }
    }

    const formatFabricType = (type) => {
      const types = {
        cotton: 'ผ้าฝ้าย',
        polyester: 'ผ้าโพลีเอสเตอร์',
        silk: 'ผ้าไหม',
        wool: 'ผ้าขนสัตว์',
        blend: 'ผ้าผสม'
      }
      return types[type] || type || '-'
    }

    // Lifecycle
    onMounted(async () => {
      await loadTextileProducts()
      await loadSuppliers()
    })

    return {
      // State
      creating,
      textileProducts,
      suppliers,
      selectedProduct,
      formData,
      
      // Computed
      previewLotId,
      canCreate,
      
      // Methods
      onProductChange,
      generateLotId,
      calculateMeters,
      createLot,
      formatFabricType
    }
  }
}
</script>

<style scoped>
/* Add any component-specific styles here */
</style>