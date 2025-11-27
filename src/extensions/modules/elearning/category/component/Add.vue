<script>
import Breadcrumbs from '@/interface/template/outline/Breadcrumbs.vue';
import storageManager from '@/plugins/storage';
import MiniMCE              from 'minimce'

import 'tinymce/skins/ui/oxide/skin.min.css'
import 'tinymce/themes/silver/theme'
import 'tinymce/icons/default/icons' 

export default {
  name: 'ContactUs',
  inject: ['apiServer'],
  data() {
    return {
      name: '',
      code: '',
      detail: '',
      configs: storageManager.get('configs'),
      activeBlock: false
    }
  },
  components: {
    Breadcrumbs,
    MiniMCE
  },
  methods: {
    async addData() {
      try {
        this.activeBlock = true;

        const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/category/", {
          method: 'POST',
          headers: {'Content-Type': 'application/json','client-token-key':this.configs.key},
          body: JSON.stringify({
            data: {
              name: this.name,
              code: this.code,
              detail: this.detail,
              collection: this.configs.siteID,
            }
          })
        });
        const finalRes   = await resAPI.json();

        if(resAPI.status===200) {
          window.location.href = "/category/dashboard"
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
      link: '/category/dashboard',
      style: 'chevron-left'
    }
  ]"
  /> 

  <div class="flex-1 bg-gray-100 pt-2 pb-5">
    <div class="mt-2">
        <div class="mx-auto max-w-7xl px-6 sm:px-6 lg:px-6">
            <div class="space-y-6 sm:px-6 lg:col-span-9 lg:px-0">
              <form @submit.prevent="addData">
                <section aria-labelledby="payment-details-heading" class="relative" :data-content="'กำลังติดต่อฐานข้อมูล กรุณารอสักครู่.....'" :class="[(activeBlock?'isblock' : 'isunblock')]">
                  
                    <div class="shadow sm:overflow-hidden sm:rounded-md">
                      <div class="bg-white py-6 px-4 sm:p-6">
                        <div>
                          <h2 id="payment-details-heading" class="text-lg font-medium leading-6 text-gray-900">ข้อมูลหมวดหมู่</h2>
                          <p class="mt-1 text-sm text-gray-500">กรอกข้อมูลของหลักสูตรให้ครบถ้วน.</p>
                        </div>

                        <div class="mt-6 grid grid-cols-4 gap-6">

                          <div class="col-span-4 sm:col-span-2">
                            <label for="name" class="block text-sm font-medium text-gray-700">ชื่อ</label>
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

                      </div>
                    </div>


                    <div class="shadow sm:overflow-hidden sm:rounded-md mt-8">
                      <div class="bg-white py-6 px-4 sm:p-6">
                        <div>
                          <h2 id="payment-details-heading" class="text-lg font-medium leading-6 text-gray-900">คำอธิบาย</h2>
                          <p class="mt-1 text-sm text-gray-500">กรอกข้อมูลของหลักสูตรให้ครบถ้วน.</p>
                        </div>

                        <div class="mt-6">

                          <div class="col-span-4 sm:col-span-3">
                            <div class="col-span-4 sm:col-span-6">
                              <MiniMCE v-model="detail" :options="{}" />
                            </div>
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