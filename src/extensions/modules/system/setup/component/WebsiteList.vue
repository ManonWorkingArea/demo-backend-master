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
            let accessToken  = storageManager.get('session','token')
            this.loading_sources = false;
            const resAPI = await fetch("https://asia-southeast2-elearning-6871c.cloudfunctions.net/contents/filters?type=page",
            {
              method: 'GET',
              headers: {'Content-Type': 'application/json','Authorization': 'Bearer ' + accessToken},
            });

            const RestReturn   = await resAPI.json();
            console.log(RestReturn);

            this.listItems       = RestReturn;
            this.loading_sources = true;
            this.pages = RestReturn.pages
            this.current = RestReturn.currentPage
            this.total = RestReturn.totalCount
            this.next = RestReturn.nextState
            this.prev = RestReturn.preState

          } catch (error) {
            console.log(error)
          }
        }
      },
      async deleteData(id) {
        if(storageManager.get('session','login')) {
          try {
            this.loading_sources = false;
            let accessToken  = storageManager.get('session','token')
            console.log("id",id)
            const resAPI = await fetch("https://asia-southeast2-elearning-6871c.cloudfunctions.net/contents/" + id,
            {
              method: 'DELETE',
              headers: {'Content-Type': 'application/json','Authorization': 'Bearer ' + accessToken},
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
                          <span class="ml-4 text-sm font-medium text-gray-400">{{PageName}}</span>
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
                    <button 
                    @click="$router.push('/setup/website/add/page')" 
                    type="button" 
                    class="ml-3 inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                    <font-awesome-icon :icon="['fas','plus']" class="text-gray-200 mr-2"/>
                    เพิ่มหน้า
                    </button>
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
              <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table class="min-w-full divide-y divide-gray-300">
                  <thead class="bg-gray-50">
                    <tr>
                      <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">#</th>
                      <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">description</th>
                      <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">id</th>
                      <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">type</th>
                      <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">name</th>
                      <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">school_id</th>
                      <th scope="col" class="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">Tools</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-200 bg-white">
                    
                    <tr v-for="(content, index) in listItems.data" :key="content.id">
                      <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{{((index+1))}}</td>

                      <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <a :href="'/content/detail/'+content.id" class="text-gray-500 hover:text-indigo-900">
                        {{ content.description }}
                        </a>
                      </td>

                      <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ content.id }}</td>
                      <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ content.view }}</td>
                      <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ content.name }}</td>
                      <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ content.school_id}}</td>
                      <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-md font-medium sm:pr-6">
                        <button @click="$router.push('/content/detail/'+ content.id)" type="button" class="mr-2 inline-flex justify-center rounded-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2">
                        <font-awesome-icon :icon="['fas','square-pen']" class="text-black mt-[3px] mr-2 text-md"/>
                        <span>แก้ไข</span>
                        </button>
                        <button @click="$router.push('/content/new/'+ content.id)" type="button" class="mr-2 inline-flex justify-center rounded-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2">
                        <font-awesome-icon :icon="['fas','plus']" class="text-black mt-[3px] mr-2 text-md"/>
                        <span>เพิ่มหน้าย่อย</span>
                        </button>
                        <button @click="deleteData(content.id)" type="button" class="inline-flex justify-center rounded-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2">
                        <font-awesome-icon :icon="['fas','trash-can']" class="text-black mt-[3px] mr-2 text-md"/>
                        <span>ลบ</span>
                        </button>
                      </td>
                    </tr>

                  </tbody>
                </table>

                <!-- <Paginated v-if="loading_sources" :page="pages" :current="current" :total="total" :prev="prev" :next="next"/> -->

              </div>
              
            </div>
          </div>
        </div>


    </div>
  </div>
</div>
</template>