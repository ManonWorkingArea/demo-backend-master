<template>
    <div class="relative w-full">
        <div class="aspect-w-16 aspect-h-6">
            <div class="absolute inset-0 flex items-center justify-center cursor-pointer" @click="OpenFileImageBrowser">
            <div class="w-full h-full bg-gray-200 flex items-center justify-center">
                <span class="text-gray-400" v-if="!selectedItem.url">ยังไม่ได้เลือกรูป</span>
                <img v-else :src="selectedItem.url" alt="Selected Image" class="object-cover object-center w-full h-full" />
            </div>
            <div class="absolute inset-0 flex flex-col items-center justify-center opacity-0 hover:opacity-100">
                <div class="absolute inset-0 bg-black bg-opacity-20"></div>
                <span class="text-white bg-black p-2"><i class="fas fa-upload text-white text-lg mr-2"></i> คลิ๊กเพื่อเลือกรูปภาพ</span>
            </div>
            </div>
        </div>
        </div>
        
        <div class="mt-2 grid grid-cols-2 gap-4">
        
        <div class="ml-2">
            <label class="inline-flex items-center pt-8">
            <input v-model="selectedItem.showShadow" type="checkbox" class="form-checkbox" />
            <span class="ml-2">แสดงเงาของรูป</span>
            </label>
        </div>

        <div class="ml-2">
            <label class="inline-flex items-center pt-8">
            <input v-model="selectedItem.showHome" type="checkbox" class="form-checkbox" />
            <span class="ml-2">Home Link</span>
            </label>
        </div>

        <div class="col-span-2">
            <div class="grid grid-cols-1 gap-4">
            <div class="ml-2">
                <label class="inline-flex items-center">
                <input v-model="selectedItem.canLink" type="checkbox" class="form-checkbox" />
                <span class="ml-2">สร้างลิงค์</span>
                </label>
            </div>
            <div v-if="selectedItem.canLink">
                <div class="mt-2 grid grid-cols-3 gap-4">
                <div class="col-span-2">
                    <label class="popup-label">ระบุลิงค์ปลายทางที่ต้องการ:</label>
                    <input v-model="selectedItem.link" type="text" class="popup-input w-full rounded-sm border border-gray-200" />
                </div>

                <div>
                    <label class="popup-label">เปิดลิงค์ใน:</label>
                    <select v-model="selectedItem.target" class="popup-input w-full rounded-sm border border-gray-200">
                    <option disabled value="">เลือกปลายทาง</option>
                    <option value="_self">หน้าเดิม</option>
                    <option value="_blank">หน้าใหม่</option>
                    </select>
                </div>
                </div>
                
            </div>

            <div>
                <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="popup-label">คำอธิบายรูปภาพ:</label>
                    <input v-model="selectedItem.alt" type="text" class="popup-input w-full rounded-sm border border-gray-200" />
                </div>
                <div>
                    <label class="popup-label">ขนาด:</label>
                    <input v-model="selectedItem.width" type="text" class="popup-input w-full rounded-sm border border-gray-200" />
                </div>
                </div>
            </div>

            <div class="section-group mt-3">
                <label class="popup-label block font-semibold">Image Alignment</label>
                <div class="grid grid-cols-3 gap-4 mt-3">
                <label
                    v-for="alignment in ['left', 'center', 'right']"
                    :key="alignment"
                    class="radio-label p-2 flex flex-col items-center justify-center cursor-pointer border border-gray-300 rounded-sm"
                    :class="{ 'bg-gray-200': selectedItem.alignment === alignment }"
                    @click="selectedItem.alignment = alignment"
                >
                    <input type="radio" v-model="selectedItem.alignment" :value="alignment" class="radio-input hidden" />
                    <span class="text-center text-sm text-gray-500">{{ alignment }}</span>
                </label>
                </div>
            </div>

            </div>
        </div>
    </div>
    
  </template>
  
  <script>
  export default {
    props: {
      dataItem: {
        type: Object,
        required: true,
      },
    },
    data() {
      return {
        selectedItem: { ...this.dataItem }, // Create a local copy of the dataItem prop
      };
    },
    watch: {
      dataItem: {
        handler(newVal) {
          // Keep the local copy in sync with the prop
          this.selectedItem = { ...newVal };
        },
        deep: true,
      },
    },
    methods: {
      emitUpdate(field, value) {
        this.selectedItem[field] = value; // Update local copy
        this.$emit('update', { field, value }); // Emit update to parent
      },
    },
  };
  </script>
  
  