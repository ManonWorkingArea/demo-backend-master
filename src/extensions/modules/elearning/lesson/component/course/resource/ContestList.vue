<template>
  <!-- Header Section -->
  <div class="bg-white rounded-lg shadow-sm border border-gray-200">
    <div class="px-4 py-3 border-b border-gray-200">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
            <font-awesome-icon :icon="['fas','square-check']" class="text-white text-sm" />
          </div>
          <div>
            <h2 class="text-base font-semibold text-gray-900">แบบทดสอบ</h2>
            <p class="text-xs text-gray-500">จัดการแบบทดสอบและการประเมินผล ({{ examCount }} แบบทดสอบ)</p>
          </div>
        </div>
        
        <div class="flex items-center space-x-2">
          <!-- Add Contest Button -->
          <button
            @click="$router.push('/lesson/exam/add/' + courseData.master + '/' + dataItem)"
            type="button"
            class="inline-flex items-center rounded-lg border border-transparent bg-purple-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors"
          >
            <font-awesome-icon :icon="['fas','plus']" class="text-white mr-1.5" />
            เพิ่มแบบทดสอบ
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
            <strong>หมายเหตุ:</strong> จัดการแบบทดสอบ แบบฝึกหัด และการประเมินผลสำหรับหลักสูตรนี้
          </p>
        </div>
      </div>
    </div>

    <!-- Contest Management -->
    <div class="p-4">
      <!-- Stats -->
      <div class="grid grid-cols-4 gap-4 mb-6">
        <div class="bg-purple-50 rounded-lg p-3 border border-purple-100">
          <div class="text-xs font-medium text-purple-600">ทั้งหมด</div>
          <div class="text-lg font-semibold text-purple-900">{{ examCount }}</div>
        </div>
        <div class="bg-green-50 rounded-lg p-3 border border-green-100">
          <div class="text-xs font-medium text-green-600">ข้อสอบ</div>
          <div class="text-lg font-semibold text-green-900">{{ totalQuestions }}</div>
        </div>
        <div class="bg-blue-50 rounded-lg p-3 border border-blue-100">
          <div class="text-xs font-medium text-blue-600">เวลาเฉลี่ย</div>
          <div class="text-lg font-semibold text-blue-900">{{ averageTime }} นาที</div>
        </div>
        <div class="bg-indigo-50 rounded-lg p-3 border border-indigo-100">
          <div class="text-xs font-medium text-indigo-600">ประเภท</div>
          <div class="text-lg font-semibold text-indigo-900">{{ uniqueTypes }}</div>
        </div>
      </div>

      <!-- Contest List -->
      <div class="space-y-4">
        <!-- Empty State -->
        <div v-if="examData.length === 0" class="text-center py-8">
          <div class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <font-awesome-icon :icon="['fas','square-check']" class="text-gray-400 text-lg"/>
          </div>
          <h3 class="text-base font-medium text-gray-900 mb-2">ยังไม่มีแบบทดสอบ</h3>
          <p class="text-sm text-gray-500 mb-4">เริ่มต้นด้วยการสร้างแบบทดสอบครั้งแรก</p>
          <button
            @click="$router.push('/lesson/exam/add/' + courseData.master + '/' + dataItem)"
            type="button"
            class="inline-flex items-center rounded-lg border border-transparent bg-purple-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors"
          >
            <font-awesome-icon :icon="['fas','plus']" class="mr-1.5" />
            เพิ่มแบบทดสอบแรก
          </button>
        </div>

        <!-- Contest Items -->
        <div v-else class="space-y-3">
          <div 
            v-for="(examItem, index) in examData" 
            :key="examItem._id"
            class="bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-md transition-all duration-200"
          >
            <div class="p-4">
              <!-- Contest Header -->
              <div class="flex items-center justify-between mb-3" @click="toggleExpand(examItem._id)">
                <div class="flex items-center space-x-3 flex-1 cursor-pointer">
                  <!-- Contest Icon -->
                  <div class="flex-shrink-0">
                    <div class="w-12 h-12 rounded-lg flex items-center justify-center text-white bg-gradient-to-br from-purple-500 to-purple-600">
                      <font-awesome-icon :icon="['fas', getExamTypeIcon(examItem.type)]" class="text-base" />
                    </div>
                  </div>
                  
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center space-x-2 mb-1">
                      <h3 class="text-base font-semibold text-gray-900">
                        {{ index + 1 }}. {{ examItem.name }}
                      </h3>
                      <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {{ objectFindByKey(examType, 'code', examItem.type).name }}
                      </span>
                    </div>
                    
                    <!-- Contest Info -->
                    <div class="flex items-center space-x-3 text-xs text-gray-500">
                      <span class="flex items-center">
                        <font-awesome-icon :icon="['fas','question-circle']" class="mr-1 text-blue-500" />
                        {{ examItem.total }} ข้อ
                      </span>
                      <span class="text-gray-300">•</span>
                      <span class="flex items-center">
                        <font-awesome-icon :icon="['fas','clock']" class="mr-1 text-green-500" />
                        {{ examItem.timer }} นาที
                      </span>
                      <span class="text-gray-300">•</span>
                      <span class="flex items-center">
                        <font-awesome-icon :icon="['fas','chart-bar']" class="mr-1 text-orange-500" />
                        0/{{ examItem.total }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="flex items-center justify-between pt-3 border-t border-gray-200">
                <div class="flex items-center space-x-2">
                  <button 
                    @click.stop="$router.push('/lesson/exam/edit/' + examItem._id + '/' + dataItem)"
                    class="inline-flex items-center px-2.5 py-1 border border-gray-200 rounded-md text-xs font-medium text-gray-600 bg-white hover:bg-gray-50 transition-colors"
                    title="แก้ไข">
                    <font-awesome-icon :icon="['fas','pencil']" class="mr-1 text-xs" />
                    แก้ไข
                  </button>
                </div>

                <div class="flex items-center space-x-1">
                  <button 
                    @click.stop="toggleExpand(examItem._id)"
                    type="button" 
                    class="inline-flex items-center px-2.5 py-1 border border-gray-200 rounded-md text-xs font-medium text-gray-600 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <font-awesome-icon :icon="['fas','eye']" class="mr-1 text-xs" />
                    ดูรายละเอียด
                  </button>
                  
                  <button
                    @click.stop="deleteExam(examItem._id, index)"
                    type="button"
                    class="inline-flex items-center px-2.5 py-1 border border-red-200 rounded-md text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                  >
                    <font-awesome-icon :icon="['fas','trash']" class="mr-1 text-xs" />
                    ลบ
                  </button>
                </div>
              </div>
            </div>

            <!-- Contest Detail Panel -->
            <Transition
              enter-active-class="transition duration-200 ease-out"
              enter-from-class="transform scale-95 opacity-0"
              enter-to-class="transform scale-100 opacity-100"
              leave-active-class="transition duration-75 ease-in"
              leave-from-class="transform scale-100 opacity-100"
              leave-to-class="transform scale-95 opacity-0"
            >
              <div v-if="expandedExams[examItem._id]" class="border-t border-gray-200 bg-gray-50">
                <div class="p-4">
                  <ContestDetail :examid="examItem._id" :pageTitle="'ผู้ลงทะเบียนหลักสูตรนี้'" />
                </div>
              </div>
            </Transition>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { exam } from "@/master/type";
import ContestDetail   from './ContestDetail.vue';
import debug from '@/plugins/Logger.js';

export default {
  props: {
    examCount: Number,
    courseData: Object,
    dataItem: String,
    examData: Array,
    examTypeProp: Array, // Rename the prop to examTypeProp
    tabs: Object,
    updateTabs: Object,
  },
  data() {
    return {
      expandedExams: {}, // Store the expanded state for each exam
    };
  },
  components: {
    ContestDetail,
  },
  computed: {
    examType() {
      return exam;
    },
    totalQuestions() {
      return this.examData.reduce((total, exam) => total + (exam.total || 0), 0);
    },
    averageTime() {
      if (this.examData.length === 0) return 0;
      const totalTime = this.examData.reduce((total, exam) => total + (exam.timer || 0), 0);
      return Math.round(totalTime / this.examData.length);
    },
    uniqueTypes() {
      const types = new Set(this.examData.map(exam => exam.type));
      return types.size;
    },
  },
  methods: {
    async activeFunction() {
      try {
        debug.log("Active");
      } catch (error) {
        console.error(error);
      }
    },
    assignBadgeToTabs() {
      const newTabs = this.tabs.map(tab => ({ ...tab, badge: 0 }));
      this.updateTabs(newTabs);
    },
    objectFindByKey(array, key, value) {
      for (var i = 0; i < array.length; i++) {
        if (array[i][key] === value) {
          return array[i];
        }
      }
      return null;
    },
    toggleExpand(examId) {
      // Toggle the expanded state directly
      this.expandedExams[examId] = !this.expandedExams[examId];
    },
    isExpanded(examId) {
      // Check if the exam is expanded
      return this.expandedExams[examId];
    },
    getExamTypeIcon(type) {
      const icons = {
        'pretest': 'clipboard-question',
        'posttest': 'clipboard-check',
        'quiz': 'question-circle',
        'assignment': 'file-text',
        'survey': 'poll',
        'final': 'trophy',
        'midterm': 'graduation-cap',
        'practice': 'dumbbell',
      };
      return icons[type] || 'square-check';
    },
    // Add deleteExam method if it doesn't exist
    async deleteExam(examId, index) {
      try {
        // Add your delete logic here
        console.log('Delete exam:', examId, index);
        // You might want to emit an event or call an API
        this.$emit('delete-exam', examId, index);
      } catch (error) {
        console.error('Error deleting exam:', error);
      }
    },
  },
  async mounted() {
    try {
      //
    } catch (error) {
      console.error(error); // Use the 'error' object, not 'Error'
    }
  },
};
</script>

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
}

.btn-modern:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(147, 51, 234, 0.5);
}

.btn-modern:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.btn-primary-modern {
  background-color: #9333ea;
  color: white;
}

.btn-primary-modern:hover {
  background-color: #7c3aed;
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

/* Contest Card Animations */
.contest-card {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.contest-card:hover {
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
  background-color: #f3e8ff;
  color: #7c3aed;
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
  background: linear-gradient(135deg, #9333ea 0%, #7c3aed 100%);
}

.gradient-bg-light {
  background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%);
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
  box-shadow: 0 0 0 2px rgba(147, 51, 234, 0.5);
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
  color: #9333ea;
  text-decoration: underline;
}

.prose a:hover {
  color: #7c3aed;
}

/* Contest specific styles */
.contest-icon {
  width: 3rem;
  height: 3rem;
  background-color: #f3e8ff;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.contest-icon svg {
  color: #9333ea;
  font-size: 1.125rem;
}

/* Enhanced Contest Stats */
.contest-stat-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.contest-stat-badge.has-questions {
  background-color: #d1fae5;
  color: #065f46;
}

.contest-stat-badge.no-questions {
  background-color: #f3f4f6;
  color: #4b5563;
}

.contest-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.125rem 0.625rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.contest-badge.pretest {
  background-color: #dbeafe;
  color: #1e40af;
}

.contest-badge.posttest {
  background-color: #d1fae5;
  color: #065f46;
}

.contest-badge.quiz {
  background-color: #fef3c7;
  color: #92400e;
}

.contest-badge.assignment {
  background-color: #f3e8ff;
  color: #7c3aed;
}

.contest-stats {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.contest-stat-item {
  display: flex;
  align-items: center;
}

.contest-stat-item svg {
  margin-right: 0.25rem;
}

.contest-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.contest-action-group {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.contest-action-button {
  display: inline-flex;
  align-items: center;
  padding: 0.375rem 0.75rem;
  border: 1px solid;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.contest-action-button.edit {
  color: #4b5563;
  background-color: white;
  border-color: #e5e7eb;
}

.contest-action-button.edit:hover {
  background-color: #f9fafb;
}

.contest-action-button.view {
  color: #2563eb;
  background-color: #eff6ff;
  border-color: #bfdbfe;
}

.contest-action-button.view:hover {
  background-color: #dbeafe;
}

.contest-action-button.delete {
  color: #dc2626;
  background-color: #fef2f2;
  border-color: #fecaca;
}

.contest-action-button.delete:hover {
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

/* Contest Detail Panel */
.contest-detail-panel {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 1rem;
}

@media (min-width: 640px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

.stat-card {
  background-color: white;
  border-radius: 0.5rem;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  transition: box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.stat-card:hover {
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
}

.stat-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #4b5563;
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
  border-top: 2px solid #9333ea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* Transition Enhancements */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}

.transition-colors {
  transition-property: color, background-color, border-color;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}

.transition-opacity {
  transition-property: opacity;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}

/* Contest Type Icons */
.contest-type-icon {
  background: linear-gradient(135deg, #9333ea 0%, #7c3aed 100%);
}

/* Action Button Animations */
.action-btn {
  transition: all 0.15s ease;
}

.action-btn:hover {
  transform: scale(1.05);
}

/* Tooltip Enhancements */
.tooltip {
  position: relative;
}

.tooltip:hover .tooltip-text {
  visibility: visible;
  opacity: 1;
}

.tooltip-text {
  visibility: hidden;
  opacity: 0;
  position: absolute;
  z-index: 10;
  bottom: 125%;
  left: 50%;
  transform: translateX(-50%);
  background-color: #1f2937;
  color: white;
  text-align: center;
  padding: 5px 8px;
  border-radius: 6px;
  font-size: 12px;
  transition: opacity 0.3s;
}

.tooltip-text::after {
  content: "";
  position: absolute;
  top: 100%;
  left: 50%;
  margin-left: -5px;
  border-width: 5px;
  border-style: solid;
  border-color: #1f2937 transparent transparent transparent;
}
</style>
  