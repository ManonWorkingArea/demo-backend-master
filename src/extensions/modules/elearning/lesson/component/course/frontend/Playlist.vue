<script>
import storageManager from '@/plugins/storage';
import convertUtils from "@/plugins/convertUtils";
import deviceUtils from "@/plugins/DeviceUtils";

import spinner from "@/interface/template/Spinner.vue";

import requestClient from '@/plugins/requestClient';
const Request = new requestClient(false);

import debug from '@/plugins/Logger.js';

const statusArray = [
  { name: 'pending', label: 'รอเรียน', styleClass: 'bg-gray-300 text-gray-600', icon: 'hourglass-start' },
  { name: 'processing', label: 'กำลังเรียน', styleClass: 'bg-yellow-300 text-yellow-800', icon: 'spinner' },
  { name: 'complete', label: 'เรียนจบแล้ว', styleClass: 'bg-green-300 text-green-800', icon: 'check' },
];

export default {
	name: 'Lesson Playlist',
	components: {spinner},
    props: {
        courseData: Object,
        dataItem: String,
        playerItem: String,
        playOption: String,
        debug: Boolean,
    },
	data() {
		return {
      receivedEvents: [],
      receivedProgressStatus: '',
      login: storageManager.get('session','login'),
      configs: storageManager.get('configs'),
      session: storageManager.get('session'),
      enroll:storageManager.get('session','enroll'),
      deviceType: deviceUtils.deviceDetect(),
      exam:[],
      lesson:[],
      players:[],
      player:[],
      progress:[],
      progressArray:[],
      enrollData:[],
      param_id:"",
      param_ep:"",
      loading_sources: false,
      dataFromChild: null,
      analytics: {
        counts: []
      },
      resEnrollData:[],
		}
	},
	methods: {
      calculateAnalytics() {
        let totalItems = 0;
        let itemsWithProgress = 0;
        let itemsComplete = 0;
        let itemsProgress = 0;

        function traverseItems(items) {
            items.forEach(item => {
                if (item.type !== 'folder') {
                    totalItems++;
                    if (item.progress) {
                        itemsWithProgress++;
                        if (item.progress.status === "complete") {
                            itemsComplete++;
                        } else if (item.progress.status === "processing") {
                            itemsProgress++;
                        }
                    }
                }
                // Check for nested subItems and recursively call the function
                if (item.subItems && Array.isArray(item.subItems)) {
                    traverseItems(item.subItems);
                }
            });
        }

        traverseItems(this.groupedPlayers.allItems);

        let itemsPending = totalItems - itemsWithProgress;
        let percentComplete = totalItems > 0 ? (itemsComplete / totalItems) * 100 : 0;

        this.analytics = {
            counts: [{
                totalItems: totalItems,
                itemsWithProgress: itemsWithProgress,
                itemsComplete: itemsComplete,
                itemsProgress: itemsProgress,
                itemsPending: itemsPending,
                percentComplete: parseFloat(percentComplete.toFixed(2))
            }]
        };

        // Calculator Data Of Analytics
        console.log(":: Calculator Data Of Analytics");
        //console.log("Analytics", this.analytics);
        this.getEnrollData();
    },

    async getEnrollData() {
      try {
        const resAPIEnroll = await Request.POST('enroll/query', {
          method: 'find',
          args: [{ $and: [{ courseID: this.courseData._id, userID: this.session.userID }] }]
        }, this.configs.key, true);

        if (resAPIEnroll.status !== 200) {
          throw new Error(`Failed to fetch enroll data from API`);
        }

        const enrollReturn = resAPIEnroll.data[0];
        this.resEnrollData = enrollReturn;

        // Call updateEnroll with the fetched data and calculated analytics
        this.updateEnroll(this.analytics);
      } catch (error) {
        console.error(error);
      }
    },
    async updateEnroll(calculatedAnalytics) {
      try {
        //console.log("calculatedAnalytics",calculatedAnalytics);
        // Get the current analytics from the enrollment data
        let currentAnalytics = { ...this.resEnrollData.analytics };

        // Create updated fields from calculated analytics
        const updatedFields = {
          percent: calculatedAnalytics.counts[0].percentComplete || 0,
          total: calculatedAnalytics.counts[0].totalItems || 0,
          pending: calculatedAnalytics.counts[0].itemsPending || 0,
          processing: calculatedAnalytics.counts[0].itemsProgress || 0,
          complete: calculatedAnalytics.counts[0].itemsComplete || 0,
          status: calculatedAnalytics.counts[0].itemsComplete < calculatedAnalytics.counts[0].totalItems ? 'processing' : 'complete',
          message: calculatedAnalytics.counts[0].itemsComplete < calculatedAnalytics.counts[0].totalItems ? 'กำลังเรียน' : 'เรียนจบแล้ว'
        };

        // Merge updated fields into current analytics
        const updatedAnalytics = {
          ...currentAnalytics,
          ...updatedFields
        };

        //console.log("updatedAnalytics",updatedAnalytics);

        

        // Making a PUT request to update the server state
        const enroll2API = await Request.PUT(`enroll/${this.resEnrollData._id}`, {
          data: { analytics: updatedAnalytics },
        }, this.configs.key);

        // Handle the response if needed
        if (enroll2API.status === 200) {
          //console.log("Enrollment updated successfully:", enroll2API.data);
        } else {
          console.error("Failed to update enrollment:", enroll2API);
        }
        
      } catch (error) {
        console.error("Error updating enrollment:", error);
      }
    },
    checkAnalytics() {
      // Check if groupedPlayers exists.
      if (this.groupedPlayers) {
        // Check if enrollData, analytics, or status is not defined or has no data.
        if (!this.enrollData || !this.enrollData.analytics || !this.enrollData.analytics.status) {
          // Handle the case where there is no data. 
          // You can return something specific here, or throw an error, or even set a default value.
          return "No data"; // Example: return a default message or value.
        }
        // If there is data in enrollData.analytics.status, return it.
        return this.enrollData.analytics.status;
      }
      // Optional: handle the case where groupedPlayers is not defined.
    },
    checkDue() {
      const dueDate = new Date(this.courseData.endDate);
      const now = new Date();
      return now < dueDate;
    },
    checkPostExamDue(date) {
      const timeZoneOffset = 7 * 60; // Thailand is GMT+7, in minutes
      // Convert posttestDate to Date object in UTC and adjust for Thailand timezone
      const dueDate = new Date(date);
      const dueDateInThailand = new Date(dueDate.getUTCFullYear(), dueDate.getUTCMonth(), dueDate.getUTCDate(), dueDate.getUTCHours(), dueDate.getUTCMinutes() + timeZoneOffset);
      
      // Now in UTC adjusted for Thailand timezone
      const now = new Date();
      const nowInThailand = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes() + timeZoneOffset);
      
      return nowInThailand < dueDateInThailand;
    },
    isLinkClickable(exam) {
      // First, check if the exam due date has passed
      if (this.checkPostExamDue(exam.show_duedate)) {
        // If the exam due date has not passed, return false to make the link not clickable
        return false;
      } else {
        // Check if score data exists
        if (exam.score && exam.score.score !== undefined && exam.score.score !== '') {
          // If score is less than measure and is_repeat is 'no', return false
          if (exam.score.score < exam.measure && exam.is_repeat === 'no') {
            return false;
          }
          // If score meets or exceeds the measure but is_repeat is 'yes', also return false
          if (exam.score.score >= exam.measure && exam.is_repeat === 'yes') {
            return false;
          }
          // For all other cases where score exists, return true
          return true;
        }
        // Default to true if score data doesn't exist
        return true;
      }
      
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
    getFilteredExams(type) {
      if (this.exam && this.exam.length) {
          return this.exam.filter((exam) => exam.type === type);
      }
      return [];
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
    async getData(silence=false) {
      try {
          debug.log("getData : Playlist");
          if(!silence) {
            this.loading_sources = true;
          } else {
            console.log(":: Silence Call");
          }
        
          // Fetch course data
          const responseHost = await Request.GET(`course/${this.dataItem}`, this.configs.key, true);
          if (responseHost.status !== 200) {
            throw new Error(`Failed to fetch course data from API`);
          }
          this.lesson = responseHost.data;

          // Fetch Player Data
          const resAPILogin = await Request.POST('player/query', {
            method: 'find',
            hidden: ['lecturer', 'updatedAt'],
            args: [{ 
              $and: [
                { courseId: this.lesson.master },
                { status: { $ne: true } } // Adding condition to check status is not false
              ] 
            }]
          }, this.configs.key, true);

          if (resAPILogin.status !== 200) {
            throw new Error(`Failed to fetch player data from API`);
          }
          const playerReturn = resAPILogin.data;

          // Fetch Enroll Data
          const resAPIEnroll = await Request.POST('enroll/query', {
            method: 'find',
            args: [{ $and: [{ courseID: this.dataItem, userID: this.session.userID }] }]
          }, this.configs.key, true);
          if (resAPIEnroll.status !== 200) {
            throw new Error(`Failed to fetch enroll data from API`);
          }
          const enrollReturn = resAPIEnroll.data;
          this.enrollData = enrollReturn[0];

          // Fetch Exam Data
          const resAPIExam = await Request.POST('exam/query', {
            method: 'find',
            args: [{ $and: [{ courseId: this.lesson.master }] }]
          }, this.configs.key);
          if (resAPIExam.status === 200) {
              const examReturn = resAPIExam.data;
              // Fetch Score Data for each exam
              const examsWithScore = await Promise.all(examReturn.map(async (exam) => {
                  const resAPIScore = await Request.POST('score/query', {
                    method: 'find',
                    args: [{
                        $and: [
                            { userID: this.session.userID },
                            { examID: exam._id },
                            { courseID: this.dataItem },
                            { type: { $ne: 'retest' } }  // Adding the new condition
                        ]
                    }]
                  }, this.configs.key, true);
                  if (resAPIScore.status === 200) {
                    const score = resAPIScore.data;
                    return { ...exam, score: score[score.length - 1] };
                  } else {
                    debug.log(`Failed to fetch score data for exam: ${exam._id}`);
                    return exam;
                  }
              }));
              this.exam = examsWithScore;
              //console.log("Exam",this.exam);
          } else {
            debug.log("Failed to fetch exam data from API");
          }
          
          const { userID } = this.session;
          // Fetch Progress Data
          const resAPIProgress = await Request.POST('progress/query', {
            method: 'find',
            args: [{ $and: [{ courseID: this.dataItem, userID: userID }]}]
          }, this.configs.key);
          if (resAPIProgress.status === 200) {
              const progressReturn  = resAPIProgress.data;
              this.progressArray    = progressReturn;
              const playerID        = this.playerItem;
              const playerData      = playerReturn.find(item => item._id === playerID);
              this.players          = playerReturn;
              this.player           = playerData;
              this.players = this.players.map((player) => {
                const matchingProgress = this.progressArray.find(
                  (progressItem) => progressItem.playerID === player._id
                );

                // Check if player.not_visible is undefined and set it to false if it is
                const notVisible = player.not_visible !== undefined ? player.not_visible : false;

                if (matchingProgress) {
                  return { ...player, progress: matchingProgress, not_visible: notVisible };
                }
                return { ...player, not_visible: notVisible };
              });

              this.loading_sources = false;

              if(!silence) {
                this.loading_sources = false;
              } else {
                console.log(":: Silence Call");
              }
          } else {
            debug.log("Failed to fetch progress data from API");
          }
      } catch (error) {
        console.error(error);
      }
    }
	},
  async mounted () {
    try {
      await this.getData();
      this.dataFromChild = this.groupedPlayers;
      this.$emit('data-fetched', this.groupedPlayers);
    } catch (error) {
      debug.log(Error);
    }
  },
  watch: {
    hasItems(newValue) {
      if (newValue) {
        this.calculateAnalytics();
      }
    }
  },
  computed: {
    enrollAccess() {
      if (!this.enroll || !Array.isArray(this.enroll)) {
        return false;
      }
      const courseId = this.dataItem;
      const course = this.enroll.find(item => item.courseID === courseId);
      return !!course; // returns true if course is found, false otherwise
    },
    hasItems() {
      // This computed property will return true if allItems.length > 0
      return this.groupedPlayers.allItems.length > 0;
    },
    groupedPlayers() {

      const access = this.enrollAccess;
      // PRE Test score
      // PRE Test score
      const checkExamPre = this.exam.some(exam => exam.type === 'pre');
      const checkExamPreItem = this.exam.find(exam => exam.type === 'pre');

      const checkExamPreScore = (() => {
        if (checkExamPre) {
          if (checkExamPreItem.score !== null && checkExamPreItem.score !== undefined) {
            return true;
          } else {
            return false;
          }
        } else {
          return true;
        }
      })();

      debug.log("score", checkExamPreScore);
      debug.log("playOption", this.playOption);


      // POST Test score
      const checkExamPost      = this.exam.some(exam => exam.type === 'post');
      const checkExamPostItem  = this.exam.find(exam => exam.type === 'post');

      // Mapping Folder
      const folders           = this.players.filter(p => p.type === 'folder');
      const subItems          = this.players.filter(p => p.type !== 'folder');

      // Helper function to check if the 'order' property is a valid string
      const isOrderValidString = (item) => typeof item.order === 'string';

      // Function to sort items based on the 'order' property
      const sortItems = (items) => {
        return items.sort((a, b) => {
          if (!isOrderValidString(a)) {
            return -1; // Handle cases where 'order' is missing or not a string
          }
          if (!isOrderValidString(b)) {
            return 1; // Handle cases where 'order' is missing or not a string
          }
          return a.order.localeCompare(b.order);
        });
      };

      // Updated code with the modified sorting
      const subItemsByFolder = folders.map(folder => ({
        ...folder,
        subItems: sortItems(subItems.filter(subItem => subItem.root === folder._id))
      }));

      const rootItems = sortItems(subItems.filter(subItem => !subItemsByFolder.some(folder => folder._id === subItem.root)));
      const allItems = sortItems([...subItemsByFolder, ...rootItems]);

      const playlist = allItems.reduce((acc, curr) => {
        if (curr.type !== 'folder') {
          acc.push({ ...curr, canPlay: true }); // add canPlay property to each player object
        } else {
          curr.subItems.forEach(subItem => {
            if (subItem.type !== 'folder') {
              acc.push({ ...subItem, canPlay: false }); // add canPlay property to each player object
            }
          });
        }
        return acc;
      }, []);

      if (this.playOption === 'full' && checkExamPreScore) {
        for (let i = 0; i < allItems.length; i++) {
          allItems[i].canPlay = true;

          const processSubItem = (subItem) => {
            const now = new Date().getTime();
            if (subItem.public_by_date) {
              const startDate = subItem.start_date ? new Date(subItem.start_date).getTime() : null;
              const stopDate = subItem.stop_date ? new Date(subItem.stop_date).getTime() : null;
              if (startDate && stopDate) {
                if (now < startDate) {
                  subItem.canPlay = false;
                  subItem.canPlayMessage = `ยังไม่ถึงกำหนด (จะเปิดในวันที่ ${new Date(startDate).toLocaleDateString()})`;
                } else if (now > stopDate) {
                  subItem.canPlay = false;
                  subItem.canPlayMessage = 'เลยกำหนดเปิดเรียน';
                } else {
                  subItem.canPlay = true;
                  subItem.canPlayMessage = 'อยู่ระหว่างเปิดเรียน';
                }
              } else {
                subItem.canPlay = false;
                subItem.canPlayMessage = 'ยังไม่กำหนดวันที่เปิดเรียน';
              }
            } else if (subItem.not_visible) {
              const currentUserID = this.session.userID; // Replace with the actual current user ID
              const userAssignment = subItem.assignments ? subItem.assignments.find(assignment => assignment.userID === currentUserID) : null;
              if (userAssignment) {
                if (userAssignment.expire === 'none') {
                  subItem.canPlay = true;
                  subItem.canPlayMessage = '';
                } else {
                  const expireDate = new Date(userAssignment.expire).getTime();
                  if (expireDate < now) {
                    subItem.canPlay = false;
                    subItem.canPlayMessage = 'ปิดการเข้าเรียนแล้ว รอเรียนสด ครั้งต่อไป';
                  } else {
                    subItem.canPlay = true;
                    subItem.canPlayMessage = '';
                  }
                }
              } else {
                subItem.canPlay = false;
                subItem.canPlayMessage = 'ปิดการเข้าเรียนแล้ว รอเรียนสด ครั้งต่อไป';
              }
            } else {
              subItem.canPlay = true;
            }
          };

          if (allItems[i].type === 'folder') {
            allItems[i].subItems.forEach(subItem => {
              processSubItem(subItem);
            });
          } else {
            processSubItem(allItems[i]);
          }
        }

      } else {
        for (let i = 0; i < playlist.length; i++) {
          if (i === 0) {
            playlist[i].canPlay = true;
          } else {
            const prevPlayer = playlist[i - 1];
            if (prevPlayer.progress && prevPlayer.progress.status === 'complete') {
              playlist[i].canPlay = true;
            } else {
              if(this.enrollAccess){
                playlist[i].canPlay = false;
              }
            }
          }
        }
        for (let i = 0; i < allItems.length; i++) {
          const item = allItems[i];
          if (item.type !== 'folder') {
            const matchingItem = playlist.find(p => p._id === item._id);
            if (matchingItem) {
              item.canPlay = matchingItem.canPlay;
            }
          } else {
            item.subItems.forEach(subItem => {
              //console.log("subItem",subItem);
              const matchingSubItem = playlist.find(p => p._id === subItem._id);
              if (matchingSubItem) {
                subItem.canPlay = matchingSubItem.canPlay;


              }
            });
          }
        }
      }

      if(checkExamPre && allItems.length>0) {
        if (!checkExamPreScore) {
          debug.slack("pre",checkExamPre);
          debug.slack("score",checkExamPreScore);
          allItems[0].canPlay = false
          allItems[0].notice = "ต้องทำแบบทดสอบก่อนเรียนก่อน"
        }
      }

      const analytics = {
        total: playlist.length,
        pending: 0,
        processing: 0,
        complete: 0,
        status: '',
      };

      //debug.slack(playlist);

      playlist.forEach((player) => {
        //debug.slack(player.progress.status);
        if (player.progress && player.progress.status === 'pending') {
          analytics.pending++;
        } else if (player.progress && player.progress.status === 'processing') {
          analytics.processing++;
        } else if (player.progress && player.progress.status === 'complete') {
          analytics.complete++;
        }
      });

      

      if (analytics.complete === analytics.total) {
        analytics.status  = 'complete';
        analytics.message = 'เรียนจบแล้ว';
      } else {
        analytics.status  = 'processing';
        analytics.message = 'กำลังเรียน';
      }

      analytics.pre = {
        req: 'no',
        has: checkExamPre,
        measure: checkExamPreItem?.measure || null,
        score: checkExamPreItem?.score?.score || null,
        result: checkExamPreItem?.score?.score >= checkExamPreItem?.measure,
        message: checkExamPreItem?.score?.score === null ||  checkExamPreItem?.score?.score === undefined ? 'ยังไม่ได้สอบวัดผล' : (checkExamPreItem?.score?.score >= checkExamPreItem?.measure ? 'ผ่านการรับรอง' : 'ไม่ผ่านการรับรอง'),
      };

      analytics.post = {
        req: this.lesson.certification === 'yes' && this.lesson.certification_type === 'pass' ? true : false,
        has: checkExamPost,
        measure: checkExamPostItem?.measure || null,
        score: checkExamPostItem?.score?.score || null,
        result: checkExamPostItem?.score?.score >= checkExamPostItem?.measure,
        message: checkExamPostItem?.score?.score === null ||  checkExamPostItem?.score?.score === undefined ? 'ยังไม่ได้สอบวัดผล' : (checkExamPostItem?.score?.score >= checkExamPostItem?.measure ? 'ผ่านการรับรอง' : 'ไม่ผ่านการรับรอง'),
      };

      const hasCertification = this.lesson.certification;
      const certificationType = this.lesson.certification_type;
      const score     = checkExamPostItem?.score?.score;
      const measure   = checkExamPostItem?.measure;
      const survey    = this.lesson.survey

      let message;
      let status;

      switch (hasCertification) {
        case 'yes':
          if (certificationType === 'end') {
            if (analytics.complete !== analytics.total) {
              message = 'ยังเรียนไม่จบ';
              status = false;
            } else {
              message = 'ผ่านการรับรอง';
              status = true;
            }
          } else if (certificationType === 'pass') {
            if (score === null || score === undefined) {
              message = 'ยังไม่ได้สอบ';
              status = false;
            } else if (score >= measure) {
              message = 'ผ่านการรับรอง';
              status = true;
            } else {
              message = 'ไม่ผ่านการรับรอง';
              status = false;
            }
          }
          break;
        case 'no':
          message = 'ไม่มีใบประกาศ';
          status = false;
          break;
        default:
          break;
      }

      analytics.certification = {
        status: status,
        type: certificationType,
        survey: survey,
        message: message,
      };

      const percentComplete = (analytics.complete / analytics.total) * 100;
      
      /* Cal by use Post Status
      const diff            = analytics.post.req && (!analytics.post.score || analytics.post.score === "") ? 10 : 0;
      analytics.percent     = parseFloat((percentComplete - diff).toFixed(2));
      */

      analytics.percent     = parseFloat((percentComplete).toFixed(2));

      if (analytics.percent < 0) {
        analytics.percent = 0;
      }

      const dueStatus = this.checkDue();
      const analyticsStatus = this.checkAnalytics();

      //debug.slack("*analytics*",analytics);
      //console.log("dueStatus",dueStatus);
      //console.log("endDateComplete",this.courseData.endDateComplete);
      //console.log("analytics",this.checkAnalytics());
      //console.log("enrollData",this.enrollData.analytics.status);
      
      const modifiedItems = allItems.map(item => {


        //console.log("item",item);
        const visible = item.not_visible !== undefined ? item.not_visible : false;
        // If the due date has passed (dueStatus is false), override all items' canPlay to false
        if (!dueStatus && analyticsStatus === 'complete' && (this.courseData?.has_duedate || false)) {

          return { ...item, visible, canPlay: false, canPlayMessage:'หลักสูตรนี้ปิดการเข้าเรียนแล้ว' };
          
        } else {
          // If dueStatus is true, then further logic is considered based on access
          if (access) {
            // If access is true, return the item as is, including its original canPlay status
            return { ...item, visible };
          } else {
            // If access is false, you may want to adjust properties or specifically set canPlay
            // Here we maintain the structure but specifically focus on canPlay
            return {
              _id: item._id,
              courseId: item.courseId,
              name: item.name,
              slug: item.slug,
              description: item.description,
              duration: item.duration,
              type: item.type,
              demo: item.demo,
              cover: item.cover,
              order: item.order,
              createdAt: item.createdAt,
              subItems: item.subItems,
              canPlay: item.canPlay,
              visible
            };
          }
        }
      });
      return {
        allItems: modifiedItems,
        playlist,
        analytics,
      };
    }
  }
};
</script>

<template>
    <div v-if="debug">
      <div>
        Due Status: <span>{{ checkDue(courseData.endDate) ? 'True' : 'False' }}</span>
      </div>
      <p>courseData</p>
      <pre>{{ courseData}}</pre>
      <p>groupedPlayers</p>
      <pre>{{ groupedPlayers}}</pre>
      <p>analytics</p>
      <pre>{{ groupedPlayers.analytics}}</pre>
      Pre Exam : {{ checkExam('pre') }} <br/>
      Exam : {{ getFilteredExams('pre') }}<br/>
      dataItem : {{ dataItem }}<br/>
      playerItem : {{ playerItem }}<br/>
      playOption : {{ playOption }}<br/>
    </div>

    <ul role="list" class="divide-y divide-gray-200 player">

        <li v-if="loading_sources" class="flex items-center justify-center py-8 rounded">
            <spinner class="w-full"/>
            <div class="ml-3">
                <p class="text-lg font-semibold text-gray-600">กำลังโหลดข้อมูล</p>
                <span class="text-xs font-normal leading-2 block text-gray-500">กรุณารอสักครู่...</span>
            </div>
        </li>
      
        <li v-if="checkExam('pre') && enrollAccess" class="divide-y divide-gray-200">
            <div v-for="(exam) in getFilteredExams('pre')" :key="exam._id">

                <a :href="isLinkClickable(exam) ? `/lesson/assessment/${this.dataItem}/${exam._id}` : 'javascript:void(0)'"
                class="block hover:bg-gray-50"
                :class="{ 'opacity-30': !isLinkClickable(exam), 'relative': true }">

                    <div class="px-4 py-4 sm:px-6">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center">
                                <span class="mr-2">
                                <font-awesome-icon
                                    :icon="['fas', 'file-alt']"
                                    class="mr-1.5 h-5 w-5 flex-shrink-0 text-red-500"
                                />
                                </span>
                                <p class="truncate text-sm font-semibold text-red-600">{{ exam.name }}</p>
                            </div>
                            <div class="ml-2 flex flex-shrink-0">
                                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                {{ exam.score ? exam.score.score + ' คะแนน' : 'ยังไม่ได้สอบ' }}
                                </span>

                            </div>
                        </div>
                        <div class="mt-2 sm:flex sm:justify-between">
                            <div class="sm:flex">
                                <p class="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                <font-awesome-icon
                                    :icon="['far', 'list-alt']"
                                    class="mr-1.5 h-3 w-3 flex-shrink-0 text-gray-400"
                                />
                                <span class="text-gray-600 font-semibold mr-1.5"> จำนวนข้อสอบ </span>
                                {{ exam.total }} ข้อ
                                </p>
                            </div>
                            <div class="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                <font-awesome-icon
                                :icon="['far', 'clock']"
                                class="mr-1.5 h-3 w-3 flex-shrink-0 text-gray-400"
                                />
                                <p>{{ exam.timer }} นาที</p> 
                            </div>
                        </div>
                    </div>
                </a>
            </div>
        </li>

        <li v-for="(player) in groupedPlayers.allItems" :key="player._id" class="divide-y divide-gray-200">

            <a  :href="player.type != 'folder' && enrollAccess && this.login && player.canPlay ? '/lesson/play/' + this.dataItem + '/' +  player._id : 'javascript:void(0);'" 
                :class="{
                'bg-gray-200': this.player && this.player._id && player && player._id && player._id === this.player._id,
                'opacity-60': !player.canPlay && this.enrollAccess && player.type != 'folder',
                'relative': true
                }"                            
                class="block hover:bg-gray-50">

                <span v-if="!player.canPlay && player.type != 'folder' && this.enrollAccess" class="before:not-available absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-500 text-white px-2 text-sm text-center">{{ player.canPlayMessage || 'ยังเรียนบทก่อนหน้าไม่จบ' }}</span>

                <div class="px-4 py-4 sm:px-6">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center">
                        <span v-if="player.type === 'folder'" class="mr-2"><font-awesome-icon :icon="['fas', 'folder-open']" class="mr-1.5 h-5 w-5 flex-shrink-0 text-orange-500" /></span>
                        <span v-else class="mr-2"><font-awesome-icon :icon="['fas', 'video']" class="mr -1.5 h-5 w-5 flex-shrink-0 text-green-600" /></span>
                        <p class="truncate text-sm font-semibold text-indigo-600">{{player.name}}
                            <span class="absolute inline-block rounded-full bg-red-500 ml-2 p-1 h-5 w-5" v-if="this.player && this.player._id && player && player._id && player._id === this.player._id">
                                <font-awesome-icon :icon="['far', 'play-circle']" class="text-white h-3 w-3 mb-1 playing-icon"/>
                            </span>
                        </p>
                        </div>
                        <div class="ml-2 flex flex-shrink-0">
                            <template v-if="player.progress && this.enrollAccess">
                                <div class="ml-2 flex flex-shrink-0" v-html="getStatus(player.progress.status)"></div>
                            </template>
                        </div>
                    </div>
                    
                    <div v-if="player.type != 'folder'" class="mt-2 sm:flex sm:justify-between">
                        <div class="sm:flex">
                            <p class="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                <font-awesome-icon :icon="['far', 'clock']" class="mr-1.5 h-3 w-3 flex-shrink-0 text-gray-400" />
                                <span class="text-gray-600 font-semibold mr-1.5"> เวลาของเนื้อหา </span>
                                {{player.duration}}
                            </p>
                            <!-- <template v-if="player.progress && this.enrollAccess">
                                <p class="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                    <font-awesome-icon :icon="['far', 'clock']" class="ml-1.5 mr-1.5 h-3 w-3 flex-shrink-0 text-gray-400" />
                                    <span class="text-gray-600 font-semibold mr-1.5"> เรียนแล้ว </span>
                                    {{ formatSeconds(player.progress.progress) }}
                                </p>
                            </template> -->
                        </div>
                        <div class="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                            
                        <font-awesome-icon :icon="['fas', 'calendar-alt']" class="mr-1.5 h-3 w-3 flex-shrink-0 text-gray-400" />
                        <p v-if="enrollAccess">{{player.progress ? 'เรียนล่าสุดเมื่อ ' + formatThaidate(player.progress.updatedAt || player.progress.createdAt) : 'ยังไม่ได้เริ่มเรียน'}}</p>
                        <p v-else>เรียนได้ {{lesson.days}} วัน</p>
                        </div>
                    </div>

                </div>
            </a>
            
            <ul v-if="player.subItems" role="list" class="divide-y divide-gray-200">
          
                <li v-for="(subItem) in player.subItems" :key="subItem._id" class="">

                    <a  :href="enrollAccess && this.login && subItem.canPlay ? '/lesson/play/' + this.dataItem + '/' +  subItem._id : 'javascript:void(0);'"
                        :class="{
                        'bg-gray-200': this.player && this.player._id && subItem && subItem._id && subItem._id === this.player._id,
                        'opacity-60': !subItem.canPlay && this.enrollAccess,
                        'relative': true
                        }" 
                        class="block hover:bg-gray-50 ml-5 border-gray-300 border border-b-0 border-l-2 border-dashed border-t-0 border-r-0">

                        <span v-if="!subItem.canPlay && this.enrollAccess" class="before:not-available absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-500 text-white px-2 text-sm text-center">{{ subItem.canPlayMessage || 'ยังเรียนบทก่อนหน้าไม่จบ' }}</span>

                        <div class="w-6 h-7 border-gray-300 border border-b-2 border-l-0 border-dashed border-t-0 border-r-0 absolute"></div>

                        <div class="px-4 py-4 sm:px-6">
                            <div class="flex items-center justify-between">
                                <div>
                                  <p class="truncate text-sm font-semibold text-indigo-600">
                                      <font-awesome-icon :icon="['far', 'square']" class="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-300" />
                                      <font-awesome-icon :icon="['fas', 'video']" class="mr-1.5 h-5 w-5 flex-shrink-0 text-green-600" />
                                      {{subItem.name}}
                                      <span class="absolute inline-block rounded-full bg-red-500 ml-2 p-1 h-5 w-5" v-if="this.player && this.player._id && subItem && subItem._id && subItem._id === this.player._id">
                                      <font-awesome-icon :icon="['far', 'play-circle']" class="text-white h-3 w-3 mb-1 playing-icon"/>
                                      </span>
                                  </p>
                                  <p class="text-gray-400 text-sm pt-2 pb-2">{{subItem.description}}</p>
                                </div>
                                <div class="ml-2 flex flex-shrink-0">
                                    <template v-if="subItem.progress && this.enrollAccess">
                                    <div class="ml-2 flex flex-shrink-0" v-html="getStatus(subItem.progress.status)"></div>
                                    </template>
                                </div>
                            </div>
                            <div class="mt-2 sm:flex sm:justify-between">
                                <div class="sm:flex">

                                    <p class="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                    <font-awesome-icon :icon="['far', 'clock']" class="mr-1.5 h-3 w-3 flex-shrink-0 text-gray-400" /> 
                                    <span class="text-gray-600 font-semibold mr-1.5"> เวลาเรียน </span>
                                    {{subItem.duration}}
                                    </p>
                                    <template v-if="subItem.progress && this.enrollAccess">
                                        <p class="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                          <font-awesome-icon :icon="['far', 'clock']" class="mr-1.5 h-3 w-3 flex-shrink-0 text-gray-400" />
                                          <span class="text-gray-600 font-semibold mr-1.5"> เรียนแล้ว </span>
                                          {{ formatSeconds(subItem.progress.progress) }}
                                        </p>
                                    </template>
                                </div>
                                <div class="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                
                                <font-awesome-icon :icon="['fas', 'calendar-alt']" class="mr-1.5 h-3 w-3 flex-shrink-0 text-gray-400" />
                                <p v-if="enrollAccess">{{player.progress ? 'เรียนล่าสุดเมื่อ ' + formatThaidate(player.progress.updatedAt || player.progress.createdAt) : 'ยังไม่ได้เริ่มเรียน'}}</p>
                                <p v-else>เรียนได้ {{lesson.days}} วัน</p>
                                </div>
                            </div>
                        </div>
                    </a>
                </li>
            </ul>
        </li>
        
        
        <template v-if="!this.lesson.standalone">

          <li v-if="checkExam('post') && enrollAccess && groupedPlayers.analytics.status==='complete'" class="divide-y divide-gray-200">

              <div v-for="(exam) in getFilteredExams('post')" :key="exam._id">

              <!-- <pre>  {{ exam }} </pre>
              <p>{{this.checkPostExamDue(exam.show_duedate)}}</p> -->
                
                <a :href="isLinkClickable(exam) ? `/lesson/assessment/${this.dataItem}/${exam._id}` : 'javascript:void(0)'"
                class="block hover:bg-gray-50"
                :class="{ 'opacity-30': !isLinkClickable(exam), 'relative': true }">
              
                  <div class="px-4 py-4 sm:px-6">
                      <div class="flex items-center justify-between">
                      <div class="flex items-center">
                          <span class="mr-2">
                          <font-awesome-icon
                              :icon="['fas', 'file-alt']"
                              class="mr-1.5 h-5 w-5 flex-shrink-0 text-red-500"
                          />
                          </span>
                          <p class="truncate text-sm font-semibold text-red-600">
                          {{ exam.name }}
                          <span v-if="exam.score" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-200 text-green-800">

                            <template v-if="exam.result==='now'">
                            {{ exam.score.score >= exam.measure ? 'ผ่านการรับรอง' : (exam.is_repeat === 'yes' ? 'ไม่ผ่านการรับรอง สามารถสอบซ่อมได้' : 'ไม่ผ่านการรับรอง') }}
                            </template>

                            <template v-if="exam.result==='duedate' && checkPostExamDue(exam.result_duedate)===true">
                              รอประกาศผลวันที่ {{  formatThaidate(exam.result_duedate) }}
                            </template>

                            <template v-if="exam.result==='duedate' && checkPostExamDue(exam.result_duedate)===false">
                              {{ exam.score.score >= exam.measure ? 'ผ่านการรับรอง' : (exam.is_repeat === 'yes' ? 'ไม่ผ่านการรับรอง สามารถสอบซ่อมได้' : 'ไม่ผ่านการรับรอง') }}
                            </template>

                          </span>
                          </p>
                      </div>
                      <div class="ml-2 flex flex-shrink-0">

                          <template v-if="exam.result==='now'">
                            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              {{ exam.score ? exam.score.score + ' คะแนน' : 'ยังไม่ได้สอบ' }}
                            </span>
                          </template>

                          <template v-if="exam.result==='duedate' && checkPostExamDue(exam.result_duedate)===false">
                            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              {{ exam.score ? exam.score.score + ' คะแนน' : 'ยังไม่ได้สอบ' }}
                            </span>
                          </template>

                      </div>
                      </div>

                      <div class="mt-2 sm:flex sm:justify-between">
                      <div class="sm:flex">
                          <p class="mt-2 flex items-center text-sm text-gray-500 mr-2 sm:mt-0">
                          <font-awesome-icon
                              :icon="['far', 'list-alt']"
                              class="mr-1.5 h-3 w-3 flex-shrink-0 text-gray-400"
                          />
                          <span class="text-gray-600 font-semibold mr-1.5"> จำนวนข้อสอบ </span>
                          {{ exam.total }} ข้อ
                          </p>
                          <p class="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                            <font-awesome-icon
                                :icon="['far', 'calendar']"
                                class="mr-1.5 h-3 w-3 flex-shrink-0 text-gray-400"
                            />
                            <span class="text-gray-600 font-semibold mr-1.5"> เปิดสอบ </span>
                            {{  formatThaidate(exam.show_duedate) }}
                            </p>
                      </div>
                      <div class="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <font-awesome-icon
                          :icon="['far', 'clock']"
                          class="mr-1.5 h-3 w-3 flex-shrink-0 text-gray-400"
                          />
                          <p>{{ exam.timer }} นาที</p> 
                      </div>
                      </div>
                  </div>
                  </a>
              </div>
          </li>
        </template>
    </ul>
</template>

<style scoped>
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
    color: #6d6d6d;
  }
  
</style>