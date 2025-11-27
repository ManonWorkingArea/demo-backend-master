<template>
    <div class="bg-white shadow-md rounded p-4 mb-4">
      <div class="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div class="md:col-span-1 flex flex-col items-start">
          <img :src="enrollItem.course.cover" alt="Course Cover" class="rounded max-w-full h-auto mb-4">
          <div class="flex items-center mb-4">
            <label for="status" class="text-sm font-medium text-gray-700 mr-2">สถานะ</label>
            <select
              v-model="localEnrollItem.status"
              id="status"
              name="status"
              class="mt-1 block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          <p class="text-gray-600 mb-4">ลงทะเบียน: {{ formatDate(localEnrollItem.createdAt) }}</p>
        </div>
        <div class="md:col-span-5">
          <h2 class="text-md font-bold mb-2">{{ localEnrollItem.course.name }}</h2>
  
          <div class="grid grid-cols-1 md:grid-cols-4 gap-2 mb-4">
            <div v-if="localEnrollItem.analytics" class="bg-gray-100 p-2 rounded shadow col-span-2 md:col-span-1">
              <h3 class="text-sm font-semibold mb-2">ความคืบหน้า</h3>
              <div class="mt-2">
                <div class="w-full bg-gray-200 h-1">
                  <div
                    class="bg-blue-600 h-1"
                    :style="{ width: progressPercentage(localEnrollItem.analytics) + '%' }"
                  ></div>
                </div>
                <p class="text-sm mt-1">{{ progressPercentage(localEnrollItem.analytics) }}% Complete</p>
              </div>
            </div>
  
            <div v-if="localEnrollItem.analytics" class="grid grid-cols-3 gap-2 col-span-2 md:col-span-3">
              <div :class="{ 'opacity-50': !localEnrollItem.analytics.total }" class="bg-gray-100 p-2 rounded shadow">
                <h3 class="text-sm mb-2 text-gray-500">เนื้อหาทั้งหมด</h3>
                <p class="text-2xl font-semibold">{{ localEnrollItem.analytics.total || '0' }}</p>
              </div>
              <div :class="{ 'opacity-50': !localEnrollItem.analytics.processing }" class="bg-gray-100 p-2 rounded shadow">
                <h3 class="text-sm mb-2 text-gray-500">กำลังเรียน</h3>
                <p class="text-2xl font-semibold">{{ localEnrollItem.analytics.processing || '0' }}</p>
              </div>
              <div :class="{ 'opacity-50': !localEnrollItem.analytics.complete }" class="bg-gray-100 p-2 rounded shadow">
                <h3 class="text-sm mb-2 text-gray-500">เรียนจบแล้ว</h3>
                <p class="text-2xl font-semibold">{{ localEnrollItem.analytics.complete || '0' }}</p>
              </div>
            </div>
          </div>
  
          <div class="grid grid-cols-1 md:grid-cols-4 gap-2 mb-4">
            <div :class="{ 'opacity-50': !hasScore(localEnrollItem.analytics?.pre) }" class="bg-gray-100 p-2 rounded shadow">
              <h3 class="text-sm mb-2 text-gray-500">สอบก่อนเรียน</h3>
              <p class="text-2xl">{{ getScore(localEnrollItem.analytics?.pre) }}</p>
            </div>
            <div :class="{ 'opacity-50': !hasScore(localEnrollItem.analytics?.post) }" class="bg-gray-100 p-2 rounded shadow">
              <h3 class="text-sm mb-2 text-gray-500">สอบหลังเรียน</h3>
              <p class="text-2xl font-semibold">{{ getScore(localEnrollItem.analytics?.post) }}</p>
            </div>
            <div :class="{ 'opacity-50': !hasScore(localEnrollItem.analytics?.retest) }" class="bg-gray-100 p-2 rounded shadow">
              <h3 class="text-sm mb-2 text-gray-500">สอบซ่อม</h3>
              <p class="text-2xl font-semibold">{{ getScore(localEnrollItem.analytics?.retest) }}</p>
            </div>
  
            <div v-if="hasResult(localEnrollItem.analytics)" class="bg-gray-100 p-2 rounded shadow flex flex-col justify-between">
              <h3 class="text-sm font-semibold mb-2">{{ calculateResult(localEnrollItem.analytics) ? 'ผ่านการรับรอง' : 'ไม่ผ่านการรับรอง' }}</h3>
              <button
                v-if="localEnrollItem.course.certification === 'no'"
                class="bg-gray-300 text-gray-700 px-4 py-2 mt-2 rounded"
                disabled
              >
                ไม่มีใบรับรอง
              </button>
              <button
                v-else-if="localEnrollItem.course.certification === 'yes' && calculateResult(localEnrollItem.analytics)"
                @click="$emit('open-certification', localEnrollItem.course)"
                class="bg-green-500 text-white px-4 py-2 mt-2 rounded"
              >
                แสดงใบรับรอง
              </button>
              <button
                v-else-if="localEnrollItem.course.certification === 'yes' && !calculateResult(localEnrollItem.analytics)"
                class="bg-red-500 text-white px-4 py-2 mt-2 rounded"
                disabled
              >
                ออกใบรับรองไม่ได้
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      enrollItem: Object,
      member: Object,
      session: Object,
      courseIDs: Array
    },
    data() {
      return {
        localEnrollItem: { ...this.enrollItem }
      };
    },
    methods: {
      formatDate(date) {
        return new Date(date).toLocaleDateString();
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
      calculateResult(analytics) {
        return this.$root.calculateResult(analytics);
      }
    },
    watch: {
      enrollItem: {
        handler(newVal) {
          this.localEnrollItem = { ...newVal };
        },
        deep: true
      },
      localEnrollItem: {
        handler(newVal) {
          this.$emit('update-enroll-item', newVal);
        },
        deep: true
      }
    }
  }
  </script>
  
  <style scoped>
  </style>
  