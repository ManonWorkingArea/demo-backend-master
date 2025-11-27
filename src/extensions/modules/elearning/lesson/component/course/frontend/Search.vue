<template>
  <div class="container mx-auto p-6">
    <div class="mb-10 mt-12">
      <div class="w-full text-center text-2xl font-bold mb-2">ระบบสืบค้นข้อมูลใบประกาศนียบัตร</div>
      <div class="text-center text-gray-600">หลักสูตรผู้ควบคุมการขายวัตถุอันตรายทางการเกษตร สําหรับให้ผู้อบรมและเจ้าหน้าที่ กรมวิชาการเกษตรในการค้นหาข้อมูล</div>
    </div>
    <!-- Search Bar -->
    <div class="mb-2 flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
      
      <input
        v-model="searchQuery"
        @keyup.enter="fetchResults"
        type="text"
        placeholder="พิมพ์หมายเลขบัตรประชาชน เบอร์โทร หรืออีเมล์ที่ลงทะเบียน..."
        class="p-3 border border-gray-300 rounded-lg flex-1 text-gray-700 focus:ring-2 focus:ring-blue-400 focus:outline-none"
      />
      <button
        @click="fetchResults"
        class="bg-blue-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-600 transition-all"
      >
      <i class="fas fa-search text-lg"></i> ค้นหา
      </button>
    </div>
  
    <!-- User Details -->
    <div v-if="user" class="bg-white ">

      <div v-if="user.enrollments.length" class="mt-6">

        <div class="mt-6 p-6 rounded-lg text-center"
        :class="{
          'bg-green-100 text-green-700': overallResult.status === 'Pass',
          'bg-red-100 text-red-700': overallResult.status === 'No Pass',
          'bg-gray-100 text-gray-500': !user
        }">
        <div v-if="overallResult.status === 'Pass'">
          <p class="text-2xl font-extrabold">คุณผ่านหลักสูตรนี้เรียบร้อยแล้ว</p>
          <p class="mt-4 text-black">โปรดคลิกปุ่มด้านล่างเพื่อดูใบประกาศนียบัตรของคุณ</p>
          <button
            class="mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all"
            @click="openCertification(overallResult.course)"
          >
          <i class="fas fa-id-card text-xl"></i> ดูใบประกาศนียบัตร
          </button>
        </div>
        <div v-else-if="overallResult.status === 'No Pass'">
          <p class="text-2xl font-extrabold text-red-700">ท่านยังสอบหลักสูตรนี้ไม่ผ่าน</p>
          <p class="mt-4 text-black">โปรดติดต่อ FTI Academy เพื่อลงทะเบียนสมัครอบรม</p>
          <p class="mt-4 text-black">ติดต่อสอบถามได้ที่:</p>
          <div class="flex justify-center space-x-4 mt-4  text-black">
            <a href="tel:+1234567890" class="flex items-center space-x-2">
              <i class="fas fa-phone-alt text-xl"></i>
              <span>1453 กด 12</span>
            </a>
            <a href="https://lin.ee/xBi6NnY" class="flex items-center space-x-2">
              <img width="24" height="24" src="https://img.icons8.com/fluency-systems-filled/50/line-me.png" alt="line-me"/>
              <span>LINE</span>
            </a>
            <a href="https://doa.fti.or.th/" class="flex items-center space-x-2">
              <i class="fas fa-globe text-xl"></i>
              <span>Website</span>
            </a>
          </div>
        </div>
      </div>

      </div>
      <div v-else class="text-sm text-gray-500 mt-4">No enrollments found.</div>
    </div>

    <!-- No Results -->
    <div v-else-if="searched" class="mt-6 text-gray-500">

      <div class="mt-6 p-6 rounded-lg text-center bg-gray-100 text-gray-700">
        <div>
          <p class="text-2xl font-extrabold">ยังไม่มีข้อมูลของท่านในระบบ</p>
          <p class="mt-4">โปรดติดต่อ FTI Academy เพื่อลงทะเบียนสมัครอบรม</p>
          <p class="mt-4">ติดต่อสอบถามได้ที่:</p>
          <div class="flex justify-center space-x-4 mt-4">
            <a href="tel:+1234567890" class="flex items-center space-x-2">
              <i class="fas fa-phone-alt text-xl"></i>
              <span>1453 กด 12</span>
            </a>
            <a href="https://lin.ee/xBi6NnY" class="flex items-center space-x-2">
              <img width="24" height="24" src="https://img.icons8.com/fluency-systems-filled/50/line-me.png" alt="line-me"/>
              <span>LINE</span>
            </a>
            <a href="https://doa.fti.or.th/" class="flex items-center space-x-2">
              <i class="fas fa-globe text-xl"></i>
              <span>Website</span>
            </a>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import axios from 'axios';
import storageManager from '@/plugins/storage';

export default {
  data() {
    return {
      searchQuery: '',
      user: null,
      searched: false,
      configs: storageManager.get('configs'),
      session: storageManager.get('session'),
      courseIDs: ['646399b1db2e5913d490fdc1', '646399b3db2e5913d490fdc2', '646399b5db2e5913d490fdc3', '646399b6db2e5913d490fdc4', '646399b8db2e5913d490fdc5', '65c967c4e83775a8e0d42771', '64ba0f8e95b73060a5db8674'],
    };
  },
  methods: {
    courseId() {
      return this.overallResult.courseId;
    },
    openCertification(course) {
      if (this.courseIDs.includes(course._id)) {
        window.open('https://node-frontend.pages.dev/certification-force?token=' + this.user.token + '&session=' + course.lesson_old_id, '_blank');
      } else {
        window.open('https://doa.fti.or.th/lesson/certification/' + course._id + '/' + this.user._id, '_blank');
      }
    },
    async fetchResults() {
      this.searched = false;
      try {
        const body = {
          keyword: this.searchQuery.trim(),
          site: this.configs.siteID,
        };
        const response = await axios.post(
          'https://gateway.cloudrestfulapi.com/certification/search?key=DU1eYMDG7j8yb199YDPg3',
          body
        );
        this.user = response.data?.data || null;
      } catch (error) {
        console.error('Error fetching results:', error);
        this.user = null;
      } finally {
        this.searched = true;
      }
    },
  },
  computed: {
    overallResult() {
      if (!this.user || !this.user.enrollments.length) return { status: 'No Pass', courseId: null };

      for (const enroll of this.user.enrollments) {
        const { post, retest } = enroll.analytics;

        if (post.score >= post.measure) {
          return { status: 'Pass', course:enroll.course, courseId: enroll.course?._id || null };
        }

        if (retest?.score >= retest.measure) {
          return { status: 'Pass', course:enroll.course, courseId: enroll.course?._id || null };
        }
      }

      return { status: 'No Pass', courseId: null };
    },
  }
};
</script>

<style>
.container {
  max-width: 800px;
}
</style>
