<script>
import feather from 'feather-icons';
import storageManager from '@/plugins/storage';
import moment from 'moment';
moment().format();

export default {
    inject: ['apiServer'],
    data() {
      return {
        hostkey: this.$Key,
        userData: {},
        userCourses: [],
        userUnits: [],
        userAssets: [],
        userCollections: [],
        dataItem: this.$route.params.id,
        loading_sources: true,
        activeTab: 'detail',
        showDeleteModal: false,
        showEditModal: false,
        editForm: {
          firstname: '',
          lastname: '',
          email: '',
          phone: '',
          role: ''
        },
        notifications: [],
        activityLog: [],
        lastRefresh: null,
        showQuickActions: false,
        quickActions: [
          { name: 'Export Data', icon: 'download', action: 'exportAll' },
          { name: 'Reset Password', icon: 'key', action: 'resetPassword' },
          { name: 'Lock Account', icon: 'lock', action: 'lockAccount' },
          { name: 'Analytics', icon: 'chart-bar', action: 'analytics' },
          { name: 'Activity Log', icon: 'clock', action: 'activityLog' },
          { name: 'Settings', icon: 'settings', action: 'settings' }
        ],
        tabs: [
          { code: "detail", name: "รายละเอียด", description: "ข้อมูลส่วนตัวและรายละเอียดบัญชี" },
          { code: "courses", name: "หลักสูตร", description: "หลักสูตรที่เกี่ยวข้อง" },
          { code: "units", name: "หน่วยงาน", description: "หน่วยงานที่สังกัด" },
          { code: "assets", name: "ทรัพยากร", description: "ทรัพยากรที่จัดการ" },
          { code: "collections", name: "คอลเลกชัน", description: "คอลเลกชันที่จัดการ" },
          { code: "activity", name: "กิจกรรม", description: "ประวัติการใช้งาน" }
        ],
        configs: storageManager.get('configs') || {}
      }
    },
    methods: {
      dateTime(value) {
        return moment(value).format("DD/MM/YYYY hh:mm:ss");
      },
      getStatusColor(status) {
        const colors = {
          active: 'bg-green-100 text-green-800',
          inactive: 'bg-red-100 text-red-800',
          locked: 'bg-red-100 text-red-800',
          pending: 'bg-yellow-100 text-yellow-800'
        };
        return colors[status] || colors.active;
      },
      getRoleColor(role) {
        const colors = {
          root: 'bg-red-100 text-red-800',
          superadmin: 'bg-purple-100 text-purple-800',
          admin: 'bg-blue-100 text-blue-800',
          manager: 'bg-green-100 text-green-800',
          user: 'bg-gray-100 text-gray-800'
        };
        return colors[role] || colors.user;
      },
      openEditModal() {
        this.editForm = {
          firstname: this.userData.firstname || '',
          lastname: this.userData.lastname || '',
          email: this.userData.email || '',
          phone: this.userData.phone || '',
          role: this.userData.role || ''
        };
        this.showEditModal = true;
      },
      closeEditModal() {
        this.showEditModal = false;
      },
      async saveChanges() {
        try {
          this.loading_sources = false;
          
          const resAPI = await fetch(`https://gateway.cloudrestfulapi.com/api/user/update`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'client-token-key': this.hostkey
            },
            body: JSON.stringify({
              method: "updateOne",
              args: [
                { _id: this.dataItem },
                { 
                  ...this.editForm,
                  updatedAt: new Date().toISOString()
                }
              ]
            })
          });

          if (resAPI.ok) {
            this.userData = { ...this.userData, ...this.editForm };
            this.closeEditModal();
            this.addNotification('success', 'บันทึกข้อมูลสำเร็จ');
          } else {
            this.addNotification('error', 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
          }
          
          this.loading_sources = true;
        } catch (error) {
          this.addNotification('error', 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
          this.loading_sources = true;
        }
      },
      confirmDelete() {
        this.showDeleteModal = true;
      },
      async executeDelete() {
        try {
          this.loading_sources = false;
          
          const resAPI = await fetch(`https://gateway.cloudrestfulapi.com/api/user/delete`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'client-token-key': this.hostkey
            },
            body: JSON.stringify({
              method: "deleteOne",
              args: [{ _id: this.dataItem }]
            })
          });

          if (resAPI.ok) {
            this.addNotification('success', 'ลบผู้ใช้สำเร็จ');
            this.$router.push('/origin/user');
          } else {
            this.addNotification('error', 'เกิดข้อผิดพลาดในการลบข้อมูล');
          }
          
          this.loading_sources = true;
        } catch (error) {
          this.addNotification('error', 'เกิดข้อผิดพลาดในการลบข้อมูล');
          this.loading_sources = true;
        }
      },
      exportData() {
        const data = {
          exportDate: new Date().toISOString(),
          user: {
            // Basic user info
            _id: this.userData._id,
            firstname: this.userData.firstname,
            lastname: this.userData.lastname,
            email: this.userData.email,
            phone: this.userData.phone,
            username: this.userData.username,
            role: this.userData.role,
            status: this.userData.status,
            citizen: this.userData.citizen,
            // Counts from aggregation
            unitCount: this.userData.unitCount || 0,
            assetCount: this.userData.assetCount || 0,
            collectionCount: this.userData.collectionCount || 0,
            courseCount: this.userData.courseCount || 0,
            // Timestamps
            createdAt: this.userData.createdAt || this.userData.createAt,
            updatedAt: this.userData.updatedAt
          },
          // Detailed joined data
          relatedData: {
            courses: this.userCourses || [],
            units: this.userUnits || [],
            assets: this.userAssets || [],
            collections: this.userCollections || []
          },
          // Raw aggregated data for reference
          aggregatedUserData: this.userData
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `user-${this.userData.firstname}-${this.userData.lastname}-${new Date().toISOString().split('T')[0]}-export.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.addNotification('success', 'ส่งออกข้อมูลสำเร็จ');
      },
      refreshData() {
        this.lastRefresh = new Date();
        this.getData();
      },
      addNotification(type, message) {
        const notification = {
          id: Date.now(),
          type,
          message,
          timestamp: new Date()
        };
        this.notifications.unshift(notification);
        
        setTimeout(() => {
          this.removeNotification(notification.id);
        }, 5000);
      },
      removeNotification(id) {
        this.notifications = this.notifications.filter(n => n.id !== id);
      },
      logActivity(action, details) {
        this.activityLog.unshift({
          id: Date.now(),
          action,
          details,
          timestamp: new Date(),
          user: 'Current User'
        });
        
        if (this.activityLog.length > 50) {
          this.activityLog = this.activityLog.slice(0, 50);
        }
      },
      copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
          this.addNotification('success', 'คัดลอกไปยังคลิปบอร์ดแล้ว');
        });
      },
      getRelativeTime(date) {
        return moment(date).fromNow();
      },
      async handleQuickAction(action) {
        this.showQuickActions = false;
        
        switch (action) {
          case 'exportAll':
            this.exportData();
            break;
          case 'resetPassword':
            await this.resetPassword();
            break;
          case 'lockAccount':
            await this.toggleAccountLock();
            break;
          case 'analytics':
            this.addNotification('info', 'Analytics feature coming soon');
            break;
          case 'activityLog':
            this.activeTab = 'activity';
            break;
          case 'settings':
            this.openEditModal();
            break;
        }
      },
      async resetPassword() {
        if (confirm('คุณต้องการรีเซ็ตรหัสผ่านของผู้ใช้นี้หรือไม่?')) {
          try {
            this.loading_sources = false;
            
            const newPassword = Math.random().toString(36).slice(-8);
            const resAPI = await fetch(`https://gateway.cloudrestfulapi.com/api/user/update`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'client-token-key': this.hostkey
              },
              body: JSON.stringify({
                method: "updateOne",
                args: [
                  { _id: this.dataItem },
                  { 
                    password: newPassword,
                    req_reset: true,
                    updatedAt: new Date().toISOString()
                  }
                ]
              })
            });

            if (resAPI.ok) {
              this.addNotification('success', `รีเซ็ตรหัสผ่านสำเร็จ รหัสผ่านใหม่: ${newPassword}`);
              this.logActivity('รีเซ็ตรหัสผ่าน', 'รีเซ็ตรหัสผ่านผู้ใช้');
            } else {
              this.addNotification('error', 'เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน');
            }
            
            this.loading_sources = true;
          } catch (error) {
            this.addNotification('error', 'เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน');
            this.loading_sources = true;
          }
        }
      },
      async toggleAccountLock() {
        const newStatus = this.userData.status === 'locked' ? 'active' : 'locked';
        const action = newStatus === 'locked' ? 'ล็อค' : 'ปลดล็อค';
        
        if (confirm(`คุณต้องการ${action}บัญชีนี้หรือไม่?`)) {
          try {
            this.loading_sources = false;
            
            const resAPI = await fetch(`https://gateway.cloudrestfulapi.com/api/user/update`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'client-token-key': this.hostkey
              },
              body: JSON.stringify({
                method: "updateOne",
                args: [
                  { _id: this.dataItem },
                  { 
                    status: newStatus,
                    updatedAt: new Date().toISOString()
                  }
                ]
              })
            });

            if (resAPI.ok) {
              this.userData.status = newStatus;
              this.addNotification('success', `${action}บัญชีสำเร็จ`);
              this.logActivity(`${action}บัญชี`, `${action}บัญชีผู้ใช้`);
            } else {
              this.addNotification('error', `เกิดข้อผิดพลาดในการ${action}บัญชี`);
            }
            
            this.loading_sources = true;
          } catch (error) {
            this.addNotification('error', `เกิดข้อผิดพลาดในการ${action}บัญชี`);
            this.loading_sources = true;
          }
        }
      },
      async getData() {
        if(storageManager.get('session','login')) {
          try {
            this.loading_sources = false;
            
            // Get user data with aggregation pipeline
            const pipeline = [
              {
                $match: { _id: this.dataItem }
              },
              // Convert string arrays to ObjectId arrays if needed
              {
                $addFields: {
                  unitObjectIds: {
                    $map: {
                      input: { $ifNull: ["$unit", []] },
                      as: "unitId",
                      in: {
                        $cond: {
                          if: { $ne: ["$$unitId", null] },
                          then: { $toObjectId: "$$unitId" },
                          else: null
                        }
                      }
                    }
                  },
                  assetObjectIds: {
                    $map: {
                      input: { $ifNull: ["$asset", []] },
                      as: "assetId", 
                      in: {
                        $cond: {
                          if: { $ne: ["$$assetId", null] },
                          then: { $toObjectId: "$$assetId" },
                          else: null
                        }
                      }
                    }
                  },
                  collectionObjectIds: {
                    $map: {
                      input: { $ifNull: ["$collection", []] },
                      as: "collectionId",
                      in: {
                        $cond: {
                          if: { $ne: ["$$collectionId", null] },
                          then: { $toObjectId: "$$collectionId" },
                          else: null
                        }
                      }
                    }
                  }
                }
              },
              // Lookup units from hostname collection
              {
                $lookup: {
                  from: "hostname",
                  localField: "unitObjectIds",
                  foreignField: "_id",
                  as: "unitDetails"
                }
              },
              // Lookup assets from hostname collection
              {
                $lookup: {
                  from: "hostname",
                  localField: "assetObjectIds", 
                  foreignField: "_id",
                  as: "assetDetails"
                }
              },
              // Lookup collections from hostname collection
              {
                $lookup: {
                  from: "hostname",
                  localField: "collectionObjectIds",
                  foreignField: "_id",
                  as: "collectionDetails"
                }
              },
              // Lookup courses data if user has courses
              {
                $lookup: {
                  from: "course",
                  localField: "code",
                  foreignField: "category",
                  as: "courses"
                }
              },
              // Project final structure with counts and joined data
              {
                $project: {
                  _id: 1,
                  firstname: 1,
                  lastname: 1,
                  email: 1,
                  username: 1,
                  phone: 1,
                  citizen: 1,
                  old_id: 1,
                  token: 1,
                  role: 1,
                  status: 1,
                  avatar_img: 1,
                  createAt: 1,
                  createdAt: 1,
                  updatedAt: 1,
                  parent: 1,
                  // Original arrays for compatibility
                  unit: 1,
                  collection: 1,
                  asset: 1,
                  // Joined data with details
                  unitDetails: 1,
                  collectionDetails: 1,
                  assetDetails: 1,
                  courses: 1,
                  // Counts for quick reference
                  unitCount: { $size: { $ifNull: ["$unitDetails", []] } },
                  collectionCount: { $size: { $ifNull: ["$collectionDetails", []] } },
                  assetCount: { $size: { $ifNull: ["$assetDetails", []] } },
                  courseCount: { $size: { $ifNull: ["$courses", []] } },
                  totalHostnames: { 
                    $add: [
                      { $size: { $ifNull: ["$unitDetails", []] } },
                      { $size: { $ifNull: ["$assetDetails", []] } },
                      { $size: { $ifNull: ["$collectionDetails", []] } }
                    ]
                  }
                }
              }
            ];

            const userRes = await fetch(`https://gateway.cloudrestfulapi.com/api/user/aggregate`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'client-token-key': this.hostkey
              },
              body: JSON.stringify({
                pipeline: pipeline
              })
            });

            if (userRes.ok) {
              const aggregateResult = await userRes.json();
              if (aggregateResult && aggregateResult.length > 0) {
                this.userData = aggregateResult[0];
                
                // Set related data from aggregated results
                this.userUnits = this.userData.unitDetails || [];
                this.userAssets = this.userData.assetDetails || [];
                this.userCollections = this.userData.collectionDetails || [];
                this.userCourses = this.userData.courses || [];
                
                console.log('User data loaded with aggregation:', {
                  user: this.userData,
                  originalArrays: {
                    unit: this.userData.unit,
                    asset: this.userData.asset,
                    collection: this.userData.collection
                  },
                  joinedData: {
                    unitDetails: this.userData.unitDetails,
                    assetDetails: this.userData.assetDetails,
                    collectionDetails: this.userData.collectionDetails,
                    courses: this.userData.courses
                  },
                  counts: {
                    unitCount: this.userData.unitCount,
                    assetCount: this.userData.assetCount,
                    collectionCount: this.userData.collectionCount,
                    courseCount: this.userData.courseCount,
                    totalHostnames: this.userData.totalHostnames
                  }
                });
                
                this.loading_sources = true;
              } else {
                this.addNotification('error', 'ไม่พบข้อมูลผู้ใช้');
                this.loading_sources = true;
              }
            } else {
              this.addNotification('error', 'ไม่พบข้อมูลผู้ใช้');
              this.loading_sources = true;
            }

          } catch (error) {
            console.log(error);
            this.addNotification('error', 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
            this.loading_sources = true;
          }
        }
      },
      navigateToCollection(collectionId) {
        if (collectionId) {
          this.$router.push(`/origin/collection/detail/${collectionId}`);
          this.logActivity('เข้าชมคอลเลกชัน', `เข้าชมรายละเอียดคอลเลกชัน ID: ${collectionId}`);
        } else {
          this.addNotification('error', 'ไม่พบ ID ของคอลเลกชัน');
        }
      },

      updated() {
        feather.replace();
      },
    },
    async mounted() {
      try {
        await this.getData();
        this.logActivity('เข้าชมหน้า', 'เข้าชมหน้ารายละเอียดผู้ใช้');
      } catch (error) {
        console.log(error);
      }
    },
    setup() {
      //console.log("Setup");
    },
};
</script>

<template>
  <div class="user-detail min-h-screen bg-gray-50">
    
    <!-- Loading Overlay -->
    <div v-if="!loading_sources" class="fixed inset-0 bg-black bg-opacity-30 z-40 flex items-center justify-center">
      <div class="bg-white rounded-lg shadow-lg p-6 mx-4">
        <div class="flex items-center space-x-3">
          <div class="w-6 h-6 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <div>
            <h3 class="text-sm font-medium text-gray-900">กำลังโหลดข้อมูล</h3>
            <p class="text-xs text-gray-500">โปรดรอสักครู่...</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Notifications -->
    <div class="fixed top-4 right-4 z-50 space-y-2">
      <div v-for="notification in notifications" :key="notification.id"
           :class="{
             'bg-green-50 border-green-200 text-green-800': notification.type === 'success',
             'bg-red-50 border-red-200 text-red-800': notification.type === 'error',
             'bg-yellow-50 border-yellow-200 text-yellow-800': notification.type === 'warning',
             'bg-blue-50 border-blue-200 text-blue-800': notification.type === 'info'
           }"
           class="max-w-sm p-4 border rounded-lg shadow-lg">
        <div class="flex items-center justify-between">
          <p class="text-sm font-medium">{{ notification.message }}</p>
          <button @click="removeNotification(notification.id)" class="ml-2 text-gray-400 hover:text-gray-600">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Header -->
    <div class="bg-white border-b border-gray-200">
      <div class="w-full px-6 py-4">
        <div class="flex justify-between items-center">
          <div class="flex items-center space-x-3">
            <button 
              @click="$router.push('/origin/user')"
              class="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
            <div class="p-2 bg-indigo-100 rounded-lg">
              <svg class="h-5 w-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
            </div>
            <div>
              <h1 class="text-xl font-bold text-gray-900">User Detail</h1>
              <p class="text-sm text-gray-600">จัดการและดูรายละเอียดผู้ใช้</p>
            </div>
          </div>
          <div class="flex items-center space-x-3">
            <div class="flex items-center text-xs text-gray-500">
              <div class="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
              System Online
            </div>
            
            <!-- Quick Actions Dropdown -->
            <div class="relative">
              <button 
                @click="showQuickActions = !showQuickActions"
                class="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
                Quick Actions
                <svg class="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>
              
              <div v-if="showQuickActions" class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                <div class="py-1">
                  <button 
                    v-for="action in quickActions" 
                    :key="action.action"
                    @click="handleQuickAction(action.action)"
                    class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <svg class="mr-3 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path v-if="action.icon === 'download'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                      <path v-else-if="action.icon === 'key'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1721 9z"/>
                      <path v-else-if="action.icon === 'lock'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                      <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37.996.608 2.296.07 2.572-1.065z"/>
                    </svg>
                    {{ action.name }}
                  </button>
                </div>
              </div>
            </div>
            
            <button
              @click="refreshData"
              :disabled="!loading_sources"
              class="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
            >
              <svg 
                :class="['mr-2 h-4 w-4', { 'animate-spin': !loading_sources }]" 
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
              รีเฟรช
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Header Section -->
    <div class="bg-white">
      <div class="pl-6 pr-6 pt-6">
        <div class="flex flex-col lg:flex-row lg:items-start space-y-6 lg:space-y-0 lg:space-x-8">
          <!-- User Avatar & Basic Info -->
          <div class="flex items-center space-x-4">
            <div class="relative">
              <img 
                class="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg" 
                :src="userData.avatar_img || `https://ui-avatars.com/api/?name=${encodeURIComponent((userData.firstname || '') + ' ' + (userData.lastname || ''))}&background=e5e7eb&color=374151&size=80`" 
                :alt="userData.firstname"
              />
              <div class="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-3 border-white shadow-sm"
                   :class="userData.status === 'locked' ? 'bg-red-400' : 'bg-green-400'"></div>
            </div>
            <div>
              <h1 class="text-2xl font-bold text-gray-900">
                {{ userData.firstname }} {{ userData.lastname }}
              </h1>
              <p class="text-gray-600 text-sm mt-1">{{ userData.email }}</p>
              <div class="flex items-center space-x-3 mt-2">
                <span :class="getStatusColor(userData.status)" class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full">
                  <div class="w-1.5 h-1.5 rounded-full mr-1.5"
                       :class="userData.status === 'locked' ? 'bg-red-500' : 'bg-green-500'"></div>
                  {{ userData.status === 'locked' ? 'ล็อค' : 'ใช้งานได้' }}
                </span>
                <span :class="getRoleColor(userData.role)" class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full">
                  <i :class="[
                    'mr-1.5 text-xs',
                    userData.role === 'root' ? 'fas fa-crown' :
                    userData.role === 'superadmin' ? 'fas fa-user-shield' :
                    userData.role === 'admin' ? 'fas fa-user-tie' :
                    userData.role === 'manager' ? 'fas fa-user-cog' :
                    'fas fa-user'
                  ]"></i>
                  {{ userData.role || 'user' }}
                </span>
              </div>
            </div>
          </div>
          
          <!-- Quick Stats Grid -->
          <div class="flex-1">
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div class="bg-blue-50 rounded-lg p-4 border border-blue-100">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-blue-600 text-sm font-medium">หลักสูตร</p>
                    <p class="text-2xl font-bold text-blue-900">{{ userData.courseCount || 0 }}</p>
                  </div>
                  <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <i class="fas fa-graduation-cap text-blue-600"></i>
                  </div>
                </div>
              </div>
              
              <div class="bg-green-50 rounded-lg p-4 border border-green-100">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-green-600 text-sm font-medium">หน่วยงาน</p>
                    <p class="text-2xl font-bold text-green-900">{{ userData.unitCount || 0 }}</p>
                  </div>
                  <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <i class="fas fa-building text-green-600"></i>
                  </div>
                </div>
              </div>
              
              <div class="bg-orange-50 rounded-lg p-4 border border-orange-100">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-orange-600 text-sm font-medium">ทรัพยากร</p>
                    <p class="text-2xl font-bold text-orange-900">{{ userData.assetCount || 0 }}</p>
                  </div>
                  <div class="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <i class="fas fa-briefcase text-orange-600"></i>
                  </div>
                </div>
              </div>
              
              <div class="bg-purple-50 rounded-lg p-4 border border-purple-100">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-purple-600 text-sm font-medium">คอลเลกชัน</p>
                    <p class="text-2xl font-bold text-purple-900">{{ userData.collectionCount || 0 }}</p>
                  </div>
                  <div class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <i class="fas fa-layer-group text-purple-600"></i>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Total Summary -->
            <div class="mt-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-gray-600 text-sm font-medium">Total Hostnames</p>
                  <p class="text-xl font-bold text-gray-900">{{ userData.totalHostnames || 0 }}</p>
                  <p class="text-xs text-gray-500 mt-1">รวมทั้งหมดที่เกี่ยวข้อง</p>
                </div>
                <div class="text-right">
                  <p class="text-xs text-gray-500">สร้างเมื่อ</p>
                  <p class="text-sm font-medium text-gray-700">{{ dateTime(userData.createdAt || userData.createAt) }}</p>
                  <p v-if="lastRefresh" class="text-xs text-gray-400 mt-1">
                    อัพเดท: {{ getRelativeTime(lastRefresh) }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tabs -->
        <div class="mt-8">
          <nav class="flex space-x-8 border-b border-gray-200 overflow-x-auto">
            <button
              v-for="(tab) in tabs"
              :key="tab.code"
              :class="{ 
                'border-blue-500 text-blue-600': activeTab === tab.code, 
                'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300': activeTab !== tab.code 
              }"
              class="py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap flex items-center space-x-2"
              @click="activeTab = tab.code"
            >
              <i :class="[
                'text-xs',
                tab.code === 'detail' ? 'fas fa-user' :
                tab.code === 'courses' ? 'fas fa-graduation-cap' :
                tab.code === 'units' ? 'fas fa-building' :
                tab.code === 'assets' ? 'fas fa-briefcase' :
                tab.code === 'collections' ? 'fas fa-layer-group' :
                'fas fa-clock'
              ]"></i>
              <span>{{ tab.name }}</span>
              <span v-if="tab.code === 'courses' && userData.courseCount > 0" 
                    class="bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 rounded-full">
                {{ userData.courseCount }}
              </span>
              <span v-if="tab.code === 'units' && userData.unitCount > 0" 
                    class="bg-green-100 text-green-800 text-xs px-1.5 py-0.5 rounded-full">
                {{ userData.unitCount }}
              </span>
              <span v-if="tab.code === 'assets' && userData.assetCount > 0" 
                    class="bg-orange-100 text-orange-800 text-xs px-1.5 py-0.5 rounded-full">
                {{ userData.assetCount }}
              </span>
              <span v-if="tab.code === 'collections' && userData.collectionCount > 0" 
                    class="bg-purple-100 text-purple-800 text-xs px-1.5 py-0.5 rounded-full">
                {{ userData.collectionCount }}
              </span>
            </button>
          </nav>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="px-4 md:px-6 py-6">
      
      <!-- Detail Tab -->
      <section v-if="activeTab === 'detail'" class="animate-fade-in">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- User Information -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Basic Information -->
            <div class="bg-white rounded-lg border border-gray-200">
              <div class="p-6 border-b border-gray-100">
                <div class="flex items-center justify-between">
                  <h2 class="text-lg font-semibold text-gray-900">ข้อมูลส่วนตัว</h2>
                  <button 
                    @click="openEditModal"
                    class="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1">
                    <i class="fas fa-edit text-xs"></i>
                    <span>แก้ไข</span>
                  </button>
                </div>
              </div>
              
              <div class="p-6">
                <dl class="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                  <div class="sm:col-span-1">
                    <dt class="text-sm font-medium text-gray-500 flex items-center">
                      <i class="fas fa-user text-gray-400 mr-2 w-4"></i>
                      ชื่อ
                    </dt>
                    <dd class="mt-1 text-sm text-gray-900 font-medium">{{ userData.firstname || 'ไม่ระบุ' }}</dd>
                  </div>
                  <div class="sm:col-span-1">
                    <dt class="text-sm font-medium text-gray-500 flex items-center">
                      <i class="fas fa-user text-gray-400 mr-2 w-4"></i>
                      นามสกุล
                    </dt>
                    <dd class="mt-1 text-sm text-gray-900 font-medium">{{ userData.lastname || 'ไม่ระบุ' }}</dd>
                  </div>
                  <div class="sm:col-span-1">
                    <dt class="text-sm font-medium text-gray-500 flex items-center">
                      <i class="fas fa-envelope text-gray-400 mr-2 w-4"></i>
                      อีเมล
                    </dt>
                    <dd class="mt-1 text-sm text-gray-900 flex items-center">
                      <span class="font-medium">{{ userData.email || 'ไม่ระบุ' }}</span>
                      <button v-if="userData.email" @click="copyToClipboard(userData.email)" class="ml-2 text-gray-400 hover:text-gray-600">
                        <i class="fas fa-copy text-xs"></i>
                      </button>
                    </dd>
                  </div>
                  <div class="sm:col-span-1">
                    <dt class="text-sm font-medium text-gray-500 flex items-center">
                      <i class="fas fa-phone text-gray-400 mr-2 w-4"></i>
                      เบอร์โทร
                    </dt>
                    <dd class="mt-1 text-sm text-gray-900 font-medium">{{ userData.phone || 'ไม่ระบุ' }}</dd>
                  </div>
                  <div class="sm:col-span-1">
                    <dt class="text-sm font-medium text-gray-500 flex items-center">
                      <i class="fas fa-at text-gray-400 mr-2 w-4"></i>
                      Username
                    </dt>
                    <dd class="mt-1 text-sm text-gray-900 font-medium">{{ userData.username || 'ไม่ระบุ' }}</dd>
                  </div>
                  <div class="sm:col-span-1">
                    <dt class="text-sm font-medium text-gray-500 flex items-center">
                      <i class="fas fa-id-card text-gray-400 mr-2 w-4"></i>
                      เลขบัตรประชาชน
                    </dt>
                    <dd class="mt-1 text-sm text-gray-900 font-medium">{{ userData.citizen || 'ไม่ระบุ' }}</dd>
                  </div>
                  <div class="sm:col-span-1">
                    <dt class="text-sm font-medium text-gray-500 flex items-center">
                      <i class="fas fa-key text-gray-400 mr-2 w-4"></i>
                      Old ID
                    </dt>
                    <dd class="mt-1 text-sm text-gray-900 font-medium">{{ userData.old_id || 'ไม่ระบุ' }}</dd>
                  </div>
                  <div class="sm:col-span-1">
                    <dt class="text-sm font-medium text-gray-500 flex items-center">
                      <i class="fas fa-fingerprint text-gray-400 mr-2 w-4"></i>
                      Token
                    </dt>
                    <dd class="mt-1 text-sm text-gray-900 font-mono text-xs">{{ userData.token || 'ไม่ระบุ' }}</dd>
                  </div>
                </dl>
              </div>
            </div>

            <!-- System Information -->
            <div class="bg-white rounded-lg border border-gray-200">
              <div class="p-6 border-b border-gray-100">
                <h3 class="text-lg font-semibold text-gray-900">ข้อมูลระบบ</h3>
              </div>
              <div class="p-6">
                <dl class="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                  <div class="sm:col-span-1">
                    <dt class="text-sm font-medium text-gray-500 flex items-center">
                      <i class="fas fa-shield-alt text-gray-400 mr-2 w-4"></i>
                      บทบาท
                    </dt>
                    <dd class="mt-1">
                      <span :class="getRoleColor(userData.role)" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium">
                        <i :class="[
                          'mr-1.5 text-xs',
                          userData.role === 'root' ? 'fas fa-crown' :
                          userData.role === 'superadmin' ? 'fas fa-user-shield' :
                          userData.role === 'admin' ? 'fas fa-user-tie' :
                          userData.role === 'manager' ? 'fas fa-user-cog' :
                          'fas fa-user'
                        ]"></i>
                        {{ userData.role || 'user' }}
                      </span>
                    </dd>
                  </div>
                  <div class="sm:col-span-1">
                    <dt class="text-sm font-medium text-gray-500 flex items-center">
                      <i class="fas fa-toggle-on text-gray-400 mr-2 w-4"></i>
                      สถานะ
                    </dt>
                    <dd class="mt-1">
                      <span :class="getStatusColor(userData.status)" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium">
                        <div class="w-1.5 h-1.5 rounded-full mr-1.5"
                             :class="userData.status === 'locked' ? 'bg-red-500' : 'bg-green-500'"></div>
                        {{ userData.status === 'locked' ? 'ล็อค' : 'ใช้งานได้' }}
                      </span>
                    </dd>
                  </div>
                  <div class="sm:col-span-1">
                    <dt class="text-sm font-medium text-gray-500 flex items-center">
                      <i class="fas fa-calendar-plus text-gray-400 mr-2 w-4"></i>
                      วันที่สร้าง
                    </dt>
                    <dd class="mt-1 text-sm text-gray-900 font-medium">
                      {{ dateTime(userData.createdAt || userData.createAt) }}
                    </dd>
                  </div>
                  <div class="sm:col-span-1">
                    <dt class="text-sm font-medium text-gray-500 flex items-center">
                      <i class="fas fa-calendar-check text-gray-400 mr-2 w-4"></i>
                      อัพเดทล่าสุด
                    </dt>
                    <dd class="mt-1 text-sm text-gray-900 font-medium">
                      {{ userData.updatedAt ? dateTime(userData.updatedAt) : 'ไม่ระบุ' }}
                    </dd>
                  </div>
                  <div v-if="userData.parent" class="sm:col-span-2">
                    <dt class="text-sm font-medium text-gray-500 flex items-center">
                      <i class="fas fa-sitemap text-gray-400 mr-2 w-4"></i>
                      Parent ID
                    </dt>
                    <dd class="mt-1 text-sm text-gray-900 font-mono">{{ userData.parent }}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>

          <!-- Quick Actions & Summary -->
          <div class="lg:col-span-1 space-y-6">
            <!-- Data Summary -->
            <div class="bg-white rounded-lg border border-gray-200">
              <div class="p-6 border-b border-gray-100">
                <h3 class="text-lg font-semibold text-gray-900 flex items-center">
                  <i class="fas fa-chart-pie text-gray-500 mr-2"></i>
                  สรุปข้อมูล
                </h3>
                <p class="text-gray-500 text-sm mt-1">ภาพรวมข้อมูลที่เกี่ยวข้อง</p>
              </div>
              <div class="p-6">
                <!-- Summary Cards -->
                <div class="grid grid-cols-2 gap-3 mb-6">
                  <div class="bg-blue-50 rounded-lg p-3 border border-blue-100">
                    <div class="flex items-center justify-between">
                      <div>
                        <p class="text-blue-600 text-xs font-medium">หลักสูตร</p>
                        <p class="text-blue-900 text-lg font-bold">{{ userData.courseCount || 0 }}</p>
                      </div>
                      <div class="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                        <i class="fas fa-graduation-cap text-blue-600 text-xs"></i>
                      </div>
                    </div>
                  </div>
                  
                  <div class="bg-green-50 rounded-lg p-3 border border-green-100">
                    <div class="flex items-center justify-between">
                      <div>
                        <p class="text-green-600 text-xs font-medium">หน่วยงาน</p>
                        <p class="text-green-900 text-lg font-bold">{{ userData.unitCount || 0 }}</p>
                      </div>
                      <div class="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center">
                        <i class="fas fa-building text-green-600 text-xs"></i>
                      </div>
                    </div>
                  </div>
                  
                  <div class="bg-orange-50 rounded-lg p-3 border border-orange-100">
                    <div class="flex items-center justify-between">
                      <div>
                        <p class="text-orange-600 text-xs font-medium">ทรัพยากร</p>
                        <p class="text-orange-900 text-lg font-bold">{{ userData.assetCount || 0 }}</p>
                      </div>
                      <div class="w-6 h-6 bg-orange-100 rounded-lg flex items-center justify-center">
                        <i class="fas fa-briefcase text-orange-600 text-xs"></i>
                      </div>
                    </div>
                  </div>
                  
                  <div class="bg-purple-50 rounded-lg p-3 border border-purple-100">
                    <div class="flex items-center justify-between">
                      <div>
                        <p class="text-purple-600 text-xs font-medium">คอลเลกชัน</p>
                        <p class="text-purple-900 text-lg font-bold">{{ userData.collectionCount || 0 }}</p>
                      </div>
                      <div class="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center">
                        <i class="fas fa-layer-group text-purple-600 text-xs"></i>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Total Summary -->
                <div class="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center">
                      <div class="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center mr-3">
                        <i class="fas fa-server text-gray-600"></i>
                      </div>
                      <div>
                        <p class="text-gray-700 font-medium">Total Hostnames</p>
                        <p class="text-gray-500 text-xs">รวมทั้งหมดที่เกี่ยวข้อง</p>
                      </div>
                    </div>
                    <div class="text-right">
                      <p class="text-2xl font-bold text-gray-900">{{ userData.totalHostnames || 0 }}</p>
                      <p class="text-xs text-gray-500">รายการ</p>
                    </div>
                  </div>
                </div>

                <!-- Quick Stats -->
                <div class="mt-6 pt-6 border-t border-gray-100">
                  <h4 class="text-sm font-medium text-gray-700 mb-3">สถิติเพิ่มเติม</h4>
                  <div class="space-y-2">
                    <div class="flex items-center justify-between text-sm">
                      <span class="text-gray-600">สร้างบัญชีเมื่อ</span>
                      <span class="text-gray-900 font-medium">{{ dateTime(userData.createdAt || userData.createAt) }}</span>
                    </div>
                    <div v-if="userData.updatedAt" class="flex items-center justify-between text-sm">
                      <span class="text-gray-600">อัพเดทล่าสุด</span>
                      <span class="text-gray-900 font-medium">{{ dateTime(userData.updatedAt) }}</span>
                    </div>
                    <div class="flex items-center justify-between text-sm">
                      <span class="text-gray-600">สถานะบัญชี</span>
                      <span :class="userData.status === 'locked' ? 'text-red-600' : 'text-green-600'" class="font-medium">
                        {{ userData.status === 'locked' ? 'ล็อค' : 'ใช้งานได้' }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Quick Actions -->
            <div class="bg-white rounded-lg border border-gray-200">
              <div class="p-6 border-b border-gray-100">
                <h3 class="text-lg font-semibold text-gray-900 flex items-center">
                  <i class="fas fa-cogs text-gray-500 mr-2"></i>
                  การจัดการ
                </h3>
                <p class="text-gray-500 text-sm mt-1">เครื่องมือจัดการผู้ใช้</p>
              </div>
              <div class="p-6">
                <!-- Actions Grid -->
                <div class="grid grid-cols-2 gap-3">
                  <!-- Primary Actions -->
                  <button 
                    @click="openEditModal"
                    class="flex items-center px-3 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200">
                    <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <i class="fas fa-edit text-blue-600"></i>
                    </div>
                    <div class="text-left">
                      <div class="font-medium text-sm">แก้ไขข้อมูล</div>
                      <div class="text-xs text-blue-600">ปรับปรุงข้อมูล</div>
                    </div>
                  </button>
                  
                  <button 
                    @click="resetPassword"
                    class="flex items-center px-3 py-3 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors border border-yellow-200">
                    <div class="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                      <i class="fas fa-key text-yellow-600"></i>
                    </div>
                    <div class="text-left">
                      <div class="font-medium text-sm">รีเซ็ตรหัสผ่าน</div>
                      <div class="text-xs text-yellow-600">สร้างรหัสใหม่</div>
                    </div>
                  </button>

                  <!-- Security Action -->
                  <button 
                    @click="toggleAccountLock"
                    :class="userData.status === 'locked' ? 
                      'bg-green-50 text-green-700 hover:bg-green-100 border-green-200' : 
                      'bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-200'"
                    class="flex items-center px-3 py-3 rounded-lg transition-colors border">
                    <div :class="userData.status === 'locked' ? 'bg-green-100' : 'bg-orange-100'" 
                         class="w-8 h-8 rounded-lg flex items-center justify-center mr-3">
                      <i :class="userData.status === 'locked' ? 'fas fa-unlock text-green-600' : 'fas fa-lock text-orange-600'"></i>
                    </div>
                    <div class="text-left">
                      <div class="font-medium text-sm">{{ userData.status === 'locked' ? 'ปลดล็อค' : 'ล็อคบัญชี' }}</div>
                      <div class="text-xs" :class="userData.status === 'locked' ? 'text-green-600' : 'text-orange-600'">
                        {{ userData.status === 'locked' ? 'เปิดใช้งาน' : 'ระงับการใช้' }}
                      </div>
                    </div>
                  </button>

                  <!-- Utility Action -->
                  <button 
                    @click="exportData"
                    class="flex items-center px-3 py-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200">
                    <div class="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                      <i class="fas fa-download text-gray-600"></i>
                    </div>
                    <div class="text-left">
                      <div class="font-medium text-sm">ส่งออกข้อมูล</div>
                      <div class="text-xs text-gray-600">ดาวน์โหลดข้อมูล</div>
                    </div>
                  </button>
                </div>

                <!-- Danger Zone -->
                <div class="mt-6 pt-6 border-t border-gray-100">
                  <h4 class="text-sm font-medium text-red-700 mb-3 flex items-center">
                    <i class="fas fa-exclamation-triangle text-red-500 mr-2"></i>
                    Danger Zone
                  </h4>
                  <button 
                    @click="confirmDelete"
                    class="w-full flex items-center px-4 py-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors border border-red-200">
                    <div class="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                      <i class="fas fa-trash text-red-600"></i>
                    </div>
                    <div class="text-left">
                      <div class="font-medium">ลบผู้ใช้</div>
                      <div class="text-xs text-red-600">ลบข้อมูลอย่างถาวร</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Courses Tab -->
      <section v-if="activeTab === 'courses'" class="animate-fade-in">
        <div class="bg-white rounded-lg border border-gray-200">
          <div class="p-6 border-b border-gray-100">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-lg font-semibold text-gray-900 flex items-center">
                  <i class="fas fa-graduation-cap text-blue-500 mr-3"></i>
                  หลักสูตรที่เกี่ยวข้อง
                </h2>
                <p class="text-gray-500 text-sm mt-1">หลักสูตรที่ผู้ใช้มีสิทธิ์เข้าถึง ({{ userCourses.length }} รายการ)</p>
              </div>
              <div class="bg-blue-50 px-3 py-1 rounded-full">
                <span class="text-blue-700 text-sm font-medium">{{ userData.courseCount || 0 }} หลักสูตร</span>
              </div>
            </div>
          </div>
          
          <div class="p-6">
            <div v-if="userCourses.length === 0" class="text-center py-16">
              <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i class="fas fa-graduation-cap text-blue-500 text-2xl"></i>
              </div>
              <h3 class="text-lg font-medium text-gray-900 mb-2">ไม่มีหลักสูตร</h3>
              <p class="text-gray-500 mb-4">ผู้ใช้ยังไม่มีหลักสูตรที่เกี่ยวข้อง</p>
              <button class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <i class="fas fa-plus mr-2"></i>
                เพิ่มหลักสูตร
              </button>
            </div>
            
            <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              <div v-for="course in userCourses" :key="course._id" 
                   class="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-lg hover:border-blue-300 transition-all duration-200">
                <div class="flex items-start justify-between mb-4">
                  <div class="flex-1">
                    <h3 class="font-semibold text-gray-900 mb-2 line-clamp-2">{{ course.name || course.title || 'ไม่ระบุชื่อ' }}</h3>
                    <p class="text-sm text-gray-600 flex items-center">
                      <i class="fas fa-code text-gray-400 mr-2"></i>
                      {{ course.code || 'ไม่ระบุรหัส' }}
                    </p>
                  </div>
                  <span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                    {{ course.type || 'Course' }}
                  </span>
                </div>
                
                <div v-if="course.description" class="text-sm text-gray-500 mb-4 line-clamp-3">
                  {{ course.description }}
                </div>
                
                <div class="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div class="flex items-center space-x-4 text-xs text-gray-500">
                    <span v-if="course.duration" class="flex items-center">
                      <i class="fas fa-clock mr-1"></i>{{ course.duration }}
                    </span>
                    <span v-if="course.level" class="flex items-center">
                      <i class="fas fa-signal mr-1"></i>{{ course.level }}
                    </span>
                    <span v-if="course.students" class="flex items-center">
                      <i class="fas fa-users mr-1"></i>{{ course.students }}
                    </span>
                  </div>
                  <button class="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center">
                    <span>ดูรายละเอียด</span>
                    <i class="fas fa-arrow-right ml-1 text-xs"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Units Tab -->
      <section v-if="activeTab === 'units'" class="animate-fade-in">
        <div class="bg-white rounded-lg border border-gray-200">
          <div class="p-6 border-b border-gray-100">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-lg font-semibold text-gray-900 flex items-center">
                  <i class="fas fa-building text-green-500 mr-3"></i>
                  หน่วยงานที่สังกัด
                </h2>
                <p class="text-gray-500 text-sm mt-1">หน่วยงานที่ผู้ใช้เป็นสมาชิก ({{ userUnits.length }} รายการ)</p>
              </div>
              <div class="bg-green-50 px-3 py-1 rounded-full">
                <span class="text-green-700 text-sm font-medium">{{ userData.unitCount || 0 }} หน่วยงาน</span>
              </div>
            </div>
          </div>
          
          <div class="p-6">
            <div v-if="userUnits.length === 0" class="text-center py-16">
              <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i class="fas fa-building text-green-500 text-2xl"></i>
              </div>
              <h3 class="text-lg font-medium text-gray-900 mb-2">ไม่มีหน่วยงาน</h3>
              <p class="text-gray-500 mb-4">ผู้ใช้ยังไม่ได้สังกัดหน่วยงานใด</p>
              <button class="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <i class="fas fa-plus mr-2"></i>
                เพิ่มหน่วยงาน
              </button>
            </div>
            
            <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div v-for="unit in userUnits" :key="unit._id" 
                   class="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-lg hover:border-green-300 transition-all duration-200">
                <div class="flex items-start justify-between mb-4">
                  <div class="flex-1">
                    <h3 class="font-semibold text-gray-900 mb-2">{{ unit.siteName || unit.hostname || 'ไม่ระบุชื่อ' }}</h3>
                    <p class="text-sm text-gray-600 flex items-center">
                      <i class="fas fa-globe text-gray-400 mr-2"></i>
                      {{ unit.hostname || 'ไม่ระบุ hostname' }}
                    </p>
                  </div>
                  <span :class="getStatusColor(unit.status)" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium">
                    <div class="w-1.5 h-1.5 rounded-full mr-1.5"
                         :class="unit.status === 'active' ? 'bg-green-500' : 'bg-red-500'"></div>
                    {{ unit.status || 'active' }}
                  </span>
                </div>
                
                <div v-if="unit.description" class="text-sm text-gray-500 mb-4 line-clamp-2">
                  {{ unit.description }}
                </div>
                
                <div class="space-y-2 mb-4">
                  <div v-if="unit.siteType" class="flex items-center text-sm text-gray-600">
                    <i class="fas fa-tag text-gray-400 mr-2 w-4"></i>
                    <span>ประเภท: {{ unit.siteType }}</span>
                  </div>
                  <div v-if="unit.createdAt" class="flex items-center text-sm text-gray-600">
                    <i class="fas fa-calendar-plus text-gray-400 mr-2 w-4"></i>
                    <span>สร้างเมื่อ: {{ dateTime(unit.createdAt) }}</span>
                  </div>
                  <div v-if="unit.updatedAt" class="flex items-center text-sm text-gray-600">
                    <i class="fas fa-calendar-check text-gray-400 mr-2 w-4"></i>
                    <span>อัพเดท: {{ dateTime(unit.updatedAt) }}</span>
                  </div>
                </div>
                
                <div class="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div class="flex items-center space-x-2">
                    <span v-if="unit.relation" class="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                      {{ unit.relation.type || 'Member' }}
                    </span>
                  </div>
                  <button class="text-green-600 hover:text-green-700 text-sm font-medium flex items-center">
                    <span>ดูรายละเอียด</span>
                    <i class="fas fa-arrow-right ml-1 text-xs"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Assets Tab -->
      <section v-if="activeTab === 'assets'" class="animate-fade-in">
        <div class="bg-white rounded-lg border border-gray-200">
          <div class="p-6 border-b border-gray-100">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-lg font-semibold text-gray-900 flex items-center">
                  <i class="fas fa-briefcase text-orange-500 mr-3"></i>
                  ทรัพยากรที่จัดการ
                </h2>
                <p class="text-gray-500 text-sm mt-1">ทรัพยากรที่ผู้ใช้มีสิทธิ์จัดการ ({{ userAssets.length }} รายการ)</p>
              </div>
              <div class="bg-orange-50 px-3 py-1 rounded-full">
                <span class="text-orange-700 text-sm font-medium">{{ userData.assetCount || 0 }} ทรัพยากร</span>
              </div>
            </div>
          </div>
          
          <div class="p-6">
            <div v-if="userAssets.length === 0" class="text-center py-16">
              <div class="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i class="fas fa-briefcase text-orange-500 text-2xl"></i>
              </div>
              <h3 class="text-lg font-medium text-gray-900 mb-2">ไม่มีทรัพยากร</h3>
              <p class="text-gray-500 mb-4">ผู้ใช้ยังไม่มีทรัพยากรที่จัดการ</p>
              <button class="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                <i class="fas fa-plus mr-2"></i>
                เพิ่มทรัพยากร
              </button>
            </div>
            
            <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              <div v-for="asset in userAssets" :key="asset._id" 
                   class="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-lg hover:border-orange-300 transition-all duration-200">
                <div class="flex items-start justify-between mb-4">
                  <div class="flex-1">
                    <h3 class="font-semibold text-gray-900 mb-2">{{ asset.siteName || asset.name || 'ไม่ระบุชื่อ' }}</h3>
                    <p class="text-sm text-gray-600 flex items-center">
                      <i class="fas fa-globe text-gray-400 mr-2"></i>
                      {{ asset.hostname || asset.url || 'ไม่ระบุ hostname' }}
                    </p>
                  </div>
                  <span :class="getStatusColor(asset.status)" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium">
                    <div class="w-1.5 h-1.5 rounded-full mr-1.5"
                         :class="asset.status === 'active' ? 'bg-green-500' : 'bg-red-500'"></div>
                    {{ asset.status || 'active' }}
                  </span>
                </div>
                
                <div v-if="asset.description" class="text-sm text-gray-500 mb-4 line-clamp-2">
                  {{ asset.description }}
                </div>
                
                <div class="space-y-2 mb-4">
                  <div v-if="asset.siteType" class="flex items-center text-sm text-gray-600">
                    <i class="fas fa-tag text-gray-400 mr-2 w-4"></i>
                    <span>ประเภท: {{ asset.siteType }}</span>
                  </div>
                  <div v-if="asset.createdAt" class="flex items-center text-sm text-gray-600">
                    <i class="fas fa-calendar-plus text-gray-400 mr-2 w-4"></i>
                    <span>สร้างเมื่อ: {{ dateTime(asset.createdAt) }}</span>
                  </div>
                  <div v-if="asset.updatedAt" class="flex items-center text-sm text-gray-600">
                    <i class="fas fa-calendar-check text-gray-400 mr-2 w-4"></i>
                    <span>อัพเดท: {{ dateTime(asset.updatedAt) }}</span>
                  </div>
                </div>
                
                <div class="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div class="flex items-center space-x-2">
                    <span v-if="asset.relation" class="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                      {{ asset.relation.type || 'Manager' }}
                    </span>
                  </div>
                  <button class="text-orange-600 hover:text-orange-700 text-sm font-medium flex items-center">
                    <span>ดูรายละเอียด</span>
                    <i class="fas fa-arrow-right ml-1 text-xs"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Collections Tab -->
      <section v-if="activeTab === 'collections'" class="animate-fade-in">
        <div class="bg-white rounded-lg border border-gray-200">
          <div class="p-6 border-b border-gray-100">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-lg font-semibold text-gray-900 flex items-center">
                  <i class="fas fa-layer-group text-purple-500 mr-3"></i>
                  คอลเลกชันที่จัดการ
                </h2>
                <p class="text-gray-500 text-sm mt-1">คอลเลกชันที่ผู้ใช้มีสิทธิ์จัดการ ({{ userCollections.length }} รายการ)</p>
              </div>
              <div class="bg-purple-50 px-3 py-1 rounded-full">
                <span class="text-purple-700 text-sm font-medium">{{ userData.collectionCount || 0 }} คอลเลกชัน</span>
              </div>
            </div>
          </div>
          
          <div class="p-6">
            <div v-if="userCollections.length === 0" class="text-center py-16">
              <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i class="fas fa-layer-group text-purple-500 text-2xl"></i>
              </div>
              <h3 class="text-lg font-medium text-gray-900 mb-2">ไม่มีคอลเลกชัน</h3>
              <p class="text-gray-500 mb-4">ผู้ใช้ยังไม่มีคอลเลกชันที่จัดการ</p>
              <button class="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                <i class="fas fa-plus mr-2"></i>
                เพิ่มคอลเลกชัน
              </button>
            </div>
            
            <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              <div v-for="collection in userCollections" :key="collection._id" 
                   class="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-lg hover:border-purple-300 transition-all duration-200">
                <div class="flex items-start justify-between mb-4">
                  <div class="flex-1">
                    <h3 class="font-semibold text-gray-900 mb-2">{{ collection.siteName || collection.name || 'ไม่ระบุชื่อ' }}</h3>
                    <p class="text-sm text-gray-600 flex items-center">
                      <i class="fas fa-globe text-gray-400 mr-2"></i>
                      {{ collection.hostname || collection.url || 'ไม่ระบุ hostname' }}
                    </p>
                  </div>
                  <span :class="getStatusColor(collection.status)" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium">
                    <div class="w-1.5 h-1.5 rounded-full mr-1.5"
                         :class="collection.status === 'active' ? 'bg-green-500' : 'bg-red-500'"></div>
                    {{ collection.status || 'active' }}
                  </span>
                </div>
                
                <div v-if="collection.description" class="text-sm text-gray-500 mb-4 line-clamp-2">
                  {{ collection.description }}
                </div>
                
                <div class="space-y-2 mb-4">
                  <div v-if="collection.siteType" class="flex items-center text-sm text-gray-600">
                    <i class="fas fa-tag text-gray-400 mr-2 w-4"></i>
                    <span>ประเภท: {{ collection.siteType }}</span>
                  </div>
                  <div v-if="collection.createdAt" class="flex items-center text-sm text-gray-600">
                    <i class="fas fa-calendar-plus text-gray-400 mr-2 w-4"></i>
                    <span>สร้างเมื่อ: {{ dateTime(collection.createdAt) }}</span>
                  </div>
                  <div v-if="collection.updatedAt" class="flex items-center text-sm text-gray-600">
                    <i class="fas fa-calendar-check text-gray-400 mr-2 w-4"></i>
                    <span>อัพเดท: {{ dateTime(collection.updatedAt) }}</span>
                  </div>
                </div>
                
                <div class="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div class="flex items-center space-x-2">
                    <span v-if="collection.relation" class="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                      {{ collection.relation.type || 'Manager' }}
                    </span>
                  </div>
                  <button 
                    @click="navigateToCollection(collection._id)"
                    class="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center transition-colors">
                    <span>ดูรายละเอียด</span>
                    <i class="fas fa-arrow-right ml-1 text-xs"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Activity Tab -->
      <section v-if="activeTab === 'activity'" class="animate-fade-in">
        <div class="bg-white rounded-lg border border-gray-200">
          <div class="p-6">
            <div class="flex items-center justify-between mb-6">
              <div>
                <h2 class="text-xl font-semibold text-gray-900">กิจกรรมล่าสุด</h2>
                <p class="text-gray-500 text-sm mt-1">ประวัติการใช้งานและกิจกรรมของผู้ใช้</p>
              </div>
              
              <button 
                @click="activityLog = []"
                class="text-gray-400 hover:text-gray-600 px-3 py-1 text-sm">
                ล้างประวัติ
              </button>
            </div>
          </div>
          
          <div class="border-t border-gray-100">
            <div class="divide-y divide-gray-100">
              <div v-for="activity in activityLog" :key="activity.id" 
                   class="p-6 hover:bg-gray-50 transition-colors">
                <div class="flex items-start space-x-4">
                  <div class="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div class="flex-1">
                    <div class="flex items-center justify-between">
                      <p class="font-medium text-gray-900">{{ activity.action }}</p>
                      <span class="text-xs text-gray-500">{{ getRelativeTime(activity.timestamp) }}</span>
                    </div>
                    <p class="text-gray-600 text-sm mt-1">{{ activity.details }}</p>
                    <div class="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span>โดย {{ activity.user }}</span>
                      <span>{{ dateTime(activity.timestamp) }}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div v-if="activityLog.length === 0" class="p-12 text-center">
                <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h11a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                </svg>
                <h3 class="text-lg font-medium text-gray-900 mb-2">ไม่มีกิจกรรม</h3>
                <p class="text-gray-500">ยังไม่มีประวัติการใช้งาน</p>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  </div>

  <!-- Edit Modal -->
  <div v-if="showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg max-w-2xl w-full mx-4">
      <div class="p-6 border-b border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900">แก้ไขข้อมูลผู้ใช้</h3>
      </div>
      
      <div class="p-6 space-y-6">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">ชื่อ</label>
            <input 
              v-model="editForm.firstname"
              type="text"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">นามสกุล</label>
            <input 
              v-model="editForm.lastname"
              type="text"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">อีเมล</label>
          <input 
            v-model="editForm.email"
            type="email"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">เบอร์โทร</label>
          <input 
            v-model="editForm.phone"
            type="text"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">บทบาท</label>
          <select 
            v-model="editForm.role"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            <option value="user">User</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
            <option value="superadmin">Super Admin</option>
            <option value="root">Root</option>
          </select>
        </div>
      </div>
      
      <div class="p-6 border-t border-gray-200 flex justify-end space-x-3">
        <button 
          @click="closeEditModal"
          class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm transition-colors">
          ยกเลิก
        </button>
        <button 
          @click="saveChanges"
          class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
          บันทึก
        </button>
      </div>
    </div>
  </div>

  <!-- Delete Confirmation Modal -->
  <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg max-w-md w-full mx-4">
      <div class="p-6">
        <div class="flex items-center mb-4">
          <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
            <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
            </svg>
          </div>
          <div>
            <h3 class="text-lg font-semibold text-gray-900">ยืนยันการลบ</h3>
            <p class="text-gray-500 text-sm mt-1">การดำเนินการนี้ไม่สามารถยกเลิกได้</p>
          </div>
        </div>
        
        <p class="text-gray-700 mb-6">
          คุณต้องการลบผู้ใช้ "<strong>{{ userData.firstname }} {{ userData.lastname }}</strong>" หรือไม่? 
          ข้อมูลทั้งหมดจะถูกลบอย่างถาวร
        </p>
        
        <div class="flex justify-end space-x-3">
          <button 
            @click="showDeleteModal = false"
            class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm transition-colors">
            ยกเลิก
          </button>
          <button 
            @click="executeDelete"
            class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
            ลบถาวร
          </button>
        </div>
      </div>
    </div>
  </div>

</template>

<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}

button, .transition-colors {
  transition: all 0.2s ease;
}

@media (max-width: 768px) {
  .grid { gap: 1rem; }
  .rounded-lg { border-radius: 0.5rem; }
}
</style> 