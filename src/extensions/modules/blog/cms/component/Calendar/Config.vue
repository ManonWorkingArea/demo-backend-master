<template>
    <div class="fixed inset-0 flex items-center justify-center z-10">
      <div class="fixed inset-0 bg-black opacity-50" @click="closeCalendarConfig"></div>
      <div class="bg-white rounded-sm p-4 shadow-sm max-w-lg relative">
        <h2 class="text-lg font-bold mb-4">{{ isEditing ? 'Edit Calendar' : 'Add Calendar' }}</h2>
        <form @submit.prevent="saveCalendar">
          <!-- Title -->
          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2">Title</label>
            <input
              v-model="localCalendarData.title"
              class="border rounded w-full py-2 px-3 text-gray-700"
              type="text"
            />
          </div>
  
          <!-- Description -->
          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2">Description</label>
            <textarea
              v-model="localCalendarData.description"
              class="border rounded w-full py-2 px-3 text-gray-700"
            ></textarea>
          </div>
  
          <!-- 2-column grid layout for Type and Color -->
          <div class="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Type -->
            <div>
              <label class="block text-gray-700 text-sm font-bold mb-2">Type</label>
              <select v-model="localCalendarData.type" class="border rounded w-full py-2 px-3 text-gray-700">
                <option value="default">Default</option>
                <option value="work">Work</option>
                <option value="personal">Personal</option>
                <option value="holiday">Holiday</option>
              </select>
            </div>
  
            <!-- Color -->
            <div>
              <label class="block text-gray-700 text-sm font-bold mb-2">Color</label>
              <input
                v-model="localCalendarData.color"
                class="border rounded w-full py-2 px-3 text-gray-700"
                type="color"
              />
            </div>
          </div>
  
          <!-- Default View and Timezone -->
          <div class="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-gray-700 text-sm font-bold mb-2">Default View</label>
              <select v-model="localCalendarData.viewType" class="border rounded w-full py-2 px-3 text-gray-700">
                <option value="day">Day</option>
                <option value="week">Week</option>
                <option value="month">Month</option>
                <option value="agenda">Agenda</option>
              </select>
            </div>
  
            <div>
              <label class="block text-gray-700 text-sm font-bold mb-2">Timezone</label>
              <select v-model="localCalendarData.timezone" class="border rounded w-full py-2 px-3 text-gray-700">
                <option value="UTC">UTC</option>
                <option value="America/New_York">Eastern Time (US & Canada)</option>
                <option value="Europe/London">London</option>
              </select>
            </div>
          </div>
  
          <!-- Default Reminders -->
          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2">Default Reminders (minutes)</label>
            <div class="grid grid-cols-3 gap-2">
              <input
                v-for="(reminder, index) in localCalendarData.defaultReminders"
                :key="index"
                v-model.number="localCalendarData.defaultReminders[index]"
                class="border rounded w-full py-2 px-3 text-gray-700"
                type="number"
                placeholder="e.g., 15"
              />
            </div>
            <button
              type="button"
              class="text-blue-500 hover:underline mt-2"
              @click="localCalendarData.defaultReminders.push('')"
            >
              + Add Reminder
            </button>
          </div>
  
          <!-- Sharing Options -->
          <div class="mb-4" v-if="localCalendarData.sharingOptions">
            <label class="block text-gray-700 text-sm font-bold mb-2">Sharing Options</label>
            <input
              v-model="localCalendarData.sharingOptions.public"
              type="checkbox"
              class="mr-2"
            />
            Make Calendar Public
  
            <div v-if="!localCalendarData.sharingOptions.public" class="mt-2">
              <label class="block text-gray-700 text-sm font-bold mb-2">Shared With</label>
              <input
                v-for="(user, index) in localCalendarData.sharingOptions.sharedWith"
                :key="index"
                v-model="localCalendarData.sharingOptions.sharedWith[index]"
                class="border rounded w-full py-2 px-3 text-gray-700 mb-2"
                type="text"
                placeholder="Enter user ID"
              />
              <button
                type="button"
                class="text-blue-500 hover:underline mt-2"
                @click="localCalendarData.sharingOptions.sharedWith.push('')"
              >
                + Add User
              </button>
            </div>
          </div>
  
          <div class="flex justify-end">
            <button type="submit" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
              Save
            </button>
            <button
              @click="closeCalendarConfig"
              class="ml-2 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      calendarData: Object,
      isEditing: Boolean,
    },
    data() {
      return {
        localCalendarData: { ...this.calendarData } // Create a local copy of the prop
      };
    },
    methods: {
      saveCalendar() {
        this.$emit('saveCalendar', this.localCalendarData); // Emit the local data to the parent
      },
      closeCalendarConfig() {
        this.$emit('closeCalendarConfig');
      },
    },
  };
  </script>
  
  <style scoped>
  /* Add your styles here */
  </style>
  