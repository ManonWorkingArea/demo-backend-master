<script>
import feather from 'feather-icons';
import {useRoute} 	from 'vue-router'
export default {
	name: 'ConfigList',
  data() {
    const route     = useRoute();
    return {
        PageName: route.meta.title,
        PageIcon: route.meta.icon,
        PagePath: route.meta.path,
        ParentName: route.meta.parent,
        ParentPage: route.meta.page,
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

    <div class="flex-1 bg-white">
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
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="flex-1 pb-8 bg-gray-100 pt-2 pb-5 border-t">
        <div class="mt-8">
            <div class="mx-auto max-w-7xl px-6 sm:px-6 lg:px-6">

                <div class="mt-8 flex flex-col">
                <div class="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div class="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                    <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">

                        <div class="divide-y divide-gray-200 overflow-hidden rounded-lg bg-gray-200 shadow sm:grid sm:grid-cols-2 sm:gap-px sm:divide-y-0">
                            <div class="rounded-tl-lg rounded-tr-lg sm:rounded-tr-none relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500">
                            <div class="mt-4">
                                <h3 class="text-lg font-medium">
                                    <router-link to="/config/category" class="focus:outline-none">
                                        <span class="absolute inset-0" aria-hidden="true"></span>
                                        <font-awesome-icon :icon="['fas','folder']" class="text-yellow-500"/> หมวดหมู่ของหลักสูตร
                                    </router-link>
                                </h3>
                                <p class="mt-2 text-sm text-gray-500">กำหนดข้อมูล Master สำหรับตั้งค่า หมวดหมู่ของหลักสูตรเพื่อใช้ในการจำแนกข้อมูลหลักสูตรของทุกสถานันที่มีหลักสูตรอยู่ในระบบ</p>
                            </div>
                            <span class="pointer-events-none absolute top-6 right-6 text-gray-300 group-hover:text-gray-400" aria-hidden="true">
                                <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20 4h1a1 1 0 00-1-1v1zm-1 12a1 1 0 102 0h-2zM8 3a1 1 0 000 2V3zM3.293 19.293a1 1 0 101.414 1.414l-1.414-1.414zM19 4v12h2V4h-2zm1-1H8v2h12V3zm-.707.293l-16 16 1.414 1.414 16-16-1.414-1.414z" />
                                </svg>
                            </span>
                            </div>
                        
                            <div class="sm:rounded-tr-lg relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500">
                            <div class="mt-4">
                                <h3 class="text-lg font-medium">
                                <router-link to="/config/type" class="focus:outline-none">
                                    <span class="absolute inset-0" aria-hidden="true"></span>
                                    <font-awesome-icon :icon="['fas','code-branch']" class="text-yellow-500"/> ประเภทของหลักสูตร
                                </router-link>
                                </h3>
                                <p class="mt-2 text-sm text-gray-500">กำหนดข้อมูล Master สำหรับตั้งค่า ประเภทการแสดงผลของหลักสูตรในระบบ</p>
                            </div>
                            <span class="pointer-events-none absolute top-6 right-6 text-gray-300 group-hover:text-gray-400" aria-hidden="true">
                                <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20 4h1a1 1 0 00-1-1v1zm-1 12a1 1 0 102 0h-2zM8 3a1 1 0 000 2V3zM3.293 19.293a1 1 0 101.414 1.414l-1.414-1.414zM19 4v12h2V4h-2zm1-1H8v2h12V3zm-.707.293l-16 16 1.414 1.414 16-16-1.414-1.414z" />
                                </svg>
                            </span>
                            </div>
                        
                            <div class="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500">
                            <div class="mt-4">
                                <h3 class="text-lg font-medium">
                                <router-link to="/config/mode" class="focus:outline-none">
                                    <span class="absolute inset-0" aria-hidden="true"></span>
                                    <font-awesome-icon :icon="['fas','keyboard']" class="text-yellow-500"/> วิธีการเรียน
                                </router-link>
                                </h3>
                                <p class="mt-2 text-sm text-gray-500">กำหนดข้อมูล Master สำหรับตั้งค่า รูปแบบ วิธีการ เพื่อเข้าสู่เนื้อหาของหลักสูตร</p>
                            </div>
                            <span class="pointer-events-none absolute top-6 right-6 text-gray-300 group-hover:text-gray-400" aria-hidden="true">
                                <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20 4h1a1 1 0 00-1-1v1zm-1 12a1 1 0 102 0h-2zM8 3a1 1 0 000 2V3zM3.293 19.293a1 1 0 101.414 1.414l-1.414-1.414zM19 4v12h2V4h-2zm1-1H8v2h12V3zm-.707.293l-16 16 1.414 1.414 16-16-1.414-1.414z" />
                                </svg>
                            </span>
                            </div>
                        
                            <div class="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500">
                            <div class="mt-4">
                                <h3 class="text-lg font-medium">
                                <router-link to="/config/display" class="focus:outline-none">
                                    <span class="absolute inset-0" aria-hidden="true"></span>
                                    <font-awesome-icon :icon="['fas','display']" class="text-yellow-500"/> การแสดงผล
                                </router-link>
                                </h3>
                                <p class="mt-2 text-sm text-gray-500">กำหนดข้อมูล Master สำหรับตั้งค่า การแสดงผลของหลักสูตรในระบบ</p>
                            </div>
                            <span class="pointer-events-none absolute top-6 right-6 text-gray-300 group-hover:text-gray-400" aria-hidden="true">
                                <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20 4h1a1 1 0 00-1-1v1zm-1 12a1 1 0 102 0h-2zM8 3a1 1 0 000 2V3zM3.293 19.293a1 1 0 101.414 1.414l-1.414-1.414zM19 4v12h2V4h-2zm1-1H8v2h12V3zm-.707.293l-16 16 1.414 1.414 16-16-1.414-1.414z" />
                                </svg>
                            </span>
                            </div>
                        
                            <div class="sm:rounded-bl-lg relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500">
                            <div class="mt-4">
                                <h3 class="text-lg font-medium">
                                <router-link to="/config/general" class="focus:outline-none">
                                    <span class="absolute inset-0" aria-hidden="true"></span>
                                    <font-awesome-icon :icon="['fas','cog']" class="text-yellow-500"/> ตั้งค่าทั่วไป
                                </router-link>
                                </h3>
                                <p class="mt-2 text-sm text-gray-500">ตั้งค่าการแสดงผลของเว็บไซต์</p>
                            </div>
                            <span class="pointer-events-none absolute top-6 right-6 text-gray-300 group-hover:text-gray-400" aria-hidden="true">
                                <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20 4h1a1 1 0 00-1-1v1zm-1 12a1 1 0 102 0h-2zM8 3a1 1 0 000 2V3zM3.293 19.293a1 1 0 101.414 1.414l-1.414-1.414zM19 4v12h2V4h-2zm1-1H8v2h12V3zm-.707.293l-16 16 1.414 1.414 16-16-1.414-1.414z" />
                                </svg>
                            </span>
                            </div>
                        
                            <div class="rounded-bl-lg rounded-br-lg sm:rounded-bl-none relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500">
                            <div class="mt-4">
                                <h3 class="text-lg font-medium">
                                <router-link to="/config/tools" class="focus:outline-none">
                                    <span class="absolute inset-0" aria-hidden="true"></span>
                                    <font-awesome-icon :icon="['fas','wrench']" class="text-yellow-500"/> เครื่องมือช่วยเหลือ
                                </router-link>
                                </h3>
                                <p class="mt-2 text-sm text-gray-500">เครื่องมือสำหรับจัดการข้อมูลในระบบ</p>
                            </div>
                            <span class="pointer-events-none absolute top-6 right-6 text-gray-300 group-hover:text-gray-400" aria-hidden="true">
                                <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20 4h1a1 1 0 00-1-1v1zm-1 12a1 1 0 102 0h-2zM8 3a1 1 0 000 2V3zM3.293 19.293a1 1 0 101.414 1.414l-1.414-1.414zM19 4v12h2V4h-2zm1-1H8v2h12V3zm-.707.293l-16 16 1.414 1.414 16-16-1.414-1.414z" />
                                </svg>
                            </span>
                            </div>
                        </div>
    
                    </div>
                    </div>
                </div>
                </div>
            </div>
            
        </div>
    </div>
</template>