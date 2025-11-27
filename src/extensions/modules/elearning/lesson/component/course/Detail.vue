<script>
import { translate } from '@/plugins/language.js';
import {mode, display, kind, player, exam} from "@/master/type";
import { ref } from 'vue';
// Component
import feather from 'feather-icons';
import Loader from '@/interface/template/Loader.vue';
import Toggle from '@vueform/toggle'
import FileBrowser from '@/interface/modal/FileBrowser.vue';
import storageManager from '@/plugins/storage';
import { Tooltip } from '@programic/vue3-tooltip';
import Subhead from '@/interface/template/outline/Subhead.vue';
import convertUtils from "@/plugins/convertUtils";

import moment from 'moment';
moment().format();

import CourseIcon     from '@/interface/element/CourseIcon.vue';

// Get Resource
//import CourseContent   from './resource/CourseContent.vue';
import MaterialList   from '@/extensions/modules/elearning/lesson/component/course/resource/MaterialList.vue';
import EnrollTable   from '@/extensions/modules/elearning/lesson/component/course/resource/EnrollTable.vue';
import EnrollDashboard   from '@/extensions/modules/elearning/lesson/component/course/resource/EnrollDashboard.vue';
import DocumentList  from '@/extensions/modules/elearning/lesson/component/course/resource/DocumentList.vue';
import ContestList  from '@/extensions/modules/elearning/lesson/component/course/resource/ContestList.vue';
import SurveyList  from '@/extensions/modules/elearning/lesson/component/course/resource/SurveyList.vue';

import Schedule  from '@/extensions/modules/elearning/lesson/component/course/resource/Schedule.vue';

import Condition  from '@/extensions/modules/elearning/lesson/component/course/resource/Condition.vue';

import FormList  from './resource/FormList.vue';

import CertificateList  from '@/extensions/modules/elearning/lesson/component/course/resource/CertificateList.vue';

import PipelineList  from '@/extensions/modules/elearning/lesson/component/course/resource/PipelineList.vue';

import AssignmentSubmission  from '@/extensions/modules/elearning/lesson/component/course/resource/AssignmentSubmission.vue';

// S3 Config
import { S3 } from "@aws-sdk/client-s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";

import requestClient from '@/plugins/requestClient';
const Request = new requestClient(false);

import toast from '@/plugins/ToastUI.js';
import dialog from '@/plugins/Dialog.js';
import debug from '@/plugins/Logger.js';

const message = [
  'vue.js 3.0',
  'vue.draggable',
  'draggable',
  'component',
  'for',
  'based',
  'on',
  'Sortablejs',
]
export default {
    data() {
      const session = storageManager.get('session')
      const configs = storageManager.get("configs");
      const schoolSession = configs;
      const s3Client = new S3({
        forcePathStyle: false,
        endpoint: schoolSession.s3EndpointDefault,
        region: schoolSession.s3Region,
        ResponseContentEncoding: "utf-8",
        credentials: {
          accessKeyId: schoolSession.s3Key,
          secretAccessKey: schoolSession.s3Secret,
        },
      });
      return {
        hostkey:this.$Key,
        dropdownOpen: false,
        toast: null,
        configs: storageManager.get('configs'),
        refreshKey: 0,
        S3: s3Client,
        schoolSession: schoolSession,
        masterDataRecord:[],
        contentType:[],
        courseData: [],
        courseCategory: [],
        playerData: [],
        playerCount:'0',
        examData: [],
        categoryData:[],
        documentData: [],
        documentCount:'0',
        playerParent:[],
        playerFolder:[],
        playerChild:[],
        selectPlayerItem:[],
        playerParentCount:'',
        playerChildCount:'',
        selectedPlayerIndex: null,
        selectedSubPlayerIndex: null,
      
        showPopupWindow: false,
        activeBlock: false,
        listItems: [],
        selectedItem: null,
        activeBlock_text:'กำลังติดต่อฐานข้อมูล กรุณารอสักครู่.....',

        examCount:'0',
        schoolAdmin: [],
        subArray:[],
        dataItem: this.$route.params.id,
        accessToken: session.token,
        login: session.login,
        session: session,
        selectCourseCover:'',
        loading_sources: true,
        FileBrowserOpen: false,
        
        readMoreActivated: false,
        dragging: false,
        cover:'',
        type:'',
        ref:'',
        display:'',
        mode:'',
        modeName:'',
        displayName:'',
        kindName:'',
        principles:'',
        objective:'',
        description:'',
        target:'',
        structure:'',
        enabled: true,
        order: 6,
        status:'',
        visibility:'',
        activeSubTab: 'cover', // Added for cover/thumbnail sub-tabs
        thumbnail: '', // Added for thumbnail image URL
        ThumbnailBrowserOpen: false, // Added for thumbnail file browser
        endpoint:"",
        valuePoint:"",
        playerRef:"",
        examRef:"",

        playerType:[],
        modeType:[],
        displayType:[],
        kindType:[],
        courseApiData:[],

        enrollCount: 0,
        passCount: 0,
        MasterText:session.MasterText,
        master: session.master,
        current: session.current,
        SetContentSourceModal:false,
        setContentTriggerObj:"",
        list: message.map((name, index) => {
          return { name, order: index + 1 }
        }),
        modalOpen: false,
        filteredResults:[],
        filteredAdmin:[],
        searchQuery: "",
        limitItem:20,
        limitOptions: [10, 20, 50, 100, 200, 500, 1000, 2000], // Define the available options
        currentPage: 1,
        totalPages: 0,
        totalItems: 0,
        searchResults: [
          { id: 1, name: "User 1", email: "user1@example.com" },
          { id: 2, name: "User 2", email: "user2@example.com" },
          { id: 3, name: "User 3", email: "user3@example.com" },
        ],
        activeTab: 'detail',
        tabs: [
          {
            code: "detail",
            icon: 'home',
            shortname: "Detail",
            name: this.translate('lesson-description'),
            description: "Personal details and application.",
            badge: null,
          },
          {
            code: "material",
            icon: 'book',
            shortname: "Course",
            name: this.translate('lesson-topic'),
            description: "Asset details.",
            badge: 0,
          },
          {
            code: "schedule",
            icon: 'calendar',
            shortname: "Schedule",
            name: "Schedule",
            description: "Schedule details.",
            badge: null,
          },
          {
            code: "dashboard",
            icon: 'dashboard',
            shortname: "Dashboard",
            name: this.translate('lesson-dashboard'),
            description: "Dashboard information.",
            badge: null,
          },
          {
            code: "form",
            icon: 'quote-left',
            shortname: "Form",
            name: this.translate('lesson-form'),
            description: "On-Site Form information.",
            badge: 0,
          },
          {
            code: "contest",
            icon: 'square-check',
            shortname: "Quize",
            name: this.translate('lesson-exam'),
            description: "Asset details.",
            badge: null,
          },
          {
            code: "document",
            icon: 'file',
            shortname: "File",
            name: this.translate('lesson-document'),
            description: "Admin settings.",
            badge: null,
          },
          {
            code: "enroll",
            icon: 'user',
            shortname: "Enroll",
            name: this.translate('lesson-enroll'),
            description: "Storage information.",
            badge: 0,
          },
          {
            code: "survey",
            icon: 'list-check',
            shortname: "Survey",
            name: this.translate('lesson-survey'),
            description: "Survey information.",
            badge: 0,
          },
          {
            code: "certification",
            icon: 'address-card',
            shortname: "Certification",
            name: this.translate('lesson-certification'),
            description: "Certification information.",
            badge: null,
          },
          {
            code: "condition",
            icon: 'calendar-days',
            shortname: "กำหนดการณ์",
            name: "กำหนดการณ์",
            description: "Condition information.",
            badge: null,
          },
          {
            code: "learning_path",
            icon: 'sitemap',
            shortname: "Learning Path",
            name: "Learning Path",
            description: "จัดการลำดับการเรียนรู้ของหลักสูตร",
            badge: null,
          },
          {
            code: "assignment",
            icon: 'tasks',
            shortname: "Assignment",
            name: "ระบบส่งงาน",
            description: "จัดการกิจกรรมและการส่งงานของหลักสูตร",
            badge: 0,
          },
        ]
      }
    },
    components: {
      Loader,
      CourseIcon,
      Toggle,
      Tooltip,
      FileBrowser,
      Subhead,
      EnrollTable,
      EnrollDashboard,
      DocumentList,
      ContestList,
      SurveyList,
      CertificateList,
      FormList,
      MaterialList,
      Condition,
      Schedule,
      PipelineList,
      AssignmentSubmission
      //CourseContent
    },
    computed: {
      TabData() {
        return this.tabs.find(tab => tab.code === this.activeTab);
      },
      defaultType() {
        return this.selectPlayerItem.length > 0 ? this.selectPlayerItem.type : '';
      },
      examType() {
        debug.log("examType",exam);
        return exam;
      },
      draggingInfo() {
        debug.log("Drag");
        return this.dragging ? "under drag" : "";
      },
      dragOptions() {
        return {
          animation: 1,
          group: 'description',
          disabled: false,
          ghostClass: 'ghost',
        }
      },
      getIconForSubItem() {
        return (type) => {
          switch (type) {
            case 'streaming':
              return ['fas', 'film'];
            case 'demand':
              return ['fas', 'video'];
            case 'youtube':
              return ['fas', 'play-circle'];
            case 'document':
            return ['fas', 'file'];
            default:
              return ['fas', 'question-circle']; // Default icon when type doesn't match
          }
        };
      },
      getClassForTypeAndData() {
        return (type, item) => {
          if (type === 'demand' || type === 'streaming' || type === 'youtube') {
            return item.video === undefined || item.video === '' || item.video === null || Object.keys(item.video).length === 0 ? 'text-rose-600' : 'text-lime-600';
          } else if (type === 'document') {
            return item.content === undefined || item.content === '' || item.content === null ? 'text-rose-600' : 'text-lime-600';
          } else {
            return 'text-rose-600';
          }
        };
      },
    },
    methods: {
      translate,
      isTabVisible(tab) {
        const conditions = {
          //'form': this.courseData.type === 'onsite',
          'material': (this.courseData.type === 'e_learning' || this.courseData.type === 'online_course') && this.courseData.view != 'multiple' && !this.courseData.exam_only,
          'learning_path': (this.courseData.type === 'e_learning' || this.courseData.type === 'online_course') && this.courseData.view === 'multiple',
          'schedule': this.courseData.type === 'onsite',
          'certification': this.courseData.type === 'e_learning' && this.courseData.certification === 'yes',
          'survey': this.courseData.survey === 'yes',
          'assignment': this.courseData.type === 'e_learning' || this.courseData.type === 'online_course',
        };

        return tab.code in conditions ? conditions[tab.code] : true;
      },
      handleUpdateBadge(payload) {
        const tab = this.tabs.find(tab => tab.code === payload.code);
        if (tab) {
          tab.badge = payload.badge;
        }
        return tab;
      },
      async setActiveTab(tabCode) {
  try {
    this.activeTab = tabCode;
    window.location.hash = `#${tabCode}`;
    
    // Safely access child component
    const componentMap = {
      form: this.$refs.form,
      material: this.$refs.material,
      survey: this.$refs.survey,
      enroll: this.$refs.enroll,
      document: this.$refs.document,
      schedule: this.$refs.schedule,
      contest: this.$refs.contest,
      certification: this.$refs.certification,
      learning_path: this.$refs.pipeline,
      assignment: this.$refs.assignment,
    };
    
    const childComponent = componentMap[tabCode];
    
    if (childComponent && typeof childComponent.callbackFunction === 'function') {
      // Ensure the callback exists before calling it
      childComponent.callbackFunction();
    } else {
      console.warn(`Callback function not found for tab: ${tabCode}`);
    }
    
    await this.delay(1); // Ensure any DOM changes are applied before proceeding
    
    const selectedTab = this.tabs.find(tab => tab.code === tabCode);
    if (selectedTab) {
      this.$setPageTitle(`${selectedTab.name} / ${this.courseData.name}`);
    }
  } catch (error) {
    console.error(`Error in setActiveTab for tabCode: ${tabCode}`, error);
  }
},

      delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
      },
      openModal() {
        this.modalOpen = true;
        this.filteredResults = [];
      },
      handleCheckboxClick(event) {
        event.stopPropagation();
      },
      async closeModal() {
        this.modalOpen = false;
        this.searchQuery = "";
      },
      async getCourseAdmin() {
        try {
          const adminIds = this.courseData.admin;
          if (!Array.isArray(adminIds)) {
            return;
          }
          const adminList = [];
          for (const adminId of adminIds) {
            const resAPI      = await Request.GET(`user/${adminId}`, this.configs.key);
            const RestReturn  = resAPI.data;
            adminList.push(RestReturn);
          }
          this.filteredAdmin = adminList;
          debug.log(adminList);
        } catch (error) {
          console.error(error);
        }
      },
      async autoSearch() {
        try {
          let andConditions = [{ parent: this.schoolSession.siteID, role: 'manager' }];

          if (this.searchQuery) {
            andConditions.push({
              $or: [
                { firstname: { $regex: `.*${this.searchQuery}.*`, $options: 'i' } },
                { lastname: { $regex: `.*${this.searchQuery}.*`, $options: 'i' } },
                { email: { $regex: `.*${this.searchQuery}.*`, $options: 'i' } },
                { phone: { $regex: `.*${this.searchQuery}.*`, $options: 'i' } },
                { username: { $regex: `.*${this.searchQuery}.*`, $options: 'i' } }
              ]
            });
          }
          const pipeline = [
            {
              $match: {
                $and: andConditions,
              },
            },
            {
              $sort: {
                createdAt: -1,
                status: -1,
                type: 1,
              }
            },
            {
              $facet: {
                paginatedData: [
                  { $skip: (this.currentPage - 1) * this.limitItem },
                  { $limit: this.limitItem }
                ],
                totalCount: [
                  { $count: "count" }
                ]
              }
            }
          ];
          
          const resAPI = await Request.POST(`user/aggregate`, { pipeline }, this.hostkey);
          
          if (resAPI.status === 200) {
            const RestReturn = resAPI.data
            if (RestReturn.length > 0 && RestReturn[0].paginatedData.length > 0) {
              const paginatedData = RestReturn[0].paginatedData;
              const totalCount = RestReturn[0].totalCount[0].count;
              const formattedData = {
                data: paginatedData,
                total: totalCount,
                paging: {
                  page: this.currentPage,
                  limit: this.limitItem,
                  totalPages: Math.ceil(totalCount / this.limitItem)
                }
              };
              this.filteredResults = formattedData.data;
              this.filteredResults = this.filteredResults.filter(result => {
                return !this.filteredAdmin.some(admin => admin._id === result._id);
              });
              this.totalItems = formattedData.total;
              this.totalPages = formattedData.paging.totalPages;
            } else {
              this.filteredResults = [];
              this.totalItems = 0;
              this.totalPages = 0;
            }
          }
        } catch (error) {
          debug.log(error);
        }
      },
      async assignManager(user) {
        try {
          const admin = this.courseData.admin ? [...this.courseData.admin] : [];
          admin.push(user._id);

          const payload = {
            data: {
              admin: admin,
            },
            options: {}
          };
          const { status } = await this.$Request.PUT(`course/${this.dataItem}`, payload, this.configs.key);

          if (status === 200) {
            this.modalOpen = false;
            this.$swal({
              toast: true,
              position: 'bottom-end',
              showConfirmButton: false,
              timer: 3000,
              icon: 'success',
              title: 'จัดการเจ้าหน้าที่',
              text: 'เพิ่มเจ้าหน้าที่ สำเร็จแล้ว',
            });
            this.resetData();
            await this.getQueryData();
            await this.getCourseAdmin();
          }
        } catch (error) {
          debug.log(error);
        }
      },
      async unassignManager(user) {
        try {
          const admin = this.courseData.admin ? [...this.courseData.admin] : [];
          const index = admin.indexOf(user._id);
          if (index !== -1) {
            admin.splice(index, 1);
          }

          const payload = {
            data: {
              admin: admin,
            },
            options: {}
          };
          const { status } = await this.$Request.PUT(`course/${this.dataItem}`, payload, this.configs.key);

          if (status === 200) {
            this.modalOpen = false;
            this.$swal({
              toast: true,
              position: 'bottom-end',
              showConfirmButton: false,
              timer: 3000,
              icon: 'success',
              title: 'จัดการเจ้าหน้าที่',
              text: 'เพิ่มเจ้าหน้าที่ สำเร็จแล้ว',
            });
            this.resetData();
            await this.getQueryData();
            await this.getCourseAdmin();
          }
        } catch (error) {
          debug.log(error);
        }
      },
      performSearch() {
        this.searchResults = this.searchResults.filter((result) =>
          result.name.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
      },
      async reloadComponent() {
        this.refreshKey += 1;
        this.selectedPlayerIndex = null;
        this.selectedSubPlayerIndex = null;
        await this.getQueryData(true);
      },
      formatDuration(duration) {
        const totalSeconds = parseFloat(duration);
        if (isNaN(totalSeconds) || totalSeconds <= 0) {
          return '00:00';
        }
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = Math.floor(totalSeconds % 60);
        const formattedMinutes = minutes.toString().padStart(2, '0');
        const formattedSeconds = seconds.toString().padStart(2, '0');
        return `${formattedMinutes}:${formattedSeconds}`;
      },
      async addPlayer(type, count, name, main) {
        try {
          this.toast = toast({ type: 'pending', message: 'กำลังเพิ่ม...' });
          const mode = main ? 'sub' : main;
          let order = ('0' + (parseInt(count + 1))).slice(-2)

          const payload = {
            data: {
              "courseId": this.courseData.master,
              "root": main,
              "mode": mode,
              "type": type,
              "name": 'บทเรียนสำหรับ ' + name + ' - ' + order,
              "order": order,
              "duration": '00:00:00',
            },
            options: {}
          };
          const resAPI = await this.$Request.POST('player', payload, this.configs.key);
          if (resAPI.status===200) {
            this.toast.hide('เพิ่มเสร็จแล้ว.', 'success', 300);
            await this.getQueryData();
          }
        } catch (error) {
          debug.log(error)
        }
      },
      async removeVideo() {
        try {
          const payload = {
            data: {"video":{}}
          };
          const { status } = await this.$Request.PUT(`player/${this.selectPlayerItem._id}`, payload, this.configs.key);

          if(status === 200) {
            this.selectedPlayerIndex = null;
            this.playerParent = [];
            this.selectPlayerItem = [];
            await this.getQueryData();
          }
        } catch (error) {
          debug.log(error)
        }
      },
      async updataVideo(updatedItem) {
        try {
          const payload = {
            data: {
              "video":{
                "desktop":updatedItem.file,
                "mobile":updatedItem.file
              },
              "duration":this.formatDuration(updatedItem.duration),
              "thumbnail":updatedItem.thumbnail
            },
            options: {}
          };
          const { status } = await this.$Request.PUT(`player/${updatedItem.id}`, payload, this.configs.key);

          if(status === 200) {
            await this.getQueryData();
          }
        } catch (error) {
          debug.log(error)
        }
      },
      async updataDocument(updatedItem) {
        try {
          const payload = {
            data: {
              "content":updatedItem.file
            },
            options: {}
          };
          const { status } = await this.$Request.PUT(`player/${updatedItem.id}`, payload, this.configs.key);

          if(status === 200) {
            await this.getQueryData();
          }
        } catch (error) {
          debug.log(error)
        }
      },
      async updataPlayer(updatedItem) {
        try {
          const payload = {
            data: {
              "name":updatedItem.name,
              "description":updatedItem.description,
              "duration":updatedItem.duration,
              "type":updatedItem.type,
              "demo":updatedItem.demo,
            }
          };
          const { status } = await this.$Request.PUT(`player/${updatedItem.id}`, payload, this.configs.key);

          if(status === 200) {
            debug.log("updataPlayer");
            await this.getQueryData();
          }
        } catch (error) {
          debug.log(error)
        }
      },
      async SetContentSource(updatedItem) {
        try {
          const requestBody = {
            data: {
              video: {},
            },
            options: {},
          };

          if (updatedItem.type === "streaming") {
            requestBody.data.video.streaming = updatedItem.file;
          } else if (updatedItem.type === "youtube") {
            requestBody.data.video.youtube = updatedItem.file;
          }

          const { status } = await this.$Request.PUT(`player/${updatedItem.id}`, requestBody, this.configs.key);

          if(status === 200) {
            await this.getQueryData();
          }
        } catch (error) {
          debug.log(error)
        }
      },
      togglePanel(index) {
          if (this.isOpenPanel(index)) {
            this.selectedPlayerIndex = null;
          } else {
            this.selectedPlayerIndex = index;
            const panelElement = document.getElementById(`panel-${this.selectedPlayerIndex}`);
            if (panelElement) {
              const scrollY = panelElement.getBoundingClientRect().top + window.scrollY - 10;
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
        return this.selectedPlayerIndex === index;
      },
      toggleSubPanel(rootIndex, subIndex) {
          if (this.isOpenSubPanel(rootIndex, subIndex)) {
            this.selectedSubPlayerIndex = null;
            this.selectedPlayerIndex    = null;
          } else {
            this.selectedSubPlayerIndex = [rootIndex, subIndex];
            this.selectedPlayerIndex    = rootIndex;
            const panelElement = document.getElementById(`panel-${rootIndex}`);
            if (panelElement) {
              const scrollY = panelElement.getBoundingClientRect().top + window.scrollY - 10;
              this.smoothScrollTo(scrollY);
            }
          }
      },
      isOpenSubPanel(rootIndex, subIndex) {
        if (Array.isArray(this.selectedSubPlayerIndex)) {
          return (
            this.selectedSubPlayerIndex[0] === rootIndex &&
            this.selectedSubPlayerIndex[1] === subIndex
          );
        }
        return false;
      },
      hideSubPanel() {
        this.selectedSubPlayerIndex = null;
        this.selectedPlayerIndex    = null;
      },
      hidePanel() {
        this.selectedPlayerIndex = null;
        this.selectedSubPlayerIndex = null;
      },
      getPlayerItemVideoUrl(playerItem) {
        if (playerItem.type === 'demand') {
          return playerItem.video.desktop;
        } else if (playerItem.type === 'streaming') {
          return playerItem.video.streaming;
        } else if (playerItem.type === 'youtube') {
          return playerItem.video.youtube;
        } else {
          return '';
        }
      },
      formatNumber(price) {
        return convertUtils.formatNumber(price,"short");
      },
      objectFindByKey(array, key, value) {
        for (var i = 0; i < array.length; i++) {
          if (array[i][key] === value) {
            return array[i];
          }
        }
        return null;
      },
      getCategoryName(code) {
        const category = this.objectFindByKey(this.categoryData, 'code', code);
        return category ? category.name : '';
      },
      getPlayerTypeName(code) {
        const type = this.objectFindByKey(this.playerType, 'code', code);
        return type ? type.name : '';
      },
      log(event) {
        debug.log(event)
        for (var key of Object.keys(this.playerParent)) {
          debug.log(key + " -> " + this.playerParent[key]._id)
          this.reOrderPlayer(this.playerParent[key]._id,('0' + key).slice(-2));
        }
      },
      log_sub(event) {
        debug.log(event)
        for (var key of Object.keys(this.playerFolder[event])) {
          debug.log(key + " -> " + this.playerFolder[event][key]._id)
          this.reOrderPlayer(this.playerFolder[event][key]._id,('0' + key).slice(-2));
        }
      },
      sort() {
        this.list = this.list.sort((a, b) => a.order - b.order)
      },
      dateTime(value) {
        return moment(value).format("DD/MM/YYYY hh:mm:ss");
      },
      async fetchScoreCount() {
        try {
          const payload = {
            args: [
              {
                $and: [
                  { courseID: this.dataItem }
                ]
              }
            ]
          };
          const { data } = await this.$Request.POST('enroll/count', payload, this.configs.key);

          this.enrollCount = data.count;
        } catch (error) {
          console.error("An error occurred while fetching score count:", error);
        }
      },
      async fetchScorePassCount() {
        try {
          const payload = {
            args: [
              {
                courseID: this.dataItem,
                "analytics.post.message": "ผ่านการรับรอง"
              }
            ]
          };
          const { data } = await this.$Request.POST('enroll/count', payload, this.configs.key);

          this.passCount = data.count;
        } catch (error) {
          console.error("An error occurred while fetching score count:", error);
        }
      },
      async getQueryData() {
        try {
          let RestReturn = null;
          const pipeline = [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", { $toObjectId: this.dataItem }],
                },
              },
            },
            {
              $lookup: {
                from: "player",
                let: { courseIdStr: { $toString: { $ifNull: ["$$ROOT.master", "$_id"] } } },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ["$$courseIdStr", "$courseId"],
                      },
                    },
                  },
                ],
                as: "players"
              }
            },
            {
              $addFields: {
                playersCount: { $size: "$players" }
              }
            },
            {
              $lookup: {
                from: "exam",
                let: { courseIdStr: { $toString: { $ifNull: ["$$ROOT.master", "$_id"] } } },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ["$$courseIdStr", "$courseId"],
                      },
                    },
                  },
                ],
                as: "exams"
              }
            },
            {
              $addFields: {
                examsCount: { $size: "$exams" }
              }
            },
            {
              $lookup: {
                from: "document",
                let: { courseIdStr: { $toString: { $ifNull: ["$$ROOT.master", "$_id"] } } },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ["$$courseIdStr", "$courseId"],
                      },
                    },
                  },
                ],
                as: "documents"
              }
            },
            {
              $addFields: {
                documentsCount: { $size: "$documents" }
              }
            },
            {
    "$lookup": {
      "from": "enroll",
      "let": { "courseIdStr": { "$toString": { "$ifNull": ["$$ROOT._id", "$_id"] } } },
      "pipeline": [
        {
          "$match": {
            "$expr": {
              "$eq": ["$$courseIdStr", "$courseID"]
            }
          }
        },
        {
          "$group": {
            "_id": null,
            "count": { "$sum": 1 }
          }
        },
        {
          "$project": {
            "_id": 0,
            "count": 1
          }
        }
      ],
      "as": "enrollsCountArray"
    }
  },
  {
    "$addFields": {
      "enrollsCount": {
        "$ifNull": [ { "$arrayElemAt": ["$enrollsCountArray.count", 0] }, 0 ]
      }
    }
  },
            {
                "$lookup": {
                  "from": "form",
                  "let": { "courseIdStr": { "$toString": { "$ifNull": ["$$ROOT._id", "$_id"] } } },
                  "pipeline": [
                    {
                      "$match": {
                        "$expr": {
                          "$eq": ["$$courseIdStr", "$courseID"]
                        }
                      }
                    },
                    {
                      "$group": {
                        "_id": null,
                        "count": { "$sum": 1 }
                      }
                    },
                    {
                      "$project": {
                        "_id": 0,
                        "count": 1
                      }
                    }
                  ],
                  "as": "formsCountArray"
                }
              },
              {
                "$addFields": {
                  "formsCount": { 
                    "$ifNull": [ { "$arrayElemAt": ["$formsCountArray.count", 0] }, 0 ] 
                  }
                }
              },
            {
              $lookup: {
                from: "category",
                let: { categoryCodes: { $ifNull: ["$$ROOT.category", []] } },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $in: ["$code", "$$categoryCodes"],
                      },
                    },
                  },
                ],
                as: "categories",
              },
            },
            {
              $group: {
                _id: "$_id",
                // Summary fields
                material: { $first: "$playersCount" },
                document: { $first: "$documentsCount" },
                contest: { $first: "$examsCount" },
                enroll: { $first: "$enrollsCount" },
                form: { $first: "$formsCount" },
                course: { $first: "$$ROOT" },
                category: { $first: "$categories" },
                //player: { $first: "$players" },
                //document: { $first: "$documents" },
                exam: { $first: "$exams" },
                //enrolls: { $first: "$enrolls" },
                
              },
            },
          ];


          const requestData = {
            pipeline
          };
          const resAPI = await Request.POST(`${this.endpoint}/aggregate`, requestData, this.configs.key);

          if(resAPI.status===200) {

            RestReturn = resAPI.data;

            if (RestReturn && RestReturn.length > 0) {
              const returnData      = this.processingData(RestReturn);
              this.masterDataRecord = returnData;
              this.resetData();
              this.courseApiData = RestReturn;
              this.aggregateAndMapCountsToTabs();
              // Assign Data
              this.playerData   = returnData.formattedData.players ?? null;
              this.courseData   = returnData.formattedData.course ?? null;
              this.courseData.categories   = returnData.formattedData.categories ?? null;
              this.examData     = returnData.formattedData.exam ?? null;

              console.log("documentData",returnData.formattedData.course.documents)
              this.documentData = returnData.formattedData.course.documents ?? null;

              this.playerParent = returnData.playerParentItems;
              this.playerChild  = returnData.playerParentChild;
              this.playerFolder = returnData.playerParentFolder;

              if(this.masterDataRecord) {
                this.playerData.sort(function(a,b){return a.order < b.order ? -1 : 1});
                this.playerParent.sort(function(a,b){return a.order < b.order ? -1 : 1});
                this.playerChild.sort(function(a,b){return a.order < b.order ? -1 : 1});
              }

              this.playerCount        = this.playerData.length;
              this.playerParentCount  = this.playerParent.length
              this.playerChildCount   = this.playerChild.length

              this.courseCategory = this.courseData.categories;
              this.principles     = this.courseData.principles;
              this.objective      = this.courseData.objective;
              this.target         = this.courseData.target;
              this.structure      = this.courseData.structure;
              this.description    = this.courseData.description;
              this.cover          = this.courseData.cover
              this.thumbnail      = this.courseData.thumbnail
              this.mode           = this.courseData.mode
              this.display        = this.courseData.display
              this.type           = this.courseData.type
              this.ref            = this.courseData.master
              this.playerRef      = this.courseData.playerRef ?? this.courseData.master
              this.examRef        = this.courseData.examRef ?? this.courseData.master
              this.status         = this.courseData.status ?? true
              this.visibility     = this.courseData.visibility ?? true
              this.examCount      = this.examData.length ?? 0;
              this.documentCount  = this.documentData.length ?? 0;

              this.$setPageTitle("รายละเอียด / " + this.courseData.name);
            }
          }
        } catch (error) {
          debug.log(error)
        }
      },
      aggregateAndMapCountsToTabs() {
        let aggregatedCounts = this.tabs.reduce((acc, tab) => ({...acc, [tab.code]: 0}), {});

        // Aggregate counts from the course API data
        this.courseApiData.forEach(item => {
          for (let key in item) {
            // Ensure the key exists in the aggregatedCounts and is intended to be counted
            if (key in aggregatedCounts) {
              aggregatedCounts[key] += item[key];
            }
          }
        });

        // Formatter for the badge numbers
        const formatter = new Intl.NumberFormat('en-US', {
          maximumFractionDigits: 0, // Adjust this for decimals if needed
        });

        // Update tabs with formatted aggregated counts, but only if their initial badge value is not null
        this.tabs.forEach(tab => {
          if (tab.code in aggregatedCounts && tab.badge !== null) {
            tab.badge = formatter.format(aggregatedCounts[tab.code]);
          }
        });
      },
      processingData(rawdata) {
        const formattedData = {
          players: [],
          categories: [],
          document: [],
          exam: [],
          course: null,
        };

        const seenCategoryIds     = new Set();
        const seenDocumentIds     = new Set();
        const seenExamIds         = new Set();
        const seenPlayerIds       = new Set();
        const playerParentItems   = [];
        const playerParentChild   = [];
        const playerParentFolder  = [];

        rawdata.forEach((entry) => {

          // Player Data Format
          if (Array.isArray(entry.player)) {
            entry.player.forEach((player) => {
              if (!seenPlayerIds.has(player._id)) {
                formattedData.players.push(player);
                seenPlayerIds.add(player._id);
              }
            });
          } else if (entry.player && !seenPlayerIds.has(entry.player._id)) {
            formattedData.players.push(entry.player);
            seenPlayerIds.add(entry.player._id);
          }

          // Category Data Format
          if (Array.isArray(entry.category)) {
            entry.category.forEach((category) => {
              if (!seenCategoryIds.has(category._id)) {
                formattedData.categories.push(category);
                seenCategoryIds.add(category._id);
              }
            });
          } else if (entry.category && !seenCategoryIds.has(entry.category._id)) {
            formattedData.categories.push(entry.category);
            seenCategoryIds.add(entry.category._id);
          }

          // Document Data Format
          if (Array.isArray(entry.document)) {
            entry.document.forEach((document) => {
              if (!seenDocumentIds.has(document._id)) {
                formattedData.document.push(document);
                seenDocumentIds.add(document._id);
              }
            });
          } else if (entry.document && !seenDocumentIds.has(entry.document._id)) {
            formattedData.document.push(entry.document);
            seenDocumentIds.add(entry.document._id);
          }
          // Exam Data Format
          if (Array.isArray(entry.exam)) {
            entry.exam.forEach((exam) => {
              if (!seenExamIds.has(exam._id)) {
                formattedData.exam.push(exam);
                seenExamIds.add(exam._id);
              }
            });
          } else if (entry.exam && !seenExamIds.has(entry.exam._id)) {
            formattedData.exam.push(entry.exam);
            seenExamIds.add(entry.exam._id);
          }
          // Course Data Format
          if (!formattedData.course) {
            formattedData.course = entry.course;
          }
        });

        formattedData.players.forEach(element => {
          if (element.type !== "folder" && element.mode === "sub") {
            playerParentChild.push(element);
          }
        });
        formattedData.players.forEach(element => {
          if(element.mode!="sub")
          ref(playerParentItems.push(element));
        });
        
        playerParentItems.forEach(element => {
          let key = element._id
          playerParentFolder[key]=[];
          playerParentChild.forEach(element2 => {
            
            if(element2.root===element._id){
              playerParentFolder[key].push(element2);
            }
          });
        });
        // Return an object with all the processed data
        return {
          formattedData,
          playerParentItems,
          playerParentChild,
          playerParentFolder
        };
      },
      resetData() {
        debug.log("resetData",this.courseData)
        this.searchQuery = null;
        this.playerData = null;
        this.courseData = null;
        this.examData = null;
        this.documentData = null;
        this.playerParent = [];
        this.playerChild = [];
        this.playerFolder = [];
        this.playerCount = 0;
        this.playerParentCount = 0;
        this.playerChildCount = 0;
        this.principles = null;
        this.objective = null;
        this.target = null;
        this.structure = null;
        this.description = null;
        this.cover = null;
        this.mode = null;
        this.display = null;
        this.type = null;
        this.ref = null;
        this.playerRef = null;
        this.examRef = null;
        this.status = true;
        this.sync = false;
        this.examCount = 0;
        this.documentCount = 0;
      },
      changeFileTrigger(payload) {
        this.FileBrowserOpen = payload;
      },
      selectFileTrigger(payload) {
        debug.log("selectFileTrigger");
        if(payload!=undefined) {
          this.selectCourseCover = payload;
          this.updataCover(payload.file);
        }
      },
      async updataCover(cover) {
      try {
        const payload = {
          data: {
            "cover":cover,
          },
          options: {}
        };
        const { status } = await this.$Request.PUT(`${this.endpoint}/${this.dataItem}`, payload, this.configs.key);

        if(status === 200) {
          this.cover = cover;
          this.$swal({
            toast: true,
            position: 'bottom-end',
            showConfirmButton: false,
            timer: 3000,
            icon: 'success',
            title: 'แก้ไขรูปหน้าปก',
            text: 'แก้ไขรูปหน้าปก สำเร็จแล้ว',
          });
        }
      } catch (error) {
        debug.log(error)
      }
    },
          
    async toggleStatus() {
      try {
        const payload = {
          data: {
            "status":this.status,
          },
          options: {}
        };
        const { status } = await this.$Request.PUT(`${this.endpoint}/${this.dataItem}`, payload, this.configs.key);

        if(status === 200) {
          debug.log("Update Status");
        }
      } catch (error) {
        debug.log(error)
      }
    },
    async toggleVisibility() {
      try {
        const payload = {
          data: {
            "visibility":this.visibility,
          },
          options: {}
        };
        const { status } = await this.$Request.PUT(`${this.endpoint}/${this.dataItem}`, payload, this.configs.key);

        if(status === 200) {
          debug.log("Update Sync");
        }
      } catch (error) {
        debug.log(error)
      }
    },
    async changePlayerRef() {
      try {
        debug.log(this.playerRef);
        
        const payload = {
          "playerRef":this.playerRef,
        };
        const { data } = await this.$Request.PUT(`${this.endpoint}/${this.dataItem}`, payload, this.accessToken);

        if(data.success) {
          debug.log("Update playerRef");
          location.reload()
        }
      } catch (error) {
        debug.log(error)
      }
    },
    async changeExamRef() {
      try {
        debug.log(this.examRef);
        
        const payload = {
          "examRef":this.examRef,
        };
        const { data } = await this.$Request.PUT(`${this.endpoint}/${this.dataItem}`, payload, this.accessToken);

        if(data.success) {
          debug.log("Update examRef");
          location.reload()
        }
      } catch (error) {
        debug.log(error)
      }
    },
    async unlinkMaster() {
      try {
        const payload = {
          "master":"none",
          "examRef":this.dataItem,
          "playerRef":this.dataItem,
        };
        const { data } = await this.$Request.PUT(`${this.endpoint}/${this.dataItem}`, payload, this.accessToken);

        if(data.success) {
          debug.log("Update Unlink Master");
          location.reload()
        }
      } catch (error) {
        debug.log(error)
      }
    },
    async deleteParentPlayer(id) {

      dialog.confirm({
        title: 'ต้องการลบข้อมูลนี้?',
        message: 'หลังจากลบแล้วจะไม่สามารถกู้คืนข้อมูลนี้ได้อีก !',
        confirm: async () => {
          try {
            this.toast = toast({ type: 'pending', message: 'กำลังลบ..' });
            const { status, data } = await this.$Request.DELETE(`player/${id}`, null, this.configs.key);
            if(status === 200) {
              this.toast.hide('ลบเสร็จแล้ว.', 'success', 300);
              await this.getQueryData();
              debug.log(data);
            }
          } catch (error) {
            debug.log(error)
          }
        },
        cancel: () => {}
      });

    },
    async deletePlayer(updatedItem) {
      try {
        debug.log("updatedItem",updatedItem);
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
            this.confirmDeletePlayer(updatedItem.id);
          } else {
            debug.log("Cancel");
          }
        });
      } catch (error) {
        debug.log(error)
      }
    },
      async deleteExam(id,index) {
          if(this.login) {
            try {
              debug.log("id",id);
              debug.log("index",index);
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
                  this.confirmDeleteExam(id,index);
                } else {
                  debug.log("Cancel");
                }
              });
            } catch (error) {
              debug.log(error)
            }
          }
      },
      async confirmDeleteExam(id, index) {
  if(this.login) {
    try {
      const { status } = await this.$Request.DELETE(`exam/${id}`, null, this.configs.key);

      if(status === 200) {
        this.examData.splice(index, 1);
        this.$swal({
          toast: true,
          position: 'bottom-end',
          showConfirmButton: false,
          timer: 3000,
          icon: 'success',
          title: 'ลบข้อมูล',
          text: 'ลบข้อมุลนี้ สำเร็จแล้ว',
        });
      }
    } catch (error) {
      debug.log(error)
    }
  }
},
async reOrderPlayer(id, order) {
  if(this.login) {
    try {
      const payload = {
        data: {
          "order": order,
        },
        options: {}
      };
      const { data } = await this.$Request.PUT(`player/${id}`, payload, this.configs.key);

      if(data.success) {
        debug.log("ReOrder");
      }
    } catch (error) {
      debug.log(error)
    }
  }
},
      OpenFileBrowser()
      {
        this.FileBrowserOpen = true;
      },
      OpenVideoBrowser()
      {
        this.VideoBrowserOpen = true;
      },
      changeVideoTrigger(payload) {
        this.VideoBrowserOpen = payload;
      },
      selectVideoTrigger(payload) {
        debug.log("selectVideoTrigger");
        if(payload!=undefined) {
          this.selectCourseVideo = payload;
          debug.log("selectVideoTriggerFunction",payload)
          this.updataVideo(payload.file);
        }
      },
      checkMove: function(evt){
        return (evt.draggedContext.element.name!=='apple');
      },
      updated() {
      feather.replace();
      },
      async getFormData() {
  try {
    const payload = {
      method: 'find',
      args: [
        {
          $and: [
            { owner: this.session.current._id },
            { type: { $in: ['form'] } },
            { action: { $in: ['course'] } },
          ],
        },
      ],
      paging: { page: this.currentPage, limit: this.limitItem },
    };
    const { data } = await this.$Request.POST(`post/query`, payload, this.configs.key);

    this.listItems = data.data;
    debug.log(this.listItems);
    this.loading_sources = true;
  } catch (error) {
    debug.log(error)
  }
},
async updataForm(form) {
  if(this.login) {
    try {
      const payload = {
        data: {
          "form": form,
        },
        options: {}
      };
      const { status } = await this.$Request.PUT(`${this.endpoint}/${this.dataItem}`, payload, this.configs.key);

      if(status === 200) {
        this.form = form
        this.$swal({
          toast: true,
          position: 'bottom-end',
          showConfirmButton: false,
          timer: 3000,
          icon: 'success',
          title: 'Assign แบบฟอร์ม',
          text: 'Assign แบบฟอร์ม สำเร็จแล้ว',
        });
      }
    } catch (error) {
      debug.log(error)
    }
  }
},
      async updateForm() {
        if (this.selectedItem) {
          debug.log('Selected Item:', this.selectedItem._id, this.dataItem);
          await this.updataForm(this.selectedItem);
          await this.getQueryData();
          this.showPopupWindow = false;
        }
      },
      async showPopup() {
        await this.getFormData();
        this.showPopupWindow = true;
      },
      closePopup() {
        this.showPopupWindow = false;
      },
      async checkUrl(url, item, player) {
        const hasSubstring = url.desktop.includes('https://content.fti.academy/');

        if (hasSubstring) {
          try {
            this.activeBlock = true;
            this.activeBlock_text = 'กำลังดึงไฟล์จาก Academy Server...';

            const timeout = 60000; // Set a timeout value (in milliseconds)
            const responsePromise = fetch(url.desktop);

            // Start a timer to check the timeout
            const timeoutPromise = new Promise((resolve, reject) => {
              setTimeout(() => reject(new Error('File loading timed out')), timeout);
            });

            // Wait for either the response or the timeout
            const response = await Promise.race([responsePromise, timeoutPromise]);

            if (response) {
              const contentLength = response.headers.get('Content-Length');
              const fileSizeInBytes = parseInt(contentLength, 10);
              const fileSizeInMB = fileSizeInBytes / (1024 * 1024);
              let downloadedSize = 0;

              const reader = response.body.getReader();
              const chunks = [];

              this.activeBlock_text = `กำลังดึงไฟล์จาก Academy Server... (0 MB / ${fileSizeInMB.toFixed(2)} MB)`;

              let result = await reader.read();

              while (!result.done) {
                const chunk = result.value;
                chunks.push(chunk);
                downloadedSize += chunk.length;

                this.activeBlock_text = `กำลังดึงไฟล์จาก Academy Server... (${(downloadedSize / (1024 * 1024)).toFixed(2)} MB / ${fileSizeInMB.toFixed(2)} MB)`;

                result = await reader.read();
              }

              const totalSize = downloadedSize;
              const uint8Array = new Uint8Array(totalSize);
              let offset = 0;

              for (const chunk of chunks) {
                uint8Array.set(chunk, offset);
                offset += chunk.length;
              }

              this.activeBlock_text = 'กำลังตรวจสอบไฟล์...';

              const fileNameWithExtension = url.desktop.substring(url.desktop.lastIndexOf('/') + 1);
              const fileName = fileNameWithExtension.substring(0, fileNameWithExtension.lastIndexOf('.'));
              const fileExtension = fileNameWithExtension.substring(fileNameWithExtension.lastIndexOf('.') + 1);

              this.activeBlock_text = 'กำลังอัพโหลดไฟล์ขึ้น Server Cloud...';

              const uploadParams = {
                Bucket: this.schoolSession.s3Bucket,
                Key: "video/" + fileName + "." + fileExtension,
                Body: uint8Array,
                ACL: "public-read",
              };

              const data = await this.S3.send(new PutObjectCommand(uploadParams));
              debug.log("File uploaded successfully:", data);

              const outputLink = this.schoolSession.s3Endpoint + "video/" + fileName + "." + fileExtension;
              debug.log("outputLink:", outputLink);

              const callApi = await fetch("https://gateway.cloudrestfulapi.com/api/player/" + item, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json','client-token-key':this.configs.key },
                body: JSON.stringify({
                  data: {
                    "video": {
                      "desktop": outputLink,
                      "mobile": outputLink,
                    },
                  },
                  options: {}
                })
              });

              if (callApi.ok) {
                debug.log("Update Status");
                player.video.desktop = outputLink;
                this.activeBlock_text = 'อัพโหลดไฟล์เสร็จสิ้น';
              } else {
                throw new Error("Failed to update video URL");
              }
            }
          } catch (error) {
            console.error("Error uploading file:", error);
            // Handle error and provide appropriate feedback to the user
          } finally {
            this.activeBlock = false;
          }
        }
      },
      handleDeleteDocument(id, index) {
        this.documentData.splice(index, 1);
      },
      handleAddDocument() {
        this.getQueryData();
      },
      OpenThumbnailBrowser() {
        this.ThumbnailBrowserOpen = true;
      },
      changeThumbnailTrigger(payload) {
        this.ThumbnailBrowserOpen = payload;
      },
      async selectThumbnailTrigger(payload) {
        if (payload !== undefined) {
          this.thumbnail = payload.file; // Assuming payload.file contains the URL/path
          await this.updataThumbnail(payload.file);
        }
      },
      async updataThumbnail(thumbnailFileUrl) {
        try {
          const payload = {
            data: {
              "thumbnail": thumbnailFileUrl, // Make sure your backend expects a field named "thumbnail"
            },
            options: {}
          };
          const { status } = await this.$Request.PUT(`${this.endpoint}/${this.dataItem}`, payload, this.configs.key);

          if (status === 200) {
            this.$swal({
              toast: true,
              position: 'bottom-end',
              showConfirmButton: false,
              timer: 3000,
              icon: 'success',
              title: 'แก้ไขรูป Thumbnail',
              text: 'แก้ไขรูป Thumbnail สำเร็จแล้ว',
            });
            // Optionally, refresh data if needed
            // await this.getQueryData(); 
          } else {
            this.$swal({
              toast: true,
              position: 'bottom-end',
              showConfirmButton: false,
              timer: 3000,
              icon: 'error',
              title: 'เกิดข้อผิดพลาด',
              text: 'ไม่สามารถแก้ไขรูป Thumbnail ได้',
            });
          }
        } catch (error) {
          debug.log(error);
          this.$swal({
            toast: true,
            position: 'bottom-end',
            showConfirmButton: false,
            timer: 3000,
            icon: 'error',
            title: 'เกิดข้อผิดพลาด',
            text: 'การเชื่อมต่อล้มเหลว',
          });
        }
      },
    },
    created() {
      this.playerType = player;
      // Detect the active tab from the URL hash when the page loads
      if (window.location.hash) {
        const hash = window.location.hash.replace('#', '');
        if (this.tabs.some(tab => tab.code === hash)) {
          this.activeTab = hash;
        }
      }
    },
    async mounted () {
      try {
        if(this.master) {
          this.endpoint = "mcourse";
        } else {
          this.endpoint = "course";
        }
        await this.getQueryData();
        await this.fetchScoreCount();
        await this.fetchScorePassCount();
        await this.getCourseAdmin();

        this.modeType = mode;
        this.modeName = this.modeType ? this.objectFindByKey(this.modeType, 'code', this.mode)?.name || 'None' : 'None';

        this.displayType = display;
        this.displayName = this.displayType ? this.objectFindByKey(this.displayType, 'code', this.display)?.name || 'None' : 'None';

        this.kindType = kind;
        this.kindName = this.kindType ? this.objectFindByKey(this.kindType, 'code', this.type)?.name || 'None' : 'None';

        this.playerType   = player

      } catch (error) {
        console.error(Error);
      }
    },
    setup() {
      debug.log("Setup");
    },
};
</script>

<template>
  
<FileBrowser 
v-if="FileBrowserOpen" 
:isWindowsOpen="true" 
:callbackFunction="'cover'"
:allowFileType="['jpg','gif','png','jpeg']" 
@file-browser-trigger="changeFileTrigger" 
@file-browser-callback="selectFileTrigger"/>

<FileBrowser 
v-if="ThumbnailBrowserOpen" 
:isWindowsOpen="true" 
:callbackFunction="'thumbnail'" 
:allowFileType="['jpg','gif','png','jpeg']" 
@file-browser-trigger="changeThumbnailTrigger" 
@file-browser-callback="selectThumbnailTrigger"/>

<div v-if="!loading_sources" class="text-center"><Loader/></div>

<Subhead 
    :navigation="
    [
      {
        name: this.translate('general-back'),
        link: '/lesson/home#' + courseData.type,
        style: 'chevron-left',
        class: 'default-btn',
        visible: true,
        type: 'button',
      },
    ]"
/>


<div class="bg-white border-b border-gray-200">

  <div v-if="loading_sources" class="mx-auto px-4 sm:px-6 lg:px-8">
    
    <div class="pt-5">
      <div class="flex items-center space-x-5">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">
            <CourseIcon :title="courseData.name" :chcek="courseData.master"/>
          </h1>
          <p class="mt-2 text-sm font-medium text-gray-500">
            <Tooltip title="จำนวนบทเรียน" size="12">
              <span class="bg-gray-600 text-[12px] text-white rounded mr-2 pl-1 pr-1 pt-1 pb-1">
              0 <font-awesome-icon :icon="['fas','book']" class="text-white mr-2"/>
              </span>
              </Tooltip>
              
              <Tooltip title="แบบทดสอบ" size="12">
              <span class="bg-gray-600 text-[12px] text-white rounded mr-2 pl-1 pr-1 pt-1 pb-1">
              0 <font-awesome-icon :icon="['fas','square-check']" class="text-white mr-2"/> 
              </span>
              </Tooltip>
              
              <Tooltip title="ผู้ลงทะเบียน" size="12">
              <span class="bg-gray-600 text-[12px] text-white rounded mr-2 pl-1 pr-1 pt-1 pb-1">
                {{ courseData.enroll !== undefined ? courseData.enroll.length : 0 }} <font-awesome-icon :icon="['fas','user']" class="text-white mr-2"/>
              </span>
              </Tooltip>

              <template v-if="Array.isArray(courseData.categories) && courseData.categories.length > 0 && courseData.categories.filter(Boolean).length > 0">
                <a v-for="(categoryItem) in courseData.categories" :key="categoryItem.id" href="#" class="text-xs font-medium bg-indigo-600 pl-2 pr-2 pt-1 pb-1 mr-1 rounded text-white">
                  {{ categoryItem.name }}
                </a>
              </template>
              <template v-else>
                <span class="text-xs font-medium bg-red-600 pl-2 pr-2 pt-1 pb-1 mr-1 rounded text-white">ยังไม่มีหมวดหมู่</span>
              </template>
          </p>
        </div>
      </div>
    </div>
  
    <div>
      <div class="border-t border-gray-200 pt-3 mt-5">

          <ul class="flex space-x-2 tab-navigation"  id="tab-list">
            <template v-for="(tab) in tabs" :key="tab.code">
              <li v-if="isTabVisible(tab)" 
              :class="{ 'text-gray-500': activeTab !== tab.code, 'text-black': activeTab === tab.code, 'border-b-4 border-blue-500': activeTab === tab.code }" 
              @click="setActiveTab(tab.code)"
              class="cursor-pointer py-2 px-2">
                <span class="hidden md:inline relative"><font-awesome-icon :icon="['fas',tab.icon]"/> {{ tab.name }} 
                  <span v-if="tab.badge !== null" class="text-xs bg-red-500 text-white py-0 px-1 rounded-md text-center absolute right-0 top-[-15px]">{{ tab.badge }}</span>
                </span>
                <span class="md:hidden text-xs"><font-awesome-icon :icon="['fas',tab.icon]"/> {{ tab.shortname }}</span>
              </li>
            </template>
          </ul> 

          <div class="mobile-navigation">
            <div class="dropdown" @click="dropdownOpen = !dropdownOpen">
            <div class="dropdown-selected">
                <div class="flex justify-between">
                    <div class="flex">
                        <div class="tab-icon">
                           <font-awesome-icon :icon="['fas', TabData.icon]" class="text-sm mr-2" />
                        </div>
                       <div class="flex flex-col relative">
                            <div class="status-name">{{ TabData.name }} <span v-if="TabData.badge !== null" class="text-xs bg-red-500 text-white py-0 px-1 rounded-md text-center absolute right-0 top-[-15px]">{{ TabData.badge }}</span> </div>
                            <div class="status-description text-xs text-gray-400 single-line-ellipsis">{{ TabData.description }}</div>
                        </div>
                    </div>
                    <div class="tab-icon icon-line">
                        <font-awesome-icon 
                            :icon="dropdownOpen ? ['fas', 'caret-up'] : ['fas', 'caret-down']" 
                            class="text-sm ml-2" 
                        />
                    </div>
                </div>
            </div>
            <div class="dropdown-content" v-show="dropdownOpen">

                <template  v-for="(tab, index) in tabs" :key="index" >
                  <div 
                  class="dropdown-item" 
                  v-if="isTabVisible(tab)"
                  @click="setActiveTab(tab.code)"
                  >
                      <div class="flex justify-between">
                        <div class="flex">
                            <div class="tab-icon">
                                <font-awesome-icon :icon="['fas', tab.icon]" class="text-sm mr-2" />
                            </div>
                            <div class="flex flex-col">
                                <div class="status-name" :class="{ 'font-bold': tab.code === TabData.code }">{{ tab.name }} </div>
                                <div class="status-description text-xs text-gray-400 single-line-ellipsis">{{ tab.description }}</div>
                            </div>
                        </div>
                        
                        <div class="tab-icon icon-line relative">
                          <span v-if="tab.badge !== null" class="text-xs bg-red-500 text-white py-0 px-1 rounded-md text-center absolute right-0 top-[-15px]">{{ tab.badge }}</span>
                        </div>
                      </div>

                  </div>
                </template>
                
            </div>
          </div>
          
        </div>
        
      </div>
    </div>
    
  </div>
</div>

<div v-if="loading_sources" class="mx-auto mt-8 sm:px-6 ">
    
  <div class="space-y-6">
    
    <section aria-labelledby="applicant-information-title" v-if="activeTab === 'detail'" class="md:flex md:space-x-4">
      <!-- Left Column (80%) -->
      <div class="w-full md:w-9/12">
        <div class="bg-white rounded-lg shadow relative overflow-hidden">

          <div class="px-4 py-5 sm:px-6 relative">
            <h2 id="notes-title" class="text-lg font-bold text-gray-900"><font-awesome-icon :icon="['fas','home']" class="text-black mr-2"/> {{ translate('lesson-description') }} </h2>

            <div class="absolute top-4 right-4 ml-3 inline-flex items-center ">

              <button 
              @click="$router.push('/lesson/edit/' + this.dataItem + '/child/' + this.dataItem)"
              type="button" 
              class="ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-100">
              <font-awesome-icon :icon="['fas','pencil']" class="text-black pr-1"/> {{ translate('general-edit') }}
              </button>

              <button 
              type="button" 
              class="ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-100">
              <font-awesome-icon :icon="['fas','trash']" class="text-black pr-1"/> {{ translate('general-delete') }}
              </button>

            </div>

          </div>

          <div class="border-t border-gray-200 p-2">
          
            <div class="px-4 py-5 sm:px-6">

              <dl class="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                <div class="sm:col-span-1">
                  <dt class="text-sm font-bold text-black">{{translate('lesson-category')	}}</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{kindName}}</dd>
                </div>
                <div class="sm:col-span-1">
                  <dt class="text-sm font-bold text-black">{{translate('lesson-mode')	}}</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{modeName}}</dd>
                </div>
                <div class="sm:col-span-1">
                  <dt class="text-sm font-bold text-black">{{translate('lesson-display')	}}</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{displayName}}</dd>
                </div>
                <div class="sm:col-span-1">
                  <dt class="text-sm font-bold text-black">{{translate('lesson-price')}}</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{courseData.regular_price}} ({{courseData.sale_price}})</dd>
                </div>
              </dl>
              
            </div>
          </div>
        </div>

        <div class="mt-3 bg-white rounded-lg shadow">
          <div class="px-5 pt-5">
            <h2 id="applicant-information-title" class="text-lg font-semibold leading-6 text-gray-900">{{translate('lesson-content')}}</h2>
          </div>


          <!-- <pre>{{courseApiData}}</pre> -->
          <div class="px-4 py-2 pb-4 sm:px-6">

            <div v-if="description!=undefined&&description!=''" class="pt-2 mt-2 border-t border-gray-200">
              <h2 id="applicant-information-title" class="leading-6 text-sm font-bold text-black">คำอธิบาย</h2>
              <div v-html="description"></div>
            </div>

            <div v-if="principles!=undefined&&principles!=''" class="pt-2 mt-2 border-t border-gray-200">
              <h2 id="applicant-information-title" class="leading-6 text-sm font-bold text-black">หลักการและเหตุผล</h2>
              <div v-html="description"></div>
            </div>

            <div v-if="objective!=undefined&&objective!=''" class="pt-2 mt-2 border-t border-gray-200">
              <h2 id="applicant-information-title" class="leading-6 text-sm font-bold text-black">วัตถุประสงค์</h2>
              <div v-html="objective"></div>
            </div>
            
            <div v-if="target && target.length > 0" class="pt-2 mt-2 border-t border-gray-200">
              <h2 id="applicant-information-title" class="leading-6 text-sm font-bold text-black">กลุ่มเป้าหมาย</h2>
              <div class="flex flex-wrap gap-2 mt-2">
                <div v-for="(item, index) in target" :key="index" class="bg-blue-500 text-white rounded-sm px-2 py-1 text-xs">
                  {{ item.name }}
                </div>
              </div>
            </div>
            
            <div v-if="structure!=undefined&&structure!=''" class="pt-2 mt-2 border-t border-gray-200">
              <h2 id="applicant-information-title" class="leading-6 text-sm font-bold text-black">โครงสร้างหลักสูตร</h2>
              <div v-html="structure"></div>
            </div>
            
          </div>
        </div>

      </div>
    
      <!-- Right Column (20%) -->
      <div class="w-full md:w-3/12">

        <div class="bg-white rounded-lg shadow mt-3 md:mt-0">
          <!-- Sub-tab Navigation -->
          <div class="border-b border-gray-200">
            <ul class="flex -mb-px justify-around">
              <li class="flex-1">
                <a href="#"
                   @click.prevent="activeSubTab = 'cover'"
                   :class="{ 'border-indigo-500 text-indigo-600': activeSubTab === 'cover', 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300': activeSubTab !== 'cover' }"
                   class="block text-center whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm">
                   Thumbnail
                </a>
              </li>
              <li class="flex-1">
                <a href="#"
                   @click.prevent="activeSubTab = 'thumbnail'"
                   :class="{ 'border-indigo-500 text-indigo-600': activeSubTab === 'thumbnail', 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300': activeSubTab !== 'thumbnail' }"
                   class="block text-center whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm">
                  Cover
                </a>
              </li>
            </ul>
          </div>

          <!-- Sub-tab Content -->
          <div v-if="activeSubTab === 'cover'" class="p-0">
            <button 
              @click="OpenFileBrowser" 
              type="button"
              v-bind:style="{ 'background-image': 'url(' + this.cover + ')' }" 
              class="relative bg-cover block w-full rounded-b-lg border-t-0 border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                <div class="bg-white/80 p-3 rounded">
                  <font-awesome-icon :icon="['fas','cloud-upload']" class="mx-auto h-12 w-12 text-black"/>
                  <span class="mt-2 block text-sm font-medium text-black">{{translate('lesson-cover')}}</span>
                </div>
              </button>
          </div>
          <div v-if="activeSubTab === 'thumbnail'" class="p-0">
             <button
              @click="OpenThumbnailBrowser" 
              type="button"
              v-bind:style="{ 'background-image': 'url(' + this.thumbnail + ')' }" 
              class="relative bg-cover block w-full rounded-b-lg border-t-0 border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                <div class="bg-white/80 p-3 rounded">
                  <font-awesome-icon :icon="['fas','images']" class="mx-auto h-12 w-12 text-black"/>
                  <span class="mt-2 block text-sm font-medium text-black">Thumbnail</span>
                </div>
              </button>
          </div>
        </div>

        <div class="mt-3 relative bg-white rounded-lg shadow overflow-hidden">

          <div class="absolute right-0 top-0 h-16 w-16" v-if="this.master">
            <div
              class="absolute transform rotate-45 bg-rose-600 text-sm text-center text-white font-medium py-1 left-[-64px] top-[32px] w-[170px]">
              {{ translate('lesson-master')	 }}
            </div>
          </div>

          <div class="absolute right-0 top-0 h-16 w-16" v-if="!this.master">
            <div
              class="absolute transform rotate-45 bg-emerald-600 text-sm text-center text-white font-medium py-1 left-[-64px] top-[32px] w-[170px]">
              {{ translate('lesson-mirror')	 }}
            </div>
          </div>

          <div class="px-5 py-5 sm:px-5">
            <div class="mt-1 flex items-center">
              <div class="flex">
                <div class="relative flex cursor-pointer items-center py-1 px-1 border-r-[1px] pr-5 mr-1">
                  <div class="relative text-sm font-medium text-blue-gray-900">
                    <span><Toggle v-model="status" @change="toggleStatus"/></span>
                  </div>
                </div>
                <div class="ml-3 rounded-md border border-transparent bg-transparent py-2 px-3 text-sm font-bold text-blue-gray-900 hover:text-blue-gray-700 focus:border-blue-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-blue-gray-50">
                {{ translate('lesson-display-method')	}}
                <p class="font-medium">
                  {{ status ? 'แสดงหน้าเว็บ' : 'ไม่แสดง' }}
                  </p>
                </div>
              </div>
            </div>

            <div class="mt-1 flex items-center">
              <div class="flex">
                <div class="relative flex cursor-pointer items-center py-1 px-1 border-r-[1px] pr-5 mr-1">
                  <div class="relative text-sm font-medium text-blue-gray-900">
                    <span><Toggle v-model="visibility" @change="toggleVisibility"/></span>
                  </div>
                </div>
                <div class="ml-3 rounded-md border border-transparent bg-transparent py-2 px-3 text-sm font-bold text-blue-gray-900 hover:text-blue-gray-700 focus:border-blue-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-blue-gray-50">
                {{ translate('lesson-register-method') }}
                <p class="font-medium">
                {{ visibility ? 'ลงทะเบียนได้ทุกคน' : 'จำกัดผู้ลงทะเบียน' }}
                </p>
                </div>
              </div>
            </div>
          </div>

          <div class="relative px-4 pt-5 pb-12 sm:px-6 sm:pt-6 border-t border-gray-200">
            <dt>
              <div class="absolute rounded-md bg-indigo-500 p-3">
                <font-awesome-icon :icon="['fas','user-tie']" class="h-6 w-6 text-white"/>
              </div>
              <p class="ml-16 truncate text-sm font-medium text-gray-500">{{translate('lesson-staff')	}}</p>
            </dt>
            <dd class="ml-16 flex items-baseline pb-6 sm:pb-7">
              <p class="text-2xl font-semibold text-gray-900">
                {{ courseData.admin && Array.isArray(courseData.admin) && courseData.admin.length > 0 ? courseData.admin.length : '0' }}
              </p>                        
              <p class="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                <!-- Heroicon name: mini/arrow-up -->
                <svg class="h-5 w-5 flex-shrink-0 self-center text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M10 17a.75.75 0 01-.75-.75V5.612L5.29 9.77a.75.75 0 01-1.08-1.04l5.25-5.5a.75.75 0 011.08 0l5.25 5.5a.75.75 0 11-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0110 17z" clip-rule="evenodd" />
                </svg>
                <span class="sr-only"> Increased by </span>
                0
              </p>
              <div class="absolute inset-x-0 bottom-0 bg-gray-50 px-2 py-2 sm:px-3">
                <div class="text-sm">

                  <div>
                    <button @click="openModal" class="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded w-full">
                      <font-awesome-icon :icon="['fas','edit']" class="pr-2 pl-2"/> {{ translate('lesson-managestaff')	 }}
                    </button>
                
                    <div v-if="modalOpen" class="fixed inset-0 flex items-center justify-center z-10">
                      <!-- Dim overlay background -->
                      <div class="absolute inset-0 bg-black opacity-75"></div>
                
                      <!-- Modal -->
                      <div class="bg-white w-[600px] z-10 max-w-lg mx-auto rounded-lg overflow-hidden">
                        <!-- Search form -->
                        <form @submit.prevent="performSearch" class="p-6">
                          <div class="mb-4">
                            <label for="searchQuery" class="block text-gray-700 font-bold mb-2">ค้นหาข้อมูลเจ้าหน้าที่:</label>
                            <input type="text" id="searchQuery" v-model="searchQuery" @input="autoSearch" placeholder="ค้นหาจาก ชื่อผู้ใช้ อีเมล์ ชื่อ-นามสกุล หรือ เบอร์โทร..." class="border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                          </div>
                        </form>

                        <table class="w-full">
                          <thead>
                            <tr>
                              <th class="px-6 py-3 bg-gray-200 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">Name</th>
                              <th class="px-6 py-3 bg-gray-200 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">Email</th>
                              <th class="px-6 py-3 bg-gray-200 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                          </thead>
                          <tbody>

                            <tr v-for="result in filteredResults" :key="result.id">
                              <td class="px-6 py-4 whitespace-no-wrap">{{ result.firstname }} {{ result.lastname }}</td>
                              <td class="px-6 py-4 whitespace-no-wrap">{{ result.email }}</td>
                              <td class="px-6 py-4 whitespace-no-wrap">
                                <button @click="assignManager(result)" class="bg-blue-500 hover:bg-blue-700 text-white p-2 rounded"><font-awesome-icon :icon="['fas','plus']" class="h-3 w-3 text-white"/> Assign</button>
                              </td>
                            </tr>

                            <tr v-for="admin in filteredAdmin" :key="admin._id">
                              <td class="px-6 py-4 whitespace-no-wrap">{{ admin.firstname }} {{ admin.lastname }}</td>
                              <td class="px-6 py-4 whitespace-no-wrap">{{ admin.email }}</td>
                              <td class="px-6 py-4 whitespace-no-wrap">
                                <button @click="unassignManager(admin)" class="bg-red-500 hover:bg-red-700 text-white p-2 rounded"><font-awesome-icon :icon="['fas','trash']" class="h-3 w-3 text-white"/> ลบ</button>
                              </td>
                            </tr>
                            
                          </tbody>
                        </table>
                
                        <div class="p-4 bg-gray-100 flex justify-between">
                          
                          <router-link to="/setup/admin" class="">
                            <button class="bg-green-500 hover:bg-green-700 text-white py-2 px-4 rounded">
                              <font-awesome-icon :icon="['fas','user-tie']" class="h-3 w-3 text-white"/> รายชื่อเจ้าหน้าที่
                            </button>
                          </router-link>

                          <button @click="closeModal" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                            ปิด
                          </button>

                        </div>

                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </dd>
          </div>
          

          <div class="border-t border-gray-200 bg-gray-50 px-4 py-4 sm:px-6 text-right" v-if="courseData.master!='none'&&!this.master">
            <div class="grid grid-cols-2 gap-1">
              <button 
                @click="$router.push('/lesson/edit/' + courseData.master + '/master/' + this.dataItem)"
                type="button" 
                class="w-full inline-flex justify-center rounded-md border border-transparent bg-gray-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                <font-awesome-icon :icon="['fas','edit']" class="pr-2 pl-2"/>{{ translate('lesson-edit-master')	 }}
              </button>
            
              <button 
                @click="unlinkMaster()"
                type="button" 
                class="w-full inline-flex justify-center rounded-md border border-transparent bg-rose-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                <font-awesome-icon :icon="['fas','save']" class="pr-2 pl-2"/>{{ translate('lesson-unlink-master')	 }}
              </button>
            </div>
            
            <p class="text-left text-sm text-rose-400 pt-3">{{translate('lesson-unlink-comment')	}}</p>
  
          </div>

        </div>

      </div>
    </section>


    

    <section aria-labelledby="applicant-information-title" v-if="activeTab === 'material'">
      <MaterialList ref="material" :tabs="TabData"
        :dataItem="dataItem"
        />
    </section>

    <section aria-labelledby="applicant-information-title" v-if="activeTab === 'form'">
      <div class="bg-white shadow sm:rounded-lg">
        <FormList ref="form" :tabs="TabData"
          :examCount="examCount"
          :courseData="courseData"
          :dataItem="dataItem"
          :examData="examData"
          :callParentFunctionProp="getQueryData"
          />
      </div>
    </section>

    <section aria-labelledby="applicant-information-title" v-if="activeTab === 'contest'">
      <div class="bg-white shadow sm:rounded-lg">
        <ContestList ref="contest" :tabs="TabData"
        :examCount="examCount"
        :courseData="courseData"
        :dataItem="dataItem"
        :examData="examData"
        />
      </div>
    </section>

    <section aria-labelledby="applicant-information-title" v-if="activeTab === 'document'">
      <div class="bg-white shadow sm:rounded-lg">

        <DocumentList ref="document" :tabs="TabData"
        :documentData="documentData"
        :courseData="courseData"
        @delete-document="handleDeleteDocument"
        @add-document="handleAddDocument"
        />
      </div>
    </section>

    <section aria-labelledby="applicant-information-title" v-if="activeTab === 'enroll'">
      <EnrollTable ref="enroll" :tabs="TabData"
      :pageTitle="'ผู้ลงทะเบียนหลักสูตรนี้'"
      :courseData="courseData"
      />
    </section>

    <section aria-labelledby="applicant-information-title" v-if="activeTab === 'dashboard'">

      <EnrollDashboard ref="enroll" :tabs="TabData"
      :pageTitle="'ผู้ลงทะเบียนหลักสูตรนี้'"
      :courseData="courseData"
      :isPublic="false"
      />

    </section>

    <section aria-labelledby="applicant-information-title" v-if="activeTab === 'survey'">
      <div class="bg-white shadow sm:rounded-lg">
        <SurveyList ref="survey" :tabs="TabData"
        :examCount="examCount"
        :courseData="courseData"
        :dataItem="dataItem"
        :examData="examData"
        :callParentFunctionProp="getQueryData"
        />
      </div>
    </section>

    <section aria-labelledby="applicant-information-title" v-if="activeTab === 'certification'">
      <div class="bg-white shadow sm:rounded-lg">
        <CertificateList ref="certification" :tabs="TabData"
        :examCount="examCount"
        :courseData="courseData"
        :dataItem="dataItem"
        :examData="examData"
        :callParentFunctionProp="getQueryData"
        />
      </div>
    </section>

    <section aria-labelledby="applicant-information-title" v-if="activeTab === 'condition'">
      <div class="bg-white shadow sm:rounded-lg">
        <Condition ref="condition" :tabs="TabData"
        :examCount="examCount"
        :courseData="courseData"
        :dataItem="dataItem"
        :examData="examData"
        :callParentFunctionProp="getQueryData"
        />
      </div>
    </section>

    <section aria-labelledby="applicant-information-title" v-if="activeTab === 'learning_path'">
      <div class="bg-white shadow sm:rounded-lg">
        <PipelineList ref="pipeline" :tabs="TabData"
        :courseData="courseData"
        :dataItem="dataItem"
        :callParentFunctionProp="getQueryData"
        @update-badge="handleUpdateBadge"
        />
      </div>
    </section>

    <section aria-labelledby="applicant-information-title" v-if="activeTab === 'schedule'">
      <div class="bg-white shadow sm:rounded-lg">
        <Schedule ref="schedule" :tabs="TabData"
        :documentData="documentData"
        :courseData="courseData"
        @delete-document="handleDeleteDocument"
        @add-document="handleAddDocument"
        />
      </div>
    </section>

    <section aria-labelledby="applicant-information-title" v-if="activeTab === 'assignment'">
      <div class="bg-white shadow sm:rounded-lg">
        <AssignmentSubmission ref="assignment" :tabs="TabData"
        :courseData="courseData"
        :dataItem="dataItem"
        :callParentFunctionProp="getQueryData"
        @update-badge="handleUpdateBadge"
        />
      </div>
    </section>

  </div>

</div>

</template>
<style src="@vueform/toggle/themes/default.css"></style>
<style>
.button {
  margin-top: 35px;
}
.flip-list-move {
  transition: transform 0.5s;
}

.flip-list-sub-move {
  transition: transform 0.5s;
}
.no-move {
  transition: transform 0s;
}
.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}
.list-group {
  min-height: 20px;
}
.list-group-item {
  cursor: move;
}
.list-group-item i {
  cursor: pointer;
}
.btn {
  @apply font-bold py-2 px-4 rounded;
}
.btn-blue {
  @apply bg-blue-500 text-white;
}
.btn-blue:hover {
  @apply bg-blue-700;
}


.toggle-container:focus {
  box-shadow:unset;
  outline: unset;
}

.tox-tinymce {
  border: 0px!important;
  border-radius: 0px!important;
}

.no-transition {
  transition-property: none !important;
}

@media (min-width: 768px) {
  /* Display tabs for screens wider than 768px */
  #tab-list {
    display: flex;
  }
  #tab-dropdown {
    display: none;
  }
}

@media (max-width: 767px) {
  /* Display dropdown for screens 767px and below */
  #tab-list {
    display: none;
  }
  #tab-dropdown {
    display: block;
  }
}


.tab-navigation {
  display: block;
}

.mobile-navigation {
  display: none;
}

.dropdown {
  position: relative;
  display: inline-block;
  padding: 10px;
  border: 1px solid #d0d0d0;
  width: 100%;
  border-radius: 5px;
  box-shadow: 0px 1px 4px 0px rgba(0,0,0,0.1);
}

.dropdown-content {
  display: none;
  position: absolute;
  background-color: #fff;
  box-shadow: 0px 1px 4px 0px rgba(0,0,0,0.1);
  z-index: 1;
  width: 100%;
  left: 0;
  top: 70px;
  border: solid 1px #d0d0d0;
  border-radius: 5px;
}

.dropdown-content .dropdown-item {
  color: black;
  padding: 12px 16px;
  text-decoration: none;
  display: block;
}

.dropdown-content .dropdown-item:hover {background-color: #bbbbbb}
.dropdown:hover .dropdown-content {display: block;}

/* Hide tab navigation and show custom dropdown on small screens */
@media (max-width: 768px) {
  .tab-navigation {
    display: none;
  }

  .mobile-navigation {
    display: block;
    padding: 10px;
  }
}

.single-line-ellipsis {
  white-space: nowrap; /* Prevent line breaks */
  overflow: hidden; /* Hide overflowing content */
  text-overflow: ellipsis; /* Display ellipsis (...) for truncated text */
}

</style>
