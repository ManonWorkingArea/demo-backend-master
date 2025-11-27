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
        configs: storageManager.get('configs'),
        listItems: [],
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

            const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/hostname/query", {
              method: 'POST',
              headers: {'Content-Type': 'application/json','client-token-key':this.configs.key},
              body: JSON.stringify({
                method: 'find',
                args: [
                  {
                    $and: [
                      { siteType: 'unit' },
                      { parent: this.configs.siteID }
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
            const resAPI = await fetch("https://asia-southeast2-elearning-6871c.cloudfunctions.net/schools/" + id, {
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

  <breadcrumbs v-if="loading_sources"
  :navigation="
  [
    {
      name: 'เพิ่ม Website',
      link: '/bqclp_website/add',
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

              <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                
                <div v-for="(asset) in listItems" :key="asset._id" class="bg-white rounded-lg shadow-md overflow-hidden">
                  <img class="w-full h-48 object-cover" :src="asset.loginBg ? asset.loginBg : 'https://picsum.photos/seed/picsum/200/300'" alt="Placeholder image">
                  <div class="p-4">
                    <a :href="'/bqclp_website/detail/'+asset._id" class="font-bold text-gray-600 hover:underline">{{ asset.siteName }}</a>
                    <p class="text-sm text-gray-400"><font-awesome-icon :icon="['fas','globe']" class="text-black mt-[3px] mr-1 text-md"/> {{ asset.hostname }}</p>
                  </div>
                  <div class="bg-gray-100 border-t-2 border-gray-200 py-2 px-4 flex justify-between items-center">
                    <a href="javascript:void(0);" @click="$router.push('/bqclp_website/edit/'+ asset._id)" class="text-gray-900 hover:text-gray-500 text-md font-medium">
                      <font-awesome-icon :icon="['fas','square-pen']" class="text-black mt-[3px] mr-2 text-md"/>
                      <span>แก้ไข</span>
                    </a>

                    <a href="javascript:void(0);" @click="$router.push('/bqclp_website/admin/'+ asset._id)" class="text-gray-900 hover:text-gray-500 text-md font-medium">
                      <font-awesome-icon :icon="['fas','user-tie']" class="text-black mt-[3px] mr-2 text-md"/>
                      <span>ผู้ดูแล</span>
                    </a>

                    <a href="#" class="text-gray-900 hover:text-gray-500 text-md font-medium">
                      <font-awesome-icon :icon="['fas','trash-can']" class="text-black mt-[3px] mr-2 text-md"/>
                      <span>ลบ</span>
                    </a>
                  </div>
                </div>

                <a :href="'/bqclp_website/add'" class="bg-white p-10 rounded-lg shadow-md overflow-hidden flex flex-col items-center justify-center cursor-pointer p-10">
                  <div class="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center hover:opacity-70">
                    <font-awesome-icon :icon="['fas','plus']" class="text-3xl"/>
                  </div>
                  <p class="text-gray-500 mt-2 text-center">Add Website</p>
                </a>
                
              </div>
              
            </div>
          </div>
        </div>


    </div>
  </div>
</div>
</template>