<script>

import Loader from '@/interface/template/Loader.vue';
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
                    $and: [{ parent: this.session.current._id }]
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

  <nav class="flex border-b border-gray-200 bg-white" aria-label="Breadcrumb">
    <ol role="list" class="mx-auto flex w-full max-w-screen-xl space-x-4 px-4 sm:px-6 lg:px-8">
      <li class="flex">
        <div class="flex items-center">
          <router-link :to="'/user/profile'" class="text-gray-400 hover:text-gray-500">
            <svg class="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clip-rule="evenodd" />
            </svg>
            <span class="sr-only">Home</span>
          </router-link>
        </div>
      </li>
      <li class="flex">
        <div class="flex items-center">
          <svg class="h-full w-6 flex-shrink-0 text-gray-200" viewBox="0 0 24 44" preserveAspectRatio="none" fill="currentColor" aria-hidden="true">
            <path d="M.293 0l22 22-22 22h1.414l22-22-22-22H.293z" />
          </svg>
          <p class="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700" aria-current="page">แบบฟอร์มทั้งหมด</p>
        </div>
      </li>
    </ol>
  </nav>
  
<div class="bg-gray-50">

  <main class="mx-auto max-w-2xl pb-24 pt-4 sm:px-6 sm:pt-8 lg:max-w-7xl lg:px-8">
    <div class="space-y-2 px-4 sm:flex sm:items-baseline sm:justify-between sm:space-y-0 sm:px-0">
      <div class="flex sm:items-baseline sm:space-x-4">
        <h1 class="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">แบบฟอร์มการลงทะเบียน</h1>
      </div>
    </div>

    <section aria-labelledby="products-heading" class="mt-6">
      <h2 id="products-heading" class="sr-only">Products purchased</h2>

      <div class="space-y-8">
        <div v-for="(application) in listItems" :key="application._id" class="border-b border-t border-gray-200 bg-white shadow-sm sm:rounded-lg sm:border">
          <h3 class="sr-only">วันที่สมัคร <time datetime="2021-07-06">Jul 6, 2021</time></h3>
      
          <div class="flex items-center border-b border-gray-200 p-4 sm:grid sm:grid-cols-4 sm:gap-x-6 sm:p-6">
            <dl class="grid flex-1 grid-cols-2 gap-x-6 text-sm sm:col-span-3 sm:grid-cols-3 lg:col-span-2">
              <div>
                <dt class="font-medium text-gray-900">หมายเลขใบสมัคร</dt>
                <dd class="mt-1 text-gray-500">WU88191111</dd>
              </div>
              <div class="hidden sm:block">
                <dt class="font-medium text-gray-900">วันที่สมัคร</dt>
                <dd class="mt-1 text-gray-500">
                  <time datetime="2021-07-06">Jul 6, 2021</time>
                </dd>
              </div>
              <div>
                <dt class="font-medium text-gray-900">สถานะการสมัคร</dt>
                <dd class="mt-1 font-medium text-gray-900">$160.00</dd>
              </div>
            </dl>
      
            <div class="relative flex justify-end lg:hidden">
              <div class="flex items-center">
                <button type="button" class="-m-2 flex items-center p-2 text-gray-400 hover:text-gray-500" id="menu-0-button" aria-expanded="false" aria-haspopup="true">
                  <span class="sr-only">Options for order WU88191111</span>
                  <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
                  </svg>
                </button>
              </div>
            </div>
      
            <div class="hidden lg:col-span-2 lg:flex lg:items-center lg:justify-end lg:space-x-4">
              <a href="#" class="flex items-center justify-center rounded-md border border-gray-300 bg-white px-2.5 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                <span>เอกสารการสมัคร</span>
                <span class="sr-only">WU88191111</span>
              </a>
              <a href="#" class="flex items-center justify-center rounded-md border border-gray-300 bg-white px-2.5 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                <span>เงื่อนไขและข้อกำหนด</span>
                <span class="sr-only">for order WU88191111</span>
              </a>
            </div>
          </div>
      
          <h4 class="sr-only">Items</h4>
          <ul role="list" class="divide-y divide-gray-200">
            <li class="p-4 sm:p-6">
              <div class="flex items-center sm:items-start">
                <div class="flex-1 text-sm">
                  <div class="font-medium text-gray-900 sm:flex sm:justify-between">
                    
                    <router-link :to="'/application/view/'+application._id" class="">
                      <h3 class="text-2xl font-bold"> {{ application.name }}</h3>
                    </router-link>

                    <p class="mt-2 sm:mt-0">$70.00</p>
                  </div>
                  <p class="hidden text-gray-500 sm:mt-2 sm:block">Are you a minimalist looking for a compact carry option? The Micro Backpack is the perfect size for your essential everyday carry items. Wear it like a backpack or carry it like a satchel for all-day use.</p>
                </div>
              </div>
      
              <div class="mt-6 sm:flex sm:justify-between">
                <div class="flex items-center">
                  <svg class="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" />
                  </svg>
                  <p class="ml-2 text-sm font-medium text-gray-500">Delivered on <time datetime="2021-07-12">July 12, 2021</time></p>
                </div>
      
                <div class="mt-6 flex items-center space-x-4 divide-x divide-gray-200 border-t border-gray-200 pt-4 text-sm font-medium sm:ml-4 sm:mt-0 sm:border-none sm:pt-0">
                  <div class="flex flex-1 justify-center">
                    <a href="#" class="whitespace-nowrap text-indigo-600 hover:text-indigo-500">View product</a>
                  </div>
                  <div class="flex flex-1 justify-center pl-4">
                    <a href="#" class="whitespace-nowrap text-indigo-600 hover:text-indigo-500">Buy again</a>
                  </div>
                </div>
              </div>
            </li>
      
          </ul>
        </div>
        
      </div>
    </section>

  </main>
</div>

</template>