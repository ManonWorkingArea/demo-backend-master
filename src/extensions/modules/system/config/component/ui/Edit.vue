<script>
import PageHeader from '@/interface/template/Pageheader.vue';
import {useRoute} 	from 'vue-router'
import storageManager from '@/plugins/storage';

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
      Callback: route.meta.callback,
      name: '',
      slug: '',
      description: '',
      activeBlock: false,
      loading_sources: true,
      dataItem: this.$route.params.id,
      accessToken:storageManager.get('session','token')
    }
  },
  components: {
    PageHeader
  },
  methods: {
    async getData() {
        if(storageManager.get('session','login')) {
          try {
          this.loading_sources  = false;
          const resAPI          = await fetch("https://asia-southeast2-elearning-6871c.cloudfunctions.net/" + this.Callback + "/" + this.dataItem,
          {
            method: 'GET',
            headers: {'Content-Type': 'application/json','Authorization': 'Bearer ' + this.accessToken},
          });

          const RestReturn   = await resAPI.json();
          console.log(RestReturn);

          if(RestReturn.success){
            this.name = RestReturn.data.name
            this.slug = RestReturn.data.slug
            this.description = RestReturn.data.description
            this.loading_sources = true;
          }

          } catch (error) {
            console.log(error)
          }
        }
    },
    async updataData() {
        if(storageManager.get('session','login')) {
          try {
            const accessToken   = storageManager.get('session','token')
            let item            = this.$route.params.id;
            const callApi       = await fetch("https://asia-southeast2-elearning-6871c.cloudfunctions.net/" + this.Callback + "/" + item, {
              method: 'PUT',
              headers: {'Content-Type': 'application/json','Authorization': 'Bearer ' + accessToken},
              body: JSON.stringify({
                "name":this.name,
                "slug":this.slug,
                "description":this.description,
              })
            });
            const finalRes   = await callApi.json();

            if(finalRes.success) {
              this.$swal({ 
                title: "บันทึกข้อมูลเรียบร้อยแล้ว ?",
                text: "คุณต้องการที่จะดำเนินการอย่างไร !",
                type: "success",
                showCancelButton: true,
                confirmButtonColor: "#0054b4",
                confirmButtonText: "กลับไปหน้าหลัก",
                cancelButtonText: "รีเฟรซหน้านี้",
                closeOnConfirm: false,
                closeOnCancel: false 
              }).then((confirmed) => {
                if (confirmed.isConfirmed) {
                  console.log("Home");
                  window.location.href = "/config/" + this.PagePath
                } else {
                  console.log("New");
                  window.location.reload();
                }
              });
            }
          } catch (error) {
            console.log(error)
          }
        }
    },
  },
  setup() {},
  async mounted () { 
    try {
      await this.getData();
    } catch (error) {
      console.log(Error);
    }
  },
}
</script>

<template>

<PageHeader/>

<div class="flex-1 bg-gray-100 pt-2 pb-5 border-t">
  <div class="mt-8">
      <div class="mx-auto max-w-7xl px-6 sm:px-6 lg:px-6">
          <div class="space-y-6 sm:px-6 lg:col-span-9 lg:px-0">

            <div class="divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow">
              <div class="px-4 py-5 sm:px-6">
              </div>
              <div class="px-4 py-5 sm:p-6">
              </div>
              <div class="bg-gray-50 px-4 py-4 sm:px-6">
              </div>
            </div>

            <div class="divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow">

              <div class="px-4 py-5 sm:px-6">
                <h2 id="payment-details-heading" class="text-lg font-bold leading-6 text-gray-900">แก้ไขข้อมูล</h2>
                <p class="mt-1 text-sm text-gray-500">กรอกข้อมูลด้้านล่างให้ครบถ้วน</p>
              </div>

              <form @submit.prevent="updataData">
                <div class="px-4 py-5 sm:p-6">
                  <div class="grid grid-cols-4 gap-6">

                    <div class="col-span-4 sm:col-span-2">
                      <label for="name" class="block text-base font-medium text-gray-900">ชื่อหมวดหมู่</label>
                      <input 
                      v-model="name" 
                      type="text" name="name" id="name" autocomplete="name" 
                      class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm">
                    </div>

                    <div class="col-span-4 sm:col-span-2">
                      <label for="slug" class="block text-base font-medium text-gray-900">รหัสหมวดหมู่</label>
                      <input 
                      v-model="slug"
                      type="text" name="slug" id="slug" autocomplete="slug" 
                      class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm">
                    </div>
                    
                    <div class="col-span-4 sm:col-span-6">
                      <label for="slug" class="block text-base font-medium text-gray-900">คำอธิบาย</label>
                      <input 
                      v-model="description"
                      type="text" name="description" id="description" autocomplete="description" 
                      class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm">
                    </div>

                  </div>
                </div>
                <div class="bg-gray-50 px-4 py-4 sm:px-6 text-right">
                  
                  <button
                  @click="$router.push('/config/' + this.PagePath)"
                  type="button" 
                  class="inline-flex items-center rounded-md border border-gray-300 bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                  ยกเลิก
                  </button>

                  <button 
                  type="submit" 
                  class="ml-3 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                  <font-awesome-icon :icon="['fas','save']" class="pr-2 pl-2"/>บันทึกข้อมูล
                  </button>
                  
                </div>
              </form>
            </div>

          </div>
      </div>
  </div>
</div>

</template>