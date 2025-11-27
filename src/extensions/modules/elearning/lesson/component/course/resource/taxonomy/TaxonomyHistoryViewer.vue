<template>
  <div class="taxonomy-history-viewer">
    <!-- History Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-4 border border-gray-300 w-11/12 max-w-4xl shadow-lg rounded-lg bg-white">
        <!-- Header -->
        <div class="flex justify-between items-center pb-3 border-b border-gray-200 mb-4">
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">
              ประวัติการเปลี่ยนแปลง - {{ targetName }}
            </h3>
            <!-- Term Type Indicator -->
            <div class="flex items-center gap-2 mb-2">
              <span v-if="targetType === 'group'" class="px-2 py-1 bg-green-100 text-green-700 rounded text-sm font-medium">
                Taxonomy Group
              </span>
              <span v-else class="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm font-medium">
                Term (รวมถึง Sub Terms)
              </span>
            </div>
            <!-- Info Box -->
            <div class="text-xs text-gray-600 bg-gray-50 p-2 rounded border border-gray-200">
              <strong>การแสดงประวัติ:</strong>
              <span class="text-blue-600 font-medium">Main Terms</span> แสดงด้วยพื้นหลังสีขาว | 
              <span class="text-purple-600 font-medium">Sub Terms</span> แสดงด้วย └─ prefix
            </div>
          </div>
          <button @click="closeModal" class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors ml-4">
            <i class="fas fa-times text-lg"></i>
          </button>
        </div>

        <!-- Filters -->
        <div class="py-3 border border-gray-200 bg-gray-50 rounded-lg mb-4">
          <div class="flex flex-wrap gap-4 px-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                ประเภทการเปลี่ยนแปลง:
              </label>
              <select v-model="filterAction" @change="loadHistory" class="block w-40 rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm">
                <option value="">ทั้งหมด</option>
                <option value="CREATE">สร้าง</option>
                <option value="UPDATE">แก้ไข</option>
                <option value="DELETE">ลบ</option>
                <option value="ROLLBACK">กู้คืน</option>
                <option value="SUB_CREATE">เพิ่ม Sub Term</option>
                <option value="SUB_UPDATE">แก้ไข Sub Term</option>
                <option value="SUB_DELETE">ลบ Sub Term</option>
              </select>
            </div>
            
            <!-- Term Type Filter (only for term history) -->
            <div v-if="targetType === 'term'">
              <label class="block text-sm font-medium text-gray-700 mb-1">
                ระดับ Term:
              </label>
              <select v-model="filterTermType" @change="loadHistory" class="block w-40 rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm">
                <option value="">ทั้งหมด</option>
                <option value="main">Main Term เท่านั้น</option>
                <option value="sub">Sub Terms เท่านั้น</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                ช่วงเวลา:
              </label>
              <select v-model="filterPeriod" @change="loadHistory" class="block w-32 rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm">
                <option value="">ทั้งหมด</option>
                <option value="today">วันนี้</option>
                <option value="week">7 วันที่ผ่านมา</option>
                <option value="month">30 วันที่ผ่านมา</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                ผู้ดำเนินการ:
              </label>
              <input v-model="filterUser" @input="loadHistory" placeholder="ชื่อผู้ใช้..." class="block w-40 rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm">
            </div>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="text-center py-8">
          <div class="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p class="text-gray-600">กำลังโหลดประวัติ...</p>
        </div>

        <!-- History List -->
        <div v-else class="max-h-96 overflow-y-auto bg-white rounded-lg border border-gray-200">
          <div v-if="historyList.length === 0" class="text-center py-8 text-gray-500">
            <div class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <i class="fas fa-inbox text-gray-400 text-lg"></i>
            </div>
            <h3 class="text-base font-medium text-gray-900 mb-2">ไม่มีประวัติการเปลี่ยนแปลง</h3>
            <p class="text-sm text-gray-500">ยังไม่มีการแก้ไขหรือเปลี่ยนแปลงใดๆ</p>
          </div>
          
          <div v-for="(item, index) in historyList" :key="item._id" 
               class="border border-gray-200 rounded-md p-3 mb-3 bg-white hover:bg-gray-50 transition-colors">
            <!-- History Item Header -->
            <div class="flex justify-between items-start mb-2">
              <div class="flex-1">
                <!-- Action and basic info in one line -->
                <div class="flex items-center gap-3 mb-2">
                  <!-- Action Badge - simplified -->
                  <span :class="getActionBadgeClass(item.action)" class="px-2 py-1 rounded text-xs font-medium">
                    {{ getActionText(item.action) }}
                  </span>
                  
                  <!-- Sub Term indicator - simplified -->
                  <span v-if="item.isSubTerm" class="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded">
                    Sub Term
                  </span>
                  
                  <!-- User info - simplified -->
                  <span class="text-xs text-gray-600">
                    {{ item.userName || item.userId }}
                  </span>
                  
                  <!-- Time info - simplified -->
                  <span class="text-xs text-gray-500">
                    {{ formatDate(item.timestamp) }}
                  </span>
                </div>
                
                <!-- Term Name - simplified layout -->
                <div class="text-sm font-medium text-gray-900">
                  <span v-if="item.isSubTerm" class="text-purple-600 mr-2">└─</span>
                  {{ item.targetName }}
                </div>
              </div>
              
              <!-- Action Buttons - simplified -->
              <div class="flex items-center gap-2 ml-3">
                <button @click="toggleDiff(index)" class="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors">
                  {{ item.showDiff ? 'ซ่อน' : 'ดู' }}
                </button>
                <button v-if="item.action !== 'DELETE' && canRollback(item)" @click="confirmRollback(item)" class="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition-colors">
                  กู้คืน
                </button>
              </div>
            </div>

            <!-- Diff Viewer - simplified -->
            <div v-if="item.showDiff" class="mt-2 bg-gray-50 rounded-md p-3 border border-gray-200">
              <div class="text-sm font-medium text-gray-700 mb-2">รายละเอียดการเปลี่ยนแปลง:</div>
              
              <!-- Before/After for UPDATE -->
              <div v-if="item.action === 'UPDATE' && item.diff" class="grid grid-cols-2 gap-3">
                <div class="bg-red-50 p-2 rounded border-l-2 border-red-300">
                  <div class="text-xs font-medium text-red-700 mb-1">ก่อนแก้ไข:</div>
                  <pre class="text-xs text-red-600 whitespace-pre-wrap">{{ formatDiffData(item.diff.before) }}</pre>
                </div>
                <div class="bg-green-50 p-2 rounded border-l-2 border-green-300">
                  <div class="text-xs font-medium text-green-700 mb-1">หลังแก้ไข:</div>
                  <pre class="text-xs text-green-600 whitespace-pre-wrap">{{ formatDiffData(item.diff.after) }}</pre>
                </div>
              </div>
              
              <!-- Data for CREATE/DELETE -->
              <div v-else-if="item.data" class="bg-blue-50 p-2 rounded border-l-2 border-blue-300">
                <div class="text-xs font-medium text-blue-700 mb-1">ข้อมูล:</div>
                <pre class="text-xs text-blue-600 whitespace-pre-wrap">{{ formatDiffData(item.data) }}</pre>
              </div>

              <!-- Change Summary -->
              <div v-if="item.action === 'UPDATE' && item.changesSummary" class="mt-2 pt-2 border-t border-gray-200">
                <div class="text-xs font-medium text-gray-700 mb-1">สรุปการเปลี่ยนแปลง:</div>
                <ul class="text-xs text-gray-600 space-y-1">
                  <li v-for="change in item.changesSummary" :key="change.field" class="bg-white p-1 rounded">
                    <strong>{{ change.field }}:</strong> 
                    <span class="text-red-600">{{ change.from }}</span> → 
                    <span class="text-green-600">{{ change.to }}</span>
                  </li>
                </ul>
              </div>
            </div>

            <!-- Version Info - simplified -->
            <div class="text-xs text-gray-500 mt-2 flex items-center justify-between">
              <span>Version: {{ item.version }}</span>
              <span>ID: {{ item._id }}</span>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="flex justify-center mt-4 pt-4 border-t border-gray-200">
          <nav class="flex rounded-md shadow-sm">
            <button @click="changePage(currentPage - 1)" :disabled="currentPage === 1" class="px-3 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
              ก่อนหน้า
            </button>
            <span class="px-4 py-2 border-t border-b border-gray-300 bg-white text-sm font-medium text-gray-700">
              {{ currentPage }} / {{ totalPages }}
            </span>
            <button @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages" class="px-3 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
              ถัดไป
            </button>
          </nav>
        </div>

        <!-- Actions -->
        <div class="flex justify-end pt-4 mt-4 border-t border-gray-200 gap-2">
          <button @click="closeModal" class="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 font-medium">
            ปิด
          </button>
          <button @click="exportHistory" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium">
            ส่งออกประวัติ
          </button>
          <button @click="purgeTargetLogs" class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-medium">
            ลบประวัติทั้งหมด
          </button>
        </div>
      </div>
    </div>

    <!-- Rollback Confirmation Modal -->
    <div v-if="showRollbackModal" class="fixed inset-0 bg-black bg-opacity-75 overflow-y-auto h-full w-full" style="z-index: 9999;">
      <div class="relative top-1/3 mx-auto p-4 border border-gray-300 w-96 shadow-lg rounded-lg bg-white">
        <div class="text-center">
          <!-- Header -->
          <div class="mb-4 pb-3 border-b border-gray-200">
            <div class="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <i class="fas fa-exclamation-triangle text-yellow-600 text-lg"></i>
            </div>
            <h3 class="text-lg font-semibold text-gray-900">
              ยืนยันการกู้คืน
            </h3>
          </div>
          
          <div class="mt-4">
            <p class="text-sm text-gray-600 mb-4">
              คุณต้องการกู้คืนข้อมูลกลับไปเป็น version<br>
              <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded font-medium">{{ selectedRollbackItem?.version }}</span>
              หรือไม่?
            </p>
            
            <!-- Show rollback data preview -->
            <div v-if="selectedRollbackItem" class="mb-4 p-3 bg-gray-50 rounded text-left max-h-48 overflow-y-auto border border-gray-200">
              <h4 class="font-medium text-sm mb-2 text-gray-700">
                ข้อมูลที่จะกู้คืน:
              </h4>
              <div class="text-xs">
                <div v-if="selectedRollbackItem.action === 'UPDATE' && selectedRollbackItem.diff?.before">
                  <pre class="whitespace-pre-wrap text-xs bg-white p-2 rounded border border-gray-200 font-mono">{{ JSON.stringify(selectedRollbackItem.diff.before, null, 2) }}</pre>
                </div>
                <div v-else-if="selectedRollbackItem.data">
                  <pre class="whitespace-pre-wrap text-xs bg-white p-2 rounded border border-gray-200 font-mono">{{ JSON.stringify(selectedRollbackItem.data, null, 2) }}</pre>
                </div>
                <div v-else class="text-red-600 bg-red-50 p-2 rounded border border-red-200">
                  ไม่พบข้อมูลสำหรับ rollback
                </div>
              </div>
            </div>
            
            <p class="text-xs text-orange-600 mb-4 bg-orange-50 p-2 rounded border border-orange-200">
              การกู้คืนจะสร้างประวัติใหม่ และไม่สามารถยกเลิกได้
            </p>
            
            <div class="flex justify-center gap-3">
              <button 
                @click="showRollbackModal = false" 
                :disabled="rollbackLoading"
                class="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium">
                ยกเลิก
              </button>
              <button 
                @click="executeRollback" 
                :disabled="rollbackLoading"
                class="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium">
                <span v-if="rollbackLoading" class="inline-flex items-center">
                  <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  กำลังกู้คืน...
                </span>
                <span v-else>
                  กู้คืนแน่นอน
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import storageManager from '@/plugins/storage'
import toast from '@/plugins/ToastUI.js'
import dialog from '@/plugins/Dialog.js'

export default {
  name: 'TaxonomyHistoryViewer',
  
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    targetType: {
      type: String, // 'group' or 'term'
      required: true
    },
    targetId: {
      type: [String, Number],
      required: true
    },
    targetName: {
      type: String,
      default: ''
    }
  },

  emits: ['close', 'rollback-complete'],

  setup(props, { emit }) {
    // Get configs from storage
    const configs = storageManager.get('configs')
    
    const showModal = ref(false)
    const loading = ref(false)
    const historyList = ref([])
    const currentPage = ref(1)
    const totalPages = ref(1)
    const pageSize = ref(10)
    
    // Filters
    const filterAction = ref('')
    const filterPeriod = ref('')
    const filterUser = ref('')
    const filterTermType = ref('')
    
    // Rollback
    const showRollbackModal = ref(false)
    const selectedRollbackItem = ref(null)
    const rollbackLoading = ref(false)

    const showModalComputed = computed({
      get: () => props.visible,
      set: (value) => {
        showModal.value = value
      }
    })

    const loadHistory = async () => {
      if (!props.targetId) return
      
      loading.value = true
      try {
        // Build base query for the audit collection
        const baseQueryFilters = {
          targetType: props.targetType,
          targetId: props.targetId
        }

        // If this is a term, also get history of its sub terms
        let queryFilters = [baseQueryFilters]
        
        if (props.targetType === 'term') {
          // Get all descendant terms to include their history too
          const descendantsResponse = await fetch('https://gateway.cloudrestfulapi.com/api/taxonomy/query', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'client-token-key': configs.key
            },
            body: JSON.stringify({
              method: 'find',
              args: [{ type: 'term', parentId: props.targetId }],
              paging: { page: 1, limit: 1000 }
            })
          })

          if (descendantsResponse.ok) {
            const descendantsResult = await descendantsResponse.json()
            const descendantIds = descendantsResult.data?.map(term => term._id) || []
            
            // Add descendant terms to the query
            descendantIds.forEach(descendantId => {
              queryFilters.push({
                targetType: 'term',
                targetId: descendantId
              })
            })
          }
        }

        // Apply additional filters
        const finalQuery = {
          $or: queryFilters
        }

        if (filterAction.value) finalQuery.action = filterAction.value
        if (filterUser.value) finalQuery.userName = { $regex: filterUser.value, $options: 'i' }
        
        // Add period filter
        if (filterPeriod.value) {
          const now = new Date()
          let fromDate = new Date()
          
          switch (filterPeriod.value) {
            case 'today':
              fromDate.setHours(0, 0, 0, 0)
              break
            case 'week':
              fromDate.setDate(now.getDate() - 7)
              break
            case 'month':
              fromDate.setDate(now.getDate() - 30)
              break
          }
          
          finalQuery.timestamp = { $gte: fromDate.toISOString() }
        }

        const response = await fetch('https://gateway.cloudrestfulapi.com/api/taxonomy_audit/query', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'client-token-key': configs.key
          },
          body: JSON.stringify({
            method: 'find',
            args: [finalQuery],
            paging: { page: currentPage.value, limit: pageSize.value },
            sort: { timestamp: -1 } // Sort by newest first
          })
        })
        
        if (response.ok) {
          const result = await response.json()
          let filteredData = result.data.map(item => ({
            ...item,
            showDiff: false,
            isSubTerm: item.targetId !== props.targetId // Mark if this is a sub term's history
          }))
          
          // Apply term type filter if specified
          if (filterTermType.value) {
            if (filterTermType.value === 'main') {
              filteredData = filteredData.filter(item => !item.isSubTerm)
            } else if (filterTermType.value === 'sub') {
              filteredData = filteredData.filter(item => item.isSubTerm)
            }
          }
          
          historyList.value = filteredData
          totalPages.value = Math.ceil((result.total || 0) / pageSize.value)
        } else {
          console.error('Failed to load history')
          historyList.value = []
        }
      } catch (error) {
        console.error('Error loading history:', error)
        historyList.value = []
      } finally {
        loading.value = false
      }
    }

    const getActionText = (action) => {
      const actionMap = {
        'CREATE': 'สร้าง',
        'UPDATE': 'แก้ไข',
        'DELETE': 'ลบ',
        'ROLLBACK': 'กู้คืน',
        'SUB_CREATE': 'เพิ่ม Sub Term',
        'SUB_UPDATE': 'แก้ไข Sub Term', 
        'SUB_DELETE': 'ลบ Sub Term'
      }
      return actionMap[action] || action
    }

    const getActionBadgeClass = (action) => {
      const classMap = {
        'CREATE': 'bg-green-100 text-green-800',
        'UPDATE': 'bg-blue-100 text-blue-800',
        'DELETE': 'bg-red-100 text-red-800',
        'ROLLBACK': 'bg-yellow-100 text-yellow-800',
        'SUB_CREATE': 'bg-emerald-100 text-emerald-800',
        'SUB_UPDATE': 'bg-sky-100 text-sky-800',
        'SUB_DELETE': 'bg-rose-100 text-rose-800'
      }
      return classMap[action] || 'bg-gray-100 text-gray-800'
    }

    const getActionBorderClass = (action) => {
      const classMap = {
        'CREATE': 'border-green-300',
        'UPDATE': 'border-blue-300',
        'DELETE': 'border-red-300',
        'ROLLBACK': 'border-yellow-300',
        'SUB_CREATE': 'border-emerald-300',
        'SUB_UPDATE': 'border-sky-300',
        'SUB_DELETE': 'border-rose-300'
      }
      return classMap[action] || 'border-gray-300'
    }

    const formatDate = (timestamp) => {
      return new Date(timestamp).toLocaleString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const formatDiffData = (data) => {
      if (typeof data === 'object') {
        return JSON.stringify(data, null, 2)
      }
      return String(data)
    }

    const toggleDiff = (index) => {
      historyList.value[index].showDiff = !historyList.value[index].showDiff
    }

    const canRollback = (item) => {
      // ไม่สามารถ rollback รายการที่ล่าสุด (index 0) หรือรายการที่ถูกลบ
      return item.action !== 'DELETE' && historyList.value.indexOf(item) !== 0
    }

    const confirmRollback = (item) => {
      selectedRollbackItem.value = item
      showRollbackModal.value = true
    }

    const executeRollback = async () => {
      if (!selectedRollbackItem.value || rollbackLoading.value) return

      rollbackLoading.value = true
      
      try {
        // Get the data to rollback to
        const rollbackToData = selectedRollbackItem.value.data || selectedRollbackItem.value.diff?.before
        
        console.log('📝 Rollback Debug Info:')
        console.log('Selected item:', selectedRollbackItem.value)
        console.log('Rollback to data:', rollbackToData)
        console.log('Target ID:', props.targetId)
        console.log('Target Type:', props.targetType)
        
        if (!rollbackToData) {
          toast({ type: 'error', message: 'ไม่พบข้อมูลสำหรับการกู้คืน', autohide: true })
          return
        }

        const progressToast = toast({ type: 'pending', message: 'กำลังกู้คืนข้อมูล...' })

        // Prepare clean data for update (remove _id and other system fields)
        const cleanData = { ...rollbackToData }
        delete cleanData._id
        delete cleanData.createdAt
        delete cleanData.updatedAt
        
        console.log('Clean data for update:', cleanData)

        const rollbackData = {
          action: 'ROLLBACK',
          targetType: props.targetType,
          targetId: props.targetId,
          targetName: `Rollback to version ${selectedRollbackItem.value.version}`,
          toVersion: selectedRollbackItem.value.version,
          rollbackData: rollbackToData,
          reason: `Rollback to version ${selectedRollbackItem.value.version}`,
          userId: 'current-user-id', // TODO: Get actual user ID from auth
          userName: 'Current User', // TODO: Get actual user name from auth
          timestamp: new Date().toISOString(),
          data: rollbackToData,
          version: `${Date.now()}`,
          userAgent: navigator.userAgent,
          ipAddress: 'auto-detect'
        }

        // 1. Update the actual data in taxonomy collection first
        console.log('🔄 Updating taxonomy data...')
        const updateResponse = await fetch(`https://gateway.cloudrestfulapi.com/api/taxonomy/${props.targetId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'client-token-key': configs.key
          },
          body: JSON.stringify({
            data: cleanData,
            options: {}
          })
        })

        console.log('Update response status:', updateResponse.status)
        
        if (!updateResponse.ok) {
          const updateError = await updateResponse.json()
          console.error('Update error:', updateError)
          progressToast.hide(`เกิดข้อผิดพลาดในการอัพเดตข้อมูล: ${updateError.message}`, 'error', 300)
          return
        }

        const updateResult = await updateResponse.json()
        console.log('✅ Update successful:', updateResult)

        // 2. Create rollback audit log after successful update
        console.log('📝 Creating audit log...')
        const auditResponse = await fetch('https://gateway.cloudrestfulapi.com/api/taxonomy_audit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'client-token-key': configs.key
          },
          body: JSON.stringify({
            data: rollbackData,
            options: {}
          })
        })

        if (auditResponse.ok) {
          showRollbackModal.value = false
          selectedRollbackItem.value = null
          
          // Reload history
          await loadHistory()
          
          // Emit rollback complete with the rollback data
          emit('rollback-complete', {
            targetType: props.targetType,
            targetId: props.targetId,
            version: selectedRollbackItem.value?.version,
            rollbackData: rollbackToData
          })
          
          progressToast.hide('กู้คืนข้อมูลสำเร็จ', 'success', 300)
        } else {
          const error = await auditResponse.json()
          console.warn('Failed to create audit log, but data was updated:', error)
          
          // Even if audit log fails, the rollback was successful
          showRollbackModal.value = false
          selectedRollbackItem.value = null
          
          emit('rollback-complete', {
            targetType: props.targetType,
            targetId: props.targetId,
            version: selectedRollbackItem.value?.version,
            rollbackData: rollbackToData
          })
          
          progressToast.hide('กู้คืนข้อมูลสำเร็จ (แต่บันทึก audit log ไม่สำเร็จ)', 'success', 300)
        }
      } catch (error) {
        console.error('Rollback error:', error)
        toast({ type: 'error', message: 'เกิดข้อผิดพลาดในการกู้คืนข้อมูล', autohide: true })
      } finally {
        rollbackLoading.value = false
      }
    }

    const changePage = (page) => {
      if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page
        loadHistory()
      }
    }

    const exportHistory = () => {
      const csvContent = [
        'เวลา,ประเภท,ผู้ดำเนินการ,รายละเอียด,Version',
        ...historyList.value.map(item => [
          formatDate(item.timestamp),
          getActionText(item.action),
          item.userName || item.userId,
          item.targetName,
          item.version
        ].join(','))
      ].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `taxonomy_history_${props.targetId}_${Date.now()}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }

    const purgeTargetLogs = async () => {
      try {
        // Confirmation dialog with Dialog.js
        const targetTypeName = props.targetType === 'group' ? 'กลุ่ม' : 'Term'
        
        dialog.confirm({
          title: 'ยืนยันการลบประวัติ',
          message: `คุณแน่ใจหรือไม่ที่จะลบประวัติทั้งหมดของ ${targetTypeName} "${props.targetName}"?\n\nการดำเนินการนี้ไม่สามารถยกเลิกได้\nจะลบประวัติการเปลี่ยนแปลงทั้งหมดของ ${targetTypeName} นี้`,
          confirm: async () => {
            const progressToast = toast({ type: 'pending', message: 'กำลังลบประวัติ...' })

            try {
              // Build query to get logs for this target and its sub terms (if applicable)
              let queryFilters = [{ targetType: props.targetType, targetId: props.targetId }]
              
              if (props.targetType === 'term') {
                // Get all descendant terms to include their history too
                const descendantsResponse = await fetch('https://gateway.cloudrestfulapi.com/api/taxonomy/query', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'client-token-key': configs.key
                  },
                  body: JSON.stringify({
                    method: 'find',
                    args: [{ type: 'term', parentId: props.targetId }],
                    paging: { page: 1, limit: 1000 }
                  })
                })

                if (descendantsResponse.ok) {
                  const descendantsResult = await descendantsResponse.json()
                  const descendantIds = descendantsResult.data?.map(term => term._id) || []
                  
                  // Add descendant terms to the query
                  descendantIds.forEach(descendantId => {
                    queryFilters.push({
                      targetType: 'term',
                      targetId: descendantId
                    })
                  })
                }
              }

              const finalQuery = { $or: queryFilters }

              // Get all logs to delete
              const logsResponse = await fetch('https://gateway.cloudrestfulapi.com/api/taxonomy_audit/query', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'client-token-key': configs.key
                },
                body: JSON.stringify({
                  method: 'find',
                  args: [finalQuery],
                  paging: { page: 1, limit: 10000 } // Get all logs
                })
              })

              if (!logsResponse.ok) {
                progressToast.hide('ไม่สามารถดึงรายการ logs ได้', 'error', 300)
                return
              }

              const logsResult = await logsResponse.json()
              const logIds = logsResult.data?.map(log => log._id) || []
              const totalLogs = logIds.length

              if (totalLogs === 0) {
                progressToast.hide('ไม่มี audit logs ให้ลบ', 'info', 300)
                return
              }

              // Delete logs one by one
              let deletedCount = 0
              for (const logId of logIds) {
                try {
                  const deleteResponse = await fetch(`https://gateway.cloudrestfulapi.com/api/taxonomy_audit/${logId}`, {
                    method: 'DELETE',
                    headers: {
                      'Content-Type': 'application/json',
                      'client-token-key': configs.key
                    }
                  })

                  if (deleteResponse.ok) {
                    deletedCount++
                  } else {
                    console.warn(`Failed to delete log: ${logId}`)
                  }
                } catch (error) {
                  console.warn(`Error deleting log ${logId}:`, error)
                }
              }

              if (deletedCount > 0) {
                progressToast.hide(`ลบประวัติสำเร็จ\nลบแล้ว: ${deletedCount}/${totalLogs} รายการ`, 'success', 500)
                
                // Reload history to show empty list
                await loadHistory()
              } else {
                progressToast.hide('ไม่สามารถลบประวัติได้', 'error', 300)
              }
            } catch (error) {
              console.error('Error in purge operation:', error)
              progressToast.hide('เกิดข้อผิดพลาดในการลบประวัติ', 'error', 300)
            }
          },
          cancel: () => {
            // ไม่ทำอะไร
          }
        })

      } catch (error) {
        console.error('Error purging target logs:', error)
        toast({ type: 'error', message: 'เกิดข้อผิดพลาดในการลบประวัติ', autohide: true })
      }
    }

    const closeModal = () => {
      showModal.value = false
      emit('close')
    }

    // Watch for visibility changes
    const watchVisible = () => {
      if (props.visible) {
        showModal.value = true
        loadHistory()
      } else {
        showModal.value = false
      }
    }

    onMounted(() => {
      if (props.visible) {
        loadHistory()
      }
    })

    return {
      showModal: showModalComputed,
      loading,
      historyList,
      currentPage,
      totalPages,
      filterAction,
      filterPeriod,
      filterUser,
      filterTermType,
      showRollbackModal,
      selectedRollbackItem,
      rollbackLoading,
      loadHistory,
      getActionText,
      getActionBadgeClass,
      getActionBorderClass,
      formatDate,
      formatDiffData,
      toggleDiff,
      canRollback,
      confirmRollback,
      executeRollback,
      changePage,
      exportHistory,
      purgeTargetLogs,
      closeModal,
      watchVisible
    }
  },

  watch: {
    visible: {
      handler: 'watchVisible',
      immediate: true
    }
  }
}
</script>

<style scoped>
.taxonomy-history-viewer {
  font-family: 'Sarabun', sans-serif;
}

pre {
  font-family: 'JetBrains Mono', monospace;
  max-height: 200px;
  overflow-y: auto;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Enhanced visual hierarchy for sub terms */
.ml-8 {
  margin-left: 2rem;
  position: relative;
}

.ml-8::before {
  content: '';
  position: absolute;
  left: -1rem;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(to bottom, #a855f7, #e879f9);
  opacity: 0.3;
}

/* Gradient backgrounds */
.bg-gradient-to-r {
  background-image: linear-gradient(to right, var(--tw-gradient-from), var(--tw-gradient-to));
}

.from-purple-50 {
  --tw-gradient-from: #faf5ff;
  --tw-gradient-to: transparent;
}

.from-gray-50 {
  --tw-gradient-from: #f9fafb;
  --tw-gradient-to: transparent;
}

/* Animation for term type indicators */
.w-6.h-6 {
  transition: all 0.2s ease-in-out;
}

.w-6.h-6:hover {
  transform: scale(1.1);
}

/* Better spacing for term hierarchy */
.border-l-2.border-purple-300 {
  transition: border-color 0.2s ease-in-out;
}

.border-l-2.border-purple-300:hover {
  border-color: #a855f7;
}
</style> 