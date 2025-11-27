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
                <button @click="$router.push('/'+ParentPage)" type="button" class="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"><font-awesome-icon :icon="['fas','chevron-left']" class="text-gray-200 mr-2"/> ย้อนกลับ</button>
              </div>
            </div>
            
        </div>

        <div class="flex-1 bg-gray-100">
            <div class="mt-8">
                <div class="mx-auto max-w-7xl px-6 sm:px-6 lg:px-6">
                    <div class="space-y-6 sm:px-6 lg:col-span-9 lg:px-0">
                      <form @submit.prevent="addSchoolAdmin">
                        <section aria-labelledby="payment-details-heading">
                          
                            <div class="shadow sm:overflow-hidden sm:rounded-md">
                              <div class="bg-white py-6 px-4 sm:p-6">
                                <div>
                                  <h2 id="payment-details-heading" class="text-lg font-medium leading-6 text-gray-900">ข้อมูลส่วนตัว</h2>
                                  <p class="mt-1 text-sm text-gray-500">Update your billing information. Please note that updating your location could affect your tax rates.</p>
                                </div>
        
                                <div class="mt-6 grid grid-cols-4 gap-6">
                                  <div class="col-span-4 sm:col-span-2">
                                      <label for="firstname" class="block text-sm font-medium text-gray-700">ชื่อจริง</label>
                                      <input v-model="firstname" type="text" name="firstname" id="firstname" autocomplete="firstname" class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm">
                                  </div>
        
                                  <div class="col-span-4 sm:col-span-2">
                                      <label for="lastname" class="block text-sm font-medium text-gray-700">นามสกุล</label>
                                      <input v-model="lastname" type="text" name="lastname" id="lastname" autocomplete="lastname" class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm">
                                  </div>
        
                                  <div class="col-span-4 sm:col-span-2">
                                      <label for="email" class="block text-sm font-medium text-gray-700">อีเมล์</label>
                                      <input v-model="email" type="text" name="email" id="email" autocomplete="email" class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm">
                                  </div>
        
                                  <div class="col-span-4 sm:col-span-2">
                                    <label for="phone" class="block text-sm font-medium text-gray-700">เบอร์โทร</label>
                                    <input v-model="phone" type="text" name="phone" id="phone" autocomplete="phone" class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm">
                                  </div>
                                </div>
        
                              </div>
                            </div>
        
                        </section>
        
                        <section aria-labelledby="plan-heading" class="mt-8">
                          <div class="shadow sm:overflow-hidden sm:rounded-md">
                              <div class="bg-white py-6 px-4 sm:p-6">
                                <div>
                                  <h2 id="payment-details-heading" class="text-lg font-medium leading-6 text-gray-900">ข้อมูลผู้ใช้งาน</h2>
                                </div>
        
                                <div class="mt-6 grid grid-cols-4 gap-6">
                                  <div class="col-span-4 sm:col-span-2">
                                      <label for="usernamee" class="block text-sm font-medium text-gray-700">ชื่อผู้ใช้งาน</label>
                                      <input v-model="username" type="text" name="username" id="username" autocomplete="username" class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm">
                                  </div>
        
                                  <div class="col-span-4 sm:col-span-2">
                                      <label for="password" class="block text-sm font-medium text-gray-700">รหัสผ่าน</label>
                                      <input v-model="password" type="password" name="password" id="password" autocomplete="password" class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm">
                                  </div>
                                </div>
        
                              </div>
        
                              <div class="bg-gray-50 px-4 py-3 text-right sm:px-6 border-t">
                                <button type="submit" class="inline-flex justify-center rounded-md border border-transparent bg-gray-800 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2">
                                  <font-awesome-icon :icon="['fas','save']" class="pr-2 pl-2"/>บันทึกข้อมูล</button>
                              </div>
                          </div>
                        </section>
                      </form>
                    </div>
                </div>
            </div>
        </div>

    </div>
  </main>
</template>