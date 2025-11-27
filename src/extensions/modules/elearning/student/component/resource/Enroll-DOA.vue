<template>
    <div class="bg-white shadow sm:rounded-lg">
        <div class="grid grid-cols-1 md:grid-cols-2 px-2 py-3 sm:px-3 items-center">
            <div>
              <h2 id="applicant-information-title" class="text-lg font-bold leading-6 text-gray-900">หลักสูตรที่ลงทะเบียน</h2>
              <p class="text-gray-300">Student Enroll Lesson</p>
            </div>
            <div class="md:flex justify-end mt-4 md:mt-0">
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div class="bg-blue-50 p-2 rounded-sm flex items-center">
                  <div class="flex-shrink-0 border-r border-gray-200 pr-2 mr-2">
                    <i class="fas fa-user-check text-2xl text-gray-500"></i>
                  </div>
                  <div class="ml-2">
                    <h3 class="text-sm text-gray-400">ลงทะเบียน</h3>
                    <p class="text-2xl font-semibold">{{ formatNumber(summary.totalEnrolls) }} <small class="text-xs text-gray-500">หลักสูตร</small></p>
                  </div>
                </div>
                <div class="bg-blue-50 p-2 rounded-sm flex items-center">
                  <div class="flex-shrink-0 border-r border-gray-200 pr-2 mr-2">
                    <i class="fas fa-graduation-cap text-2xl text-gray-500"></i>
                  </div>
                  <div class="ml-2">
                    <h3 class="text-sm text-gray-400">เรียนจบแล้ว</h3>
                    <p class="text-2xl font-semibold">{{ formatNumber(summary.completedEnrolls) }} <small class="text-xs text-gray-500">หลักสูตร</small></p>
                  </div>
                </div>
                <div class="bg-blue-50 p-2 rounded-sm flex items-center">
                  <div class="flex-shrink-0 border-r border-gray-200 pr-2 mr-2">
                    <i class="fas fa-certificate text-2xl text-gray-500"></i>
                  </div>
                  <div class="ml-2">
                    <h3 class="text-sm text-gray-400">ผ่านการรับรอง</h3>
                    <p class="text-2xl font-semibold">{{ formatNumber(summary.passedEnrolls) }} <small class="text-xs text-gray-500">หลักสูตร</small></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
      <div class="border-t border-gray-200"></div>
  
      <div class="container mx-auto p-4">
        
        <div v-for="(enrollItem, index) in enrolls" :key="index" class="bg-white shadow-md p-4 mb-4">
          <div class="grid grid-cols-1 md:grid-cols-6 gap-0">
            <div class="md:col-span-1 flex flex-col items-start">

                <Image :src="enrollItem.course.cover" class="max-w-full h-auto mb-2 pr-2" />

                <div class="w-full border-b border-t border-gray-200 flex items-center pr-2 pt-2 pb-2">
                    <p class="text-xs text-gray-600 mr-2 font-semibold"><font-awesome-icon :icon="['fas','calendar-alt']" class="text-gray-500 text-md"/> สมัคร</p>
                    <p class="text-xs text-gray-600"> {{ formatDate(enrollItem.createdAt) }}</p>
                </div>

                <div class="w-full border-b border-gray-200 flex items-center mb-2 pt-2 pb-2">
                    <p class="text-xs text-gray-600 mr-2 font-semibold">
                      <font-awesome-icon :icon="['fas','user-check']" class="text-gray-500 text-md"/> สถานะ
                    </p>
                    <select
                        v-model="enrollItem.status"
                        id="status"
                        name="status"
                        class="mt-1 block pl-2 pr-10 py-1 text-xs border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="pending">Pending</option>
                    </select>
                </div>
              
            </div>

            <div class="md:col-span-5 border-l border-gray-200 pl-2">
              <h2 class="text-lg font-bold mb-2">{{ enrollItem.course.name }}</h2>
  
              <div class="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2">
                <div v-if="enrollItem.analytics" class="bg-gray-100 p-2 rounded-xs shadow col-span-2 md:col-span-1">
                  <div class="grid grid-cols-2 gap-2">
                    <h3 class="text-sm font-semibold mb-2">ความคืบหน้า</h3>
                    <span class="text-right">{{ enrollItem.analytics.complete }}/{{ enrollItem.analytics.total }}</span>
                  </div>
                  <div class="mt-1">
                    <div class="w-full bg-gray-200 h-1">
                      <div
                        class="bg-blue-600 h-1"
                        :style="{ width: progressPercentage(enrollItem.analytics) + '%' }"
                      ></div>
                    </div>
                    <p class="text-xs mt-2 text-gray-400">{{ progressPercentage(enrollItem.analytics) }}% Complete</p>
                  </div>
                </div>
  
                <div v-if="enrollItem.analytics" class="grid grid-cols-3 gap-2 col-span-2 md:col-span-3">
                  <div :class="{ 'opacity-50': !enrollItem.analytics.total }" class="bg-gray-100 p-2 rounded-xs shadow">
                    <h3 class="text-sm mb-2 text-gray-500">เนื้อหาทั้งหมด</h3>
                    <p class="text-2xl font-semibold">{{ enrollItem.analytics.total || '0' }}</p>
                  </div>
                  <div :class="{ 'opacity-50': !enrollItem.analytics.processing }" class="bg-gray-100 p-2 rounded-xs shadow">
                    <h3 class="text-sm mb-2 text-gray-500">กำลังเรียน</h3>
                    <p class="text-2xl font-semibold">{{ enrollItem.analytics.processing || '0' }}</p>
                  </div>
                  <div :class="{ 'opacity-50': !enrollItem.analytics.complete }" class="bg-gray-100 p-2 rounded-xs shadow">
                    <h3 class="text-sm mb-2 text-gray-500">เรียนจบแล้ว</h3>
                    <p class="text-2xl font-semibold">{{ enrollItem.analytics.complete || '0' }}</p>
                  </div>
                </div>
              </div>
  
              <div class="grid grid-cols-1 md:grid-cols-4 gap-2 mb-4">
                <div :class="{ 'opacity-50': !hasScore(enrollItem.analytics?.pre) }" class="bg-gray-100 p-2 rounded-xs shadow">
                  <h3 class="text-sm mb-2 text-gray-500">สอบก่อนเรียน</h3>
                  <p class="text-2xl font-semibold">{{ getScore(enrollItem.analytics?.pre) }}</p>
                </div>
                <div :class="{ 'opacity-50': !hasScore(enrollItem.analytics?.post) }" class="bg-gray-100 p-2 rounded-xs shadow">
                  <h3 class="text-sm mb-2 text-gray-500">สอบหลังเรียน</h3>
                  <p class="text-2xl font-semibold">{{ getScore(enrollItem.analytics?.post) }}</p>
                </div>
                <div :class="{ 'opacity-50': !hasScore(enrollItem.analytics?.retest) }" class="bg-gray-100 p-2 rounded-xs shadow">
                  <h3 class="text-sm mb-2 text-gray-500">สอบซ่อม</h3>
                  <p class="text-2xl font-semibold">{{ getScore(enrollItem.analytics?.retest) }}</p>
                </div>
  
                  <div v-if="hasResult(enrollItem.analytics)" :class="calculateResult(enrollItem.analytics) ? 'bg-green-100' : 'bg-red-100'" class="p-1 rounded-xs shadow flex flex-col justify-between">
                    <h3 :class="calculateResult(enrollItem.analytics) ? 'text-green-700 bg-green-200' : 'text-red-700 bg-red-200'" class="mb-0 px-4 py-2 rounded-xs flex items-center">
                      <font-awesome-icon :icon="calculateResult(enrollItem.analytics) ? ['fas', 'check'] : ['fas', 'times']" class="text-sm mr-2" />
                      <span :class="calculateResult(enrollItem.analytics) ? 'border-green-300' : 'border-red-300'" class="border-l pl-2 text-sm">{{ calculateResult(enrollItem.analytics) ? 'ผ่านการรับรอง' : 'ไม่ผ่านการรับรอง' }}</span>
                    </h3>
                    <button
                      v-if="enrollItem.course.certification === 'no'"
                      class="bg-gray-300 text-gray-700 px-4 py-2 mt-1 text-sm rounded-xs"
                      disabled
                    >
                    <font-awesome-icon :icon="['fas','id-card']" class="text-white mt-[3px] mr-2 text-sm"/> ไม่มีใบรับรอง
                    </button>
                    <button
                      v-else-if="enrollItem.course.certification === 'yes' && calculateResult(enrollItem.analytics)"
                      @click="openCertification(enrollItem.course)"
                      class="bg-green-600 text-white px-4 py-2 mt-1 text-sm rounded-xs"
                    >
                    <font-awesome-icon :icon="['fas','id-card']" class="text-white mt-[3px] mr-2 text-sm"/> แสดงใบรับรอง
                    </button>
                    <button
                      v-else-if="enrollItem.course.certification === 'yes' && !calculateResult(enrollItem.analytics)"
                      class="bg-red-600 text-white px-4 py-2 mt-1 text-sm rounded-xs"
                      disabled
                    >
                    <font-awesome-icon :icon="['fas','id-card']" class="text-white mt-[3px] mr-2 text-sm"/> ออกใบรับรองไม่ได้
                    </button>
                  </div>
              </div>
  
              <!-- <div>
                <h3 class="text-lg font-semibold mb-2">Message</h3>
                <p>{{ enrollItem.analytics?.message || 'No message available' }}</p>
              </div> -->
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { calculateResult } from '@/plugins/analytics.js';
  import toast from '@/plugins/ToastUI.js';
  import storageManager from '@/plugins/storage';
  import debug from '@/plugins/Logger.js';
  import requestClient from '@/plugins/requestClient';

  import Image from '@/utils/ImageHolder.vue'; // Adjust the path as necessary
  
  const Request = new requestClient(false);
  
  export default {
    props: {
      member: Object,
      tabs: Object,
    },
    components: {
      Image
    },
    data() {
      return {
        config: storageManager.get('configs'),
        session: storageManager.get('session'),
        enrolls: [],
        courseIDs: ['646399b1db2e5913d490fdc1', '646399b3db2e5913d490fdc2', '646399b5db2e5913d490fdc3', '646399b6db2e5913d490fdc4', '646399b8db2e5913d490fdc5', '65c967c4e83775a8e0d42771', '64ba0f8e95b73060a5db8674'],
        summary: {
          totalEnrolls: 0,
          completedEnrolls: 0,
          passedEnrolls: 0,
        },
      };
    },
    methods: {
      calculateResult,
      formatDate(date) {
        const options = {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        };
        return new Date(date).toLocaleString(undefined, options);
      },
      formatNumber(number) {
      return number < 10 ? `0${number}` : number;
    },
      progressPercentage(analytics) {
        const totalLessons = analytics?.total || 0;
        const completedLessons = analytics?.complete || 0;
        return totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
      },
      hasScore(test) {
        return test?.score !== null && test?.score !== undefined;
      },
      getScore(test) {
        return this.hasScore(test) ? test.score : '-';
      },
      hasResult(analytics) {
        return analytics?.post?.has || analytics?.retest?.has;
      },
      openCertification(course) {
      if (this.courseIDs.includes(course._id)) {
        window.open('https://node-frontend.pages.dev/certification-force?token=' + this.member.token + '&session=' + course.lesson_old_id, '_blank');
      } else {
        window.open('https://' + this.session.current.hostname + '/lesson/certification/' + course._id + '/' + this.member._id + '?mode=admin', '_blank');
      }
    },
      calculateSummary() {
        this.summary.totalEnrolls = this.enrolls.length;
        this.summary.completedEnrolls = this.enrolls.filter(
          (enrollItem) => this.progressPercentage(enrollItem.analytics) === 100
        ).length;
        this.summary.passedEnrolls = this.enrolls.filter(
          (enrollItem) => this.calculateResult(enrollItem.analytics)
        ).length;
      },
      async getData() {
        try {
          this.toast = toast({ type: 'pending', message: 'กำลังดึงข้อมูล..' });
          const pipeline = [
            { $match: { $and: [{ userID: this.member._id }] } },
            { $set: { courseID: { $toObjectId: "$courseID" } } },
            {
              $lookup: {
                from: "course",
                localField: "courseID",
                foreignField: "_id",
                as: "course",
              },
            },
            { $unwind: "$course" },
            {
              $facet: {
                enroll: [{ $skip: (1 - 1) * 100 }, { $limit: 100 }],
                totalCount: [{ $count: 'count' }],
              },
            },
          ];
  
          const resAPI = await Request.POST('enroll/aggregate', { pipeline }, this.config.key);
          const data = resAPI.data;
  
          this.toast.hide('ดึงข้อมูลเสร็จแล้ว.', 'success', 30, () => {
            this.enrolls = data[0].enroll.map((enrollItem) => {
              return {
                ...enrollItem,
                status: enrollItem.status || 'active', // Default status to 'Active'
              };
            });
            this.calculateSummary();
            this.$setPageTitle(this.member.firstname + " " + this.member.lastname + " / หลักสูตร");
            this.activeBlock = false;
          });
        } catch (error) {
          debug.log(error);
        }
      },
    },
    async mounted() {
      try {
        await this.getData();
      } catch (error) {
        debug.log(error);
      }
    },
  };
  </script>
  
  <style scoped>
  .styled-text {
    color: blue;
    font-size: 20px;
  }
  </style>
  