<script>


import {useRoute} 	from 'vue-router'
import storageManager from '@/plugins/storage';

import MiniMCE from 'minimce'
import 'tinymce/skins/ui/oxide/skin.min.css'
import 'tinymce/themes/silver/theme'
import 'tinymce/icons/default/icons'

export default {
  name: 'ContactUs',
  inject: ['apiServer'],
  data() {
    const route = useRoute();
    return {
      configs: storageManager.get('configs'),
		PageName: route.meta.title,
		PageIcon: route.meta.icon,
		PagePath: route.meta.path,
		ParentName: route.meta.parent,
		ParentPage: route.meta.page,
		accessSession: [],
		exam: this.$route.params.id,
		detail: '',
    type: '',
		activeBlock: false,
		schoolData: [],
		loading_sources: true,
		dataItem: this.$route.params.id,
    examID: this.$route.params.exam,
    questionID: this.$route.params.question,
    accessToken:storageManager.get('session','token')
    }
  },
  components: {
    MiniMCE
  },
  methods: {
    async getData() {
        if(storageManager.get('session','login')) {
            try {
            //console.log("Auth : Course List : ",ls.get('auth'));
            this.loading_sources  = false;
            const resAPI          = await fetch("https://asia-southeast2-elearning-6871c.cloudfunctions.net/exams/getFullQuestion/" + this.examID + "/" + this.questionID + "/false", {
              method: 'GET',
              headers: {'Content-Type': 'application/json','Authorization': 'Bearer ' + this.accessToken},
            });

            const RestReturn   = await resAPI.json();
            this.detail = RestReturn.data.questionInfo.detail
            this.type = RestReturn.data.questionInfo.type
            
            console.log(RestReturn);
            this.loading_sources    = true;
            } catch (error) {
            console.log(error)
            }
        }
    },
    async updateQuestionData() {
        if(storageManager.get('session','login')) {
            try {
                const accessToken   = storageManager.get('session','token')
                const callApi   = await fetch("https://asia-southeast2-elearning-6871c.cloudfunctions.net/exams/questions/" + this.examID + "/" + this.questionID, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json','Authorization': 'Bearer ' + accessToken},
                body: JSON.stringify({
                  "detail":this.detail,
                  "type":this.type,
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
                    cancelButtonText: "แก้ไขต่อ",
                    closeOnConfirm: false,
                    closeOnCancel: false 
                  }).then((confirmed) => {
                    if (confirmed.isConfirmed) {
                      console.log("Home");
                      window.location.href = "/lesson/exam/detail/" + this.examID
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
      const access = storageManager.get('session','access')
this.accessSession  =  access.current;
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
          <button @click="$router.push('/lesson/exam/detail/' + this.examID)" type="button" class="ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-50">
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

              <form @submit.prevent="updateQuestionData">

                <section aria-labelledby="payment-details-heading" class="relative" :data-content="'กำลังติดต่อฐานข้อมูล กรุณารอสักครู่.....'" :class="[(activeBlock?'isblock' : 'isunblock')]">
                  
                    <div class="shadow sm:overflow-hidden sm:rounded-md">
                      <div class="bg-white py-6 px-4 sm:p-6">
                        <div>
                          <h2 id="payment-details-heading" class="text-lg font-medium leading-6 text-gray-900">เพิ่มข้อสอบ</h2>
                          <p class="mt-1 text-sm text-gray-500">เพิ่มโจทย์ให้เรียบร้อย กด "บันทึก" แล้วเพิ่มคำตอบ</p>
                        </div>

                        <div class="mt-6 grid grid-cols-4 gap-6 pb-6 border-b-[1px]">

                          <div class="col-span-4 sm:col-span-2">
                            <label for="result" class="block text-base font-medium text-gray-900">รูปแบบเนื้อหา</label>
                            <fieldset class="mt-4">
                              <div class="space-y-4 sm:flex sm:items-center sm:space-y-0 sm:space-x-10">
                                
                                <div class="flex items-center">
                                  <input v-model="type" checked id="type_general" value="text" name="type" type="radio" class="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500">
                                  <label for="type_general" class="ml-3 block text-sm font-medium text-gray-700">text</label>
                                </div>

                                <div class="flex items-center">
                                  <input v-model="type" id="type_pre" value="pre" name="image" type="radio" class="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500">
                                  <label for="type_pre" class="ml-3 block text-sm font-medium text-gray-700">image</label>
                                </div>
                          
                                <div class="flex items-center">
                                  <input v-model="type" id="type_post" value="post" name="video" type="radio" class="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500">
                                  <label for="type_post" class="ml-3 block text-sm font-medium text-gray-700">video</label>
                                </div>

                              </div>
                            </fieldset>
                          </div>

                        </div>
                
                        <div class="mt-6 grid grid-cols-4 gap-6">

                          <div class="col-span-4 sm:col-span-6">
                            <label for="slug" class="block text-base font-bold text-gray-900 mb-3">คำถาม</label>
                            <MiniMCE v-model="detail" :options="{}" />
                          </div>

                        </div>

                      </div>
                    </div>

                </section>

                <section aria-labelledby="plan-heading" class="mt-8">
                  <div class="shadow sm:overflow-hidden sm:rounded-md">
                      <div class="bg-gray-50 px-4 py-3 text-right sm:px-6 border-t">
                        <button type="submit" class="inline-flex justify-center rounded-md border border-transparent bg-gray-800 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2">
                            <font-awesome-icon :icon="['fas','save']" class="pr-2 pl-2"/> บันทึกโจทย์
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

<style>
.v3dp__datepicker
{
  width: 100%;
  float: left;
  position: relative;
}

.v3dp__input_wrapper
{
  width: 100%;
}

.v3dp__datepicker input[type=text]{
  width: 100%;
  border-radius: 8px;
  --tw-border-opacity: 1;
  border-color: rgb(209 213 219 / var(--tw-border-opacity));
}

.v3dp__clearable {
  display: block;
  position: absolute;
  right: 10px;
  top: 10px;
  left: unset;
  cursor: pointer;
  color: #b6b6b6;
}
</style>