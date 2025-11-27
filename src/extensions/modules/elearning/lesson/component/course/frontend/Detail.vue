<script>
//import {useTitle} 	from 'vue-page-title';
//import {useRoute} 	from 'vue-router'
import storageManager from '@/plugins/storage';
import convertUtils from "@/plugins/convertUtils";
import LoginPopup from '@/utils/LoginPopup.vue';
//import Review from '@/utils/Review.vue';
import deviceUtils from "@/plugins/DeviceUtils";
import Form from '@/interface/template/BuilderRender.vue';
import Playlist from './Playlist.vue';
import Loader from '@/interface/template/Loader.vue';

import SurveyResult from '../resource/SurveyResult.vue';

import CertOwnerSelector from '../resource/CertOwnerSelector.vue'; // Adjust the path as needed



//import PromptPayQRCode from '../resource/PromptPayQRCode.vue';
//import QRCodeReader from '../resource/QRCodeReader.vue';


import requestClient from '@/plugins/requestClient';
const Request = new requestClient(false);

import debug from '@/plugins/Logger.js';

const statusArray = [
  { name: 'pending', label: 'รอเรียน', styleClass: 'bg-gray-300 text-gray-600', icon: 'hourglass-start' },
  { name: 'processing', label: 'กำลังเรียน', styleClass: 'bg-yellow-300 text-yellow-800', icon: 'spinner' },
  { name: 'complete', label: 'เรียนจบแล้ว', styleClass: 'bg-green-300 text-green-800', icon: 'check' },
];

export default {
	name: 'Lesson Detail',
	components: {
    LoginPopup,
    Playlist,
    Loader,
    SurveyResult,
    CertOwnerSelector,
    //PromptPayQRCode,
    //QRCodeReader,
    //Review,
    Form
	},
	data() {
		return {
      defaultCoverUrl: 'https://vue-project.sgp1.digitaloceanspaces.com/default-coverjpg.jpg',

      uniqueVisitors: null,
      pageViewsPerDay: null,
      pageViewsPerWeek: null,
      pageViewsPerMonth: null,

      login: storageManager.get('session','login'),
      configs: storageManager.get('configs'),
      session: storageManager.get('session'),
      dataItem: this.$route.params.id,
      enroll:storageManager.get('session','enroll'),
      deviceType: deviceUtils.deviceDetect(),
      playOption:'step',
      certification:null,
      exam:[],
      lesson:[],
      players:[],
      surveyData:[],
      surveyResults: [],
      scoreItemLabels: [],
      enrollData:[],
      userSubmit:[],
      isModalOpen:false,
      playerDataStatus : null,
      onsite:false,
      onsiteForm:null,
      loadedForm:false,
      certOwnerType: 'personal',
		}
	},
  watch: {
    'lesson.type'(newType) {
      this.onsite = newType === 'onsite';
    }
  },
	methods: {
    checkDueDate(date) {
      const timeZoneOffset = 7 * 60; // Thailand is GMT+7, in minutes
      // Convert posttestDate to Date object in UTC and adjust for Thailand timezone
      const dueDate = new Date(date);
      const dueDateInThailand = new Date(dueDate.getUTCFullYear(), dueDate.getUTCMonth(), dueDate.getUTCDate(), dueDate.getUTCHours(), dueDate.getUTCMinutes() + timeZoneOffset);
      
      // Now in UTC adjusted for Thailand timezone
      const now = new Date();
      const nowInThailand = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes() + timeZoneOffset);
      
      return nowInThailand < dueDateInThailand;
    },
    async handleDataFromChild(data) {

      debug.slack("*handleDataFromChild*",data.analytics);
      
      this.groupedPlayers = data;
      this.playerDataStatus = true;

      if (this.loggedInComputed.enrollAccess(this.dataItem)) {
        await this.getEnrollData();
        /*
        // Assuming this.enrollData.analytics is already the latest or fetched data
        const currentAnalytics = this.enrollData.analytics;
        //const currentAnalytics = data.analytics;

        // Construct updated analytics by merging current with new data for pre and post
        const updatedAnalytics = {
          ...currentAnalytics,
          pre: data.analytics.pre,  // Update pre
          post: data.analytics.post  // Update post
        };

        // Making a PUT request to update the server state
        const enroll2API = await Request.PUT(`enroll/${this.enrollData._id}`, {
          data: { analytics: updatedAnalytics },
          options: {},
        }, this.configs.key);

        if (enroll2API.status !== 200) {
          debug.log("Failed to update enrollment data");
        }
        */
      }
    },


    async getEnrollData() {
      try {
        const resAPIEnroll = await Request.POST('enroll/query', {
          method: 'find',
          args: [{ $and: [{ courseID: this.dataItem, userID: this.session.userID }] }]
        }, this.configs.key, true);

        if (resAPIEnroll.status !== 200) {
          throw new Error(`Failed to fetch enroll data from API`);
        }
        const enrollReturn = resAPIEnroll.data[0];
        this.enrollData = enrollReturn;
        //debug.slack(this.enrollData);
      } catch (error) {
        console.error(error);
      }
    },
    stripHtmlTags(html) {
      const tempElement = document.createElement("div");
      tempElement.innerHTML = html;
      return tempElement.textContent || tempElement.innerText || "";
    },
    handleLoginSuccess() {
      debug.log("Login Success");
    },
    getStatus(status) {
      const statusObj = statusArray.find(item => item.name === status);
      if (statusObj) {
        return `<p class="inline-flex rounded-full px-2 text-xs font-semibold leading-5 capitalize ${statusObj.styleClass}">
        <i class="fa fa-${statusObj.icon} mr-1 mt-1"></i>${statusObj.label}
        </p>`;
      }
      return '';
    },
    checkExam(type) {
      return this.exam.some(item => item.type === type);
    },
    formatSeconds(seconds) {
      return convertUtils.secondsToTime(seconds);
    },
    formatThaidate(date) {
      return convertUtils.toThaiDatetime(date);
    },
    formatPrice(regular,sale) {
      return convertUtils.formatPrice(regular,sale);
    },
    getFilteredExams(type) {
      if (this.exam && this.exam.length) {
        return this.exam.filter((exam) => exam.type === type);
      }
      return [];
    },
    async getData() {
      try {
        this.loading_sources = false;
        const responseHost   = await Request.GET(`course/${this.dataItem}`, this.configs.key, true);
        if(responseHost.status === 200) {
          this.lesson     = responseHost.data;
          this.playOption = this.lesson.display
          if (typeof this.lesson.visibility === 'undefined') {
            this.lesson.visibility = true;
          }
          this.playerDataStatus = this.lesson && this.lesson.type !== 'onsite' ? false : true;
          this.onsite = (this.lesson?.type ?? '') === 'onsite';

          console.log("lesson 4",this.lesson.type);

          console.log("getCertification");
          const certificationData = await this.getCertification();

          console.log("getCertification 3");

          if (Array.isArray(certificationData) && certificationData.length > 0) {
            // If the result is an array and has at least one item, use the last item
            this.certification = certificationData[certificationData.length - 1];
          } else {
            // If not an array or an empty array, use the data as is
            this.certification = certificationData;
          }
          console.log("getCertification 4");
          

          console.log("onsite",this.lesson.type);

          if(this.lesson.type==='onsite') {
            console.log("onsite X");
            if(this.lesson.formID) {
              console.log("getSubmitForm");
              this.userSubmit = await this.getSubmitForm();
              this.onsiteForm = this.lesson.formID
              this.loadedForm = true
            } else {
              console.log("onsite Y");
              const formID    = await this.getForm();

              console.log("getSubmitForm");
              this.userSubmit = await this.getSubmitForm();

              console.log("userSubmit",this.userSubmit);
              this.onsiteForm = formID
              this.loadedForm = true
            }
          }
          else
          {
            console.log("not onsite 2");
          }
          // Define certOwnerType based on certification data
          this.certOwnerType = this.certification.owner_type || 'personal';
          //this.lesson.scoreDate="2024-06-23T02:00:00.000Z";
          this.$setPageTitle("หลักสูตร " + this.lesson.name);
        }
      } catch (error) {
        debug.log(error)
      }
    },
    async getCertification() {
      try {
        const requestData = {
          method: 'find',
          args: [
          {
            $and: [
              { userID: this.session.userID },
              { courseID: this.lesson._id }
            ]
          }
        ]
        };

        const resAPISurvey = await Request.POST('certification/query', requestData, this.configs.key);

        if (resAPISurvey.status !== 200) {
          console.log("getCertification 2");
          throw new Error(`Failed to fetch player data from API`);
        }
        return resAPISurvey.data[0]

      } catch (error) {
        console.error('An error occurred while fetching player data:', error);
        throw error;
      }
    },
    async getForm() {
      try {
        const requestData = {
          method: 'find',
          args: [{ $and: [{ owner: this.configs.siteID, type:'form', action:'course', default:true }] }],
        };

        const resAPISurvey = await Request.POST('post/query', requestData, this.configs.key);

        if (resAPISurvey.status !== 200) {
          throw new Error(`Failed to fetch player data from API`);
        }
        return resAPISurvey.data[0]._id

      } catch (error) {
        console.error('An error occurred while fetching player data:', error);
        throw error;
      }
    },
    async getSubmitForm(formID) {
      try {
        const requestData = {
          method: 'find',
          args: [{ $and: [{ courseID: this.dataItem, userID:this.session.userID, formID:formID }] }],
        };

        console.log("courseID",this.dataItem);
        console.log("userID",this.session.userID);
        console.log("formID",formID);


        const resAPISurvey = await Request.POST('form/query', requestData, this.configs.key);

        if (resAPISurvey.status !== 200) {
          throw new Error(`Failed to fetch player data from API`);
        }
        return resAPISurvey.data[0]

      } catch (error) {
        console.error('An error occurred while fetching player data:', error);
        throw error;
      }
    },
    async enrollCourse(id) {
      let finalRes = null;
      if (this.login) {
        try {
          this.activeBlock = true;

          // Create an order
          const orderAPI = await fetch("https://gateway.cloudrestfulapi.com/api/order/", {
            method: 'POST',
            headers: {'Content-Type': 'application/json', 'client-token-key': this.configs.key},
            body: JSON.stringify({
              data: {
                "userID": this.session.userID,
                "courseID": id,
                "unit": this.configs.siteID,
              },
              options: {}
            })
          });

          const orderRes = await orderAPI.json();
          debug.log("orderRes", orderRes);

          if (orderAPI.status === 200) {
            // Proceed with enrolling
            const enrollAPI = await fetch("https://gateway.cloudrestfulapi.com/api/enroll/", {
              method: 'POST',
              headers: {'Content-Type': 'application/json', 'client-token-key': this.configs.key},
              body: JSON.stringify({
                data: {
                  "userID": this.session.userID,
                  "courseID": id,
                  "orderID": orderRes._id, // Include the order ID in the enroll data
                  "unit": this.configs.siteID,
                },
                options: {}
              })
            });

            finalRes = await enrollAPI.json();
            debug.log("finalRes", finalRes);

            if (enrollAPI.status === 200) {
              this.activeBlock = false;

              /*
              Make No Add Enroll 
              await fetch("https://gateway.cloudrestfulapi.com/api/course/" + id + "/enroll", {
                method: 'POST',
                headers: {'Content-Type': 'application/json', 'client-token-key': this.configs.key},
                body: JSON.stringify({
                  action: "add",
                  element: finalRes._id,
                  type: "string",
                })
              });

              */

              const queryAPI = await fetch("https://gateway.cloudrestfulapi.com/api/enroll/query", {
                method: 'POST',
                headers: {'Content-Type': 'application/json', 'client-token-key': this.configs.key},
                body: JSON.stringify({
                  method: 'find',
                  hidden:  ['userID'],
                  args: [
                    {
                      $and: [
                        { userID: this.session.userID }
                      ]
                    }
                  ]
                })
              });

              const getEnroll  = await queryAPI.json();

              if (queryAPI.status === 200) {
                const session = {
                  enroll: getEnroll,
                };
                storageManager.update('session', session);
                debug.log("session", session);

                const groupedPlayers  = this.groupedPlayers.allItems;
                const firstPlayer     = groupedPlayers.find(item => item.type !== 'folder');
                let firstrun = "";
                if (firstPlayer.canPlay === false) {
                  debug.log("ยังไม่ได้สอบก่อนเรียน");
                  debug.log(this.getFilteredExams('pre'))
                  const preExam = this.getFilteredExams('pre');
                  firstrun = "/lesson/assessment/" + id + "/" + preExam[0]._id

                }
                else {
                  debug.log("ไม่มีแบบทดสอบก่อนเรียน");
                  firstrun = '/lesson/play/' + id + '/' + firstPlayer._id
                }

                this.$swal({
                  icon: 'success',
                  title: 'ลงทะเบียนหลักสูตรเรียบร้อยแล้ว',
                  text: 'ระบบกำลังดึงข้อมูลหลักสูตรของคุณ กรุณารอสักครู่',
                  showCancelButton: false,
                  confirmButtonText: 'OK',
                }).then(() => {
                  this.$router.push(firstrun);
                });
              }
            }
          }
        } catch (error) {
          debug.log(error)
        }
      }
    },
    orderCourse() {
      this.$router.push('/lesson/subscribe/' + this.dataItem);
    },
    async saveSurveyResult(result) {
      this.surveyResults = result;
      debug.log("Survey Result Saved:", result);

      // Fetch Enroll Data
      try {
        const resAPIESubmission = await Request.POST('survey_submission', {
          data: {
            "userId": this.session.userID,
            "courseId": this.dataItem,
            "surveyId": this.lesson.surveyId,
            "survey": result,
          }
        }, this.configs.key);

        if (resAPIESubmission.status !== 200) {
          throw new Error(`Failed to fetch enroll data from API`);
        }

        const submissionReturn = resAPIESubmission.data;
        this.closeModal()
        this.assignCertification()
        debug.log("submissionReturn",submissionReturn);
        // Handle submissionReturn if needed
      } catch (error) {
        console.error("Error while fetching enroll data:", error);
        // Handle the error appropriately
      }
    },
    closeModal() {
      this.isModalOpen = false; // Close the modal
      // Enable body scroll
      document.body.style.overflow = 'auto';
    },
    async assignCertification() {
      if(this.login) {
        try {
          // Fetch Enroll Data
          const resAPISubmission = await Request.POST('survey_submission/query', {
              method: 'find',
              args: [{ $and: [{ courseId: this.dataItem, userId: this.session.userID }] }]
          }, this.configs.key);
          if (resAPISubmission.status !== 200) {
              throw new Error(`Failed to fetch enroll data from API`);
          }
          const submissionReturn = resAPISubmission.data;

          if(this.lesson.survey==="yes" && Array.isArray(submissionReturn) && submissionReturn.length === 0) {

            let surveyId = null

            if (this.lesson.surveyId === undefined || this.lesson.surveyId === null) {
              const resAPIEnroll = await Request.POST('survey/query', {
                method: 'find',
                args: [{ $and: [{ unit: this.session.current._id, default: true }] }]
              }, this.configs.key);
              if (resAPIEnroll.status !== 200) {
                throw new Error(`Failed to fetch enroll data from API`);
              }
              const surveyReturn = resAPIEnroll.data;
              this.lesson.surveyId = surveyId
              surveyId = surveyReturn[0]._id
            } else {
              surveyId = this.lesson.surveyId
            }

            //Show Survey
            const responseSurvey = await Request.GET(`survey/${surveyId}`, this.configs.key);
            if (responseSurvey.status !== 200) {
              throw new Error(`Failed to fetch course data from API`);
            }
            this.surveyData       = responseSurvey.data;
            this.scoreItemLabels  = this.surveyData.label.slice();
            this.isModalOpen      = true;
            document.body.style.overflow = 'hidden';

            debug.log(this.surveyData);

          } else {
            if(!this.certification) {
            this.activeBlock = true
            const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/certification/", {
              method: 'POST',
              headers: {'Content-Type': 'application/json','client-token-key':this.configs.key},
              body: JSON.stringify({
                data: {
                  "userID":this.session.userID,
                  "courseID":this.dataItem,
                  "course":this.lesson,
                  "user":this.session.user,
                  "unit":this.configs.siteID,
                  "asset":this.configs.siteName,
                },
                options: {}
              })
            });
            const certReturn = await resAPI.json();

            if(resAPI.status===200) {
              this.activeBlock      = false
              this.certification    = certReturn
              if(this.lesson.cert_owner_corperate) {
                //location.reload()
              } else {
                window.location.href = '/lesson/certification/'+ this.certification._id
                debug.log("Assign Certification Complete");
              }
            }
          } else {
            window.location.href = '/lesson/certification/'+ this.certification._id
            debug.log("Open Certification",this.certification);
          }
          }
        } catch (error) {
          debug.log(error)
        }
      }
    },
	},
  async mounted () {
    try {
      await this.getData();
    } catch (error) {
      debug.log(Error);
    }
  },
  setup() {},
  computed: {
    loggedInComputed() {
      const login   = storageManager.get('session', 'login');
      const enroll  = storageManager.get('session', 'enroll');

      if (login) {
        return {
          enrollAccess(courseId) {
            if (!enroll || enroll.length === 0) {
              return false;
            }
            const course = enroll.find(item => item.courseID === courseId);
            return !!course;
          }
        };
      } else {
        return {
          enrollAccess() {
            return false;
          }
        };
      }
    },
  },
};
</script> 


<template>
  <templete v-if="this.lesson && this.lesson.type !== 'onsite'">
    <div v-if="!playerDataStatus" class="text-center"><Loader/></div>
  </templete>

  <div v-if="isModalOpen" class="fixed inset-0 flex items-center justify-center z-50">
    <div class="bg-black opacity-50 fixed inset-0"></div>
    <div class="bg-white rounded shadow-lg w-full md:w-3/5 relative">
      <div class="bg-blue-500 text-white px-4 py-2 rounded-t flex justify-between">
        <h2 class="text-lg font-semibold">{{ surveyData.name }}</h2>
        <button @click="closeModal" class="text-white hover:text-red-500 transition">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
      <div class="p-4 overflow-y-auto max-h-[95vh]">
        <SurveyResult
          :surveyData="surveyData"
          :scoreItemLabels="scoreItemLabels"
          :surveyResults="surveyResults"
          @save-result="saveSurveyResult"
        />
      </div>
    </div>
  </div>


  <div class="bg-gray-100">

    <div v-if="this.deviceType==='desktop'" class="mx-auto max-w-2xl px-4 pt-3 pb-3 sm:px-18 sm:pt-3 sm:pb-3 lg:grid lg:max-w-7xl lg:grid-cols-2 lg:gap-x-4 ">
        <div class="lg:flex lg:items-center lg:justify-between">
            <div class="min-w-0 flex-1">
                <nav class="flex" aria-label="Breadcrumb">
                    <ol role="list" class="flex items-center space-x-4">
                      <li>
                        <div>
                          <router-link :to="'/'" class="text-gray-400 hover:text-gray-500">
                            <svg class="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fill-rule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clip-rule="evenodd" />
                              </svg>
                              <span class="sr-only">Home</span>
                          </router-link>
                        </div>
                      </li>

                      <template v-if="this.lesson.standalone">
                        <li>
                          <div class="flex items-center">
                            <svg class="h-5 w-5 flex-shrink-0 text-gray-300" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                              <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                            </svg>
                            <router-link :to="'/user/profile'" class="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">หน้าหลัก</router-link>
                          </div>
                        </li>
                      </template>
                      <template v-else>
                        <li>
                          <div class="flex items-center">
                            <svg class="h-5 w-5 flex-shrink-0 text-gray-300" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                              <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                            </svg>
                            <router-link :to="session.mode === 'bypass' ? '/user/employee' : '/lesson/home'" class="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">หลักสูตร</router-link>
                          </div>
                        </li>
                      </template>
                  
                      <li>
                        <div class="flex items-center">
                          <svg class="h-5 w-5 flex-shrink-0 text-gray-300" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                            <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                          </svg>
                          <span class="ml-4 text-sm font-bold text-gray-600 hover:text-gray-700">{{this.lesson.name}}</span>
                        </div>
                      </li>

                    </ol>
                </nav>
            </div>
        </div>
      </div>

      <div v-if="this.deviceType==='mobile'" class="mx-auto max-w-2xl px-4 pt-3 pb-3 sm:px-18 sm:pt-3 sm:pb-3 lg:grid lg:max-w-7xl lg:grid-cols-2 lg:gap-x-4 ">
        <div class="lg:flex lg:items-center lg:justify-between">

          <template v-if="this.lesson.standalone">
            <router-link :to="'/user/profile'" class="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700"><font-awesome-icon :icon="['fas', 'chevron-left']" /> ย้อนกลับ</router-link>
          </template>
          <template v-else>
            <router-link :to="'/lesson/home'" class="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700"><font-awesome-icon :icon="['fas', 'chevron-left']" /> ย้อนกลับ</router-link>
          </template>
          
          
        </div>
      </div>

      <!-- Product -->
      <div class="bg-white border-t border-gray-200">

        <div v-if="playerDataStatus" class="mx-auto max-w-2xl px-4 pb-12 pt-8 sm:px-6 sm:pb-12 sm:pt-6 lg:grid lg:max-w-7xl lg:grid-cols-2 lg:gap-x-8 lg:px-8">

          <div class="mt-5 lg:col-span-2">
            <h1 class="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">{{this.lesson.name}}</h1>
          </div>

          <div class="mt-5">
            
            <section aria-labelledby="information-heading" class="mt-4 mb-4">
              <h2 id="information-heading" class="sr-only">Product information</h2>
  
              <div class="flex items-center">

                <p class="text-lg text-gray-900 sm:text-xl" v-html="formatPrice(this.lesson.regular_price, this.lesson.sale_price)"></p>
  
                <!-- 
                  <div class="ml-4 border-l border-gray-300 pl-4">
                    <h2 class="sr-only">Reviews</h2>
                    <div class="flex items-center">
                      <div>
                        <div class="flex items-center">
                            <font-awesome-icon icon="star" class="text-yellow-400 h-5 w-5 flex-shrink-0"/>
                            <font-awesome-icon icon="star" class="text-yellow-400 h-5 w-5 flex-shrink-0"/>
                            <font-awesome-icon icon="star" class="text-yellow-400 h-5 w-5 flex-shrink-0"/>
                            <font-awesome-icon icon="star" class="text-yellow-400 h-5 w-5 flex-shrink-0"/>
                            <font-awesome-icon icon="star" class="text-gray-300 h-5 w-5 flex-shrink-0"/>
                        </div>
                        <p class="sr-only">4 out of 5 stars</p>
                      </div>
                      <p class="ml-2 text-sm text-gray-500">0 reviews</p>
                    </div>
                  </div> 
                -->
              </div>
  
              <div class="mt-4 space-y-6">
                <div class="text-base text-gray-500" v-if="this.lesson.short_description" v-html="this.lesson.short_description"></div>
                <div class="text-base text-gray-500" v-else v-html="this.lesson.description"></div>
              </div>
            
              <div class="mt-6 flex items-center">
                <font-awesome-icon class="h-5 w-5 flex-shrink-0 text-green-500" :icon="['fas', 'check']" />
                <p class="ml-2 text-sm text-gray-500">This course includes:</p>
              </div>
              
            </section>

            <section aria-labelledby="options-heading">

              <div class="">
                  <div class="mt-1 grid grid-cols-3 gap-1 sm:grid-cols-3">

                    <div class="relative block rounded-lg border border-gray-300 p-2 focus:outline-none">
                      <div class="flex items-center mb-1">
                        <span class="text-xl text-gray-500 mr-2">
                          <font-awesome-icon :icon="['fas', 'book']" />
                        </span>
                        <p class="text-sm font-semibold text-gray-900">เนื้อหาอัดแน่น</p>
                      </div>
                      <p class="text-sm text-gray-500">{{this.players.length}} บท / {{this.lesson.hours}} ชม. เต็ม</p>
                      <div class="pointer-events-none absolute -inset-px rounded-lg border-2" aria-hidden="true"></div>
                    </div>
                    
                    <div :class="{ 'opacity-30': !checkExam('post') }" class="relative block rounded-lg border border-gray-300 p-2 focus:outline-none">
                      <div class="flex items-center mb-1">
                        <span class="text-xl text-gray-500 mr-2">
                          <font-awesome-icon :icon="['fas', 'check-square']" />
                        </span>
                        <p class="text-sm font-semibold text-gray-900">ประเมินผลการเรียน</p>
                      </div>
                      <p class="text-sm text-gray-500">วัดผลการเรียน</p>
                      <div class="pointer-events-none absolute -inset-px rounded-lg border-2" aria-hidden="true"></div>
                    </div>

                    <div :class="{ 'opacity-30': this.lesson.certification === 'no' }" class="relative block rounded-lg border border-gray-300 p-2 focus:outline-none">
                      <div class="flex items-center mb-1">
                        <span class="text-xl text-gray-500 mr-2">
                          <font-awesome-icon :icon="['fas', 'certificate']" />
                        </span>
                        <p class="text-sm font-semibold text-gray-900">ใบประกาศ</p>
                      </div>
                      <p class="text-sm text-gray-500">รับใบประกาศเมื่อสอบผ่านเกณฑ์</p>
                      <div class="pointer-events-none absolute -inset-px rounded-lg border-2" aria-hidden="true"></div>
                    </div>
                  
                  </div>
              </div>
              
                <div class="mt-4">
                  <a href="#" class="group inline-flex text-sm text-gray-500 hover:text-gray-700">
                    <span>วิธีการลงทะเบียน ?</span>
                    <font-awesome-icon class="ml-2 h-4 w-4 flex-shrink-0 text-gray-400 group-hover:text-gray-500" :icon="['fas', 'question-circle']" />
                  </a>
                </div>

                <div v-if="this.lesson.type!='onsite'">
                  <div class="mt-5">

                    <template v-if="this.login">

                      <template v-if="loggedInComputed.enrollAccess(this.dataItem) && groupedPlayers">
                        
                        <button
                          type="button" 
                          class="flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50">
                          <span class="flex items-center">
                            <font-awesome-icon :icon="['fas', 'graduation-cap']" class="mr-5 w-6 h-6" />
                          </span>
                          <span class="text-left font-semibold">ลงทะเบียนแล้ว<br><p class="text-sm text-gray-100 font-normal">ความคืบหน้า <span class="font-semibold">{{ groupedPlayers.analytics.percent }} % </span>({{ groupedPlayers.analytics.message }})</p></span>
                        </button>

                        



                        <!-- <button v-if="groupedPlayers.analytics.certification.status" @click="assignCertification()"
                            :readonly="groupedPlayers.analytics.percent < 100"
                            :style="{ opacity: groupedPlayers.analytics.percent < 100 ? '0.3' : '1' }"
                            type="button"
                            class="flex w-full mt-5 items-center justify-center rounded-md border border-transparent bg-yellow-400 px-4 py-3 text-base font-medium text-black hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50">
                            <font-awesome-icon :icon="['fas', 'certificate']" class="mr-5 w-6 h-6" />
                            <span class="text-left font-semibold">ใบรับรอง (e-Certification)<br><p class="text-sm text-gray-500 font-normal">{{ this.certification.length ? 'เปิด' : 'สร้าง' }} ใบรับรองของคุณ</p></span>
                          </button>
                  
                        <button v-if="!groupedPlayers.analytics.certification.status"
                          type="button" 
                          :class="{
                            'opacity-50': true,
                            'cursor-not-allowed': true
                          }"
                          :disabled="groupedPlayers.analytics.percent < 100"
                          class="flex w-full mt-5 items-center justify-center rounded-md border border-transparent bg-gray-200 px-4 py-2 text-base font-medium text-black hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50">
                          <span class="flex items-center">
                            <font-awesome-icon :icon="['fas', 'certificate']" class="mr-5 w-6 h-6" />
                          </span>
                          <span class="text-left font-semibold">ใบรับรอง (e-Certification)<br><p class="text-sm text-gray-500 font-normal">{{ groupedPlayers.analytics.certification.message }}</p></span>
                        </button> -->

                        <template v-if="this.lesson.scoreDate && checkDueDate(this.lesson.scoreDate)">

                          <button 
                            :readonly="true"
                            :style="{ opacity:'0.3'}"
                            type="button"
                            class="flex w-full mt-5 items-center justify-center rounded-md border border-transparent bg-yellow-400 px-4 py-3 text-base font-medium text-black hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50">
                            <font-awesome-icon :icon="['fas', 'certificate']" class="mr-5 w-6 h-6" />
                            <span class="text-left font-semibold">ใบรับรอง (e-Certification)<br><p class="text-sm text-gray-500 font-normal">ประกาศผลสอบ {{formatThaidate(this.lesson.scoreDate)}} </p></span>
                          </button>

                        </template>

                        <template v-else >

                          <div :class="{
                            'cert-panel': lesson && lesson.cert_owner_corperate,
                            'mt-3': !(lesson && lesson.cert_owner_corperate)
                          }">

                            <template v-if="enrollData?.analytics?.retest && enrollData?.analytics?.retest?.score >= enrollData?.analytics?.retest?.measure">
                              <button
                                @click="assignCertification()"
                                type="button"
                                class="flex w-full items-center justify-center rounded-md border border-transparent bg-yellow-400 px-4 py-3 text-base font-medium text-black hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50">
                                <font-awesome-icon :icon="['fas', 'certificate']" class="mr-5 w-6 h-6" />
                                <span class="text-left font-semibold">ใบรับรอง (e-Certification)<br><p class="text-sm text-gray-500 font-normal">{{ this.certification ? 'เปิด' : 'สร้าง' }} ใบรับรองของคุณ</p></span>
                              </button>
                            </template>
                            <template v-else-if="enrollData?.analytics?.retest">
                              
                              <button v-if="!groupedPlayers.analytics.certification.status"
                                type="button" 
                                :class="{
                                  'opacity-50': true,
                                  'cursor-not-allowed': true
                                }"
                                :disabled="groupedPlayers.analytics.percent < 100"
                                class="flex w-full items-center justify-center rounded-md border border-transparent bg-gray-200 px-4 py-2 text-base font-medium text-black hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50">
                                <span class="flex items-center">
                                  <font-awesome-icon :icon="['fas', 'certificate']" class="mr-5 w-6 h-6" />
                                </span>
                                <span class="text-left font-semibold">ใบรับรอง (e-Certification)<br><p class="text-sm text-gray-500 font-normal">{{ groupedPlayers.analytics.certification.message }}</p></span>
                              </button>

                            </template>
                            <template v-else>

                              <button v-if="groupedPlayers.analytics.certification.status" 
                              @click="assignCertification()"
                              :readonly="groupedPlayers.analytics.percent < 100"
                              :style="{ opacity: groupedPlayers.analytics.percent < 100 ? '0.3' : '1' }"
                              type="button"
                              :class="{
                                'flex w-full items-center justify-center border border-transparent bg-yellow-400 px-4 py-3 text-base font-medium text-black hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50': true,
                                'rounded-md': !(this.certification && lesson.cert_owner_corperate),
                                'rounded-t-md': this.certification && lesson.cert_owner_corperate
                              }">
                              <font-awesome-icon :icon="['fas', 'certificate']" class="mr-5 w-6 h-6" />
                              <span class="text-left font-semibold">
                                ใบรับรอง (e-Certification)
                                <br>
                                <p class="text-sm text-gray-500 font-normal">{{ this.certification ? 'เปิด' : 'สร้าง' }} ใบรับรองของคุณ</p>
                              </span>
                            </button>
                            
                      
                              <button v-if="!groupedPlayers.analytics.certification.status"
                                type="button" 
                                :class="{
                                  'opacity-50': true,
                                  'cursor-not-allowed': true
                                }"
                                :disabled="groupedPlayers.analytics.percent < 100"
                                class="flex w-full items-center justify-center rounded-md border border-transparent bg-gray-200 px-4 py-2 text-base font-medium text-black hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50">
                                <span class="flex items-center">
                                  <font-awesome-icon :icon="['fas', 'certificate']" class="mr-5 w-6 h-6" />
                                </span>
                                <span class="text-left font-semibold">ใบรับรอง (e-Certification)<br><p class="text-sm text-gray-500 font-normal">{{ groupedPlayers.analytics.certification.message }}</p></span>
                              </button>
                            
                            </template>

                            <!-- Display panel if cert_owner_corperate is true -->
                            <div v-if="lesson && lesson.cert_owner_corperate" class="">
                              <!-- Use the CertOwnerSelector component -->
                                <CertOwnerSelector
                                v-if="certification"
                                v-model:certOwnerType="certOwnerType"
                                :certification="certification"
                                @edit="handleEdit"
                              />
                            </div>

                          </div>

                        </template>
                  
                      </template>

                      <template v-else>

                        <span v-if="!this.lesson.visibility">
                          <button
                            type="button"
                            class="flex w-full items-center justify-center rounded-md border border-transparent bg-gray-600 px-8 py-3 text-base font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50"
                          >
                          <font-awesome-icon class="ml-2 mr-2 h-4 w-4 flex-shrink-0 text-white group-hover:text-gray-500" :icon="['fas', 'lock']" />
                          หลักสูตรนี้เปิดลงทะเบียนแบบ Private เท่านั้น
                          </button>
                        </span>
                        
                        <span v-else>
                          <button
                          v-if="this.lesson.sale_price > 0 && !this.lesson.standalone"
                          @click="orderCourse()"
                          type="button"
                          class="flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50"
                          >
                          <font-awesome-icon class="ml-2 mr-2 h-4 w-4 flex-shrink-0 text-white group-hover:text-gray-500" :icon="['fas', 'shopping-cart']" />
                          สั่งซื้อ
                          </button>
                          <button
                          v-if="!this.lesson.standalone"
                            @click="enrollCourse(this.lesson._id)"
                            type="button"
                            class="flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50"
                          >
                            <font-awesome-icon class="ml-2 mr-2 h-4 w-4 flex-shrink-0 text-white group-hover:text-gray-500" :icon="['fas', 'play']" />
                            {{ session.mode === 'bypass' ? 'เริ่มเรียนหลักสูตรนี้' : 'ลงทะเบียนหลักสูตรนี้' }}
                          </button>
                        </span>

                      </template>
                      
                    </template>

                    <template v-else>

                      <LoginPopup @login-success="handleLoginSuccess" v-if="!this.lesson.standalone"/>

                    </template>
                    
                  </div>

                  

                  <div class="mt-6 text-center">
                    <a href="javascript:void(0);" class="group inline-flex text-base font-medium">
                      <font-awesome-icon class="mr-2 h-6 w-6 flex-shrink-0 text-gray-400 group-hover:text-gray-500" :icon="['fas', 'laptop']" />
                      <span class="text-gray-500 hover:text-gray-700">เรียนออนไลน์ ได้ทุกที่ ทุกเวลาตลอด 24 ชั่วโมง</span>
                    </a>
                  </div>

                </div>

            </section>
          </div>

          <div class="mt-10">
            <div class="lg:col-start-2 lg:row-span-2 lg:mt-0 lg:self-center">

              <figure class="mt-16">
                <img class="aspect-video rounded-xl bg-gray-50 object-cover"
                :src="lesson.cover || defaultCoverUrl"
                alt="">
              </figure>

            </div>
          </div>

        </div>

        <div class="mx-auto max-w-7xl sm:px-3 lg:px-4 pb-10">
          <div>
            <h3 class="text-lg font-bold text-blue-600">คำอธิบายรายวิชา</h3>
            <div class="text-md text-gray-500" v-if="this.lesson.description" v-html="this.lesson.description"></div>
          </div>
          <div>
            <h3 class="text-lg font-bold text-blue-600">วัตถุประสงค์</h3>
            <div class="text-md text-gray-500" v-if="this.lesson.objective" v-html="this.lesson.objective"></div>
          </div>
        </div>

      </div>

        <div class="bg-gray-100 py-6">

          <!-- <div class="flex items-center justify-center space-x-4 p-4">
            <div class="w-1/2 flex justify-center">
              <PromptPayQRCode
                :mobileNo="'0956528573'"
                :amount="10.0"
                message="Hello World!"
              />
            </div>
            <div class="w-1/2 flex justify-center">
              <QRCodeReader />
            </div>
          </div> -->

          <template v-if="this.lesson.type!='onsite'">
            <div class="mx-auto max-w-7xl sm:px-3 lg:px-4">

              <div class="mx-auto max-w-2xl px-2 py-3 sm:px-3 sm:py-3 lg:max-w-7xl lg:px-4">
                <section aria-labelledby="details-heading">
                  <div class="flex flex-col items-center text-center">
                    <h2 id="details-heading" class="text-2xl font-bold tracking-tight text-gray-900 sm:text-2xl">รายละเอียดเนื้อหา</h2>
                    <p class="mt-3 max-w-3xl text-lg text-gray-600">รายละเอียดเนื้อหาของหลักสูตรนี้ คุณต้องทำการเข้าเรียนตามลำดับแต่ละบทเรียน</p>
                  </div>
                </section>
              </div>

              <div class="overflow-hidden bg-white shadow sm:rounded-md">
                
                <Playlist 
                :dataItem="this.dataItem"
                :courseData="this.lesson" 
                :playerItem="null" 
                :playOption="this.playOption" 
                @data-fetched="handleDataFromChild"
                :debug="false"></Playlist>

              </div>
            </div>

          </template>

          <template v-else>

            <template v-if="this.login">

              <template v-if="userSubmit">
                {{onsite}}
                <div class="mx-auto max-w-7xl sm:px-3 lg:px-4">

                  <div class="mx-auto max-w-2xl px-2 py-3 sm:px-3 sm:py-3 lg:max-w-7xl lg:px-4">
                    <section aria-labelledby="details-heading">
                      <div class="flex flex-col items-center text-center">
                        <h2 id="details-heading" class="text-2xl font-bold tracking-tight text-gray-900 sm:text-2xl">แบบฟอร์มการลงทะเบียน</h2>
                        <p class="mt-3 max-w-3xl text-lg text-gray-600">คุณได้ทำการลงทะเบียนหลักสูตรนี้เรียบร้อยแล้ว ทีมงานจะทำการตรวจสอบข้อมูลและจะแจ้งการดำเนินการในขั้นตอนต่อไป</p>
                      </div>
                    </section>
                  </div>
    
                </div>
              </template>
              <template v-else>

                <div class="mx-auto max-w-7xl sm:px-3 lg:px-4">

                  <div class="mx-auto max-w-2xl px-2 py-3 sm:px-3 sm:py-3 lg:max-w-7xl lg:px-4">
                    <section aria-labelledby="details-heading">
                      <div class="flex flex-col items-center text-center">
                        <h2 id="details-heading" class="text-2xl font-bold tracking-tight text-gray-900 sm:text-2xl">แบบฟอร์มการลงทะเบียน</h2>
                        <p class="mt-3 max-w-3xl text-lg text-gray-600">แบบฟอร์มสำหรับลงทะเบียนหลักสูตรนี้</p>
                      </div>
                    </section>
                  </div>
    
                </div>

                <Form v-if="loadedForm" :dataItem="this.onsiteForm" :masterItem="this.lesson._id" :mode="'id'"/>
              </template>
            </template>

            <template v-else>
              <div class="mx-auto max-w-7xl sm:px-3 lg:px-4">

                <div class="mx-auto max-w-2xl px-2 py-3 sm:px-3 sm:py-3 lg:max-w-7xl lg:px-4">
                  <section aria-labelledby="details-heading">
                    <div class="flex flex-col items-center text-center">
                      <h2 id="details-heading" class="text-2xl font-bold tracking-tight text-gray-900 sm:text-2xl">แบบฟอร์มการลงทะเบียน</h2>
                      <p class="mt-3 max-w-3xl text-lg text-gray-600">หากคุณต้องการลงทะเบียนหลักสูตรนี้ ต้องเข้าสู่ระบบหรือสมัครสมาชิกใหม่ก่อนลงทะเบียน</p>
                      <LoginPopup @login-success="handleLoginSuccess"/>
                    </div>
                  </section>
                </div>
  
              </div>
              
            </template>

          </template>

        </div>

        <!-- <section aria-labelledby="reviews-heading" class="bg-white">
          <div class="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:grid lg:max-w-7xl lg:grid-cols-12 lg:gap-x-8 lg:px-8 lg:py-12">
            <Review/>
          </div>
        </section> -->
      
    </div>
</template>

<style scoped>
.title {
font-family: "Quicksand", "Source Sans Pro", -apple-system, BlinkMacSystemFont,
    "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
display: block;
font-weight: 400;
font-size: 100px;
color: #2E495E;
letter-spacing: 1px;
font-size: 6em;
}
.green {
color: #00C48D;
}

.subtitle {
font-weight: 300;
font-size: 3em;
color: #2E495E;
word-spacing: 5px;
padding-bottom: 15px;
}

.links {
padding-top: 15px;
}

:root {
--plyr-color-main: #ff0000; /* use --color-btn-primary for NBC Theme */
}

.plyr--video {
border-radius: 10px;
}

a.block {
  position: relative;
}

a.block::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 20px;
  height: 20px;
}

a.block::before.not-available {
  content: "Not Available";
  font-size: 14px;
  text-align: center;
  background-color: #ccc;
  color: #fff;
  padding: 4px;
  border-radius: 4px;
}

a.block::before.play {
  content: "►";
  font-size: 20px;
  color: #000;
}

.cert-panel {
  padding: 8px;
  background: #ffffff;
  margin-top: 5px;
  border-radius: 7px;
  border: 1px solid #e2e2e2;
}

</style>