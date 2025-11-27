<template>
  <div class="task-manager p-6 bg-white rounded-lg shadow-lg">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-800">Task Manager</h2>
        <p class="text-gray-600 mt-1">จัดการงาน Video Conversion</p>
      </div>
      <div class="flex gap-2">
        <button 
          @click="refreshTasks"
          :disabled="loading"
          class="btn btn-secondary flex items-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          รีเฟรช
        </button>
        <button 
          @click="showCreateModal = true"
          class="btn btn-primary flex items-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          สร้างงานใหม่
        </button>
      </div>
    </div>

    <!-- Filter และ Search -->
    <div class="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
      <div class="flex-1 min-w-[250px]">
        <label class="block text-sm font-medium text-gray-700 mb-1">ค้นหา</label>
        <input 
          v-model="filters.search"
          @input="applyFilters"
          type="text" 
          placeholder="ค้นหาจากชื่อไฟล์หรือ task ID..."
          class="input w-full"
        >
      </div>
      <div class="w-40">
        <label class="block text-sm font-medium text-gray-700 mb-1">ประเภท</label>
                <select v-model="filters.type" class="px-3 py-2 border border-gray-300 rounded-md text-sm">
          <option value="">ทุกประเภท</option>
          <option value="conversion">แปลงวิดีโอ</option>
          <option value="trim">ตัดต่อวิดีโอ</option>
        </select>
      </div>
      <div class="w-40">
        <label class="block text-sm font-medium text-gray-700 mb-1">สถานะ</label>
        <select v-model="filters.status" @change="applyFilters" class="select w-full">
          <option value="">ทั้งหมด</option>
          <option value="pending">รอดำเนินการ</option>
          <option value="processing">กำลังประมวลผล</option>
          <option value="completed">เสร็จสิ้น</option>
          <option value="failed">ผิดพลาด</option>
        </select>
      </div>
      <div class="w-40">
        <label class="block text-sm font-medium text-gray-700 mb-1">คุณภาพ</label>
        <select v-model="filters.quality" @change="applyFilters" class="select w-full">
          <option value="">ทั้งหมด</option>
          <option value="720p">720p</option>
          <option value="1080p">1080p</option>
          <option value="480p">480p</option>
          <option value="original">ต้นฉบับ</option>
        </select>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading && tasks.length === 0" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <p class="mt-2 text-gray-600">กำลังโหลดข้อมูล...</p>
    </div>

    <!-- Tasks Table -->
    <div v-else-if="filteredTasks.length > 0" class="overflow-x-auto">
      <table class="w-full table-auto">
        <thead>
          <tr class="bg-gray-100 border-b">
            <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">Task ID</th>
            <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">ประเภท</th>
            <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">ไฟล์</th>
            <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">การตั้งค่า</th>
            <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">สถานะ</th>
            <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">ความคืบหน้า</th>
            <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">วันที่สร้าง</th>
            <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">การจัดการ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="task in filteredTasks" :key="task._id" class="border-b hover:bg-gray-50">
            <td class="px-4 py-3">
              <code class="text-xs bg-gray-100 px-2 py-1 rounded">{{ task.taskId || task._id }}</code>
            </td>
                      <td class="px-4 py-3 whitespace-nowrap">
            <div class="flex items-center">
              <span v-if="task.type === 'conversion'" 
                    class="inline-flex items-center px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                แปลงวิดีโอ
              </span>
              <span v-else-if="task.type === 'trim'" 
                    class="inline-flex items-center px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
                </svg>
                ตัดต่อวิดีโอ
              </span>
              <span v-else class="inline-flex items-center px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                {{ task.type || 'ไม่ระบุ' }}
              </span>
            </div>
          </td>
            <td class="px-4 py-3">
              <div class="flex flex-col">
                <span class="font-medium text-gray-900">{{ task.fileName || task.title || 'ไม่ระบุ' }}</span>
                <span class="text-xs text-gray-500">{{ task.originalPath || task.filePath || '-' }}</span>
              </div>
            </td>
            <td class="px-4 py-3">
              <!-- การแสดงผลการตั้งค่าแยกตามประเภท -->
              <div v-if="task.type === 'conversion'" class="flex flex-col space-y-1">
                <span class="inline-block px-2 py-1 text-xs rounded bg-blue-50 text-blue-700">
                  {{ task.quality || task.targetQuality || '720p' }}
                </span>
              </div>
              <div v-else-if="task.type === 'trim'" class="flex flex-col space-y-1">
                <span class="inline-block px-2 py-1 text-xs rounded bg-green-50 text-green-700">
                  {{ task.quality || task.metadata?.quality || '720p' }}
                </span>
                <span v-if="task.metadata?.conversionOptions?.trimMode === 'multi'" 
                      class="inline-block px-2 py-1 text-xs rounded bg-purple-50 text-purple-700">
                  {{ task.metadata.conversionOptions.segments?.length || 0 }} ช่วง
                </span>
                <span v-else-if="task.metadata?.conversionOptions?.duration" 
                      class="inline-block px-2 py-1 text-xs rounded bg-orange-50 text-orange-700">
                  {{ Math.round(task.metadata.conversionOptions.duration) }}s
                </span>
              </div>
              <div v-else class="text-xs text-gray-500">
                Quality: {{ task.quality || task.targetQuality || '-' }}
              </div>
            </td>
            <td class="px-4 py-3">
              <span :class="getStatusClass(task.status)" class="inline-block px-2 py-1 text-xs rounded-full">
                {{ getStatusText(task.status) }}
              </span>
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-2">
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    :class="getProgressColor(task.status)"
                    class="h-2 rounded-full transition-all duration-300" 
                    :style="{ width: `${task.progress || task.percent || 0}%` }"
                  ></div>
                </div>
                <span class="text-xs text-gray-600 min-w-[50px]">
                  {{ task.progress || task.percent || 0 }}%
                  <span v-if="task.progress !== task.percent" class="text-orange-500 text-xs">
                    ({{ task.percent }}%)
                  </span>
                </span>
              </div>
              <!-- Debug info -->
              <div v-if="task.status === 'processing'" class="text-xs text-gray-400 mt-1">
                ID: {{ task._id.slice(-4) }} | 
                Progress: {{ task.progress }} | 
                Percent: {{ task.percent }} |
                Transcode: {{ task.fileInfo?.transcode ? Object.keys(task.fileInfo.transcode).join(',') : 'none' }}
              </div>
            </td>
            <td class="px-4 py-3 text-sm text-gray-600">
              {{ formatDate(task.createdAt) }}
            </td>
            <td class="px-4 py-3">
              <div class="flex gap-1">
                <button 
                  @click="viewTask(task)"
                  class="btn-sm btn-secondary"
                  title="ดูรายละเอียด"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
                <button 
                  v-if="task.status === 'pending' || task.status === 'failed'"
                  @click="retryTask(task)"
                  class="btn-sm btn-warning"
                  title="ลองใหม่"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
                <button 
                  @click="deleteTask(task)"
                  class="btn-sm btn-danger"
                  title="ลบ"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">ไม่มีงานในระบบ</h3>
      <p class="mt-1 text-sm text-gray-500">เริ่มต้นด้วยการสร้างงาน conversion ใหม่</p>
    </div>

    <!-- Create Task Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 class="text-lg font-medium text-gray-900 mb-4">สร้างงาน Conversion ใหม่</h3>
        
        <form @submit.prevent="createTask">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">ชื่อไฟล์</label>
              <input 
                v-model="newTask.fileName"
                type="text" 
                required
                placeholder="ชื่อไฟล์วิดีโอ"
                class="input w-full"
              >
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Path ของไฟล์</label>
              <input 
                v-model="newTask.originalPath"
                type="text" 
                required
                placeholder="https://example.com/video.mp4"
                class="input w-full"
              >
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">คุณภาพเป้าหมาย</label>
              <select v-model="newTask.targetQuality" required class="select w-full">
                <option value="">เลือกคุณภาพ</option>
                <option value="480p">480p</option>
                <option value="720p">720p</option>
                <option value="1080p">1080p</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Storage ID</label>
              <input 
                v-model="newTask.storageId"
                type="text" 
                placeholder="MongoDB ObjectId (optional)"
                class="input w-full"
              >
            </div>
          </div>
          
          <div class="flex gap-3 mt-6">
            <button 
              type="button"
              @click="showCreateModal = false"
              class="flex-1 btn btn-secondary"
            >
              ยกเลิก
            </button>
            <button 
              type="submit"
              :disabled="loading"
              class="flex-1 btn btn-primary"
            >
              สร้างงาน
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Task Detail Modal -->
    <div v-if="selectedTask" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-start mb-4">
          <h3 class="text-lg font-medium text-gray-900">รายละเอียดงาน</h3>
          <button @click="selectedTask = null" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Task ID</label>
              <code class="block text-sm bg-gray-100 px-2 py-1 rounded mt-1">{{ selectedTask.taskId || selectedTask._id }}</code>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">ประเภท</label>
              <span v-if="selectedTask.type === 'conversion'" 
                    class="inline-flex items-center px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 mt-1">
                <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                แปลงวิดีโอ
              </span>
              <span v-else-if="selectedTask.type === 'trim'" 
                    class="inline-flex items-center px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 mt-1">
                <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
                </svg>
                ตัดต่อวิดีโอ
              </span>
              <span v-else class="inline-flex items-center px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800 mt-1">
                {{ selectedTask.type || 'ไม่ระบุ' }}
              </span>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">สถานะ</label>
              <span :class="getStatusClass(selectedTask.status)" class="inline-block px-2 py-1 text-xs rounded-full mt-1">
                {{ getStatusText(selectedTask.status) }}
              </span>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">ความคืบหน้า</label>
              <div class="mt-1">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-sm text-gray-900">{{ selectedTask.progress || 0 }}%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    :class="getProgressColor(selectedTask.status)"
                    class="h-2 rounded-full transition-all duration-300"
                    :style="{ width: `${selectedTask.progress || 0}%` }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700">ชื่อไฟล์</label>
            <p class="text-sm text-gray-900 mt-1">{{ selectedTask.fileName }}</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700">Path ต้นฉบับ</label>
            <p class="text-sm text-gray-600 mt-1 break-all">{{ selectedTask.originalPath }}</p>
          </div>
          
          <!-- การแสดงการตั้งค่าแยกตามประเภท -->
          <div v-if="selectedTask.type === 'conversion'">
            <label class="block text-sm font-medium text-gray-700">การตั้งค่าการแปลง</label>
            <div class="mt-1 p-3 bg-blue-50 rounded-lg">
              <div class="grid grid-cols-2 gap-2 text-sm">
                <div><strong>คุณภาพ:</strong> {{ selectedTask.targetQuality }}</div>
              </div>
            </div>
          </div>
          
          <div v-else-if="selectedTask.type === 'trim'">
            <label class="block text-sm font-medium text-gray-700">การตั้งค่าการตัดต่อ</label>
            <div class="mt-1 p-3 bg-green-50 rounded-lg">
              <div class="grid grid-cols-2 gap-2 text-sm">
                <div v-if="selectedTask.metadata?.quality">
                  <strong>คุณภาพ:</strong> {{ selectedTask.metadata.quality }}
                </div>
                <div v-if="selectedTask.metadata?.targetFormat">
                  <strong>รูปแบบ:</strong> {{ selectedTask.metadata.targetFormat.toUpperCase() }}
                </div>
                <div v-if="selectedTask.metadata?.conversionOptions?.trimMode">
                  <strong>โหมด:</strong> 
                  {{ selectedTask.metadata.conversionOptions.trimMode === 'multi' ? 'หลายช่วง' : 'ช่วงเดียว' }}
                </div>
                <div v-if="selectedTask.metadata?.conversionOptions?.audioVolume">
                  <strong>ระดับเสียง:</strong> {{ selectedTask.metadata.conversionOptions.audioVolume }}%
                </div>
              </div>
              
              <!-- แสดงข้อมูลช่วงการตัด -->
              <div v-if="selectedTask.metadata?.conversionOptions?.trimMode === 'multi' && selectedTask.metadata?.conversionOptions?.segments" class="mt-3">
                <strong class="text-sm">ช่วงที่เลือก:</strong>
                <div class="mt-1 max-h-32 overflow-y-auto">
                  <div v-for="(segment, index) in selectedTask.metadata.conversionOptions.segments" :key="index"
                       class="text-xs bg-white p-2 rounded border mb-1 last:mb-0">
                    ช่วงที่ {{ index + 1 }}: {{ Math.round(segment.start) }}s - {{ Math.round(segment.end) }}s 
                    ({{ Math.round(segment.duration) }}s)
                  </div>
                </div>
              </div>
              
              <div v-else-if="selectedTask.metadata?.conversionOptions?.startTime !== undefined && selectedTask.metadata?.conversionOptions?.endTime !== undefined" class="mt-3">
                <strong class="text-sm">ช่วงเวลา:</strong>
                <div class="text-xs bg-white p-2 rounded border mt-1">
                  {{ Math.round(selectedTask.metadata.conversionOptions.startTime) }}s - {{ Math.round(selectedTask.metadata.conversionOptions.endTime) }}s 
                  ({{ Math.round(selectedTask.metadata.conversionOptions.duration || 0) }}s)
                </div>
              </div>
              
              <!-- แสดงข้อมูล Text Overlays -->
              <div v-if="selectedTask.metadata?.conversionOptions?.textOverlays && selectedTask.metadata.conversionOptions.textOverlays.length > 0" class="mt-3">
                <strong class="text-sm">Text Overlays:</strong>
                <div class="mt-1 max-h-32 overflow-y-auto space-y-1">
                  <div v-for="(overlay, index) in selectedTask.metadata.conversionOptions.textOverlays" :key="`text-${index}`"
                       class="text-xs bg-white p-2 rounded border">
                    <div class="font-medium">{{ overlay.text || 'ไม่มีข้อความ' }}</div>
                    <div class="text-gray-500 mt-1">
                      {{ Math.round(overlay.timing?.start || 0) }}s - {{ Math.round(overlay.timing?.end || 0) }}s 
                      | {{ overlay.fontFamily || 'Arial' }} {{ overlay.fontSize || 24 }}px
                      | สี: {{ overlay.color || '#ffffff' }}
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- แสดงข้อมูล Image Overlays -->
              <div v-if="selectedTask.metadata?.conversionOptions?.imageOverlays && selectedTask.metadata.conversionOptions.imageOverlays.length > 0" class="mt-3">
                <strong class="text-sm">Image Overlays:</strong>
                <div class="mt-1 max-h-32 overflow-y-auto space-y-1">
                  <div v-for="(overlay, index) in selectedTask.metadata.conversionOptions.imageOverlays" :key="`image-${index}`"
                       class="text-xs bg-white p-2 rounded border">
                    <div class="font-medium">{{ overlay.imageUrl || 'ไม่มี URL รูปภาพ' }}</div>
                    <div class="text-gray-500 mt-1">
                      {{ Math.round(overlay.timing?.start || 0) }}s - {{ Math.round(overlay.timing?.end || 0) }}s 
                      | ขนาด: {{ overlay.position?.width || 100 }}x{{ overlay.position?.height || 100 }}px
                      | ตำแหน่ง: ({{ overlay.position?.x || 0 }}, {{ overlay.position?.y || 0 }})
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div v-if="selectedTask.outputPath">
            <label class="block text-sm font-medium text-gray-700">ไฟล์ผลลัพธ์</label>
            <p class="text-sm text-gray-600 mt-1 break-all">{{ selectedTask.outputPath }}</p>
          </div>
          
          <div v-if="selectedTask.errorMessage">
            <label class="block text-sm font-medium text-red-700">ข้อผิดพลาด</label>
            <p class="text-sm text-red-600 mt-1">{{ selectedTask.errorMessage }}</p>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">วันที่สร้าง</label>
              <p class="text-sm text-gray-900 mt-1">{{ formatDate(selectedTask.createdAt) }}</p>
            </div>
            <div v-if="selectedTask.updatedAt">
              <label class="block text-sm font-medium text-gray-700">อัปเดตล่าสุด</label>
              <p class="text-sm text-gray-900 mt-1">{{ formatDate(selectedTask.updatedAt) }}</p>
            </div>
          </div>
        </div>
        
        <div class="flex gap-3 mt-6">
          <button 
            v-if="selectedTask.status === 'pending' || selectedTask.status === 'failed'"
            @click="retryTask(selectedTask)"
            class="btn btn-warning"
          >
            ลองใหม่
          </button>
          <button 
            @click="selectedTask = null"
            class="btn btn-secondary ml-auto"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TaskManager',
  
  inject: ['apiRequest'], // Modern API approach
  
  data() {
    return {
      // Data
      tasks: [],
      filteredTasks: [],
      selectedTask: null,
      
      // UI State
      loading: false,
      showCreateModal: false,
      
      // Filters
      filters: {
        search: '',
        type: '',
        status: '',
        quality: ''
      },
      
      // New Task Form
      newTask: {
        fileName: '',
        originalPath: '',
        targetQuality: '',
        storageId: ''
      }
    }
  },
  
  mounted() {
    this.loadTasks();
    
    // เริ่ม auto refresh ทันที
    this.startAutoRefresh();
    
    // เพิ่ม manual testing functions
    this.setupManualTesting();
  },
  
  beforeUnmount() {
    this.stopAutoRefresh();
  },
  
  methods: {
    /**
     * API Methods - ใช้ Modern ApiRequest pattern
     */
    
    // Helper method สำหรับเรียก API (ตาม CRUD_API_USAGE_README.md)
    async makeApiCall(endpoint, method = 'GET', body = null) {
      if (!this.apiRequest) {
        throw new Error('ApiRequest service not available');
      }

      let fullEndpoint = endpoint;
      if (!endpoint.startsWith('http') && !endpoint.startsWith('/api')) {
        fullEndpoint = `/api/${endpoint.startsWith('/') ? endpoint.slice(1) : endpoint}`;
      }

      try {
        console.log(`🌐 API Call: ${method} ${fullEndpoint}`, body);
        const response = await this.apiRequest.apiCall(fullEndpoint, method, null, body);
        console.log(`✅ API Response:`, response);
        return response?.data || response;
      } catch (error) {
        console.error('❌ API Call Error:', error);
        throw error;
      }
    },
    
    // GET - ดึงข้อมูล tasks ทั้งหมด
    async loadTasks() {
      this.loading = true;
      try {
        console.log('📋 Loading conversion and trim tasks...');
        
        // ใช้ getConversionTasks จาก media.js ที่รองรับทั้ง conversion และ trim
        if (this.$parent && this.$parent.getConversionTasks && typeof this.$parent.getConversionTasks === 'function') {
          // เรียกแบบไม่กรอง status เพื่อดู tasks ทั้งหมด
          this.tasks = await this.$parent.getConversionTasks({ includeCompleted: true });
          console.log('📊 [DEBUG] Raw tasks from parent:', this.tasks);
        } else {
          // Fallback ใช้ API โดยตรง
          const tasks = await this.makeApiCall('conversion_task/query', 'POST', {
            method: 'find',
            args: [{}], // ดึงทั้งหมด
            options: { 
              sort: { createdAt: -1 }, // เรียงตามวันที่สร้าง (ใหม่สุดก่อน)
              limit: 100 
            }
          });
          this.tasks = Array.isArray(tasks) ? tasks : [];
        }
        
        console.log(`📊 [DEBUG] Tasks after loading:`, this.tasks.map(t => ({
          id: t._id?.slice(-4),
          type: t.type,
          status: t.status,
          progress: t.progress,
          percent: t.percent,
          fileName: t.fileName || t.title,
          hasFileInfo: !!t.fileInfo,
          transcodeKeys: t.fileInfo?.transcode ? Object.keys(t.fileInfo.transcode) : []
        })));
        
        this.applyFilters();
        
        // อัพเดต progress สำหรับ active tasks
        await this.updateTasksProgress();
        
        console.log(`✅ Loaded ${this.tasks.length} tasks, filtered: ${this.filteredTasks.length}`);
        
      } catch (error) {
        console.error('❌ Failed to load tasks:', error);
        this.$toast?.error?.('ไม่สามารถโหลดข้อมูลงานได้');
        this.tasks = [];
      } finally {
        this.loading = false;
      }
    },
    
    // POST - สร้าง task ใหม่
    async createTask() {
      this.loading = true;
      try {
        console.log('➕ Creating new conversion task...');
        
        const taskData = {
          fileName: this.newTask.fileName.trim(),
          originalPath: this.newTask.originalPath.trim(),
          targetQuality: this.newTask.targetQuality,
          storageId: this.newTask.storageId.trim() || undefined,
          status: 'pending',
          progress: 0,
          createdAt: new Date().toISOString(),
          site: 'fti.academy' // ตาม pattern ที่ใช้ใน convert API
        };
        
        const newTask = await this.makeApiCall('conversion_task/', 'POST', taskData);
        
        // เพิ่มเข้า tasks array
        this.tasks.unshift(newTask);
        this.applyFilters();
        
        // Reset form และปิด modal
        this.newTask = {
          fileName: '',
          originalPath: '',
          targetQuality: '',
          storageId: ''
        };
        this.showCreateModal = false;
        
        console.log('✅ Task created:', newTask);
        this.$toast?.success?.('สร้างงานเรียบร้อยแล้ว');
        
      } catch (error) {
        console.error('❌ Failed to create task:', error);
        this.$toast?.error?.('ไม่สามารถสร้างงานได้');
      } finally {
        this.loading = false;
      }
    },
    
    // PUT - อัปเดต task
    async updateTask(task, updates) {
      try {
        console.log(`🔄 Updating task ${task._id}...`, updates);
        
        const updatedData = {
          ...updates,
          updatedAt: new Date().toISOString(),
          _id: undefined // ลบ _id ออกตาม pattern
        };
        
        const updated = await this.makeApiCall(`conversion_task/${task._id}`, 'PUT', updatedData);
        
        // อัปเดตใน local array
        const index = this.tasks.findIndex(t => t._id === task._id);
        if (index !== -1) {
          this.tasks[index] = { ...this.tasks[index], ...updated };
          this.applyFilters();
        }
        
        console.log('✅ Task updated:', updated);
        return updated;
        
      } catch (error) {
        console.error('❌ Failed to update task:', error);
        this.$toast?.error?.('ไม่สามารถอัปเดตงานได้');
        throw error;
      }
    },
    
    // DELETE - ลบ task
    async deleteTask(task) {
      if (!confirm(`คุณต้องการลบงาน "${task.fileName}" หรือไม่?`)) {
        return;
      }
      
      try {
        console.log(`🗑️ Deleting task ${task._id}...`);
        
        await this.makeApiCall(`conversion_task/${task._id}`, 'DELETE');
        
        // ลบออกจาก local array
        this.tasks = this.tasks.filter(t => t._id !== task._id);
        this.applyFilters();
        
        // ปิด modal ถ้าเปิดอยู่
        if (this.selectedTask?._id === task._id) {
          this.selectedTask = null;
        }
        
        console.log('✅ Task deleted');
        this.$toast?.success?.('ลบงานเรียบร้อยแล้ว');
        
      } catch (error) {
        console.error('❌ Failed to delete task:', error);
        this.$toast?.error?.('ไม่สามารถลบงานได้');
      }
    },
    
    /**
     * UI Helper Methods
     */
    
    async refreshTasks() {
      console.log('🔄 Manual refresh tasks...');
      await this.loadTasks();
    },

    // เริ่ม auto refresh system
    startAutoRefresh() {
      console.log('🔄 Starting auto refresh system...');
      
      // ตรวจสอบและ refresh ทุก 10 วินาที สำหรับ active tasks
      this.fastRefreshInterval = setInterval(async () => {
        if (this.hasActiveTasks()) {
          console.log('🔄 Starting fast refresh (10s) - มี task ที่ยังไม่เสร็จ');
          await this.updateTasksProgress();
        }
      }, 10000); // 10 วินาทีสำหรับ active tasks
      
      // Refresh ข้อมูลทั้งหมดทุก 30 วินาที
      this.refreshInterval = setInterval(async () => {
        console.log('🔄 Starting full refresh (30s)');
        await this.loadTasks();
      }, 30000); // 30 วินาทีสำหรับ full refresh
    },

    // หยุด auto refresh system
    stopAutoRefresh() {
      if (this.fastRefreshInterval) {
        clearInterval(this.fastRefreshInterval);
        this.fastRefreshInterval = null;
      }
      if (this.refreshInterval) {
        clearInterval(this.refreshInterval);
        this.refreshInterval = null;
      }
      console.log('🛑 Auto refresh system stopped');
    },
    
    async retryTask(task) {
      await this.updateTask(task, {
        status: 'pending',
        progress: 0,
        errorMessage: null
      });
      this.$toast?.info?.('ส่งงานเข้าคิวใหม่แล้ว');
    },
    
    viewTask(task) {
      this.selectedTask = task;
    },
    
    applyFilters() {
      let filtered = [...this.tasks];
      
      // Search filter
      if (this.filters.search) {
        const search = this.filters.search.toLowerCase();
        filtered = filtered.filter(task => 
          task.fileName?.toLowerCase().includes(search) ||
          task.taskId?.toLowerCase().includes(search) ||
          task._id?.toLowerCase().includes(search)
        );
      }
      
      // Type filter
      if (this.filters.type) {
        filtered = filtered.filter(task => task.type === this.filters.type);
      }
      
      // Status filter
      if (this.filters.status) {
        filtered = filtered.filter(task => task.status === this.filters.status);
      }
      
      // Quality filter
      if (this.filters.quality) {
        filtered = filtered.filter(task => {
          // สำหรับ conversion tasks
          if (task.targetQuality === this.filters.quality) return true;
          
          // สำหรับ trim tasks
          if (task.targetSettings?.quality === this.filters.quality) return true;
          
          return false;
        });
      }
      
      this.filteredTasks = filtered;
    },
    
    hasActiveTasks() {
      return this.tasks.some(task => 
        task.status === 'pending' || task.status === 'processing'
      );
    },

    // อัพเดต progress สำหรับ active tasks
    async updateTasksProgress() {
      try {
        console.log('🔄 [DEBUG] updateTasksProgress called');
        
        const activeTasks = this.tasks.filter(task => 
          task.status === 'pending' || task.status === 'processing'
        );

        console.log(`🎯 [DEBUG] Found ${activeTasks.length} active tasks:`, activeTasks.map(t => ({
          id: t._id,
          type: t.type,
          status: t.status,
          quality: t.quality || t.metadata?.quality
        })));

        if (activeTasks.length === 0) {
          console.log('ℹ️ No active tasks to update progress');
          return;
        }

        console.log(`🔄 Updating progress for ${activeTasks.length} active tasks`);

        // อัพเดต progress สำหรับแต่ละ task
        for (const task of activeTasks) {
          console.log(`🔄 [DEBUG] Processing task: ${task._id} (${task.type})`);
          
          if (task.fileInfo && task.fileInfo.transcode) {
            const quality = task.quality || task.metadata?.quality || '720p';
            
            // สร้าง key ตามประเภท task
            let progressKey;
            if (task.type === 'trim') {
              progressKey = `trim_${quality}`;
            } else {
              progressKey = quality; // สำหรับ conversion
            }
            
            const progressValue = task.fileInfo.transcode[progressKey];
            
            console.log(`🎯 [DEBUG] Checking ${progressKey}: ${progressValue} (${typeof progressValue})`);
            
            // ถ้าได้ตัวเลข = progress %
            if (typeof progressValue === 'number' && progressValue > 0) {
              console.log(`📊 [DEBUG] Found progress: ${progressValue}% - updating task!`);
              
              try {
                await this.updateTask(task, {
                  progress: progressValue,
                  status: progressValue >= 100 ? 'completed' : 'processing'
                });
                console.log(`✅ [DEBUG] Task updated to ${progressValue}%`);
              } catch (error) {
                console.error(`❌ [DEBUG] Failed to update task:`, error);
              }
            }
            // ถ้าได้ URL = เสร็จแล้ว
            else if (typeof progressValue === 'string' && progressValue.startsWith('http')) {
              console.log(`✅ [DEBUG] Task ${task._id} completed with URL!`);
              
              try {
                await this.updateTask(task, {
                  progress: 100,
                  status: 'completed',
                  outputPath: progressValue
                });
                console.log(`✅ [DEBUG] Task marked as completed`);
              } catch (error) {
                console.error(`❌ [DEBUG] Failed to mark task as completed:`, error);
              }
            } else {
              console.log(`⚠️ [DEBUG] No progress data for ${progressKey}: ${progressValue}`);
            }
          } else {
            console.log(`⚠️ [DEBUG] No fileInfo or transcode data for task: ${task._id}`);
          }
        }

        // รีเฟรช tasks หลังอัพเดต progress
        if (this.$parent && this.$parent.getConversionTasks && typeof this.$parent.getConversionTasks === 'function') {
          console.log(`🔄 [DEBUG] Refreshing tasks after progress update`);
          this.tasks = await this.$parent.getConversionTasks({ includeCompleted: true });
          this.applyFilters();
          console.log(`✅ [DEBUG] Tasks refreshed, new count: ${this.tasks.length}`);
        }

      } catch (error) {
        console.error('❌ Error updating tasks progress:', error);
      }
    },
    
    /**
     * Display Helper Methods
     */
    
    getStatusText(status) {
      const statusMap = {
        pending: 'รอดำเนินการ',
        processing: 'กำลังประมวลผล',
        completed: 'เสร็จสิ้น',
        failed: 'ผิดพลาด'
      };
      return statusMap[status] || status;
    },
    
    getStatusClass(status) {
      const classMap = {
        pending: 'bg-yellow-100 text-yellow-800',
        processing: 'bg-blue-100 text-blue-800',
        completed: 'bg-green-100 text-green-800',
        failed: 'bg-red-100 text-red-800'
      };
      return classMap[status] || 'bg-gray-100 text-gray-800';
    },
    
    getProgressColor(status) {
      const colorMap = {
        pending: 'bg-yellow-500',
        processing: 'bg-blue-500',
        completed: 'bg-green-500',
        failed: 'bg-red-500'
      };
      return colorMap[status] || 'bg-gray-500';
    },
    
    formatDate(dateString) {
      if (!dateString) return '-';
      
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    },

    // ทดสอบ progress polling ด้วยตนเอง (สำหรับ debug)
    async testProgressPolling() {
      try {
        console.log('🧪 [MANUAL] Manual progress test started');
        
        const activeTasks = this.tasks.filter(task => 
          task.status === 'pending' || task.status === 'processing'
        );
        
        console.log(`🎯 [MANUAL] Found ${activeTasks.length} active tasks`);
        
        if (activeTasks.length === 0) {
          console.log('❌ [MANUAL] No active tasks found for testing');
          return;
        }
        
        const testTask = activeTasks[0];
        console.log(`🧪 [MANUAL] Testing with task:`, {
          id: testTask._id,
          type: testTask.type,
          status: testTask.status,
          progress: testTask.progress,
          quality: testTask.quality || testTask.metadata?.quality,
          hasFileInfo: !!testTask.fileInfo,
          transcode: testTask.fileInfo?.transcode
        });
        
        // ทดสอบ direct progress check
        if (testTask.fileInfo && testTask.fileInfo.transcode) {
          const quality = testTask.quality || testTask.metadata?.quality || '720p';
          
          // สร้าง key ตามประเภท task
          let progressKey;
          if (testTask.type === 'trim') {
            progressKey = `trim_${quality}`;
          } else {
            progressKey = quality;
          }
          
          const progressValue = testTask.fileInfo.transcode[progressKey];
          
          console.log(`🎯 [MANUAL] Checking ${progressKey}: ${progressValue} (${typeof progressValue})`);
          
          if (typeof progressValue === 'number' && progressValue > 0) {
            console.log(`📊 [MANUAL] Found progress: ${progressValue}% - updating task now!`);
            
            try {
              const updateResult = await this.updateTask(testTask, {
                progress: progressValue,
                status: progressValue >= 100 ? 'completed' : 'processing'
              });
              console.log(`✅ [MANUAL] Task update result:`, updateResult);
              
              // บังคับ re-render
              this.$forceUpdate();
              
              // รีเฟรช tasks
              setTimeout(async () => {
                await this.loadTasks();
                console.log(`🔄 [MANUAL] Tasks reloaded after update`);
              }, 1000);
              
              return {
                success: true,
                oldProgress: testTask.progress,
                newProgress: progressValue,
                status: progressValue >= 100 ? 'completed' : 'processing',
                progressKey: progressKey
              };
            } catch (error) {
              console.error(`❌ [MANUAL] Failed to update task:`, error);
              return { success: false, error: error.message };
            }
          } else if (typeof progressValue === 'string' && progressValue.startsWith('http')) {
            console.log(`✅ [MANUAL] Task completed with URL: ${progressValue}`);
            
            try {
              const updateResult = await this.updateTask(testTask, {
                progress: 100,
                status: 'completed',
                outputPath: progressValue
              });
              console.log(`✅ [MANUAL] Task marked as completed:`, updateResult);
              
              // บังคับ re-render
              this.$forceUpdate();
              
              // รีเฟรช tasks
              setTimeout(async () => {
                await this.loadTasks();
                console.log(`🔄 [MANUAL] Tasks reloaded after completion`);
              }, 1000);
              
              return {
                success: true,
                oldProgress: testTask.progress,
                newProgress: 100,
                status: 'completed',
                outputUrl: progressValue,
                progressKey: progressKey
              };
            } catch (error) {
              console.error(`❌ [MANUAL] Failed to mark task as completed:`, error);
              return { success: false, error: error.message };
            }
          } else {
            console.log(`⚠️ [MANUAL] No valid progress data: ${progressValue}`);
            console.log(`🔍 [MANUAL] Available transcode keys:`, Object.keys(testTask.fileInfo.transcode));
            return { 
              success: false, 
              error: 'No valid progress data',
              progressKey: progressKey,
              availableKeys: Object.keys(testTask.fileInfo.transcode),
              transcodeData: testTask.fileInfo.transcode
            };
          }
        } else {
          console.log(`❌ [MANUAL] No fileInfo or transcode data`);
          return { success: false, error: 'No fileInfo or transcode data' };
        }
        
      } catch (error) {
        console.error('❌ [MANUAL] Manual test error:', error);
        return { success: false, error: error.message };
      }
    },

    // เพิ่มฟังก์ชันทดสอบ manual ใน global scope
    setupManualTesting() {
      // เพิ่มฟังก์ชันทดสอบใน window เพื่อเรียกจาก console
      window.testTaskProgress = () => this.testProgressPolling();
      window.forceUpdateProgress = async () => {
        console.log('🔧 [FORCE] Forcing progress update...');
        await this.updateTasksProgress();
      };
      window.forceTaskRefresh = async () => {
        console.log('🔄 [FORCE] Forcing task refresh...');
        await this.loadTasks();
      };
      window.debugTaskData = () => {
        console.log('📊 [DEBUG] Current task data:', {
          totalTasks: this.tasks.length,
          activeTasks: this.tasks.filter(t => t.status === 'pending' || t.status === 'processing').length,
          trimTasks: this.tasks.filter(t => t.type === 'trim'),
          taskStatuses: this.tasks.map(t => ({ id: t._id, type: t.type, status: t.status, progress: t.progress }))
        });
      };
      console.log('🎯 Manual testing functions added to window:');
      console.log('  - window.testTaskProgress() - ทดสอบอัพเดต progress');
      console.log('  - window.forceUpdateProgress() - บังคับรัน updateTasksProgress');
      console.log('  - window.forceTaskRefresh() - บังคับรีเฟรช tasks');
      console.log('  - window.debugTaskData() - ดูข้อมูล tasks ปัจจุบัน');
    }
  }
}
</script>

<style scoped>
/* Button Styles */
.btn {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: colors 0.2s;
  outline: none;
  border: none;
  cursor: pointer;
}

.btn:focus {
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
}

.btn-primary {
  background-color: #2563eb;
  color: white;
}

.btn-primary:hover {
  background-color: #1d4ed8;
}

.btn-secondary {
  background-color: #4b5563;
  color: white;
}

.btn-secondary:hover {
  background-color: #374151;
}

.btn-warning {
  background-color: #d97706;
  color: white;
}

.btn-warning:hover {
  background-color: #b45309;
}

.btn-danger {
  background-color: #dc2626;
  color: white;
}

.btn-danger:hover {
  background-color: #b91c1c;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Form Styles */
.input {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.select {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  outline: none;
  background-color: white;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.select:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

/* Table Styles */
table {
  border-collapse: collapse;
}

th {
  font-weight: 600;
}

tr:last-child {
  border-bottom: none;
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
</style>
