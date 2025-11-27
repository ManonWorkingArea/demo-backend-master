<template>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
      
      <template v-for="(addressItem, index) in addresses" :key="index">
      
        <div v-if="addressItem.value" class="bg-white shadow-sm rounded-sm border border-gray-300 p-4 mb-2">
          <div class="flex items-center justify-between">
            <h3 class="font-semibold">{{ addressItem.name }}</h3>
            <button v-if="session.role==='admin'" @click="toggleEdit(addressItem)"><font-awesome-icon :icon="['fas', 'pencil']" class="w-3 text-gray-400" /></button>
          </div>
          
          <div class="mt-4">
            <div v-if="addressItem.isEditing">
              <div class="flex flex-wrap">

                <template v-if="addressItem.value && addressItem.value.NO">
                  <p class="w-full md:w-1/2 lg:w-1/3"><span class="font-semibold">เลขที่:</span> 
                    <input v-model="addressItem.value.NO" class="border border-gray-300 rounded-sm p-1 w-full">
                  </p>
                </template>

                <template v-if="addressItem.value && addressItem.value.MOO">
                  <p class="w-full md:w-1/2 lg:w-1/3"><span class="font-semibold">หมู่:</span> 
                    <input v-model="addressItem.value.MOO" class="border border-gray-300 rounded-sm p-1 w-full">
                  </p>
                </template>

                <template v-if="addressItem.value && addressItem.value.SOI_TH">
                  <p class="w-full md:w-1/2 lg:w-1/3"><span class="font-semibold">ซอย:</span> 
                    <input v-model="addressItem.value.SOI_TH" class="border border-gray-300 rounded-sm p-1 w-full">
                  </p>
                </template>

                <template v-if="addressItem.value && addressItem.value.BUILDING_TH">
                  <p class="w-full md:w-1/2 lg:w-1/3"><span class="font-semibold">อาคาร:</span> 
                    <input v-model="addressItem.value.BUILDING_TH" class="border border-gray-300 rounded-sm p-1 w-full">
                  </p>
                </template>

                <template v-if="addressItem.value && addressItem.value.ROAD_TH">
                  <p class="w-full md:w-1/2 lg:w-1/3"><span class="font-semibold">ถนน:</span> 
                    <input v-model="addressItem.value.ROAD_TH" class="border border-gray-300 rounded-sm p-1 w-full">
                  </p>
                </template>

              </div>

              <template v-if="addressItem.value && addressItem.value.subdistrict">
                <p class="w-full md:w-1/2 lg:w-1/3"><span class="font-semibold">ตำบล/แขวง:</span> 
                  <input v-model="addressItem.value.subdistrict" class="border border-gray-300 rounded-sm p-1 w-full">
                </p>
              </template>

              <template v-if="addressItem.value && addressItem.value.district">
                <p class="w-full md:w-1/2 lg:w-1/3"><span class="font-semibold">อำเภอ/เขต:</span> 
                  <input v-model="addressItem.value.district" class="border border-gray-300 rounded-sm p-1 w-full">
                </p>
              </template>
            
              <div class="flex">

                <template v-if="addressItem.value && addressItem.value.province">
                  <p class="w-full md:w-1/2 lg:w-1/3"><span class="font-semibold">จังหวัด:</span> 
                    <input v-model="addressItem.value.province" class="border border-gray-300 rounded-sm p-1 w-full">
                  </p>
                </template>
                
                <template v-if="addressItem.value && addressItem.value.zipcode">
                  <p class="w-full md:w-1/2 lg:w-1/3"><span class="font-semibold">รหัสไปรษณีย์:</span> 
                    <input v-model="addressItem.value.zipcode" class="border border-gray-300 rounded-sm p-1 w-full">
                  </p>
                </template>

              </div>
              <button @click="updateAddress(addressItem)">Update</button>
            </div>

            <div v-else>
              <div class="flex flex-wrap">
                <div v-if="addressItem.value && addressItem.value.NO">
                  <p><span class="font-semibold">เลขที่:</span> {{ addressItem.value.NO }}</p>
                </div>
                <div v-if="addressItem.value && addressItem.value.MOO">
                  <p><span class="font-semibold">หมู่:</span> {{ addressItem.value.MOO }}</p>
                </div>
                <div v-if="addressItem.value && addressItem.value.SOI_TH">
                  <p><span class="font-semibold">ซอย:</span> {{ addressItem.value.SOI_TH }}</p>
                </div>
                <div v-if="addressItem.value && addressItem.value.BUILDING_TH">
                  <p><span class="font-semibold">อาคาร:</span> {{ addressItem.value.BUILDING_TH }}</p>
                </div>
                <div v-if="addressItem.value && addressItem.value.ROAD_TH">
                  <p><span class="font-semibold">ถนน:</span> {{ addressItem.value.ROAD_TH }}</p>
                </div>
              </div>
              <p v-if="addressItem.value && addressItem.value.subdistrict"><span class="font-semibold">ตำบล/แขวง:</span> {{ addressItem.value.subdistrict }}</p>
              <p v-if="addressItem.value && addressItem.value.district"><span class="font-semibold">อำเภอ/เขต:</span> {{ addressItem.value.district }}</p>
              <p v-if="addressItem.value && addressItem.value.province"><span class="font-semibold">จังหวัด:</span> {{ addressItem.value.province }} {{ addressItem.value.zipcode }}</p>
            </div>
          </div>
          
        </div>

      </template>

    </div>
  </template>
  
  <script>
    import storageManager from '@/plugins/storage';
  export default {
    props: {
      addresses: {
        type: Array,
        required: true
      }
    },
    data() {
      return {
        session: storageManager.get('session'),
      };
    },
    methods: {
      toggleEdit(addressItem) {
        addressItem.isEditing = !addressItem.isEditing;
      },
      updateAddress() {
        this.$emit('address-updated', this.addresses);
      }
    }
  };
  </script>
  
  <style scoped>
  /* Add scoped styles here if needed */
  </style>
  