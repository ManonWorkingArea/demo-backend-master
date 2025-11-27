<script>

// Component
import feather from 'feather-icons';
import Loader from '@/interface/template/Loader.vue';
import Breadcrumbs from '@/interface/template/outline/Breadcrumbs.vue';
import storageManager from '@/plugins/storage';

export default {
    inject: ['apiServer'],
    data() {
      return {
        accessToken: storageManager.get('session','token'),
        listItems: [],
        dataItem: this.$route.params.id,
        configs: storageManager.get('configs'),
        loading_sources: true,
      }
    },
    components: {
      Loader,
      Breadcrumbs
    },
    methods: {
      async getData() {
        if(storageManager.get('session','login')) {
          try {
            this.loading_sources = false;

            const resAPI   = await fetch("https://gateway.cloudrestfulapi.com/api/user/query", {
                method: 'POST',
                headers: {'Content-Type': 'application/json','client-token-key':this.configs.key},
                body: JSON.stringify({
                    "method": "find",
                    "args": [{ "role": "admin" },{ "parent": this.configs.siteID }]
                })
            });

            const RestReturn   = await resAPI.json();
            console.log(RestReturn);

            this.listItems        = RestReturn;
            this.loading_sources  = true;

          } catch (error) {
            console.log(error)
          }
        }
      },
      async assignAdmin(id) {
        try {
          this.activeBlock = true;
          const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/user/" + id + "/unit", {
            method: 'POST',
            headers: {'Content-Type': 'application/json','client-token-key':this.configs.key},
            body: JSON.stringify({
              action: "add",
              element: this.dataItem,
              type: "string",
            })
          });
          const finalRes   = await resAPI.json();

          if(resAPI.status === 200) {
            window.location.href = "/website/detail/" + this.dataItem
          }

          console.log(finalRes);
        } catch (error) {
          console.log(error)
        }
      },
      async deleteData(id) {
        if(storageManager.get('session','login')) {
          try {
            this.loading_sources = false;
            console.log("id",id)
            const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/user/" + id, {
              method: 'DELETE',
              headers: {'Content-Type': 'application/json','client-token-key':this.configs.key},
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

  <breadcrumbs v-if="loading_sources"
  :navigation="
  [
    {
      name: 'ย้อนกลับ',
      link: '/website/detail/' + this.dataItem,
      style: 'chevron-left'
    },
    {
      name: 'เพิ่มผู้ดูแลระบบ',
      link: '/website/user/add/' + this.dataItem,
      style: 'plus'
    }
  ]"
  /> 

  <div class="flex-1 pb-8 bg-gray-100 pt-2 pb-5 border-t" v-if="loading_sources">
    <div class="mt-8">
      <div class="mx-auto max-w-7xl px-6 sm:px-6 lg:px-6">

        <div class="mt-8 flex flex-col">
          <div class="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div class="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">

              <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">

                <table class="min-w-full divide-y divide-gray-300">
                  <thead class="bg-gray-50">
                    <tr>
                      <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">#</th>
                      <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">ชื่อ</th>
                      <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">ชื่อบัญชี</th>
                      <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">อีเมล์</th>
                      <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">โทร</th>
                      <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">ผู้ดูแล</th>
                      <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">เครื่องมือ</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-200 bg-white">
                    
                    <tr v-for="(admin, index) in listItems" :key="admin._id">
                      <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{{index+1}}</td>
                      <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <a :href="'/origin/user/detail/'+admin._id" class="text-gray-500 hover:text-indigo-900">
                        {{ admin.firstname }} {{ admin.lastname }}
                        </a>
                      </td>
                      <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ admin.username }}</td>
                      <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ admin.email }}</td>
                      <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ admin.phone }}</td>
                      <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ admin.unit ? (admin.unit.length > 0 ? admin.unit.length : '0') : '0' }} Unit</td>
                      <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-md font-medium sm:pr-6">
                        <!-- Use a conditional statement to hide the buttons if superadmin.collection is not empty -->

                          <button @click="assignAdmin(admin._id)" type="button" class="mr-2 inline-flex justify-center rounded-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2">
                            <font-awesome-icon :icon="['fas','square-pen']" class="text-black mt-[3px] mr-2 text-md"/>
                            <span>เลือก</span>
                          </button>
                          <button @click="deleteAdmin(admin._id)" type="button" class="inline-flex justify-center rounded-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2">
                            <font-awesome-icon :icon="['fas','trash-can']" class="text-black mt-[3px] mr-2 text-md"/>
                            <span>ลบ</span>
                          </button>

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
</template>