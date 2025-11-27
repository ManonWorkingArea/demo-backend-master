<script>
import {mode,display,kind}  from "@/master/type";
import {useRoute} 	        from 'vue-router'
import Loader               from '@/interface/template/Loader.vue';
import storageManager       from '@/plugins/storage';
import MiniMCE              from 'minimce'

import 'tinymce/skins/ui/oxide/skin.min.css'
import 'tinymce/themes/silver/theme'
import 'tinymce/icons/default/icons' 

export default {
  name: 'AddLesson',
  data() {
    const route 	= useRoute();
    const session = storageManager.get('session')
    return {
      PageName: route.meta.title,
      PageIcon: route.meta.icon,
      PagePath: route.meta.path,
      ParentName: route.meta.parent,
      ParentPage: route.meta.page,

      checked: [],
      checkedType: '',
      checkedMode: '',
      
      name: '',
      slug: '',
      lecturer: '',
      erp_code: '',
      hours: '',
      days: '',
      regular_price: '',
      sale_price: '',
      description: '',

      principles: '',
      objective: '',
      target: '',
      structure: '',

      categoryData: [],
      typeData: [],
      modeData: [],
      displayData: [],

      activeBlock: false,
      schoolData: [],
      loading_sources: true,
      dataItem: this.$route.params.id,
      accessToken:session.token,
      login: session.login,
      master: session.master,
    }
  },
  components: {
    Loader,
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
              //console.log("Auth : Course List : ",ls.get('auth'));
              const session         = storageManager.get('session')
              let accessToken       = session.token
              let item              = this.$route.params.id;
              this.loading_sources  = false;
              const resAPI          = await fetch("https://asia-southeast2-elearning-6871c.cloudfunctions.net/mcourses/" + item, {
                method: 'GET',
                headers: {'Content-Type': 'application/json','Authorization': 'Bearer ' + accessToken},
              });
              const RestReturn   = await resAPI.json();
              console.log(RestReturn);
              this.schoolData      = RestReturn.data;
              this.school          = session.current.id;

              const categoryList   = session.category
              if(typeof categoryList !== 'undefined' && categoryList.length > 0) {
                this.categoryData     = categoryList
                this.typeData         = kind
                this.modeData         = mode
                this.displayData      = display
                this.loading_sources  = true;
              } else {
                const Category   = await this.getCategoryData();
                console.log(Category);
                if(Category.success) {

                  let session = 
                  {
                    category: Category.data,
                  };
                  storageManager.update('session',session)

                  this.categoryData     = Category.data
                  this.typeData         = kind
                  this.modeData         = mode
                  this.displayData      = display
                  this.loading_sources  = true;
                }
              }
              /*
              const Type      = await this.getTypeData();
              console.log(Type);

              const Mode      = await this.getModesData();
              console.log(Mode);
              */

              
            } catch (error) {
            console.log(error)
            }
        }
    },
    async getCategoryData() {
      if(this.login) {
        try {
          let accessToken  = storageManager.get('session','token')
          this.loading_sources = false;
          const resAPI = await fetch("https://asia-southeast2-elearning-6871c.cloudfunctions.net/catagories/",
          {
            method: 'GET',
            headers: {'Content-Type': 'application/json','Authorization': 'Bearer ' + accessToken},
          });
          const RestReturn   = await resAPI.json();
          console.log("Category",RestReturn);
          return RestReturn
        } catch (error) {
          console.log(error)
        }
      }
    },
    async getTypeData() {
      if(this.login) {
        try {
          let accessToken  = storageManager.get('session','token')
          this.loading_sources = false;
          const resAPI = await fetch("https://asia-southeast2-elearning-6871c.cloudfunctions.net/types/",
          {
            method: 'GET',
            headers: {'Content-Type': 'application/json','Authorization': 'Bearer ' + accessToken},
          });
          const RestReturn   = await resAPI.json();
          console.log("Types",RestReturn);
          return RestReturn
        } catch (error) {
          console.log(error)
        }
      }
    },
    async getModesData() {
      if(this.login) {
        try {
          let accessToken  = storageManager.get('session','token')
          this.loading_sources = false;
          const resAPI = await fetch("https://asia-southeast2-elearning-6871c.cloudfunctions.net/modes/",
          {
            method: 'GET',
            headers: {'Content-Type': 'application/json','Authorization': 'Bearer ' + accessToken},
          });
          const RestReturn   = await resAPI.json();
          console.log("Modes",RestReturn);
          return RestReturn
        } catch (error) {
          console.log(error)
        }
      }
    },
    async addData() {
        if(this.login) {
            try {
              this.activeBlock = true
              const accessToken   = storageManager.get('session','token')
              const callApi   = await fetch("https://asia-southeast2-elearning-6871c.cloudfunctions.net/mcourses/", {
                method: 'POST',
                headers: {'Content-Type': 'application/json','Authorization': 'Bearer ' + accessToken},
                body: JSON.stringify({
                "schoolId":this.school,
                "name":this.name,
                "slug":this.slugify(this.slug),
                "lecturer":this.lecturer,
                "erp_code":this.erp_code,
                "hours":this.hours,
                "days":this.days,
                "category":this.checked,
                "type":this.checkedType,
                "mode":this.checkedMode,
                "display":this.checkedDisplay,
                "regular_price":this.regular_price,
                "sale_price":this.sale_price,
                "principles":this.principles,
                "objective":this.objective,
                "target":this.target,
                "structure":this.structure,
                "status":true,
                })
              });
              const finalRes   = await callApi.json();

              if(finalRes.success) {
                this.activeBlock = false
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
                    window.location.href = "/lesson"
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
    await this.getData();
    } catch (error) {
    console.log(Error);
    }
  },
}
</script>

<template>

  <div v-if="!loading_sources" class="text-center"><Loader/></div>
  <div v-if="loading_sources">

    <header class="py-2 border-gray-800">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 xl:flex xl:items-center xl:justify-between">
        <div class="min-w-0 flex-1">
            <h1 class="mt-2 text-xl font-bold leading-7 text-gray-700 sm:truncate sm:text-1xl sm:tracking-tight"><font-awesome-icon :icon="['fas',PageIcon]" class="text-gray-500 text-[24px]"/> {{ PageName }}</h1>
        </div>
        <div class="mt-5 flex xl:mt-0 xl:ml-4">
            <span class="hidden sm:block">
              <button  @click="$router.push('/lesson/index')" type="button" class="ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-50">
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
                        <h2 id="payment-details-heading" class="text-lg font-bold leading-6 text-gray-900">ข้อมูลหลักสูตร</h2>
                        <p class="mt-1 text-sm text-gray-500">กรอกข้อมูลของหลักสูตรให้ครบถ้วน</p>
                      </div>
                      <div class="px-4 py-5 sm:p-6">

                        <input 
                        v-model="ref" 
                        type="hidden" name="ref" id="ref" autocomplete="ref" 
                        class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm">
                        
                        <div class="grid grid-cols-4 gap-6">
                          <div class="col-span-6 sm:col-span-6">
                            <label for="name" class="block text-md font-bold text-gray-700">ชื่อรายวิชา</label>
                            <input 
                            v-model="name" 
                            type="text" name="name" id="name" autocomplete="name" 
                            class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm">
                          </div>
                        </div>

                        <div class="mt-6 grid grid-cols-4 gap-6">
                          <div class="col-span-4 sm:col-span-2">
                            <label for="slug" class="block text-md font-bold text-gray-700">รหัสรายวิชา</label>
                            <input 
                            v-model="slug"
                            type="text" name="slug" id="slug" autocomplete="slug" 
                            class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm">
                          </div>

                          <div class="col-span-4 sm:col-span-2">
                            <label for="erp_code" class="block text-md font-bold text-gray-700">รหัส Product Code (FTI ERP)</label>
                            <input 
                            v-model="erp_code"
                            type="text" name="erp_code" id="erp_code" autocomplete="erp_code" 
                            class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm">
                          </div>
                        </div>

                        <div class="mt-6 grid grid-cols-4 gap-6">
                          <div class="col-span-4 sm:col-span-2">
                            <label for="lecturer" class="block text-md font-bold text-gray-700">วิทยากร</label>
                            <input 
                            v-model="lecturer"
                            type="text" name="lecturer" id="lecturer" autocomplete="lecturer" 
                            class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm">
                          </div>
                        </div>

                      </div>
                    </div>
  
                      <div class="divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow mb-8">
                        <div class="px-4 py-5 sm:px-6">
                          <h2 id="payment-details-heading" class="text-lg font-bold leading-6 text-gray-900">ประเภทหลักสูตร (Type)</h2>
                          <p class="mt-1 text-sm text-gray-500">กรอกข้อมูลของหลักสูตรให้ครบถ้วน</p>
                        </div>
                        <div class="px-4 py-5 sm:p-6">
  
                          <div class="grid grid-cols-4 gap-6">
                            <div class="col-span-4 sm:col-span-4">
                                <div class="grid grid-cols-1 lg:grid-cols-2 gap-1 justify-evenly"> 
                                  <div v-for="(typeItem) in typeData" :key="typeItem.code" class="w-26 h-12">
                                    <div class="flex items-start">
                                      <div class="flex h-5 items-center">
                                        <input v-model="checkedType" :id="typeItem.code" :value="typeItem.code" type="radio" class="h-4 w-4 cursor-pointer rounded-full border-gray-300 text-indigo-600 focus:ring-indigo-500">
                                      </div>
                                      <div class="ml-3 text-sm w-[90%]">
                                        <label :for="typeItem.code" class="font-bold text-gray-900">{{typeItem.name}}</label>
                                        <p class="invisible lg:visible text-[16px] text-gray-500 truncate">{{typeItem.description}}</p>
                                      </div>
                                    </div>
                                  </div> 
                                </div> 
                            </div>
                          </div>
  
                        </div>
                      </div>
  
                      <div class="divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow mb-8">
                        <div class="px-4 py-5 sm:px-6">
                          <h2 id="payment-details-heading" class="text-lg font-bold leading-6 text-gray-900">หมวดหมู่ (Category)</h2>
                          <p class="mt-1 text-sm text-gray-500">กรอกข้อมูลของหลักสูตรให้ครบถ้วน</p>
                        </div>
                        <div class="px-4 py-5 sm:p-6">
  
                          <div class="grid grid-cols-4 gap-6">
                            <div class="col-span-4 sm:col-span-4">
                                <div class="grid grid-cols-1 lg:grid-cols-2 gap-1 justify-evenly"> 
                                  <div v-for="(categoryItem) in categoryData" :key="categoryItem.slug" class="w-26 h-12">
                                    <div class="flex items-start">
                                      <div class="flex h-5 items-center">
                                        <input v-model="checked" :id="categoryItem.slug" :value="categoryItem.slug" type="checkbox" class="h-4 w-4 cursor-pointer rounded border-gray-300 text-indigo-600 focus:ring-indigo-500">
                                      </div>
                                      <div class="ml-3 text-sm w-[90%]">
                                        <label :for="categoryItem.slug" class="font-bold text-gray-900">{{categoryItem.name}}</label>
                                        <p class="invisible lg:visible text-[16px] text-gray-500 truncate">{{categoryItem.description}}</p>
                                      </div>
                                    </div>
                                  </div> 
                                </div> 
                            </div>
                          </div>
  
                        </div>
                      </div>
  
                      <div class="divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow mb-8">
                        <div class="px-4 py-5 sm:px-6">
                          <h2 id="payment-details-heading" class="text-lg font-bold leading-6 text-gray-900">วิธีการเรียน (Mode)</h2>
                          <p class="mt-1 text-sm text-gray-500">กรอกข้อมูลของหลักสูตรให้ครบถ้วน</p>
                        </div>
                        <div class="px-4 py-5 sm:p-6">
  
                          <div class="grid grid-cols-4 gap-6">
                            <div class="col-span-4 sm:col-span-4">
                                <div class="grid grid-cols-1 lg:grid-cols-2 gap-1 justify-evenly"> 
                                  <div v-for="(modeItem) in modeData" :key="modeItem.code" class="w-26 h-12">
                                    <div class="flex items-start">
                                      <div class="flex h-5 items-center">
                                        <input v-model="checkedMode" :id="modeItem.code" :value="modeItem.code" type="radio" class="h-4 w-4 cursor-pointer rounded-full border-gray-300 text-indigo-600 focus:ring-indigo-500">
                                      </div>
                                      <div class="ml-3 text-sm w-[90%]">
                                        <label :for="modeItem.code" class="font-bold text-gray-900">{{modeItem.name}}</label>
                                        <p class="invisible lg:visible text-[16px] text-gray-500 truncate">{{modeItem.description}}</p>
                                      </div>
                                    </div>
                                  </div> 
                                </div> 
                            </div>
                          </div>
  
                        </div>
                      </div>

                      <div class="divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow mb-8">
                        <div class="px-4 py-5 sm:px-6">
                          <h2 id="payment-details-heading" class="text-lg font-bold leading-6 text-gray-900">เงื่อนไข (Display)</h2>
                          <p class="mt-1 text-sm text-gray-500">กรอกข้อมูลของหลักสูตรให้ครบถ้วน</p>
                        </div>
                        <div class="px-4 py-5 sm:p-6">
  
                          <div class="grid grid-cols-4 gap-6">
                            <div class="col-span-4 sm:col-span-4">
                                <div class="grid grid-cols-1 lg:grid-cols-2 gap-1 justify-evenly"> 
                                  <div v-for="(displayItem) in displayData" :key="displayItem.code" class="w-26 h-12">
                                    <div class="flex items-start">
                                      <div class="flex h-5 items-center">
                                        <input v-model="checkedDisplay" :id="displayItem.code" :value="displayItem.code" type="radio" class="h-4 w-4 cursor-pointer rounded-full border-gray-300 text-indigo-600 focus:ring-indigo-500">
                                      </div>
                                      <div class="ml-3 text-sm w-[90%]">
                                        <label :for="displayItem.code" class="font-bold text-gray-900">{{displayItem.name}}</label>
                                        <p class="invisible lg:visible text-[16px] text-gray-500 truncate">{{displayItem.description}}</p>
                                      </div>
                                    </div>
                                  </div> 
                                </div> 
                            </div>
                          </div>
  
                        </div>
                      </div>
  
                      <div class="divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow mb-8">
                        <div class="px-4 py-5 sm:px-6">
                          <h2 id="payment-details-heading" class="text-lg font-bold leading-6 text-gray-900">การแสดงผล</h2>
                          <p class="mt-1 text-sm text-gray-500">กรอกข้อมูลของหลักสูตรให้ครบถ้วน</p>
                        </div>
                        <div class="px-4 py-5 sm:p-6">
  
                          <div class="grid grid-cols-4 gap-6">
                            <div class="col-span-4 sm:col-span-1">
                              <label for="hours" class="block text-md font-bold text-gray-700">จำนวนชั่วโมง</label>
                              <input 
                              v-model="hours" 
                              type="text" name="hours" id="hours" autocomplete="hours" 
                              class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm">
                            </div>
    
                            <div class="col-span-4 sm:col-span-1">
                              <label for="days" class="block text-md font-bold text-gray-700">จำนวนวัน</label>
                              <input 
                              v-model="days"
                              type="text" name="days" id="days" autocomplete="days" 
                              class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm">
                            </div>
    
                            <div class="col-span-4 sm:col-span-1">
                              <label for="regular_price" class="block text-md font-bold text-gray-700">ราคาคอร์ส</label>
                              <input 
                              v-model="regular_price"
                              type="text" name="regular_price" id="regular_price" autocomplete="regular_price" 
                              class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm">
                            </div>
    
                            <div class="col-span-4 sm:col-span-1">
                              <label for="sale_price" class="block text-md font-bold text-gray-700">ราคาขาย</label>
                              <input 
                              v-model="sale_price"
                              type="text" name="sale_price" id="sale_price" autocomplete="sale_price" 
                              class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm">
                            </div>
    
                          </div>
  
                        </div>
                      </div>
  
                      <div class="divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow mb-8">
                        <div class="px-4 py-5 sm:px-6">
                          <h2 id="payment-details-heading" class="text-lg font-bold leading-6 text-gray-900">คำอธิบาย</h2>
                          <p class="mt-1 text-sm text-gray-500">กรอกข้อมูลของหลักสูตรให้ครบถ้วน</p>
                        </div>
                        <div class="px-4 py-5 sm:p-6">
  
                          <div class="grid grid-cols-4 gap-6">
                            <div class="col-span-4 sm:col-span-6">
                              <label for="principles" class="block text-md font-bold text-gray-700">หลักการและเหตุผล</label>
                              <MiniMCE v-model="principles" :options="{}" />
                            </div>

                            <div class="col-span-4 sm:col-span-6">
                              <label for="objective" class="block text-md font-bold text-gray-700">วัตถุประสงค์</label>
                              <MiniMCE v-model="objective" :options="{}" />
                            </div>

                            <div class="col-span-4 sm:col-span-6">
                              <label for="target" class="block text-md font-bold text-gray-700">กลุ่มเป้าหมาย</label>
                              <MiniMCE v-model="target" :options="{}" />
                            </div>

                            <div class="col-span-4 sm:col-span-6">
                              <label for="structure" class="block text-md font-bold text-gray-700">โครงสร้างหลักสูตร</label>
                              <MiniMCE v-model="structure" :options="{}" />
                            </div>

                          </div>
  
                        </div>
                        <div class="bg-gray-50 px-4 py-4 sm:px-6 text-right">
  
                          <button
                          @click="$router.push('/lesson')"
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