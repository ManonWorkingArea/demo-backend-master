<template>
    <div>
      <div v-if="!scheduleData.length" class="flex justify-center items-center py-10">
        <div class="flex space-x-4">
          <button
            @click="addScheduleType('table')"
            type="button"
            class="bg-blue-600 text-white px-4 py-2 rounded-md shadow-sm hover:bg-blue-700"
          >
            Add Table Schedule
          </button>
          <button
            @click="addScheduleType('image')"
            type="button"
            class="bg-green-600 text-white px-4 py-2 rounded-md shadow-sm hover:bg-green-700"
          >
            Add Image Schedule
          </button>
        </div>
      </div>
  
      <div v-else>
        <div class="px-4 py-5 sm:px-6 relative">
          <h2 id="schedule-title" class="text-lg font-bold text-gray-900">
            <font-awesome-icon :icon="['fas','calendar']" class="text-black mr-2" />
            Training Schedule
          </h2>
          <span class="absolute top-4 right-4">
            <button
              @click="openHeaderModal"
              type="button"
              class="ml-3 inline-flex items-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              <font-awesome-icon :icon="['fas','plus-circle']" class="text-gray-200 pr-3" /> Add Header
            </button>
            <button
              @click="addItem"
              type="button"
              class="ml-3 inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <font-awesome-icon :icon="['fas','plus']" class="text-gray-200 pr-3" /> Add Item
            </button>
          </span>
        </div>
        <div class="border-t border-gray-200 px-4 py-3 sm:px-3 bg-blue-50">
          <div class="overflow-hidden">
            <table class="table-auto w-full border-collapse border border-gray-200">
              <thead>
                <tr class="bg-gray-100">
                  <th v-for="(header, index) in tableHeaders" :key="index" class="border border-gray-300 px-4 py-2">
                    {{ header.name }}
                    <button @click="removeHeader(index)" type="button" class="ml-2 text-red-600 hover:text-red-800">
                      <font-awesome-icon :icon="['fas','times']" />
                    </button>
                  </th>
                  <th class="border border-gray-300 px-4 py-2 w-48">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in currentSchedule.item" :key="index" class="bg-white">
                  <td
                    v-for="(header, headerIndex) in tableHeaders"
                    :key="headerIndex"
                    class="border border-gray-300 px-4 py-2"
                  >
                    <div v-if="item.isEditing">
                      <component
                        :is="header.type === 'textarea' ? 'CustomTextarea' : 'CustomInput'"
                        v-model="item[header.name.toLowerCase()]"
                      ></component>
                    </div>
                    <div v-else>
                      {{ item[header.name.toLowerCase()] || '-' }}
                    </div>
                  </td>
                  <td class="border border-gray-300 px-4 py-2 w-48">
                    <button v-if="item.isEditing" @click="saveItem(item)" class="text-blue-600 font-medium"><font-awesome-icon :icon="['fas','save']" class="text-black" /></button>
                    <button v-else @click="editItem(item)" class="text-indigo-600 font-medium"><font-awesome-icon :icon="['fas','pencil']" class="text-black" /></button>

                    <button @click="moveItemUp(index)" class="text-blue-500 font-medium" :disabled="index === 0">
                        <font-awesome-icon :icon="['fas','caret-up']" class="text-black" />
                    </button>
                    <button @click="moveItemDown(index)" class="text-blue-500 font-medium" :disabled="index === currentSchedule.item.length - 1">
                        <font-awesome-icon :icon="['fas','caret-down']" class="text-black" />
                    </button>
                    <button @click="cloneItem(index)" class="text-green-500 font-medium"><font-awesome-icon :icon="['fas','clone']" class="text-black" /></button>
                    <button @click="deleteItem(index)" class="text-red-600 font-medium"><font-awesome-icon :icon="['fas','trash']" class="text-black" /></button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
  
      <!-- Modal for Adding Header -->
      <div v-if="isHeaderModalOpen" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <div class="bg-white rounded-lg shadow-lg p-6 w-96">
          <h3 class="text-lg font-bold mb-4">Add New Header</h3>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700">Header Name</label>
            <input v-model="newHeader.name" type="text" class="w-full border border-gray-300 rounded-md px-2 py-1" />
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700">Header Type</label>
            <select v-model="newHeader.type" class="w-full border border-gray-300 rounded-md px-2 py-1">
              <option value="input">Input</option>
              <option value="textarea">Textarea</option>
            </select>
          </div>
          <div class="flex justify-end">
            <button @click="closeHeaderModal" class="bg-gray-300 px-4 py-2 rounded-md mr-2">Cancel</button>
            <button @click="addHeaderWithApi" class="bg-green-600 text-white px-4 py-2 rounded-md">Add</button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import storageManager from '@/plugins/storage';
  import CustomInput from "@/extensions/modules/elearning/lesson/component/course/resource/plugin/CustomInput.vue";
  import CustomTextarea from "@/extensions/modules/elearning/lesson/component/course/resource/plugin/CustomTextarea.vue";
  
  export default {
    components: {
      CustomInput,
      CustomTextarea,
    },
    data() {
      return {
        configs: storageManager.get('configs'),
        session: storageManager.get('session'),
        tableHeaders: [],
        scheduleData: [],
        isHeaderModalOpen: false,
        dataItem: this.$route.params.id,
        newHeader: {
          name: "",
          type: "input",
        },
        currentSchedule: null,
      };
    },
    async mounted() {
        try {
            this.scheduleData = await this.getData() || [];
            this.currentSchedule = this.scheduleData[0] || null;
            if (this.currentSchedule) {
                this.buildTableHeadersFromSchedule();
            }
        } catch (error) {
            console.error("Error fetching schedule data:", error);
        }
    },
    methods: {
        buildTableHeadersFromSchedule() {
            if (this.currentSchedule && this.currentSchedule.head) {
            this.tableHeaders = Object.keys(this.currentSchedule.head).map(key => ({
                name: key.charAt(0).toUpperCase() + key.slice(1), // Capitalize the header name
                type: this.currentSchedule.head[key].type || "input", // Use the type from the head
            }));
            }
        },
      async getData() {
        try {
          const response = await this.$Request.POST(
            `schedule/query`,
            {
              method: 'find',
              args: [{ $and: [{ parent: this.session.current._id, courseId: this.dataItem }] }],
            },
            this.configs.key
          );
          return response.data;
        } catch (error) {
          console.error("Error fetching data:", error);
          return null;
        }
      },
      async addScheduleType(type) {
        const newSchedule = {
          type,
          courseId: this.dataItem,
          parent: this.session.current._id,
          head: {},
          item: [],
        };
  
        try {
          const { data, status } = await this.$Request.POST(`schedule`, { data: newSchedule }, this.configs.key);
          if (status === 200) {
            this.scheduleData.push(data);
            this.currentSchedule = data;
            console.log("New schedule added successfully:", data);
          } else {
            console.error("Failed to add new schedule");
          }
        } catch (error) {
          console.error("Error adding new schedule:", error);
        }
      },
      openHeaderModal() {
        this.isHeaderModalOpen = true;
      },
      async addHeaderWithApi() {
        const normalizedHeader = this.newHeader.name.trim();
        if (normalizedHeader && !this.tableHeaders.find(header => header.name === normalizedHeader)) {
            try {
            const updatedHead = { 
                ...this.currentSchedule.head, 
                [normalizedHeader.toLowerCase()]: { type: this.newHeader.type, value: "" }
            };
            const response = await this.$Request.PUT(
                `schedule/${this.currentSchedule._id}`, 
                { data: { head: updatedHead } }, 
                this.configs.key
            );
            if (response.status === 200) {
                this.currentSchedule.head = updatedHead;
                this.tableHeaders.push({ name: normalizedHeader, type: this.newHeader.type });
                this.closeHeaderModal();
            } else {
                console.error("Failed to update header");
            }
            } catch (error) {
            console.error("Error updating header:", error);
            }
        } else {
            alert("Header already exists or name is invalid!");
        }
        },
      async addItem() {
        const newItem = {};
        this.tableHeaders.forEach(header => {
          newItem[header.name.toLowerCase()] = "";
        });
        newItem.isEditing = false;
  
        try {
          const updatedItems = [...this.currentSchedule.item, newItem];
          const response = await this.$Request.PUT(`schedule/${this.currentSchedule._id}`, { data: { item: updatedItems } }, this.configs.key);
          if (response.status === 200) {
            this.currentSchedule.item = updatedItems;
          } else {
            console.error("Failed to add new item");
          }
        } catch (error) {
          console.error("Error adding new item:", error);
        }
      },
      async saveItem(item) {
        try {
          item.isEditing = false;
          const updatedItems = this.currentSchedule.item.map(existingItem =>
            existingItem === item ? { ...item } : existingItem
          );
          const response = await this.$Request.PUT(`schedule/${this.currentSchedule._id}`, { data: { item: updatedItems } }, this.configs.key);
          if (response.status === 200) {
            this.currentSchedule.item = updatedItems;
          } else {
            console.error("Failed to save item");
          }
        } catch (error) {
          console.error("Error saving item:", error);
        }
      },
      async deleteItem(index) {
        try {
          const updatedItems = this.currentSchedule.item.filter((_, idx) => idx !== index);
          const response = await this.$Request.PUT(`schedule/${this.currentSchedule._id}`, { data: { item: updatedItems } }, this.configs.key);
          if (response.status === 200) {
            this.currentSchedule.item = updatedItems;
          } else {
            console.error("Failed to delete item");
          }
        } catch (error) {
          console.error("Error deleting item:", error);
        }
      },
      async removeHeader(index) {
        const headerToRemove = this.tableHeaders[index];
        if (!headerToRemove) return;
  
        const updatedHead = { ...this.currentSchedule.head };
        delete updatedHead[headerToRemove.name.toLowerCase()];
  
        try {
          const response = await this.$Request.PUT(`schedule/${this.currentSchedule._id}`, { data: { head: updatedHead } }, this.configs.key);
          if (response.status === 200) {
            this.currentSchedule.head = updatedHead;
            this.tableHeaders.splice(index, 1);
          } else {
            console.error("Failed to remove header");
          }
        } catch (error) {
          console.error("Error removing header:", error);
        }
      },
      // Move item up
  async moveItemUp(index) {
    if (index > 0) {
      const updatedItems = [...this.currentSchedule.item];
      const temp = updatedItems[index - 1];
      updatedItems[index - 1] = updatedItems[index];
      updatedItems[index] = temp;

      try {
        const response = await this.$Request.PUT(
          `schedule/${this.currentSchedule._id}`,
          { data: { item: updatedItems } },
          this.configs.key
        );
        if (response.status === 200) {
          this.currentSchedule.item = updatedItems;
        } else {
          console.error("Failed to move item up");
        }
      } catch (error) {
        console.error("Error moving item up:", error);
      }
    }
  },

  // Move item down
  async moveItemDown(index) {
    if (index < this.currentSchedule.item.length - 1) {
      const updatedItems = [...this.currentSchedule.item];
      const temp = updatedItems[index + 1];
      updatedItems[index + 1] = updatedItems[index];
      updatedItems[index] = temp;

      try {
        const response = await this.$Request.PUT(
          `schedule/${this.currentSchedule._id}`,
          { data: { item: updatedItems } },
          this.configs.key
        );
        if (response.status === 200) {
          this.currentSchedule.item = updatedItems;
        } else {
          console.error("Failed to move item down");
        }
      } catch (error) {
        console.error("Error moving item down:", error);
      }
    }
  },

  // Clone item
  async cloneItem(index) {
    const clonedItem = { ...this.currentSchedule.item[index] };
    clonedItem.isEditing = false; // Ensure the cloned item is not in edit mode
    const updatedItems = [
      ...this.currentSchedule.item.slice(0, index + 1),
      clonedItem,
      ...this.currentSchedule.item.slice(index + 1),
    ];

    try {
      const response = await this.$Request.PUT(
        `schedule/${this.currentSchedule._id}`,
        { data: { item: updatedItems } },
        this.configs.key
      );
      if (response.status === 200) {
        this.currentSchedule.item = updatedItems;
      } else {
        console.error("Failed to clone item");
      }
    } catch (error) {
      console.error("Error cloning item:", error);
    }
  },
        editItem(item) {
            item.isEditing = true;
        },
        closeHeaderModal() {
            this.isHeaderModalOpen = false;
            this.newHeader.name = "";
            this.newHeader.type = "input";
        },
    },
  };
  </script>
  
  <style scoped>
  button {
    padding: 5px 10px 5px 10px;
    text-align: center;
    font-size: 12px;
    /* font-weight: 500; */
    /* border-radius: 0.375rem; */
    cursor: pointer;
  }
  </style>