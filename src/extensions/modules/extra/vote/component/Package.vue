<template>
  <div class="mx-auto">
    <!-- If no package is selected, show the package list -->
    <div>
      <!-- Title and button in a two-column layout -->
      <div class="flex justify-between items-center mb-4 border-b pb-2 pt-2 pl-2 pr-2 border-gray-200">
        <!-- Title on the left -->
        <h3 class="text-md font-bold">Packages</h3>

        <!-- Button on the right -->
        <button
          @click="addPackage"
          class="primary-btn px-4 py-2 bg-blue-500 text-white rounded shadow-sm hover:bg-blue-600"
        >
          เพิ่ม Package
        </button>
      </div>

      <div class="p-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
          <template v-for="(packageItem) in packages" :key="packageItem._id">
            <div class="bg-white p-5 rounded-sm shadow-sm">
              <div class="flex items-center justify-between">
                <!-- Package name -->
                <h3 class="text-md font-semibold">
                  {{ getPackageIndex(packageItem) }}.{{ packageItem.name }}
                </h3>
              </div>
              <p class="text-xs text-gray-500 mt-1">{{ packageItem.code }}</p>
              <p class="text-sm text-gray-600 mt-1">{{ packageItem.description }}</p>
              <div class="mt-4 flex justify-between">
                <div class="space-x-2">
                  <button @click="movePackageUp(packageItem)" class="text-sm text-gray-500 hover:text-gray-700">
                    <font-awesome-icon :icon="['fas','chevron-up']" class="pr-2 pl-2" />
                  </button>
                  <button @click="movePackageDown(packageItem)" class="text-sm text-gray-500 hover:text-gray-700">
                    <font-awesome-icon :icon="['fas','chevron-down']" class="pr-2 pl-2" />
                  </button>
                </div>
                <div class="space-x-2">
                  <button @click="openRenameDialog(packageItem)" class="text-sm text-gray-500 hover:text-gray-700">
                    <font-awesome-icon :icon="['fas','edit']" class="pl-2" /> เปลี่ยนชื่อ
                  </button>
                  <button @click="removePackageConfirmation(packageItem)" class="text-sm text-red-500 hover:text-red-700">
                    <font-awesome-icon :icon="['fas','trash']" class="pl-2" /> ลบ
                  </button>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- Rename Dialog -->
    <div v-if="showRenameDialog" class="fixed inset-0 flex items-center justify-center">
      <div class="absolute inset-0 bg-black opacity-75" style="z-index:10"></div>
      <div class="bg-white rounded p-5 z-10">
        <h4 class="text-xl font-semibold mb-4">เปลี่ยนชื่อ Package</h4>
        <div class="flex flex-col space-y-2">
          <label for="newName" class="font-medium">ชื่อใหม่</label>
          <input v-model="selectedPackage.name" type="text" id="newName" placeholder="Enter the new name" class="px-4 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring focus:border-blue-500">
          <label for="newCode" class="font-medium">รหัสใหม่</label>
          <input v-model="selectedPackage.code" type="text" id="newCode" placeholder="Enter the new code" class="px-4 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring focus:border-blue-500">
          <label for="newDescription" class="font-medium">คำอธิบาย</label>
          <textarea v-model="selectedPackage.description" id="newDescription" placeholder="Enter the new description" class="px-4 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring focus:border-blue-500"></textarea>
        </div>
        <div class="flex justify-end mt-6 space-x-4">
          <button @click="renamePackage(selectedPackage)" class="px-6 py-2 text-sm font-medium text-white bg-blue-500 rounded-sm hover:bg-blue-600">Rename</button>
          <button @click="closeRenameDialog" class="px-6 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">Cancel</button>
        </div>
      </div>
    </div>

    <!-- Confirmation Popup for Packages -->
    <div v-if="showConfirmationPopup" class="fixed inset-0 flex items-center justify-center z-50">
      <div class="absolute inset-0 bg-black opacity-75"></div>
      <div class="bg-white rounded p-5 z-10">
        <h4 class="text-xl font-semibold mb-4">Confirm Remove Package</h4>
        <p>Are you sure you want to remove the package?</p>
        <div class="flex justify-end mt-6 space-x-4">
          <button @click="confirmRemovePackage" class="px-6 py-2 text-sm font-medium text-white bg-red-500 rounded-sm">Remove</button>
          <button @click="cancelRemovePackage" class="px-6 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import storageManager from '@/plugins/storage';

export default {
  name: 'PackageList',
  
  props: {
    eventDetails: {
      type: Object,
      required: true,
    },
  },

  data() {
    return {
      session: storageManager.get('session'),
      configs: storageManager.get('configs'),
      packages: [],
      showRenameDialog: false,
      selectedPackage: null,
      showConfirmationPopup: false,
      packageToRemove: null,
    };
  },

  computed: {
    getPackageIndex() {
      return (packageItem) => this.packages.findIndex((pkg) => pkg._id === packageItem._id) + 1;
    },
  },

  async mounted() {
    try {
      console.log("Event Details:", this.eventDetails);
      await this.getPackageData();
    } catch (error) {
      console.log(error);
    }
  },

  methods: {
    async getPackageData() {
      try {
        const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/vote_package/query", {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'client-token-key': this.configs.key },
          body: JSON.stringify({
            method: 'find',
            args: [
              {
                unit: this.session.current._id,
                eventID: this.eventDetails._id,
              },
            ],
            paging: { page: 1, limit: 200 },
          }),
        });

        if (resAPI.ok) {
          const finalRes = await resAPI.json();
          this.packages = finalRes.data;
        }
      } catch (error) {
        console.error(error);
      }
    },

    async addPackage() {
      try {
        const requestData = {
          unit: this.session.current._id,
          name: 'New Package',
          code: 'package-code',
          description: 'Description for New Package',
          eventID: this.eventDetails._id,
          visible: true,
        };

        const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/vote_package/", {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'client-token-key': this.configs.key },
          body: JSON.stringify({
            data: requestData,
            options: {},
          }),
        });

        if (resAPI.ok) {
          await this.getPackageData();
        }
      } catch (error) {
        console.error(error);
      }
    },

    async updatePackage(packageItem) {
      try {
        const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/vote_package/" + packageItem._id, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'client-token-key': this.configs.key },
          body: JSON.stringify({
            data: {
              name: packageItem.name,
              code: packageItem.code,
              description: packageItem.description,
              visible: packageItem.visible,
            },
            options: {},
          }),
        });

        if (resAPI.ok) {
          await this.getPackageData();
        }
      } catch (error) {
        console.error(error);
      }
    },

    async deletePackage(packageItem) {
      try {
        const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/vote_package/" + packageItem._id, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json', 'client-token-key': this.configs.key },
        });

        if (resAPI.ok) {
          await this.getPackageData();
        }
      } catch (error) {
        console.error(error);
      }
    },

    movePackageUp(packageItem) {
      const index = this.packages.findIndex((pkg) => pkg._id === packageItem._id);
      if (index > 0) {
        const movedPackage = this.packages.splice(index, 1)[0];
        this.packages.splice(index - 1, 0, movedPackage);
      }
    },

    movePackageDown(packageItem) {
      const index = this.packages.findIndex((pkg) => pkg._id === packageItem._id);
      if (index < this.packages.length - 1) {
        const movedPackage = this.packages.splice(index, 1)[0];
        this.packages.splice(index + 1, 0, movedPackage);
      }
    },

    async removePackageConfirmation(packageItem) {
      this.packageToRemove = packageItem;
      this.showConfirmationPopup = true;
    },

    async confirmRemovePackage() {
      try {
        await this.deletePackage(this.packageToRemove);
        this.packageToRemove = null;
        this.showConfirmationPopup = false;
      } catch (error) {
        console.error(error);
      }
    },

    openRenameDialog(packageItem) {
      this.selectedPackage = packageItem;
      this.showRenameDialog = true;
    },

    async renamePackage(packageItem) {
      try {
        await this.updatePackage(packageItem);
        this.selectedPackage = null;
        this.showRenameDialog = false;
      } catch (error) {
        console.error(error);
      }
    },

    closeRenameDialog() {
      this.selectedPackage = null;
      this.showRenameDialog = false;
    },
  },
};
</script>

<style scoped>
/* Add your custom styles here */
</style>
