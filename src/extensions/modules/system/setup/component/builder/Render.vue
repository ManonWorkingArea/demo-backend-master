<script>

// Component
import feather from 'feather-icons';
import Loader from '@/interface/template/Loader.vue';
import AddContent   from '@/interface/modal/AddContent.vue';
import CodeContent   from '@/interface/modal/CodeContent.vue';
import {useRoute} 	from 'vue-router'
//import Paginated from '@/interface/template/Paginated.vue';
import storageManager from '@/plugins/storage';
import { ref } from 'vue';

export default {
    data() {
      const route = useRoute();
      return {
        PageName: route.meta.title,
        PageIcon: route.meta.icon,
        PagePath: route.meta.path,
        ParentName: route.meta.parent,
        ParentPage: route.meta.page,

        contentType:'',
        addContentOpen:false,
        setContentTriggerObj:"",

        codeContentOpen:false,
        selectedItem:'',

        count:'',

        listItems: [],
        itemBlocks: [],
        loading_sources: true,
        activeBlock:false,
        school:ls.get('school'),
        login:storageManager.get('session','login'),
        accessToken:storageManager.get('session','token'),
      }
    },
    components: {
      Loader,
      AddContent,
      CodeContent
      //Paginated,
    },
    methods: {
        async readItems() {
            if(this.login) {
                try {
                    this.loading_sources = false;
                    const resAPI = await fetch("https://asia-southeast2-elearning-6871c.cloudfunctions.net/contents/filters?schoolId=" + this.school, {
                        method: 'GET',
                        headers: {'Content-Type': 'application/json','Authorization': 'Bearer ' + this.accessToken},
                    });

                    const RestReturn   = await resAPI.json();
                    console.log(RestReturn);
                    if(RestReturn.success) {
                        this.loading_sources = true;
                        if(RestReturn.data !==null) {
                            this.items = [];//add this line to clear items firstly
                            RestReturn.data.forEach(element => {
                                if(element.type==="block")
                                ref(this.itemBlocks.push(element));
                            });
                            this.itemBlocks.sort(function(a,b){return a.order < b.order ? -1 : 1});
                            this.count = this.itemBlocks.length
                        }
                    }
                } catch (error) {
                    console.log(error)
                }
            }
        },
        async getData() {
            if(this.login) {
            try {
                //console.log("Auth : Course List : ",ls.get('auth'));

                //const page = this.$route.query.page || 1; 
                let accessToken  = storageManager.get('session','token')
                this.loading_sources = false;
                const resAPI = await fetch("https://asia-southeast2-elearning-6871c.cloudfunctions.net/contents/filters?type=object",
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
            if(this.login) {
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
        openSetContentSource() {
            this.addContentOpen = true;
        },
        addContentTrigger(payload) {
            this.addContentOpen = payload;
        },
        async addContentCallback() {
            console.log("addContentCallback");
            if(this.login) {
                try {
                    location.reload()
                } catch (error) {
                    console.log(error)
                }
            }
        },
        openCodeContentSource(item) {
            this.codeContentOpen = true;
            this.selectedItem = item
            console.log(item);
        },
        codeContentTrigger(payload) {
            this.codeContentOpen = payload;
        },
        async codeContentCallback() {
            console.log("codeContentCallback");
            if(this.login) {
                try {
                    location.reload()
                } catch (error) {
                    console.log(error)
                }
            }
        },
    },
    async mounted () {
      try {
        await this.readItems();
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

    <AddContent 
    v-if="addContentOpen" 
    :isWindowsOpen="true" 
    :Action="'add'"
    :Count="this.count"
    :callbackData="''" 
    @add-content-trigger="addContentTrigger" 
    @add-content-callback="addContentCallback"/>

    <CodeContent 
    v-if="codeContentOpen" 
    :isWindowsOpen="true" 
    :item="this.selectedItem"
    @code-content-trigger="codeContentTrigger"
    @code-content-callback="codeContentCallback"/>
    
    <div v-if="!loading_sources" class="text-center"><Loader/></div>

    <header class="py-2 border-gray-800">
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 xl:flex xl:items-center xl:justify-between">
        <div class="min-w-0 flex-1">
            <h1 class="mt-2 text-xl font-bold leading-7 text-gray-700 sm:truncate sm:text-1xl sm:tracking-tight"><font-awesome-icon :icon="['fas',PageIcon]" class="text-gray-500 text-[24px]"/> {{ PageName }}</h1>
        </div>
        <div class="mt-5 flex xl:mt-0 xl:ml-4">
            <span class="hidden sm:block">
            <button @click="openSetContentSource" type="button" class="ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-50">
            <font-awesome-icon :icon="['fas','plus']" class="text-black text-[12px] mr-2"/>
            เพิ่มเนื้อหา
            </button>
            </span>
            <span class="hidden sm:block">
                <button @click="$router.push('/setup')" type="button" class="ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-50">
                <font-awesome-icon :icon="['fas','chevron-left']" class="text-black text-[12px] mr-2"/>
                ย้อนกลับ
                </button>
            </span>
        </div>
        </div>
    </header>

    <div v-if="loading_sources">

        <div class="flex-1 bg-gray-100 pt-2 pb-5 border-t">
            <div class="mt-8">
                <div class="mx-auto max-w-7xl px-6 sm:px-6 lg:px-6">
                    <div class="space-y-6 sm:px-6 lg:col-span-9 lg:px-0">
        
                        <section aria-labelledby="payment-details-heading" class="relative" :data-content="'กำลังติดต่อฐานข้อมูล กรุณารอสักครู่.....'" :class="[(activeBlock?'isblock' : 'isunblock')]">
                            
                
                            <div v-for="(content, index) in itemBlocks" :key="content.id" class="mb-5 divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow">

                                <div class="px-4 py-5 sm:px-6">
                                {{(index+1)}}.{{content.name}}
                                </div>
            
                                <div class="px-4 py-5 sm:p-6" v-if="content.mode==='code'">

                                    <div class="relative border border-dashed border-1 mb-5 p-5 overflow-hidden">
                                        <div v-html="content.detail"></div>
                                        <label 
                                        for="desktop-user-photo" 
                                        class="absolute inset-0 flex h-full w-full items-center justify-center bg-black bg-opacity-75 text-sm font-medium text-white opacity-0 focus-within:opacity-100 hover:opacity-100 cursor-pointer" 
                                        @click="openCodeContentSource(content.id)">
                                        <span><font-awesome-icon :icon="['fas','pencil']" class=""/> แก้ไขข้อมูล</span>
                                        </label>
                                    </div>
                                    
                                    <div class="border border-dashed border-1 mb-5 p-5" v-if="content.detail==='none'">

                                        <div class="text-center">
                                            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                                <path vector-effect="non-scaling-stroke" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                                            </svg>
                                            <h3 class="mt-2 text-sm font-medium text-gray-900">No code content</h3>
                                            <p class="mt-1 text-sm text-gray-500">เพิ่ม Code สำหรับข้อมูลส่วนนี้</p>
                                            <div class="mt-6">
                                                <button 
                                                @click="openCodeContentSource(content.id)"
                                                type="button" 
                                                class="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                                                <font-awesome-icon :icon="['fas','plus']" class="-ml-1 mr-2 h-5 w-5"/>
                                                New Code
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                </div>

                                <div class="px-4 py-5 sm:p-6"  v-if="content.mode==='slide'">
                                    {{content.mode}}
                                </div>

                                <div class="px-4 py-5 sm:p-6"  v-if="content.mode==='slide'">
                                    <div class="sm:col-span-2">
                                        <dt class="text-sm font-medium text-gray-500">สไลด์ทั้งหมด</dt>
                                        <dd class="mt-1 text-sm text-gray-900">
                                            <ul role="list" class="divide-y divide-gray-200 rounded-md border border-gray-200">
                                            <li class="flex items-center justify-between py-3 pl-3 pr-4 text-sm">
                                                <div class="flex w-0 flex-1 items-center">
                                                    <font-awesome-icon :icon="['fas','paperclip']" class="h-5 w-5 flex-shrink-0 text-gray-400"/>
                                                    <span class="ml-2 w-0 flex-1 truncate">resume_front_end_developer.pdf</span>
                                                </div>
                                                <div class="ml-4 flex-shrink-0">
                                                    <a href="#" class="font-medium text-blue-600 hover:text-blue-500 mr-5">เปลี่ยนรูป</a>
                                                    <a href="#" class="font-medium text-blue-600 hover:text-blue-500">ลบ</a>
                                                </div>
                                            </li>
                        
                                            <li class="flex items-center justify-between py-3 pl-3 pr-4 text-sm">
                                                <div class="flex w-0 flex-1 items-center">
                                                    <font-awesome-icon :icon="['fas','paperclip']" class="h-5 w-5 flex-shrink-0 text-gray-400"/>
                                                    <span class="ml-2 w-0 flex-1 truncate">coverletter_front_end_developer.pdf</span>
                                                </div>
                                                <div class="ml-4 flex-shrink-0">
                                                    <a href="#" class="font-medium text-blue-600 hover:text-blue-500 mr-5">เปลี่ยนรูป</a>
                                                    <a href="#" class="font-medium text-blue-600 hover:text-blue-500">ลบ</a>
                                                </div>
                                            </li>
                                            </ul>
                                        </dd>
                                    </div>
                                </div>
            
                                <div class="bg-gray-50 px-4 py-4 sm:px-6">
                                    <span class="isolate inline-flex rounded-md shadow-sm">
                                        <button 
                                        type="button" 
                                        class="relative inline-flex items-center rounded-l-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                                        <font-awesome-icon :icon="['fas','chevron-up']" class="text-gray-500 text-[12px]"/>
                                        </button>
                                        <button 
                                        type="button" 
                                        class="relative -ml-px inline-flex items-center border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                                        <font-awesome-icon :icon="['fas','chevron-down']" class="text-gray-500 text-[12px]"/>
                                        </button>
                                        <button 
                                        type="button" 
                                        class="relative -ml-px inline-flex items-center border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                                        <font-awesome-icon :icon="['fas','pencil']" class="text-gray-500 text-[12px]"/>
                                        </button>
                                        <button 
                                        @click="deleteData(content.id)"
                                        type="button" 
                                        class="relative -ml-px inline-flex items-center rounded-r-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                                        <font-awesome-icon :icon="['fas','trash']" class="text-gray-500 text-[12px]"/>
                                        </button>
                                    </span>
                                </div>
            
                            </div>

                            <div class="relative mt-5 mb-5">
                                <div class="absolute inset-0 flex items-center" aria-hidden="true">
                                    <div class="w-full border-t border-gray-300"></div>
                                </div>
                                <div class="relative flex justify-center">
                                    <button type="button" class="inline-flex items-center rounded-full border border-gray-300 bg-white px-4 py-1.5 text-sm font-medium leading-5 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                                    <!-- Heroicon name: mini/plus -->
                                    <svg class="-ml-1.5 mr-1 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                                    </svg>
                                    <span>เพิ่ม</span>
                                    </button>
                                </div>
                            </div>

                        </section>

                    </div>
                </div>
            </div>
        </div>
    </div>
</template>