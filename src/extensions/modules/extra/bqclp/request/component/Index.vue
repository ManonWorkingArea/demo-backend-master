<script>

// Component
import feather      from 'feather-icons';
import {useRoute} 	from 'vue-router'
import storageManager from '@/plugins/storage';
import Loader       from '@/interface/template/Loader.vue';

import Subhead from '@/interface/template/outline/Subhead.vue';
import Pagination from '@/utils/Paginated.vue';

export default {
    data() {
      const route   = useRoute();
      const session = storageManager.get('session')
      return {
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
        bqclp: storageManager.get('bqclp'),
        limitItem:30,
        currentPage: 1,
        totalPages: 0,
        totalItems: 0,
        loading: false,
        showingOverlay: false,
        searchQuery: "",
        statusFilter:"all",
        expandedRowIndex: null,
      }
    },
    components: {
      Loader,
      Subhead,
      Pagination,
    },
    methods: {
      toggleAccordion(index) {
        if (this.expandedRowIndex === index) {
          this.expandedRowIndex = null;
        } else {
          this.expandedRowIndex = index;
        }
      },
      async getRequest() {
        const apiUrl = 'https://sea-turtle-app-hit8g.ondigitalocean.app/query';
        let cate = 1;
        let StrSql = "test_inet_SelectReq " + cate + ", ";
        StrSql += "'" + this.bqclp.uss_id + "', Null, Null, Null, Null";
        const requestBody = {
          StrSql: StrSql,
        };

        try {
          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
          });

          if (response.ok) {
            const data = await response.json();
            this.listItems = data.data;
            console.log(data);
          } else {
            throw new Error('Request failed with status ' + response.status);
          }
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      },
      updated() {
        feather.replace();
      },
    },
    async mounted () {
      try {
        await this.getRequest();
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
  <div v-if="loading_sources">

    <Subhead
      :navigation="
      [
      {
          name: 'ย้อนกลับ',
          link: '/cms/content',
          style: 'chevron-left',
          class: 'default-btn',
          visible: true,
          type: 'button',
      },
      ]"
  />
  
    <div class="flex-1 pb-8 bg-gray-100 pt-2 pb-5 border-t">
      <div class="mt-8">
        <div class="mx-auto max-w-7xl px-6 sm:px-6 lg:px-6">

          <div class="mt-8 flex flex-col">
            <div class="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div class="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">

                  <div class="relative">
                    <div
                      v-if="showingOverlay"
                      class="fixed top-0 left-0 w-full h-full bg-white bg-opacity-75 backdrop-filter backdrop-blur-lg flex items-center justify-center"
                      @click="hideOverlay"
                      style="z-index: 9999;"
                    >
                      <div class="flex flex-col items-left">
                        <input
                          type="text"
                          class="px-4 py-2 rounded-lg bg-white w-80 focus:outline-none"
                          placeholder="พิมพ์ข้อความที่ต้องการค้นหา..."
                          v-model="searchQuery"
                          @click.stop
                        />
                        <div v-if="listItems.length > 0" class="text-left mt-2 text-gray-500">
                          ผลการค้นหา <span class="text-black font-semibold">{{ listItems.length }}</span> รายการ(s)
                        </div>
                        <div v-else class="text-left mt-2">
                          ไม่พบข้อมูล
                        </div>
                      </div>
                    </div>
                  </div>

                  
                  <table class="w-full divide-y divide-gray-300">
                    <thead class="bg-gray-50">
                      <tr>
                        <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">#</th>
                        <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">เลขที่คำขอ</th>
                        <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">ต.ย./รายการฯ</th>
                        <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">วันที่สร้าง</th>
                        <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">สถานะ</th>
                        <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">สถานะ</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200 bg-white">
                      <template v-for="(req, index) in listItems" :key="index">
                        <tr @click="toggleAccordion(index)" class="cursor-pointer hover:bg-gray-100">
                          <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                            {{ (currentPage - 1) * limitItem + index + 1 }}
                          </td>
                          <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ req.req_no }}</td>
                          <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ req.total_test }} / {{ req.TotalItem }}</td>
                          <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ req.CreateDate }}</td>
                          <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ req.ReqStatus }}</td>
                          <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500"><!--<pre>{{ req }}</pre>--></td>
                        </tr>
                        <tr v-show="expandedRowIndex === index">
                          <td colspan="5">
                            <div class="grid grid-cols-4 gap-2 p-3">

                              <div class="col-span-2">
                                <div class="font-semibold">	กิจกรรม:</div>
                                <div>{{ req.ActivityName }}</div>
                              </div>

                              <div>
                                <div class="font-semibold">	ชนิดตัวอย่าง:</div>
                                <div>{{ req.SampleName }}</div>
                              </div>

                              <div>
                                <router-link :to="'/bqclp_request/request/' + req.req_no" class="px-4 py-2 text-sm font-medium text-white bg-green-500 rounded hover:bg-green-600 focus:outline-none focus:bg-green-600 mr-3">
                                  <font-awesome-icon :icon="['fas', 'file']" /> คำขอ
                                </router-link>
                                <button class="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none focus:bg-blue-600 mr-3"><font-awesome-icon :icon="['fas', 'pencil-alt']" /> ตัวอย่าง</button>
                                <button class="px-4 py-2 text-sm font-medium text-white bg-gray-500 rounded hover:bg-gray-600 focus:outline-none focus:bg-gray-600"><font-awesome-icon :icon="['fas', 'trash']" /> ลบ</button>
                              </div>

                            </div>

                            <div class="grid grid-cols-4 gap-2 p-3">

                              <div class="col-span-4">
                                <div class="font-semibold">รายการตรวจ	:</div>
                                <div>{{ req.AllItemName }}</div>
                              </div>

                            </div>

                          </td>
                        </tr>
                      </template>
                    </tbody>
                  </table>

                </div>
                
                <Pagination :current-page="currentPage" :total-items="totalItems" :total-pages="totalPages" :limit-items="limitItem" @page-changed="handlePageChanged" />
                
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