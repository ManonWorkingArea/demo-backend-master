<template>
  <div 
    class="term-item" 
    :style="{ paddingLeft: `${level * 12}px` }"
  >
    <!-- Accordion Item with enhanced design -->
    <div 
      class="bg-gradient-to-r from-white to-gray-50 border border-gray-200/60 rounded-lg mb-2 shadow-sm hover:shadow-md transition-all duration-300 group"
    >
      <!-- Progress Bar -->
      <div v-if="showProgress" class="h-0.5 bg-gray-100">
        <div 
          class="h-full bg-gradient-to-r from-emerald-400 to-green-500 transition-all duration-500 ease-out"
          :style="{ width: `${completionRate}%` }"
        ></div>
      </div>

      <!-- Accordion Header -->
      <div 
        class="flex items-center justify-between py-2.5 px-3 transition-all duration-200 rounded-lg"
        :class="{
          'hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 cursor-pointer': childTerms.length > 0,
          'hover:bg-gray-50': childTerms.length === 0
        }"
        @click="childTerms.length > 0 ? toggleExpanded() : null"
      >
        <div class="flex items-center gap-2 flex-1 min-w-0">
          <!-- Expand Icon with beautiful styling -->
          <div class="w-4 flex-shrink-0 flex items-center justify-center">
            <div v-if="childTerms.length > 0" 
                 class="w-4 h-4 flex items-center justify-center text-sm font-bold text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-sm transition-all duration-200 cursor-pointer border border-gray-300 hover:border-blue-400"
                 @click.stop="toggleExpanded"
                 :title="isExpanded ? 'ย่อ' : 'ขยาย'">
              {{ isExpanded ? '−' : '+' }}
            </div>
            <div v-else class="w-4 h-4 flex items-center justify-center">
              <div class="w-1.5 h-1.5 bg-gray-300 rounded-full"></div>
            </div>
          </div>

          <!-- Term Info Section -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-sm text-gray-800 font-semibold">{{ termData.name }}</span>
              
              <!-- Enhanced Badges -->
              <div class="flex items-center gap-1.5">
                <span v-if="termData.code" class="inline-flex items-center px-1.5 py-0.5 text-xs font-medium bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 rounded-full border border-purple-200">
                  <i class="fas fa-hashtag mr-1 text-xs"></i>{{ termData.code }}
                </span>
                
                <span v-if="childTerms.length > 0" class="inline-flex items-center px-1.5 py-0.5 text-xs font-medium bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 rounded-full border border-blue-200">
                  <i class="fas fa-folder mr-1 text-xs"></i>{{ childTerms.length }}
                </span>
                
                <span 
                  v-if="termData.active === false" 
                  class="inline-flex items-center px-1.5 py-0.5 text-xs font-medium bg-gradient-to-r from-red-100 to-red-200 text-red-800 rounded-full border border-red-200"
                >
                  <i class="fas fa-pause-circle mr-1 text-xs"></i>ปิด
                </span>

                <!-- New Status Badges -->
                <span 
                  v-if="isRecent" 
                  class="inline-flex items-center px-1.5 py-0.5 text-xs font-medium bg-gradient-to-r from-emerald-100 to-green-200 text-green-800 rounded-full border border-green-200"
                >
                  <i class="fas fa-sparkles mr-1 text-xs"></i>ใหม่
                </span>

                <span 
                  v-if="hasChanges" 
                  class="inline-flex items-center px-1.5 py-0.5 text-xs font-medium bg-gradient-to-r from-orange-100 to-yellow-200 text-orange-800 rounded-full border border-orange-200"
                >
                  <i class="fas fa-clock mr-1 text-xs"></i>แก้ไข
                </span>
              </div>
            </div>
            
            <!-- Enhanced Meta Text -->
            <div v-if="termData.meta" class="text-xs text-gray-600 mt-1 flex items-center">
              <i class="fas fa-info-circle mr-1.5 text-gray-400 text-xs"></i>
              {{ termData.meta }}
            </div>

            <!-- Progress Info -->
            <div v-if="showProgress" class="text-xs text-gray-500 mt-0.5 flex items-center">
              <i class="fas fa-chart-pie mr-1 text-xs"></i>
              {{ completionRate }}%
            </div>
          </div>
        </div>

        <!-- Enhanced Actions Panel -->
        <div class="flex items-center gap-0.5 ml-2">
          <!-- Quick Preview Button -->
          <button 
            @click.stop="quickPreview" 
            class="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-all duration-200 hover:scale-105"
            title="ดูตัวอย่างด่วน"
          >
            <i class="fas fa-eye text-xs"></i>
          </button>

          <!-- Add Button -->
          <button 
            @click.stop="addChild" 
            class="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-all duration-200 hover:scale-105"
            title="เพิ่มรายการย่อย"
          >
            <i class="fas fa-plus text-xs"></i>
          </button>
          
          <!-- Edit Button -->
          <button 
            @click.stop="edit" 
            class="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all duration-200 hover:scale-105"
            title="แก้ไข"
          >
            <i class="fas fa-edit text-xs"></i>
          </button>

          <!-- Duplicate Button -->
          <button 
            @click.stop="clone" 
            class="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-all duration-200 hover:scale-105"
            title="ทำซ้ำ"
          >
            <i class="fas fa-copy text-xs"></i>
          </button>

          <!-- Move Buttons with enhanced design -->
          <template v-if="siblings.length > 1">
            <div class="border-l border-gray-300 mx-1 h-4"></div>
            <div class="flex items-center bg-gray-50 rounded-md p-0.5 gap-0.5">
              <button 
                v-if="canMoveUp" 
                @click.stop="moveUp" 
                class="p-1 text-gray-400 hover:text-blue-600 hover:bg-white rounded-sm transition-all duration-200 hover:scale-105" 
                title="ย้ายขึ้น"
              >
                <i class="fas fa-chevron-up text-xs"></i>
              </button>

              <button 
                v-if="canMoveDown" 
                @click.stop="moveDown" 
                class="p-1 text-gray-400 hover:text-blue-600 hover:bg-white rounded-sm transition-all duration-200 hover:scale-105" 
                title="ย้ายลง"
              >
                <i class="fas fa-chevron-down text-xs"></i>
              </button>
              
              <!-- Show placeholder when no movement possible -->
              <div v-if="!canMoveUp && !canMoveDown" class="p-1">
                <i class="fas fa-grip-lines text-xs text-gray-300"></i>
              </div>
            </div>
          </template>
          
          <!-- More Menu with enhanced dropdown -->
          <div class="relative z-10">
            <button 
              @click.stop="showMoreActions = !showMoreActions" 
              class="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-all duration-200" 
              title="ตัวเลือกเพิ่มเติม"
            >
              <i class="fas fa-ellipsis-v text-xs"></i>
            </button>

            <!-- Enhanced Dropdown -->
            <Transition
              enter-active-class="transition ease-out duration-200"
              enter-from-class="opacity-0 scale-95"
              enter-to-class="opacity-100 scale-100"
              leave-active-class="transition ease-in duration-150"
              leave-from-class="opacity-100 scale-100"
              leave-to-class="opacity-0 scale-95"
            >
              <div 
                v-if="showMoreActions" 
                class="absolute right-0 top-full mt-1 w-44 bg-white border border-gray-200 rounded-lg shadow-xl z-[9999] overflow-hidden backdrop-blur-sm"
                @click.stop="showMoreActions = false"
              >
                <!-- Favorites & Settings Section -->
                <div class="px-3 py-2 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <div class="text-xs font-semibold text-gray-700 uppercase tracking-wider">การดำเนินการ</div>
                </div>

                <div class="py-1">
                  <button 
                    @click="toggleFavorite" 
                    class="w-full px-3 py-1.5 text-xs text-gray-700 hover:bg-yellow-50 hover:text-yellow-700 text-left transition-colors flex items-center"
                  >
                    <i class="fas fa-star mr-2 text-yellow-500" :class="{ 'fas': isFavorite, 'far': !isFavorite }"></i>
                    {{ isFavorite ? 'ลบออกจากโปรด' : 'เพิ่มเป็นโปรด' }}
                  </button>

                  <button 
                    @click="showHistory" 
                    class="w-full px-3 py-1.5 text-xs text-gray-700 hover:bg-blue-50 hover:text-blue-700 text-left transition-colors flex items-center"
                  >
                    <i class="fas fa-history mr-2 text-blue-500"></i>ดูประวัติ
                  </button>

                  <button 
                    @click="exportTerm" 
                    class="w-full px-3 py-1.5 text-xs text-gray-700 hover:bg-green-50 hover:text-green-700 text-left transition-colors flex items-center"
                  >
                    <i class="fas fa-download mr-2 text-green-500"></i>ส่งออก
                  </button>

                  <button 
                    @click="shareLink" 
                    class="w-full px-3 py-1.5 text-xs text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 text-left transition-colors flex items-center"
                  >
                    <i class="fas fa-share-alt mr-2 text-indigo-500"></i>แชร์ลิงก์
                  </button>
                </div>

                <div class="border-t border-gray-100"></div>
                
                <div class="py-1">
                  <button 
                    @click="archiveTerm" 
                    class="w-full px-3 py-1.5 text-xs text-orange-600 hover:bg-orange-50 text-left transition-colors flex items-center"
                  >
                    <i class="fas fa-archive mr-2 text-orange-500"></i>เก็บถาวร
                  </button>

                  <button 
                    @click="deleteTerm" 
                    class="w-full px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 text-left transition-colors flex items-center"
                  >
                    <i class="fas fa-trash mr-2 text-red-500"></i>ลบออก
                  </button>
                </div>
              </div>
            </Transition>
          </div>
        </div>
      </div>

      <!-- Accordion Content with enhanced styling -->
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 max-h-0"
        enter-to-class="opacity-100 max-h-screen"
        leave-active-class="transition-all duration-300 ease-in"
        leave-from-class="opacity-100 max-h-screen"
        leave-to-class="opacity-0 max-h-0"
      >
        <div 
          v-if="isExpanded && childTerms.length > 0" 
          class="border-t border-gray-200/60 bg-gradient-to-b from-gray-50/50 to-white px-3 py-2"
        >
          <!-- Search Filter for children -->
          <div v-if="childTerms.length > 5" class="mb-2">
            <div class="relative">
              <input
                v-model="childSearchQuery"
                type="text"
                placeholder="ค้นหารายการย่อย..."
                class="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-colors"
              >
              <i class="fas fa-search absolute left-2.5 top-2 text-gray-400 text-xs"></i>
            </div>
          </div>

          <!-- Children with enhanced layout -->
          <div class="space-y-1.5">
            <TermItem
              v-for="child in filteredChildTerms"
              :key="child._id"
              :term-data="child"
              :level="level + 1"
              :all-terms="allTerms"
              :expanded-terms="expandedTerms"
              @update:expandedTerms="$emit('update:expandedTerms', $event)"
              @add-term="$emit('add-term', $event)"
              @edit-term="$emit('edit-term', $event)"
              @delete-term="$emit('delete-term', $event)"
              @clone-term="$emit('clone-term', $event)"
              @move-term-up="$emit('move-term-up', $event)"
              @move-term-down="$emit('move-term-down', $event)"
              @show-term-history="$emit('show-term-history', $event)"
              @archive-term="$emit('archive-term', $event)"
              @export-term="$emit('export-term', $event)"
              @toggle-favorite="$emit('toggle-favorite', $event)"
              @share-link="$emit('share-link', $event)"
              @quick-preview="$emit('quick-preview', $event)"
            />
          </div>

          <!-- Show more button if filtered -->
          <div v-if="childSearchQuery && filteredChildTerms.length < childTerms.length" class="mt-2 text-center">
            <button 
              @click="childSearchQuery = ''"
              class="text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              แสดงทั้งหมด ({{ childTerms.length }} รายการ)
            </button>
          </div>
        </div>
      </Transition>
    </div>

    <!-- Quick Preview Modal -->
    <Transition
      enter-active-class="transition-all duration-200"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition-all duration-150"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div 
        v-if="showQuickPreview" 
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
        @click="showQuickPreview = false"
      >
        <div 
          class="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden"
          @click.stop
        >
          <div class="px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
            <h3 class="font-semibold text-base">{{ termData.name }}</h3>
            <button 
              @click="showQuickPreview = false"
              class="absolute top-3 right-3 text-white hover:text-gray-200"
            >
              <i class="fas fa-times text-sm"></i>
            </button>
          </div>
          <div class="p-4">
            <div class="space-y-2">
              <div v-if="termData.code">
                <span class="text-xs font-medium text-gray-500">รหัส:</span>
                <span class="ml-2 text-sm text-gray-800">{{ termData.code }}</span>
              </div>
              <div v-if="termData.meta">
                <span class="text-xs font-medium text-gray-500">คำอธิบาย:</span>
                <p class="ml-2 text-sm text-gray-800 mt-0.5">{{ termData.meta }}</p>
              </div>
              <div>
                <span class="text-xs font-medium text-gray-500">จำนวนรายการย่อย:</span>
                <span class="ml-2 text-sm text-gray-800">{{ childTerms.length }} รายการ</span>
              </div>
              <div>
                <span class="text-xs font-medium text-gray-500">ความสมบูรณ์:</span>
                <div class="ml-2 mt-1">
                  <div class="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      class="bg-gradient-to-r from-emerald-400 to-green-500 h-1.5 rounded-full transition-all duration-500"
                      :style="{ width: `${completionRate}%` }"
                    ></div>
                  </div>
                  <span class="text-xs text-gray-600 mt-0.5">{{ completionRate }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script>
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import toast from '@/plugins/ToastUI.js'
import dialog from '@/plugins/Dialog.js'

export default {
  name: 'TermItem',
  
  props: {
    termData: {
      type: Object,
      required: true
    },
    level: {
      type: Number,
      default: 0
    },
    allTerms: {
      type: Array,
      required: true
    },
    expandedTerms: {
      type: Array,
      default: () => []
    },
    showProgress: {
      type: Boolean,
      default: true
    }
  },

  emits: [
    'update:expandedTerms',
    'add-term',
    'edit-term', 
    'delete-term',
    'clone-term',
    'move-term-up',
    'move-term-down',
    'show-term-history',
    'archive-term',
    'export-term',
    'toggle-favorite',
    'share-link',
    'quick-preview'
  ],

  setup(props, { emit }) {
    // Reactive state
    const showMoreActions = ref(false)
    const showQuickPreview = ref(false)
    const isFavorite = ref(false)
    const childSearchQuery = ref('')

    // Click outside handler
    const handleClickOutside = () => {
      // ปิด dropdown เมื่อคลิกข้างนอก
      if (showMoreActions.value) {
        showMoreActions.value = false
      }
    }

    onMounted(() => {
      document.addEventListener('click', handleClickOutside)
    })

    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside)
    })

    // Watch for changes in allTerms to debug reactivity
    watch(() => props.allTerms, (newTerms, oldTerms) => {
      console.log('AllTerms changed for', props.termData.name)
      console.log('Old length:', oldTerms?.length, 'New length:', newTerms?.length)
      
      // Check if this term's sortOrder changed
      const oldTerm = oldTerms?.find(t => t._id === props.termData._id)
      const newTerm = newTerms?.find(t => t._id === props.termData._id)
      
      if (oldTerm && newTerm && oldTerm.sortOrder !== newTerm.sortOrder) {
        console.log('Sort order changed for', props.termData.name, 'from', oldTerm.sortOrder, 'to', newTerm.sortOrder)
      }
    }, { deep: true })

    // Watch for changes in termData itself
    watch(() => props.termData, (newData, oldData) => {
      if (oldData && newData.sortOrder !== oldData.sortOrder) {
        console.log('TermData sortOrder changed for', newData.name, 'from', oldData.sortOrder, 'to', newData.sortOrder)
      }
    }, { deep: true })

    // Computed properties
    const isExpanded = computed(() => {
      return props.expandedTerms.includes(props.termData._id)
    })

    const childTerms = computed(() => {
      return props.allTerms
        .filter(term => term.parentId === props.termData._id)
        .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
    })

    const filteredChildTerms = computed(() => {
      if (!childSearchQuery.value) return childTerms.value
      
      const query = childSearchQuery.value.toLowerCase()
      return childTerms.value.filter(term => 
        term.name.toLowerCase().includes(query) ||
        (term.code && term.code.toLowerCase().includes(query)) ||
        (term.meta && term.meta.toLowerCase().includes(query))
      )
    })

    const siblings = computed(() => {
      // Force reactivity by accessing allTerms
      const allTermsRef = props.allTerms
      console.log('Computing siblings for:', props.termData.name, 'Total terms:', allTermsRef.length)
      
      const siblingsArray = allTermsRef
        .filter(term => 
          term.taxonomy === props.termData.taxonomy && 
          term.parentId === props.termData.parentId
        )
        .sort((a, b) => {
          // Primary sort by sortOrder
          const orderA = a.sortOrder !== undefined && a.sortOrder !== null ? a.sortOrder : 999999
          const orderB = b.sortOrder !== undefined && b.sortOrder !== null ? b.sortOrder : 999999
          
          if (orderA !== orderB) {
            return orderA - orderB
          }
          
          // Secondary sort by createdAt if sortOrder is the same
          const dateA = new Date(a.createdAt || 0).getTime()
          const dateB = new Date(b.createdAt || 0).getTime()
          
          if (dateA !== dateB) {
            return dateA - dateB
          }
          
          // Tertiary sort by _id as final tiebreaker
          return (a._id || '').localeCompare(b._id || '')
        })
      
      console.log('Siblings found:', siblingsArray.map(s => ({ 
        name: s.name, 
        sortOrder: s.sortOrder,
        createdAt: s.createdAt,
        _id: s._id 
      })))
      
      // Check for duplicate sortOrder
      const sortOrders = siblingsArray.map(s => s.sortOrder).filter(o => o !== null && o !== undefined)
      const uniqueSortOrders = [...new Set(sortOrders)]
      
      if (sortOrders.length !== uniqueSortOrders.length) {
        console.warn('⚠️ Duplicate sortOrder detected!', sortOrders)
        console.warn('Consider implementing sortOrder normalization in parent component')
      }
      
      return siblingsArray
    })

    const currentIndex = computed(() => {
      const index = siblings.value.findIndex(term => term._id === props.termData._id)
      console.log('Current index for', props.termData.name, ':', index, '/', siblings.value.length)
      return index
    })

    const canMoveUp = computed(() => {
      const result = currentIndex.value > 0
      console.log('Can move up:', props.termData.name, result, 'index:', currentIndex.value)
      return result
    })

    const canMoveDown = computed(() => {
      const result = currentIndex.value >= 0 && currentIndex.value < siblings.value.length - 1
      console.log('Can move down:', props.termData.name, result, 'index:', currentIndex.value, 'total:', siblings.value.length)
      return result
    })

    const completionRate = computed(() => {
      return getCompletionRate()
    })

    const isRecent = computed(() => {
      if (!props.termData.createdAt) return false
      const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000)
      return new Date(props.termData.createdAt).getTime() > oneWeekAgo
    })

    const hasChanges = computed(() => {
      if (!props.termData.updatedAt || !props.termData.createdAt) return false
      return props.termData.updatedAt !== props.termData.createdAt
    })

    // Methods
    const toggleExpanded = () => {
      console.log('🔄 toggleExpanded clicked for:', props.termData.name)
      console.log('Current expandedTerms:', props.expandedTerms)
      console.log('Current termData._id:', props.termData._id)
      console.log('isExpanded before:', isExpanded.value)
      
      const newExpandedTerms = [...props.expandedTerms]
      const index = newExpandedTerms.indexOf(props.termData._id)
      
      console.log('Index in expandedTerms:', index)
      
      if (index === -1) {
        newExpandedTerms.push(props.termData._id)
        console.log('➕ Adding to expanded:', props.termData._id)
      } else {
        newExpandedTerms.splice(index, 1)
        console.log('➖ Removing from expanded:', props.termData._id)
      }
      
      console.log('New expandedTerms:', newExpandedTerms)
      emit('update:expandedTerms', newExpandedTerms)
      
      // Force reactivity check
      setTimeout(() => {
        console.log('isExpanded after:', isExpanded.value)
      }, 100)
    }

    const addChild = () => {
      showMoreActions.value = false
      emit('add-term', props.termData._id)
    }

    const edit = () => {
      showMoreActions.value = false
      emit('edit-term', props.termData)
    }

    const deleteTerm = () => {
      showMoreActions.value = false
      dialog.confirm({
        title: 'ยืนยันการลบ',
        message: `คุณต้องการลบ "${props.termData.name}" หรือไม่?`,
        confirm: () => {
          emit('delete-term', props.termData)
        },
        cancel: () => {
          // ไม่ทำอะไร
        }
      })
    }

    const clone = () => {
      showMoreActions.value = false
      emit('clone-term', props.termData)
    }

    const moveUp = () => {
      console.log('🔄 moveUp clicked for:', props.termData.name)
      console.log('Current index:', currentIndex.value, 'Siblings length:', siblings.value.length)
      console.log('canMoveUp:', canMoveUp.value)
      
      const currentIdx = currentIndex.value
      if (currentIdx <= 0) {
        console.log('❌ Cannot move up - already at top or invalid index')
        return
      }
      
      const targetItem = siblings.value[currentIdx - 1]
      
      console.log('✅ Moving up - swapping with:', targetItem.name)
      console.log('Current sortOrder:', props.termData.sortOrder, 'Target sortOrder:', targetItem.sortOrder)
      
      // Send detailed information for the swap
      const moveData = {
        termId: props.termData._id,
        currentSortOrder: props.termData.sortOrder,
        targetTermId: targetItem._id,
        targetSortOrder: targetItem.sortOrder,
        suggestedCurrentOrder: targetItem.sortOrder,
        suggestedTargetOrder: props.termData.sortOrder
      }
      
      console.log('📤 Emitting move-term-up with data:', moveData)
      emit('move-term-up', moveData)
      
      // Also emit simple version as fallback
      console.log('📤 Emitting move-term-up (simple) with ID:', props.termData._id)
      setTimeout(() => {
        emit('move-term-up', props.termData._id)
      }, 100)
    }

    const moveDown = () => {
      console.log('🔄 moveDown clicked for:', props.termData.name)
      console.log('Current index:', currentIndex.value, 'Siblings length:', siblings.value.length)
      console.log('canMoveDown:', canMoveDown.value)
      
      const currentIdx = currentIndex.value
      if (currentIdx < 0 || currentIdx >= siblings.value.length - 1) {
        console.log('❌ Cannot move down - already at bottom or invalid index')
        return
      }
      
      const targetItem = siblings.value[currentIdx + 1]
      
      console.log('✅ Moving down - swapping with:', targetItem.name)
      console.log('Current sortOrder:', props.termData.sortOrder, 'Target sortOrder:', targetItem.sortOrder)
      
      // Send detailed information for the swap
      const moveData = {
        termId: props.termData._id,
        currentSortOrder: props.termData.sortOrder,
        targetTermId: targetItem._id,
        targetSortOrder: targetItem.sortOrder,
        suggestedCurrentOrder: targetItem.sortOrder,
        suggestedTargetOrder: props.termData.sortOrder
      }
      
      console.log('📤 Emitting move-term-down with data:', moveData)
      emit('move-term-down', moveData)
      
      // Also emit simple version as fallback
      console.log('📤 Emitting move-term-down (simple) with ID:', props.termData._id)
      setTimeout(() => {
        emit('move-term-down', props.termData._id)
      }, 100)
    }

    // Helper method to suggest sortOrder normalization
    const suggestSortOrderFix = () => {
      const sortOrders = siblings.value.map(s => s.sortOrder).filter(o => o !== null && o !== undefined)
      const uniqueSortOrders = [...new Set(sortOrders)]
      
      if (sortOrders.length !== uniqueSortOrders.length) {
        const normalizedOrder = siblings.value.map((term, index) => ({
          termId: term._id,
          currentSortOrder: term.sortOrder,
          suggestedSortOrder: index
        }))
        
        console.log('🔧 Suggested sortOrder normalization:', normalizedOrder)
        return normalizedOrder
      }
      return null
    }

    const showHistory = () => {
      showMoreActions.value = false
      emit('show-term-history', props.termData)
    }

    const quickPreview = () => {
      showQuickPreview.value = true
      emit('quick-preview', props.termData)
    }

    const archiveTerm = () => {
      showMoreActions.value = false
      dialog.confirm({
        title: 'ยืนยันการเก็บถาวร',
        message: `คุณต้องการเก็บ "${props.termData.name}" เข้าถาวรหรือไม่?`,
        confirm: () => {
          emit('archive-term', props.termData)
        },
        cancel: () => {
          // ไม่ทำอะไร
        }
      })
    }

    const exportTerm = () => {
      showMoreActions.value = false
      emit('export-term', props.termData)
    }

    const toggleFavorite = () => {
      isFavorite.value = !isFavorite.value
      showMoreActions.value = false
      emit('toggle-favorite', { term: props.termData, isFavorite: isFavorite.value })
    }

    const shareLink = () => {
      showMoreActions.value = false
      const url = `${window.location.origin}/terms/${props.termData._id}`
      navigator.clipboard.writeText(url).then(() => {
        toast({ type: 'success', message: 'ลิงก์ถูกคัดลอกแล้ว!', autohide: true })
      }).catch(() => {
        toast({ type: 'error', message: 'ไม่สามารถคัดลอกลิงก์ได้', autohide: true })
      })
      emit('share-link', props.termData)
    }

    const getCompletionRate = () => {
      // Enhanced completion calculation
      let score = 0
      let maxScore = 0

      // Base fields
      if (props.termData.name) score += 20
      maxScore += 20

      if (props.termData.code) score += 15
      maxScore += 15

      if (props.termData.meta) score += 15
      maxScore += 15

      // Children completion
      if (childTerms.value.length > 0) {
        score += Math.min(childTerms.value.length * 5, 25)
      }
      maxScore += 25

      // Custom data completion
      if (props.termData.customData) {
        const fields = Object.keys(props.termData.customData)
        const filledFields = fields.filter(key => 
          props.termData.customData[key] !== null && 
          props.termData.customData[key] !== undefined &&
          props.termData.customData[key] !== ''
        )
        if (fields.length > 0) {
          score += Math.round((filledFields.length / fields.length) * 25)
        }
      }
      maxScore += 25

      return maxScore > 0 ? Math.round((score / maxScore) * 100) : 85
    }

    return {
      // State
      showMoreActions,
      showQuickPreview,
      isFavorite,
      childSearchQuery,
      
      // Computed
      isExpanded,
      childTerms,
      filteredChildTerms,
      siblings,
      currentIndex,
      canMoveUp,
      canMoveDown,
      completionRate,
      isRecent,
      hasChanges,
      
      // Methods
      toggleExpanded,
      addChild,
      edit,
      deleteTerm,
      clone,
      moveUp,
      moveDown,
      showHistory,
      quickPreview,
      archiveTerm,
      exportTerm,
      toggleFavorite,
      shareLink,
      getCompletionRate,
      suggestSortOrderFix
    }
  }
}
</script>

<style scoped>
/* Enhanced styling with modern design */
.term-item {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  position: relative;
}

/* Beautiful expand button styling */
.term-item .w-4.h-4.flex.items-center.justify-center.text-sm {
  font-family: 'SF Mono', Monaco, Inconsolata, 'Roboto Mono', Consolas, 'Courier New', monospace;
  user-select: none;
  font-weight: 600;
  line-height: 1;
}

.term-item .w-4.h-4.flex.items-center.justify-center.text-sm:hover {
  transform: scale(1.1);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
}

.term-item .w-4.h-4.flex.items-center.justify-center.text-sm:active {
  transform: scale(0.95);
}

/* Beautiful focus states */
button:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Enhanced transitions */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}

.transition-colors {
  transition-property: background-color, border-color, color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}

.transition-transform {
  transition-property: transform;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}

/* Beautiful hover effects for buttons */
button:hover {
  transform: translateY(-1px);
}

/* Scale animation on click */
button:active {
  transform: translateY(0) scale(0.95);
  transition-duration: 0.1s;
}

/* Progress bar animation */
@keyframes progressFill {
  from {
    width: 0%;
  }
  to {
    width: var(--progress-width);
  }
}

/* Glassmorphism effect for dropdown */
.backdrop-blur-sm {
  backdrop-filter: blur(4px);
}

/* Custom scrollbar for long lists */
.space-y-1\.5 {
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
}

.space-y-1\.5::-webkit-scrollbar {
  width: 6px;
}

.space-y-1\.5::-webkit-scrollbar-track {
  background: transparent;
}

.space-y-1\.5::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.5);
  border-radius: 3px;
}

.space-y-1\.5::-webkit-scrollbar-thumb:hover {
  background-color: rgba(156, 163, 175, 0.7);
}

/* Animation for new badges */
@keyframes pulse-subtle {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

.animate-pulse-subtle {
  animation: pulse-subtle 2s infinite;
}

/* Enhanced search input styling */
input[type="text"]:focus {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

/* Ensure dropdown positioning and z-index */
.relative {
  position: relative;
}

.z-10 {
  z-index: 10;
}

/* Force high z-index for dropdown */
.z-\[9999\] {
  z-index: 9999 !important;
  position: absolute !important;
}

/* Prevent parent overflow from hiding dropdown */
.term-item .relative {
  overflow: visible !important;
}

/* Ensure dropdown container doesn't get clipped */
.term-item > div {
  overflow: visible !important;
}
</style> 