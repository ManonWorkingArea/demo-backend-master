<template>
  <Framework :loader="loader" :navigation="navigationData" :title="title" @callFunction="prepareAddCalendar">
    <div class="mx-auto bg-white p-4 mt-4 rounded-lg shadow">
      <h2 class="text-xl font-bold mb-4">{{title}}</h2>

      <div class="folder-tabs">
        <ul class="flex">
          <li class="mr-1">
            <a
              class="inline-block py-2 px-4 rounded-t-md text-gray-600 hover:text-gray-800 border bg-gray-200"
              :class="{ 'active-tab': selectedTab === 'detail' }"
              @click="selectedTab = 'detail'"
              >Detail</a
            >
          </li>
          <li class="mr-1">
            <a
              class="inline-block py-2 px-4 rounded-t-md text-gray-600 hover:text-gray-800 border bg-gray-200"
              :class="{ 'active-tab': selectedTab === 'package' }"
              @click="selectedTab = 'package'"
              >Package</a
            >
          </li>
          <li class="mr-1">
            <a
              class="inline-block py-2 px-4 rounded-t-md text-gray-600 hover:text-gray-800  border bg-gray-200"
              :class="{ 'active-tab': selectedTab === 'gift' }"
              @click="selectedTab = 'gift'"
              >Gift</a
            >
          </li>
          <li class="mr-1">
            <a
              class="inline-block py-2 px-4 rounded-t-md text-gray-600 hover:text-gray-800 border bg-gray-200"
              :class="{ 'active-tab': selectedTab === 'influencer' }"
              @click="selectedTab = 'influencer'"
              >Influencer</a
            >
          </li>
        </ul>
      </div>

      <div class="tab-content bg-white border border-t-0 rounded-b-lg">
        <div v-if="selectedTab === 'detail'">
          <h3 class="text-lg font-semibold">Event Detail</h3>
          <!-- Add detail content here -->
        </div>
        <div v-if="selectedTab === 'package'">
          <Package :event-details="eventDetails" />
        </div>
        <div v-if="selectedTab === 'gift'">
          <Gift :event-details="eventDetails" />
        </div>
        <div v-if="selectedTab === 'influencer'">
          <Influencer :event-details="eventDetails" />
        </div>
      </div>
    </div>
  </Framework>
</template>



  
  <script>
  import { translate } from '@/plugins/language.js';
  import storageManager from '@/plugins/storage';
  import Framework from '@/utils/Framework/Body.vue';
  import Influencer from './Influencer.vue';
  import Gift from './Gift.vue';
  import Package from './Package.vue';
  import requestClient from '@/plugins/requestClient';
  const Request = new requestClient(false);

  export default {
    name: 'EventDetail',
    components: {
        Framework,
        Influencer,
        Gift,
        Package
    },
    data() {
      return {
        loader: false,
        session:storageManager.get('session'),
        configs:storageManager.get("configs"),
        selectedTab: 'detail', // Default selected tab
        title:'Event Detail',
        navigationData: [
          {
            name: this.translate('general-back'),
            link: '/vote/event',
            style: 'chevron-left',
            class: 'default-btn',
            visible: true,
            type: 'button',
          },
        ],
      };
    },
    mounted() {
      const eventId = this.$route.params.id;
      this.fetchEventDetails(eventId);
    },
    methods: {
        translate,
        async fetchEventDetails(eventId) {
            try {
              const resAPI = await Request.GET(`vote_event/${eventId}`, this.configs.key);
              const eventDetails = resAPI.data;
              this.eventDetails = eventDetails;
              console.log(eventDetails);
              this.title = eventDetails.name;
              this.loader = true;
            } catch (error) {
              console.error("Error fetching event details:", error);
              this.loader = false;
            }
        },
    },
  };
  </script>

<style scoped>
.folder-tabs ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
  background: #4a5464;
  padding-left: 10px;
  padding-top: 10px;
}

.folder-tabs li {
  display: inline-block;
}

.folder-tabs a {
  cursor: pointer;
  
  padding: 12px 16px; /* Default padding for normal tabs */
  background-color: #f3f4f6; /* Normal tab background */
  border: 1px solid #e2e8f0;
  color: #4a5568; /* Normal tab text color */
  border-left: 1px solid #e2e8f0;
  border-right: 1px solid #e2e8f0;
  border-top: 1px solid #e2e8f0;
  border-bottom: none; /* Remove bottom border for active tab */

  z-index: 1;
  position: relative;
}

.folder-tabs a.active-tab {
  background-color: #fff; /* Active tab background color */
  color: #4a90e2; /* Active tab text color */
  padding: 12px 16px;
  border-left: 1px solid #e2e8f0;
  border-right: 1px solid #e2e8f0;
  border-top: 1px solid #e2e8f0;
  border-bottom: 1px solid #fff;
  margin-bottom: -1px; /* Pull the active tab down to close the gap */
  position: relative;
  z-index: 4; /* Ensure active tab stays above other elements */
}

.folder-tabs a:hover {

}

.tab-content {
  background-color: #fff;
  border: 1px solid #e2e8f0;
  border-top: 1px solid #e2e8f0;

  -webkit-box-shadow: 0px -6px 6px -5px rgba(0,0,0,0.16);
  -moz-box-shadow: 0px -6px 6px -5px rgba(0,0,0,0.16);
  box-shadow: 0px -6px 6px -5px rgba(0,0,0,0.16);

  z-index: 2;
  position: relative;
}
</style>

