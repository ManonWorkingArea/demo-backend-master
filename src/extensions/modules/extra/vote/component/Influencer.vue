<template>
  <div class="mx-auto">

    <!-- If no Influencer is selected, show the Influencer list -->
    <div>
      <!-- Title and button in a two-column layout -->
      <div class="flex justify-between items-center mb-4 border-b pb-2 pt-2 pl-2 pr-2 border-gray-200">
        <!-- Title on the left -->
        <h3 class="text-md font-bold">Influencers</h3>

        <!-- Button on the right -->
        <button
          @click="addInfluencer('main')"
          class="primary-btn px-4 py-2 bg-blue-500 text-white rounded shadow-sm hover:bg-blue-600"
        >
          เพิ่ม Influencer
        </button>
      </div>

      <div class="p-4" v-if="!selectedInfluencerForDetails">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
          <template v-for="(influencerItem) in flattenedInfluencers">
            <div
              v-if="influencerItem.type === 'main'"
              :key="influencerItem._id"
              class="bg-white p-5 rounded-sm shadow-sm"
            >
              <div class="flex items-center justify-between">
                <!-- Click on the name to show Influencer details -->
                <h3
                  @click="showInfluencerDetails(influencerItem)"
                  class="text-md font-semibold cursor-pointer hover:text-blue-600"
                >
                  {{ getMainInfluencerIndex(influencerItem) }}.{{ influencerItem.name }}
                </h3>
              </div>
              <p class="text-xs text-gray-500 mt-1">{{ influencerItem.code }}</p>
              <p class="text-sm text-gray-600 mt-1">{{ influencerItem.description }}</p>
              <div class="mt-4 flex justify-between">
                <div class="space-x-2">
                  <button @click="moveMainInfluencerUp(influencerItem)" class="text-sm text-gray-500 hover:text-gray-700">
                    <font-awesome-icon :icon="['fas','chevron-up']" class="pr-2 pl-2" />
                  </button>
                  <button
                    @click="moveMainInfluencerDown(influencerItem)"
                    class="text-sm text-gray-500 hover:text-gray-700"
                  >
                    <font-awesome-icon :icon="['fas','chevron-down']" class="pr-2 pl-2" />
                  </button>
                </div>
                <div class="space-x-2">
                  <button @click="openRenameDialog(influencerItem)" class="text-sm text-gray-500 hover:text-gray-700">
                    <font-awesome-icon :icon="['fas','edit']" class="pl-2" /> เปลี่ยนชื่อ
                  </button>
                  <button
                    @click="removeMainInfluencerConfirmation(influencerItem)"
                    class="text-sm text-red-500 hover:text-red-700"
                  >
                    <font-awesome-icon :icon="['fas','trash']" class="pl-2" /> ลบ
                  </button>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>

      <!-- Show Influencer Detail when selected -->
      <div v-else class="p-4">
        <InfluencerDetail :influencer="selectedInfluencerForDetails" @back="selectedInfluencerForDetails = null" />
      </div>
    </div>
  </div>

  <!-- Rename Dialog -->
  <div v-if="showRenameDialog" class="fixed inset-0 flex items-center justify-center">
    <div class="absolute inset-0 bg-black opacity-75" style="z-index:10"></div>
    <div class="bg-white rounded p-5 z-10">
      <h4 class="text-xl font-semibold mb-4">เปลี่ยนชื่อ Main Influencer</h4>
      <div class="flex flex-col space-y-2">
        <label for="newName" class="font-medium">ชื่อใหม่</label>
        <input v-model="selectedInfluencer.name" type="text" id="newName" placeholder="Enter the new name" class="px-4 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring focus:border-blue-500">
        <label for="newCode" class="font-medium">รหัสใหม่</label>
        <input v-model="selectedInfluencer.code" type="text" id="newCode" placeholder="Enter the new code" class="px-4 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring focus:border-blue-500">
        <label for="newDescription" class="font-medium">คำอธิบาย</label>
        <textarea v-model="selectedInfluencer.description" id="newDescription" placeholder="Enter the new description" class="px-4 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring focus:border-blue-500"></textarea>
        <!-- Checkbox for visibility using v-model -->
        <div class="flex items-center space-x-2">
          <input v-model="selectedInfluencer.visible" type="checkbox" id="checkbox">
          <label for="checkbox" class="font-medium">Visible</label>
        </div>
      </div>
      <div class="flex justify-end mt-6 space-x-4">
        <button @click="renameInfluencer(selectedInfluencer)" class="px-6 py-2 text-sm font-medium text-white bg-blue-500 rounded-sm hover:bg-blue-600">Rename</button>
        <button @click="closeRenameDialog" class="px-6 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">Cancel</button>
      </div>
    </div>
  </div>

  <!-- Confirmation Popup for Main Influencers -->
  <div v-if="showConfirmationPopup" class="fixed inset-0 flex items-center justify-center z-50">
    <div class="absolute inset-0 bg-black opacity-75"></div>
    <div class="bg-white rounded p-5 z-10">
      <h4 class="text-xl font-semibold mb-4">Confirm Remove Main Influencer</h4>
      <p>Are you sure you want to remove the main influencer?</p>
      <div class="flex justify-end mt-6 space-x-4">
        <button @click="confirmRemoveMainInfluencer" class="px-6 py-2 text-sm font-medium text-white bg-red-500 rounded-sm">Remove</button>
        <button @click="cancelRemoveMainInfluencer" class="px-6 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">Cancel</button>
      </div>
    </div>
  </div>
</template>

  
  <script>
  import storageManager from '@/plugins/storage';
  import InfluencerDetail from './InfluencerDetail.vue';
  export default {
    name: 'InfluencerList',
  
    components: {
      InfluencerDetail
    },
    props: {
        eventDetails: {
        type: Object,
        required: true
        }
    },
    data() {
      return {
        session: storageManager.get('session'),
        configs: storageManager.get('configs'),
        influencers: [],
        uniqueIdCounter: 5, // Unique ID counter for influencers
        showRenameDialog: false,
        selectedInfluencer: null,
        showMoveDialog: false,
        selectedInfluencerParent: null,
        showConfirmationPopup: false,
        influencerToRemove: null,
        showSubInfluencerConfirmationPopup: false,
        subInfluencerToRemove: null,
        selectedInfluencerForDetails: null
      };
    },
  
    computed: {
      flattenedInfluencers() {
        return this.flattenInfluencers(this.influencers);
      },
  
      getMainInfluencers() {
        return this.influencers.filter((influencerItem) => influencerItem.type === 'main');
      },
    },
  
    async mounted() {
      try {
        console.log("Event Details:", this.eventDetails);
        await this.getInfluencerData();
      } catch (error) {
        console.log(error);
      }
    },
  
    methods: {
      showInfluencerDetails(influencerItem) {
        this.selectedInfluencerForDetails = influencerItem; // Set the selected influencer for the detail view
      },
      async getInfluencerData() {
        try {
          const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/vote_influencer/query", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'client-token-key': this.configs.key },
            body: JSON.stringify({
              method: 'find',
              args: [
                {
                  unit: this.session.current._id,
                  eventID: this.eventDetails._id
                },
              ],
              paging: { page: 1, limit: 200 },
            }),
          });
  
          if (resAPI.ok) {
            const finalRes = await resAPI.json();
            this.influencers = finalRes.data;
          }
        } catch (error) {
          console.error(error);
        }
      },
  
      async addInfluencer(mode, influencerItem) {
        try {
          const requestData = {
            unit: this.session.current._id,
            name: 'New Influencer',
            code: 'influencer-code',
            description: 'Description for New Influencer',
            type: 'main', // Default type is 'main'
            eventID:this.eventDetails._id,
            visible: true,
            order: 0,
          };
  
          if (mode === "sub") {
            requestData.type = 'sub';
            requestData.parent = influencerItem._id;
          }
  
          const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/vote_influencer/", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'client-token-key': this.configs.key },
            body: JSON.stringify({
              data: requestData,
              options: {},
            }),
          });
  
          if (resAPI.ok) {
            await this.getInfluencerData();
          }
        } catch (error) {
          console.error(error);
        }
      },
  
      async updateInfluencer(influencerItem) {
        try {
          const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/vote_influencer/" + influencerItem._id, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'client-token-key': this.configs.key },
            body: JSON.stringify({
              data: {
                name: influencerItem.name,
                code: influencerItem.code,
                description: influencerItem.description,
                order: influencerItem.order,
                visible: influencerItem.visible,
              },
              options: {},
            }),
          });
  
          if (resAPI.ok) {
            await this.getInfluencerData();
          }
        } catch (error) {
          console.error(error);
        }
      },
  
      async deleteInfluencer(influencerItem) {
        try {
          const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/vote_influencer/" + influencerItem._id, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json', 'client-token-key': this.configs.key },
          });
  
          if (resAPI.ok) {
            await this.getInfluencerData();
          }
        } catch (error) {
          console.error(error);
        }
      },
  
      getMainInfluencerIndex(influencerItem) {
        const mainInfluencers = this.flattenedInfluencers.filter((inf) => inf.type === 'main');
        return mainInfluencers.findIndex((inf) => inf._id === influencerItem._id) + 1;
      },
  
      flattenInfluencers(influencers) {
        return influencers.reduce((result, influencerItem) => {
          result.push(influencerItem);
          if (influencerItem.type === 'main') {
            const subInfluencers = this.influencers.filter((subInfluencer) => subInfluencer.type === 'sub' && subInfluencer.parent === influencerItem._id);
            result.push(...subInfluencers);
          }
          return result;
        }, []);
      },
  

  
      moveMainInfluencerUp(influencerItem) {
        const index = this.influencers.findIndex((inf) => inf._id === influencerItem._id && inf.type === 'main');
        if (index > 0) {
          const movedInfluencer = this.influencers.splice(index, 1)[0];
          this.influencers.splice(index - 1, 0, movedInfluencer);
        }
      },
  
      moveMainInfluencerDown(influencerItem) {
        const index = this.influencers.findIndex((inf) => inf._id === influencerItem._id && inf.type === 'main');
        if (index < this.influencers.length - 1) {
          const movedInfluencer = this.influencers.splice(index, 1)[0];
          this.influencers.splice(index + 1, 0, movedInfluencer);
        }
      },
  
      async removeMainInfluencerConfirmation(influencerItem) {
        this.influencerToRemove = influencerItem;
        this.showConfirmationPopup = true;
      },
  
      async confirmRemoveMainInfluencer() {
        try {
          const influencerItem = this.influencerToRemove;
          const index = this.influencers.findIndex((inf) => inf._id === influencerItem._id && inf.type === 'main');
  
          if (index !== -1) {
            const mainInfluencer = this.influencers.splice(index, 1)[0];
  
            const subInfluencers = this.influencers.filter((inf) => inf.type === 'sub' && inf.parent === mainInfluencer._id);
            this.influencers = this.influencers.filter((inf) => inf.type !== 'sub' || inf.parent !== mainInfluencer._id);
  
            for (const subInfluencer of subInfluencers) {
              await this.deleteInfluencer(subInfluencer);
            }
  
            await this.deleteInfluencer(influencerItem);
          }
  
          this.influencerToRemove = null;
          this.showConfirmationPopup = false;
        } catch (error) {
          console.error(error);
        }
      },
      openRenameDialog(influencerItem) {
        this.selectedInfluencer = influencerItem;
        this.showRenameDialog = true;
      },
  
      async renameInfluencer(influencerItem) {
        try {
          await this.updateInfluencer(influencerItem);
          this.selectedInfluencer = null;
          this.showRenameDialog = false;
        } catch (error) {
          console.error(error);
        }
      },
  
      closeRenameDialog() {
        this.selectedInfluencer = null;
        this.showRenameDialog = false;
      },
  
      openMoveDialog(influencerItem) {
        this.selectedInfluencer = influencerItem;
        this.selectedInfluencerParent = null;
        this.showMoveDialog = true;
      },
  
      async updateSelectedInfluencerParent() {
        try {
          const influencerItem = this.selectedInfluencer;
          const parent = this.selectedInfluencerParent;
  
          if (parent) {
            influencerItem.parent = parent;
            await this.updateInfluencer(influencerItem);
          }
  
          this.selectedInfluencer = null;
          this.selectedInfluencerParent = null;
          this.showMoveDialog = false;
        } catch (error) {
          console.error(error);
        }
      },
  
      closeMoveDialog() {
        this.selectedInfluencer = null;
        this.selectedInfluencerParent = null;
        this.showMoveDialog = false;
      },
    },
  };
  </script>
  
  <style scoped>
  /* Add your custom styles here */
  </style>
  