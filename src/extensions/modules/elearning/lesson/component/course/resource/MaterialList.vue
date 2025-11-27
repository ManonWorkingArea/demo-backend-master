<script>
import {mode, display, kind, player, exam} from "@/master/type";
// Component
import feather from 'feather-icons';
import FileBrowser from '@/interface/modal/FileBrowser.vue';
import { VueDraggableNext } from 'vue-draggable-next'
import storageManager from '@/plugins/storage';
import convertUtils from "@/plugins/convertUtils";
import PlayerEditor from '@/interface/template/PlayerEditor.vue';

import moment from 'moment';
moment().format();


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
    props: {
        dataItem: String,
        tabs: Object,
    },
    data() {
      const session = storageManager.get('session')
      const configs = storageManager.get("configs");
      const schoolSession = configs;

      return {
        toast: null,
        configs: storageManager.get('configs'),
        refreshKey: 0,
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
        // New canonical flat structure
        items: [], // Canonical flat array of all items
        generatedThumbnails: {}, // เก็บ URL ของ thumbnail ที่สร้างจาก video
        selectPlayerItem:[],
        playerParentCount:'',
        playerChildCount:'',
        selectedPlayerIndex: null,
        selectedPlayerId: null,
        selectedSubPlayerIndex: null,
        editingFolderIndex: null, // เก็บ index ของโฟลเดอร์ที่กำลังแก้ไข
      
        showPopupWindow: false,
        activeBlock: false,
        listItems: [],
        selectedItem: null,
        activeBlock_text:'กำลังติดต่อฐานข้อมูล กรุณารอสักครู่.....',

        examCount:'0',
        schoolAdmin: [],
        subArray:[],
        accessToken: session.token,
        login: session.login,
        session: session,
        selectCourseCover:'',
        loading_sources: true,
        FileBrowserOpen: false,
        
        readMoreActivated: false,
        dragging: false,
        draggingFolder: false,
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
        endpoint:"",
        valuePoint:"",
        playerRef:"",
        examRef:"",

        playerType:[],
        modeType:[],
        displayType:[],
        kindType:[],

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
      }
    },
    components: {
      draggable: VueDraggableNext,
      FileBrowser,
      PlayerEditor,
    },
    computed: {
      examType() {
        debug.log("examType",exam);
        return exam;
      },
      // Writable computed tree structure from flat items
      parents: {
        get() {
          return this.items.filter(item => item.root == null).sort((a, b) => a.order.localeCompare(b.order));
        }
      },
      childrenMap() {
        const map = new Map();
        this.items.filter(item => item.root != null).forEach(item => {
          if (!map.has(item.root)) {
            map.set(item.root, []);
          }
          map.get(item.root).push(item);
        });
        // Sort children by order within each folder
        map.forEach((children) => {
          children.sort((a, b) => a.order.localeCompare(b.order));
        });
        return map;
      },
      // คำนวณ selectedPlayerIndex จาก selectedPlayerId
      computedSelectedPlayerIndex() {
        if (!this.selectedPlayerId || !this.parents) {
          return null;
        }
        const index = this.parents.findIndex(player => player._id === this.selectedPlayerId);
        return index !== -1 ? index : null;
      },
      dragOptions() {
        return {
          animation: 200,
          group: 'player-items', // ใช้ group เดียวกันสำหรับการย้ายข้ามโฟลเดอร์
          disabled: false,
          ghostClass: 'ghost',
          chosenClass: 'chosen',
          dragClass: 'drag'
        }
      },
      subDragOptions() {
        return {
          animation: 200,
          group: {
            name: 'player-items', // ใช้ group เดียวกันสำหรับการย้ายข้ามโฟลเดอร์
            put: (to, from, draggedEl) => {
              const vnode = draggedEl.__draggable_context; // vue-draggable-next inject
              const el = vnode?.element;
              if (el?.type === 'folder') return false;
              return true;
            }
          },
          disabled: false,
          ghostClass: 'ghost',
          chosenClass: 'chosen',
          dragClass: 'drag'
        }
      },
      getIconForSubItem() {
        return (type) => {
          switch (type) {
            case 'streaming':
              return ['fas', 'film'];
            case 'demand':
              return ['fas', 'video'];
            case 'live':
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
      folderCount() {
        return this.parents.filter(item => item.type === 'folder').length;
      },
      videoCount() {
        return this.items.filter(item => 
          item.type === 'demand' || item.type === 'streaming' || item.type === 'youtube'
        ).length;
      },
      documentCount() {
        return this.items.filter(item => item.type === 'document').length;
      },
    },
    methods: {
        async callbackFunction() {
            try {
            console.log("callbackFunction");
            await this.getSurvey();
            await this.getSurveySubmission();
            } catch (error) {
            console.error(error);
            }
        },
        updateBadge(badgeValue) {
            this.$emit('update-badge', { code: this.tabs.code, badge: badgeValue });
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
            // block: never allow folder as sub
            if (type === 'folder' && !!main) {
                this.toast?.hide?.('โฟลเดอร์สร้างได้แค่ชั้นบนสุด', 'warning', 1500);
                main = null;
            }
            this.toast = toast({ type: 'pending', message: 'กำลังเพิ่ม...' });
            const mode = main ? 'sub' : 'main';
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
                this.selectedPlayerId = null;
                this.items = []; // Reset items array
                this.selectPlayerItem = [];
                await this.getQueryData();
            }
            } catch (error) {
            debug.log(error)
            }
        },
        async updataVideo(updatedItem) {
            try {
                console.log("updataVideo", updatedItem);

                // ใช้ type ที่ส่งมาจาก PlayerEditor ก่อน จากนั้นตรวจสอบนามสกุลไฟล์
                let type = updatedItem.type;
                
                if (!type && updatedItem.file) {
                    // Check the file extension and determine type (fallback)
                    if (updatedItem.file.endsWith('.m3u8')) {
                        type = "streaming";
                    } else if (updatedItem.file.endsWith('.mp4')) {
                        type = "demand";
                    }
                }

                // กันไฟล์วิดีโอที่ไม่รองรับ
                if (!type) {
                    return this.toast?.hide('ชนิดไฟล์วิดีโอไม่รองรับ', 'error', 300);
                }

                // Prepare the video object based on the file type
                let videoObject = {};
                if (type === "streaming") {
                    videoObject = { streaming: updatedItem.file };
                } else if (type === "demand") {
                    videoObject = { 
                        desktop: updatedItem.file, 
                        mobile: updatedItem.file 
                    };
                } else if (type === "youtube") {
                    videoObject = { youtube: updatedItem.file };
                } else if (type === "live") {
                    videoObject = { live: updatedItem.file };
                }

                // Prepare the payload
                const payload = {
                    data: {
                        type: type,
                        video: videoObject,
                        duration: updatedItem.duration ? this.formatDuration(updatedItem.duration) : null,
                        thumbnail: updatedItem.thumbnail || null
                    },
                    options: {}
                };

                console.log("Sending payload to server:", payload);

                // Make the PUT request
                const { status } = await this.$Request.PUT(`player/${updatedItem.id}`, payload, this.configs.key);

                if (status === 200) {
                    this.hideSubPanel();
                    await this.getQueryData();
                    
                    // เปิด item กลับหลังจากอัพเดทข้อมูล
                    const item = this.items.find(player => player._id === updatedItem.id);
                    
                    if (item) {
                        // ถ้าเป็น sub item
                        if (item.mode === 'sub') {
                            const parentIndex = this.parents.findIndex(player => player._id === item.root);
                            const folderItems = this.childrenMap.get(item.root) || [];
                            const subIndex = folderItems.findIndex(subItem => subItem._id === item._id);
                            if (parentIndex !== -1 && subIndex !== -1) {
                                this.selectedPlayerId = item.root; // เลือกโฟลเดอร์ parent
                                this.selectedSubPlayerIndex = [parentIndex, subIndex];
                            }
                        } else {
                            // ถ้าเป็น main item
                            this.selectedPlayerId = item._id;
                        }

                        // เลื่อนไปยัง panel ที่เปิด
                        const currentIndex = this.computedSelectedPlayerIndex;
                        if (currentIndex !== null) {
                            const panelElement = document.getElementById(`panel-${currentIndex}`);
                            if (panelElement) {
                                const scrollY = panelElement.getBoundingClientRect().top + window.scrollY - 10;
                                this.smoothScrollTo(scrollY);
                            }
                        }
                    }
                    
                    // แสดงข้อความสำเร็จ
                    this.toast?.hide('อัพเดทวิดีโอสำเร็จ', 'success', 3000);
                } else {
                    this.toast?.hide('เกิดข้อผิดพลาดในการอัพเดทวิดีโอ', 'error', 3000);
                }
            } catch (error) {
                console.error("Error updating video:", error);
                this.toast?.hide('เกิดข้อผิดพลาดในการอัพเดทวิดีโอ', 'error', 3000);
                debug.log(error);
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
        async updataExam(updatedItem) {
            try {
            const payload = {
                data: {
                "content":updatedItem.questions
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
            const current = this.items.find(i => i._id === updatedItem.id);
            if (updatedItem.type === 'folder' && current?.root) {
                this.toast?.hide?.('ห้ามเปลี่ยนไอเทมย่อยให้เป็นโฟลเดอร์', 'warning', 1500);
                return;
            }
            const payload = {
                data: {
                "name":updatedItem.name,
                "description":updatedItem.description,
                "duration":updatedItem.duration,
                "type":updatedItem.type,
                "demo":updatedItem.demo,
                "not_visible":updatedItem.not_visible,
                "status":updatedItem.status,
                }
            };
            
            // เพิ่มข้อมูล video และ content หากมีการส่งมา
            if (Object.prototype.hasOwnProperty.call(updatedItem, 'video')) {
                payload.data.video = updatedItem.video;
            }
            if (Object.prototype.hasOwnProperty.call(updatedItem, 'content')) {
                payload.data.content = updatedItem.content;
            }
            if (Object.prototype.hasOwnProperty.call(updatedItem, 'file')) {
                payload.data.file = updatedItem.file;
            }
            if (Object.prototype.hasOwnProperty.call(updatedItem, 'thumbnail')) {
                payload.data.thumbnail = updatedItem.thumbnail;
            }

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
            } else if (updatedItem.type === "live") {
                requestBody.data.video.live = updatedItem.file;
            }

            console.log("SetContentSource A",updatedItem);

            const { status } = await this.$Request.PUT(`player/${updatedItem.id}`, requestBody, this.configs.key);

            if(status === 200) {
                await this.getQueryData();
            }
            } catch (error) {
            debug.log(error)
            }
        },
        togglePanel(index, item) {
            // ใช้ ID แทน index เพื่อป้องกันปัญหาจากการเรียงลำดับใหม่
            if (this.selectedPlayerId === item._id) {
                this.selectedPlayerId = null;
                this.selectedSubPlayerIndex = null;
            } else {
                this.selectedPlayerId = item._id;
                this.selectedSubPlayerIndex = null;
                this.selectPlayerItem = item;
            }
        },
        smoothScrollTo(targetY) {
            const startY = window.scrollY;
            const distance = targetY - startY;
            const duration = 500;
            let startTime = null;

            function animation(currentTime) {
                if (startTime === null) startTime = currentTime;
                const timeElapsed = currentTime - startTime;
                const run = ease(timeElapsed, startY, distance, duration);
                window.scrollTo(0, run);
                if (timeElapsed < duration) requestAnimationFrame(animation);
            }

            function ease(t, b, c, d) {
                t /= d / 2;
                if (t < 1) return c / 2 * t * t + b;
                t--;
                return -c / 2 * (t * (t - 2) - 1) + b;
            }

            requestAnimationFrame(animation);
        },
        isOpenPanel(index) {
            return this.computedSelectedPlayerIndex === index && this.selectedSubPlayerIndex === null;
        },
        toggleSubPanel(parentIndex, subIndex, subItem) {
            const key = [parentIndex, subIndex];
            if (this.selectedSubPlayerIndex && 
                this.selectedSubPlayerIndex[0] === parentIndex && 
                this.selectedSubPlayerIndex[1] === subIndex) {
                this.selectedSubPlayerIndex = null;
            } else {
                // ตั้งค่า selectedPlayerId เป็น parent folder
                const parentItem = this.parents[parentIndex];
                if (parentItem) {
                    this.selectedPlayerId = parentItem._id;
                }
                this.selectedSubPlayerIndex = key;
                this.selectPlayerItem = subItem;
            }
        },
        isOpenSubPanel(parentIndex, subIndex) {
            return this.selectedSubPlayerIndex && 
                   this.selectedSubPlayerIndex[0] === parentIndex && 
                   this.selectedSubPlayerIndex[1] === subIndex;
        },
        hideSubPanel() {
            this.selectedSubPlayerIndex = null;
        },
        hidePanel() {
            this.selectedPlayerId = null;
            this.selectedSubPlayerIndex = null;
            this.editingFolderIndex = null;
        },
        getPlayerItemVideoUrl(playerItem) {
            const v = playerItem?.video || {};
            if (playerItem.type === 'demand')   return v.desktop || v.mobile || '';
            if (playerItem.type === 'streaming')return v.streaming || '';
            if (playerItem.type === 'youtube')  return v.youtube || '';
            if (playerItem.type === 'live')     return v.live || '';
            return '';
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
            // รองรับทั้ง code และ type string
            if (this.playerType && Array.isArray(this.playerType)) {
                const type = this.objectFindByKey(this.playerType, 'code', code);
                if (type) return type.name;
            }
            
            // Fallback สำหรับ type string โดยตรง
            const typeNames = {
                'streaming': 'สตรีมมิ่ง',
                'demand': 'วิดีโอ',
                'live': 'ไลฟ์',
                'youtube': 'ยูทูป',
                'document': 'เอกสาร',
                'exam': 'แบบทดสอบ',
                'folder': 'โฟลเดอร์'
            };
            return typeNames[code] || code || '';
        },
        onDragEndRoot(event) {
            let changedItems = [];
            
            // Handle cross-folder moves
            if (event.added) {
                // Item moved to root from a folder
                const addedItem = event.added.element;
                addedItem.root = null;
                addedItem.mode = 'main';

                // 👇 สำคัญ: บังคับ order ชั่วคราวตามตำแหน่ง drop
                const targetIndex = event.added.newIndex ?? 0;
                const rootList = this.parents; // ตอนนี้ยังเป็นลำดับเดิม (sort ตาม order)

                if (targetIndex === 0) {
                    // ให้เล็กกว่าอันแรกเสมอ เพื่อให้ขึ้นหัวแถว
                    addedItem.order = '00';
                } else {
                    // แทรกระหว่างสองตัว (กันเด้งเพราะ sort)
                    const prev = rootList[targetIndex - 1]?.order ?? '00';
                    const next = rootList[targetIndex]?.order ?? '99';
                    // ทำ lexicographic ให้อยู่ระหว่าง prev กับ next ชั่วคราว
                    addedItem.order = prev + 'a';
                    if (addedItem.order >= next) addedItem.order = next; // กันเคสขอบ
                }

                debug.log('Item added to root:', addedItem._id, 'at index:', targetIndex, 'with order:', addedItem.order);
            }
            
            if (event.removed) {
                // Item was moved from root to somewhere else
                debug.log('Item removed from root:', event.removed.element._id);
            }
            
            // เก็บสถานะโฟลเดอร์ที่เปิดอยู่
            let openFolders = [];
            this.parents.forEach((item) => {
                if (item.type === 'folder' && this.selectedPlayerId === item._id) {
                    openFolders.push(item._id);
                }
            });
            
            // เก็บ ID ของไอเทมที่เลือกไว้ก่อนการเรียงลำดับใหม่
            let selectedItemId = this.selectedPlayerId;
            
            // จากนั้นค่อย normalize ตามลำดับปัจจุบันที่ "ถูกแล้ว"
            changedItems = changedItems.concat(this.normalizeIn(null));
            
            // บันทึกการเปลี่ยนแปลงแบบ batch
            if (changedItems.length > 0) {
                debug.log('Saving root items changes:', changedItems.length, 'items');
                this.saveReorder(changedItems);
            }
            
            // รักษาสถานะการเลือกหลังจากการเรียงลำดับใหม่
            if (selectedItemId) {
                const stillExists = this.parents.some(item => item._id === selectedItemId);
                if (!stillExists) {
                    this.selectedPlayerId = null;
                    this.selectedSubPlayerIndex = null;
                }
            } else if (openFolders.length > 0) {
                for (let folderId of openFolders) {
                    const stillExists = this.parents.some(item => item._id === folderId);
                    if (stillExists) {
                        this.selectedPlayerId = folderId;
                        break;
                    }
                }
            }
        },
        onDragEndSub(event, folderId) {
            let changedItems = [];
            
            // ถ้ามีของถูก "เพิ่ม" แล้วเป็นโฟลเดอร์ → รีเจ็กต์ทันที
            if (event.added) {
                const addedItem = event.added.element;
                if (addedItem?.type === 'folder') {
                    // บังคับกลับเป็น root
                    addedItem.root = null;
                    addedItem.mode = 'main';
                    this.toast?.hide?.('ห้ามวางโฟลเดอร์ในโฟลเดอร์', 'warning', 1500);
                    // รีเซ็ตลิสต์ให้ถูกต้อง
                    changedItems = changedItems.concat(this.normalizeIn(null));
                    if (changedItems.length) this.saveReorder(changedItems);
                    return;
                }
            }
            
            // Handle cross-folder moves
            if (event.added) {
                // Item moved to this folder from elsewhere
                const addedItem = event.added.element;
                addedItem.root = folderId;
                addedItem.mode = 'sub';
                debug.log('Item added to folder:', folderId, addedItem._id);
            }
            
            if (event.removed) {
                // Item was moved from this folder to somewhere else
                debug.log('Item removed from folder:', folderId, event.removed.element._id);
            }
            
            // เก็บ ID ของ sub item ที่เลือกไว้ก่อนการเรียงลำดับใหม่
            let selectedSubItemId = null;
            let selectedParentIndex = null;
            if (this.selectedSubPlayerIndex && this.selectedSubPlayerIndex.length > 1) {
                const [parentIndex, subIndex] = this.selectedSubPlayerIndex;
                selectedParentIndex = parentIndex;
                const folderItems = this.childrenMap.get(folderId) || [];
                if (folderItems[subIndex]) {
                    selectedSubItemId = folderItems[subIndex]._id;
                }
            }
            
            // Normalize current folder และรวม changedItems
            changedItems = changedItems.concat(this.normalizeIn(folderId));
            
            // บันทึกการเปลี่ยนแปลงแบบ batch
            if (changedItems.length > 0) {
                debug.log('Saving folder items changes:', changedItems.length, 'items in folder:', folderId);
                this.saveReorder(changedItems);
            }
            
            // อัพเดท selectedSubPlayerIndex ให้ตรงกับตำแหน่งใหม่ของ sub item ที่เลือก
            if (selectedSubItemId && selectedParentIndex !== null) {
                const folderItems = this.childrenMap.get(folderId) || [];
                const newSubIndex = folderItems.findIndex(item => item._id === selectedSubItemId);
                if (newSubIndex !== -1) {
                    this.selectedSubPlayerIndex = [selectedParentIndex, newSubIndex];
                }
            }
        },
        async saveReorder(changedItems) {
            try {
                debug.log('Batch reorder starting:', changedItems.length, 'items');
                
                // sanitize ก่อนยิง API
                changedItems = changedItems.map(it => {
                    const local = this.items.find(i => i._id === it._id);
                    // ถ้าเป็นโฟลเดอร์ → บังคับเป็น root เสมอ
                    if (local?.type === 'folder') {
                        return { ...it, root: null, order: it.order };
                    }
                    return it;
                });
                
                // อัพเดท local state ก่อน
                changedItems.forEach(item => {
                    const localItem = this.items.find(i => i._id === item._id);
                    if (localItem) {
                        localItem.order = item.order;
                        localItem.root = item.root;
                        localItem.mode = item.root ? 'sub' : 'main';
                    }
                });
                
                // ยิงคำขอแบบ parallel
                const updatePromises = changedItems.map(async (item) => {
                    const payload = {
                        data: {
                            order: item.order,
                            root: item.root,
                            mode: item.root ? 'sub' : 'main'
                        },
                        options: {}
                    };
                    
                    try {
                        debug.log('Updating item:', item._id, 'order:', item.order, 'root:', item.root);
                        const { status } = await this.$Request.PUT(`player/${item._id}`, payload, this.configs.key);
                        if (status !== 200) {
                            debug.log(`Failed to update item ${item._id}`);
                            return { success: false, itemId: item._id };
                        }
                        return { success: true, itemId: item._id };
                    } catch (error) {
                        debug.log(`Error updating item ${item._id}:`, error);
                        return { success: false, itemId: item._id, error };
                    }
                });
                
                // รอให้ทุกคำขอเสร็จ
                const results = await Promise.all(updatePromises);
                
                // รวบรวมผลลัพธ์
                const failed = results.filter(r => !r.success);
                if (failed.length > 0) {
                    debug.log(`${failed.length} items failed to update:`, failed.map(f => f.itemId));
                    // แสดงข้อความเตือนถ้ามีบางรายการไม่สำเร็จ
                    if (this.toast) {
                        this.toast.hide(`อัพเดทเสร็จแล้ว แต่มี ${failed.length} รายการล้มเหลว`, 'warning', 3000);
                    }
                } else {
                    debug.log('Batch reorder completed successfully');
                }
            } catch (error) {
                debug.log('Error in batch reorder:', error.message);
            }
        },
        sort() {
            this.list = this.list.sort((a, b) => a.order - b.order)
        },
        dateTime(value) {
            return moment(value).format("DD/MM/YYYY hh:mm:ss");
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
                $lookup: {
                    from: "category",
                    let: { categoryCodes: { $ifNull: ["$$ROOT.category", []] }, },
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
                    course: { $first: "$$ROOT" },
                    category: { $first: "$categories" },
                    player: { $first: "$players" },
                    document: { $first: "$documents" },
                    exam: { $first: "$exams" },
                },
                },
            ];

            const requestData = {
                pipeline
            };
            const resAPI = await this.$Request.POST(`${this.endpoint}/aggregate`, requestData, this.configs.key);

            if(resAPI.status===200) {

                RestReturn = resAPI.data;

                if (RestReturn && RestReturn.length > 0) {
                const returnData      = this.processingData(RestReturn);
                this.masterDataRecord = returnData;
                this.resetData();

                // Assign Data
                this.playerData   = returnData.formattedData.players ?? null;
                this.courseData   = returnData.formattedData.course ?? null;
                this.courseData.categories   = returnData.formattedData.categories ?? null;
                this.examData     = returnData.formattedData.exam ?? null;
                this.documentData = returnData.formattedData.document ?? null;

                // Populate canonical flat items array
                this.items = returnData.formattedData.players ?? [];

                // force all folders to be root (กันข้อมูลสกปรก)
                this.items.forEach(it => {
                    if (it.type === 'folder') {
                        it.root = null;
                        it.mode = 'main';
                    }
                });

                if(this.masterDataRecord) {
                    // Sort items by order for consistency
                    this.items.sort(function(a,b){return a.order < b.order ? -1 : 1});
                }

                this.playerCount        = this.items.length;
                this.playerParentCount  = this.parents.length;
                this.playerChildCount   = this.items.filter(item => item.root != null).length;

                this.courseCategory = this.courseData.categories;
                this.principles     = this.courseData.principles;
                this.objective      = this.courseData.objective;
                this.target         = this.courseData.target;
                this.structure      = this.courseData.structure;
                this.description    = this.courseData.description;
                this.cover          = this.courseData.cover
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
                this.updateBadge(this.playerCount)
                }
            }
            } catch (error) {
            debug.log(error)
            }
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

            // Return only the formatted data since we use computed properties for tree structure
            return {
            formattedData
            };
        },
        resetData() {
            debug.log("resetData",this.courseData)
            this.searchQuery = null;
            this.playerData = null;
            this.courseData = null;
            this.examData = null;
            this.documentData = null;
            this.items = []; // Reset canonical flat array
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
        async clonePlayer(playerItem) {
            try {
            // Clone the player item
            const newPlayerItem = JSON.parse(JSON.stringify(playerItem));
            newPlayerItem.name += ' (Clone)';
            newPlayerItem._id = undefined; // Clear the ID so the server generates a new one

            // If the item is a parent, clone its children as well
            const isParent = !playerItem.root;

            if (isParent) {
                // Send a request to the server to create the new parent player
                const parentResponse = await this.$Request.POST('player', { data: newPlayerItem }, this.configs.key);

                if (parentResponse.status === 200) {
                const newParentId = parentResponse.data._id;

                // Clone child players if any
                const folderItems = this.childrenMap.get(playerItem._id) || [];
                if (folderItems.length > 0) {
                    for (const child of folderItems) {
                    const newChild = JSON.parse(JSON.stringify(child));
                    newChild.name += ' (Clone)';
                    newChild._id = undefined; // Clear the ID so the server generates a new one
                    newChild.root = newParentId; // Set the new parent ID

                    await this.$Request.POST('player', { data: newChild }, this.configs.key);
                    }
                }
                }
            } else {
                // For child items, just create the new item
                await this.$Request.POST('player', { data: newPlayerItem }, this.configs.key);
            }

            this.toast.hide('คัดลอกสำเร็จแล้ว.', 'success', 300);
            await this.getQueryData(); // Refresh the player list
            } catch (error) {
            console.error(error);
            this.toast.hide('คัดลอกไม่สำเร็จ.', 'error', 300);
            }
        },
        // Helper method for normalizing order
        normalizeIn(parentId) {
          const arr = parentId ? (this.childrenMap.get(parentId) || []) : this.parents;
          arr.forEach((item, idx) => {
            item.order = ('0' + (idx + 1)).slice(-2);
            // Update mode based on root
            item.mode = item.root ? 'sub' : 'main';
          });
          return arr.map(({ _id, root, order }) => ({ _id, root: root ?? null, order }));
        },
        // ตรวจสอบว่าโฟลเดอร์มีไอเทมข้างในหรือไม่
        hasFolderItems(folderId) {
            return this.childrenMap.has(folderId) && this.childrenMap.get(folderId).length > 0;
        },
        // ตรวจสอบว่าสามารถลบโฟลเดอร์ได้หรือไม่
        canDeleteFolder(playerItem) {
            return playerItem.type !== 'folder' || !this.hasFolderItems(playerItem._id);
        },
        async deleteParentPlayer(id) {
            // ตรวจสอบว่าเป็นโฟลเดอร์และมีไอเทมข้างในหรือไม่
            const playerItem = this.items.find(item => item._id === id);
            if (playerItem && playerItem.type === 'folder' && this.hasFolderItems(id)) {
                // แสดงข้อความเตือนว่าไม่สามารถลบได้
                dialog.alert({
                    title: 'ไม่สามารถลบโฟลเดอร์ได้',
                    message: 'โฟลเดอร์นี้ยังมีไอเทมอยู่ข้างใน กรุณาลบหรือย้ายไอเทมทั้งหมดออกจากโฟลเดอร์ก่อน'
                });
                return;
            }

            dialog.confirm({
                title: 'ต้องการลบข้อมูลนี้?',
                message: 'หลังจากลบแล้วจะไม่สามารถกู้คืนข้อมูลนี้ได้อีก !',
                confirm: () => {
                    this.confirmDeletePlayer(id);
                }
            });
        },
        async reloadPlayerData() {
            console.log("reloadPlayerData");
            await this.getQueryData();
        },
        async deletePlayer(updatedItem) {
            try {
                debug.log("updatedItem",updatedItem);
                dialog.confirm({
                    title: "ต้องการลบข้อมูลนี้?",
                    message: "หลังจากลบแล้วจะไม่สามารถกู้คืนข้อมูลนี้ได้อีก !",
                    confirm: async () => {
                        debug.log("Delete");
                        // Use _id if id doesn't exist (for backward compatibility)
                        const itemId = updatedItem.id || updatedItem._id;
                        this.confirmDeletePlayer(itemId);
                    },
                    cancel: () => {
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
                dialog.confirm({
                    title: "ต้องการลบข้อมูลนี้ ?",
                    message: "หลังจากลบแล้วจะไม่สามารถกู้คืนข้อมูลนี้ได้อีก !",
                    confirm: () => {
                        debug.log("Delete");
                        this.confirmDeleteExam(id,index);
                    },
                    cancel: () => {
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
        async confirmDeletePlayer(id) {
            try {
                // เก็บสถานะโฟลเดอร์ที่เปิดอยู่ก่อนลบ
                const currentOpenFolder = this.selectedPlayerIndex;
                const currentEditingFolder = this.editingFolderIndex;
                
                this.toast = toast({ type: 'pending', message: 'กำลังลบ..' });
                const { status } = await this.$Request.DELETE(`player/${id}`, null, this.configs.key);
                
                if(status === 200) {
                    this.toast.hide('ลบเสร็จแล้ว.', 'success', 300);
                    await this.getQueryData();
                    
                    // คืนสถานะโฟลเดอร์ที่เปิดอยู่หลังจากรีเฟรชข้อมูล
                    // แต่ปิด sub panel เพราะไอเทมถูกลบไปแล้ว
                    if (currentOpenFolder !== null) {
                        this.selectedPlayerIndex = currentOpenFolder;
                        this.selectedSubPlayerIndex = null; // ปิด sub panel เพราะไอเทมถูกลบ
                        this.editingFolderIndex = currentEditingFolder; // คืนสถานะการแก้ไขโฟลเดอร์
                    }
                }
            } catch (error) {
                debug.log(error);
                this.toast.hide('เกิดข้อผิดพลาดในการลบ', 'error', 300);
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
            this.updataVideo({
              id: this.selectPlayerItem._id,
              file: payload.file,
              duration: payload.duration ?? 0,
              thumbnail: payload.thumbnail ?? ''
            });
            }
        },
        moveGuard(evt /*, originalEvent */) {
            const dragged = evt.draggedContext?.element;
            const toRole = evt.to?.getAttribute?.('role');

            // กัน: ห้ามลาก "โฟลเดอร์" เข้าลิสต์ย่อย (list_sub) เด็ดขาด
            if (toRole === 'list_sub' && dragged?.type === 'folder') {
                // ถ้าจะให้มีเสียงเตือนเล็ก ๆ ก็ได้
                this.toast?.hide?.('โฟลเดอร์ห้ามซ้อนโฟลเดอร์', 'warning', 1200);
                return false;
            }
            return true;
        },
        onDragStart(evt) {
            const el = evt.item?.__draggable_context?.element;
            this.draggingFolder = el?.type === 'folder';
        },
        onDragEnd() {
            this.draggingFolder = false;
        },
        // Drag & Drop handlers สำหรับ empty folder dropzone
        handleDragOver(event) {
            event.preventDefault();
            event.dataTransfer.dropEffect = 'move';
            // เพิ่มเอฟเฟกต์ highlight
            event.currentTarget.classList.add('border-yellow-500', 'bg-yellow-100');
        },
        handleDragLeave(event) {
            event.preventDefault();
            // ลบเอฟเฟกต์ highlight
            event.currentTarget.classList.remove('border-yellow-500', 'bg-yellow-100');
        },
        handleDrop(event, folderId) {
            event.preventDefault();
            // ลบเอฟเฟกต์ highlight
            event.currentTarget.classList.remove('border-yellow-500', 'bg-yellow-100');
            
            try {
                // ตรวจสอบว่ามีข้อมูลที่ drop หรือไม่
                const dropData = event.dataTransfer.getData('text/plain');
                if (dropData) {
                    // ประมวลผลข้อมูลที่ drop
                    console.log('Dropped data to folder:', folderId, dropData);
                    
                    // แสดงข้อความแจ้งว่าได้รับข้อมูล
                    toast({ 
                        type: 'info', 
                        message: `ได้รับข้อมูล: ${dropData} ในโฟลเดอร์`,
                        duration: 3000 
                    });
                } else {
                    // แสดงข้อความเมื่อไม่มีข้อมูล
                    toast({ 
                        type: 'warning', 
                        message: 'ไม่พบข้อมูลที่จะวาง',
                        duration: 2000 
                    });
                }
            } catch (error) {
                console.error('Drop handling error:', error);
                toast({ 
                    type: 'error', 
                    message: 'เกิดข้อผิดพลาดในการวางข้อมูล',
                    duration: 3000 
                });
            }
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
        handleDeleteDocument(id, index) {
            this.documentData.splice(index, 1);
        },
        handleAddDocument() {
            this.getQueryData();
        },
        // เพิ่มฟังก์ชันใหม่
        async handleReopenItem(item) {
            // รอให้ข้อมูลอัพเดทเสร็จก่อน
            await this.getQueryData();

            console.log("handleReopenItem",item);
            
            // เซ็ต selectedPlayerId ตามประเภทของ item
            this.selectedPlayerId = item.mode === 'sub' ? item.root : item._id;
            
            // Scroll ไปยัง panel ที่ถูกต้องหลัง set selectedPlayerId
            const idx = this.computedSelectedPlayerIndex;
            if (idx !== null) {
                const el = document.getElementById(`panel-${idx}`);
                if (el) this.smoothScrollTo(el.getBoundingClientRect().top + window.scrollY - 10);
            }

            // ถ้าเป็น sub item
            if (item.mode === 'sub') {
                const parentIndex = this.parents.findIndex(player => player._id === item.root);
                const folderItems = this.childrenMap.get(item.root) || [];
                const subIndex = folderItems.findIndex(subItem => subItem._id === item._id);
                if (parentIndex !== -1 && subIndex !== -1) {
                    this.selectedSubPlayerIndex = [parentIndex, subIndex];
                }
            }
        },
        // Helper methods for new design
        getSubItemIconColor(type) {
            const colors = {
                'streaming': 'bg-gradient-to-br from-red-500 to-red-600',
                'demand': 'bg-gradient-to-br from-blue-500 to-blue-600',
                'live': 'bg-gradient-to-br from-purple-500 to-purple-600',
                'youtube': 'bg-gradient-to-br from-red-500 to-red-600',
                'document': 'bg-gradient-to-br from-green-500 to-green-600',
                'exam': 'bg-gradient-to-br from-orange-500 to-orange-600'
            };
            return colors[type] || 'bg-gradient-to-br from-gray-500 to-gray-600';
        },
        editFolder(index) {
            // เปิดการแก้ไขโฟลเดอร์โดยตรง โดยไม่ขยาย/ย่อ
            this.selectedPlayerId = this.parents[index]?._id;
            this.selectedSubPlayerIndex = null;
            this.editingFolderIndex = index; // เปิดโหมดแก้ไขโฟลเดอร์
        },
        cancelFolderEdit() {
            // ปิดโหมดแก้ไขโฟลเดอร์
            this.editingFolderIndex = null;
        },
        getYouTubeThumbnail(youtubeUrl, quality = 'hqdefault') {
            if (!youtubeUrl) return '';
            
            let videoId = '';
            
            // ดึง video ID จาก URL รูปแบบต่างๆ
            if (youtubeUrl.includes('youtube.com/watch')) {
                const urlParams = new URLSearchParams(youtubeUrl.split('?')[1]);
                videoId = urlParams.get('v');
            } else if (youtubeUrl.includes('youtu.be/')) {
                videoId = youtubeUrl.split('youtu.be/')[1].split('?')[0];
            } else if (youtubeUrl.includes('youtube.com/embed/')) {
                videoId = youtubeUrl.split('embed/')[1].split('?')[0];
            }
            
            if (videoId) {
                // YouTube thumbnail quality options:
                // default.jpg (120x90)
                // mqdefault.jpg (320x180) 
                // hqdefault.jpg (480x360)
                // sddefault.jpg (640x480)
                // maxresdefault.jpg (1280x720) - ไม่มีทุกวีดีโอ
                return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
            }
            
            return '';
        },
        getThumbnailUrl(playerItem) {
            // ถ้าเป็น YouTube ให้ดึง thumbnail จาก YouTube API
            if (playerItem.type === 'youtube' && playerItem.video && playerItem.video.youtube) {
                const youtubeThumbnail = this.getYouTubeThumbnail(playerItem.video.youtube, 'mqdefault');
                if (youtubeThumbnail) return youtubeThumbnail;
            }
            
            // ถ้าเป็น MP4 video ให้ใช้วิดีโอเป็น thumbnail
            if (playerItem.type === 'demand' && playerItem.video && (playerItem.video.desktop || playerItem.video.mobile)) {
                return playerItem.video.desktop || playerItem.video.mobile;
            }
            
            // ถ้าไม่ใช่ YouTube หรือ MP4 หรือดึง thumbnail ไม่ได้ ให้ใช้ thumbnail ปกติ
            return playerItem.cover || playerItem.thumbnail || 'https://dummyimage.com/800x600/ededed/303030.png&text=++++++COVER++++++';
        },
        generateVideoThumbnail(videoUrl, time = 1) {
            return new Promise((resolve) => {
                const video = document.createElement('video');
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                video.crossOrigin = 'anonymous';
                video.currentTime = time; // ดึง frame ที่วินาทีที่ 1
                
                video.addEventListener('loadeddata', () => {
                    canvas.width = 320;
                    canvas.height = 180;
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                    
                    canvas.toBlob((blob) => {
                        if (blob) {
                            const thumbnailUrl = URL.createObjectURL(blob);
                            resolve(thumbnailUrl);
                        } else {
                            resolve(null);
                        }
                    }, 'image/jpeg', 0.8);
                });
                
                video.addEventListener('error', () => {
                    resolve(null);
                });
                
                video.src = videoUrl;
                video.load();
            });
        },
    },
    created() {
      this.playerType = player;
    },
    async mounted () {
      try {
        if(this.master) {
          this.endpoint = "mcourse";
        } else {
          this.endpoint = "course";
        }
        await this.getQueryData();

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
    updated() {
        feather.replace();
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

<!-- Header Section -->
<div class="bg-white rounded-lg shadow-sm border border-gray-200">
  <div class="px-4 py-3 border-b border-gray-200">
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <div class="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
          <font-awesome-icon :icon="['fas','book']" class="text-white text-sm" />
        </div>
        <div>
          <h2 class="text-base font-semibold text-gray-900">จัดการบทเรียน</h2>
          <p class="text-xs text-gray-500">จัดการเนื้อหาและสื่อการเรียนรู้ ({{ playerCount }} รายการ)</p>
        </div>
      </div>
      
      <div class="flex items-center space-x-2">
        <!-- Quick Actions -->
        <button 
          @click="addPlayer('demand', playerCount, courseData.name)"
          class="inline-flex items-center rounded-lg border border-transparent bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors">
          <font-awesome-icon :icon="['fas','plus']" class="text-white mr-1.5" />
          เพิ่มบทเรียน
        </button>
        
        <button 
          @click="addPlayer('folder', playerCount, courseData.name)"
          class="inline-flex items-center rounded-lg border border-transparent bg-yellow-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-colors">
          <font-awesome-icon :icon="['fas','folder-plus']" class="text-white mr-1.5" />
          เพิ่มโฟลเดอร์
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
          <strong>หมายเหตุ:</strong> จัดการเนื้อหาบทเรียน วิดีโอ เอกสาร และแบบทดสอบสำหรับหลักสูตรนี้
        </p>
      </div>
    </div>
  </div>

  <!-- Main Content -->
  <div class="p-4">

    <!-- Material List -->
    <div class="space-y-4" v-if="courseData.type!='onsite'" id="root-panel">
      <!-- Loading State -->
      <div v-if="activeBlock" class="text-center py-12">
        <div class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <font-awesome-icon :icon="['fas','spinner']" class="text-gray-400 text-lg animate-spin"/>
        </div>
        <h3 class="text-base font-medium text-gray-900 mb-2">กำลังโหลด</h3>
        <p class="text-sm text-gray-500">{{ activeBlock_text }}</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="parents.length === 0" class="text-center py-12">
        <div class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <font-awesome-icon :icon="['fas','book-open']" class="text-gray-400 text-lg"/>
        </div>
        <h3 class="text-base font-medium text-gray-900 mb-2">ยังไม่มีบทเรียน</h3>
        <p class="text-sm text-gray-500 mb-4">เริ่มต้นสร้างบทเรียนสำหรับหลักสูตรของคุณ</p>
        <div class="flex justify-center space-x-3">
          <button 
            @click="addPlayer('demand', playerCount, courseData.name)"
            class="inline-flex items-center rounded-lg border border-transparent bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors">
            <font-awesome-icon :icon="['fas','plus']" class="mr-1.5" />
            เพิ่มบทเรียนแรก
          </button>
        </div>
      </div>

      <!-- Material Items -->
      <div v-else class="space-y-2">
        

          <transition-group name="material" tag="div" class="space-y-2">

            <draggable
          role="list_parent" 
          tag="div"
          :list="parents"
          handle=".handle"
          v-bind="dragOptions"
          :move="moveGuard"
          @change="onDragEndRoot"
          @start="onDragStart"
          @end="onDragEnd"
          class="space-y-2">
            <div v-for="(playerItem,index) in parents" :key="playerItem._id"
                 class="group bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-md transition-all duration-200"
                 :class="{ 'border-indigo-300 bg-indigo-50': computedSelectedPlayerIndex === index }"
                 :id="`panel-${index}`">

              <!-- Folder Type -->
              <template v-if="playerItem.type==='folder'&&playerItem.mode!='sub'">
                <div class="relative p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
                  <!-- Left border with rounded corner -->
                  <div class="absolute left-0 top-0 bottom-0 w-1 bg-yellow-400 rounded-l-lg"></div>
                  
                  <div class="flex items-center justify-between" @click="togglePanel(index,playerItem)">
                    <div class="flex items-center space-x-3 flex-1 cursor-pointer">
                      <!-- Drag Handle -->
                      <div class="handle cursor-move p-1 hover:bg-yellow-100 rounded" @click.stop>
                        <font-awesome-icon :icon="['fas','grip-vertical']" class="text-gray-400" />
                      </div>

                      <!-- Folder Icon -->
                      <div class="w-10 h-10 rounded-lg flex items-center justify-center text-white transition-all duration-300"
                           :class="computedSelectedPlayerIndex === index 
                             ? 'bg-gradient-to-br from-orange-400 to-red-500 shadow-lg transform scale-105' 
                             : 'bg-gradient-to-br from-yellow-400 to-orange-500'">
                        <font-awesome-icon 
                          :icon="['fas', computedSelectedPlayerIndex === index ? 'folder-open' : 'folder']" 
                          class="text-lg transition-all duration-300"
                          :class="computedSelectedPlayerIndex === index ? 'animate-pulse' : ''"
                        />
                      </div>

                      <!-- Folder Info -->
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center space-x-2">
                          <h3 class="text-sm font-medium text-gray-900">{{ playerItem.name }}</h3>
                          <span v-if="playerItem.demo" class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            ตัวอย่าง
                          </span>
                        </div>
                        
                        <!-- Status Info -->
                        <div class="flex items-center space-x-3 mt-1 text-xs text-gray-500">
                          <span class="flex items-center">
                            <font-awesome-icon :icon="['fas','items']" class="mr-1 text-yellow-500" />
                            {{ childrenMap.get(playerItem._id)?.length || 0 }} รายการ
                          </span>
                          <span class="text-gray-300">•</span>
                          <span class="flex items-center">
                            <font-awesome-icon :icon="['fas','code']" class="mr-1 text-gray-400" />
                            {{ playerItem.slug }}
                          </span>
                          <span class="text-gray-300">•</span>
                          <span class="flex items-center">
                            <font-awesome-icon :icon="['fas','tag']" class="mr-1 text-gray-400" />
                            {{ getPlayerTypeName(playerItem.type) }}
                          </span>
                        </div>
                      </div>
                    </div>

                    <!-- Action Buttons -->
                    <div class="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        @click.stop="addPlayer('demand', (childrenMap.get(playerItem._id) || []).length, courseData.name + ' - ' + playerItem.name , playerItem._id)"
                        class="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                        title="เพิ่มบทเรียน">
                        <font-awesome-icon :icon="['fas','plus']" class="text-sm" />
                      </button>
                      
                      <button 
                        @click.stop="editFolder(index)"
                        class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="แก้ไขโฟลเดอร์">
                        <font-awesome-icon :icon="['fas','edit']" class="text-sm" />
                      </button>
                      
                      <button 
                        @click.stop="deleteParentPlayer(playerItem._id)"
                        :disabled="!canDeleteFolder(playerItem)"
                        class="p-2 rounded transition-colors"
                        :class="canDeleteFolder(playerItem) 
                          ? 'text-gray-400 hover:text-red-600 hover:bg-red-50' 
                          : 'text-gray-300 cursor-not-allowed bg-gray-100'"
                        :title="canDeleteFolder(playerItem) 
                          ? 'ลบโฟลเดอร์' 
                          : 'ไม่สามารถลบได้ - โฟลเดอร์มีไอเทมอยู่ข้างใน'">
                        <font-awesome-icon 
                          :icon="['fas', canDeleteFolder(playerItem) ? 'trash' : 'lock']" 
                          class="text-sm" 
                        />
                      </button>
                      
                      <button 
                        @click.stop="togglePanel(index,playerItem)"
                        class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded transition-colors"
                        title="ตั้งค่า">
                        <font-awesome-icon 
                          :icon="['fas', computedSelectedPlayerIndex === index ? 'chevron-up' : 'chevron-down']" 
                          class="text-sm"
                        />
                      </button>
                    </div>
                  </div>

                  <!-- Sub Items in Folder -->
                  <div v-if="computedSelectedPlayerIndex === index && childrenMap.has(playerItem._id)" class="mt-4 space-y-2">
                        <div class="border-t border-yellow-200 pt-4" :class="{'cursor-not-allowed': draggingFolder}">
                          <h4 class="text-sm font-medium text-gray-700 mb-3 flex items-center">
                            <font-awesome-icon :icon="['fas','list']" class="mr-2 text-yellow-500" />
                            รายการในโฟลเดอร์
                          </h4>
                          
                          <!-- แจ้งเตือนเมื่อมีไอเทมในโฟลเดอร์ -->
                          <div v-if="hasFolderItems(playerItem._id)" class="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                            <div class="flex items-center text-amber-700">
                              <font-awesome-icon :icon="['fas','exclamation-triangle']" class="mr-2 text-amber-600" />
                              <span class="text-xs">
                                โฟลเดอร์นี้มีไอเทม {{ childrenMap.get(playerItem._id).length }} รายการ 
                                ต้องลบหรือย้ายไอเทมทั้งหมดออกก่อนจึงจะสามารถลบโฟลเดอร์ได้
                              </span>
                            </div>
                          </div>
                          
                            <transition-group name="sub-material" tag="div" class="space-y-2">

                          <draggable
                          role="list_sub"
                          tag="div"
                          :list="childrenMap.get(playerItem._id) || []"
                          handle=".handle"
                          v-bind="subDragOptions"
                          :move="moveGuard"
                          @change="(event) => onDragEndSub(event, playerItem._id)"
                          @start="onDragStart"
                          @end="onDragEnd"
                          class="space-y-2">                          <div v-for="(subItem, subIndex) in childrenMap.get(playerItem._id) || []" :key="subItem._id"
                               class="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow">
                            
                            <div class="flex items-center justify-between" @click.stop="toggleSubPanel(index, subIndex, subItem)">
                              <div class="flex items-center space-x-3 flex-1 cursor-pointer">
                                <!-- Sub Item Drag Handle -->
                                <div class="handle cursor-move p-1 hover:bg-gray-100 rounded" @click.stop>
                                  <font-awesome-icon :icon="['fas','grip-vertical']" class="text-gray-400 text-xs" />
                                </div>

                                <!-- Sub Item Icon/Thumbnail -->
                                <div class="w-8 h-8 rounded-lg flex items-center justify-center text-white overflow-hidden relative"
                                     :class="(subItem.type === 'youtube' || subItem.type === 'demand') ? 'bg-gray-100' : getSubItemIconColor(subItem.type)">
                                  
                                  <!-- แสดง video element สำหรับ MP4 -->
                                  <video v-if="subItem.type === 'demand' && subItem.video && (subItem.video.desktop || subItem.video.mobile)"
                                         class="w-full h-full object-cover"
                                         :src="subItem.video.desktop || subItem.video.mobile"
                                         muted
                                         preload="metadata"
                                         @loadeddata="$event.target.currentTime = 1">
                                  </video>
                                  
                                  <!-- แสดง thumbnail สำหรับ YouTube -->
                                  <img v-else-if="subItem.type === 'youtube'" 
                                       class="w-full h-full object-cover" 
                                       :src="getThumbnailUrl(subItem)"
                                       :alt="subItem.name">
                                  
                                  <!-- แสดงไอคอนสำหรับประเภทอื่น -->
                                  <font-awesome-icon 
                                    v-else
                                    :icon="getIconForSubItem(subItem.type)" 
                                    class="text-sm"
                                  />
                                  
                                  <!-- Play icon overlay สำหรับ video -->
                                  <div v-if="subItem.type === 'demand' || subItem.type === 'youtube' || subItem.type === 'streaming'"
                                       class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
                                    <font-awesome-icon :icon="['fas','play']" class="text-white text-xs" />
                                  </div>
                                </div>

                                <!-- Sub Item Info -->
                                <div class="flex-1 min-w-0">
                                  <div class="flex items-center space-x-2">
                                    <h5 class="text-sm font-medium text-gray-900">{{ subItem.name }}</h5>
                                    <span v-if="subItem.demo" class="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                      ตัวอย่าง
                                    </span>
                                  </div>
                                  
                                  <div class="flex items-center space-x-2 mt-1 text-xs text-gray-500">
                                    <span class="flex items-center">
                                      <font-awesome-icon :icon="['fas','clock']" class="mr-1" />
                                      {{ subItem.duration }} นาที
                                    </span>
                                    <span class="text-gray-300">•</span>
                                    <span class="flex items-center">
                                      <font-awesome-icon :icon="['fas','tag']" class="mr-1" />
                                      {{ getPlayerTypeName(subItem.type) }}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <!-- Sub Item Actions -->
                              <div class="flex items-center space-x-1">
                                <button 
                                  @click.stop="deletePlayer(subItem)"
                                  class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                  title="ลบ">
                                  <font-awesome-icon :icon="['fas','trash']" class="text-xs" />
                                </button>
                              </div>
                            </div>

                            <!-- Sub Item Editor -->
                            <div v-if="isOpenSubPanel(index, subIndex)" class="border-t border-gray-200 mt-3 pt-3">
                              <PlayerEditor 
                                @click.stop="handleCheckboxClick"
                                :select-player-item="subItem" 
                                @update-select-player-item="updataPlayer"
                                @update-player-video="updataVideo"
                                @update-player-document="updataDocument"
                                @update-player-exam="updataExam"
                                @update-player-video-url="SetContentSource"
                                @delete-select-player-item="deletePlayer" 
                                @cancel-update="hideSubPanel"
                                @update-player-data="reloadPlayerData"
                                @reopen-selected-item="handleReopenItem(subItem)"
                              />
                            </div>
                          </div>
                          </draggable>
                        </transition-group>
                        
                        <!-- Empty Folder Dropzone -->
                        <div v-if="!hasFolderItems(playerItem._id)" 
                             class="dropzone mt-4 p-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 hover:border-yellow-400 hover:bg-yellow-50 transition-all duration-200 cursor-pointer group"
                             @dragover.prevent="handleDragOver"
                             @dragleave.prevent="handleDragLeave"
                             @drop.prevent="handleDrop($event, playerItem._id)"
                             @click="addPlayer('demand', 0, courseData.name + ' - ' + playerItem.name, playerItem._id)">
                          <div class="text-center">
                            <div class="w-12 h-12 mx-auto mb-3 rounded-full bg-yellow-100 flex items-center justify-center group-hover:bg-yellow-200 group-hover:scale-110 transition-all duration-200">
                              <font-awesome-icon :icon="['fas','cloud-upload-alt']" class="text-yellow-600 text-xl group-hover:animate-bounce" />
                            </div>
                            <h4 class="text-sm font-medium text-gray-700 mb-1 group-hover:text-yellow-700">วางไอเทมที่นี่</h4>
                            <p class="text-xs text-gray-500 group-hover:text-yellow-600">
                              ลากไอเทมจากระบบอื่นมาวางในโฟลเดอร์นี้
                            </p>
                            <div class="mt-3 pt-3 border-t border-gray-200 group-hover:border-yellow-300">
                              <p class="text-xs text-gray-400 group-hover:text-yellow-500">
                                หรือคลิกที่นี่เพื่อเพิ่มไอเทมใหม่
                              </p>
                            </div>
                          </div>
                        </div>
                      
                    </div>
                  </div>

                  <!-- Folder Editor (for editing folder properties) -->
                  <div v-if="computedSelectedPlayerIndex === index && selectedSubPlayerIndex === null" class="">
                    <!-- <div class="flex items-center justify-between mb-2">
                      <h4 class="text-sm font-medium text-gray-700 flex items-center">
                        <font-awesome-icon :icon="['fas','cog']" class="mr-2 text-yellow-500" />
                        ตั้งค่าโฟลเดอร์
                      </h4>
                      
                      <button 
                        v-if="editingFolderIndex !== index"
                        @click="editingFolderIndex = index"
                        class="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-lg text-white bg-yellow-600 hover:bg-yellow-700 transition-colors">
                        <font-awesome-icon :icon="['fas','edit']" class="mr-1.5" />
                        แก้ไขโฟลเดอร์
                      </button>
                    </div>
                     -->
                    <!-- แสดงฟอร์มแก้ไขเมื่ออยู่ในโหมดแก้ไข -->
                    <div v-if="editingFolderIndex === index" class="bg-white rounded-lg border border-gray-200 mt-2 p-2 border-t border-yellow-200 pt-2 mt-2">
                      <PlayerEditor
                        :select-player-item="playerItem" 
                        @update-select-player-item="updataPlayer"
                        @update-player-video="updataVideo"
                        @update-player-document="updataDocument"
                        @update-player-exam="updataExam"
                        @update-player-video-url="SetContentSource" 
                        @cancel-update="cancelFolderEdit"
                        @delete-select-player-item="deletePlayer" 
                        @update-player-data="reloadPlayerData"
                        @reopen-selected-item="handleReopenItem(playerItem)"
                      />
                    </div>
                  </div>
                </div>
              </template>

              <!-- Standard Player Type -->
              <template v-if="playerItem.type!='folder'&&playerItem.mode!='sub'">
                <div class="p-4">
                  <div class="flex items-center justify-between" @click.stop="togglePanel(index,playerItem)">
                    <div class="flex items-center space-x-3 flex-1 cursor-pointer">
                      <!-- Drag Handle -->
                      <div class="handle cursor-move p-1 hover:bg-gray-100 rounded" @click.stop>
                        <font-awesome-icon :icon="['fas','grip-vertical']" class="text-gray-400" />
                      </div>

                      <!-- Thumbnail -->
                      <div class="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 relative">
                        <!-- สำหรับ MP4 video แสดงเป็น video element -->
                        <video v-if="playerItem.type === 'demand' && playerItem.video && (playerItem.video.desktop || playerItem.video.mobile)"
                               class="w-full h-full object-cover"
                               :src="playerItem.video.desktop || playerItem.video.mobile"
                               muted
                               preload="metadata"
                               @loadeddata="$event.target.currentTime = 1">
                        </video>
                        
                        <!-- สำหรับประเภทอื่น แสดง image thumbnail -->
                        <img v-else
                             class="w-full h-full object-cover" 
                             :src="getThumbnailUrl(playerItem)" 
                             alt=""
                             @error="$event.target.src='https://dummyimage.com/800x600/ededed/303030.png&text=++++++COVER++++++'">
                        
                        <!-- Play icon overlay สำหรับ video -->
                        <div v-if="playerItem.type === 'demand' || playerItem.type === 'youtube' || playerItem.type === 'streaming'"
                             class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                          <font-awesome-icon :icon="['fas','play']" class="text-white text-xs" />
                        </div>
                      </div>

                      <!-- Player Info -->
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center space-x-2">
                          <h3 class="text-sm font-medium text-gray-900">{{ playerItem.name }}</h3>
                          <span v-if="playerItem.demo" class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            ตัวอย่าง
                          </span>
                          <div class="w-2 h-2 rounded-full" 
                               :class="getClassForTypeAndData(playerItem.type, playerItem) === 'text-lime-600' ? 'bg-green-400' : 'bg-red-400'">
                          </div>
                        </div>
                        
                        <!-- Status Info -->
                        <div class="flex items-center space-x-3 mt-1 text-xs text-gray-500">
                          <span class="flex items-center">
                            <font-awesome-icon 
                              :icon="getIconForSubItem(playerItem.type)" 
                              :class="getClassForTypeAndData(playerItem.type, playerItem)"
                              class="mr-1" 
                            />
                            {{ getPlayerTypeName(playerItem.type) }}
                          </span>
                          <span class="text-gray-300">•</span>
                          <span class="flex items-center">
                            <font-awesome-icon :icon="['fas','clock']" class="mr-1 text-gray-400" />
                            {{ playerItem.duration }} นาที
                          </span>
                          <span class="text-gray-300">•</span>
                          <span class="flex items-center">
                            <font-awesome-icon :icon="['fas','code']" class="mr-1 text-gray-400" />
                            {{ playerItem.slug }}
                          </span>
                        </div>
                      </div>
                    </div>

                    <!-- Action Buttons -->
                    <div class="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        @click.stop="deleteParentPlayer(playerItem._id)"
                        :disabled="!canDeleteFolder(playerItem)"
                        class="p-2 rounded transition-colors"
                        :class="canDeleteFolder(playerItem) 
                          ? 'text-gray-400 hover:text-red-600 hover:bg-red-50' 
                          : 'text-gray-300 cursor-not-allowed bg-gray-100'"
                        :title="canDeleteFolder(playerItem) 
                          ? 'ลบ' 
                          : 'ไม่สามารถลบได้ - โฟลเดอร์มีไอเทมอยู่ข้างใน'">
                        <font-awesome-icon 
                          :icon="['fas', canDeleteFolder(playerItem) ? 'trash' : 'lock']" 
                          class="text-sm" 
                        />
                      </button>
                      
                      <button 
                        @click.stop="togglePanel(index,playerItem)"
                        class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded transition-colors"
                        title="ตั้งค่า">
                        <font-awesome-icon 
                          :icon="['fas', computedSelectedPlayerIndex === index ? 'chevron-up' : 'chevron-down']" 
                          class="text-sm"
                        />
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Player Editor -->
                <div v-if="isOpenPanel(index)" class="border-t border-gray-200 bg-gray-50">
                  <PlayerEditor
                    v-if="selectedSubPlayerIndex === null"
                    :select-player-item="playerItem" 
                    @update-select-player-item="updataPlayer"
                    @update-player-video="updataVideo"
                    @update-player-document="updataDocument"
                    @update-player-exam="updataExam"
                    @update-player-video-url="SetContentSource" 
                    @cancel-update="hidePanel"
                    @delete-select-player-item="deletePlayer" 
                    @update-player-data="reloadPlayerData"
                  />
                </div>
              </template>
            </div>
            </draggable>
          </transition-group>
        
      </div>
    </div>

    <!-- Footer Section -->
    <div class="mt-8 p-4 bg-gray-50 border-t border-gray-200">
      <!-- Two Column Layout -->
      <div class="grid grid-cols-5 gap-6">
        <!-- Left Column (3/5) - Stats -->
        <div class="col-span-3">
          <h3 class="text-sm font-medium text-gray-700 mb-3">สถิติบทเรียน</h3>
          <div class="grid grid-cols-4 gap-3">
            <div class="bg-indigo-50 rounded-lg p-3 border border-indigo-100 h-16 flex flex-col justify-between">
              <div class="text-xs font-medium text-indigo-600">บทเรียนทั้งหมด</div>
              <div class="text-lg font-semibold text-indigo-900">{{ playerCount }}</div>
            </div>
            <div class="bg-green-50 rounded-lg p-3 border border-green-100 h-16 flex flex-col justify-between">
              <div class="text-xs font-medium text-green-600">โฟลเดอร์</div>
              <div class="text-lg font-semibold text-green-900">{{ folderCount }}</div>
            </div>
            <div class="bg-purple-50 rounded-lg p-3 border border-purple-100 h-16 flex flex-col justify-between">
              <div class="text-xs font-medium text-purple-600">เอกสาร</div>
              <div class="text-lg font-semibold text-purple-900">{{ documentCount }}</div>
            </div>
            <div class="bg-blue-50 rounded-lg p-3 border border-blue-100 h-16 flex flex-col justify-between">
              <div class="text-xs font-medium text-blue-600">วิดีโอ</div>
              <div class="text-lg font-semibold text-blue-900">{{ videoCount }}</div>
            </div>
          </div>
        </div>

        <!-- Right Column (2/5) - Settings -->
        <div class="col-span-2">
          <h3 class="text-sm font-medium text-gray-700 mb-3">การตั้งค่า</h3>
          
          <div class="grid grid-cols-2 gap-3">
            <!-- Master Data Reference (if applicable) -->
            <div v-if="!this.master && courseData.master!='none'" class="col-span-2 bg-gray-50 rounded-lg border border-gray-200 p-3">
              <div class="grid grid-cols-2 gap-3 items-center">
                <div class="flex items-center space-x-2">
                  <font-awesome-icon :icon="['fas','link']" class="text-gray-500 text-sm" />
                  <span class="text-xs font-medium text-gray-700">ใช้ข้อมูลบทเรียนจาก</span>
                </div>
                <select @change="changePlayerRef($event)" v-model="playerRef" class="block w-full rounded-lg border-gray-300 text-xs focus:border-indigo-500 focus:ring-indigo-500">
                  <option :value="courseData.master">Master Data</option>
                  <option :value="this.dataItem">หลักสูตรนี้</option>
                </select>
              </div>
            </div>

            <!-- Quick Actions -->
            <template v-if="this.master || courseData.master=='none'">
              <div class="bg-indigo-50 rounded-lg border border-indigo-100 p-3">
                <div class="text-center">
                  <div class="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <font-awesome-icon :icon="['fas','plus']" class="text-indigo-600 text-sm" />
                  </div>
                  <button 
                    @click="addPlayer('demand', playerCount, courseData.name)"
                    class="w-full inline-flex items-center justify-center rounded-lg border border-transparent bg-indigo-600 px-2 py-1 text-xs font-medium text-white shadow-sm hover:bg-indigo-700 transition-colors">
                    เพิ่มบทเรียน
                  </button>
                </div>
              </div>
              
              <div class="bg-yellow-50 rounded-lg border border-yellow-100 p-3">
                <div class="text-center">
                  <div class="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <font-awesome-icon :icon="['fas','folder-plus']" class="text-yellow-600 text-sm" />
                  </div>
                  <button 
                    @click="addPlayer('folder', playerCount, courseData.name)"
                    class="w-full inline-flex items-center justify-center rounded-lg border border-transparent bg-yellow-600 px-2 py-1 text-xs font-medium text-white shadow-sm hover:bg-yellow-700 transition-colors">
                    เพิ่มโฟลเดอร์
                  </button>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- Registration Form Section (for onsite courses) -->
    <div v-if="courseData.type==='onsite'" class="space-y-4">
      <div class="bg-white rounded-lg border border-gray-200 p-4">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <font-awesome-icon :icon="['fas','file-alt']" class="text-blue-600 text-sm" />
            </div>
            <div>
              <h3 class="text-base font-semibold text-gray-900">แบบฟอร์มการลงทะเบียน</h3>
              <p class="text-sm text-gray-500">จัดการแบบฟอร์มสำหรับการลงทะเบียนเข้าเรียน</p>
            </div>
          </div>
          
          <button
            @click="showPopup" 
            class="inline-flex items-center rounded-lg border border-transparent bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors">
            <font-awesome-icon :icon="['fas','plus']" class="text-white mr-1.5"/>
            เลือกแบบฟอร์ม 
          </button>
        </div>

        <!-- Current Form Display -->
        <div class="bg-gray-50 rounded-lg p-4">
          <template v-if="courseData.form !== undefined">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <font-awesome-icon :icon="['fas','file-alt']" class="text-blue-600" />
                </div>
                <div>
                  <h4 class="text-sm font-medium text-gray-900">{{ courseData.form.title }}</h4>
                  <p class="text-xs text-gray-500">แบบฟอร์มที่เลือกใช้</p>
                </div>
              </div>
              <router-link 
                :to="'/cms/form/' + courseData.form._id + '/' + courseData._id"
                class="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors">
                <font-awesome-icon :icon="['fas','users']" class="mr-1.5"/>
                ดูผู้ลงทะเบียน
              </router-link>
            </div>
          </template>
          <template v-else>
            <div class="text-center py-6">
              <font-awesome-icon :icon="['fas','file-plus']" class="text-gray-400 text-2xl mb-2" />
              <h4 class="text-sm font-medium text-gray-900 mb-1">ยังไม่มีแบบฟอร์ม</h4>
              <p class="text-xs text-gray-500">เลือกแบบฟอร์มการลงทะเบียนสำหรับหลักสูตรนี้</p>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- Form Selection Modal -->
<div v-if="showPopupWindow" class="fixed inset-0 flex items-center justify-center z-50">
  <div class="bg-black bg-opacity-50 absolute inset-0" @click="closePopup"></div>
  <div class="bg-white rounded-lg shadow-xl z-20 w-96 max-w-md mx-4">
    <div class="p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900">เลือกแบบฟอร์ม</h3>
        <button @click="closePopup" class="text-gray-400 hover:text-gray-600">
          <font-awesome-icon :icon="['fas','times']" />
        </button>
      </div>
      
      <div class="space-y-3 max-h-64 overflow-y-auto">
        <label v-for="item in listItems" :key="item._id" class="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
          <input type="radio" :value="item" v-model="selectedItem" class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 mr-3">
          <div class="flex-1">
            <div class="text-sm font-medium text-gray-900">{{ item.title }}</div>
            <div class="text-xs text-gray-500">แบบฟอร์มการลงทะเบียน</div>
          </div>
        </label>
      </div>
      
      <div class="flex justify-end space-x-3 mt-6">
        <button @click="closePopup" class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
          ยกเลิก
        </button>
        <button @click="updateForm" :disabled="!selectedItem" class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg">
          เลือกแบบฟอร์ม
        </button>
      </div>
    </div>
  </div>
</div>

</template>
<style src="@vueform/toggle/themes/default.css"></style>
<style scoped>
/* Modern Design Enhancements */
* {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Custom Scrollbar */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Card Hover Effects */
.card-hover {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-hover:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

/* Button Enhancements */
.btn-modern {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  border: 1px solid transparent;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.btn-modern:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.5);
}

.btn-modern:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.btn-primary-modern {
  background-color: #4f46e5;
  color: white;
}

.btn-primary-modern:hover {
  background-color: #4338ca;
}

.btn-secondary-modern {
  background-color: #6b7280;
  color: white;
}

.btn-secondary-modern:hover {
  background-color: #4b5563;
}

.btn-success-modern {
  background-color: #059669;
  color: white;
}

.btn-success-modern:hover {
  background-color: #047857;
}

.btn-danger-modern {
  background-color: #dc2626;
  color: white;
}

.btn-danger-modern:hover {
  background-color: #b91c1c;
}

/* Material Card Animations */
.material-card {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.material-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

/* Badge Styles */
.badge-modern {
  display: inline-flex;
  align-items: center;
  border-radius: 9999px;
  padding: 0.125rem 0.625rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.badge-primary-modern {
  background-color: #e0e7ff;
  color: #3730a3;
}

.badge-success-modern {
  background-color: #d1fae5;
  color: #065f46;
}

.badge-warning-modern {
  background-color: #fef3c7;
  color: #92400e;
}

.badge-danger-modern {
  background-color: #fee2e2;
  color: #991b1b;
}

.badge-info-modern {
  background-color: #dbeafe;
  color: #1e40af;
}

/* Loading States */
.loading-spinner {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* Gradient Backgrounds */
.gradient-bg {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
}

.gradient-bg-light {
  background: linear-gradient(135deg, #e0e7ff 0%, #f3e8ff 100%);
}

/* Animation Keyframes */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Utility Classes */
.animate-fade-in-up {
  animation: fadeInUp 0.6s ease-out;
}

.animate-fade-in-down {
  animation: fadeInDown 0.6s ease-out;
}

.animate-slide-in-right {
  animation: slideInRight 0.4s ease-out;
}

.animate-slide-in-left {
  animation: slideInLeft 0.4s ease-out;
}

.animate-pulse-custom {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Material Transitions */
.material-enter-active,
.material-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.material-enter-from {
  opacity: 0;
  transform: translateY(10px) scale(0.98);
}

.material-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.98);
}

.material-move {
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Sub Material Transitions */
.sub-material-enter-active,
.sub-material-leave-active {
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

.sub-material-enter-from {
  opacity: 0;
  transform: translateX(-5px) scale(0.99);
}

.sub-material-leave-to {
  opacity: 0;
  transform: translateX(5px) scale(0.99);
}

.sub-material-move {
  transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Legacy transitions for compatibility */
.flip-list-move {
  transition: transform 0.5s;
}

.flip-list-sub-move {
  transition: transform 0.5s;
}

.no-move {
  transition: transform 0s;
}

/* Override any conflicting styles */
[class*="ghost"] {
  opacity: 0.6 !important;
  background: #f8fafc !important;
  border: 2px dashed #94a3b8 !important;
  border-radius: 8px !important;
  transform: none !important;
}

.ghost {
  opacity: 0.6 !important;
  background: #f8fafc !important;
  border: 2px dashed #94a3b8 !important;
  border-radius: 8px !important;
  transform: none !important;
}

/* Force ghost styles with higher specificity */
.space-y-2 .ghost,
div.ghost,
.draggable-item.ghost {
  opacity: 0.6 !important;
  background: #f8fafc !important;
  border: 2px dashed #94a3b8 !important;
  border-color: #94a3b8 !important;
  border-style: dashed !important;
  border-width: 2px !important;
}

/* Enhanced ghost for better visual feedback */
.ghost {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
  filter: grayscale(50%) !important;
}

/* Better styling for dragged items */
.drag {
  opacity: 0.9 !important;
  background: #ffffff !important;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15) !important;
  z-index: 1000 !important;
  transform: rotate(2deg) scale(1.02) !important;
  border: 1px solid #3b82f6 !important;
  border-radius: 8px !important;
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

/* Responsive Design */
@media (max-width: 768px) {
  .mobile-stack {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .mobile-full {
    width: 100%;
  }
  
  .mobile-text-sm {
    font-size: 0.875rem;
  }
  
  .mobile-p-3 {
    padding: 0.75rem;
  }
}

/* Focus States */
.focus-ring:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.5);
}

/* Text Utilities */
.prose {
  color: #374151;
  line-height: 1.625;
}

.prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6 {
  color: #111827;
  font-weight: 600;
}

.prose p {
  margin-bottom: 1rem;
}

.prose ul, .prose ol {
  margin-bottom: 1rem;
  padding-left: 1.5rem;
}

.prose li {
  margin-bottom: 0.5rem;
}

.prose a {
  color: #4f46e5;
  text-decoration: underline;
}

.prose a:hover {
  color: #3730a3;
}

/* Material specific styles */
.material-icon {
  width: 3rem;
  height: 3rem;
  background-color: #e0e7ff;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.material-icon svg {
  color: #4f46e5;
  font-size: 1.125rem;
}

/* Enhanced Material Stats */
.material-stat-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.material-stat-badge.has-content {
  background-color: #d1fae5;
  color: #065f46;
}

.material-stat-badge.no-content {
  background-color: #f3f4f6;
  color: #4b5563;
}

.material-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.125rem 0.625rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.material-badge.video {
  background-color: #dbeafe;
  color: #1e40af;
}

.material-badge.document {
  background-color: #d1fae5;
  color: #065f46;
}

.material-badge.exam {
  background-color: #fef3c7;
  color: #92400e;
}

.material-badge.folder {
  background-color: #fef3c7;
  color: #92400e;
}

.material-stats {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.material-stat-item {
  display: flex;
  align-items: center;
}

.material-stat-item svg {
  margin-right: 0.25rem;
}

.material-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.material-action-group {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.material-action-button {
  display: inline-flex;
  align-items: center;
  padding: 0.375rem 0.75rem;
  border: 1px solid;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.material-action-button.edit {
  color: #4b5563;
  background-color: white;
  border-color: #e5e7eb;
}

.material-action-button.edit:hover {
  background-color: #f9fafb;
}

.material-action-button.delete {
  color: #dc2626;
  background-color: #fef2f2;
  border-color: #fecaca;
}

.material-action-button.delete:hover {
  background-color: #fee2e2;
}

/* Empty state styles */
.empty-state {
  text-align: center;
  padding: 3rem 0;
}

.empty-state-icon {
  width: 4rem;
  height: 4rem;
  background-color: #f3f4f6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
}

.empty-state-icon svg {
  color: #9ca3af;
  font-size: 1.5rem;
}

.empty-state-title {
  font-size: 1.125rem;
  font-weight: 500;
  color: #111827;
  margin-bottom: 0.5rem;
}

.empty-state-description {
  color: #6b7280;
  margin-bottom: 1.5rem;
}

/* Info banner styles */
.info-banner {
  background-color: #eff6ff;
  border-left: 4px solid #3b82f6;
  padding: 1rem;
}

.info-banner-content {
  display: flex;
}

.info-banner-icon {
  flex-shrink: 0;
}

.info-banner-icon svg {
  color: #3b82f6;
}

.info-banner-text {
  margin-left: 0.75rem;
}

.info-banner-text p {
  font-size: 0.875rem;
  color: #1e40af;
}

/* TinyMCE Styles */
.tox-tinymce {
  border: 0px !important;
  border-radius: 0px !important;
}

/* No Transition Class */
.no-transition {
  transition-property: none !important;
}

/* Responsive Design */
@media (min-width: 768px) {
  #tab-list {
    display: flex;
  }
  #tab-dropdown {
    display: none;
  }
}

@media (max-width: 767px) {
  #tab-list {
    display: none;
  }
  #tab-dropdown {
    display: block;
  }
}

/* Modern Card Hover Effects */
.group:hover .opacity-0 {
  opacity: 1;
}

/* Gradient Backgrounds */
.bg-gradient-to-br {
  background-image: linear-gradient(to bottom right, var(--tw-gradient-stops));
}

/* Dark Mode Support */
@media (prefers-color-scheme: dark) {
  .dark-mode {
    background-color: #111827;
    color: white;
  }
  
  .dark-mode .card {
    background-color: #1f2937;
    border-color: #374151;
  }
  
  .dark-mode .btn-secondary-modern {
    background-color: #374151;
  }
  
  .dark-mode .btn-secondary-modern:hover {
    background-color: #4b5563;
  }
}

/* Print Styles */
@media print {
  .no-print {
    display: none !important;
  }
  
  .print-break {
    page-break-before: always;
  }
  
  .print-avoid-break {
    page-break-inside: avoid;
  }
}

/* High Contrast Mode */
@media (prefers-contrast: high) {
  .high-contrast {
    border: 2px solid black;
  }
  
  .high-contrast button {
    border: 2px solid black;
  }
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Aspect Ratio Utilities */
.aspect-video {
  aspect-ratio: 16 / 9;
}

.aspect-square {
  aspect-ratio: 1 / 1;
}

/* Shadow Utilities */
.shadow-soft {
  box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 1px 2px -1px rgba(0, 0, 0, 0.06);
}

.shadow-medium {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

/* Hover Effects */
.hover-lift {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

/* Loading States */
.loading {
  opacity: 0.6;
  pointer-events: none;
}

.loading::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 20px;
  height: 20px;
  margin: -10px 0 0 -10px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* Simple Drag and Drop Styles */
.chosen {
  background: #f0f9ff !important;
  border: 2px solid #0ea5e9 !important;
  box-shadow: 0 4px 12px rgba(14, 165, 233, 0.15) !important;
  transform: scale(1.01) !important;
}

.drag {
  opacity: 0.9 !important;
  background: #ffffff !important;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15) !important;
  z-index: 1000 !important;
  transform: rotate(2deg) scale(1.02) !important;
  border: 1px solid #3b82f6 !important;
  border-radius: 8px !important;
}

/* Uniform ghost appearance - keeps original content but changes style */
.ghost {
  opacity: 0.6 !important;
  background: #f8fafc !important;
  border: 2px dashed #94a3b8 !important;
  border-radius: 8px !important;
  transform: none !important;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
  filter: grayscale(50%) !important;
}

/* Handle Styles */
.handle {
  cursor: grab;
  transition: background-color 0.2s ease;
}

.handle:hover {
  background-color: #f3f4f6;
}

.handle:active {
  cursor: grabbing;
}

/* Dropzone Styles */
.dropzone {
  position: relative;
  overflow: hidden;
}

.dropzone::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, transparent 0%, rgba(251, 191, 36, 0.1) 50%, transparent 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.dropzone:hover::before {
  opacity: 1;
}

.dropzone.border-yellow-500::before {
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.2) 0%, rgba(245, 158, 11, 0.3) 50%, rgba(251, 191, 36, 0.2) 100%);
  opacity: 1;
}
</style>
