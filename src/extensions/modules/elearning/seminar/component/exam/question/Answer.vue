<script>


import {useRoute} 	from 'vue-router'
import storageManager from '@/plugins/storage';

export default {
  name: 'ContactUs',
  inject: ['apiServer'],
  data() {
    const route = useRoute();

    console.log("exam",this.$route.params.exam);
    console.log("question",this.$route.params.question);

    return {
      PageName: route.meta.title,
      PageIcon: route.meta.icon,
      PagePath: route.meta.path,
      ParentName: route.meta.parent,
      ParentPage: route.meta.page,
      accessSession: [],
      exam: this.$route.params.id,
      activeBlock: false,
      schoolData: [],
      qustionData: [],
      answerList: [],
      values: {},
      loading_sources: true,
      answerCounter: '',
      dataItem: this.$route.params.id,
      examID: this.$route.params.exam,
      questionID: this.$route.params.question,
      accessToken:storageManager.get('session','token'),
      login:storageManager.get('session','login')
    }
  },
  components: {
  },
  methods: {
    sort() {
      this.answerList = this.answerList.sort((a, b) => a.order - b.order)
    },
    async getData() {
        if(this.login) {
            try {
              //console.log("Auth : Course List : ",ls.get('auth'));
              this.loading_sources  = false;
              const resAPI          = await fetch("https://asia-southeast2-elearning-6871c.cloudfunctions.net/exams/getFullQuestion/" + this.examID + "/" + this.questionID + "/false", {
                method: 'GET',
                headers: {'Content-Type': 'application/json','Authorization': 'Bearer ' + this.accessToken},
              });
              const questionReturn  = await resAPI.json();
              this.qustionData      = questionReturn.data.questionInfo
              this.answerList       = questionReturn.data.answerInfos
              
              this.answerCounter    = questionReturn.data.answerInfos.length
              
              for (var key of Object.keys(this.answerList)) {
                console.log(key + " -> " + this.answerList[key].id)
                this.values[this.answerList[key].id] = this.answerList[key].detail
              }
              console.log(this.answerList);
              this.sort()
              this.loading_sources  = true;
            } catch (error) {
              console.log(error)
            }
        }
    },
    async addAnswerData() {
        if(this.login) {
            try {
                this.activeBlock = true
                const accessToken   = storageManager.get('session','token')
                const callApi   = await fetch("https://asia-southeast2-elearning-6871c.cloudfunctions.net/exams/answers/" + this.examID + "/" + this.questionID, {
                  method: 'POST',
                  headers: {'Content-Type': 'application/json','Authorization': 'Bearer ' + accessToken},
                  body: JSON.stringify({
                    questionId:this.questionID,
                    order: ('0' + (this.answerCounter++)).slice(-2) 
                  })
                });
                const finalRes   = await callApi.json();

                if(finalRes.success) {
                  console.log(finalRes);
                  const answerReturn   = await this.getData();
                  console.log(answerReturn);
                  this.activeBlock = false
                }
            } catch (error) {
            console.log(error)
            }
        }
    },
    async saveAllAnswer() {
        if(this.login) {
            try {
              this.answerList.forEach(element => {
                console.log("Answer",element.id);
                console.log(element.id + " -> " + this.values[element.id])
                this.updateAnswerData(element.id)
              });
            } catch (error) {
            console.log(error)
            }
        }
    },
    async updateAnswerData(id) {
        if(this.login) {
            try {
              //console.log(id + " -> " + this.values[id])
              const accessToken   = storageManager.get('session','token')
              this.activeBlock = true
              const callApi   = await fetch("https://asia-southeast2-elearning-6871c.cloudfunctions.net/exams/answers/" + this.examID + "/" + this.questionID + "/" + id, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json','Authorization': 'Bearer ' + accessToken},
                body: JSON.stringify({
                  "detail":this.values[id]
                })
              });
              const finalRes   = await callApi.json();
              if(finalRes.success) {
                  this.activeBlock = false
              }
              console.log(finalRes)
            } catch (error) {
            console.log(error)
            }
        }
    },
    async correctAnswerData(id) {
        if(this.login) {
            try {
              this.activeBlock = true
              console.log(id + " -> " + this.values[id])
              const accessToken   = storageManager.get('session','token')
              const callApi   = await fetch("https://asia-southeast2-elearning-6871c.cloudfunctions.net/exams/answers/setTrue/" + this.examID + "/" + this.questionID + "/" + id, {
                method: 'POST',
                headers: {'Content-Type': 'application/json','Authorization': 'Bearer ' + accessToken},
              });
              const finalRes   = await callApi.json();

              if(finalRes.success) {
                  this.activeBlock = false
                  console.log(finalRes);
                  const answerReturn   = await this.getData();
                  console.log(answerReturn);
                  //this.current_question = question_id;
                  //window.location.href = "/lesson/detail/" + this.dataItem
              }
              
            } catch (error) {
            console.log(error)
            }
        }
    },
    async incorrectAnswerData(id) {
        if(this.login) {
            try {
              console.log(id + " -> " + this.values[id])
              const accessToken   = storageManager.get('session','token')
              const callApi   = await fetch("https://asia-southeast2-elearning-6871c.cloudfunctions.net/exams/answers/setFalse/" + this.examID + "/" + this.questionID + "/" + id, {
                method: 'POST',
                headers: {'Content-Type': 'application/json','Authorization': 'Bearer ' + accessToken},
              });
              const finalRes   = await callApi.json();

              if(finalRes.success) {
                  console.log(finalRes);
                  const answerReturn   = await this.getData();
                  console.log(answerReturn);
                  //this.current_question = question_id;
                  //window.location.href = "/lesson/detail/" + this.dataItem
              }
              
            } catch (error) {
            console.log(error)
            }
        }
    },
    async deleteAnswer(exam,question,answer) {
        if(this.login) {
          try {
            console.log("exam",exam);
            console.log("question",question);
            console.log("answer",answer);
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
                this.confirmDeleteAnswer(exam,question,answer);
              } else {
                console.log("Cancel");
              }
            });
          } catch (error) {
            console.log(error)
          }
        }
      },
      async confirmDeleteAnswer(exam,question,answer) {
        if(this.login) {
          try {
            const resAPI = await fetch("https://asia-southeast2-elearning-6871c.cloudfunctions.net/exams/answers/" + exam + "/" + question + "/" + answer , {
              method: 'DELETE',
              headers: {'Content-Type': 'application/json','Authorization': 'Bearer ' + this.accessToken},
            });
            const finalRes   = await resAPI.json();
            if(finalRes.success) {
              const answerReturn   = await this.getData();
              console.log("answerReturn",answerReturn);
            }
          } catch (error) {
            console.log(error)
          }
        }
      },
      onChange(event) {
        var optionText = event.target.value;
        console.log(optionText);
        /*
        for (var key of Object.keys(this.answerList)) {
          this.incorrectAnswerData(this.answerList[key].id);
        }*/
        this.correctAnswerData(optionText);
      }
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

                <section aria-labelledby="payment-details-heading">

                  <div class="divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow mb-8">
                    <div class="px-4 py-5 sm:px-6">
                      <h2 id="payment-details-heading" class="text-lg font-bold leading-6 text-gray-900">โจทย์</h2>
                      <p class="mt-1 text-sm text-gray-500">เพิ่มคำตอบด้วยการกดปุ่ม เพิ่มตัวเลือก กรอกคำตอบและบันทึกข้อมูล</p>
                    </div>

                    <div class="px-4 py-5 sm:p-6">
                      <div v-html="qustionData.detail"></div>
                    </div>

                  </div>

                </section>

                <section aria-labelledby="payment-details-heading" class="relative pt-4" :data-content="'กำลังติดต่อฐานข้อมูล กรุณารอสักครู่.....'" :class="[(activeBlock?'isblock' : 'isunblock')]">


                    <div class="divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow mb-8">
                      <div class="px-4 py-5 sm:px-6 relative">
                        <h2 id="payment-details-heading" class="text-lg font-bold leading-6 text-gray-900">คำตอบ : {{answerCounter}}</h2>
                        <span class="absolute top-3 right-3">
                          <button 
                          @click="addAnswerData"
                          type="button" 
                          class="ml-3 inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                          <font-awesome-icon :icon="['fas','square-plus']" class="text-gray-200 pr-3"/> เพิ่มคำตอบ 
                          </button>
                        </span>
                      </div>

                      <div class="px-4 py-5 sm:p-6">
                        <div v-for="(answer) in answerList" :key="answer.id" class="col-span-4 sm:col-span-6">
                          <div class="col-span-4 sm:col-span-2 pb-4 border-dashed border-[1px] p-4 mb-3">

                              <form @submit.prevent="updateAnswerData(answer.id)">

                                <div class="mt-1 flex rounded-md shadow-sm">
                                  <span class="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm"><div class="flex items-center" v-if="answer.isTrueAnswer">
                                    <input :id="answer.id" name="isTrueAnswer" type="radio" class="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500" :value="answer.id" @change="onChange($event)" checked>
                                    <label :for="answer.id" class="ml-3 block text-sm font-medium text-gray-700">คำตอบที่ถูก</label>
                                  </div>

                                  <div class="flex items-center" v-if="!answer.isTrueAnswer">
                                    <input :id="answer.id" name="isTrueAnswer" type="radio" class="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500" :value="answer.id" @change="onChange($event)">
                                    <label :for="answer.id" class="ml-3 block text-sm font-medium text-gray-700">คำตอบที่ถูก</label>
                                  </div></span>
                                  <input 
                                  v-model="values[answer.id]"
                                  type="text" :name="answer.id" :id="answer.id" :autocomplete="answer.id" class="block w-full min-w-0 flex-1 rounded-none rounded-r-md border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm">
                                </div>
                                
                                <div class="mt-3">
                                    <div class="flex items-center">
                                      <button 
                                      @click="updateAnswerData(answer.id)"
                                      type="button" 
                                      class="ml-2 mr-2 rounded-md border border-transparent bg-indigo-600 px-2 py-1 text-xs font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                                      <font-awesome-icon :icon="['fas','save']" class="text-gray-200 pr-2"/> บันทึก
                                      </button>
                                      <button 
                                      @click="deleteAnswer(this.examID, this.questionID, answer.id)"
                                      type="button" 
                                      class="rounded-md border border-transparent bg-gray-800 px-2 py-1 text-xs font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                                      <font-awesome-icon :icon="['fas','trash']" class="text-gray-200 pr-2"/> ลบ 
                                      </button>
                                    </div>
                                </div>
                              </form>

                          </div>

                        </div>
                      </div>
                      <div class="bg-gray-50 px-4 py-4 sm:px-6 text-right">

                        <button
                        @click="$router.push('/lesson/exam/detail/' + this.examID)"
                        type="button" 
                        class="inline-flex items-center rounded-md border border-gray-300 bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                        ยกเลิก
                        </button>
  
                        <button
                        @click="saveAllAnswer"
                        type="button" 
                        class="ml-3 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                        <font-awesome-icon :icon="['fas','save']" class="pr-2 pl-2"/>บันทึกข้อมูล
                        </button>
  
                      </div>
                    </div>
                </section>
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