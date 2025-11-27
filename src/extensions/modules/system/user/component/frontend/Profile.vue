<script>
import storageManager from '@/plugins/storage';
import convertUtils from "@/plugins/convertUtils";
import avatar from '@/utils/Avatar.vue';

import Application from '@/extensions/modules/standard/application/component/frontend/Dashboard.vue';
import Lesson from '@/extensions/modules/elearning/lesson/component/course/frontend/Dashboard.vue';
import Shop from '@/extensions/modules/ecommerce/shop/component/frontend/Dashboard.vue';

import requestClient from '@/plugins/requestClient';
const Request = new requestClient(false);

import debug from '@/plugins/Logger.js';

export default {
	name: 'User Profile',
	components: {avatar},
	data() {
		return {
      config: storageManager.get('configs'),
      profile: storageManager.get('session','user'),
      session: storageManager.get('session'),
      enroll:[],
      avatarData: {
        image: null,
      },
      activeTab: 'overview',
      isLoading: false,
		}
	},
  created() {
    if (this.profile.req_reset) {
      this.$router.push('/user/reset');
    }
  },
	methods: {
    changeTab(tab) {
      this.activeTab = tab;
    },
    editProfile() {
      this.$router.push('/user/edit');
    },
    getComponent(plugin) {
      const componentMap = {
        application: Application,
        lesson: Lesson,
        shop: Shop
      };
      return componentMap[plugin] || null;
    },
    formatThaidate(date) {
      return convertUtils.toThaiDatetime(date);
    },
    getMemberSince() {
      if (this.profile.created_at) {
        return convertUtils.toThaiDatetime(this.profile.created_at);
      }
      return 'ไม่ระบุ';
    },
    logout() {
      this.$swal({
          toast: true,
          position: 'bottom-end',
          showConfirmButton: false,
          timer: 500,
          icon: 'success',
          title: 'แจ้งเตือน',
          text: 'ออกจากระบบเรียบร้อยแล้ว',
      }).then(() => 
      {
        storageManager.delete('session');
        window.location.href = "/"
      });
    },
    countEnrollmentsByStatus(enrollments = [], status) {
      if (!enrollments || enrollments.length === 0) {
        return 0;
      }
      return enrollments.filter((enrollment) => enrollment.analytics && enrollment.analytics.status && enrollment.analytics.status.trim() === status).length;
    },
    countTotalEnrollments(enrollments = []) {
      if (!enrollments) {
        return 0;
      }
      return enrollments.length;
    },
    async getData() {
        try {
          this.isLoading = true;
          this.activeBlock = true;

          const pipeline = [
            {
              $match: {
                $and: [{ userID: this.session.userID }]
              },
            },
            {
              $set: {courseID: { $toObjectId: "$courseID" }},
            },
            {
              $lookup: {
                from: "course",
                localField: "courseID",
                foreignField: "_id",
                as: "course"
              },
            },
            {
              $unwind: "$course"
            },
            {
              $facet: {
                enroll: [{$skip: (1 - 1) * 100,},{$limit: 100}],
                totalCount: [{$count: 'count'}],
              },
            },
          ];

          const resAPI = await Request.POST('enroll/aggregate', { pipeline }, this.config.key);
          const data = resAPI.data;
          
          this.enroll = data[0].enroll;
          this.activeBlock = false;
          this.isLoading = false;

        } catch (error) {
          debug.log(error)
          this.isLoading = false;
          this.activeBlock = false;
        }
      }
	},
  async mounted () {
    try {
      await this.getData();
    } catch (error) {
      debug.log(Error);
    }
  },
  computed: {
    countPendingEnrollments() {
      return this.countEnrollmentsByStatus(this.enroll, 'pending');
    },
    countProcessingEnrollments() {
      return this.countEnrollmentsByStatus(this.enroll, 'processing');
    },
    countCompleteEnrollments() {
      return this.countEnrollmentsByStatus(this.enroll, 'complete');
    },
    countTotalEnrollment() {
      return this.countTotalEnrollments(this.enroll);
    }
  }
};
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header Section -->
    <div class="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-lg">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-6">
            <span class="relative inline-block">
              <avatar :data="{ name: profile.firstname + ' ' + profile.lastname, image: profile.avatar, size:14 }" class="h-24 w-24 ring-4 ring-white shadow-2xl rounded-full"/>
              <span class="absolute right-0 bottom-0 block h-7 w-7 rounded-full bg-green-400 ring-4 ring-white shadow-xl"></span>
            </span>
            <div>
              <h1 class="text-3xl font-bold text-white drop-shadow-lg">
                {{ profile.firstname }} {{ profile.lastname }}
              </h1>
              <p class="mt-1 text-white/90 flex items-center gap-2">
                <i class="fas fa-envelope text-sm"></i>
                {{ profile.email }}
              </p>
              <div class="mt-2 flex items-center gap-3">
                <span v-if="profile.role" class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-sm border border-white/30">
                  <i class="fas fa-user-tag mr-1"></i>
                  {{ profile.role }}
                </span>
                <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-sm border border-white/30">
                  <i class="fas fa-calendar mr-1"></i>
                  สมาชิกตั้งแต่ {{ getMemberSince() }}
                </span>
              </div>
            </div>
          </div>
          <div class="flex items-center space-x-3">
            <button 
              @click="editProfile()"
              class="hidden sm:flex items-center gap-2 bg-white text-indigo-600 hover:bg-gray-50 px-5 py-3 rounded-lg font-semibold shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              <i class="fas fa-user-edit"></i>
              <span>แก้ไขข้อมูล</span>
            </button>
            <button 
              @click="logout()" 
              class="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-5 py-3 rounded-lg font-semibold shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              <i class="fas fa-power-off"></i>
              <span class="hidden sm:inline">ออกจากระบบ</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav class="flex space-x-8" aria-label="Tabs">
          <button
            @click="changeTab('overview')"
            :class="[
              activeTab === 'overview'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              'group inline-flex items-center py-4 px-1 border-b-2 font-semibold text-sm transition-all duration-200'
            ]"
          >
            <i :class="[
              activeTab === 'overview' ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500',
              'fas fa-chart-line mr-2'
            ]"></i>
            ภาพรวม
          </button>
          <button
            @click="changeTab('info')"
            :class="[
              activeTab === 'info'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              'group inline-flex items-center py-4 px-1 border-b-2 font-semibold text-sm transition-all duration-200'
            ]"
          >
            <i :class="[
              activeTab === 'info' ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500',
              'fas fa-user-circle mr-2'
            ]"></i>
            ข้อมูลส่วนตัว
          </button>
          <button
            @click="changeTab('activity')"
            :class="[
              activeTab === 'activity'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              'group inline-flex items-center py-4 px-1 border-b-2 font-semibold text-sm transition-all duration-200'
            ]"
          >
            <i :class="[
              activeTab === 'activity' ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500',
              'fas fa-history mr-2'
            ]"></i>
            กิจกรรม
          </button>
        </nav>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      <!-- Overview Tab -->
      <div v-if="activeTab === 'overview'">
        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <!-- Total Enrollments Card -->
          <div class="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div class="flex items-center">
              <div class="bg-indigo-100 p-3 rounded-lg">
                <i class="fas fa-graduation-cap text-indigo-600 text-xl"></i>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">หลักสูตรทั้งหมด</p>
                <p class="text-2xl font-bold text-gray-900">{{ countTotalEnrollment }}</p>
              </div>
            </div>
            <div class="mt-4">
              <span class="text-green-500 text-sm font-medium">
                <i class="fas fa-check-circle mr-1"></i>
                {{ countCompleteEnrollments }} เสร็จสิ้น
              </span>
            </div>
          </div>

          <!-- Pending Card -->
          <div class="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div class="flex items-center">
              <div class="bg-yellow-100 p-3 rounded-lg">
                <i class="fas fa-clock text-yellow-600 text-xl"></i>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">รอดำเนินการ</p>
                <p class="text-2xl font-bold text-gray-900">{{ countPendingEnrollments }}</p>
              </div>
            </div>
            <div class="mt-4">
              <span class="text-gray-600 text-sm">กำลังรอดำเนินการ</span>
            </div>
          </div>

          <!-- Processing Card -->
          <div class="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div class="flex items-center">
              <div class="bg-blue-100 p-3 rounded-lg">
                <i class="fas fa-spinner text-blue-600 text-xl"></i>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">กำลังเรียน</p>
                <p class="text-2xl font-bold text-gray-900">{{ countProcessingEnrollments }}</p>
              </div>
            </div>
            <div class="mt-4">
              <span class="text-blue-600 text-sm font-medium">
                <i class="fas fa-book-reader mr-1"></i>
                กำลังดำเนินการ
              </span>
            </div>
          </div>

          <!-- Complete Card -->
          <div class="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div class="flex items-center">
              <div class="bg-green-100 p-3 rounded-lg">
                <i class="fas fa-check-circle text-green-600 text-xl"></i>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">เสร็จสิ้น</p>
                <p class="text-2xl font-bold text-gray-900">{{ countCompleteEnrollments }}</p>
              </div>
            </div>
            <div class="mt-4">
              <span class="text-green-500 text-sm font-medium">
                <i class="fas fa-trophy mr-1"></i>
                สำเร็จแล้ว
              </span>
            </div>
          </div>
        </div>

        <!-- Main Content Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Recent Activity -->
          <div class="lg:col-span-2">
            <div class="bg-white rounded-xl shadow-sm">
              <div class="p-6 border-b border-gray-200">
                <div class="flex items-center justify-between">
                  <h3 class="text-lg font-semibold text-gray-900">กิจกรรมล่าสุด</h3>
                  <button @click="changeTab('activity')" class="text-indigo-600 hover:text-indigo-700 font-medium text-sm">
                    ดูทั้งหมด
                  </button>
                </div>
              </div>
              <div class="p-6">
                <div v-if="isLoading" class="space-y-4">
                  <div v-for="i in 3" :key="i" class="animate-pulse">
                    <div class="flex items-center space-x-4">
                      <div class="bg-gray-200 h-12 w-12 rounded-lg"></div>
                      <div class="flex-1">
                        <div class="bg-gray-200 h-4 rounded mb-2"></div>
                        <div class="bg-gray-200 h-3 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else-if="enroll.length > 0" class="space-y-4">
                  <div 
                    v-for="item in enroll.slice(0, 5)" 
                    :key="item._id"
                    class="flex items-center p-4 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <div class="bg-indigo-100 p-3 rounded-lg">
                      <i class="fas fa-book text-indigo-600"></i>
                    </div>
                    <div class="ml-4 flex-1">
                      <h4 class="font-medium text-gray-900">{{ item.course?.title || 'ไม่ระบุชื่อ' }}</h4>
                      <p class="text-sm text-gray-500">สถานะ: {{ item.analytics?.status || 'ไม่ระบุ' }}</p>
                    </div>
                    <div class="text-right">
                      <span 
                        :class="{
                          'bg-green-100 text-green-800': item.analytics?.status === 'complete',
                          'bg-yellow-100 text-yellow-800': item.analytics?.status === 'pending',
                          'bg-blue-100 text-blue-800': item.analytics?.status === 'processing',
                          'bg-gray-100 text-gray-800': !item.analytics?.status
                        }"
                        class="inline-flex px-2 py-1 text-xs font-medium rounded-full"
                      >
                        {{ item.analytics?.status || 'ไม่ระบุ' }}
                      </span>
                    </div>
                  </div>
                </div>
                <div v-else class="text-center py-12">
                  <i class="fas fa-inbox text-gray-300 text-5xl mb-4"></i>
                  <p class="text-sm font-medium text-gray-900 mb-1">ยังไม่มีกิจกรรม</p>
                  <p class="text-xs text-gray-500">กิจกรรมของคุณจะแสดงที่นี่</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Actions & Info Sidebar -->
          <div class="space-y-6">
            <!-- Quick Stats -->
            <div class="bg-white rounded-xl shadow-sm p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">สถิติย่อ</h3>
              <div class="space-y-4">
                <div class="flex items-center p-3 bg-yellow-50 rounded-lg">
                  <div class="bg-yellow-100 p-2 rounded-lg">
                    <i class="fas fa-clock text-yellow-600"></i>
                  </div>
                  <div class="ml-3 flex-1">
                    <p class="text-xs text-gray-600">รอดำเนินการ</p>
                    <p class="text-lg font-bold text-gray-900">{{ countPendingEnrollments }}</p>
                  </div>
                </div>
                
                <div class="flex items-center p-3 bg-blue-50 rounded-lg">
                  <div class="bg-blue-100 p-2 rounded-lg">
                    <i class="fas fa-spinner text-blue-600"></i>
                  </div>
                  <div class="ml-3 flex-1">
                    <p class="text-xs text-gray-600">กำลังเรียน</p>
                    <p class="text-lg font-bold text-gray-900">{{ countProcessingEnrollments }}</p>
                  </div>
                </div>
                
                <div class="flex items-center p-3 bg-green-50 rounded-lg">
                  <div class="bg-green-100 p-2 rounded-lg">
                    <i class="fas fa-check-circle text-green-600"></i>
                  </div>
                  <div class="ml-3 flex-1">
                    <p class="text-xs text-gray-600">เสร็จสิ้น</p>
                    <p class="text-lg font-bold text-gray-900">{{ countCompleteEnrollments }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Quick Actions -->
            <div class="bg-white rounded-xl shadow-sm p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div class="space-y-3">
                <button @click="editProfile()" class="w-full flex items-center p-3 text-left hover:bg-indigo-50 rounded-lg transition-colors group">
                  <div class="bg-indigo-100 group-hover:bg-indigo-200 p-2 rounded-lg">
                    <i class="fas fa-user-edit text-indigo-600"></i>
                  </div>
                  <div class="ml-3">
                    <p class="font-medium text-gray-900">แก้ไขโปรไฟล์</p>
                    <p class="text-sm text-gray-500">อัพเดทข้อมูลส่วนตัว</p>
                  </div>
                </button>
                
                <button @click="changeTab('activity')" class="w-full flex items-center p-3 text-left hover:bg-blue-50 rounded-lg transition-colors group">
                  <div class="bg-blue-100 group-hover:bg-blue-200 p-2 rounded-lg">
                    <i class="fas fa-history text-blue-600"></i>
                  </div>
                  <div class="ml-3">
                    <p class="font-medium text-gray-900">ดูกิจกรรม</p>
                    <p class="text-sm text-gray-500">ประวัติการเรียนรู้</p>
                  </div>
                </button>
              </div>
            </div>

            <!-- Plugin Content -->
            <div v-if="config.plugins && config.plugins.length > 0" class="space-y-6">
              <template v-for="plugin in config.plugins" :key="plugin">
                <component :is="getComponent(plugin)" v-if="getComponent(plugin)"></component>
              </template>
            </div>
          </div>
        </div>
      </div>

      <!-- Personal Info Tab -->
      <div v-if="activeTab === 'info'" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Profile Info Card -->
        <div class="lg:col-span-2">
          <div class="bg-white rounded-xl shadow-md overflow-hidden">
            <div class="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-blue-50">
              <h3 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <font-awesome-icon :icon="['fas','user-circle']" class="text-indigo-600"/>
                ข้อมูลส่วนตัว
              </h3>
            </div>
            <div class="px-6 py-6">
              <dl class="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <dt class="text-sm font-medium text-gray-500 mb-1">ชื่อ</dt>
                  <dd class="text-base font-semibold text-gray-900">{{ profile.firstname }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500 mb-1">นามสกุล</dt>
                  <dd class="text-base font-semibold text-gray-900">{{ profile.lastname }}</dd>
                </div>
                <div class="sm:col-span-2">
                  <dt class="text-sm font-medium text-gray-500 mb-1">อีเมล</dt>
                  <dd class="text-base font-semibold text-gray-900 flex items-center gap-2">
                    <font-awesome-icon :icon="['fas','envelope']" class="text-gray-400 text-sm"/>
                    {{ profile.email }}
                  </dd>
                </div>
                <div v-if="profile.phone">
                  <dt class="text-sm font-medium text-gray-500 mb-1">เบอร์โทรศัพท์</dt>
                  <dd class="text-base font-semibold text-gray-900 flex items-center gap-2">
                    <font-awesome-icon :icon="['fas','phone']" class="text-gray-400 text-sm"/>
                    {{ profile.phone }}
                  </dd>
                </div>
                <div v-if="profile.role">
                  <dt class="text-sm font-medium text-gray-500 mb-1">บทบาท</dt>
                  <dd class="text-base font-semibold text-gray-900">
                    <span class="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-800">
                      {{ profile.role }}
                    </span>
                  </dd>
                </div>
                <div v-if="profile.created_at">
                  <dt class="text-sm font-medium text-gray-500 mb-1">สมาชิกตั้งแต่</dt>
                  <dd class="text-base font-semibold text-gray-900 flex items-center gap-2">
                    <font-awesome-icon :icon="['fas','calendar']" class="text-gray-400 text-sm"/>
                    {{ getMemberSince() }}
                  </dd>
                </div>
              </dl>
            </div>
            <div class="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <button @click="editProfile()" class="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 font-medium">
                <font-awesome-icon :icon="['fas','edit']"/>
                แก้ไขข้อมูลส่วนตัว
              </button>
            </div>
          </div>
        </div>

        <!-- Quick Stats Sidebar -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-xl shadow-md overflow-hidden">
            <div class="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
              <h3 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <font-awesome-icon :icon="['fas','chart-pie']" class="text-purple-600"/>
                สถิติย่อ
              </h3>
            </div>
            <div class="px-6 py-6 space-y-4">
              <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div class="flex items-center gap-3">
                  <div class="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                    <font-awesome-icon :icon="['fas','clock']" class="text-yellow-600"/>
                  </div>
                  <div>
                    <p class="text-xs text-gray-500">รอดำเนินการ</p>
                    <p class="text-lg font-bold text-gray-900">{{ countPendingEnrollments }}</p>
                  </div>
                </div>
              </div>
              <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div class="flex items-center gap-3">
                  <div class="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <font-awesome-icon :icon="['fas','spinner']" class="text-blue-600"/>
                  </div>
                  <div>
                    <p class="text-xs text-gray-500">กำลังเรียน</p>
                    <p class="text-lg font-bold text-gray-900">{{ countProcessingEnrollments }}</p>
                  </div>
                </div>
              </div>
              <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div class="flex items-center gap-3">
                  <div class="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                    <font-awesome-icon :icon="['fas','check-circle']" class="text-green-600"/>
                  </div>
                  <div>
                    <p class="text-xs text-gray-500">เสร็จสิ้น</p>
                    <p class="text-lg font-bold text-gray-900">{{ countCompleteEnrollments }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Activity Tab -->
      <div v-if="activeTab === 'activity'">
        <div class="bg-white rounded-xl shadow-md overflow-hidden">
          <div class="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-green-50 to-teal-50">
            <h3 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <font-awesome-icon :icon="['fas','history']" class="text-green-600"/>
              กิจกรรมล่าสุด
            </h3>
          </div>
          <div class="px-6 py-8">
            <div v-if="enroll.length > 0" class="flow-root">
              <ul role="list" class="-mb-8">
                <li v-for="(item, idx) in enroll.slice(0, 5)" :key="idx" class="relative pb-8">
                  <div v-if="idx !== Math.min(enroll.length, 5) - 1" class="absolute left-5 top-5 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></div>
                  <div class="relative flex items-start space-x-3">
                    <div class="relative">
                      <div class="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500 ring-8 ring-white">
                        <font-awesome-icon :icon="['fas','book']" class="text-white text-sm"/>
                      </div>
                    </div>
                    <div class="min-w-0 flex-1">
                      <div>
                        <p class="text-sm font-medium text-gray-900">{{ item.course?.title || 'ไม่ระบุชื่อ' }}</p>
                        <p class="mt-0.5 text-xs text-gray-500">
                          สถานะ: 
                          <span :class="{
                            'text-yellow-600': item.analytics?.status === 'pending',
                            'text-blue-600': item.analytics?.status === 'processing',
                            'text-green-600': item.analytics?.status === 'complete'
                          }" class="font-medium ml-1">
                            {{ item.analytics?.status || 'ไม่ระบุ' }}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
            <div v-else class="text-center py-12">
              <font-awesome-icon :icon="['fas','inbox']" class="text-gray-300 text-5xl mb-4"/>
              <p class="text-sm font-medium text-gray-900 mb-1">ยังไม่มีกิจกรรม</p>
              <p class="text-xs text-gray-500">กิจกรรมของคุณจะแสดงที่นี่</p>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- Loading Overlay -->
    <div v-if="isLoading" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl p-8 shadow-2xl flex flex-col items-center">
        <div class="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mb-4"></div>
        <p class="text-gray-700 font-medium">กำลังโหลดข้อมูล...</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bg-profile {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  position: relative;
}

.bg-profile::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1), transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(99, 102, 241, 0.4), transparent 50%),
    radial-gradient(circle at 40% 20%, rgba(168, 85, 247, 0.3), transparent 40%);
  animation: moveGradient 20s ease infinite;
}

@keyframes moveGradient {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.9;
    transform: scale(1.05);
  }
}

/* Border animation for tabs */
.border-b-3 {
  border-bottom-width: 3px;
}

/* Loading Animation */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Enhanced Smooth Transitions */
* {
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}

/* Card Hover Effects with scale */
.group:hover {
  transform: translateY(-4px);
}

/* Gradient text animation */
@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

/* Custom Scrollbar with colors */
::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

::-webkit-scrollbar-track {
  background: linear-gradient(to bottom, #f3f4f6, #e5e7eb);
  border-radius: 10px;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(to bottom, #8b5cf6, #6366f1);
  border-radius: 10px;
  border: 2px solid #f3f4f6;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(to bottom, #7c3aed, #4f46e5);
}

/* Shadow glow effect */
.shadow-glow {
  box-shadow: 0 0 20px rgba(99, 102, 241, 0.3);
}
</style>