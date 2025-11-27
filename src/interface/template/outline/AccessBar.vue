<template>
    <header class="py-1 bg-gray-800 border-b border-1 border-gray-700">
        <div class=" px-4 sm:px-6 lg:px-8 xl:flex xl:items-center xl:justify-between">
          <div class="min-w-0 flex-1">
            <h1 class="mt-1 text-[16px] font-semibold leading-8 text-gray-200">
              <font-awesome-icon :icon="['fas',this.PageIcon]" class="text-indiego-500 text-[16px]"/>
              <span class="ml-2">{{ this.configs.siteName }} <small class="font-normal capitalize text-gray-600">( {{ this.configs.siteType }} )</small></span>
            </h1>
          </div>
          <div class="mt-5 flex xl:mt-0 xl:ml-4">
            <div class="flex items-center space-x-4">
              <div>
                <p class="text-gray-600 capitalize"><font-awesome-icon :icon="['fas','key']" class="text-yellow-500 pr-2 text-[16px]"/> {{ this.session.role }}</p>
              </div>
            </div>
          </div>
        </div>
      </header>      
  </template>
  
  <script>
      import {useRoute} 	from 'vue-router'
      import { markTailwind } from '@/plugins/tailwind-utils';
      import storageManager from '@/plugins/storage';
      export default {
          data() {
              const route = useRoute();
              return {
                  PageName: route.meta.title,
                  PageIcon: route.meta.icon,
                  PagePath: route.meta.path,
                  ParentName: route.meta.parent,
                  ParentPage: route.meta.page,
                  session: storageManager.get('session'),
                  configs: storageManager.get('configs')
              }
          },
          methods: {
            getClasses(className) {
              const tailwindClasses = markTailwind(className);
              return `${tailwindClasses}`;
            },
            handleNavigationClick(item) {
              if (item.function) {
                this.$emit(item.function);
              } else {
                this.$router.push(item.link);
              }
            }
          },
          components: {
          },
          props: {
              button:Boolean,
              name: String,
              link: String,
              style: String,
              navigation: {
                type: Array,
                default: () => []
              }
          }
      }
  </script>
  