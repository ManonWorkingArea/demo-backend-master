<script>

// Component
import feather from 'feather-icons';
import Loader from '@/interface/template/Loader.vue';
import Subhead from '@/interface/template/outline/Subhead.vue';
import storageManager from '@/plugins/storage';

export default {
    inject: ['apiServer'],
    data() {
      return {
        hostkey:this.$Key,
        accessToken: storageManager.get('session','token'),
        listItems: [],
        dataItem: this.$route.params.id,
        loading_sources: true,
      }
    },
    components: {
      Loader,
      Subhead
    },
    methods: {
      async getData() {
        if(storageManager.get('session','login')) {
          try {
            this.loading_sources = false;

            const resAPI   = await fetch("https://gateway.cloudrestfulapi.com/api/user/query", {
                method: 'POST',
                headers: {'Content-Type': 'application/json','client-token-key':this.hostkey},
                body: JSON.stringify({
                    "method": "find",
                    "args": [{ "role": "superadmin" }]
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
          this.loading_sources = false;
          const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/user/" + id + "/collection", {
            method: 'POST',
            headers: {'Content-Type': 'application/json','client-token-key':this.hostkey},
            body: JSON.stringify({
              action: "add",
              element: this.dataItem,
              type: "string",
            })
          });

          if(resAPI.status === 200) {
            console.log("Admin assigned successfully");
            await this.getData(); // Refresh the list instead of redirect
          } else {
            console.log("Error assigning admin");
          }

          this.loading_sources = true;
        } catch (error) {
          console.log(error);
          this.loading_sources = true;
        }
      },
      async deleteData(id) {
        if(storageManager.get('session','login')) {
          try {
            this.loading_sources = false;
            console.log("Removing admin with id:", id)
            
            const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/user/" + id + "/collection", {
              method: 'POST',
              headers: {'Content-Type': 'application/json','client-token-key':this.hostkey},
              body: JSON.stringify({
                action: "remove",
                element: this.dataItem,
                type: "string",
              })
            });

            if(resAPI.status === 200) {
              console.log("Admin removed successfully");
              await this.getData(); // Refresh the list
            } else {
              console.log("Error removing admin");
            }

            this.loading_sources = true;

          } catch (error) {
            console.log(error);
            this.loading_sources = true;
          }
        }
      },
      isAdminAssignedToCollection(admin) {
        return admin.collection && admin.collection.includes(this.dataItem);
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
        name: 'ย้อนกลับ',
        link: '/origin/collection/detail/' + this.dataItem,
        style: 'chevron-left',
        class: 'default-btn',
        visible: true,
        type: 'button',
      },
      {
        name: 'เพิ่มผู้ดูแลระบบ',
        link: '/origin/user/add/' + this.dataItem,
        style: 'plus',
        class: 'primary-btn',
        visible: true,
        type: 'button',
      },
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
                    
                    <tr v-for="(superadmin, index) in listItems" :key="superadmin._id">
                      <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{{index+1}}</td>
                      <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <a :href="'/origin/user/detail/'+superadmin._id" class="text-gray-500 hover:text-indigo-900">
                        {{ superadmin.firstname }} {{ superadmin.lastname }}
                        </a>
                      </td>
                      <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ superadmin.username }}</td>
                      <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ superadmin.email }}</td>
                      <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ superadmin.phone }}</td>
                      <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ superadmin.collection ? superadmin.collection.length : 0 }} Collection(s)</td>
                      <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-md font-medium sm:pr-6">
                        <!-- Show assign button if admin is not assigned to current collection -->
                        <template v-if="!isAdminAssignedToCollection(superadmin)">
                          <button @click="assignAdmin(superadmin._id)" type="button" class="mr-2 inline-flex justify-center rounded-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2">
                            <font-awesome-icon :icon="['fas','square-pen']" class="text-black mt-[3px] mr-2 text-md"/>
                            <span>เลือก</span>
                          </button>
                        </template>

                        <!-- Show remove button if admin is assigned to current collection -->
                        <template v-else>
                          <button @click="deleteData(superadmin._id)" type="button" class="mr-2 inline-flex justify-center rounded-md border border-red-300 bg-red-50 px-2 py-2 text-sm font-medium text-red-700 shadow-sm hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">
                            <font-awesome-icon :icon="['fas','trash-can']" class="text-red-600 mt-[3px] mr-2 text-md"/>
                            <span>ลบออก</span>
                          </button>
                          <span class="text-sm text-green-600">
                            <font-awesome-icon :icon="['fas','check']" class="text-green-600 mt-[3px] mr-1 text-sm"/> 
                            Assigned แล้ว
                          </span>
                        </template>
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