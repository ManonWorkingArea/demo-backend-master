<script>
import {useRoute} 	from 'vue-router'
import storageManager from '@/plugins/storage';
import MiniMCE from 'minimce'
import 'tinymce/skins/ui/oxide/skin.min.css'
import 'tinymce/themes/silver/theme'
import 'tinymce/icons/default/icons' 

export default {
  data() {
    const route = useRoute();
    return {
      PageName: route.meta.title,
      PageIcon: route.meta.icon,
      PagePath: route.meta.path,
      ParentName: route.meta.parent,
      ParentPage: route.meta.page,
      name: '',
      slug: '',
      description: '',
      type: 'post',
      view: '',
      activeBlock: false,
      loading_sources:true,
      accessToken:storageManager.get('session','token'),
      school:ls.get("school"),
      dataItem: this.$route.params.id,
    }
  },
  components: {
    MiniMCE
  },
  methods: {
    async addData() {
      try {
        this.activeBlock = true;
        const resAPI = await fetch("https://asia-southeast2-elearning-6871c.cloudfunctions.net/contents/", {
          method: 'POST',
          headers: {'Content-Type': 'application/json','Authorization': 'Bearer ' + this.accessToken},
          body: JSON.stringify({
            schoolId: this.school,
            name: this.name,
            slug: this.slug,
            description: this.description,
            view: this.view,
            type: "post",
          })
        });
        const finalRes   = await resAPI.json();

        const childId   = finalRes.data.id;
        console.log("childId",childId);
        console.log("finalRes",finalRes);

        if(finalRes.success) {
          this.addChildContent(childId);
        }

        console.log(finalRes);
      } catch (error) {
        console.log(error)
      }
    },
    async addChildContent(childId) {
      try {
        this.activeBlock = true;
        let accessToken  = storageManager.get('session','token')
        const resAPI = await fetch("https://asia-southeast2-elearning-6871c.cloudfunctions.net/contents/" + this.dataItem, {
          method: 'POST',
          headers: {'Content-Type': 'application/json','Authorization': 'Bearer ' + accessToken},
          body: JSON.stringify({
            postId: childId,
          })
        });
        const finalRes   = await resAPI.json();
        console.log("addChildContent",finalRes);
        if(finalRes.success) {
          window.location.href = "/setup/website/page/detail/" + this.dataItem
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
  <header class="py-2 border-gray-800">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 xl:flex xl:items-center xl:justify-between">
      <div class="min-w-0 flex-1">
          <h1 class="mt-2 text-xl font-bold leading-7 text-gray-700 sm:truncate sm:text-1xl sm:tracking-tight"><font-awesome-icon :icon="['fas',PageIcon]" class="text-gray-500 text-[24px]"/> {{ PageName }}</h1>
      </div>
      <div class="mt-5 flex xl:mt-0 xl:ml-4">
          <span class="hidden sm:block">
            <button @click="$router.push('/setup/website/')" type="button" class="ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-50">
            <font-awesome-icon :icon="['fas','chevron-left']" class="text-black text-[12px] mr-2"/>
            ย้อนกลับ
            </button>
          </span>
      </div>
    </div>
  </header>

  <div v-if="!loading_sources" class="text-center"><Loader/></div>
  <div v-if="loading_sources">

    <div class="flex-1 bg-gray-100 pt-2 pb-5 border-t">
      <div class="mt-8">
          <div class="mx-auto max-w-7xl px-6 sm:px-6 lg:px-6">
              <div class="space-y-6 sm:px-6 lg:col-span-9 lg:px-0">
  
                <form @submit.prevent="addData">
  
                  <section aria-labelledby="payment-details-heading" class="relative" :data-content="'กำลังติดต่อฐานข้อมูล กรุณารอสักครู่.....'" :class="[(activeBlock?'isblock' : 'isunblock')]">
  
                      <div class="divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow mb-8">
                        <div class="px-4 py-5 sm:px-6">
                          <h2 id="payment-details-heading" class="text-lg font-bold leading-6 text-gray-900">ข้อมูลหน้าเว็บ</h2>
                          <p class="mt-1 text-sm text-gray-500">กรอกข้อมูลหน้าเว็บของคุณให้ครบถ้วน</p>
                        </div>
                        <div class="px-4 py-5 sm:p-6">
                          
                          <div class="grid grid-cols-4 gap-6">
                            <div class="col-span-6 sm:col-span-6">
                              <label for="name" class="block text-md font-bold text-gray-700">ชื่อหน้า</label>
                              <input 
                              v-model="name" 
                              type="text" name="name" id="name" autocomplete="name" 
                              class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm">
                            </div>
                          </div>
  
                          <div class="mt-6 grid grid-cols-4 gap-6">
                            <div class="col-span-4 sm:col-span-6">
                              <label for="slug" class="block text-md font-bold text-gray-700">Page Slug</label>
                              <input 
                              v-model="slug"
                              type="text" name="slug" id="slug" autocomplete="slug" 
                              class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm">
                            </div>
                          </div>

                        </div>
                      </div>
  
                      <div class="divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow mb-8">
                        <div class="px-4 py-5 sm:px-6">
                          <h2 id="payment-details-heading" class="text-lg font-bold leading-6 text-gray-900">รายละเอียด</h2>
                          <p class="mt-1 text-sm text-gray-500">กรอกข้อมูลของหลักสูตรให้ครบถ้วน</p>
                        </div>
                        <div class="px-4 py-5 sm:p-6">
  
                          <div class="grid grid-cols-4 gap-6">
                            <div class="col-span-4 sm:col-span-6">
                              <MiniMCE v-model="description" :options="{}" />
                            </div>
                          </div>
  
                        </div>
                        <div class="bg-gray-50 px-4 py-4 sm:px-6 text-right">
  
                          <button
                          @click="$router.push('/setup/website')"
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
                      </div>
                  </section>
                </form>
              </div>
          </div>
      </div>
    </div>
  </div>
</template>