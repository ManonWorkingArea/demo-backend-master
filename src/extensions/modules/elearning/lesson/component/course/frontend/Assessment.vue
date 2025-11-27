<script>
import storageManager from '@/plugins/storage';
import convertUtils from "@/plugins/convertUtils";
import deviceUtils from "@/plugins/DeviceUtils";

import webcam from "../Webcam.vue";
import Loader from '@/interface/template/Loader.vue';

import Timer from '@/utils/Timer.vue';

import dialog from '@/plugins/Dialog.js';
import debug from '@/plugins/Logger.js';

export default {
	name: 'Lesson Assessment',
	components: {
    webcam,Loader,Timer
	},
	data() {
		return {
        limitItem:50,
        limitOptions: [1,5,10, 50, 100, 200, 500,600,700,800,1000, 2000, 3000], // Define the available options
        currentPage: 1,
        totalPages: 0,
        totalItems: 0,
        // Existing data properties
        questionsPerPage: 10, // Number of questions to show per page
        //paginatedQuestions: [], // Questions to display on the current page
        // Other existing data properties...
        shouldShowDiv:true,
        activeBlock: false,
        loader:false,
        examState:'',
        shuffleQuestions: true,
        shuffleAnswers: true,
        showWelcome: true,
        examDuration: 0, // 1 hour
        examTemp: {
          answers: {},
        },
        videoVerified:undefined,
        isSubmitting: false,
        score:[],
        enroll:[],
        unansweredQuestions: [],
        userIp: '0.0.0.0',
        questions: [],
        capturedImages: [],
        playOption:'step',
        login: storageManager.get('session','login'),
        configs: storageManager.get('configs'),
        session: storageManager.get('session'),
        dataItem: this.$route.params.cid,
        examItem: this.$route.params.eid,
        examType: this.$route.params.type,
        examRound: this.$route.params.round,
        deviceType: deviceUtils.deviceDetect(),
        lesson:[],
        exam:[],
        player:[],
        progress:[],
        progressArray:[],
        param_id:"",
        param_ep:"",
        loading_sources: true,
        timeout:false,
        playerLogo:"",
        playerSource:"",
        playerPoster:"",
        displayExam:false,
        webcamRecord:false,
        playerOptions: {
        controls: [
          "play-large",
          "current-time",
          "play",
          "mute",
          "volume",
          "progress",
          "settings",
          "fullscreen"
        ],
        settings: ["quality", "speed", "loop"],
        retestScore:null,
        retestStatus:null,
      }
		}
	},
	methods: {
    async fetchUserIP() {
      try {
        const response = await fetch('https://api.ipify.org?format=json');
        if (!response.ok) throw new Error('Failed to fetch IP address');
        const data = await response.json();
        this.userIp = data.ip; // Update the userIp data property with the fetched IP address
        console.log('Fetched User IP Address:', this.userIp); // Optional: for debugging
      } catch (error) {
        console.error('Error fetching user IP:', error);
        // Optionally handle the error, e.g., by showing an error message to the user
      }
    },
    checkResultExamDue(date) {
      const timeZoneOffset = 7 * 60; // Thailand is GMT+7, in minutes
      // Convert posttestDate to Date object in UTC and adjust for Thailand timezone
      const dueDate = new Date(date);
      const dueDateInThailand = new Date(dueDate.getUTCFullYear(), dueDate.getUTCMonth(), dueDate.getUTCDate(), dueDate.getUTCHours(), dueDate.getUTCMinutes() + timeZoneOffset);
      
      // Now in UTC adjusted for Thailand timezone
      const now = new Date();
      const nowInThailand = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes() + timeZoneOffset);
      
      return nowInThailand < dueDateInThailand;
    },
    // This method checks if all questions on the current page have been answered
    areAllQuestionsAnsweredOnCurrentPage() {
      const startIndex = (this.currentPage - 1) * this.questionsPerPage;
      const endIndex = startIndex + this.questionsPerPage;
      const currentPageQuestions = this.questions.slice(startIndex, endIndex);

      return currentPageQuestions.every(question => {
        return this.examTemp.answers[question.number];
      });
    },
    handleImageCaptured(imageDataUrl) {
      this.capturedImages.push(imageDataUrl);
    },
    handleImageUploaded(imageUrl) {
      this.capturedImages.push(imageUrl);
      this.updateVerifiedImage()
    },
    async updateVerifiedImage() {
      try {
        // Ensure there's at least one captured image
        if (this.capturedImages.length === 0) {
          console.error("No images captured.");
          return;
        }
        // Use the last captured image URL

        // Initialize capture from this.enroll if it exists, otherwise use an empty object
        let capture = this.enroll && this.enroll.capture ? { ...this.enroll.capture } : {};

        // Assuming this.capturedImages is an array of image URLs from the latest exam capture
        if (this.exam.type === 'post') {
            // Update or initialize the 'post' property with the latest captured images
            if (this.retestStatus) {
              capture.retest = {
                urls: [...this.capturedImages] // Spread syntax to copy capturedImages array
              };
            } else {
              capture.post = {
                urls: [...this.capturedImages] // Spread syntax to copy capturedImages array
              };
            }
            
        } else if (this.exam.type === 'pre') {
            // Update or initialize the 'pre' property with the latest captured images
            capture.pre = {
                urls: [...this.capturedImages] // Spread syntax to copy capturedImages array
            };
        }

        // Update this.enroll.capture with the new or updated capture object
        this.enroll.capture = capture;

        // Prepare the requestBody with the updated capture data
        const requestBody = {
            data: {
                capture: this.enroll.capture,
            }
        };

        // Make the PUT request with the updated record
        const { data, status } = await this.$Request.PUT(`enroll/${this.enroll._id}`, requestBody, this.configs.key);
        console.log(data, status); // Using console.log for demonstration; adjust as needed

      } catch (error) {
        console.error(error); // Using console.error for demonstration; adjust as needed
      }
    },
    goToNextPage() {
      if (!this.areAllQuestionsAnsweredOnCurrentPage()) {
        //alert('Please answer all questions on this page before proceeding.');
        dialog.prompt({
          title: 'เกิดข้อผิดพลาด',
          message: 'คุณยังทำแบบทดสอบในหน้านี้ไม่ครบทุกข้อ !',
          confirm: async () => {},
          cancel: () => {}
        });
        return; // Exit the function if not all questions are answered
      }

      this.$refs.webcamComponent.captureImage();

      const totalPages = Math.ceil(this.questions.length / this.questionsPerPage);
      if (this.currentPage < totalPages) {
        this.currentPage++;
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },

    goToPreviousPage() {
      if (!this.areAllQuestionsAnsweredOnCurrentPage()) {
        //alert('Please answer all questions on this page before proceeding.');
        dialog.prompt({
          title: 'เกิดข้อผิดพลาด',
          message: 'คุณยังทำแบบทดสอบในหน้านี้ไม่ครบทุกข้อ !',
          confirm: async () => {},
          cancel: () => {}
        });
        return; // Exit the function if not all questions are answered
      }

      this.$refs.webcamComponent.captureImage();

      if (this.currentPage > 1) {
        this.currentPage--;
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    setPage(page) {
      if (!this.areAllQuestionsAnsweredOnCurrentPage()) {
        //alert('Please answer all questions on this page before proceeding.');
        dialog.prompt({
          title: 'เกิดข้อผิดพลาด',
          message: 'คุณยังทำแบบทดสอบในหน้านี้ไม่ครบทุกข้อ !',
          confirm: async () => {},
          cancel: () => {}
        });
        return; // Exit the function if not all questions are answered
      }
      this.currentPage = page;
      this.$refs.webcamComponent.captureImage();
    },
    determineInitialState() {
      const examTemp = localStorage.getItem('examTemp');
      if (examTemp) {
        this.examTemp = JSON.parse(examTemp);
      }
      const timers = JSON.parse(sessionStorage.getItem('timers')) || [];
      const now = new Date().getTime();
      const hasActiveTimer = timers.some(timer => now < timer.endTime);
      if (this.score && Object.keys(this.score).length > 0) {

        if(this.retestStatus) {
          debug.log("No Score", this.score);
          this.examState = hasActiveTimer ? 'exam' : 'welcome';
        } else {
          debug.log("Has Score", this.score);
          this.examState = 'result';
          this.shouldShowDiv = false;
        }
      } else {
        debug.log("No Score", this.score);
        this.examState = hasActiveTimer ? 'exam' : 'welcome';
      }
    },
    startTimer() {
      this.$refs.timerComponent.startTimer();
    },
    resetTimer() {
      this.$refs.timerComponent.resetTimer();
    },
    handleUpdate(timer) {
      debug.log('Timer updated:', timer);
    },
    handleFinish(timer) {
      this.timeout = true;
      this.submitExam(true);
      debug.log('Timer finished:', timer);
    },
    handleTimerStatus(status) {
      //this.examState = status === 'fresh' ? 'welcome' : 'exam';
      debug.log('handleTimerStatus:', status);
    },
    preventCopyPaste(event) {
      event.preventDefault();
      alert("Copying and pasting are disabled on this page.");
    },
    isOptionSelected(questionId, optionValue) {
      if (this.examTemp.answers && this.examTemp.answers[questionId]) {
          const selectedOptions = this.examTemp.answers[questionId].map(item => item.answer);
          return selectedOptions.includes(optionValue);
      }
      return false;
    },
    handleWebcamRecorder(base64Data) {
      this.videoVerified = base64Data
      localStorage.setItem('webcamRecord', base64Data);
      this.shouldShowDiv = false
    },
    shuffle(array) {
      let currentIndex = array.length,
        randomIndex;
      while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
      }
      return array;
    },
    startExam() {
      this.showWelcome = false;
      this.examState = 'exam';
      this.renderExam();
      this.$refs.webcamComponent.captureImage();
      this.$refs.timerComponent.startTimer();
    },
    renderExam() {
      if (this.shuffleQuestions) {
        this.questions = this.shuffle(this.questions);
      }
      if (this.shuffleAnswers) {
        this.questions.forEach(question => {
          question.answers = this.shuffle(question.answers);
        });
      }
    },
    addUserData(questionNumber, answer) {
      const timestamp = new Date().getTime();
      this.examTemp.answers[questionNumber] = [{ answer, timestamp }];
      localStorage.setItem('examTemp', JSON.stringify(this.examTemp));
    },
    calculateScore() {
      let score = 0;
      for (const question of this.questions) {
        debug.log("question",question);
        const userAnswer = this.examTemp.answers[question.number];
        debug.log("userAnswer",userAnswer);
        if (userAnswer && userAnswer[0].answer === question.correct) {
          score++;
        }
      }
      return score;
    },
    resetAnswers() {
      for (const question of this.questions) {
        this.examTemp.answers[question.number] = null;
      }
      localStorage.setItem('examTemp', JSON.stringify(this.examTemp));
    },
    async resetExam() {
      this.examState = 'welcome';
      this.showWelcome = true;
      this.examTemp.answers = {};
      try {
        const updatedExams = await this.addQuestionsToExam(this.examItem);
        debug.log("updatedExams", updatedExams);
        if (this.shuffleQuestions) {
          this.questions = this.shuffle(updatedExams.questionArray);
          this.questions.forEach(question => {
            question.answers = this.shuffle(question.answers);
          });
        }
      } catch (error) {
        console.error("Error resetting the exam:", error);
      }
    },
    async submitExam() {

      this.unansweredQuestions = [];

      if (this.isSubmitting) return; // Prevent multiple submissions
      this.isSubmitting = true;

      const currentTime = new Date().getTime();
      let isCompleted = true;
      for (const question of this.questions) {
        if (!this.examTemp.answers[question.number]) {
          isCompleted = false;
          break;
        }
      }

      if (isCompleted || this.timeout) {
        this.examTemp.submitTime = currentTime;
        this.examTemp.remark = this.timeout ? 'timeout' : 'user';
        this.examTemp.score = this.calculateScore();

        try {
          await this.saveScore(this.examTemp);
          this.examState = 'result';
          this.shouldShowDiv = false;
          if (this.examTemp.score >= this.exam.measure || (this.examTemp.score < this.exam.measure && this.exam.is_repeat === 'yes')) {
            debug.log("Pass or allowed to retake");
          } else {
            debug.log("Fail and not allowed to retake");
          }
        } catch (error) {
          console.error("Error saving score:", error);
        }
      } else {

        // Identify unanswered questions
        this.questions.forEach(question => {
          if (!this.examTemp.answers[question.number]) {
            this.unansweredQuestions.push(question.number);
          }
        });

        //alert(`Please complete all questions before submitting. Time remaining`);
        dialog.prompt({
          title: 'เกิดข้อผิดพลาด',
          message: 'คุณยังทำแบบทดสอบไม่ครบทุกข้อ !',
          confirm: async () => {},
          cancel: () => {}
        });
        this.startTimer();
      }
      this.isSubmitting = false;
    },
    async saveScore(result) {
      try {
        this.activeBlock = true;
        this.$refs.webcamComponent.captureImage();
        let type = ''
        if (this.retestStatus) {
          type = 'retest'
        }
        const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/score/query", {
          method: 'POST',
          headers: {'Content-Type': 'application/json','client-token-key':this.configs.key},
          body: JSON.stringify({
            method: 'find',
            args: [
              {
                $and: [
                  { 
                    userID: this.session.userID,
                    examID: this.examItem,
                    courseID: this.dataItem,
                    type: type
                  }
                ]
              }
            ]
          })
        });

        const getScore  = await resAPI.json();

        if (getScore.length === 0 || (this.exam.is_repeat === 'yes' && getScore.length > 0)) {
          debug.log("No Score or Can Repeat Exam");
          const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/score/", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json','client-token-key':this.configs.key },
            body: JSON.stringify({
              data: {
                "userID": this.session.userID,
                "examID": this.examItem,
                "courseID": this.dataItem,
                "score": result.score,
                "remark": result.remark,
                "startTime": result.startTime,
                "submitTime": result.submitTime,
                "answer": result.answers,
                "type": type
              },
              options: {}
            })
          });
          const scoreReturn = await resAPI.json();

          if (resAPI.status === 200) {

            this.examState = 'result';
            this.shouldShowDiv = false;
            this.score = scoreReturn;
            localStorage.removeItem('examTemp');
            
            let verified = this.enroll && this.enroll.verified ? this.enroll.verified : {};
            let webcamRecord = localStorage.getItem('webcamRecord');

            if (this.exam.type === 'post') {
                if (this.retestStatus) {
                  verified.retest = {
                    status: true,
                    url: webcamRecord
                };
                } else {
                  verified.post = {
                    status: true,
                    url: webcamRecord
                };
                }
                
            } else if (this.exam.type === 'pre') {
                verified.pre = {
                    status: true,
                    url: webcamRecord
                };
            }

            this.enroll.verified = verified;

            const requestBody = {
                data: {
                    verified: this.enroll.verified,
                }
            };

            const { data, status } = await this.$Request.PUT(`enroll/${this.enroll._id}`, requestBody, this.configs.key);
            debug.log(data,status);

            localStorage.removeItem('webcamRecord');
            this.activeBlock = false;

            const enrollAPI = await fetch("https://gateway.cloudrestfulapi.com/api/enroll/query", {
              method: 'POST',
              headers: { 'Content-Type': 'application/json','client-token-key':this.configs.key },
              body: JSON.stringify({
                method: 'find',
                args: [
                  {
                    $and: [
                      {
                        courseID: this.dataItem,
                        userID: this.session.userID,
                      }
                    ]
                  }
                ]
              })
            });
            const enrollReturn = await enrollAPI.json();
            const enrollReturnCopy = { ...enrollReturn[0] };

            enrollReturnCopy.analytics = {
              ...enrollReturnCopy.analytics
            };

            if (this.exam.type === 'post') {
              if (this.retestStatus) {
                enrollReturnCopy.analytics.retest = {
                req: true,
                has: true,
                measure: this.exam.measure,
                score: this.score.score,
                result: this.score.score >= this.exam.measure,
                message: this.score.score >= this.exam.measure ? 'ผ่านการรับรอง' : 'ไม่ผ่านการรับรอง',
              };
              } else {
                enrollReturnCopy.analytics.post = {
                req: true,
                has: true,
                verified:'xxx',
                measure: this.exam.measure,
                score: this.score.score,
                result: this.score.score >= this.exam.measure,
                message: this.score.score >= this.exam.measure ? 'ผ่านการรับรอง' : 'ไม่ผ่านการรับรอง',
              };
              }
              
            } else if (this.exam.type === 'pre') {
              enrollReturnCopy.analytics.pre = {
                req: true,
                has: true,
                verified:'xxx',
                measure: this.exam.measure,
                score: this.score.score,
                result: this.score.score >= this.exam.measure,
                message: this.score.score >= this.exam.measure ? 'ผ่านการรับรอง' : 'ไม่ผ่านการรับรอง',
              };
            }

            const enrollId = enrollReturn[0]._id;
            const apiUrl = `https://gateway.cloudrestfulapi.com/api/enroll/${enrollId}`;
            const requestData = {
              data: {
                analytics: enrollReturnCopy.analytics,
              },
              options: {},
            };

            // Send the PUT request
            const enroll2API = await fetch(apiUrl, {
              method: "PUT",
              headers: { "Content-Type": "application/json",'client-token-key':this.configs.key },
              body: JSON.stringify(requestData),
            });
            await enroll2API.json();
            this.$refs.timerComponent.resetTimer();
          }
        } else {
          debug.log("Has Score || Can't Repeat Exam");
        }
      } catch (error) {
        debug.log(error);
      }
    },
    formatSeconds(seconds) {
      return convertUtils.secondsToTime(seconds);
    },
    formatThaidate(date) {
      return convertUtils.toThaiDatetime(date);
    },
    detectDevice() {
      return deviceUtils.deviceDetect();
    },
    async getData() {
      try {
        this.loader = false
        this.loading_sources  = false;
        const resAPI  = await fetch("https://gateway.cloudrestfulapi.com/api/course/" + this.dataItem, {
          method: 'GET',
          headers: {'Content-Type': 'application/json','client-token-key':this.configs.key},
        });
        const RestReturn   = await resAPI.json();

        localStorage.removeItem('webcamRecord');

        if(resAPI.status===200) {
            this.lesson = RestReturn;
            const resExam  = await fetch("https://gateway.cloudrestfulapi.com/api/exam/" + this.examItem, {
                method: 'GET',
                headers: {'Content-Type': 'application/json','client-token-key':this.configs.key},
            });

            const examReturn   = await resExam.json();

            console.log("examReturn",examReturn);

            this.exam         = examReturn;
            this.examDuration = examReturn.timer;

            const enrollAPI = await fetch("https://gateway.cloudrestfulapi.com/api/enroll/query", {
              method: 'POST',
              headers: {'Content-Type': 'application/json','client-token-key':this.configs.key},
              body: JSON.stringify({
                method: 'find',
                args: [
                  {
                    $and: [
                      { 
                        userID: this.session.userID,
                        courseID: this.dataItem
                      }
                    ]
                  }
                ]
              })
            });

            const enroll = await enrollAPI.json();
            this.enroll = enroll[0];

            console.log("enroll",this.enroll);

            const formAPI = await fetch("https://gateway.cloudrestfulapi.com/api/form/query", {
              method: 'POST',
              headers: {'Content-Type': 'application/json','client-token-key':this.configs.key},
              body: JSON.stringify({
                method: 'find',
                args: [
                  {
                    $and: [
                      { 
                        userID: this.session.userID,
                        courseID: this.dataItem
                      }
                    ]
                  }
                ]
              })
            });

            const form = await formAPI.json();

            this.form = form[0];
            console.log("form",this.form);

            if(this.exam.verified==='yes') {
              if (this.enroll && this.enroll.verified) {
                debug.log("che k verified",this.enroll,this.enroll.verified);
                  if (this.exam.type === 'post' && this.enroll.verified.post && this.enroll.verified.post.url) {
                    this.videoVerified = this.enroll.verified.post.url;
                    this.shouldShowDiv = false
                    debug.log("post",this.videoVerified);
                  } else if (this.exam.type === 'pre' && this.enroll.verified.pre && this.enroll.verified.pre.url) {
                    this.videoVerified = this.enroll.verified.pre.url;
                    this.shouldShowDiv = false
                    debug.log("pre",this.videoVerified);
                  } else {
                      this.videoVerified = false;
                      this.shouldShowDiv = true
                  }
              } else {
                  this.videoVerified = false;
                  this.shouldShowDiv = true
              }
            } else {
              this.videoVerified = false;
              this.shouldShowDiv = false
            }

            //console.log("DEBUG","1");
            
            //console.log("end_duedate",this.exam.end_duedate);
            //console.log(this.checkResultExamDue(this.exam.end_duedate));

            if(this.checkResultExamDue(this.exam.end_duedate)===true) {
              this.displayExam = true;
            } else {
              this.displayExam = false;
            }

            localStorage.setItem('webcamRecord', this.videoVerified);
            debug.log("videoVerified",this.videoVerified);

            //console.log("DEBUG","2");

            //console.log("Round",this.form.formData['radiobox-23-10-10'].value.value);


            // check for DOA Exam
            // ==================
            
            if(this.form && this.form.formData['radiobox-23-10-10'].value.value === 'round-1') {
              if (this.enroll.analytics.post && this.enroll.analytics.post.score) {
                if(this.enroll?.analytics?.post?.score > 33) {
                  this.$router.push("/user/profile");
                  return;
                }
              }
            }

            if(this.form && this.form.formData['radiobox-23-10-10'].value.value === 'round-2') {
              if (this.enroll.analytics.post && this.enroll.analytics.post.score) {
                if(this.enroll?.analytics?.post?.score > 33) {
                  this.$router.push("/user/profile");
                  return;
                }
              }
            }
            // ==================
            // check for DOA Exam
            
            /*
            
            
            if (this.exam.type === 'post' && !this.checkResultExamDue(this.exam.end_duedate)) {
              this.$router.push("/user/profile");
              return;
            }

            */

            //console.log("DEBUG","3");

            const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/score/query", {
              method: 'POST',
              headers: {'Content-Type': 'application/json','client-token-key':this.configs.key},
              body: JSON.stringify({
                method: 'find',
                args: [
                  {
                    $and: [
                      { 
                        userID: this.session.userID,
                        examID: this.examItem,
                        courseID: this.dataItem
                      }
                    ]
                  }
                ]
              })
            });

            const score = await resAPI.json();

            console.log("DEBUG","4");

            ///////////////// RETEST LOGIC 

            if(this.examType ==='retest') {

              console.log("DEBUG","5");

              const analytics = this.enroll.analytics;
              const postScore = analytics?.post?.score || 0;
              const postMeasure = analytics?.post?.measure || 33;
              let postResult = false;
              let retestScore = 0;

              let retestOpen = null
              let retestClose = null
              
              if (this.examRound ==='1') {
                console.log("DEBUG","6");
                retestOpen = this.lesson.retestDateRound1
                retestClose = this.lesson.retestDateEndDateRound1
              } else {
                retestOpen = this.lesson.retestDateRound2
                retestClose = this.lesson.retestDateEndDateRound2
              }

              
              
              if (postScore < postMeasure) {
                postResult = false;
                retestScore = typeof analytics.retest?.score === 'number' ? analytics.retest.score : false;
                if(this.checkResultExamDue(retestOpen)===false && this.checkResultExamDue(retestClose)) {
                  debug.slack("กำลังสอบซ่อม");
                } else {
                  debug.slack("ไมไ่ด้เปิดสอบซ่อม");
                }
                debug.slack("*retestOpen*",this.checkResultExamDue(retestOpen));
                debug.slack("*retestClose*",this.checkResultExamDue(retestClose));
              } else {
                postResult = true;
              }
              this.retestScore = retestScore
              this.retestStatus = typeof retestScore !== 'number';
              debug.slack("Post score",postScore);
              debug.slack("Post measure",postMeasure);
              debug.slack("Post result",postResult);
              debug.slack("Retest Score",retestScore);

              if (this.exam.type === 'post' && this.enroll.verified.retest && this.enroll.verified.retest.url) {
                  this.videoVerified = this.enroll.verified.post.url;
                  this.shouldShowDiv = false
                  debug.log("post",this.videoVerified);
                } else {
                  this.videoVerified = false;
                  this.shouldShowDiv = true
                }


              //debug.slack("enroll",this.enroll.analytics);
            } else {
              this.retestStatus = false
            }

            ///////////////////////////////////////////////////////

            if (resAPI.status === 200) {
              if (score.length > 0) {
                //this.examState = 'result';
                this.score = score[score.length - 1];
                this.loader = true
        
                this.determineInitialState();

              } else {

                if (this.examTemp.answers) {
                  const updatedExams = await this.addQuestionsToExam(examReturn._id);
                  debug.log("updatedExams", updatedExams);
                  this.renderExam();
                  this.loader = true
                } else {
                  //this.examState = 'welcome';
                  const updatedExams = await this.addQuestionsToExam(examReturn._id);
                  this.loader = true
                  debug.log("updatedExams", updatedExams);
                }
                this.determineInitialState();
              }

              if(this.retestStatus) {
                if (this.examTemp.answers) {
                  const updatedExams = await this.addQuestionsToExam(examReturn._id);
                  debug.log("updatedExams", updatedExams);
                  this.renderExam();
                  this.loader = true
                } else {
                  //this.examState = 'welcome';
                  const updatedExams = await this.addQuestionsToExam(examReturn._id);
                  this.loader = true
                  debug.log("updatedExams", updatedExams);
                }
                this.determineInitialState();
              }
            }
        }
      } catch (error) {
        debug.log(error)
      }
    },
    async addQuestionsToExam(examId) {
      const pipeline = [
        {
          $match: {
            $and: [{ examID: examId }]
          },
        },
        {
          $lookup: {
            from: "answer",
            let: { questionId: { $toString: "$_id" } },
            pipeline: [
              {
                $match: {
                  $expr: {
                      $eq: ["$$questionId", "$questionID"]
                  }
                }
              },
            ],
            as: "answers"
          }
        },
        {
          $facet: {
              post: [
                {
                    $skip: (this.currentPage - 1) * this.limitItem,
                },
                {
                    $limit: this.limitItem,
                },
              ],
              totalCount: [
                {
                    $count: 'count',
                },
              ],
          },
        },
      ];

      const requestBody = {
        pipeline: pipeline,
      };

      const { data, status } = await this.$Request.POST(`questions/aggregate`, requestBody, this.configs.key);

      if(status===200) {
        this.questions = this.convertQuestionsData(data);
      }
    },
    convertQuestionsData(data) {
      const convertedData = data.flatMap(item => {
        return item.post.map(postItem => {
          const { _id: number, detail: text, correct, answers } = postItem;
          const convertedAnswers = answers.map(answer => ({
            value: answer._id,
            label: answer.detail
          }));

          return {
            number,
            text,
            correct,
            answers: convertedAnswers
          };
        });
      });
      return convertedData;
    },
    cancelExam() {
      dialog.confirm({
          title: 'กรุณายืนยันการยกเลิกการสอบ?',
          message: 'ข้อมูลการสอบในตอนนี้ จะถูกยกเลิก เวลาจะจับใหม่ ข้อสอบจะถูกประมวลผลใหม่',
          confirm: async () => {
            this.examState = 'welcome';
            this.showWelcome = true;
            debug.log("cancelExam");

            this.examTemp = {
              answers: {},
            };
            this.$refs.timerComponent.resetTimer();
            localStorage.removeItem('examTemp');
          },
          cancel: () => {}
      });
    },
	},
  created() {
    //this.initializeComponent();
  },
  computed: {
    paginatedQuestions() {
      const start = (this.currentPage - 1) * this.questionsPerPage;
      const end = start + this.questionsPerPage;
      return this.questions.slice(start, end);
    },
    answeredQuestionsCount() {
      let answeredCount = 0;
      this.questions.forEach(question => {
        if(this.examTemp.answers[question.number]) {
          answeredCount++;
        }
      });
      return { answered: answeredCount, total: this.questions.length };
    },
  },
  async mounted() {
  try {
    // Check if user is not logged in
    if (!this.login) {
      this.$router.push("/");
      return; // Stop further execution
    }
    this.fetchUserIP();
    document.addEventListener('copy', this.preventCopyPaste);
    document.addEventListener('paste', this.preventCopyPaste);
    await this.getData();
    //this.examDuration = this.examDuration * 60;
  } catch (error) {
    debug.log(error);
  }
},
  setup() {},
  watch: {
    '$route.params.cid': {
      deep: true,
      immediate: true,
      handler() {
        //debug.log("watch");
      }
    }
  },
};
</script>

<template>

<div v-if="!loader" class="text-center"><Loader/></div>
<div class="bg-gray-100 noselect relative" v-if="loader" :data-content="'กำลังติดต่อฐานข้อมูล กรุณารอสักครู่.....'" :class="[(activeBlock?'isblock' : 'isunblock')]">
  <div class="hidden lg:block mx-auto max-w-2xl px-4 pt-3 pb-4 sm:px-18 sm:pt-3 sm:pb-4 lg:grid lg:max-w-7xl lg:grid-cols-2 lg:gap-x-4">
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
                
                    <li>
                      <div class="flex items-center">
                        <svg class="h-5 w-5 flex-shrink-0 text-gray-300" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                          <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                        </svg>
                        <router-link :to="session.mode === 'bypass' ? '/user/employee' : '/lesson/home'" class="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">หลักสูตร</router-link>
                      </div>
                    </li>
                
                    <li>
                      <div class="flex items-center">
                        <svg class="h-5 w-5 flex-shrink-0 text-gray-300" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                          <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                        </svg>
                        <router-link :to="'/lesson/detail/' + lesson._id" class="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700 max-w-xs truncate min-w-xs">{{this.lesson.name}}</router-link>
                      </div>
                    </li>
                    <li>
                      <div class="flex items-center">
                        <svg class="h-5 w-5 flex-shrink-0 text-gray-300" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                          <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                        </svg>
                        <span class="ml-4 text-sm font-bold text-gray-600 hover:text-gray-700  max-w-xs truncate min-w-xs">{{this.exam.name}}</span>
                      </div>
                    </li>
                  </ol>
              </nav>
          </div>
      </div>
  </div>

  <div>
    <timer ref="timerComponent" 
    :mode="'blank'"
    :timer="60"
    @timer-status="handleTimerStatus"
    @update-timer="handleUpdate" 
    @timer-finished="handleFinish"/>

    <section aria-labelledby="details-heading" class="p-6 bg-white mb-5" :style="{ display: shouldShowDiv ? 'block' : 'none' }">
      <webcam ref="webcamComponent" 
      @webcam-recorder="handleWebcamRecorder" 
      @imageCaptured="handleImageCaptured"
      @imageUploaded="handleImageUploaded"
      />
    </section>
            
    <template v-if="this.examState === 'welcome'">

      <div class="bg-gray-900">
        <div class="mx-auto max-w-2xl pt-5 mb-5 sm:px-2 sm:pt-8 sm:pb-8 lg:px-8">
          <section aria-labelledby="details-heading" class="mb-5">
            <div class="flex flex-col items-center text-center">
                <h2 id="details-heading" class="text-2xl font-bold tracking-tight text-white sm:text-2xl">{{this.lesson.name}}</h2>
                <p class="mt-3 max-w-3xl text-lg text-white">{{this.exam.name}}</p>
            </div>
          </section>

          <template v-if="exam.verified === 'yes'">
            
            <!-- <span class="bg-white p-3">{{ videoVerified }}</span> -->

            <template v-if="!videoVerified">
              
              <section aria-labelledby="details-heading" class="p-6 bg-white mb-5">
                <h3 class="font-bold text-lg mb-4">การยืนยันตัวก่อนสอบ</h3>
                <ol class="list-decimal ml-6 pb-3">
                  <li>กดปุ่มเปิดกล้องและอนุญาติให้เว็บไซต์ทำการใช้งานกล้องได้</li>
                  <li>คลิกที่ปุ่ม "บันทึก" เพื่อเริ่มต้นการบันทึกข้อมูล</li>
                  <li>อ่านตัวหนังสือบนหน้าจอ</li>
                  <li>หลังจากผ่านไป 5 วินาทีวีดีโอจะถูกบันทึกโดยอัตโนมัติ</li>
                  <li>จะมีการสุ่มบันทึกภาพระหว่างการสอบ</li>
                </ol>
                
              </section>
              
            </template>

            <template v-if="videoVerified">

              <section aria-labelledby="details-heading" class="p-6 bg-white mb-5">
                <h3 class="font-bold text-lg mb-4">Instructions</h3>
                <ol class="list-decimal ml-6">
                  <li>แบบทดสอบก่อนเรียน ข้อสอบทั้งหมด <strong>{{this.exam.total}}</strong> ข้อ เวลาในการทำ <strong>{{this.exam.timer}}</strong> นาที</li>
                  <li v-if="this.exam.is_score !== 'no'">เกณฑ์ในการผ่านการประเมิน <strong>{{this.exam.measure}}</strong> คะแนน</li>
                  <li>คลิกที่ปุ่ม "เริ่มการสอบ" เพื่อเริ่มต้นการสอบ</li>
                  <li>คุณจะมีเวลาจำกัดในการทำข้อสอบ ตัวจับเวลาจะปรากฏที่ด้านบนของหน้าจอ</li>
                  <li>ตอบคำถามทั้งหมดให้ดีที่สุดที่คุณสามารถทำได้</li>
                  <li>คุณสามารถส่งคำตอบของคุณได้เพียงครั้งเดียว เช็คคำตอบของคุณอีกครั้งก่อนส่ง</li>
                </ol>
                <h3 class="font-bold text-lg mt-8 mb-4">Rules</h3>
                <ul class="list-disc ml-6">
                  <li>Do not use any external resources or communication during the exam.</li>
                  <li>Do not share the exam questions or answers with anyone.</li>
                  <li>Do not use any prohibited devices during the exam.</li>
                  <li>Any attempt to cheat or violate the rules will result in immediate disqualification.</li>
                </ul>
                <div class="text-center">
                  <router-link :to="'/lesson/detail/' + lesson._id" class="mt-8 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2">ไปที่หลักสูตร</router-link>
                  <button class="mt-8 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" @click="startExam">เริ่มการสอบ</button>
                </div>
              </section>

            </template>

          </template>

          <template v-else>

            <section aria-labelledby="details-heading" class="p-6 bg-white mb-5">
              <h3 class="font-bold text-lg mb-4">Instructions</h3>
              <ol class="list-decimal ml-6">
                <li>แบบทดสอบก่อนเรียน ข้อสอบทั้งหมด <strong>{{this.exam.total}}</strong> ข้อ เวลาในการทำ <strong>{{this.exam.timer}}</strong> นาที</li>
                <li v-if="this.exam.is_score !== 'no'">เกณฑ์ในการผ่านการประเมิน <strong>{{this.exam.measure}}</strong> คะแนน</li>
                <li>คลิกที่ปุ่ม "เริ่มการสอบ" เพื่อเริ่มต้นการสอบ</li>
                <li>คุณจะมีเวลาจำกัดในการทำข้อสอบ ตัวจับเวลาจะปรากฏที่ด้านบนของหน้าจอ</li>
                <li>ตอบคำถามทั้งหมดให้ดีที่สุดที่คุณสามารถทำได้</li>
                <li>คุณสามารถส่งคำตอบของคุณได้เพียงครั้งเดียว เช็คคำตอบของคุณอีกครั้งก่อนส่ง</li>
              </ol>
              <h3 class="font-bold text-lg mt-8 mb-4">Rules</h3>
              <ul class="list-disc ml-6">
                <li>Do not use any external resources or communication during the exam.</li>
                <li>Do not share the exam questions or answers with anyone.</li>
                <li>Do not use any prohibited devices during the exam.</li>
                <li>Any attempt to cheat or violate the rules will result in immediate disqualification.</li>
              </ul>
              <div class="text-center">
                <router-link :to="'/lesson/detail/' + lesson._id" class="mt-8 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2">ไปที่หลักสูตร</router-link>
                <button class="mt-8 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" @click="startExam">เริ่มการสอบ</button>
              </div>
            </section>

          </template>

        </div>
      </div>

    </template>
    
    <template v-if="this.examState === 'exam'">

      <div class="bg-gray-900">

        <div class="mx-auto max-w-2xl pt-5 mb-5 sm:px-2 sm:pt-8 sm:pb-8 lg:max-w-4xl lg:px-8">
            <section aria-labelledby="details-heading" class="mb-5">
              <div class="flex flex-col items-center text-center">
                <h2 id="details-heading" class="text-2xl font-bold tracking-tight text-white sm:text-2xl">{{this.lesson.name}}</h2>
                <p class="mt-3 max-w-3xl text-lg text-white">{{this.exam.name}}</p>
              </div>
            </section>

            <div class=" grid grid-cols-1 gap-6">


              <div v-for="(question, index) in paginatedQuestions" :key="question.number" 
              :class="{ 'unanswered-border': unansweredQuestions.includes(question.number) }" class="relative bg-white shadow-md">
                <div class="question px-6 py-4 border-b border-gray-500">
                  <h3 class="font-semibold mb-4">{{ 'โจทย์ ' + (((currentPage - 1) * questionsPerPage) + index + 1) }}</h3>
                  <div v-html="question.text"></div>
                </div>

                <div class="answer bg-gray-100">
                  <form>
                    <div class="">
                      <label v-for="option in question.answers" :key="option.value" class="block p-4 border-b border-gray-300 hover:bg-gray-200 cursor-pointer">
                        <input type="radio" :name="question.number" :value="option.value" @click="addUserData(question.number, option.value)" :checked="isOptionSelected(question.number, option.value)">
                        <span class="ml-2">{{ option.label }}</span> 
                        <span v-if="this.exam.adminmode === 'yes' && question.correct===option.value">
                          <font-awesome-icon icon="check-circle" class="text-green-500 ml-2" />
                        </span>
                      </label>
                    </div>
                  </form>
                </div>

                <div class="absolute top-0 left-0 w-full h-full flex justify-center items-center pointer-events-none">
                    <div class="text-center opacity-20 transform rotate-25 text-3xl">
                        <span class="font-bold">Licensed to : </span> <br/> 
                        {{ session.user.firstname + " " + session.user.lastname}} ({{ userIp }}) <br/> {{ currentDateTime }}
                    </div>
                </div>
              </div>
              
              <!-- Pagination Controls -->
              <div class="flex justify-center space-x-4 mb-5">
                <button
                  @click="goToPreviousPage"
                  :disabled="currentPage === 1"
                  class="text-white"
                >
                  ย้อนกลับ
                </button>
                <!-- Dynamically create page numbers based on total questions -->
                <button
                  v-for="page in Math.ceil(questions.length / questionsPerPage)"
                  :key="page"
                  @click="setPage(page)"
                  :class="page === currentPage ? 'bg-white text-black' : 'text-white'"
                  class="rounded-xs hover:bg-gray-200 hover:text-gray-600 px-2"
                >
                  {{ page }}
                </button>
                <button
                  @click="goToNextPage"
                  :disabled="currentPage === Math.ceil(questions.length / questionsPerPage)"
                  class="text-white"
                >
                  ถัดไป
                </button>
              </div>

                <!-- <div v-for="(question, index) in questions" :key="question.number" class="relative bg-white shadow-md">

                  <div class="question px-6 py-4 border-b border-gray-500">
                    <h3 class="font-semibold mb-4">{{ 'โจทย์ ' + (index + 1) }}</h3>
                    <div v-html="question.text"></div>
                  </div>

                  <div class="answer bg-gray-100">
                    <form>
                      <div class="">
                        <label v-for="option in question.answers" :key="option.value" class="block p-4 border-b border-gray-300 hover:bg-gray-200 cursor-pointer">
                          <input type="radio" :name="question.number" :value="option.value" @click="addUserData(question.number, option.value)" :checked="isOptionSelected(question.number, option.value)">
                          <span class="ml-2">{{ option.label }}</span> 
                          <span v-if="this.exam.adminmode === 'yes' && question.correct===option.value">
                            <font-awesome-icon icon="check-circle" class="text-green-500 ml-2" />
                          </span>
                        </label>
                      </div>
                    </form>
                  </div>

                  <div class="absolute top-0 left-0 w-full h-full flex justify-center items-center pointer-events-none">
                      <div class="text-center opacity-20 transform rotate-25 text-lg">
                          <span class="font-bold">Licensed to : </span> <br/> 
                          {{ session.user.firstname + " " + session.user.lastname}} ({{ userIp }}) <br/> {{ currentDateTime }}
                      </div>
                  </div>
              
                </div> -->

              
            </div>
              
        </div>
      </div>

      <div class="bg-gray-100 py-6">
        
        <div class="mx-auto max-w-4xl grid grid-cols-1 sm:grid-cols-3 gap-4 sm:px-6 lg:px-8">
  
            <div class="bg-white shadow-md rounded-lg p-6 sm:col-span-1">
                <section aria-labelledby="details-heading">
                    <div class="flex flex-col items-center text-center">
                      <div class="text-center mb-3">
                        <span>ความคืบหน้า {{ answeredQuestionsCount.answered }} / {{ answeredQuestionsCount.total }}</span>
                      </div>
                      <h2 id="details-heading" class="text-2xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                        <timer 
                        ref="timerComponent" 
                        :mode="'display'"
                        :timer="examDuration"
                        @timer-status="handleTimerStatus"
                        @update-timer="handleUpdate" 
                        @timer-finished="handleFinish"/>
                      </h2>
                      <p class="mt-3 max-w-3xl text-lg text-gray-600">เวลาทำข้อสอบคงเหลือ</p>
                      
                    </div>
                </section>
            </div>
    
            <div class="bg-white shadow-md rounded-lg p-6 sm:col-span-2">
                <section aria-labelledby="details-heading">
                    <div class="flex flex-col items-center text-center">
                      <h2 id="details-heading" class="text-2xl font-bold tracking-tight text-gray-900 sm:text-2xl">{{this.exam.name}}</h2>
                      <p class="mt-3 max-w-3xl text-lg text-gray-600">อ่านและทำแบบทดสอบให้ครบทุกข้อก่อนส่งคำตอบ</p>
                    </div>
    
                    <div class="flex flex-col sm:flex-row justify-center items-center mt-8 space-y-4 sm:space-y-0 sm:space-x-4">
                      <button type="button" class="bg-green-500 hover:bg-green-600 px-6 py-3 rounded-md text-white font-semibold" @click="submitExam">ส่งคำตอบ</button>
                      <button type="button" class="bg-red-500 hover:bg-red-600 px-6 py-3 rounded-md text-white font-semibold" @click="cancelExam">ยกเลิกการสอบ</button>
                    </div>
    
                </section>
            </div>
      
          </div>
      </div>

    </template>
    
    <template v-if="this.examState === 'result'">

      <div class="bg-gray-900">
        <div class="mx-auto max-w-2xl pt-5 mb-5 sm:px-2 sm:pt-8 sm:pb-8 lg:px-8">

          <section aria-labelledby="details-heading" class="mb-5">
            <div class="flex flex-col items-center text-center">
              <h2 id="details-heading" class="text-2xl font-bold tracking-tight text-white sm:text-2xl">{{ this.lesson.name }}</h2>
              <p class="mt-3 max-w-3xl text-lg text-white">{{ this.exam.name }}</p>
            </div>
          </section>

          <section aria-labelledby="details-heading" class="p-6 bg-white mb-5">
            <div class="text-center pb-5">
              <h2 id="details-heading" class="text-2xl font-bold text-gray-900 mb-5">ผลการทำแบบทดสอบ</h2>
              <p class="text-sm text-gray-900">คุณทำแบบทดสอบเรียบร้อยแล้ว.ตรวจสอบผลการประเมินได้จากข้อมูลด้านล่าง</p>
            </div>

              <template v-if="!checkResultExamDue(this.exam.result_duedate) || this.exam.result === 'now'">

                <div :class="this.exam.is_score === 'no' ? 'grid grid-cols-1 gap-4 border-t border-gray-200 pt-5 border-b border-gray-200 pb-5 text-center' : 'grid grid-cols-2 gap-4 border-t border-gray-200 pt-5 border-b border-gray-200 pb-5'">
                  <div class="">
                    <h3 class="font-bold text-lg">คะแนน:</h3>
                    <p class="text-3xl">{{ this.score.score }}/{{ this.exam.total }}</p>
                  </div>
                  <div v-if="this.exam.is_score==='yes'">
                    <h3 class="font-bold text-lg">ผลลัพธ์:</h3>
                    <p class="text-lg">
                      <font-awesome-icon v-if="this.score.score >=  this.exam.measure" icon="check-circle" class="text-green-500" />
                      <font-awesome-icon v-else icon="times-circle" class="text-red-500" />
                      {{ this.score.score >=  this.exam.measure ? 'ผ่านการรับรอง' : 'ไม่ผ่านการรับรอง' }}
                    </p>
                  </div>
                </div>

              </template>

              <template v-else>

                <div :class="this.exam.is_score === 'no' ? 'grid grid-cols-1 gap-4 border-t border-gray-200 pt-5 border-b border-gray-200 pb-5 text-center' : 'grid grid-cols-1 gap-4 border-t border-gray-200 pt-5 border-b border-gray-200 pb-5'">
                  <div class="">
                    <h3 class="font-bold text-lg">ยังไม่ได้ประกาศผลการทดสอบ:</h3>
                    <p class="text-3xl">ประกาศผลวันที่</p>
                  </div>
                  <div v-if="this.exam.is_score==='yes'">
                    <h3 class="font-bold text-lg"></h3>
                    <p class="text-lg">{{formatThaidate(this.exam.result_duedate)}}</p>
                  </div>
                </div>

              </template>

              <p v-if="this.exam.type==='pre'" class="pt-5 text-sm text-gray-900">Note: คะแนนในแบบทดสอบนี้ไม่มีผลกับการออกใบรับรองผลการเรียน.</p>

            <div class="text-center mt-8">
              <router-link :to="'/lesson/detail/' + lesson._id" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">กลับสู่บทเรียน</router-link>
              <button v-if="this.exam.is_repeat === 'yes' && this.score.score < this.exam.measure" class="ml-2 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded" @click="resetExam">ทดสอบใหม่</button>
            </div>

          </section>

        </div>
      </div>
      
    </template>

  </div>

</div>

<!-- Section to display captured images -->
<!-- <div class="captured-images-container">
  <img v-for="(image, index) in capturedImages" :src="image" :key="index" alt="Captured image" class="captured-image"/>
</div> -->
</template>

<style>


.captured-images-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
  margin-top: 20px;
}

.captured-image {
  width: 100px; /* Adjust size as needed */
  height: 100px;
  object-fit: cover;
}


.playing-icon {
    animation: fade-in-out 1s infinite;
  }
  
  @keyframes fade-in-out {
    0% {
      opacity: 0;
      transform: scale(0.8);
    }
    50% {
      opacity: 1;
      transform: scale(1);
    }
    100% {
      opacity: 0;
      transform: scale(0.8);
    }
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

  .watermark {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center; /* Center horizontally */
    align-items: center; /* Center vertically */
    pointer-events: none;
}

.text {
  text-align: center;
  opacity: 0.2;
  transform: rotate(25deg);
  font-size: 20px;
}

.noselect {
  -webkit-user-select: none; /* Safari */
  -moz-user-select: none; /* Firefox */
  -ms-user-select: none; /* IE 10 and IE 11 */
  user-select: none; /* Standard syntax */
}
  
.unanswered-border {
  border: 3px solid red;
}
</style>