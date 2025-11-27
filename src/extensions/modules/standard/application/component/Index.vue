<script>

// Component
import feather from 'feather-icons';
import Loader from '@/interface/template/Loader.vue';
import Subhead from '@/interface/template/outline/Subhead.vue';
import storageManager from '@/plugins/storage';
import convertUtils from "@/plugins/convertUtils";

export default {
    data() {
      return {
        accessToken: storageManager.get('session','token'),
        configs: storageManager.get('configs'),
        session: storageManager.get('session'),
        listItems: [],
        loading_sources: true,
      }
    },
    components: {
      Loader,
      Subhead
    },
    methods: {
      formatThaidate(date) {
        return convertUtils.toThaiDatetime(date,"short");
      },
      async getData() {
        if(storageManager.get('session','login')) {
          try {
            this.loading_sources = false;

            const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/application/query", {
              method: 'POST',
              headers: {'Content-Type': 'application/json','client-token-key':this.configs.key},
              body: JSON.stringify({
                method: 'find',
                args: [
                  {
                    $and: [
                      { parent: this.session.current._id }
                    ]
                  }
                ]
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
      async deleteData(id) {
        if(storageManager.get('session','login')) {
          try {
            this.loading_sources = false;
            console.log("id",id)
            const resAPI = await fetch("https://asia-southeast2-elearning-6871c.cloudfunctions.net/application/" + id, {
              method: 'DELETE',
              headers: {'Content-Type': 'application/json','Authorization': 'Bearer ' + this.accessToken},
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
        name: 'เพิ่ม Application',
        link: '/application/new',
        style: 'plus',
        class: 'primary-btn',
        visible: true,
        type: 'button',
      }
    ]"
  />

  <div class="flex-1 pb-8 bg-gray-100 pt-2 pb-5 border-t" v-if="loading_sources">
    <div class="mt-8">
      <div class="mx-auto max-w-7xl px-6 sm:px-6 lg:px-6">

        <div class="mt-8 flex flex-col">
          <div class="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div class="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">

              <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">

                <div v-for="(application) in listItems" :key="application._id" class="relative overflow-hidden rounded-lg shadow-md">

                  <div class="p-4 bg-white">

                    <router-link :to="'/application/view/'+application._id" class="font-bold text-gray-600 hover:underline">
                      {{ application.name }}
                    </router-link>

                    <p class="text-sm text-gray-400">{{ application.slug }}</p>
                    <p class="text-sm text-gray-600 mt-4 leading-snug">Lorem ipsum dolor sit amet, consectetur adipiscing elit</p>
                    <div class="flex items-center justify-between mt-4">
                      <div class="flex items-center">
                        <div class="ml-0">
                          <p class="text-sm font-medium text-gray-900">{{ application.type }}</p>
                          <p class="text-sm font-medium text-gray-500">{{ formatThaidate(application.createdAt) }}</p>
                        </div>
                      </div>
                    </div>

                  </div>

                  <div class="bg-white border-t border-gray-200 py-2 px-4 flex justify-between items-center">
                    <div class="bg-gray-200 p-2 w-12 text-center">10</div>
                    <div class="text-left">ผู้สมัคร</div>
                    <span>
                      <router-link
                        v-if="application.status && application.status.length > 0"
                        :to="'/application/apply/' + application._id + '/' + application.status[0].slug"
                        class="text-gray-900 hover:text-gray-500 text-md font-medium"
                      >
                        <font-awesome-icon :icon="['fas','pencil']" class="text-black mt-[3px] mr-2 text-md"/>
                        <span>ดูข้อมูล</span>
                      </router-link>

                      <span v-else class="text-gray-400 text-md font-medium">
                        No status available
                      </span>
                    </span>
                  </div>

                  <div class="bg-white border-t border-gray-200 py-2 px-4 flex justify-between items-center">
                    <div class="bg-gray-200 p-2 w-12 text-center">10</div>
                    <div class="text-left">สถานะการทำรายการ</div>
                    <span>
                      <router-link :to="'/application/status/' + application._id" class="text-gray-900 hover:text-gray-500 text-md font-medium">
                        <font-awesome-icon :icon="['fas','pencil']" class="text-black mt-[3px] mr-2 text-md"/>
                        <span>จัดการ</span>
                      </router-link>
                    </span>
                  </div>

                  <div class="bg-white border-t border-gray-200 py-2 px-4 flex justify-between items-center">
                    <div class="bg-gray-200 p-2 w-12 text-center">10</div>
                    <div class="text-left">เอกสารที่ต้องการ</div>
                    <span>
                      <router-link :to="'/application/document/' + application._id" class="text-gray-900 hover:text-gray-500 text-md font-medium">
                        <font-awesome-icon :icon="['fas','pencil']" class="text-black mt-[3px] mr-2 text-md"/>
                        <span>จัดการ</span>
                      </router-link>
                    </span>
                  </div>

                  <div class="bg-white border-t border-gray-200 py-2 px-4 flex justify-between items-center">
                    <div class="bg-gray-200 p-2 w-12 text-center">10</div>
                    <div class="text-left">แบบฟอร์ม</div>
                    <span>
                      <router-link :to="'/application/form/' + application._id" class="text-gray-900 hover:text-gray-500 text-md font-medium">
                        <font-awesome-icon :icon="['fas','pencil']" class="text-black mt-[3px] mr-2 text-md"/>
                        <span>จัดการ</span>
                      </router-link>
                    </span>
                  </div>
                
                  <div class="bg-gray-100 border-t-2 border-gray-200 py-2 px-4 flex justify-between items-center">

                    <a href="#" class="text-gray-900 hover:text-gray-500 text-md font-medium">
                      <font-awesome-icon :icon="['fas','trash-can']" class="text-black mt-[3px] mr-2 text-md"/>
                      <span>ลบ</span>
                    </a>

                    <a href="#" class="text-gray-900 hover:text-gray-500 text-md font-medium">
                      <font-awesome-icon :icon="['fas','trash-can']" class="text-black mt-[3px] mr-2 text-md"/>
                      <span>ลบ</span>
                    </a>

                    <router-link :to="'/application/edit/' + application._id" class="text-gray-900 hover:text-gray-500 text-md font-medium">
                      <font-awesome-icon :icon="['fas','square-pen']" class="text-black mt-[3px] mr-2 text-md"/>
                      <span>แก้ไข</span>
                    </router-link>
                    
                  </div>
                </div>

                <a :href="'/application/new'" class="bg-white p-10 rounded-lg shadow-md overflow-hidden flex flex-col items-center justify-center cursor-pointer p-10">
                  <div class="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center hover:opacity-70">
                    <font-awesome-icon :icon="['fas','plus']" class="text-3xl"/>
                  </div>
                  <p class="text-gray-500 mt-2 text-center">Add New Application</p>
                </a>
                
              </div>
              
            </div>
          </div>
        </div>
    </div>
  </div>
</div>
</template>