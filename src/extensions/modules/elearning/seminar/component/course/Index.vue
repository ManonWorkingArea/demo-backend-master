<script>

// Component
import feather      from 'feather-icons';
import {useRoute} 	from 'vue-router'
import storageManager from '@/plugins/storage';
import Loader       from '@/interface/template/Loader.vue';
import { Tooltip } from '@programic/vue3-tooltip';

import CourseIcon       from '@/interface/element/CourseIcon.vue';
import StatusLabel       from '@/interface/element/StatusLabel.vue';
import Price       from '@/interface/element/FormatPrice.vue';
import CourseStat       from '@/interface/element/CourseStat.vue';
//import Paginated from '@/interface/template/Paginated.vue';

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
        accessToken:session.token,
        login:session.login,
        listItems: [],
        loading_sources: true,
        pages: 0,
        current: 0,
        total: 0,
        next: true,
        prev: false,
        MasterText: session.MasterText,
        endpoint: "",
        master:session.master,
      }
    },
    components: {
      Loader,
      Tooltip,
      CourseIcon,
      StatusLabel,
      CourseStat,
      Price
      //Paginated,
    },
    methods: {
      async getData() {
        console.log("getData",this.login);
        if(this.login) {
          try {
            //console.log("Auth : Course List : ",ls.get('auth'));
            //const page = this.$route.query.page || 1; 
            this.loading_sources = false;
          
            const resAPI = await fetch("https://asia-southeast2-elearning-6871c.cloudfunctions.net/"+this.endpoint +"/school/" + this.school, {
              method: 'GET',
              headers: {'Content-Type': 'application/json','Authorization': 'Bearer ' + this.accessToken},
            });

            const RestReturn   = await resAPI.json();
            console.log("Get School",RestReturn);

            this.listItems       = RestReturn.data;
            if(RestReturn.data !==null) {

              this.listItems.sort(function(a,b){return a.order < b.order ? -1 : 1});
              this.loading_sources  = true;
              this.pages            = RestReturn.pages
              this.current          = RestReturn.currentPage
              this.total            = RestReturn.totalCount
              this.next             = RestReturn.nextState
              this.prev             = RestReturn.preState

              const session         = storageManager.get('session')
              const categoryList    = session.category
              
              if(typeof categoryList !== 'undefined' && categoryList.length > 0) {
                this.categoryData     = categoryList
              } else {
                const Category   = await this.getCategoryData();
                if(Category.success) {
                  let session = 
                  {
                    category: Category.data,
                  };
                  storageManager.update('session',session)
                  this.categoryData     = Category.data
                }
              }
          }  else { 
            this.loading_sources = true;
          }

          } catch (error) {
            console.log(error)
          }
        }
      },
      async getCategoryData() {
        if(this.login) {
          try {
            const resAPI = await fetch("https://asia-southeast2-elearning-6871c.cloudfunctions.net/catagories/",
            {
              method: 'GET',
              headers: {'Content-Type': 'application/json','Authorization': 'Bearer ' + this.accessToken},
            });
            const RestReturn   = await resAPI.json();
            console.log("Category",RestReturn);
            return RestReturn
          } catch (error) {
            console.log(error)
          }
        }
      },
      async deleteData(id) {
        if(this.login) {
          try {
            this.loading_sources = false;
            console.log("id",id)
            const resAPI = await fetch("https://asia-southeast2-elearning-6871c.cloudfunctions.net/"+this.endpoint +"/" + id, {
              method: 'DELETE',
              headers: {'Content-Type': 'application/json','Authorization': 'Bearer ' + this.accessToken},
            });
            console.log(resAPI);
            this.loading_sources = true;
            await this.getData();
          } catch (error) {
            console.log(error)
          }
        }
      },
      async cloneChildData(id) {
        if(this.login) {
            try {
              if(this.master) {
                this.endpoint = "mcourses";
              } else {
                this.endpoint = "courses";
              }
              this.loading_sources = false
              const callApi       = await fetch("https://asia-southeast2-elearning-6871c.cloudfunctions.net/mcourses/"+id+"/cloneCourse/", {
                method: 'POST',
                headers: {'Content-Type': 'application/json','Authorization': 'Bearer ' + this.accessToken},
              });
              const finalRes   = await callApi.json();

              if(finalRes.success) {
                
                this.$swal({
                    toast: true,
                    position: 'bottom-end',
                    showConfirmButton: false,
                    timer: 500,
                    icon: 'success',
                    title: 'แจ้งเตือน',
                    text: 'สร้างหลักสูตร Cloning เรียบร้อยแล้ว',
                }).then(() => {
                  this.loading_sources = true
                });
              }
            } catch (error) {
            console.log(error)
          }
        }
      },
      updated() {
        feather.replace();
      },
      
      toggleMaster() {
        if(this.master) {

          let session = 
          {
            master: false,
            MasterText: "Master Mode",
          };
          storageManager.update('session',session)

          this.MasterText = "Master Mode"
          location.reload()
        } else {

          let session = 
          {
            master: true,
            MasterText: "Child Mode",
          };
          storageManager.update('session',session)

          this.MasterText = "Child Mode"
          location.reload()
        }
      },
    },
    async mounted () {
      try {
        if(this.master) {
          this.endpoint = "mcourses";
        } else {
          this.endpoint = "courses";
        }
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
  <div v-if="loading_sources">
    
    <header class="py-2 border-gray-800">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 xl:flex xl:items-center xl:justify-between">
        <div class="min-w-0 flex-1">
            <h1 class="mt-2 text-xl font-bold leading-7 text-gray-700 sm:truncate sm:text-1xl sm:tracking-tight"><font-awesome-icon :icon="['fas',PageIcon]" class="text-gray-500 text-[24px]"/> {{ PageName }}</h1>
        </div>
        <div class="mt-5 flex xl:mt-0 xl:ml-4">
            <span class="hidden sm:block" v-if="this.master">
              <button @click="$router.push('/lesson/add')" type="button" class="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-50">
                <font-awesome-icon :icon="['fas','plus']" class="text-black text-[12px] mr-2"/> 
                เพิ่มหลักสูตรใหม่
              </button>
            </span>

            <span class="hidden sm:block" v-if="this.master">
              <button @click="toggleMaster()" type="button" class="ml-3 inline-flex items-center rounded-md border border-gray-300 bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-50">
                <font-awesome-icon :icon="['fas','pencil']" class="text-white text-[12px] mr-2"/> 
                Child Mode
              </button>
            </span>

            <span class="hidden sm:block" v-if="!this.master">
              <button @click="toggleMaster()" type="button" class="ml-3 inline-flex items-center rounded-md border border-gray-300 bg-rose-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-rose-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-50">
                <font-awesome-icon :icon="['fas','pencil']" class="text-white text-[12px] mr-2"/> 
                Master Mode
              </button>
            </span>

        </div>
      </div>
    </header>

    <div class="flex-1 pb-8 bg-gray-100 pt-2 pb-5 border-t">
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
                        <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">ชื่อหลักสูตร</th>
                        <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">รหัส</th>
                        <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">ราคา</th>
                        <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">สถานะ</th>
                        <th scope="col" class="w-20 px-3 py-3.5 text-center text-sm font-semibold text-gray-900">เครื่องมือ</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200 bg-white">
                      
                      <tr v-for="(course, index) in listItems" :key="course.id">
                        <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{{(index+1)}}</td>
                        <td class="whitespace-nowrap px-3 py-4 text-md text-gray-700 font-bold">
                          <a :href="'/lesson/detail/'+course.id" class="text-gray-700 hover:text-indigo-600"><CourseIcon :title="course.name" :chcek="course.ref"/></a>
                          <p class="font-medium mt-2"><CourseStat :check="course.id"/></p>
                        </td>
                        <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ course.slug }}</td>
                        <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500"><Price :regular="course.regular_price" :sale="course.sale_price"/></td>
                        <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500"><StatusLabel :check="course.status"/></td>
                        <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-md font-medium sm:pr-6">
                          <Tooltip title="สร้างสำเนาข้อมูล" size="12">
                            <button v-if="this.master" @click="cloneChildData(course.id)" type="button" class="mr-2 inline-flex justify-center rounded-md border border-indigo-700 bg-indigo-600 px-2 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2">
                              <font-awesome-icon :icon="['fas','copy']" class="text-white mt-[3px] mr-2 text-md"/>
                              <span>Clone Data</span>
                            </button>
                          </Tooltip>
                          <button @click="$router.push('/lesson/edit/'+ course.id)" type="button" class="mr-2 inline-flex justify-center rounded-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2">
                          <font-awesome-icon :icon="['fas','square-pen']" class="text-black mt-[3px] mr-2 text-md"/>
                          <span>แก้ไข</span>
                          </button>

                          <button @click="deleteData(course.id)" type="button" class="inline-flex justify-center rounded-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2">
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
</div>
</template>