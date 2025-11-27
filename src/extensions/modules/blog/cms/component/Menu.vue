<template>
  <Subhead
    :navigation="[
      {
        name: 'บันทึกข้อมูล',
        function: 'updateData',
        style: 'save',
        class: 'primary-btn',
        visible: true,
        type: 'button',
      },
      {
        name: 'ย้อนกลับ',
        link: '/cms/pages/#menu',
        style: 'chevron-left',
        class: 'default-btn',
        visible: true,
        type: 'button',
      },
    ]"
    @updateData="updateData"
  />

  <!-- FileBrowser Components for SEO Images -->
  <FileBrowser
    class="z-[9999]"
    v-if="FileBrowserOpen"
    :isWindowsOpen="true"
    :callbackFunction="'seo-image'"
    :allowFileType="['jpg', 'gif', 'png', 'jpeg']"
    @file-browser-trigger="changeFileTrigger"
    @file-browser-callback="selectFileTrigger"
  />

  <custom-confirmation
    v-if="showConfirmation"
    :message="confirmationMessage"
    :header="confirmationHeader"
    @confirm="handleConfirmation"
    @cancel="handleConfirmCancel"
  ></custom-confirmation>

  <div class="flex min-h-screen bg-gray-50">
    <!-- Left Sidebar -->
    <div class="w-1/3 min-w-[480px] bg-white shadow-lg border-r border-gray-200 flex flex-col">
      <!-- Sidebar Header -->
      <div class="p-4 border-b border-gray-200">
        <h2 class="text-lg font-semibold text-gray-900 mb-1">เพิ่มรายการเมนู</h2>
        <p class="text-xs text-gray-600">เลือกรายการที่ต้องการเพิ่มเข้าเมนู</p>
      </div>

      <!-- Sidebar Content -->
      <div class="flex-1 overflow-y-auto p-4">
        <!-- Page List Section -->
        <div class="mb-6">
          <div class="flex items-center mb-3">
            <div class="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
            <h3 class="text-base font-medium text-gray-900">รายการหน้า</h3>
          </div>
          
          <div v-if="filteredMenuItems.length === 0" class="py-3 px-3 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <p class="text-center text-gray-500 text-xs">ไม่มีรายการที่สามารถใช้ได้</p>
          </div>
          <div v-else class="grid grid-cols-2 gap-2">
            <div v-for="item in filteredMenuItems" :key="item.id" 
                 class="group bg-white border border-gray-200 rounded-md p-2 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 cursor-pointer">
              <div class="flex flex-col">
                <div class="flex items-center justify-between mb-1">
                  <div class="flex items-center min-w-0 flex-1">
                    <font-awesome-icon :icon="['fas','file']" class="text-gray-400 mr-1 flex-shrink-0 text-xs" />
                    <span class="font-medium text-gray-900 text-xs truncate">{{ item.title }}</span>
                  </div>
                  <button @click="addToEditMenu(item, 'post')"
                          class="ml-1 w-5 h-5 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100 flex-shrink-0">
                    <font-awesome-icon :icon="['fas','plus']" class="w-2 h-2" />
                  </button>
                </div>
                <p class="text-xs text-gray-500 ml-4 truncate">{{ item.target }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Plugin List Section -->
        <div>
          <div class="flex items-center mb-3">
            <div class="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
            <h3 class="text-base font-medium text-gray-900">รายการปลั๊กอิน</h3>
          </div>
          
          <div class="space-y-1">
            <div v-if="filteredPluginItems.length === 0" class="py-3 px-3 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <p class="text-center text-gray-500 text-xs">ไม่มีปลั๊กอินที่สามารถใช้ได้</p>
            </div>
            <div v-else v-for="item in filteredPluginItems" :key="item.id" 
                 class="group bg-white border border-gray-200 rounded-md p-2 hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 cursor-pointer">
              <div class="flex items-center justify-between">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center mb-1">
                    <font-awesome-icon :icon="['fas','puzzle-piece']" class="text-gray-400 mr-1 flex-shrink-0 text-xs" />
                    <span class="font-medium text-gray-900 text-xs truncate">{{ item.title }}</span>
                  </div>
                  <p class="text-xs text-gray-500 ml-4 truncate">{{ item.target }}</p>
                </div>
                <button @click="addToEditMenu(item, 'plugin')"
                        class="ml-2 w-6 h-6 rounded-full bg-purple-500 text-white hover:bg-purple-600 transition-colors duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100 flex-shrink-0">
                  <font-awesome-icon :icon="['fas','plus']" class="w-2 h-2" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col">
      <!-- Header Section -->
      <div class="bg-white border-b border-gray-200 px-6 py-4">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900 mb-1">{{ post.title }}</h1>
            <p class="text-base text-gray-500">{{ post.slug }}</p>
          </div>
          <router-link :to="'/cms/edit/' + post._id" 
                       class="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200">
            <font-awesome-icon :icon="['fas','pencil']" class="w-3 h-3 mr-1"/>
            แก้ไข
          </router-link>
        </div>
      </div>

      <!-- Edit Menu Content -->
      <div class="flex-1 p-6 overflow-y-auto">
        <div class="max-w-4xl">
          <!-- Edit Menu Header -->
          <div class="flex items-center justify-between mb-6">
            <div>
              <h2 class="text-xl font-bold text-gray-900 mb-1">จัดการเมนู</h2>
              <p class="text-sm text-gray-600">จัดเรียงและแก้ไขรายการเมนูของคุณ</p>
            </div>
            <button @click="addEmptyItem('custom')"
                    class="inline-flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200 shadow-sm text-sm">
              <font-awesome-icon :icon="['fas','plus']" class="w-3 h-3 mr-1"/>
              เพิ่มเมนูใหม่
            </button>
          </div>

          <!-- Menu Items List -->
          <div class="space-y-3">
            <div v-if="editMenu.length === 0" class="py-8 text-center">
              <div class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <font-awesome-icon :icon="['fas','list']" class="w-6 h-6 text-gray-400"/>
              </div>
              <h3 class="text-base font-medium text-gray-900 mb-2">ยังไม่มีเมนู</h3>
              <p class="text-sm text-gray-500 mb-4">เริ่มต้นสร้างเมนูโดยการเพิ่มรายการจากด้านซ้าย</p>
              <button @click="addEmptyItem('custom')"
                      class="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 text-sm">
                <font-awesome-icon :icon="['fas','plus']" class="w-3 h-3 mr-1"/>
                เพิ่มเมนูแรก
              </button>
            </div>

            <!-- Main Menu Items -->
            <div v-for="item in editMenu" :key="item.id" class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <!-- Main Menu Item -->
              <div class="p-4 border-b border-gray-100">
                <div class="flex items-center justify-between">
                  <div class="flex-1">
                    <!-- Display Mode -->
                    <div v-if="!item.isEditing" class="flex items-center cursor-pointer" @click="editItem(item)">
                      <div class="flex items-center mr-3">
                        <!-- Type Icon -->
                        <font-awesome-icon 
                          v-if="item.type === 'post'" 
                          :icon="['fas','file']" 
                          class="w-3 h-3 text-blue-500 mr-2"
                        />
                        <font-awesome-icon 
                          v-else-if="item.type === 'plugin'" 
                          :icon="['fas','puzzle-piece']" 
                          class="w-3 h-3 text-purple-500 mr-2"
                        />
                        <font-awesome-icon 
                          v-else-if="item.type === 'custom'" 
                          :icon="['fas','link']" 
                          class="w-3 h-3 text-green-500 mr-2"
                        />
                        <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
                      </div>
                      <div>
                        <div class="flex items-center">
                          <h3 class="text-base font-semibold text-gray-900 hover:text-blue-600 transition-colors">{{ item.title }}</h3>
                          <div class="flex items-center ml-2 space-x-1">
                            <!-- Type Badge -->
                            <span 
                              v-if="item.type" 
                              class="px-2 py-1 text-xs rounded-full"
                              :class="{
                                'bg-blue-100 text-blue-800': item.type === 'post',
                                'bg-purple-100 text-purple-800': item.type === 'plugin',
                                'bg-green-100 text-green-800': item.type === 'custom'
                              }"
                            >
                              {{ item.type }}
                            </span>
                            
                            <!-- Access Badge -->
                            <span 
                              class="px-2 py-1 text-xs rounded-full flex items-center"
                              :class="{
                                'bg-green-100 text-green-800': item.isPublic === true,
                                'bg-orange-100 text-orange-800': item.isPublic === false
                              }"
                            >
                              <font-awesome-icon 
                                :icon="item.isPublic === true ? ['fas','globe'] : ['fas','user-lock']" 
                                class="w-2 h-2 mr-1"
                              />
                              {{ item.isPublic === true ? 'สาธารณะ' : 'สมาชิก' }}
                            </span>
                          </div>
                        </div>
                        <p class="text-xs text-gray-500 mt-1">{{ item.target }}</p>
                      </div>
                    </div>

                    <!-- Edit Mode -->
                    <div v-else class="space-y-3">
                      <div class="grid grid-cols-1 md:grid-cols-5 gap-3">
                        <div>
                          <label class="block text-xs font-medium text-gray-700 mb-1">ชื่อเมนู</label>
                          <input v-model="item.title" 
                                 placeholder="ชื่อเมนู" 
                                 class="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                        <div>
                          <label class="block text-xs font-medium text-gray-700 mb-1">ลิงก์</label>
                          <input v-model="item.target" 
                                 placeholder="ลิงก์หรือ URL" 
                                 class="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                        <div>
                          <label class="block text-xs font-medium text-gray-700 mb-1">ประเภท</label>
                          <select v-model="item.type" 
                                  class="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                            <option value="post">Post</option>
                            <option value="plugin">Plugin</option>
                            <option value="custom">Custom</option>
                          </select>
                        </div>
                        <div>
                          <label class="block text-xs font-medium text-gray-700 mb-1">สิทธิ์เข้าถึง</label>
                          <select v-model="item.isPublic" 
                                  class="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                            <option :value="true">สาธารณะ</option>
                            <option :value="false">สมาชิกเท่านั้น</option>
                          </select>
                        </div>
                        <div>
                          <label class="block text-xs font-medium text-gray-700 mb-1">ย้ายไปใต้เมนู</label>
                          <select v-model="item.mainMenu" 
                                  @change="moveToSubMenu(item)" 
                                  class="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                            <option value="">เลือกเมนูหลัก</option>
                            <option v-for="menuItem in filteredEditMenu(item.id)" :key="menuItem.id" :value="menuItem.id">
                              {{ menuItem.title }}
                            </option>
                          </select>
                        </div>
                      </div>

                      <!-- SEO Settings Section -->
                      <div class="bg-blue-50 p-4 rounded-md border border-blue-200">
                        <h4 class="text-sm font-medium text-blue-900 mb-4 flex items-center">
                          <font-awesome-icon :icon="['fas','search']" class="w-3 h-3 mr-1"/>
                          การตั้งค่า SEO
                        </h4>
                        
                        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
                          <!-- SEO Image - Left Side -->
                          <div class="lg:col-span-1 flex flex-col">
                            <label class="block text-xs font-medium text-gray-700 mb-2">
                              SEO Image
                            </label>
                            <div class="relative w-full flex-1">
                              <div class="h-full">
                                <div
                                  class="w-full h-full min-h-[200px] lg:min-h-[240px] bg-gray-200 flex items-center justify-center rounded cursor-pointer hover:bg-gray-300 transition-colors border-2 border-dashed border-gray-300"
                                  @click="openSEOImageBrowser(item)"
                                >
                                  <!-- No Image State -->
                                  <div v-if="!item.seo.image" class="text-center p-4">
                                    <font-awesome-icon :icon="['fas','image']" class="text-gray-400 text-3xl mb-3"/>
                                    <p class="text-sm text-gray-500 mb-1">คลิกเพื่อเลือกรูปภาพ</p>
                                    <p class="text-xs text-gray-400">แนะนำ: 1200x630px</p>
                                    <p class="text-xs text-gray-400">สำหรับการแชร์โซเชียล</p>
                                  </div>
                                  
                                  <!-- Image Display State -->
                                  <div v-else-if="item.seo.image && !item.seo.imageError" class="relative w-full h-full">
                                    <img
                                      :src="item.seo.image"
                                      alt="SEO Image Preview"
                                      class="w-full h-full object-cover rounded"
                                      @error="handleImageError($event, item)"
                                      @load="handleImageLoad($event, item)"
                                    />
                                    <!-- Success indicator -->
                                    <div class="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded z-10">
                                      มีรูป
                                    </div>
                                    <!-- Filename display -->
                                    <div class="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded z-10 max-w-[calc(100%-1rem)] truncate">
                                      {{ item.seo.image.split('/').pop() }}
                                    </div>
                                  </div>
                                  
                                  <!-- Error State -->
                                  <div v-else-if="item.seo.imageError" class="bg-red-50 flex items-center justify-center p-4 h-full">
                                    <div class="text-center">
                                      <font-awesome-icon :icon="['fas','exclamation-triangle']" class="text-red-500 text-2xl mb-2"/>
                                      <p class="text-xs text-red-600">ไม่สามารถโหลดรูปภาพได้</p>
                                      <p class="text-xs text-gray-500 mt-1 break-all">{{ item.seo.image }}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <!-- SEO Fields - Right Side -->
                          <div class="lg:col-span-2 space-y-4">
                            <!-- SEO Title -->
                            <div>
                              <label class="block text-xs font-medium text-gray-700 mb-1">
                                SEO Title
                              </label>
                              <input
                                v-model="item.seo.title"
                                type="text"
                                placeholder="หัวข้อสำหรับ SEO"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                maxlength="60"
                              />
                              <div class="flex justify-between items-center mt-1">
                                <span class="text-xs text-gray-500">แนะนำ: 30-60 ตัวอักษร</span>
                                <span class="text-xs" :class="item.seo.title && item.seo.title.length > 60 ? 'text-red-500' : 'text-gray-500'">
                                  {{ item.seo.title ? item.seo.title.length : 0 }}/60
                                </span>
                              </div>
                            </div>

                            <!-- Meta Description -->
                            <div>
                              <label class="block text-xs font-medium text-gray-700 mb-1">
                                Meta Description
                              </label>
                              <textarea
                                v-model="item.seo.description"
                                placeholder="คำอธิบายสำหรับ SEO"
                                rows="3"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none"
                                maxlength="160"
                              ></textarea>
                              <div class="flex justify-between items-center mt-1">
                                <span class="text-xs text-gray-500">แนะนำ: 120-160 ตัวอักษร</span>
                                <span class="text-xs" :class="item.seo.description && item.seo.description.length > 160 ? 'text-red-500' : 'text-gray-500'">
                                  {{ item.seo.description ? item.seo.description.length : 0 }}/160
                                </span>
                              </div>
                            </div>

                            <!-- Keywords -->
                            <div>
                              <label class="block text-xs font-medium text-gray-700 mb-1">
                                Keywords
                              </label>
                              <div class="space-y-2">
                                <!-- Keywords Tags Display -->
                                <div v-if="item.seo.keywordsList && item.seo.keywordsList.length > 0" class="flex flex-wrap gap-1">
                                  <span 
                                    v-for="(keyword, index) in item.seo.keywordsList" 
                                    :key="index"
                                    class="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                                  >
                                    {{ keyword }}
                                    <button 
                                      @click="removeKeyword(item, index)"
                                      type="button"
                                      class="ml-1 text-blue-600 hover:text-blue-800"
                                    >
                                      <font-awesome-icon :icon="['fas','times']" class="w-2 h-2"/>
                                    </button>
                                  </span>
                                </div>
                                
                                <!-- Add Keyword Input -->
                                <div class="flex space-x-2">
                                  <input
                                    v-model="item.newKeyword"
                                    @keyup.enter="addKeyword(item)"
                                    type="text"
                                    placeholder="พิมพ์ keyword..."
                                    class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                  />
                                  <button
                                    @click="addKeyword(item)"
                                    type="button"
                                    class="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                                  >
                                    เพิ่ม
                                  </button>
                                </div>
                                <div class="flex items-center text-xs text-gray-500">
                                  <font-awesome-icon :icon="['fas','info-circle']" class="w-3 h-3 mr-1"/>
                                  <span>กด Enter เพิ่ม keyword • แนะนำ: 3-5 keywords</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <!-- Browser Preview -->
                        <div class="mt-6 pt-4 border-t border-blue-200">
                          <div class="flex items-center mb-3">
                            <font-awesome-icon :icon="['fas','globe']" class="w-3 h-3 mr-1 text-gray-600"/>
                            <span class="text-xs font-medium text-gray-700">ตัวอย่างหน้าเว็บ</span>
                          </div>
                          
                          <!-- Browser Frame -->
                          <div class="bg-white rounded-lg border border-gray-300 shadow-sm overflow-hidden">
                            <!-- Browser Header -->
                            <div class="bg-gray-100 px-4 py-2 border-b border-gray-200">
                              <div class="flex items-center justify-between">
                                <!-- Browser Controls -->
                                <div class="flex items-center space-x-2">
                                  <div class="flex space-x-1">
                                    <div class="w-3 h-3 bg-red-400 rounded-full"></div>
                                    <div class="w-3 h-3 bg-yellow-400 rounded-full"></div>
                                    <div class="w-3 h-3 bg-green-400 rounded-full"></div>
                                  </div>
                                </div>
                                
                                <!-- Address Bar -->
                                <div class="flex-1 mx-4">
                                  <div class="bg-white border border-gray-300 rounded-md px-3 py-1 flex items-center">
                                    <div class="flex items-center mr-2">
                                      <img 
                                        v-if="session.current && session.current.siteFavicon" 
                                        :src="session.current.siteFavicon" 
                                        alt="Favicon" 
                                        class="w-4 h-4 mr-2"
                                        @error="$event.target.style.display='none'"
                                      />
                                      <font-awesome-icon v-else :icon="['fas','globe']" class="w-3 h-3 mr-2 text-gray-400"/>
                                      <font-awesome-icon :icon="['fas','lock']" class="w-3 h-3 text-green-500"/>
                                    </div>
                                    <span class="text-xs text-gray-700 truncate">{{ getPreviewUrl(item) }}</span>
                                  </div>
                                </div>
                                
                                <!-- Browser Menu -->
                                <div class="flex items-center space-x-1">
                                  <font-awesome-icon :icon="['fas','ellipsis-vertical']" class="w-3 h-3 text-gray-400"/>
                                </div>
                              </div>
                            </div>
                            
                            <!-- Page Content -->
                            <div class="p-6 bg-white">
                              <!-- Page Header -->
                              <div class="border-b border-gray-200 pb-4 mb-4">
                                <div class="flex items-center mb-2">
                                  <img 
                                    v-if="session.current && session.current.siteFavicon" 
                                    :src="session.current.siteFavicon" 
                                    alt="Site Favicon" 
                                    class="w-6 h-6 mr-3"
                                    @error="$event.target.style.display='none'"
                                  />
                                  <font-awesome-icon v-else :icon="['fas','globe']" class="w-5 h-5 mr-3 text-gray-400"/>
                                  <div>
                                    <h1 class="text-xl font-bold text-gray-900">
                                      {{ item.seo.title || item.title || 'ชื่อหน้า' }}
                                    </h1>
                                    <p class="text-sm text-gray-500">{{ session.current ? session.current.siteName || 'เว็บไซต์' : 'เว็บไซต์' }}</p>
                                  </div>
                                </div>
                              </div>
                              
                              <!-- Page Description -->
                              <div class="prose prose-sm max-w-none">
                                <p class="text-gray-700 leading-relaxed">
                                  {{ item.seo.description || 'คำอธิบายสำหรับหน้าเว็บจะแสดงที่นี่...' }}
                                </p>
                                
                                <!-- SEO Keywords Display -->
                                <div v-if="item.seo.keywordsList && item.seo.keywordsList.length > 0" class="mt-4">
                                  <div class="flex flex-wrap gap-1">
                                    <span 
                                      v-for="keyword in item.seo.keywordsList.slice(0, 5)" 
                                      :key="keyword"
                                      class="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                                    >
                                      #{{ keyword }}
                                    </span>
                                  </div>
                                </div>
                                
                                <!-- SEO Image Preview -->
                                <div v-if="item.seo.image" class="mt-4">
                                  <img 
                                    :src="item.seo.image" 
                                    alt="Content Image" 
                                    class="w-full max-w-md h-32 object-cover rounded-lg border border-gray-200"
                                    @error="$event.target.style.display='none'"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="flex space-x-2">
                        <button @click="updateItem(item)" 
                                class="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 text-sm">
                          บันทึก
                        </button>
                        <button @click="cancelEdit(item)" 
                                class="px-3 py-1 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors duration-200 text-sm">
                          ยกเลิก
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Action Buttons -->
                  <div v-if="!item.isEditing" class="flex items-center space-x-1 ml-4">
                    <button @click="addSubmenuItem(item)"
                            class="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors duration-200">
                      <font-awesome-icon :icon="['fas','plus']" class="w-3 h-3"/>
                    </button>
                    <button @click="editItem(item)"
                            class="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-200">
                      <font-awesome-icon :icon="['fas','pencil']" class="w-3 h-3"/>
                    </button>
                    <button @click="moveUpItem(item)" :disabled="isFirstItem(item)"
                            class="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-md transition-colors duration-200 disabled:opacity-30 disabled:cursor-not-allowed">
                      <font-awesome-icon :icon="['fas','chevron-up']" class="w-3 h-3"/>
                    </button>
                    <button @click="moveDownItem(item)" :disabled="isLastItem(item)"
                            class="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-md transition-colors duration-200 disabled:opacity-30 disabled:cursor-not-allowed">
                      <font-awesome-icon :icon="['fas','chevron-down']" class="w-3 h-3"/>
                    </button>
                    <button @click="deleteItem(item)"
                            class="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200">
                      <font-awesome-icon :icon="['fas','trash']" class="w-3 h-3"/>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Submenu Items -->
              <div v-if="item.subMenu && item.subMenu.length > 0" class="bg-gray-50 p-4">
                <div class="space-y-2">
                  <div v-for="subitem in item.subMenu" :key="subitem.id" 
                       class="bg-white rounded-md border border-gray-200 p-3">
                    <div class="flex items-center justify-between">
                      <div class="flex-1">
                        <!-- Display Mode -->
                        <div v-if="!subitem.isEditing" class="flex items-center cursor-pointer" @click="editSubItem(item, subitem)">
                          <div class="flex items-center mr-2">
                            <!-- Type Icon for Submenu -->
                            <font-awesome-icon 
                              v-if="subitem.type === 'post'" 
                              :icon="['fas','file']" 
                              class="w-2 h-2 text-blue-500 mr-1"
                            />
                            <font-awesome-icon 
                              v-else-if="subitem.type === 'plugin'" 
                              :icon="['fas','puzzle-piece']" 
                              class="w-2 h-2 text-purple-500 mr-1"
                            />
                            <font-awesome-icon 
                              v-else-if="subitem.type === 'custom'" 
                              :icon="['fas','link']" 
                              class="w-2 h-2 text-green-500 mr-1"
                            />
                            <div class="w-1 h-1 bg-gray-400 rounded-full"></div>
                          </div>
                          <div>
                            <div class="flex items-center">
                              <h4 class="font-medium text-gray-900 text-sm hover:text-blue-600 transition-colors">{{ subitem.title }}</h4>
                              <div class="flex items-center ml-2 space-x-1">
                                <!-- Type Badge -->
                                <span 
                                  v-if="subitem.type" 
                                  class="px-1 py-0.5 text-xs rounded-full"
                                  :class="{
                                    'bg-blue-100 text-blue-800': subitem.type === 'post',
                                    'bg-purple-100 text-purple-800': subitem.type === 'plugin',
                                    'bg-green-100 text-green-800': subitem.type === 'custom'
                                  }"
                                >
                                  {{ subitem.type }}
                                </span>
                                
                                <!-- Access Badge -->
                                <span 
                                  class="px-1 py-0.5 text-xs rounded-full flex items-center"
                                  :class="{
                                    'bg-green-100 text-green-800': subitem.isPublic === true,
                                    'bg-orange-100 text-orange-800': subitem.isPublic === false
                                  }"
                                >
                                  <font-awesome-icon 
                                    :icon="subitem.isPublic === true ? ['fas','globe'] : ['fas','user-lock']" 
                                    class="w-2 h-2 mr-1"
                                  />
                                  {{ subitem.isPublic === true ? 'สาธารณะ' : 'สมาชิก' }}
                                </span>
                              </div>
                            </div>
                            <p class="text-xs text-gray-500 mt-1">{{ subitem.target }}</p>
                          </div>
                        </div>

                        <!-- Edit Mode -->
                        <div v-else class="space-y-3">
                          <div class="grid grid-cols-1 md:grid-cols-5 gap-3">
                            <div>
                              <label class="block text-xs font-medium text-gray-700 mb-1">ชื่อเมนูย่อย</label>
                              <input v-model="subitem.title" 
                                     placeholder="ชื่อเมนูย่อย" 
                                     class="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                            <div>
                              <label class="block text-xs font-medium text-gray-700 mb-1">ลิงก์</label>
                              <input v-model="subitem.target" 
                                     placeholder="ลิงก์หรือ URL" 
                                     class="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                            <div>
                              <label class="block text-xs font-medium text-gray-700 mb-1">ประเภท</label>
                              <select v-model="subitem.type" 
                                      class="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                <option value="post">Post</option>
                                <option value="plugin">Plugin</option>
                                <option value="custom">Custom</option>
                              </select>
                            </div>
                            <div>
                              <label class="block text-xs font-medium text-gray-700 mb-1">สิทธิ์เข้าถึง</label>
                              <select v-model="subitem.isPublic" 
                                      class="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                <option :value="true">สาธารณะ</option>
                                <option :value="false">สมาชิกเท่านั้น</option>
                              </select>
                            </div>
                            <div>
                              <label class="block text-xs font-medium text-gray-700 mb-1">ย้ายไป</label>
                              <select v-model="subitem.newParentId" 
                                      @change="moveSubItemToNewParent(item, subitem)" 
                                      class="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                <option value="">ย้ายไปเมนูหลัก</option>
                                <option v-for="menuItem in filteredEditMenu(item.id)" :key="menuItem.id" :value="menuItem.id">
                                  ย้ายไป {{ menuItem.title }}
                                </option>
                              </select>
                            </div>
                          </div>

                          <!-- SEO Settings Section for Submenu -->
                          <div class="bg-green-50 p-4 rounded-md border border-green-200">
                            <h4 class="text-sm font-medium text-green-900 mb-4 flex items-center">
                              <font-awesome-icon :icon="['fas','search']" class="w-3 h-3 mr-1"/>
                              การตั้งค่า SEO
                            </h4>
                            
                            <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
                              <!-- SEO Image - Left Side -->
                              <div class="lg:col-span-1 flex flex-col">
                                <label class="block text-xs font-medium text-gray-700 mb-2">
                                  SEO Image
                                </label>
                                <div class="relative w-full flex-1">
                                  <div class="h-full">
                                    <div
                                      class="w-full h-full min-h-[200px] lg:min-h-[240px] bg-gray-200 flex items-center justify-center rounded cursor-pointer hover:bg-gray-300 transition-colors border-2 border-dashed border-gray-300"
                                      @click="openSEOImageBrowser(subitem)"
                                    >
                                      <div v-if="!subitem.seo.image" class="text-center p-4">
                                        <font-awesome-icon :icon="['fas','image']" class="text-gray-400 text-3xl mb-3"/>
                                        <p class="text-sm text-gray-500 mb-1">คลิกเพื่อเลือกรูปภาพ</p>
                                        <p class="text-xs text-gray-400">แนะนำ: 1200x630px</p>
                                        <p class="text-xs text-gray-400">สำหรับการแชร์โซเชียล</p>
                                      </div>
                                      <img
                                        v-else
                                        :src="subitem.seo.image"
                                        alt="SEO Image Preview"
                                        class="w-full h-full object-cover rounded"
                                      />
                                      <div
                                        v-if="subitem.seo.image"
                                        class="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded"
                                      >
                                        <font-awesome-icon :icon="['fas','edit']" class="text-white text-lg"/>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <!-- SEO Fields - Right Side -->
                              <div class="lg:col-span-2 space-y-4">
                                <!-- SEO Title -->
                                <div>
                                  <label class="block text-xs font-medium text-gray-700 mb-1">
                                    SEO Title
                                  </label>
                                  <input
                                    v-model="subitem.seo.title"
                                    type="text"
                                    placeholder="หัวข้อสำหรับ SEO"
                                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                    maxlength="60"
                                  />
                                  <div class="flex justify-between items-center mt-1">
                                    <span class="text-xs text-gray-500">แนะนำ: 30-60 ตัวอักษร</span>
                                    <span class="text-xs" :class="subitem.seo.title && subitem.seo.title.length > 60 ? 'text-red-500' : 'text-gray-500'">
                                      {{ subitem.seo.title ? subitem.seo.title.length : 0 }}/60
                                    </span>
                                  </div>
                                </div>

                                <!-- Meta Description -->
                                <div>
                                  <label class="block text-xs font-medium text-gray-700 mb-1">
                                    Meta Description
                                  </label>
                                  <textarea
                                    v-model="subitem.seo.description"
                                    placeholder="คำอธิบายสำหรับ SEO"
                                    rows="3"
                                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none"
                                    maxlength="160"
                                  ></textarea>
                                  <div class="flex justify-between items-center mt-1">
                                    <span class="text-xs text-gray-500">แนะนำ: 120-160 ตัวอักษร</span>
                                    <span class="text-xs" :class="subitem.seo.description && subitem.seo.description.length > 160 ? 'text-red-500' : 'text-gray-500'">
                                      {{ subitem.seo.description ? subitem.seo.description.length : 0 }}/160
                                    </span>
                                  </div>
                                </div>

                                <!-- Keywords -->
                                <div>
                                  <label class="block text-xs font-medium text-gray-700 mb-1">
                                    Keywords
                                  </label>
                                  <div class="space-y-2">
                                    <!-- Keywords Tags Display -->
                                    <div v-if="subitem.seo.keywordsList && subitem.seo.keywordsList.length > 0" class="flex flex-wrap gap-1">
                                      <span 
                                        v-for="(keyword, index) in subitem.seo.keywordsList" 
                                        :key="index"
                                        class="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                                      >
                                        {{ keyword }}
                                        <button 
                                          @click="removeKeyword(subitem, index)"
                                          type="button"
                                          class="ml-1 text-green-600 hover:text-green-800"
                                        >
                                          <font-awesome-icon :icon="['fas','times']" class="w-2 h-2"/>
                                        </button>
                                      </span>
                                    </div>
                                    
                                    <!-- Add Keyword Input -->
                                    <div class="flex space-x-2">
                                      <input
                                        v-model="subitem.newKeyword"
                                        @keyup.enter="addKeyword(subitem)"
                                        type="text"
                                        placeholder="พิมพ์ keyword..."
                                        class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                      />
                                      <button
                                        @click="addKeyword(subitem)"
                                        type="button"
                                        class="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                                      >
                                        เพิ่ม
                                      </button>
                                    </div>
                                    <div class="flex items-center text-xs text-gray-500">
                                      <font-awesome-icon :icon="['fas','info-circle']" class="w-3 h-3 mr-1"/>
                                      <span>กด Enter เพิ่ม keyword • แนะนำ: 3-5 keywords</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <!-- Browser Preview -->
                            <div class="mt-6 pt-4 border-t border-green-200">
                              <div class="flex items-center mb-3">
                                <font-awesome-icon :icon="['fas','globe']" class="w-3 h-3 mr-1 text-gray-600"/>
                                <span class="text-xs font-medium text-gray-700">ตัวอย่างหน้าเว็บ</span>
                              </div>
                              
                              <!-- Browser Frame -->
                              <div class="bg-white rounded-lg border border-gray-300 shadow-sm overflow-hidden">
                                <!-- Browser Header -->
                                <div class="bg-gray-100 px-4 py-2 border-b border-gray-200">
                                  <div class="flex items-center justify-between">
                                    <!-- Browser Controls -->
                                    <div class="flex items-center space-x-2">
                                      <div class="flex space-x-1">
                                        <div class="w-3 h-3 bg-red-400 rounded-full"></div>
                                        <div class="w-3 h-3 bg-yellow-400 rounded-full"></div>
                                        <div class="w-3 h-3 bg-green-400 rounded-full"></div>
                                      </div>
                                    </div>
                                    
                                    <!-- Address Bar -->
                                    <div class="flex-1 mx-4">
                                      <div class="bg-white border border-gray-300 rounded-md px-3 py-1 flex items-center">
                                        <div class="flex items-center mr-2">
                                          <img 
                                            v-if="session.current && session.current.siteFavicon" 
                                            :src="session.current.siteFavicon" 
                                            alt="Favicon" 
                                            class="w-4 h-4 mr-2"
                                            @error="$event.target.style.display='none'"
                                          />
                                          <font-awesome-icon v-else :icon="['fas','globe']" class="w-3 h-3 mr-2 text-gray-400"/>
                                          <font-awesome-icon :icon="['fas','lock']" class="w-3 h-3 text-green-500"/>
                                        </div>
                                        <span class="text-xs text-gray-700 truncate">{{ getPreviewUrl(subitem) }}</span>
                                      </div>
                                    </div>
                                    
                                    <!-- Browser Menu -->
                                    <div class="flex items-center space-x-1">
                                      <font-awesome-icon :icon="['fas','ellipsis-vertical']" class="w-3 h-3 text-gray-400"/>
                                    </div>
                                  </div>
                                </div>
                                
                                <!-- Page Content -->
                                <div class="p-6 bg-white">
                                  <!-- Page Header -->
                                  <div class="border-b border-gray-200 pb-4 mb-4">
                                    <div class="flex items-center mb-2">
                                      <img 
                                        v-if="session.current && session.current.siteFavicon" 
                                        :src="session.current.siteFavicon" 
                                        alt="Site Favicon" 
                                        class="w-6 h-6 mr-3"
                                        @error="$event.target.style.display='none'"
                                      />
                                      <font-awesome-icon v-else :icon="['fas','globe']" class="w-5 h-5 mr-3 text-gray-400"/>
                                      <div>
                                        <h1 class="text-xl font-bold text-gray-900">
                                          {{ subitem.seo.title || subitem.title || 'ชื่อหน้า' }}
                                        </h1>
                                        <p class="text-sm text-gray-500">{{ session.current ? session.current.siteName || 'เว็บไซต์' : 'เว็บไซต์' }}</p>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <!-- Page Description -->
                                  <div class="prose prose-sm max-w-none">
                                    <p class="text-gray-700 leading-relaxed">
                                      {{ subitem.seo.description || 'คำอธิบายสำหรับหน้าเว็บจะแสดงที่นี่...' }}
                                    </p>
                                    
                                    <!-- SEO Keywords Display -->
                                    <div v-if="subitem.seo.keywordsList && subitem.seo.keywordsList.length > 0" class="mt-4">
                                      <div class="flex flex-wrap gap-1">
                                        <span 
                                          v-for="keyword in subitem.seo.keywordsList.slice(0, 5)" 
                                          :key="keyword"
                                          class="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                                        >
                                          #{{ keyword }}
                                        </span>
                                      </div>
                                    </div>
                                    
                                    <!-- SEO Image Preview -->
                                    <div v-if="subitem.seo.image" class="mt-4">
                                      <img 
                                        :src="subitem.seo.image" 
                                        alt="Content Image" 
                                        class="w-full max-w-md h-32 object-cover rounded-lg border border-gray-200"
                                        @error="$event.target.style.display='none'"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div class="flex space-x-2">
                            <button @click="updateSubItem(item, subitem)" 
                                    class="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 text-sm">
                              บันทึก
                            </button>
                            <button @click="cancelEditSubItem(subitem)" 
                                    class="px-3 py-1 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors duration-200 text-sm">
                              ยกเลิก
                            </button>
                          </div>
                        </div>
                      </div>

                      <!-- Submenu Action Buttons -->
                      <div v-if="!subitem.isEditing" class="flex items-center space-x-1 ml-3">
                        <button @click="editSubItem(item, subitem)"
                                class="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-200">
                          <font-awesome-icon :icon="['fas','pencil']" class="w-2 h-2"/>
                        </button>
                        <button @click="moveUpSubItem(item, subitem)" :disabled="isFirstSubItem(item, subitem)"
                                class="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-md transition-colors duration-200 disabled:opacity-30 disabled:cursor-not-allowed">
                          <font-awesome-icon :icon="['fas','chevron-up']" class="w-2 h-2"/>
                        </button>
                        <button @click="moveDownSubItem(item, subitem)" :disabled="isLastSubItem(item, subitem)"
                                class="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-md transition-colors duration-200 disabled:opacity-30 disabled:cursor-not-allowed">
                          <font-awesome-icon :icon="['fas','chevron-down']" class="w-2 h-2"/>
                        </button>
                        <button @click="deleteSubItem(item, subitem)"
                                class="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200">
                          <font-awesome-icon :icon="['fas','trash']" class="w-2 h-2"/>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Subhead from '@/interface/template/outline/Subhead.vue';
import storageManager from '@/plugins/storage';
import CustomConfirmation   from '@/utils/Confirmation.vue';
import FileBrowser from '@/interface/modal/FileBrowser.vue';

export default {
  data() {
    return {
      dataItem: this.$route.params.id,
      post: [],
      menuItems: [],
      editMenu: [],
      session: storageManager.get('session'),
      navigation: storageManager.get('navigation'),
      configs: storageManager.get('configs'),
      confirmationMessage: '',
      confirmationHeader: '',
      showConfirmation: false,
      deletionData: null,
      
      // File Browser State
      FileBrowserOpen: false,
      currentEditingItem: null, // เก็บ reference ของ item ที่กำลังเลือกรูป
    };
  },
  async mounted() {
    try {
      await this.getData();
    } catch (error) {
      console.log(error);
    }
  },
  components: {
    Subhead,CustomConfirmation,FileBrowser
  },
  computed: {
    filteredMenuItems() {
      const allEditMenuItems = [...this.editMenu, ...this.getAllSubMenuItems(this.editMenu)];
      return this.menuItems.filter(item => {
        return !allEditMenuItems.some(editItem => editItem.id === item.id);
      });
    },
    filteredEditMenu() {
      return (itemId) => {
        return this.editMenu.filter(menuItem => menuItem.id !== itemId);
      };
    },
    filteredPluginItems() {
      const editMenuIds = this.editMenu.map(editItem => editItem.id);

      return this.navigation
        .filter(item => item.submenu && item.submenu.some(subitem => subitem.front === true))
        .map(item => ({
          id: item.slug,
          title: item.name,
          target: item.href,
          auth: true,
        }))
        .filter(item => !editMenuIds.includes(item.id));
    },
  },
  methods: {
    /**
     * Move a submenu item to the root or to another main menu item.
     * @param {Object} parentItem - The current parent main menu item.
     * @param {Object} subitem - The submenu item to be moved.
     */
     moveSubItemToNewParent(parentItem, subitem) {
      const newParentId = subitem.newParentId;
      if (!newParentId) {
        // Move to Root
        this.editMenu.push(subitem);
      } else {
        // Move to another main menu item
        const newParentItem = this.editMenu.find(item => item.id === newParentId);
        if (newParentItem) {
          newParentItem.subMenu = newParentItem.subMenu || [];
          newParentItem.subMenu.push(subitem);
        }
      }
      // Remove from the old parent submenu list
      const index = parentItem.subMenu.indexOf(subitem);
      if (index > -1) {
        parentItem.subMenu.splice(index, 1);
      }
      // Reset the dropdown value
      subitem.newParentId = '';
    },
    addSubmenuItem(parentItem) {
      const newSubItem = {
        id: this.generateUniqueId(),
        title: 'New Submenu',
        target: '#',
        type: 'custom', // Default type for submenu
        isPublic: true, // Default to public
        isEditing: true, // Start in edit mode
        seo: {
          title: '',
          description: '',
          keywords: '',
          keywordsList: [],
          image: '',
          imageError: false
        },
        newKeyword: ''
      };
      parentItem.subMenu = parentItem.subMenu || [];
      parentItem.subMenu.push(newSubItem);
    },
    getAllSubMenuItems(items) {
      let subMenuItems = [];
      items.forEach(item => {
        if (item.subMenu && item.subMenu.length > 0) {
          subMenuItems.push(...item.subMenu);
          subMenuItems.push(...this.getAllSubMenuItems(item.subMenu));
        }
      });
      return subMenuItems;
    },
    showSubMenu(item) {
      item.showSubMenu = true;
    },
    closeSubMenu(item) {
      item.showSubMenu = false;
    },
    moveToSubMenu(item) {
      const mainMenuId = item.mainMenu;
      if (mainMenuId) {
        const mainMenu = this.editMenu.find(menuItem => menuItem.id === mainMenuId);
        if (mainMenu) {
          mainMenu.subMenu = mainMenu.subMenu || [];
          mainMenu.subMenu.push(item);
          this.editMenu = this.editMenu.filter(menuItem => menuItem !== item);
          item.showSubMenu = false;
          item.mainMenu = '';
        }
      }
    },
    async getData() {
      if (storageManager.get('session', 'login')) {
        try {
          const resAPI = await fetch(
            "https://gateway.cloudrestfulapi.com/api/post/query",
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json','client-token-key':this.configs.key },
              body: JSON.stringify({
                method: 'find',
                args: [
                  {
                    $and: [
                      { owner: this.session.current._id },
                      { type: { $in: ['page', 'form'] } },
                    ],
                  },
                ],
                paging: { page: this.currentPage, limit: this.limitItem },
              }),
            }
          );

          const response = await resAPI.json();
          if(resAPI.status===200)
          {
            await this.getPostData()
            
            this.menuItems = response.data.map((item) => ({
              id: item._id,
              title: item.title,
              target: `/${item.slug}`,
              auth: true,
            }));
          }
          
        } catch (error) {
          console.log(error);
        }
      }
    },
    async getPostData() {
			try {
				const resAPI = await fetch(`https://gateway.cloudrestfulapi.com/api/post/${this.dataItem}`, {
					method: 'GET',
					headers: {'Content-Type': 'application/json','client-token-key':this.configs.key},
				});
	
				const RestReturn = await resAPI.json();
				const savedLayout = RestReturn;
		
				this.$setPageTitle(RestReturn.title);
				if (savedLayout) {
          this.post       = savedLayout
					this.editMenu  = savedLayout.builder;
				}
			} catch (error) {
			console.log(error);
			}
		},
    async updateData() {
			try {
			console.log("=== Updating Data ===");
			console.log("editMenu before update:", JSON.stringify(this.editMenu, null, 2));
			
			const response = await fetch('https://gateway.cloudrestfulapi.com/api/post/' + this.dataItem, {
				method: 'PUT',
				headers: {
				'Content-Type': 'application/json','client-token-key':this.configs.key
				},
				body: JSON.stringify({
				data: {
					builder: this.editMenu,
				},
				options: {}
				})
			});
			const data = await response.json();
			console.log("Response data:", data);

			if(response.status===200) {
				this.$swal({
				toast: true,
				position: 'bottom-end',
				showConfirmButton: false,
				timer: 3000,
				icon: 'success',
				title: 'บันทึกข้อมูลหน้าเว็บ',
				text: 'บันทึกข้อมูลสำหรับหน้าเว็บนี้ สำเร็จแล้ว',
				});
			} else {
				console.error("Update failed with status:", response.status, data);
				this.$swal({
				toast: true,
				position: 'bottom-end',
				showConfirmButton: false,
				timer: 3000,
				icon: 'error',
				title: 'เกิดข้อผิดพลาด',
				text: 'ไม่สามารถบันทึกข้อมูลได้',
				});
			}
			} catch (error) {
			console.error("Update error:", error);
			this.$swal({
				toast: true,
				position: 'bottom-end',
				showConfirmButton: false,
				timer: 3000,
				icon: 'error',
				title: 'เกิดข้อผิดพลาด',
				text: 'ไม่สามารถบันทึกข้อมูลได้',
			});
			}
		},

    confirmRemoveItem() {
      const { item} = this.deletionData;
      const index = this.editMenu.indexOf(item);
      if (index > -1) {
        this.editMenu.splice(index, 1);
      }
      this.handleConfirmCancel();
    },
    confirmRemoveSubItem() {
      const { parentItem,subitem} = this.deletionData;
      const index = parentItem.subMenu.indexOf(subitem);
      if (index > -1) {
        parentItem.subMenu.splice(index, 1);
      }
      this.handleConfirmCancel();
    },
    handleConfirmation() {
      if (this.deletionData) {
        const { type } = this.deletionData;
        if (type === 'item') {
          this.confirmRemoveItem();
        } else if (type === 'subitem') {
          this.confirmRemoveSubItem();
        }
      }
    },
    handleConfirmCancel() {
      this.deletionData = null;
      this.confirmationMessage = '';
      this.confirmationHeader = '';
      this.showConfirmation = false;
    },
    deleteItem(item) {
      this.confirmationMessage = 'คุณต้องการลบเนื้อหา (Content) นี้ ?';
      this.confirmationHeader = 'ยืนยันการทำรายการ';
      this.deletionData = {
        type: 'item',
        item,
      };
      this.showConfirmation = true;
    },
    deleteSubItem(parentItem, subitem) {
      this.confirmationMessage = 'คุณต้องการลบเนื้อหา (Content) นี้ ?';
      this.confirmationHeader = 'ยืนยันการทำรายการ';
      this.deletionData = {
        type: 'subitem',
        subitem,
        parentItem
      };
      this.showConfirmation = true;
    },

    addToEditMenu(item, type = 'custom') {
      // Initialize SEO object if it doesn't exist
      if (!item.seo) {
        item.seo = {
          title: '',
          description: '',
          keywords: '',
          keywordsList: [],
          image: '',
          imageError: false
        };
      }
      
      // Ensure keywordsList exists
      if (!item.seo.keywordsList) {
        item.seo.keywordsList = [];
      }
      
      // Initialize newKeyword if it doesn't exist
      if (!item.newKeyword) {
        item.newKeyword = '';
      }
      
      // Set the type
      item.type = type;
      
      this.editMenu.push(item);
    },
    moveUpItem(item) {
      const index = this.editMenu.indexOf(item);
      if (index > 0) {
        this.editMenu.splice(index, 1);
        this.editMenu.splice(index - 1, 0, item);
      }
    },
    moveDownItem(item) {
      const index = this.editMenu.indexOf(item);
      if (index < this.editMenu.length - 1) {
        this.editMenu.splice(index, 1);
        this.editMenu.splice(index + 1, 0, item);
      }
    },
    isFirstItem(item) {
      return this.editMenu.indexOf(item) === 0;
    },
    isLastItem(item) {
      return this.editMenu.indexOf(item) === this.editMenu.length - 1;
    },
    editItem(item) {
      // Initialize SEO object if it doesn't exist
      if (!item.seo) {
        item.seo = {
          title: '',
          description: '',
          keywords: '',
          keywordsList: [],
          image: '',
          imageError: false
        };
      }
      
      // Ensure keywordsList exists
      if (!item.seo.keywordsList) {
        item.seo.keywordsList = [];
      }
      
      // Initialize newKeyword if it doesn't exist
      if (!item.newKeyword) {
        item.newKeyword = '';
      }
      
      // Initialize type if it doesn't exist
      if (!item.type) {
        item.type = 'custom';
      }
      
      item.isEditing = true;
    },
    updateItem(item) {
      item.isEditing = false;
    },
    cancelEdit(item) {
      item.isEditing = false;
      item.newAttribute = '';
    },
    moveUpSubItem(parentItem, subitem) {
      const index = parentItem.subMenu.indexOf(subitem);
      if (index > 0) {
        parentItem.subMenu.splice(index, 1);
        parentItem.subMenu.splice(index - 1, 0, subitem);
      }
    },
    moveDownSubItem(parentItem, subitem) {
      const index = parentItem.subMenu.indexOf(subitem);
      if (index < parentItem.subMenu.length - 1) {
        parentItem.subMenu.splice(index, 1);
        parentItem.subMenu.splice(index + 1, 0, subitem);
      }
    },
    isFirstSubItem(parentItem, subitem) {
      return parentItem.subMenu.indexOf(subitem) === 0;
    },
    isLastSubItem(parentItem, subitem) {
      return parentItem.subMenu.indexOf(subitem) === parentItem.subMenu.length - 1;
    },
    editSubItem(parentItem, subitem) {
      // Initialize SEO object if it doesn't exist
      if (!subitem.seo) {
        subitem.seo = {
          title: '',
          description: '',
          keywords: '',
          keywordsList: [],
          image: '',
          imageError: false
        };
      }
      
      // Ensure keywordsList exists
      if (!subitem.seo.keywordsList) {
        subitem.seo.keywordsList = [];
      }
      
      // Initialize newKeyword if it doesn't exist
      if (!subitem.newKeyword) {
        subitem.newKeyword = '';
      }
      
      // Initialize type if it doesn't exist
      if (!subitem.type) {
        subitem.type = 'custom';
      }
      
      subitem.isEditing = true;
    },
    updateSubItem(parentItem, subitem) {
      subitem.isEditing = false;
    },
    cancelEditSubItem(subitem) {
      subitem.isEditing = false;
      subitem.newAttribute = '';
    },
    generateUniqueId() {
      const timestamp = new Date().getTime();
      return `item_${timestamp}`;
    },
    addEmptyItem(type = 'custom') {
      const newItem = {
        id: this.generateUniqueId(), // You can replace this with your own method for generating unique IDs
        title: 'New Menu Item',
        target: '#',
        auth: true,
        type: type,
        isPublic: true,
        seo: {
          title: '',
          description: '',
          keywords: '',
          keywordsList: [],
          image: '',
          imageError: false
        },
        newKeyword: ''
      };
      this.editMenu.push(newItem);
    },

    // File Browser Methods
    openSEOImageBrowser(item) {
      console.log("=== Opening SEO Image Browser ===");
      console.log("Item:", item);
      console.log("Item SEO:", item.seo);
      
      this.currentEditingItem = item;
      this.FileBrowserOpen = true;
      
      console.log("Set currentEditingItem:", this.currentEditingItem);
      console.log("FileBrowserOpen:", this.FileBrowserOpen);
    },

    changeFileTrigger(payload) {
      console.log("=== changeFileTrigger Debug ===");
      console.log("changeFileTrigger payload:", payload);
      console.log("currentEditingItem before:", this.currentEditingItem);
      
      this.FileBrowserOpen = payload;
      
      // ไม่รีเซ็ต currentEditingItem ที่นี่ เพื่อให้ selectFileTrigger ใช้งานได้
      // การรีเซ็ตจะทำใน selectFileTrigger แทน
      
      console.log("FileBrowserOpen set to:", this.FileBrowserOpen);
      console.log("=== End changeFileTrigger Debug ===");
    },

    selectFileTrigger(payload) {
      console.log("=== SEO Image Selection Debug ===");
      console.log("selectFileTrigger payload:", payload);
      console.log("currentEditingItem:", this.currentEditingItem);
      
      if (payload && payload.file && this.currentEditingItem) {
        console.log("Before update - currentEditingItem.seo.image:", this.currentEditingItem.seo.image);
        
        // รีเซ็ต error state
        this.currentEditingItem.seo.imageError = false;
        
        // อัพเดต SEO image URL ของ item ที่เลือก
        this.currentEditingItem.seo.image = payload.file;
        
        console.log("After update - currentEditingItem.seo.image:", this.currentEditingItem.seo.image);
        console.log("Updated SEO image for item:", this.currentEditingItem.title, "with URL:", payload.file);
        
        // ปิด modal และรีเซ็ต reference
        this.FileBrowserOpen = false;
        this.currentEditingItem = null;
        
        console.log("Successfully updated and closed modal");
      } else {
        console.log("Missing required data:");
        console.log("- payload.file:", payload?.file);
        console.log("- currentEditingItem:", this.currentEditingItem);
        
        // ถ้าไม่มีข้อมูลครบ ให้ปิด modal และรีเซ็ตอยู่ดี
        this.FileBrowserOpen = false;
        this.currentEditingItem = null;
      }
      
      console.log("=== End Debug ===");
    },

    // Image handling methods
    handleImageError(event, item) {
      console.error("Failed to load SEO image:", item.seo.image, event);
      item.seo.imageError = true;
    },

    handleImageLoad(event, item) {
      console.log("SEO image loaded successfully:", item.seo.image);
      item.seo.imageError = false;
    },

    // Keyword management methods
    addKeyword(item) {
      if (!item.newKeyword || !item.newKeyword.trim()) return;
      
      // Initialize keywordsList if it doesn't exist
      if (!item.seo.keywordsList) {
        item.seo.keywordsList = [];
      }
      
      const keyword = item.newKeyword.trim();
      
      // Check if keyword already exists
      if (!item.seo.keywordsList.includes(keyword)) {
        item.seo.keywordsList.push(keyword);
      }
      
      // Clear input
      item.newKeyword = '';
    },

    removeKeyword(item, index) {
      if (item.seo.keywordsList && index >= 0 && index < item.seo.keywordsList.length) {
        item.seo.keywordsList.splice(index, 1);
      }
    },

    // Generate preview URL for Google preview
    getPreviewUrl(item) {
      const baseUrl = this.session.current.hostname;
      const slug = item.target && item.target !== '#' ? item.target : '/menu-item';
      return `https://${baseUrl}${slug}`;
    }
  },
};
</script>

<style>
/* Add your styles here */
</style>
