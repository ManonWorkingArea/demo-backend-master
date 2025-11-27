<template>
  <section aria-labelledby="notes-title" v-if="courseData.type!='onsite'" id="root-panel">
    <div class="sm:overflow-hidden sm:rounded-lg">
      <div class="divide-y divide-gray-200">
        
        <div class="px-4 py-5 sm:px-6 relative">
          <h2 id="notes-title" class="text-lg font-bold text-gray-900"><font-awesome-icon :icon="['fas','book']" class="text-black mr-2"/> บทเรียน ({{playerCount}}) </h2>

          <div class="absolute top-4 right-4 ml-3 inline-flex items-center ">

            <button 
            @click="addPlayer('demand', playerCount, courseData.name)"
            type="button" 
            class="ml-3 inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
            <font-awesome-icon :icon="['fas','plus']" class="text-white pr-1"/> บทเรียน
            </button>

            <button 
            @click="addPlayer('folder', playerCount, courseData.name)"
            type="button" 
            class="ml-3 inline-flex items-center rounded-md border border-transparent bg-yellow-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
            <font-awesome-icon :icon="['fas','folder-plus']" class="text-white pr-1"/> โฟลเดอร์
            </button>

          </div>

        </div>

        <!---  Set : Use Ref Player Data ---->

        <div v-if="!this.master && courseData.master!='none'" class="flex items-center justify-between lg:flex lg:items-center lg:justify-between pl-5 pr-5 pt-1 pb-1 bg-gray-50">
          <div class="min-w-0 flex-1">ใช้ข้อมูลบทเรียนจาก</div>
          <div class="mt-0 flex lg:mt-0 lg:ml-4">
            <span class="sm:ml-3">
              <div>
                <select @change="changePlayerRef($event)" v-model="playerRef" class="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm">
                  <option :value="courseData.master">Master Data</option>
                  <option :value="this.dataItem">หลักสูตรนี้</option>
                </select>
              </div>
            </span>
          </div>
        </div>

        <!---  Set : Use Ref Player Data ---->

        <div class="px-4 py-3 sm:px-3 bg-blue-50" :data-content="activeBlock_text" :class="[(activeBlock?'isblock' : 'isunblock')]" >

          <draggable
          role="list_parent" class="space-y-1"
          tag="ul"
          :list="playerParent"
          handle=".handle"
          v-bind="dragOptions"
          @change="log"
          :move="checkMove"
          @start="isDragging = true"
          @end="isDragging = false" >

            <transition-group type="transition" name="flip-list">
              
              <template v-for="(playerItem,index) in playerParent" :key="playerItem.id">

                <!--------  Player Type : Folder  ------->

                <template v-if="playerItem.type==='folder'&&playerItem.mode!='sub'" > 

                  <li class="px-2 py-3 b-1 bot border-gray-200 bg-orange-50 border-[1px] cursor-pointer"
                  @click="togglePanel(index,playerItem)"
                  :id="`panel-${index}`"
                  :class="{ 
                    'border-gray-300': selectedPlayerIndex === index, 
                    'mb-[4px]': selectedPlayerIndex === index, 
                    'border-[1px]': selectedPlayerIndex === index, 
                    'hover:bg-gray-50 hover:border-gray-200': selectedPlayerIndex !== index,
                    'shadow-lg': selectedPlayerIndex === index,
                    'opacity-10': selectedPlayerIndex !== null && selectedPlayerIndex !== index,
                    'pointer-events-none': selectedPlayerIndex !== null && selectedPlayerIndex !== index
                  }"
                  >
                
                    <div class="flex space-x-3 border-b border-gray-200 pb-3 mb-3 border-dashed">
                      <div class="flex-shrink-0">
                        <Tooltip title="ลากเพื่อจัดลำดับ" size="12">
                          <button 
                          type="button" 
                          class="cursor-move font-medium text-gray-900 handle mr-3 relative top-[-5px]">
                          <font-awesome-icon :icon="['fas','align-justify']" class="text-gray-500"/> 
                          </button>
                        </Tooltip>
                        <font-awesome-icon :icon="['fas','folder']" class="text-yellow-500 text-2xl"/>
                      </div>
                      <div>
                        <div class="text-sm">
                          <div class="text-base font-normal text-gray-900">{{playerItem.name}} - xxx</div>
                        </div>
                        <div class="mt-1 text-sm text-gray-400">
                          <span>รหัส : <span class="font-bold text-indigo-300">{{playerItem.slug}}</span></span>
                          <span class="font-medium text-gray-500 mr-3 ml-3">&middot;</span>
                          <span>ประเภท : <span class="font-bold text-indigo-300">{{getPlayerTypeName(playerItem.type)}}</span></span>
                        </div>

                      </div>
                    </div>

                    <div class="mt-2 space-x-2 text-sm">

                      <span>
                        <button 
                          @click.stop="addPlayer('demand', playerFolder[playerItem._id] ? playerFolder[playerItem._id].length : 0, courseData.name + ' - ' + playerItem.name, playerItem._id)"
                          type="button"
                          class="font-medium text-gray-900 mr-3"
                        >
                          <font-awesome-icon :icon="['fas', 'plus']" class="text-gray-500"/> เพิ่มบทเรียนย่อย
                        </button>
                      
                        <span class="font-medium text-gray-500 mr-3">&middot;</span>
                      
                        <button 
                          @click.stop="deleteParentPlayer(playerItem._id)"
                          :disabled="playerFolder[playerItem._id] && playerFolder[playerItem._id].length > 0"
                          :style="{ opacity: playerFolder[playerItem._id] && playerFolder[playerItem._id].length > 0 ? '0.5' : '1' }"
                          type="button"
                          class="font-medium text-gray-900 mr-3"
                        >
                          <font-awesome-icon :icon="['fas', 'trash']" class="text-gray-500"/> ลบ
                        </button>
                      </span>
                      

                    </div>

                    <!--------  Render Sub Item  ------->

                    <div class="mt-2 space-x-2 w-full text-sm bot rounded-md border-[1px] overflow-hidden rounded-md border border-gray-150 bg-white"> 

                      <draggable
                        role="list_child" class="divide-y divide-gray-150"
                        tag="ul"
                        :list="playerFolder[playerItem._id]"
                        handle=".handle-sub"
                        v-bind="dragOptions"
                        @change="log_sub(playerItem._id)"
                        :move="checkMove"
                        @start="isDragging = true"
                        @end="isDragging = false"
                      >
                        <transition-group type="transition" name="flip-list">

                        <li v-for="(subItem,subIndex) in this.playerFolder[playerItem._id]" :key="subItem._id" @click.stop="toggleSubPanel(index, subIndex)" class="no-transition px-3 py-2 text-gray-600 hover:bg-gray-50">

                          <font-awesome-icon :icon="['fas','align-justify']" class="cursor-move text-gray-200 mr-3 handle-sub hover:text-gray-400"/>

                          <!-- <button @click="$router.push('/lesson/player/detail/' + subItem._id)" class="font-medium text-sm text-gray-600 hover:text-indigo-600 hover:font-bold">{{subItem.name}}</button> -->
                          <button  class="font-medium text-sm text-gray-600"> <span class="font-medium text-gray-500 mr-2">

                            <font-awesome-icon
                              :icon="getIconForSubItem(subItem.type)"
                              :class="subItem.video === undefined || 
                              subItem.video === '' || 
                              subItem.video === null || 
                              Object.keys(subItem.video).length === 0 ? 'text-rose-600' : 'text-lime-600'"
                            />

                          </span>{{subItem.name}} - xxx</button>

                          <span class="float-right">
                            
                            <button 
                            @click.stop="deleteParentPlayer(subItem._id)"
                            type="button" class="font-medium text-gray-500 mr-3 hover:text-gray-700">
                            <font-awesome-icon :icon="['fas','trash']" class="text-gray-500"/> ลบ
                            </button>

                          </span>
                          <div class="border border-gray-200 no-transition mt-2" v-if="isOpenSubPanel(index, subIndex)">
                            <PlayerEditor 
                            :select-player-item="subItem" 
                            @update-select-player-item="updataPlayer"
                            @update-player-video="updataVideo"
                            @update-player-document="updataDocument"
                            @update-player-exam="updataExam"
                            @update-player-video-url="SetContentSource"
                            @delete-select-player-item="deletePlayer" 
                            @cancel-update="hideSubPanel"
                            />
                          </div>
                        </li>

                      </transition-group>
                    </draggable>

                    </div>

                    <!--------  Render Sub Item  ------->

                  </li>
                  
                </template>

                <!--------  Player Type : Standard  ------->

                <template v-if="playerItem.type!='folder'&&playerItem.mode!='sub'">

                  <li 
                  class="p-5 b-1 bot border-gray-200 bg-white cursor-pointer border-[1px]"
                  :id="`panel-${index}`"
                  :class="{ 
                    'border-gray-300': selectedPlayerIndex === index, 
                    'mb-[4px]': selectedPlayerIndex === index, 
                    'border-[1px]': selectedPlayerIndex === index, 
                    'hover:bg-gray-50 hover:border-gray-200': selectedPlayerIndex !== index,
                    'shadow-lg': selectedPlayerIndex === index,
                    'opacity-10': selectedPlayerIndex !== null && selectedPlayerIndex !== index,
                    'pointer-events-none': selectedPlayerIndex !== null && selectedPlayerIndex !== index
                  }"
                  >
                
                    <div class="flex space-x-3" @click.stop="togglePanel(index,playerItem)">
                      <Tooltip title="ลากเพื่อจัดลำดับ" size="12">
                        <button
                        @click.stop
                        type="button" 
                        class="cursor-move font-medium text-gray-900 handle mr-3 relative top-[-5px]">
                        <font-awesome-icon :icon="['fas','align-justify']" class="text-gray-500"/> 
                        </button>
                      </Tooltip>

                      <div class="flex-shrink-0">
                        <img class="h-10 w-10 object-cover" :src="playerItem.cover || playerItem.thumbnail || 'https://dummyimage.com/800x600/ededed/303030.png&text=++++++COVER+++++'" alt="">
                      </div>

                      <div class="w-full">
                        <div class="text-sm">
                          
                          <span>
                            <div  class="font-bold text-gray-900">
                              <span class="font-medium text-gray-500 mr-2">
                                <font-awesome-icon
                                :icon="getIconForSubItem(playerItem.type)"
                                :class="getClassForTypeAndData(playerItem.type, playerItem)"
                                />
                              </span>
                              {{playerItem.name}} - xxx
                            </div>

                            <button 
                            @click.stop="deleteParentPlayer(playerItem._id)" 
                            type="button" class="font-medium text-gray-900 mr-3 float-right">
                            <font-awesome-icon :icon="['fas','trash']" class="text-gray-500"/> ลบ
                            </button>

                          </span>

                          <!-- <span v-else>
                            <button class="font-bold text-gray-900">{{playerItem.name}}</button>
                          </span> -->

                        </div>
                        <div class="mt-1 text-sm text-gray-400">
                          <span>รหัส : <span class="font-bold text-indigo-300">{{playerItem.slug}}</span></span>
                          <span class="font-medium text-gray-200">|</span> 
                          <span>ประเภท : <span class="font-bold text-indigo-300">{{ getPlayerTypeName(playerItem.type) }}</span></span>
                          <span class="font-medium text-gray-200">|</span> 
                          <span>ความยาว : <span class="font-bold text-indigo-300">{{playerItem.duration}}</span> นาที</span>
                        </div>
                        
                      </div>
                    </div>
                    
                  </li>
                  
                </template>

                <div class="border border-gray-200 no-transition top-[-5px] relative" 
                  v-if="isOpenPanel(index)" 
                  :class="
                  { 
                    'border-gray-300': selectedPlayerIndex === index, 
                    'mb-[4px]': selectedPlayerIndex === index, 
                    'border-[1px]': selectedPlayerIndex === index,
                    'shadow-md': selectedPlayerIndex === index,
                  }"
                  >

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
                  />
                    
                </div>
                
              </template>
              
            </transition-group>

          </draggable>

        </div>
      </div>
    </div>
</section>
</template>

<script>
import {mode, display, kind, player, exam} from "@/master/type";
import { ref } from 'vue';
// Component
import feather from 'feather-icons';
import { VueDraggableNext } from 'vue-draggable-next'
import storageManager from '@/plugins/storage';
import { Tooltip } from '@programic/vue3-tooltip';
import convertUtils from "@/plugins/convertUtils";

import PlayerEditor from '@/interface/template/PlayerEditor.vue';

import debug from '@/plugins/Logger.js';

import moment from 'moment';
moment().format();

// S3 Config
import { S3 } from "@aws-sdk/client-s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";

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
      courseData: Object,
      playerCount: Number,
      playerParent: String
    },
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
        configs: storageManager.get('configs'),
        refreshKey: 0,
        S3: s3Client,
        schoolSession: schoolSession,
        masterDataRecord:[],
        contentType:[],
        courseCategory: [],
        playerData: [],
        examData: [],
        categoryData:[],
        documentData: [],
        documentCount:'0',
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
        tabs: [
          {
            code: "detail",
            icon: 'home',
            shortname: "Detail",
            name: "รายละเอียด",
            description: "Personal details and application.",
          },
          {
            code: "material",
            icon: 'book',
            shortname: "Course",
            name: "บทเรียน",
            description: "Asset details.",
          },
          {
            code: "contest",
            icon: 'square-check',
            shortname: "Quize",
            name: "แบบทดสอบ",
            description: "Asset details.",
          },
          {
            code: "document",
            icon: 'file',
            shortname: "File",
            name: "เอกสาร",
            description: "Admin settings.",
          },
          {
            code: "enroll",
            icon: 'user',
            shortname: "Enroll",
            name: "ผู้เรียน",
            description: "Storage information.",
          }
        ]
      }
    },
    components: {
      Tooltip,
      draggable: VueDraggableNext,
      PlayerEditor,
    },
    computed: {
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
      setActiveTab(tabCode) {
        this.activeTab = tabCode;
        window.location.hash = `#${tabCode}`;
      },
      openModal() {
        this.modalOpen = true;
        this.filteredResults = [];
      },
      async closeModal() {
        this.modalOpen = false;
        this.searchQuery = "";
      },
      async getCourseAdmin() {
        try {
          const adminIds = this.courseData.admin;

          // Check if adminIds is an array or can be converted into one
          if (!Array.isArray(adminIds)) {
            //console.error('adminIds is not an array or cannot be iterated.');
            return; // You can return or handle the error gracefully here
          }

          const adminList = [];

          for (const adminId of adminIds) {
            const resAPI = await fetch(`https://gateway.cloudrestfulapi.com/api/user/${adminId}`, {
              method: 'GET',
              headers: { 'Content-Type': 'application/json', 'client-token-key': this.configs.key },
            });
            const RestReturn = await resAPI.json();
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

          const resAPI = await fetch(`https://gateway.cloudrestfulapi.com/api/user/aggregate`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json','client-token-key':this.configs.key
            },
            body: JSON.stringify({ pipeline })
          });

          const RestReturn = await resAPI.json();

          if (resAPI.status === 200) {
            // Check if there is data in paginatedData and totalCount
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

              // Create a new array by filtering items in filteredResults
              this.filteredResults = this.filteredResults.filter(result => {
                // Check if the _id exists in filteredAdmin
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
          // Clone the existing admin array or create a new empty array if it doesn't exist
          const admin = this.courseData.admin ? [...this.courseData.admin] : [];

          // Add the new user._id to the admin array
          admin.push(user._id);

          // Send a PUT request to update the course data with the new admin array
          const callApi = await fetch("https://gateway.cloudrestfulapi.com/api/course/" + this.dataItem, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json','client-token-key':this.configs.key },
            body: JSON.stringify({
              data: {
                admin: admin,
              },
              options: {}
            })
          });
          await callApi.json();

          if (callApi.status === 200) {
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
          // Clone the existing admin array or create a new empty array if it doesn't exist
          const admin = this.courseData.admin ? [...this.courseData.admin] : [];

          // Find the index of the user._id in the admin array
          const index = admin.indexOf(user._id);

          // If the user._id is found, remove it from the admin array
          if (index !== -1) {
            admin.splice(index, 1);
          }

          // Send a PUT request to update the course data with the updated admin array
          const callApi = await fetch("https://gateway.cloudrestfulapi.com/api/course/" + this.dataItem, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json','client-token-key':this.configs.key },
            body: JSON.stringify({
              data: {
                admin: admin,
              },
              options: {}
            })
          });
          await callApi.json();

          if (callApi.status === 200) {
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
          const mode    = main ? 'sub' : main;
          let order     = ('0' + (parseInt(count+1))).slice(-2)
          const resAPI  = await fetch("https://gateway.cloudrestfulapi.com/api/player", {
            method: 'POST',
            headers: {'Content-Type': 'application/json','client-token-key':this.configs.key},
            body: JSON.stringify({
              data: {
                "courseId": this.courseData.master,
                "root":main,
                "mode": mode,
                "type":type,
                "name":'บทเรียนสำหรับ ' + name + ' - ' + order,
                "order":order,
                "duration":'00:00:00',
              },
              options: {}
            })
          });
          debug.log(resAPI);
          await this.getQueryData();
        } catch (error) {
          debug.log(error)
        }
      },
      async removeVideo() {
        try {
          const callApi = await fetch("https://gateway.cloudrestfulapi.com/api/player/" + this.selectPlayerItem._id, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json','client-token-key':this.configs.key},
            body: JSON.stringify({
              data: {"video":{}}
            })
          });
          await callApi.json();

          if(callApi.status===200) {
            this.selectedPlayerIndex  = null;
            this.selectPlayerItem     = [];
            await this.getQueryData();
          }
        } catch (error) {
        debug.log(error)
        }
      },
      async updataVideo(updatedItem) {
        try {
          const callApi = await fetch("https://gateway.cloudrestfulapi.com/api/player/" + updatedItem.id, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json','client-token-key':this.configs.key},
            body: JSON.stringify({
              data: {
                "video":{
                  "desktop":updatedItem.file,
                  "mobile":updatedItem.file
                },
                "duration":this.formatDuration(updatedItem.duration),
                "thumbnail":updatedItem.thumbnail
              },
              options: {}
            })
          });
          await callApi.json();
          if(callApi.status===200) {
            await this.getQueryData();
          }
        } catch (error) {
        debug.log(error)
        }
      },
      async updataDocument(updatedItem) {
        try {
          const callApi = await fetch("https://gateway.cloudrestfulapi.com/api/player/" + updatedItem.id, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json','client-token-key':this.configs.key},
            body: JSON.stringify({
              data: {
                "content":updatedItem.file
              },
              options: {}
            })
          });
          await callApi.json();
          if(callApi.status===200) {
            await this.getQueryData();
          }
        } catch (error) {
        debug.log(error)
        }
      },
      async updataExam(updatedItem) {
        try {
          const callApi = await fetch("https://gateway.cloudrestfulapi.com/api/player/" + updatedItem.id, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json','client-token-key':this.configs.key},
            body: JSON.stringify({
              data: {
                "content":updatedItem.questions
              },
              options: {}
            })
          });
          await callApi.json();
          if(callApi.status===200) {
            await this.getQueryData();
          }
        } catch (error) {
        debug.log(error)
        }
      },
      async updataPlayer(updatedItem) {
        try {
          const callApi       = await fetch("https://gateway.cloudrestfulapi.com/api/player/" + updatedItem.id, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json','client-token-key':this.configs.key
            },
            body: JSON.stringify({
              data: {
                "name":updatedItem.name,
                "description":updatedItem.description,
                "duration":updatedItem.duration,
                "type":updatedItem.type,
                "demo":updatedItem.demo,
                "visible":updatedItem.visible,
              }
            })
          });
          await callApi.json();

          if(callApi.status===200) {
            await this.getQueryData();
          }
        } catch (error) {
        debug.log(error)
        }
      },
      async SetContentSource(updatedItem) {
        const apiUrl = `https://gateway.cloudrestfulapi.com/api/player/${updatedItem.id}`;

        console.log("SetContentSourc B",updatedItem);



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

          const callApi = await fetch(apiUrl, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json','client-token-key':this.configs.key},
            body: JSON.stringify(requestBody),
          });

          await callApi.json();

          if (callApi.status === 200) {
            await this.getQueryData();
          }
        } catch (error) {
          debug.log(error);
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

          const endpointURL = "https://gateway.cloudrestfulapi.com/api/enroll/count";
          const payload = {
            args: [
              {
                $and: [
                  { courseID: this.dataItem }
                ]
              }
            ]
          };
          const resAPI = await fetch(endpointURL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json','client-token-key':this.configs.key },
            body: JSON.stringify(payload)
          });
          const response = await resAPI.json();
          this.enrollCount = response.count
        } catch (error) {
          console.error("An error occurred while fetching score count:", error);
        }
      },
      async fetchScorePassCount() {
        try {

          const endpointURL = "https://gateway.cloudrestfulapi.com/api/enroll/count";
          const payload = {
            args: [
              {
                courseID: this.dataItem,"analytics.post.message": "ผ่านการรับรอง"
              }
            ]
          };
          const resAPI = await fetch(endpointURL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json','client-token-key':this.configs.key },
            body: JSON.stringify(payload)
          });
          const response = await resAPI.json();
          this.passCount = response.count
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
          const resAPI = await fetch(`https://gateway.cloudrestfulapi.com/api/${this.endpoint}/aggregate`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json','client-token-key':this.configs.key
            },
            body: JSON.stringify({ pipeline })
          });

          if(resAPI.status===200) {

            RestReturn = await resAPI.json();

            if (RestReturn && RestReturn.length > 0) {
              const returnData      = this.processingData(RestReturn);
              this.masterDataRecord = returnData;
              this.resetData();

              // Assign Data
              this.playerData   = returnData.formattedData.players ?? null;
              this.examData     = returnData.formattedData.exam ?? null;
              this.documentData = returnData.formattedData.document ?? null;

              this.playerChild  = returnData.playerParentChild;
              this.playerFolder = returnData.playerParentFolder;

              if(this.masterDataRecord) {
                this.playerData.sort(function(a,b){return a.order < b.order ? -1 : 1});
                this.playerChild.sort(function(a,b){return a.order < b.order ? -1 : 1});
              }

              this.playerParentCount  = this.playerParent.length
              this.playerChildCount   = this.playerChild.length

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
        this.examData = null;
        this.documentData = null;
        this.playerChild = [];
        this.playerFolder = [];
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
          const callApi       = await fetch("https://gateway.cloudrestfulapi.com/api/"+this.endpoint+"/" + this.dataItem, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json','client-token-key':this.configs.key},
            body: JSON.stringify({
              data: {
                "cover":cover,
              },
              options: {}
            })
          });
          await callApi.json();

          if(callApi.status===200) {
            this.cover = cover
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
          const callApi  = await fetch("https://gateway.cloudrestfulapi.com/api/"+this.endpoint+"/" + this.dataItem, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json','client-token-key':this.configs.key},
            body: JSON.stringify({
              data: {
                "status":this.status,
              },
              options: {}
            })
          });
          await callApi.json();

          if(callApi.statu===200) {
            debug.log("Update Status");
          }
        } catch (error) {
        debug.log(error)
        }
      },
      async toggleVisibility() {
        try {
          const callApi       = await fetch("https://gateway.cloudrestfulapi.com/api/"+this.endpoint+"/" + this.dataItem, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json','client-token-key':this.configs.key},
            body: JSON.stringify({
              data: {
                "visibility":this.visibility,
              },
              options: {}
            })
          });
          await callApi.json();

          if(callApi.status===200) {
            debug.log("Update Sync");
          }
        } catch (error) {
        debug.log(error)
        }
      },
      async changePlayerRef() {
        try {
          debug.log(this.playerRef);
          
          const callApi       = await fetch("https://asia-southeast2-elearning-6871c.cloudfunctions.net/"+this.endpoint+"/" + this.dataItem, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json','Authorization': 'Bearer ' + this.accessToken},
            body: JSON.stringify({
              "playerRef":this.playerRef,
            })
          });
          const finalRes   = await callApi.json();

          if(finalRes.success) {
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
          
          const callApi       = await fetch("https://asia-southeast2-elearning-6871c.cloudfunctions.net/"+this.endpoint+"/" + this.dataItem, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json','Authorization': 'Bearer ' + this.accessToken},
            body: JSON.stringify({
              "examRef":this.examRef,
            })
          });
          const finalRes   = await callApi.json();

          if(finalRes.success) {
            debug.log("Update examRef");
            location.reload()
          }
        } catch (error) {
        debug.log(error)
        }
      },
      async unlinkMaster() {
        try {
          const callApi       = await fetch("https://asia-southeast2-elearning-6871c.cloudfunctions.net/"+this.endpoint+"/" + this.dataItem, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json','Authorization': 'Bearer ' + this.accessToken},
            body: JSON.stringify({
              "master":"none",
              "examRef":this.dataItem,
              "playerRef":this.dataItem,
            })
          });
          const finalRes   = await callApi.json();

          if(finalRes.success) {
            debug.log("Update Unline Master");
            location.reload()
          }
        } catch (error) {
        debug.log(error)
        }
      },
      async deleteParentPlayer(id) {
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
              this.confirmDeletePlayer(id);
            } else {
              debug.log("Cancel");
            }
          });
        } catch (error) {
          debug.log(error)
        }
      },
      async confirmDeletePlayer(id) {
        try {
          const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/player/" + id, {
            method: 'DELETE',
            headers: {'Content-Type': 'application/json','client-token-key':this.configs.key},
          });
          const finalRes   = await resAPI.json();
          if(resAPI.status===200) {
            await this.getQueryData();
            debug.log(finalRes);
          }
        } catch (error) {
          debug.log(error)
        }
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
      async confirmDeleteExam(id,index) {
          if(this.login) {
            try {
              const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/exam/" + id, {
                method: 'DELETE',
                headers: {'Content-Type': 'application/json','client-token-key':this.configs.key},
              });
              await resAPI.json();
              if(resAPI.status===200) {
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
      async reOrderPlayer(id,order) {
        if(this.login) {
            try {
              const callApi       = await fetch("https://gateway.cloudrestfulapi.com/api/player/" + id, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json','client-token-key':this.configs.key},
                body: JSON.stringify({
                  data: {
                    "order":order,
                  },
                  options: {}
                })
              });
              const finalRes   = await callApi.json();

              if(finalRes.success) {
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
          const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/post/query", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json','client-token-key':this.configs.key },
            body: JSON.stringify({
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
            }),
          });
          const RestReturn = await resAPI.json();
          this.listItems = RestReturn.data;
          debug.log(this.listItems);
          this.loading_sources = true;
        } catch (error) {
          debug.log(error);
        }
      },
      async updataForm(form) {
          if(this.login) {
              try {
                const callApi = await fetch("https://gateway.cloudrestfulapi.com/api/"+this.endpoint+"/" + this.dataItem, {
                  method: 'PUT',
                  headers: {'Content-Type': 'application/json','client-token-key':this.configs.key},
                  body: JSON.stringify({
                    data: {
                      "form":form,
                    },
                    options: {}
                  })
                });
                await callApi.json();

                if(callApi.status===200) {
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
