<template>
  <div class="bg-gray-50 flex dashboard-container" 
       :class="[
         { 'dashboard-promotions-view': activeTab === 'promotions' },
         headerType && `with-${headerType}`,
         customClass
       ]"
       :style="customHeight ? { height: customHeight, maxHeight: customHeight } : {}">
    <!-- Sidebar -->
    <div class="hidden lg:flex lg:w-80 lg:flex-col">
      <div class="flex flex-col flex-grow bg-white border-r border-gray-200">
        <!-- Sidebar Header -->
        <div class="flex items-center justify-between px-4 py-4 border-b border-gray-200 flex-shrink-0">
          <h1 class="text-lg font-semibold text-gray-900">แดชบอร์ดหลักสูตร</h1>
        </div>

        <!-- Statistics Cards in Sidebar -->
        <div v-show="activeTab === 'courses'" class="px-4 py-4 border-b border-gray-200">
          <h3 class="text-sm font-medium text-gray-700 mb-3">สถิติรวม</h3>
          <div class="space-y-3">
            <div class="p-3 bg-blue-50 rounded-lg stats-card">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span class="text-xs text-gray-700">หลักสูตรทั้งหมด</span>
                </div>
                <span class="text-sm font-semibold text-blue-600">{{ totalCourses }}</span>
              </div>
            </div>
            <div class="p-3 bg-green-50 rounded-lg stats-card">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span class="text-xs text-gray-700">ผู้ลงทะเบียนทั้งหมด</span>
                </div>
                <span class="text-sm font-semibold text-green-600">{{ totalEnrollments }}</span>
              </div>
            </div>
            <div class="p-3 bg-purple-50 rounded-lg stats-card">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div class="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span class="text-xs text-gray-700">ผู้เรียนจบทั้งหมด</span>
                </div>
                <span class="text-sm font-semibold text-purple-600">{{ totalCompletions }}</span>
              </div>
            </div>
            <div class="p-3 bg-orange-50 rounded-lg stats-card">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div class="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span class="text-xs text-gray-700">อัตราการเรียนจบเฉลี่ย</span>
                </div>
                <span class="text-sm font-semibold text-orange-600">{{ averageCompletionRate.toFixed(2) }}%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Top Courses Widget -->
        <div v-show="activeTab === 'courses'" class="px-4 py-4 border-b border-gray-200">
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-sm font-semibold text-gray-700 flex items-center">
                <i class="fas fa-medal text-yellow-500 mr-2 text-xs"></i>
                หลักสูตรยอดนิยม 5 อันดับ
              </h3>
              <span class="text-xs text-gray-500">คน</span>
            </div>
            <div class="space-y-2">
              <div v-for="(course, index) in topEnrolledCourses.slice(0, 5)" :key="course._id"
                   class="flex justify-between items-center text-sm py-1">
                <div class="flex items-center">
                  <span class="text-xs text-gray-400 w-4">{{ index + 1 }}.</span>
                  <span class="font-medium text-gray-800 truncate ml-2 max-w-32">
                    {{ course.name }}
                  </span>
                </div>
                <span class="text-blue-600 font-semibold text-sm">{{ course.enrollCount }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Top Users Widget (for users tab) -->
        <div v-show="activeTab === 'users'" class="px-4 py-4 border-b border-gray-200">
          <h3 class="text-sm font-medium text-gray-700 mb-3">ผู้ใช้งานยอดนิยม</h3>
          <div class="space-y-2 max-h-48 overflow-y-auto">
            <div v-for="user in topUsers.slice(0, 3)" :key="user.user._id" 
                 class="p-2 bg-gray-50 rounded-lg">
              <div class="flex items-center justify-between">
                <span class="text-xs font-medium text-gray-700 truncate mr-2">
                  {{ user.user.firstname }} {{ user.user.lastname }}
                </span>
                <span class="text-xs text-green-600 font-semibold">{{ user.completedCount }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Enrollment Statistics Widget (for enrollments tab) -->
        <div v-show="activeTab === 'enrollments'" class="px-4 py-4 border-b border-gray-200">
          <h3 class="text-sm font-medium text-gray-700 mb-3">สถิติการลงทะเบียน</h3>
          <div class="space-y-3">
            <div class="p-3 bg-blue-50 rounded-lg stats-card">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span class="text-xs text-gray-700">การลงทะเบียนทั้งหมด</span>
                </div>
                <span class="text-sm font-semibold text-blue-600">
                  {{ topEnrolledCoursesFromAPI.reduce((sum, course) => sum + course.enrollCount, 0) }}
                </span>
              </div>
            </div>
            <div class="p-3 bg-green-50 rounded-lg stats-card">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span class="text-xs text-gray-700">จำนวนหลักสูตรทั้งหมด</span>
                </div>
                <span class="text-sm font-semibold text-green-600">
                  {{ topEnrolledCoursesFromAPI.length }}
                </span>
              </div>
            </div>
            <div class="p-3 bg-purple-50 rounded-lg stats-card">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div class="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span class="text-xs text-gray-700">เฉลี่ยต่อหลักสูตร</span>
                </div>
                <span class="text-sm font-semibold text-purple-600">
                  {{ topEnrolledCoursesFromAPI.length > 0 
                      ? Math.round(topEnrolledCoursesFromAPI.reduce((sum, course) => sum + course.enrollCount, 0) / topEnrolledCoursesFromAPI.length)
                      : 0 
                  }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Top Enrolled Courses Widget (for enrollments tab) -->
        <div v-show="activeTab === 'enrollments'" class="px-4 py-4 border-b border-gray-200">
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-sm font-semibold text-gray-700 flex items-center">
                <i class="fas fa-medal text-yellow-500 mr-2 text-xs"></i>
                หลักสูตรยอดนิยม 5 อันดับ
              </h3>
              <span class="text-xs text-gray-500">คน</span>
            </div>
            <div class="space-y-2">
              <div v-for="(courseData, index) in topEnrolledCoursesFromAPI.slice(0, 5)" :key="courseData.courseID"
                   class="flex justify-between items-center text-sm py-1">
                <div class="flex items-center">
                  <span class="text-xs text-gray-400 w-4">{{ index + 1 }}.</span>
                  <span class="font-medium text-gray-800 truncate ml-2 max-w-32" :title="courseData.course.name">
                    {{ courseData.course.name }}
                  </span>
                </div>
                <span class="text-blue-600 font-semibold text-sm">{{ courseData.enrollCount }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Date Filter Widget (for users tab) -->
        <div v-show="activeTab === 'users'" class="px-4 py-3 border-b border-gray-200">
          <div class="flex items-center mb-3">
            <i class="fas fa-filter text-blue-500 mr-2 text-sm"></i>
            <h3 class="text-sm font-semibold text-gray-700">ตัวกรองข้อมูล</h3>
          </div>
          
          <!-- Quick Date Filters -->
          <div class="mb-3">
            <label class="block text-xs font-medium text-gray-600 mb-2">ช่วงเวลา</label>
            <div class="grid grid-cols-2 gap-1.5">
              <button @click="setDateRange('week')" 
                      :class="[
                        'text-xs py-1.5 px-2 rounded border transition-all duration-200 date-filter-button',
                        isDateRangeActive('week') 
                          ? 'bg-blue-500 text-white border-blue-500 active' 
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'
                      ]">
                <i class="fas fa-calendar-week mr-1"></i>
                1W
              </button>
              <button @click="setDateRange('month')" 
                      :class="[
                        'text-xs py-1.5 px-2 rounded border transition-all duration-200 date-filter-button',
                        isDateRangeActive('month') 
                          ? 'bg-blue-500 text-white border-blue-500 active' 
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'
                      ]">
                <i class="fas fa-calendar-alt mr-1"></i>
                1M
              </button>
              <button @click="setDateRange('quarter')" 
                      :class="[
                        'text-xs py-1.5 px-2 rounded border transition-all duration-200 date-filter-button',
                        isDateRangeActive('quarter') 
                          ? 'bg-blue-500 text-white border-blue-500 active' 
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'
                      ]">
                <i class="fas fa-calendar mr-1"></i>
                3M
              </button>
              <button @click="setDateRange('year')" 
                      :class="[
                        'text-xs py-1.5 px-2 rounded border transition-all duration-200 date-filter-button',
                        isDateRangeActive('year') 
                          ? 'bg-blue-500 text-white border-blue-500 active' 
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'
                      ]">
                <i class="fas fa-calendar-check mr-1"></i>
                1Y
              </button>
            </div>
          </div>

          <!-- Custom Date Range -->
          <div class="space-y-2">
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">วันที่เริ่มต้น</label>
              <input type="date" v-model="startDate" @change="selectedDateRange = 'custom'"
                     class="w-full text-xs py-1.5 px-2 rounded border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">วันที่สิ้นสุด</label>
              <input type="date" v-model="endDate" @change="selectedDateRange = 'custom'"
                     class="w-full text-xs py-1.5 px-2 rounded border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
            </div>
            <button @click="getData(startDate, endDate)" 
                    class="w-full bg-green-500 hover:bg-green-600 text-white text-xs font-medium py-2 px-3 rounded transition duration-200 flex items-center justify-center">
              <i class="fas fa-search mr-1.5"></i>
              ค้นหา
            </button>
          </div>
        </div>

        <!-- Date Filter Widget (for enrollments tab) -->
        <div v-show="activeTab === 'enrollments'" class="px-4 py-3 border-b border-gray-200">
          <div class="flex items-center mb-3">
            <i class="fas fa-filter text-blue-500 mr-2 text-sm"></i>
            <h3 class="text-sm font-semibold text-gray-700">ตัวกรองข้อมูลการลงทะเบียน</h3>
          </div>
          
          <!-- Quick Date Filters -->
          <div class="mb-3">
            <label class="block text-xs font-medium text-gray-600 mb-2">ช่วงเวลา</label>
            <div class="grid grid-cols-2 gap-1.5">
              <button @click="setDateRange('week')" 
                      :class="[
                        'text-xs py-1.5 px-2 rounded border transition-all duration-200 date-filter-button',
                        isDateRangeActive('week') 
                          ? 'bg-blue-500 text-white border-blue-500 active' 
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'
                      ]">
                <i class="fas fa-calendar-week mr-1"></i>
                1W
              </button>
              <button @click="setDateRange('month')" 
                      :class="[
                        'text-xs py-1.5 px-2 rounded border transition-all duration-200 date-filter-button',
                        isDateRangeActive('month') 
                          ? 'bg-blue-500 text-white border-blue-500 active' 
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'
                      ]">
                <i class="fas fa-calendar-alt mr-1"></i>
                1M
              </button>
              <button @click="setDateRange('quarter')" 
                      :class="[
                        'text-xs py-1.5 px-2 rounded border transition-all duration-200 date-filter-button',
                        isDateRangeActive('quarter') 
                          ? 'bg-blue-500 text-white border-blue-500 active' 
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'
                      ]">
                <i class="fas fa-calendar mr-1"></i>
                3M
              </button>
              <button @click="setDateRange('year')" 
                      :class="[
                        'text-xs py-1.5 px-2 rounded border transition-all duration-200 date-filter-button',
                        isDateRangeActive('year') 
                          ? 'bg-blue-500 text-white border-blue-500 active' 
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'
                      ]">
                <i class="fas fa-calendar-check mr-1"></i>
                1Y
              </button>
            </div>
          </div>

          <!-- Custom Date Range -->
          <div class="space-y-2">
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">วันที่เริ่มต้น</label>
              <input type="date" v-model="startDate" @change="selectedDateRange = 'custom'"
                     class="w-full text-xs py-1.5 px-2 rounded border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">วันที่สิ้นสุด</label>
              <input type="date" v-model="endDate" @change="selectedDateRange = 'custom'"
                     class="w-full text-xs py-1.5 px-2 rounded border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
            </div>
            <button @click="getData(startDate, endDate)" 
                    class="w-full bg-green-500 hover:bg-green-600 text-white text-xs font-medium py-2 px-3 rounded transition duration-200 flex items-center justify-center">
              <i class="fas fa-search mr-1.5"></i>
              ค้นหา
            </button>
          </div>
        </div>

        <!-- Quick Actions Widget -->
        <div class="px-4 py-4 border-b border-gray-200">
          <h3 class="text-sm font-medium text-gray-700 mb-3">การดำเนินการด่วน</h3>
          <div class="space-y-2">
            <button @click="getData()" 
                    class="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors duration-200">
              <i class="fas fa-sync-alt text-sm w-4"></i>
              <span>รีเฟรชข้อมูล</span>
            </button>
            <button @click="exportData" 
                    class="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors duration-200">
              <i class="fas fa-download text-sm w-4"></i>
              <span>ส่งออกข้อมูล</span>
            </button>
          </div>
        </div>

        <!-- Performance Metrics Widget -->
        <div class="mt-auto px-4 py-4 flex-shrink-0">
          <h3 class="text-sm font-medium text-gray-700 mb-3">ประสิทธิภาพ</h3>
          <div class="space-y-2">
            <div class="flex items-center justify-between text-xs">
              <span class="text-gray-600">อัปเดตล่าสุด</span>
              <span class="text-gray-500">{{ new Date().toLocaleTimeString() }}</span>
            </div>
            <div class="flex items-center justify-between text-xs">
              <span class="text-gray-600">สถานะระบบ</span>
              <span class="text-green-600">ออนไลน์</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col min-w-0 h-full">
      <!-- Mobile Header -->
      <div class="lg:hidden bg-white border-b border-gray-200 px-4 py-3">
        <div class="flex items-center justify-between">
          <h1 class="text-lg font-semibold text-gray-900">แดชบอร์ดหลักสูตร</h1>
          <button 
            @click="toggleMobileSidebar" 
            class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <i class="fas fa-bars"></i>
          </button>
        </div>
      </div>

      <!-- Tab Navigation (Mobile) -->
      <div class="lg:hidden bg-white border-b border-gray-200">
        <div class="px-4 py-2">
          <select 
            v-model="activeTab" 
            class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="courses">แดชบอร์ดหลักสูตร</option>
            <option value="users">แดชบอร์ดผู้ใช้งาน</option>
            <option value="enrollments">แดชบอร์ดการลงทะเบียน</option>
            <option value="promotions">แดชบอร์ดโปรโมชั่น</option>
          </select>
        </div>
      </div>

      <!-- Tab Navigation (Desktop) -->
      <div class="hidden lg:block border-b border-gray-200 bg-white">
        <div class="px-4">
          <nav class="flex -mb-px">
            <button 
              @click="activeTab = 'courses'"
              :class="[
                'py-4 px-6 font-medium text-sm transition-colors duration-200',
                activeTab === 'courses'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              แดชบอร์ดหลักสูตร
            </button>
            <button 
              @click="activeTab = 'users'"
              :class="[
                'py-4 px-6 font-medium text-sm transition-colors duration-200',
                activeTab === 'users'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              แดชบอร์ดผู้ใช้งาน
            </button>
            <button 
              @click="activeTab = 'enrollments'"
              :class="[
                'py-4 px-6 font-medium text-sm transition-colors duration-200',
                activeTab === 'enrollments'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              แดชบอร์ดการลงทะเบียน
            </button>
            <button 
              @click="activeTab = 'promotions'"
              :class="[
                'py-4 px-6 font-medium text-sm transition-colors duration-200',
                activeTab === 'promotions'
                  ? 'border-b-2 border-purple-500 text-purple-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              แดชบอร์ดโปรโมชั่น
            </button>
          </nav>
        </div>
      </div>

      <!-- Main Content Area -->
      <div class="flex-1" :class="activeTab === 'promotions' ? 'min-h-screen' : 'p-4'">
        <!-- Courses Dashboard -->
        <div v-show="activeTab === 'courses'" class="h-full flex flex-col p-4">
          <!-- Top Courses Section -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div class="flex items-center justify-between mb-3">
                <h3 class="text-sm font-semibold text-gray-700 flex items-center">
                  <i class="fas fa-user-plus text-blue-500 mr-2 text-xs"></i>
                  ลงทะเบียนสูงสุด 5 อันดับ
                </h3>
                <span class="text-xs text-gray-500">คน</span>
              </div>
              <div class="space-y-2">
                <div v-for="(course, index) in topEnrolledCourses.slice(0, 5)" :key="course._id"
                     class="flex justify-between items-center text-sm py-1">
                  <div class="flex items-center">
                    <span class="text-xs text-gray-400 w-4">{{ index + 1 }}.</span>
                    <span class="font-medium text-gray-800 truncate ml-2 max-w-48">
                      {{ course.name }}
                    </span>
                  </div>
                  <span class="text-blue-600 font-semibold text-sm">{{ course.enrollCount }}</span>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div class="flex items-center justify-between mb-3">
                <h3 class="text-sm font-semibold text-gray-700 flex items-center">
                  <i class="fas fa-graduation-cap text-green-500 mr-2 text-xs"></i>
                  อัตราเรียนจบสูงสุด 5 อันดับ
                </h3>
                <span class="text-xs text-gray-500">%</span>
              </div>
              <div class="space-y-2">
                <div v-for="(course, index) in topCompletionRateCourses.slice(0, 5)" :key="course._id"
                     class="flex justify-between items-center text-sm py-1">
                  <div class="flex items-center">
                    <span class="text-xs text-gray-400 w-4">{{ index + 1 }}.</span>
                    <span class="font-medium text-gray-800 truncate ml-2 max-w-48">
                      {{ course.name }}
                    </span>
                  </div>
                  <span class="text-green-600 font-semibold text-sm">
                    {{ ((course.completedCount / course.enrollCount) * 100).toFixed(2) }}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Course Table -->
          <div class="bg-white rounded-lg shadow-lg flex-1 flex flex-col dashboard-table-section">
            <div class="p-6 border-b border-gray-200 flex-shrink-0">
              <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h2 class="text-xl font-bold text-gray-800">รายชื่อหลักสูตรทั้งหมด</h2>
                <div class="flex items-center gap-3">
                  <span class="text-sm text-gray-600">แสดง:</span>
                  <select 
                    v-model="coursesPerPage" 
                    @change="changeCoursePageSize(coursesPerPage)"
                    class="text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 py-1 px-2"
                  >
                    <option 
                      v-for="option in itemsPerPageOptions" 
                      :key="option.value" 
                      :value="option.value"
                    >
                      {{ option.label }}
                    </option>
                  </select>
                </div>
              </div>
            </div>
            
            <div class="dashboard-table-content">
              <div v-if="loading" class="table-loading">
                <div class="text-center">
                  <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p class="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
                </div>
              </div>

              <div v-else-if="items.length === 0" class="table-empty">
                <div class="text-center text-gray-500">
                  <i class="fas fa-inbox text-4xl mb-4 text-gray-300"></i>
                  <p>ไม่พบข้อมูลหลักสูตร</p>
                </div>
              </div>

              <div v-else class="dashboard-table-wrapper">
                <div class="dashboard-table-scroll table-container">
                  <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50 sticky top-0">
                      <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ข้อมูลหลักสูตร</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-center">จำนวนผู้ลงทะเบียน</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-center">จำนวนผู้เรียนจบ</th>
                      </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                      <tr v-for="(item, index) in paginatedCourses" :key="item._id" 
                          class="hover:bg-gray-50 transition-colors duration-200">
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 align-top">
                          {{ (currentCoursePage - 1) * coursesPerPage + index + 1 }}
                        </td>
                        <td class="px-6 py-4">
                          <div class="text-sm">
                            <p class="font-medium text-gray-900 mb-1">{{ item.name }}</p>
                            <div class="space-y-1 text-gray-500">
                              <p class="flex items-center">
                                <span class="font-medium mr-2">ประเภท:</span>
                                {{ item.type || '-' }}
                              </p>
                              <p class="flex items-center">
                                <span class="font-medium mr-2">วิทยากร:</span>
                                <template v-if="Array.isArray(item.lecturer)">
                                  <span v-if="item.lecturer.length > 0">
                                    {{ item.lecturer.map(l => l.name).join(', ') }}
                                  </span>
                                  <span v-else>-</span>
                                </template>
                                <template v-else>
                                  {{ item.lecturer || '-' }}
                                </template>
                              </p>
                              <p class="flex items-center">
                                <span class="font-medium mr-2">หมวดหมู่:</span>
                                <template v-if="Array.isArray(item.category) && item.category.length">
                                  {{ item.category.join(', ') }}
                                </template>
                                <template v-else>
                                  -
                                </template>
                              </p>
                            </div>
                          </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 text-center align-top">
                          {{ item.enrollCount }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600 text-center align-top">
                          {{ item.completedCount }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <!-- Pagination Controls -->
            <div v-if="items.length > 0" class="px-6 py-4 border-t border-gray-200 flex-shrink-0 dashboard-pagination">
              <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div class="text-sm text-gray-700">
                  {{ coursesPaginationInfo }}
                </div>
                <div v-if="totalCoursePages > 1" class="flex items-center gap-2">
                  <!-- Previous Button -->
                  <button 
                    @click="previousCoursePage"
                    :disabled="currentCoursePage === 1"
                    class="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <i class="fas fa-chevron-left mr-1"></i>
                    ก่อนหน้า
                  </button>

                  <!-- Page Numbers -->
                  <div class="flex items-center gap-1">
                    <!-- First page if not in visible range -->
                    <button 
                      v-if="getVisibleCoursePages()[0] > 1"
                      @click="goToCoursePage(1)"
                      class="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      1
                    </button>
                    <span v-if="getVisibleCoursePages()[0] > 2" class="px-2 text-gray-500">...</span>

                    <!-- Visible page numbers -->
                    <button 
                      v-for="page in getVisibleCoursePages()" 
                      :key="page"
                      @click="goToCoursePage(page)"
                      :class="[
                        'px-3 py-1 text-sm border rounded-md',
                        currentCoursePage === page 
                          ? 'bg-blue-600 text-white border-blue-600' 
                          : 'border-gray-300 hover:bg-gray-50'
                      ]"
                    >
                      {{ page }}
                    </button>

                    <!-- Last page if not in visible range -->
                    <span v-if="getVisibleCoursePages()[getVisibleCoursePages().length - 1] < totalCoursePages - 1" class="px-2 text-gray-500">...</span>
                    <button 
                      v-if="getVisibleCoursePages()[getVisibleCoursePages().length - 1] < totalCoursePages"
                      @click="goToCoursePage(totalCoursePages)"
                      class="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      {{ totalCoursePages }}
                    </button>
                  </div>

                  <!-- Next Button -->
                  <button 
                    @click="nextCoursePage"
                    :disabled="currentCoursePage === totalCoursePages"
                    class="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ถัดไป
                    <i class="fas fa-chevron-right ml-1"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Users Dashboard -->
        <div v-show="activeTab === 'users'" class="h-full flex flex-col">
          <!-- User Statistics Widgets -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div class="flex items-center justify-between mb-3">
                <h3 class="text-sm font-semibold text-gray-700 flex items-center">
                  <i class="fas fa-user-plus text-blue-500 mr-2 text-xs"></i>
                  ลงทะเบียนสูงสุด 5 อันดับ
                </h3>
                <span class="text-xs text-gray-500">คน</span>
              </div>
              <div class="space-y-2">
                <div v-for="(user, index) in topUsers.slice(0, 5)" :key="user.user._id"
                     class="flex justify-between items-center text-sm py-1">
                  <div class="flex items-center">
                    <span class="text-xs text-gray-400 w-4">{{ index + 1 }}.</span>
                    <span class="font-medium text-gray-800 truncate ml-2 max-w-32">
                      {{ user.user.firstname }} {{ user.user.lastname }}
                    </span>
                  </div>
                  <span class="text-blue-600 font-semibold text-sm">{{ user.enrollCount }}</span>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div class="flex items-center justify-between mb-3">
                <h3 class="text-sm font-semibold text-gray-700 flex items-center">
                  <i class="fas fa-graduation-cap text-green-500 mr-2 text-xs"></i>
                  เรียนจบสูงสุด 5 อันดับ
                </h3>
                <span class="text-xs text-gray-500">คอร์ส</span>
              </div>
              <div class="space-y-2">
                <div v-for="(user, index) in topUsers.slice(0, 5)" :key="user.user._id"
                     class="flex justify-between items-center text-sm py-1">
                  <div class="flex items-center">
                    <span class="text-xs text-gray-400 w-4">{{ index + 1 }}.</span>
                    <span class="font-medium text-gray-800 truncate ml-2 max-w-32">
                      {{ user.user.firstname }} {{ user.user.lastname }}
                    </span>
                  </div>
                  <span class="text-green-600 font-semibold text-sm">{{ user.completedCount }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- User Table -->
          <div class="bg-white rounded-lg shadow-lg flex-1 flex flex-col dashboard-table-section">
            <div class="p-6 border-b border-gray-200 flex-shrink-0">
              <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h2 class="text-xl font-bold text-gray-800">ตารางแสดงข้อมูลผู้ใช้ทั้งหมด</h2>
                <div class="flex items-center gap-3">
                  <span class="text-sm text-gray-600">แสดง:</span>
                  <select 
                    v-model="usersPerPage" 
                    @change="changeUserPageSize(usersPerPage)"
                    class="text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 py-1 px-2"
                  >
                    <option 
                      v-for="option in itemsPerPageOptions" 
                      :key="option.value" 
                      :value="option.value"
                    >
                      {{ option.label }}
                    </option>
                  </select>
                </div>
              </div>
            </div>
            
            <div class="dashboard-table-content">
              <div v-if="!topUsers.length" class="table-empty">
                <div class="text-center text-gray-500">
                  <i class="fas fa-users text-4xl mb-4 text-gray-300"></i>
                  <p>ไม่พบข้อมูลผู้ใช้</p>
                </div>
              </div>

              <div v-else class="dashboard-table-wrapper">
                <div class="dashboard-table-scroll table-container">
                  <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50 sticky top-0">
                      <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อ</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">นามสกุล</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">อีเมล</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">จำนวนการลงทะเบียน</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">จำนวนคอร์สที่เรียนจบ</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">อัตราการเรียนจบ</th>
                        <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">ตรวจสอบแล้ว</th>
                      </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                      <tr v-for="(user, index) in paginatedUsers" :key="user.user._id" 
                          class="hover:bg-gray-50 transition-colors duration-200">
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {{ (currentUserPage - 1) * usersPerPage + index + 1 }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {{ user.user.firstname || '-' }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {{ user.user.lastname || '-' }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {{ user.user.email || '-' }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                          {{ user.enrollCount }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                          {{ user.completedCount }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium" 
                            :class="getCompletionRateColor(user.completedCount, user.enrollCount)">
                          {{ calculateCompletionRate(user.completedCount, user.enrollCount) }}%
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-center">
                          <div class="flex items-center justify-center space-x-2">
                            <input 
                              type="checkbox" 
                              :id="`check-${user.user._id}`"
                              :checked="user.checked?.status || false"
                              @change="updateUserCheckedStatus(user.user._id, $event.target.checked)"
                              :disabled="checkingUsers.includes(user.user._id)"
                              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors duration-200 disabled:opacity-50"
                            />
                            <label :for="`check-${user.user._id}`" class="sr-only">ตรวจสอบผู้ใช้ {{ user.user.firstname }} {{ user.user.lastname }}</label>
                            <div v-if="checkingUsers.includes(user.user._id)" class="flex items-center">
                              <i class="fas fa-spinner fa-spin text-blue-500 text-xs"></i>
                            </div>
                            <div v-else-if="user.checked?.status && user.checked?.checkedAt" class="text-xs text-gray-500">
                              {{ formatCheckedDate(user.checked.checkedAt) }}
                            </div>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <!-- Pagination Controls -->
            <div v-if="topUsers.length > 0" class="px-6 py-4 border-t border-gray-200 flex-shrink-0 dashboard-pagination">
              <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div class="text-sm text-gray-700">
                  {{ usersPaginationInfo }}
                </div>
                <div v-if="totalUserPages > 1" class="flex items-center gap-2">
                  <!-- Previous Button -->
                  <button 
                    @click="previousUserPage"
                    :disabled="currentUserPage === 1"
                    class="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <i class="fas fa-chevron-left mr-1"></i>
                    ก่อนหน้า
                  </button>

                  <!-- Page Numbers -->
                  <div class="flex items-center gap-1">
                    <!-- First page if not in visible range -->
                    <button 
                      v-if="getVisibleUserPages()[0] > 1"
                      @click="goToUserPage(1)"
                      class="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      1
                    </button>
                    <span v-if="getVisibleUserPages()[0] > 2" class="px-2 text-gray-500">...</span>

                    <!-- Visible page numbers -->
                    <button 
                      v-for="page in getVisibleUserPages()" 
                      :key="page"
                      @click="goToUserPage(page)"
                      :class="[
                        'px-3 py-1 text-sm border rounded-md',
                        currentUserPage === page 
                          ? 'bg-blue-600 text-white border-blue-600' 
                          : 'border-gray-300 hover:bg-gray-50'
                      ]"
                    >
                      {{ page }}
                    </button>

                    <!-- Last page if not in visible range -->
                    <span v-if="getVisibleUserPages()[getVisibleUserPages().length - 1] < totalUserPages - 1" class="px-2 text-gray-500">...</span>
                    <button 
                      v-if="getVisibleUserPages()[getVisibleUserPages().length - 1] < totalUserPages"
                      @click="goToUserPage(totalUserPages)"
                      class="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      {{ totalUserPages }}
                    </button>
                  </div>

                  <!-- Next Button -->
                  <button 
                    @click="nextUserPage"
                    :disabled="currentUserPage === totalUserPages"
                    class="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ถัดไป
                    <i class="fas fa-chevron-right ml-1"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Enrollments Dashboard -->
        <div v-show="activeTab === 'enrollments'" class="h-full flex flex-col p-4">
          <!-- Date Range Info -->
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <div class="flex items-center gap-2">
              <i class="fas fa-info-circle text-blue-600"></i>
              <span class="text-sm text-blue-800">
                แสดงข้อมูลการลงทะเบียนระหว่างวันที่ 
                <strong>{{ formatDisplayDate(startDate) }}</strong> ถึง 
                <strong>{{ formatDisplayDate(endDate) }}</strong>
              </span>
            </div>
          </div>

          <!-- Enrollment Statistics Section -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <!-- Total Enrollments Card -->
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-600">การลงทะเบียนทั้งหมด</p>
                  <p class="text-2xl font-bold text-blue-600">
                    {{ topEnrolledCoursesFromAPI.reduce((sum, course) => sum + course.enrollCount, 0) }}
                  </p>
                </div>
                <div class="p-3 bg-blue-100 rounded-full">
                  <i class="fas fa-user-plus text-blue-600 text-xl"></i>
                </div>
              </div>
            </div>

            <!-- Most Popular Course Card -->
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-600">หลักสูตรยอดนิยม</p>
                  <p class="text-lg font-bold text-green-600">
                    {{ topEnrolledCoursesFromAPI.length > 0 ? topEnrolledCoursesFromAPI[0].enrollCount : 0 }} คน
                  </p>
                </div>
                <div class="p-3 bg-green-100 rounded-full">
                  <i class="fas fa-crown text-green-600 text-xl"></i>
                </div>
              </div>
            </div>

            <!-- Average Enrollments Card -->
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-600">เฉลี่ยต่อหลักสูตร</p>
                  <p class="text-2xl font-bold text-purple-600">
                    {{ topEnrolledCoursesFromAPI.length > 0 
                        ? Math.round(topEnrolledCoursesFromAPI.reduce((sum, course) => sum + course.enrollCount, 0) / topEnrolledCoursesFromAPI.length)
                        : 0 
                    }}
                  </p>
                </div>
                <div class="p-3 bg-purple-100 rounded-full">
                  <i class="fas fa-chart-bar text-purple-600 text-xl"></i>
                </div>
              </div>
            </div>
          </div>

          <!-- Top 10 Enrolled Courses Chart Section -->
          <div class="bg-white rounded-lg shadow-lg flex-1 flex flex-col dashboard-table-section">
            <div class="p-6 border-b border-gray-200 flex-shrink-0">
              <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 class="text-xl font-bold text-gray-800">หลักสูตรที่มีการลงทะเบียนสูงสุด</h2>
                  <p class="text-sm text-gray-600 mt-1">
                    ข้อมูลระหว่างวันที่ {{ formatDisplayDate(startDate) }} - {{ formatDisplayDate(endDate) }}
                    <span class="font-medium text-blue-600">({{ topEnrolledCoursesFromAPI.length }} หลักสูตร)</span>
                  </p>
                </div>
                <div class="flex items-center gap-3">
                  <span class="text-sm text-gray-600">แสดง:</span>
                  <select 
                    v-model="enrollmentsPerPage" 
                    @change="changeEnrollmentPageSize(enrollmentsPerPage)"
                    class="text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 py-1 px-2"
                  >
                    <option 
                      v-for="option in itemsPerPageOptions" 
                      :key="option.value" 
                      :value="option.value"
                    >
                      {{ option.label }}
                    </option>
                  </select>
                </div>
              </div>
            </div>
            
            <div class="dashboard-table-content">
              <div v-if="loading" class="table-loading">
                <div class="text-center">
                  <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p class="mt-4 text-gray-600">กำลังโหลดข้อมูลการลงทะเบียน...</p>
                </div>
              </div>

              <div v-else-if="!topEnrolledCoursesFromAPI.length" class="table-empty">
                <div class="text-center text-gray-500">
                  <i class="fas fa-chart-line text-4xl mb-4 text-gray-300"></i>
                  <p>ไม่พบข้อมูลการลงทะเบียน</p>
                  <p class="text-xs mt-2">ลองเปลี่ยนช่วงเวลาหรือรีเฟรชข้อมูล</p>
                </div>
              </div>

              <div v-else class="dashboard-table-wrapper">
                <div class="dashboard-table-scroll table-container">
                  <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50 sticky top-0">
                      <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">อันดับ</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อหลักสูตร</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วิทยากร</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">หมวดหมู่</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ประเภท</th>
                        <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">จำนวนผู้ลงทะเบียน</th>
                        <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">สัดส่วน</th>
                        <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">จำนวนผู้ลงทะเบียน</th>
                        <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">สัดส่วน</th>
                      </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                      <tr v-for="(courseData, index) in paginatedEnrollments" 
                          :key="courseData.courseID"
                          class="hover:bg-gray-50 transition-colors duration-200">
                        <!-- อันดับ -->
                        <td class="px-6 py-4 whitespace-nowrap">
                          <div class="flex items-center">
                            <span class="inline-flex items-center justify-center w-8 h-8 rounded-full text-white text-sm font-bold"
                                  :class="[
                                    (currentEnrollmentPage - 1) * enrollmentsPerPage + index === 0 ? 'bg-yellow-500' :
                                    (currentEnrollmentPage - 1) * enrollmentsPerPage + index === 1 ? 'bg-gray-400' :
                                    (currentEnrollmentPage - 1) * enrollmentsPerPage + index === 2 ? 'bg-orange-600' :
                                    'bg-blue-500'
                                  ]">
                              {{ (currentEnrollmentPage - 1) * enrollmentsPerPage + index + 1 }}
                            </span>
                          </div>
                        </td>
                        
                        <!-- ชื่อหลักสูตร -->
                        <td class="px-6 py-4">
                          <div class="text-sm font-medium text-gray-900 max-w-xs truncate">
                            {{ courseData.course.name }}
                          </div>
                          <div class="text-xs text-gray-500 mt-1">
                            ID: {{ courseData.courseID }}
                          </div>
                        </td>
                        
                        <!-- วิทยากร -->
                        <td class="px-6 py-4">
                          <div class="text-sm text-gray-900">
                            <template v-if="Array.isArray(courseData.course.lecturer)">
                              <div v-for="lecturer in courseData.course.lecturer.slice(0, 2)" 
                                   :key="lecturer._id" 
                                   class="truncate max-w-xs">
                                {{ lecturer.name }}
                              </div>
                              <div v-if="courseData.course.lecturer.length > 2" 
                                   class="text-xs text-gray-500">
                                และอีก {{ courseData.course.lecturer.length - 2 }} คน
                              </div>
                            </template>
                            <template v-else>
                              <div class="truncate max-w-xs">
                                {{ courseData.course.lecturer || '-' }}
                              </div>
                            </template>
                          </div>
                        </td>
                        
                        <!-- หมวดหมู่ -->
                        <td class="px-6 py-4">
                          <div class="text-sm text-gray-900">
                            <template v-if="Array.isArray(courseData.course.category) && courseData.course.category.length">
                              <span v-for="(cat, catIndex) in courseData.course.category.slice(0, 2)" 
                                    :key="catIndex"
                                    class="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs mr-1 mb-1">
                                {{ cat }}
                              </span>
                              <div v-if="courseData.course.category.length > 2" 
                                   class="text-xs text-gray-500">
                                +{{ courseData.course.category.length - 2 }}
                              </div>
                            </template>
                            <template v-else>
                              <span class="text-gray-500">-</span>
                            </template>
                          </div>
                        </td>
                        
                        <!-- ประเภท -->
                        <td class="px-6 py-4 whitespace-nowrap">
                          <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                                :class="[
                                  courseData.course.type === 'e_learning' 
                                    ? 'bg-blue-100 text-blue-800' 
                                    : 'bg-gray-100 text-gray-800'
                                ]">
                            {{ courseData.course.type === 'e_learning' ? 'E-Learning' : courseData.course.type }}
                          </span>
                        </td>
                        
                        <!-- จำนวนผู้ลงทะเบียน -->
                        <td class="px-6 py-4 whitespace-nowrap text-right">
                          <div class="text-lg font-bold text-blue-600">
                            {{ courseData.enrollCount.toLocaleString() }}
                          </div>
                          <div class="text-xs text-gray-500">คน</div>
                        </td>
                        
                        <!-- สัดส่วน -->
                        <td class="px-6 py-4 whitespace-nowrap text-center">
                          <div class="w-full bg-gray-200 rounded-full h-2">
                            <div class="bg-blue-600 h-2 rounded-full" 
                                 :style="{ width: getEnrollmentPercentage(courseData.enrollCount) + '%' }">
                            </div>
                          </div>
                          <div class="text-xs text-gray-600 mt-1">
                            {{ getEnrollmentPercentage(courseData.enrollCount).toFixed(1) }}%
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <!-- Pagination Controls -->
            <div v-if="topEnrolledCoursesFromAPI.length > 0" class="px-6 py-4 border-t border-gray-200 flex-shrink-0 dashboard-pagination">
              <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div class="text-sm text-gray-700">
                  {{ enrollmentsPaginationInfo }}
                </div>
                <div v-if="totalEnrollmentPages > 1" class="flex items-center gap-2">
                  <!-- Previous Button -->
                  <button 
                    @click="previousEnrollmentPage"
                    :disabled="currentEnrollmentPage === 1"
                    class="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <i class="fas fa-chevron-left mr-1"></i>
                    ก่อนหน้า
                  </button>

                  <!-- Page Numbers -->
                  <div class="flex items-center gap-1">
                    <!-- First page if not in visible range -->
                    <button 
                      v-if="getVisibleEnrollmentPages()[0] > 1"
                      @click="goToEnrollmentPage(1)"
                      class="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      1
                    </button>
                    <span v-if="getVisibleEnrollmentPages()[0] > 2" class="px-2 text-gray-500">...</span>

                    <!-- Visible page numbers -->
                    <button 
                      v-for="page in getVisibleEnrollmentPages()" 
                      :key="page"
                      @click="goToEnrollmentPage(page)"
                      :class="[
                        'px-3 py-1 text-sm border rounded-md',
                        currentEnrollmentPage === page 
                          ? 'bg-blue-600 text-white border-blue-600' 
                          : 'border-gray-300 hover:bg-gray-50'
                      ]"
                    >
                      {{ page }}
                    </button>

                    <!-- Last page if not in visible range -->
                    <span v-if="getVisibleEnrollmentPages()[getVisibleEnrollmentPages().length - 1] < totalEnrollmentPages - 1" class="px-2 text-gray-500">...</span>
                    <button 
                      v-if="getVisibleEnrollmentPages()[getVisibleEnrollmentPages().length - 1] < totalEnrollmentPages"
                      @click="goToEnrollmentPage(totalEnrollmentPages)"
                      class="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      {{ totalEnrollmentPages }}
                    </button>
                  </div>

                  <!-- Next Button -->
                  <button 
                    @click="nextEnrollmentPage"
                    :disabled="currentEnrollmentPage === totalEnrollmentPages"
                    class="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ถัดไป
                    <i class="fas fa-chevron-right ml-1"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Promotions Dashboard -->
        <div v-show="activeTab === 'promotions'" class="w-full">
          <PromotionDashboard />
        </div>
      </div>
    </div>

    <!-- Mobile Sidebar Overlay -->
    <div 
      v-if="showMobileSidebar" 
      class="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50"
      @click="toggleMobileSidebar"
    >
      <div 
        class="w-80 h-full bg-white transform transition-transform duration-300"
        @click.stop
      >
        <!-- Mobile Sidebar Content (same as desktop sidebar) -->
        <div class="flex flex-col h-full">
          <!-- Sidebar Header -->
          <div class="flex items-center justify-between px-4 py-4 border-b border-gray-200">
            <h1 class="text-lg font-semibold text-gray-900">แดชบอร์ดหลักสูตร</h1>
            <button 
              @click="toggleMobileSidebar"
              class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>

          <!-- Statistics Cards in Mobile Sidebar -->
          <div v-show="activeTab === 'courses'" class="px-4 py-4 border-b border-gray-200">
            <h3 class="text-sm font-medium text-gray-700 mb-3">สถิติรวม</h3>
            <div class="grid grid-cols-2 gap-2">
              <div class="p-2 bg-blue-50 rounded-lg">
                <div class="text-center">
                  <div class="text-lg font-bold text-blue-600">{{ totalCourses }}</div>
                  <div class="text-xs text-gray-600">หลักสูตร</div>
                </div>
              </div>
              <div class="p-2 bg-green-50 rounded-lg">
                <div class="text-center">
                  <div class="text-lg font-bold text-green-600">{{ totalEnrollments }}</div>
                  <div class="text-xs text-gray-600">ลงทะเบียน</div>
                </div>
              </div>
              <div class="p-2 bg-purple-50 rounded-lg">
                <div class="text-center">
                  <div class="text-lg font-bold text-purple-600">{{ totalCompletions }}</div>
                  <div class="text-xs text-gray-600">เรียนจบ</div>
                </div>
              </div>
              <div class="p-2 bg-orange-50 rounded-lg">
                <div class="text-center">
                  <div class="text-lg font-bold text-orange-600">{{ averageCompletionRate.toFixed(2) }}%</div>
                  <div class="text-xs text-gray-600">อัตราจบ</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Statistics Cards for Enrollments in Mobile Sidebar -->
          <div v-show="activeTab === 'enrollments'" class="px-4 py-4 border-b border-gray-200">
            <h3 class="text-sm font-medium text-gray-700 mb-3">สถิติการลงทะเบียน</h3>
            <div class="grid grid-cols-2 gap-2">
              <div class="p-2 bg-blue-50 rounded-lg">
                <div class="text-center">
                  <div class="text-lg font-bold text-blue-600">
                    {{ topEnrolledCoursesFromAPI.reduce((sum, course) => sum + course.enrollCount, 0) }}
                  </div>
                  <div class="text-xs text-gray-600">การลงทะเบียนทั้งหมด</div>
                </div>
              </div>
              <div class="p-2 bg-green-50 rounded-lg">
                <div class="text-center">
                  <div class="text-lg font-bold text-green-600">{{ topEnrolledCoursesFromAPI.length }}</div>
                  <div class="text-xs text-gray-600">หลักสูตร</div>
                </div>
              </div>
              <div class="p-2 bg-purple-50 rounded-lg">
                <div class="text-center">
                  <div class="text-lg font-bold text-purple-600">
                    {{ topEnrolledCoursesFromAPI.length > 0 
                        ? Math.round(topEnrolledCoursesFromAPI.reduce((sum, course) => sum + course.enrollCount, 0) / topEnrolledCoursesFromAPI.length)
                        : 0 
                    }}
                  </div>
                  <div class="text-xs text-gray-600">เฉลี่ยต่อหลักสูตร</div>
                </div>
              </div>
              <div class="p-2 bg-yellow-50 rounded-lg">
                <div class="text-center">
                  <div class="text-lg font-bold text-yellow-600">
                    {{ topEnrolledCoursesFromAPI.length > 0 ? topEnrolledCoursesFromAPI[0].enrollCount : 0 }}
                  </div>
                  <div class="text-xs text-gray-600">ยอดนิยมสุด</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Tab Navigation Menu in Mobile -->
          <div class="px-4 py-4 border-b border-gray-200">
            <h3 class="text-sm font-medium text-gray-700 mb-3">เมนู</h3>
            <nav class="space-y-1">
              <button 
                @click="selectTabAndCloseMobile('courses')" 
                class="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors duration-200"
                :class="{ 
                  'bg-blue-100 text-blue-700 font-medium': activeTab === 'courses',
                  'text-gray-600 hover:bg-gray-100 hover:text-gray-900': activeTab !== 'courses'
                }"
              >
                <i class="fas fa-graduation-cap text-sm w-4"></i>
                <span class="flex-1 text-left">แดชบอร์ดหลักสูตร</span>
              </button>
              <button 
                @click="selectTabAndCloseMobile('users')" 
                class="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors duration-200"
                :class="{ 
                  'bg-blue-100 text-blue-700 font-medium': activeTab === 'users',
                  'text-gray-600 hover:bg-gray-100 hover:text-gray-900': activeTab !== 'users'
                }"
              >
                <i class="fas fa-users text-sm w-4"></i>
                <span class="flex-1 text-left">แดชบอร์ดผู้ใช้งาน</span>
              </button>
              <button 
                @click="selectTabAndCloseMobile('enrollments')" 
                class="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors duration-200"
                :class="{ 
                  'bg-blue-100 text-blue-700 font-medium': activeTab === 'enrollments',
                  'text-gray-600 hover:bg-gray-100 hover:text-gray-900': activeTab !== 'enrollments'
                }"
              >
                <i class="fas fa-user-plus text-sm w-4"></i>
                <span class="flex-1 text-left">แดชบอร์ดการลงทะเบียน</span>
              </button>
              <button 
                @click="selectTabAndCloseMobile('promotions')" 
                class="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors duration-200"
                :class="{ 
                  'bg-purple-100 text-purple-700 font-medium': activeTab === 'promotions',
                  'text-gray-600 hover:bg-gray-100 hover:text-gray-900': activeTab !== 'promotions'
                }"
              >
                <i class="fas fa-tags text-sm w-4"></i>
                <span class="flex-1 text-left">แดชบอร์ดโปรโมชั่น</span>
              </button>
            </nav>
          </div>

          <!-- Quick Actions in Mobile -->
          <div class="px-4 py-4 border-b border-gray-200">
            <h3 class="text-sm font-medium text-gray-700 mb-3">การดำเนินการ</h3>
            <div class="space-y-2">
              <button @click="getData(); toggleMobileSidebar()" 
                      class="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors duration-200">
                <i class="fas fa-sync-alt text-sm w-4"></i>
                <span>รีเฟรชข้อมูล</span>
              </button>
              <button @click="exportData; toggleMobileSidebar()" 
                      class="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors duration-200">
                <i class="fas fa-download text-sm w-4"></i>
                <span>ส่งออกข้อมูล</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import storageManager from '@/plugins/storage'
import PromotionDashboard from './PromotionDashboard.vue'

export default {
  name: 'EnrollList',
  components: {
    PromotionDashboard
  },
  props: {
    // ประเภทของ header layout
    headerType: {
      type: String,
      default: null,
      validator: value => ['topbar', 'breadcrumb', 'full-admin', null].includes(value)
    },
    // ความสูงของ header แบบกำหนดเอง
    headerHeight: {
      type: [Number, String],
      default: null
    },
    // ความสูงทั้งหมดแบบกำหนดเอง
    customHeight: {
      type: String,
      default: null
    },
    // CSS class เพิ่มเติม
    customClass: {
      type: String,
      default: ''
    }
  },

  data() {
    const session = storageManager.get('session')
    const today = new Date().toISOString().substr(0, 10) // แปลงวันที่ปัจจุบันเป็นรูปแบบ YYYY-MM-DD
    const currentYear = new Date().getFullYear()
    const reportStartDate = `${currentYear}-04-09` // วันที่ 9 เมษายน ของปีปัจจุบัน
    return {
      activeTab: 'courses', // เพิ่ม state สำหรับควบคุมแท็บ
      items: [],
      loading: false,
      configs: storageManager.get('configs'),
      session,
      totalCourses: 0,
      totalEnrollments: 0,
      totalCompletions: 0,
      averageCompletionRate: 0,
      topEnrolledCourses: [],
      topCompletionRateCourses: [],
      topUsers: [],
      // ข้อมูลสำหรับแท็บการลงทะเบียน
      topEnrolledCoursesFromAPI: [],
      // Pagination for enrollments
      enrollmentsPerPage: 10,
      currentEnrollmentPage: 1,
      startDate: reportStartDate,
      endDate: today,
      showMobileSidebar: false,
      // Pagination for courses
      coursesPerPage: 10,
      currentCoursePage: 1,
      // Pagination for users
      usersPerPage: 10,
      currentUserPage: 1,
      // Items per page options
      itemsPerPageOptions: [
        { value: 10, label: '10 รายการ' },
        { value: 25, label: '25 รายการ' },
        { value: 50, label: '50 รายการ' },
        { value: 100, label: '100 รายการ' },
        { value: -1, label: 'ทั้งหมด' }
      ],
      selectedDateRange: 'custom', // Added for date filter
      checkingUsers: []
    }
  },

  computed: {
    // Courses pagination
    totalCoursePages() {
      if (this.coursesPerPage === -1) return 1;
      return Math.ceil(this.items.length / this.coursesPerPage);
    },
    
    paginatedCourses() {
      if (this.coursesPerPage === -1) return this.items;
      const start = (this.currentCoursePage - 1) * this.coursesPerPage;
      const end = start + this.coursesPerPage;
      return this.items.slice(start, end);
    },
    
    coursesPaginationInfo() {
      if (this.coursesPerPage === -1) {
        return `แสดง ${this.items.length} รายการจากทั้งหมด ${this.items.length} รายการ`;
      }
      const start = (this.currentCoursePage - 1) * this.coursesPerPage + 1;
      const end = Math.min(start + this.coursesPerPage - 1, this.items.length);
      return `แสดง ${start}-${end} จากทั้งหมด ${this.items.length} รายการ`;
    },
    
    // Users pagination
    totalUserPages() {
      if (this.usersPerPage === -1) return 1;
      return Math.ceil(this.topUsers.length / this.usersPerPage);
    },
    
    paginatedUsers() {
      if (this.usersPerPage === -1) return this.topUsers;
      const start = (this.currentUserPage - 1) * this.usersPerPage;
      const end = start + this.usersPerPage;
      return this.topUsers.slice(start, end);
    },
    
    usersPaginationInfo() {
      if (this.usersPerPage === -1) {
        return `แสดง ${this.topUsers.length} รายการจากทั้งหมด ${this.topUsers.length} รายการ`;
      }
      const start = (this.currentUserPage - 1) * this.usersPerPage + 1;
      const end = Math.min(start + this.usersPerPage - 1, this.topUsers.length);
      return `แสดง ${start}-${end} จากทั้งหมด ${this.topUsers.length} รายการ`;
    },

    // Enrollments pagination
    totalEnrollmentPages() {
      if (this.enrollmentsPerPage === -1) return 1;
      return Math.ceil(this.topEnrolledCoursesFromAPI.length / this.enrollmentsPerPage);
    },
    
    paginatedEnrollments() {
      if (this.enrollmentsPerPage === -1) return this.topEnrolledCoursesFromAPI;
      const start = (this.currentEnrollmentPage - 1) * this.enrollmentsPerPage;
      const end = start + this.enrollmentsPerPage;
      return this.topEnrolledCoursesFromAPI.slice(start, end);
    },
    
    enrollmentsPaginationInfo() {
      if (this.enrollmentsPerPage === -1) {
        return `แสดง ${this.topEnrolledCoursesFromAPI.length} รายการจากทั้งหมด ${this.topEnrolledCoursesFromAPI.length} รายการ`;
      }
      const start = (this.currentEnrollmentPage - 1) * this.enrollmentsPerPage + 1;
      const end = Math.min(start + this.enrollmentsPerPage - 1, this.topEnrolledCoursesFromAPI.length);
      return `แสดง ${start}-${end} จากทั้งหมด ${this.topEnrolledCoursesFromAPI.length} รายการ`;
    }
  },

  methods: {
    async getData() {
      try {
        this.loading = true

        const start = new Date(this.startDate);
        const end = new Date(this.endDate);

        const startUTC = new Date(Date.UTC(start.getFullYear(), start.getMonth(), start.getDate()));
        const endUTC = new Date(Date.UTC(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59));

        const { data, status } = await this.$Request.POST(
          'dashboard',
          { 
            startUTC: startUTC.toISOString(), 
            endUTC: endUTC.toISOString(),
            unit: '6425be9928ebd01be519d7bd' // เพิ่ม unit id
          },
          this.configs.key
        );

        if (status === 200 && data.status) {
          // จัดการข้อมูลคอร์ส
          if (Array.isArray(data.data.course)) {
            this.items = data.data.course
            this.calculateStatistics()
            this.calculateTopCourses()
          }

          // จัดการข้อมูลผู้ใช้
          if (Array.isArray(data.data.user)) {
            this.topUsers = data.data.user
          }

          // จัดการข้อมูลคอร์สที่มีการลงทะเบียนสูงสุด
          if (Array.isArray(data.data.topEnrolledCourses)) {
            // เรียงลำดับจากมากไปน้อยตาม enrollCount
            this.topEnrolledCoursesFromAPI = data.data.topEnrolledCourses.sort((a, b) => b.enrollCount - a.enrollCount)
            // Reset pagination เมื่อมีข้อมูลใหม่
            this.currentEnrollmentPage = 1
          }
        }
      } catch (err) {
        console.error('getData error', err)
      } finally {
        this.loading = false
      }
    },

    calculateStatistics() {
      this.totalCourses = this.items.length
      this.totalEnrollments = this.items.reduce((sum, item) => sum + item.enrollCount, 0)
      this.totalCompletions = this.items.reduce((sum, item) => sum + item.completedCount, 0)
      this.averageCompletionRate = (this.totalCompletions / this.totalEnrollments) * 100
    },

    calculateTopCourses() {
      this.topEnrolledCourses = [...this.items]
        .sort((a, b) => b.enrollCount - a.enrollCount)
        .slice(0, 5)

      this.topCompletionRateCourses = [...this.items]
        .filter(item => item.enrollCount > 0)
        .sort((a, b) => (b.completedCount / b.enrollCount) - (a.completedCount / a.enrollCount))
        .slice(0, 5)
    },

    calculateCompletionRate(completed, total) {
      if (!total) return 0
      return ((completed / total) * 100).toFixed(2)
    },

    getCompletionRateColor(completed, total) {
      const rate = (completed / total) * 100
      if (rate >= 80) return 'text-green-600'
      if (rate >= 50) return 'text-yellow-600'
      return 'text-red-600'
    },

    toggleMobileSidebar() {
      this.showMobileSidebar = !this.showMobileSidebar
    },

    selectTabAndCloseMobile(tab) {
      this.activeTab = tab
      this.toggleMobileSidebar()
    },

    exportData() {
      if (this.activeTab === 'courses') {
        this.exportCoursesData();
      } else if (this.activeTab === 'users') {
        this.exportUsersData();
      } else if (this.activeTab === 'enrollments') {
        this.exportEnrollmentsData();
      }
    },

    exportCoursesData() {
      try {
        // สร้าง CSV headers
        const headers = [
          'ลำดับ',
          'ชื่อหลักสูตร',
          'ประเภท',
          'วิทยากร',
          'หมวดหมู่',
          'จำนวนผู้ลงทะเบียน',
          'จำนวนผู้เรียนจบ',
          'อัตราการเรียนจบ (%)'
        ];

        // สร้าง CSV data
        const csvData = this.items.map((item, index) => {
          const completionRate = item.enrollCount > 0 
            ? ((item.completedCount / item.enrollCount) * 100).toFixed(2)
            : '0.00';

          const lecturer = Array.isArray(item.lecturer) 
            ? item.lecturer.map(l => l.name).join(', ') 
            : (item.lecturer || '-');

          const category = Array.isArray(item.category) && item.category.length 
            ? item.category.join(', ') 
            : '-';

          return [
            index + 1,
            `"${item.name}"`,
            `"${item.type || '-'}"`,
            `"${lecturer}"`,
            `"${category}"`,
            item.enrollCount,
            item.completedCount,
            completionRate
          ];
        });

        // รวม headers และ data
        const allData = [headers, ...csvData];

        // สร้าง CSV string
        const csvContent = allData.map(row => row.join(',')).join('\n');

        // เพิ่ม BOM สำหรับ UTF-8
        const BOM = '\uFEFF';
        const csvWithBOM = BOM + csvContent;

        // สร้างไฟล์และดาวน์โหลด
        const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `รายงานหลักสูตร_${this.getCurrentDateString()}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        console.log('ส่งออกข้อมูลหลักสูตรสำเร็จ');
      } catch (error) {
        console.error('เกิดข้อผิดพลาดในการส่งออกข้อมูลหลักสูตร:', error);
      }
    },

    exportUsersData() {
      try {
        // สร้าง CSV headers
        const headers = [
          'ลำดับ',
          'ชื่อ',
          'นามสกุล',
          'อีเมล',
          'เบอร์โทรศัพท์',
          'จำนวนการลงทะเบียน',
          'จำนวนคอร์สที่เรียนจบ',
          'อัตราการเรียนจบ (%)',
          'สถานะตรวจสอบ',
          'วันที่ตรวจสอบ'
        ];

        // สร้าง CSV data
        const csvData = this.topUsers.map((user, index) => {
          const completionRate = user.enrollCount > 0 
            ? ((user.completedCount / user.enrollCount) * 100).toFixed(2)
            : '0.00';

          const checkedStatus = user.checked?.status ? 'ตรวจสอบแล้ว' : 'ยังไม่ตรวจสอบ';
          const checkedDate = user.checked?.status && user.checked?.checkedAt 
            ? this.formatCheckedDate(user.checked.checkedAt)
            : '-';

          return [
            index + 1,
            `"${user.user.firstname || '-'}"`,
            `"${user.user.lastname || '-'}"`,
            `"${user.user.email || '-'}"`,
            `"${user.user.phone || '-'}"`,
            user.enrollCount,
            user.completedCount,
            completionRate,
            `"${checkedStatus}"`,
            `"${checkedDate}"`
          ];
        });

        // รวม headers และ data
        const allData = [headers, ...csvData];

        // สร้าง CSV string
        const csvContent = allData.map(row => row.join(',')).join('\n');

        // เพิ่ม BOM สำหรับ UTF-8
        const BOM = '\uFEFF';
        const csvWithBOM = BOM + csvContent;

        // สร้างไฟล์และดาวน์โหลด
        const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `รายงานผู้ใช้งาน_${this.getCurrentDateString()}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        console.log('ส่งออกข้อมูลผู้ใช้งานสำเร็จ');
      } catch (error) {
        console.error('เกิดข้อผิดพลาดในการส่งออกข้อมูลผู้ใช้งาน:', error);
      }
    },

    exportEnrollmentsData() {
      try {
        // สร้าง CSV headers
        const headers = [
          'อันดับ',
          'ชื่อหลักสูตร',
          'รหัสหลักสูตร',
          'วิทยากร',
          'หมวดหมู่',
          'ประเภท',
          'จำนวนผู้ลงทะเบียน',
          'สัดส่วน (%)',
          'สถานะ'
        ];

        // สร้าง CSV data
        const csvData = this.topEnrolledCoursesFromAPI.map((courseData, index) => {
          const lecturers = Array.isArray(courseData.course.lecturer) 
            ? courseData.course.lecturer.map(l => l.name).join(', ') 
            : (courseData.course.lecturer || '-');

          const categories = Array.isArray(courseData.course.category) && courseData.course.category.length 
            ? courseData.course.category.join(', ') 
            : '-';

          const percentage = this.getEnrollmentPercentage(courseData.enrollCount).toFixed(1);
          const courseType = courseData.course.type === 'e_learning' ? 'E-Learning' : courseData.course.type;
          const status = courseData.course.status ? 'เปิดใช้งาน' : 'ปิดใช้งาน';

          return [
            index + 1,
            `"${courseData.course.name}"`,
            `"${courseData.courseID}"`,
            `"${lecturers}"`,
            `"${categories}"`,
            `"${courseType}"`,
            courseData.enrollCount,
            percentage,
            `"${status}"`
          ];
        });

        // รวม headers และ data
        const allData = [headers, ...csvData];

        // สร้าง CSV string
        const csvContent = allData.map(row => row.join(',')).join('\n');

        // เพิ่ม BOM สำหรับ UTF-8
        const BOM = '\uFEFF';
        const csvWithBOM = BOM + csvContent;

        // สร้างไฟล์และดาวน์โหลด
        const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        const dateRange = `${this.formatDisplayDate(this.startDate)}_${this.formatDisplayDate(this.endDate)}`.replace(/\s+/g, '_');
        link.setAttribute('href', url);
        link.setAttribute('download', `รายงานการลงทะเบียน_${dateRange}_${this.getCurrentDateString()}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        console.log('ส่งออกข้อมูลการลงทะเบียนสำเร็จ');
      } catch (error) {
        console.error('เกิดข้อผิดพลาดในการส่งออกข้อมูลการลงทะเบียน:', error);
      }
    },

    getCurrentDateString() {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      
      return `${year}${month}${day}_${hours}${minutes}`;
    },

    // Pagination methods for courses
    changeCoursePageSize(newSize) {
      this.coursesPerPage = newSize;
      this.currentCoursePage = 1; // Reset to first page
    },

    goToCoursePage(page) {
      if (page >= 1 && page <= this.totalCoursePages) {
        this.currentCoursePage = page;
      }
    },

    previousCoursePage() {
      if (this.currentCoursePage > 1) {
        this.currentCoursePage--;
      }
    },

    nextCoursePage() {
      if (this.currentCoursePage < this.totalCoursePages) {
        this.currentCoursePage++;
      }
    },

    // Pagination methods for users
    changeUserPageSize(newSize) {
      this.usersPerPage = newSize;
      this.currentUserPage = 1; // Reset to first page
    },

    goToUserPage(page) {
      if (page >= 1 && page <= this.totalUserPages) {
        this.currentUserPage = page;
      }
    },

    previousUserPage() {
      if (this.currentUserPage > 1) {
        this.currentUserPage--;
      }
    },

    nextUserPage() {
      if (this.currentUserPage < this.totalUserPages) {
        this.currentUserPage++;
      }
    },

    getVisibleCoursePages() {
      const current = this.currentCoursePage;
      const total = this.totalCoursePages;
      const delta = 2; // จำนวนหน้าที่แสดงข้างหน้าและข้างหลังหน้าปัจจุบัน
      
      let pages = [];
      for (let i = Math.max(1, current - delta); i <= Math.min(total, current + delta); i++) {
        pages.push(i);
      }
      return pages;
    },

    getVisibleUserPages() {
      const current = this.currentUserPage;
      const total = this.totalUserPages;
      const delta = 2; // จำนวนหน้าที่แสดงข้างหน้าและข้างหลังหน้าปัจจุบัน
      
      let pages = [];
      for (let i = Math.max(1, current - delta); i <= Math.min(total, current + delta); i++) {
        pages.push(i);
      }
      return pages;
    },

    // Pagination methods for enrollments
    changeEnrollmentPageSize(newSize) {
      this.enrollmentsPerPage = newSize;
      this.currentEnrollmentPage = 1; // Reset to first page
    },

    goToEnrollmentPage(page) {
      if (page >= 1 && page <= this.totalEnrollmentPages) {
        this.currentEnrollmentPage = page;
      }
    },

    previousEnrollmentPage() {
      if (this.currentEnrollmentPage > 1) {
        this.currentEnrollmentPage--;
      }
    },

    nextEnrollmentPage() {
      if (this.currentEnrollmentPage < this.totalEnrollmentPages) {
        this.currentEnrollmentPage++;
      }
    },

    getVisibleEnrollmentPages() {
      const current = this.currentEnrollmentPage;
      const total = this.totalEnrollmentPages;
      const delta = 2; // จำนวนหน้าที่แสดงข้างหน้าและข้างหลังหน้าปัจจุบัน
      
      let pages = [];
      for (let i = Math.max(1, current - delta); i <= Math.min(total, current + delta); i++) {
        pages.push(i);
      }
      return pages;
    },

    calculateHeaderHeight() {
      // ถ้ามี customHeight หรือ headerHeight ที่กำหนดไว้แล้ว ไม่ต้องคำนวณ
      if (this.customHeight || this.headerHeight) {
        if (this.headerHeight) {
          const height = typeof this.headerHeight === 'number' 
            ? `${this.headerHeight}px` 
            : this.headerHeight;
          document.documentElement.style.setProperty('--header-height', height);
        }
        return;
      }
      
      // ตรวจจับความสูงของ header elements ที่อยู่ด้านบน
      let headerHeight = 0;
      
      // ค้นหา header elements ทั่วไป
      const possibleHeaders = [
        'header',
        '.header',
        '.navbar',
        '.topbar',
        '.breadcrumb',
        '.access-bar',
        '[class*="header"]',
        '[class*="navbar"]',
        '[class*="topbar"]',
        '[role="banner"]'
      ];
      
      possibleHeaders.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          if (this.isElementAbove(element)) {
            headerHeight += element.offsetHeight;
          }
        });
      });
      
      // ถ้าไม่พบ header ให้ใช้ค่าเริ่มต้นตาม headerType
      if (headerHeight === 0) {
        switch (this.headerType) {
          case 'topbar':
            headerHeight = 120;
            break;
          case 'breadcrumb':
            headerHeight = 140;
            break;
          case 'full-admin':
            headerHeight = 160;
            break;
          default:
            headerHeight = window.innerWidth <= 768 ? 56 : 80;
        }
      }
      
      // เพิ่ม padding เล็กน้อยเพื่อความปลอดภัย
      headerHeight += 8;
      
      // ตั้งค่า CSS variable
      document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
      
      // Log สำหรับ debug
      console.log(`Dashboard Component: Calculated header height = ${headerHeight}px`);
    },
    
    isElementAbove(element) {
      // ตรวจสอบว่า element อยู่ด้านบนของคอมโพเนนต์นี้หรือไม่
      const dashboardElement = this.$el;
      if (!dashboardElement) return false;
      
      const elementRect = element.getBoundingClientRect();
      const dashboardRect = dashboardElement.getBoundingClientRect();
      
      return elementRect.bottom <= dashboardRect.top;
    },

    setDateRange(range) {
      const today = new Date();
      let startDate, endDate;

      switch (range) {
        case 'week':
          startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
          endDate = today;
          break;
        case 'month':
          startDate = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
          endDate = today;
          break;
        case 'quarter':
          startDate = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate());
          endDate = today;
          break;
        case 'year':
          startDate = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
          endDate = today;
          break;
        default:
          return;
      }

      this.startDate = startDate.toISOString().substr(0, 10);
      this.endDate = endDate.toISOString().substr(0, 10);
      this.selectedDateRange = range;
      this.getData();
    },

    isDateRangeActive(range) {
      return this.selectedDateRange === range;
    },

    async updateUserCheckedStatus(userId, checked) {
      try {
        // เพิ่ม userId ลงใน array ของผู้ใช้ที่กำลังอัปเดต
        this.checkingUsers.push(userId);

        // ส่งข้อมูลไป API
        const { data, status } = await this.$Request.POST(
          'dashboard-checked',
          { 
            userid: userId, 
            status: checked
          },
          this.configs.key
        );

        if (status === 200 && data.status) {
          // อัปเดต checkbox status ใน local data
          const userIndex = this.topUsers.findIndex(u => u.user._id === userId);
          if (userIndex !== -1) {
            this.topUsers[userIndex].checked = {
              status: checked,
              checkedAt: checked ? new Date().toISOString() : null
            };
          }
          
          // แสดงข้อความสำเร็จ
          console.log(checked ? 'ทำเครื่องหมายตรวจสอบแล้ว' : 'ยกเลิกเครื่องหมายตรวจสอบแล้ว');
        } else {
          throw new Error('Failed to update checked status');
        }
      } catch (error) {
        console.error('Error updating checked status:', error);
        console.error('เกิดข้อผิดพลาดในการอัปเดตสถานะ');
        
        // คืนค่า checkbox กลับเป็นเดิม
        const userIndex = this.topUsers.findIndex(u => u.user._id === userId);
        if (userIndex !== -1) {
          // คืนค่าสถานะเดิม
          if (this.topUsers[userIndex].checked) {
            this.topUsers[userIndex].checked.status = !checked;
          } else {
            this.topUsers[userIndex].checked = { status: !checked, checkedAt: null };
          }
        }
      } finally {
        // ลบ userId ออกจาก array ของผู้ใช้ที่กำลังอัปเดต
        const index = this.checkingUsers.indexOf(userId);
        if (index > -1) {
          this.checkingUsers.splice(index, 1);
        }
      }
    },

    formatCheckedDate(dateStr) {
      const date = new Date(dateStr);
      const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Bangkok'
      };
      return date.toLocaleDateString('th-TH', options);
    },

    getEnrollmentPercentage(enrollCount) {
      if (!this.topEnrolledCoursesFromAPI.length) return 0;
      const maxEnrollments = Math.max(...this.topEnrolledCoursesFromAPI.map(course => course.enrollCount));
      return maxEnrollments > 0 ? (enrollCount / maxEnrollments) * 100 : 0;
    },

    formatDisplayDate(dateStr) {
      const date = new Date(dateStr);
      const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'Asia/Bangkok'
      };
      return date.toLocaleDateString('th-TH', options);
    }
  },

  mounted() {
    this.getData() // เรียกใช้ฟังก์ชันเดียวเพื่อดึงข้อมูลทั้งหมด
    this.calculateHeaderHeight();
    window.addEventListener('resize', this.calculateHeaderHeight);
  },

  beforeUnmount() {
    window.removeEventListener('resize', this.calculateHeaderHeight);
  }
}
</script>

<style scoped>
/* Dashboard container with dynamic height calculation */
.dashboard-container {
  height: calc(100vh - var(--header-height, 64px));
  max-height: calc(100vh - var(--header-height, 64px));
  overflow: hidden;
}

/* ให้ promotions tab สามารถแสดงเนื้อหายาวๆได้ */
.dashboard-promotions-view {
  height: auto !important;
  max-height: none !important;
  min-height: calc(100vh - var(--header-height, 64px));
  overflow: visible !important;
}

/* Responsive header heights */
@media (min-width: 1024px) {
  .dashboard-container {
    height: calc(100vh - var(--header-height, 80px));
    max-height: calc(100vh - var(--header-height, 80px));
  }
}

@media (max-width: 768px) {
  .dashboard-container {
    height: calc(100vh - var(--header-height, 56px));
    max-height: calc(100vh - var(--header-height, 56px));
  }
}

/* Alternative fixed heights for common header sizes */
.dashboard-container.with-topbar {
  height: calc(100vh - 120px); /* Header + Topbar */
  max-height: calc(100vh - 120px);
}

.dashboard-container.with-breadcrumb {
  height: calc(100vh - 140px); /* Header + Breadcrumb */
  max-height: calc(100vh - 140px);
}

.dashboard-container.with-full-admin {
  height: calc(100vh - 160px); /* Full admin layout */
  max-height: calc(100vh - 160px);
}

/* Custom scrollbar */
.overflow-y-auto::-webkit-scrollbar,
.overflow-auto::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.overflow-y-auto::-webkit-scrollbar-track,
.overflow-auto::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb,
.overflow-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
  border: 1px solid #f1f5f9;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover,
.overflow-auto::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.overflow-y-auto::-webkit-scrollbar-corner,
.overflow-auto::-webkit-scrollbar-corner {
  background: #f1f5f9;
}

/* Table scrolling enhancements */
.table-container {
  position: relative;
  max-height: 100%;
  overflow: auto;
}

.table-container table {
  border-collapse: separate;
  border-spacing: 0;
}

.table-container thead th {
  position: sticky;
  top: 0;
  z-index: 10;
  background: #f9fafb;
  border-bottom: 2px solid #e5e7eb;
}

/* Improved table row hover effects for better UX */
.table-container tbody tr:hover {
  background-color: #f8fafc;
  transform: translateX(2px);
  box-shadow: -2px 0 4px rgba(59, 130, 246, 0.1);
  transition: all 0.2s ease;
}

/* Table cell padding adjustments for better readability */
.table-container td {
  border-bottom: 1px solid #f1f5f9;
}

/* Responsive table improvements */
@media (max-width: 768px) {
  .table-container {
    font-size: 0.85rem;
  }
  
  .table-container th,
  .table-container td {
    padding: 0.75rem 1rem;
  }
}

/* Ensure proper flex container heights */
.dashboard-table-section {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0; /* Important for flex children to shrink */
}

.dashboard-table-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0; /* Important for flex children to shrink */
  overflow: hidden;
}

.dashboard-table-wrapper {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.dashboard-table-scroll {
  flex: 1;
  overflow: auto;
  min-height: 200px; /* Minimum height to ensure scrollability */
}

/* Loading and empty state improvements */
.table-loading,
.table-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  height: 100%;
}

/* Pagination sticky footer */
.dashboard-pagination {
  position: sticky;
  bottom: 0;
  background: white;
  border-top: 1px solid #e5e7eb;
  z-index: 5;
}

/* Smooth transitions */
.transition-all {
  transition: all 0.2s ease-in-out;
}

.transition-colors {
  transition: color 0.2s ease-in-out, background-color 0.2s ease-in-out;
}

.transition-transform {
  transition: transform 0.3s ease-in-out;
}

/* Focus states */
.focus\:ring-2:focus {
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
}

/* Hover effects */
.hover\:shadow-md:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

/* Stats cards hover effect */
.stats-card {
  transition: all 0.2s ease-in-out;
}

.stats-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* Mobile sidebar animation */
.mobile-sidebar-enter {
  transform: translateX(-100%);
}

.mobile-sidebar-enter-active {
  transition: transform 0.3s ease-out;
}

.mobile-sidebar-enter-to {
  transform: translateX(0);
}

.mobile-sidebar-leave {
  transform: translateX(0);
}

.mobile-sidebar-leave-active {
  transition: transform 0.3s ease-in;
}

.mobile-sidebar-leave-to {
  transform: translateX(-100%);
}

/* Loading states */
.loading-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Button hover effects */
.btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  transition: all 0.2s ease-in-out;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

/* Mobile responsive adjustments */
@media (max-width: 1024px) {
  .sidebar-desktop {
    display: none;
  }
}

@media (max-width: 768px) {
  .gap-3 {
    gap: 0.5rem;
  }
  
  .p-4 {
    padding: 0.75rem;
  }
  
  .text-sm {
    font-size: 0.8rem;
  }
}

/* Dark mode support (if needed) */
@media (prefers-color-scheme: dark) {
  .dark-mode {
    background-color: #1f2937;
    color: #f9fafb;
  }
  
  .dark-mode .bg-white {
    background-color: #374151;
  }
  
  .dark-mode .border-gray-200 {
    border-color: #4b5563;
  }
  
  .dark-mode .text-gray-900 {
    color: #f9fafb;
  }
  
  .dark-mode .text-gray-700 {
    color: #d1d5db;
  }
  
  .dark-mode .text-gray-600 {
    color: #9ca3af;
  }
}

/* Print styles */
@media print {
  .sidebar,
  .mobile-sidebar,
  button {
    display: none !important;
  }
  
  .main-content {
    width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .border-gray-200 {
    border-color: #000;
  }
  
  .text-gray-600 {
    color: #000;
  }
  
  .bg-gray-50 {
    background-color: #fff;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Focus visible for accessibility */
.focus-visible:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Skip link for accessibility */
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: #3b82f6;
  color: white;
  padding: 8px;
  text-decoration: none;
  border-radius: 4px;
  z-index: 1000;
}

.skip-link:focus {
  top: 6px;
}

/* Pagination styles */
.pagination-button {
  transition: all 0.2s ease-in-out;
}

.pagination-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.pagination-button:active:not(:disabled) {
  transform: translateY(0);
}

.pagination-button.active {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

/* Page size selector */
.page-size-selector {
  transition: all 0.2s ease-in-out;
}

.page-size-selector:focus {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  transform: scale(1.02);
}

/* Table row numbering animation */
.table-row-number {
  transition: all 0.3s ease-in-out;
}

.table-row:hover .table-row-number {
  color: #3b82f6;
  font-weight: 600;
}

/* Animation for page transitions */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.table-row {
  animation: fadeInUp 0.3s ease-out;
}

.table-row:nth-child(even) {
  animation-delay: 0.05s;
}

.table-row:nth-child(odd) {
  animation-delay: 0.1s;
}

/* Date filter button styles */
.date-filter-button {
  position: relative;
  overflow: hidden;
}

.date-filter-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.3s ease;
}

.date-filter-button:hover::before {
  left: 100%;
}

.date-filter-button.active {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.date-filter-button.active:hover {
  background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
}

/* Calendar icon animation */
.date-filter-button i {
  transition: transform 0.2s ease;
}

.date-filter-button:hover i {
  transform: scale(1.1);
}

/* Quick action ripple effect */
@keyframes ripple {
  0% {
    transform: scale(0);
    opacity: 1;
  }
  100% {
    transform: scale(4);
    opacity: 0;
  }
}

.date-filter-button {
  position: relative;
  overflow: hidden;
}

.date-filter-button:active::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 10px;
  height: 10px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  animation: ripple 0.6s linear;
}

/* Responsive date filter */
@media (max-width: 768px) {
  .date-filter-button {
    font-size: 0.7rem;
    padding: 0.5rem 0.75rem;
  }
  
  .date-filter-button i {
    display: none;
  }
}

/* Focus and accessibility improvements */
.date-filter-button:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
}

.date-filter-button:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Loading state for date filter buttons */
.date-filter-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.date-filter-button:disabled:hover {
  transform: none !important;
  box-shadow: none !important;
}
</style>
  