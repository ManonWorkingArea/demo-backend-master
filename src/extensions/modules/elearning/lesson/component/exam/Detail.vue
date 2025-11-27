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
        configs: storageManager.get('configs'),
        courseData: [],
        examData: [],
        schoolAdmin: [],
        questionData:[],
        parentID:'',
        dataItem: this.$route.params.id,
        history: this.$route.params.history,
        accessToken:session.token,
        login: session.login,
        master: session.master,
        selectCourseCover:'',
        cover:'',
        count:'',
        loading_sources: true,
        FileBrowserOpen: false,
        readMoreActivated: false,

        selectedExamIndex: null,
        isLoading:false,

        longText:'',
        endpoint:"",
      }
    },
    components: {
      Loader,
      FileBrowser,
    },
    methods: {
      inputFocusHandler(event) {
        event.stopPropagation();
      },
      async handleButtonClick(item) {
        console.log(item);
        try {
          if (item.answers.length <= 0) {
            await this.deleteQuestion(item._id);
          } else {
            await this.deleteQuestionAnswer(item);
          }
          this.hidePanel();
        } catch (error) {
          console.error('An error occurred:', error);
        }
      },
      togglePanel(index) {
        if (this.isOpenPanel(index)) {
          this.selectedExamIndex = null;
        } else {
          this.selectedExamIndex = index;

          const panelElement = document.getElementById(`panel-${this.selectedExamIndex}`);
          if (panelElement) {
            const scrollY = panelElement.getBoundingClientRect().top + window.scrollY - 20;
            this.smoothScrollTo(scrollY);
          }
        }
      },
      smoothScrollTo(targetY, duration = 500) {
        const initialY = window.scrollY;
        const yOffset = targetY - initialY;
        const startTime = performance.now();
        function scroll() {
          const currentTime = performance.now();
          const elapsedTime = currentTime - startTime;
          if (elapsedTime < duration) {
            window.scrollTo(0, initialY + easeInOutCubic(elapsedTime / duration) * yOffset);
            requestAnimationFrame(scroll);
          } else {
            window.scrollTo(0, targetY);
          }
        }
        function easeInOutCubic(t) {
          return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
        }
        requestAnimationFrame(scroll);
      },
      isOpenPanel(index) {
        return this.selectedExamIndex === index;
      },
      hidePanel() {
        this.selectedExamIndex = null;
      },
      dateTime(value) {
        return moment(value).format("DD/MM/YYYY hh:mm:ss");
      },
      activateReadMore(){
        this.readMoreActivated = true;
      },
      unActivateReadMore(){
        this.readMoreActivated = false;
      },
      async getData(silent = false) {
        try {
          
          if(silent) {
            console.log("Get Data Silent : Start");
          } else {
            this.loading_sources  = false;
          }
          
          const resAPI          = await fetch("https://gateway.cloudrestfulapi.com/api/exam/" + this.dataItem, {
            method: 'GET',
            headers: {'Content-Type': 'application/json','client-token-key':this.configs.key},
          });

          const RestReturn   = await resAPI.json();
          console.log(RestReturn);

          if(resAPI.status===200) {
            this.examData         = RestReturn;
            this.parentID         = RestReturn.courseId;
            const courseReturn    = await this.getCourseData(this.parentID)
            const questionReturn  = await this.getQuestionData(this.dataItem);
            this.questionData     = questionReturn

            console.log("examData",this.examData);
            console.log("questionData",this.questionData);

            this.questionData = await Promise.all(this.questionData.map(async element => {
              console.log("element", element._id);
              const answerAPI = await fetch("https://gateway.cloudrestfulapi.com/api/answer/query", {
                method: 'POST',
                headers: {'Content-Type': 'application/json','client-token-key':this.configs.key},
                body: JSON.stringify({
                  method: 'find',
                  args: [
                    {
                      $and: [
                        { questionID: element._id }
                      ]
                    }
                  ]
                })
              });
              const answerReturn = await answerAPI.json();
              element.answers = answerReturn;
              return element;
            }));

            //this.questionData.sort(function(a,b){return a.order < b.order ? -1 : 1});
            this.count = this.questionData.length

            console.log("questionData",this.questionData);
            console.log("courseReturn",courseReturn);
            if(courseReturn) {
              this.courseData       = courseReturn;

              if(silent) {
                console.log("Get Data Silent : Finish");
              } else {
                this.loading_sources  = true;
              }
            }
          }
        } catch (error) {
          console.log(error)
        }
      },
      async getCourseData(id) {
        if(storageManager.get('session','login')) {
            try {
              //this.loading_sources  = false;
              const resAPI          = await fetch("https://gateway.cloudrestfulapi.com/api/"+this.endpoint+"/" + id, {
                method: 'GET',
                headers: {'Content-Type': 'application/json','client-token-key':this.configs.key},
              });

              return await resAPI.json();
            } catch (error) {
              console.log(error)
            }
        }
      },
      async getQuestionData(id) {
        if(storageManager.get('session','login')) {
            try {
              //this.loading_sources  = false;
              const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/questions/query", {
                method: 'POST',
                headers: {'Content-Type': 'application/json','client-token-key':this.configs.key},
                body: JSON.stringify({
                  method: 'find',
                  args: [
                    {
                      $and: [
                        { examID: id }
                      ]
                    }
                  ]
                })
              });

              return await resAPI.json();
            } catch (error) {
              console.log(error)
            }
        }
      },
        async addQuestion(order) {
          try {
              const callApi   = await fetch("https://gateway.cloudrestfulapi.com/api/questions/"   , {
              method: 'POST',
              headers: {'Content-Type': 'application/json','client-token-key':this.configs.key},
              body: JSON.stringify({
                data: {
                  "examID":this.dataItem,
                  "detail":'โจทย์สำหรับ ' + this.examData.name + 'ข้อที่ ' + parseInt(('0' + (order++)).slice(-2)),
                  "type":'text',
                  order:parseInt(('0' + (order++)).slice(-2))
                },
                options: {}
              })
              });
              await callApi.json();
              if(callApi.status===200) {
                await this.getData(true);
              }
          } catch (error) {
          console.log(error)
          }
      },
      async addAnswer(order,question) {
        try {
          this.isLoading = true;
          const callApi   = await fetch("https://gateway.cloudrestfulapi.com/api/answer/", {
            method: 'POST',
            headers: {'Content-Type': 'application/json','client-token-key':this.configs.key},
            body: JSON.stringify({
              data: {
                questionID:question,
                order:parseInt(('0' + (order++)).slice(-2))
              },
              options: {}
            })
          });
          await callApi.json();
          if(callApi.status===200) {
            await this.getData(true);
          }
        } catch (error) {
          console.log(error)
        } finally {
          this.isLoading = false; // Set isLoading to false when fetch is finished (success or error)
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
      async deleteQuestion(question) {
          if(storageManager.get('session','login')) {
            try {
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
                  this.confirmDeleteQuestion(question);
                } else {
                  console.log("Cancel");
                }
              });
            } catch (error) {
              console.log(error)
            }
          }
      },
      async confirmDeleteQuestion(question) {
        try {
          const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/questions/"+ question, {
            method: 'DELETE',
            headers: {'Content-Type': 'application/json','client-token-key':this.configs.key},
          });
          await resAPI.json();
          if(resAPI.status===200) {
            await this.getData(true);
          }
        } catch (error) {
          console.log(error)
        }
      },
      async deleteQuestionAnswer(question) {
        try {
          for (let i = 0; i < question.answers.length; i++) {
            const answer = question.answers[i];
            console.log("answer",answer);
            await this.confirmDeleteAnswer(answer._id);
          }
          await this.confirmDeleteQuestion(question._id)
          await this.getData(true);
        } catch (error) {
          console.error('Error updating answers:', error);
        }
      },
      async updateAnswer(question) {
        try {
            this.isLoading = true;
            for (let i = 0; i < question.answers.length; i++) {
              const answer = question.answers[i];
              console.log("answer",answer);
              await this.updateAnswerData(answer);
            }
            await this.updateQuestionData(question);
            await this.getData(true);
        } catch (error) {
            console.error('Error updating answers:', error);
        } finally {
            this.isLoading = false; // Set isLoading to false when fetch is finished (success or error)
        }
      },
      async updateAnswerData(updatedAnswers) {
        try {
          const callApi   = await fetch("https://gateway.cloudrestfulapi.com/api/answer/" + updatedAnswers._id, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json','client-token-key':this.configs.key},
            body: JSON.stringify({
              data: {
                "detail":updatedAnswers.detail
              },
              options: {}
            })
          });
          await callApi.json();
        } catch (error) {
        console.log(error)
        }
      },
      async updateQuestionData(updateQuestion) {
        try {
          const callApi   = await fetch("https://gateway.cloudrestfulapi.com/api/questions/" + updateQuestion._id, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json','client-token-key':this.configs.key},
            body: JSON.stringify({
              data: {
                "type":updateQuestion.type,
                "detail":updateQuestion.detail,
                "correct":updateQuestion.correct
              },
              options: {}
            })
          });
          await callApi.json();
        } catch (error) {
        console.log(error)
        }
      },
      async deleteAnswer(answer) {
        try {
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
              this.confirmDeleteAnswer(answer);
            } else {
              console.log("Cancel");
            }
          });
        } catch (error) {
          console.log(error)
        }
      },
      async confirmDeleteAnswer(answer) {
        try {
          this.isLoading = true;
          const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/answer/"  + answer , {
            method: 'DELETE',
            headers: {'Content-Type': 'application/json','client-token-key':this.configs.key},
          });
          await resAPI.json();
          if(resAPI.status===200) {
            await this.getData(true);
          }
        } catch (error) {
          console.log(error)
        }  finally {
          this.isLoading = false;
        }
      },
      OpenFileBrowser() {
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
          this.endpoint = "mcourse";
        } else {
          this.endpoint = "course";
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
          @click="$router.push('/lesson/detail/' + this.history)"
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
  
          <section aria-labelledby="notes-title" id="root-panel">
            <div class="bg-white shadow sm:overflow-hidden sm:rounded-lg">
              <div class="divide-y divide-gray-200">
                <div class="px-4 py-5 sm:px-6 relative">
                <h2 id="notes-title" class="text-lg font-bold text-gray-900">ข้อสอบทั้งหมด</h2>
                <!-- <button 
                @click="$router.push('/lesson/question/add/'+this.dataItem)"
                type="button" 
                class="absolute top-4 right-4 ml-3 inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                <font-awesome-icon :icon="['fas','square-plus']" class="text-gray-200 pr-3"/> เพิ่มข้อสอบ 
                </button> -->

                <button 
                @click.stop="addQuestion(questionData.length)"
                type="button" 
                class="absolute top-4 right-4 ml-3 inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                <font-awesome-icon :icon="['fas','square-plus']" class="text-gray-200 pr-3"/> เพิ่มข้อสอบ 
                </button>

                </div>
                <div class="pl-5 pr-5 pb-5">

                  <!-- <pre>{{questionData}}</pre> -->
  
                  <div v-for="(question,index) in questionData" :key="question._id" 
                  class="p-2 mt-2 cursor-pointer"
                  :id="`panel-${index}`"
                  
                  :class="{ 
                    'border-gray-300': selectedExamIndex === index, 
                    'mb-[4px]': selectedExamIndex === index, 
                    'border-[1px]': selectedExamIndex === index, 
                    'hover:bg-gray-50 hover:border-gray-200': selectedExamIndex !== index,
                    'shadow-lg': selectedExamIndex === index,
                    //'opacity-10': selectedExamIndex !== null && selectedPlayerIndex !== index,
                    //'pointer-events-none': selectedExamIndex === index
                  }"
                  >
                      <fieldset :class="{'hidden': selectedExamIndex === index,'opacity-10': selectedExamIndex !== null && selectedPlayerIndex !== index,'pointer-events-none': selectedExamIndex !== null && selectedExamIndex !== index}">
                        
                        <div class="w-full block text-base font-bold text-gray-900 border-b border-gray-200 pb-2 pt-2 hover:text-blue-600 hover:font-bold" >
                          <div class="float-left">{{(index+1)}}.</div>
                          <div @click="togglePanel(index,question)" v-html="question.detail"></div>
                        </div>

                        <div class="mt-2 w-full float-left relative">
                            <div v-for="(answer) in question.answers" :key="answer._id" class="flex items-center pb-2">
                              <input v-if="(question.correct===answer._id)" type="radio" checked class="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500" disabled readonly>
                              <input v-else :id="answer._id" type="radio" class="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500" disabled readonly>
                              <label class="ml-3 block text-base font-medium text-gray-700">{{answer.detail}}</label>
                            </div>

                            <!-- <label 
                            for="desktop-user-photo" 
                            class="absolute inset-0 flex rounded-md h-full w-full items-center justify-center bg-black bg-opacity-50 text-sm font-medium text-white opacity-0 focus-within:opacity-100 hover:opacity-100 cursor-pointer" 
                            @click="$router.push('/lesson/question/answer/' + this.examData._id + '/' + question._id)">
                            <span><font-awesome-icon :icon="['fas','pencil']" class=""/> แก้ไขคำตอบ</span>
                            </label> -->
                        </div>

                      </fieldset>

                      <div class="mt-2 relative" v-if="isOpenPanel(index)" :data-content="'กำลังบันทึกข้อมูล...'" :class="{ 'isblock': isLoading }">
                        <div class="pb-3 font-bold flex justify-between items-center">
                          <span>แก้ไขข้อสอบข้อที่ {{(index+1)}}</span>
                          <button 
                            @click.stop="hidePanel"
                            type="button" 
                            class="mr-1 border border-transparent bg-white shadow-sm border border-gray-400 px-4 py-2 text-sm font-medium text-gray-600 shadow-sm hover:bg-gray-100">
                            <font-awesome-icon :icon="['fas','times']" class="text-gray-600 pr-2"/> ปิด 
                          </button>

                        </div>
                        
                        <div class="border-t border-gray-200 grid grid-cols-2 gap-2 mb-2 py-3 px-2">
    
                          <div class="col-span-2">

                            <div class="pb-3">
                              <label for="result" class="block text-base font-medium text-gray-900">ประเภทคำถาม</label>
                              <fieldset class="mt-4">
                                <div class="space-y-4 sm:flex sm:items-center sm:space-y-0 sm:space-x-10">
                                  
                                  <div class="flex items-center">
                                    <input v-model="question.type" checked id="type_general" value="text" name="type" type="radio" class="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500">
                                    <label for="type_general" class="ml-3 block text-sm font-medium text-gray-700">text</label>
                                  </div>
        
                                  <div class="flex items-center">
                                    <input v-model="question.type" id="type_pre" value="pre" name="image" type="radio" class="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500">
                                    <label for="type_pre" class="ml-3 block text-sm font-medium text-gray-700">image</label>
                                  </div>
                            
                                  <div class="flex items-center">
                                    <input v-model="question.type" id="type_post" value="post" name="video" type="radio" class="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500">
                                    <label for="type_post" class="ml-3 block text-sm font-medium text-gray-700">video</label>
                                  </div>
        
                                </div>
                              </fieldset>
                            </div>

                            <div class="pb-3">
                              <div class="block text-base font-bold text-gray-900">โจทย์</div>
                              <textarea
                              v-if="question && question.detail" 
                              v-model="question.detail" 
                              @focus="inputFocusHandler"
                              rows="3" 
                              cols="20" 
                              class="mt-1 block w-full rounded-sm border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm">
                              </textarea>
                            </div>
                          </div>

                          <div class="block text-base font-bold text-gray-900">คำตอบ</div>

                          <template v-for="(answer) in question.answers" :key="answer._id">
                            <div class="col-span-2 flex items-center">
                              <input v-model="question.correct" v-if="(question.correct===answer._id)" :id="answer._id" :name="question._id" :value="answer._id" type="radio" checked class="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500">
                              <input v-model="question.correct" v-else :id="answer._id" :name="question._id" :value="answer._id" type="radio" class="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500">
                              <label for="name" class="w-full block text-base font-medium text-gray-900 ml-2">
                                <input
                                  v-model="answer.detail"
                                  @focus="inputFocusHandler"
                                  type="text"
                                  autocomplete="detail"
                                  class="mt-1 block w-full rounded-sm border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm"
                                />
                              </label>
                              <button @click="deleteAnswer(answer._id)" class="p-2 text-gray-600 hover:text-red-600 focus:outline-none">
                                <font-awesome-icon :icon="['fas', 'trash']" class="text-lg" />
                              </button>
                            </div>
                          </template>
                          
                        </div>

                        <div class="bg-gray-50 border-t border-gray-200 p-2 text-right flex justify-between">

                          <button 
                          @click="handleButtonClick(question)"
                          type="button" 
                          class="border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">
                          <font-awesome-icon :icon="['fas','trash']" class="text-gray-200 pr-2"/> ลบ
                          </button>

                          <div>
                            <button 
                            @click.stop="addAnswer(question.answers.length,question._id)"
                            type="button" 
                            class="mr-1 border border-transparent bg-white shadow-sm border border-gray-400 px-4 py-2 text-sm font-medium text-gray-600 shadow-sm hover:bg-gray-100">
                            <font-awesome-icon :icon="['fas','plus']" class="text-gray-600 pr-2"/> เพิ่มคำตอบ
                            </button>
                    
                            <button 
                            @click.stop="updateAnswer(question)"
                            type="button" 
                            class="border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                            <font-awesome-icon :icon="['fas','save']" class="text-gray-200 pr-2"/> บันทึกข้อมูล 
                            </button>
                          </div>
                        </div>
    
                      </div>

                  </div>

                </div>
            </div>
            
            </div>
          </section>
  
        </div>
      </div>
    </div>
    
</template>