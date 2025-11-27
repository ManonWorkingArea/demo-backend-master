<script>
import Breadcrumbs from '@/interface/template/outline/Breadcrumbs.vue';
import CryptoJS from 'crypto-js';
import storageManager from '@/plugins/storage';

export default {
  name: 'ContactUs',
  inject: ['apiServer'],
  data() {
    return {
      firstname: '',
      lastname: '',
      phone: '',
      email: '',
      username: '',
      password: '',
      role: '',
      configs: storageManager.get('configs'),
      activeBlock: false
    }
  },
  components: {
    Breadcrumbs
  },
  methods: {
    async addAdmin() {
      try {
        this.activeBlock = true;
        const salt = CryptoJS.lib.WordArray.random(16);
        const hash = CryptoJS.SHA256(this.password + salt).toString();
        const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/user/", {
          method: 'POST',
          headers: {'Content-Type': 'application/json','client-token-key':this.configs.key},
          body: JSON.stringify({
            data: {
              firstname: this.firstname,
              lastname: this.lastname,
              phone: this.phone,
              email: this.email,
              username: this.username,
              password: hash,
              parent: this.configs.siteID,
              salt: salt.toString(),
              role: "admin",
            },
            options: {
              fieldType: [],
              uniqueFields: [
                ["username"]
              ]
            }
          })
        });
        const finalRes   = await resAPI.json();

        if(finalRes.success) {
          window.location.href = "/origin/user"
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
      link: '/school/user',
      style: 'chevron-left'
    }
  ]"
  /> 

  <div class="flex-1 bg-gray-100 pt-2 pb-5">
    <div class="mt-2">
        <div class="mx-auto max-w-7xl px-6 sm:px-6 lg:px-6">
            <div class="space-y-6 sm:px-6 lg:col-span-9 lg:px-0">
              <form @submit.prevent="addAdmin">
                <section aria-labelledby="payment-details-heading" class="relative" :data-content="'กำลังติดต่อฐานข้อมูล กรุณารอสักครู่.....'" :class="[(activeBlock?'isblock' : 'isunblock')]">
                  
                    <div class="shadow sm:overflow-hidden sm:rounded-md">
                      <div class="bg-white py-6 px-4 sm:p-6">
                        <div>
                          <h2 id="payment-details-heading" class="text-lg font-medium leading-6 text-gray-900">ข้อมูลส่วนตัว</h2>
                          <p class="mt-1 text-sm text-gray-500">กรอกข้อมูลของหลักสูตรให้ครบถ้วน.</p>
                        </div>

                        <div class="mt-6 grid grid-cols-4 gap-6">

                          <div class="col-span-4 sm:col-span-2">
                            <label for="firstname" class="block text-sm font-medium text-gray-700">ชื่อ</label>
                            <input 
                            v-model="firstname" 
                            type="text" name="firstname" id="firstname" autocomplete="firstname" 
                            class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm">
                          </div>	

                          <div class="col-span-4 sm:col-span-2">
                            <label for="lastname" class="block text-sm font-medium text-gray-700">นามสกุล</label>
                            <input 
                            v-model="lastname" 
                            type="text" name="lastname" id="lastname" autocomplete="lastname" 
                            class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm">
                          </div>

                        </div>

                        <div class="mt-6 grid grid-cols-6 gap-6">

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

                      </div>
                    </div>


                    <div class="shadow sm:overflow-hidden sm:rounded-md mt-8">
                      <div class="bg-white py-6 px-4 sm:p-6">
                        <div>
                          <h2 id="payment-details-heading" class="text-lg font-medium leading-6 text-gray-900">ข้อมูลบัญชี</h2>
                          <p class="mt-1 text-sm text-gray-500">กรอกข้อมูลของหลักสูตรให้ครบถ้วน.</p>
                        </div>

                        <div class="mt-6 grid grid-cols-6 gap-6">

                          <div class="col-span-4 sm:col-span-3">
                            <label for="username" class="block text-sm font-medium text-gray-700">ชื่อบัญชีผู้ใช้งาน</label>
                            <input 
                            v-model="username" 
                            type="text" name="username" id="username" autocomplete="username" 
                            class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm">
                          </div>

                          <div class="col-span-4 sm:col-span-3">
                            <label for="password" class="block text-sm font-medium text-gray-700">รหัสผ่าน</label>
                            <input 
                            v-model="password"
                            type="text" name="password" id="password" autocomplete="password" 
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