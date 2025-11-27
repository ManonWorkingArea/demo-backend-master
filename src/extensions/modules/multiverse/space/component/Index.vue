<script>

// Component
import feather from 'feather-icons';
// import Loader from '@/interface/template/Loader.vue';
// import Subhead from '@/interface/template/outline/Subhead.vue';
import storageManager from '@/plugins/storage';

export default {
    inject: ['apiServer'],
    data() {
      return {
        hostkey:this.$Key,
        accessToken: storageManager.get('session','token'),
        configs: storageManager.get('configs'),
        loading_sources: true,
        isEditMode: false, // Track whether in edit mode
        showModal: false, // To control the modal visibility
        spaceData: {
          name: '',
          status: true,
          space: '',
          s3Key: '',
          s3Endpoint: '',
          s3Hosting: '',
          s3Secret: '',
          s3Region: '',
          s3EndpointDefault: '',
          s3Bucket: '',
        },
        // Add a variable to store the item to edit
        listItemToEdit: null,
        listItem:[],
        showDeleteConfirmation: false,
        spaceToDelete: null,
        error: null,
        isRefreshing: false,
        viewMode: 'grid', // grid หรือ list
        searchTerm: '',
        sortBy: 'name_asc',
        selectedItems: [],
        bulkActions: false,
        openCardMenu: null,
        stats: {
          total: 0,
          active: 0,
          inactive: 0,
          totalStorage: 0,
          usedStorage: 0,
          availableStorage: 0
        },
        showMobileSidebar: false,
        sidebarMenuItems: [
          { value: 'all', label: 'ทั้งหมด', icon: 'fas fa-hdd', count: 0 },
          { value: 'active', label: 'เปิดใช้งาน', icon: 'fas fa-check-circle', count: 0 },
          { value: 'inactive', label: 'ปิดใช้งาน', icon: 'fas fa-times-circle', count: 0 },
          { value: 'large', label: 'ขนาดใหญ่', icon: 'fas fa-database', count: 0 },
          { value: 'medium', label: 'ขนาดกลาง', icon: 'fas fa-server', count: 0 },
          { value: 'small', label: 'ขนาดเล็ก', icon: 'fas fa-archive', count: 0 }
        ],
        activeFilter: 'all',
        activeQuickFilter: null,
        quickFilters: [
          { value: 'large', label: 'ขนาดใหญ่ (>1TB)', icon: 'fas fa-database' },
          { value: 'medium', label: 'ขนาดกลาง (100GB-1TB)', icon: 'fas fa-server' },
          { value: 'small', label: 'ขนาดเล็ก (<100GB)', icon: 'fas fa-archive' },
          { value: 's3', label: 'S3 Storage', icon: 'fas fa-cloud' },
          { value: 'local', label: 'Local Storage', icon: 'fas fa-hdd' }
        ]
      }
    },
    components: {
      // Loader,
      // Subhead
    },
    computed: {
      filteredSpaces() {
        let filtered = this.listItem;

        // Apply quick filters first
        if (this.activeQuickFilter) {
          switch (this.activeQuickFilter) {
            case 'large':
              filtered = filtered.filter(space => parseInt(space.space) > 1000);
              break;
            case 'medium':
              filtered = filtered.filter(space => parseInt(space.space) >= 100 && parseInt(space.space) <= 1000);
              break;
            case 'small':
              filtered = filtered.filter(space => parseInt(space.space) < 100);
              break;
            case 's3':
              filtered = filtered.filter(space => space.s3Endpoint);
              break;
            case 'local':
              filtered = filtered.filter(space => !space.s3Endpoint);
              break;
          }
        }

        // Filter by status
        if (this.activeFilter !== 'all') {
          if (this.activeFilter === 'active') {
            filtered = filtered.filter(space => space.status === true);
          } else if (this.activeFilter === 'inactive') {
            filtered = filtered.filter(space => space.status === false);
          } else if (this.activeFilter === 'large') {
            filtered = filtered.filter(space => parseInt(space.space) > 1000);
          } else if (this.activeFilter === 'medium') {
            filtered = filtered.filter(space => parseInt(space.space) >= 100 && parseInt(space.space) <= 1000);
          } else if (this.activeFilter === 'small') {
            filtered = filtered.filter(space => parseInt(space.space) < 100);
          }
        }

        // Filter by search term
        if (this.searchTerm) {
          filtered = filtered.filter(space => 
            space.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
            (space.s3Bucket && space.s3Bucket.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
            (space.s3Region && space.s3Region.toLowerCase().includes(this.searchTerm.toLowerCase()))
          );
        }

        // Sort spaces
        return this.sortSpaces(filtered);
      },

      // Computed properties for select all checkbox states
      allSelected() {
        return this.selectedItems.length === this.filteredSpaces.length && this.filteredSpaces.length > 0;
      },

      someSelected() {
        return this.selectedItems.length > 0 && this.selectedItems.length < this.filteredSpaces.length;
      },

      // Stats for selected spaces
      selectedSpaceStats() {
        const selectedSpaces = this.listItem.filter(item => 
          this.selectedItems.includes(item._id)
        );
        
        return {
          activeCount: selectedSpaces.filter(item => item.status === true).length,
          inactiveCount: selectedSpaces.filter(item => item.status === false).length,
          totalCount: selectedSpaces.length
        };
      },

      // Helper computed property for checkbox states
      checkboxStates() {
        const states = {};
        this.filteredSpaces.forEach(space => {
          states[space._id] = this.selectedItems.includes(space._id);
        });
        return states;
      }
    },
    watch: {
      // Watch for changes in selectedItems to update checkbox states
      selectedItems: {
        handler(newSelection) {
          // Update bulk actions state
          this.bulkActions = newSelection.length > 0;
          
          // Update header checkbox states
          this.$nextTick(() => {
            this.updateHeaderCheckboxStates();
          });
          
          // Debug logging
          console.log('selectedItems changed:', {
            newSelection,
            bulkActions: this.bulkActions,
            allSelected: this.allSelected,
            someSelected: this.someSelected
          });
        },
        deep: true
      },
      
      // Watch for changes in filteredSpaces to update selection
      filteredSpaces: {
        handler(newSpaces) {
          // If filtered spaces change, remove selected items that are no longer visible
          if (this.selectedItems.length > 0) {
            const visibleIds = newSpaces.map(item => item._id);
            this.selectedItems = this.selectedItems.filter(id => visibleIds.includes(id));
            this.bulkActions = this.selectedItems.length > 0;
          }
        },
        deep: true
      }
    },
    methods: {
      editItem(mode, item) {
        this.listItemToEdit = item; // Store the item to edit
        this.openModal(mode, item); // Open the modal with the mode and item's data
      },
      // Modify the openModal method to accept a mode parameter
      openModal(mode, initialFormData = {}) {
        this.isEditMode = mode === 'edit'; // Set edit mode based on the mode parameter
        this.spaceData = { ...initialFormData }; // Initialize form data
        this.showModal = true;
      },

      closeModal() {
        this.showModal = false;
      },
      submitForm() {
        if (this.isEditMode) {
          this.editData(this.listItemToEdit._id);
        } else {
          this.addData();
        }
      },
      async editData(id) {
        try {
          // Create a copy of this.spaceData without the _id field
          const dataWithoutId = { ...this.spaceData };
          delete dataWithoutId._id;

          const response = await fetch(`https://gateway.cloudrestfulapi.com/api/space/${id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json','client-token-key':this.hostkey
            },
            body: JSON.stringify({ data: dataWithoutId }), // Send dataWithoutId without _id
          });

          if (response.ok) {
            console.log('Item updated successfully');
            await this.getData();
            this.closeModal();
          } else {
            console.error('Failed to update item');
          }
        } catch (error) {
          console.error(error);
        }
      },
      async addData() {
        try {
          const response = await fetch('https://gateway.cloudrestfulapi.com/api/space', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json','client-token-key':this.hostkey
            },
            body: JSON.stringify({ data: this.spaceData }), // Remove the extra curly braces
          });

          if (response.ok) {
            console.log('Item added successfully');
            await this.getData();
            this.closeModal();
          } else {
            console.error('Failed to add item');
          }
        } catch (error) {
          console.error(error);
        }
      },
      async getData() {
        if(storageManager.get('session','login')) {
          try {
            this.loading_sources = false;

            const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/space/query", {
              method: 'POST',
              headers: {'Content-Type': 'application/json','client-token-key':this.hostkey},
              body: JSON.stringify({
                method: 'find',
                args: [
                  {
                    $and: [
                      {}
                    ]
                  }
                ]
              })
            });

            const RestReturn   = await resAPI.json();
            console.log(RestReturn);

            this.listItem        = RestReturn;
            this.loading_sources  = true;

          } catch (error) {
            console.log(error)
          }
        }
      },
      async deleteData(id) {
        if(storageManager.get('session','login')) {
          try {
            this.loading_sources = false;
            console.log("id",id)
            const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/space/" + id, {
              method: 'DELETE',
              headers: {'Content-Type': 'application/json','client-token-key':this.hostkey},
            });
            console.log(await resAPI);
            this.loading_sources = true;
            await this.getData();

          } catch (error) {
            console.log(error)
          }
        }
      },
      updated() {
        feather.replace();
      },
    },
    async mounted () {
      try {
        await this.getData();
      } catch (error) {
        console.log(Error);
      }
    },
    setup() {
      //console.log("Setup");
    },
};
</script>

<template>

  <div v-if="!loading_sources" class="text-center"><Loader/></div>
  <Subhead  v-if="loading_sources" 
    :navigation="
    [
      {
        name: 'เพิ่ม Asset',
        link: '/storage/add',
        style: 'plus',
        class: 'primary-btn',
        visible: true,
        type: 'button',
      },
    ]"
  />


  <!-- Modal -->
  <div
    class="fixed top-0 left-0 w-full h-full flex items-center justify-center z-50"
    v-if="showModal"
  >
    <div class="fixed inset-0 bg-black opacity-50"></div>
    <div class="relative bg-white w-full md:w-1/2 lg:w-1/2 rounded shadow-lg">
      <!-- Modal Header -->
      <div class="bg-blue-500 text-white p-4 rounded-t">
        <h3 class="text-md font-semibold">{{ isEditMode ? 'Edit Item' : 'Add New Item' }}</h3>
        <button class="absolute top-3 right-3 text-lg font-semibold hover:text-gray-200"
        @click="closeModal">&times;</button>
      </div>

      <!-- Modal Content -->
      <div class="p-3">
        <form>
          <div class="grid grid-cols-2 gap-2">

              <div class="mb-2">
                <label for="name" class="block text-gray-700 font-bold mb-2">Storage Name</label>
                <input
                  v-model="spaceData.name"
                  type="text"
                  id="name"
                  class="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-500"
                />
              </div>

              <div class="mb-2">
                <label for="space" class="block text-gray-700 font-bold mb-2">Disk Space</label>
                <input
                  v-model="spaceData.space"
                  type="text"
                  id="space"
                  class="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-500"
                />
              </div>

              <div class="mb-2">
                <label for="s3Key" class="block text-gray-700 font-bold mb-2">S3 Key</label>
                <input
                  v-model="spaceData.s3Key"
                  type="text"
                  id="s3Key"
                  class="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-500"
                />
              </div>

              <div class="mb-2">
                <label for="s3Endpoint" class="block text-gray-700 font-bold mb-2">S3 Endpoint</label>
                <input
                  v-model="spaceData.s3Endpoint"
                  type="text"
                  id="s3Endpoint"
                  class="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-500"
                />
              </div>

              <div class="mb-2">
                <label for="s3Hosting" class="block text-gray-700 font-bold mb-2">S3 Hosting</label>
                <input
                  v-model="spaceData.s3Hosting"
                  type="text"
                  id="s3Hosting"
                  class="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-500"
                />
              </div>

              <div class="mb-2">
                <label for="s3Secret" class="block text-gray-700 font-bold mb-2">S3 Secret</label>
                <input
                  v-model="spaceData.s3Secret"
                  type="text"
                  id="s3Secret"
                  class="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-500"
                />
              </div>

              <div class="mb-2">
                <label for="s3Region" class="block text-gray-700 font-bold mb-2">S3 Region</label>
                <input
                  v-model="spaceData.s3Region"
                  type="text"
                  id="s3Region"
                  class="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-500"
                />
              </div>

              <div class="mb-2">
                <label for="s3EndpointDefault" class="block text-gray-700 font-bold mb-2">S3 Default Endpoint</label>
                <input
                  v-model="spaceData.s3EndpointDefault"
                  type="text"
                  id="s3EndpointDefault"
                  class="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-500"
                />
              </div>

              <div class="mb-2">
                <label for="s3Bucket" class="block text-gray-700 font-bold mb-2">S3 Bucket</label>
                <input
                  v-model="spaceData.s3Bucket"
                  type="text"
                  id="s3Bucket"
                  class="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-500"
                />
              </div>

              <!-- Checkbox -->
              <div class="mb-2">
                <label class="block text-gray-700 font-bold mb-2">สถานะ</label>
                <input
                  type="checkbox"
                  v-model="spaceData.status"
                  class="form-checkbox h-5 w-5 text-blue-600"
                /> ใช้งาน
              </div>
      
          </div>
        </form>
      </div>

      <!-- Modal Footer -->
      <div class="bg-gray-100 px-4 py-3 flex justify-end rounded-b">
        <button
          type="button"
          class="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 mr-2"
          @click="closeModal"
        >
          Close
        </button>
        <button
          type="button"
          @click="submitForm"
          class="px-4 py-2 text-white bg-green-500 rounded hover:bg-green-600"
        >
          {{ isEditMode ? 'Update' : 'Submit' }}
        </button>
      </div>
    </div>
  </div>

  <div class="flex-1 pb-8 bg-gray-100 pt-2 pb-5 border-t" v-if="loading_sources">
    <div class="mt-8">
      <div class="mx-auto max-w-7xl px-6 sm:px-6 lg:px-6">

        <div class="mt-8 flex flex-col">
          <div class="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div class="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">

              <div class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                
                <div v-for="(space) in listItem" :key="space._id" class="bg-white rounded-lg shadow-md overflow-hidden">
                  <div class="w-full h-30 relative text-center object-cover pt-10">

                    <div class="w-7 h-7 absolute top-2 right-2 text-white pt-1 text-sm font-normal rounded-full text-center" :class="space.status ? 'bg-green-600' : 'bg-red-600'">
                      <font-awesome-icon :icon="space.status ? ['fas', 'check-circle'] : ['fas', 'times']" class="text-white" />
                    </div>
                    
                    <div class="flex flex-col items-center justify-center">
                      <div class="relative text-center w-1/2">
                        <font-awesome-icon :icon="['fas','hdd']" class="text-blue-300 text-[60px] mb-4" />
                        <div class="absolute w-full bg-gray-200 border border-gray-300 rounded-full h-[6px] bottom-0">
                          <div class="absolute w-[46%] bg-gray-700 rounded-full h-[6px] bottom-0">
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>               
                  <div class="p-4">
                    <a href="javascript:void(0);" class="font-bold text-gray-600 hover:underline">{{ space.name }}</a>
                    <p class="text-sm text-gray-400"><font-awesome-icon :icon="['fas','pie-chart']" class="text-black mt-[3px] mr-1 text-md"/> 0 GB / {{ space.space }} GB</p>
                  </div>
                  <div class="bg-gray-100 border-t-2 border-gray-200 py-2 px-4 flex justify-between items-center">
                    <a href="javascript:void(0);" @click="editItem('edit',space)" class="text-gray-900 hover:text-gray-500 text-md font-medium">
                      <font-awesome-icon :icon="['fas','square-pen']" class="text-black mt-[3px] mr-2 text-md"/>
                      <span>แก้ไข</span>
                    </a>
                    <a href="javascript:void(0);" @click="deleteData('edit',space._id)" class="text-gray-900 hover:text-gray-500 text-md font-medium">
                      <font-awesome-icon :icon="['fas','trash-can']" class="text-black mt-[3px] mr-2 text-md"/>
                      <span>ลบ</span>
                    </a>
                  </div>
                </div>

                <!-- Button to open the modal for adding -->
                <button class="bg-white p-10 rounded-lg shadow-md overflow-hidden flex flex-col items-center justify-center cursor-pointer p-10"
                @click="openModal('add')"
                >
                  <div class="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center hover:opacity-70">
                    <font-awesome-icon :icon="['fas','plus']" class="text-3xl"/>
                  </div>
                  <p class="text-gray-500 mt-2 text-center">Add Storage</p>
                </button>
                
              </div>
              
            </div>
          </div>
        </div>


    </div>
  </div>
</div>
</template>