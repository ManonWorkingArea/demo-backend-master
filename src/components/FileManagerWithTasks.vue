<template>
  <div class="file-manager-with-tasks">
    <!-- Tab Navigation -->
    <div class="bg-white border-b">
      <nav class="flex space-x-8 px-6">
        <button 
          @click="activeTab = 'filemanager'"
          :class="[
            'py-4 px-1 border-b-2 font-medium text-sm',
            activeTab === 'filemanager' 
              ? 'border-blue-500 text-blue-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          ]"
        >
          <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v0a2 2 0 002 2H6a2 2 0 002-2z" />
          </svg>
          File Manager
        </button>
        
        <button 
          @click="activeTab = 'tasks'"
          :class="[
            'py-4 px-1 border-b-2 font-medium text-sm relative',
            activeTab === 'tasks' 
              ? 'border-blue-500 text-blue-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          ]"
        >
          <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          Conversion Tasks
          
          <!-- Badge สำหรับ active tasks -->
          <span 
            v-if="activeTaskCount > 0" 
            class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
          >
            {{ activeTaskCount }}
          </span>
        </button>
      </nav>
    </div>

    <!-- Content Area -->
    <div class="flex-1">
      <!-- FileManager Tab -->
      <div v-if="activeTab === 'filemanager'" class="h-full">
        <FileManager 
          ref="fileManager"
          @conversion-started="handleConversionStarted"
          @file-converted="handleFileConverted"
        />
      </div>

      <!-- Tasks Tab -->
      <div v-if="activeTab === 'tasks'" class="h-full">
        <TaskManager 
          ref="taskManager"
          @task-completed="handleTaskCompleted"
          @task-failed="handleTaskFailed"
        />
      </div>
    </div>

    <!-- Floating Notification สำหรับ active conversions -->
    <div 
      v-if="activeTaskCount > 0 && activeTab !== 'tasks'" 
      class="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-3 rounded-lg shadow-lg max-w-sm"
    >
      <div class="flex items-center space-x-3">
        <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
        <div class="flex-1">
          <p class="text-sm font-medium">{{ activeTaskCount }} งานกำลังแปลง</p>
          <p class="text-xs opacity-90">คลิกเพื่อดูรายละเอียด</p>
        </div>
        <button 
          @click="activeTab = 'tasks'"
          class="text-white hover:text-blue-200"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import FileManager from '@/interface/template/FileManager.vue'
import TaskManager from '@/components/TaskManager.vue'

export default {
  name: 'FileManagerWithTasks',
  
  components: {
    FileManager,
    TaskManager
  },
  
  data() {
    return {
      activeTab: 'filemanager', // 'filemanager' หรือ 'tasks'
      activeTaskCount: 0
    }
  },
  
  mounted() {
    // ตรวจสอบ active tasks ทุก 30 วินาที
    this.checkActiveTasks();
    this.activeTaskInterval = setInterval(() => {
      this.checkActiveTasks();
    }, 30000);
  },
  
  beforeUnmount() {
    if (this.activeTaskInterval) {
      clearInterval(this.activeTaskInterval);
    }
  },
  
  methods: {
    /**
     * Event Handlers จาก FileManager
     */
    handleConversionStarted(conversionData) {
      console.log('🎬 Conversion started:', conversionData);
      
      // อัปเดต active task count
      this.checkActiveTasks();
      
      // แสดง notification
      this.$toast?.success?.('เริ่มการแปลงไฟล์แล้ว กำลังส่งไปยัง Task Manager');
    },
    
    handleFileConverted(fileData) {
      console.log('✅ File converted:', fileData);
      
      // รีเฟรช task list ถ้าเปิด tab tasks อยู่
      if (this.activeTab === 'tasks' && this.$refs.taskManager) {
        this.$refs.taskManager.refreshTasks();
      }
    },
    
    /**
     * Event Handlers จาก TaskManager
     */
    handleTaskCompleted(task) {
      console.log('✅ Task completed:', task);
      
      // อัปเดต active task count
      this.checkActiveTasks();
      
      // แสดง notification
      this.$toast?.success?.(`การแปลงไฟล์ "${task.fileName}" เสร็จสิ้นแล้ว`);
      
      // รีเฟรช FileManager ถ้าต้องการ
      if (this.$refs.fileManager) {
        this.$refs.fileManager.refreshFiles?.();
      }
    },
    
    handleTaskFailed(task) {
      console.log('❌ Task failed:', task);
      
      // อัปเดต active task count
      this.checkActiveTasks();
      
      // แสดง notification
      this.$toast?.error?.(`การแปลงไฟล์ "${task.fileName}" ผิดพลาด: ${task.errorMessage}`);
    },
    
    /**
     * Helper Methods
     */
    async checkActiveTasks() {
      try {
        if (this.$refs.taskManager) {
          // ใช้ TaskManager component เพื่อดึงข้อมูล
          await this.$refs.taskManager.loadTasks();
          const activeTasks = this.$refs.taskManager.tasks.filter(task => 
            task.status === 'pending' || task.status === 'processing'
          );
          this.activeTaskCount = activeTasks.length;
        } else {
          // Fallback: เรียก API โดยตรง
          const response = await fetch('/api/conversion_task/query', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              method: 'find',
              args: [{ 
                status: { $in: ['pending', 'processing'] } 
              }]
            })
          });
          
          if (response.ok) {
            const result = await response.json();
            this.activeTaskCount = Array.isArray(result.data) ? result.data.length : 0;
          }
        }
      } catch (error) {
        console.error('❌ Failed to check active tasks:', error);
      }
    },
    
    /**
     * Navigation Methods
     */
    switchToTasks() {
      this.activeTab = 'tasks';
    },
    
    switchToFileManager() {
      this.activeTab = 'filemanager';
    }
  }
}
</script>

<style scoped>
.file-manager-with-tasks {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f9fafb;
}

/* Animation */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Tab styles */
.py-4 {
  padding-top: 1rem;
  padding-bottom: 1rem;
}

.px-1 {
  padding-left: 0.25rem;
  padding-right: 0.25rem;
}

.border-b-2 {
  border-bottom-width: 2px;
}

.font-medium {
  font-weight: 500;
}

.text-sm {
  font-size: 0.875rem;
  line-height: 1.25rem;
}

/* Floating notification styles */
.fixed {
  position: fixed;
}

.bottom-4 {
  bottom: 1rem;
}

.right-4 {
  right: 1rem;
}

.bg-blue-600 {
  background-color: #2563eb;
}

.text-white {
  color: #ffffff;
}

.px-4 {
  padding-left: 1rem;
  padding-right: 1rem;
}

.py-3 {
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
}

.rounded-lg {
  border-radius: 0.5rem;
}

.shadow-lg {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.max-w-sm {
  max-width: 24rem;
}
</style>
