<script>
import {player}     from "@/master/type";
import {useRoute} 	from 'vue-router'
import MiniMCE      from 'minimce'

import 'tinymce/skins/ui/oxide/skin.min.css'
import 'tinymce/themes/silver/theme'
import 'tinymce/icons/default/icons'
import storageManager from '@/plugins/storage';

export default {
  name: 'ContactUs',
  inject: ['apiServer'],
  data() {
    const route 	= useRoute();
    const session = storageManager.get('session')
    return {
      login:storageManager.get('session','login'),
      configs: storageManager.get('configs'),
      PageName: route.meta.title,
      PageIcon: route.meta.icon,
      PagePath: route.meta.path,
      ParentName: route.meta.parent,
      ParentPage: route.meta.page,
      accessSession: [],
      playerType:[],
      course: this.$route.params.id,
      name: '',
      slug: '',
      lecturer: '',
      order: (this.$route.params.count++),
      description: '',
      duration: '',
      type: 'demand',
      activeBlock: false,
      schoolData: [],
      loading_sources: true,
      dataItem: this.$route.params.id,
      MasterText:session.MasterText,
      master: session.master,
      session: session,
    }
  },
  components: {
    MiniMCE
  },
  methods: {
    slugify(str) {
        str = str.replace(/^\s+|\s+$/g, ''); // trim
        str = str.toLowerCase();
        // remove accents, swap ñ for n, etc
        var from = "àáãäâèéëêìíïîòóöôùúüûñç·/_,:;";
        var to   = "aaaaaeeeeiiiioooouuuunc------";
        for (var i=0, l=from.length ; i<l ; i++) {
            str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
        }
        str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
            .replace(/\s+/g, '-') // collapse whitespace and replace by -
            .replace(/-+/g, '-'); // collapse dashes
        return str;
    },
    async getData() {
        if(this.login) {
            try {
            let item              = this.$route.params.id;
            this.loading_sources  = false;
            const resAPI          = await fetch("https://gateway.cloudrestfulapi.com/api/"+this.endpoint+"/" + item, {
              method: 'GET',
              headers: {'Content-Type': 'application/json','client-token-key':this.configs.key},
            });

            const RestReturn   = await resAPI.json();
            console.log(RestReturn);

            this.schoolData      = RestReturn;
            this.loading_sources = true;
            this.school          = this.session.current._id;

            } catch (error) {
            console.log(error)
            }
        }
    },
    async addData() {
        if(this.login) {
            try {
              const callApi   = await fetch("https://gateway.cloudrestfulapi.com/api/player", {
                method: 'POST',
                headers: {'Content-Type': 'application/json','client-token-key':this.configs.key},
                body: JSON.stringify({
                  data: {
                    "courseId":this.course,
                    "name":this.name,
                    "slug":this.slugify(this.slug),
                    "description":this.description,
                    "duration":this.duration,
                    "type":this.type,
                    "lecturer":this.lecturer,
                    "order":('0' + this.order).slice(-2),
                  },
                  options: {}
                })
              });
              await callApi.json();
              if(callApi.status===200) {
                this.$swal({ 
                  title: "บันทึกข้อมูลเรียบร้อยแล้ว ?",
                  text: "คุณต้องการที่จะดำเนินการอย่างไร !",
                  type: "success",
                  showCancelButton: true,
                  confirmButtonColor: "#0054b4",
                  confirmButtonText: "กลับไปหน้าหลัก",
                  cancelButtonText: "เพิ่มข้อมูลใหม่",
                  closeOnConfirm: false,
                  closeOnCancel: false 
                }).then((confirmed) => {
                  if (confirmed.isConfirmed) {
                    console.log("Home");
                    this.$router.push('/lesson/detail/' + this.dataItem)
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
  setup() {
  },
  async mounted () { 
    try {
      if(this.master) {
        this.endpoint = "mcourse";
      } else {
        this.endpoint = "course";
      }
      await this.getData();
      this.accessSession  = this.session.current._id;
      this.playerType     = player
      } catch (error) {
      console.log(Error);
    }
  },
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
          <button @click="$router.push('/lesson/detail/' + this.dataItem)" type="button" class="ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-50">
          <font-awesome-icon :icon="['fas','chevron-left']" class="text-black text-[12px] mr-2"/>
          ย้อนกลับ
          </button>
        </span>
    </div>
  </div>
</header>

<div class="flex-1 bg-gray-100 pt-2 pb-5 border-t">
  <div class="mt-8">
      <div class="mx-auto max-w-7xl px-6 sm:px-6 lg:px-6">
          <div class="space-y-6 sm:px-6 lg:col-span-9 lg:px-0">

            <form @submit.prevent="addData">

              <section aria-labelledby="payment-details-heading" class="relative" :data-content="'กำลังติดต่อฐานข้อมูล กรุณารอสักครู่.....'" :class="[(activeBlock?'isblock' : 'isunblock')]">

                  <div class="divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow mb-8">
                    <div class="px-4 py-5 sm:px-6">
                      <h2 id="payment-details-heading" class="text-lg font-bold leading-6 text-gray-900">ข้อมูลบทเรียน</h2>
                      <p class="mt-1 text-sm text-gray-500">กรอกข้อมูลของบทเรียนให้ครบถ้วน</p>
                    </div>
                    <div class="px-4 py-5 sm:p-6">

                      <div class="grid grid-cols-4 gap-6">

                        <div class="col-span-4 sm:col-span-4">
                          <label for="name" class="block text-base font-medium text-gray-900">ชื่อบทเรียน</label>
                          <input 
                          v-model="name" 
                          type="text" name="name" id="name" autocomplete="name" 
                          class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm">
                        </div>

                      </div>

                      <div class="mt-6 grid grid-cols-5 gap-6">

                        <div class="col-span-4 sm:col-span-2">
                          <label for="slug" class="block text-base font-medium text-gray-900">รหัสบทเรียน</label>
                          <input 
                          v-model="slug"
                          type="text" name="slug" id="slug" autocomplete="slug" 
                          class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm">
                        </div>

                        <div class="col-span-4 sm:col-span-2">
                          <label for="lecturer" class="block text-base font-medium text-gray-900">วิทยากร</label>
                          <input 
                          v-model="lecturer"
                          type="text" name="lecturer" id="lecturer" autocomplete="lecturer" 
                          class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm">
                        </div>

                        <div class="col-span-4 sm:col-span-1">
                          <label for="duration" class="block text-base font-medium text-gray-900">ความยาว (นาที)</label>
                          <input 
                          v-model="duration" 
                          type="text" name="duration" id="duration" autocomplete="duration" 
                          class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm">
                        </div>

                      </div>


                    </div>
                  </div>

                  <div class="divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow mb-8">
                    <div class="px-4 py-5 sm:px-6">
                      <h2 id="payment-details-heading" class="text-lg font-bold leading-6 text-gray-900">ประเภทบทเรียน (Type)</h2>
                      <p class="mt-1 text-sm text-gray-500">กรอกข้อมูลของบทเรียนให้ครบถ้วน</p>
                    </div>
                    <div class="px-4 py-5 sm:p-6">

                      <div class="grid grid-cols-4 gap-6">

                        <div class="col-span-4 sm:col-span-4">

                          <fieldset class="">
                            <div class="space-y-4 sm:flex sm:items-center sm:space-y-0 sm:space-x-10">
                              <div v-for="(typeItem) in playerType" :key="typeItem.id" class="flex items-center">
                                <input v-model="type" :id="typeItem.code" :value="typeItem.code" type="radio" class="mt-[-20px] h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500">
                                <label :for="typeItem.code" class="ml-3 block text-sm font-bold text-gray-700">{{typeItem.slug}} <p class="text-gray-500 font-medium">{{typeItem.name}}</p></label>
                              </div>
                            </div>
                          </fieldset>

                        </div>

                      </div>

                    </div>
                  </div>

                  <div class="divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow mb-8">
                    <div class="px-4 py-5 sm:px-6">
                      <h2 id="payment-details-heading" class="text-lg font-bold leading-6 text-gray-900">คำอธิบาย</h2>
                      <p class="mt-1 text-sm text-gray-500">กรอกข้อมูลของบทเรียนให้ครบถ้วน</p>
                    </div>
                    <div class="px-4 py-5 sm:p-6">

                      <div class="grid grid-cols-4 gap-6">

                        <div class="col-span-4 sm:col-span-6">
                          <label for="slug" class="block text-base font-medium text-gray-900">คำอธิบาย</label>
                          <MiniMCE v-model="description" :options="{}" />
                        </div>

                      </div>

                    </div>
                    <div class="bg-gray-50 px-4 py-4 sm:px-6 text-right">

                      <button
                      @click="$router.push('/lesson/detail/' + this.dataItem)"
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

</template>