<script>
import storageManager from '@/plugins/storage';
import Loader       from '@/interface/template/Loader.vue';

import Pagination from '@/utils/Paginated.vue';
import convertUtils from "@/plugins/convertUtils";

import CustomConfirmation from '@/utils/Confirmation.vue';
import ShortText from '@/utils/ShortText.vue';
import SendEmail from '@/utils/SendEmail.vue';


function getValueByType(formData, fieldType) {
  for (const key in formData) {
    const field = formData[key];
    if (field.type === fieldType) {
      return field.value;
    }
  }
  return null; // If field not found
}

export default {
    data() {
      const session = storageManager.get('session')
      return {
        dataItem: this.$route.params.id,
        dataStatus: this.$route.params.status,
        school: session.current.id,
        login:session.login,
        postData: [],
        listItems: [],
        categoryData:[],
        newDataArray:[],
        loading_sources: false,
        endpoint: "",
        master:session.master,
        accessToken: storageManager.get('session','token'),
        configs: storageManager.get('configs'),
        session: storageManager.get('session'),
        limitItem:100,
        limitOptions: [10, 50, 100, 200, 500, 1000, 2000], // Define the available options
        currentPage: 1,
        totalPages: 0,
        totalItems: 0,
        loading: false,
        showingOverlay: false,
        searchQuery: "",
        statusFilter:"all",
        isCreatingUser: false,
        isShowingOverlay: false,
        loadingMessage: '',
        processingCount: '',
        debounceTimer: null,
        activeBlock: false,
        selectedStatus: '',
        lightboxVisible: false,
        selectedImage: '',
        confirmationMessage: '',
        confirmationHeader: '',
        showConfirmation: false,
        deletionData: null,
        showMobileSidebar: false,
        sidebarMenuItems: [
          { value: 'all', label: 'ทั้งหมด', icon: 'fas fa-list' },
          { value: 'submit', label: 'Submit', icon: 'fas fa-check' },
          { value: 'pending', label: 'Pending', icon: 'fas fa-clock' },
          { value: 'confirm', label: 'Confirm', icon: 'fas fa-thumbs-up' },
          { value: 'cancel', label: 'Cancel', icon: 'fas fa-times' },
        ],
      }
    },
    components: {
      Loader,
      Pagination,
      CustomConfirmation,
      SendEmail,
      ShortText
    },
    methods: {
      processEmailData(item) {
        const subject = item['Subject'].value;
        const body    = item['Message'].value;
        const email   = getValueByType(item, "email");
        const name    = getValueByType(item, "name");

        return {
          subject,
          body,
          email,
          name,
        };
      },
      handleEmailSent(response, output) {
        if (response) {
          console.log('Email sent:', output.message);
        } else {
          console.error('Failed to send email:', output.message);
        }
      },
      // Remove Function
      //
      removeItem(itemIndex) {
        this.confirmationMessage = 'คุณต้องการลบเนื้อหา (Form) นี้ ?';
        this.confirmationHeader = 'ยืนยันการทำรายการ';
        this.deletionData = {
          itemIndex
        };
        this.showConfirmation = true;
      },
      confirmRemoveItem() {
        const { itemIndex } = this.deletionData;
        console.log("Delete", itemIndex);
        this.deleteData(itemIndex);
        this.handleConfirmCancel();
      },
      handleConfirmation() {
        if (this.deletionData) {
          this.confirmRemoveItem(); // Corrected function name
        }
      },
      handleConfirmCancel() {
        this.deletionData = null;
        this.confirmationMessage = '';
        this.confirmationHeader = '';
        this.showConfirmation = false;
      },
      async deleteData(id) {
        if(this.$Storage.get('session','login')) {
          try {
            this.loading_sources = false;
            console.log("id",id)

            const { data, status } = await this.$Request.DELETE(
              `message/${id}`,
              null,
              this.configs.key
            );

            const success = status === 200;

            console.log('Data:', data);
            console.log('Success:', success);

            if (success) {
              await this.getData();
            }

            this.loading_sources = true;

          } catch (error) {
            console.log(error);
            this.loading_sources = true;
          }
        }
      },
      // Remove Function
      
      showLightbox(imageUrl) {
        this.lightboxVisible = true;
        this.selectedImage = imageUrl;
      },
      closeLightbox() {
        this.lightboxVisible = false;
        this.selectedImage = '';
      },
      async updateData(item, selectedValue) {
        try {
          this.activeBlock = true;

          const { data, status } = await this.$Request.PUT(
            `message/${item._id}`,
            {
              data: {
                status: selectedValue,
              },
              options: {}
            },
            this.configs.key
          );

          const success = status === 200;

          console.log('Data:', data);
          console.log('Success:', success);

          if (success) {
            this.$swal({
              toast: true,
              position: 'bottom-end',
              showConfirmButton: false,
              timer: 3000,
              icon: 'success',
              title: 'อัพเดตสถานะเรียบร้อยแล้ว',
              text: 'อัพเดตสถานะของข้อมูลนี้ สำเร็จแล้ว',
            });
          }

          this.activeBlock = false;

        } catch (error) {
          console.log(error);
          this.activeBlock = false;
        }
      },
      exportToCSV() {
        const dataToExport = this.listItems.map((item, index) => {
            const rowData = {
                "#": (this.currentPage - 1) * this.limitItem + index + 1,
                ...item.formData,
                "วันที่ส่งข้อมูล": this.formatThaidate(item.createdAt),
                "สถานะ": item.status,
              };

              Object.keys(rowData).forEach((key) => {
            if (Array.isArray(rowData[key])) {
              rowData[key] = rowData[key].map((value) => value.value).join(", ");
            }
          });
          return rowData;
        });

          let csvContent = "";
          const headers = Object.keys(dataToExport[0]);
          csvContent += headers.join(",") + "\n";
          dataToExport.forEach((item) => {
          const row = headers.map((header) => {
            if (header in item) {
              if (Array.isArray(item[header])) {
                return item[header].map((value) => value.value).join(", ");
              } else if (typeof item[header] === "object") {
                return item[header].value;
              } else {
                return item[header];
              }
            } else {
              return "";
            }
          });
          csvContent += row.join(",") + "\n";
        });
        const blob = new Blob([csvContent]);
        const link = document.createElement("a");
        link.setAttribute("href", URL.createObjectURL(blob));
        link.setAttribute("download", this.postData.title + "_exportdata_" + this.postData._id + ".csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      },
      navigateToItem(item) {
          const route = `/application/apply/${this.postData._id}/${item.slug}`;
          this.$router.push(route);
      },
      formatThaidate(date) {
        return convertUtils.toThaiDatetime(date,"short");
      },
      handleLimitChange() {
        const session = storageManager.get('session');
        session.limitItem = this.limitItem;
        storageManager.set('session', session);
        this.currentPage = 1; // Reset current page to 1
        session.currentPage = this.currentPage;
        storageManager.set('session', session);
        const updatedUrlParams = new URLSearchParams(window.location.search);
        updatedUrlParams.set('page', session.currentPage);
        const updatedUrl = `${window.location.pathname}?${updatedUrlParams.toString()}`;
        window.history.replaceState({}, '', updatedUrl);
        console.log("getdata","handleLimitChange");
        this.getData();
      },
      handlePageChanged(page) {
        if (page !== this.currentPage) {
            window.scrollTo(0, 0);
            this.currentPage = page;
            const session = storageManager.get('session');
            session.currentPage = this.currentPage;
            storageManager.set('session', session);
            console.log("getdata","handlePageChanged");
            this.getData();
        }
        },
        clearSearchQuery() {
            this.searchQuery = '';
            const session = storageManager.get('session');
            session.searchQuery = '';
            storageManager.set('session', session);
            console.log("getdata","clearSearchQuery");
            this.getData();
        },
        async callAPI(token) {
            try {
            const url = `https://faas-sgp1-18bc02ac.doserverless.co/api/v1/web/fn-3bf765c8-bb4f-4bac-ba41-9698000f7334/default/getstudentdata?id=${token}`;
            const response = await fetch(url);
            const data = await response.json();
            console.log(data);
            } catch (error) {
            console.log(error);
            }
        },
        async getData() {
            try {
                if (this.login) {
                this.loading = true;
                this.activeBlock = true;
                this.loading_sources = false; // Set loading state

                const andConditions = [{ parent: this.session.current._id }];

                if (this.statusFilter !== 'all') {
                  andConditions.push({ status: this.statusFilter });
                }

                const pipeline = [
                  {
                    $match: {
                      $and: andConditions,
                    },
                  },
                  {
                    $facet: {
                      post: [
                        {
                          $skip: (this.currentPage - 1) * this.limitItem,
                        },
                        {
                          $limit: this.limitItem,
                        },
                      ],
                      totalCount: [
                        {
                          $count: 'count',
                        },
                      ],
                    },
                  },
                ];

                const { data, status } = await this.$Request.POST(
                  'message/aggregate',
                  { pipeline: pipeline },
                  this.configs.key
                );
                const success = status === 200;

                if (success) {
                    const totalCount = data[0]?.totalCount?.[0]?.count || 0;

                    const formattedData = {
                        data: data[0].post,
                        total: totalCount,
                        paging: {
                          page: this.currentPage,
                          limit: this.limitItem,
                          totalPages: Math.ceil(totalCount / this.limitItem)
                        }
                    };

                    this.listItems = formattedData.data;
                    this.totalItems = formattedData.total;
                    this.totalPages = formattedData.paging.totalPages;

                    this.newDataArray = Object.keys(formattedData.data[0].formData);

                    console.log("data",this.listItems);
                }

                // Always reset loading states regardless of success or failure
                this.loading = false;
                this.activeBlock = false;
                this.loading_sources = true;
                }
            } catch (error) {
                console.log(error);
                // Reset loading states on error
                this.loading = false;
                this.activeBlock = false;
                this.loading_sources = true;
            }
        },
        toggleStatus(status) {
            console.log("Toggle Status", status);
            this.statusFilter = status;
            this.getData();
        },
        toggleMobileSidebar() {
          this.showMobileSidebar = !this.showMobileSidebar;
        },
        getStatusCount(status) {
          if (status === 'all') {
            return this.totalItems;
          }
          return this.listItems.filter(item => item.status === status).length;
        },
        getStatusLabel(status) {
          const labels = {
            'submit': 'Submit',
            'pending': 'Pending', 
            'confirm': 'Confirm',
            'cancel': 'Cancel',
            'all': 'ข้อความทั้งหมด'
          };
          return labels[status] || 'สถานะไม่ทราบ';
        },
        toggleStatusAndCloseMobile(status) {
          this.toggleStatus(status);
          this.toggleMobileSidebar();
        }
    },
    async mounted () {
      try {
        
        const urlParams = new URLSearchParams(window.location.search);
        const page = urlParams.get('page');
        if (page && /^\d+$/.test(page)) {
          this.currentPage = parseInt(page);
        } else {
          const session = storageManager.get('session');
          if (session && session.currentPage) {
            this.currentPage = session.currentPage;
            const updatedUrlParams = new URLSearchParams(window.location.search);
            updatedUrlParams.set('page', session.currentPage);
            const updatedUrl = `${window.location.pathname}?${updatedUrlParams.toString()}`;
            window.history.replaceState({}, '', updatedUrl);
          }
        }
        const session = storageManager.get('session');
        if (session && session.searchQuery) {
          this.searchQuery = session.searchQuery;
        }
        const storedLimitItem = session.limitItem;
        if (storedLimitItem) {
          this.limitItem = storedLimitItem;
        }
        await this.getData();
      } catch (error) {
        console.log(Error);
      }
    },
    setup() {
      //console.log("Setup");
    },
    watch: {
      searchQuery() {
          clearTimeout(this.debounceTimer);
          this.debounceTimer = setTimeout(() => {
              this.getData();
              const session = storageManager.get('session');
              session.searchQuery = this.searchQuery;
              storageManager.set('session', session);

              this.currentPage = 1;
              const updatedUrlParams = new URLSearchParams(window.location.search);
              updatedUrlParams.set('page', session.currentPage);
              const updatedUrl = `${window.location.pathname}?${updatedUrlParams.toString()}`;
              window.history.replaceState({}, '', updatedUrl);
          }, 500);
      },
      $route(to, from) {
        if (to.params.status !== from.params.status) {
          this.dataStatus = to.params.status
            this.getData(to.params.status)
            .then(() => {
                console.log("Data fetched successfully.");
            })
            .catch((error) => {
                console.error(error);
            });
        }
      },
    },
    computed: {
      filteredListItems() {
        if (this.selectedStatus === "All") {
          return this.listItems;
        } else {
          return this.listItems.filter(item => item.status === this.selectedStatus);
        }
      },
      activeStatus() {
          const routeStatus = this.$route.params.status;
          return this.postData.status.find((item) => item.slug === routeStatus);
      },
    }
};
</script>

<template>
  <div class="bg-gray-50 flex overflow-hidden message-container">
    <!-- Sidebar -->
    <div class="hidden lg:flex lg:w-64 lg:flex-col">
      <div class="flex flex-col flex-grow bg-white border-r border-gray-200 h-full">
        <!-- Sidebar Header -->
        <div class="flex items-center justify-between px-4 py-4 border-b border-gray-200 flex-shrink-0">
          <h1 class="text-lg font-semibold text-gray-900">ศูนย์กลางข้อความ</h1>
          <button 
            @click="exportToCSV" 
            class="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors duration-200"
            title="Export CSV"
          >
            <i class="fas fa-download text-sm"></i>
          </button>
        </div>

        <!-- Quick Stats -->
        <div class="px-4 py-4 border-b border-gray-200">
          <h3 class="text-sm font-medium text-gray-700 mb-3">สถิติรวม</h3>
          <div class="space-y-2">
            <div class="flex items-center justify-between p-2 bg-blue-50 rounded-lg stats-card">
              <div class="flex items-center gap-2">
                <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span class="text-sm text-gray-700">ข้อความทั้งหมด</span>
              </div>
              <span class="text-sm font-semibold text-blue-600">{{ totalItems }}</span>
            </div>
            <div class="flex items-center justify-between p-2 bg-green-50 rounded-lg stats-card">
              <div class="flex items-center gap-2">
                <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                <span class="text-sm text-gray-700">Submit</span>
              </div>
              <span class="text-sm font-semibold text-green-600">{{ getStatusCount('submit') }}</span>
            </div>
            <div class="flex items-center justify-between p-2 bg-yellow-50 rounded-lg stats-card">
              <div class="flex items-center gap-2">
                <div class="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span class="text-sm text-gray-700">Pending</span>
              </div>
              <span class="text-sm font-semibold text-yellow-600">{{ getStatusCount('pending') }}</span>
            </div>
            <div class="flex items-center justify-between p-2 bg-red-50 rounded-lg stats-card">
              <div class="flex items-center gap-2">
                <div class="w-2 h-2 bg-red-500 rounded-full"></div>
                <span class="text-sm text-gray-700">Confirm</span>
              </div>
              <span class="text-sm font-semibold text-red-600">{{ getStatusCount('confirm') }}</span>
            </div>
          </div>
        </div>

        <!-- Navigation Menu -->
        <div class="px-4 py-4 border-b border-gray-200">
          <h3 class="text-sm font-medium text-gray-700 mb-3">เมนู</h3>
          <nav class="space-y-1">
            <button 
              v-for="status in sidebarMenuItems" 
              :key="status.value"
              @click="toggleStatus(status.value)" 
              class="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors duration-200 sidebar-menu-item"
              :class="{ 
                'bg-blue-100 text-blue-700 font-medium active': statusFilter === status.value,
                'text-gray-600 hover:bg-gray-100 hover:text-gray-900': statusFilter !== status.value
              }"
            >
              <i :class="status.icon" class="text-sm w-4"></i>
              <span class="flex-1 text-left">{{ status.label }}</span>
              <span 
                v-if="getStatusCount(status.value) > 0" 
                class="px-2 py-1 text-xs rounded-full status-badge"
                :class="{ 
                  'bg-blue-200 text-blue-800': statusFilter === status.value,
                  'bg-gray-200 text-gray-600': statusFilter !== status.value
                }"
              >
                {{ getStatusCount(status.value) }}
              </span>
            </button>
          </nav>
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
          <h1 class="text-lg font-semibold text-gray-900">ศูนย์กลางข้อความ</h1>
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
                placeholder="ค้นหาข้อความ..." 
                class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          <!-- Export Button (Mobile) -->
          <button 
            @click="exportToCSV" 
            class="lg:hidden bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200 text-sm flex items-center gap-2"
          >
            <i class="fas fa-download text-xs"></i>
            Export CSV
          </button>
        </div>
      </div>

      <!-- Tabs Section (Mobile) -->
      <div class="lg:hidden bg-white border-b border-gray-200">
        <div class="px-4 py-2">
          <select 
            v-model="statusFilter" 
            @change="toggleStatus(statusFilter)"
            class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option 
              v-for="status in sidebarMenuItems" 
              :key="status.value" 
              :value="status.value"
            >
              {{ status.label }} ({{ getStatusCount(status.value) }})
            </option>
          </select>
        </div>
      </div>

      <!-- Main Content Area -->
      <div class="flex-1 p-4 overflow-hidden">
        <!-- Current Filter Info -->
        <div class="mb-4 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <h2 class="text-lg font-semibold text-gray-900">
              {{ getStatusLabel(statusFilter) }}
            </h2>
            <span class="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
              {{ totalItems }} รายการ
            </span>
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

        <!-- Messages Table -->
        <div class="h-full overflow-y-auto">
          <div class="bg-white rounded-lg shadow overflow-hidden">
            <div v-if="!loading_sources" class="text-center p-8"><Loader/></div>
            
            <div v-else class="overflow-hidden">
              <table class="min-w-full divide-y divide-gray-300">
                <thead class="bg-gray-50">
                  <tr>
                    <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">#</th>
                    <template v-if="!activeBlock">
                        <th scope="col" v-for="(key, index) in newDataArray" :key="index" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">{{ key }}</th>
                    </template>
                    <th scope="col" class="hidden md:table-cell px-3 py-3.5 text-left text-sm font-semibold text-gray-900">วันที่ส่งข้อมูล</th>
                    <th scope="col" class="hidden md:table-cell px-3 py-3.5 text-left text-sm font-semibold text-gray-900">สถานะ</th>
                    <th scope="col" class="px-3 py-3.5 text-center text-sm font-semibold text-gray-900">เครื่องมือ</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 bg-white relative" :data-content="'กำลังติดต่อฐานข้อมูล กรุณารอสักครู่.....'" :class="[(activeBlock?'isblock' : 'isunblock')]">
                  <tr v-for="(item, index) in listItems" :key="item._id" class="hover:bg-gray-50 transition-colors">
                    <td class="py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{{ (currentPage - 1) * limitItem + index + 1 }}</td>

                    <template v-for="(formItem, key) in item.formData" :key="key">
                      <td class="hidden md:table-cell px-3 py-4 text-sm text-gray-500">
                        <template v-if="formItem.type === 'input' || formItem.type === 'text' || formItem.type === 'email'|| formItem.type === 'name' || formItem.type === 'mobile'">
                          {{ formItem.value }}
                        </template>
                        <template v-else-if="formItem.type === 'textarea'">
                          <ShortText :value="formItem.value"></ShortText>
                        </template>
                        <template v-else-if="formItem.type === 'checkbox'">
                          <ul>
                            <li v-for="option in formItem.value" :key="option">
                              {{ option }}
                            </li>
                          </ul>
                        </template>
                        <template v-else-if="formItem.type === 'radiobox'">
                          {{ formItem.value }}
                        </template>
                        <template v-else-if="formItem.type === 'upload'">
                          <div class="relative cursor-pointer" @click="showLightbox(formItem.value[0])">
                            <img class="w-10 h-10 object-cover rounded-md" :src="formItem.value[0]" alt="Uploaded Image">
                            <div class="absolute inset-0 bg-black bg-opacity-50 opacity-0 transition-opacity duration-300"></div>
                          </div>
                          <div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50" v-if="lightboxVisible">
                            <div class="max-w-full">
                              <img :src="selectedImage" alt="Lightbox Image" class="mx-auto max-h-full max-w-full">
                              <button @click="closeLightbox" class="absolute top-0 right-0 m-4 text-white text-2xl">&times;</button>
                            </div>
                          </div>
                        </template>
                      </td>
                    </template>                        

                    <td class="hidden md:table-cell px-3 py-4 text-sm text-gray-500">{{ formatThaidate(item.createdAt) }}</td>
                    <td class="hidden md:table-cell px-3 py-4 text-sm text-gray-500">
                        <select v-model="item.status" @change="updateData(item, $event.target.value)" class="border border-gray-300 rounded-md px-2 py-1 text-xs">
                          <option value="submit" :selected="item.status === 'submit'">Submit</option>
                          <option value="pending" :selected="item.status === 'pending'">Pending</option>
                          <option value="confirm" :selected="item.status === 'confirm'">Confirm</option>
                          <option value="cancel" :selected="item.status === 'cancel'">Cancel</option>
                        </select>
                      </td>
                    
                    <td class="relative py-4 pl-3 pr-4 text-right text-md font-medium sm:pr-6">
                      <div class="flex justify-end gap-2">
                        <SendEmail 
                        :emailData="processEmailData(item.formData)" 
                        @email-sent="handleEmailSent" 
                        class="inline-flex justify-center rounded-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
                        />
                      
                        <button @click="removeItem(item._id)" type="button" class="hidden md:inline-flex justify-center rounded-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2">
                          <font-awesome-icon :icon="['fas','trash-can']" class="text-red-500 text-sm"/>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>

              <!-- Empty State -->
              <div v-if="listItems.length === 0" class="text-center py-12">
                <i class="fas fa-envelope text-gray-300 text-4xl mb-4"></i>
                <p class="text-gray-500">ไม่พบข้อความที่ตรงกับการค้นหา</p>
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
        <!-- Mobile Sidebar Content (same as desktop sidebar) -->
        <div class="flex flex-col h-full">
          <!-- Sidebar Header -->
          <div class="flex items-center justify-between px-4 py-4 border-b border-gray-200">
            <h1 class="text-lg font-semibold text-gray-900">ศูนย์กลางข้อความ</h1>
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
                  <span class="text-sm text-gray-700">ข้อความทั้งหมด</span>
                </div>
                <span class="text-sm font-semibold text-blue-600">{{ totalItems }}</span>
              </div>
              <div class="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                <div class="flex items-center gap-2">
                  <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span class="text-sm text-gray-700">Submit</span>
                </div>
                <span class="text-sm font-semibold text-green-600">{{ getStatusCount('submit') }}</span>
              </div>
              <div class="flex items-center justify-between p-2 bg-yellow-50 rounded-lg">
                <div class="flex items-center gap-2">
                  <div class="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span class="text-sm text-gray-700">Pending</span>
                </div>
                <span class="text-sm font-semibold text-yellow-600">{{ getStatusCount('pending') }}</span>
              </div>
            </div>
          </div>

          <!-- Navigation Menu -->
          <div class="px-4 py-4 border-b border-gray-200">
            <h3 class="text-sm font-medium text-gray-700 mb-3">เมนู</h3>
            <nav class="space-y-1">
              <button 
                v-for="status in sidebarMenuItems" 
                :key="status.value"
                @click="toggleStatusAndCloseMobile(status.value)" 
                class="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors duration-200"
                :class="{ 
                  'bg-blue-100 text-blue-700 font-medium': statusFilter === status.value,
                  'text-gray-600 hover:bg-gray-100 hover:text-gray-900': statusFilter !== status.value
                }"
              >
                <i :class="status.icon" class="text-sm w-4"></i>
                <span class="flex-1 text-left">{{ status.label }}</span>
                <span 
                  v-if="getStatusCount(status.value) > 0" 
                  class="px-2 py-1 text-xs rounded-full"
                  :class="{ 
                    'bg-blue-200 text-blue-800': statusFilter === status.value,
                    'bg-gray-200 text-gray-600': statusFilter !== status.value
                  }"
                >
                  {{ getStatusCount(status.value) }}
                </span>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <custom-confirmation
      v-if="showConfirmation"
      :message="confirmationMessage"
      :header="confirmationHeader"
      @confirm="handleConfirmation"
      @cancel="handleConfirmCancel"
    />

    <!-- Loading Overlay -->
    <div v-if="isShowingOverlay" class="loading-overlay">
      <div class="loading-text">{{ loadingMessage }}</div>
      <div class="processing-count">{{ processingCount }}</div>
    </div>
  </div>
</template>

<style scoped>
/* Message container with dynamic height calculation */
.message-container {
  height: calc(100vh - var(--header-height, 64px));
  max-height: calc(100vh - var(--header-height, 64px));
  overflow: hidden;
}

/* Responsive header heights */
@media (min-width: 1024px) {
  .message-container {
    height: calc(100vh - var(--header-height, 80px));
    max-height: calc(100vh - var(--header-height, 80px));
  }
}

@media (max-width: 768px) {
  .message-container {
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
</style>