<script>
import {useRoute} 	from 'vue-router'
export default {
    name: 'PageHeader',
    data() {
        const route = useRoute();
        return {
          PageName: route.meta.title,
          PageIcon: route.meta.icon,
          PagePath: route.meta.path,
          ParentName: route.meta.parent,
          ParentPage: route.meta.page,
        }
    },
    components:{},
    methods:{},
    setup(){},
    mounted(){},
}
</script>
<template>
<div class="flex-1 bg-white">
  <div class="pt-8">
    <div class="mx-auto px-6 sm:px-6 lg:px-6">
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
                  <a :href="'/' + ParentPage" class="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">{{ParentName}}</a>
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
            <button @click="$router.push('/' + ParentPage + '/' + PagePath)" type="button" class="ml-3 inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"><font-awesome-icon :icon="['fas','chevron-left']" class="text-gray-200 mr-2"/> ย้อนกลับ</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
</template>