<script>
import feather from 'feather-icons';
import {useRoute} 	from 'vue-router'
export default {
	name: 'Blank',
  data() {
    const route     = useRoute();
    this.PageName   = route.meta.title;
    this.PageIcon   = route.meta.icon;
    this.ParentName = route.meta.parent;
    this.ParentPage = route.meta.page;
    return {
      routeName:this.routeName,
    }
  },
	components: {},
	methods: {},
  updated() {
    feather.replace();
  },
  setup() {
      
  },
};
</script>

<template>

  <main class="flex-1 pb-8">
    <div class="mt-8">

        <div class="mx-auto max-w-7xl px-6 sm:px-6 lg:px-6">

            <nav class="sm:hidden" aria-label="Back">
              <a href="#" class="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700">
                <font-awesome-icon :icon="['fas','chevron-left']" class="text-gray-200 mr-2"/>
                Back
              </a>
            </nav>

            <nav class="hidden sm:flex" aria-label="Breadcrumb">
              <ol role="list" class="flex items-center space-x-4">
                <li>
                  <div class="flex">
                      <router-link to="/" class="text-sm font-medium text-gray-500 hover:text-gray-700">
                        <font-awesome-icon :icon="['fas','home']" />
                      </router-link>
                  </div>
                </li>
                <li>
                  <div class="flex items-center">
                    <font-awesome-icon :icon="['fas','chevron-right']" class="text-gray-200"/>
                    <a :href="'/' +ParentPage" class="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">{{ ParentName }}</a>

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

            <div class="mt-2 md:flex md:items-center md:justify-between  border-b pb-5 mb-5">
              <div class="min-w-0 flex-1">
                <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight"><font-awesome-icon :icon="['fas',PageIcon]" class="text-gray-500 text-[24px]"/> {{ PageName }}</h2>
              </div>
              <div class="mt-4 flex flex-shrink-0 md:mt-0 md:ml-4">
                <button @click="$router.push('/config')" type="button" class="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"><font-awesome-icon :icon="['fas','chevron-left']" class="text-gray-200 mr-2"/> ย้อนกลับ</button>
                <button @click="$router.push('/student/add')" type="button" class="ml-3 inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"><font-awesome-icon :icon="['fas','plus']" class="text-gray-200 mr-2"/> เพิ่มข้อมูลใหม่</button>
              </div>
            </div>
            
        </div>

        <div class="mx-auto max-w-7xl px-6 sm:px-6 lg:px-6">

            <div class="mt-8 flex flex-col">
              <div class="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div class="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                  <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                    <table class="min-w-full divide-y divide-gray-300">
                      <thead class="bg-gray-50">
                        <tr>
                          <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Name</th>
                          <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Title</th>
                          <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Email</th>
                          <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Role</th>
                          <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-6">
                            <span class="sr-only">Edit</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-gray-200 bg-white">
                        <tr>
                          <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">Lindsay Walton</td>
                          <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">Front-end Developer</td>
                          <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">lindsay.walton@example.com</td>
                          <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">Member</td>
                          <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-md font-medium sm:pr-6">

                                <button type="button" class="mr-2 inline-flex justify-center rounded-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2">
                                    <font-awesome-icon :icon="['fas','square-pen']" class="text-black mt-[3px] mr-2 text-md"/>
                                    <span>แก้ไข</span>
                                </button>

                                <button type="button" class="mr-2 inline-flex justify-center rounded-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2">
                                    <font-awesome-icon :icon="['fas','user-tie']" class="text-black mt-[3px] mr-2 text-md"/>
                                    <span>ผู้ดูแล</span>
                                </button>

                                <button type="button" class="inline-flex justify-center rounded-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2">
                                    <font-awesome-icon :icon="['fas','trash-can']" class="text-black mt-[3px] mr-2 text-md"/>
                                    <span>ลบ</span>
                                </button>
                          </td>
                        </tr>
          
                        <!-- More people... -->
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
          

    </div>
  </main>
</template>