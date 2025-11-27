<script>

// Component
import storageManager from '@/plugins/storage';
import feather from 'feather-icons';
import Loader from '@/interface/template/Loader.vue';
import {useRoute} 	from 'vue-router'
import moment from 'moment';
moment().format();

export default {
    data() {
      const route = useRoute();
      return {
        PageName: route.meta.title,
        PageIcon: route.meta.icon,
        PagePath: route.meta.path,
        ParentName: route.meta.parent,
        ParentPage: route.meta.page,
        contenData:[],
        contentDate:'',
        dataItem: this.$route.params.id,
        childData:[],
        loading_sources: true,
        accessToken:storageManager.get('session','token'),
        login:storageManager.get('session','login')
      }
    },
    components: {
      Loader,
    },
    methods: {
      dateTime(value) {
        return moment((value*1000)).format("DD/MM/YYYY HH:mm:ss");
      },
      async getData() {
        if(storageManager.get('session','login')) {
          try {
            //console.log("Auth : Course List : ",ls.get('auth'));
            let accessToken       = storageManager.get('session','token')
            let item              = this.$route.params.id;
            this.loading_sources  = false;
            const resAPI          = await fetch("https://asia-southeast2-elearning-6871c.cloudfunctions.net/contents/" + item,
            {
              method: 'GET',
              headers: {'Content-Type': 'application/json','Authorization': 'Bearer ' + accessToken},
            });

            const RestReturn   = await resAPI.json();
            console.log("getData",RestReturn);

            if(RestReturn.success) {
              const childRes        = await this.getChildData()
              console.log("childRes",childRes);
              if(childRes.success) {

                const filtered = childRes.data.filter(Boolean);
                console.log(filtered);

                this.childData        = filtered;
                this.contenData       = RestReturn.data;

                this.contentDate      = RestReturn.data.createdAt._seconds
                this.loading_sources  = true;
              }
            }

          } catch (error) {
            console.log(error)
          }
        }
      },
      async getChildData() {
        if(storageManager.get('session','login')) {
          try {
            //console.log("Auth : Course List : ",ls.get('auth'));
            let accessToken       = storageManager.get('session','token')
            let item              = this.$route.params.id;
            //this.loading_sources  = false;
            const resAPI          = await fetch("https://asia-southeast2-elearning-6871c.cloudfunctions.net/contents/getInnerPost/" + item,
            {
              method: 'GET',
              headers: {'Content-Type': 'application/json','Authorization': 'Bearer ' + accessToken},
            });

            const RestReturn   = await resAPI.json();
            console.log("getChildData",RestReturn);

            return RestReturn

          } catch (error) {
            console.log(error)
          }
        }
      },
      async updataData() {
        if(this.login) {
            try {
              console.log("updataData");
              const callApi = await fetch("https://asia-southeast2-elearning-6871c.cloudfunctions.net/contents/" + this.dataItem, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json','Authorization': 'Bearer ' + this.accessToken},
                body: JSON.stringify({
                  "postIds":['9tiRx6QWU3Zy1MrtBraV','1jPeDSrUzFXUL5ju2Qaq']
                })
              });
              const finalRes   = await callApi.json();

              if(finalRes.success) {
                this.$swal({ 
                  title: "บันทึกข้อมูลเรียบร้อยแล้ว ?",
                  text: "คุณต้องการที่จะดำเนินการอย่างไร !",
                  type: "success",
                  showCancelButton: true,
                  confirmButtonColor: "#0054b4",
                  confirmButtonText: "กลับไปหน้าหลัก",
                  cancelButtonText: "รีเฟรซหน้านี้",
                  closeOnConfirm: false,
                  closeOnCancel: false 
                }).then((confirmed) => {
                  if (confirmed.isConfirmed) {
                    console.log("Home");
                    window.location.href = "/setup/website/page/detail/" + this.dataItem
                  } else {
                    console.log("New");
                    window.location.reload();
                  }
                });
              }
            } catch (error) {
            console.log(error)
            }
        }
      },
      async deleteData(id) {
        if(storageManager.get('session','login')) {
          try {
            this.loading_sources = false;
            const resAPI = await fetch(this.apiServer + "school/" + id,
            {
              method: 'DELETE',
              headers: {'Content-Type': 'application/json'},
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

  <!-- Page header -->
  <div class="mx-auto max-w-3xl px-4 mt-5 sm:px-6 md:flex md:items-center md:justify-between md:space-x-5 lg:max-w-7xl lg:px-8">
    
    <div class="flex items-center space-x-5">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">{{ contenData.name }}</h1>
        <p class="text-sm font-medium text-gray-500">โดย <a href="#" class="text-gray-900">Admin</a> เมื่อ <a href="#" class="text-gray-900">{{this.dateTime(contentDate)}}</a></p>
      </div>
    </div>
    <div class="justify-stretch mt-6 flex flex-col-reverse space-y-4 space-y-reverse sm:flex-row-reverse sm:justify-end sm:space-y-0 sm:space-x-3 sm:space-x-reverse md:mt-0 md:flex-row md:space-x-3">
      
      <button 
      @click="$router.push('/setup/website/page/edit/' + this.dataItem)"
      type="button" 
      class="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-100">
      <font-awesome-icon :icon="['fas','pencil']" class="text-black text-[12px] mr-2"/> แก้ไขหน้า
      </button>

      <button 
      type="button" 
      class="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-100">
      <font-awesome-icon :icon="['fas','trash']" class="text-black text-[12px] mr-2"/> ลบ
      </button>

      <button @click="$router.push('/setup/website')" type="button" class="ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-50">
      <font-awesome-icon :icon="['fas','chevron-left']" class="text-black text-[12px] mr-2"/>
      ย้อนกลับ
      </button>

    </div>
  </div>

  <div class="mx-auto mt-8 grid max-w-3xl grid-cols-1 gap-6 sm:px-6 lg:max-w-7xl lg:grid-flow-col-dense lg:grid-cols-3">
    <div class="space-y-6 lg:col-span-2 lg:col-start-1">
      <!-- Description list-->
      <section aria-labelledby="applicant-information-title">
        <div class="bg-white shadow sm:rounded-lg">
          <div class="px-4 py-5 sm:px-6">
            <h2 id="applicant-information-title" class="text-lg font-medium leading-6 text-gray-900">Page Information</h2>
          </div>
          <div class="border-t border-gray-200 px-4 py-5 sm:px-6">
            <dl class="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">

              <div class="sm:col-span-1">
                <dt class="text-sm font-medium text-gray-500">Page Name</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ contenData.name }}</dd>
              </div>

              <div class="sm:col-span-1">
                <dt class="text-sm font-medium text-gray-500">Page Slug</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ contenData.slug }}</dd>
              </div>

            </dl>
          </div>
        </div>
      </section>

      <section aria-labelledby="notes-title">
        <div class="bg-white shadow sm:overflow-hidden sm:rounded-lg">
          <div class="divide-y divide-gray-200">
            <div class="px-4 py-6 sm:px-6">
              <div v-html="contenData.description"></div>
            </div>
          </div>
          
        </div>
      </section>

      <section aria-labelledby="notes-title">
        <div class="bg-white shadow sm:overflow-hidden sm:rounded-lg">
          <div class="divide-y divide-gray-200">
            <div class="px-4 py-5 sm:px-6 relative">
              <h2 id="notes-title" class="text-lg font-bold text-gray-900">เนื้อหาย่อย</h2>
              <div class="absolute top-4 right-4 ">
                <button 
                @click="$router.push('/setup/website/post/add/'+this.dataItem)"
                type="button" 
                class="ml-3 inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                <font-awesome-icon :icon="['fas','plus']" class="text-gray-200 pr-3"/> เพิ่ม 
                </button>

                <button 
                @click="updataData"
                type="button" 
                class="ml-3 inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                <font-awesome-icon :icon="['fas','plus']" class="text-gray-200 pr-3"/> Save 
                </button>
              </div>
              </div>
            <div class="px-4 py-6 sm:px-6">

              <ul role="list" class="space-y-8">
                
                <li v-for="(post, index) in childData" :key="index" >
                  <div class="flex space-x-3">
                    <div class="flex-shrink-0">
                      <img class="h-10 w-10 rounded-full" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="">
                    </div>
                    <div>
                      <div class="text-sm">
                        <a href="#" class="font-medium text-gray-900">{{(index+1)}}.{{post.name}}</a>
                      </div>
                      <div class="mt-2 space-x-2 text-sm">
                        <span class="font-medium text-gray-500"><font-awesome-icon :icon="['fas','calendar']" class="text-gray-400"/>{{dateTime((post.createdAt._seconds))}}</span>
                        <span class="font-medium text-gray-500">&middot;</span>
                        <button type="button" class="font-medium text-gray-900"><font-awesome-icon :icon="['fas','pencil']" class="text-gray-400"/> แก้ไข </button>
                        <span class="font-medium text-gray-500">&middot;</span>
                        <button type="button" class="font-medium text-gray-900"><font-awesome-icon :icon="['fas','trash']" class="text-gray-400"/> ลบ </button>
                      </div>
                    </div>
                  </div>
                </li>

              </ul>
            </div>
          </div>
          
        </div>
      </section>
    </div>

    <section aria-labelledby="timeline-title" class="lg:col-span-1 lg:col-start-3">
      <div class="bg-white px-4 py-5 shadow sm:rounded-lg sm:px-6">

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