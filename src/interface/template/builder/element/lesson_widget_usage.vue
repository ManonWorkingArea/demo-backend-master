<template>
    <div>
      <!-- Preview Mode -->
      <template v-if="mode === 'preview'">
        <div class="p-2">
          <h1>{{ item.text || 'None' }}</h1>
        </div>
      </template>
  
      <!-- Edit Mode -->
      <template v-else-if="mode === 'edit'">
        <div class="content-editor overflow-auto" style="min-height: 600px; max-height: 600px; scrollbar-width: thin; scrollbar-color: rgba(0, 0, 0, 0.2) transparent; right: -20px;">
          <div class="section-group">
            <div class="border-b border-gray-200 pb-3 mb-3">
              <span class="popup-label block font-bold text-lg">Header Config</span>
              <span class="popup-label text-gray-500">การตั้งค่าของส่วนหัว</span>
            </div>
          </div>
  
          <div class="grid grid-cols-4 gap-4">
            <div class="col-span-4">
              <label class="popup-label block font-semibold mb-2">ข้อความที่ต้องการ</label>
              <input v-model="localItem.text" type="text" class="w-full popup-input rounded-sm border border-gray-200" @input="updateItem('text', $event.target.value)" />
            </div>
            
            <div class="col-span-2">
              <label class="popup-label block font-semibold mb-2">ตำแหน่งข้อความ:</label>
              <div class="grid grid-cols-4 gap-2">
  
                <label class="radio-label flex flex-col items-center p-2 justify-center cursor-pointer border border-gray-300 rounded-sm" :class="{ 'bg-gray-200': localItem.align === 'left' }">
                  <span class="font-icon"><i class="fas fa-align-left text-md ml-1"></i></span>
                  <input type="radio" v-model="localItem.align" value="left" class="radio-input hidden" @change="updateItem('align', 'left')" />
                  <span class="mt-1 text-sm text-gray-500">ซ้าย</span>
                </label>
  
                <label class="radio-label flex flex-col items-center p-2 justify-center cursor-pointer border border-gray-300 rounded-sm" :class="{ 'bg-gray-200': localItem.align === 'center' }">
                  <span class="font-icon"><i class="fas fa-align-center text-md ml-1"></i></span>
                  <input type="radio" v-model="localItem.align" value="center" class="radio-input hidden" @change="updateItem('align', 'center')" />
                  <span class="mt-1 text-sm text-gray-500">กลาง</span>
                </label>
  
                <label class="radio-label flex flex-col items-center p-2 justify-center cursor-pointer border border-gray-300 rounded-sm" :class="{ 'bg-gray-200': localItem.align === 'right' }">
                  <span class="font-icon"><i class="fas fa-align-right text-md ml-1"></i></span>
                  <input type="radio" v-model="localItem.align" value="right" class="radio-input hidden" @change="updateItem('align', 'right')" />
                  <span class="mt-1 text-sm text-gray-500">ขวา</span>
                </label>
  
              </div>
            </div>
  
            <div class="col-span-2">
              <label class="popup-label">Color:</label>
              <input v-model="localItem.color" type="text" class="w-full popup-input rounded-sm border border-gray-200" @input="updateItem('color', $event.target.value)" />
            </div>
        
            <div class="col-span-4">
              <label class="popup-label block font-semibold mb-2">ความสูงของส่วนหัว</label>
              <div class="flex items-center">
                <select v-model="localItem.heightOption" class="w-32 popup-input rounded-sm border border-gray-200" @change="updateItem('heightOption', $event.target.value)">
                  <option value="auto">Auto</option>
                  <option value="full">Full</option>
                  <option value="manual">Manual</option>
                </select>
                <input v-if="localItem.heightOption === 'manual'" v-model="localItem.height" type="number" class="w-16 ml-2 popup-input rounded-sm border border-gray-200" @input="updateItem('height', $event.target.value)" />
                <select v-if="localItem.heightOption === 'manual'" v-model="localItem.heightUnit" class="w-16 popup-input rounded-sm border border-gray-200" @change="updateItem('heightUnit', $event.target.value)">
                  <option value="px">px</option>
                  <option value="%">%</option>
                </select>
                <label v-if="localItem.heightOption === 'full'" class="radio-label flex items-center cursor-pointer ml-2">
                  <input type="radio" v-model="localItem.alignH" value="top" class="radio-input" @change="updateItem('alignH', 'top')" />
                  <span class="radio-icon mr-2"></span>
                  <span class="text-sm text-gray-500">Align Top</span>
                </label>
                <label v-if="localItem.heightOption === 'full'" class="radio-label flex items-center cursor-pointer">
                  <input type="radio" v-model="localItem.alignH" value="middle" class="radio-input" @change="updateItem('alignH', 'middle')" />
                  <span class="radio-icon mr-2"></span>
                  <span class="text-sm text-gray-500">Align Middle</span>
                </label>
                <label v-if="localItem.heightOption === 'full'" class="radio-label flex items-center cursor-pointer">
                  <input type="radio" v-model="localItem.alignH" value="bottom" class="radio-input" @change="updateItem('alignH', 'bottom')" />
                  <span class="radio-icon mr-2"></span>
                  <span class="text-sm text-gray-500">Align Bottom</span>
                </label>
              </div>
            </div>
          
            <div class="col-span-4">
              <label class="popup-label block font-semibold mb-2">ขนาดฟอนต์:</label>
              <div class="grid grid-cols-6 gap-2 items-center">
                <label class="radio-label flex flex-col items-center p-2 justify-center cursor-pointer border border-gray-300 rounded-sm" :class="{ 'bg-gray-200': localItem.fontSize === 'sm' }">
                  <span class="radio-icon text-[10px] w-6 h-6 flex items-center justify-center"><i class="fas fa-font"></i></span>
                  <input type="radio" v-model="localItem.fontSize" value="sm" class="radio-input hidden" @change="updateItem('fontSize', 'sm')" />
                  <span class="mt-1 text-gray-500">sm</span>
                </label>
                <label class="radio-label flex flex-col items-center p-2 justify-center cursor-pointer border border-gray-300 rounded-sm" :class="{ 'bg-gray-200': localItem.fontSize === 'md' }">
                  <span class="radio-icon text-[12px] w-6 h-6 flex items-center justify-center"><i class="fas fa-font"></i></span>
                  <input type="radio" v-model="localItem.fontSize" value="md" class="radio-input hidden" @change="updateItem('fontSize', 'md')" />
                  <span class="mt-1 text-gray-500">md</span>
                </label>
                <label class="radio-label flex flex-col items-center p-2 justify-center cursor-pointer border border-gray-300 rounded-sm" :class="{ 'bg-gray-200': localItem.fontSize === 'lg' }">
                  <span class="radio-icon text-[14px] w-6 h-6 flex items-center justify-center"><i class="fas fa-font"></i></span>
                  <input type="radio" v-model="localItem.fontSize" value="lg" class="radio-input hidden" @change="updateItem('fontSize', 'lg')" />
                  <span class="mt-1 text-gray-500">lg</span>
                </label>
                <label class="radio-label flex flex-col items-center p-2 justify-center cursor-pointer border border-gray-300 rounded-sm" :class="{ 'bg-gray-200': localItem.fontSize === 'xl' }">
                  <span class="radio-icon text-[16px] w-6 h-6 flex items-center justify-center"><i class="fas fa-font"></i></span>
                  <input type="radio" v-model="localItem.fontSize" value="xl" class="radio-input hidden" @change="updateItem('fontSize', 'xl')" />
                  <span class="mt-1 text-gray-500">xl</span>
                </label>
                <label class="radio-label flex flex-col items-center p-2 justify-center cursor-pointer border border-gray-300 rounded-sm" :class="{ 'bg-gray-200': localItem.fontSize === '2xl' }">
                  <span class="radio-icon text-[18px] w-6 h-6 flex items-center justify-center"><i class="fas fa-font"></i></span>
                  <input type="radio" v-model="localItem.fontSize" value="2xl" class="radio-input hidden" @change="updateItem('fontSize', '2xl')" />
                  <span class="mt-1 text-gray-500">2xl</span>
                </label>
                <label class="radio-label flex flex-col items-center p-2 justify-center cursor-pointer border border-gray-300 rounded-sm" :class="{ 'bg-gray-200': localItem.fontSize === '4xl' }">
                  <span class="radio-icon text-[20px] w-6 h-6 flex items-center justify-center"><i class="fas fa-font"></i></span>
                  <input type="radio" v-model="localItem.fontSize" value="4xl" class="radio-input hidden" @change="updateItem('fontSize', '4xl')" />
                  <span class="mt-1 text-gray-500">4xl</span>
                </label>
              </div>
            </div>
          
            <div class="col-span-4">
              <label class="popup-label block font-semibold mb-2">ความหนาฟอนต์:</label>
              <div class="grid grid-cols-4 gap-2">
  
                <label class="radio-label flex flex-col items-center p-2 justify-center cursor-pointer border border-gray-300 rounded-sm" :class="{ 'bg-gray-200': localItem.fontWeight === 'normal' }">
                  <span class="font-icon font-normal text-lg">A</span>
                  <input type="radio" v-model="localItem.fontWeight" value="normal" class="radio-input hidden" @change="updateItem('fontWeight', 'normal')" />
                  <span class="mt-1 text-sm text-gray-500">Normal</span>
                </label>
  
                <label class="radio-label flex flex-col items-center p-2 justify-center cursor-pointer border border-gray-300 rounded-sm" :class="{ 'bg-gray-200': localItem.fontWeight === 'medium' }">
                  <span class="font-icon font-medium text-lg">A</span>
                  <input type="radio" v-model="localItem.fontWeight" value="medium" class="radio-input hidden" @change="updateItem('fontWeight', 'medium')" />
                  <span class="mt-1 text-sm text-gray-500">Medium</span>
                </label>
  
                <label class="radio-label flex flex-col items-center p-2 justify-center cursor-pointer border border-gray-300 rounded-sm" :class="{ 'bg-gray-200': localItem.fontWeight === 'semibold' }">
                  <span class="font-icon font-semibold text-lg">A</span>
                  <input type="radio" v-model="localItem.fontWeight" value="semibold" class="radio-input hidden" @change="updateItem('fontWeight', 'semibold')" />
                  <span class="mt-1 text-sm text-gray-500">Semibold</span>
                </label>
  
                <label class="radio-label flex flex-col items-center p-2 justify-center cursor-pointer border border-gray-300 rounded-sm" :class="{ 'bg-gray-200': localItem.fontWeight === 'bold' }">
                  <span class="font-icon font-bold text-lg">A</span>
                  <input type="radio" v-model="localItem.fontWeight" value="bold" class="radio-input hidden" @change="updateItem('fontWeight', 'bold')" />
                  <span class="mt-1 text-sm text-gray-500">Bold</span>
                </label>
  
              </div>
            </div>
            
          </div>
          
        </div>
      </template>
    </div>
  </template>
  
  <script>
  export default {
    name: 'Header',
    props: {
      item: {
        type: Object,
        required: true
      },
      mode: {
        type: String,
        required: true,
        default: 'preview' // or 'edit'
      }
    },
    data() {
      return {
        localItem: { ...this.item } // Create a local copy of the item prop
      };
    },
    methods: {
      updateItem(key, value) {
        this.$emit('update-item', { ...this.localItem, [key]: value });
      }
    },
    watch: {
      item: {
        handler(newVal) {
          this.localItem = { ...newVal };
        },
        deep: true
      }
    }
  };
  </script>
  
  <style scoped>
  /* Add any necessary styles here */
  </style>
  