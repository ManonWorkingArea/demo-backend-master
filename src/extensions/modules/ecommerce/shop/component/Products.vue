<script>

// Component
import feather              from 'feather-icons';
import {useRoute} 	        from 'vue-router'
import storageManager       from '@/plugins/storage';
import Loader               from '@/interface/template/Loader.vue';

import StatusLabel          from '@/interface/element/StatusLabel.vue';
import Price                from '@/interface/element/FormatPrice.vue';

import Subhead              from '@/interface/template/outline/Subhead.vue';
import Pagination           from '@/utils/Paginated.vue';

import CustomConfirmation   from '@/utils/Confirmation.vue';

export default {
    data() {
      const route   = useRoute();
      const session = storageManager.get('session')
      const configs = storageManager.get("configs");
      const schoolSession = configs;

      return {
        schoolSession: schoolSession,
        PageName: route.meta.title,
        PageIcon: route.meta.icon,
        PagePath: route.meta.path,
        ParentName: route.meta.parent,
        ParentPage: route.meta.page,
        school: session.current.id,
        login:session.login,
        listItems: [],
        categoryData:[],
        loading_sources: true,
        pages: 0,
        current: 0,
        total: 0,
        next: true,
        prev: false,
        MasterText: session.MasterText,
        endpoint: "",
        master:session.master,
        accessToken: storageManager.get('session','token'),
        configs: storageManager.get('configs'),
        session: storageManager.get('session'),
        limitItem:20,
        limitOptions: [10, 20, 50, 100, 200, 500, 1000, 2000], // Define the available options
        currentPage: 1,
        totalPages: 0,
        totalItems: 0,
        loading: false,
        showingOverlay: false,
        searchQuery: "",
        statusFilter:"all",
        typeFilter:"all",
        //Custom Confirmation
        confirmMessage: '',
        confirmHeader: '',
        confirmType: '',
        showConfirmation: false,
        confirmData: null,
        //Custom Confirmation
      }
    },
    components: {
      Loader,
      StatusLabel,
      Price,
      Subhead,
      Pagination,
      CustomConfirmation
    },
    methods: {
      removeItem(item, master, name) {
        this.confirmMessage = 'คุณต้องการลบหลักสูตร <br> <small class="text-gray-400">' + name + '</small></br><span class="text-red-500">* หลังจากลบแล้วจะไม่สามารถกู้คืนได้</span>';
        this.confirmHeader = 'ยืนยันการทำรายการ';
        this.confirmData = { item, master };
        this.confirmType = 'warning';
        this.showConfirmation = true;
      },
      confirmRemoveItem() {
        const { item, master } = this.confirmData;
        console.log("Delete", item);
        this.deleteData(item, master);
        this.handleConfirmCancel();
      },
      handleConfirmation() {
        if (this.confirmData) {
          this.confirmRemoveItem(); // Corrected function name
        }
      },
      handleConfirmCancel() {
        this.confirmData = null;
        this.confirmMessage = '';
        this.confirmHeader = '';
        this.confirmType = '';
        this.showConfirmation = false;
      },
      showOverlay() {
        this.showingOverlay = true
      },
      hideOverlay() {
        this.showingOverlay = false;
      },
      objectFindByKey(array, key, value) {
        for (var i = 0; i < array.length; i++) {
            if (array[i][key] === value) {
                return array[i];
            }
        }
        return null;
      },
      getCategoryName(code) {
        const category = this.objectFindByKey(this.categoryData, 'code', code);
        return category ? category.name : '';
      },
      slugify(str) {
        str = str.replace(/^\s+|\s+$/g, ''); // trim
        str = str.toLowerCase();
        // remove accents, swap ñ for n, etc
        var from = "àáãäâèéëêìíïîòóöôùúüûñç·/_,:;";
        var to   = "aaaaaeeeeiiiioooouuuunc------";
        for (var i=0, l=from.length ; i<l ; i++) {
            str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
        }
        str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
            .replace(/\s+/g, '-') // collapse whitespace and replace by -
            .replace(/-+/g, '-'); // collapse dashes
        return str;
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
      async getData() {
        console.log("getData", this.login);
        if (this.login) {
          try {
            this.loading = true;
            this.activeBlock = true

            let andConditions = [{ unit: this.session.current._id, type: 'main' }];

            if (this.typeFilter !== 'all') {
              andConditions.push({ type: this.typeFilter });
            }

            if (this.statusFilter !== 'all') {
              andConditions.push({ status: this.statusFilter });
            }

            if (this.searchQuery) {
              andConditions.push({
                name: { $regex: `.*${this.searchQuery}.*`, $options: 'i' }
              });
            }
            
            const pipeline = [
              {
                $match: {
                  $and: andConditions,
                },
              },
              {
                $sort: {
                  status: -1,
                  type: 1,
                  createdAt: -1,
                }
              },
              {
                $lookup: {
                  from: "shop_category",
                  localField: "category",
                  foreignField: "code",
                  as: "categoryData"
                }
              },
              {
                $facet: {
                  paginatedData: [
                    { $skip: (this.currentPage - 1) * this.limitItem },
                    { $limit: this.limitItem }
                  ],
                  totalCount: [
                    { $count: "count" }
                  ]
                }
              }
            ];
            
            const resAPI = await fetch(`https://gateway.cloudrestfulapi.com/api/product/aggregate`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json','client-token-key':this.configs.key
              },
              body: JSON.stringify({ pipeline })
            });

            const RestReturn = await resAPI.json();

            if (RestReturn) {
              const paginatedData = RestReturn[0].paginatedData;
              const totalCount = RestReturn[0].totalCount[0].count;

              const formattedData = {
                data: paginatedData,
                total: totalCount,
                paging: {
                  page: this.currentPage,
                  limit: this.limitItem,
                  totalPages: Math.ceil(totalCount / this.limitItem)
                }
              };

              this.listItems    = formattedData.data;
              this.totalItems   = formattedData.total;
              this.totalPages   = formattedData.paging.totalPages;
              this.loading      = false;
              this.activeBlock  = false;
            }
          } catch (error) {
            console.log(error);
          }
        }
      },
      async deleteData(id) {
        if(this.login) {
          try {
            this.loading_sources = false;
            console.log("id",id)
            const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/product/" + id, {
              method: 'DELETE',
              headers: {'Content-Type': 'application/json','client-token-key':this.configs.key},
            });
            console.log(resAPI);
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
      toggleStatus(status) {
        console.log("Toggle Status", status);
        this.statusFilter = status;
        this.getData();
      },
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
      }
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

  <custom-confirmation
  v-if="showConfirmation"
  :type="confirmType"
  :message="confirmMessage"
  :header="confirmHeader"
  @confirm="handleConfirmation"
  @cancel="handleConfirmCancel"
  ></custom-confirmation>

  <div v-if="!loading_sources" class="text-center"><Loader/></div>
  <div v-if="loading_sources">

    <Subhead 
      :navigation="
      [
        {
          name: 'Select Status',
          function: 'toggleStatus',
          style: 'pencil',
          type: 'select',
          value: this.statusFilter,
          placeholder: 'เลือกสถานะ',
          options: [
            { name: 'ทั้งหมด', value: 'all' },
            { name: 'เผยแพร่', value: true },
            { name: 'ไม่เผยแพร่', value: false }
          ]
        },
        {
          name: 'เพิ่ม',
          link: '/lesson/add',
          style: 'plus',
          class: 'default-btn',
          visible: this.master,
          type: 'button',
        },
        {
          name: this.master ? 'Child' : 'Master',
          function: 'toggleMaster',
          style: 'pencil',
          class: this.master ? 'success-btn' : 'danger-btn',
          type: 'button',
        }
      ]"
      @toggleMaster="toggleMaster"
      @toggleStatus="toggleStatus"
    />
  
    <div class="flex-1 pb-8 bg-gray-100 pt-2 pb-5 border-t">
      <div class="mt-8">
        <div class="mx-auto max-w-7xl px-6 sm:px-6 lg:px-6">
          <div class="mt-8 flex flex-col">
            <div class="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div class="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                  <div class="min-w-full divide-y divide-gray-300">
                    <div class="bg-gray-50">
                      <div class="hidden md:block p-0 m-0 bg-gray-50 border-b border-gray-200 w-full">
                        <div colspan="6" class="p-3 m-0">
                          <div class="grid grid-cols-5">
                            <div class="col-span-3 flex items-center">
                              <input id="search" type="text" class="px-4 py-2 rounded-md border-gray-300 bg-white focus:outline-none" placeholder="ค้นหา..." v-model="searchQuery" />
                              <div v-if="searchQuery.length > 0" class="">
                                <div v-if="searchQuery.length > 0" class="text-left ml-2 text-gray-500">
                                  ผลการค้นหา <span class="text-black font-semibold">{{ totalItems }}</span> รายการ (s)
                                </div>
                                <div v-else class="text-left mt-2">ไม่พบข้อมูล</div>
                              </div>
                              <button v-if="searchQuery.length > 0" @click="clearSearchQuery" type="button" class="ml-2 text-blue-500 hover:underline focus:outline-none">Clear</button>
                            </div>
                            <div class="col-span-2 flex items-center justify-end">
                              <select v-model="limitItem" @change="handleLimitChange" class="block w-20 py-2 px-2 text-sm font-medium bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                                <option v-for="option in limitOptions" :key="option" :value="option">{{ option }}</option>
                              </select>
                              <Pagination :current-page="currentPage" :total-items="totalItems" :total-pages="totalPages" :limit-items="limitItem" :data-loading="loading" :display-mode="'nav'" @page-changed="handlePageChanged" class="ml-2" />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div class="block md:hidden p-0 m-0 border-b border-gray-200">
                        <div colspan="3" class="p-3 m-0 text-center">
                          <div class="mb-4 mx-auto max-w-full">
                            <input id="search" type="text" class="w-full px-4 py-2 rounded-sm border-gray-300 bg-white focus:outline-none" placeholder="ค้นหา..." v-model="searchQuery" />
                            <div v-if="searchQuery.length > 0" class="mt-2 text-gray-500">
                              ผลการค้นหา <span class="text-black font-semibold">{{ totalItems }}</span> รายการ (s)
                            </div>
                            <div v-else-if="listItems.length <= 0" class="mt-2">ไม่พบข้อมูล</div>
                            <button v-if="searchQuery.length > 0" @click="clearSearchQuery" type="button" class="ml-2 text-blue-500 hover:underline focus:outline-none">Clear</button>
                          </div>
                          <div class="flex justify-center">
                            <Pagination :current-page="currentPage" :total-items="totalItems" :total-pages="totalPages" :limit-items="limitItem" :data-loading="loading" :display-mode="'nav'" @page-changed="handlePageChanged" />
                          </div>
                        </div>
                      </div>
                      
                      <div class="grid grid-cols-2 md:grid-cols-6 p-2 bg-gray-200">
                        <div class="col-span-1 md:col-span-3 text-center text-sm font-semibold text-gray-900">ชื่อสินค้า</div>
                        <div class="text-center text-sm font-semibold text-gray-900 hidden md:block">ราคา</div>
                        <div class="text-center text-sm font-semibold text-gray-900 hidden md:block">สถานะ</div>
                        <div class="text-center text-sm font-semibold text-gray-900">เครื่องมือ</div>
                      </div>
                    </div>
                    
                    <div class="divide-y divide-gray-300 bg-white relative" :data-content="'กำลังติดต่อฐานข้อมูล กรุณารอสักครู่.....'" :class="[(activeBlock?'isblock' : 'isunblock')]">
                      <div v-for="(product, index) in listItems" :key="product._id" :class="index % 2 === 0 ? 'bg-gray-50 opacity-bg-gray-50' : 'bg-white'">
                        <div class="grid grid-cols-6 gap-1 p-2">
                          <div class="col-span-6 md:col-span-3">
                            <router-link :to="'/shop/product/'+product._id" class="text-gray-700 hover:text-indigo-600">
                              <div class="flex items-center">
                                <div class="mr-2 font-bold">{{(currentPage - 1) * limitItem + index + 1}}.</div>
                                <img v-if="product.cover" :src="product.cover" :alt="product.title" class="w-10 h-10 mr-2">
                                <div>
                                  {{ product.name }}
                                  <p class="font-normal text-gray-500 text-sm">{{ product.slug }}</p>
                                </div>
                              </div>
                            </router-link>
                          </div>
                          <div class="hidden md:block text-center text-gray-500">
                            <Price :regular="product.regularPrice" :sale="product.salePrice" />
                          </div>
                          <div class="hidden md:block text-center">
                            <StatusLabel :check="product.status" />
                          </div>
                          <div class="col-span-6 md:col-span-1">
                            <div class="flex items-center justify-center sm:justify-end">
                              
                              <div class="text-center justify-center">
                                <button @click="$router.push('/lesson/edit/' + product._id)" v-custom-tooltip="{ text: 'test', position: 'top' }" type="button" class="mr-1 inline-flex justify-center rounded-sm border border-gray-300 bg-white px-1 py-1 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2">
                                  <font-awesome-icon :icon="['fas','square-pen']" class="w-3 h-3 text-gray-600 mr-1 mt-1" />
                                  <span>แก้ไข</span>
                                </button>
                                <button @click="removeItem(product._id, product.master, product.name)" type="button" class="mr-1 inline-flex justify-center rounded-sm border border-gray-300 bg-white px-1 py-1 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2">
                                  <font-awesome-icon :icon="['fas','trash-can']" class="w-3 h-3 text-gray-600 mr-1 mt-1" />
                                  <span>ลบ</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div class="grid grid-cols-3 pl-1 pr-1">
                          <div class="col-span-2">
                            <p class="font-medium mt-1">
                              <template v-if="Array.isArray(product.categoryData) && product.categoryData.length > 0">
                                <a v-for="(categoryItem, index) in product.categoryData" :key="categoryItem._id" :href="index === 0 && !isMobile ? '#' : undefined" class="text-xs font-medium bg-indigo-600 pl-2 pr-2 pt-1 pb-1 mr-1 rounded text-white" :class="{ 'hidden sm:inline-block': index > 0 || isMobile }">
                                  {{ categoryItem.name }}
                                </a>
                              </template>
                              <template v-else>
                                <span class="text-xs font-medium bg-gray-600 pl-2 pr-2 pt-1 pb-1 mr-1 rounded text-white">ยังไม่มีหมวดหมู่</span>
                              </template>
                            </p>
                            
                          </div>
                          <div class="col-span-1 flex justify-end">
                            <span class="mt-1 text-base font-medium pl-2 pr-2 pt-1 pb-1 mr-1 rounded text-gray-300">{{ product.option }} / {{ product.type }}</span>
                          </div>
                        </div>

                      </div>
                      <div class="p-0 m-0 bg-gray-50">
                        <div colspan="6" class="p-3 m-0">
                          <div class="text-center">
                            <Pagination :current-page="currentPage" :total-items="totalItems" :total-pages="totalPages" :limit-items="limitItem" :data-loading="loading" :display-mode="'summary'" @page-changed="handlePageChanged" />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                  </div>
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
  .opacity-bg-indigo-50 {
    background-color: rgba(125, 150, 178, 0.5); /* Adjust the RGB color values and opacity as needed */
  }
</style>