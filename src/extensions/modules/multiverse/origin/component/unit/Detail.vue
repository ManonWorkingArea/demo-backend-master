<script>

// Component
import feather from 'feather-icons';
import Loader from '@/interface/template/Loader.vue';
import Subhead from '@/interface/template/outline/Subhead.vue';
import storageManager from '@/plugins/storage';
import moment from 'moment';
moment().format();

export default {
    inject: ['apiServer'],
    data() {
      return {
        hostkey:this.$Key,
        collectionData: [],
        assetData: [],
        collectionAdmin: [],
        dataItem: this.$route.params.id,
        loading_sources: true,
      }
    },
    components: {
      Loader,Subhead
    },
    methods: {
      dateTime(value) {
        return moment(value).format("DD/MM/YYYY hh:mm:ss");
      },
      async getData() {
        if(storageManager.get('session','login')) {
          try {
            let item              = this.$route.params.id;
            this.loading_sources  = false;
            const resAPI          = await fetch("https://gateway.cloudrestfulapi.com/api/hostname/" + item,
            {
              method: 'GET',
              headers: {'Content-Type':'application/json','client-token-key':this.hostkey},
            });

            const collectionRes   = await resAPI.json();
            // console.log("collectionRes",collectionRes);

            if(resAPI.status === 200) {

              const adminRes           = await this.getAdminData()
              // console.log("adminRes",adminRes);

              if(adminRes) {

                const assetRes          = await this.getAssetsData()
                // console.log("assetRes",assetRes);

                if(assetRes) {
                  this.collectionAdmin  = adminRes;
                  this.assetData        = assetRes;
                  this.collectionData   = collectionRes;
                  this.loading_sources  = true;
                }
              }
            }
            this.loading_sources = true;

          } catch (error) {
            console.log(error)
          }
        }
      },
      async getAdminData() {
        if(storageManager.get('session','login')) {
          try {

            let item  = this.$route.params.id;

            const resAPI   = await fetch("https://gateway.cloudrestfulapi.com/api/user/query", {
                method: 'POST',
                headers: {'Content-Type':'application/json','client-token-key':this.hostkey},
                body: JSON.stringify({
                    method: "find",
                    args: [
                    {
                      "collection": {
                        $in: [item]
                      }
                    }
                  ]
                })
            });

            const adminRes   = await resAPI.json();
            // console.log("getAdminData",adminRes);
            
            return adminRes

          } catch (error) {
            console.log(error)
          }
        }
      },
      async getAssetsData() {
        if(storageManager.get('session','login')) {
          try {

            let item  = this.$route.params.id;

            const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/hostname/query", {
              method: 'POST',
              headers: {'Content-Type':'application/json','client-token-key':this.hostkey},
              body: JSON.stringify({
                method: 'find',
                args: [
                  {
                    $and: [
                      { siteType: 'asset' },
                      { parent: item }
                    ]
                  }
                ]
              })
            });

            const assetRes   = await resAPI.json();
            
            return assetRes

          } catch (error) {
            console.log(error)
          }
        }
      },
      async deleteData(id) {
        if(storageManager.get('session','login')) {
          try {
            this.loading_sources = false;
            let accessToken       = storageManager.get('session','token')
            let item              = this.$route.params.id;
            const resAPI          = await fetch("https://asia-southeast2-elearning-6871c.cloudfunctions.net/schools/removeAdmin/" + item,
            {
              method: 'POST',
              headers: {'Content-Type':'application/json','Authorization': 'Bearer ' + accessToken},
              body: JSON.stringify({
                userId: id,
              })
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
        name: 'ย้อนกลับ',
        link: '/origin/collection',
        style: 'chevron-left',
        class: 'default-btn',
        visible: true,
        type: 'button',
      },
    ]"
  />

  <div v-if="loading_sources" class="mt-8 mx-auto max-w-3xl px-4 sm:px-6 md:flex md:items-center md:justify-between md:space-x-5 lg:max-w-7xl lg:px-8">
    
    <div class="flex items-center space-x-5">
      <div class="flex-shrink-0">
        <div class="relative">
          <img class="h-16" :src="collectionData.loginLogo" alt="">
          <span class="absolute inset-0" aria-hidden="true"></span>
        </div>
      </div>
      <div>
        <h1 class="text-2xl font-bold text-gray-900">{{ this.collectionData.siteName }}</h1>
        <p class="text-sm font-medium text-gray-500">
          Update at <font-awesome-icon :icon="['fas','calendar']"/> <span class="pl-1">{{ this.collectionData.updatedAt }}</span>
        </p>
      </div>
    </div>

    <div class="justify-stretch mt-6 flex flex-col-reverse space-y-4 space-y-reverse sm:flex-row-reverse sm:justify-end sm:space-y-0 sm:space-x-3 sm:space-x-reverse md:mt-0 md:flex-row md:space-x-3">
      
      <button 
      @click="$router.push('/origin/collection/edit/' + this.dataItem)"
      type="button" 
      class="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-100">
      <font-awesome-icon :icon="['fas','pencil']" class="text-black text-[12px] mr-2"/> แก้ไขข้อมูล
      </button>

      <template v-if="collectionAdmin.length === 0">
        <button
        @click="$router.push('/origin/collection/admin/'+this.dataItem)"
        type="button" 
        class="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-100">
        <font-awesome-icon :icon="['fas','user-tie']" class="text-black text-[12px] mr-2"/> เลือกผู้ดูแลระบบ
        </button>
      </template>

      <button 
      type="button" 
      class="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-100">
      <font-awesome-icon :icon="['fas','trash']" class="text-black text-[12px] mr-2"/> ลบ
      </button>

    </div>
  </div>

  <div v-if="loading_sources" class="mx-auto mt-8 grid max-w-3xl grid-cols-1 gap-6 sm:px-6 lg:max-w-7xl lg:grid-flow-col-dense lg:grid-cols-3">
    <div class="space-y-6 lg:col-span-2 lg:col-start-1">
      <!-- Description list-->
      <section aria-labelledby="applicant-information-title">
        <div class="bg-white shadow sm:rounded-lg">
          <div class="px-2 py-3 sm:px-3">
            <h2 id="applicant-information-title" class="text-lg font-medium leading-6 text-gray-900">Collection Information</h2>
            <p class="mt-1 max-w-2xl text-sm text-gray-500">Personal details and application.</p>
          </div>
          <div class="border-t border-gray-200 px-4 py-5 sm:px-6">
            <dl class="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">

              <div class="sm:col-span-1">
                <dt class="text-sm font-medium text-gray-500">Sitename</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ this.collectionData.siteName }}</dd>
              </div>

              <div class="sm:col-span-1">
                <dt class="text-sm font-medium text-gray-500">Hostname</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ this.collectionData.hostname }}</dd>
              </div>

              <div class="sm:col-span-2">
                <dt class="text-sm font-medium text-gray-500">หลักฐานประกอบการสมัคร</dt>
                <dd class="mt-1 text-sm text-gray-900">
                  <ul role="list" class="divide-y divide-gray-200 rounded-md border border-gray-200">
                    <li class="flex items-center justify-between py-3 pl-3 pr-4 text-sm">
                      <div class="flex w-0 flex-1 items-center">
                        <!-- Heroicon name: mini/paper-clip -->
                        <svg class="h-5 w-5 flex-shrink-0 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fill-rule="evenodd" d="M15.621 4.379a3 3 0 00-4.242 0l-7 7a3 3 0 004.241 4.243h.001l.497-.5a.75.75 0 011.064 1.057l-.498.501-.002.002a4.5 4.5 0 01-6.364-6.364l7-7a4.5 4.5 0 016.368 6.36l-3.455 3.553A2.625 2.625 0 119.52 9.52l3.45-3.451a.75.75 0 111.061 1.06l-3.45 3.451a1.125 1.125 0 001.587 1.595l3.454-3.553a3 3 0 000-4.242z" clip-rule="evenodd" />
                        </svg>
                        <span class="ml-2 w-0 flex-1 truncate">resume_front_end_developer.pdf</span>
                      </div>
                      <div class="ml-4 flex-shrink-0">
                        <a href="#" class="font-medium text-blue-600 hover:text-blue-500">Download</a>
                      </div>
                    </li>

                    <li class="flex items-center justify-between py-3 pl-3 pr-4 text-sm">
                      <div class="flex w-0 flex-1 items-center">
                        <!-- Heroicon name: mini/paper-clip -->
                        <svg class="h-5 w-5 flex-shrink-0 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fill-rule="evenodd" d="M15.621 4.379a3 3 0 00-4.242 0l-7 7a3 3 0 004.241 4.243h.001l.497-.5a.75.75 0 011.064 1.057l-.498.501-.002.002a4.5 4.5 0 01-6.364-6.364l7-7a4.5 4.5 0 016.368 6.36l-3.455 3.553A2.625 2.625 0 119.52 9.52l3.45-3.451a.75.75 0 111.061 1.06l-3.45 3.451a1.125 1.125 0 001.587 1.595l3.454-3.553a3 3 0 000-4.242z" clip-rule="evenodd" />
                        </svg>
                        <span class="ml-2 w-0 flex-1 truncate">coverletter_front_end_developer.pdf</span>
                      </div>
                      <div class="ml-4 flex-shrink-0">
                        <a href="#" class="font-medium text-blue-600 hover:text-blue-500">Download</a>
                      </div>
                    </li>
                  </ul>
                </dd>
              </div>
            </dl>
          </div>
          <div>
            <a href="#" class="block bg-gray-50 px-4 py-4 text-center text-sm font-medium text-gray-500 hover:text-gray-700 sm:rounded-b-lg"><font-awesome-icon :icon="['fas','upload']" class="text-gray-500 text-[12px] mr-2"/> แนบเอกสารใหม่</a>
          </div>
        </div>
      </section>

      <!-- Comments-->
      <section aria-labelledby="notes-title">
        <div class="bg-white shadow sm:overflow-hidden sm:rounded-lg">
          <div class="divide-y divide-gray-200">
            <div class="px-2 py-3 sm:px-3">
              <h2 id="notes-title" class="text-lg font-medium text-gray-900">Assets</h2>
            </div>
            <div class="px-4 py-6 sm:px-6">
              <ul role="list" class="space-y-4">
                
                <li v-for="(asset,index) in assetData" :key="index">
                  <div class="flex space-x-3">
                    <div class="flex-shrink-0">
                      <img class="h-10 w-10 rounded-full" :src="asset.loginLogo" alt="">
                    </div>
                    <div>
                      <div class="text-sm">
                        <a href="#" class="font-semibold text-gray-900">{{ asset.siteName }}</a>
                      </div>
                      <div class="mt-1 text-sm text-gray-700">
                        <p><font-awesome-icon :icon="['fas','globe']" class="text-gray-900 mt-[3px] mr-1 text-md"/> {{ asset.hostname }}</p>
                      </div>
                      <div class="mt-2 space-x-2 text-sm">

                        <span v-for="(plugin,index) in asset.plugins" :key="index" class="inline-block bg-indigo-100 rounded-sm px-2 py-1 text-xs font-medium text-gray-700 mr-1 mb-1">
                          {{ plugin }}
                        </span>

                      </div>
                    </div>
                  </div>
                  <div class="border-b border-1 border-dashed border-gray-300 mb-5 mt-5"></div>
                </li>

              </ul>
            </div>
          </div>
          
        </div>
      </section>
    </div>

    <section aria-labelledby="timeline-title" class="lg:col-span-1 lg:col-start-3">
      <div class="bg-white px-4 py-5 shadow sm:rounded-lg sm:px-6">

        <div class="mb-5">
          <h3 class="font-medium text-gray-900">Collector</h3>
          <ul role="list" class="mt-2 divide-y divide-gray-200 border-t border-b border-gray-200">
            
              <li v-for="(admin,index) in collectionAdmin" :key="index" class="flex items-center justify-between py-3">
                <div class="flex items-center">
                  <img src="https://images.unsplash.com/photo-1502685104226-ee32379fefbe?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&amp;auto=format&amp;fit=facearea&amp;facepad=3&amp;w=1024&amp;h=1024&amp;q=80" alt="" class="h-8 w-8 rounded-full">
                  <p class="ml-4 text-sm font-medium text-gray-900">{{ admin.email }}<br><small class="text-gray-500">{{ admin.firstname }} {{ admin.lastname }}</small></p>
                </div>
                <div>
                  <button 
                  type="button" 
                  class="ml-6 rounded-md bg-white text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                  <font-awesome-icon :icon="['fas','edit']" class="pr-2 pl-2"/>
                  </button>
                  <button 
                  @click="deleteData(admin.id)"
                  type="button" 
                  class="ml-6 rounded-md bg-white text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                  <font-awesome-icon :icon="['fas','trash']" class="pr-2 pl-2"/>
                  </button>
                </div>
              </li>
        
              <template v-if="collectionAdmin.length === 0">
                <li class="flex items-center justify-between py-2">
                  <button type="button" class="group -ml-1 flex items-center rounded-md bg-white p-1 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <span class="flex h-8 w-8 items-center justify-center rounded-full border-2 border-dashed border-gray-300 text-gray-400">
                      <svg class="h-5 w-5" x-description="Heroicon name: mini/plus" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z"></path>
                      </svg>
                    </span>
                    <span class="ml-4 text-sm font-medium text-indigo-600 group-hover:text-indigo-500" @click="$router.push('/origin/collection/admin/'+this.dataItem)">เพิ่มเจ้าหน้าที่</span>
                  </button>
                </li>
              </template>
              
          </ul>
        </div>

        <h2 id="timeline-title" class="text-lg font-medium text-gray-900">ประวัติการทำรายการ</h2>

        <!-- Activity Feed -->
        <div class="mt-6 flow-root">
          <ul role="list" class="-mb-8">
            <li>
              <div class="relative pb-8">
                <span class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                <div class="relative flex space-x-3">
                  <div>
                    <span class="h-8 w-8 rounded-full bg-gray-400 flex items-center justify-center ring-8 ring-white">
                      <!-- Heroicon name: mini/user -->
                      <svg class="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
                      </svg>
                    </span>
                  </div>
                  <div class="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                    <div>
                      <p class="text-sm text-gray-500">Applied to <a href="#" class="font-medium text-gray-900">Front End Developer</a></p>
                    </div>
                    <div class="whitespace-nowrap text-right text-sm text-gray-500">
                      <time datetime="2020-09-20">Sep 20</time>
                    </div>
                  </div>
                </div>
              </div>
            </li>

            <li>
              <div class="relative pb-8">
                <span class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                <div class="relative flex space-x-3">
                  <div>
                    <span class="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                      <!-- Heroicon name: mini/hand-thumb-up -->
                      <svg class="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path d="M1 8.25a1.25 1.25 0 112.5 0v7.5a1.25 1.25 0 11-2.5 0v-7.5zM11 3V1.7c0-.268.14-.526.395-.607A2 2 0 0114 3c0 .995-.182 1.948-.514 2.826-.204.54.166 1.174.744 1.174h2.52c1.243 0 2.261 1.01 2.146 2.247a23.864 23.864 0 01-1.341 5.974C17.153 16.323 16.072 17 14.9 17h-3.192a3 3 0 01-1.341-.317l-2.734-1.366A3 3 0 006.292 15H5V8h.963c.685 0 1.258-.483 1.612-1.068a4.011 4.011 0 012.166-1.73c.432-.143.853-.386 1.011-.814.16-.432.248-.9.248-1.388z" />
                      </svg>
                    </span>
                  </div>
                  <div class="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                    <div>
                      <p class="text-sm text-gray-500">Advanced to phone screening by <a href="#" class="font-medium text-gray-900">Bethany Blake</a></p>
                    </div>
                    <div class="whitespace-nowrap text-right text-sm text-gray-500">
                      <time datetime="2020-09-22">Sep 22</time>
                    </div>
                  </div>
                </div>
              </div>
            </li>

            <li>
              <div class="relative pb-8">
                <span class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                <div class="relative flex space-x-3">
                  <div>
                    <span class="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center ring-8 ring-white">
                      <!-- Heroicon name: mini/check -->
                      <svg class="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" />
                      </svg>
                    </span>
                  </div>
                  <div class="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                    <div>
                      <p class="text-sm text-gray-500">Completed phone screening with <a href="#" class="font-medium text-gray-900">Martha Gardner</a></p>
                    </div>
                    <div class="whitespace-nowrap text-right text-sm text-gray-500">
                      <time datetime="2020-09-28">Sep 28</time>
                    </div>
                  </div>
                </div>
              </div>
            </li>

            <li>
              <div class="relative pb-8">
                <span class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                <div class="relative flex space-x-3">
                  <div>
                    <span class="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                      <!-- Heroicon name: mini/hand-thumb-up -->
                      <svg class="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path d="M1 8.25a1.25 1.25 0 112.5 0v7.5a1.25 1.25 0 11-2.5 0v-7.5zM11 3V1.7c0-.268.14-.526.395-.607A2 2 0 0114 3c0 .995-.182 1.948-.514 2.826-.204.54.166 1.174.744 1.174h2.52c1.243 0 2.261 1.01 2.146 2.247a23.864 23.864 0 01-1.341 5.974C17.153 16.323 16.072 17 14.9 17h-3.192a3 3 0 01-1.341-.317l-2.734-1.366A3 3 0 006.292 15H5V8h.963c.685 0 1.258-.483 1.612-1.068a4.011 4.011 0 012.166-1.73c.432-.143.853-.386 1.011-.814.16-.432.248-.9.248-1.388z" />
                      </svg>
                    </span>
                  </div>
                  <div class="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                    <div>
                      <p class="text-sm text-gray-500">Advanced to interview by <a href="#" class="font-medium text-gray-900">Bethany Blake</a></p>
                    </div>
                    <div class="whitespace-nowrap text-right text-sm text-gray-500">
                      <time datetime="2020-09-30">Sep 30</time>
                    </div>
                  </div>
                </div>
              </div>
            </li>

            <li>
              <div class="relative pb-8">
                <div class="relative flex space-x-3">
                  <div>
                    <span class="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center ring-8 ring-white">
                      <!-- Heroicon name: mini/check -->
                      <svg class="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" />
                      </svg>
                    </span>
                  </div>
                  <div class="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                    <div>
                      <p class="text-sm text-gray-500">Completed interview with <a href="#" class="font-medium text-gray-900">Katherine Snyder</a></p>
                    </div>
                    <div class="whitespace-nowrap text-right text-sm text-gray-500">
                      <time datetime="2020-10-04">Oct 4</time>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>
        <div class="justify-stretch mt-6 flex flex-col">
          <button type="button" class="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">Advance to offer</button>
        </div>
      </div>
    </section>
  </div>
</template>