<script>
import storageManager from '@/plugins/storage';
import {useRoute} 	from 'vue-router'
export default {
  name: 'ContactUs',
  inject: ['apiServer'],
  data() {
    const route = useRoute();
    return {
      PageName: route.meta.title,
      PageIcon: route.meta.icon,
      PagePath: route.meta.path,
      ParentName: route.meta.parent,
      ParentPage: route.meta.page,
      name: '',
      code: '',
      website: '',
      phone: '',
      email: '',
      s3Hosting: '',
      s3Region: '',
      s3Bucket: '',
      s3Key: '',
      s3Secret: '',
      s3EndpointDefault: '',
      s3Endpoint: '',
      description: '',
      activeBlock: false
    }
  },
  components: {
  },
  methods: {
    async addSchool() {
      try {
        this.activeBlock = true;
        let accessToken  = storageManager.get('session','token')
        const resAPI = await fetch("https://asia-southeast2-elearning-6871c.cloudfunctions.net/branchs/", {
          method: 'POST',
          headers: {'Content-Type': 'application/json','Authorization': 'Bearer ' + accessToken},
          body: JSON.stringify({
            name: this.name,
            website: this.website,
            phone: this.phone,
            email: this.email,
            description: this.description,
            code: this.code,
            s3Hosting: this.s3Hosting,
            s3Region: this.s3Region,
            s3Bucket: this.s3Bucket,
            s3Key: this.s3Key,
            s3Secret: this.s3Secret,
            s3EndpointDefault: this.s3EndpointDefault,
            s3Endpoint: "https://" + this.s3Bucket + "." + this.s3Hosting + "/",
          })
        });
        const finalRes   = await resAPI.json();

        if(finalRes.success) {
          window.location.href = "/school"
        }

        console.log(finalRes);
      } catch (error) {
        console.log(error)
      }
    }
  },
  setup() {
  },
  mounted() {
  }
}
</script>

<template>
  <div class="flex-1">
    <div class="pt-8 mb-8 bg-white border-b">

      <div class="mx-auto max-w-7xl px-6 sm:px-6 lg:px-6">
          <div>
              <div>
                <nav class="sm:hidden" aria-label="Back">
                  <a href="#" class="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700">
                    <!-- Heroicon name: mini/chevron-left -->
                    <svg class="-ml-1 mr-1 h-5 w-5 flex-shrink-0 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clip-rule="evenodd" />
                    </svg>
                    Back
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
                  <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight"><font-awesome-icon :icon="['fas','calculator']" class="text-gray-500 text-[24px]"/> ข้อมูลผู้รับชำระเงิน</h2>
                </div>
                <div class="mt-4 flex flex-shrink-0 md:mt-0 md:ml-4">
                  <button @click="$router.push('/' + ParentPage)" type="button" class="ml-3 inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"><font-awesome-icon :icon="['fas','chevron-left']" class="text-gray-200 mr-2"/> ย้อนกลับ</button>
                </div>
              </div>
            </div>
            
      </div>
    </div>
  </div>

  <div class="flex-1 bg-gray-100 pt-2 pb-5">
    <div class="mt-2">
        <div class="mx-auto max-w-7xl px-6 sm:px-6 lg:px-6">
            <div class="space-y-6 sm:px-6 lg:col-span-9 lg:px-0">
              <form @submit.prevent="addSchool">
                <section aria-labelledby="payment-details-heading" class="relative" :data-content="'กำลังติดต่อฐานข้อมูล กรุณารอสักครู่.....'" :class="[(activeBlock?'isblock' : 'isunblock')]">
                  
                    <div class="shadow sm:overflow-hidden sm:rounded-md">
                      <div class="bg-white py-6 px-4 sm:p-6">
                        <div>
                          <h2 id="payment-details-heading" class="text-lg font-medium leading-6 text-gray-900">ข้อมูลสถาบัน</h2>
                          <p class="mt-1 text-sm text-gray-500">กรอกข้อมูลของหลักสูตรให้ครบถ้วน.</p>
                        </div>

                        <div class="mt-6 grid grid-cols-4 gap-6">

                          <div class="col-span-4 sm:col-span-2">
                            <label for="name" class="block text-sm font-medium text-gray-700">ชื่อโรงเรียน</label>
                            <input 
                            v-model="name" 
                            type="text" name="name" id="name" autocomplete="name" 
                            class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm">
                          </div>	

                          <div class="col-span-4 sm:col-span-2">
                            <label for="code" class="block text-sm font-medium text-gray-700">รหัส</label>
                            <input 
                            v-model="code" 
                            type="text" name="code" id="code" autocomplete="code" 
                            class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm">
                          </div>

                        </div>

                        <div class="mt-6 grid grid-cols-6 gap-6">

                          <div class="col-span-4 sm:col-span-3">
                            <label for="website" class="block text-sm font-medium text-gray-700">เว็บไซต์</label>
                            <input 
                            v-model="website" 
                            type="text" name="website" id="website" autocomplete="website" 
                            class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm">
                          </div>	

                          <div class="col-span-4 sm:col-span-3">
                            <label for="phone" class="block text-sm font-medium text-gray-700">เบอร์โทร</label>
                            <input 
                            v-model="phone" 
                            type="text" name="phone" id="phone" autocomplete="phone" 
                            class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm">
                          </div>

                          <div class="col-span-4 sm:col-span-3">
                            <label for="email" class="block text-sm font-medium text-gray-700">อีเมล์</label>
                            <input 
                            v-model="email"
                            type="text" name="email" id="email" autocomplete="email" 
                            class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm">
                          </div>
                        </div>

                        <div class="mt-6 grid grid-cols-6 gap-6">
                          <div class="col-span-4 sm:col-span-6">
                            <label for="description" class="block text-sm font-medium text-gray-700">คำอธิบาย</label>
                            <div class="mt-1">
                              <textarea 
                              v-model="description"
                              id="description" name="description" rows="3" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" placeholder="you@example.com"></textarea>
                            </div>
                            <p class="mt-2 text-sm text-gray-500">Brief description for your profile. URLs are hyperlinked.</p>
                          </div>
                        </div>

                      </div>
                    </div>


                    <div class="shadow sm:overflow-hidden sm:rounded-md mt-8">
                      <div class="bg-white py-6 px-4 sm:p-6">
                        <div>
                          <h2 id="payment-details-heading" class="text-lg font-medium leading-6 text-gray-900">ข้อมูลพื้นที่จัดเก็บไฟล์ (S3)</h2>
                          <p class="mt-1 text-sm text-gray-500">กรอกข้อมูลของหลักสูตรให้ครบถ้วน.</p>
                        </div>

                        <div class="mt-6 grid grid-cols-6 gap-6">

                          <div class="col-span-4 sm:col-span-2">
                            <label for="s3Hosting" class="block text-sm font-medium text-gray-700">Hosting</label>
                            <input 
                            v-model="s3Hosting" 
                            type="text" name="s3Hosting" id="s3Hosting" autocomplete="s3Hosting" 
                            class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm">
                          </div>	

                          <div class="col-span-4 sm:col-span-2">
                            <label for="s3Region" class="block text-sm font-medium text-gray-700">Region</label>
                            <input 
                            v-model="s3Region" 
                            type="text" name="s3Region" id="s3Region" autocomplete="s3Region" 
                            class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm">
                          </div>

                          <div class="col-span-4 sm:col-span-2">
                            <label for="s3Bucket" class="block text-sm font-medium text-gray-700">Bucket</label>
                            <input 
                            v-model="s3Bucket" 
                            type="text" name="s3Bucket" id="s3Bucket" autocomplete="s3Bucket" 
                            class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm">
                          </div>	

                          <div class="col-span-4 sm:col-span-2">
                            <label for="s3Key" class="block text-sm font-medium text-gray-700">Key</label>
                            <input 
                            v-model="s3Key" 
                            type="text" name="s3Key" id="s3Key" autocomplete="s3Key" 
                            class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm">
                          </div>

                          <div class="col-span-4 sm:col-span-2">
                            <label for="s3Secret" class="block text-sm font-medium text-gray-700">Secret</label>
                            <input 
                            v-model="s3Secret"
                            type="text" name="s3Secret" id="s3Secret" autocomplete="s3Secret" 
                            class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm">
                          </div>

                          <div class="col-span-4 sm:col-span-2">
                            <label for="s3EndpointDefault" class="block text-sm font-medium text-gray-700">Endpoint Default</label>
                            <input 
                            v-model="s3EndpointDefault"
                            type="text" name="s3EndpointDefault" id="s3EndpointDefault" autocomplete="s3EndpointDefault" 
                            class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm">
                          </div>

                        </div>

                      </div>
                    </div>

                </section>

                <section aria-labelledby="plan-heading" class="mt-8">
                  <div class="shadow sm:overflow-hidden sm:rounded-md">
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

</template>