<script>
// Component
import feather from 'feather-icons';
import Loader from '@/interface/template/Loader.vue';
import {useRoute} 	from 'vue-router'
//import Paginated from '@/interface/template/Paginated.vue';
import storageManager from '@/plugins/storage';

export default {
    inject: ['apiServer'],
    data() {
      const route = useRoute();
      return {
        PageName: route.meta.title,
        PageIcon: route.meta.icon,
        PagePath: route.meta.path,
        ParentName: route.meta.parent,
        ParentPage: route.meta.page,
        accessToken: storageManager.get('session','token'),
        listItems: [],
        loading_sources: true,
        pages: 0,
        current: 0,
        total: 0,
        next: true,
        prev: false,
      }
    },
    components: {
      Loader,
      //Paginated,
    },
    methods: {
      async getData() {
        if(storageManager.get('session','login')) {
          try {
            //console.log("Auth : Course List : ",ls.get('auth'));
            //const page = this.$route.query.page || 1; 
            this.loading_sources = false;
            const resAPI = await fetch("https://asia-southeast2-elearning-6871c.cloudfunctions.net/branchs/", {
              method: 'GET',
              headers: {'Content-Type': 'application/json','Authorization': 'Bearer ' + this.accessToken},
            });

            const RestReturn   = await resAPI.json();
            console.log(RestReturn);

            this.listItems        = RestReturn;
            this.loading_sources  = true;
            this.pages            = RestReturn.pages
            this.current          = RestReturn.currentPage
            this.total            = RestReturn.totalCount
            this.next             = RestReturn.nextState
            this.prev             = RestReturn.preState

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
            const resAPI = await fetch("https://asia-southeast2-elearning-6871c.cloudfunctions.net/branchs/" + id, {
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

  <div class="flex-1 bg-white" v-if="loading_sources">
      <div class="pt-8">
        <div class="mx-auto max-w-7xl px-6 sm:px-6 lg:px-6">
            <div>
                <div>
                  <nav class="sm:hidden" aria-label="Back">
                    <a href="#" class="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700">
                      <font-awesome-icon :icon="['fas','chevron-left']" class="text-gray-200 mr-2"/> Back
                    </a>
                  </nav>
                  <nav class="hidden sm:flex" aria-label="Breadcrumb">
                    <ol role="list" class="flex items-center space-x-4">
                      <li>
                        <div class="flex">
                            <a href="/" class="text-sm font-medium text-gray-500 hover:text-gray-700">
                                <font-awesome-icon :icon="['fas','home']" />
                            </a>
                        </div>
                      </li>
                      <li>
                        <div class="flex items-center">
                          <font-awesome-icon :icon="['fas','chevron-right']" class="text-gray-200"/>
                          <a :href="'/' +ParentPage" class="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">{{ParentName}}</a>
                        </div>
                      </li>
                      <li>
                        <div class="flex items-center">
                          <font-awesome-icon :icon="['fas','chevron-right']" class="text-gray-200"/>
                          <span class="ml-4 text-sm font-medium text-gray-400">{{ PageName }}</span>
                        </div>
                    </li>
                    </ol>
                  </nav>
                </div>
                <div class="mt-2 md:flex md:items-center md:justify-between pb-5">
                  <div class="min-w-0 flex-1">
                    <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight"><font-awesome-icon :icon="['fas',PageIcon]" class="text-gray-500 text-[24px]"/> {{PageName}}</h2>
                  </div>
                  <div class="mt-4 flex flex-shrink-0 md:mt-0 md:ml-4">
                    <button @click="$router.push('/school/add')" type="button" class="ml-3 inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"><font-awesome-icon :icon="['fas','plus']" class="text-gray-200 mr-2"/> เพิ่มโรงเรียน</button>
                  </div>
                </div>
            </div>
        </div>
    </div>
  </div>

  <div class="flex-1 pb-8 bg-gray-100 pt-2 pb-5 border-t" v-if="loading_sources">
    <div class="mt-8">
      <div class="mx-auto max-w-7xl px-6 sm:px-6 lg:px-6">

        <div class="mt-8 flex flex-col">
          <div class="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div class="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">

              <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                
                <div v-for="(school) in listItems.data" :key="school.code" class="bg-white rounded-lg shadow-md overflow-hidden">
                  <img class="w-full h-48 object-cover" src="https://picsum.photos/seed/picsum/200/300" alt="Placeholder image">
                  <div class="p-4">
                    <a :href="'/school/detail/'+school.id" class="font-bold text-gray-600 hover:underline">{{ school.name }}</a>
                    <p class="text-gray-400">Code: {{ school.code }}</p>
                    <p class="text-gray-400">Website: {{ school.website }}</p>
                    <p class="text-gray-400">Phone: {{ school.phone }}</p>
                  </div>
                  <div class="bg-gray-100 border-t-2 border-gray-200 py-2 px-4 flex justify-between items-center">
                    <a href="javascript:void(0);" @click="$router.push('/school/edit/'+ school.id)" class="text-black-500 hover:text-gray-900 font-medium">
                      <font-awesome-icon :icon="['fas','square-pen']" class="text-black mt-[3px] mr-2 text-md"/>
                      <span>แก้ไข</span></a>
                    <a href="#" class="text-black-500 font-medium">
                      <font-awesome-icon :icon="['fas','user-tie']" class="text-black mt-[3px] mr-2 text-md"/>
                      <span>ผู้ดูแล</span>
                    </a>
                    <a href="#" class="text-black-500 font-medium">
                      <font-awesome-icon :icon="['fas','trash-can']" class="text-black mt-[3px] mr-2 text-md"/>
                      <span>ลบ</span>
                    </a>
                  </div>
                </div>

                <a :href="'/school/add'" class="bg-white rounded-lg shadow-md overflow-hidden flex flex-col items-center justify-center cursor-pointer">
                  <div class="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center hover:opacity-70">
                    <font-awesome-icon :icon="['fas','plus']" class="text-3xl"/>
                  </div>
                  <p class="text-gray-500 mt-2 text-center">Add new school</p>
                </a>
                
              </div>
              
            </div>
          </div>
        </div>

    </div>
  </div>
</div>
</template>