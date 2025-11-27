<script>

// Plugin
import Loader from '@/interface/template/Loader.vue';
import storageManager from '@/plugins/storage';
import { translate } from '@/plugins/language.js';

import requestClient from '@/plugins/requestClient';
const Request = new requestClient(false);

import debug from '@/plugins/Logger.js';
import HRService from '@/services/HRService.js';

export default {
    
    data() {
        const session = storageManager.get('session');
        return {
          hostkey:this.$Key,
          color: "",
          session: session,
          loading_sources: true,
          activeBlock: false,
          sessionList: [],
          sessionId: "",
          sessionActive: session.current || "none",
          dataContentMessage: "",
          hoveredSession: null,
        }
    },
    components: {
        Loader
    },
    methods: {
      translate,
      
      // Transform ERP user data: รวม permissions ของ module เดียวกัน
      transformERPUserData(erpUser) {
        if (!erpUser || !erpUser.job_assignments) {
          return erpUser;
        }
        
        const transformedUser = { ...erpUser };
        
        // Transform แต่ละ job_assignment
        transformedUser.job_assignments = erpUser.job_assignments.map(job => {
          if (!job.permissions || !Array.isArray(job.permissions)) {
            return job;
          }
          
          // Group permissions by module
          const permissionsByModule = {};
          
          job.permissions.forEach(perm => {
            const module = perm.module;
            
            if (!permissionsByModule[module]) {
              permissionsByModule[module] = {
                module: module,
                menus: []
              };
            }
            
            // เพิ่ม menu เข้าไปใน module
            permissionsByModule[module].menus.push({
              menu_key: perm.menu_key,
              menu_title: perm.menu_title || perm.menu_key,
              read: perm.read || false,
              write: perm.write || false,
              visible: perm.visible !== false // default true
            });
          });
          
          // แปลง object เป็น array
          const groupedPermissions = Object.values(permissionsByModule);
          
          return {
            ...job,
            permissions: groupedPermissions
          };
        });
        
        return transformedUser;
      },
      
      // เช็คและดึงข้อมูล ERP user ตาม plugins
      async updateERPMode(siteData) {
        try {
          storageManager.delete('erp'); // ลบเก่าก่อน
          
          const plugins = siteData?.plugins || [];
          const hasHRPlugin = plugins.includes('hr');
          
          if (!hasHRPlugin) {
            storageManager.set('erp', false);
            debug.log('ERP Mode: Disabled (no HR plugin)');
            return;
          }
          
          // ดึง userId จาก session
          const session = storageManager.get('session');
          const userId = session?.user?._id || session?.userID;
          
          if (!userId) {
            storageManager.set('erp', true); // มี HR แต่ไม่มี userId
            debug.log('ERP Mode: Enabled but no user ID');
            return;
          }
          
          // ดึงข้อมูล ERP user โดยค้นจาก user_id ของระบบ
          debug.log('ERP Mode: Fetching user data for system user_id:', userId);
          const hrService = new HRService();
          hrService.initialize(this); // Initialize ด้วย Vue instance
          const erpUserResponse = await hrService.getERPUserBySystemUserId(userId);
          
          if (erpUserResponse.success && erpUserResponse.data) {
            // Transform permissions: รวม module เดียวกันเป็นกลุ่ม
            const transformedData = this.transformERPUserData(erpUserResponse.data);
            storageManager.set('erp', transformedData);
            debug.log('✅ ERP user data loaded');
          } else {
            storageManager.set('erp', true);
            debug.log('⚠️ ERP enabled but user data not found');
          }
        } catch (error) {
          debug.log('Error updating ERP mode:', error);
          storageManager.set('erp', false);
        }
      },
      
      async getuserSession() {

        debug.log("getuserSession");
        try {
          this.sessionActive = "none";
          if (
            typeof this.session.list !== "undefined" &&
            this.session.list.length > 0
          ) {
            this.sessionList = this.session.list;
            if (this.session.current != "none") {
              this.sessionActive = this.session.current._id;
            } else {
              this.sessionActive = "none";
            }
            this.loading_sources = true;

            if (this.sessionList.length === 1) {
              this.activeBlock = true;
              this.loading_sources = true;
              const session = this.sessionList[0];
              this.dataContentMessage = `"${session.siteName}" เป็นฐานข้อมูลเดียว\nระบบจะทำการจะโหลดข้อมูลโดยอัตโนมัติใน 3 วินาที`;
              setTimeout(() => {
                this.dataContentMessage = this.translate('database-connect');
                this.selectSession(session._id);
              }, 1000);
              return;
            }
          } else {
            
            this.loading_sources = false;
            
            debug.log("Session",this.session);
            let accessToken = this.session.token;
            const resAPI = await fetch(
              "https://asia-southeast2-elearning-6871c.cloudfunctions.net/schools/getAdminSchool/",
              {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: "Bearer " + accessToken,
                },
              }
            );

            try {
              const finalRes = await resAPI.json();
              this.sessionList = finalRes.data;
              this.loading_sources = true;
              this.sessionActive = this.session.current;
              debug.log("sessionList", this.sessionList);
            } catch (error) {
              debug.log("Error");
            }
          }
        } catch (error) {
          debug.log(error);
        }
      },
      async selectSession(sessionId) {
        this.sessionId = sessionId
        debug.log("Select",this.sessionId);
        debug.log("color",this.color);

        const session = {
          prefix: "",
        };
        storageManager.update('session',session)

        try {
            if(this.sessionId!=undefined && this.sessionId!=null && this.sessionId !="") {
                this.activeBlock  = true;
                const resAPI      = await Request.GET(`hostname/${this.sessionId}`, this.hostkey);
                try {
                    const finalRes = resAPI.data;
                    debug.log("finalRes",finalRes);
                    if(resAPI.status === 200) {
                      const responseSpace = await Request.GET(`space/${finalRes.spaceId}`, this.hostkey);
                      const spaceData     = responseSpace.data
                      this.$swal({
                          toast: true,
                          position: 'bottom-end',
                          showConfirmButton: false,
                          timer: 500,
                          icon: 'success',
                          title: 'สลับฐานข้อมูลสำเร็จ',
                          text: this.translate('database-switch'),
                      }).then(async () => {
                          this.loading_sources = false;
                          finalRes._id = this.sessionId;
                          const session = {
                            current: {
                              ...finalRes, // Assuming finalRes is an existing object
                              s3Key: spaceData.s3Key,
                              s3Endpoint: spaceData.s3Endpoint,
                              s3Hosting: spaceData.s3Hosting,
                              s3Secret: spaceData.s3Secret,
                              s3Region: spaceData.s3Region,
                              s3EndpointDefault: spaceData.s3EndpointDefault,
                              s3Bucket: spaceData.s3Bucket,
                              spaceId: spaceData._id,
                            },
                          };
                          storageManager.update('session',session)
                          
                          // เช็คและดึงข้อมูล ERP user ถ้ามี HR plugin
                          await this.updateERPMode(finalRes);
                          
                          // เคลียร์ navigation เพื่อให้โหลดเมนูใหม่ตาม session ใหม่
                          storageManager.delete('navigation');
                          
                          window.location.href = "/"
                      });
                        
                    } else {
                        this.$swal({
                            toast: true,
                            position: 'bottom-end',
                            showConfirmButton: false,
                            timer: 1000,
                            icon: 'error',
                            title: 'เกิดข้อผิดพลาด',
                            text: 'ต้องเลือกฐานข้อมูลก่อน',
                        }).then(() => {
                        });
                    }
                    
                } catch (error) {
                    debug.log("Error");
                }
            } else {
                this.$swal({
                    toast: true,
                    position: 'bottom-end',
                    showConfirmButton: false,
                    timer: 1000,
                    icon: 'error',
                    title: 'เกิดข้อผิดพลาด',
                    text: 'ต้องเลือกฐานข้อมูลก่อน',
                }).then(() => {
                });
            }
        } catch (error) {
            debug.log(error)
        }
      }
	},
  async mounted () {
    try {
        await this.getuserSession();
    } catch (error) {
        debug.log(Error);
    }
  },
};
</script>

<script setup>
import { ref,defineProps,defineEmits } from 'vue'
import { TransitionRoot,TransitionChild,Dialog,DialogPanel,DialogTitle } from '@headlessui/vue'

const emits = defineEmits(['change-session-trigger','select-file-trigger'])
const props = defineProps({
  isWindowsOpen:Boolean,
})
const isOpen = ref(props.isWindowsOpen)

emits('change-session-trigger', true)

debug.log("isOpen",isOpen);

function closeModal() {
  isOpen.value = false
  emits('change-session-trigger', false)
}

</script>

<template>
    <!-- Loading State -->
    <div v-if="!loading_sources" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
        <div class="bg-white rounded-lg p-4 shadow-lg">
            <Loader/>
            <p class="text-center text-gray-600 mt-2 text-sm">กำลังโหลดข้อมูล...</p>
        </div>
    </div>

    <TransitionRoot appear :show="isOpen" as="template">
        <Dialog as="div" class="relative z-50">
            <!-- Backdrop -->
            <TransitionChild
                as="template"
                enter="duration-200 ease-out"
                enter-from="opacity-0"
                enter-to="opacity-100"
                leave="duration-150 ease-in"
                leave-from="opacity-100"
                leave-to="opacity-0"
            >
                <div class="fixed inset-0 bg-black bg-opacity-40" />
            </TransitionChild>
   
            <div class="fixed inset-0 overflow-y-auto">
                <div class="flex min-h-full items-center justify-center p-3">
                    <TransitionChild
                        as="template"
                        enter="duration-200 ease-out"
                        enter-from="opacity-0 scale-95"
                        enter-to="opacity-100 scale-100"
                        leave="duration-150 ease-in"
                        leave-from="opacity-100 scale-100"
                        leave-to="opacity-0 scale-95"
                    >
                        <DialogPanel class="w-full max-w-3xl transform overflow-hidden rounded-xl bg-white shadow-xl transition-all relative" 
                            :data-content="dataContentMessage"
                            :class="[(activeBlock?'isblock' : 'isunblock')]">
                            
                            <!-- Header -->
                            <div class="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-gray-100 px-5 py-3">
                                <DialogTitle as="h3" class="text-base font-semibold text-gray-800 flex items-center">
                                    <div class="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center mr-2">
                                        <font-awesome-icon :icon="['fas','database']" class="text-blue-600 text-xs"/>
                                    </div>
                                    {{ translate('database-switch') }}
                                </DialogTitle>
                                <p class="text-xs text-gray-500 mt-1 ml-8">{{ translate('database-description') }}</p>
                            </div>

                            <!-- Content -->
                            <div class="p-4">
                                <!-- Grid 2 columns -->
                                <div class="grid grid-cols-1 md:grid-cols-3 gap-1">
                                    <div v-for="session in sessionList" 
                                         :key="session._id" 
                                         class="group cursor-pointer"
                                         @click="selectSession(session._id)">
                                        
                                        <div class="relative border border-gray-200 rounded-lg p-3 hover:border-blue-300 hover:shadow-sm transition-all duration-150 bg-white"
                                             :class="[
                                                 sessionActive !== 'none' && sessionActive === session._id 
                                                     ? 'border-blue-400 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-sm' 
                                                     : 'hover:bg-gray-50'
                                             ]">
                                            
                                            <!-- Active stripe -->
                                            <div v-if="sessionActive !== 'none' && sessionActive === session._id"
                                                 class="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-t-lg"></div>
                                            
                                            <div class="flex items-center space-x-3">
                                                <!-- Logo -->
                                                <div class="relative flex-shrink-0">
                                                    <div class="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 ring-1 ring-gray-200">
                                                        <img :src="session.siteLogo || 'https://dummyimage.com/40x40/f3f4f6/9ca3af.png&text=DB'" 
                                                             :alt="session.siteName"
                                                             class="w-full h-full object-cover" />
                                                    </div>
                                                    
                                                    <!-- Active dot -->
                                                    <div v-if="sessionActive !== 'none' && sessionActive === session._id"
                                                         class="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border border-white shadow-sm">
                                                        <div class="w-1.5 h-1.5 bg-white rounded-full absolute top-0.5 left-0.5"></div>
                                                    </div>
                                                </div>
                                                
                                                <!-- Content -->
                                                <div class="flex-1 min-w-0">
                                                    <div class="flex items-start justify-between">
                                                        <div class="min-w-0 flex-1">
                                                            <h4 class="text-sm font-medium text-gray-900 truncate leading-tight">
                                                                {{ session.siteName }}
                                                            </h4>
                                                            <p class="text-xs text-gray-500 truncate mt-0.5">
                                                                {{ session.hostname }}
                                                            </p>
                                                        </div>
                                                        
                                                        <!-- Active badge -->
                                                        <span v-if="sessionActive !== 'none' && sessionActive === session._id"
                                                              class="inline-flex items-center px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium ml-2 flex-shrink-0">
                                                            <div class="w-1 h-1 bg-green-500 rounded-full mr-1"></div>
                                                            Active
                                                        </span>
                                                    </div>
                                                </div>
                                                
                                                <!-- Arrow -->
                                                <div class="flex-shrink-0">
                                                    <font-awesome-icon :icon="['fas','chevron-right']" 
                                                                     class="text-gray-300 group-hover:text-blue-400 transition-colors duration-150 text-xs"/>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Empty state -->
                                <div v-if="sessionList.length === 0" class="text-center py-8">
                                    <div class="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                                        <font-awesome-icon :icon="['fas','database']" class="text-gray-400 text-sm"/>
                                    </div>
                                    <h3 class="text-sm font-medium text-gray-900 mb-1">ไม่พบฐานข้อมูล</h3>
                                    <p class="text-xs text-gray-500">ไม่มีฐานข้อมูลที่สามารถเชื่อมต่อได้</p>
                                </div>
                            </div>

                            <!-- Footer -->
                            <div class="bg-gray-50 px-4 py-2.5 flex justify-end border-t border-gray-100" v-if="sessionActive !== 'none'">
                                <button
                                    type="button"
                                    class="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-xs font-medium text-gray-600 bg-white hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-150"
                                    @click="closeModal">
                                    <font-awesome-icon :icon="['fas','times']" class="mr-1.5 text-xs"/>
                                    {{ translate('general-cancel') }}
                                </button>
                            </div>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </div>
        </Dialog>
    </TransitionRoot>
</template>

<style scoped>
.isblock::before {
    content: attr(data-content);
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.96);
    backdrop-filter: blur(2px);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 500;
    color: #374151;
    text-align: center;
    white-space: pre-line;
    z-index: 10;
    border-radius: 12px;
}

.isunblock::before {
    display: none;
}

/* Subtle hover animation */
.group:hover .w-10 {
    transform: scale(1.05);
    transition: transform 0.15s ease-out;
}
</style>