<script>

// Component
import feather from 'feather-icons';
import FileBrowser from '@/interface/modal/FileBrowser.vue';
import storageManager from '@/plugins/storage';
import debug from '@/plugins/Logger.js';
import moment from 'moment';

moment().format();

export default {
    props: {
      examid: {
        type: String,
        required: true,
      },
    },
    data() {
      const session = storageManager.get('session')
      return {
        configs: storageManager.get('configs'),
        courseData: [],
        examData: [],
        schoolAdmin: [],
        questionData:[],
        parentID:'',
        dataItem: this.examid,
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
        isSaving: false,

        longText:'',
        endpoint:"",

        answerCommand: '', // Add this line
        
        // เพิ่มตัวแปรสำหรับติดตามการเปลี่ยนแปลง
        unsavedChanges: {},
        autoSaveTimeout: null,
        
        // เพิ่มระบบ notification
        notifications: [],
        notificationId: 0,

        // เพิ่มฟีเจอร์ใหม่
        searchQuery: '',
        selectedQuestions: [],
        showBulkActions: false,
        filterType: 'all', // all, text, image, video, fill_blank, essay
        sortBy: 'order', // order, created, modified
        sortDirection: 'asc',
        showStats: true,
        expandAll: false,
        
        // เพิ่มตัวแปรสำหรับประเภทโจทย์ใหม่
        fillBlankAnswers: {}, // เก็บคำตอบสำหรับโจทย์เติมคำ
        essayAnswers: {}, // เก็บคำตอบสำหรับโจทย์อธิบาย
      }
    },
    components: {
      FileBrowser,
    },
    computed: {
      // เพิ่ม computed properties
      filteredQuestions() {
        let filtered = this.questionData.filter(question => {
          // Search filter
          const matchesSearch = !this.searchQuery || 
            question.detail.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
            question.answers.some(answer => 
              answer.detail.toLowerCase().includes(this.searchQuery.toLowerCase())
            );
          
          // Type filter
          const matchesType = this.filterType === 'all' || question.type === this.filterType;
          
          return matchesSearch && matchesType;
        });

        // Sort
        filtered.sort((a, b) => {
          let aValue, bValue;
          switch (this.sortBy) {
            case 'order':
              aValue = a.order;
              bValue = b.order;
              break;
            case 'created':
              aValue = new Date(a.createdAt || 0);
              bValue = new Date(b.createdAt || 0);
              break;
            case 'modified':
              aValue = new Date(a.updatedAt || 0);
              bValue = new Date(b.updatedAt || 0);
              break;
            default:
              aValue = a.order;
              bValue = b.order;
          }
          
          if (this.sortDirection === 'asc') {
            return aValue > bValue ? 1 : -1;
          } else {
            return aValue < bValue ? 1 : -1;
          }
        });

        return filtered;
      },

      questionStats() {
        const total = this.questionData.length;
        const byType = {
          text: this.questionData.filter(q => q.type === 'text').length,
          image: this.questionData.filter(q => q.type === 'image').length,
          video: this.questionData.filter(q => q.type === 'video').length,
          fill_blank: this.questionData.filter(q => q.type === 'fill_blank').length,
          essay: this.questionData.filter(q => q.type === 'essay').length,
        };
        const withAnswers = this.questionData.filter(q => {
          if (q.type === 'fill_blank' || q.type === 'essay') {
            return q.correct_answer && q.correct_answer.trim() !== '';
          }
          return q.answers && q.answers.length > 0;
        }).length;
        const unsaved = Object.keys(this.unsavedChanges).length;
        
        return { total, byType, withAnswers, unsaved };
      },

      allSelected() {
        return this.filteredQuestions.length > 0 && 
               this.selectedQuestions.length === this.filteredQuestions.length;
      },

      someSelected() {
        return this.selectedQuestions.length > 0 && 
               this.selectedQuestions.length < this.filteredQuestions.length;
      }
    },
    methods: {
      // เพิ่มฟังก์ชัน auto-save
      markAsChanged(questionId, field = 'question') {
        if (!this.unsavedChanges[questionId]) {
          this.unsavedChanges[questionId] = {};
        }
        this.unsavedChanges[questionId][field] = true;
        
        // Auto-save หลังจาก 2 วินาที
        if (this.autoSaveTimeout) {
          clearTimeout(this.autoSaveTimeout);
        }
        this.autoSaveTimeout = setTimeout(() => {
          this.autoSaveQuestion(questionId);
        }, 2000);
      },

      async autoSaveQuestion(questionId) {
        const question = this.questionData.find(q => q._id === questionId);
        if (question && this.unsavedChanges[questionId]) {
          try {
            this.isSaving = true;
            await this.updateQuestionData(question);
            delete this.unsavedChanges[questionId];
            this.showNotification('บันทึกข้อมูลอัตโนมัติแล้ว', 'success');
          } catch (error) {
            console.error('Auto-save failed:', error);
            this.showNotification('เกิดข้อผิดพลาดในการบันทึกอัตโนมัติ', 'error');
          } finally {
            this.isSaving = false;
          }
        }
      },

      async processAnswerCommand(question) {
        // บันทึกข้อมูลโจทย์ก่อนเพิ่มคำตอบ
        if (this.unsavedChanges[question._id]) {
          await this.autoSaveQuestion(question._id);
        }

        const unwantedPrefixesAndCharacters = [/ก\.\t/g, /ข\.\t/g, /ค\.\t/g, /ง\.\t/g];
        const answers = this.answerCommand.split('\n')
        .filter(line => line.trim() !== '') // Filter out empty lines
        .map(line => {
          // Remove unwanted prefixes and characters
          unwantedPrefixesAndCharacters.forEach(pattern => {
            line = line.replace(pattern, '');
          });
          return line.trim(); // Trim whitespace
        });

        // ลบคำตอบเดิมทั้งหมดก่อน
        if (question.answers && question.answers.length > 0) {
          for (const answer of question.answers) {
            await this.confirmDeleteAnswer(answer._id);
          }
        }

        // เพิ่มคำตอบใหม่ตามลำดับ
        for (let index = 0; index < answers.length; index++) {
          await this.addAnswerAuto(index, question._id, answers[index]);
        }

        // รีเฟรชข้อมูล
        await this.getData(true);
        this.answerCommand = ''; // เคลียร์ textarea
      },

      inputFocusHandler(event) {
        event.stopPropagation();
      },

      onQuestionDetailChange(question) {
        this.markAsChanged(question._id, 'question');
      },

      onAnswerDetailChange(questionId) {
        this.markAsChanged(questionId, 'answers');
      },

      // เพิ่มฟังก์ชันสำหรับจัดการประเภทโจทย์ใหม่
      onQuestionTypeChange(question) {
        this.markAsChanged(question._id, 'type');
        
        // ถ้าเปลี่ยนเป็น fill_blank หรือ essay และยังไม่มี correct_answer ให้เพิ่ม
        if ((question.type === 'fill_blank' || question.type === 'essay') && !question.correct_answer) {
          question.correct_answer = '';
        }
        
        // ถ้าเปลี่ยนเป็น essay ให้เพิ่ม requires_manual_grading
        if (question.type === 'essay' && !Object.prototype.hasOwnProperty.call(question, 'requires_manual_grading')) {
          question.requires_manual_grading = true;
        }
        
        // ถ้าเปลี่ยนเป็น fill_blank ให้ตั้งค่า requires_manual_grading เป็น false
        if (question.type === 'fill_blank') {
          question.requires_manual_grading = false;
        }
      },

      onCorrectAnswerChange(question) {
        this.markAsChanged(question._id, 'correct_answer');
      },

      // ฟังก์ชันตรวจสอบว่าโจทย์เป็นแบบกรอกคำตอบหรือไม่
      isWrittenQuestion(questionType) {
        return questionType === 'fill_blank' || questionType === 'essay';
      },

      // ฟังก์ชันตรวจสอบว่าต้องตรวจโดยเจ้าหน้าที่หรือไม่
      requiresManualGrading(question) {
        return question.type === 'essay' || question.requires_manual_grading === true;
      },

      async handleButtonClick(item) {
        debug.log(item);
        try {
          // สำหรับประเภทโจทย์ใหม่ ไม่ต้องตรวจสอบ answers
          if (this.isWrittenQuestion(item.type)) {
            await this.deleteQuestion(item._id);
          } else {
            // สำหรับโจทย์แบบตัวเลือก
            if (item.answers.length <= 0) {
              await this.deleteQuestion(item._id);
            } else {
              await this.deleteQuestionAnswer(item);
            }
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
            debug.log("Get Data Silent : Start");
          } else {
            this.loading_sources  = false;
          }
          
          const resAPI          = await fetch("https://gateway.cloudrestfulapi.com/api/exam/" + this.dataItem, {
            method: 'GET',
            headers: {'Content-Type': 'application/json','client-token-key':this.configs.key},
          });

          const RestReturn   = await resAPI.json();
          debug.log(RestReturn);

          if(resAPI.status===200) {
            this.examData         = RestReturn;
            this.parentID         = RestReturn.courseId;
            const courseReturn    = await this.getCourseData(this.parentID)
            const questionReturn  = await this.getQuestionData(this.dataItem);
            this.questionData     = questionReturn

            debug.log("examData",this.examData);
            debug.log("questionData",this.questionData);

            this.questionData = await Promise.all(this.questionData.map(async element => {
              debug.log("element", element._id);
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
              // เรียงลำดับคำตอบตาม order
              element.answers = answerReturn.sort((a, b) => a.order - b.order);
              return element;
            }));

            // เรียงลำดับคำถามตาม order
            this.questionData.sort((a, b) => a.order - b.order);
            this.count = this.questionData.length

            debug.log("questionData",this.questionData);
            debug.log("courseReturn",courseReturn);
            if(courseReturn) {
              this.courseData       = courseReturn;

              if(silent) {
                debug.log("Get Data Silent : Finish");
              } else {
                this.loading_sources  = true;
              }
            }
          }
        } catch (error) {
          debug.log(error)
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
              debug.log(error)
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
              debug.log(error)
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
                  "detail":'โจทย์สำหรับ ' + this.examData.name + 'ข้อที่ ' + parseInt(('0' + (order+1)).slice(-2)),
                  "type":'text',
                  order:parseInt(('0' + (order+1)).slice(-2))
                },
                options: {}
              })
              });
              const result = await callApi.json();
              if(callApi.status===200) {
                await this.getData(true);
                
                // หาข้อสอบใหม่ที่เพิ่งสร้าง
                const newQuestionIndex = this.filteredQuestions.findIndex(q => q._id === result._id);
                if (newQuestionIndex !== -1) {
                  // เปิด panel ของข้อสอบใหม่
                  this.selectedExamIndex = newQuestionIndex;
                  
                  // รอให้ DOM อัปเดตแล้วค่อย scroll
                  this.$nextTick(() => {
                    const panelElement = document.getElementById(`panel-${newQuestionIndex}`);
                    if (panelElement) {
                      // Scroll ไปที่ข้อสอบใหม่
                      const scrollY = panelElement.getBoundingClientRect().top + window.scrollY - 20;
                      this.smoothScrollTo(scrollY);
                      
                      // เพิ่ม highlight effect
                      panelElement.classList.add('bounce-in');
                      setTimeout(() => {
                        panelElement.classList.remove('bounce-in');
                      }, 600);
                    }
                  });
                  
                  this.showNotification('เพิ่มข้อสอบใหม่เรียบร้อยแล้ว', 'success');
                } else {
                  // ถ้าหาไม่เจอ ให้เปิด panel สุดท้าย
                  this.selectedExamIndex = this.filteredQuestions.length - 1;
                  this.showNotification('เพิ่มข้อสอบใหม่เรียบร้อยแล้ว', 'success');
                }
              }
          } catch (error) {
          debug.log(error)
          this.showNotification('เกิดข้อผิดพลาดในการเพิ่มข้อสอบ', 'error');
          }
      },
      async addAnswerAuto(order,question,text) {
        try {
          this.isLoading = true;
          const callApi   = await fetch("https://gateway.cloudrestfulapi.com/api/answer/", {
            method: 'POST',
            headers: {'Content-Type': 'application/json','client-token-key':this.configs.key},
            body: JSON.stringify({
              data: {
                questionID:question,
                detail:text,
                order:parseInt(('0' + (order+1)).slice(-2))
              },
              options: {}
            })
          });
          await callApi.json();
          if(callApi.status===200) {
            // ไม่ต้อง getData ทันที เพื่อให้เพิ่มคำตอบหลายข้อได้เรียงลำดับ
            debug.log(`Added answer ${order+1}: ${text}`);
          }
        } catch (error) {
          debug.log(error)
        } finally {
          this.isLoading = false; // Set isLoading to false when fetch is finished (success or error)
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
                detail: `ตัวเลือกที่ ${order+1}`,
                order:parseInt(('0' + (order+1)).slice(-2))
              },
              options: {}
            })
          });
          await callApi.json();
          if(callApi.status===200) {
            await this.getData(true);
          }
        } catch (error) {
          debug.log(error)
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
          debug.log("selectFileReturnFunction",payload)
          this.updataCover(payload);
        }
      },
      async deleteQuestion(question) {
          if(storageManager.get('session','login')) {
            try {
              debug.log("question",question);
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
                  debug.log("Delete");
                  this.confirmDeleteQuestion(question);
                } else {
                  debug.log("Cancel");
                }
              });
            } catch (error) {
              debug.log(error)
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
          debug.log(error)
        }
      },
      async deleteQuestionAnswer(question) {
        try {
          for (let i = 0; i < question.answers.length; i++) {
            const answer = question.answers[i];
            debug.log("answer",answer);
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
              debug.log("answer",answer);
              await this.updateAnswerData(answer);
            }
            await this.updateQuestionData(question);
            await this.getData(true);
            
            // เคลียร์ unsaved changes
            delete this.unsavedChanges[question._id];
            this.showNotification('บันทึกข้อมูลเรียบร้อยแล้ว', 'success');
        } catch (error) {
            console.error('Error updating answers:', error);
            this.showNotification('เกิดข้อผิดพลาดในการบันทึกข้อมูล', 'error');
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
        debug.log(error)
        }
      },
      async updateQuestionData(updateQuestion) {
        try {
          const data = {
            "type": updateQuestion.type,
            "detail": updateQuestion.detail,
            "correct": updateQuestion.correct
          };

          // เพิ่มฟิลด์สำหรับประเภทโจทย์ใหม่
          if (updateQuestion.correct_answer !== undefined) {
            data.correct_answer = updateQuestion.correct_answer;
          }
          
          if (updateQuestion.requires_manual_grading !== undefined) {
            data.requires_manual_grading = updateQuestion.requires_manual_grading;
          }

          const callApi = await fetch("https://gateway.cloudrestfulapi.com/api/questions/" + updateQuestion._id, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json','client-token-key':this.configs.key},
            body: JSON.stringify({
              data: data,
              options: {}
            })
          });
          await callApi.json();
        } catch (error) {
        debug.log(error)
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
              debug.log("Delete");
              this.confirmDeleteAnswer(answer);
            } else {
              debug.log("Cancel");
            }
          });
        } catch (error) {
          debug.log(error)
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
          debug.log(error)
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

      hasUnsavedChanges(questionId) {
        return this.unsavedChanges[questionId] && Object.keys(this.unsavedChanges[questionId]).length > 0;
      },

      // เพิ่มระบบ notification
      showNotification(message, type = 'success') {
        const notification = {
          id: ++this.notificationId,
          message,
          type,
          show: true
        };
        this.notifications.push(notification);
        
        // ซ่อนหลังจาก 3 วินาที
        setTimeout(() => {
          this.hideNotification(notification.id);
        }, 3000);
      },

      hideNotification(id) {
        const index = this.notifications.findIndex(n => n.id === id);
        if (index > -1) {
          this.notifications.splice(index, 1);
        }
      },

      // เพิ่มฟีเจอร์ใหม่
      toggleQuestionSelection(questionId) {
        const index = this.selectedQuestions.indexOf(questionId);
        if (index > -1) {
          this.selectedQuestions.splice(index, 1);
        } else {
          this.selectedQuestions.push(questionId);
        }
        this.showBulkActions = this.selectedQuestions.length > 0;
      },

      selectAllQuestions() {
        if (this.allSelected) {
          this.selectedQuestions = [];
        } else {
          this.selectedQuestions = this.filteredQuestions.map(q => q._id);
        }
        this.showBulkActions = this.selectedQuestions.length > 0;
      },

      async bulkDeleteQuestions() {
        if (this.selectedQuestions.length === 0) return;
        
        try {
          this.$swal({
            title: `ต้องการลบข้อสอบ ${this.selectedQuestions.length} ข้อ?`,
            text: "หลังจากลบแล้วจะไม่สามารถกู้คืนข้อมูลได้อีก!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "ตกลง ลบเลย",
            cancelButtonText: "ยกเลิก",
          }).then(async (confirmed) => {
            if (confirmed.isConfirmed) {
              this.isLoading = true;
              for (const questionId of this.selectedQuestions) {
                const question = this.questionData.find(q => q._id === questionId);
                if (question) {
                  await this.deleteQuestionAnswer(question);
                }
              }
              this.selectedQuestions = [];
              this.showBulkActions = false;
              await this.getData(true);
              this.showNotification(`ลบข้อสอบ ${this.selectedQuestions.length} ข้อเรียบร้อยแล้ว`, 'success');
            }
          });
        } catch (error) {
          console.error('Bulk delete failed:', error);
          this.showNotification('เกิดข้อผิดพลาดในการลบข้อสอบ', 'error');
        } finally {
          this.isLoading = false;
        }
      },

      toggleExpandAll() {
        this.expandAll = !this.expandAll;
        if (this.expandAll) {
          // ขยายทั้งหมด - ไม่ทำอะไรเพราะจะใช้ CSS
        } else {
          this.selectedExamIndex = null;
        }
      },

      exportQuestions() {
        const data = this.filteredQuestions.map((question, index) => ({
          ลำดับ: index + 1,
          โจทย์: question.detail.replace(/<[^>]*>/g, ''), // ลบ HTML tags
          ประเภท: question.type,
          คำตอบ: question.answers.map((answer, i) => 
            `${String.fromCharCode(65 + i)}. ${answer.detail}`
          ).join(' | '),
          คำตอบที่ถูก: question.answers.find(a => a._id === question.correct)?.detail || 'ไม่ระบุ'
        }));

        // สร้าง CSV
        const csv = this.convertToCSV(data);
        this.downloadCSV(csv, `ข้อสอบ_${this.examData.name || 'export'}.csv`);
        this.showNotification('ส่งออกข้อมูลเรียบร้อยแล้ว', 'success');
      },

      convertToCSV(data) {
        if (!data.length) return '';
        
        const headers = Object.keys(data[0]);
        const csvContent = [
          headers.join(','),
          ...data.map(row => 
            headers.map(header => `"${row[header] || ''}"`).join(',')
          )
        ].join('\n');
        
        return csvContent;
      },

      downloadCSV(csv, filename) {
        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      },

      // Keyboard shortcuts
      handleKeyboardShortcuts(event) {
        if (event.ctrlKey || event.metaKey) {
          switch (event.key) {
            case 'f':
              event.preventDefault();
              this.$refs.searchInput?.focus();
              break;
            case 's':
              event.preventDefault();
              if (this.selectedExamIndex !== null) {
                const question = this.filteredQuestions[this.selectedExamIndex];
                if (question) this.updateAnswer(question);
              }
              break;
            case 'a':
              event.preventDefault();
              this.selectAllQuestions();
              break;
          }
        }
        
        if (event.key === 'Escape') {
          this.selectedExamIndex = null;
          this.selectedQuestions = [];
          this.showBulkActions = false;
        }
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
        
        // เพิ่ม keyboard shortcuts
        document.addEventListener('keydown', this.handleKeyboardShortcuts);
        
      } catch (error) {
        debug.log(Error);
      }
    },
    beforeUnmount() {
      if (this.autoSaveTimeout) {
        clearTimeout(this.autoSaveTimeout);
      }
      // ลบ keyboard event listener
      document.removeEventListener('keydown', this.handleKeyboardShortcuts);
    },
    setup() {
      debug.log("Setup");
    },
};
</script>

<template>

    <FileBrowser v-if="FileBrowserOpen" :isWindowsOpen="true" :allowFileType="['jpg','gif','png','jpeg']" @file-browser-trigger="changeFileTrigger" @select-file-trigger="selectFileTrigger"/>

    <div>
      <!-- Notification System -->
      <div class="fixed top-4 right-4 z-50 space-y-2">
        <div v-for="notification in notifications" :key="notification.id" 
             class="max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden transform transition-all duration-300 ease-in-out"
             :class="{
               'translate-x-0': notification.show,
               'translate-x-full': !notification.show
             }">
          <div class="p-4">
            <div class="flex items-start">
              <div class="flex-shrink-0">
                <div v-if="notification.type === 'success'" class="w-6 h-6 text-green-400">
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                  </svg>
                </div>
                <div v-else-if="notification.type === 'error'" class="w-6 h-6 text-red-400">
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                  </svg>
                </div>
              </div>
              <div class="ml-3 w-0 flex-1 pt-0.5">
                <p class="text-sm font-medium text-gray-900">{{ notification.message }}</p>
              </div>
              <div class="ml-4 flex-shrink-0 flex">
                <button @click="hideNotification(notification.id)" class="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none">
                  <span class="sr-only">ปิด</span>
                  <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading Overlay -->
      <div v-if="isSaving" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 flex items-center space-x-3">
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
          <span class="text-gray-700">กำลังบันทึกข้อมูล...</span>
        </div>
      </div>

      <div class="mx-auto w-full">
        <div class="w-full">
  
          <section aria-labelledby="notes-title" id="root-panel">
            <div class="bg-transparent border-t border-gray-200 pt-4 mt-5">
              <div class="space-y-4">
                <div class="px-0 py-0">
                  <div class="flex items-center justify-between mb-4">
                    <h2 id="notes-title" class="text-sm font-bold text-gray-900">
                      ข้อสอบทั้งหมด 
                      <span class="text-sm font-normal text-gray-500">
                        ({{filteredQuestions.length}}/{{questionStats.total}} ข้อ)
                      </span>
                    </h2>

                    <div class="flex items-center space-x-2">
                      <!-- Export Button -->
                      <button 
                        @click="exportQuestions"
                        type="button" 
                        class="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors">
                        <font-awesome-icon :icon="['fas','download']" class="mr-1 text-xs"/> ส่งออก
                      </button>

                      <!-- Expand All Toggle -->
                      <button 
                        @click="toggleExpandAll"
                        type="button" 
                        class="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors">
                        <font-awesome-icon :icon="expandAll ? ['fas','compress'] : ['fas','expand']" class="mr-1 text-xs"/> 
                        {{expandAll ? 'ย่อทั้งหมด' : 'ขยายทั้งหมด'}}
                      </button>

                      <!-- Add Question Button -->
                      <button 
                        @click.stop="addQuestion(questionData.length)"
                        type="button" 
                        class="inline-flex items-center rounded border border-transparent bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors">
                        <font-awesome-icon :icon="['fas','plus']" class="text-white mr-1 text-xs"/> เพิ่มข้อสอบ 
                      </button>
                    </div>
                  </div>

                  <!-- Search and Filter Bar -->
                  <div class="mb-4 space-y-3">
                    <!-- Search -->
                    <div class="relative">
                      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <font-awesome-icon :icon="['fas','search']" class="h-3 w-3 text-gray-400"/>
                      </div>
                      <input
                        ref="searchInput"
                        v-model="searchQuery"
                        type="text"
                        placeholder="ค้นหาข้อสอบ... (Ctrl+F)"
                        class="block w-full pl-9 pr-3 py-2 border border-gray-200 rounded text-sm bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>

                    <!-- Filters and Sort -->
                    <div class="flex flex-wrap items-center gap-2">
                      <!-- Type Filter -->
                      <select v-model="filterType" class="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white">
                        <option value="all">ทุกประเภท</option>
                        <option value="text">ข้อความ</option>
                        <option value="image">รูปภาพ</option>
                        <option value="video">วิดีโอ</option>
                        <option value="fill_blank">เติมคำ</option>
                        <option value="essay">อธิบาย</option>
                      </select>

                      <!-- Sort -->
                      <select v-model="sortBy" class="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white">
                        <option value="order">เรียงตามลำดับ</option>
                        <option value="created">เรียงตามวันที่สร้าง</option>
                        <option value="modified">เรียงตามวันที่แก้ไข</option>
                      </select>

                      <button @click="sortDirection = sortDirection === 'asc' ? 'desc' : 'asc'" 
                              class="p-1 text-gray-400 hover:text-gray-600 text-xs">
                        <font-awesome-icon :icon="sortDirection === 'asc' ? ['fas','sort-up'] : ['fas','sort-down']"/>
                      </button>

                      <!-- Select All Checkbox -->
                      <div class="flex items-center ml-auto">
                        <input
                          type="checkbox"
                          :checked="allSelected"
                          :indeterminate="someSelected"
                          @change="selectAllQuestions"
                          class="h-3 w-3 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label class="ml-1 text-xs text-gray-600">เลือกทั้งหมด</label>
                      </div>
                    </div>
                  </div>

                  <!-- Stats Cards -->
                  <div v-if="showStats" class="grid grid-cols-2 lg:grid-cols-5 gap-2 mb-4">
                    <div class="bg-blue-50 rounded px-2 py-1.5 border border-blue-100">
                      <div class="text-xs font-medium text-blue-600">ทั้งหมด</div>
                      <div class="text-sm font-semibold text-blue-900">{{questionStats.total}}</div>
                    </div>
                    <div class="bg-green-50 rounded px-2 py-1.5 border border-green-100">
                      <div class="text-xs font-medium text-green-600">มีคำตอบ</div>
                      <div class="text-sm font-semibold text-green-900">{{questionStats.withAnswers}}</div>
                    </div>
                    <div class="bg-yellow-50 rounded px-2 py-1.5 border border-yellow-100">
                      <div class="text-xs font-medium text-yellow-600">ยังไม่บันทึก</div>
                      <div class="text-sm font-semibold text-yellow-900">{{questionStats.unsaved}}</div>
                    </div>
                    <div class="bg-purple-50 rounded px-2 py-1.5 border border-purple-100">
                      <div class="text-xs font-medium text-purple-600">ปรนัย</div>
                      <div class="text-xs text-purple-900">
                        {{questionStats.byType.text + questionStats.byType.image + questionStats.byType.video}}
                      </div>
                    </div>
                    <div class="bg-orange-50 rounded px-2 py-1.5 border border-orange-100">
                      <div class="text-xs font-medium text-orange-600">อัตนัย</div>
                      <div class="text-xs text-orange-900">
                        {{questionStats.byType.fill_blank + questionStats.byType.essay}}
                      </div>
                    </div>
                  </div>

                  <!-- Bulk Actions -->
                  <div v-if="showBulkActions" class="mb-4 p-2 bg-indigo-50 border border-indigo-200 rounded">
                    <div class="flex items-center justify-between">
                      <span class="text-xs font-medium text-indigo-900">
                        เลือกแล้ว {{selectedQuestions.length}} ข้อ
                      </span>
                      <div class="flex items-center space-x-1">
                        <button 
                          @click="bulkDeleteQuestions"
                          class="inline-flex items-center px-2 py-1 text-xs font-medium text-red-600 bg-red-100 hover:bg-red-200 rounded transition-colors">
                          <font-awesome-icon :icon="['fas','trash']" class="mr-1 text-xs"/> ลบที่เลือก
                        </button>
                        <button 
                          @click="selectedQuestions = []; showBulkActions = false"
                          class="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded transition-colors">
                          ยกเลิก
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
                <div class="pb-5">
  
                  <!-- Loading State -->
                  <div v-if="!loading_sources" class="flex items-center justify-center py-8">
                    <div class="text-center">
                      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-3"></div>
                      <p class="text-gray-500 text-sm">กำลังโหลดข้อสอบ...</p>
                    </div>
                  </div>

                  <!-- Questions List -->
                  <div v-else class="space-y-2">
                    <div v-for="(question,index) in filteredQuestions" :key="question._id" 
                    class="p-3 cursor-pointer rounded border border-gray-200 transition-all duration-200 group hover:border-gray-300 hover:bg-gray-50"
                    :id="`panel-${index}`"
                    
                    :class="{ 
                      'border-indigo-300 bg-indigo-50': selectedExamIndex === index, 
                      'border-l-4 border-l-orange-400': hasUnsavedChanges(question._id),
                      'ring-1 ring-indigo-200': selectedQuestions.includes(question._id)
                    }"
                    >
                        <!-- Question Preview -->
                        <fieldset :class="{'hidden': selectedExamIndex === index || expandAll}">
                          
                          <div class="w-full block text-sm font-medium text-gray-900 border-b border-gray-100 pb-2 hover:text-blue-600 transition-colors relative" >
                            <!-- Checkbox สำหรับ bulk selection -->
                            <div class="absolute top-0 left-0 opacity-0 group-hover:opacity-100 transition-opacity">
                              <input
                                type="checkbox"
                                :checked="selectedQuestions.includes(question._id)"
                                @change="toggleQuestionSelection(question._id)"
                                @click.stop
                                class="h-3 w-3 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                              />
                            </div>

                            <!-- ปุ่มลบมุมขวาบน -->
                            <button 
                              @click.stop="handleButtonClick(question)"
                              type="button" 
                              class="absolute top-0 right-0 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors opacity-0 group-hover:opacity-100"
                              title="ลบข้อสอบนี้">
                              <font-awesome-icon :icon="['fas','trash']" class="text-xs"/>
                            </button>

                            <div class="flex items-start justify-between pr-6 pl-5">
                              <div class="flex-1">
                                <span class="inline-block w-6 text-indigo-600 text-sm font-medium">{{(index+1)}}.</span>
                                <div @click="togglePanel(index,question)" v-html="question.detail" class="inline text-sm font-bold"></div>
                              </div>
                              <div class="flex items-center space-x-1 ml-3">
                                <span v-if="hasUnsavedChanges(question._id)" class="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                  <div class="w-1.5 h-1.5 bg-orange-400 rounded-full mr-1 animate-pulse"></div>
                                  ยังไม่บันทึก
                                </span>
                                <span v-if="requiresManualGrading(question)" class="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                  <font-awesome-icon :icon="['fas','user-graduate']" class="mr-1 text-xs"/>
                                  ตรวจเอง
                                </span>
                                <span class="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium"
                                      :class="{
                                        'bg-gray-100 text-gray-700': ['text', 'image', 'video'].includes(question.type),
                                        'bg-green-100 text-green-700': question.type === 'fill_blank',
                                        'bg-purple-100 text-purple-700': question.type === 'essay'
                                      }">
                                  <span v-if="question.type === 'text'">ข้อความ</span>
                                  <span v-else-if="question.type === 'image'">รูปภาพ</span>
                                  <span v-else-if="question.type === 'video'">วิดีโอ</span>
                                  <span v-else-if="question.type === 'fill_blank'">เติมคำ</span>
                                  <span v-else-if="question.type === 'essay'">อธิบาย</span>
                                  <span v-else>{{question.type}}</span>
                                </span>
                              </div>
                            </div>
                          </div>

                          <div class="mt-2 w-full pl-5">
                              <!-- Multiple Choice Answers -->
                              <div v-if="!isWrittenQuestion(question.type)">
                                <div v-for="(answer, answerIndex) in question.answers" :key="answer._id" class="flex items-center py-1">
                                  <div class="flex items-center">
                                    <span class="inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-medium mr-2"
                                          :class="question.correct === answer._id ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'">
                                      {{String.fromCharCode(65 + answerIndex)}}
                                    </span>
                                    <input v-if="(question.correct===answer._id)" type="radio" checked class="h-3 w-3 border-gray-300 text-indigo-600 focus:ring-indigo-500 mr-2" disabled readonly>
                                    <input v-else :id="answer._id" type="radio" class="h-3 w-3 border-gray-300 text-indigo-600 focus:ring-indigo-500 mr-2" disabled readonly>
                                    <label class="block text-sm text-gray-700">{{answer.detail}}</label>
                                  </div>
                                </div>
                              </div>

                              <!-- Written Answer Preview -->
                              <div v-else-if="isWrittenQuestion(question.type)" class="space-y-2">
                                <div v-if="question.type === 'fill_blank'" class="p-2 bg-green-50 border border-green-200 rounded">
                                  <div class="flex items-center text-green-700 mb-1">
                                    <font-awesome-icon :icon="['fas','edit']" class="mr-1 text-xs"/>
                                    <span class="text-xs font-medium">ช่องกรอกคำตอบ:</span>
                                  </div>
                                  <div class="border-b-2 border-dotted border-green-300 py-1 text-xs text-green-600">
                                    [ผู้เรียนกรอกคำตอบที่นี่]
                                  </div>
                                  <div v-if="question.correct_answer" class="mt-2 text-xs text-green-600">
                                    <span class="font-medium">เฉลย:</span> {{question.correct_answer}}
                                  </div>
                                </div>

                                <div v-else-if="question.type === 'essay'" class="p-2 bg-purple-50 border border-purple-200 rounded">
                                  <div class="flex items-center text-purple-700 mb-1">
                                    <font-awesome-icon :icon="['fas','file-alt']" class="mr-1 text-xs"/>
                                    <span class="text-xs font-medium">พื้นที่เขียนคำตอบ:</span>
                                  </div>
                                  <div class="bg-white border border-purple-200 rounded p-2 h-16 text-xs text-purple-400 italic">
                                    [ผู้เรียนเขียนคำตอบที่นี่]
                                  </div>
                                  <div class="mt-1 text-xs text-purple-600">
                                    <font-awesome-icon :icon="['fas','user-graduate']" class="mr-1"/>
                                    ต้องให้เจ้าหน้าที่ตรวจและให้คะแนน
                                  </div>
                                </div>
                              </div>
                          </div>

                        </fieldset>

                        <!-- Edit Panel -->
                        <div class="mt-2 relative" v-if="isOpenPanel(index) || expandAll" :data-content="'กำลังบันทึกข้อมูล...'" :class="{ 'isblock': isLoading }">
                          <div class="pb-3 font-medium flex justify-between items-center border-b border-gray-100">
                            <div class="flex items-center space-x-2">
                              <span class="text-sm text-gray-900">แก้ไขข้อสอบข้อที่ {{(index+1)}}</span>
                              <span v-if="hasUnsavedChanges(question._id)" class="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                <div class="w-1.5 h-1.5 bg-orange-400 rounded-full mr-1 animate-pulse"></div>
                                มีการเปลี่ยนแปลง
                              </span>
                            </div>
                            <button 
                              @click.stop="hidePanel"
                              type="button" 
                              class="inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors">
                              <font-awesome-icon :icon="['fas','times']" class="text-gray-600 mr-1 text-xs"/> ปิด 
                            </button>
                          </div>
                          
                          <div class="space-y-3 mt-3">
      
                            <!-- Question Type -->
                            <div>
                              <label class="block text-xs font-medium text-gray-700 mb-1">ประเภทคำถาม</label>
                              <div class="grid grid-cols-2 gap-2">
                                <div class="flex items-center">
                                  <input v-model="question.type" @change="onQuestionTypeChange(question)" :id="`type_text_${question._id}`" value="text" :name="`type_${question._id}`" type="radio" class="h-3 w-3 border-gray-300 text-indigo-600 focus:ring-indigo-500 focus:ring-1">
                                  <label :for="`type_text_${question._id}`" class="ml-1 text-xs text-gray-600">ข้อความ</label>
                                </div>
      
                                <div class="flex items-center">
                                  <input v-model="question.type" @change="onQuestionTypeChange(question)" :id="`type_image_${question._id}`" value="image" :name="`type_${question._id}`" type="radio" class="h-3 w-3 border-gray-300 text-indigo-600 focus:ring-indigo-500 focus:ring-1">
                                  <label :for="`type_image_${question._id}`" class="ml-1 text-xs text-gray-600">รูปภาพ</label>
                                </div>
                          
                                <div class="flex items-center">
                                  <input v-model="question.type" @change="onQuestionTypeChange(question)" :id="`type_video_${question._id}`" value="video" :name="`type_${question._id}`" type="radio" class="h-3 w-3 border-gray-300 text-indigo-600 focus:ring-indigo-500 focus:ring-1">
                                  <label :for="`type_video_${question._id}`" class="ml-1 text-xs text-gray-600">วิดีโอ</label>
                                </div>

                                <div class="flex items-center">
                                  <input v-model="question.type" @change="onQuestionTypeChange(question)" :id="`type_fill_blank_${question._id}`" value="fill_blank" :name="`type_${question._id}`" type="radio" class="h-3 w-3 border-gray-300 text-green-600 focus:ring-green-500 focus:ring-1">
                                  <label :for="`type_fill_blank_${question._id}`" class="ml-1 text-xs text-gray-600">เติมคำ</label>
                                </div>

                                <div class="flex items-center">
                                  <input v-model="question.type" @change="onQuestionTypeChange(question)" :id="`type_essay_${question._id}`" value="essay" :name="`type_${question._id}`" type="radio" class="h-3 w-3 border-gray-300 text-purple-600 focus:ring-purple-500 focus:ring-1">
                                  <label :for="`type_essay_${question._id}`" class="ml-1 text-xs text-gray-600">อธิบาย</label>
                                </div>
                              </div>
                              
                              <!-- แสดงคำอธิบายเพิ่มเติมสำหรับประเภทใหม่ -->
                              <div v-if="question.type === 'fill_blank'" class="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs">
                                <div class="flex items-center text-green-700">
                                  <font-awesome-icon :icon="['fas','info-circle']" class="mr-1"/>
                                  <span class="font-medium">โจทย์เติมคำ:</span>
                                </div>
                                <p class="text-green-600 mt-1">ผู้เรียนจะกรอกคำตอบสั้นๆ ระบบสามารถตรวจสอบอัตโนมัติได้</p>
                              </div>
                              
                              <div v-if="question.type === 'essay'" class="mt-2 p-2 bg-purple-50 border border-purple-200 rounded text-xs">
                                <div class="flex items-center text-purple-700">
                                  <font-awesome-icon :icon="['fas','info-circle']" class="mr-1"/>
                                  <span class="font-medium">โจทย์อธิบาย:</span>
                                </div>
                                <p class="text-purple-600 mt-1">ผู้เรียนจะเขียนคำตอบยาว ต้องให้เจ้าหน้าที่ตรวจสอบ</p>
                              </div>
                            </div>

                            <!-- Question Detail -->
                            <div>
                              <label class="block text-xs font-medium text-gray-700 mb-1">โจทย์</label>
                              <textarea
                              v-if="question && question.detail" 
                              v-model="question.detail" 
                              @input="onQuestionDetailChange(question)"
                              @focus="inputFocusHandler"
                              rows="3" 
                              class="block w-full text-sm border border-gray-200 rounded focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
                              placeholder="กรอกโจทย์ข้อสอบ...">
                              </textarea>
                            </div>

                            <!-- Correct Answer for Written Questions -->
                            <div v-if="isWrittenQuestion(question.type)">
                              <label class="block text-xs font-medium text-gray-700 mb-1">
                                <span v-if="question.type === 'fill_blank'">เฉลยสำหรับตรวจอัตโนมัติ</span>
                                <span v-else-if="question.type === 'essay'">เฉลยสำหรับอ้างอิง (ไม่ใช้ตรวจอัตโนมัติ)</span>
                              </label>
                              
                              <div v-if="question.type === 'fill_blank'">
                                <textarea
                                  v-model="question.correct_answer"
                                  @input="onCorrectAnswerChange(question)"
                                  @focus="inputFocusHandler"
                                  rows="2"
                                  class="block w-full text-sm border border-green-200 rounded focus:border-green-500 focus:ring-1 focus:ring-green-500 resize-none"
                                  placeholder="กรอกคำตอบที่ถูกต้อง (ใช้ | เพื่อแยกคำตอบที่ถูกหลายแบบ เช่น กรุงเทพฯ|กรุงเทพมหานคร)">
                                </textarea>
                                <p class="mt-1 text-xs text-green-600">
                                  <font-awesome-icon :icon="['fas','robot']" class="mr-1"/>
                                  ระบบจะตรวจสอบอัตโนมัติโดยเปรียบเทียบกับเฉลยนี้
                                </p>
                              </div>

                              <div v-else-if="question.type === 'essay'">
                                <textarea
                                  v-model="question.correct_answer"
                                  @input="onCorrectAnswerChange(question)"
                                  @focus="inputFocusHandler"
                                  rows="4"
                                  class="block w-full text-sm border border-purple-200 rounded focus:border-purple-500 focus:ring-1 focus:ring-purple-500 resize-none"
                                  placeholder="กรอกแนวคำตอบสำหรับอ้างอิงในการตรวจ (ไม่บังคับ)">
                                </textarea>
                                <p class="mt-1 text-xs text-purple-600">
                                  <font-awesome-icon :icon="['fas','user-graduate']" class="mr-1"/>
                                  จำเป็นต้องให้เจ้าหน้าที่ตรวจและให้คะแนนเอง
                                </p>
                              </div>
                            </div>

                            <!-- Answer Command (only for multiple choice questions) -->
                            <div v-if="!isWrittenQuestion(question.type)" class="border-t border-gray-100 pt-3">
                              <div class="flex items-center justify-between mb-1">
                                <label class="block text-xs font-medium text-gray-700">เพิ่มคำตอบแบบรวดเร็ว</label>
                                <button 
                                @click="processAnswerCommand(question)"
                                :disabled="!answerCommand.trim()"
                                type="button" 
                                class="inline-flex items-center px-2 py-1 text-xs font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors">
                                <font-awesome-icon :icon="['fas','magic']" class="mr-1 text-xs"/> ประมวลผล
                                </button>
                              </div>
                              <textarea
                                v-model="answerCommand" 
                                @focus="inputFocusHandler"
                                rows="3"
                                placeholder="วางคำตอบทั้งหมดที่นี่ (แต่ละบรรทัดคือ 1 ตัวเลือก)"
                                class="block w-full text-sm border border-gray-200 rounded focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none">
                              </textarea>
                              <p class="mt-1 text-xs text-gray-500">
                                * จะลบคำตอบเดิมทั้งหมดและเพิ่มใหม่ตามที่กรอก
                              </p>
                            </div>

                            <!-- Answers (only for multiple choice questions) -->
                            <div v-if="!isWrittenQuestion(question.type)">
                              <div class="flex items-center justify-between mb-2">
                                <label class="block text-xs font-medium text-gray-900">คำตอบ</label>
                                <button 
                                @click.stop="addAnswer(question.answers.length,question._id)"
                                type="button" 
                                class="inline-flex items-center px-2 py-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 focus:outline-none">
                                <font-awesome-icon :icon="['fas','plus']" class="mr-1 text-xs"/> เพิ่ม
                                </button>
                              </div>

                              <div class="space-y-1">
                                <div v-for="(answer, answerIndex) in question.answers" :key="answer._id" 
                                     class="flex items-center space-x-2 group hover:bg-gray-50 rounded px-2 py-1 transition-colors">
                                  <div class="flex items-center space-x-2 flex-shrink-0">
                                    <span class="inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                      {{String.fromCharCode(65 + answerIndex)}}
                                    </span>
                                    <input v-model="question.correct" :id="answer._id" :name="question._id" :value="answer._id" type="radio" class="h-3 w-3 border-gray-300 text-indigo-600 focus:ring-indigo-500 focus:ring-1">
                                  </div>
                                  <div class="flex-1 min-w-0">
                                    <input
                                      v-model="answer.detail"
                                      @input="onAnswerDetailChange(question._id)"
                                      @focus="inputFocusHandler"
                                      type="text"
                                      class="block w-full text-sm border-0 border-b border-transparent hover:border-gray-200 focus:border-indigo-500 focus:ring-0 bg-transparent px-0 py-1"
                                      :placeholder="`ตัวเลือกที่ ${answerIndex + 1}`"
                                    />
                                  </div>
                                  <button @click="deleteAnswer(answer._id)" class="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 focus:outline-none transition-all">
                                    <font-awesome-icon :icon="['fas', 'trash']" class="text-xs" />
                                  </button>
                                </div>
                              </div>
                            </div>
                            
                          </div>

                          <!-- Action Buttons -->
                          <div class="border-t border-gray-100 pt-3 mt-3 flex justify-between">
                            <button 
                            @click="handleButtonClick(question)"
                            type="button" 
                            class="inline-flex items-center px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 hover:border-red-300 rounded focus:outline-none focus:ring-1 focus:ring-red-500 transition-colors">
                            <font-awesome-icon :icon="['fas','trash']" class="mr-1 text-xs"/> ลบ
                            </button>

                            <button 
                            @click.stop="updateAnswer(question)"
                            type="button" 
                            class="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors">
                            <font-awesome-icon :icon="['fas','save']" class="mr-1 text-xs"/> บันทึก 
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

<style scoped>
.isblock::before {
  content: attr(data-content);
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: #4F46E5;
  z-index: 10;
  border-radius: 0.5rem;
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: .5;
  }
}

/* เพิ่ม animations ใหม่ */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active {
  transition: all 0.3s ease-out;
}

.slide-up-enter-from {
  transform: translateY(20px);
  opacity: 0;
}

.bounce-in {
  animation: bounceIn 0.6s ease-out;
}

@keyframes bounceIn {
  0% {
    transform: scale(0.3);
    opacity: 0;
  }
  50% {
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.shake {
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

/* Hover effects */
.hover-lift {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

/* Loading spinner */
.spinner {
  border: 2px solid #f3f3f3;
  border-top: 2px solid #4F46E5;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Gradient backgrounds */
.gradient-bg {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.gradient-text {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Custom scrollbar */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Glassmorphism effect */
.glass {
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.18);
}

/* Progress bar */
.progress-bar {
  height: 4px;
  background: linear-gradient(90deg, #4F46E5 0%, #7C3AED 100%);
  border-radius: 2px;
  transition: width 0.3s ease;
}

/* Notification animations */
.notification-enter-active {
  transition: all 0.3s ease-out;
}

.notification-leave-active {
  transition: all 0.3s ease-in;
}

.notification-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.notification-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

/* Button hover effects */
.btn-primary {
  position: relative;
  overflow: hidden;
}

.btn-primary::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.btn-primary:hover::before {
  left: 100%;
}

/* Card hover effects */
.card-hover {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-hover:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

/* Text selection */
::selection {
  background-color: #4F46E5;
  color: white;
}

/* Focus styles */
.focus-ring:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
  border-color: #4F46E5;
}

/* Responsive animations */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>