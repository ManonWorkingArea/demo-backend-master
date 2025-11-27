<script>
import storageManager from '@/plugins/storage';
import Loader       from '@/interface/template/Loader.vue';
import Pagination from '@/utils/Paginated.vue';
import BatchProgress from '@/utils/BatchProgress.vue';
import convertUtils from "@/plugins/convertUtils";

export default {
    data() {
      const session = storageManager.get('session')
      const paging = storageManager.get('paging');
      return {
        open: false,
        dataItem: this.$route.params.id,
        school: session.current.id,
        login:session.login,
        courseData: [],
        listItems: [],
        categoryData:[],
        loading_sources: true,
        endpoint: "",
        master:session.master,
        accessToken: storageManager.get('session','token'),
        configs: storageManager.get('configs'),
        session: storageManager.get('session'),

        limitOptions: [1,10, 50, 100, 200, 500, 1000, 2000, 3000, 4000], // Define the available options
        totalPages: 0,
        totalItems: 0,

        limitItem:50,
        currentPage: 1,
        searchQuery: "",
        debounceTimer: null,

        pagingInfo: paging || {
          [this.$route.path]: {
            limitItem: 50,
            currentPage: 1,
            searchQuery: "",
          },
        },

        loading: false,
        showingOverlay: false,
        statusFilter:"all",
        isCreatingUser: false,
        isShowingOverlay: false,
        loadingMessage: '',
        processingCount: '',
        activeBlock: false,
        scb:[],
        isProcessing: false,
        processName: "",
        progressText: "",
        progressTotal: 0,
        progressCurrent: 0,
        startTime: null,
        endTime: null,
        layoutVisibility: {
          order: true,
          enroll: true
        },
        showMobileSidebar: false,
      }
    },
    components: {
      Loader,
      Pagination,
      BatchProgress
    },
    methods: {
      togglePanel() {
        this.open = !this.open;
      },
      closePanel() {
        this.open = false;
      },
      leadingZero(number) {
        return number < 10 ? '0' + number : number.toString();
      },
      formatThaidate(date) {
        return convertUtils.toThaiDatetime(date,"short");
      },
      updateURLParameters() {
        const updatedUrlParams = new URLSearchParams(window.location.search);
        if (this.currentPage > 1) {
          updatedUrlParams.set('page', this.currentPage);
        } else {
          updatedUrlParams.delete('page');
        }
        if (this.searchQuery) {
          updatedUrlParams.set('searchQuery', this.searchQuery);
        } else {
          updatedUrlParams.delete('searchQuery');
        }
        const updatedUrl = `${window.location.pathname}?${updatedUrlParams.toString()}`;
        window.history.replaceState({}, '', updatedUrl);
      },
      handleLimitChange() {
        const paging = storageManager.get('paging') || {};
        paging[this.$route.path] = {
          limitItem: this.limitItem,
          currentPage: 1,
          searchQuery: this.searchQuery,
        };
        storageManager.set('paging', paging);
        this.updateURLParameters();
        this.getData();
      },
      handlePageChanged(page) {
        if (page !== this.currentPage) {
          window.scrollTo(0, 0);
          this.currentPage = page;
          const paging = storageManager.get('paging') || {};
          paging[this.$route.path] = {
            limitItem: this.limitItem,
            currentPage: this.currentPage,
            searchQuery: this.searchQuery,
          };
          storageManager.set('paging', paging);
          this.updateURLParameters();
          this.getData();
        }
      },
      clearSearchQuery() {
        this.searchQuery = '';
        const paging = storageManager.get('paging') || {};
        paging[this.$route.path] = {
          limitItem: this.limitItem,
          currentPage: this.currentPage,
          searchQuery: this.searchQuery,
        };
        storageManager.set('paging', paging);
        this.updateURLParameters();
        this.handleSearchKeydown({ key: 'Enter' });
        this.getData();
      },
      handleSearchKeydown(event) {
        clearTimeout(this.debounceTimer);
        const updateDataAndURL = () => {
          this.getData();
          const paging = storageManager.get('paging') || {};
          paging[this.$route.path] = {
            limitItem: this.limitItem,
            currentPage: 1, // Reset current page to 1
            searchQuery: this.searchQuery,
          };
          storageManager.set('paging', paging)
          this.updateURLParameters();
          this.handlePageChanged(1);
        };
        if (event.key === 'Enter' && this.searchQuery.length >= 3) {
          updateDataAndURL();
        } else {
          this.debounceTimer = setTimeout(updateDataAndURL, 500);
        }
      },
      toggleStatus(status) {
        console.log("Toggle Status", status);
        this.statusFilter = status;
        this.getData();
      },
      closeProgress() {
        this.isProcessing = false;
      },
      async batchProcess() {
        this.open         = false;
        let totalItems  = this.listItems.length;
        let counter       = 0;
        /* Batch Process Param */
        this.isProcessing   = true;
        this.processName    = `Render Billing`;
        this.progressTotal  = totalItems
        this.startTime      = new Date().toISOString();
        this.endTime        = null;
        for (const item of this.listItems) {
          counter++;
          /* Batch Process Param */
          this.progressText     = `Processing : ${counter}/${totalItems}`;
          this.progressCurrent  =  counter
          await this.executeCustomQueries(item.order.ref, item.order._id);
        }
        /* Batch Process Param */
        this.progressText = `All Process : Done`;
        this.endTime      = new Date().toISOString();
      },
      async getData() {
        this.listItems  = [];
        this.totalItems = 0;
        try {
          let andConditions = [{ unit: this.session.current._id ,status:'ลงทะเบียนคอร์ส'}];
            const pipeline = [
                {
                  $match: {
                    $and: andConditions,
                  },
                },
                {
                  $set: {
                    userID: { $toObjectId: "$userID" },
                    courseID: { $toObjectId: "$courseID" },
                  },
                },
                {
                  $lookup: {
                    from: "user",
                    localField: "userID",
                    foreignField: "_id",
                    as: "user",
                  },
                },
                {
                  $unwind: "$user",
                },
                {
                  $lookup: {
                    from: "course",
                    localField: "courseID",
                    foreignField: "_id",
                    as: "course",
                  },
                },
                {
                  $unwind: "$course",
                },
                ...(this.searchQuery
                  ? [
                      {
                        $match: {
                          $or: [
                            { "user.name": { $regex: `.*${this.searchQuery}.*`, $options: 'i' } },
                            { "user.citizen": { $regex: `.*${this.searchQuery}.*`, $options: 'i' } },
                            { "user.email": { $regex: `.*${this.searchQuery}.*`, $options: 'i' } },
                            { "user.firstname": { $regex: `.*${this.searchQuery}.*`, $options: 'i' } },
                            { "user.lastname": { $regex: `.*${this.searchQuery}.*`, $options: 'i' } },
                            { "user.old_id": { $regex: `.*${this.searchQuery}.*`, $options: 'i' } },
                            { "user.phone": { $regex: `.*${this.searchQuery}.*`, $options: 'i' } },
                            { "user.token": { $regex: `.*${this.searchQuery}.*`, $options: 'i' } },
                          ],
                        },
                      },
                    ]
                  : []),
              {
                $facet: {
                  table: [
                    { $skip: (this.currentPage - 1) * this.limitItem },
                    { $limit: this.limitItem },
                    {
                      $project: {
                        order: "$$ROOT",
                        user: "$user",
                        course: "$course",
                      },
                    },
                  ],
                  count: [
                    { $count: "count" },
                  ],
                },
              },
            ];

            const requestOptions = {
              method: 'POST',
              headers: { 'Content-Type': 'application/json','client-token-key':this.configs.key },
              body: JSON.stringify({
                pipeline: pipeline,
              }),
            };

            const resAPI = await fetch('https://gateway.cloudrestfulapi.com/api/order/aggregate', requestOptions);
            const restReturn = await resAPI.json();

            if (restReturn && restReturn.length > 0) {
            const firstItem = restReturn[0];

            if (firstItem.table && firstItem.table.length > 0) {
              const table = firstItem.table;
              console.log(firstItem.table);

              if (firstItem.count && firstItem.count.length > 0) {
                const count = firstItem.count[0].count;

                const formattedData = {
                  data: table,
                  total: count,
                  paging: {
                    page: this.currentPage,
                    limit: this.limitItem,
                    totalPages: Math.ceil(count / this.limitItem),
                  },
                };

                // Highlight search query in the result data
                this.listItems = formattedData.data.map((item) => {
                  console.log(item);
                  Object.keys(item).forEach((key) => {
                    if (typeof item[key] === "string") {
                      const lowerCaseValue = item[key].toLowerCase();
                      const searchQuery = this.searchQuery.toLowerCase();
                      const startIndex = lowerCaseValue.indexOf(searchQuery);

                      if (startIndex !== -1 && searchQuery.length > 0) {
                        const endIndex = startIndex + searchQuery.length;
                        const highlightedValue =
                          item[key].substring(0, startIndex) +
                          '<span class="text-red-500 font-bold">' +
                          item[key].substring(startIndex, endIndex) +
                          "</span>" +
                          item[key].substring(endIndex);

                        item[key] = highlightedValue;
                      }
                    }
                  });
                  return item;
                });
                this.totalItems = formattedData.total;
                this.totalPages = formattedData.paging.totalPages;

                this.loading = false;
                this.activeBlock = false;

                console.log("formattedData", this.formattedData);
              } else {
                console.error("Total count data is missing.");
              }
            } else {
              console.error("Paginated data is missing or empty.");
            }
          } else {
            console.error("No data in 'restReturn' or 'restReturn' is empty.");
          }


        } catch (error) {
          console.log(error);
        } finally {
          this.loading = false;
          this.activeBlock = false;
        }
      },
      toggleMobileSidebar() {
        this.showMobileSidebar = !this.showMobileSidebar;
      },
    },
    async mounted() {
  try {
    const paging = storageManager.get('paging') || {};
    const routePaging = paging[this.$route.path] || {};

    // Apply the paging information from 'paging' constant
    this.limitItem = routePaging.limitItem || 50;
    this.currentPage = routePaging.currentPage || 1;
    this.searchQuery = routePaging.searchQuery || '';

    // Update URL parameters based on the paging information
    this.updateURLParameters();

    await this.getData();
  } catch (error) {
    console.error(error);
  }
},
    setup() {
      //console.log("Setup");
    },
    computed: {
      filteredListItems() {
        if (this.selectedStatus === "All") {
          return this.listItems;
        } else {
          return this.listItems.filter(item => item.status === this.selectedStatus);
        }
      }
    }
};
</script>

<template>
  <div class="bg-gray-50 flex overflow-hidden enroll-container">
    <!-- Sidebar -->
    <div class="hidden lg:flex lg:w-64 lg:flex-col">
      <div class="flex flex-col flex-grow bg-white border-r border-gray-200 h-full">
        <!-- Sidebar Header -->
        <div class="flex items-center justify-between px-4 py-4 border-b border-gray-200 flex-shrink-0">
          <h1 class="text-lg font-semibold text-gray-900">การลงทะเบียน</h1>
          <button 
            @click="togglePanel" 
            class="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors duration-200"
            title="เครื่องมือ"
          >
            <i class="fas fa-cogs text-sm"></i>
          </button>
        </div>

        <!-- Quick Stats -->
        <div class="px-4 py-4 border-b border-gray-200">
          <h3 class="text-sm font-medium text-gray-700 mb-3">สถิติรวม</h3>
          <div class="space-y-2">
            <div class="flex items-center justify-between p-2 bg-blue-50 rounded-lg stats-card">
              <div class="flex items-center gap-2">
                <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span class="text-sm text-gray-700">นักเรียนทั้งหมด</span>
              </div>
              <span class="text-sm font-semibold text-blue-600">{{ totalItems }}</span>
            </div>
            <div class="flex items-center justify-between p-2 bg-green-50 rounded-lg stats-card">
              <div class="flex items-center gap-2">
                <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                <span class="text-sm text-gray-700">หน้าปัจจุบัน</span>
              </div>
              <span class="text-sm font-semibold text-green-600">{{ currentPage }}</span>
            </div>
            <div class="flex items-center justify-between p-2 bg-yellow-50 rounded-lg stats-card">
              <div class="flex items-center gap-2">
                <div class="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span class="text-sm text-gray-700">รายการต่อหน้า</span>
              </div>
              <span class="text-sm font-semibold text-yellow-600">{{ limitItem }}</span>
            </div>
          </div>
        </div>

        <!-- Navigation Menu -->
        <div class="px-4 py-4 border-b border-gray-200">
          <h3 class="text-sm font-medium text-gray-700 mb-3">เมนู</h3>
          <nav class="space-y-1">
            <button 
              @click="getData" 
              class="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors duration-200 sidebar-menu-item text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            >
              <i class="fas fa-list text-sm w-4"></i>
              <span class="flex-1 text-left">รายการทั้งหมด</span>
              <span class="px-2 py-1 text-xs rounded-full bg-gray-200 text-gray-600">
                {{ totalItems }}
              </span>
            </button>
          </nav>
        </div>

        <!-- Display Options -->
        <div class="px-4 py-4 border-b border-gray-200">
          <h3 class="text-sm font-medium text-gray-700 mb-3">ตัวเลือกการแสดงผล</h3>
          <div class="space-y-2">
            <label class="flex items-center cursor-pointer">
              <input type="checkbox" v-model="layoutVisibility.order" class="mr-2 rounded border-gray-300"/>
              <span class="text-sm text-gray-700">แสดงคำสั่งซื้อ</span>
            </label>
            <label class="flex items-center cursor-pointer">
              <input type="checkbox" v-model="layoutVisibility.enroll" class="mr-2 rounded border-gray-300"/>
              <span class="text-sm text-gray-700">แสดงการเรียน</span>
            </label>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="px-4 py-4 border-b border-gray-200">
          <h3 class="text-sm font-medium text-gray-700 mb-3">การดำเนินการ</h3>
          <div class="space-y-2">
            <button 
              @click="exportToCSV"
              class="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors duration-200"
            >
              <i class="fas fa-download text-sm w-4"></i>
              <span>Export CSV</span>
            </button>
            <button 
              @click="togglePanel"
              class="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors duration-200"
            >
              <i class="fas fa-cogs text-sm w-4"></i>
              <span>เครื่องมือ</span>
            </button>
            <button 
              @click="getData"
              class="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors duration-200"
            >
              <i class="fas fa-sync-alt text-sm w-4"></i>
              <span>รีเฟรช</span>
            </button>
          </div>
        </div>

        <!-- User Info -->
        <div class="mt-auto px-4 py-4 flex-shrink-0">
          <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <i class="fas fa-user text-white text-sm"></i>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 truncate">{{ session?.current?.name || 'ผู้ใช้' }}</p>
              <p class="text-xs text-gray-500">ผู้ดูแลระบบ</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col min-w-0 h-full">
      <!-- Mobile Header -->
      <div class="lg:hidden bg-white border-b border-gray-200 px-4 py-3">
        <div class="flex items-center justify-between">
          <h1 class="text-lg font-semibold text-gray-900">การลงทะเบียน</h1>
          <button 
            @click="toggleMobileSidebar" 
            class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <i class="fas fa-bars"></i>
          </button>
        </div>
      </div>

      <!-- Header Section -->
      <div class="bg-white border-b border-gray-200 px-4 py-3">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <!-- Search Input -->
          <div class="flex-1 max-w-md">
            <div class="relative">
              <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"></i>
              <input 
                type="text" 
                v-model="searchQuery" 
                @keydown="handleSearchKeydown"
                placeholder="ค้นหานักเรียน..." 
                class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          <!-- Action Buttons (Mobile) -->
          <div class="lg:hidden flex gap-2">
            <button 
              @click="exportToCSV" 
              class="bg-blue-600 hover:bg-blue-700 text-white font-medium px-3 py-2 rounded-lg transition-colors duration-200 text-sm flex items-center gap-2"
            >
              <i class="fas fa-download text-xs"></i>
              Export
            </button>
            <button 
              @click="togglePanel" 
              class="bg-gray-600 hover:bg-gray-700 text-white font-medium px-3 py-2 rounded-lg transition-colors duration-200 text-sm flex items-center gap-2"
            >
              <i class="fas fa-cogs text-xs"></i>
              เครื่องมือ
            </button>
          </div>
        </div>
      </div>

      <!-- Main Content Area -->
      <div class="flex-1 p-4 overflow-hidden">
        <!-- Current Filter Info -->
        <div class="mb-4 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <h2 class="text-lg font-semibold text-gray-900">รายการนักเรียน</h2>
            <span class="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
              {{ totalItems }} รายการ
            </span>
            <div v-if="searchQuery.length > 0" class="flex items-center gap-2">
              <span class="text-sm text-gray-500">
                ผลการค้นหา: <span class="font-semibold text-gray-900">{{ searchQuery }}</span>
              </span>
              <button 
                @click="clearSearchQuery"
                class="text-blue-500 hover:text-blue-700 text-sm"
              >
                ล้าง
              </button>
            </div>
          </div>
          
          <!-- Pagination Controls -->
          <div class="flex items-center gap-2">
            <select v-model="limitItem" @change="handleLimitChange" class="block w-20 py-1 px-2 text-xs font-medium bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
              <option v-for="option in limitOptions" :key="option" :value="option">{{ option }}</option>
            </select>
            <Pagination
              :current-page="currentPage"
              :total-items="totalItems"
              :total-pages="totalPages"
              :limit-items="limitItem"
              :data-loading="loading"
              :display-mode="'nav'"
              @page-changed="handlePageChanged"
              class="text-sm"
            />
          </div>
        </div>

        <!-- Students List -->
        <div class="h-full overflow-y-auto">
          <div class="bg-white rounded-lg shadow overflow-hidden">
            <div v-if="!loading_sources" class="text-center p-8"><Loader/></div>
            
            <div v-else class="overflow-hidden">
              <!-- Table Header -->
              <div class="bg-gray-50 border-b border-gray-200">
                <div class="flex text-sm font-semibold text-gray-900">
                  <div class="w-16 py-3 px-4 text-center">#</div>
                  <div class="flex-1 py-3 px-4 text-left">ชื่อ-นามสกุล</div>
                  <div class="hidden md:block w-32 py-3 px-4 text-left">Citizen ID</div>
                  <div class="hidden md:block w-48 py-3 px-4 text-left">การติดต่อ</div>
                  <div class="hidden md:block w-20 py-3 px-4 text-center">หลักสูตร</div>
                  <div class="hidden md:block w-32 py-3 px-4 text-left">วันที่ลงทะเบียน</div>
                  <div class="hidden md:block w-32 py-3 px-4 text-center">เครื่องมือ</div>
                </div>
              </div>

              <!-- Table Body -->
              <div class="bg-white min-h-[50px] relative" :data-content="'กำลังติดต่อฐานข้อมูล กรุณารอสักครู่.....'" :class="[(activeBlock?'isblock' : 'isunblock')]">
                <template v-if="listItems && listItems.length > 0">
                  <template v-for="(order, index) in listItems" :key="order._id">
                    <div class="flex border-b border-gray-200 text-sm hover:bg-gray-50 transition-colors">
                      <!-- Row Number -->
                      <div class="w-16 py-3 px-4 flex items-center justify-center bg-gray-50">
                        <span class="text-gray-600 font-semibold">{{ leadingZero((currentPage - 1) * limitItem + index + 1) }}</span>
                      </div>

                      <!-- Student Info -->
                      <div class="flex-1 py-3 px-4">
                        <router-link :to="'/student/detail/'+order.user._id+'?back=/lesson/detail/'+this.dataItem + '/enroll'" class="text-gray-700 hover:text-indigo-600">
                          <div class="flex items-center">
                            <img
                              :src="order.user.avatar_img"
                              class="w-10 h-10 mr-3 rounded-full bg-gray-200 object-cover"
                              alt="Profile Image"
                            >
                            <div>
                              <div class="font-medium text-gray-900" v-html="order.user.firstname + ' ' + order.user.lastname"></div>
                              <div class="text-sm text-gray-500">ID: <span v-html="order.user.old_id"></span></div>
                              <div class="text-xs text-gray-400" v-html="order.user.token"></div>
                            </div>
                          </div>
                        </router-link>
                      </div>

                      <!-- Citizen ID -->
                      <div class="hidden md:flex w-32 py-3 px-4 items-center">
                        <i class="fas fa-id-card text-gray-400 mr-2 text-sm"></i>
                        <span class="text-sm" v-html="order.user.citizen"></span>
                      </div>

                      <!-- Contact Info -->
                      <div class="hidden md:block w-48 py-3 px-4">
                        <div class="flex items-center mb-1">
                          <i class="fas fa-phone text-gray-400 mr-2 text-sm"></i>
                          <span class="text-sm" v-html="order.user.phone"></span>
                        </div>
                        <div class="flex items-center">
                          <i class="fas fa-envelope text-gray-400 mr-2 text-sm"></i>
                          <span class="text-sm truncate" v-html="order.user.email"></span>
                        </div>
                      </div>

                      <!-- Course Count -->
                      <div class="hidden md:flex w-20 py-3 px-4 items-center justify-center">
                        <div class="flex items-center">
                          <span class="font-semibold text-blue-600 mr-1">{{ order.user.enroll ? (order.user.enroll.length > 0 ? order.user.enroll.length : '0') : '0' }}</span>
                          <i class="fas fa-book text-gray-400 text-sm"></i>
                        </div>
                      </div>

                      <!-- Registration Date -->
                      <div class="hidden md:flex w-32 py-3 px-4 items-center">
                        <span class="text-sm text-gray-600">
                          {{ order.user.info.regdate ? order.user.info.regdate : (order.user.createAt ? order.user.createAt : "ไม่ระบุ") }}
                        </span>
                      </div>

                      <!-- Actions -->
                      <div class="hidden md:flex w-32 py-3 px-4 items-center justify-center">
                        <button 
                          @click="$router.push('/lesson/edit/'+ order.user._id)" 
                          type="button" 
                          class="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        >
                          <i class="fas fa-edit mr-1"></i>
                          แก้ไข
                        </button>
                      </div>
                    </div>

                    <!-- Mobile Actions -->
                    <div class="md:hidden p-3 border-b border-gray-300 bg-blue-50">
                      <div class="flex justify-between items-center">
                        <div class="text-sm text-gray-600">
                          <div class="flex items-center mb-1">
                            <i class="fas fa-phone text-gray-400 mr-2"></i>
                            <span v-html="order.user.phone"></span>
                          </div>
                          <div class="flex items-center">
                            <i class="fas fa-book text-gray-400 mr-2"></i>
                            <span>{{ order.user.enroll ? order.user.enroll.length : 0 }} หลักสูตร</span>
                          </div>
                        </div>
                        <button 
                          @click="$router.push('/lesson/edit/'+ order.user._id)" 
                          type="button" 
                          class="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <i class="fas fa-edit mr-2"></i>
                          แก้ไข
                        </button>
                      </div>
                    </div>
                  </template>
                </template>

                <!-- Empty State -->
                <template v-else>
                  <div class="text-center py-12">
                    <i class="fas fa-users text-gray-300 text-4xl mb-4"></i>
                    <p class="text-gray-500">ไม่พบข้อมูลนักเรียน</p>
                  </div>
                </template>
              </div>
            </div>
          </div>

          <!-- Bottom Pagination -->
          <div class="mt-4 flex justify-center">
            <Pagination
              :current-page="currentPage"
              :total-items="totalItems"
              :total-pages="totalPages"
              :limit-items="limitItem"
              :data-loading="loading"
              :display-mode="'summary'"
              @page-changed="handlePageChanged"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile Sidebar Overlay -->
    <div 
      v-if="showMobileSidebar" 
      class="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50"
      @click="toggleMobileSidebar"
    >
      <div 
        class="w-64 h-full bg-white transform transition-transform duration-300"
        @click.stop
      >
        <!-- Mobile Sidebar Content -->
        <div class="flex flex-col h-full">
          <!-- Sidebar Header -->
          <div class="flex items-center justify-between px-4 py-4 border-b border-gray-200">
            <h1 class="text-lg font-semibold text-gray-900">การลงทะเบียน</h1>
            <button 
              @click="toggleMobileSidebar"
              class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>

          <!-- Quick Stats -->
          <div class="px-4 py-4 border-b border-gray-200">
            <h3 class="text-sm font-medium text-gray-700 mb-3">สถิติรวม</h3>
            <div class="space-y-2">
              <div class="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                <div class="flex items-center gap-2">
                  <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span class="text-sm text-gray-700">นักเรียนทั้งหมด</span>
                </div>
                <span class="text-sm font-semibold text-blue-600">{{ totalItems }}</span>
              </div>
            </div>
          </div>

          <!-- Display Options -->
          <div class="px-4 py-4 border-b border-gray-200">
            <h3 class="text-sm font-medium text-gray-700 mb-3">ตัวเลือกการแสดงผล</h3>
            <div class="space-y-2">
              <label class="flex items-center cursor-pointer">
                <input type="checkbox" v-model="layoutVisibility.order" class="mr-2 rounded border-gray-300"/>
                <span class="text-sm text-gray-700">แสดงคำสั่งซื้อ</span>
              </label>
              <label class="flex items-center cursor-pointer">
                <input type="checkbox" v-model="layoutVisibility.enroll" class="mr-2 rounded border-gray-300"/>
                <span class="text-sm text-gray-700">แสดงการเรียน</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Side Panel -->
    <div v-if="open" class="relative z-10" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
      <div class="fixed inset-0"></div>
      <div class="fixed inset-0 overflow-hidden">
        <div class="absolute inset-0 overflow-hidden">
          <div class="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
            <div class="pointer-events-auto w-screen max-w-md">
              <div class="flex h-full flex-col overflow-y-scroll bg-white py-6 shadow-xl">
                <div class="px-4 sm:px-6">
                  <div class="flex items-start justify-between">
                    <h2 class="text-base font-semibold leading-6 text-gray-900" id="slide-over-title">เครื่องมือ</h2>
                    <div class="ml-3 flex h-7 items-center">
                      <button @click="closePanel" type="button" class="relative rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                        <span class="absolute -inset-2.5"></span>
                        <span class="sr-only">Close panel</span>
                        <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
                <div class="relative mt-6 flex-1 px-4 sm:px-6">
                  <ul class="space-y-4">
                    <li><button class="text-blue-600 hover:underline" @click="renderBilling">Render Billing</button></li> 
                    <li><button class="text-blue-600 hover:underline" @click="renderEnroll()">Render Enroll</button></li>
                    <li><button class="text-blue-600 hover:underline" @click="renderProfile">Render Profile</button></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Batch Progress -->
    <batch-progress
      :processName="processName"
      :progressText="progressText"
      :progressTotal="progressTotal"
      :progressCurrent="progressCurrent"
      :isVisible="isProcessing"
      :startTime="startTime"
      :endTime="endTime"
      @close="closeProgress"
    />

    <!-- Loading Overlay -->
    <div v-if="isShowingOverlay" class="loading-overlay">
      <div class="loading-text">{{ loadingMessage }}</div>
      <div class="processing-count">{{ processingCount }}</div>
    </div>
  </div>
</template>

<style scoped>
/* Enroll container with dynamic height calculation */
.enroll-container {
  height: calc(100vh - var(--header-height, 64px));
  max-height: calc(100vh - var(--header-height, 64px));
  overflow: hidden;
}

/* Responsive header heights */
@media (min-width: 1024px) {
  .enroll-container {
    height: calc(100vh - var(--header-height, 80px));
    max-height: calc(100vh - var(--header-height, 80px));
  }
}

@media (max-width: 768px) {
  .enroll-container {
    height: calc(100vh - var(--header-height, 56px));
    max-height: calc(100vh - var(--header-height, 56px));
  }
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Custom scrollbar */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Smooth transitions */
.transition-all {
  transition: all 0.2s ease-in-out;
}

.transition-colors {
  transition: color 0.2s ease-in-out, background-color 0.2s ease-in-out;
}

.transition-transform {
  transition: transform 0.3s ease-in-out;
}

/* Focus states */
.focus\:ring-2:focus {
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
}

/* Hover effects */
.hover\:shadow-md:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

/* Sidebar styles */
.sidebar-menu-item {
  position: relative;
  overflow: hidden;
}

.sidebar-menu-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 3px;
  height: 100%;
  background: transparent;
  transition: background-color 0.2s ease-in-out;
}

.sidebar-menu-item.active::before {
  background: #3b82f6;
}

/* Mobile sidebar animation */
.mobile-sidebar-enter {
  transform: translateX(-100%);
}

.mobile-sidebar-enter-active {
  transition: transform 0.3s ease-out;
}

.mobile-sidebar-enter-to {
  transform: translateX(0);
}

.mobile-sidebar-leave {
  transform: translateX(0);
}

.mobile-sidebar-leave-active {
  transition: transform 0.3s ease-in;
}

.mobile-sidebar-leave-to {
  transform: translateX(-100%);
}

/* Stats cards hover effect */
.stats-card {
  transition: all 0.2s ease-in-out;
}

.stats-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* Button hover effects */
.btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  transition: all 0.2s ease-in-out;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

/* Status badges */
.status-badge {
  position: relative;
  overflow: hidden;
}

.status-badge::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.3s ease-in-out;
}

.status-badge:hover::before {
  left: 100%;
}

/* Loading states */
.loading-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Pulse animation for new items */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.pulse {
  animation: pulse 2s infinite;
}

/* Mobile responsive adjustments */
@media (max-width: 1024px) {
  .sidebar-desktop {
    display: none;
  }
}

@media (max-width: 768px) {
  .gap-3 {
    gap: 0.5rem;
  }
  
  .p-4 {
    padding: 0.75rem;
  }
  
  .text-sm {
    font-size: 0.8rem;
  }
}

/* Dark mode support (if needed) */
@media (prefers-color-scheme: dark) {
  .dark-mode {
    background-color: #1f2937;
    color: #f9fafb;
  }
  
  .dark-mode .bg-white {
    background-color: #374151;
  }
  
  .dark-mode .border-gray-200 {
    border-color: #4b5563;
  }
  
  .dark-mode .text-gray-900 {
    color: #f9fafb;
  }
  
  .dark-mode .text-gray-700 {
    color: #d1d5db;
  }
  
  .dark-mode .text-gray-600 {
    color: #9ca3af;
  }
}

/* Print styles */
@media print {
  .sidebar,
  .mobile-sidebar,
  .modal-overlay,
  button {
    display: none !important;
  }
  
  .main-content {
    width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .border-gray-200 {
    border-color: #000;
  }
  
  .text-gray-600 {
    color: #000;
  }
  
  .bg-gray-50 {
    background-color: #fff;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Focus visible for accessibility */
.focus-visible:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Skip link for accessibility */
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: #3b82f6;
  color: white;
  padding: 8px;
  text-decoration: none;
  border-radius: 4px;
  z-index: 1000;
}

.skip-link:focus {
  top: 6px;
}

/* Loading overlay */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  z-index: 9999;
}

.loading-text {
  color: #fff;
  font-size: 24px;
  margin-bottom: 10px;
}

.processing-count {
  color: #fff;
  font-size: 18px;
}

/* Input focus styles */
input:focus-visible {
  outline: none;
}

/* Student card styles */
.student-card {
  transition: all 0.2s ease-in-out;
}

.student-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Avatar styles */
.avatar {
  transition: transform 0.2s ease-in-out;
}

.avatar:hover {
  transform: scale(1.05);
}

/* Table row hover effect */
.table-row {
  transition: background-color 0.2s ease-in-out;
}

.table-row:hover {
  background-color: #f8fafc;
}

/* Action button styles */
.action-btn {
  transition: all 0.2s ease-in-out;
}

.action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

/* Badge styles */
.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.badge-blue {
  background-color: #dbeafe;
  color: #1e40af;
}

.badge-green {
  background-color: #dcfce7;
  color: #166534;
}

.badge-yellow {
  background-color: #fef3c7;
  color: #92400e;
}

.badge-red {
  background-color: #fee2e2;
  color: #991b1b;
}

/* Search highlight */
.search-highlight {
  background-color: #fef08a;
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-weight: 600;
}

/* Empty state */
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
}

.empty-state-icon {
  font-size: 4rem;
  color: #d1d5db;
  margin-bottom: 1rem;
}

.empty-state-text {
  color: #6b7280;
  font-size: 1rem;
}
</style>