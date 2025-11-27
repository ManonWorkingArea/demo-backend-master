<template>

    <div class="my-5">
      <!-- Row 1 (Theme Selection) -->
      <div class="flex flex-col md:flex-row border-b">
        <div class="w-full p-2">
          <!-- Theme Selection Section -->
          <header class="bg-white shadow p-5">
            <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 class="text-lg font-bold">เลือกธีม</h1>
                <p class="mt-2 text-gray-600">เลือกรูปแบบธีมสำหรับหน้าเว็บของคุณ</p>
              </div>
              <div class="flex flex-col sm:flex-row gap-2 lg:flex-shrink-0">
                <button 
                  @click="saveConfiguration"
                  class="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition ease-in-out duration-150"
                >
                  บันทึกการตั้งค่า
                </button>
              </div>
            </div>
            <div class="mt-4">
              <span class="block text-sm font-medium text-gray-700 mb-4">เลือกธีมที่ต้องการ:</span>
              
              <!-- Theme Selection Grid -->
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                <!-- Builder Theme -->
                <div class="theme-option" :class="{ 'selected': selectedTheme === 'builder' }" @click="selectedTheme = 'builder'">
                  <div class="theme-preview-container">
                    <div class="theme-preview builder-preview">
                      <div class="preview-header">
                        <div class="preview-nav-dots">
                          <div class="dot"></div>
                          <div class="dot"></div>
                          <div class="dot"></div>
                        </div>
                      </div>
                      <div class="preview-content">
                        <div class="builder-blocks">
                          <div class="block header-block"></div>
                          <div class="block content-block"></div>
                          <div class="block footer-block"></div>
                        </div>
                        <div class="builder-sidebar">
                          <div class="sidebar-item"></div>
                          <div class="sidebar-item"></div>
                          <div class="sidebar-item"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="theme-info">
                    <div class="flex items-center">
                      <input type="radio" class="form-radio mr-2" name="themeSelection" value="builder" v-model="selectedTheme">
                      <div>
                        <h4 class="font-semibold text-gray-900">Builder Theme</h4>
                        <p class="text-sm text-gray-500">ธีมแบบสร้างเองด้วย Page Builder</p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Built-in Default Theme -->
                <div class="theme-option" :class="{ 'selected': selectedTheme === 'built-in' && selectedBuiltInTheme === 'default' }" @click="selectBuiltInTheme('default')">
                  <div class="theme-preview-container">
                    <div class="theme-preview default-preview">
                      <div class="preview-header">
                        <div class="preview-nav-dots">
                          <div class="dot"></div>
                          <div class="dot"></div>
                          <div class="dot"></div>
                        </div>
                      </div>
                      <div class="preview-content">
                        <div class="default-layout">
                          <div class="nav-bar"></div>
                          <div class="hero-section"></div>
                          <div class="content-grid">
                            <div class="grid-item"></div>
                            <div class="grid-item"></div>
                            <div class="grid-item"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="theme-info">
                    <div class="flex items-center">
                      <input type="radio" class="form-radio mr-2" name="themeSelection" value="built-in-default" :checked="selectedTheme === 'built-in' && selectedBuiltInTheme === 'default'" @change="selectBuiltInTheme('default')">
                      <div>
                        <h4 class="font-semibold text-gray-900">Default Theme</h4>
                        <p class="text-sm text-gray-500">ธีมพื้นฐานแบบคลาสสิก</p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Built-in Netflix Theme -->
                <div class="theme-option" :class="{ 'selected': selectedTheme === 'built-in' && selectedBuiltInTheme === 'netflix' }" @click="selectBuiltInTheme('netflix')">
                  <div class="theme-preview-container">
                    <div class="theme-preview netflix-preview">
                      <div class="preview-header">
                        <div class="preview-nav-dots">
                          <div class="dot"></div>
                          <div class="dot"></div>
                          <div class="dot"></div>
                        </div>
                      </div>
                      <div class="preview-content">
                        <div class="netflix-layout">
                          <div class="netflix-hero"></div>
                          <div class="netflix-rows">
                            <div class="content-row">
                              <div class="row-items">
                                <div class="movie-card"></div>
                                <div class="movie-card"></div>
                                <div class="movie-card"></div>
                                <div class="movie-card"></div>
                              </div>
                            </div>
                            <div class="content-row">
                              <div class="row-items">
                                <div class="movie-card"></div>
                                <div class="movie-card"></div>
                                <div class="movie-card"></div>
                                <div class="movie-card"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="theme-info">
                    <div class="flex items-center">
                      <input type="radio" class="form-radio mr-2" name="themeSelection" value="built-in-netflix" :checked="selectedTheme === 'built-in' && selectedBuiltInTheme === 'netflix'" @change="selectBuiltInTheme('netflix')">
                      <div>
                        <h4 class="font-semibold text-gray-900">Netflix Style</h4>
                        <p class="text-sm text-gray-500">ธีมสไตล์ Netflix สำหรับ Video Content</p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Built-in Corporate Theme -->
                <div class="theme-option" :class="{ 'selected': selectedTheme === 'built-in' && selectedBuiltInTheme === 'corporate' }" @click="selectBuiltInTheme('corporate')">
                  <div class="theme-preview-container">
                    <div class="theme-preview corporate-preview">
                      <div class="preview-header">
                        <div class="preview-nav-dots">
                          <div class="dot"></div>
                          <div class="dot"></div>
                          <div class="dot"></div>
                        </div>
                      </div>
                      <div class="preview-content">
                        <div class="corporate-layout">
                          <div class="corporate-header">
                            <div class="logo-area"></div>
                            <div class="nav-menu">
                              <div class="nav-item"></div>
                              <div class="nav-item"></div>
                              <div class="nav-item"></div>
                            </div>
                          </div>
                          <div class="corporate-banner"></div>
                          <div class="corporate-content">
                            <div class="content-column">
                              <div class="text-block"></div>
                              <div class="text-block short"></div>
                            </div>
                            <div class="sidebar-column">
                              <div class="sidebar-widget"></div>
                              <div class="sidebar-widget"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="theme-info">
                    <div class="flex items-center">
                      <input type="radio" class="form-radio mr-2" name="themeSelection" value="built-in-corporate" :checked="selectedTheme === 'built-in' && selectedBuiltInTheme === 'corporate'" @change="selectBuiltInTheme('corporate')">
                      <div>
                        <h4 class="font-semibold text-gray-900">Corporate</h4>
                        <p class="text-sm text-gray-500">ธีมองค์กรสำหรับเว็บไซต์บริษัท</p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Clustersie.org Theme -->
                <div class="theme-option" :class="{ 'selected': selectedTheme === 'clustersie' }" @click="selectedTheme = 'clustersie'">
                  <div class="theme-preview-container">
                    <div class="theme-preview clustersie-preview">
                      <div class="preview-header">
                        <div class="preview-nav-dots">
                          <div class="dot"></div>
                          <div class="dot"></div>
                          <div class="dot"></div>
                        </div>
                      </div>
                      <div class="preview-content">
                        <div class="clustersie-layout">
                          <div class="clustersie-header">
                            <div class="clustersie-logo">C</div>
                            <div class="clustersie-nav">
                              <div class="nav-dot"></div>
                              <div class="nav-dot"></div>
                              <div class="nav-dot"></div>
                            </div>
                          </div>
                          <div class="clustersie-hero">
                            <div class="hero-content">
                              <div class="hero-title"></div>
                              <div class="hero-subtitle"></div>
                            </div>
                          </div>
                          <div class="clustersie-grid">
                            <div class="grid-card orange"></div>
                            <div class="grid-card green"></div>
                            <div class="grid-card blue"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="theme-info">
                    <div class="flex items-center">
                      <input type="radio" class="form-radio mr-2" name="themeSelection" value="clustersie" v-model="selectedTheme">
                      <div>
                        <h4 class="font-semibold text-gray-900">Clustersie.org</h4>
                        <p class="text-sm text-gray-500">ธีมสำหรับเครือข่าย Clustersie</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Clustersie Subdomain Selection (Only visible when clustersie theme is selected) -->
                <div v-if="selectedTheme === 'clustersie'" class="col-span-full mt-4">
                  <div class="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <h5 class="text-sm font-medium text-orange-800 mb-3">เลือกโดเมนย่อย Clustersie.org:</h5>
                    <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                      
                      <!-- Main -->
                      <div class="clustersie-subdomain-option" :class="{ 'selected': selectedClustersieSubdomain === 'main' }" @click="selectedClustersieSubdomain = 'main'">
                        <div class="subdomain-preview main-preview">
                          <div class="preview-icon">M</div>
                          <div class="preview-name">Main</div>
                        </div>
                        <label class="flex items-center mt-2">
                          <input type="radio" class="form-radio mr-2" name="clustersieSubdomain" value="main" v-model="selectedClustersieSubdomain">
                          <span class="text-xs font-medium">main.clustersie.org</span>
                        </label>
                      </div>

                      <!-- Coffee -->
                      <div class="clustersie-subdomain-option" :class="{ 'selected': selectedClustersieSubdomain === 'coffee' }" @click="selectedClustersieSubdomain = 'coffee'">
                        <div class="subdomain-preview coffee-preview">
                          <div class="preview-icon">☕</div>
                          <div class="preview-name">Coffee</div>
                        </div>
                        <label class="flex items-center mt-2">
                          <input type="radio" class="form-radio mr-2" name="clustersieSubdomain" value="coffee" v-model="selectedClustersieSubdomain">
                          <span class="text-xs font-medium">coffee.clustersie.org</span>
                        </label>
                      </div>

                      <!-- Fisheries -->
                      <div class="clustersie-subdomain-option" :class="{ 'selected': selectedClustersieSubdomain === 'fisheries' }" @click="selectedClustersieSubdomain = 'fisheries'">
                        <div class="subdomain-preview fisheries-preview">
                          <div class="preview-icon">🐟</div>
                          <div class="preview-name">Fisheries</div>
                        </div>
                        <label class="flex items-center mt-2">
                          <input type="radio" class="form-radio mr-2" name="clustersieSubdomain" value="fisheries" v-model="selectedClustersieSubdomain">
                          <span class="text-xs font-medium">fisheries.clustersie.org</span>
                        </label>
                      </div>

                      <!-- Fruit -->
                      <div class="clustersie-subdomain-option" :class="{ 'selected': selectedClustersieSubdomain === 'fruit' }" @click="selectedClustersieSubdomain = 'fruit'">
                        <div class="subdomain-preview fruit-preview">
                          <div class="preview-icon">🍎</div>
                          <div class="preview-name">Fruit</div>
                        </div>
                        <label class="flex items-center mt-2">
                          <input type="radio" class="form-radio mr-2" name="clustersieSubdomain" value="fruit" v-model="selectedClustersieSubdomain">
                          <span class="text-xs font-medium">fruit.clustersie.org</span>
                        </label>
                      </div>

                      <!-- Bittermelon -->
                      <div class="clustersie-subdomain-option" :class="{ 'selected': selectedClustersieSubdomain === 'bittermelon' }" @click="selectedClustersieSubdomain = 'bittermelon'">
                        <div class="subdomain-preview bittermelon-preview">
                          <div class="preview-icon">🥒</div>
                          <div class="preview-name">Bittermelon</div>
                        </div>
                        <label class="flex items-center mt-2">
                          <input type="radio" class="form-radio mr-2" name="clustersieSubdomain" value="bittermelon" v-model="selectedClustersieSubdomain">
                          <span class="text-xs font-medium">bittermelon.clustersie.org</span>
                        </label>
                      </div>

                      <!-- Halal -->
                      <div class="clustersie-subdomain-option" :class="{ 'selected': selectedClustersieSubdomain === 'halal' }" @click="selectedClustersieSubdomain = 'halal'">
                        <div class="subdomain-preview halal-preview">
                          <div class="preview-icon">🌙</div>
                          <div class="preview-name">Halal</div>
                        </div>
                        <label class="flex items-center mt-2">
                          <input type="radio" class="form-radio mr-2" name="clustersieSubdomain" value="halal" v-model="selectedClustersieSubdomain">
                          <span class="text-xs font-medium">halal.clustersie.org</span>
                        </label>
                      </div>

                      <!-- Mulberry -->
                      <div class="clustersie-subdomain-option" :class="{ 'selected': selectedClustersieSubdomain === 'mulberry' }" @click="selectedClustersieSubdomain = 'mulberry'">
                        <div class="subdomain-preview mulberry-preview">
                          <div class="preview-icon">🍇</div>
                          <div class="preview-name">Mulberry</div>
                        </div>
                        <label class="flex items-center mt-2">
                          <input type="radio" class="form-radio mr-2" name="clustersieSubdomain" value="mulberry" v-model="selectedClustersieSubdomain">
                          <span class="text-xs font-medium">mulberry.clustersie.org</span>
                        </label>
                      </div>

                    </div>
                  </div>
                </div>
                
              </div>
            </div>
          </header>
        </div>
      </div>

      <!-- Row 2 (Login Config) -->
      <div class="flex flex-col md:flex-row border-b mt-6">
        <div class="w-full p-2">
          <!-- Login Config Section -->
          <header class="bg-white shadow p-5">
            <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 class="text-lg font-bold">การตั้งค่าการเข้าสู่ระบบ</h1>
                <p class="mt-2 text-gray-600">เลือกวิธีการเข้าสู่ระบบที่ต้องการเปิดใช้งาน</p>
              </div>
              <div class="flex flex-col sm:flex-row gap-2 lg:flex-shrink-0">
                <button 
                  @click="saveLoginConfiguration"
                  class="px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition ease-in-out duration-150"
                >
                  บันทึกการตั้งค่า
                </button>
                <button 
                  @click="resetLoginConfiguration"
                  class="px-4 py-2 bg-gray-600 text-white font-semibold rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition ease-in-out duration-150"
                >
                  รีเซ็ต
                </button>
              </div>
            </div>
            <div class="mt-4">
              <span class="block text-sm font-medium text-gray-700 mb-3">วิธีการเข้าสู่ระบบที่เปิดใช้งาน:</span>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Microsoft Office 365 -->
                <div class="border rounded-lg p-4 hover:bg-gray-50">
                  <label class="flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      v-model="loginConfig.microsoftOffice365"
                      class="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                    >
                    <div class="ml-3 flex-1">
                      <div class="flex items-center justify-between">
                        <div>
                          <span class="text-sm font-medium text-gray-900">Microsoft Office 365</span>
                          <p class="text-sm text-gray-500">เข้าสู่ระบบด้วยบัญชี Microsoft Office 365</p>
                        </div>
                        <button 
                          @click.stop="$refs.loginHelper.showMicrosoftHelp(session.current.hostname)"
                          class="ml-2 p-1 text-gray-400 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full transition-colors"
                          title="คำแนะนำการตั้งค่า Microsoft Office 365"
                        >
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </label>
                  
                  <!-- Microsoft Office 365 Configuration List -->
                  <div v-if="loginConfig.microsoftOffice365" class="mt-4">
                    <div class="flex items-center justify-between mb-3">
                      <h4 class="text-sm font-medium text-blue-800">การตั้งค่า Microsoft Office 365</h4>
                      <div class="flex items-center space-x-2">
                        <button 
                          @click="addMicrosoftConfig"
                          class="px-3 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ease-in-out duration-150"
                        >
                          เพิ่มการตั้งค่า
                        </button>
                        <button
                          @click="openButtonModal(['microsoft'])"
                          class="px-3 py-1 text-xs bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition ease-in-out duration-150 flex items-center space-x-1"
                        >
                          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"></path>
                          </svg>
                          <span>ปรับแต่งปุ่ม</span>
                        </button>
                      </div>
                    </div>
                    
                    <!-- List of Microsoft Configurations -->
                    <div v-if="microsoftConfigs.length === 0" class="text-sm text-gray-500 text-center py-4 border-2 border-dashed border-gray-300 rounded-md">
                      ยังไม่มีการตั้งค่า Microsoft Office 365
                    </div>
                    
                    <div v-for="(config, index) in microsoftConfigs" :key="index" class="mb-4 bg-gray-50 border border-gray-200 rounded-md">
                      <div class="p-4">
                        <div class="flex items-center justify-between">
                          <div class="flex items-center space-x-3 flex-1">
                            <label class="inline-flex items-center">
                              <input 
                                type="radio" 
                                :value="index" 
                                v-model="selectedMicrosoftConfigIndex"
                                class="form-radio h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                              >
                              <span class="ml-2 text-sm font-medium text-blue-800">
                                {{ config.name || `การตั้งค่า ${index + 1}` }}
                              </span>
                            </label>
                            <span v-if="selectedMicrosoftConfigIndex === index" class="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                              กำลังใช้งาน
                            </span>
                          </div>
                          <div class="flex items-center space-x-2">
                            <button 
                              @click="testMicrosoftConnection(index)"
                              :disabled="!isMicrosoftConfigValid(config)"
                              class="px-2 py-1 text-xs bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition ease-in-out duration-150"
                            >
                              ทดสอบ
                            </button>
                            <button 
                              @click="removeMicrosoftConfig(index)"
                              class="px-2 py-1 text-xs bg-red-600 text-white rounded-md hover:bg-red-700 transition ease-in-out duration-150"
                            >
                              ลบ
                            </button>
                            <button 
                              @click="toggleConfigAccordion('microsoft', index)"
                              class="p-1 text-gray-400 hover:text-gray-600 focus:outline-none rounded-full transition-colors"
                              title="แสดง/ซ่อนรายละเอียดการตั้งค่า"
                            >
                              <svg class="w-4 h-4 transform transition-transform" :class="{ 'rotate-180': config.showAccordion }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <div v-if="config.showAccordion" class="px-4 pt-4 pb-4 space-y-4 border-t bg-white">
                        <!-- Config Name -->
                        <div>
                          <label class="block text-xs font-medium text-gray-700 mb-1">ชื่อการตั้งค่า</label>
                          <input 
                            type="text" 
                            v-model="config.name"
                            placeholder="เช่น Production, Development, Testing"
                            class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                        </div>
                        
                        <!-- Client ID -->
                        <div>
                          <label class="block text-xs font-medium text-gray-700 mb-1">Client ID</label>
                          <input 
                            type="text" 
                            v-model="config.clientId"
                            placeholder="ใส่ Microsoft Client ID"
                            class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                        </div>
                        
                        <!-- Client Secret -->
                        <div>
                          <label class="block text-xs font-medium text-gray-700 mb-1">Client Secret</label>
                          <input 
                            type="password" 
                            v-model="config.clientSecret"
                            placeholder="ใส่ Microsoft Client Secret"
                            class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                        </div>
                        
                        <!-- Tenant ID -->
                        <div>
                          <label class="block text-xs font-medium text-gray-700 mb-1">Tenant ID</label>
                          <input 
                            type="text" 
                            v-model="config.tenantId"
                            placeholder="ใส่ Microsoft Tenant ID"
                            class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                        </div>
                        
                        <!-- Authority -->
                        <div>
                          <label class="block text-xs font-medium text-gray-700 mb-1">Authority</label>
                          <input 
                            type="text" 
                            v-model="config.authority"
                            placeholder="เช่น https://login.microsoftonline.com/common"
                            class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                        </div>
                        
                        <!-- Redirect URI -->
                        <div>
                          <label class="block text-xs font-medium text-gray-700 mb-1">Redirect URI</label>
                          <div class="relative">
                            <input 
                              type="url" 
                              v-model="config.redirectUri"
                              :placeholder="`เช่น https://${session.current.hostname}/user/authen/microsoft/callback`"
                              class="w-full px-3 py-2 pr-20 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                            <button 
                              @click="copyToClipboard(config.redirectUri, 'Microsoft Redirect URI')"
                              class="absolute inset-y-0 right-0 px-3 py-2 text-xs text-gray-500 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset transition-colors"
                              title="คัดลอก URL"
                            >
                              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Google GSuit -->
                <div class="border rounded-lg p-4 hover:bg-gray-50">
                  <label class="flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      v-model="loginConfig.googleGSuit"
                      class="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                    >
                    <div class="ml-3 flex-1">
                      <div class="flex items-center justify-between">
                        <div>
                          <span class="text-sm font-medium text-gray-900">Google GSuit</span>
                          <p class="text-sm text-gray-500">เข้าสู่ระบบด้วยบัญชี Google GSuit</p>
                        </div>
                        <button 
                          @click.stop="$refs.loginHelper.showGoogleHelp(session.current.hostname)"
                          class="ml-2 p-1 text-gray-400 hover:text-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 rounded-full transition-colors"
                          title="คำแนะนำการตั้งค่า Google GSuit"
                        >
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </label>
                  
                  <!-- Google GSuit Configuration List -->
                  <div v-if="loginConfig.googleGSuit" class="mt-4">
                    <div class="flex items-center justify-between mb-3">
                      <h4 class="text-sm font-medium text-green-800">การตั้งค่า Google GSuit</h4>
                      <div class="flex items-center space-x-2">
                        <button 
                          @click="addGoogleConfig"
                          class="px-3 py-1 text-xs bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition ease-in-out duration-150"
                        >
                          เพิ่มการตั้งค่า
                        </button>
                        <button
                          @click="openButtonModal(['google'])"
                          class="px-3 py-1 text-xs bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition ease-in-out duration-150 flex items-center space-x-1"
                        >
                          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"></path>
                          </svg>
                          <span>ปรับแต่งปุ่ม</span>
                        </button>
                      </div>
                    </div>
                    
                    <div v-if="googleConfigs.length === 0" class="text-sm text-gray-500 text-center py-4 border-2 border-dashed border-gray-300 rounded-md">
                      ยังไม่มีการตั้งค่า Google GSuit
                    </div>
                    
                    <div v-for="(config, index) in googleConfigs" :key="index" class="mb-4 bg-gray-50 border border-gray-200 rounded-md">
                      <div class="p-4">
                        <div class="flex items-center justify-between">
                          <div class="flex items-center space-x-3 flex-1">
                            <label class="inline-flex items-center">
                              <input 
                                type="radio" 
                                :value="index" 
                                v-model="selectedGoogleConfigIndex"
                                class="form-radio h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                              >
                              <span class="ml-2 text-sm font-medium text-green-800">
                                {{ config.name || `การตั้งค่า ${index + 1}` }}
                              </span>
                            </label>
                            <span v-if="selectedGoogleConfigIndex === index" class="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                              กำลังใช้งาน
                            </span>
                          </div>
                          <div class="flex items-center space-x-2">
                            <button 
                              @click="testGoogleConnection(index)"
                              :disabled="!isGoogleConfigValid(config)"
                              class="px-2 py-1 text-xs bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition ease-in-out duration-150"
                            >
                              ทดสอบ
                            </button>
                            <button 
                              @click="removeGoogleConfig(index)"
                              class="px-2 py-1 text-xs bg-red-600 text-white rounded-md hover:bg-red-700 transition ease-in-out duration-150"
                            >
                              ลบ
                            </button>
                            <button 
                              @click="toggleConfigAccordion('google', index)"
                              class="p-1 text-gray-400 hover:text-gray-600 focus:outline-none rounded-full transition-colors"
                              title="แสดง/ซ่อนรายละเอียดการตั้งค่า"
                            >
                              <svg class="w-4 h-4 transform transition-transform" :class="{ 'rotate-180': config.showAccordion }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <!-- Collapsible config details -->
                      <div v-if="config.showAccordion" class="px-4 pt-4 pb-4 space-y-4 border-t bg-white">
                        <div>
                          <label class="block text-xs font-medium text-gray-700 mb-1">ชื่อการตั้งค่า</label>
                          <input 
                            type="text" 
                            v-model="config.name"
                            placeholder="เช่น Production, Development, Testing"
                            class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          >
                        </div>
                        <div>
                          <label class="block text-xs font-medium text-gray-700 mb-1">Client ID</label>
                          <input 
                            type="text" 
                            v-model="config.clientId"
                            placeholder="ใส่ Google Client ID"
                            class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          >
                        </div>
                        <div>
                          <label class="block text-xs font-medium text-gray-700 mb-1">Client Secret</label>
                          <input 
                            type="password" 
                            v-model="config.clientSecret"
                            placeholder="ใส่ Google Client Secret"
                            class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          >
                        </div>
                        <div>
                          <label class="block text-xs font-medium text-gray-700 mb-1">Redirect URI</label>
                          <div class="relative">
                            <input 
                              type="url" 
                              v-model="config.redirectUri"
                              :placeholder="`เช่น https://${session.current.hostname}/user/authen/google/callback`"
                              class="w-full px-3 py-2 pr-20 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            >
                            <button 
                              @click="copyToClipboard(config.redirectUri, 'Google Redirect URI')"
                              class="absolute inset-y-0 right-0 px-3 py-2 text-xs text-gray-500 hover:text-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-inset transition-colors"
                              title="คัดลอก URL"
                            >
                              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                              </svg>
                            </button>
                          </div>
                        </div>
                        <div>
                          <label class="block text-xs font-medium text-gray-700 mb-1">Hosted Domain (เลือกได้)</label>
                          <input 
                            type="text" 
                            v-model="config.hostedDomain"
                            placeholder="เช่น company.com (สำหรับ GSuit)"
                            class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          >
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Facebook Login -->
                <div class="border rounded-lg p-4 hover:bg-gray-50">
                  <label class="flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      v-model="loginConfig.facebookLogin"
                      class="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                    >
                    <div class="ml-3 flex-1">
                      <div class="flex items-center justify-between">
                        <div>
                          <span class="text-sm font-medium text-gray-900">Facebook Login</span>
                          <p class="text-sm text-gray-500">เข้าสู่ระบบด้วยบัญชี Facebook</p>
                        </div>
                        <button 
                          @click.stop="$refs.loginHelper.showFacebookHelp(session.current.hostname)"
                          class="ml-2 p-1 text-gray-400 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-full transition-colors"
                          title="คำแนะนำการตั้งค่า Facebook Login"
                        >
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </label>
                  
                  <!-- Facebook Configuration List -->
                  <div v-if="loginConfig.facebookLogin" class="mt-4">
                    <div class="flex items-center justify-between mb-3">
                      <h4 class="text-sm font-medium text-blue-800">การตั้งค่า Facebook Login</h4>
                      <div class="flex items-center space-x-2">
                        <button 
                          @click="addFacebookConfig"
                          class="px-3 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ease-in-out duration-150"
                        >
                          เพิ่มการตั้งค่า
                        </button>
                        <button
                          @click="openButtonModal(['facebook'])"
                          class="px-3 py-1 text-xs bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition ease-in-out duration-150 flex items-center space-x-1"
                        >
                          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"></path>
                          </svg>
                          <span>ปรับแต่งปุ่ม</span>
                        </button>
                      </div>
                    </div>
                    
                    <div v-if="facebookConfigs.length === 0" class="text-sm text-gray-500 text-center py-4 border-2 border-dashed border-gray-300 rounded-md">
                      ยังไม่มีการตั้งค่า Facebook Login
                    </div>
                    
                    <div v-for="(config, index) in facebookConfigs" :key="index" class="mb-4 bg-gray-50 border border-gray-200 rounded-md">
                      <div class="p-4">
                        <div class="flex items-center justify-between">
                          <div class="flex items-center space-x-3 flex-1">
                            <label class="inline-flex items-center">
                              <input 
                                type="radio" 
                                :value="index" 
                                v-model="selectedFacebookConfigIndex"
                                class="form-radio h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                              >
                              <span class="ml-2 text-sm font-medium text-indigo-800">
                                {{ config.name || `การตั้งค่า ${index + 1}` }}
                              </span>
                            </label>
                            <span v-if="selectedFacebookConfigIndex === index" class="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                              กำลังใช้งาน
                            </span>
                          </div>
                          <div class="flex items-center space-x-2">
                            <button 
                              @click="testFacebookConnection(index)"
                              :disabled="!isFacebookConfigValid(config)"
                              class="px-2 py-1 text-xs bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition ease-in-out duration-150"
                            >
                              ทดสอบ
                            </button>
                            <button 
                              @click="removeFacebookConfig(index)"
                              class="px-2 py-1 text-xs bg-red-600 text-white rounded-md hover:bg-red-700 transition ease-in-out duration-150"
                            >
                              ลบ
                            </button>
                            <button 
                              @click="toggleConfigAccordion('facebook', index)"
                              class="p-1 text-gray-400 hover:text-gray-600 focus:outline-none rounded-full transition-colors"
                              title="แสดง/ซ่อนรายละเอียดการตั้งค่า"
                            >
                              <svg class="w-4 h-4 transform transition-transform" :class="{ 'rotate-180': config.showAccordion }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <!-- Collapsible config details -->
                      <div v-if="config.showAccordion" class="px-4 pt-4 pb-4 space-y-4 border-t bg-white">
                        <div>
                          <label class="block text-xs font-medium text-gray-700 mb-1">ชื่อการตั้งค่า</label>
                          <input 
                            type="text" 
                            v-model="config.name"
                            placeholder="เช่น Production, Development, Testing"
                            class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          >
                        </div>
                        <div>
                          <label class="block text-xs font-medium text-gray-700 mb-1">App ID</label>
                          <input 
                            type="text" 
                            v-model="config.appId"
                            placeholder="ใส่ Facebook App ID"
                            class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          >
                        </div>
                        <div>
                          <label class="block text-xs font-medium text-gray-700 mb-1">App Secret</label>
                          <input 
                            type="password" 
                            v-model="config.appSecret"
                            placeholder="ใส่ Facebook App Secret"
                            class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          >
                        </div>
                        <div>
                          <label class="block text-xs font-medium text-gray-700 mb-1">Redirect URI</label>
                          <div class="relative">
                            <input 
                              type="url" 
                              v-model="config.redirectUri"
                              :placeholder="`เช่น https://${session.current.hostname}/user/authen/facebook/callback`"
                              class="w-full px-3 py-2 pr-20 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                            <button 
                              @click="copyToClipboard(config.redirectUri, 'Facebook Redirect URI')"
                              class="absolute inset-y-0 right-0 px-3 py-2 text-xs text-gray-500 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-inset transition-colors"
                              title="คัดลอก URL"
                            >
                              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Line -->
                <div class="border rounded-lg p-4 hover:bg-gray-50">
                  <label class="flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      v-model="loginConfig.line"
                      class="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                    >
                    <div class="ml-3 flex-1">
                      <div class="flex items-center justify-between">
                        <div>
                          <span class="text-sm font-medium text-gray-900">Line</span>
                          <p class="text-sm text-gray-500">เข้าสู่ระบบด้วยบัญชี Line</p>
                        </div>
                        <button 
                          @click.stop="$refs.loginHelper.showLineHelp(session.current.hostname)"
                          class="ml-2 p-1 text-gray-400 hover:text-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 rounded-full transition-colors"
                          title="คำแนะนำการตั้งค่า Line Login"
                        >
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </label>
                  
                  <!-- Line Configuration List -->
                  <div v-if="loginConfig.line" class="mt-4">
                    <div class="flex items-center justify-between mb-3">
                      <h4 class="text-sm font-medium text-green-800">การตั้งค่า Line Login</h4>
                      <div class="flex items-center space-x-2">
                        <button 
                          @click="addLineConfig"
                          class="px-3 py-1 text-xs bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition ease-in-out duration-150"
                        >
                          เพิ่มการตั้งค่า
                        </button>
                        <button
                          @click="openButtonModal(['line'])"
                          class="px-3 py-1 text-xs bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition ease-in-out duration-150 flex items-center space-x-1"
                        >
                          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"></path>
                          </svg>
                          <span>ปرับแต่งปุ่ม</span>
                        </button>
                      </div>
                    </div>
                    
                    <div v-if="lineConfigs.length === 0" class="text-sm text-gray-500 text-center py-4 border-2 border-dashed border-gray-300 rounded-md">
                      ยังไม่มีการตั้งค่า Line Login
                    </div>
                    
                    <div v-for="(config, index) in lineConfigs" :key="index" class="mb-4 bg-gray-50 border border-gray-200 rounded-md">
                      <div class="p-4">
                        <div class="flex items-center justify-between">
                          <div class="flex items-center space-x-3 flex-1">
                            <label class="inline-flex items-center">
                              <input 
                                type="radio" 
                                :value="index" 
                                v-model="selectedLineConfigIndex"
                                class="form-radio h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                              >
                              <span class="ml-2 text-sm font-medium text-green-800">
                                {{ config.name || `การตั้งค่า ${index + 1}` }}
                              </span>
                            </label>
                            <span v-if="selectedLineConfigIndex === index" class="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                              กำลังใช้งาน
                            </span>
                          </div>
                          <div class="flex items-center space-x-2">
                            <button 
                              @click="testLineConnection(index)"
                              :disabled="!isLineConfigValid(config)"
                              class="px-2 py-1 text-xs bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition ease-in-out duration-150"
                            >
                              ทดสอบ
                            </button>
                            <button 
                              @click="removeLineConfig(index)"
                              class="px-2 py-1 text-xs bg-red-600 text-white rounded-md hover:bg-red-700 transition ease-in-out duration-150"
                            >
                              ลบ
                            </button>
                            <button 
                              @click="toggleConfigAccordion('line', index)"
                              class="p-1 text-gray-400 hover:text-gray-600 focus:outline-none rounded-full transition-colors"
                              title="แสดง/ซ่อนรายละเอียดการตั้งค่า"
                            >
                              <svg class="w-4 h-4 transform transition-transform" :class="{ 'rotate-180': config.showAccordion }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <!-- Collapsible config details -->
                      <div v-if="config.showAccordion" class="px-4 pt-4 pb-4 space-y-4 border-t bg-white">
                        <div>
                          <label class="block text-xs font-medium text-gray-700 mb-1">ชื่อการตั้งค่า</label>
                          <input 
                            type="text" 
                            v-model="config.name"
                            placeholder="เช่น Production, Development, Testing"
                            class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          >
                        </div>
                        <div>
                          <label class="block text-xs font-medium text-gray-700 mb-1">Channel ID</label>
                          <input 
                            type="text" 
                            v-model="config.channelId"
                            placeholder="ใส่ Line Channel ID"
                            class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          >
                        </div>
                        <div>
                          <label class="block text-xs font-medium text-gray-700 mb-1">Channel Secret</label>
                          <input 
                            type="password" 
                            v-model="config.channelSecret"
                            placeholder="ใส่ Line Channel Secret"
                            class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          >
                        </div>
                        <div>
                          <label class="block text-xs font-medium text-gray-700 mb-1">Redirect URI</label>
                          <div class="relative">
                            <input 
                              type="url" 
                              v-model="config.redirectUri"
                              :placeholder="`เช่น https://${session.current.hostname}/user/authen/line/callback`"
                              class="w-full px-3 py-2 pr-20 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            >
                            <button 
                              @click="copyToClipboard(config.redirectUri, 'Line Redirect URI')"
                              class="absolute inset-y-0 right-0 px-3 py-2 text-xs text-gray-500 hover:text-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-inset transition-colors"
                              title="คัดลอก URL"
                            >
                              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                <!-- Clustersie.org -->
                <div class="border rounded-lg p-4 hover:bg-gray-50">
                  <label class="flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      v-model="loginConfig.clustersie"
                      class="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                    >
                    <div class="ml-3 flex-1">
                      <div class="flex items-center justify-between">
                        <div>
                          <span class="text-sm font-medium text-gray-900">Clustersie.org</span>
                          <p class="text-sm text-gray-500">เข้าสู่ระบบด้วยบัญชี Clustersie.org</p>
                        </div>
                        <button 
                          @click.stop="$refs.loginHelper.showClustersieHelp(session.current.hostname)"
                          class="ml-2 p-1 text-gray-400 hover:text-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 rounded-full transition-colors"
                          title="คำแนะนำการตั้งค่า Clustersie.org Login"
                        >
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </label>
                  
                  <!-- Clustersie Configuration List -->
                  <div v-if="loginConfig.clustersie" class="mt-4">
                    <div class="flex items-center justify-between mb-3">
                      <h4 class="text-sm font-medium text-orange-800">การตั้งค่า Clustersie.org Login</h4>
                      <div class="flex items-center space-x-2">
                        <button 
                          @click="addClustersieConfig"
                          class="px-3 py-1 text-xs bg-orange-600 text-white rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 transition ease-in-out duration-150"
                        >
                          เพิ่มการตั้งค่า
                        </button>
                        <button
                          @click="openButtonModal(['clustersie'])"
                          class="px-3 py-1 text-xs bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition ease-in-out duration-150 flex items-center space-x-1"
                        >
                          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"></path>
                          </svg>
                          <span>ปรับแต่งปุ่ม</span>
                        </button>
                      </div>
                    </div>
                    
                    <div v-if="clustersieConfigs.length === 0" class="text-sm text-gray-500 text-center py-4 border-2 border-dashed border-gray-300 rounded-md">
                      ยังไม่มีการตั้งค่า Clustersie.org Login
                    </div>
                    
                    <div v-for="(config, index) in clustersieConfigs" :key="index" class="mb-4 bg-gray-50 border border-gray-200 rounded-md">
                      <div class="p-4">
                        <div class="flex items-center justify-between">
                          <div class="flex items-center space-x-3 flex-1">
                            <label class="inline-flex items-center">
                              <input 
                                type="radio" 
                                :value="index" 
                                v-model="selectedClustersieConfigIndex"
                                class="form-radio h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300"
                              >
                              <span class="ml-2 text-sm font-medium text-orange-800">
                                {{ config.name || `การตั้งค่า ${index + 1}` }}
                              </span>
                            </label>
                            <span v-if="selectedClustersieConfigIndex === index" class="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                              กำลังใช้งาน
                            </span>
                          </div>
                          <div class="flex items-center space-x-2">
                            <button 
                              @click="testClustersieConnection(index)"
                              :disabled="!isClustersieConfigValid(config)"
                              class="px-2 py-1 text-xs bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition ease-in-out duration-150"
                            >
                              ทดสอบ
                            </button>
                            <button 
                              @click="removeClustersieConfig(index)"
                              class="px-2 py-1 text-xs bg-red-600 text-white rounded-md hover:bg-red-700 transition ease-in-out duration-150"
                            >
                              ลบ
                            </button>
                            <button 
                              @click="toggleConfigAccordion('clustersie', index)"
                              class="p-1 text-gray-400 hover:text-gray-600 focus:outline-none rounded-full transition-colors"
                              title="แสดง/ซ่อนรายละเอียดการตั้งค่า"
                            >
                              <svg class="w-4 h-4 transform transition-transform" :class="{ 'rotate-180': config.showAccordion }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <!-- Collapsible config details -->
                      <div v-if="config.showAccordion" class="px-4 pt-4 pb-4 space-y-4 border-t bg-white">
                        <div>
                          <label class="block text-xs font-medium text-gray-700 mb-1">ชื่อการตั้งค่า</label>
                          <input 
                            type="text" 
                            v-model="config.name"
                            placeholder="เช่น Production, Development, Testing"
                            class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          >
                        </div>
                        
                        <!-- Subdomain Selection -->
                        <div>
                          <label class="block text-xs font-medium text-gray-700 mb-1">เลือกโดเมนย่อย Clustersie.org</label>
                          <select 
                            v-model="config.subdomain"
                            class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          >
                            <option value="">เลือกโดเมนย่อย</option>
                            <option value="main">main.clustersie.org</option>
                            <option value="coffee">coffee.clustersie.org</option>
                            <option value="fisheries">fisheries.clustersie.org</option>
                            <option value="fruit">fruit.clustersie.org</option>
                            <option value="bittermelon">bittermelon.clustersie.org</option>
                            <option value="halal">halal.clustersie.org</option>
                            <option value="mulberry">mulberry.clustersie.org</option>
                          </select>
                        </div>
                        
                        <div>
                          <label class="block text-xs font-medium text-gray-700 mb-1">Client ID</label>
                          <input 
                            type="text" 
                            v-model="config.clientId"
                            placeholder="ใส่ Clustersie.org Client ID"
                            class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          >
                        </div>
                        <div>
                          <label class="block text-xs font-medium text-gray-700 mb-1">Client Secret</label>
                          <input 
                            type="password" 
                            v-model="config.clientSecret"
                            placeholder="ใส่ Clustersie.org Client Secret"
                            class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          >
                        </div>
                        <div>
                          <label class="block text-xs font-medium text-gray-700 mb-1">API URL</label>
                          <input 
                            type="url" 
                            v-model="config.apiUrl"
                            :placeholder="config.subdomain ? `https://${config.subdomain}.clustersie.org/api` : 'https://main.clustersie.org/api'"
                            class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          >
                        </div>
                        <div>
                          <label class="block text-xs font-medium text-gray-700 mb-1">Redirect URI</label>
                          <div class="relative">
                            <input 
                              type="url" 
                              v-model="config.redirectUri"
                              :placeholder="`เช่น https://${session.current.hostname}/user/authen/clustersie/callback`"
                              class="w-full px-3 py-2 pr-20 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            >
                            <button 
                              @click="copyToClipboard(config.redirectUri, 'Clustersie Redirect URI')"
                              class="absolute inset-y-0 right-0 px-3 py-2 text-xs text-gray-500 hover:text-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-inset transition-colors"
                              title="คัดลอก URL"
                            >
                              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>

              <!-- Selected Methods Summary & Button Customization -->
              <div v-if="hasSelectedLoginMethods" class="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                <div class="flex items-center justify-between">
                  <div>
                    <h4 class="text-sm font-medium text-blue-800">วิธีการเข้าสู่ระบบที่เลือก:</h4>
                    <ul class="mt-2 text-sm text-blue-700">
                      <li v-if="loginConfig.microsoftOffice365">• Microsoft Office 365</li>
                      <li v-if="loginConfig.googleGSuit">• Google GSuit</li>
                      <li v-if="loginConfig.facebookLogin">• Facebook Login</li>
                      <li v-if="loginConfig.line">• Line</li>
                      <li v-if="loginConfig.clustersie">• Clustersie.org</li>
                    </ul>
                  </div>
                  <div class="ml-4">
                    <button
                      @click="openButtonModal()"
                      class="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"></path>
                      </svg>
                      <span>ปรับแต่งปุ่มทั้งหมด</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </header>
        </div>
      </div>
  
      <!-- Removed Row 3 and 4 -->

    </div>

    <!-- Login Service Helper Component -->
    <LoginServiceHelper ref="loginHelper" />

    <!-- Button Customization Modal -->
    <LoginButtonModal
      :isOpen="isButtonModalOpen"
      :services="enabledServices"
      :defaultService="selectedService"
      :initialConfigs="buttonConfigs"
      @close="closeButtonModal"
      @save="saveButtonConfigs"
      @config-changed="handleModalConfigChange"
    />

  </template>
  
  <script>
  import storageManager from '@/plugins/storage';
  import LoginServiceHelper from '@/components/LoginServiceHelper.vue';
  import LoginButtonModal from './LoginButtonModal.vue';

  export default {
    name: 'Config',
    components: {
      LoginServiceHelper,
      LoginButtonModal
    },
    computed: {
      hasSelectedLoginMethods() {
        return this.loginConfig.microsoftOffice365 || 
               this.loginConfig.googleGSuit || 
               this.loginConfig.facebookLogin || 
               this.loginConfig.line ||
               this.loginConfig.clustersie;
      },

      enabledServices() {
        // If enabledServicesList is set (from specific service modal), use it
        if (this.enabledServicesList && this.enabledServicesList.length > 0) {
          return this.enabledServicesList;
        }
        
        // Otherwise, return all enabled services
        const services = [];
        if (this.loginConfig.microsoftOffice365) services.push('microsoft');
        if (this.loginConfig.googleGSuit) services.push('google');
        if (this.loginConfig.facebookLogin) services.push('facebook');
        if (this.loginConfig.line) services.push('line');
        if (this.loginConfig.clustersie) services.push('clustersie');
        return services;
      }
    },
    data() {
      const accessToken = storageManager.get('session', 'token');
      const session = storageManager.get('session');
      const configs = storageManager.get('configs');
      return {
        accessToken,
        session,
        configs,
        hostkey: this.$Key,
        selectedTheme: 'builder', // Default theme
        selectedBuiltInTheme: 'default', // Default for built-in theme
        selectedClustersieSubdomain: 'main', // Default for clustersie theme
        currentFullTheme: {}, // Added to store the full theme object
        
        // Login Configuration
        loginConfig: {
          microsoftOffice365: false,
          googleGSuit: false,
          facebookLogin: false,
          line: false,
          clustersie: false
        },
        currentFullLoginConfig: {}, // Store the full login config object
        
        // Microsoft Office 365 Configurations (Multiple)
        microsoftConfigs: [],
        selectedMicrosoftConfigIndex: 0,
        
        // Google GSuit Configurations (Multiple)
        googleConfigs: [],
        selectedGoogleConfigIndex: 0,
        
        // Facebook Configurations (Multiple)
        facebookConfigs: [],
        selectedFacebookConfigIndex: 0,
        
        // Line Configurations (Multiple)
        lineConfigs: [],
        selectedLineConfigIndex: 0,
        
        // Clustersie Configurations (Multiple)
        clustersieConfigs: [],
        selectedClustersieConfigIndex: 0,
        
        // Modal state
        isButtonModalOpen: false,
        buttonConfigs: {},
        selectedService: '',
        enabledServicesList: [],
        
        // Timeout for debouncing button config saves
        saveButtonTimeout: null
      };
    },
    methods: {
      async fetchThemeSettings() {
        if (!this.session || !this.session.current || !this.session.current._id) {
          console.error('Session data is not available.');
          this.$swal({
              toast: true,
              position: 'bottom-end',
              showConfirmButton: false,
              timer: 3000,
              icon: 'error',
              title: 'ข้อผิดพลาด',
              text: 'ไม่สามารถโหลดข้อมูลผู้ใช้ได้',
            });
          return;
        }
        try {
          console.log('Fetching theme settings for hostname ID:', this.session.current._id);
          const { data, status } = await this.$Request.GET(`hostname/${this.session.current._id}`, this.hostkey);
          if (status === 200 && data) {
            // Handle theme settings
            if (data.theme) {
              console.log('Theme settings fetched:', data.theme);
              this.currentFullTheme = { ...data.theme }; // Store the full theme object
              
              this.selectedTheme = this.currentFullTheme.type || 'builder'; 
              if (this.currentFullTheme.type === 'built-in') {
                this.selectedBuiltInTheme = this.currentFullTheme.style || 'default';
              } else if (this.currentFullTheme.type === 'clustersie') {
                this.selectedClustersieSubdomain = this.currentFullTheme.subdomain || 'main';
              }
            } else {
              this.currentFullTheme = {}; // Initialize if no theme data found
            }

            // Handle login config settings
            if (data.loginConfig) {
              console.log('Login config settings fetched:', data.loginConfig);
              this.currentFullLoginConfig = { ...data.loginConfig };
              
              // Update login config checkboxes
              this.loginConfig.microsoftOffice365 = data.loginConfig.microsoftOffice365 || false;
              this.loginConfig.googleGSuit = data.loginConfig.googleGSuit || false;
              this.loginConfig.facebookLogin = data.loginConfig.facebookLogin || false;
              this.loginConfig.line = data.loginConfig.line || false;
              this.loginConfig.clustersie = data.loginConfig.clustersie || false;
              
              // Load Microsoft configs if exists
              if (data.loginConfig.microsoftConfigs && Array.isArray(data.loginConfig.microsoftConfigs)) {
                this.microsoftConfigs = [...data.loginConfig.microsoftConfigs];
                this.selectedMicrosoftConfigIndex = data.loginConfig.selectedMicrosoftConfigIndex || (this.microsoftConfigs.length > 0 ? 0 : -1);
              }
              
              // Load Google configs if exists  
              if (data.loginConfig.googleConfigs && Array.isArray(data.loginConfig.googleConfigs)) {
                this.googleConfigs = [...data.loginConfig.googleConfigs];
                this.selectedGoogleConfigIndex = data.loginConfig.selectedGoogleConfigIndex || (this.googleConfigs.length > 0 ? 0 : -1);
              }
              
              // Load Facebook configs if exists
              if (data.loginConfig.facebookConfigs && Array.isArray(data.loginConfig.facebookConfigs)) {
                this.facebookConfigs = [...data.loginConfig.facebookConfigs];
                this.selectedFacebookConfigIndex = data.loginConfig.selectedFacebookConfigIndex || (this.facebookConfigs.length > 0 ? 0 : -1);
              }
              
              // Load Line configs if exists
              if (data.loginConfig.lineConfigs && Array.isArray(data.loginConfig.lineConfigs)) {
                this.lineConfigs = [...data.loginConfig.lineConfigs];
                this.selectedLineConfigIndex = data.loginConfig.selectedLineConfigIndex || (this.lineConfigs.length > 0 ? 0 : -1);
              }
              
              // Load Clustersie configs if exists
              if (data.loginConfig.clustersieConfigs && Array.isArray(data.loginConfig.clustersieConfigs)) {
                this.clustersieConfigs = data.loginConfig.clustersieConfigs.map(config => ({ ...config, showAccordion: false }));
                this.selectedClustersieConfigIndex = data.loginConfig.selectedClustersieConfigIndex || 0;
              }
              
              // Load button configurations if exists
              if (data.loginConfig.buttonConfigs && typeof data.loginConfig.buttonConfigs === 'object') {
                this.buttonConfigs = { ...data.loginConfig.buttonConfigs };
                console.log('Button configs loaded:', this.buttonConfigs);
              } else {
                this.buttonConfigs = {};
                console.log('No button configs found, using empty object');
              }
            } else {
              this.currentFullLoginConfig = {};
              this.buttonConfigs = {};
              console.log('No login config found, using defaults');
            }
          } else {
            this.currentFullTheme = {}; // Initialize if no theme data found
            this.currentFullLoginConfig = {}; // Initialize if no login config found
            console.warn('Could not fetch settings or data is missing, status:', status);
             this.$swal({
              toast: true,
              position: 'bottom-end',
              showConfirmButton: false,
              timer: 3000,
              icon: 'warning',
              title: 'ไม่พบข้อมูล',
              text: 'ไม่พบการตั้งค่าปัจจุบัน หรือข้อมูลไม่สมบูรณ์ จะใช้ค่าเริ่มต้น',
            });
          }
        } catch (error) {
          this.currentFullTheme = {}; // Initialize on error
          this.currentFullLoginConfig = {}; // Initialize on error
          console.error('Error fetching settings:', error);
          this.$swal({
              toast: true,
              position: 'bottom-end',
              showConfirmButton: false,
              timer: 3000,
              icon: 'error',
              title: 'เกิดข้อผิดพลาด',
              text: 'ไม่สามารถโหลดการตั้งค่าได้',
            });
        }
      },
      saveConfiguration() {
        this.updateThemeSettings();
      },
      
      selectBuiltInTheme(themeStyle) {
        this.selectedTheme = 'built-in';
        this.selectedBuiltInTheme = themeStyle;
      },
      async updateThemeSettings() {
        if (!this.session || !this.session.current || !this.session.current._id) {
          console.error('Session data is not available for update.');
          this.$swal({ toast: true, position: 'bottom-end', showConfirmButton: false, timer: 3000, icon: 'error', title: 'ข้อผิดพลาด', text: 'ข้อมูลผู้ใช้ไม่พร้อมสำหรับการอัปเดต'});
          return;
        }
        console.log('Updating theme settings...');
        
        // Start with the existing full theme settings, or an empty object
        const updatedThemeData = { ...this.currentFullTheme }; 

        // Update type and style based on user selection
        updatedThemeData.type = this.selectedTheme;
        console.log('Selected Theme for update:', updatedThemeData.type);

        if (this.selectedTheme === 'built-in') {
          updatedThemeData.style = this.selectedBuiltInTheme;
          console.log('Selected Built-in Style for update:', updatedThemeData.style);
          // Remove clustersie-specific properties if switching from clustersie theme
          delete updatedThemeData.subdomain;
        } else if (this.selectedTheme === 'clustersie') {
          updatedThemeData.subdomain = this.selectedClustersieSubdomain;
          console.log('Selected Clustersie Subdomain for update:', updatedThemeData.subdomain);
          // Remove built-in specific properties if switching from built-in theme
          delete updatedThemeData.style;
        } else {
          // If not 'built-in' or 'clustersie', remove both properties to keep data clean
          delete updatedThemeData.style;
          delete updatedThemeData.subdomain;
          console.log('Theme type is not built-in or clustersie, style and subdomain properties removed if existed.');
        }

        try {
          const requestBody = { data: { theme: updatedThemeData } }; // Send the merged theme object
          console.log('Payload for update:', JSON.stringify(requestBody, null, 2));
          const { data, status } = await this.$Request.PUT(`hostname/${this.session.current._id}`, requestBody, this.hostkey);
          if (status === 200) {
            this.currentFullTheme = { ...updatedThemeData }; // Update local full theme cache
            
            // Phase 1: Show save success notification
            this.$swal({
              toast: true,
              position: 'bottom-end',
              showConfirmButton: false,
              timer: 2000,
              icon: 'success',
              title: 'บันทึกสำเร็จ',
              text: 'การตั้งค่าธีมถูกบันทึกแล้ว',
            });
            console.log('Theme settings updated successfully:', data);
            
            // Phase 2: Clear cache and show cache clear notification
            setTimeout(async () => {
              try {
                console.log('🔄 Clearing cache for current tenant after theme update...');
                const cacheResult = await this.$clearCacheForCurrentTenant();
                if (cacheResult.success) {
                  console.log('✅ Cache cleared successfully for hostname:', cacheResult.hostname);
                  this.$swal({
                    toast: true,
                    position: 'bottom-end',
                    showConfirmButton: false,
                    timer: 2000,
                    icon: 'info',
                    title: 'เคลียร์แคชแล้ว',
                    text: 'ข้อมูลแคชถูกเคลียร์เรียบร้อยแล้ว',
                  });
                } else {
                  console.warn('⚠️ Cache clear failed (non-critical):', cacheResult.error);
                  this.$swal({
                    toast: true,
                    position: 'bottom-end',
                    showConfirmButton: false,
                    timer: 3000,
                    icon: 'warning',
                    title: 'เคลียร์แคชไม่สำเร็จ',
                    text: 'ไม่สามารถเคลียร์แคชได้ แต่การบันทึกสำเร็จแล้ว',
                  });
                }
              } catch (cacheError) {
                console.warn('❌ Cache clear error (non-critical):', cacheError);
                this.$swal({
                  toast: true,
                  position: 'bottom-end',
                  showConfirmButton: false,
                  timer: 3000,
                  icon: 'warning',
                  title: 'เคลียร์แคชไม่สำเร็จ',
                  text: 'เกิดข้อผิดพลาดในการเคลียร์แคช แต่การบันทึกสำเร็จแล้ว',
                });
              }
            }, 1500); // Wait 1.5 seconds before clearing cache
          } else {
            throw new Error(`Failed to update theme settings, status: ${status}`);
          }
        } catch (error) {
          console.error('Error updating theme settings:', error);
          this.$swal({
              toast: true,
              position: 'bottom-end',
              showConfirmButton: false,
              timer: 3000,
              icon: 'error',
              title: 'อัปเดตไม่สำเร็จ',
              text: 'ไม่สามารถบันทึกการตั้งค่าธีมได้',
            });
        }
      },
      
      // Login Configuration Methods
      saveLoginConfiguration() {
        this.updateLoginSettings();
      },
      
      async updateLoginSettings() {
        if (!this.session || !this.session.current || !this.session.current._id) {
          console.error('Session data is not available for login config update.');
          this.$swal({ 
            toast: true, 
            position: 'bottom-end', 
            showConfirmButton: false, 
            timer: 3000, 
            icon: 'error', 
            title: 'ข้อผิดพลาด', 
            text: 'ข้อมูลผู้ใช้ไม่พร้อมสำหรับการอัปเดต'
          });
          return;
        }
        
        console.log('Updating login config settings...');
        
        // Create updated login config object
        const updatedLoginConfig = {
          microsoftOffice365: this.loginConfig.microsoftOffice365,
          googleGSuit: this.loginConfig.googleGSuit,
          facebookLogin: this.loginConfig.facebookLogin,
          line: this.loginConfig.line,
          lastUpdated: new Date().toISOString()
        };
        
        // Add Microsoft configs if Microsoft Office 365 is enabled
        if (this.loginConfig.microsoftOffice365 && this.microsoftConfigs.length > 0) {
          updatedLoginConfig.microsoftConfigs = this.microsoftConfigs;
          updatedLoginConfig.selectedMicrosoftConfigIndex = this.selectedMicrosoftConfigIndex;
        }
        
        // Add Google configs if Google GSuit is enabled  
        if (this.loginConfig.googleGSuit && this.googleConfigs.length > 0) {
          updatedLoginConfig.googleConfigs = this.googleConfigs;
          updatedLoginConfig.selectedGoogleConfigIndex = this.selectedGoogleConfigIndex;
        }
        
        // Add Facebook configs if Facebook Login is enabled
        if (this.loginConfig.facebookLogin && this.facebookConfigs.length > 0) {
          updatedLoginConfig.facebookConfigs = this.facebookConfigs;
          updatedLoginConfig.selectedFacebookConfigIndex = this.selectedFacebookConfigIndex;
        }
        
        // Add Line configs if Line is enabled
        if (this.loginConfig.line && this.lineConfigs.length > 0) {
          updatedLoginConfig.lineConfigs = this.lineConfigs;
          updatedLoginConfig.selectedLineConfigIndex = this.selectedLineConfigIndex;
        }

        // Add button configurations for all services
        if (this.buttonConfigs && Object.keys(this.buttonConfigs).length > 0) {
          updatedLoginConfig.buttonConfigs = { ...this.buttonConfigs };
        }

        try {
          const requestBody = { data: { loginConfig: updatedLoginConfig } };
          console.log('Login config payload for update:', JSON.stringify(requestBody, null, 2));
          
          const { data, status } = await this.$Request.PUT(`hostname/${this.session.current._id}`, requestBody, this.hostkey);
          
          if (status === 200) {
            this.currentFullLoginConfig = { ...updatedLoginConfig };
            
            // Phase 1: Show save success notification
            this.$swal({
              toast: true,
              position: 'bottom-end',
              showConfirmButton: false,
              timer: 2000,
              icon: 'success',
              title: 'บันทึกสำเร็จ',
              text: 'การตั้งค่าการเข้าสู่ระบบถูกบันทึกแล้ว',
            });
            console.log('Login config settings updated successfully:', data);
            
            // Phase 2: Clear cache and show cache clear notification
            setTimeout(async () => {
              try {
                console.log('🔄 Clearing cache for current tenant after login config update...');
                const cacheResult = await this.$clearCacheForCurrentTenant();
                if (cacheResult.success) {
                  console.log('✅ Cache cleared successfully for hostname:', cacheResult.hostname);
                  this.$swal({
                    toast: true,
                    position: 'bottom-end',
                    showConfirmButton: false,
                    timer: 2000,
                    icon: 'info',
                    title: 'เคลียร์แคชแล้ว',
                    text: 'ข้อมูลแคชถูกเคลียร์เรียบร้อยแล้ว',
                  });
                } else {
                  console.warn('⚠️ Cache clear failed (non-critical):', cacheResult.error);
                  this.$swal({
                    toast: true,
                    position: 'bottom-end',
                    showConfirmButton: false,
                    timer: 3000,
                    icon: 'warning',
                    title: 'เคลียร์แคชไม่สำเร็จ',
                    text: 'ไม่สามารถเคลียร์แคชได้ แต่การบันทึกสำเร็จแล้ว',
                  });
                }
              } catch (cacheError) {
                console.warn('❌ Cache clear error (non-critical):', cacheError);
                this.$swal({
                  toast: true,
                  position: 'bottom-end',
                  showConfirmButton: false,
                  timer: 3000,
                  icon: 'warning',
                  title: 'เคลียร์แคชไม่สำเร็จ',
                  text: 'เกิดข้อผิดพลาดในการเคลียร์แคช แต่การบันทึกสำเร็จแล้ว',
                });
              }
            }, 1500); // Wait 1.5 seconds before clearing cache
          } else {
            throw new Error(`Failed to update login config settings, status: ${status}`);
          }
        } catch (error) {
          console.error('Error updating login config settings:', error);
          this.$swal({
            toast: true,
            position: 'bottom-end',
            showConfirmButton: false,
            timer: 3000,
            icon: 'error',
            title: 'อัปเดตไม่สำเร็จ',
            text: 'ไม่สามารถบันทึกการตั้งค่าการเข้าสู่ระบบได้',
          });
        }
      },
      
      resetLoginConfiguration() {
        this.$swal({
          title: 'ยืนยันการรีเซ็ต',
          text: 'คุณต้องการรีเซ็ตการตั้งค่าการเข้าสู่ระบบเป็นค่าเริ่มต้นหรือไม่?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          cancelButtonColor: '#3085d6',
          confirmButtonText: 'ใช่, รีเซ็ต!',
          cancelButtonText: 'ยกเลิก'
        }).then((result) => {
          if (result.isConfirmed) {
            // Reset all login config to false
            this.loginConfig.microsoftOffice365 = false;
            this.loginConfig.googleGSuit = false;
            this.loginConfig.facebookLogin = false;
            this.loginConfig.line = false;
            
            // Reset all configuration arrays
            this.microsoftConfigs = [];
            this.selectedMicrosoftConfigIndex = -1;
            this.googleConfigs = [];
            this.selectedGoogleConfigIndex = -1;
            this.facebookConfigs = [];
            this.selectedFacebookConfigIndex = -1;
            this.lineConfigs = [];
            this.selectedLineConfigIndex = -1;
            
            this.$swal({
              toast: true,
              position: 'bottom-end',
              showConfirmButton: false,
              timer: 2000,
              icon: 'success',
              title: 'รีเซ็ตสำเร็จ',
              text: 'การตั้งค่าการเข้าสู่ระบบถูกรีเซ็ตแล้ว',
            });
          }
        });
      },
      

      


      // Microsoft Configuration Methods
      addMicrosoftConfig() {
        this.microsoftConfigs.push({
          name: '',
          clientId: '',
          clientSecret: '',
          redirectUri: '',
          tenantId: '',
          showAccordion: true // แสดงรายละเอียดใหม่ทันที
        });
        // Auto select the new config
        this.selectedMicrosoftConfigIndex = this.microsoftConfigs.length - 1;
      },

      // Generic accordion toggle method for any service config
      toggleConfigAccordion(serviceName, index) {
        const configArray = this[`${serviceName}Configs`];
        if (configArray && configArray[index]) {
          // Vue 3 way to set reactive property
          configArray[index].showAccordion = !configArray[index].showAccordion;
        }
      },
      
      removeMicrosoftConfig(index) {
        this.microsoftConfigs.splice(index, 1);
        // Adjust selected index if needed
        if (this.selectedMicrosoftConfigIndex >= this.microsoftConfigs.length) {
          this.selectedMicrosoftConfigIndex = this.microsoftConfigs.length - 1;
        }
        if (this.selectedMicrosoftConfigIndex < 0 && this.microsoftConfigs.length > 0) {
          this.selectedMicrosoftConfigIndex = 0;
        }
      },
      
      testMicrosoftConnection(index) {
        const config = this.microsoftConfigs[index];
        if (!this.isMicrosoftConfigValid(config)) {
          this.$swal.fire({
            title: 'ข้อมูลไม่ครบ',
            text: 'กรุณากรอกข้อมูลให้ครบถ้วนก่อนทดสอบการเชื่อมต่อ',
            icon: 'warning',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000
          });
          return;
        }
        
        // TODO: Implement actual Microsoft connection test
        this.$swal.fire({
          title: 'ทดสอบการเชื่อมต่อ Microsoft',
          text: `กำลังทดสอบการตั้งค่า "${config.name || 'การตั้งค่า ' + (index + 1)}"`,
          icon: 'info',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 2000
        });
      },

      // Google Configuration Methods
      addGoogleConfig() {
        this.googleConfigs.push({
          name: '',
          clientId: '',
          clientSecret: '',
          redirectUri: '',
          hostedDomain: '',
          showAccordion: true // แสดงรายละเอียดใหม่ทันที
        });
        // Auto select the new config
        this.selectedGoogleConfigIndex = this.googleConfigs.length - 1;
      },
      
      removeGoogleConfig(index) {
        this.googleConfigs.splice(index, 1);
        // Adjust selected index if needed
        if (this.selectedGoogleConfigIndex >= this.googleConfigs.length) {
          this.selectedGoogleConfigIndex = this.googleConfigs.length - 1;
        }
        if (this.selectedGoogleConfigIndex < 0 && this.googleConfigs.length > 0) {
          this.selectedGoogleConfigIndex = 0;
        }
      },
      
      testGoogleConnection(index) {
        const config = this.googleConfigs[index];
        if (!this.isGoogleConfigValid(config)) {
          this.$swal.fire({
            title: 'ข้อมูลไม่ครบ',
            text: 'กรุณากรอกข้อมูลให้ครบถ้วนก่อนทดสอบการเชื่อมต่อ',
            icon: 'warning',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000
          });
          return;
        }
        
        // TODO: Implement actual Google connection test
        this.$swal.fire({
          title: 'ทดสอบการเชื่อมต่อ Google',
          text: `กำลังทดสอบการตั้งค่า "${config.name || 'การตั้งค่า ' + (index + 1)}"`,
          icon: 'info',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 2000
        });
      },

      // Facebook Configuration Methods
      addFacebookConfig() {
        this.facebookConfigs.push({
          name: '',
          appId: '',
          appSecret: '',
          redirectUri: '',
          showAccordion: true // แสดงรายละเอียดใหม่ทันที
        });
        // Auto select the new config
        this.selectedFacebookConfigIndex = this.facebookConfigs.length - 1;
      },
      
      removeFacebookConfig(index) {
        this.facebookConfigs.splice(index, 1);
        // Adjust selected index if needed
        if (this.selectedFacebookConfigIndex >= this.facebookConfigs.length) {
          this.selectedFacebookConfigIndex = this.facebookConfigs.length - 1;
        }
        if (this.selectedFacebookConfigIndex < 0 && this.facebookConfigs.length > 0) {
          this.selectedFacebookConfigIndex = 0;
        }
      },
      
      testFacebookConnection(index) {
        const config = this.facebookConfigs[index];
        if (!this.isFacebookConfigValid(config)) {
          this.$swal.fire({
            title: 'ข้อมูลไม่ครบ',
            text: 'กรุณากรอกข้อมูลให้ครบถ้วนก่อนทดสอบการเชื่อมต่อ',
            icon: 'warning',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000
          });
          return;
        }
        
        // TODO: Implement actual Facebook connection test
        this.$swal.fire({
          title: 'ทดสอบการเชื่อมต่อ Facebook',
          text: `กำลังทดสอบการตั้งค่า "${config.name || 'การตั้งค่า ' + (index + 1)}"`,
          icon: 'info',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 2000
        });
      },

      // Line Configuration Methods
      addLineConfig() {
        this.lineConfigs.push({
          name: '',
          channelId: '',
          channelSecret: '',
          redirectUri: '',
          showAccordion: true // แสดงรายละเอียดใหม่ทันที
        });
        // Auto select the new config
        this.selectedLineConfigIndex = this.lineConfigs.length - 1;
      },
      
      removeLineConfig(index) {
        this.lineConfigs.splice(index, 1);
        // Adjust selected index if needed
        if (this.selectedLineConfigIndex >= this.lineConfigs.length) {
          this.selectedLineConfigIndex = this.lineConfigs.length - 1;
        }
        if (this.selectedLineConfigIndex < 0 && this.lineConfigs.length > 0) {
          this.selectedLineConfigIndex = 0;
        }
      },
      
      testLineConnection(index) {
        const config = this.lineConfigs[index];
        if (!this.isLineConfigValid(config)) {
          this.$swal.fire({
            title: 'ข้อมูลไม่ครบ',
            text: 'กรุณากรอกข้อมูลให้ครบถ้วนก่อนทดสอบการเชื่อมต่อ',
            icon: 'warning',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000
          });
          return;
        }
        
        // TODO: Implement actual Line connection test
        this.$swal.fire({
          title: 'ทดสอบการเชื่อมต่อ Line',
          text: `กำลังทดสอบการตั้งค่า "${config.name || 'การตั้งค่า ' + (index + 1)}"`,
          icon: 'info',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 2000
        });
      },

      // Validation methods for configurations
      isMicrosoftConfigValid(config) {
        return config.clientId && 
               config.clientSecret && 
               config.tenantId && 
               config.redirectUri;
      },
      
      isGoogleConfigValid(config) {
        return config.clientId && 
               config.clientSecret && 
               config.redirectUri;
      },
      
      isFacebookConfigValid(config) {
        return config.appId && 
               config.appSecret && 
               config.redirectUri;
      },
      
      isLineConfigValid(config) {
        return config.channelId && 
               config.channelSecret && 
               config.redirectUri;
      },



      // Utility Methods
      async copyToClipboard(text, label = 'URL') {
        if (!text) {
          this.$swal.fire({
            title: 'ไม่สามารถคัดลอกได้',
            text: 'ไม่มี URL ให้คัดลอก กรุณากรอก URL ก่อน',
            icon: 'warning',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000
          });
          return;
        }
        
        try {
          await navigator.clipboard.writeText(text);
          this.$swal.fire({
            title: 'คัดลอกสำเร็จ!',
            text: `${label} ถูกคัดลอกไปยังคลิปบอร์ดแล้ว`,
            icon: 'success',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 2000
          });
        } catch (error) {
          console.error('Failed to copy to clipboard:', error);
          // Fallback method for older browsers
          try {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.opacity = '0';
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            
            this.$swal.fire({
              title: 'คัดลอกสำเร็จ!',
              text: `${label} ถูกคัดลอกไปยังคลิปบอร์ดแล้ว`,
              icon: 'success',
              toast: true,
              position: 'top-end',
              showConfirmButton: false,
              timer: 2000
            });
          } catch (fallbackError) {
            console.error('Fallback copy method also failed:', fallbackError);
            this.$swal.fire({
              title: 'ไม่สามารถคัดลอกได้',
              text: 'เบราว์เซอร์ไม่รองรับการคัดลอกอัตโนมัติ กรุณาคัดลอกด้วยตนเอง',
              icon: 'error',
              toast: true,
              position: 'top-end',
              showConfirmButton: false,
              timer: 3000
            });
          }
        }
      },


      
      handleSidebarAction(actionType) {
        console.log('Sidebar action triggered for:', actionType); 
        if(actionType === 'theme_settings'){
          this.saveConfiguration();
        } else if(actionType === 'login_settings') {
          this.saveLoginConfiguration();
        } else {
          alert('ปุ่มใน Sidebar ถูกคลิกสำหรับ: ' + actionType);
        }
      },

      // Modal Management Methods
      openButtonModal(services = []) {
        console.log('Opening button modal with buttonConfigs:', this.buttonConfigs);
        
        // If specific services are provided, use them. Otherwise use all enabled services
        if (services.length > 0) {
          this.enabledServicesList = services;
          // Set the selected service to the first one in the array (the clicked service)
          this.selectedService = services[0];
        } else {
          this.enabledServicesList = this.enabledServices;
          // If no specific service, clear selectedService to show all
          this.selectedService = '';
        }
        
        // Initialize button configs if not exists
        if (!this.buttonConfigs) {
          this.buttonConfigs = {};
        }
        
        this.isButtonModalOpen = true;
      },

      closeButtonModal() {
        this.isButtonModalOpen = false;
        this.selectedService = '';
        this.enabledServicesList = [];
      },

      async saveButtonConfigs(configs) {
        // Update button configurations
        this.buttonConfigs = { ...configs };
        
        // Store in currentFullLoginConfig for saving
        if (!this.currentFullLoginConfig.buttonConfigs) {
          this.currentFullLoginConfig.buttonConfigs = {};
        }
        
        Object.assign(this.currentFullLoginConfig.buttonConfigs, configs);
        
        // Save to database immediately
        await this.updateLoginSettings();
        
        // Show success notification (updateLoginSettings will show its own notification)
        // this.$swal({
        //   toast: true,
        //   position: 'bottom-end',
        //   showConfirmButton: false,
        //   timer: 2000,
        //   icon: 'success',
        //   title: 'บันทึกการตั้งค่าปุ่มทั้งหมดเรียบร้อย'
        // });
      },

      async handleModalConfigChange(serviceType, config) {
        // Update local button configs (store complete config if available)
        if (!this.buttonConfigs) {
          this.buttonConfigs = {};
        }
        this.buttonConfigs[serviceType] = config;
        
        // Auto-save button config changes (store complete config if available)
        if (!this.currentFullLoginConfig.buttonConfigs) {
          this.currentFullLoginConfig.buttonConfigs = {};
        }
        this.currentFullLoginConfig.buttonConfigs[serviceType] = config;
        
        // Save to database immediately (with debouncing to prevent too frequent saves)
        clearTimeout(this.saveButtonTimeout);
        this.saveButtonTimeout = setTimeout(async () => {
          await this.updateLoginSettings();
        }, 1000); // Wait 1 second before saving
      },

      // Handle button configuration changes from LoginButtonCustomizer (Legacy - keeping for compatibility)
      handleButtonConfigChange(serviceType, config) {
        console.log(`Button configuration changed for ${serviceType}:`, config);
        
        // Store the button configuration for the specific service
        if (!this.currentFullLoginConfig.buttonConfigs) {
          this.currentFullLoginConfig.buttonConfigs = {};
        }
        
        this.currentFullLoginConfig.buttonConfigs[serviceType] = config;
        
        // Show toast notification about configuration change
        this.$swal({
          toast: true,
          position: 'bottom-end',
          showConfirmButton: false,
          timer: 2000,
          icon: 'success',
          title: `อัปเดตการตั้งค่าปุ่ม ${config.serviceName} แล้ว`
        });
      }
    },
    mounted() {
      this.fetchThemeSettings();
    }
  }
  </script>
  
  <style scoped>
  .border-b {
    border-bottom: 1px solid #e5e7eb; /* เพิ่มเส้นขอบด้านล่าง */
  }
  
  /* Custom checkbox styling */
  .form-checkbox:checked {
    background-color: #3b82f6;
    border-color: #3b82f6;
  }
  
  .form-checkbox:focus {
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    border-color: #3b82f6;
  }
  
  /* Hover effect for login method cards */
  .border.rounded-lg:hover {
    border-color: #d1d5db;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  }
  
  /* Microsoft config form styling */
  .bg-blue-50 input[type="text"],
  .bg-blue-50 input[type="password"],
  .bg-blue-50 input[type="url"] {
    background-color: white;
    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  }
  
  .bg-blue-50 input:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  /* Accordion animation */
  .transform {
    transition: transform 0.2s ease;
  }
  
  /* Hover effects for accordion items */
  .border.rounded-lg:hover {
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.06);
  }

  /* Theme Selection Styles */
  .theme-option {
    border: 2px solid #e5e7eb;
    border-radius: 0.5rem;
    padding: 1rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .theme-option:hover {
    border-color: #93c5fd;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }
  
  .theme-option.selected {
    border-color: #3b82f6;
    background-color: #eff6ff;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }
  
  .theme-preview-container {
    margin-bottom: 1rem;
    border-radius: 0.5rem;
    overflow: hidden;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  }
  
  .theme-preview {
    width: 100%;
    height: 8rem;
    background-color: white;
    border: 1px solid #e5e7eb;
    position: relative;
  }
  
  .preview-header {
    height: 1.5rem;
    background-color: #f3f4f6;
    display: flex;
    align-items: center;
    padding: 0 0.5rem;
  }
  
  .preview-nav-dots {
    display: flex;
    gap: 0.25rem;
  }
  
  .preview-nav-dots .dot {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    background-color: #9ca3af;
  }
  
  .preview-content {
    height: 6.5rem;
    padding: 0.5rem;
  }
  
  /* Builder Theme Preview */
  .builder-preview .preview-content {
    display: flex;
    gap: 0.5rem;
  }
  
  .builder-blocks {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .builder-blocks .block {
    border-radius: 0.25rem;
  }
  
  .builder-blocks .header-block {
    height: 0.75rem;
    background-color: #bfdbfe;
  }
  
  .builder-blocks .content-block {
    height: 3rem;
    background-color: #e5e7eb;
  }
  
  .builder-blocks .footer-block {
    height: 0.5rem;
    background-color: #d1d5db;
  }
  
  .builder-sidebar {
    width: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .builder-sidebar .sidebar-item {
    height: 1rem;
    background-color: #c7d2fe;
    border-radius: 0.25rem;
  }
  
  /* Default Theme Preview */
  .default-layout {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .default-layout .nav-bar {
    height: 0.75rem;
    background-color: #d1d5db;
    border-radius: 0.25rem;
  }
  
  .default-layout .hero-section {
    height: 2rem;
    background-color: #bfdbfe;
    border-radius: 0.25rem;
  }
  
  .content-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.25rem;
  }
  
  .content-grid .grid-item {
    height: 1rem;
    background-color: #e5e7eb;
    border-radius: 0.25rem;
  }
  
  /* Netflix Theme Preview */
  .netflix-preview .preview-content {
    background-color: #000000;
  }
  
  .netflix-layout {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .netflix-hero {
    height: 2rem;
    background-color: #dc2626;
    border-radius: 0.25rem;
  }
  
  .netflix-rows {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .content-row .row-items {
    display: flex;
    gap: 0.25rem;
  }
  
  .content-row .movie-card {
    flex: 1;
    height: 0.75rem;
    background-color: #374151;
    border-radius: 0.25rem;
  }
  
  /* Corporate Theme Preview */
  .corporate-layout {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    height: 100%;
  }
  
  .corporate-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 1rem;
    padding: 0 0.25rem;
    background-color: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
  }
  
  .logo-area {
    width: 1.5rem;
    height: 0.5rem;
    background-color: #1e40af;
    border-radius: 0.125rem;
  }
  
  .nav-menu {
    display: flex;
    gap: 0.125rem;
  }
  
  .nav-item {
    width: 0.75rem;
    height: 0.25rem;
    background-color: #64748b;
    border-radius: 0.125rem;
  }
  
  .corporate-banner {
    height: 1.5rem;
    background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
    border-radius: 0.25rem;
  }
  
  .corporate-content {
    display: flex;
    gap: 0.25rem;
    flex: 1;
  }
  
  .content-column {
    flex: 2;
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }
  
  .text-block {
    height: 0.75rem;
    background-color: #e2e8f0;
    border-radius: 0.125rem;
  }
  
  .text-block.short {
    height: 0.5rem;
    width: 80%;
  }
  
  .sidebar-column {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }
  
  .sidebar-widget {
    height: 0.75rem;
    background-color: #f1f5f9;
    border: 1px solid #e2e8f0;
    border-radius: 0.125rem;
  }
  
  /* Clustersie Theme Preview Styles */
  .clustersie-preview {
    background: linear-gradient(135deg, #f97316, #ea580c);
  }
  
  .clustersie-layout {
    padding: 0.25rem;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }
  
  .clustersie-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 0.75rem;
    background-color: rgba(255, 255, 255, 0.9);
    border-radius: 0.125rem;
    padding: 0 0.25rem;
  }
  
  .clustersie-logo {
    width: 0.5rem;
    height: 0.5rem;
    background-color: #f97316;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.4rem;
    font-weight: bold;
    color: white;
  }
  
  .clustersie-nav {
    display: flex;
    gap: 0.125rem;
  }
  
  .nav-dot {
    width: 0.25rem;
    height: 0.25rem;
    background-color: #f97316;
    border-radius: 50%;
  }
  
  .clustersie-hero {
    height: 1rem;
    background-color: rgba(255, 255, 255, 0.9);
    border-radius: 0.125rem;
    padding: 0.125rem;
    display: flex;
    align-items: center;
  }
  
  .hero-content {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 0.0625rem;
  }
  
  .hero-title {
    height: 0.25rem;
    background-color: #f97316;
    border-radius: 0.0625rem;
    width: 60%;
  }
  
  .hero-subtitle {
    height: 0.1875rem;
    background-color: #fb923c;
    border-radius: 0.0625rem;
    width: 40%;
  }
  
  .clustersie-grid {
    display: flex;
    gap: 0.125rem;
    flex: 1;
  }
  
  .grid-card {
    flex: 1;
    border-radius: 0.125rem;
    background-color: rgba(255, 255, 255, 0.9);
  }
  
  .grid-card.orange {
    background: linear-gradient(135deg, #fed7aa, #fdba74);
  }
  
  .grid-card.green {
    background: linear-gradient(135deg, #bbf7d0, #86efac);
  }
  
  .grid-card.blue {
    background: linear-gradient(135deg, #bfdbfe, #93c5fd);
  }
  
  /* Clustersie Subdomain Selection Styles */
  .clustersie-subdomain-option {
    cursor: pointer;
    padding: 0.75rem;
    border: 2px solid #e5e7eb;
    border-radius: 0.5rem;
    transition: all 0.2s ease;
    background-color: white;
  }
  
  .clustersie-subdomain-option:hover {
    border-color: #f97316;
    box-shadow: 0 2px 4px rgba(249, 115, 22, 0.1);
  }
  
  .clustersie-subdomain-option.selected {
    border-color: #f97316;
    background-color: #fff7ed;
    box-shadow: 0 2px 8px rgba(249, 115, 22, 0.2);
  }
  
  .subdomain-preview {
    text-align: center;
    margin-bottom: 0.5rem;
  }
  
  .preview-icon {
    font-size: 1.5rem;
    margin-bottom: 0.25rem;
    display: block;
  }
  
  .preview-name {
    font-size: 0.75rem;
    font-weight: 600;
    color: #374151;
  }
  
  .main-preview .preview-icon {
    font-size: 1.5rem;
    font-weight: bold;
    color: #f97316;
  }
  
  .coffee-preview .preview-icon {
    font-size: 1.5rem;
  }
  
  .fisheries-preview .preview-icon {
    font-size: 1.5rem;
  }
  
  .fruit-preview .preview-icon {
    font-size: 1.5rem;
  }
  
  .bittermelon-preview .preview-icon {
    font-size: 1.5rem;
  }
  
  .halal-preview .preview-icon {
    font-size: 1.5rem;
  }
  
  .mulberry-preview .preview-icon {
    font-size: 1.5rem;
  }
  
  .theme-info {
    padding-top: 0.75rem;
    border-top: 1px solid #e5e7eb;
  }
  
  .theme-option.selected .theme-info {
    border-color: #93c5fd;
  }
  </style>
    