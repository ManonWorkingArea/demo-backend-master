<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    <template v-for="(addressItem, index) in addresses" :key="index">
      <div v-if="addressItem.value" class="bg-white shadow-sm rounded-lg border border-gray-300 p-6">
        <div class="flex items-center justify-between">
          <h3 class="font-semibold text-lg">{{ addressItem.name }}</h3>
          <button v-if="session.role === 'admin'" @click="toggleEdit(addressItem)">
            <font-awesome-icon :icon="['fas', 'pencil']" class="w-4 text-gray-500 hover:text-gray-700" />
          </button>
        </div>

        <div class="mt-4">
          <div v-if="addressItem.isEditing">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <p>
                  <span class="font-semibold">เลขที่:</span>
                  <input v-model="addressItem.value.NO" class="border border-gray-300 rounded-sm p-2 w-full mt-1">
                </p>
              </div>

              <div>
                <p>
                  <span class="font-semibold">หมู่:</span>
                  <input v-model="addressItem.value.MOO" class="border border-gray-300 rounded-sm p-2 w-full mt-1">
                </p>
              </div>

              <div>
                <p>
                  <span class="font-semibold">ซอย:</span>
                  <input v-model="addressItem.value.SOI_TH" class="border border-gray-300 rounded-sm p-2 w-full mt-1">
                </p>
              </div>

              <div>
                <p>
                  <span class="font-semibold">อาคาร:</span>
                  <input v-model="addressItem.value.BUILDING_TH" class="border border-gray-300 rounded-sm p-2 w-full mt-1">
                </p>
              </div>

              <div>
                <p>
                  <span class="font-semibold">ถนน:</span>
                  <input v-model="addressItem.value.ROAD_TH" class="border border-gray-300 rounded-sm p-2 w-full mt-1">
                </p>
              </div>

              <div>
                <p>
                  <span class="font-semibold">ตำบล/แขวง:</span>
                  <input v-model="addressItem.value.subdistrict" class="border border-gray-300 rounded-sm p-2 w-full mt-1">
                </p>
              </div>

              <div>
                <p>
                  <span class="font-semibold">อำเภอ/เขต:</span>
                  <input v-model="addressItem.value.district" class="border border-gray-300 rounded-sm p-2 w-full mt-1">
                </p>
              </div>

              <div>
                <p>
                  <span class="font-semibold">จังหวัด:</span>
                  <input v-model="addressItem.value.province" class="border border-gray-300 rounded-sm p-2 w-full mt-1">
                </p>
              </div>

              <div>
                <p>
                  <span class="font-semibold">รหัสไปรษณีย์:</span>
                  <input v-model="addressItem.value.zipcode" class="border border-gray-300 rounded-sm p-2 w-full mt-1">
                </p>
              </div>
            </div>
            <div class="flex space-x-4 mt-4">
              <button @click="updateAddress(addressItem)" class="bg-blue-500 text-white rounded-sm px-4 py-2 hover:bg-blue-600">
                Update
              </button>
              <button @click="toggleEdit(addressItem)" class="bg-gray-500 text-white rounded-sm px-4 py-2 hover:bg-gray-600">
                Cancel
              </button>
            </div>
          </div>

          <div v-else>
            <div class="flex flex-wrap -mx-2">
              <div class="w-full md:w-1/2 lg:w-1/3 px-2 mb-2">
                <p><span class="font-semibold">เลขที่:</span> {{ addressItem.value.NO || '-' }}</p>
              </div>
              <div class="w-full md:w-1/2 lg:w-1/3 px-2 mb-2">
                <p><span class="font-semibold">หมู่:</span> {{ addressItem.value.MOO || '-' }}</p>
              </div>
              <div class="w-full md:w-1/2 lg:w-1/3 px-2 mb-2">
                <p><span class="font-semibold">ซอย:</span> {{ addressItem.value.SOI_TH || '-' }}</p>
              </div>
              <div class="w-full md:w-1/2 lg:w-1/3 px-2 mb-2">
                <p><span class="font-semibold">อาคาร:</span> {{ addressItem.value.BUILDING_TH || '-' }}</p>
              </div>
              <div class="w-full md:w-1/2 lg:w-1/3 px-2 mb-2">
                <p><span class="font-semibold">ถนน:</span> {{ addressItem.value.ROAD_TH || '-' }}</p>
              </div>
            </div>
            <p><span class="font-semibold">ตำบล/แขวง:</span> {{ addressItem.value.subdistrict || '-' }}</p>
            <p><span class="font-semibold">อำเภอ/เขต:</span> {{ addressItem.value.district || '-' }}</p>
            <p><span class="font-semibold">จังหวัด:</span> {{ addressItem.value.province || '-' }} {{ addressItem.value.zipcode || '-' }}</p>
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
      session: storageManager.get('session')
    };
  },
  created() {
    this.setDefaultAddresses();
  },
  methods: {
    toggleEdit(addressItem) {
      addressItem.isEditing = !addressItem.isEditing;
    },
    updateAddress() {
      this.$emit('address-updated', this.addresses);
    },
    setDefaultAddresses() {
      const defaultAddressValue = {
        tax_ID: "",
        owner_NAME_TH: "",
        MOO: "",
        SOI_TH: "",
        NO: "",
        BUILDING_TH: "",
        ROAD_TH: "",
        subdistrict: "",
        district: "",
        province: "",
        zipcode: ""
      };

      this.addresses.forEach(address => {
        if (!address.value || address.value === "N/A") {
          address.value = { ...defaultAddressValue };
        }
      });
    }
  }
};
</script>

<style scoped>
/* Add scoped styles here if needed */
</style>
