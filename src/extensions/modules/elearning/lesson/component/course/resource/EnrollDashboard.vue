<script>
import storageManager from '@/plugins/storage';
import Loader       from '@/interface/template/Loader.vue';

import Pagination from '@/utils/Paginated.vue';
import BatchProgress from '@/utils/BatchProgress.vue';
import convertUtils from "@/plugins/convertUtils";
import debug from '@/plugins/Logger.js';

import CryptoJS from 'crypto-js';
import dialog from '@/plugins/Dialog.js';

//import VideoThumbnail from './VideoThumbnail.vue'; // Ensure the path is correct


export default {
    props: {
      pageTitle: {
        type: String,
        default: () => ''
      },
      isPublic: Boolean,
      courseData: Object,
      callParentFunctionProp: Function,
      tabs: Object,
      updateTabs: Object,
    },
    data() {
      const session = storageManager.get('session')
      const configs = storageManager.get('configs')
      return {
        videoLoaded: [],
        
        // 🚀 PROGRESSIVE/LAZY LOADING SYSTEM - Always enabled for optimization
        lazy: true,                    // เปิดระบบ lazy loading เสมอ
        initialDisplayCount: 20,       // จำนวนรายการแสดงครั้งแรก
        loadMoreCount: 10,             // จำนวนรายการที่โหลดเพิ่มทีละครั้ง
        currentDisplayCount: 20,       // จำนวนรายการที่แสดงอยู่ปัจจุบัน
        isLoadingMore: false,          // สถานะการโหลดเพิ่มเติม
        scrollCleanup: null,           // function สำหรับ cleanup scroll listeners
        showProgressToast: false,      // แสดง progress toast เมื่อ scroll
        scrollTimeout: null,           // timeout สำหรับซ่อน toast

        open: false,
        dataItem: this.$route.params.id,
        school: (session && session.current && session.current._id) || (configs && configs.siteID),
        login:session.login,
        isModalOpen: false,
        csvData: [], // Store parsed CSV data here
        editingCell: null,
        listItems: [],
        reportData: [],
        loadSummary:false,
        loadingSummary: false,
        summaryCache: null, // เก็บ cache ของ summary
        summaryFromCache: false, // ติดตามว่าข้อมูลมาจาก cache หรือไม่
        cacheExpiry: 15 * 60 * 1000, // 15 นาที
        lightboxOpen: false,
        selectedImageUrl: null,
        summary: {
          complete_13: 'N/A',
          complete_13_round1: 'N/A',
          complete_13_round2: 'N/A',
          processing_0: 'N/A',
          processing_0_round1: 'N/A',
          processing_0_round2: 'N/A',
          no_analytics_data: 'N/A',
          complete_between_1_and_12: 'N/A',
          complete_between_1_and_12_round1: 'N/A',
          complete_between_1_and_12_round2: 'N/A',
          verified_true: 'N/A',
          verified_false: 'N/A',
          verified_all: 'N/A',
          exam_round_1: 'N/A',
          exam_round_2: 'N/A',
          cert_5_year: 'N/A',
          cert_3_year: 'N/A',
          cert_zone_1: 'N/A',
          total_entries: 'N/A',
          no_analytics_data_exam_round_1: 'N/A',
          complete_13_exam_round_1: 'N/A',
          no_analytics_data_exam_round_2: 'N/A',
          complete_13_exam_round_2: 'N/A',
        },
        categoryData:[],
        loading_sources: true,
        endpoint: "",
        master:session.master,
        accessToken: storageManager.get('session','token'),
        configs: storageManager.get('configs'),
        session: storageManager.get('session'),
        limitItem:10,
        limitOptions: [1,10, 50, 100, 200, 500, 1000, 2000, 3000, 4000], // Define the available options
        currentPage: 1,
        totalPages: 0,
        totalItems: 0,
        loading: false,
        showingOverlay: false,
        searchQuery: "",
        statusFilter:"all",
        isCreatingUser: false,
        isShowingOverlay: false,
        loadingMessage: '',
        processingCount: '',
        debounceTimer: null,
        activeBlock: false,
        scb:[],
        isProcessing: false,
        selectedTab: 'csv', // Initial selected tab
        manualInput: {
          firstname: '',
          lastname: '',
          citizen: null,
          phone: '',
          email: '',
          username: '',
          password: '',
          parent: (session && session.current && session.current._id) || (configs && configs.siteID),
          salt: '',
          role: 'user',
          info: {
            prefix: '', // Add other fields as needed
            sex: '',
            bu_type: '',
            bu_name: '',
            position: '',
          },
        },
        prefixMapping: {
          'mrs': 'นาง',
          'mis': 'นางสาว',
          'mr': 'นาย'
        },
        sexMapping: {
          'male': 'ชาย',
          'female': 'หญิง',
          'other': 'ไม่ระบุ'
        },
        educationMapping: {
          'standard_bachelor': 'ปริญญาตรี',
          'upper_bachelor': 'สูงกว่าปริญญาตรี',
          'under_bachelor': 'ต่ำกว่าปริญญาตรี',
        },
        processName: "Enroll Processing", // Customize this process name
        progressText: "",
        progressTotal: 0,
        progressCurrent: 0,
        startTime: null,
        endTime: null,
        layoutVisibility: {
          order: true,
          enroll: true
        },
        cert_area : [
          { id: "1", value: "สำนักวิจัยและพัฒนาการเกษตรเขตที่ 1"},
          { id: "2", value: "สำนักวิจัยและพัฒนาการเกษตรเขตที่ 2"},
          { id: "3", value: "สำนักวิจัยและพัฒนาการเกษตรเขตที่ 3"},
          { id: "4", value: "สำนักวิจัยและพัฒนาการเกษตรเขตที่ 4"},
          { id: "5", value: "สำนักวิจัยและพัฒนาการเกษตรเขตที่ 5"},
          { id: "6", value: "สำนักวิจัยและพัฒนาการเกษตรเขตที่ 6"},
          { id: "7", value: "สำนักวิจัยและพัฒนาการเกษตรเขตที่ 7"},
          { id: "8", value: "สำนักวิจัยและพัฒนาการเกษตรเขตที่ 8"},
          { id: "9", value: "สำนักควบคุมพืชและวัสดุการเกษตร กรุงเทพมหานคร"},
        ],
        cert_age : [
          { id: "3", value: "จำหน่ายสารไกลโฟเซต"},
          { id: "5", value: "ไม่จำหน่ายสารไกลโฟเซต"},
        ],
      }
    },
    components: {
      Loader,
      Pagination,
      BatchProgress,
      //VideoThumbnail
    },
    methods: {
      // 🚀 CACHE MANAGEMENT METHODS
      getCacheKey() {
        return `enrollSummary_${this.dataItem}_${this.statusFilter}`;
      },

      getSummaryFromCache() {
        try {
          const cacheKey = this.getCacheKey();
          const cached = sessionStorage.getItem(cacheKey);
          
          if (cached) {
            const { data, timestamp } = JSON.parse(cached);
            const now = Date.now();
            
            // ตรวจสอบว่า cache หมดอายุหรือยัง
            if (now - timestamp < this.cacheExpiry) {
              console.log('📦 ใช้ข้อมูลจาก cache', { age: Math.round((now - timestamp) / 1000), seconds: 'วินาที' });
              return data;
            } else {
              console.log('⏰ Cache หมดอายุแล้ว, จะดึงข้อมูลใหม่');
              sessionStorage.removeItem(cacheKey);
            }
          }
        } catch (error) {
          console.warn('❌ ไม่สามารถอ่าน cache ได้:', error);
        }
        
        return null;
      },

      saveSummaryToCache(data) {
        try {
          const cacheKey = this.getCacheKey();
          const cacheData = {
            data: data,
            timestamp: Date.now()
          };
          
          sessionStorage.setItem(cacheKey, JSON.stringify(cacheData));
          console.log('💾 บันทึกข้อมูลลง cache แล้ว');
        } catch (error) {
          console.warn('❌ ไม่สามารถบันทึก cache ได้:', error);
        }
      },

      clearSummaryCache() {
        try {
          const cacheKey = this.getCacheKey();
          sessionStorage.removeItem(cacheKey);
          console.log('🗑️ ลบ cache แล้ว');
        } catch (error) {
          console.warn('❌ ไม่สามารถลบ cache ได้:', error);
        }
      },

      async hardRefreshSummary() {
        console.log('🔄 Hard refresh summary data...');
        this.clearSummaryCache();
        await this.getSummary(true); // ส่ง flag บอกว่าเป็น hard refresh
      },

      // 🚀 PROGRESSIVE/LAZY LOADING METHODS
      async loadMoreItems() {
        if (this.isLoadingMore || !this.hasMoreItems) return;
        
        this.isLoadingMore = true;
        
        // Simulate loading delay for better UX
        await new Promise(resolve => setTimeout(resolve, 300));
        
        this.currentDisplayCount = Math.min(
          this.currentDisplayCount + this.loadMoreCount,
          this.listItems.length
        );
        
        this.isLoadingMore = false;
      },

      setupScrollDetection() {
        if (!this.lazy) return;

        const handleScroll = this.debounce(() => {
          if (this.isLoadingMore || !this.hasMoreItems) return;

          const containers = [window, document.documentElement, document.body];
          
          for (const container of containers) {
            const scrollHeight = container === window ? 
              Math.max(document.documentElement.scrollHeight, document.body.scrollHeight) :
              container.scrollHeight;
            
            const scrollTop = container === window ? 
              (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop) :
              container.scrollTop;
            
            const clientHeight = container === window ? 
              window.innerHeight :
              container.clientHeight;

            if (scrollTop + clientHeight >= scrollHeight * 0.8) {
              this.loadMoreItems();
              break;
            }
          }
        }, 100);

        // Setup listeners
        const events = ['scroll', 'wheel'];
        const targets = [window, document, document.body];
        
        targets.forEach(target => {
          events.forEach(event => {
            target.addEventListener(event, handleScroll, { passive: true });
          });
        });

        // Return cleanup function
        this.scrollCleanup = () => {
          targets.forEach(target => {
            events.forEach(event => {
              target.removeEventListener(event, handleScroll);
            });
          });
        };
      },

      resetDisplayCount() {
        const totalItems = this.listItems.length;
        
        // Progressive Loading ทำงานเสมอ
        // Adjust initial count based on limitItem
        if (this.limitItem <= 50) {
          this.initialDisplayCount = Math.min(25, totalItems);
        } else if (this.limitItem <= 100) {
          this.initialDisplayCount = Math.min(50, totalItems);
        } else if (this.limitItem <= 500) {
          this.initialDisplayCount = Math.min(100, totalItems);
        } else {
          this.initialDisplayCount = Math.min(200, totalItems);
        }
        
        this.currentDisplayCount = this.initialDisplayCount;
        
        // Setup scroll detection
        this.$nextTick(() => {
          this.setupScrollDetection();
          this.setupScrollToastDetection();
        });
      },

      // 🚀 PROGRESSIVE/LAZY LOADING - SCROLL TOAST METHODS
      setupScrollToastDetection() {
        const handleScroll = () => {
          if (!this.progressiveLoadingStats || this.progressiveLoadingStats.percentage >= 100) return;
          
          // แสดง toast เมื่อ scroll (เฉพาะเมื่อยังไม่ 100%)
          this.showProgressToast = true;
          
          // ซ่อน toast หลังจาก 2 วินาที
          if (this.scrollTimeout) {
            clearTimeout(this.scrollTimeout);
          }
          
          this.scrollTimeout = setTimeout(() => {
            this.showProgressToast = false;
          }, 2000);
        };

        // Setup scroll listeners
        const targets = [window, document, document.body];
        
        targets.forEach(target => {
          target.addEventListener('scroll', handleScroll, { passive: true });
        });

        // Return cleanup function
        const cleanup = () => {
          targets.forEach(target => {
            target.removeEventListener('scroll', handleScroll);
          });
          if (this.scrollTimeout) {
            clearTimeout(this.scrollTimeout);
            this.scrollTimeout = null;
          }
        };

        // เพิ่ม cleanup ไปยัง scrollCleanup ที่มีอยู่
        const originalCleanup = this.scrollCleanup;
        this.scrollCleanup = () => {
          if (originalCleanup) originalCleanup();
          cleanup();
        };
      },

      showAllItems() {
        this.currentDisplayCount = this.listItems.length;
        if (this.scrollCleanup) {
          this.scrollCleanup();
          this.scrollCleanup = null;
        }
      },

      debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
          const later = () => {
            clearTimeout(timeout);
            func(...args);
          };
          clearTimeout(timeout);
          timeout = setTimeout(later, wait);
        };
      },

      // 🚀 PROGRESSIVE/LAZY LOADING - USER PREFERENCE MANAGEMENT
      saveLazyPreference() {
        try {
          localStorage.setItem('enrollDashboard_lazyLoading', JSON.stringify(this.userLazyPreference));
        } catch (error) {
          console.warn('Failed to save lazy loading preference:', error);
        }
      },

      loadLazyPreference() {
        try {
          const saved = localStorage.getItem('enrollDashboard_lazyLoading');
          if (saved !== null) {
            this.userLazyPreference = JSON.parse(saved);
            this.lazy = this.userLazyPreference;
          }
        } catch (error) {
          console.warn('Failed to load lazy loading preference:', error);
        }
      },

      // ... existing methods ...
      async bypassContent(enroll) {
        try {
          const enrollId = enroll._id;
          const url = `https://gateway.cloudrestfulapi.com/api/enroll/${enrollId}`;

          // Check the current value of enroll.analytics.bypass
          const currentBypass = enroll.analytics.bypass;

          // Prepare the data to be sent in the request body
          const requestBody = {
            data: {
              analytics: {
                ...enroll.analytics, // Spread the existing analytics data
                bypass: !currentBypass, // Toggle the value of bypass
              },
            },
            options: {},
          };

          // Send the PUT request to update the enroll data
          const response = await fetch(url, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'client-token-key': this.configs.key,
            },
            body: JSON.stringify(requestBody),
          });

          if (response.ok) {
            //this.$toast.success(`Content bypass ${!currentBypass ? 'enabled' : 'disabled'} successfully`);
            await this.getData({ field: 'form.createdAt', order: -1 });
          } else {
            throw new Error('Failed to update content bypass');
          }
        } catch (error) {
          console.error('Error updating content bypass:', error);
          this.$toast.error('Failed to update content bypass');
        }
      },
      loadVideo(videoUrl, index) {
        this.videoLoaded[index] = true; // ตั้งค่าสถานะว่าโหลดวิดีโอแล้ว

        // ใช้ setTimeout เพื่อให้แน่ใจว่าวิดีโอถูกสร้างขึ้นใน DOM
        this.$nextTick(() => {
          const videoElement = this.$refs[`videoElement-${index}`]; // เข้าถึงวิดีโอ

          // ตรวจสอบว่ามี videoElement หรือไม่
          if (videoElement && videoElement.length > 0) {
            videoElement[0].load(); // โหลดวิดีโอ
            videoElement[0].play(); // เล่นวิดีโอ
          } else {
            console.error(`Video element not found for index: ${index}`);
          }
        });
      },
      captureFrame(video, index) {
        if (!video) {
          console.error(`Video element not found for index: ${index}`);
          return;
        }

        // Create a canvas to capture the video frame
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        
        try {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataURL = canvas.toDataURL();
          // Directly update the item's posterUrl property
          this.items[index].posterUrl = dataURL;
        } catch (error) {
          console.error('Error capturing frame:', error);
        }
      },
      progressBarColor(percent) {
        if (percent < 25) {
          return 'bg-red-600'; // Red for less than 25%
        } else if (percent < 50) {
          return 'bg-orange-600'; // Orange for 25% to 49%
        } else if (percent < 75) {
          return 'bg-yellow-600'; // Yellow for 50% to 74%
        } else {
          return 'bg-green-600'; // Green for 75% and above
        }
      },
      openLightbox(url) {
        this.selectedImageUrl = url;
        this.lightboxOpen = true;
      },
      
      isValidVideoUrl(url) {
        return url && url.endsWith('.webm');
      },
      generateRandomIPv4() {
        const getRandomByte = () => Math.floor(Math.random() * 256);
        return `${getRandomByte()}.${getRandomByte()}.${getRandomByte()}.${getRandomByte()}`;
      },
      formatNumber(number) {
        return convertUtils.formatNumber(number);
      },
      calculateSummary() {
        // Reset summary counts to 0 before calculation to ensure fresh start
        this.summary = {
          complete_13: 0,
          processing_0: 0,
          verified_true: 0,
          verified_false: 0,
          exam_round_1: 0,
          exam_round_2: 0, // Added support for round 2
          cert_3_year: 0,  // Added support for 3-year certificates
          cert_5_year: 0,
          cert_zone_1: 0,
        };

        this.listItems.forEach((item) => {
          const { analytics, verified, form } = item.enroll;
          const form_data = form?.formData; // Use optional chaining here

          if (analytics?.complete === 13) this.summary.complete_13++;
          if (analytics?.processing === 0) this.summary.processing_0++;
          
      // Check both status and url for determining verified_true and verified_false
      if (verified?.pre?.status === true && verified?.pre?.url !== null && verified?.pre?.url !== '') {
            this.summary.verified_true++;
          } else {
            this.summary.verified_false++;
          }

          if (form_data?.["radiobox-14-0-9"]?.value?.value === "round-1") this.summary.exam_round_1++;
          if (form_data?.["radiobox-14-0-9"]?.value?.value === "round-2") this.summary.exam_round_2++;
          if (form_data?.["radiobox-24-10-10"]?.value?.value === "5-year") this.summary.cert_5_year++;
          if (form_data?.["radiobox-24-10-10"]?.value?.value === "3-year") this.summary.cert_3_year++;
          if (form_data?.["radiobox-25-10-10"]?.value?.value === "zone-1") this.summary.cert_zone_1++;
        });
      },
        toggleVideoPlay() {
            const video = this.$refs.videoElement;

            if (!this.isPlaying) {
                video.play();
                this.isPlaying = true;
            } else {
                video.pause();
                this.isPlaying = false;
            }
        },
      async callbackFunction() {
        try {
          debug.log("callbackFunction");
          await this.getData();
        } catch (error) {
          console.error(error);
        }
      },
      updateBadge(badgeValue) {
        debug.log(badgeValue);
        this.$emit('update-badge', { code: this.tabs.code, badge: badgeValue });
      },
      isEditing(rowIndex, cellIndex) {
        return this.editingCell !== null && this.editingCell.rowIndex === rowIndex && this.editingCell.cellIndex === cellIndex;
      },
      startEditing(rowIndex, cellIndex) {
        this.editingCell = { rowIndex, cellIndex };
      },
      stopEditing(rowIndex, cellIndex) {
        this.editingCell = null;
        debug.log(rowIndex,cellIndex);
        // You can save the edited data to your CSV data array or perform other actions here.
      },
      selectTab(tabName) {
        this.selectedTab = tabName;
      },
      assignUserModal() {
        this.isModalOpen = true;
      },
      closeModal() {
        document.body.classList.remove('body-scroll-lock');
        this.isModalOpen = false;
      },
      handleFileUpload(event) {
        const file = event.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const contents = e.target.result;
            this.parseCSV(contents);
          };
          reader.readAsText(file);
        }
      },
      parseCSV(contents) {
        const lines = contents.split('\n');
        const data = [];

        for (let i = 0; i < lines.length; i++) {
          const values = lines[i].split(',');
          data.push(values);
        }
        this.csvData = data;
      },
      openCSVModal() {
        // Method to open CSV processing modal
        document.body.classList.add('body-scroll-lock');
        this.csvModalOpen = true;
      },
      async processManualInput() {
        try {
          const salt = CryptoJS.lib.WordArray.random(16);
          const hash = CryptoJS.SHA256(this.manualInput.password + salt).toString();

          const userData = {
            firstname: this.manualInput.firstname,
            lastname: this.manualInput.lastname,
            citizen: null,
            phone: this.manualInput.phone,
            email: this.manualInput.email,
            username: this.manualInput.username,
            password: hash,
            parent: this.session.current._id,
            salt: salt.toString(),
            role: 'user',
            info: {
              prefix: this.manualInput.info.prefix,
              bu_type: this.manualInput.info.bu_type,
              bu_name: this.manualInput.info.bu_name,
              position: this.manualInput.info.position,
            },
          };

          const userResponse = await fetch("https://gateway.cloudrestfulapi.com/api/user/", {
            method: 'POST',
            headers: {'Content-Type': 'application/json','client-token-key':this.configs.key},
            body: JSON.stringify({ data: userData })
          });

          if (userResponse.status === 200) {
            const userJson = await userResponse.json();
            const enrollResponse = await fetch("https://gateway.cloudrestfulapi.com/api/enroll/", {
              method: 'POST',
              headers: {'Content-Type': 'application/json','client-token-key':this.configs.key},
              body: JSON.stringify({
                data: {
                  "userID": userJson._id,
                  "courseID": this.dataItem,
                },
                options: {}
              })
            });

            if (enrollResponse.status === 200) {
              const finalRes = await enrollResponse.json();
              await fetch("https://gateway.cloudrestfulapi.com/api/course/" + this.dataItem + "/enroll", {
                method: 'POST',
                headers: {'Content-Type': 'application/json','client-token-key':this.configs.key},
                body: JSON.stringify({
                  action: "add",
                  element: finalRes._id,
                  type: "string",
                })
              });
            }
          }

          this.isModalOpen = false;
          await this.getData();
          await this.getCourse();
          this.fetchData();
        } catch (error) {
          console.error("Error processing manual input:", error);
        }
      },
      async processCSV() {
        try {
          for (const row of this.csvData) {
            const salt = CryptoJS.lib.WordArray.random(16);
            const hash = CryptoJS.SHA256(row[6] + salt).toString();

            const userData = {
              firstname: row[3],
              lastname: row[4],
              citizen: null,
              phone: row[6],
              email: row[7],
              username: row[7],
              password: hash,
              parent: this.session.current._id,
              salt: salt.toString(),
              role: "user",
              info: {}
            };

            if (row[2]) { userData.info.prefix = row[2]; }
            if (row[1]) { userData.info.bu_type = row[1]; }
            if (row[0]) { userData.info.bu_name = row[0]; }
            if (row[5]) { userData.info.position = row[5]; }

            const userResponse = await fetch("https://gateway.cloudrestfulapi.com/api/user/", {
              method: 'POST',
              headers: {'Content-Type': 'application/json','client-token-key':this.configs.key},
              body: JSON.stringify({ data: userData })
            });

            if (userResponse.status === 200) {
              const userJson = await userResponse.json();
              const enrollResponse = await fetch("https://gateway.cloudrestfulapi.com/api/enroll/", {
                method: 'POST',
                headers: {'Content-Type': 'application/json','client-token-key':this.configs.key},
                body: JSON.stringify({
                  data: {
                    "userID": userJson._id,
                    "courseID": this.dataItem,
                  },
                  options: {}
                })
              });

              if (enrollResponse.status === 200) {
                const finalRes = await enrollResponse.json();
                await fetch("https://gateway.cloudrestfulapi.com/api/course/" + this.dataItem + "/enroll", {
                  method: 'POST',
                  headers: {'Content-Type': 'application/json','client-token-key':this.configs.key},
                  body: JSON.stringify({
                    action: "add",
                    element: finalRes._id,
                    type: "string",
                  })
                });
              }
            }
          }
          this.isModalOpen = false;
          await this.getData();
          await this.getCourse();
          this.fetchData();
        } catch (error) {
          console.error("Error processing CSV:", error);
        }
      },
      togglePanel() {
        this.open = !this.open;
      },
      closePanel() {
        this.open = false;
      },
      leadingZero(number) {
        return number < 10 ? '0' + number : number.toString();
      },
      getCertAreaValue(certAreaId) {
        const area = this.cert_area.find(item => item.id === certAreaId);
        return area ? area.value : '';
      },
      getCertAgeValue(certAgeId) {
        const age = this.cert_age.find(item => item.id === certAgeId);
        return age ? age.value : '';
      },
      async fetchData() {
          try {
            const response = await fetch('https://vue-project.sgp1.digitaloceanspaces.com/Demo3/convertcsv_3155.json');
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            const jsonData = await response.json();
            this.scb = jsonData;
          } catch (error) {
            console.error('Error fetching data:', error.message);
          }
      },
      searchData(matching,id) {
        const value1 = matching;
        const result = this.searchSCBData(value1);
        
        if(result)
        {
          this.updateOrderStatus(id);
        }
        debug.log("Result:", result);
      },
      searchSCBData(value1) {
        const foundValue1 = this.scb.some((data) => data.id1 === value1);
        return foundValue1;
      },
      exportToCSV() {
      // Filter listItems to get only items with status "ชำระเงินแล้ว"
        /*const paidItems = this.listItems.filter(item => 
        item.order &&
        (item.order.status === 'ชำระเงินแล้ว' ||
        item.order.status === 'รออนุมัติ' ||
        item.order.status === 'ลงทะเบียนคอร์ส' ||
        item.order.status === 'สั่งซื้อ')
      );
      */


  const dataToExport = this.listItems.map((item, index) => {
    const rowData = {
  "#": (this.currentPage - 1) * this.limitItem + index + 1,

  "สถานะ": item.order?.status || "",
  "หลักสูตรที่ลงทะเบียน": this.courseData?.name || "",
  "Ref_No_1": item.order?.ref1 || "",
  "Ref_No_2": item.order?.ref2 || "",
  "Ref_No_3": item.order?.ref3 || "",
  "คำนำหน้า": this.prefixMapping[item.user.info.prefix] || '',
  "ผู้ซื้อ": (this.prefixMapping[item.user.info.prefix] || '') + " " + item.user.firstname + " " + item.user.lastname,
  "ชื่อ": item.user?.firstname || "",
  "นามสกุล": item.user?.lastname || "",
  "หมายเลขบัตรประชาชน": item.user?.citizen || "",
  "รหัสใบรับรอง": item.user?.token || "",
  "เบอร์โทร": item.user?.phone || "",
  "อีเมล์": item.user?.email || "",
  "ช่องทางการชำระเงิน": item.order?.payment || "",

  //"รอบ": this.roundMapping[item.order.enroll.analytics.option.exam_round] || '',
  "วุฒิการศึกษา": this.educationMapping[item.user.info.education] || '',

  "หมายเลขใบรับรอง": item.user?.citizen ? "66/01/" + item.user.citizen : "",
  "วันออกใบรับรอง": item.order?.enroll?.analytics?.option?.exam_round === "first" ? "17 มี.ค. พ.ศ. 2566" : "28 ก.พ. พ.ศ. 2566",
  "วันหมดอายุ": item.order?.enroll?.analytics?.option?.exam_round === "first" ? "16 มี.ค. พ.ศ. 2571" : "27 ก.พ. พ.ศ. 2571",
  "Certification URL": item.user?.token ? "https://doa.fti.or.th/certification-force?token=" + item.user.token + "&session=220" : "",

  "รูปประจำตัว": item.user?.avatar_img || "",

  "Column_11": "ที่อยู่จัดส่งใบเสร็จ/หนังสือ",
  "เลขที่": item.order?.address?.delivery ? "เลขที่" + item.order.address.delivery.address.mailinG_NO : "",
  "หมู่ที่": item.order?.address?.delivery ? item.order.address.delivery.address.mailinG_MOO : "",
  "ซอย": item.order?.address?.delivery ? item.order.address.delivery.address.mailinG_SOI_TH : "",
  "อาคาร": item.order?.address?.delivery ? item.order.address.delivery.address.mailinG_BUILDING_TH : "",
  "ถนน": item.order?.address?.delivery ? item.order.address.delivery.address.mailinG_ROAD_TH : "",
  "ตำบล": item.order?.address?.delivery ? item.order.address.delivery.address.mailinG_SUB_DISTRICT_TH : "",
  "อำเภอ": item.order?.address?.delivery ? item.order.address.delivery.address.mailinG_DISTRICT_TH : "",
  "จังหวัด": item.order?.address?.delivery ? item.order.address.delivery.province : "",
  "รหัสไปรษณีย์": item.order?.address?.delivery ? item.order.address.delivery.zipcode : "",

  "_2": "ที่อยู่ออกใบเสร็จ",
  "เลขที่2": item.order?.address?.invoice ? "เลขที่" + item.order.address.invoice.address.officE_NO : "",
  "หมู่ที่2": item.order?.address?.invoice ? item.order.address.invoice.address.officE_MOO : "",
  "ซอย2": item.order?.address?.invoice ? item.order.address.invoice.address.officE_SOI_TH : "",
  "อาคาร2": item.order?.address?.invoice ? item.order.address.invoice.address.officE_BUILDING_TH : "",
  "ถนน2": item.order?.address?.invoice ? item.order.address.invoice.address.officE_ROAD_TH : "",
  "ตำบล2": item.order?.address?.invoice ? item.order.address.invoice.address.officE_SUB_DISTRICT_TH : "",
  "อำเภอ2": item.order?.address?.invoice ? item.order.address.invoice.address.officE_DISTRICT_TH : "",
  "จังหวัด2": item.order?.address?.invoice ? item.order.address.invoice.province : "",
  "รหัสไปรษณีย์2": item.order?.address?.invoice ? item.order.address.invoice.zipcode : "",
  // Check if the 'address' object exists before accessing its properties
  ///"ที่อยู่จัดส่ง": item.order.address?.delivery ? this.formatDeliveryAddress(item.order.address.delivery.address) : "",
  //"ที่อยู่ในใบแจ้งหนี้": item.order.address?.invoice ? this.formatInvoiceAddress(item.order.address.invoice.address) : "",
  //"ที่อยู่ในใบกำกับภาษี": item.order.address?.tax ? this.formatTaxAddress(item.order.address.tax.address) : "",
  // New address columns
  "_3": "ที่อยู่นิติบุคคล",
  "เลขที่ประจำตัวผู้เสียภาษี": item.order?.address?.tax ? item.order.address.tax.address.taX_ID : "",
  "ชื่อนิติบุคคล": item.order?.address?.tax ? item.order.address.tax.address.owneR_NAME_TH : "",
  "เลขที่3": item.order?.address?.tax ? "เลขที่" + item.order.address.tax.address.taX_NO : "",
  "หมู่ที่3": item.order?.address?.tax ? item.order.address.tax.address.taX_MOO : "",
  "ซอย3": item.order?.address?.tax ? item.order.address.tax.address.taX_SOI_TH : "",
  "อาคาร3": item.order?.address?.tax ? item.order.address.tax.address.taX_BUILDING_TH : "",
  "ถนน3": item.order?.address?.tax ? item.order.address.tax.address.taX_ROAD_TH : "",
  "ตำบล3": item.order?.address?.tax ? item.order.address.tax.address.taX_SUB_DISTRICT_TH : "",
  "อำเภอ3": item.order?.address?.tax ? item.order.address.tax.address.taX_DISTRICT_TH : "",
  "จังหวัด3": item.order?.address?.tax ? item.order.address.tax.province : "",
  "รหัสไปรษณีย์3": item.order?.address?.tax ? item.order.address.tax.zipcode : "",

  "วันที่สั่งซื้อ": item.order?.adddate || "",
  "วันที่อนุมัติ": item.order?.updatedAt || "",

  "ใบเสร็จ": item.order?.bill === "online" ? "ออนไลน์" : "ตัวจริง",
  "ประเภทผู้ซื้อ": item.order?.receipt === "personal" ? "บุคคลธรรมดา" : "นิติบุคคล",
  "ความคืบหน้า": item?.enroll?.analytics?.complete || '0',
  "บทเรียน": item?.enroll?.analytics?.total || '14',
  "คะแนนก่อนเรียน": item?.enroll?.analytics?.pre?.score || '0',
  "คะแนนหลังเรียน": item?.enroll?.analytics?.post?.score || '0',
  "คะแนนสอบซ่อม": item?.enroll?.analytics?.retest?.score || '0',
  "ผลการเรียน": (
    (item?.enroll?.analytics?.post?.score || item?.enroll?.analytics?.retest?.score)
      ? ((item?.enroll?.analytics?.post?.score ?? 0) > 33 || (item?.enroll?.analytics?.retest?.score ?? 0) > 33
        ? 'ผ่านการประเมิน'
        : 'ไม่ผ่านการประเมิน'
      )
      : 'ไม่ได้สอบ'
  ),
};

return rowData;

  });

  let csvContent = "";
  const headers = Object.keys(dataToExport[0]);
  csvContent += headers.join(",") + "\n";
  dataToExport.forEach((item) => {
    const row = headers.map((header) => {
      if (header in item) {
        return item[header];
      } else {
        return "";
      }
    });
    csvContent += row.join(",") + "\n";
  });

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.setAttribute("href", URL.createObjectURL(blob));
  link.setAttribute(
    "download",
    this.courseData.name + "_exportdata_" + this.courseData._id + ".csv"
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
},
      formatDeliveryAddress(addressObj) {
        const addressLabels = {
          "mailinG_NO": "เลขที่",
          "mailinG_MOO": "หมู่ที่",
          "mailinG_ROAD_TH": "ถนน",
          "mailinG_SOI_TH": "ซอย",
          "mailinG_BUILDING_TH": "อาคาร/ตึก",
          "mailinG_SUB_DISTRICT_TH": "ตำบล/แขวง",
          "mailinG_DISTRICT_TH": "อำเภอ/เขต",
        };
        return this.getAddressString(addressObj, addressLabels);
      },
      formatInvoiceAddress(addressObj) {
        debug.log(addressObj);
        const addressLabels = {
          "officE_NO": "เลขที่",
          "officE_MOO": "หมู่ที่",
          "officE_ROAD_TH": "ถนน",
          "officE_SOI_TH": "ซอย",
          "officE_BUILDING_TH": "อาคาร/ตึก",
          "officE_SUB_DISTRICT_TH": "ตำบล/แขวง",
          "officE_DISTRICT_TH": "อำเภอ/เขต",
        };
        return this.getAddressString(addressObj, addressLabels);
      },
      formatTaxAddress(addressObj) {
        const addressLabels = {
          "taX_NO": "เลขที่",
          "taX_MOO": "หมู่ที่",
          "taX_ROAD_TH": "ถนน",
          "taX_SOI_TH": "ซอย",
          "taX_BUILDING_TH": "อาคาร/ตึก",
          "taX_SUB_DISTRICT_TH": "ตำบล/แขวง",
          "taX_DISTRICT_TH": "อำเภอ/เขต",
        };
        return this.getAddressString(addressObj, addressLabels);
      },
      // Common function to format address from object
      getAddressString(addressObj, addressLabels) {
        const addressParts = [];
        Object.keys(addressLabels).forEach((key) => {
          if (addressObj && key in addressObj && addressObj[key]) {
            if (typeof addressObj[key] === "object") {
              const subAddress = Object.values(addressObj[key]).join(" ");
              if (subAddress.trim().length > 0) {
                addressParts.push(`${addressLabels[key]} ${subAddress}`);
              }
            } else {
              addressParts.push(`${addressLabels[key]} ${addressObj[key]}`);
            }
          }
        });

        const formattedAddress = addressParts.join(" ");
        return formattedAddress.length > 0 ? formattedAddress : "ไม่มีข้อมูลที่อยู่";
      },
      formatThaidate(date) {
        return convertUtils.toThaiDatetime(date,"short");
      },
      handleLimitChange() {
        const session = storageManager.get('session');
        session.limitItem = this.limitItem;
        storageManager.set('session', session);
        this.currentPage = 1; // Reset current page to 1
        session.currentPage = this.currentPage;
        storageManager.set('session', session);
        const updatedUrlParams = new URLSearchParams(window.location.search);
        updatedUrlParams.set('page', session.currentPage);
        const updatedUrl = `${window.location.pathname}?${updatedUrlParams.toString()}`;
        window.history.replaceState({}, '', updatedUrl);
        debug.log("getdata","handleLimitChange");
        this.getData();
        
        // 🚀 PROGRESSIVE/LAZY LOADING - Reset after limit change
        this.resetProgressToast();
        this.$nextTick(() => {
          this.resetDisplayCount();
        });
      },
      handlePageChanged(page) {
        if (page !== this.currentPage) {
            window.scrollTo(0, 0);
            this.currentPage = page;
            const session = storageManager.get('session');
            session.currentPage = this.currentPage;
            storageManager.set('session', session);
            debug.log("getdata","handlePageChanged");
            this.getData();
            
            // 🚀 PROGRESSIVE/LAZY LOADING - Reset after page change
            this.resetProgressToast();
            this.$nextTick(() => {
              this.resetDisplayCount();
            });
        }
      },
      clearSearchQuery() {
          this.searchQuery = '';
          const session = storageManager.get('session');
          session.searchQuery = '';
          storageManager.set('session', session);
          debug.log("getdata","clearSearchQuery");
          this.getData();
      },
      async callAPI(token) {
          try {
          const url = `https://faas-sgp1-18bc02ac.doserverless.co/api/v1/web/fn-3bf765c8-bb4f-4bac-ba41-9698000f7334/default/getstudentdata?id=${token}`;
          const response = await fetch(url);
          const data = await response.json();
          debug.log(data);
          } catch (error) {
          debug.log(error);
          }
      },
      async getCourse() {
        try {
            const resAPI = await fetch(`https://gateway.cloudrestfulapi.com/api/course/${this.dataItem}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json','client-token-key':this.configs.key,
            },
            });

            const restReturn = await resAPI.json();
            if(resAPI.status === 200)
            {
                //this.courseData = restReturn;
                debug.log(restReturn);
            }
            
        } catch (error) {
            console.error(error);
        }
      },
      async executeCustomQueries(ref, id) {
        const mainQuery = 
        `
          SELECT *
          FROM transaction
          WHERE transaction.transaction_token = '${ref}'
        `;
        const countQuery = ``; // Add your count query here
        const requestBody = {
          query: {
            mainQuery: mainQuery,
            countQuery: countQuery,
          },
        };
        try {
          const response = await fetch('https://multisource-api-edsdv.ondigitalocean.app/api/GOLqSG7QyA10uoasyN9x/query', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json','client-token-key':this.configs.key
            },
            body: JSON.stringify(requestBody),
          });
          const responseData = await response.json();
          let transaction = responseData.data[0];
          debug.log("responseData",responseData.data[0]);
          await this.updateOrder(id, transaction.get_bill, transaction.receipt_type);
        } catch (error) {
          console.error(error);
        }
      },
      async executemarketplaceQueries(ref, id) {
        const mainQuery = 
        `
          SELECT *
          FROM marketplace
          WHERE marketplace.order_ref_no = '${ref}'
        `;
        const countQuery  = ``; // Add your count query here
        const requestBody = {
          query: {
            mainQuery: mainQuery,
            countQuery: countQuery,
          },
        };

        try {
          const response = await fetch('https://multisource-api-edsdv.ondigitalocean.app/api/04ZQdW5sGA9C9eXXXk6x/query', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json','client-token-key':this.configs.key
            },
            body: JSON.stringify(requestBody),
          });
          const responseData = await response.json();
          let transaction = responseData.data[0];
          debug.log("responseData",responseData.data[0]);

          const addressData = {
            delivery: {
              province: transaction.order_delivery_province,
            },
            invoice: {
              province: transaction.order_invoice_province,
            },
            tax: {
              province: transaction.order_tax_province,
            },
          };
          await this.updateProvince(id, addressData);
        } catch (error) {
          console.error(error);
        }
      },
      async executemarketplaceQueriesPersonal(ref, id) {
        const mainQuery = 
        `
          SELECT *
          FROM marketplace
          WHERE marketplace.order_ref_no = '${ref}'
        `;
        const countQuery  = ``; // Add your count query here
        const requestBody = {
          query: {
            mainQuery: mainQuery,
            countQuery: countQuery,
          },
        };

        try {
          const response = await fetch('https://multisource-api-edsdv.ondigitalocean.app/api/04ZQdW5sGA9C9eXXXk6x/query', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json','client-token-key':this.configs.key
            },
            body: JSON.stringify(requestBody),
          });
          const responseData = await response.json();
          let transaction = responseData.data[0];
          debug.log("responseData",responseData.data[0]);

          const addressData = {
            delivery: {
              province: transaction.order_delivery_province,
            },
            invoice: {
              province: transaction.order_invoice_province,
            },
            tax: {
              province: transaction.order_invoice_province,
              zipcode: transaction.order_invoice_zipcode,
            },
          };
          await this.updateProvince(id, addressData);
        } catch (error) {
          console.error(error);
        }
      },
      isImageValid(url) {
        const image = new Image();
        image.src = url;
        return image.complete && image.naturalWidth !== 0;
      },
      modifyURL(url) {
        if (url.includes('https://doa-academy.sgp1.digitaloceanspaces.com/https://doa-academy.sgp1.digitaloceanspaces.com/https://doa-academy.sgp1.digitaloceanspaces.com/Upload/')) {
          return url.replace('https://doa-academy.sgp1.digitaloceanspaces.com/https://doa-academy.sgp1.digitaloceanspaces.com/https://doa-academy.sgp1.digitaloceanspaces.com/Upload/', 'https://doa-academy.sgp1.digitaloceanspaces.com/Upload/');
        } else if (url.includes('https://doa-academy.sgp1.digitaloceanspaces.com/https://doa-academy.sgp1.digitaloceanspaces.com/1639435666414290693/')) {
          return url.replace('https://doa-academy.sgp1.digitaloceanspaces.com/https://doa-academy.sgp1.digitaloceanspaces.com/1639435666414290693/', 'https://content.fti.academy/doa-academy/1639435666414290693/');
        } else if (url.includes('1639435666414290693/') && url.includes('https://doa-academy.sgp1.digitaloceanspaces.com')) {
          return url.replace('https://doa-academy.sgp1.digitaloceanspaces.com', 'https://content.fti.academy/doa-academy');
        } else if (url.includes('1639435666414290693/') && !url.includes('https://doa-academy.sgp1.digitaloceanspaces.com')) {
          return `https://content.fti.academy/doa-academy/${url}`;
        } else {
          url = `https://doa-academy.sgp1.digitaloceanspaces.com/${url}`;
        }
        return url;
      },
      async executUserQueries(token,id) {
        const mainQuery = 
        `
        SELECT  student_idcard AS Card,student_avatar AS Profile
        FROM    student
        WHERE   student_id = '${token}'
        `;
        const countQuery  = ``; // Add your count query here
        const requestBody = {
          query: {
            mainQuery: mainQuery,
            countQuery: countQuery,
          },
        };

        try {
          const response = await fetch('https://multisource-api-edsdv.ondigitalocean.app/api/04ZQdW5sGA9C9eXXXk6x/query', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json','client-token-key':this.configs.key
            },
            body: JSON.stringify(requestBody),
          });
          const responseData = await response.json();
          //let transaction = responseData.data[0];
          debug.log("responseData",responseData.data[0]);
          let avatar  = this.modifyURL(responseData.data[0].Profile)
          let card    = this.modifyURL(responseData.data[0].Card)

          await this.updateProfile(id, card, avatar);

          debug.log("id",id);
        } catch (error) {
          console.error(error);
        }
      },
      async createUserCourse(token,id,ref) {
        const formData = {
        student: token,
        lesson: id
      };

      try {
        const response = await fetch("https://api.fti.academy/api/firebase/setup", {
          method: "POST",
          headers: {
            "API-KEY": "5CB584F5ECFD7",
            "SECRET-KEY": "6A5891C7352197F8A5CE8A9B67EF3",
            "Content-Type": "application/json"
          },
          body: JSON.stringify(formData)
        });

        await response.json();
        await this.confirmTransaction(ref);
        // Handle the result as needed
        this.status = true; // Assuming you need to set some status variable
      } catch (error) {
        // Handle errors here
        console.error("Error creating user course:", error);
      }
      },
      async confirmTransaction(transactionRefNo) {
        const url = `https://api.fti.academy/api/connection/confirm/${transactionRefNo}`;
        const headers = {
          "API-KEY": "5CB584F5ECFD7",
          "SECRET-KEY": "6A5891C7352197F8A5CE8A9B67EF3",
          "Content-Type": "application/json"
        };

        try {
          const response = await fetch(url, {
            method: "GET",
            headers: headers
          });

          await response.json();
          // Handle the output as needed
        } catch (error) {
          // Handle errors here
          console.error("Error confirming transaction:", error);
        }
      },
      async updateOrderStatus(id) {
        try {
          const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/order/" + id, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json','client-token-key':this.configs.key},
            body: JSON.stringify({
              data: {
                status: 'ชำระเงินแล้ว',
              },
              options: {}
            })
          });
          const finalRes   = await resAPI.json();
          debug.log(finalRes);

          if (resAPI.status===200) {
            debug.log("order : " + id + " Update Success!!");
          }

        } catch (error) {
          debug.log(error)
        }
      },
      async updateOrder(id, bill, receipt) {
        try {
          const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/order/" + id, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json','client-token-key':this.configs.key},
            body: JSON.stringify({
              data: {
                bill: bill,
                receipt: receipt,
              },
              options: {}
            })
          });
          const finalRes   = await resAPI.json();
          debug.log(finalRes);

          if (resAPI.status===200) {
            debug.log("order : " + id + " Update Success!!");
          }

        } catch (error) {
          debug.log(error)
        }
      },
      async updateProfile(id, card, avatar) {
        try {
          const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/user/" + id, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json','client-token-key':this.configs.key},
            body: JSON.stringify({
              data: {
                card_img: card,
                avatar_img: avatar,
              },
              options: {}
            })
          });
          await resAPI.json();
          //debug.log(finalRes);

          if (resAPI.status===200) {
            debug.log("user : " + id + " Update Success!!");
          }

        } catch (error) {
          debug.log(error)
        }
      },
      async updateOrderEnroll(id, enroll) {
        try {
          const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/order/" + id, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json','client-token-key':this.configs.key},
            body: JSON.stringify({
              data: {
                enrollID: enroll,
              },
              options: {}
            })
          });
          await resAPI.json();
          //debug.log(finalRes);

          if (resAPI.status===200) {
            debug.log("order : " + id + " Update Success!!");
          }

        } catch (error) {
          debug.log(error)
        }
      },
      async updateProvince(id, addressData) {
        try {
          const addressTypes = ["delivery", "invoice", "tax"]; // Specify the address types to update
          for (const addressType of addressTypes) {
            const addressObj = addressData[addressType];
            const province = addressObj.province;
            const zipcode = addressObj.zipcode;

            if (province !== undefined && province !== null && province !== '') {
              const resAPI = await fetch(`https://gateway.cloudrestfulapi.com/api/order/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json','client-token-key':this.configs.key },
                body: JSON.stringify({
                  data: {
                    [`address.${addressType}.province`]: province,
                    [`address.${addressType}.zipcode`]: zipcode,
                  },
                  options: {}
                })
              });

              const finalRes = await resAPI.json();
              debug.log(finalRes);

              if (resAPI.status === 200) {
                debug.log(`Province (${addressType}) for order ${id} updated successfully!!`);
              }
            }
          }
        } catch (error) {
          debug.log(error);
        }
      },
      async resetScore(exam, user, enroll, type) {
        try {
          console.log(enroll);
          const response = await this.$Request.POST('score/query', {
            method: 'find',
            hidden: ['userID'],
            args: [
              {
                $and: [
                  { userID: user, examID: exam }
                ]
              }
            ]
          }, this.configs.key);

          const { data, status } = response;

          if (status === 200 && data.length > 0) {
            dialog.confirm({
                title: 'คุณต้องการลบการสอบ?',
                message: 'ลบข้อสอบออกจากผู้อบรม !',
                confirm: async () => {
                try {
                  const deleteResponse = await this.$Request.DELETE(`score/${data[0]._id}`, null, this.configs.key);
                  const { data: deleteData } = deleteResponse;
            
                  if (deleteData) {
                    debug.log(deleteData);

                    // Ensure `verified` is properly initialized from `enroll` or as an empty object.
                    let verified = enroll && enroll.verified ? {...enroll.verified} : {};

                    // Dynamically clear and preserve the 'pre' or 'post' parts of `verified` based on `type`.
                    if (type === 'pre') {
                      verified = {
                        pre: {}, // Clear 'pre'
                        post: verified.post || {} // Preserve 'post', ensuring it defaults to an empty object if undefined
                      };
                    } else if (type === 'post') {
                      verified = {
                        pre: verified.pre || {}, // Preserve 'pre', ensuring it defaults to an empty object if undefined
                        post: {} // Clear 'post'
                      };
                    }

                    // Update `enroll.verified` with the modified `verified` object.
                    enroll.verified = verified;

                    // Construct the requestBody using the updated `enroll.verified`.
                    const requestBody = {
                      data: {
                        verified: enroll.verified,
                      }
                    };
                    
                    const { status } = await this.$Request.PUT(`enroll/${enroll._id}`, requestBody, this.configs.key);
                    debug.log(status);

                    await this.getData();
                  }
                } catch (error) {
                  debug.log(error)
                }
                },
                cancel: () => {}
            });
          } else {
            dialog.prompt({
              title: 'เกิดข้อผิดพลาด',
              message: 'ไม่สามารถลบได้ !',
              confirm: async () => {},
              cancel: () => {}
            });
          }
        } catch (error) {
          console.error("Error confirming transaction:", error);
        }
      },
      async bypassVerified(enroll,type) {
        try {
          const currentDate = new Date();
          const formattedDateTime = currentDate.toISOString(); // Convert date to ISO string format
          dialog.confirm({
              title: 'คุณต้องการ Bypass ระบบ Verified?',
              message: 'ตั้งให้ผู้อบรมไม่ต้อง Verified !',
              confirm: async () => {
              try {

                  // Ensure `verified` is properly initialized from `enroll` or as an empty object.
                  let verified = enroll && enroll.verified ? {...enroll.verified} : {};

                  // Based on the type, dynamically set either 'pre' or 'post' within the verified object,
                  // updating the 'status' and 'url', but preserving existing structure and data for the rest.
                  if (type === 'pre') {
                    verified.pre = { 
                      // Update or set 'pre' with new status and URL, preserving other properties if any
                      ...verified.pre, // This spreads any existing properties of verified.pre
                      status: true,
                      url: `bypass-${formattedDateTime}`
                    };
                    // Ensure 'post' is preserved if it exists, or initialized as an empty object if not
                    verified.post = verified.post || {};
                  } else if (type === 'post') {
                    // Ensure 'pre' is preserved if it exists, or initialized as an empty object if not
                    verified.pre = verified.pre || {};
                    verified.post = { 
                      // Update or set 'post' with new status and URL, preserving other properties if any
                      ...verified.post, // This spreads any existing properties of verified.post
                      status: true,
                      url: `bypass-${formattedDateTime}`
                    };
                  }

                  // Update `enroll.verified` with the modified `verified` object.
                  enroll.verified = verified;

                  // Construct the requestBody using the updated `enroll.verified`.
                  const requestBody = {
                    data: {
                      verified: enroll.verified,
                    }
                  };


                  const { status } = await this.$Request.PUT(`enroll/${enroll._id}`, requestBody, this.configs.key);
                  debug.log(status);

                  await this.getData();
              } catch (error) {
                debug.log(error)
              }
              },
              cancel: () => {}
          });
        } catch (error) {
          console.error("Error confirming transaction:", error);
        }
      },
      generateCsvData(jsonData) {
        const csvRows = [
          ['รอบสอบ', 'คำนำหน้า', 'ชื่อจริง', 'นามสกุล', 'เบอร์โทร', 'อีเมล์', 'เลขบัตรประชาชน', 'ความคืบหน้า', 'สอบก่อนเรียน', 'สอบหลังเรียน']
        ];
        
        jsonData.forEach(entry => {
          if (!entry.enroll || !entry.enroll.form || !entry.enroll.form.formData) {
            console.error('Missing data for entry:', entry);
            return; // Skip this entry
          }

          const formData = entry.enroll.form.formData;
          const analyticsData = entry.enroll.analytics;
          const roundLabel = formData['radiobox-14-0-9']?.value?.label ?? 'N/A';
          
          if (!formData.setData || !formData.setData['ข้อมูลส่วนตัว']) {
            console.error('Missing personal info for entry:', entry);
            return; // Skip this entry
          }
          
          const personalInfo = formData.setData['ข้อมูลส่วนตัว'][0];
          const prefix = personalInfo.find(info => info.name === 'คำนำหน้า')?.value?.label ?? 'N/A';
          const name = personalInfo.find(info => info.name === 'ชื่อจริง*')?.value ?? 'N/A';
          const lastname = personalInfo.find(info => info.name === 'นามสกุลจริง*')?.value ?? 'N/A';
          const phone = formData['input-16-6-6']?.value ?? 'N/A';
          const email = formData['input-17-6-6']?.value ?? 'N/A';
          const citizen = formData['input-13-6-6']?.value ?? 'N/A';

          // Safely access 'complete' and 'pretest' score
          const progress = analyticsData && 'complete' in analyticsData ? analyticsData['complete'] : 'N/A';
          const pretest = analyticsData && analyticsData['pre'] && 'score' in analyticsData['pre'] ? analyticsData['pre'].score : 'N/A';
          const posttest = analyticsData && analyticsData['post'] && 'score' in analyticsData['post'] ? analyticsData['post'].score : 'N/A';
          
          csvRows.push([roundLabel, prefix, name, lastname, phone, email, citizen, progress, pretest, posttest].join(','),);
        });
        
        return csvRows.join('\n');
    },
      downloadCsv(csvData, baseFilename) {
        // Count the number of data entries
        const dataCount = (csvData.match(/\n/g) || []).length - 1; // Subtract 1 for the header row

        // Get current date and time in YYYYMMDD_HHMMSS format
        const now = new Date();
        const dateTime = now.toISOString().replace(/[^0-9]/g, '').slice(0, 14); // YYYYMMDDHHMMSS format

        // Construct the filename with count and date-time
        const filename = `${baseFilename}_${dataCount}_${dateTime}.csv`;

        const blob = new Blob([csvData], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', filename);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      },
      handleDownload(condition) {
        const csvData = this.generateCsvData(this.reportData);
        this.downloadCsv(csvData, condition);
      },
      async getSumList(condition) {
        try {
          if (!this.login) {
            console.error("User is not logged in.");
            return;
          }

          this.loading = true;
          this.activeBlock = true;

          let pipeline = [];

          // Base match condition
          let baseMatchCondition = {
            courseID: this.dataItem,
          };

          // Modify the baseMatchCondition based on additional filters like statusFilter
          if (this.statusFilter && this.statusFilter !== 'all') {
            baseMatchCondition['status'] = this.statusFilter;
          }

          // Start building the pipeline with a match stage
          pipeline.push({
            $match: baseMatchCondition
          });

          // Convert formID to ObjectId
          pipeline.push({
            $set: { userID: { $toObjectId: "$userID" }, formID: { $toObjectId: "$formID" } }
          });

          // Lookup and unwind for form data
          pipeline.push({
            $lookup: {
              from: "form",
              localField: "formID",
              foreignField: "_id",
              as: "form",
            }
          });

          pipeline.push({
            $unwind: {
              path: "$form",
              preserveNullAndEmptyArrays: true,
            }
          });

          // Lookup and unwind for form data
          pipeline.push({
            $lookup: {
              from: "user",
              localField: "userID",
              foreignField: "_id",
              as: "user",
            },
          });

          pipeline.push({
            $unwind: {
              path: "$user",
              preserveNullAndEmptyArrays: true,
            }
          });

          // Condition-specific pipeline adjustments
          switch (condition) {
            case "no_analytics_data":
              pipeline.push({
                $match: { "analytics": { $exists: false } }
              });
              break;
            case "complete_13":
              pipeline.push({
                $match: { "analytics.complete": 13 }
              });
              break;
            case "processing_0":
              pipeline.push({
                $match: { "analytics.processing": 0 }
              });
              break;
            case "complete_between_1_and_12":
              pipeline.push({
                $match: {
                  "analytics.complete": { $gt: 0, $lt: 13 }
                }
              });
              break;
              case "total_entries":
                pipeline.push({ $match: {} });
              break;
            // Add additional cases for each condition...
            default:
              console.error("Invalid condition specified");
              this.loading = false;
              this.activeBlock = false;
              return;
          }

          // Limit and project stages (optional, for performance and focusing on relevant data)
          // pipeline.push({ $limit: 10 }); // Limit the results to manage performance
          // pipeline.push({ $project: { _id: 1, "form.formData": 1,"user": 1, analytics: 1 } }); // Adjust based on needed fields
          // Restructure the document to nest specific fields under 'enroll'
          pipeline.push({
            $project: {
              enroll: "$$ROOT",
              user: "$user",
              form: "$form.formData",
            }
          });

          const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'client-token-key': this.configs.key },
            body: JSON.stringify({ pipeline: pipeline }),
          };

          const response = await fetch('https://gateway.cloudrestfulapi.com/api/enroll/aggregate', requestOptions);
          const data = await response.json();

          if (data && data.length > 0) {
            // Process the data as needed
            console.log(data); // Or update state to reflect the fetched list
            this.reportData = data
            this.handleDownload(condition);
          } else {
            console.error("No data returned for condition:", condition);
          }
        } catch (error) {
          console.error("Error fetching list for condition:", condition, error);
        } finally {
          this.loading = false;
          this.activeBlock = false;
        }
      },
      async getSummary(forceRefresh = false) {
        try {
          // ตรวจสอบ cache ก่อน (ถ้าไม่ใช่ hard refresh)
          if (!forceRefresh) {
            const cachedData = this.getSummaryFromCache();
            if (cachedData) {
              this.summary = cachedData;
              this.loadSummary = true;
              this.summaryFromCache = true; // มาจาก cache
              console.log('✅ ใช้ข้อมูล summary จาก cache');
              return;
            }
          }

          console.log('🔄 กำลังดึงข้อมูล summary ใหม่...');
          this.loading = true;
          this.activeBlock = true;
          this.loadingSummary = true; // เพิ่ม loading state สำหรับ Summary

          let andConditions = [{
            courseID: this.dataItem,
          }];

          if (this.statusFilter !== 'all') {
            andConditions.push({
              status: this.statusFilter,
            });
          }

          // 🎯 PIPELINE 1: ดึงข้อมูลพื้นฐานที่จำเป็น
          const basicPipeline = [
            {
              $match: {
                $and: andConditions,
              },
            },
            {
              $set: {
                formID: { $toObjectId: "$formID" },
              },
            },
            // Lookup เฉพาะฟิลด์ที่จำเป็นใน form
            {
              $lookup: {
                from: "form",
                localField: "orderID",
                foreignField: "orderID",
                pipeline: [
                  {
                    $project: {
                      orderID: 1,
                      "formData.radiobox-14-0-9.value.value": 1,
                    }
                  }
                ],
                as: "form"
              }
            },
            {
              $unwind: {
                path: "$form",
                preserveNullAndEmptyArrays: true,
              },
            },
            // Project เฉพาะฟิลด์ที่ใช้ใน aggregation
            {
              $project: {
                _id: 1,
                courseID: 1,
                "analytics.complete": 1,
                "analytics.post.score": 1,
                "analytics.retest.has": 1,
                "analytics.retest.score": 1,
                "verified.pre.status": 1,
                "verified.pre.url": 1,
                "form.formData.radiobox-14-0-9.value.value": 1,
                "form.formData.radiobox-24-10-10.value.value": 1,
                "form.formData.radiobox-25-10-10.value.value": 1,
              }
            }
          ];

          // 🎯 PIPELINE 2: Group การคำนวณหลัก (แยกออกเป็นกลุม)
          const summaryPipelines = [
            // Group 1: Complete และ Post Score
            [
              ...basicPipeline,
              {
                $group: {
                  _id: null,
                  complete_13: {
                    $sum: { $cond: [{ $eq: ["$analytics.complete", 13] }, 1, 0] }
                  },
                  complete_13_round1: {
                    $sum: {
                      $cond: [
                        {
                          $and: [
                            { $eq: ["$analytics.complete", 13] },
                            { $eq: ["$form.formData.radiobox-14-0-9.value.value", "round-1"] }
                          ]
                        }, 1, 0
                      ]
                    }
                  },
                  complete_13_round2: {
                    $sum: {
                      $cond: [
                        {
                          $and: [
                            { $eq: ["$analytics.complete", 13] },
                            { $eq: ["$form.formData.radiobox-14-0-9.value.value", "round-2"] }
                          ]
                        }, 1, 0
                      ]
                    }
                  },
                  post_over_33: {
                    $sum: { $cond: [{ $gt: ["$analytics.post.score", 32] }, 1, 0] }
                  },
                  post_over_33_round2: {
                    $sum: {
                      $cond: [
                        {
                          $and: [
                            { $gt: ["$analytics.post.score", 32] },
                            { $eq: ["$form.formData.radiobox-14-0-9.value.value", "round-2"] }
                          ]
                        }, 1, 0
                      ]
                    }
                  },
                  processing_0: {
                    $sum: { $cond: [{ $eq: ["$analytics.complete", 0] }, 1, 0] }
                  },
                  processing_0_round1: {
                    $sum: {
                      $cond: [
                        {
                          $and: [
                            { $eq: ["$analytics.complete", 0] },
                            { $eq: ["$form.formData.radiobox-14-0-9.value.value", "round-1"] }
                          ]
                        }, 1, 0
                      ]
                    }
                  },
                  processing_0_round2: {
                    $sum: {
                      $cond: [
                        {
                          $and: [
                            { $eq: ["$analytics.complete", 0] },
                            { $eq: ["$form.formData.radiobox-14-0-9.value.value", "round-2"] }
                          ]
                        }, 1, 0
                      ]
                    }
                  },
                  no_analytics_data: {
                    $sum: { $cond: [{ $eq: [{ $type: "$analytics" }, "missing"] }, 1, 0] }
                  },
                  complete_between_1_and_12: {
                    $sum: {
                      $cond: [
                        {
                          $and: [
                            { $gt: ["$analytics.complete", 0] },
                            { $lt: ["$analytics.complete", 13] }
                          ]
                        }, 1, 0
                      ]
                    }
                  },
                  complete_between_1_and_12_round1: {
                    $sum: {
                      $cond: [
                        {
                          $and: [
                            { $gt: ["$analytics.complete", 0] },
                            { $lt: ["$analytics.complete", 13] },
                            { $eq: ["$form.formData.radiobox-14-0-9.value.value", "round-1"] }
                          ]
                        }, 1, 0
                      ]
                    }
                  },
                  complete_between_1_and_12_round2: {
                    $sum: {
                      $cond: [
                        {
                          $and: [
                            { $gt: ["$analytics.complete", 0] },
                            { $lt: ["$analytics.complete", 13] },
                            { $eq: ["$form.formData.radiobox-14-0-9.value.value", "round-2"] }
                          ]
                        }, 1, 0
                      ]
                    }
                  },
                  exam_round_1: {
                    $sum: {
                      $cond: [
                        { $eq: ["$form.formData.radiobox-14-0-9.value.value", "round-1"] }, 1, 0
                      ]
                    }
                  },
                  exam_round_2: {
                    $sum: {
                      $cond: [
                        { $eq: ["$form.formData.radiobox-14-0-9.value.value", "round-2"] }, 1, 0
                      ]
                    }
                  },
                  total_entries: { $sum: 1 },
                }
              }
            ],

            // Group 2: Score Range Analysis
            [
              ...basicPipeline,
              {
                $group: {
                  _id: null,
                  post_1_to_32: {
                    $sum: {
                      $cond: [
                        {
                          $and: [
                            { $gte: ["$analytics.post.score", 1] },
                            { $lte: ["$analytics.post.score", 32] },
                            { $eq: ["$form.formData.radiobox-14-0-9.value.value", "round-1"] }
                          ]
                        }, 1, 0
                      ]
                    }
                  },
                  post_1_to_32_round2: {
                    $sum: {
                      $cond: [
                        {
                          $and: [
                            { $gte: ["$analytics.post.score", 1] },
                            { $lte: ["$analytics.post.score", 32] },
                            { $eq: ["$form.formData.radiobox-14-0-9.value.value", "round-2"] }
                          ]
                        }, 1, 0
                      ]
                    }
                  },
                  post_11_to_32: {
                    $sum: {
                      $cond: [
                        {
                          $and: [
                            { $gte: ["$analytics.post.score", 11] },
                            { $lte: ["$analytics.post.score", 32] },
                            { $eq: ["$form.formData.radiobox-14-0-9.value.value", "round-1"] }
                          ]
                        }, 1, 0
                      ]
                    }
                  },
                  post_11_to_32_round2: {
                    $sum: {
                      $cond: [
                        {
                          $and: [
                            { $gte: ["$analytics.post.score", 11] },
                            { $lte: ["$analytics.post.score", 32] },
                            { $eq: ["$form.formData.radiobox-14-0-9.value.value", "round-2"] }
                          ]
                        }, 1, 0
                      ]
                    }
                  },
                }
              }
            ],

            // Group 3: Retest Analysis
            [
              ...basicPipeline,
              {
                $group: {
                  _id: null,
                  has_retest: {
                    $sum: {
                      $cond: [
                        {
                          $and: [
                            { $ifNull: ["$analytics.retest.has", false] },
                            { $eq: ["$form.formData.radiobox-14-0-9.value.value", "round-1"] }
                          ]
                        }, 1, 0
                      ]
                    }
                  },
                  has_retest_round2: {
                    $sum: {
                      $cond: [
                        {
                          $and: [
                            { $ifNull: ["$analytics.retest.has", false] },
                            { $eq: ["$form.formData.radiobox-14-0-9.value.value", "round-2"] }
                          ]
                        }, 1, 0
                      ]
                    }
                  },
                  has_retest_pass: {
                    $sum: {
                      $cond: [
                        {
                          $and: [
                            { $ifNull: ["$analytics.retest.has", false] },
                            { $gt: ["$analytics.retest.score", 32] },
                            { $eq: ["$form.formData.radiobox-14-0-9.value.value", "round-1"] }
                          ]
                        }, 1, 0
                      ]
                    }
                  },
                  has_retest_fail: {
                    $sum: {
                      $cond: [
                        {
                          $and: [
                            { $ifNull: ["$analytics.retest.has", false] },
                            { $lt: ["$analytics.retest.score", 33] },
                            { $eq: ["$form.formData.radiobox-14-0-9.value.value", "round-1"] }
                          ]
                        }, 1, 0
                      ]
                    }
                  },
                }
              }
            ]
          ];

          // 🚀 รัน pipeline หลายตัวพร้อมกัน (Parallel Processing)
          const requestPromises = summaryPipelines.map(pipeline => {
            const requestOptions = {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'client-token-key': this.configs.key },
              body: JSON.stringify({ pipeline: pipeline }),
            };
            return fetch('https://gateway.cloudrestfulapi.com/api/enroll/aggregate', requestOptions);
          });

          const responses = await Promise.all(requestPromises);
          const results = await Promise.all(responses.map(res => res.json()));

          // 🔄 รวมผลลัพธ์จากทุก pipeline
          this.summary = {
            ...results[0][0], // Group 1 results
            ...results[1][0], // Group 2 results  
            ...results[2][0], // Group 3 results
          };

          // 💾 บันทึกลง cache
          this.saveSummaryToCache(this.summary);
          this.summaryFromCache = false; // ข้อมูลใหม่ ไม่ใช่จาก cache

          this.loading = false;
          this.activeBlock = false;
          this.loadingSummary = false; // ปิด loading state สำหรับ Summary
          this.loadSummary = true;
          console.log("✅ optimized summary completed", this.summary);

        } catch (error) {
          console.error(error);
          this.loading = false;
          this.activeBlock = false;
          this.loadingSummary = false; // ปิด loading state สำหรับ Summary ใน error case
          this.summaryFromCache = false;
        }
      },
      async getData(/*orderBy = null*/scoreRange = null) {
        try {
              this.loading      = true;
              this.activeBlock  = true
              this.listItems    = [];

              let andConditions = [{
                courseID: this.dataItem,
              }];

              // Check if scoreRange is provided and both gte and lte are defined
              if (scoreRange && typeof scoreRange.gte === 'number' && typeof scoreRange.lte === 'number') {
                andConditions.push({
                  "analytics.post.score": { $gte: scoreRange.gte, $lte: scoreRange.lte },
                });
              }

              if (this.statusFilter !== 'all') {
                andConditions.push({
                  status: this.statusFilter,
                });
              }

              // 🚀 OPTIMIZED PIPELINE - เพิ่มการนับ enrollment count
              const pipeline = [
                // Step 1: Match เฉพาะข้อมูลที่ต้องการ
                {
                  $match: {
                    $and: andConditions,
                  },
                },
                
                // Step 2: Convert string IDs to ObjectId
                {
                  $set: {
                    userID: {
                      $convert: {
                        input: "$userID",
                        to: "objectId",
                        onError: null,
                        onNull: null,
                      },
                    },
                    formID: {
                      $convert: {
                        input: "$formID",
                        to: "objectId",
                        onError: null,
                        onNull: null,
                      },
                    },
                    courseID: {
                      $convert: {
                        input: "$courseID",
                        to: "objectId",
                        onError: null,
                        onNull: null,
                      },
                    },
                  },
                },

                // Step 3: Search filtering (ถ้ามี) - ทำก่อน lookup เพื่อลดข้อมูล
                ...(this.searchQuery
                  ? [
                      {
                        $lookup: {
                          from: "user",
                          localField: "userID",
                          foreignField: "_id",
                          pipeline: [
                            {
                              $match: {
                                $or: [
                                  { "name": { $regex: `.*${this.searchQuery}.*`, $options: "i" } },
                                  { "citizen": { $regex: `.*${this.searchQuery}.*`, $options: "i" } },
                                  { "email": { $regex: `.*${this.searchQuery}.*`, $options: "i" } },
                                  { "firstname": { $regex: `.*${this.searchQuery}.*`, $options: "i" } },
                                  { "lastname": { $regex: `.*${this.searchQuery}.*`, $options: "i" } },
                                  { "old_id": { $regex: `.*${this.searchQuery}.*`, $options: "i" } },
                                  { "phone": { $regex: `.*${this.searchQuery}.*`, $options: "i" } },
                                  { "token": { $regex: `.*${this.searchQuery}.*`, $options: "i" } },
                                ],
                              },
                            },
                            {
                              $project: {
                                _id: 1,
                                firstname: 1,
                                lastname: 1,
                                citizen: 1,
                                phone: 1,
                                email: 1,
                                token: 1,
                                old_id: 1,
                                createdAt: 1,
                                card_img: 1,
                                avatar_img: 1,
                                clientData: 1,
                                enroll: 1
                              }
                            }
                          ],
                          as: "user",
                        },
                      },
                      {
                        $match: {
                          "user": { $ne: [] }
                        }
                      },
                      {
                        $unwind: "$user",
                      },
                    ]
                  : [
                      // ถ้าไม่มี search ก็ lookup user แบบธรรมดา แต่ project เฉพาะที่ต้องการ
                      {
                        $lookup: {
                          from: "user",
                          localField: "userID",
                          foreignField: "_id",
                          pipeline: [
                            {
                              $project: {
                                _id: 1,
                                firstname: 1,
                                lastname: 1,
                                citizen: 1,
                                phone: 1,
                                email: 1,
                                token: 1,
                                old_id: 1,
                                createdAt: 1,
                                card_img: 1,
                                avatar_img: 1,
                                clientData: 1,
                                enroll: 1
                              }
                            }
                          ],
                          as: "user",
                        },
                      },
                      {
                        $unwind: "$user",
                      },
                    ]),

                // Step 4: เพิ่ม Enrollment Count Lookup ตามแบบ List.vue
                {
                  $lookup: {
                    from: "enroll",
                    let: { userId: { $toString: "$userID" } },
                    pipeline: [
                      {
                        $match: {
                          $expr: { $eq: ["$userID", "$$userId"] }
                        }
                      },
                      {
                        $project: { _id: 1 }
                      }
                    ],
                    as: "userEnrolls"
                  }
                },
                {
                  $addFields: {
                    enrollCount: { $size: "$userEnrolls" }
                  }
                },
                {
                  $unset: "userEnrolls"  // Remove array after counting
                },

                // Step 5: Lookup form data แต่ project เฉพาะ fields สำคัญ
                {
                  $lookup: {
                    from: "form",
                    localField: "formID",
                    foreignField: "_id",
                    pipeline: [
                      {
                        $project: {
                          _id: 1,
                          userID: 1,
                          courseID: 1,
                          createdAt: 1,
                          updatedAt: 1,
                          // Project เฉพาะ fields ที่จำเป็นจาก formData
                          "formData.radiobox-14-0-9": 1,
                          "formData.upload-22-0-12": 1,
                          "formData.input-16-6-6": 1,
                          "formData.input-17-6-6": 1,
                          "formData.input-13-6-6": 1,
                          "formData.setData": 1,
                          // เพิ่ม fields อื่นๆ ที่จำเป็นตาม requirement
                        }
                      }
                    ],
                    as: "form",
                  },
                },

                // Step 6: Lookup course data (เฉพาะที่จำเป็น)
                {
                  $lookup: {
                    from: "course",
                    localField: "courseID",
                    foreignField: "_id",
                    pipeline: [
                      {
                        $project: {
                          _id: 1,
                          master: 1,
                          name: 1,
                          lesson_old_id: 1
                        }
                      }
                    ],
                    as: "course",
                  },
                },
                {
                  $unwind: "$course",
                },

                // Step 7: Lookup exam data (แยกเป็น 2 ขั้นและ project เฉพาะที่ต้องการ)
                {
                  $lookup: {
                    from: "exam",
                    let: { masterID: "$course.master" },
                    pipeline: [
                      {
                        $match: {
                          $expr: {
                            $and: [
                              { $eq: ["$courseId", "$$masterID"] },
                              { $eq: ["$type", "pre"] },
                            ],
                          },
                        },
                      },
                      {
                        $project: {
                          _id: 1,
                          courseId: 1,
                          type: 1,
                          name: 1
                        }
                      }
                    ],
                    as: "examPre",
                  },
                },
                {
                  $lookup: {
                    from: "exam",
                    let: { masterID: "$course.master" },
                    pipeline: [
                      {
                        $match: {
                          $expr: {
                            $and: [
                              { $eq: ["$courseId", "$$masterID"] },
                              { $eq: ["$type", "post"] },
                            ],
                          },
                        },
                      },
                      {
                        $project: {
                          _id: 1,
                          courseId: 1,
                          type: 1,
                          name: 1
                        }
                      }
                    ],
                    as: "examPost",
                  },
                },

                // Step 8: Sort และ Facet สำหรับ pagination
                {
                  $sort: { updatedAt: -1 }
                },
                {
                  $facet: {
                    paginatedData: [
                      { $skip: (this.currentPage - 1) * this.limitItem },
                      { $limit: this.limitItem },
                      {
                        $project: {
                          enroll: {
                            _id: "$$ROOT._id",
                            userID: "$$ROOT.userID",
                            courseID: "$$ROOT.courseID",
                            formID: "$$ROOT.formID",
                            analytics: "$$ROOT.analytics",
                            verified: "$$ROOT.verified",
                            capture: "$$ROOT.capture",
                            certification: "$$ROOT.certification",
                            status: "$$ROOT.status",
                            createdAt: "$$ROOT.createdAt",
                            updatedAt: "$$ROOT.updatedAt",
                            examPre: "$$ROOT.examPre",
                            examPost: "$$ROOT.examPost",
                            enrollCount: "$$ROOT.enrollCount"  // เพิ่ม enrollCount
                          },
                          user: "$user",
                          form: "$form",
                        },
                      },
                    ],
                    totalCount: [{ $count: "count" }],
                  },
                },
              ];

              const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json','client-token-key':this.configs.key },
                body: JSON.stringify({
                  pipeline: pipeline,
                }),
              };

              const resAPI      = await fetch('https://gateway.cloudrestfulapi.com/api/enroll/aggregate', requestOptions);
              const RestReturn  = await resAPI.json();

              if (RestReturn) {
                const paginatedData = RestReturn[0].paginatedData;
                const totalCount = RestReturn[0].totalCount[0]?.count || 0;

                const formattedData = {
                  data: paginatedData.map(item => {
                    return {
                      user: item.user,
                      enroll: item.enroll,
                    };
                  }),
                  total: totalCount,
                  paging: {
                    page: this.currentPage,
                    limit: this.limitItem,
                    totalPages: Math.ceil(totalCount / this.limitItem)
                  }
                };

                // Sort listItems by updatedAt of enroll
                this.listItems = formattedData.data.sort((a, b) => {
                  return new Date(b.enroll.updatedAt) - new Date(a.enroll.updatedAt);
                });
                
                this.totalItems   = formattedData.total;
                this.totalPages   = formattedData.paging.totalPages;

                console.log("listItems with enrollCount", this.listItems);

                this.loading      = false;
                this.activeBlock  = false;
                this.updateBadge(totalCount);
              }

        } catch (error) {
            console.error("getData error:", error);
            this.loading = false;
            this.activeBlock = false;
        }
      },
      async getScoreData(/*orderBy = null*/) {
        try {
              this.loading      = true;
              this.activeBlock  = true
              this.listItems    = [];

              // let ref2Values = [
              //   "1100501277525","1100800965521","1101401050074","1101401693099","1101700184901","1102001579125","1110100140189","1119900750788","1160100354359","1199600153890","1209700340879","1220400167936","1229900503747","1239900263606","1249900297314","1301800082342","1309901247701","1310600189525","1340700282055","1349700102802","1369900308544","1370300003647","1400600141599","1401600022604","1409900907161","1410600007736","1410600027524","1419900310165","1419900421242","1430200241368","1450600128860","1459900520305","1460800064181","1500300104018","1509900249490","1509900361788","1509900693063","1509900904188","1510101435847","1550400057275","1570700098431","1571100118466","1600800176530","1601100230133","1601200005034","1609700118871","1610100089103","1659900509661","1669900005778","1669900108356","1671100047495","1679900284669","1739900269715","1800400085446","1800600154034","1819900200625","1840100514341","1849800069446","1849901334544","1860500037915","1860700092081","1900500003114","2550500015025","2600900021340","2920100006882","3100202046111","3100800015367","3101203307806","3101800181896","3120500112821","3160300893390","3160600390539","3170200320407","3170200336430","3180600402383","3209900420716","3240100614453","3240300490286","3250500443958","3250500478985","3250700038810","3251000408062","3251000457284","3301700016590","3301700040903","3309800091582","3309900775157","3310400631522","3310600738291","3319900186810","3321000165851","3330100443747","3330600385321","3330900402654","3340101106426","3340400658439","3340700948688","3341000126660","3341100903587","3341500056881","3341500421628","3341900013683","3350100307286","3350600184601","3360600441654","3360700065689","3401001035070","3408500465992","3409800003232","3410101219157","3411700007433","3411700210522","3411800176202","3440100863851","3440600171923","3440600385061","3470101563419","3480500695939","3500200728521","3500300260555","3500400210177","3500700471341","3500900435836","3500900435852","3500900507365","3502000016804","3510500099944","3520600061817","3520900022809","3530600026213","3530700112294","3540200130773","3560200305883","3570400730936","3570501009949","3570501133828","3570700921494","3571000121925","3580300077017","3600040018047","3600300254805","3600300273923","3601200116932","3630600284629","3640100589048","3640200235607","3640200257942","3640408323388","3640600424226","3640700257968","3650101172515","3650700155961","3650800497642","3650801072327","3700200030297","3710100763705","3720100865770","3720200729312","3720300107020","3720300206915","3720600153566","3720800038221","3720900098773","3730500660938","3760500937654","3770060324727","3770700140229","3800100878714","3800101236422","3800400747763","3800801059442","3801100402982","3801200642853","3810400424051","3840300138030","3841200304532","3841400009381","3860200070921","3860300057404","3869800050547","3900700728879","3920200409057","5321200022139","5340590018823","5421000001706","5540700007420","8570784011479","8570784029726","8576573000014"
              // ];

              let andConditions = [{
                courseID: this.dataItem,
                //bill: "offline",
                //ref2: { $in: ref2Values }
              }];

              if (this.statusFilter !== 'all') {
                andConditions.push({
                  status: this.statusFilter,
                });
              }

              const pipeline = [
                {
                  $match: {
                    $and: andConditions,
                  },
                },
                {
                  $set: {
                    userID: { $toObjectId: "$userID" },
                    formID: { $toObjectId: "$formID" },
                    courseID: { $toObjectId: "$courseID" },
                  },
                },
                {
                  $lookup: {
                    from: "user",
                    localField: "userID",
                    foreignField: "_id",
                    as: "user",
                  },
                },
                {
                  $unwind: "$user",
                },
                {
                    $lookup: {
                        from: "form",
                        let: {
                            userId: "$userID",
                            courseId: "$courseID"
                        },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$userID", "$$userId"] },
                                            { $eq: ["$courseID", "$$courseId"] }
                                        ]
                                    }
                                }
                            }
                        ],
                        as: "form",
                    },
                },
                {
                  $unwind: "$form",
                },
                {
                  $lookup: {
                    from: "course",
                    localField: "courseID",
                    foreignField: "_id",
                    as: "course",
                  },
                },
                {
                  $unwind: "$course",
                },
                // Step 1: Lookup to join `examPre`
                {
                  $lookup: {
                    from: "exam",
                    let: { masterID: "$course.master" }, 
                    pipeline: [
                      {
                        $match: {
                          $expr: {
                            $and: [
                              { $eq: ["$courseId", "$$masterID"] },
                              { $eq: ["$type", "pre"] }
                            ]
                          }
                        }
                      }
                    ],
                    as: "examPre"
                  }
                },
                {
                  $lookup: {
                    from: "exam",
                    let: { masterID: "$course.master" }, // Define a variable `masterID` that holds the value of `course.master`
                    pipeline: [
                      {
                        $match: {
                          $expr: {
                            $and: [
                              { $eq: ["$courseId", "$$masterID"] },
                              { $eq: ["$type", "post"] }
                            ]
                          }
                        }
                      }
                    ],
                    as: "examPost"
                  }
                },
                ...(this.searchQuery
                  ? [
                      {
                        $match: {
                          $or: [
                            { "user.name": { $regex: `.*${this.searchQuery}.*`, $options: 'i' } },
                            { "user.citizen": { $regex: `.*${this.searchQuery}.*`, $options: 'i' } },
                            { "user.email": { $regex: `.*${this.searchQuery}.*`, $options: 'i' } },
                            { "user.firstname": { $regex: `.*${this.searchQuery}.*`, $options: 'i' } },
                            { "user.lastname": { $regex: `.*${this.searchQuery}.*`, $options: 'i' } },
                            { "user.old_id": { $regex: `.*${this.searchQuery}.*`, $options: 'i' } },
                            { "user.phone": { $regex: `.*${this.searchQuery}.*`, $options: 'i' } },
                            { "user.token": { $regex: `.*${this.searchQuery}.*`, $options: 'i' } },
                          ],
                        },
                      },
                    ]
                  : []),
                  {
                    $sort: { "user.createdAt": -1 }
                  },

                {
                  $facet: {
                    paginatedData: [
                      { $skip: (this.currentPage - 1) * this.limitItem },
                      { $limit: this.limitItem },
                      {
                        $project: {
                          enroll: "$$ROOT",
                          user: "$user",
                          form: "$form",
                        },
                      },
                    ],
                    totalCount: [
                      { $count: "count" },
                    ],
                  },

                },
              ];
/*
              if (orderBy) {
                  pipeline.push({
                      $sort: {
                          [orderBy.field]: orderBy.order,
                      }
                  });
              }
*/
              const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json','client-token-key':this.configs.key },
                body: JSON.stringify({
                  pipeline: pipeline,
                }),
              };

              const resAPI      = await fetch('https://gateway.cloudrestfulapi.com/api/enroll/aggregate', requestOptions);
              const RestReturn  = await resAPI.json();

              if (RestReturn) {
                const paginatedData = RestReturn[0].paginatedData;
                const totalCount = RestReturn[0].totalCount[0].count;

                const formattedData = {
                  data: paginatedData.map(item => {
                    return {
                      user: item.user,
                      enroll: item.enroll,
                    };
                  }),
                  total: totalCount,
                  paging: {
                    page: this.currentPage,
                    limit: this.limitItem,
                    totalPages: Math.ceil(totalCount / this.limitItem)
                  }
                };

                this.listItems    = formattedData.data;
                this.totalItems   = formattedData.total;
                this.totalPages   = formattedData.paging.totalPages;
                //this.calculateSummary();
                //this.updateBadge(totalCount)

                console.log("listItems with enrollCount", this.listItems);

                this.loading      = false;
                this.activeBlock  = false;
                this.updateBadge(totalCount);
              }

        } catch (error) {
            debug.log(error);
        }
      },
      async getEnrollData(course, user, old_id, order_id) {
        try {

            let andConditions = [
              {
                courseID: course,
                userID: user,
              },
            ];

            const pipeline = [
              {
                $match: {
                  $and: andConditions,
                },
              },
              {
                $facet: {
                  paginatedData: [
                    { $skip: (1 - 1) * 1 },
                    { $limit: 1 },
                    {
                      $project: {
                        enroll: "$$ROOT",
                      },
                    },
                  ],
                  totalCount: [
                    { $count: "count" },
                  ],
                },
              },
            ];

            const requestOptions = {
              method: 'POST',
              headers: { 'Content-Type': 'application/json','client-token-key':this.configs.key},
              body: JSON.stringify({
                pipeline: pipeline,
              }),
            };

            const resAPI = await fetch('https://gateway.cloudrestfulapi.com/api/enroll/aggregate', requestOptions);
            const restReturn = await resAPI.json();

            if (restReturn) {
              const paginatedData = restReturn[0].paginatedData;
              const totalCount = restReturn[0].totalCount[0].count;

              const formattedData = {
                data: paginatedData.map(item => {
                  return {
                    enroll: item.enroll,
                  };
                }),
                total: totalCount,
                paging: {
                  page: this.currentPage,
                  limit: this.limitItem,
                  totalPages: Math.ceil(totalCount / this.limitItem)
                }
              };
              debug.log("Enroll Local Data",formattedData.data[0].enroll._id);
              await this.getEnrollRemote(old_id,formattedData.data[0].enroll._id,order_id);
            }

        } catch (error) {
          debug.log(error);
        } finally {
          this.loading = false;
          this.activeBlock = false;
        }
      },
      async getEnrollRemote(student,enroll_id,order_id) {
        const mainQuery = `
        SELECT
        MAX(CASE WHEN data_type = 'cert_area' THEN data_value END) AS cert_area,
        MAX(CASE WHEN data_type = 'cert_age' THEN data_value END) AS cert_age,
        MAX(CASE WHEN data_type = 'exam_round' THEN data_value END) AS exam_round,
        MAX(CASE WHEN data_type = 'get_receipt' THEN data_value END) AS get_receipt,

        MAX(CASE WHEN data_type = 'progress' THEN data_value END) AS progress,
        MAX(CASE WHEN data_type = 'pretest' THEN data_value END) AS pretest,
        MAX(CASE WHEN data_type = 'posttest' THEN data_value END) AS posttest,
        MAX(CASE WHEN data_type = 'retest' THEN data_value END) AS retest
        FROM student_adddition_data
        WHERE data_target = '${this.courseData.lesson_old_id}' AND student_id = '${student}'
        AND data_type IN ('cert_area','cert_age','exam_round','get_receipt','progress', 'pretest', 'posttest', 'retest');
        `;
        const countQuery = ``;
        const requestBody = {
          query: {
            mainQuery: mainQuery,
            countQuery: countQuery,
          },
        };

        try {
          const response = await fetch('https://multisource-api-edsdv.ondigitalocean.app/api/04ZQdW5sGA9C9eXXXk6x/query', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json','client-token-key':this.configs.key
            },
            body: JSON.stringify(requestBody),
          });
          const responseData = await response.json();
          debug.log("Enroll Remote Data",responseData.data[0]);

          const remoteEnrollData = responseData.data[0];

          let progress = parseInt(remoteEnrollData.progress)
          let processing = 0
          let pending = 0
          let complete = 0
          let status =''
          let message =''

          let measure = 33

          if (progress < 13) {
            pending = 13 - progress;
            processing = progress;
            complete = progress;
            status = 'processing';
            message = 'กำลังเรียน';
          } else if (progress === 0 || progress === null || progress === undefined) {
            pending = 13;
            processing = 0;
            complete = 0;
            status = 'pending';
            message = 'ยังไม่ได้เรียน';
          } else if (progress === 13) {
            processing = 0;
            complete = 13;
            pending = 0;
            status = 'complete';
            message = 'เรียนจบแล้ว';
          }

          const newData = {
            "analytics": {
              "total": 13,
              "pending": pending,
              "processing": processing,
              "complete": complete,
              "status": status,
              "message": message,
              "post": {
                "req": true,
                "has": true,
                "measure": measure,
                "score": remoteEnrollData.posttest,
                "result": remoteEnrollData.posttest >= measure,
                "message": remoteEnrollData.posttest === null || remoteEnrollData.posttest === undefined ? 'ยังไม่ได้สอบวัดผล' : (remoteEnrollData.posttest >= measure ? 'ผ่านการรับรอง' : 'ไม่ผ่านการรับรอง')
              },
              "pre": {
                "req": true,
                "has": true,
                "measure": measure,
                "score": remoteEnrollData.pretest,
                "result": remoteEnrollData.pretest >= measure,
                "message": remoteEnrollData.pretest === null || remoteEnrollData.pretest === undefined ? 'ยังไม่ได้สอบก่อนเรียน' : (remoteEnrollData.pretest >= measure ? 'สอบก่อนเรียนผ่าน' : 'สอบก่อนเรียนไม่ผ่าน')
              },
              "retest": {
                "req": true,
                "has": true,
                "measure": measure,
                "result": remoteEnrollData.retest >= measure,
                "score": remoteEnrollData.retest,
                "message": remoteEnrollData.retest === null || remoteEnrollData.retest === undefined ? 'ยังไม่ได้สอบวัดผล' : (remoteEnrollData.retest >= measure ? 'ผ่านการรับรอง' : 'ไม่ผ่านการรับรอง')
              },
              "option": {
                "cert_age": remoteEnrollData.cert_age,
                "cert_area": remoteEnrollData.cert_area,
                "exam_round": remoteEnrollData.exam_round,
                "get_receipt": remoteEnrollData.get_receipt,
              },
            },
            "certification": []
          };
          debug.log("updateEnroll",enroll_id,newData)
          await this.updateEnroll(enroll_id, newData);

          debug.log("updateOrderEnroll",order_id)
          await this.updateOrderEnroll(order_id, enroll_id);

        } catch (error) {
          console.error(error);
        }
      },
      async updateEnroll(id,newData) {
        try {
          const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/enroll/" + id, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json','client-token-key':this.configs.key},
            body: JSON.stringify({
              data: newData,
            }),
          });

          await resAPI.json();
          //debug.log(finalRes);

          if (resAPI.status === 200) {
            debug.log("Enroll " + id + " updated successfully!");
          }
        } catch (error) {
          debug.log(error);
        }
      },
      toggleStatus(status) {
        debug.log("Toggle Status", status);
        this.statusFilter = status;
        this.clearSummaryCache(); // ลบ cache เมื่อเปลี่ยน filter
        this.getData();
        this.getSummary();
      },
      async renderStatus() {
        debug.log("renderStatus");
        for (const item of this.listItems) {
          debug.log(item.order.ref3);
          if (item.order.status === 'สั่งซื้อ') {
            debug.log("searchData");
            await this.searchData(item.order.ref3, item.order._id);
          }
        }
      },
      async renderProvince() {
        debug.log("renderProvince");
        for (const item of this.listItems) {
          debug.log(item.order.ref_no);
          await this.executemarketplaceQueriesPersonal(item.order.ref_no, item.order._id);
        }
      },
      async renderProfile() {
        const totalItems = this.listItems.length;
        let counter = 0;
        /* Batch Process Param */
        this.isProcessing   = true;
        this.processName    = `Render Profile Image`;
        this.progressTotal  = totalItems
        this.startTime      = new Date().toISOString();
        this.endTime        = null;
        for (const item of this.listItems) {
          counter++;
          /* Batch Process Param */
          this.progressText     = `Processing : ${counter}/${totalItems}`;
          this.progressCurrent  =  counter
          await this.executUserQueries(item.user.old_id, item.user._id);
        }
        /* Batch Process Param */
        this.progressText = `All Process : Done`;
        this.endTime      = new Date().toISOString();
      },
      closeProgress() {
        this.isProcessing = false;
      },
      async makePosttest(single) {
        this.open = false;
        if(!single)
        {
          const totalItems  = this.listItems.length;
          let counter       = 0;
          /* Batch Process Param */
          this.isProcessing   = true;
          this.processName    = `Render Posttest`;
          this.progressTotal  = totalItems
          this.startTime      = new Date().toISOString();
          this.endTime        = null;
          
          for (const item of this.listItems) {
            counter++;
            /* Batch Process Param */
            this.progressText     = `Processing : ${counter}/${totalItems}`;
            this.progressCurrent  =  counter

            debug.log("item",item);

          }
        } else {
          const totalItems    = 1;
          let counter         = 0;
          /* Batch Process Param */
          this.isProcessing   = true;
          this.processName    = `Render Single Posttest`;
          this.progressTotal  = totalItems
          this.startTime      = new Date().toISOString();
          this.endTime        = null;
          
          /* Batch Process Param */
          this.progressText     = `Processing : ${counter}/${totalItems}`;
          this.progressCurrent  =  0
          debug.log("single",single);
          const score = Math.floor(Math.random() * 4) + 33;
          await this.executeInsertQueries(single,score);
          await this.saveExamRecord(single,score);
          await this.renderEnroll(single);

          this.progressCurrent  =  1
        }
        
        /* Batch Process Param */
        this.progressText = `All Process : Done`;
        this.endTime      = new Date().toISOString();
        //this.isProcessing = false;
      },
      async executeInsertQueries(data,score) {
        const insertQuery = `
          INSERT INTO student_adddition_data (student_id, student_token, data_type, data_value, data_target, data_method, data_status)
          VALUES ('${data.user.old_id}', '${data.user.token}', 'posttest', '${score}', '224', 'edit', 'active')
        `;
        const countQuery = ``; // Add your count query here
        const requestBody = {
          query: {
            mainQuery: insertQuery,
            countQuery: countQuery,
          },
        };
        try {
          const response = await fetch('https://multisource-api-edsdv.ondigitalocean.app/api/04ZQdW5sGA9C9eXXXk6x/query', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json','client-token-key':this.configs.key
            },
            body: JSON.stringify(requestBody),
          });
          const responseData = await response.json();
          //let transaction = responseData.data[0];
          debug.log("responseData",responseData.data[0]);
          //await this.updateOrder(id, transaction.get_bill, transaction.receipt_type);
        } catch (error) {
          console.error(error);
        }
      },
      async saveExamRecord(dataProcess,score) {
        const data = {
          user: dataProcess.user.token,
          course: "224",
          score: "posttest",
          data: {
            result: score,
          },
        };

        try {
          const response = await fetch('https://asia-southeast1-academy-f0925.cloudfunctions.net/api/user/course/score', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          });

          const result = await response.json();
          debug.log("API response:", result);

          // Perform other actions based on the API response
        } catch (error) {
          console.error(error);
        }
      },
      async renderEnroll(single) {
        this.open = false;
        if(!single)
        {
          const totalItems  = this.listItems.length;
          let counter       = 0;
          /* Batch Process Param */
          this.isProcessing   = true;
          this.processName    = `Render Enroll`;
          this.progressTotal  = totalItems
          this.startTime      = new Date().toISOString();
          this.endTime        = null;
          
          for (const item of this.listItems) {
            counter++;
            /* Batch Process Param */
            this.progressText     = `Processing : ${counter}/${totalItems}`;
            this.progressCurrent  =  counter

            await this.getEnrollData(
              item.order.courseID,
              item.order.userID,
              item.user.old_id,
              item.order._id
            );
          }
        } else {
          const totalItems    = 1;
          let counter         = 0;
          /* Batch Process Param */
          this.isProcessing   = true;
          this.processName    = `Render Single Enroll`;
          this.progressTotal  = totalItems
          this.startTime      = new Date().toISOString();
          this.endTime        = null;
          
          /* Batch Process Param */
          this.progressText     = `Processing : ${counter}/${totalItems}`;
          this.progressCurrent  =  0

          await this.getEnrollData(
            single.order.courseID,
            single.order.userID,
            single.user.old_id,
            single.order._id
          );
          await this.getData();
          this.progressCurrent  =  1
        }
        
        /* Batch Process Param */
        this.progressText = `All Process : Done`;
        this.endTime      = new Date().toISOString();
        //this.isProcessing = false;
      },
      async renderEnrollFirebase() {
        debug.log("########## Render Firebase");
        const totalItems = this.listItems.length;
        let counter = 0;

        for (const item of this.listItems) {
          counter++;
          await this.createUserCourse(item.user.token, '20',item.order.ref_no);
          debug.log(`Processing ${counter}/${totalItems}`);
        }
      },
      async renderData() {
        this.open = false;
        const totalItems  = this.listItems.length;
        let counter       = 0;

        /* Batch Process Param */
        this.isProcessing   = true;
        this.processName    = `Render Billing`;
        this.progressTotal  = totalItems
        this.startTime      = new Date().toISOString();
        this.endTime        = null;

        for (const item of this.listItems) {
            counter++;
            /* Batch Process Param */
            this.progressText     = `Processing : ${counter}/${totalItems}`;
            this.progressCurrent  =  counter
            debug.log("item",item);
            //await this.executeCustomQueries(item.order.ref, item.order._id);
        }

        /* Batch Process Param */
        this.progressText = `All Process : Done`;
        this.endTime      = new Date().toISOString();
      },
      async renderBilling() {
        this.open = false;
        const totalItems  = this.listItems.length;
        let counter       = 0;

        /* Batch Process Param */
        this.isProcessing   = true;
        this.processName    = `Render Billing`;
        this.progressTotal  = totalItems
        this.startTime      = new Date().toISOString();
        this.endTime        = null;

        for (const item of this.listItems) {
            counter++;
            /* Batch Process Param */
            this.progressText     = `Processing : ${counter}/${totalItems}`;
            this.progressCurrent  =  counter
            await this.executeCustomQueries(item.order.ref, item.order._id);
        }

        /* Batch Process Param */
        this.progressText = `All Process : Done`;
        this.endTime      = new Date().toISOString();
      },

      // 🚀 PROGRESSIVE/LAZY LOADING - Reset toast state
      resetProgressToast() {
        this.showProgressToast = false;
        if (this.scrollTimeout) {
          clearTimeout(this.scrollTimeout);
          this.scrollTimeout = null;
        }
      },

      // 📈 INDEX RECOMMENDATIONS - เพิ่มใน database
      getIndexRecommendations() {
        return [
          // สำหรับ enroll collection
          { courseID: 1, status: 1, updatedAt: -1 },
          { userID: 1, courseID: 1 },
          { "analytics.complete": 1 },
          { "analytics.post.score": 1 },
          { "analytics.retest.has": 1, "analytics.retest.score": 1 },
          
          // สำหรับ form collection  
          { orderID: 1 },
          { userID: 1, courseID: 1 },
          
          // สำหรับ user collection
          { firstname: "text", lastname: "text", citizen: "text", email: "text" },
          
          // สำหรับ course collection
          { master: 1 },
          
          // สำหรับ exam collection
          { courseId: 1, type: 1 }
        ];
      },

      // 🚀 CACHE STRATEGY - เพิ่ม caching เพื่อลดการ query
      async getCachedSummary() {
        const cacheKey = `summary_${this.dataItem}_${this.statusFilter}`;
        const cacheDuration = 5 * 60 * 1000; // 5 minutes
        
        // Check if we have cached data
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < cacheDuration) {
            this.summary = data;
            this.loadSummary = true;
            return;
          }
        }
        
        // If no cache or expired, fetch new data
        await this.getSummary();
        
        // Cache the result
        const cacheData = {
          data: this.summary,
          timestamp: Date.now()
        };
        sessionStorage.setItem(cacheKey, JSON.stringify(cacheData));
      },

      // 🔄 BATCH PROCESSING - สำหรับข้อมูลขนาดใหญ่
      async getBatchedData() {
        const batchSize = 1000;
        const totalCount = await this.getTotalCount();
        const batches = Math.ceil(totalCount / batchSize);
        
        let allResults = [];
        
        for (let i = 0; i < batches; i++) {
          const skip = i * batchSize;
          const pipeline = [
            { $match: { courseID: this.dataItem } },
            { $skip: skip },
            { $limit: batchSize },
            // ... rest of pipeline
          ];
          
          const result = await this.executePipeline(pipeline);
          allResults = allResults.concat(result);
        }
        
        return allResults;
      },

      // 🎯 OPTIMIZED LOOKUP WITH FILTERING
      getOptimizedUserLookup() {
        if (this.searchQuery) {
          return {
            $lookup: {
              from: "user",
              let: { userId: "$userID" },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ["$_id", { $toObjectId: "$$userId" }] },
                    $or: [
                      { firstname: { $regex: this.searchQuery, $options: "i" } },
                      { lastname: { $regex: this.searchQuery, $options: "i" } },
                      { citizen: { $regex: this.searchQuery, $options: "i" } },
                      { email: { $regex: this.searchQuery, $options: "i" } },
                    ]
                  }
                },
                {
                  $project: {
                    firstname: 1, lastname: 1, citizen: 1, 
                    phone: 1, email: 1, token: 1
                  }
                }
              ],
              as: "user"
            }
          };
        } else {
          return {
            $lookup: {
              from: "user",
              localField: "userID", 
              foreignField: "_id",
              pipeline: [
                {
                  $project: {
                    firstname: 1, lastname: 1, citizen: 1,
                    phone: 1, email: 1, token: 1
                  }
                }
              ],
              as: "user"
            }
          };
        }
      },
    },
    async mounted () {
      try {
        
        const urlParams = new URLSearchParams(window.location.search);
        const page = urlParams.get('page');
        if (page && /^\d+$/.test(page)) {
          this.currentPage = parseInt(page);
        } else {
          const session = storageManager.get('session');
          if (session && session.currentPage) {
            this.currentPage = session.currentPage;
            const updatedUrlParams = new URLSearchParams(window.location.search);
            updatedUrlParams.set('page', session.currentPage);
            const updatedUrl = `${window.location.pathname}?${updatedUrlParams.toString()}`;
            window.history.replaceState({}, '', updatedUrl);
          }
        }
        const session = storageManager.get('session');
        if (session && session.searchQuery) {
          this.searchQuery = session.searchQuery;
        }
        const storedLimitItem = session.limitItem;
        if (storedLimitItem) {
          this.limitItem = storedLimitItem;
        }
        await this.getData({ field: 'form.createdAt', order: -1 });
        console.log("getData");
        await this.getCourse();
        console.log("getCourse");
        await this.getSummary();
        console.log("getSummary");
        //await this.getSumList("no_analytics_data");
        this.fetchData();
        console.log("fetchData");
        
        // 🚀 PROGRESSIVE/LAZY LOADING - Initial setup after mount
        this.$nextTick(() => {
          this.resetDisplayCount();
        });
      } catch (error) {
        debug.log(Error);
      }
    },
    setup() {
      debug.log("Setup");
    },
    watch: {
      searchQuery() {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
            this.getData();
            const session = storageManager.get('session');
            session.searchQuery = this.searchQuery;
            storageManager.set('session', session);

            this.currentPage = 1;
            /*
            const updatedUrlParams = new URLSearchParams(window.location.search);
            updatedUrlParams.set('page', session.currentPage);
            const updatedUrl = `${window.location.pathname}?${updatedUrlParams.toString()}`;
            window.history.replaceState({}, '', updatedUrl);
            */
        }, 500);
      }
    },
    computed: {
      // 🚀 PROGRESSIVE/LAZY LOADING COMPUTED PROPERTIES
      visibleItems() {
        if (!this.lazy) {
          return this.listItems; // แสดงทั้งหมดถ้าไม่ใช้ lazy
        }
        const visible = this.listItems.slice(0, this.currentDisplayCount);
        return visible;
      },
      
      hasMoreItems() {
        return this.lazy && this.currentDisplayCount < this.listItems.length;
      },
      
      progressiveLoadingStats() {
        if (!this.lazy) return null;
        return {
          showing: Math.min(this.currentDisplayCount, this.listItems.length),
          total: this.listItems.length,
          remaining: Math.max(0, this.listItems.length - this.currentDisplayCount),
          percentage: Math.round((this.currentDisplayCount / this.listItems.length) * 100)
        };
      },
      
      filteredListItems() {
        if (this.selectedStatus === "All") {
          return this.listItems;
        } else {
          return this.listItems.filter(item => item.status === this.selectedStatus);
        }
      }
    },
    
    // 🚀 PROGRESSIVE/LAZY LOADING - Cleanup
    beforeUnmount() {
      if (this.scrollCleanup) {
        this.scrollCleanup();
        this.scrollCleanup = null;
      }
      if (this.scrollTimeout) {
        clearTimeout(this.scrollTimeout);
        this.scrollTimeout = null;
      }
    }
};
</script>

<template>
  <div class="max-w-full mx-auto">
    <!-- Progress Component -->
    <batch-progress
      :processName="processName"
      :progressText="progressText"
      :progressTotal="progressTotal"
      :progressCurrent="progressCurrent"
      :isVisible="isProcessing"
      :startTime="startTime"
      :endTime="endTime"
      @close="closeProgress"
    />

    <!-- Loading State -->
    <div v-if="!loading_sources" class="flex justify-center py-8">
      <Loader/>
    </div>

    <!-- Main Dashboard -->
    <div v-else class="space-y-6">
      <!-- Header Section -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200">
        <div class="px-4 py-3 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <font-awesome-icon :icon="['fas','users']" class="text-white text-sm" />
              </div>
              <div>
                <h2 class="text-base font-semibold text-gray-900">{{ pageTitle }}</h2>
                <p class="text-xs text-gray-500">จัดการผู้ลงทะเบียนหลักสูตร ({{ totalItems }} รายการ)</p>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <button @click="getData" class="inline-flex items-center px-2.5 py-1 border border-gray-200 rounded-md text-xs font-medium text-gray-600 bg-white hover:bg-gray-50 transition-colors">
                <font-awesome-icon :icon="['fas', 'refresh']" class="mr-1 text-xs" />
                รีเฟรช
              </button>
              <button @click="hardRefreshSummary" 
                      :disabled="loadingSummary"
                      class="inline-flex items-center px-2.5 py-1 border border-orange-200 rounded-md text-xs font-medium text-orange-600 bg-orange-50 hover:bg-orange-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                <font-awesome-icon :icon="['fas', 'sync-alt']" class="mr-1 text-xs" :class="{ 'animate-spin': loadingSummary }" />
                รีเฟรชสถิติ
              </button>
              <button @click="exportToCSV" class="inline-flex items-center px-2.5 py-1 border border-gray-200 rounded-md text-xs font-medium text-gray-600 bg-white hover:bg-gray-50 transition-colors">
                <font-awesome-icon :icon="['fas', 'download']" class="mr-1 text-xs" />
                Export CSV
              </button>
              <button @click="assignUserModal" class="inline-flex items-center rounded-lg border border-transparent bg-blue-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors">
                <font-awesome-icon :icon="['fas', 'plus']" class="mr-1.5" />
                เพิ่มผู้ลงทะเบียน
              </button>
              </div>
          </div>
        </div>

        <!-- Info Banner -->
        <div class="bg-blue-50 border-l-4 border-blue-400 p-3">
          <div class="flex">
            <div class="flex-shrink-0">
              <font-awesome-icon :icon="['fas','info-circle']" class="text-blue-400 text-sm" />
            </div>
            <div class="ml-2">
              <p class="text-xs text-blue-700">
                <strong>หมายเหตุ:</strong> ระบบจะแสดงข้อมูลผู้ลงทะเบียนทั้งหมดในหลักสูตรนี้ คุณสามารถค้นหา กรองข้อมูล และส่งออกเป็นไฟล์ CSV เพื่อนำไปใช้งานต่อได้
              </p>
            </div>
          </div>
        </div>

        <!-- Statistics Overview Panel with Loading Overlay -->
        <div class="p-4 relative">
          <!-- Loading Overlay for ภาพรวมการเรียน -->
          <div v-if="loadingSummary" class="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
            <div class="flex flex-col items-center space-y-3">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <div class="text-sm text-gray-600 font-medium">กำลังโหลดภาพรวมการเรียน...</div>
            </div>
          </div>

          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center space-x-3">
              <h3 class="text-lg font-semibold text-gray-900">ภาพรวมการเรียน</h3>
              <div v-if="summaryFromCache" class="flex items-center space-x-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                <font-awesome-icon :icon="['fas', 'clock']" class="text-xs" />
                <span>จาก Cache</span>
              </div>
            </div>
            <div class="bg-gray-600 text-white px-3 py-1 rounded-full text-sm font-medium">
              {{ formatNumber(summary.total_entries) }} คน
            </div>
          </div>
        
          <!-- Statistics Grid -->
          <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
            <!-- Total Registration -->
            <div class="bg-gray-50 p-3 rounded">
              <div class="flex justify-between items-center">
              <div>
                  <div class="text-xs text-gray-600 mb-1">ลงทะเบียนทั้งหมด</div>
                  <div class="text-lg font-semibold text-gray-900">{{ formatNumber(summary.total_entries) }}</div>
              </div>
                <button v-if="loadSummary" @click="getSumList('total_entries')" 
                        class="text-xs px-2 py-1 bg-gray-600 text-white rounded hover:bg-gray-700">
                  <font-awesome-icon :icon="['fas','download']" class="mr-1" />
                  CSV
                </button>
            </div>
            </div>

            <!-- Not Started -->
            <div class="bg-gray-50 p-3 rounded">
              <div class="flex justify-between items-center">
                <div>
                  <div class="text-xs text-gray-600 mb-1">ยังไม่ได้เริ่มเรียน</div>
                  <div class="text-lg font-semibold text-gray-900">{{ formatNumber(summary.no_analytics_data) }}</div>
                </div>
                <button v-if="loadSummary" @click="getSumList('no_analytics_data')" 
                        class="text-xs px-2 py-1 bg-gray-600 text-white rounded hover:bg-gray-700">
                  <font-awesome-icon :icon="['fas','download']" class="mr-1" />
                  CSV
                </button>
              </div>
            </div>

            <!-- In Progress -->
            <div class="bg-gray-50 p-3 rounded">
              <div class="text-xs text-gray-600 mb-1">เริ่มเรียนแล้ว</div>
              <div class="text-lg font-semibold text-gray-900">{{ formatNumber(summary.complete_between_1_and_12) }}</div>
            </div>

            <!-- Completed -->
            <div class="bg-gray-50 p-3 rounded">
              <div class="text-xs text-gray-600 mb-1">เรียนจบแล้ว</div>
              <div class="text-lg font-semibold text-gray-900">{{ formatNumber(summary.complete_13) }}</div>
            </div>

            <!-- Verified All -->
            <div class="bg-gray-50 p-3 rounded">
              <div class="text-xs text-gray-600 mb-1">ยืนยันตัวแล้ว</div>
              <div class="text-lg font-semibold text-gray-900">{{ formatNumber(summary.verified_all) }}</div>
            </div>

            <!-- Verified Success -->
            <div class="bg-gray-50 p-3 rounded">
              <div class="text-xs text-gray-600 mb-1">ยืนยันตัวสำเร็จ</div>
              <div class="text-lg font-semibold text-gray-900">{{ formatNumber(summary.verified_true) }}</div>
            </div>

            <!-- Exam Round Stats -->
            <div class="bg-blue-50 p-3 rounded border border-blue-200">
              <div class="text-xs text-blue-600 mb-1">สอบรอบที่ 1</div>
              <div class="text-lg font-semibold text-blue-900">{{ formatNumber(summary.exam_round_1) }}</div>
            </div>

            <div class="bg-green-50 p-3 rounded border border-green-200">
              <div class="text-xs text-green-600 mb-1">สอบรอบที่ 2</div>
              <div class="text-lg font-semibold text-green-900">{{ formatNumber(summary.exam_round_2) }}</div>
            </div>

          </div>
        </div>

        <!-- Exam Rounds -->
        <!-- ผลการสอบตามรอบ Section with Loading Overlay -->
        <div class="bg-white shadow-sm border border-gray-200 relative">
          <!-- Loading Overlay -->
          <div v-if="loadingSummary" class="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
            <div class="flex flex-col items-center space-y-3">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <div class="text-sm text-gray-600 font-medium">กำลังโหลดข้อมูลสถิติ...</div>
            </div>
          </div>

          <div class="px-4 py-3 border-b border-gray-200">
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <font-awesome-icon :icon="['fas','graduation-cap']" class="text-white text-sm" />
              </div>
              <div>
                <h3 class="text-base font-semibold text-gray-900">ผลการสอบตามรอบ</h3>
                <p class="text-xs text-gray-500">สถิติการสอบแบ่งตามรอบการสอบ</p>
              </div>
            </div>
          </div>
          
          <div class="p-4">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <!-- Exam Round 1 -->
              <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div class="flex items-center justify-between mb-3">
                  <h3 class="text-lg font-semibold text-gray-900">สอบรอบที่ 1</h3>
                  <div class="bg-gray-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {{ formatNumber(summary.exam_round_1) }} คน
                  </div>
                  <!-- <pre>{{ summary }}</pre> -->
                </div>
                
                <div class="grid grid-cols-3 gap-2 mb-3 text-xs">
                  <div class="bg-gray-100 px-2 py-1 rounded text-center">
                    <div class="font-medium text-gray-700">{{ formatNumber(summary.complete_13_round1) }}</div>
                    <div class="text-gray-600">เรียนจบ</div>
                  </div>
                  <div class="bg-gray-100 px-2 py-1 rounded text-center">
                    <div class="font-medium text-gray-700">{{ formatNumber(summary.no_analytics_data) }}</div>
                    <div class="text-gray-600">ยังไม่เริ่ม</div>
                  </div>
                  <div class="bg-gray-100 px-2 py-1 rounded text-center">
                    <div class="font-medium text-gray-700">{{ formatNumber(summary.processing_0_round1) }}</div>
                    <div class="text-gray-600">กำลังเรียน</div>
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-2 mb-3">
                  <div class="bg-gray-50 p-2 rounded">
                    <div class="flex justify-between items-center">
                      <div>
                        <div class="text-xs text-gray-600 mb-1">ส่งข้อสอบแล้ว</div>
                        <div class="font-semibold text-gray-900">{{ formatNumber(summary.post_1_to_50) }}</div>
                      </div>
                      <button @click="getData({ gte: 1, lte: 50 })" 
                              class="text-xs px-2 py-1 bg-gray-600 text-white rounded hover:bg-gray-700">
                        ดู
                      </button>
                    </div>
                  </div>
                  <div class="bg-gray-50 p-2 rounded">
                    <div class="flex justify-between items-center">
                      <div>
                        <div class="text-xs text-gray-600 mb-1">คะแนน 1-10</div>
                        <div class="font-semibold text-gray-900">{{ formatNumber(summary.post_1_to_10) }}</div>
                      </div>
                      <button @click="getData({ gte: 1, lte: 10 })" 
                              class="text-xs px-2 py-1 bg-gray-600 text-white rounded hover:bg-gray-700">
                        ดู
                      </button>
                    </div>
                  </div>
                  <div class="bg-gray-50 p-2 rounded">
                    <div class="flex justify-between items-center">
                      <div>
                        <div class="text-xs text-gray-600 mb-1">คะแนน 11-32</div>
                        <div class="font-semibold text-gray-900">{{ formatNumber(summary.post_11_to_32) }}</div>
                      </div>
                      <button @click="getData({ gte: 11, lte: 32 })" 
                              class="text-xs px-2 py-1 bg-gray-600 text-white rounded hover:bg-gray-700">
                        ดู
                      </button>
                    </div>
                  </div>
                  <div class="bg-gray-50 p-2 rounded">
                    <div class="flex justify-between items-center">
                      <div>
                        <div class="text-xs text-gray-600 mb-1">คะแนน 33-50</div>
                        <div class="font-semibold text-gray-900">{{ formatNumber(summary.post_over_33) }}</div>
                      </div>
                      <button @click="getData({ gte: 33, lte: 50 })" 
                              class="text-xs px-2 py-1 bg-gray-600 text-white rounded hover:bg-gray-700">
                        ดู
                      </button>
                    </div>
                  </div>
                </div>

                <div class="grid grid-cols-3 gap-2">
                  <div class="bg-gray-50 p-2 rounded text-center">
                    <div class="text-xs text-gray-600 mb-1">สอบซ่อม</div>
                    <div class="font-semibold text-gray-900">{{ formatNumber(summary.has_retest) }}</div>
                  </div>
                  <div class="bg-gray-50 p-2 rounded text-center">
                    <div class="text-xs text-gray-600 mb-1">ซ่อม 1-32</div>
                    <div class="font-semibold text-gray-900">{{ formatNumber(summary.has_retest_fail) }}</div>
                  </div>
                  <div class="bg-gray-50 p-2 rounded text-center">
                    <div class="text-xs text-gray-600 mb-1">ซ่อม 33-50</div>
                    <div class="font-semibold text-gray-900">{{ formatNumber(summary.has_retest_pass) }}</div>
                  </div>
                </div>
              </div>

              <!-- Exam Round 2 -->
              <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div class="flex items-center justify-between mb-3">
                  <h3 class="text-lg font-semibold text-gray-900">สอบรอบที่ 2</h3>
                  <div class="bg-gray-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {{ formatNumber(summary.exam_round_2) }} คน
                  </div>
                </div>
                
                <div class="grid grid-cols-3 gap-2 mb-3 text-xs">
                  <div class="bg-gray-100 px-2 py-1 rounded text-center">
                    <div class="font-medium text-gray-700">{{ formatNumber(summary.complete_13_round2) }}</div>
                    <div class="text-gray-600">เรียนจบ</div>
                  </div>
                  <div class="bg-gray-100 px-2 py-1 rounded text-center">
                    <div class="font-medium text-gray-700">{{ formatNumber(summary.no_analytics_data) }}</div>
                    <div class="text-gray-600">ยังไม่เริ่ม</div>
                  </div>
                  <div class="bg-gray-100 px-2 py-1 rounded text-center">
                    <div class="font-medium text-gray-700">{{ formatNumber(summary.processing_0_round2) }}</div>
                    <div class="text-gray-600">กำลังเรียน</div>
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-2 mb-3">
                  <div class="bg-gray-50 p-2 rounded">
                    <div class="flex justify-between items-center">
                      <div>
                        <div class="text-xs text-gray-600 mb-1">ส่งข้อสอบแล้ว</div>
                        <div class="font-semibold text-gray-900">{{ formatNumber(summary.post_1_to_50_round2) }}</div>
                      </div>
                      <button @click="getData({ gte: 1, lte: 50 })" 
                              class="text-xs px-2 py-1 bg-gray-600 text-white rounded hover:bg-gray-700">
                        ดู
                      </button>
                    </div>
                  </div>
                  <div class="bg-gray-50 p-2 rounded">
                    <div class="flex justify-between items-center">
                      <div>
                        <div class="text-xs text-gray-600 mb-1">คะแนน 1-10</div>
                        <div class="font-semibold text-gray-900">{{ formatNumber(summary.post_1_to_10_round2) }}</div>
                      </div>
                      <button @click="getData({ gte: 1, lte: 10 })" 
                              class="text-xs px-2 py-1 bg-gray-600 text-white rounded hover:bg-gray-700">
                        ดู
                      </button>
                    </div>
                  </div>
                  <div class="bg-gray-50 p-2 rounded">
                    <div class="flex justify-between items-center">
                      <div>
                        <div class="text-xs text-gray-600 mb-1">คะแนน 11-32</div>
                        <div class="font-semibold text-gray-900">{{ formatNumber(summary.post_11_to_32_round2) }}</div>
                      </div>
                      <button @click="getData({ gte: 11, lte: 32 })" 
                              class="text-xs px-2 py-1 bg-gray-600 text-white rounded hover:bg-gray-700">
                        ดู
                      </button>
                    </div>
                  </div>
                  <div class="bg-gray-50 p-2 rounded">
                    <div class="flex justify-between items-center">
                      <div>
                        <div class="text-xs text-gray-600 mb-1">คะแนน 33-50</div>
                        <div class="font-semibold text-gray-900">{{ formatNumber(summary.post_over_33_round2) }}</div>
                      </div>
                      <button @click="getData({ gte: 33, lte: 50 })" 
                              class="text-xs px-2 py-1 bg-gray-600 text-white rounded hover:bg-gray-700">
                        ดู
                      </button>
                    </div>
                  </div>
                </div>

                <div class="grid grid-cols-3 gap-2">
                  <div class="bg-gray-50 p-2 rounded text-center">
                    <div class="text-xs text-gray-600 mb-1">สอบซ่อม</div>
                    <div class="font-semibold text-gray-900">{{ formatNumber(summary.has_retest_round2) }}</div>
                  </div>
                  <div class="bg-gray-50 p-2 rounded text-center">
                    <div class="text-xs text-gray-600 mb-1">ซ่อม 1-32</div>
                    <div class="font-semibold text-gray-900">{{ formatNumber(summary.has_retest_fail_round2) }}</div>
                  </div>
                  <div class="bg-gray-50 p-2 rounded text-center">
                    <div class="text-xs text-gray-600 mb-1">ซ่อม 33-50</div>
                    <div class="font-semibold text-gray-900">{{ formatNumber(summary.has_retest_pass_round2) }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Data Table -->
        <div class="bg-white shadow-sm border border-gray-200">
          <div class="px-4 py-3 border-b border-gray-200">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <font-awesome-icon :icon="['fas','list']" class="text-white text-sm" />
                </div>
                <div>
                  <h3 class="text-base font-semibold text-gray-900">รายชื่อผู้ลงทะเบียน</h3>
                  <p class="text-xs text-gray-500">จัดการข้อมูลผู้เรียนในหลักสูตร</p>
                </div>
              </div>
              <div class="flex items-center space-x-3">
                <select v-model="limitItem" @change="handleLimitChange" class="px-3 py-2 border border-gray-300 rounded-md text-sm">
                  <option v-for="option in limitOptions" :key="option" :value="option">{{ option }}</option>
                </select>
                <Pagination
                  :current-page="currentPage"
                  :total-items="totalItems"
                  :total-pages="totalPages"
                  :limit-items="limitItem"
                  :data-loading="loading"
                  :display-mode="'nav'"
                  @page-changed="handlePageChanged"
                />
              </div>
            </div>
            
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <input 
                  v-model="searchQuery" 
                  @input="handleSearchInput" 
                  type="text" 
                  placeholder="ค้นหาชื่อ, อีเมล, เบอร์โทร..."
                  class="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button v-if="searchQuery.length > 0" @click="clearSearchQuery" class="text-blue-500 hover:underline text-sm">
                  Clear
                </button>
              </div>
              
              <div class="flex items-center space-x-4 text-sm">
                <!-- Progressive Loading เปิดใช้งานเสมอ - ไม่ต้องมี controls -->
                
                <button v-if="hasMoreItems" @click="showAllItems" 
                        class="text-xs px-2 py-1 bg-orange-500 text-white rounded hover:bg-orange-600">
                  แสดงทั้งหมดเลย
                </button>
                
                <label class="flex items-center cursor-pointer">
                  <input type="checkbox" v-model="layoutVisibility.order" class="mr-2 rounded"/>
                  คำสั่งซื้อ
                </label>
                <label class="flex items-center cursor-pointer">
                  <input type="checkbox" v-model="layoutVisibility.enroll" class="mr-2 rounded"/>
                  การเรียน
                </label>
              </div>
            </div>
          </div>

          <!-- Table Content -->
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr class="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th class="px-6 py-3">#</th>
                  <th class="px-6 py-3">ชื่อ-นามสกุล</th>
                  <th class="px-6 py-3 hidden md:table-cell">เลขบัตรประจำตัว</th>
                  <th class="px-6 py-3 hidden md:table-cell">การติดต่อ</th>
                  <th class="px-6 py-3 hidden md:table-cell text-center">จำนวนหลักสูตร</th>
                  <th class="px-6 py-3 hidden md:table-cell">วันที่ลงทะเบียน</th>
                  <th class="px-6 py-3 hidden md:table-cell">เครื่องมือ</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <template v-for="(item, index) in visibleItems" :key="item.user._id">
                  <tr class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ leadingZero((currentPage - 1) * limitItem + index + 1) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <router-link :to="'/student/detail/'+item.user._id+'?back=/lesson/detail/'+this.dataItem + '/enroll'" class="flex items-center hover:text-indigo-600">
                        <img :src="item.enroll?.form?.formData?.['upload-22-0-12']?.value?.[0] ?? 'path/to/default/image.png'"
                             class="w-10 h-10 rounded-md bg-gray-200 mr-3" alt="Profile">
                        <span class="font-medium text-gray-900">{{ item.user.firstname }} {{ item.user.lastname }}</span>
                      </router-link>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                      {{ item.user.citizen }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                      <div>{{ item.user.phone }}</div>
                      <div>{{ item.user.email }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-center hidden md:table-cell">
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {{ item.enroll.enrollCount || '0' }} หลักสูตร
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                      {{ item.enroll.createdAt || "-" }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm hidden md:table-cell">
                      <div class="flex space-x-2">
                        <button v-if="!isPublic" @click="$router.push('/lesson/edit/'+ item.user._id)" 
                                class="px-2 py-1 border border-gray-300 rounded text-xs hover:bg-gray-50">
                          แก้ไข
                        </button>
                        <button v-if="!isPublic" @click="bypassContent(item.enroll)" 
                                class="px-2 py-1 border border-gray-300 rounded text-xs hover:bg-gray-50">
                          {{ item.enroll.analytics.bypass ? 'ยกเลิก Bypass' : 'Bypass วีดีโอ' }}
                        </button>
                      </div>
                    </td>
                  </tr>

                  <!-- Expandable Row Content -->
                  <tr v-if="layoutVisibility.enroll" class="bg-gray-50">
                    <td colspan="7" class="px-6 py-4">
                      <div class="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm">
                        <!-- Progress Info -->
                        <div class="space-y-2">
                          <div><strong>Bypass:</strong> {{ item.enroll.analytics.bypass ? 'ไม่นับเวลา' : 'นับเวลาปกติ' }}</div>
                          <div><strong>รอบสอบ:</strong> {{ item.enroll?.form?.formData?.['radiobox-14-0-9']?.value?.label || 'N/A' }}</div>
                          <div><strong>ความคืบหน้า:</strong> 
                            {{ item.enroll?.analytics?.complete || '0' }} / {{ item.enroll?.analytics?.total || '' }} EP 
                            ({{ item.enroll?.analytics?.percent || 0 }}%)
                          </div>
                          <div class="w-full bg-gray-200 rounded-full h-2">
                            <div class="bg-blue-600 h-2 rounded-full" :style="`width: ${item.enroll?.analytics?.percent || 0}%`"></div>
                          </div>
                        </div>

                        <!-- Pre-test Info with Video -->
                        <div class="space-y-2">
                          <div class="font-semibold text-gray-700">ก่อนเรียน</div>
                          
                          <!-- Video Section -->
                          <div class="video-wrapper bg-gray-200 rounded-lg relative">
                            <template v-if="isValidVideoUrl(item.enroll?.verified?.pre?.url)">
                              <div>
                                <video
                                  v-if="videoLoaded[index]"
                                  :ref="`videoElement-${index}`"
                                  :src="item.enroll?.verified?.pre?.url"
                                  :poster="item.posterUrl"
                                  controls
                                  class="fixed-size-video"
                                ></video>
                                <button v-else @click="loadVideo(item.enroll?.verified?.pre?.url, index)" 
                                        class="absolute inset-0 flex items-center justify-center w-full h-full bg-gray-800 bg-opacity-80 text-white hover:bg-opacity-90 transition-opacity">
                                  <div class="flex items-center">
                                    <font-awesome-icon icon="fas fa-play" class="mr-2" /> 
                                    <span>Play Video</span>
                                  </div>
                                </button>
                              </div>
                            </template>
                            <div v-else class="no-video-placeholder">
                              No Video
                            </div>
                          </div>

                          <!-- Thumbnails Section -->
                          <div class="grid grid-cols-6 gap-1">
                            <div v-for="(url, thumbIndex) in 6" :key="thumbIndex" class="thumbnail">
                              <template v-if="item.enroll?.capture?.pre?.urls && item.enroll?.capture?.pre?.urls[thumbIndex]">
                                <img :src="item.enroll.capture.pre.urls[thumbIndex]" 
                                     alt="Video thumbnail" 
                                     class="w-full h-6 cursor-pointer rounded" 
                                     @click="openLightbox(item.enroll.capture.pre.urls[thumbIndex])">
                              </template>
                              <template v-else>
                                <div class="bg-gray-200 h-6 rounded"></div>
                              </template>
                            </div>
                          </div>

                          <div><strong>คะแนน:</strong> {{ item.enroll?.analytics?.pre?.score || 'N/A' }}</div>
                          <div class="flex space-x-2">
                            <button v-if="!isPublic" @click="resetScore(item.enroll?.examPre?._id, item.user._id, item.enroll, 'pre')"
                                    class="px-2 py-1 bg-gray-200 rounded text-xs hover:bg-gray-300">
                              Reset
                            </button>
                            <button v-if="!isPublic" @click="bypassVerified(item.enroll,'pre')"
                                    class="px-2 py-1 bg-gray-200 rounded text-xs hover:bg-gray-300">
                              Skip Verified
                            </button>
                          </div>
                        </div>

                        <!-- Post-test Info with Video -->
                        <div class="space-y-2" :class="item.enroll?.analytics?.post?.score > 32 ? 'text-green-700' : 'text-red-700'">
                          <div class="font-semibold text-gray-700">หลังเรียน</div>
                          
                          <!-- Video Section -->
                          <div class="video-wrapper bg-gray-200 rounded-lg relative">
                            <template v-if="isValidVideoUrl(item.enroll?.verified?.post?.url)">
                              <div>
                                <video
                                  v-if="videoLoaded[`post-${index}`]"
                                  :ref="`videoElement-post-${index}`"
                                  :src="item.enroll?.verified?.post?.url"
                                  :poster="item.posterUrl"
                                  controls
                                  class="fixed-size-video"
                                ></video>
                                <button v-else @click="loadVideo(item.enroll?.verified?.post?.url, `post-${index}`)" 
                                        class="absolute inset-0 flex items-center justify-center w-full h-full bg-gray-800 bg-opacity-80 text-white hover:bg-opacity-90 transition-opacity">
                                  <div class="flex items-center">
                                    <font-awesome-icon icon="fas fa-play" class="mr-2" /> 
                                    <span>Play Video</span>
                                  </div>
                                </button>
                              </div>
                            </template>
                            <div v-else class="no-video-placeholder">
                              No Video
                            </div>
                          </div>

                          <!-- Thumbnails Section -->
                          <div class="grid grid-cols-6 gap-1">
                            <div v-for="(url, thumbIndex) in 6" :key="thumbIndex" class="thumbnail">
                              <template v-if="item.enroll?.capture?.post?.urls && item.enroll?.capture?.post?.urls[thumbIndex]">
                                <img :src="item.enroll.capture.post.urls[thumbIndex]" 
                                     alt="Video thumbnail" 
                                     class="w-full h-6 cursor-pointer rounded" 
                                     @click="openLightbox(item.enroll.capture.post.urls[thumbIndex])">
                              </template>
                              <template v-else>
                                <div class="bg-gray-200 h-6 rounded"></div>
                              </template>
                            </div>
                          </div>

                          <div><strong>คะแนน:</strong> 
                            <span :class="item.enroll?.analytics?.post?.score > 32 ? 'text-green-600' : 'text-red-600'">
                              {{ item.enroll?.analytics?.post?.score || 'N/A' }}
                            </span>
                          </div>
                          <div class="flex space-x-2">
                            <button v-if="!isPublic" @click="resetScore(item.enroll?.examPost?._id, item.user._id, item.enroll, 'post')"
                                    class="px-2 py-1 bg-gray-200 rounded text-xs hover:bg-gray-300">
                              Reset
                            </button>
                            <button v-if="!isPublic" @click="bypassVerified(item.enroll,'post')"
                                    class="px-2 py-1 bg-gray-200 rounded text-xs hover:bg-gray-300">
                              Skip Verified
                            </button>
                          </div>
                        </div>

                        <!-- Retest Info (if applicable) -->
                        <template v-if="item.enroll?.analytics?.post?.score < 33">
                          <div class="space-y-2" :class="item.enroll?.analytics?.retest?.score > 32 ? 'text-green-700' : 'text-red-700'">
                            <div class="font-semibold text-gray-700">สอบซ่อม</div>
                            
                            <!-- Video Section -->
                            <div class="video-wrapper bg-gray-200 rounded-lg relative">
                              <template v-if="isValidVideoUrl(item.enroll?.verified?.retest?.url)">
                                <div>
                                  <video
                                    v-if="videoLoaded[`retest-${index}`]"
                                    :ref="`videoElement-retest-${index}`"
                                    :src="item.enroll?.verified?.retest?.url"
                                    :poster="item.posterUrl"
                                    controls
                                    class="fixed-size-video">
                                  </video>
                                  <button v-else @click="loadVideo(item.enroll?.verified?.retest?.url, `retest-${index}`)" 
                                          class="absolute inset-0 flex items-center justify-center w-full h-full bg-gray-800 bg-opacity-80 text-white hover:bg-opacity-90 transition-opacity">
                                    <div class="flex items-center">
                                      <font-awesome-icon icon="fas fa-play" class="mr-2" /> 
                                      <span>Play Video</span>
                                    </div>
                                  </button>
                                </div>
                              </template>
                              <div v-else class="no-video-placeholder">
                                No Video
                              </div>
                            </div>

                            <!-- Thumbnails Section -->
                            <div class="grid grid-cols-6 gap-1">
                              <div v-for="(url, thumbIndex) in 6" :key="thumbIndex" class="thumbnail">
                                <template v-if="item.enroll?.capture?.retest?.urls && item.enroll?.capture?.retest?.urls[thumbIndex]">
                                  <img :src="item.enroll.capture.retest.urls[thumbIndex]" 
                                       alt="Video thumbnail" 
                                       class="w-full h-6 cursor-pointer rounded" 
                                       @click="openLightbox(item.enroll.capture.retest.urls[thumbIndex])">
                                </template>
                                <template v-else>
                                  <div class="bg-gray-200 h-6 rounded"></div>
                                </template>
                              </div>
                            </div>

                            <div><strong>คะแนน:</strong> {{ item.enroll?.analytics?.retest?.score || 'N/A' }}</div>
                            <div class="flex space-x-2">
                              <button v-if="!isPublic" @click="resetScore(item.enroll?.examPost?._id, item.user._id, item.enroll, 'retest')"
                                      class="px-2 py-1 bg-gray-200 rounded text-xs hover:bg-gray-300">
                                Reset
                              </button>
                              <button v-if="!isPublic" @click="bypassVerified(item.enroll,'retest')"
                                      class="px-2 py-1 bg-gray-200 rounded text-xs hover:bg-gray-300">
                                Skip Verified
                              </button>
                            </div>
                          </div>
                        </template>

                        <!-- Certificate/Status Info -->
                        <div class="space-y-2">
                          <div class="font-semibold text-gray-700">สถานะ</div>
                          <div :class="['p-2 rounded', item.enroll?.analytics?.post?.message === 'ผ่านการรับรอง' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800']">
                            {{ item.enroll?.analytics?.post?.message || 'รอการประเมิน' }}
                          </div>
                          
                          <!-- Client Data -->
                          <div class="p-2 bg-white rounded border text-xs">
                            <div class="font-medium mb-2">ข้อมูลอุปกรณ์</div>
                            <div class="grid grid-cols-1 gap-1">
                              <div><strong>OS:</strong> {{ item?.user?.clientData?.os || 'N/A' }}</div>
                              <div><strong>Browser:</strong> {{ item?.user?.clientData?.browser || 'N/A' }}</div>
                              <div><strong>IP:</strong> {{ item?.user?.clientData?.ip || 'N/A' }}</div>
                              <div><strong>Location:</strong> {{ item?.user?.clientData?.location || 'N/A' }}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>

          <!-- 🚀 PROGRESSIVE/LAZY LOADING INDICATORS -->
          <div v-if="lazy" class="px-6 py-3 border-t border-gray-200 bg-gray-50">
            <div class="flex items-center justify-center space-x-4">
              <!-- Loading Indicator -->
              <div v-if="isLoadingMore" class="flex items-center space-x-2 text-blue-600">
                <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span class="text-sm">กำลังโหลดเพิ่ม...</span>
              </div>
              
              <!-- Manual Load More Button -->
              <button v-else-if="hasMoreItems" @click="loadMoreItems" 
                      class="inline-flex items-center px-4 py-2 border border-blue-300 rounded-md text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors">
                <font-awesome-icon :icon="['fas','plus']" class="mr-2" />
                โหลดเพิ่ม ({{ progressiveLoadingStats?.remaining || 0 }} รายการ)
              </button>
              
              <!-- All Loaded Message -->
              <div v-else class="text-sm text-green-600">
                <font-awesome-icon :icon="['fas','check-circle']" class="mr-1" />
                แสดงครบทั้งหมดแล้ว ({{ progressiveLoadingStats?.total || 0 }} รายการ)
              </div>
            </div>
          </div>

          <div class="px-6 py-3 border-t border-gray-200">
            <Pagination
              :current-page="currentPage"
              :total-items="totalItems"
              :total-pages="totalPages"
              :limit-items="limitItem"
              :data-loading="loading"
              :display-mode="'summary'"
              @page-changed="handlePageChanged"
            />
          </div>
        </div>

        <!-- 🚀 PROGRESSIVE/LAZY LOADING - Floating Progress Toast -->
        <transition name="toast-slide">
          <div v-if="showProgressToast && progressiveLoadingStats && progressiveLoadingStats.percentage < 100" 
               class="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 pointer-events-none">
            <div class="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-3 pointer-events-auto">
              <!-- Progress Stats -->
              <div class="flex items-center space-x-2">
                <font-awesome-icon :icon="['fas','list']" class="text-blue-200" />
                <span class="text-sm font-medium">
                  แสดง {{ progressiveLoadingStats.showing }} / {{ progressiveLoadingStats.total }} รายการ
                </span>
              </div>
              
              <!-- Progress Bar -->
              <div class="w-20 bg-blue-500 rounded-full h-1.5">
                <div class="bg-white h-1.5 rounded-full transition-all duration-300" 
                     :style="`width: ${progressiveLoadingStats.percentage}%`"></div>
              </div>
              
              <!-- Percentage -->
              <span class="text-xs text-blue-200 font-medium">{{ progressiveLoadingStats.percentage }}%</span>
              
              <!-- Show All Button -->
              <button v-if="hasMoreItems" @click="showAllItems" 
                      class="text-xs px-2 py-1 bg-white bg-opacity-20 rounded hover:bg-opacity-30 transition-colors">
                ทั้งหมด
              </button>
            </div>
          </div>
        </transition>

        <!-- Lightbox Modal -->
        <div v-if="lightboxOpen" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50" @click.self="lightboxOpen = false">
          <div class="relative">
            <button @click="lightboxOpen = false" 
                    class="absolute top-0 right-0 m-2 text-white text-xl font-semibold leading-none bg-transparent border-0 cursor-pointer z-10">
              &times;
            </button>
            <img :src="selectedImageUrl" alt="Selected image" class="max-w-full max-h-full" @click.stop>
          </div>
        </div>

        <!-- Add User Modal -->
        <div v-if="isModalOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-lg w-4/5 h-4/5 flex flex-col shadow-xl">
            <div class="px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <font-awesome-icon :icon="['fas','user-plus']" class="text-white text-sm" />
                  </div>
                  <div>
                    <h2 class="text-base font-semibold text-gray-900">เพิ่มผู้ลงทะเบียน</h2>
                    <p class="text-xs text-gray-500">เพิ่มผู้ลงทะเบียนหลักสูตรนี้</p>
                  </div>
                </div>
                <button @click="closeModal" 
                        class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <font-awesome-icon :icon="['fas','times']" class="text-xl" />
                </button>
              </div>
              <div class="flex space-x-1 mt-3">
                <button @click="selectTab('csv')" 
                        :class="selectedTab === 'csv' ? 'bg-white border-gray-200' : 'bg-gray-200'" 
                        class="px-4 py-2 border rounded-t-md text-sm">
                  Upload CSV
                </button>
                <button @click="selectTab('manual')" 
                        :class="selectedTab === 'manual' ? 'bg-white border-gray-200' : 'bg-gray-200'" 
                        class="px-4 py-2 border rounded-t-md text-sm">
                  Input Manual
                </button>
              </div>
            </div>

            <div class="p-4 flex-grow overflow-y-auto">
              <!-- CSV Tab -->
              <div v-if="selectedTab === 'csv'">
                <input type="file" @change="handleFileUpload" accept=".csv" class="mb-4" />
                <div v-if="csvData.length > 0">
                  <h3 class="text-base font-semibold mb-2">ข้อมูลตัวอย่าง</h3>
                  <div class="overflow-x-auto">
                    <table class="table-auto border border-gray-300">
                      <tbody>
                        <tr v-for="(row, rowIndex) in csvData" :key="rowIndex">
                          <td v-for="(cell, cellIndex) in row" :key="cellIndex" class="border px-4 py-2 text-sm">
                            {{ cell }}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <!-- Manual Tab -->
              <div v-if="selectedTab === 'manual'">
                <h3 class="text-base font-semibold mb-4">ข้อมูลผู้เข้าอบรม</h3>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">ชื่อจริง</label>
                    <input type="text" v-model="manualInput.firstname" placeholder="กรอกชื่อจริง" 
                           class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">นามสกุล</label>
                    <input type="text" v-model="manualInput.lastname" placeholder="กรอกนามสกุล" 
                           class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">เบอร์โทร</label>
                    <input type="text" v-model="manualInput.phone" placeholder="กรอกเบอร์โทร" 
                           class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">อีเมล</label>
                    <input type="email" v-model="manualInput.email" placeholder="กรอกอีเมล" 
                           class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
              </div>
            </div>

            <div class="px-4 py-3 border-t border-gray-200 bg-gray-50 rounded-b-lg flex justify-end space-x-2">
              <button @click="closeModal" 
                      class="inline-flex items-center px-2.5 py-1 border border-gray-200 rounded-md text-xs font-medium text-gray-600 bg-white hover:bg-gray-50 transition-colors">
                ยกเลิก
              </button>
              <button @click="processCSV" v-if="selectedTab === 'csv'" 
                      class="inline-flex items-center rounded-lg border border-transparent bg-blue-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors">
                <font-awesome-icon :icon="['fas', 'upload']" class="mr-1.5" />
                ดำเนินการ CSV
              </button>
              <button @click="processManualInput" v-if="selectedTab === 'manual'" 
                      class="inline-flex items-center rounded-lg border border-transparent bg-blue-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors">
                <font-awesome-icon :icon="['fas', 'save']" class="mr-1.5" />
                ดำเนินการ Manual
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
  input:focus-visible {
    outline: none;
  }
</style>

<style scoped>

:deep(.fixed-size-video) {
  width: 100%;
  height: 150px;
  object-fit: fill;
}

/* 🚀 PROGRESSIVE/LAZY LOADING - Toast Animation */
.toast-slide-enter-active,
.toast-slide-leave-active {
  transition: all 0.3s ease-in-out;
}

.toast-slide-enter-from {
  transform: translate(-50%, 100%);
  opacity: 0;
}

.toast-slide-leave-to {
  transform: translate(-50%, 100%);
  opacity: 0;
}

.toast-slide-enter-to,
.toast-slide-leave-from {
  transform: translate(-50%, 0);
  opacity: 1;
}

.video-wrapper {
  /* Ensuring the video wrapper does not stretch beyond the desired dimensions */
  width: 100%;
  height: 150px;
  overflow: hidden; /* In case of any overflow */
  display: flex; /* Centering the video in the wrapper */
  justify-content: center;
  align-items: center;
}

.fixed-size-video {
  width: 100%; /* Make video fill the container */
  height: 100%;
  object-fit: fill; /* Stretch video to fill container, ignoring aspect ratio */
}

.no-video-placeholder{
  display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    background: #e8e8e8;
}

.loading-text {
  color: #fff;
  font-size: 24px;
  margin-bottom: 10px;
}

.processing-count {
  color: #fff;
  font-size: 18px;
}

/* CSS to disable body scrolling when the modal is open */
.body-scroll-lock {
  overflow: hidden;
}
</style>