<script>
import feather from 'feather-icons';
import {useRoute} 	from 'vue-router'
import storageManager from '@/plugins/storage';
import { defineComponent } from 'vue';
import Vue3TagsInput from 'vue3-tags-input';

import Loader from '@/interface/template/Loader.vue';
import FileBrowser from '@/interface/modal/FileBrowser.vue';
import MiniMCE from 'minimce'
import 'tinymce/skins/ui/oxide/skin.min.css'
import 'tinymce/themes/silver/theme'
import 'tinymce/icons/default/icons' 

export default defineComponent({
	name: 'Blank',
  data() {
    const route     = useRoute();
    this.PageName   = route.meta.title;
    this.PageIcon   = route.meta.icon;
    this.ParentName = route.meta.parent;
    this.ParentPage = route.meta.page;
    return {
      routeName:this.routeName,
      dataItem: this.$route.params.id,
      activeBlock: false,
      FileBrowserOpen: false,
      loading_sources: true,
      schoolData: [],
      accessToken:storageManager.get('session','token'),
      login: storageManager.get('session','login'),
      //school: ls.get('school'),
      logo: '',
      name: '',
      code: '',
      website: '',
      phone: '',
      email: '',
      host: '',
      description: '',
      s3Hosting: '',
      s3Region: '',
      s3Bucket: '',
      s3Key: '',
      s3Secret: '',
      s3EndpointDefault: '',
      s3Endpoint: '',
      seo_keyword:[],
      seo_description: '',
      seo_ga_tracking: '',
    }
  },
	components: {Loader,MiniMCE,FileBrowser,Vue3TagsInput},
	methods: {
    OpenFileBrowser() {
      this.FileBrowserOpen = true;
    },
    changeFileTrigger(payload) {
      this.FileBrowserOpen = payload;
    },
    selectFileTrigger(payload) {
      if(payload!=undefined) {
        this.selectFileCallback = payload;
        // Set Return Function form select file popup
        console.log("selectFileTrigger",payload)
        if(payload.callback==="logo"){
          this.updateLogo(payload.file);
        }
      }
    },
    async updateLogo(file) {
      if(this.login) {
          try {
            const callApi       = await fetch("https://asia-southeast2-elearning-6871c.cloudfunctions.net/schools/" + this.school, {
              method: 'PUT',
              headers: {'Content-Type': 'application/json','Authorization': 'Bearer ' + this.accessToken},
              body: JSON.stringify({
                "logo":file,
              })
            });
            const finalRes   = await callApi.json();

            if(finalRes.success) {
              window.location.reload();
            }
          } catch (error) {
          console.log(error)
          }
      }
    },
    async getData() {
        if(this.login) {
            try {
              //console.log("Auth : Course List : ",ls.get('auth'));
              this.loading_sources  = false;
              const resAPI          = await fetch("https://asia-southeast2-elearning-6871c.cloudfunctions.net/schools/" + this.school, {
                method: 'GET',
                headers: {'Content-Type': 'application/json','Authorization': 'Bearer ' + this.accessToken},
              });
              const RestReturn   = await resAPI.json();
              console.log(RestReturn);

              if(RestReturn.success) {
                this.name                   = RestReturn.data.name
                this.logo                   = RestReturn.data.logo
                this.website                = RestReturn.data.website
                this.phone                  = RestReturn.data.phone
                this.email                  = RestReturn.data.email
                this.host                   = RestReturn.data.host
                this.description            = RestReturn.data.description
                this.code                   = RestReturn.data.code
                this.s3Hosting              = RestReturn.data.s3Hosting
                this.seo_keyword            = RestReturn.data.seo_keyword
                this.seo_description        = RestReturn.data.seo_description
                this.s3Region               = RestReturn.data.s3Region
                this.s3Bucket               = RestReturn.data.s3Bucket
                this.s3Key                  = RestReturn.data.s3Key
                this.s3Secret               = RestReturn.data.s3Secret
                this.s3EndpointDefault      = RestReturn.data.s3EndpointDefault
                this.s3Endpoint             = RestReturn.data.s3Endpoint
                this.seo_ga_tracking        = RestReturn.data.seo_ga_tracking
                this.loading_sources  = true;
              }
            } catch (error) {
            console.log(error)
            }
        }
    },
    async updataData() {
        if(this.login) {
          try {
              const callApi       = await fetch("https://asia-southeast2-elearning-6871c.cloudfunctions.net/schools/" + this.school, {
              method: 'PUT',
              headers: {'Content-Type': 'application/json','Authorization': 'Bearer ' + this.accessToken},
              body: JSON.stringify({
                name: this.name,
                website: this.website,
                phone: this.phone,
                email: this.email,
                description: this.description,
                code: this.code,
                host: this.host,
                seo_keyword: this.seo_keyword,
                seo_description: this.seo_description,
                seo_ga_tracking: this.seo_ga_tracking,
                s3Hosting: this.s3Hosting,
                s3Region: this.s3Region,
                s3Bucket: this.s3Bucket,
                s3Key: this.s3Key,
                s3Secret: this.s3Secret,
                s3EndpointDefault: this.s3EndpointDefault,
                s3Endpoint: "https://" + this.s3Bucket + "." + this.s3Hosting + "/",
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
                    window.location.href = "/setup"
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
    handleChangeTag(tags) {
      this.seo_keyword = tags;
    },
  },
  updated() {
    feather.replace();
  },
  async mounted () { 
    try {
      await this.getData();
    } catch (error) {
      console.log(Error);
    }
  },
  setup() {
  },
});
</script>

<template>

  <FileBrowser 
  v-if="FileBrowserOpen" 
  :isWindowsOpen="true" 
  :allowFileType="['jpg','png','jpeg']" 
  :callbackFunction="'logo'" 
  @file-browser-trigger="changeFileTrigger" 
  @select-file-trigger="selectFileTrigger" />

  <div v-if="!loading_sources" class="text-center"><Loader/></div>
  <div v-if="loading_sources">
  
    <header class="py-2 border-gray-800">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 xl:flex xl:items-center xl:justify-between">
        <div class="min-w-0 flex-1">
            <h1 class="mt-2 text-xl font-bold leading-7 text-gray-700 sm:truncate sm:text-1xl sm:tracking-tight"><font-awesome-icon :icon="['fas',PageIcon]" class="text-gray-500 text-[24px]"/> {{ PageName }}</h1>
        </div>
        <div class="mt-5 flex xl:mt-0 xl:ml-4">
            <span class="hidden sm:block">
              <button  @click="$router.push('/setup')" type="button" class="ml-3 inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-100"><font-awesome-icon :icon="['fas','chevron-left']" class="text-black mr-2"/> ย้อนกลับ</button>
            </span>
        </div>
      </div>
    </header>
  
    <div class="flex-1 bg-gray-100 pt-2 pb-5 border-t">
      <div class="mt-8">
          <div class="mx-auto max-w-7xl px-6 sm:px-6 lg:px-6">
              <div class="space-y-6 sm:px-6 lg:col-span-9 lg:px-0">
  
                <form @submit.prevent="updataData">
  
                  <section aria-labelledby="payment-details-heading" class="relative" :data-content="'กำลังติดต่อฐานข้อมูล กรุณารอสักครู่.....'" :class="[(activeBlock?'isblock' : 'isunblock')]">
  
                      <div class="divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow mb-8">
                        <div class="px-4 py-5 sm:px-6">
                          <h2 id="payment-details-heading" class="text-lg font-bold leading-6 text-gray-900"><font-awesome-icon :icon="['fas','font']" class="text-gray-500 pr-2"/> ข้อมูลสถาบัน</h2>
                          <p class="mt-1 text-sm text-gray-500">กรอกข้อมูลของสถาบันให้ครบถ้วน</p>
                        </div>

                        <div class="py-6 px-4 sm:p-6 lg:pb-8">
          
                          <div class="flex flex-col lg:flex-row">
                            <div class="flex-grow space-y-6">
                              <div>
                                <label for="name" class="block text-md font-bold text-gray-700">ชื่อสถาบัน</label>
                                <input 
                                v-model="name" 
                                type="text" name="name" id="name" autocomplete="name" 
                                class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm">
                              </div>
          
                              <div>
                                <label for="code" class="block text-md font-bold text-gray-700">รหัสสถาบัน (Code)</label>
                                <input 
                                v-model="code"
                                type="text" name="code" id="code" autocomplete="code" 
                                class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm">
                              </div>

                              <div>
                                <label for="host" class="block text-md font-bold text-gray-700">Hostname</label>
                                <input 
                                v-model="host"
                                type="text" name="host" id="host" autocomplete="host" 
                                class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm">
                              </div>
                            </div>
          
                            <div class="mt-6 flex-grow lg:mt-0 lg:ml-6 lg:flex-shrink-0 lg:flex-grow-0">
                              <p class="text-sm text-center font-medium text-gray-700" aria-hidden="true">โลโก้สถาบัน</p>

                              <div class="relative hidden overflow-hidden rounded-full lg:block">
                                <img class="relative h-40 w-40 rounded-full" :src="logo || 'https://dummyimage.com/500x500/ededed/303030.png&text=++++++LOGO+++++'" alt="">
                                <label for="desktop-user-photo" class="absolute inset-0 flex h-full w-full items-center justify-center bg-black bg-opacity-75 text-sm font-medium text-white opacity-0 focus-within:opacity-100 hover:opacity-100 cursor-pointer" @click="OpenFileBrowser">
                                  <span>เปลี่ยน</span>
                                  <span class="sr-only"> user photo</span>
                                </label>
                              </div>

                            </div>
                          </div>
          
                        </div>

                      </div>

                      <div class="divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow mb-8">
                        <div class="px-4 py-5 sm:px-6">
                          <h2 id="payment-details-heading" class="text-lg font-bold leading-6 text-gray-900"><font-awesome-icon :icon="['fas','envelope']" class="text-gray-500 pr-2"/>การติดต่อ (Contact)</h2>
                          <p class="mt-1 text-sm text-gray-500">กรอกข้อมูลของสถาบันให้ครบถ้วน</p>
                        </div>
                        <div class="px-4 py-5 sm:p-6">
                          
                          <div class="grid grid-cols-6 gap-6">

                            <div class="col-span-4 sm:col-span-3">
                              <label for="website" class="block text-sm font-bold text-gray-700">เว็บไซต์</label>
                              <input 
                              v-model="website" 
                              type="text" name="website" id="website" autocomplete="website" 
                              class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm">
                            </div>	
  
                            <div class="col-span-4 sm:col-span-3">
                              <label for="phone" class="block text-sm font-bold text-gray-700">เบอร์โทร</label>
                              <input 
                              v-model="phone" 
                              type="text" name="phone" id="phone" autocomplete="phone" 
                              class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm">
                            </div>
  
                            <div class="col-span-4 sm:col-span-3">
                              <label for="email" class="block text-sm font-bold text-gray-700">อีเมล์</label>
                              <input 
                              v-model="email"
                              type="text" name="email" id="email" autocomplete="email" 
                              class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm">
                            </div>
                          </div>

                        </div>
                      </div>

  
                      <div class="divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow mb-8">
                        <div class="px-4 py-5 sm:px-6">
                          <h2 id="payment-details-heading" class="text-lg font-bold leading-6 text-gray-900"><font-awesome-icon :icon="['fas','database']" class="text-gray-500 pr-2"/>ข้อมูล S3 (API)</h2>
                          <p class="mt-1 text-sm text-gray-500">กรอกข้อมูลของสถาบันให้ครบถ้วน</p>
                        </div>
                        <div class="px-4 py-5 sm:p-6">
                          
                          <div class="grid grid-cols-6 gap-6">

                            <div class="col-span-4 sm:col-span-2">
                              <label for="s3Hosting" class="block text-sm font-bold text-gray-700">Hosting</label>
                              <input 
                              v-model="s3Hosting" 
                              type="text" name="s3Hosting" id="s3Hosting" autocomplete="s3Hosting" 
                              class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm">
                            </div>	
  
                            <div class="col-span-4 sm:col-span-2">
                              <label for="s3Region" class="block text-sm font-bold text-gray-700">Region</label>
                              <input 
                              v-model="s3Region" 
                              type="text" name="s3Region" id="s3Region" autocomplete="s3Region" 
                              class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm">
                            </div>
  
                            <div class="col-span-4 sm:col-span-2">
                              <label for="s3Bucket" class="block text-sm font-bold text-gray-700">Bucket</label>
                              <input 
                              v-model="s3Bucket" 
                              type="text" name="s3Bucket" id="s3Bucket" autocomplete="s3Bucket" 
                              class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm">
                            </div>	
  
                            <div class="col-span-4 sm:col-span-2">
                              <label for="s3Key" class="block text-sm font-bold text-gray-700">Key</label>
                              <input 
                              v-model="s3Key" 
                              type="text" name="s3Key" id="s3Key" autocomplete="s3Key" 
                              class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm">
                            </div>
  
                            <div class="col-span-4 sm:col-span-2">
                              <label for="s3Secret" class="block text-sm font-bold text-gray-700">Secret</label>
                              <input 
                              v-model="s3Secret"
                              type="text" name="s3Secret" id="s3Secret" autocomplete="s3Secret" 
                              class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm">
                            </div>
  
                            <div class="col-span-4 sm:col-span-2">
                              <label for="s3EndpointDefault" class="block text-sm font-bold text-gray-700">Endpoint Default</label>
                              <input 
                              v-model="s3EndpointDefault"
                              type="text" name="s3EndpointDefault" id="s3EndpointDefault" autocomplete="s3EndpointDefault" 
                              class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm">
                            </div>
  
                          </div>

                        </div>
                      </div>

                      <div class="divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow mb-8">
                        <div class="px-4 py-5 sm:px-6">
                          <h2 id="payment-details-heading" class="text-lg font-bold leading-6 text-gray-900"><font-awesome-icon :icon="['fas','globe']" class="text-gray-500 pr-2"/>SEO</h2>
                          <p class="mt-1 text-sm text-gray-500">กรอกข้อมูลของสถาบันให้ครบถ้วน</p>
                        </div>
                        <div class="px-4 py-5 sm:p-6">
                          
                          <div class="grid grid-cols-4 gap-6">

                            <div class="col-span-4 sm:col-span-4">
                              <label for="s3Secret" class="block text-sm font-bold text-gray-700">Google Analytics Tracking</label>
                              <input 
                              v-model="seo_ga_tracking"
                              type="text" name="seo_ga_tracking" id="seo_ga_tracking" autocomplete="s3Secret" 
                              class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm">
                            </div>

                            <div class="col-span-4 sm:col-span-4">
                              <label for="code" class="mb-1 block text-md font-bold text-gray-700">Keyword</label>
                              <vue3-tags-input :tags="seo_keyword" placeholder="พิมพ์ Keyword" @on-tags-changed="handleChangeTag" class="rounded-md border border-gray-300 py-1 px-2 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm"/>
                            </div>
  
                          </div>

                          <div class="mt-6 grid grid-cols-4 gap-6">
                            <div class="col-span-4 sm:col-span-6">
                              <label for="code" class="mb-1 block text-md font-bold text-gray-700">Description</label>
                              <MiniMCE v-model="seo_description" :options="{}" />
                            </div>
                          </div>

                        </div>
                      </div>

  
                      <div class="divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow mb-8">
                        <div class="px-4 py-5 sm:px-6">
                          <h2 id="payment-details-heading" class="text-lg font-bold leading-6 text-gray-900"><font-awesome-icon :icon="['fas','font']" class="text-gray-500 pr-2"/>คำอธิบาย</h2>
                          <p class="mt-1 text-sm text-gray-500">กรอกข้อมูลของสถาบันให้ครบถ้วน</p>
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