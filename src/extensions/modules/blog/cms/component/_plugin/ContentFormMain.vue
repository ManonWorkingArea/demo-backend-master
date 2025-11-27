<template>
  <div>
    <!-- Content Creation Wizard Modal -->
    <div v-if="showContentWizard" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" :class="{ 'max-w-md': isWizardMinimized }">
        <!-- Modal Header -->
        <div class="px-4 py-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 class="text-xl font-semibold text-gray-900">
              <i class="fas fa-magic text-blue-500 mr-2"></i>
              ตัวช่วยสร้างเนื้อหาใหม่
            </h2>
            <p class="text-sm text-gray-600 mt-1">
              {{ wizardStep === 1 ? 'เลือกประเภทเนื้อหาที่ต้องการสร้าง' : wizardStep === 2 ? 'กรอกข้อมูลพื้นฐาน' : 'การตั้งค่า SEO' }}
            </p>
          </div>
          <div class="flex items-center gap-2">
            <button @click="minimizeWizard" class="text-gray-400 hover:text-gray-600 p-2 rounded">
              <i :class="isWizardMinimized ? 'fas fa-expand' : 'fas fa-compress'" class="text-sm"></i>
            </button>
            <button @click="cancelWizard" class="text-gray-400 hover:text-gray-600 p-2 rounded">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="px-4 py-3 bg-gray-50 border-b">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-gray-700">ขั้นตอน {{ wizardStep }} จาก 3</span>
            <span class="text-sm text-gray-500">{{ wizardCompletionPercentage }}% เสร็จสิ้น</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div 
              class="bg-blue-500 h-2 rounded-full transition-all duration-300" 
              :style="{ width: wizardCompletionPercentage + '%' }"
            ></div>
          </div>
        </div>

        <!-- Modal Content -->
        <div class="py-4" v-if="!isWizardMinimized">
          <!-- Step 1: Content Type Selection -->
          <div v-if="wizardStep === 1" class="px-4">
            <h3 class="text-base font-medium text-gray-900 mb-4 text-center">เลือกประเภทเนื้อหา</h3>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div 
                v-for="option in contentTypeOptions" 
                :key="option.code"
                @click="selectContentType(option.code)"
                class="border-2 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md"
                :class="{ 
                  'border-blue-500 bg-blue-50': wizardSelectedType === option.code,
                  'border-gray-200 hover:border-gray-300': wizardSelectedType !== option.code 
                }"
              >
                <div class="text-center">
                  <img :src="option.icon" :alt="option.name" class="w-12 h-12 mx-auto mb-3" />
                  <h4 class="font-semibold text-gray-900 mb-2">{{ option.name }}</h4>
                  <p class="text-sm text-gray-600 mb-3">{{ option.description }}</p>
                  <div class="text-xs text-gray-500">
                    <i class="fas fa-check mr-1"></i>
                    {{ option.requiredFields.length }} ช่องข้อมูลหลัก
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 2: Content Details -->
          <div v-if="wizardStep === 2 && selectedContentTypeConfig" class="px-4">
            <h3 class="text-base font-medium text-gray-900 mb-4 text-center">กรอกข้อมูลพื้นฐาน</h3>

            <div class="max-w-full mx-auto space-y-4">
              <!-- Title -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  ชื่อเนื้อหา <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="wizardContentTitle"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="กรอกชื่อเนื้อหา..."
                />
              </div>

              <!-- Slug (hidden for auto-slug content types) -->
              <div v-if="!shouldUseAutoSlug">
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  URL Slug <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                  <span class="absolute left-3 top-2 text-gray-500 text-sm">{{ hostname || 'yoursite.com' }}/</span>
                  <input
                    v-model="wizardContentSlug"
                    type="text"
                    class="w-full pl-32 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="url-slug"
                  />
                </div>
                <p class="text-xs text-gray-500 mt-1">จะถูกสร้างอัตโนมัติจากชื่อเนื้อหา</p>
              </div>
              
              <!-- Auto-slug preview (for auto-slug content types) -->
              <div v-if="shouldUseAutoSlug">
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  URL Slug (สร้างอัตโนมัติ)
                </label>
                <div class="p-3 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-600">
                  {{ hostname || 'yoursite.com' }}/{{ slugify(wizardContentTitle) || 'url-slug' }}
                </div>
                <p class="text-xs text-gray-500 mt-1">
                  <i class="fas fa-magic mr-1"></i>
                  URL จะถูกสร้างอัตโนมัติจากชื่อเนื้อหา
                </p>
              </div>
              
              <!-- Description -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  คำอธิบายเนื้อหา
                </label>
                <textarea
                  v-model="wizardContentDescription"
                  rows="3"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  placeholder="อธิบายเนื้อหาโดยย่อ..."
                ></textarea>
                <p class="text-xs text-gray-500 mt-1">คำอธิบายจะถูกใช้สำหรับ Meta Description หากไม่กรอกในขั้นตอน SEO</p>
              </div>
            </div>
          </div>

          <!-- Step 3: SEO Settings -->
          <div v-if="wizardStep === 3 && selectedContentTypeConfig" class="px-4">
            <h3 class="text-base font-medium text-gray-900 mb-4 text-center">การตั้งค่า SEO</h3>

            <div class="max-w-full mx-auto space-y-6">
              <!-- SEO Title -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">SEO Title</label>
                <input
                  v-model="wizardSeoTitle"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="ชื่อสำหรับ SEO (ใช้ชื่อเนื้อหาหากไม่กรอก)"
                />
                <div class="flex justify-between text-xs text-gray-500 mt-1">
                  <span>แนะนำ: 30-60 ตัวอักษร</span>
                  <span :class="wizardSeoTitle && wizardSeoTitle.length >= 30 && wizardSeoTitle.length <= 60 ? 'text-green-600' : 'text-gray-500'">
                    {{ wizardSeoTitle ? wizardSeoTitle.length : 0 }}/60
                  </span>
                </div>
              </div>

              <!-- SEO Description -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
                <textarea
                  v-model="wizardSeoDescription"
                  rows="3"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  placeholder="คำอธิบายสำหรับ SEO..."
                ></textarea>
                <div class="flex justify-between text-xs text-gray-500 mt-1">
                  <span>แนะนำ: 120-160 ตัวอักษร</span>
                  <span :class="wizardSeoDescription && wizardSeoDescription.length >= 120 && wizardSeoDescription.length <= 160 ? 'text-green-600' : 'text-gray-500'">
                    {{ wizardSeoDescription ? wizardSeoDescription.length : 0 }}/160
                  </span>
                </div>
              </div>

              <!-- SEO Keywords -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Keywords</label>
                <div class="border border-gray-300 rounded-md p-2 flex flex-wrap gap-1 min-h-[2.5rem]">
                  <!-- Tag List -->
                  <span
                    v-for="(tag, index) in wizardSeoKeywords"
                    :key="index"
                    class="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm"
                  >
                    {{ tag }}
                    <button
                      @click="removeWizardKeyword(index)"
                      class="text-blue-500 hover:text-red-500 transition-colors"
                    >
                      <i class="fas fa-times text-xs"></i>
                    </button>
                  </span>
                  <!-- Input for Adding Tags -->
                  <input
                    v-model="wizardNewKeyword"
                    @keyup.enter="addWizardKeyword"
                    placeholder="เพิ่ม keyword..."
                    class="border-none focus:outline-none flex-grow text-sm min-w-0 bg-transparent"
                  />
                </div>
                <p class="text-xs text-gray-500 mt-1">
                  <i class="fas fa-info-circle mr-1"></i>
                  กด Enter เพื่อเพิ่ม keyword • แนะนำ: 3-5 keywords
                </p>
              </div>

              <!-- Preview -->
              <div class="p-4 bg-gray-50 rounded-lg border">
                <h4 class="text-sm font-medium text-gray-700 mb-3">
                  <i class="fas fa-eye mr-1"></i>
                  ตัวอย่างใน Google
                </h4>
                <div class="space-y-1">
                  <div class="text-blue-600 text-lg font-medium truncate">
                    {{ wizardSeoTitle || wizardContentTitle || 'ชื่อเรื่อง...' }}
                  </div>
                  <div class="text-green-600 text-sm">
                    {{ hostname || 'yoursite.com' }}/{{ wizardContentSlug || 'url-slug' }}
                  </div>
                  <div class="text-gray-600 text-sm leading-relaxed">
                    {{ wizardSeoDescription || wizardContentDescription || 'คำอธิบายสำหรับ SEO จะแสดงที่นี่...' }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="px-4 py-4 border-t border-gray-200 flex justify-between" v-if="!isWizardMinimized">
          <div class="flex items-center">
            <button 
              v-if="wizardStep > 1"
              @click="goBackToTypeSelection"
              class="text-gray-600 hover:text-gray-800 text-sm flex items-center"
            >
              <i class="fas fa-arrow-left mr-1"></i>
              กลับ
            </button>
          </div>
          
          <div class="flex items-center gap-3">
            <button @click="cancelWizard" class="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm">
              ข้าม
            </button>
            <button 
              v-if="wizardStep === 1"
              @click="wizardStep = 2"
              :disabled="!wizardSelectedType"
              class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              ถัดไป
            </button>
            <button 
              v-if="wizardStep === 2"
              @click="nextWizardStep"
              :disabled="!isWizardFormValid"
              class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {{ shouldSkipSEO ? 'สร้างเนื้อหา' : 'ถัดไป' }}
            </button>
            <button 
              v-if="wizardStep === 3"
              @click="finishWizard"
              class="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
            >
              สร้างเนื้อหา
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Reopen Wizard Button -->
    <div v-if="!showContentWizard && (!title || !contentType)" class="fixed top-4 right-4 z-40">
      <button @click="reopenWizard" 
              class="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg transition-colors"
              title="เปิดตัวช่วยสร้างเนื้อหา">
        <i class="fas fa-magic"></i>
      </button>
    </div>

    <!-- Title Input Section -->
    <div class="mx-auto max-w-full px-2 sm:px-3 lg:px-4 mb-3">
      <div class="bg-white rounded-md shadow-sm border border-gray-200 p-3">
        <div class="space-y-3">
          <div>
            <label for="title" class="block text-xs font-medium text-gray-700 mb-1">ชื่อเนื้อหา</label>
            <input
              v-model="localTitle"
              type="text"
              name="title"
              id="title"
              autocomplete="title"
              class="block w-full rounded border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 text-sm"
              placeholder="กรอกชื่อเนื้อหา..."
              @keyup.enter="$emit('onTitleInput')"
              @input="$emit('update:title', localTitle)"
              @blur="$emit('onTitleBlur')"
            />
          </div>
          
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">URL Slug</label>
            <div class="flex items-center h-[40px] bg-gray-50 rounded border border-gray-200 p-2">
              <span class="text-gray-500 mr-2 border-r border-gray-300 pr-2">
                <i class="fas fa-home text-xs"></i>
              </span>
              <span class="text-green-500 mr-1"><i class="fas fa-lock text-xs"></i></span>
              <p class="hidden md:block text-gray-700 text-xs">
                https://<span class="text-gray-400">{{ hostname }}</span>/<span v-if="parentSlug">{{ parentSlug }}/</span>
              </p>
              <template v-if="!isEditing && slug">
                <p class="pl-0 ml-0 text-green-600 font-medium text-xs">{{ slug }}</p>
                <button @click="$emit('edit:slug', true)" class="ml-1 p-1 hover:bg-gray-200 rounded">
                  <i class="w-3 h-3 fas fa-pencil-alt text-gray-500"></i>
                </button>
              </template>
              <template v-else>
                <input
                  v-model="localSlug"
                  @input="$emit('update:slug', localSlug); handleSlugInput()"
                  @keyup.enter="$emit('updateSlug')"
                  type="text"
                  class="slug-input p-1 rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-600 text-xs"
                  placeholder="กรอก URL slug..."
                />
                <button @click="$emit('updateSlug')" class="ml-1 p-1 hover:bg-gray-200 rounded">
                  <i class="w-3 h-3 fas fa-save text-gray-500"></i>
                </button>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Form Content -->
    <div class="mx-auto max-w-full px-2 sm:px-3 lg:px-4">
      <div class="max-w-full mx-auto space-y-3">
        <!-- Content Type Selection -->
        <section aria-labelledby="applicant-information-title" v-if="contentType != 'post' && !localIsPostType">
          <div class="bg-white shadow-sm rounded-md border border-gray-200">
            <div class="p-3">
              <h2 class="text-sm font-semibold text-gray-900 mb-3">ประเภทเนื้อหา</h2>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
                <label
                  class="relative flex flex-col items-center justify-center p-3 cursor-pointer border-2 rounded-md hover:bg-gray-50 transition-colors"
                  :class="{ 'border-blue-500 bg-blue-50': contentType === 'page' || contentType === 'post', 'border-gray-300': contentType !== 'page' && contentType !== 'post' }"
                >
                  <img
                    src="https://vue-project.sgp1.digitaloceanspaces.com/ui-icon/pagepng.png"
                    alt="Page"
                    class="w-8 h-8 mb-1"
                  />
                  <input
                    type="radio"
                    v-model="localContentType"
                    value="page"
                    class="hidden"
                    :checked="contentType === 'post'"
                    :disabled="contentType === 'post' || localIsPostType"
                    @change="$emit('update:contentType', localContentType)"
                  />
                  <span class="text-xs font-medium text-gray-700">
                    {{ localIsPostType ? 'Post' : 'Page' }}
                  </span>
                  <span v-if="localIsPostType" class="text-xs text-gray-500">บทความย่อย</span>
                </label>

                <label
                  class="relative flex flex-col items-center justify-center p-3 cursor-pointer border-2 rounded-md hover:bg-gray-50 transition-colors"
                  :class="{ 'border-blue-500 bg-blue-50': contentType === 'form', 'border-gray-300': contentType !== 'form', 'opacity-50 cursor-not-allowed': localIsPostType }"
                >
                  <img
                    src="https://vue-project.sgp1.digitaloceanspaces.com/ui-icon/formpng.png"
                    alt="Form"
                    class="w-8 h-8 mb-1"
                  />
                  <input
                    type="radio"
                    v-model="localContentType"
                    value="form"
                    class="hidden"
                    :disabled="contentType === 'post' || localIsPostType"
                    @change="$emit('update:contentType', localContentType)"
                  />
                  <span class="text-xs font-medium text-gray-700">Form</span>
                </label>

                <label
                  class="relative flex flex-col items-center justify-center p-3 cursor-pointer border-2 rounded-md hover:bg-gray-50 transition-colors"
                  :class="{ 'border-blue-500 bg-blue-50': contentType === 'layout', 'border-gray-300': contentType !== 'layout', 'opacity-50 cursor-not-allowed': localIsPostType }"
                >
                  <img
                    src="https://vue-project.sgp1.digitaloceanspaces.com/ui-icon/layoutpng.png"
                    alt="Layout"
                    class="w-8 h-8 mb-1"
                  />
                  <input
                    type="radio"
                    v-model="localContentType"
                    value="layout"
                    class="hidden"
                    :disabled="contentType === 'post' || localIsPostType"
                    @change="$emit('update:contentType', localContentType)"
                  />
                  <span class="text-xs font-medium text-gray-700">Layout</span>
                </label>

                <label
                  class="relative flex flex-col items-center justify-center p-3 cursor-pointer border-2 rounded-md hover:bg-gray-50 transition-colors"
                  :class="{ 'border-blue-500 bg-blue-50': contentType === 'menu', 'border-gray-300': contentType !== 'menu', 'opacity-50 cursor-not-allowed': localIsPostType }"
                >
                  <img
                    src="https://vue-project.sgp1.digitaloceanspaces.com/ui-icon/absolutepng.png"
                    alt="Menu"
                    class="w-8 h-8 mb-1"
                  />
                  <input
                    type="radio"
                    v-model="localContentType"
                    value="menu"
                    class="hidden"
                    :disabled="contentType === 'post' || localIsPostType"
                    @change="$emit('update:contentType', localContentType)"
                  />
                  <span class="text-xs font-medium text-gray-700">Menu</span>
                </label>
              </div>
              
              <!-- Post Type Notice -->
              <div v-if="localIsPostType" class="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
                <i class="fas fa-info-circle mr-1"></i>
                นี่คือบทความย่อย (Post) ที่อยู่ภายใต้หน้าหลัก ประเภทเนื้อหาถูกกำหนดเป็น Post โดยอัตโนมัติ
              </div>
            </div>
          </div>
        </section>

        <!-- Post Type Info (แสดงเมื่อเป็น post) -->
        <section v-if="localIsPostType || contentType === 'post'">
          <div class="bg-white shadow-sm rounded-md border border-gray-200">
            <div class="p-3">
              <h2 class="text-sm font-semibold text-gray-900 mb-3">ข้อมูลบทความ</h2>
              <div class="p-3 bg-blue-50 border border-blue-200 rounded">
                <div class="flex items-center gap-2 mb-2">
                  <i class="fas fa-file-alt text-blue-600"></i>
                  <span class="text-sm font-medium text-blue-900">บทความย่อย (Post)</span>
                </div>
                <div class="space-y-1 text-xs text-blue-800">
                  <div>• ประเภทเนื้อหา: Post</div>
                  <div>• จัดการโดยหน้าหลัก</div>
                  <div>• การแสดงผล: ตามการตั้งค่าของหน้าหลัก</div>
                  <div>• สามารถมี Custom Fields ได้ตามที่หน้าหลักกำหนด</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Page Display Options -->
        <section v-if="contentType === 'page' && !localIsPostType">
          <div class="bg-white shadow-sm rounded-md border border-gray-200">
            <div class="p-3">
              <h2 class="text-sm font-semibold text-gray-900 mb-3">การแสดงผลหน้า</h2>
              
              <div class="mb-4">
                <label class="block text-xs font-medium text-gray-700 mb-2">รูปแบบการแสดงผล</label>
                <div class="grid grid-cols-2 gap-2">
                  <label
                    class="relative flex flex-col items-center justify-center p-3 cursor-pointer border-2 rounded-md hover:bg-gray-50 transition-colors"
                    :class="{ 'border-blue-500 bg-blue-50': display === 'single', 'border-gray-300': display !== 'single' }"
                  >
                    <img
                      src="https://vue-project.sgp1.digitaloceanspaces.com/ui-icon/singlepng.png"
                      alt="Single Page"
                      class="w-8 h-8 mb-1"
                    />
                    <input
                      type="radio"
                      v-model="localDisplay"
                      value="single"
                      class="hidden"
                      :disabled="localIsPostType"
                      @change="$emit('update:display', localDisplay)"
                    />
                    <span class="text-xs font-medium text-gray-700">หน้าเดี่ยว</span>
                    <span class="text-xs text-gray-500 text-center mt-0.5">หน้าเว็บปกติ</span>
                  </label>
                  
                  <label
                    class="relative flex flex-col items-center justify-center p-3 cursor-pointer border-2 rounded-md hover:bg-gray-50 transition-colors"
                    :class="{ 'border-blue-500 bg-blue-50': display === 'group', 'border-gray-300': display !== 'group' }"
                  >
                    <img
                      src="https://vue-project.sgp1.digitaloceanspaces.com/ui-icon/grouppng.png"
                      alt="Group Page"
                      class="w-8 h-8 mb-1"
                    />
                    <input
                      type="radio"
                      v-model="localDisplay"
                      value="group"
                      class="hidden"
                      :disabled="localIsPostType"
                      @change="$emit('update:display', localDisplay)"
                    />
                    <span class="text-xs font-medium text-gray-700">หน้ารวม</span>
                    <span class="text-xs text-gray-500 text-center mt-0.5">หน้าสำหรับรวมบทความ</span>
                  </label>
                </div>
              </div>

              <div>
                <label class="block text-xs font-medium text-gray-700 mb-2">ตัวเลือกเพิ่มเติม</label>
                <div class="grid grid-cols-1 gap-2">
                  <label class="flex items-start gap-2 p-2 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
                    <input
                      :checked="localIsComment"
                      @change="handleCheckboxChange('isComment', $event.target.checked)"
                      type="checkbox"
                      class="mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                    />
                    <div>
                      <div class="text-xs font-medium text-gray-900">ความคิดเห็น</div>
                      <div class="text-xs text-gray-500">เปิดใช้ระบบความคิดเห็น</div>
                    </div>
                  </label>

                  <label class="flex items-start gap-2 p-2 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
                    <input
                      :checked="localIsCounter"
                      @change="handleCheckboxChange('isCounter', $event.target.checked)"
                      type="checkbox"
                      class="mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                    />
                    <div>
                      <div class="text-xs font-medium text-gray-900">นับผู้เยี่ยมชม</div>
                      <div class="text-xs text-gray-500">แสดงจำนวนผู้เยี่ยมชม</div>
                    </div>
                  </label>

                  <label class="flex items-start gap-2 p-2 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
                    <input
                      :checked="localIsMenu"
                      @change="handleCheckboxChange('isMenu', $event.target.checked)"
                      type="checkbox"
                      class="mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                    />
                    <div>
                      <div class="text-xs font-medium text-gray-900">แสดงในเมนู</div>
                      <div class="text-xs text-gray-500">รวมในเมนูนำทาง</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- SEO Settings -->
        <section aria-labelledby="seo-settings-title" v-if="(contentType === 'page' || contentType === 'form') && !localIsPostType">
          <div class="bg-white shadow-sm rounded-md border border-gray-200">
            <div class="p-3">
              <h2 id="seo-settings-title" class="text-sm font-semibold text-gray-900 mb-3">
                SEO Settings
              </h2>

              <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <!-- SEO Image - Left Side -->
                <div class="lg:col-span-1 flex flex-col">
                  <label for="seo-image" class="block text-xs font-medium text-gray-700 mb-2">
                    SEO Image
                  </label>
                  <div class="relative w-full flex-1">
                    <div class="h-full">
                      <div
                        class="w-full h-full min-h-[200px] lg:min-h-[280px] bg-gray-200 flex items-center justify-center rounded cursor-pointer hover:bg-gray-300 transition-colors"
                        @click="$emit('openSEOFileBrowser')"
                      >
                        <div v-if="!seoImage" class="text-center">
                          <i class="fas fa-image text-gray-400 text-2xl mb-3"></i>
                          <p class="text-sm text-gray-500 mb-1">คลิกเพื่อเลือกรูปภาพ</p>
                          <p class="text-xs text-gray-400">แนะนำ: 1200x630px</p>
                          <p class="text-xs text-gray-400">สำหรับการแชร์โซเชียล</p>
                        </div>
                        <img
                          v-else
                          :src="seoImage"
                          alt="SEO Image"
                          class="w-full h-full object-cover rounded"
                        />
                        <div
                          v-if="seoImage"
                          class="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded"
                        >
                          <span class="text-white bg-black bg-opacity-60 px-3 py-2 rounded text-sm">
                            <i class="fas fa-edit text-white text-sm mr-1"></i>
                            เปลี่ยนรูปภาพ
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <!-- SEO Preview -->
                  <div class="mt-4 p-3 bg-gray-50 rounded border">
                    <h4 class="text-xs font-medium text-gray-700 mb-2">
                      <i class="fas fa-eye mr-1"></i>
                      ตัวอย่างใน Google
                    </h4>
                    <div class="space-y-1">
                      <div class="text-blue-600 text-sm font-medium truncate">
                        {{ seoTitle || title || 'ชื่อเรื่อง...' }}
                      </div>
                      <div class="text-green-600 text-xs">
                        {{ hostname || 'yoursite.com' }}/{{ slug || 'url-slug' }}
                      </div>
                      <div class="text-gray-600 text-xs leading-relaxed">
                        {{ seoDescription || 'คำอธิบายสำหรับ SEO จะแสดงที่นี่...' }}
                      </div>
                    </div>
                  </div>
                </div>

                <!-- SEO Form Fields - Right Side -->
                <div class="lg:col-span-2 flex flex-col">
                  <div class="space-y-4 flex-1">
                    <!-- SEO Title -->
                    <div>
                      <label for="seo-title" class="block text-xs font-medium text-gray-700 mb-1">
                        SEO Title
                      </label>
                      <input
                        v-model="localSeoTitle"
                        @input="$emit('update:seoTitle', localSeoTitle)"
                        type="text"
                        id="seo-title"
                        class="block w-full rounded border border-gray-300 py-1.5 px-2 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 text-xs"
                        placeholder="Enter a custom title for SEO"
                      />
                      <div class="flex justify-between text-xs text-gray-500 mt-1">
                        <span>แนะนำ: 30-60 ตัวอักษร</span>
                        <span :class="localSeoTitle && localSeoTitle.length >= 30 && localSeoTitle.length <= 60 ? 'text-green-600' : 'text-red-500'">
                          {{ localSeoTitle ? localSeoTitle.length : 0 }}/60
                        </span>
                      </div>
                    </div>

                    <!-- Meta Description -->
                    <div>
                      <label for="seo-description" class="block text-xs font-medium text-gray-700 mb-1">
                        Meta Description
                      </label>
                      <textarea
                        v-model="localSeoDescription"
                        @input="$emit('update:seoDescription', localSeoDescription)"
                        id="seo-description"
                        rows="3"
                        class="block w-full rounded border border-gray-300 py-1.5 px-2 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 text-xs resize-none"
                        placeholder="Enter a brief description for SEO"
                      ></textarea>
                      <div class="flex justify-between text-xs text-gray-500 mt-1">
                        <span>แนะนำ: 120-160 ตัวอักษร</span>
                        <span :class="localSeoDescription && localSeoDescription.length >= 120 && localSeoDescription.length <= 160 ? 'text-green-600' : 'text-red-500'">
                          {{ localSeoDescription ? localSeoDescription.length : 0 }}/160
                        </span>
                      </div>
                    </div>

                    <!-- Keywords with Tag Input -->
                    <div>
                      <label for="seo-keywords" class="block text-xs font-medium text-gray-700 mb-1">
                        Keywords
                      </label>
                      <div class="border border-gray-300 rounded-md p-2 flex flex-wrap gap-1 min-h-[2.5rem]">
                        <!-- Tag List -->
                        <span
                          v-for="(tag, index) in localSeoKeywords"
                          :key="index"
                          class="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm"
                        >
                          {{ tag }}
                          <button
                            @click="removeMainKeyword(index)"
                            class="text-blue-500 hover:text-red-500 transition-colors"
                          >
                            <i class="fas fa-times text-xs"></i>
                          </button>
                        </span>
                        <!-- Input for Adding Tags -->
                        <input
                          id="seo-keywords"
                          v-model="newKeyword"
                          @keyup.enter="addMainKeyword"
                          placeholder="เพิ่ม keyword..."
                          class="border-none focus:outline-none flex-grow text-sm min-w-0 bg-transparent"
                        />
                      </div>
                      <p class="mt-1 text-xs text-gray-500">
                        <i class="fas fa-info-circle mr-1"></i>
                        กด Enter เพื่อเพิ่ม keyword • แนะนำ: 3-5 keywords
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Custom Fields Management (for pages with group display) -->
        <section v-if="contentType === 'page' && localDisplay === 'group' && !localIsPostType">
          <CustomFieldsManager
            :custom-fields="customFields"
            @update:custom-fields="$emit('update:customFields', $event)"
          />
        </section>

        <!-- Custom Field Renderer (for posts) -->
        <section v-if="localIsPostType">
          <CustomFieldRenderer
            :type="contentType"
            :parent-id="parentId"
            :parent-data="parentData"
            :custom-data="customData"
            :configs="configs"
            @update:custom-data="$emit('update:customData', $event)"
            @open-image-browser="$emit('openCustomImageBrowser', $event)"
          />
        </section>

        <!-- Builder Link for All Types -->
        <section v-if="contentType && contentType !== ''">
          <div class="bg-white shadow-sm rounded-md border border-gray-200">
            <div class="p-4 text-center">
              <div class="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                <i class="fas fa-palette text-blue-600 text-lg"></i>
              </div>
              <h3 class="text-sm font-semibold text-gray-900 mb-1">ออกแบบเนื้อหา</h3>
              <p class="text-gray-500 mb-3 text-xs">
                <span v-if="contentType === 'page'">ใช้เครื่องมือสร้างหน้าเว็บเพื่อปรับแต่งเลย์เอาต์และเนื้อหา</span>
                <span v-else-if="contentType === 'form'">ออกแบบแบบฟอร์มด้วยเครื่องมือลากวาง</span>
                <span v-else-if="contentType === 'layout'">ออกแบบเลย์เอาต์สำหรับเว็บไซต์</span>
                <span v-else-if="contentType === 'menu'">จัดการรายการเมนูและการจัดเรียง</span>
              </p>
              <router-link 
                :to="'/cms/builder/' + postId" 
                class="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md transition-colors text-xs"
              >
                <i class="fas fa-palette text-xs"></i>
                <span v-if="contentType === 'page'">เริ่มออกแบบ</span>
                <span v-else-if="contentType === 'form'">สร้างฟอร์ม</span>
                <span v-else-if="contentType === 'layout'">ออกแบบเลย์เอาต์</span>
                <span v-else-if="contentType === 'menu'">จัดการเมนู</span>
              </router-link>
            </div>
          </div>
        </section>

        <!-- Form Type Settings -->
        <section v-if="contentType === 'form' && !localIsPostType">
          <div class="bg-white shadow-sm rounded-md border border-gray-200">
            <div class="p-3">
              <h2 class="text-sm font-semibold text-gray-900 mb-3">ตั้งค่าแบบฟอร์ม</h2>
              
              <div class="space-y-3">
                <!-- Form Action -->
                <div>
                  <label class="block text-xs font-medium text-gray-700 mb-1">การดำเนินการหลังส่งฟอร์ม</label>
                  <select 
                    v-model="localAction"
                    @change="$emit('update:action', localAction)"
                    class="block w-full rounded border border-gray-300 py-1.5 px-2 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 text-xs"
                  >
                    <option value="standard">แสดงข้อความขอบคุณ</option>
                    <option value="redirect">เปลี่ยนหน้า</option>
                    <option value="email">ส่งอีเมล</option>
                    <option value="download">ดาวน์โหลดไฟล์</option>
                  </select>
                </div>

                <!-- Form Destination -->
                <div>
                  <label class="block text-xs font-medium text-gray-700 mb-1">ปลายทางข้อมูล</label>
                  <select 
                    v-model="localDestination"
                    @change="$emit('update:destination', localDestination)"
                    class="block w-full rounded border border-gray-300 py-1.5 px-2 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 text-xs"
                  >
                    <option value="database">ฐานข้อมูล</option>
                    <option value="email">อีเมล</option>
                    <option value="webhook">Webhook</option>
                    <option value="file">ไฟล์ CSV</option>
                  </select>
                </div>

                <!-- Next Page -->
                <div v-if="action === 'redirect'">
                  <label class="block text-xs font-medium text-gray-700 mb-1">หน้าถัดไป</label>
                  <input
                    v-model="localNext"
                    @input="$emit('update:next', localNext)"
                    type="text"
                    class="block w-full rounded border border-gray-300 py-1.5 px-2 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 text-xs"
                    placeholder="URL หรือ slug ของหน้าถัดไป"
                  />
                </div>

                <!-- Form Options -->
                <div>
                  <label class="block text-xs font-medium text-gray-700 mb-2">ตัวเลือกเพิ่มเติม</label>
                  <div class="space-y-2">
                    <label class="flex items-start gap-2 p-2 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
                      <input
                        :checked="localIsComment"
                        @change="handleCheckboxChange('isComment', $event.target.checked)"
                        type="checkbox"
                        class="mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                      />
                      <div>
                        <div class="text-xs font-medium text-gray-900">ต้องลงทะเบียน</div>
                        <div class="text-xs text-gray-500">ผู้ใช้ต้องเข้าสู่ระบบก่อนกรอกฟอร์ม</div>
                      </div>
                    </label>
                    
                    <label class="flex items-start gap-2 p-2 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
                      <input
                        :checked="localIsCounter"
                        @change="handleCheckboxChange('isCounter', $event.target.checked)"
                        type="checkbox"
                        class="mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                      />
                      <div>
                        <div class="text-xs font-medium text-gray-900">จำกัดการส่งฟอร์ม</div>
                        <div class="text-xs text-gray-500">ผู้ใช้ส่งได้เพียงครั้งเดียว</div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script>
import CustomFieldsManager from './CustomFieldsManager.vue';
import CustomFieldRenderer from './CustomFieldRenderer.vue';

export default {
  name: 'ContentFormMain',
  components: {
    CustomFieldsManager,
    CustomFieldRenderer
  },
  props: {
    title: {
      type: String,
      default: ''
    },
    slug: {
      type: String,
      default: ''
    },
    isEditing: {
      type: Boolean,
      default: false
    },
    hostname: {
      type: String,
      default: ''
    },
    parentSlug: {
      type: String,
      default: ''
    },
    contentType: {
      type: String,
      default: 'page'
    },
    display: {
      type: String,
      default: 'single'
    },
    isPostType: {
      type: Boolean,
      default: false
    },
    isComment: {
      type: Boolean,
      default: false
    },
    isCounter: {
      type: Boolean,
      default: false
    },
    isMenu: {
      type: Boolean,
      default: false
    },
    seoImage: {
      type: String,
      default: ''
    },
    seoTitle: {
      type: String,
      default: ''
    },
    seoDescription: {
      type: String,
      default: ''
    },
    seoKeywords: {
      type: Array,
      default: () => []
    },
    action: {
      type: String,
      default: 'standard'
    },
    destination: {
      type: String,
      default: 'database'
    },
    next: {
      type: String,
      default: ''
    },
    postId: {
      type: String,
      default: ''
    },
    customFields: {
      type: Array,
      default: () => []
    },
    customData: {
      type: Object,
      default: () => ({})
    },
    parentId: {
      type: String,
      default: ''
    },
    parentData: {
      type: Object,
      default: () => ({})
    },
    configs: {
      type: Object,
      required: true
    },
    type: {
      type: String,
      default: 'page'
    }
  },
  data() {
    return {
      newKeyword: '',
      localTitle: this.title,
      localSlug: this.slug,
      localContentType: this.contentType,
      localDisplay: this.display,
      localIsPostType: this.isPostType,
      localIsComment: this.isComment,
      localIsCounter: this.isCounter,
      localIsMenu: this.isMenu,
      localSeoTitle: this.seoTitle,
      localSeoDescription: this.seoDescription,
      localSeoKeywords: [...this.seoKeywords], // Local copy of seoKeywords
      localAction: this.action,
      localDestination: this.destination,
      localNext: this.next,
      slugValidationTimer: null,
      
      // Content Wizard State
      showContentWizard: false,
      wizardStep: 1, // 1=เลือกประเภท, 2=ข้อมูลพื้นฐาน, 3=SEO
      wizardSelectedType: '',
      wizardContentTitle: '',
      wizardContentSlug: '',
      wizardContentDescription: '',
      wizardSeoTitle: '',
      wizardSeoDescription: '',
      wizardSeoKeywords: [],
      wizardNewKeyword: '',
      isWizardMinimized: false,
      
      // Wizard Configuration
      contentTypeOptions: [
        {
          code: 'page',
          name: 'หน้าเดี่ยว',
          description: 'หน้าเว็บปกติสำหรับแสดงเนื้อหา',
          icon: 'https://vue-project.sgp1.digitaloceanspaces.com/ui-icon/pagepng.png',
          requiredFields: ['title', 'slug'],
          defaultSettings: {
            display: 'single',
            isComment: false,
            isCounter: true,
            isMenu: true
          }
        },
        {
          code: 'group',
          name: 'หน้ารวมบทความ',
          description: 'หน้าสำหรับรวมและแสดงบทความย่อย',
          icon: 'https://vue-project.sgp1.digitaloceanspaces.com/ui-icon/grouppng.png',
          requiredFields: ['title', 'slug'],
          defaultSettings: {
            display: 'group',
            isComment: false,
            isCounter: true,
            isMenu: true
          }
        },
        {
          code: 'form',
          name: 'แบบฟอร์ม',
          description: 'สร้างแบบฟอร์มสำหรับรับข้อมูล',
          icon: 'https://vue-project.sgp1.digitaloceanspaces.com/ui-icon/formpng.png',
          requiredFields: ['title', 'slug', 'action', 'destination'],
          defaultSettings: {
            display: 'single',
            action: 'standard',
            destination: 'database',
            isComment: false,
            isCounter: false,
            isMenu: true
          }
        },
        {
          code: 'layout',
          name: 'เลย์เอาต์',
          description: 'สร้างเลย์เอาต์สำหรับจัดโครงสร้างเว็บไซต์',
          icon: 'https://vue-project.sgp1.digitaloceanspaces.com/ui-icon/layoutpng.png',
          requiredFields: ['title'], // ไม่ต้องการ slug (auto-generated)
          skipSeo: true, // ข้าม SEO step
          autoSlug: true, // สร้าง slug อัตโนมัติ
          defaultSettings: {
            display: 'single',
            isComment: false,
            isCounter: false,
            isMenu: false
          }
        },
        {
          code: 'menu',
          name: 'เมนูนำทาง',
          description: 'สร้างเมนูนำทางสำหรับเว็บไซต์',
          icon: 'https://vue-project.sgp1.digitaloceanspaces.com/ui-icon/absolutepng.png',
          requiredFields: ['title'], // ไม่ต้องการ slug (auto-generated)
          skipSeo: true, // ข้าม SEO step
          autoSlug: true, // สร้าง slug อัตโนมัติ
          defaultSettings: {
            display: 'single',
            isComment: false,
            isCounter: false,
            isMenu: false
          }
        }
      ]
    }
  },
  
  computed: {
    // Get current selected content type configuration
    selectedContentTypeConfig() {
      return this.contentTypeOptions.find(option => option.code === this.wizardSelectedType) || null;
    },
    
    // Check if current content type should skip SEO step
    shouldSkipSEO() {
      const config = this.contentTypeOptions.find(option => option.code === this.wizardSelectedType);
      return config && config.skipSeo;
    },
    
    // Check if current content type should use auto-generated slug
    shouldUseAutoSlug() {
      const config = this.contentTypeOptions.find(option => option.code === this.wizardSelectedType);
      return config && config.autoSlug;
    },
    
    // Check if wizard form is valid
    isWizardFormValid() {
      if (this.wizardStep === 1) {
        return !!this.wizardSelectedType;
      } else if (this.wizardStep === 2) {
        const titleValid = !!(this.wizardContentTitle && this.wizardContentTitle.trim());
        
        // For auto-slug types, only title is required
        if (this.shouldUseAutoSlug) {
          return titleValid;
        }
        
        // For manual slug types, both title and slug are required
        const slugValid = !!(this.wizardContentSlug && this.wizardContentSlug.trim());
        return titleValid && slugValid;
      } else if (this.wizardStep === 3) {
        return true; // SEO step is optional
      }
      return false;
    },
    
    // Calculate completion percentage for overall wizard progress
    wizardCompletionPercentage() {
      let totalProgress = 0;
      const config = this.contentTypeOptions.find(option => option.code === this.wizardSelectedType);
      const skipSeo = config && config.skipSeo;
      
      // Step 1: Content Type Selection
      if (this.wizardSelectedType) {
        totalProgress += skipSeo ? 50 : 33.33; // Higher percentage if only 2 steps
      }
      
      // Step 2: Basic Information
      if (this.wizardContentTitle && this.wizardContentTitle.trim()) {
        totalProgress += skipSeo ? 25 : 16.67; // Title is required
      }
      if (this.wizardContentSlug && this.wizardContentSlug.trim() || (config && config.autoSlug)) {
        totalProgress += skipSeo ? 12.5 : 8.33; // Slug is auto-generated for some types
      }
      if (this.wizardContentDescription && this.wizardContentDescription.trim()) {
        totalProgress += skipSeo ? 12.5 : 8.33; // Description is optional but adds value
      }
      
      // Step 3: SEO Settings (only if not skipping)
      if (!skipSeo) {
        if (this.wizardSeoTitle && this.wizardSeoTitle.trim()) {
          totalProgress += 11.11;
        }
        if (this.wizardSeoDescription && this.wizardSeoDescription.trim()) {
          totalProgress += 11.11;
        }
        if (this.wizardSeoKeywords && this.wizardSeoKeywords.length > 0) {
          totalProgress += 11.11;
        }
      }
      
      return Math.round(Math.min(totalProgress, 100));
    }
  },
  
  watch: {
    title(newValue) {
      this.localTitle = newValue;
    },
    slug(newValue) {
      this.localSlug = newValue;
    },
    contentType(newValue) {
      this.localContentType = newValue;
    },
    display(newValue) {
      this.localDisplay = newValue;
    },
    isComment(newValue) {
      this.localIsComment = newValue;
    },
    isCounter(newValue) {
      this.localIsCounter = newValue;
    },
    isMenu(newValue) {
      this.localIsMenu = newValue;
    },
    seoTitle(newValue) {
      this.localSeoTitle = newValue;
    },
    seoDescription(newValue) {
      this.localSeoDescription = newValue;
    },
    seoKeywords(newValue) {
      // Update local keywords array when prop changes
      if (newValue && Array.isArray(newValue)) {
        this.localSeoKeywords = [...newValue];
        console.log('SEO Keywords updated from parent:', newValue);
        console.log('Local keywords after update:', this.localSeoKeywords);
      } else {
        console.log('SEO Keywords prop is empty or not an array:', newValue);
      }
    },
    action(newValue) {
      this.localAction = newValue;
    },
    destination(newValue) {
      this.localDestination = newValue;
    },
    next(newValue) {
      this.localNext = newValue;
    },
    isPostType(newValue) {
      this.localIsPostType = newValue;
    },
    
    // Wizard watchers
    wizardContentTitle(newValue) {
      if (newValue && newValue.trim()) {
        // Auto-generate slug from title
        this.wizardContentSlug = this.slugify(newValue);
        
        // Auto-update SEO title ทุกครั้งที่มีการเปลี่ยนแปลง
        this.wizardSeoTitle = newValue.trim();
        
        console.log('Auto-filled SEO title:', this.wizardSeoTitle);
      }
    },
    
    wizardContentDescription(newValue) {
      // Auto-update SEO description ทุกครั้งที่มีการเปลี่ยนแปลง
      if (newValue && newValue.trim()) {
        this.wizardSeoDescription = newValue.trim();
        console.log('Auto-filled SEO description:', this.wizardSeoDescription);
      }
    },
    
    wizardSelectedType(newValue, oldValue) {
      if (newValue && newValue !== oldValue) {
        console.log('Selected content type:', newValue);
        // ล้างข้อมูลเฉพาะเมื่อเปลี่ยนประเภทจริงๆ ไม่ใช่เมื่อกลับมา
        if (oldValue) {
          this.wizardContentTitle = '';
          this.wizardContentSlug = '';
          this.wizardContentDescription = '';
          this.wizardSeoTitle = '';
          this.wizardSeoDescription = '';
          this.wizardSeoKeywords = [];
          this.wizardNewKeyword = '';
        }
      }
    }
  },
  methods: {
    handleCheckboxChange(type, value) {
      this[`local${type.charAt(0).toUpperCase() + type.slice(1)}`] = value;
      this.$emit(`update:${type}`, value);
    },
    
    // Wizard Navigation Methods
    nextWizardStep() {
      if (this.wizardStep === 2 && this.shouldSkipSEO) {
        // For layout and navigation types, skip SEO and finish wizard
        this.finishWizard();
      } else if (this.wizardStep < 3) {
        this.wizardStep++;
      }
    },
    
    handleSlugInput() {
      // Clear existing timer
      if (this.slugValidationTimer) {
        clearTimeout(this.slugValidationTimer);
      }
      
      // Set new timer for validation (without closing edit mode)
      this.slugValidationTimer = setTimeout(() => {
        this.$emit('validateSlugSilently', this.localSlug);
      }, 1500); // Wait 1.5 seconds after user stops typing
    },
    
    slugify(str) {
      if (!str || typeof str !== "string") {
        return "";
      }
      str = str.trim().toLowerCase();
      var from = "àáãäâèéëêìíïîòóöôùúüûñç·/_,:;";
      var to = "aaaaaeeeeiiiioooouuuunc------";
      for (var i = 0, l = from.length; i < l; i++) {
        str = str.replace(new RegExp(from.charAt(i), "g"), to.charAt(i));
      }
      str = str
        .replace(/[^a-z0-9 -]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
      var lastDotIndex = str.lastIndexOf(".");
      if (lastDotIndex !== -1) {
        str = str.substring(0, lastDotIndex);
      }
      return str;
    },

    markDirty() {
      // This method will be called from parent component
      console.log('Content marked as dirty');
    },
    
    // Content Wizard Methods
    initializeWizard() {
      // Show wizard for new content or test (temporarily always show)
      if (!this.title && !this.slug && !this.contentType) {
        this.showContentWizard = true;
        this.wizardStep = 1;
        this.wizardSelectedType = '';
        this.wizardContentTitle = '';
        this.wizardContentSlug = '';
        this.wizardContentDescription = '';
        this.wizardSeoTitle = '';
        this.wizardSeoDescription = '';
        this.wizardSeoKeywords = [];
        this.wizardNewKeyword = '';
        this.isWizardMinimized = false;
      }
    },
    
    selectContentType(typeCode) {
      this.wizardSelectedType = typeCode;
      
      // ตรวจสอบว่าต้องข้าม SEO step หรือไม่
      const config = this.contentTypeOptions.find(option => option.code === typeCode);
      if (config && config.skipSEO) {
        // สำหรับ layout และ menu ข้ามไป step 2 และจบที่ step 2
        this.wizardStep = 2;
        console.log('Selected content type (skip SEO):', typeCode);
      } else {
        // สำหรับ page, form ไป step 2 ปกติ
        this.wizardStep = 2;
        console.log('Selected content type:', typeCode);
      }
    },
    
    goBackToTypeSelection() {
      if (this.wizardStep === 2) {
        // กลับไปขั้นตอนเลือกประเภท
        this.wizardStep = 1;
      } else if (this.wizardStep === 3) {
        // กลับไปขั้นตอนข้อมูลพื้นฐาน 
        this.wizardStep = 2;
      }
      // ไม่ล้างข้อมูลเมื่อกลับ เพื่อให้ผู้ใช้สามารถแก้ไขได้
    },
    
    finishWizard() {
      if (!this.wizardContentTitle.trim()) {
        alert('กรุณากรอกชื่อเนื้อหา');
        return;
      }
      
      const config = this.selectedContentTypeConfig;
      if (!config) {
        alert('กรุณาเลือกประเภทเนื้อหา');
        return;
      }
      
      // Apply wizard data to form
      this.localTitle = this.wizardContentTitle.trim();
      
      // Handle slug generation based on content type
      if (config.autoSlug) {
        // Auto-generate slug for layout and navigation types
        this.localSlug = this.slugify(this.wizardContentTitle.trim());
        console.log('Auto-generated slug for', config.name, ':', this.localSlug);
      } else {
        // Use user-provided slug
        this.localSlug = this.wizardContentSlug.trim();
      }
      
      this.localContentType = this.wizardSelectedType;
      
      // Apply SEO data only if not skipping SEO
      if (!config.skipSeo) {
        this.localSeoTitle = this.wizardSeoTitle.trim();
        this.localSeoDescription = this.wizardSeoDescription.trim() || this.wizardContentDescription.trim();
        
        // Apply wizard keywords to local keywords
        if (this.wizardSeoKeywords.length > 0) {
          this.localSeoKeywords = [...this.wizardSeoKeywords];
          console.log('Applied wizard keywords to local form:', this.localSeoKeywords);
        }
      } else {
        // For layout/navigation types, use basic SEO data derived from title
        this.localSeoTitle = this.wizardContentTitle.trim();
        this.localSeoDescription = this.wizardContentDescription.trim() || '';
        console.log('Applied basic SEO for content type:', config.name);
      }
      
      // Apply default settings from configuration
      if (config.defaultSettings) {
        if (config.defaultSettings.display) {
          this.localDisplay = config.defaultSettings.display;
        }
        if (config.defaultSettings.action) {
          this.localAction = config.defaultSettings.action;
        }
        if (config.defaultSettings.destination) {
          this.localDestination = config.defaultSettings.destination;
        }
        
        // Apply boolean settings
        this.localIsComment = config.defaultSettings.isComment || false;
        this.localIsCounter = config.defaultSettings.isCounter || false;
        this.localIsMenu = config.defaultSettings.isMenu || false;
      }
      
      // Emit updates to parent
      this.$emit('update:title', this.localTitle);
      this.$emit('update:slug', this.localSlug);
      this.$emit('update:contentType', this.localContentType);
      this.$emit('update:display', this.localDisplay);
      this.$emit('update:isComment', this.localIsComment);
      this.$emit('update:isCounter', this.localIsCounter);
      this.$emit('update:isMenu', this.localIsMenu);
      this.$emit('update:action', this.localAction);
      this.$emit('update:destination', this.localDestination);
      this.$emit('update:seoTitle', this.localSeoTitle);
      this.$emit('update:seoDescription', this.localSeoDescription);
      
      // Emit SEO keywords - always send the complete array
      console.log('Sending keywords to parent:', this.localSeoKeywords);
      this.$emit('update:seoKeywords', this.localSeoKeywords);
      
      // Also emit individual addKeyword events for backward compatibility
      if (this.wizardSeoKeywords.length > 0) {
        this.wizardSeoKeywords.forEach(keyword => {
          this.$emit('addKeyword', keyword);
        });
      }
      
      // Close wizard
      this.showContentWizard = false;
      
      console.log('Wizard completed with configuration:', {
        type: this.wizardSelectedType,
        title: this.localTitle,
        slug: this.localSlug,
        description: this.wizardContentDescription,
        seoTitle: this.localSeoTitle,
        seoDescription: this.localSeoDescription,
        keywords: this.wizardSeoKeywords,
        settings: config.defaultSettings
      });
    },
    
    cancelWizard() {
      this.showContentWizard = false;
      // Don't reset data, just close wizard
    },
    
    minimizeWizard() {
      this.isWizardMinimized = !this.isWizardMinimized;
    },
    
    reopenWizard() {
      this.showContentWizard = true;
      this.isWizardMinimized = false;
      // Reset wizard to step 1
      this.wizardStep = 1;
      this.wizardSelectedType = '';
      this.wizardContentTitle = '';
      this.wizardContentSlug = '';
      this.wizardContentDescription = '';
      this.wizardSeoTitle = '';
      this.wizardSeoDescription = '';
      this.wizardSeoKeywords = [];
      this.wizardNewKeyword = '';
    },
    
    // SEO Keywords management for wizard
    addWizardKeyword() {
      if (this.wizardNewKeyword && this.wizardNewKeyword.trim() && !this.wizardSeoKeywords.includes(this.wizardNewKeyword.trim())) {
        this.wizardSeoKeywords.push(this.wizardNewKeyword.trim());
        this.wizardNewKeyword = '';
        console.log('Added wizard keyword, current keywords:', this.wizardSeoKeywords);
      }
    },
    
    removeWizardKeyword(index) {
      this.wizardSeoKeywords.splice(index, 1);
    },
    
    // Main form keyword management
    addMainKeyword() {
      if (this.newKeyword && this.newKeyword.trim() && !this.localSeoKeywords.includes(this.newKeyword.trim())) {
        this.localSeoKeywords.push(this.newKeyword.trim());
        this.$emit('addKeyword', this.newKeyword.trim());
        this.$emit('update:seoKeywords', this.localSeoKeywords);
        this.newKeyword = '';
        console.log('Added main form keyword, current keywords:', this.localSeoKeywords);
      }
    },
    
    removeMainKeyword(index) {
      if (index >= 0 && index < this.localSeoKeywords.length) {
        this.localSeoKeywords.splice(index, 1);
        this.$emit('removeKeyword', index);
        this.$emit('update:seoKeywords', this.localSeoKeywords);
        console.log('Removed main form keyword, current keywords:', this.localSeoKeywords);
      }
    },
    
    // Auto-fill based on content type
    autoFillByContentType(typeCode) {
      const config = this.contentTypeOptions.find(option => option.code === typeCode);
      if (!config) return;
      
      console.log('Auto-filling for content type:', typeCode);
      
      // Apply default settings
      if (config.defaultSettings) {
        Object.keys(config.defaultSettings).forEach(key => {
          const localPropertyName = `local${key.charAt(0).toUpperCase()}${key.slice(1)}`;
          if (Object.prototype.hasOwnProperty.call(this, localPropertyName)) {
            this[localPropertyName] = config.defaultSettings[key];
          }
        });
      }
    }
  },
  emits: [
    'update:title',
    'onTitleInput',
    'onTitleBlur',
    'edit:slug',
    'update:slug',
    'updateSlug',
    'validateSlugSilently',
    'update:contentType',
    'update:display',
    'update:isComment',
    'update:isCounter',
    'update:isMenu',
    'openSEOFileBrowser',
    'update:seoTitle',
    'update:seoDescription',
    'update:seoKeywords',
    'removeKeyword',
    'addKeyword',
    'update:action',
    'update:destination',
    'update:next',
    'update:customFields',
    'update:customData',
    'openCustomImageBrowser',
    'wizardCompleted',
    'initializeContent'
  ],
  
  mounted() {
    // Initialize wizard for new content
    this.$nextTick(() => {
      this.initializeWizard();
    });
  },
  
  beforeUnmount() {
    // Clean up timer
    if (this.slugValidationTimer) {
      clearTimeout(this.slugValidationTimer);
    }
  }
}
</script>