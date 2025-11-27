<template>
    <Subhead
      :navigation="[
        {
          name: 'ย้อนกลับ',
          link: '/',
          style: 'chevron-left',
          class: 'default-btn',
          visible: true,
          type: 'button',
        },
        {
          name: 'เพิ่มเหตุการณ์',
          function: 'addEvent',
          style: 'plus',
          class: 'primary-btn',
          visible: true,
          type: 'button',
        },
      ]"
      @addEvent="addEvent('main')"
    />
    <div class="mx-auto max-w-7xl px-4 mt-5 mb-8 sm:px-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
        <template v-for="(event) in flattenedEvents">
          <div v-if="event.type === 'main'" :key="event._id" class="bg-white p-5 rounded-sm shadow-sm">
            <div class="flex items-center justify-between">
                <h3
                class="text-md font-semibold cursor-pointer text-blue-500 hover:underline"
                @click="$router.push(`/vote/event/${event._id}`)"
                >
                {{ getMainEventIndex(event) }}.{{ event.name }}
                </h3>

            </div>
            <p class="text-xs text-gray-500 mt-1">{{ event.code }}</p>
            <p class="text-sm text-gray-600 mt-1">{{ event.description }}</p>
            <ul class="list-disc ml-8 space-y-4 mt-4">
              <li v-for="subEvent in getSubEvents(event._id)" :key="subEvent._id" class="border-b border-gray-200 py-2">
                <div class="flex items-center justify-between">
                  <h4 class="text-md font-medium">{{ subEvent.name }}</h4>
                </div>
                <p class="text-xs text-gray-500 mt-1">{{ subEvent.code }}</p>
                <p class="text-sm text-gray-600 mt-1">{{ subEvent.description }}</p>
                <div class="space-x-2">
                  <button @click="openRenameDialog(subEvent)" class="text-sm text-gray-500 hover:text-gray-700">
                    <font-awesome-icon :icon="['fas','edit']" class="pr-2"/>แก้ไข
                  </button>
                  <button @click="openMoveDialog(subEvent)" class="text-sm text-gray-500 hover:text-gray-700">
                    <font-awesome-icon :icon="['fas','arrows-alt']" class="pr-2 pl-2"/>ย้าย
                  </button>
                  <button @click="removeSubEventConfirmation(subEvent)" class="text-sm text-red-500 hover:text-red-700">
                    <font-awesome-icon :icon="['fas','trash']" class="pr-2 pl-2"/>ลบ
                  </button>
                </div>
              </li>
            </ul>
            <div class="mt-4 flex justify-between">
              <div class="space-x-2">
                <button @click="moveMainEventUp(event)" class="text-sm text-gray-500 hover:text-gray-700">
                  <font-awesome-icon :icon="['fas','chevron-up']" class="pr-2 pl-2"/>
                </button>
                <button @click="moveMainEventDown(event)" class="text-sm text-gray-500 hover:text-gray-700">
                  <font-awesome-icon :icon="['fas','chevron-down']" class="pr-2 pl-2"/>
                </button>
              </div>
              <div class="space-x-2">
                <button @click="openRenameDialog(event)" class="text-sm text-gray-500 hover:text-gray-700">
                  <font-awesome-icon :icon="['fas','edit']" class="pl-2"/> เปลี่ยนชื่อ
                </button>
                <button @click="addEvent('sub', event)" class="text-sm text-gray-500 hover:text-gray-700">
                  <font-awesome-icon :icon="['fas','plus']" class="pl-2"/> เหตุการณ์ย่อย
                </button>
                <button @click="removeMainEventConfirmation(event)" class="text-sm text-red-500 hover:text-red-700">
                  <font-awesome-icon :icon="['fas','trash']" class="pl-2"/> ลบ
                </button>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  
    <!-- Rename Dialog -->
    <div v-if="showRenameDialog" class="fixed inset-0 flex items-center justify-center z-50">
      <div class="absolute inset-0 bg-black opacity-75"></div>
      <div class="bg-white rounded p-5 z-10">
        <h4 class="text-xl font-semibold mb-4">เปลี่ยนชื่อ {{ selectedEvent.type === 'main' ? 'Main Event' : 'Sub Event' }}</h4>
        <div class="flex flex-col space-y-2">
          <label for="newName" class="font-medium">ชื่อใหม่</label>
          <input v-model="selectedEvent.name" type="text" id="newName" placeholder="Enter the new name" class="px-4 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring focus:border-blue-500">
          <label for="newCode" class="font-medium">รหัสใหม่</label>
          <input v-model="selectedEvent.code" type="text" id="newCode" placeholder="Enter the new code" class="px-4 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring focus:border-blue-500">
          <label for="newDescription" class="font-medium">คำอธิบาย</label>
          <textarea v-model="selectedEvent.description" id="newDescription" placeholder="Enter the new description" class="px-4 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring focus:border-blue-500"></textarea>
          <!-- Checkbox for visibility using v-model -->
          <div class="flex items-center space-x-2">
            <input v-model="selectedEvent.visible" type="checkbox" id="checkbox">
            <label for="checkbox" class="font-medium">Visible</label>
          </div>
        </div>
        <div class="flex justify-end mt-6 space-x-4">
          <button @click="renameEvent(selectedEvent)" class="px-6 py-2 text-sm font-medium text-white bg-blue-500 rounded-sm hover:bg-blue-600">Rename</button>
          <button @click="closeRenameDialog" class="px-6 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">Cancel</button>
        </div>
      </div>
    </div>
  
    <!-- Move Dialog -->
    <div v-if="showMoveDialog" class="fixed inset-0 flex items-center justify-center z-50">
      <div class="absolute inset-0 bg-black opacity-75"></div>
      <div class="bg-white rounded p-5 z-10">
        <h4 class="text-xl font-semibold mb-4">Move Event</h4>
        <div class="flex flex-col space-y-4">
          <label for="selectedParent" class="font-medium">Select New Parent Event</label>
          <select v-model="selectedEventParent" id="selectedParent" class="px-4 py-2 border border-gray-300 rounded-sm">
            <option value="">Select a main event</option>
            <option v-for="mainEvent in getMainEvents" :key="mainEvent._id" :value="mainEvent._id">{{ mainEvent.name }}</option>
          </select>
        </div>
        <div class="flex justify-end mt-6 space-x-4">
          <button @click="updateSelectedEventParent" class="px-6 py-2 text-sm font-medium text-white bg-blue-500 rounded-sm">Move</button>
          <button @click="closeMoveDialog" class="px-6 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">Cancel</button>
        </div>
      </div>
    </div>
  
    <!-- Confirmation Popup for Main Events -->
    <div v-if="showConfirmationPopup" class="fixed inset-0 flex items-center justify-center z-50">
      <div class="absolute inset-0 bg-black opacity-75"></div>
      <div class="bg-white rounded p-5 z-10">
        <h4 class="text-xl font-semibold mb-4">Confirm Remove Main Event</h4>
        <p>Are you sure you want to remove the main event?</p>
        <div class="flex justify-end mt-6 space-x-4">
          <button @click="confirmRemoveMainEvent" class="px-6 py-2 text-sm font-medium text-white bg-red-500 rounded-sm">Remove</button>
          <button @click="cancelRemoveMainEvent" class="px-6 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">Cancel</button>
        </div>
      </div>
    </div>
  
    <!-- Confirmation Popup for Sub Events -->
    <div v-if="showSubEventConfirmationPopup" class="fixed inset-0 flex items-center justify-center z-50">
      <div class="absolute inset-0 bg-black opacity-75"></div>
      <div class="bg-white rounded p-5 z-10">
        <h4 class="text-xl font-semibold mb-4">Confirm Remove Sub Event</h4>
        <p>Are you sure you want to remove the sub event?</p>
        <div class="flex justify-end mt-6 space-x-4">
          <button @click="confirmRemoveSubEvent" class="px-6 py-2 text-sm font-medium text-white bg-red-500 rounded-sm">Remove</button>
          <button @click="cancelRemoveSubEvent" class="px-6 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">Cancel</button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import storageManager from '@/plugins/storage';
  import Subhead from '@/interface/template/outline/Subhead.vue';
  
  export default {
    name: 'EventList',
  
    components: {
      Subhead,
    },
  
    data() {
      return {
        session: storageManager.get('session'),
        configs: storageManager.get('configs'),
        events: [],
        uniqueIdCounter: 5, // Unique ID counter for events
        showRenameDialog: false,
        selectedEvent: null,
        showMoveDialog: false,
        selectedEventParent: null,
        showConfirmationPopup: false,
        eventToRemove: null,
        showSubEventConfirmationPopup: false,
        subEventToRemove: null,
      };
    },
  
    computed: {
      flattenedEvents() {
        return this.flattenEvents(this.events);
      },
  
      getMainEvents() {
        return this.events.filter((event) => event.type === 'main');
      },
    },
  
    async mounted() {
      try {
        await this.getEventData();
      } catch (error) {
        console.log(error);
      }
    },
  
    methods: {
      async getEventData() {
        try {
          const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/vote_event/query", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'client-token-key': this.configs.key },
            body: JSON.stringify({
              method: 'find',
              args: [
                { unit: this.session.current._id },
              ],
              paging: { page: 1, limit: 200 },
            }),
          });
  
          if (resAPI.ok) {
            const finalRes = await resAPI.json();
            this.events = finalRes.data;
          }
        } catch (error) {
          console.error(error);
        }
      },
  
      async addEvent(mode, event) {
        try {
          const requestData = {
            unit: this.session.current._id,
            name: 'New Event',
            code: 'event-code',
            description: 'Description for New Event',
            type: 'main', // Default type is 'main'
            visible: true,
            order: 0,
          };
  
          if (mode === "sub") {
            requestData.type = 'sub';
            requestData.parent = event._id;
          }
  
          const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/vote_event/", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'client-token-key': this.configs.key },
            body: JSON.stringify({
              data: requestData,
              options: {},
            }),
          });
  
          if (resAPI.ok) {
            await this.getEventData();
          }
        } catch (error) {
          console.error(error);
        }
      },
  
      async updateEvent(event) {
        try {
          const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/vote_event/" + event._id, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'client-token-key': this.configs.key },
            body: JSON.stringify({
              data: {
                name: event.name,
                code: event.code,
                description: event.description,
                order: event.order,
                visible: event.visible,
              },
              options: {},
            }),
          });
  
          if (resAPI.ok) {
            await this.getEventData();
          }
        } catch (error) {
          console.error(error);
        }
      },
  
      async deleteEvent(event) {
        try {
          const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/vote_event/" + event._id, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json', 'client-token-key': this.configs.key },
          });
  
          if (resAPI.ok) {
            await this.getEventData();
          }
        } catch (error) {
          console.error(error);
        }
      },
  
      getMainEventIndex(event) {
        const mainEvents = this.flattenedEvents.filter((ev) => ev.type === 'main');
        return mainEvents.findIndex((ev) => ev._id === event._id) + 1;
      },
  
      flattenEvents(events) {
        return events.reduce((result, event) => {
          result.push(event);
          if (event.type === 'main') {
            const subEvents = this.events.filter((subEvent) => subEvent.type === 'sub' && subEvent.parent === event._id);
            result.push(...subEvents);
          }
          return result;
        }, []);
      },
  
      getSubEvents(parentId) {
        return this.events.filter((event) => event.type === 'sub' && event.parent === parentId);
      },
  
      moveMainEventUp(event) {
        const index = this.events.findIndex((e) => e._id === event._id && e.type === 'main');
        if (index > 0) {
          const movedEvent = this.events.splice(index, 1)[0];
          this.events.splice(index - 1, 0, movedEvent);
        }
      },
  
      moveMainEventDown(event) {
        const index = this.events.findIndex((e) => e._id === event._id && e.type === 'main');
        if (index < this.events.length - 1) {
          const movedEvent = this.events.splice(index, 1)[0];
          this.events.splice(index + 1, 0, movedEvent);
        }
      },
  
      async removeMainEventConfirmation(event) {
        this.eventToRemove = event;
        this.showConfirmationPopup = true;
      },
  
      async confirmRemoveMainEvent() {
        try {
          const event = this.eventToRemove;
          const index = this.events.findIndex((e) => e._id === event._id && e.type === 'main');
  
          if (index !== -1) {
            const mainEvent = this.events.splice(index, 1)[0];
  
            const subEvents = this.events.filter((e) => e.type === 'sub' && e.parent === mainEvent._id);
            this.events = this.events.filter((e) => e.type !== 'sub' || e.parent !== mainEvent._id);
  
            for (const subEvent of subEvents) {
              await this.deleteEvent(subEvent);
            }
  
            await this.deleteEvent(event);
          }
  
          this.eventToRemove = null;
          this.showConfirmationPopup = false;
        } catch (error) {
          console.error(error);
        }
      },
  
      async removeSubEventConfirmation(subEvent) {
        this.subEventToRemove = subEvent;
        this.showSubEventConfirmationPopup = true;
      },
  
      async confirmRemoveSubEvent() {
        try {
          const subEvent = this.subEventToRemove;
          const index = this.events.findIndex((e) => e._id === subEvent._id && e.type === 'sub');
  
          if (index !== -1) {
            this.events.splice(index, 1);
            await this.deleteEvent(subEvent);
          }
  
          this.subEventToRemove = null;
          this.showSubEventConfirmationPopup = false;
        } catch (error) {
          console.error(error);
        }
      },
  
      openRenameDialog(event) {
        this.selectedEvent = event;
        this.showRenameDialog = true;
      },
  
      async renameEvent(event) {
        try {
          await this.updateEvent(event);
          this.selectedEvent = null;
          this.showRenameDialog = false;
        } catch (error) {
          console.error(error);
        }
      },
  
      closeRenameDialog() {
        this.selectedEvent = null;
        this.showRenameDialog = false;
      },
  
      openMoveDialog(event) {
        this.selectedEvent = event;
        this.selectedEventParent = null;
        this.showMoveDialog = true;
      },
  
      async updateSelectedEventParent() {
        try {
          const event = this.selectedEvent;
          const parent = this.selectedEventParent;
  
          if (parent) {
            event.parent = parent;
            await this.updateEvent(event);
          }
  
          this.selectedEvent = null;
          this.selectedEventParent = null;
          this.showMoveDialog = false;
        } catch (error) {
          console.error(error);
        }
      },
  
      closeMoveDialog() {
        this.selectedEvent = null;
        this.selectedEventParent = null;
        this.showMoveDialog = false;
      },
    },
  };
  </script>
  
  <style scoped>
  /* Add your custom styles here */
  </style>
  