<template>
    <div class="flex-1 bg-white">
      <div class="pt-4">
        <div class="mx-auto max-w-7xl px-6 sm:px-6 lg:px-6">
          <div>
            <div>
              <nav class="hidden sm:flex" aria-label="Breadcrumb">
                <ol role="list" class="flex items-center space-x-4">
                  <li>
                    <div class="flex">
                      <a href="/" class="text-sm font-medium text-gray-500 hover:text-gray-700">
                        <font-awesome-icon :icon="['fas','home']" />
                      </a>
                    </div>
                  </li>
                  <li v-if="$route.matched.length > 1">
                    <div class="flex items-center">
                      <font-awesome-icon :icon="['fas','chevron-right']" class="text-gray-200"/>
                      <a :href="'/' + this.ParentPage" class="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">{{ this.ParentName }}</a>
                    </div>
                  </li>
                  <li>
                    <div class="flex items-center">
                      <font-awesome-icon :icon="['fas','chevron-right']" class="text-gray-200"/>
                      <span class="ml-4 text-sm font-medium text-gray-400">{{ this.PageName }}</span>
                    </div>
                  </li>
                </ol>
              </nav>
            </div>
            <div class="mt-2 md:flex md:items-center md:justify-between pb-3">
              <div class="min-w-0 flex-1">
                <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-2xl sm:tracking-tight"><font-awesome-icon :icon="['fas',`${this.PageIcon}`]" class="text-gray-500 text-[18px]"/> {{ this.PageName }}</h2>
              </div>
                <div class="mt-4 flex flex-shrink-0 md:mt-0 md:ml-4">
                  <button
                    v-for="(button, index) in navigation"
                    :key="index"
                    @click="$router.push(button.link)"
                    type="button"
                    class="ml-3 inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    <font-awesome-icon :icon="['fas', `${button.style}`]" class="text-gray-200 mr-2" />
                    {{ button.name }}
                  </button>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>

  <script>
    import {useRoute} 	from 'vue-router'
    export default {
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
        components: {
        },
        props: {
          navigation: {
            type: Array,
            default: () => []
          }
        }
    }
</script>
