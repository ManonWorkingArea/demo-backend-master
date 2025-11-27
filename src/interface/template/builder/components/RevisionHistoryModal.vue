<template>
  <div v-if="visible" class="fixed inset-0 z-[1002] bg-black bg-opacity-50 flex items-center justify-center p-4">
    <div class="bg-white w-full max-w-6xl max-h-[75vh] shadow-xl border border-gray-200 rounded-lg overflow-hidden">
      <!-- Modal Header -->
      <div class="bg-white border-b border-gray-200 px-6 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
              <font-awesome-icon :icon="['fas', 'history']" class="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 class="text-xl font-semibold text-gray-900">Revision Change Log</h2>
              <p class="text-sm text-gray-500">ดูประวัติการเปลี่ยนแปลงและเปรียบเทียบ revisions</p>
            </div>
          </div>
          <button 
            @click="$emit('close')"
            class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <font-awesome-icon :icon="['fas', 'times']" class="h-5 w-5" />
          </button>
        </div>
      </div>

      <!-- Modal Content -->
      <div class="flex h-[calc(75vh-80px)]">
        <!-- Revision List (Left Sidebar) -->
        <div class="w-1/3 border-r border-gray-200 overflow-y-auto bg-gray-50">
          <div class="p-4">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-medium text-gray-900">รายการ Revisions</h3>
              <button 
                @click="refreshRevisions"
                class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="Refresh">
                <font-awesome-icon :icon="['fas', 'sync-alt']" class="h-4 w-4" />
              </button>
            </div>
            
            <!-- Loading State -->
            <div v-if="loading" class="flex items-center justify-center py-8">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <span class="ml-3 text-gray-600">กำลังโหลด...</span>
            </div>

            <!-- Revision Items -->
            <div v-else class="space-y-2">
              <div v-if="revisions.length === 0" class="text-center py-8 text-gray-500">
                <font-awesome-icon :icon="['fas', 'inbox']" class="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>ยังไม่มีประวัติการแก้ไข</p>
              </div>
              
              <div 
                v-for="(revision, index) in revisions" 
                :key="revision._id"
                @click="selectRevision(revision, index)"
                :class="[
                  'p-3 border rounded-lg cursor-pointer transition-all',
                  selectedRevision?._id === revision._id 
                    ? 'border-indigo-500 bg-indigo-50 shadow-sm' 
                    : 'border-gray-200 hover:border-gray-300 hover:bg-white hover:shadow-sm'
                ]">
                
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <div class="flex items-center space-x-2 mb-2">
                      <span class="text-sm font-medium text-gray-900">
                        {{ revision.description || 'ไม่มีคำอธิบาย' }}
                      </span>
                      <span v-if="index === 0" class="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                        Latest
                      </span>
                    </div>
                    
                    <div class="text-xs text-gray-500 space-y-1">
                      <p class="flex items-center">
                        <font-awesome-icon :icon="['fas', 'clock']" class="h-3 w-3 mr-1" />
                        {{ formatDate(revision.created_at) }}
                      </p>
                      <p class="flex items-center">
                        <font-awesome-icon :icon="['fas', 'user']" class="h-3 w-3 mr-1" />
                        {{ revision.user_name || 'ไม่ระบุ' }}
                      </p>
                      <div class="flex items-center space-x-3 mt-2">
                        <span class="flex items-center">
                          <font-awesome-icon :icon="['fas', 'th-large']" class="h-3 w-3 mr-1 text-blue-500" />
                          {{ revision.builder_data?.length || 0 }} rows
                        </span>
                        <span class="flex items-center">
                          <font-awesome-icon :icon="['fas', 'palette']" class="h-3 w-3 mr-1 text-purple-500" />
                          {{ revision.css_data?.length || 0 }} CSS
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div class="flex flex-col items-end space-y-1">
                    <span class="text-xs text-gray-400">#{{ revision._id.slice(-6) }}</span>
                    <div class="flex items-center space-x-1">
                      <div v-if="getChangeIndicator(revision, index).hasChanges" 
                           :class="[
                             'w-2 h-2 rounded-full',
                             getChangeIndicator(revision, index).type === 'major' ? 'bg-red-500' :
                             getChangeIndicator(revision, index).type === 'minor' ? 'bg-yellow-500' :
                             'bg-green-500'
                           ]"
                           :title="getChangeIndicator(revision, index).tooltip">
                      </div>
                      <button 
                        v-if="index !== 0"
                        @click.stop="confirmDeleteRevision(revision)"
                        class="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="ลบ revision นี้">
                        <font-awesome-icon :icon="['fas', 'trash-alt']" class="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Content Area -->
        <div class="w-2/3 overflow-y-auto">
          <div class="p-6">
            <div v-if="selectedRevision">
              <!-- Revision Details Header -->
              <div class="mb-6">
                <div class="flex items-center justify-between mb-4">
                  <div>
                    <h3 class="text-lg font-medium text-gray-900">{{ selectedRevision.description }}</h3>
                    <p class="text-sm text-gray-500">
                      สร้างเมื่อ {{ formatDate(selectedRevision.created_at) }} โดย {{ selectedRevision.user_name || 'ไม่ระบุ' }}
                    </p>
                  </div>
                  <div class="flex items-center space-x-2">
                    <button 
                      @click="rollbackToRevision(selectedRevision)"
                      class="px-3 py-1.5 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 transition-colors">
                      <font-awesome-icon :icon="['fas', 'undo']" class="h-3 w-3 mr-1" />
                      Rollback
                    </button>
                    <button 
                      @click="createBranch(selectedRevision)"
                      class="px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors">
                      <font-awesome-icon :icon="['fas', 'code-branch']" class="h-3 w-3 mr-1" />
                      Branch
                    </button>
                  </div>
                </div>

                <!-- Quick Stats -->
                <div class="grid grid-cols-3 gap-4 mb-6">
                  <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div class="flex items-center">
                      <font-awesome-icon :icon="['fas', 'th-large']" class="h-5 w-5 text-blue-600 mr-2" />
                      <div>
                        <p class="text-sm font-medium text-blue-900">Builder Rows</p>
                        <p class="text-lg font-bold text-blue-600">{{ selectedRevision.builder_data?.length || 0 }}</p>
                      </div>
                    </div>
                  </div>
                  <div class="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <div class="flex items-center">
                      <font-awesome-icon :icon="['fas', 'palette']" class="h-5 w-5 text-purple-600 mr-2" />
                      <div>
                        <p class="text-sm font-medium text-purple-900">CSS Characters</p>
                        <p class="text-lg font-bold text-purple-600">{{ selectedRevision.css_data?.length || 0 }}</p>
                      </div>
                    </div>
                  </div>
                  <div class="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div class="flex items-center">
                      <font-awesome-icon :icon="['fas', 'clock']" class="h-5 w-5 text-green-600 mr-2" />
                      <div>
                        <p class="text-sm font-medium text-green-900">Version</p>
                        <p class="text-lg font-bold text-green-600">{{ selectedRevision.version || 'N/A' }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Tabs Navigation -->
              <div class="border-b border-gray-200 mb-6">
                <nav class="flex space-x-8" aria-label="Tabs">
                  <button
                    @click="activeTab = 'changes'"
                    :class="[
                      'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors',
                      activeTab === 'changes'
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    ]"
                  >
                    <font-awesome-icon :icon="['fas', 'list-ul']" class="h-4 w-4 mr-2" />
                    Changes
                  </button>
                  <button
                    @click="activeTab = 'content'"
                    :class="[
                      'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors',
                      activeTab === 'content'
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    ]"
                  >
                    <font-awesome-icon :icon="['fas', 'file-alt']" class="h-4 w-4 mr-2" />
                    Content Preview
                  </button>
                  <button
                    @click="activeTab = 'compare'"
                    :class="[
                      'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors',
                      activeTab === 'compare'
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    ]"
                  >
                    <font-awesome-icon :icon="['fas', 'exchange-alt']" class="h-4 w-4 mr-2" />
                    Compare
                  </button>
                </nav>
              </div>

              <!-- Tab Contents -->
              <div class="tab-content">
                <!-- Changes Tab -->
                <div v-if="activeTab === 'changes'">
                  <div class="space-y-4">
                    <div v-for="change in getRevisionChanges(selectedRevision)" 
                         :key="change.id"
                         class="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                      <div class="flex items-start space-x-3">
                        <div :class="[
                          'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                          change.type === 'added' ? 'bg-green-100' :
                          change.type === 'modified' ? 'bg-yellow-100' :
                          change.type === 'deleted' ? 'bg-red-100' : 'bg-gray-100'
                        ]">
                          <font-awesome-icon 
                            :icon="[
                              'fas', 
                              change.type === 'added' ? 'plus' :
                              change.type === 'modified' ? 'edit' :
                              change.type === 'deleted' ? 'minus' : 'circle'
                            ]" 
                            :class="[
                              'h-4 w-4',
                              change.type === 'added' ? 'text-green-600' :
                              change.type === 'modified' ? 'text-yellow-600' :
                              change.type === 'deleted' ? 'text-red-600' : 'text-gray-600'
                            ]" />
                        </div>
                        <div class="flex-1">
                          <h4 class="text-sm font-medium text-gray-900">{{ change.title }}</h4>
                          <p class="text-sm text-gray-600 mt-1">{{ change.description }}</p>
                          <div v-if="change.details" class="mt-2">
                            <div class="bg-gray-50 rounded-md p-3 text-sm font-mono text-gray-700">
                              {{ change.details }}
                            </div>
                          </div>
                        </div>
                        <span :class="[
                          'px-2 py-1 text-xs font-medium rounded-full',
                          change.type === 'added' ? 'bg-green-100 text-green-700' :
                          change.type === 'modified' ? 'bg-yellow-100 text-yellow-700' :
                          change.type === 'deleted' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                        ]">
                          {{ change.type }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Content Preview Tab -->
                <div v-if="activeTab === 'content'">
                  <div class="space-y-6">
                    <!-- Builder Data Preview -->
                    <div>
                      <h4 class="text-md font-medium text-gray-900 mb-3">Builder Structure</h4>
                      <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <div v-if="selectedRevision.builder_data && selectedRevision.builder_data.length > 0" 
                             class="space-y-2">
                          <div v-for="(row, rowIndex) in selectedRevision.builder_data" 
                               :key="rowIndex"
                               class="border border-gray-200 rounded-lg bg-white">
                            <!-- Row Header -->
                            <div @click="toggleRowExpansion(rowIndex)"
                                 class="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 transition-colors">
                              <div class="flex items-center space-x-3">
                                <font-awesome-icon 
                                  :icon="['fas', isRowExpanded(rowIndex) ? 'chevron-down' : 'chevron-right']" 
                                  class="h-3 w-3 text-gray-400 transition-transform" />
                                <span class="w-6 h-6 bg-blue-100 text-blue-600 rounded text-xs flex items-center justify-center font-mono">
                                  {{ rowIndex }}
                                </span>
                                <span class="text-sm font-medium text-gray-700">{{ row.text || 'Untitled Row' }}</span>
                              </div>
                              <div class="flex items-center space-x-2">
                                <span class="text-xs text-gray-500">{{ row.columns?.length || 0 }} columns</span>
                                <div class="w-2 h-2 rounded-full bg-blue-400"></div>
                              </div>
                            </div>
                            
                            <!-- Row Details (Columns) -->
                            <div v-if="isRowExpanded(rowIndex)" class="border-t border-gray-100">
                              <div v-if="row.columns && row.columns.length > 0" class="p-3 space-y-2">
                                <div v-for="(column, columnIndex) in row.columns" 
                                     :key="columnIndex"
                                     class="border border-gray-100 rounded-lg bg-gray-50">
                                  <!-- Column Header -->
                                  <div @click="toggleColumnExpansion(rowIndex, columnIndex)"
                                       class="flex items-center justify-between p-2 cursor-pointer hover:bg-gray-100 transition-colors">
                                    <div class="flex items-center space-x-2">
                                      <font-awesome-icon 
                                        :icon="['fas', isColumnExpanded(rowIndex, columnIndex) ? 'chevron-down' : 'chevron-right']" 
                                        class="h-3 w-3 text-gray-400 transition-transform ml-4" />
                                      <span class="w-5 h-5 bg-green-100 text-green-600 rounded text-xs flex items-center justify-center font-mono">
                                        {{ columnIndex }}
                                      </span>
                                      <span class="text-xs font-medium text-gray-600">{{ column.text || 'Untitled Column' }}</span>
                                    </div>
                                    <div class="flex items-center space-x-2">
                                      <span class="text-xs text-gray-500">{{ column.object?.length || 0 }} objects</span>
                                      <div class="w-2 h-2 rounded-full bg-green-400"></div>
                                    </div>
                                  </div>
                                  
                                  <!-- Column Details (Objects) -->
                                  <div v-if="isColumnExpanded(rowIndex, columnIndex)" class="border-t border-gray-200 bg-white">
                                    <div v-if="column.object && column.object.length > 0" class="p-2 space-y-1">
                                      <div v-for="(object, objectIndex) in column.object" 
                                           :key="objectIndex"
                                           class="flex items-center space-x-2 p-2 bg-gray-50 rounded border">
                                        <span class="w-4 h-4 bg-purple-100 text-purple-600 rounded text-xs flex items-center justify-center font-mono">
                                          {{ objectIndex }}
                                        </span>
                                        <div class="flex-1">
                                          <div class="flex items-center space-x-2">
                                            <span class="text-xs font-medium text-gray-700">{{ object.type || 'Unknown' }}</span>
                                            <span class="text-xs text-gray-500 font-mono">{{ object.uid || 'No UID' }}</span>
                                          </div>
                                          <div v-if="object.title || object.content || object.text" class="text-xs text-gray-600 mt-1">
                                            {{ object.title || object.content || object.text || 'No content' }}
                                          </div>
                                        </div>
                                        <div class="w-2 h-2 rounded-full bg-purple-400"></div>
                                      </div>
                                    </div>
                                    <div v-else class="p-2 text-center text-xs text-gray-500">
                                      ไม่มี objects
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div v-else class="p-3 text-center text-xs text-gray-500">
                                ไม่มี columns
                              </div>
                            </div>
                          </div>
                        </div>
                        <div v-else class="text-center text-gray-500 py-4">
                          ไม่มีข้อมูล builder rows
                        </div>
                      </div>
                    </div>

                    <!-- CSS Preview -->
                    <div>
                      <h4 class="text-md font-medium text-gray-900 mb-3">CSS Code</h4>
                      <div class="bg-gray-900 rounded-lg p-4 max-h-64 overflow-y-auto">
                        <pre class="text-green-400 text-sm font-mono whitespace-pre-wrap">{{ selectedRevision.css_data || '/* No CSS code */' }}</pre>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Compare Tab -->
                <div v-if="activeTab === 'compare'">
                  <div class="space-y-4">
                    <div class="flex items-center space-x-4 mb-6">
                      <div class="flex-1">
                        <label class="block text-sm font-medium text-gray-700 mb-2">เปรียบเทียบกับ:</label>
                        <select v-model="compareWithRevision" 
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                          <option value="">เลือก revision เพื่อเปรียบเทียบ</option>
                          <option v-for="revision in revisions.filter(r => r._id !== selectedRevision._id)" 
                                  :key="revision._id" 
                                  :value="revision">
                            {{ revision.description }} - {{ formatDate(revision.created_at) }}
                          </option>
                        </select>
                      </div>
                      <button 
                        v-if="compareWithRevision"
                        @click="generateComparison"
                        class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                        <font-awesome-icon :icon="['fas', 'exchange-alt']" class="h-4 w-4 mr-2" />
                        เปรียบเทียบ
                      </button>
                    </div>

                    <!-- Comparison Results -->
                    <div v-if="comparisonResult" class="space-y-4">
                      <div class="grid grid-cols-2 gap-4">
                        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <h5 class="font-medium text-blue-900 mb-2">{{ selectedRevision.description }}</h5>
                          <div class="space-y-1 text-sm text-blue-700">
                            <p>Rows: {{ selectedRevision.builder_data?.length || 0 }}</p>
                            <p>CSS: {{ selectedRevision.css_data?.length || 0 }} chars</p>
                            <p>{{ formatDate(selectedRevision.created_at) }}</p>
                          </div>
                        </div>
                        <div class="bg-purple-50 border border-purple-200 rounded-lg p-4">
                          <h5 class="font-medium text-purple-900 mb-2">{{ compareWithRevision.description }}</h5>
                          <div class="space-y-1 text-sm text-purple-700">
                            <p>Rows: {{ compareWithRevision.builder_data?.length || 0 }}</p>
                            <p>CSS: {{ compareWithRevision.css_data?.length || 0 }} chars</p>
                            <p>{{ formatDate(compareWithRevision.created_at) }}</p>
                          </div>
                        </div>
                      </div>

                      <!-- Differences -->
                      <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <h5 class="font-medium text-gray-900 mb-3">ความแตกต่าง</h5>
                        <div class="space-y-2">
                          <div class="flex items-center justify-between p-2 bg-white rounded border">
                            <span class="text-sm text-gray-700">Builder Rows</span>
                            <span :class="[
                              'text-sm font-medium',
                              comparisonResult.rowsDiff > 0 ? 'text-green-600' :
                              comparisonResult.rowsDiff < 0 ? 'text-red-600' : 'text-gray-600'
                            ]">
                              {{ comparisonResult.rowsDiff > 0 ? '+' : '' }}{{ comparisonResult.rowsDiff }}
                            </span>
                          </div>
                          <div class="flex items-center justify-between p-2 bg-white rounded border">
                            <span class="text-sm text-gray-700">CSS Characters</span>
                            <span :class="[
                              'text-sm font-medium',
                              comparisonResult.cssDiff > 0 ? 'text-green-600' :
                              comparisonResult.cssDiff < 0 ? 'text-red-600' : 'text-gray-600'
                            ]">
                              {{ comparisonResult.cssDiff > 0 ? '+' : '' }}{{ comparisonResult.cssDiff }}
                            </span>
                          </div>
                          <div class="flex items-center justify-between p-2 bg-white rounded border">
                            <span class="text-sm text-gray-700">Time Difference</span>
                            <span class="text-sm text-gray-600">
                              {{ comparisonResult.timeDiff }}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- No Selection State -->
            <div v-else class="text-center py-12 text-gray-500">
              <font-awesome-icon :icon="['fas', 'mouse-pointer']" class="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 class="text-lg font-medium text-gray-900 mb-2">เลือก Revision</h3>
              <p>เลือก revision จากรายการทางซ้ายเพื่อดูรายละเอียดและการเปลี่ยนแปลง</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Delete Confirmation Modal -->
  <div v-if="showDeleteConfirmation" class="fixed inset-0 z-[1003] bg-black bg-opacity-50 flex items-center justify-center p-4">
    <div class="bg-white max-w-md w-full rounded-lg shadow-xl">
      <div class="p-6">
        <div class="flex items-center space-x-3 mb-4">
          <div class="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <font-awesome-icon :icon="['fas', 'exclamation-triangle']" class="h-5 w-5 text-red-600" />
          </div>
          <div>
            <h3 class="text-lg font-medium text-gray-900">ยืนยันการลบ Revision</h3>
            <p class="text-sm text-gray-500">การดำเนินการนี้ไม่สามารถย้อนกลับได้</p>
          </div>
        </div>
        
        <div class="bg-gray-50 rounded-lg p-3 mb-4">
          <p class="text-sm text-gray-700">
            <strong>Revision:</strong> {{ revisionToDelete?.description || 'ไม่มีคำอธิบาย' }}
          </p>
          <p class="text-xs text-gray-500 mt-1">
            สร้างเมื่อ: {{ formatDate(revisionToDelete?.created_at) }}
          </p>
        </div>
        
        <p class="text-sm text-gray-600 mb-6">
          คุณแน่ใจหรือไม่ว่าต้องการลบ revision นี้? การดำเนินการนี้จะลบข้อมูลถาวรและไม่สามารถกู้คืนได้
        </p>
        
        <div class="flex items-center justify-end space-x-3">
          <button 
            @click="cancelDelete"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            ยกเลิก
          </button>
          <button 
            @click="deleteRevision"
            class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors">
            <font-awesome-icon :icon="['fas', 'trash-alt']" class="h-4 w-4 mr-2" />
            ลบ Revision
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue'

// Props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  revisions: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['close', 'refresh', 'rollback', 'create-branch', 'delete-revision'])

// Reactive Data
const selectedRevision = ref(null)
const selectedRevisionIndex = ref(-1)
const activeTab = ref('changes')
const compareWithRevision = ref('')
const comparisonResult = ref(null)
const showDeleteConfirmation = ref(false)
const revisionToDelete = ref(null)
const expandedRows = ref(new Set())
const expandedColumns = ref(new Set())

// Methods
const selectRevision = (revision, index) => {
  selectedRevision.value = revision
  selectedRevisionIndex.value = index
  comparisonResult.value = null
  compareWithRevision.value = ''
}

const refreshRevisions = () => {
  emit('refresh')
}

const rollbackToRevision = (revision) => {
  emit('rollback', revision)
}

const createBranch = (revision) => {
  emit('create-branch', revision)
}

const confirmDeleteRevision = (revision) => {
  revisionToDelete.value = revision
  showDeleteConfirmation.value = true
}

const deleteRevision = () => {
  if (revisionToDelete.value) {
    emit('delete-revision', revisionToDelete.value._id)
    showDeleteConfirmation.value = false
    revisionToDelete.value = null
    // Clear selection if deleted revision was selected
    if (selectedRevision.value && selectedRevision.value._id === revisionToDelete.value._id) {
      selectedRevision.value = null
      selectedRevisionIndex.value = -1
    }
  }
}

const cancelDelete = () => {
  showDeleteConfirmation.value = false
  revisionToDelete.value = null
}

const toggleRowExpansion = (rowIndex) => {
  if (expandedRows.value.has(rowIndex)) {
    expandedRows.value.delete(rowIndex)
  } else {
    expandedRows.value.add(rowIndex)
  }
}

const toggleColumnExpansion = (rowIndex, columnIndex) => {
  const key = `${rowIndex}-${columnIndex}`
  if (expandedColumns.value.has(key)) {
    expandedColumns.value.delete(key)
  } else {
    expandedColumns.value.add(key)
  }
}

const isRowExpanded = (rowIndex) => {
  return expandedRows.value.has(rowIndex)
}

const isColumnExpanded = (rowIndex, columnIndex) => {
  const key = `${rowIndex}-${columnIndex}`
  return expandedColumns.value.has(key)
}

const formatDate = (dateString) => {
  if (!dateString) return 'Unknown'
  return new Date(dateString).toLocaleString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getChangeIndicator = (revision, index) => {
  if (index === 0) {
    return { hasChanges: false, type: 'current', tooltip: 'Current version' }
  }
  
  const prevRevision = props.revisions[index - 1]
  if (!prevRevision) {
    return { hasChanges: false, type: 'unknown', tooltip: 'Unknown changes' }
  }
  
  const builderDiff = Math.abs((revision.builder_data?.length || 0) - (prevRevision.builder_data?.length || 0))
  const cssDiff = Math.abs((revision.css_data?.length || 0) - (prevRevision.css_data?.length || 0))
  
  if (builderDiff > 5 || cssDiff > 1000) {
    return { hasChanges: true, type: 'major', tooltip: 'Major changes' }
  } else if (builderDiff > 0 || cssDiff > 100) {
    return { hasChanges: true, type: 'minor', tooltip: 'Minor changes' }
  } else {
    return { hasChanges: true, type: 'minimal', tooltip: 'Minimal changes' }
  }
}

const getRevisionChanges = (revision) => {
  const changes = []
  
  // Mock change detection - ในการใช้งานจริงจะต้องเปรียบเทียบกับ revision ก่อนหน้า
  if (revision.builder_data && revision.builder_data.length > 0) {
    changes.push({
      id: `builder-${revision._id}`,
      type: 'modified',
      title: 'Builder Structure Updated',
      description: `Updated builder structure with ${revision.builder_data.length} rows`,
      details: `Total rows: ${revision.builder_data.length}`
    })
  }
  
  if (revision.css_data && revision.css_data.length > 0) {
    changes.push({
      id: `css-${revision._id}`,
      type: 'modified',
      title: 'CSS Styles Updated',
      description: `Updated CSS styles (${revision.css_data.length} characters)`,
      details: revision.css_data.length > 200 ? revision.css_data.substring(0, 200) + '...' : revision.css_data
    })
  }
  
  if (changes.length === 0) {
    changes.push({
      id: `auto-${revision._id}`,
      type: 'added',
      title: 'Auto-save Revision',
      description: 'Automatic revision created during save operation',
      details: null
    })
  }
  
  return changes
}

const generateComparison = () => {
  if (!compareWithRevision.value || !selectedRevision.value) return
  
  const current = selectedRevision.value
  const compare = compareWithRevision.value
  
  const rowsDiff = (current.builder_data?.length || 0) - (compare.builder_data?.length || 0)
  const cssDiff = (current.css_data?.length || 0) - (compare.css_data?.length || 0)
  const timeDiff = Math.abs(new Date(current.created_at) - new Date(compare.created_at))
  
  // Convert time difference to readable format
  const hours = Math.floor(timeDiff / (1000 * 60 * 60))
  const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60))
  const timeDiffText = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
  
  comparisonResult.value = {
    rowsDiff,
    cssDiff,
    timeDiff: timeDiffText
  }
}
</script>

<style scoped>
.tab-content {
  animation: fadeIn 0.2s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Custom scrollbar */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style> 