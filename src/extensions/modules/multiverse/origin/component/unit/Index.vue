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

            const resCollections = await fetch("https://gateway.cloudrestfulapi.com/api/hostname/query", {
              method: 'POST',
              headers: {'Content-Type': 'application/json','client-token-key':this.hostkey},
              body: JSON.stringify({
                method: 'find',
                args: [
                  { 
                    siteType: 'collection' 
                  }
                ]
              })
            });

            const collections = await resCollections.json();

            for (const collection of collections) {
              const resAssets = await fetch("https://gateway.cloudrestfulapi.com/api/hostname/query", {
                method: 'POST',
                headers: {'Content-Type': 'application/json','client-token-key':this.hostkey},
                body: JSON.stringify({
                  method: 'find',
                  args: [
                    {
                      $and: [
                        { siteType: 'asset' },
                        { parent: collection._id }
                      ]
                    }
                  ]
                })
              });
              const assets = await resAssets.json();
              
              collection.assetsCount = assets.length;
            }

            this.listItems = collections;
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
  <Subhead  v-if="loading_sources" 
    :navigation="
    [
      {
        name: 'เพิ่ม Collection',
        link: '/origin/collection/add',
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

              <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                
                
                <div v-for="(collection) in listItems" :key="collection._id" class="relative bg-white rounded-lg shadow-md overflow-hidden">
                  <img class="w-full h-48 object-cover" :src="collection.loginBg ? collection.loginBg : 'https://picsum.photos/seed/picsum/200/300'" alt="Placeholder image">
                  <div class="absolute top-2 right-2 bg-black text-white px-2 py-1 text-sm font-normmal rounded-md"><font-awesome-icon :icon="['fas','globe']" class="text-white mt-[3px] mr-2 text-md"/> {{collection.assetsCount}} Assets</div>
                  <div class="p-4">
                    <a :href="'/origin/collection/detail/'+collection._id" class="font-bold text-gray-600 hover:underline">{{ collection.siteName }}</a>
                    <p class="text-sm text-gray-400"><font-awesome-icon :icon="['fas','globe']" class="text-black mt-[3px] mr-1 text-md"/> {{ collection.hostname }}</p>
                  </div>
                  <div class="bg-gray-100 border-t-2 border-gray-200 py-2 px-4 flex justify-between items-center">
                    <a href="javascript:void(0);" @click="$router.push('/origin/collection/edit/'+ collection._id)" class="text-gray-900 hover:text-gray-500 text-md font-medium">
                      <font-awesome-icon :icon="['fas','square-pen']" class="text-black mt-[3px] mr-2 text-md"/>
                      <span>แก้ไข</span>
                    </a>

                    <a href="javascript:void(0);" @click="$router.push('/origin/collection/admin/'+ collection._id)" class="text-gray-900 hover:text-gray-500 text-md font-medium">
                      <font-awesome-icon :icon="['fas','user-tie']" class="text-black mt-[3px] mr-2 text-md"/>
                      <span>ผู้ดูแล</span>
                    </a>

                    <a href="#" class="text-gray-900 hover:text-gray-500 text-md font-medium">
                      <font-awesome-icon :icon="['fas','trash-can']" class="text-black mt-[3px] mr-2 text-md"/>
                      <span>ลบ</span>
                    </a>
                  </div>
                </div>

                <a :href="'/origin/collection/add'" class="bg-white p-10 rounded-lg shadow-md overflow-hidden flex flex-col items-center justify-center cursor-pointer">
                  <div class="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center hover:opacity-70">
                    <font-awesome-icon :icon="['fas','plus']" class="text-3xl"/>
                  </div>
                  <p class="text-gray-500 mt-2 text-center">Add Collection</p>
                </a>
                
              </div>
              
            </div>
          </div>
        </div>


    </div>
  </div>
</div>
</template>