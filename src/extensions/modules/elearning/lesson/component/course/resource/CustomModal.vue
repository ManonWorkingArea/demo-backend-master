<!-- CustomModal.vue -->
<template>
    <div v-if="showModal" class="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
      <div class="bg-white rounded-md shadow-lg p-6 w-full max-w-lg">
        <div class="flex justify-between items-center border-b pb-4">
          <h3 class="text-lg font-bold">{{ modalTitle }}</h3>
          <button @click="closeModal" class="text-gray-500 hover:text-gray-700">
            <font-awesome-icon icon="times"/>
          </button>
        </div>
        <div class="mt-4">
          <!-- Display warning message at the top -->
          <p v-if="type === 'corporate'" class="text-red-500 text-sm mb-4">
            แก้ไขข้อมูลบริษัทได้ครั้งเดียวเท่านั้น กรุณาตรวจสอบให้ถูกต้องก่อนบันทึกข้อมูล
          </p>
          <!-- Render form based on modal type -->
          <div v-if="type === 'personal'" class="flex flex-wrap md:flex-nowrap">
            <!-- Left Column: Prefix -->
            <div class="w-full md:w-1/5 pr-4 mb-4">
              <label class="block mb-2">คำนำหน้า</label>
              <select v-model="formData.prefix" class="p-2 border rounded w-full">
                <option value="mr">นาย</option>
                <option value="mrs">นาง</option>
                <option value="ms">นางสาว</option>
              </select>
            </div>
            <!-- Middle Column: First Name -->
            <div class="w-full md:w-2/5 pr-4 mb-4">
              <label class="block mb-2">ชื่อ</label>
              <input type="text" v-model="formData.firstName" class="p-2 border rounded w-full"/>
            </div>
            <!-- Right Column: Last Name -->
            <div class="w-full md:w-2/5 mb-4">
              <label class="block mb-2">นามสกุล</label>
              <input type="text" v-model="formData.lastName" class="p-2 border rounded w-full"/>
            </div>
          </div>
          <div v-else-if="type === 'corporate'">
            <label class="block mb-2">ชื่อบริษัท</label>
            <input type="text" v-model="formData.corpName" class="mb-4 p-2 border rounded w-full" />
            <label class="block mb-2">ที่อยู่</label>
            <textarea v-model="formData.address" class="p-2 border rounded w-full" rows="4"></textarea>
          </div>
        </div>
        <div class="flex justify-end mt-4">
          <button 
            @click="save" 
            class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            :disabled="!isInitialEmpty && formData.corpName !== ''"
            :style="{ opacity: !isInitialEmpty && formData.corpName !== '' ? 0.5 : 1 }"
          >
            บันทึก
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      showModal: {
        type: Boolean,
        default: false
      },
      data: {
        type: Object,
        default: () => ({}) // Default to an empty object if no data is passed
      },
      type: {
        type: String,
        required: true
      }
    },
    data() {
      return {
        formData: {
          prefix: '',
          firstName: '',
          lastName: '',
          corpName: '',
          address: ''
        },
        isInitialEmpty: true // Flag to track if initial data is empty
      };
    },
    computed: {
      modalTitle() {
        return this.type === 'personal' ? 'แก้ไขบุคคลธรรมดา' : 'แก้ไขข้อมูลนิติบุคคล';
      }
    },
    watch: {
      data: {
        immediate: true, // Trigger watcher immediately on component creation
        handler(newData) {
          this.formData = { ...this.formData, ...newData }; // Merge prop data into formData
          // Check if initial data is empty and set the flag
          this.isInitialEmpty = !newData.corpName;
        }
      }
    },
    methods: {
      closeModal() {
        this.$emit('close');
      },
      save() {
        const dataToSave = {
          ...this.formData,
          type: this.type // Add type to the saved data
        };
        this.$emit('save', dataToSave);
        this.closeModal();
      }
    }
  };
  </script>
  
  <style scoped>
  /* Add any modal-specific styles here */
  </style>
  