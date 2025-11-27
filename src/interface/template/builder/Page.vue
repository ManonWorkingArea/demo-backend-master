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

    <div class="bg-white py-6 sm:py-6">
        <div class="mx-auto max-w-7xl px-6 lg:px-8">

          <div class="mx-auto mt-2 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            
            <article  v-for="(item) in listItems" :key="item._id" class="flex flex-col items-start justify-between">
              <div class="relative w-full">
                <img
                v-if="item.feature_image"
                :src="item.feature_image"
                alt=""
                class="aspect-[16/9] w-full rounded-2xl bg-gray-100 object-cover sm:aspect-[2/1] lg:aspect-[3/2]"
                />
                <img
                v-else
                src="https://images.unsplash.com/photo-1496128858413-b36217c2ce36?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=3603&q=80"
                alt=""
                class="aspect-[16/9] w-full rounded-2xl bg-gray-100 object-cover sm:aspect-[2/1] lg:aspect-[3/2]"
                />
                <div class="absolute inset-0 rounded-2xl ring-1 ring-inset ring-gray-900/10"></div>
              </div>
              <div class="max-w-xl">
                <div class="mt-8 flex items-center gap-x-4 text-xs">
                  <time datetime="2020-03-16" class="text-gray-500">{{ formatThaidate(item.createdAt) }}</time>
                  <a href="#" class="relative z-10 rounded-full bg-gray-50 px-3 py-1.5 font-medium text-gray-600 hover:bg-gray-100">{{ data.slug}}</a>
                </div>
                <div class="group relative">
                  <h3 class="mt-3 text-lg font-semibold leading-6 text-gray-900 group-hover:text-gray-600">
                      <router-link :to="'/cms/post/' + data.slug + '/' + item.slug">
                        <span class="absolute inset-0"></span>
                        {{ item.title }}
                      </router-link>
                  </h3>
                  <p class="mt-5 line-clamp-3 text-sm leading-6 text-gray-600">{{ getShortText(item.content) }}</p>
                </div>
              </div>
            </article>
      
          </div>



          <nav class="mt-8 flex items-center justify-between border-t border-gray-200 px-4 sm:px-0">
            <div class="-mt-px flex w-0 flex-1">
              <a href="#" class="inline-flex items-center border-t-2 border-transparent pr-1 pt-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700">
                <svg class="mr-3 h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M18 10a.75.75 0 01-.75.75H4.66l2.1 1.95a.75.75 0 11-1.02 1.1l-3.5-3.25a.75.75 0 010-1.1l3.5-3.25a.75.75 0 111.02 1.1l-2.1 1.95h12.59A.75.75 0 0118 10z" clip-rule="evenodd" />
                </svg>
                Previous
              </a>
            </div>
            <div class="hidden md:-mt-px md:flex">
              <a href="#" class="inline-flex items-center border-t-2 border-transparent px-4 pt-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700">1</a>
              <!-- Current: "border-indigo-500 text-indigo-600", Default: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300" -->
              <a href="#" class="inline-flex items-center border-t-2 border-indigo-500 px-4 pt-4 text-sm font-medium text-indigo-600" aria-current="page">2</a>
              <a href="#" class="inline-flex items-center border-t-2 border-transparent px-4 pt-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700">3</a>
              <span class="inline-flex items-center border-t-2 border-transparent px-4 pt-4 text-sm font-medium text-gray-500">...</span>
              <a href="#" class="inline-flex items-center border-t-2 border-transparent px-4 pt-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700">8</a>
              <a href="#" class="inline-flex items-center border-t-2 border-transparent px-4 pt-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700">9</a>
              <a href="#" class="inline-flex items-center border-t-2 border-transparent px-4 pt-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700">10</a>
            </div>
            <div class="-mt-px flex w-0 flex-1 justify-end">
              <a href="#" class="inline-flex items-center border-t-2 border-transparent pl-1 pt-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700">
                Next
                <svg class="ml-3 h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M2 10a.75.75 0 01.75-.75h12.59l-2.1-1.95a.75.75 0 111.02-1.1l3.5 3.25a.75.75 0 010 1.1l-3.5 3.25a.75.75 0 11-1.02-1.1l2.1-1.95H2.75A.75.75 0 012 10z" clip-rule="evenodd" />
                </svg>
              </a>
            </div>
          </nav>
          
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
        async getData() {
            try {
            this.loading = true;
            this.activeBlock = true;
    
            const andConditions = [{ parent: this.data._id }];
    
            if (this.statusFilter !== 'all') {
                andConditions.push({ status: this.statusFilter });
            }
    
            const pipeline = [
                {
                $match: {
                    $and: andConditions,
                },
                },
                {
                $facet: {
                    post: [
                    {
                        $skip: (this.currentPage - 1) * this.limitItem,
                    },
                    {
                        $limit: this.limitItem,
                    },
                    ],
                    totalCount: [
                    {
                        $count: 'count',
                    },
                    ],
                },
                },
            ];
    
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json','client-token-key':this.configs.key },
                body: JSON.stringify({
                pipeline: pipeline,
                }),
            };
    
            const resAPI = await fetch(
                'https://gateway.cloudrestfulapi.com/api/post/aggregate',
                requestOptions
            );
    
            const data = await resAPI.json();
            const postResults = data[0].post;
            const totalCount = data[0].totalCount[0].count;
    
            debug.log('Post Results:', postResults);
            debug.log('Total Count:', totalCount);
    
            if (data) {
                const totalCount = data[0]?.totalCount?.[0]?.count || 0;
    
                const formattedData = {
                data: data[0].post,
                total: totalCount,
                paging: {
                    page: this.currentPage,
                    limit: this.limitItem,
                    totalPages: Math.ceil(totalCount / this.limitItem),
                },
                };
    
                this.listItems = formattedData.data;
                this.totalItems = formattedData.total;
                this.totalPages = formattedData.paging.totalPages;
    
                debug.log('data', this.listItems);
    
                this.loading = false;
                this.activeBlock = false;
            }
            } catch (error) {
            debug.log(error);
            }
        },
    },
    async mounted () {
      try {
        await this.getData();
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
  