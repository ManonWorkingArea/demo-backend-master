<template>
    
    <div class="relative isolate overflow-hidden bg-gray-900 px-3 py-12 sm:py-12 lg:px-8">
      <img src="https://images.unsplash.com/photo-1470790376778-a9fbc86d70e2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&crop=focalpoint&fp-y=.8&w=2830&h=1500&q=80&blend=111827&sat=-100&exp=15&blend-mode=multiply" alt="" class="absolute inset-0 -z-10 h-full w-full object-cover">
      <div class="hidden sm:absolute sm:-top-10 sm:right-1/2 sm:-z-10 sm:mr-10 sm:block sm:transform-gpu sm:blur-3xl" aria-hidden="true">
        <div class="aspect-[1097/845] w-[68.5625rem] bg-gradient-to-tr from-[#ff4694] to-[#776fff] opacity-20" style="clip-path: polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)"></div>
      </div>
      <div class="absolute -top-52 left-1/2 -z-10 -translate-x-1/2 transform-gpu blur-3xl sm:top-[-28rem] sm:ml-16 sm:translate-x-0 sm:transform-gpu" aria-hidden="true">
        <div class="aspect-[1097/845] w-[68.5625rem] bg-gradient-to-tr from-[#ff4694] to-[#776fff] opacity-20" style="clip-path: polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)"></div>
      </div>
      <div class="mx-auto max-w-2xl text-center">
        <h2 class="text-2xl font-bold tracking-tight text-white sm:text-2xl">{{data.title}}</h2>
        <p class="mt-2 text-md leading-2 text-gray-300">{{data.createdAt}}</p>
      </div>
    </div>

    <div class="bg-white px-3 py-12 lg:px-8">
        <div class="mx-auto max-w-7xl text-base leading-7 text-gray-700">
            <div class="lg:flex lg:items-center lg:justify-between">
                <div class="min-w-0 flex-1">
                  <nav class="flex" aria-label="Breadcrumb">
                    <ol role="list" class="flex items-center space-x-4">
                      <li>
                        <div class="flex">
                          <router-link :to="'/'" class="text-sm font-medium text-gray-500 hover:text-gray-700"><font-awesome-icon :icon="['fas','home']" class="text-gray-500 mr-2"/> หน้าหลัก</router-link>
                        </div>
                      </li>
                      <li>
                        <div class="flex items-center">
                          <font-awesome-icon :icon="['fas','chevron-right']" class="text-gray-400 mr-2 text-xs"/>
                          <router-link :to="'/cms/page/' + this.pageData.slug" class="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">{{ this.pageData.title }}</router-link>
                        </div>
                      </li>
                      <li class="hidden md:block">
                        <div class="flex items-center">
                          <font-awesome-icon :icon="['fas','chevron-right']" class="text-gray-400 mr-2 text-xs"/>
                          <span class="ml-4 text-sm font-medium text-gray-300 hover:text-gray-700">{{data.slug}}</span>
                        </div>
                      </li>
                    </ol>
                  </nav>
                  <h2 class="mt-2 text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">{{data.title}}</h2>
                  <div class="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6">
                    <div class="mt-2 flex items-center text-sm text-gray-500">
                      <font-awesome-icon :icon="['fas','calendar']" class="text-gray-400 mr-2 text-md"/>
                      {{data.createdAt}}
                    </div>
                  </div>
                </div>
                <div class="mt-5 flex lg:ml-4 lg:mt-0">
                  <span class="hidden sm:block">
                    <button type="button" class="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                      <svg class="-ml-0.5 mr-1.5 h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
                      </svg>
                      Report
                    </button>
                  </span>
              
                  <span class="ml-3 hidden sm:block">
                    <button type="button" class="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                      <svg class="-ml-0.5 mr-1.5 h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path d="M12.232 4.232a2.5 2.5 0 013.536 3.536l-1.225 1.224a.75.75 0 001.061 1.06l1.224-1.224a4 4 0 00-5.656-5.656l-3 3a4 4 0 00.225 5.865.75.75 0 00.977-1.138 2.5 2.5 0 01-.142-3.667l3-3z" />
                        <path d="M11.603 7.963a.75.75 0 00-.977 1.138 2.5 2.5 0 01.142 3.667l-3 3a2.5 2.5 0 01-3.536-3.536l1.225-1.224a.75.75 0 00-1.061-1.06l-1.224 1.224a4 4 0 105.656 5.656l3-3a4 4 0 00-.225-5.865z" />
                      </svg>
                      Share
                    </button>
                  </span>
              
              
                </div>
              </div>

        
          <div class="mt-8" v-html="data.content"></div>

          <div class="mt-5">
              <label for="comment" class="block text-md font-bold leading-6 text-gray-900">แสดงความคิดเห็น</label>
              <div class="mt-2">
              <textarea rows="4" name="comment" id="comment" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"></textarea>
              </div>
          </div>
  
        </div>
      </div>
      
    
  </template>
  
  <script>
  import { generateStyles } from '@/plugins/builder.js';
  import convertUtils from "@/plugins/convertUtils";
  import storageManager from '@/plugins/storage';
  import debug from '@/plugins/Logger.js';
  
  export default {
    props: {
      data: {
        type: Object,
        required: true
      }
    },
    data() {
      return {
        configs: storageManager.get('configs'),
        loading: false,
        activeBlock: false,
        statusFilter: 'all',
        currentPage: 1,
        limitItem: 10,
        listItems: [],
        totalItems: 0,
        totalPages: 0,
        pageData:''
      };
    },
    methods: {
        formatThaidate(date) {
            return convertUtils.toThaiDatetime(date,"short");
        },
        getShortText(text) {
            if (!text || text.trim().length === 0) {
                return ''; 
            }
            
            const tempElement = document.createElement('div');
            tempElement.innerHTML = text;
            
            const plainText = tempElement.textContent || tempElement.innerText || '';
            
            const maxLength = 100;
            if (plainText.length <= maxLength) {
                return plainText;
            } else {
                const shortText = plainText.substring(0, maxLength).trim();
                return shortText + '...';
            }
        },
        getHeaderClasses() {
            const classes = [
            'text-' + this.data.color,
            'text-' + this.data.fontSize,
            'font-' + this.data.fontWeight,
            'text-' + this.data.align
            ];
    
            if (this.data.heightOption === 'auto') {
            classes.push('h-auto');
            } else if (this.data.heightOption === 'full') {
            classes.push('h-full');
            if (this.data.alignH === 'top') {
                classes.push('align-top');
            } else if (this.data.alignH === 'middle') {
                classes.push('align-middle');
            } else if (this.data.alignH === 'bottom') {
                classes.push('align-bottom');
            }
    
            if (this.data.alignH === 'middle' || this.data.alignH === 'bottom') {
                classes.push('leading-normal');
            }
            } else if (this.data.heightOption === 'manual') {
            const heightValue = this.data.height + this.data.heightUnit;
            classes.push('h-' + heightValue);
            if (this.data.heightUnit === 'px') {
                classes.push('leading-' + heightValue);
            }
            }
    
            return classes;
        },
        async getPost() {
          try {
              const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/post/"+this.data.parent, {
                  method: 'GET',
                  headers: {'Content-Type': 'application/json','client-token-key':this.configs.key},
              });

              const RestReturn   = await resAPI.json();
              this.pageData = RestReturn
              debug.log(RestReturn);
          } catch (error) {
              debug.log(error)
          }
      },
    },
    async mounted () {
      try {
        await this.getPost();
      } catch (error) {
        debug.log(Error);
      }
    },
    computed: {
      styles() {
        return generateStyles(this.data);
      },
    },
  };
  </script>
  