<script>
import storageManager from '@/plugins/storage';
import Breadcrumbs from '@/interface/template/outline/Breadcrumbs.vue';
export default {
  name: 'ContactUs',
  inject: ['apiServer'],
  data() {
    return {
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
    Breadcrumbs
  },
  methods: {
    async addSchool() {
      try {
        this.activeBlock = true;
        let accessToken  = storageManager.get('session','token')
        const resAPI = await fetch("https://asia-southeast2-elearning-6871c.cloudfunctions.net/schools/", {
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
  
  <breadcrumbs
  :navigation="
  [
    {
      name: 'ย้อนกลับ',
      link: '/student/index',
      style: 'chevron-left'
    }
  ]"
  /> 

  <div class="flex-1 pb-8 bg-gray-100 pt-2 pb-5 border-t">
    <div class="mt-8">
        <div class="mx-auto max-w-7xl px-6 sm:px-6 lg:px-6">
            <div class="space-y-6 sm:px-6 lg:col-span-9 lg:px-0">
              <form @submit.prevent="addSchool">
                <section aria-labelledby="payment-details-heading" class="relative" :data-content="'กำลังติดต่อฐานข้อมูล กรุณารอสักครู่.....'" :class="[(activeBlock?'isblock' : 'isunblock')]">
                  
                    <div class="shadow sm:overflow-hidden sm:rounded-md">
                      <div class="bg-white py-6 px-4 sm:p-6">
                        <div>
                          <h2 id="payment-details-heading" class="text-lg font-medium leading-6 text-gray-900">ข้อมูลส่วนตัว</h2>
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
                          <h2 id="payment-details-heading" class="text-lg font-medium leading-6 text-gray-900">ข้อมูลการติดต่อ</h2>
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