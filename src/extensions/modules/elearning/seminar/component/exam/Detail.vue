<script>

// Component
import feather from 'feather-icons';
import Loader from '@/interface/template/Loader.vue';
import FileBrowser from '@/interface/modal/FileBrowser.vue';
import storageManager from '@/plugins/storage';
import moment from 'moment';

moment().format();

export default {
    data() {
      const session = storageManager.get('session')
      return {
        courseData: [],
        examData: [],
        schoolAdmin: [],
        questionData:[],
        parentID:'',
        dataItem: this.$route.params.id,
        accessToken:session.token,
        login: session.login,
        master: session.master,
        selectCourseCover:'',
        cover:'',
        count:'',
        loading_sources: true,
        FileBrowserOpen: false,
        readMoreActivated: false,
        longText:'',
        endpoint:"",
      }
    },
    components: {
      Loader,
      FileBrowser,
    },
    methods: {
      dateTime(value) {
        return moment(value).format("DD/MM/YYYY hh:mm:ss");
      },
      activateReadMore(){
        this.readMoreActivated = true;
      },
      unActivateReadMore(){
        this.readMoreActivated = false;
      },
      async getData() {
        if(storageManager.get('session','login')) {
        try {
          //console.log("Auth : Course List : ",ls.get('auth'));
          this.loading_sources  = false;
          const resAPI          = await fetch("https://asia-southeast2-elearning-6871c.cloudfunctions.net/exams/" + this.dataItem, {
            method: 'GET',
            headers: {'Content-Type': 'application/json','Authorization': 'Bearer ' + this.accessToken},
          });

          const RestReturn   = await resAPI.json();
          console.log(RestReturn);

          if(RestReturn.success) {
            this.examData         = RestReturn.data;
            this.parentID         = RestReturn.data.courseId;
            const courseReturn    = await this.getCourseData(this.parentID)
            const questionReturn  = await this.getQuestionData();
            this.questionData     = questionReturn.data.questionInfo
            this.questionData.sort(function(a,b){return a.order < b.order ? -1 : 1});
            this.count            = this.questionData.length

            console.log("questionData",this.questionData);
            console.log("courseReturn",courseReturn);
            if(courseReturn.success) {
              this.courseData       = courseReturn.data;
              this.loading_sources  = true;
            }
          }
        } catch (error) {
          console.log(error)
        }
        }
      },
      async getCourseData(id) {
        if(storageManager.get('session','login')) {
            try {
            //console.log("Auth : Course List : ",ls.get('auth'));
            this.loading_sources  = false;
            const resAPI          = await fetch("https://asia-southeast2-elearning-6871c.cloudfunctions.net/"+this.endpoint+"/" + id, {
                method: 'GET',
                headers: {'Content-Type': 'application/json','Authorization': 'Bearer ' + this.accessToken},
            });

            return await resAPI.json();
            } catch (error) {
            console.log(error)
            }
        }
      },
      async getQuestionData() {
        if(storageManager.get('session','login')) {
            try {
            //console.log("Auth : Course List : ",ls.get('auth'));
            this.loading_sources  = false;
            const resAPI          = await fetch("https://asia-southeast2-elearning-6871c.cloudfunctions.net/exams/getFullExam/" + this.dataItem + "/false/100", {
                method: 'GET',
                headers: {'Content-Type': 'application/json','Authorization': 'Bearer ' + this.accessToken},
            });

            return await resAPI.json();
            } catch (error) {
            console.log(error)
            }
        }
      },
      changeFileTrigger(payload) {
        this.FileBrowserOpen = payload;
      },
      selectFileTrigger(payload) {
        if(payload!=undefined) {
          this.selectCourseCover = payload;
          // Set Return Function form select file popup
          console.log("selectFileReturnFunction",payload)
          this.updataCover(payload);
        }
      },
      async deleteQuestion(exam,question) {
          if(storageManager.get('session','login')) {
            try {
              console.log("exam",exam);
              console.log("question",question);
              this.$swal({ 
                title: "ต้องการลบข้อมูลนี้ ?",
                text: "หลังจากลบแล้วจะไม่สามารถกู้คืนข้อมูลนี้ได้อีก !",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "ตกลง ลบเลย",
                cancelButtonText: "ยกเลิก",
                closeOnConfirm: false,
                closeOnCancel: false 
              }).then((confirmed) => {
                if (confirmed.isConfirmed) {
                  console.log("Delete");
                  this.confirmDeleteQuestion(exam,question);
                } else {
                  console.log("Cancel");
                }
              });
            } catch (error) {
              console.log(error)
            }
          }
      },
      async confirmDeleteQuestion(exam,question) {
          if(storageManager.get('session','login')) {
            try {
              const resAPI = await fetch("https://asia-southeast2-elearning-6871c.cloudfunctions.net/exams/questions/" + exam + "/" + question, {
                method: 'DELETE',
                headers: {'Content-Type': 'application/json','Authorization': 'Bearer ' + this.accessToken},
              });
              const finalRes   = await resAPI.json();
              if(finalRes.success) {
                //window.location.href = "/lesson/detail/"  + this.parentID
                location.reload();
              }
            } catch (error) {
              console.log(error)
            }
          }
      },
      OpenFileBrowser()
      {
      this.FileBrowserOpen = true;
      },
      updated() {
      feather.replace();
      },
      sort(array) {
        return array.sort((a, b) => a.order - b.order)
      },
    },
    async mounted () {
      try {
        
        if(this.master) {
          this.endpoint = "mcourses";
        } else {
          this.endpoint = "courses";
        }

        await this.getData();
        
      } catch (error) {
        console.log(Error);
      }
    },
    setup() {
      //console.log("Setup");
    },
};
</script>

<template>

    <FileBrowser v-if="FileBrowserOpen" :isWindowsOpen="true" :allowFileType="['jpg','gif','png','jpeg']" @file-browser-trigger="changeFileTrigger" @select-file-trigger="selectFileTrigger"/>
    <div v-if="!loading_sources" class="text-center"><Loader/></div>
    <div v-if="loading_sources">
      <div class="mx-auto max-w-3xl px-4 mt-5 sm:px-6 md:flex md:items-center md:justify-between md:space-x-5 lg:max-w-7xl lg:px-8">
        <div class="flex items-center space-x-5">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">{{ courseData.name }}</h1>
            <p class="text-sm font-medium text-gray-500">
              หมวดหมู่ <a href="#" class="text-indigo-400">การตลาด</a>  
              <span class="font-medium text-gray-200">|</span> 
              การแสดงผล <a href="#" class="text-indigo-400">บุฟเฟต์</a>
              <span class="font-medium text-gray-200">|</span> 
              ประเภท <a href="#" class="text-indigo-400">เรียนออนไลน์</a>
            </p>
          </div>
        </div>
        <div class="justify-stretch mt-6 flex flex-col-reverse space-y-4 space-y-reverse sm:flex-row-reverse sm:justify-end sm:space-y-0 sm:space-x-3 sm:space-x-reverse md:mt-0 md:flex-row md:space-x-3">
          
          <button 
          @click="$router.push('/lesson/detail/'+this.parentID)"
          type="button" 
          class="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-100">
          <font-awesome-icon :icon="['fas','chevron-left']" class="text-black text-[12px] mr-2"/> ย้อนกลับ
          </button>
  
        </div>
      </div>
  
      <div class="mx-auto mt-8 grid max-w-3xl grid-cols-1 gap-6 sm:px-6 lg:max-w-7xl lg:grid-flow-col-dense lg:grid-cols-1">
        <div class="space-y-6 lg:col-span-2 lg:col-start-1">
  
          <!-- Comments-->
          <section aria-labelledby="notes-title">
            <div class="bg-white shadow sm:overflow-hidden sm:rounded-lg">
              <div class="divide-y divide-gray-200">
                <div class="px-4 py-5 sm:px-6 relative">
                  <h2 id="notes-title" class="text-lg font-bold text-gray-900">{{examData.name}}</h2>
                  <span>ข้อสอบ : <span class="font-bold text-indigo-300">{{examData.total}}</span> ข้อ</span>
                  <span class="font-medium text-gray-200">|</span> 
                  <span>เวลาสอบ : <span class="font-bold text-indigo-300">{{examData.timer}}</span> นาที</span>
                  <span class="font-medium text-gray-200">|</span> 
                  <span>ประเภท : <span class="font-bold text-indigo-300">{{examData.type}}</span></span>
                  <div class="absolute top-4 right-4 ml-3 inline-flex items-center ">
                  <button 
                  @click="$router.push('/lesson/exam/edit/' + this.dataItem)"
                  type="button" 
                  class="mr-3 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-100">
                  <font-awesome-icon :icon="['fas','edit']" class="text-black pr-3"/> แก้ไขข้อมูล 
                  </button>
                  <button 
                  @click="deleteExam(this.dataItem)"
                  type="button" 
                  class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-100">
                  <font-awesome-icon :icon="['fas','trash']" class="text-black"/> 
                  </button>
                  </div>
                </div>
                <div class="px-4 py-6 sm:px-6"> 
                <div v-html="examData.description"></div>
                </div>
              </div>
              
            </div>
          </section>
  
          <section aria-labelledby="notes-title">
            <div class="bg-white shadow sm:overflow-hidden sm:rounded-lg">
              <div class="divide-y divide-gray-200">
                <div class="px-4 py-5 sm:px-6 relative">
                <h2 id="notes-title" class="text-lg font-bold text-gray-900">ข้อสอบทั้งหมด</h2>
                <button 
                @click="$router.push('/lesson/question/add/'+this.dataItem + '/' + this.count)"
                type="button" 
                class="absolute top-4 right-4 ml-3 inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                <font-awesome-icon :icon="['fas','square-plus']" class="text-gray-200 pr-3"/> เพิ่มข้อสอบ 
                </button>
                </div>
                <div class="pl-5 pr-5 pb-5">
  
                  <div v-for="(question) in questionData" :key="question.id" class="border-b-[1px] border-dashed pb-4 pt-4">
                      <fieldset class="">
                        <legend class="contents text-base font-medium text-gray-900">
                          <div class="float-left">{{(question.order+1)}}.</div>
                          <div v-html="question.detail"></div></legend>
                        <div class="mt-2 space-x-2 text-sm float-left">
                          
                          <button 
                          @click="$router.push('/lesson/question/answer/' + examData.id + '/' + question.id)"
                          type="button" class="font-medium text-white bg-black pl-3 pr-3 pt-1 pb-1 rounded hover:bg-indigo-700"><font-awesome-icon :icon="['fas','square-check']" class="text-white"/> แก้ไขคำตอบ</button>
                          <button 
                          @click="$router.push('/lesson/question/edit/' + examData.id + '/' + question.id)"
                          type="button" class="font-medium text-white bg-black pl-3 pr-3 pt-1 pb-1 rounded hover:bg-indigo-700"><font-awesome-icon :icon="['fas','pencil']" class="text-white"/> แก้ไขโจทย์</button>
                          <button 
                          @click="deleteQuestion(examData.id,question.id)" 
                          type="button" class="font-medium text-white bg-black pl-3 pr-3 pt-1 pb-1 rounded hover:bg-indigo-700"><font-awesome-icon :icon="['fas','trash']" class="text-white"/> ลบโจทย์</button>
                        </div>

                        <div class="mt-4 w-full float-left p-3 relative">
                            <div v-for="(answer) in this.sort(question.answers)" :key="answer.id" class="flex items-center pb-2">
                              <input v-if="(answer.isTrueAnswer)" :id="answer.id" :name="question.id" type="radio" checked class="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500" disabled readonly>
                              <input v-if="(!answer.isTrueAnswer)" :id="answer.id" :name="question.id" type="radio" class="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500" disabled readonly>
                              <label :for="answer.id" class="ml-3 block text-base font-medium text-gray-700">{{answer.detail}}</label>
                            </div>

                            <label 
                            for="desktop-user-photo" 
                            class="absolute inset-0 flex rounded-md h-full w-full items-center justify-center bg-black bg-opacity-50 text-sm font-medium text-white opacity-0 focus-within:opacity-100 hover:opacity-100 cursor-pointer" 
                            @click="$router.push('/lesson/question/answer/' + examData.id + '/' + question.id)">
                            <span><font-awesome-icon :icon="['fas','pencil']" class=""/> แก้ไขคำตอบ</span>
                            </label>

                        </div>

                      </fieldset>
                  </div>
                  
                </div>
            </div>
            
            </div>
          </section>
  
        </div>
      </div>
    </div>
    
</template>