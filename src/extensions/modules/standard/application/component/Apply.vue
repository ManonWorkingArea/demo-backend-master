<script>
import storageManager from '@/plugins/storage';
import Loader       from '@/interface/template/Loader.vue';

import Subhead from '@/interface/template/outline/Subhead.vue';
import Pagination from '@/utils/Paginated.vue';
import convertUtils from "@/plugins/convertUtils";

export default {
    data() {
      const session = storageManager.get('session')
      return {
        dataItem: this.$route.params.id,
        dataStatus: this.$route.params.status,
        school: session.current.id,
        login:session.login,
        applicationData: [],
        listItems: [],
        categoryData:[],
        loading_sources: true,
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
      }
    },
    components: {
      Loader,
      Subhead,
      Pagination,
    },
    methods: {
      navigateToItem(item) {
          const route = `/application/apply/${this.applicationData._id}/${item.slug}`;
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
        async getCourse() {
            try {
                const resAPI = await fetch(`https://gateway.cloudrestfulapi.com/api/application/${this.dataItem}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json','client-token-key':this.configs.key
                },
                });

                const restReturn = await resAPI.json();
                if(resAPI.status === 200)
                {
                    this.applicationData = restReturn;
                    console.log(restReturn);
                }
                
            } catch (error) {
                console.error(error);
            }
        },
        async getData() {
            try {
                if (this.login) {
                this.loading = true;
                this.activeBlock = true

                const andConditions = [{ applicationID: this.dataItem, status: this.dataStatus }];

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
    $addFields: {
      userIdObj: {
        $convert: {
          input: '$userID',
          to: 'objectId',
          onError: null,
        },
      },
    },
  },
  {
    $lookup: {
      from: 'user',
      localField: 'userIdObj',
      foreignField: '_id',
      as: 'user',
    },
  },
  {
    $project: {
      _id: 1,
      user: {
        $cond: [
          { $isArray: '$user' },
          { $arrayElemAt: ['$user', 0] },
          '$user',
        ],
      },
      applicationID: 1,
      form: 1,
      document: 1,
      status: 1,
      next: 1,
      createdAt: 1,
      updatedAt: 1,
    },
  },
  {
    $facet: {
      user: [
        {
          $unwind: '$user',
        },
        {
          $replaceRoot: {
            newRoot: '$user',
          },
        },
      ],
      apply: [
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


                const requestOptions = {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json','client-token-key':this.configs.key },
                    body: JSON.stringify({
                    pipeline: pipeline,
                    }),
                };

                const resAPI = await fetch(
                    'https://gateway.cloudrestfulapi.com/api/apply/aggregate',
                    requestOptions
                );

                const RestReturn = await resAPI.json();

                if (RestReturn) {
                    const totalCount = RestReturn[0]?.totalCount?.[0]?.count || 0;

                    const formattedData = {
                        data: RestReturn[0].apply,
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

                    console.log("data",this.listItems);

                    this.loading = false;
                    this.activeBlock = false
                }
                }
            } catch (error) {
                console.log(error);
            }
            },
        toggleStatus(status) {
            console.log("Toggle Status", status);
            this.statusFilter = status;
            this.getData();
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
        await this.getCourse();
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
          return this.applicationData.status.find((item) => item.slug === routeStatus);
      }
    }
};
</script>

<template>

  <div v-if="!loading_sources" class="text-center"><Loader/></div>
  <div>

    <Subhead 
      :navigation="
      [
        {
            name: 'ย้อนกลับ',
            link: '/lesson/detail/' + this.dataItem,
            style: 'chevron-left',
            class: 'default-btn',
            visible: true,
            type: 'button',
        },
      ]"
    />

    <div>

      <div v-if="isShowingOverlay" class="loading-overlay">
        <div class="loading-text">{{ loadingMessage }}</div>
        <div class="processing-count">{{ processingCount }}</div>
      </div>
    </div>

    <div v-if="loading_sources">
      <div class="flex-1 pt-5 bg-white">
          <div class="mx-auto max-w-7xl px-6 sm:px-6 lg:px-6 space-x-4">
              <template v-for="(item, index) in applicationData.status" :key="index">
                  <button
                      :class="{
                          'bg-gray-100 text-black': item === activeStatus,
                          'bg-gray-200 text-gray-700': item !== activeStatus,
                          'px-6 py-4 rounded-t-md text-lg': true
                      }"
                      @click="navigateToItem(item)"
                  >
                  {{ item.name }}
                  </button>
              </template>
          </div>
      </div>
  
    </div>
  
    <div class="flex-1 pb-8 bg-gray-100 pt-2 pb-5">
      <div class="mt-8">
        <div class="mx-auto max-w-7xl px-6 sm:px-6 lg:px-6">
        <h1 class="text-2xl font-bold text-gray-900">ใบสมัคร : {{ applicationData.name }}</h1>

        
        
          <div class="mt-8 flex flex-col">
            <div class="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div class="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                
                <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">

                
                  <table class="min-w-full divide-y divide-gray-300 ">
                    <thead class="bg-gray-100">
                      
                      <tr class="hidden md:table-row p-0 m-0 bg-gray-50 border-b border-gray-200">
                        <td colspan="4" class="p-3 m-0">
                          <div class="flex items-center">
                            <input
                              id="search"
                              type="text"
                              class="px-4 py-2 rounded-md border-gray-300 bg-white focus:outline-none"
                              placeholder="ค้นหา..."
                              v-model="searchQuery"
                            />
                            <div v-if="searchQuery.length > 0" class="">
                              <div v-if="searchQuery.length > 0" class="text-left ml-2 text-gray-500">
                                ผลการค้นหา <span class="text-black font-semibold">{{ totalItems }}</span> รายการ (s)
                              </div>
                              <div v-else class="text-left mt-2">
                                ไม่พบข้อมูล
                              </div>
                            </div>

                            <button v-if="searchQuery.length > 0"
                              @click="clearSearchQuery"
                              type="button"
                              class="ml-2 text-blue-500 hover:underline focus:outline-none"
                            >
                            Clear
                            </button>

                          </div>
                        </td>
                        <td colspan="3" class="p-3 m-0">
                          <div class="flex items-center justify-end">

                            <select v-model="limitItem" @change="handleLimitChange" class="block w-24 py-2 px-2 text-sm font-medium bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
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
                              class="ml-2"
                            />
                            
                          </div>
                        </td>
                      </tr>

                      <tr class="table-row md:hidden p-0 m-0 border-b border-gray-200">
                        <td colspan="3" class="p-3 m-0 text-center">
                          <div class="mb-4 mx-auto max-w-full">
                            <input
                              id="search"
                              type="text"
                              class="w-full px-4 py-2 rounded-sm border-gray-300 bg-white focus:outline-none"
                              placeholder="ค้นหา..."
                              v-model="searchQuery"
                            />
                            <div v-if="searchQuery.length > 0" class="mt-2 text-gray-500">
                              ผลการค้นหา <span class="text-black font-semibold">{{ totalItems }}</span> รายการ (s)
                            </div>
                            <div v-else class="mt-2">
                              ไม่พบข้อมูล
                            </div>
                            <button v-if="searchQuery.length > 0"
                              @click="clearSearchQuery"
                              type="button"
                              class="ml-2 text-blue-500 hover:underline focus:outline-none"
                            >
                              Clear
                            </button>

                          </div>
                      
                          <div class="flex justify-center">
                            <Pagination
                              :current-page="currentPage"
                              :total-items="totalItems"
                              :total-pages="totalPages"
                              :limit-items="limitItem"
                              :data-loading="loading"
                              :display-mode="'nav'"
                              @page-changed="handlePageChanged"
                            />
                          </div>
                        </td>
                      </tr>

                      <tr>
                        <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">#</th>
                        <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">ชื่อ-นามสกุล</th>
                        <th scope="col" class="hidden md:table-cell px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Citizen ID</th>
                        <th scope="col" class="hidden md:table-cell px-3 py-3.5 text-left text-sm font-semibold text-gray-900">การติดต่อ</th>
                        <th scope="col" class="hidden md:table-cell px-3 py-3.5 text-left text-sm font-semibold text-gray-900">ลงทะเบียน</th>
                        <th scope="col" class="hidden md:table-cell px-3 py-3.5 text-left text-sm font-semibold text-gray-900">วันที่ลงทะเบียน</th>
                        <th scope="col" class="w-20 px-3 py-3.5 text-center text-sm font-semibold text-gray-900">เครื่องมือ</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200 bg-white relative" :data-content="'กำลังติดต่อฐานข้อมูล กรุณารอสักครู่.....'" :class="[(activeBlock?'isblock' : 'isunblock')]">

                      <tr v-for="(item, index) in listItems" :key="item._id">
                        <td class="py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{{ (currentPage - 1) * limitItem + index + 1 }}</td>
                        
                        <td class="px-3 py-4 text-md text-gray-700 font-semibold">
                          <router-link :to="'/application/detail/' + item._id + '?back=/application/apply/647395e2dab7b3743c87f0c6/send'" class="text-gray-700 hover:text-indigo-600">
                            <span v-html="item.user.firstname + ' ' + item.user.lastname"></span><br>
                            <span class="text-sm font-normal text-gray-500" v-html="item.user._id"></span>
                          </router-link>
                        </td>
                        
                        <td class="hidden md:table-cell px-3 py-4 text-sm text-gray-500">
                          <font-awesome-icon :icon="['fas','id-card']" class="text-gray-500 mt-[3px] mr-1 text-md"/> 
                          <span v-html="item.user.citizen"></span>
                        </td>
                        
                        <td class="hidden md:table-cell px-3 py-4 text-sm text-gray-500">
                          <font-awesome-icon :icon="['fas','phone']" class="text-gray-500 mt-[3px] mr-2 text-md"/>
                          <span v-html="item.user.phone"></span><br>
                          <font-awesome-icon :icon="['fas','envelope']" class="text-gray-500 mt-[3px] mr-2 text-md"/>
                          <span v-html="item.user.email"></span>
                        </td>
                        
                        <td class="hidden md:table-cell px-3 py-4 text-sm text-gray-500">
                          <span class="font-semibold text-blue-500"></span>
                          <font-awesome-icon :icon="['fas','book']" class="text-gray-500 mt-[3px] ml-2 text-md"/>
                        </td>
                        
                        <td class="hidden md:table-cell px-3 py-4 text-sm text-gray-500">{{ formatThaidate(item.user.createdAt) }}</td>
                        
                        <td class="relative py-4 pl-3 pr-4 text-right text-md font-medium sm:pr-6">
                          <div class="flex">
                            <button @click="deleteData(item.apply._id)" type="button" class="mr-2 inline-flex justify-center rounded-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2">
                              <font-awesome-icon :icon="['fas','square-pen']" class="text-black mt-[3px] mr-2 text-md"/>
                              <span>รับเคส</span>
                            </button>
                          
                            <button @click="deleteData(item.apply._id)" type="button" class="mr-2 hidden md:inline-flex inline-flex justify-center rounded-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2">
                              <font-awesome-icon :icon="['fas','trash-can']" class="text-black mt-[3px] mr-2 text-md"/>
                              <span>ลบ</span> 
                            </button>
                          </div>
                        </td>
                      </tr>
                      
                      <tr class="p-0 m-0 bg-gray-50">
                        <td colspan="7" class="p-3 m-0">
                          <div class="text-center">
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
                        </td>
                      </tr>

                    </tbody>
                  </table>

                </div>
                
              </div>
            </div>
          </div>

      </div>
    </div>
  </div>
</div>
</template>

<style>
  input:focus-visible {
    outline: none;
  }
</style>

<style>
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
</style>