<template>
    <div>
        <div class="flex flex-col w-full space-y-2">
            <!-- Your existing panel code -->
            <div class="flex flex-col md:flex-row items-start md:items-center justify-between bg-gray-100 border border-gray-300 border-t rounded-b-md rounded-t-none p-3 w-full">
              <div class="text-gray-700 font-bold w-full md:w-auto mb-4 md:mb-0 text-sm">
                ออกใบรับรองในนาม
              </div>
              <div class="flex flex-col space-y-4 md:space-y-0 md:flex-row md:space-x-6 w-full md:w-auto">
                <div class="flex items-center space-x-2 w-full md:w-auto">
                  <label class="inline-flex items-center w-full md:w-auto">
                    <input 
                      type="radio" 
                      name="cert_owner" 
                      value="personal" 
                      v-model="localCertOwnerType" 
                      @change="updateCertOwnerType"
                    />
                    <span class="ml-2 text-gray-600 text-sm">บุคคลธรรมดา</span>
                  </label>
                  <!-- <button class="text-gray-500 hover:text-gray-700 flex-shrink-0" @click="openModal('personal')">
                    <font-awesome-icon icon="pencil-alt" class="text-xs"/> แก้ไข
                  </button> -->
                </div>
                <div class="flex items-center space-x-2 w-full md:w-auto">
                  <label class="inline-flex items-center w-full md:w-auto">
                    <input 
                      type="radio" 
                      name="cert_owner" 
                      value="corporate" 
                      v-model="localCertOwnerType" 
                      @change="updateCertOwnerType"
                    />
                    <span class="ml-2 text-gray-600 text-sm">นิติบุคคล</span>
                  </label>
                  <button class="text-gray-500 hover:text-gray-700 flex-shrink-0 text-[13px]" @click="openModal('corporate')">
                    <font-awesome-icon icon="pencil-alt" class="text-[10px]"/> แก้ไขข้อมูลนิติบุคคล
                  </button>
                </div>
              </div>
            </div>
          
            <!-- New row with the paragraph -->
            <p class="text-gray-500 text-sm w-full">
              ** หลักสูตรนี้สามารถแก้ไขข้อมูลของผู้รับใบรับรองได้ระหว่าง ชื่อผู้อบรมหรือชื่อนิติบุคคล
            </p>
          </div>
          
  
      <!-- Include the custom modal component -->
      <CustomModal 
        :showModal="isModalVisible" 
        :type="modalType" 
        :data="certification.owner_data"
        @close="closeModal" 
        @save="handleSave"
      />
    </div>
  </template>
  
  <script>
  import CustomModal from './CustomModal.vue'; // Adjust the path as needed
  import storageManager from '@/plugins/storage';
  import requestClient from '@/plugins/requestClient';
  const Request = new requestClient(false);
  
  export default {
    components: {
      CustomModal
    },
    props: {
      certOwnerType: {
        type: String,
        required: true
      },
      certification: {
        type: Object,
        required: true
      }
    },
    data() {
      return {
        configs: storageManager.get('configs'),
        session: storageManager.get('session'),
        localCertOwnerType: this.certOwnerType, // Sync prop with local data
        isModalVisible: false,
        modalType: '',
        enrollData: null // To store the fetched data
      };
    },
    watch: {
      certOwnerType(newValue) {
        this.localCertOwnerType = newValue;
      }
    },
    methods: {
      async updateCertOwnerType() {
        this.$emit('update:certOwnerType', this.localCertOwnerType);
        
        try {
          // Update certification owner type using PUT request
          const response = await Request.PUT(
            `certification/${this.certification._id}`, // Replace with actual certification ID
            { 
              data: { 
                owner_type: this.localCertOwnerType // Update owner_type with the new value
              } 
            },
            this.configs.key
          );
          
          console.log('Certification updated:', response);
  
          // Handle success response if needed
        } catch (error) {
          console.error('Error updating certification:', error);
          // Handle error if needed
        }
      },
      async handleSave(formData) {
        console.log('Saved data:', formData);
        
        try {
          // Update owner information using PUT request
          const response = await Request.PUT(
            `certification/${this.certification._id}`, // Replace with actual certification ID
            { 
              data: { 
                owner_data: formData // Update owner_information with formData
              } 
            },
            this.configs.key
          );
          
          console.log('Owner information updated:', response);
          location.reload()
  
          // Handle success response if needed
        } catch (error) {
          console.error('Error updating owner information:', error);
          // Handle error if needed
        }
      },
      openModal(type) {
        this.modalType = type;
        this.isModalVisible = true;
      },
      closeModal() {
        this.isModalVisible = false;
      }
    }
  };
  </script>
  
  <style scoped>
  /* Add any component-specific styles here */
  </style>
  