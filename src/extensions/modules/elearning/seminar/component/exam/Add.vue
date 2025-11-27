<script>
import {result, show, type, shuffle} from "@/master/exam_option";
import {useRoute} 	      from 'vue-router'
import storageManager from '@/plugins/storage';

import Datepicker         from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css'

import MiniMCE            from 'minimce'
import 'tinymce/skins/ui/oxide/skin.min.css'
import 'tinymce/themes/silver/theme'
import 'tinymce/icons/default/icons'

export default {
  name: 'AddExam',
  data() {
    const route = useRoute();
    return {
      PageName: route.meta.title,
      PageIcon: route.meta.icon,
      PagePath: route.meta.path,
      ParentName: route.meta.parent,
      ParentPage: route.meta.page,
      accessSession: [],

      resultData: [],
      showData: [],
      typeData: [],
      shuffleData: [],
      displayData: [],

      checkedType: 'general',
      checkedResult: 'now',
      checkedShow: 'now',

      name: '',
      slug: '',
      total: '',
      timer: '',
      is_score: 'no',
      is_question_shuffle: 'normal',
      is_answer_shuffle: 'normal',
      score: '',
      description: '',
      result: 'now',
      type: 'general',
      result_duedate: new Date(),
      show: 'now',
      show_duedate: new Date(),

      activeBlock: false,
      schoolData: [],
      loading_sources: true,
      dataItem: this.$route.params.id,
      course: this.$route.params.id,
      login: storageManager.get('session','login'),
      accessToken:storageManager.get('session','token'),
    }
  },
  components: {
    Datepicker,
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
          this.loading_sources  = false;
          const resAPI          = await fetch("https://asia-southeast2-elearning-6871c.cloudfunctions.net/courses/" + this.dataItem, {
            method: 'GET',
            headers: {'Content-Type': 'application/json','Authorization': 'Bearer ' + this.accessToken},
          });
          const RestReturn     = await resAPI.json();
          const access         = storageManager.get('session','access')
          this.schoolData      = RestReturn.data;
          this.resultData      = result
          this.showData        = show
          this.typeData        = type
          this.shuffleData     = shuffle
          this.school          = access.current.id;
          this.loading_sources = true;
        } catch (error) {
          console.log(error)
        }
      }
    },
    async addData() {
      if(this.login) {
        try {
          this.activeBlock = true
          const callApi = await fetch("https://asia-southeast2-elearning-6871c.cloudfunctions.net/exams", {
            method: 'POST',
            headers: {'Content-Type': 'application/json','Authorization': 'Bearer ' + this.accessToken},
            body: JSON.stringify({
              "courseId":this.course,
              "name":this.name,
              "slug":this.slugify(this.slug),
              "total":this.total,
              "timer":this.timer,
              "score":this.score,
              "type":this.type,
              "description":this.description,
              "result":this.result,
              "result_duedate":this.result_duedate,
              "show":this.show,
              "show_duedate":this.show_duedate,
              "is_score":this.is_score,
              "is_answer_shuffle":this.is_answer_shuffle,
              "is_question_shuffle":this.is_question_shuffle,
            })
          });
          const finalRes = await callApi.json();
          if(finalRes.success) {
            this.activeBlock = false
            window.location.href = "/lesson/detail/" + this.dataItem
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
                      <h2 id="payment-details-heading" class="text-lg font-bold leading-6 text-gray-900">ข้อมูลหลักสูตร</h2>
                      <p class="mt-1 text-sm text-gray-500">กรอกข้อมูลของหลักสูตรให้ครบถ้วน</p>
                    </div>
                    <div class="px-4 py-5 sm:p-6">

                      <div class="grid grid-cols-4 gap-6">

                        <div class="col-span-4 sm:col-span-2">
                          <label for="name" class="block text-base font-bold text-gray-900">ชื่อแบบทดสอบ</label>
                          <input 
                          v-model="name" 
                          type="text" name="name" id="name" autocomplete="name" 
                          class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm">
                        </div>

                        <div class="col-span-4 sm:col-span-2">
                          <label for="slug" class="block text-base font-bold text-gray-900">รหัสแบบทดสอบ</label>
                          <input 
                          v-model="slug"
                          type="text" name="slug" id="slug" autocomplete="slug" 
                          class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm">
                        </div>

                      </div>

                      <div class="mt-6 grid grid-cols-8 gap-6 pb-6">

                        <div class="col-span-4 sm:col-span-2">
                          <label for="total" class="block text-base font-bold text-gray-900">จำนวนข้อสอบ (ข้อ)</label>
                          <input 
                          v-model="total" 
                          type="text" name="total" id="total" autocomplete="total" 
                          class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm">
                        </div>

                        <div class="col-span-4 sm:col-span-2">
                          <label for="timer" class="block text-base font-bold text-gray-900">เวลาในการสอบ (นาที)</label>
                          <input 
                          v-model="timer"
                          type="text" name="timer" id="timer" autocomplete="timer" 
                          class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm">
                        </div>

                        <div class="col-span-4 sm:col-span-2">
                          <label class="block text-base font-bold text-gray-900">จัดเรียงคำถาม</label>
                          <fieldset class="mt-4">
                            <div class="space-y-4 sm:flex sm:items-center sm:space-y-0 sm:space-x-10">
                              
                              <div v-for="(shuffleItem) in shuffleData" :key="shuffleItem.code" class="flex items-center">
                                <input v-model="is_question_shuffle" :id="'q_'+shuffleItem.code" :value="shuffleItem.code" type="radio" class="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500">
                                <label :for="'q_'+shuffleItem.code" class="ml-3 block text-sm font-medium text-gray-700">{{shuffleItem.name}}</label>
                              </div>

                            </div>
                          </fieldset>
                        </div>

                        <div class="col-span-4 sm:col-span-2">
                          <label class="block text-base font-bold text-gray-900">จัดเรียงคำตอบ</label>
                          <fieldset class="mt-4">
                            <div class="space-y-4 sm:flex sm:items-center sm:space-y-0 sm:space-x-10">

                              <div v-for="(shuffleItem) in shuffleData" :key="shuffleItem.code" class="flex items-center">
                                <input v-model="is_answer_shuffle" :id="'a_'+shuffleItem.code" :value="shuffleItem.code" type="radio" class="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500">
                                <label :for="'a_'+shuffleItem.code" class="ml-3 block text-sm font-medium text-gray-700">{{shuffleItem.name}}</label>
                              </div>

                            </div>
                          </fieldset>
                        </div>

                      </div>
                    </div>
                  </div>

                  <div class="grid grid-cols-2 gap-6">
                    <div class="col-span-4 sm:col-span-1">

                      <div class="divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow mb-8">
                        <div class="px-4 py-5 sm:px-6">
                          <h2 id="payment-details-heading" class="text-lg font-bold leading-6 text-gray-900">ประเภทแบบทดสอบ (Type)</h2>
                          <p class="mt-1 text-sm text-gray-500">กรอกข้อมูลของหลักสูตรให้ครบถ้วน</p>
                        </div>
                        <div class="px-4 py-5 sm:p-6">
                          <div class="grid grid-cols-1 gap-6">
                            <div class="col-span-1 sm:col-span-1">
                              <fieldset class="">
                                <div class="space-y-4 sm:flex sm:items-center sm:space-y-0 sm:space-x-10">
                                  <div v-for="(typeItem) in typeData" :key="typeItem.code" class="flex items-center">
                                    <input v-model="checkedType" :id="typeItem.code" :value="typeItem.code" type="radio" class="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500">
                                    <label :for="typeItem.code" class="ml-3 block text-sm font-medium text-gray-700">{{typeItem.name}}</label>
                                  </div>
                                </div>
                              </fieldset>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                    <div class="col-span-4 sm:col-span-1">
                      
                      <div class="divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow mb-8">
                        <div class="px-4 py-5 sm:px-6">
                          <h2 id="payment-details-heading" class="text-lg font-bold leading-6 text-gray-900">ประเภทแบบทดสอบ (Type)</h2>
                          <p class="mt-1 text-sm text-gray-500">กรอกข้อมูลของหลักสูตรให้ครบถ้วน</p>
                        </div>
                        <div class="px-4 py-5 sm:p-6">
                          <div class="grid grid-cols-1 gap-6">
                            <div class="col-span-4 sm:col-span-2">

                              <fieldset class="">
                                <div class="space-y-4 sm:flex sm:items-center sm:space-y-0 sm:space-x-10">
                                  
                                  <div class="flex items-center">
                                    <input v-model="is_score" checked id="is_score_yes" value="yes" name="is_score" type="radio" class="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500">
                                    <label for="is_score_yes" class="ml-3 block text-sm font-medium text-gray-700">วัดผล</label>
                                  </div>
    
                                  <div class="flex items-center">
                                    <input v-model="is_score" id="is_score_no" value="no" name="is_score" type="radio" class="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500">
                                    <label for="is_score_no" class="ml-3 block text-sm font-medium text-gray-700">ไม่วัดผล</label>
                                  </div>
    
                                </div>
                              </fieldset>

                            </div>
                            <div class="col-span-4 sm:col-span-2" v-if="(this.is_score==='yes')">
                              <label for="score" class="block text-base font-medium text-gray-900">ผ่านเกณฑ์ (คะแนน)</label>
                              <input 
                              v-model="score"
                              type="text" name="score" id="score" autocomplete="score" 
                              class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm">
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>

                  <div class="grid grid-cols-2 gap-6">
                    <div class="col-span-4 sm:col-span-1">

                      <div class="divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow mb-8">
                        <div class="px-4 py-5 sm:px-6">
                          <h2 id="payment-details-heading" class="text-lg font-bold leading-6 text-gray-900">แสดงแบบทดสอบสอบ (การแสดงผล)</h2>
                          <p class="mt-1 text-sm text-gray-500">กรอกข้อมูลของหลักสูตรให้ครบถ้วน</p>
                        </div>
                        <div class="px-4 py-5 sm:p-6">
                          <div class="grid grid-cols-1 gap-6">
                            <div class="col-span-1 sm:col-span-1">
                              <fieldset class="">
                                <div class="space-y-4 sm:flex sm:items-center sm:space-y-0 sm:space-x-10">
                                  <div v-for="(showItem) in showData" :key="showItem.code" class="flex items-center">
                                    <input v-model="checkedShow" :id="'show_'+showItem.code" :value="showItem.code" type="radio" class="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500">
                                    <label :for="'show_'+showItem.code" class="ml-3 block text-sm font-medium text-gray-700">{{showItem.name}}</label>
                                  </div>
    
                                </div>
                              </fieldset>
                            </div>
                            <div class="col-span-1 sm:col-span-1" v-if="(this.checkedShow==='duedate')">
                              <label for="show_duedate" class="block text-base font-medium text-gray-900">วันที่เปิดสอบ</label>
                              <datepicker v-model="show_duedate" :clearable="true">
                                <template v-slot:clear="{ onClear }">
                                  <button @click="onClear">ล้างข้อมูล</button>
                                </template>
                              </datepicker>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                    <div class="col-span-4 sm:col-span-1">

                      <div class="divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow mb-8">
                        <div class="px-4 py-5 sm:px-6">
                          <h2 id="payment-details-heading" class="text-lg font-bold leading-6 text-gray-900">การประกาศผลสอบ</h2>
                          <p class="mt-1 text-sm text-gray-500">กรอกข้อมูลของหลักสูตรให้ครบถ้วน</p>
                        </div>
                        <div class="px-4 py-5 sm:p-6">
    
                          <div class="grid grid-cols-1 gap-6">
    
                            <div class="col-span-1 sm:col-span-1">
                              <fieldset class="">
                                <div class="space-y-4 sm:flex sm:items-center sm:space-y-0 sm:space-x-10">
                                  <div v-for="(resultItem) in resultData" :key="resultItem.code" class="flex items-center">
                                    <input v-model="checkedResult" :id="'result_'+resultItem.code" :value="resultItem.code" type="radio" class="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500">
                                    <label :for="'result_'+resultItem.code" class="ml-3 block text-sm font-medium text-gray-700">{{resultItem.name}}</label>
                                  </div>
                                </div>
                              </fieldset>
                            </div>
                            <div class="col-span-1 sm:col-span-1" v-if="(this.checkedResult==='duedate')">
                              <label for="result_duedate" class="block text-base font-medium text-gray-900">วันที่ประกาศผล (คะแนน)</label>
                              <datepicker v-model="result_duedate" :clearable="true">
                                <template v-slot:clear="{ onClear }">
                                  <button @click="onClear">ล้างข้อมูล</button>
                                </template>
                              </datepicker>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>

                  <div class="divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow mb-8">
                    <div class="px-4 py-5 sm:px-6">
                      <h2 id="payment-details-heading" class="text-lg font-bold leading-6 text-gray-900">คำอธิบายรายวิชา</h2>
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