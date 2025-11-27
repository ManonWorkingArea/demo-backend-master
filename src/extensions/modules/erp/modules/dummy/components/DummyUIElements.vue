<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <ErpBreadcrumb :nav="breadcrumbItems" />
    
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Page Title -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">UI Elements Library</h1>
        <p class="text-gray-600 mt-2">รวม UI components และ elements ต่างๆ ที่สามารถนำไปใช้งานได้</p>
      </div>

      <!-- Navigation Tabs -->
      <div class="mb-8">
        <nav class="flex space-x-8 border-b border-gray-200">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'py-2 px-1 border-b-2 font-medium text-sm',
              activeTab === tab.id
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
          >
            <i :class="tab.icon" class="mr-2"></i>
            {{ tab.name }}
          </button>
        </nav>
      </div>

      <!-- Content based on active tab -->
      <div v-show="activeTab === 'forms'" class="space-y-8">
        <!-- Forms Section -->
        <section class="bg-white rounded-lg shadow p-6">
          <h2 class="text-xl font-semibold mb-6">Form Elements</h2>
          
          <!-- Advanced Form with Validation -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- Left Column - Basic Elements -->
            <div class="space-y-6">
              <h3 class="text-lg font-medium text-gray-900">Basic Inputs</h3>
              
              <!-- Text Input with Icons -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i class="fas fa-envelope text-gray-400"></i>
                  </div>
                  <input
                    type="email"
                    v-model="formData.email"
                    class="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="you@example.com"
                  />
                  <div class="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <i class="fas fa-check text-green-500" v-if="formData.email && isValidEmail"></i>
                  </div>
                </div>
              </div>

              <!-- Multi-Select with Tags -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Skills</label>
                <div class="relative">
                  <div class="flex flex-wrap gap-2 mb-2" v-if="selectedSkills.length">
                    <span
                      v-for="skill in selectedSkills"
                      :key="skill"
                      class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                    >
                      {{ skill }}
                      <button @click="removeSkill(skill)" class="ml-1 text-indigo-600 hover:text-indigo-800">
                        <i class="fas fa-times text-xs"></i>
                      </button>
                    </span>
                  </div>
                  <select
                    @change="addSkill($event)"
                    class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select a skill...</option>
                    <option v-for="skill in availableSkills" :key="skill" :value="skill">{{ skill }}</option>
                  </select>
                </div>
              </div>

              <!-- File Upload with Preview -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Profile Picture</label>
                <div class="flex items-center space-x-4">
                  <div class="w-16 h-16 bg-gray-200 rounded-full overflow-hidden">
                    <img v-if="previewImage" :src="previewImage" alt="Preview" class="w-full h-full object-cover" />
                    <div v-else class="w-full h-full flex items-center justify-center">
                      <i class="fas fa-user text-gray-400 text-xl"></i>
                    </div>
                  </div>
                  <div>
                    <input
                      type="file"
                      @change="handleFileUpload"
                      accept="image/*"
                      class="hidden"
                      ref="fileInputRef"
                    />
                    <button
                      @click="triggerFileInput"
                      class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Choose File
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right Column - Advanced Elements -->
            <div class="space-y-6">
              <h3 class="text-lg font-medium text-gray-900">Advanced Controls</h3>
              
              <!-- Date Range Picker -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                <div class="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    v-model="formData.startDate"
                    class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <input
                    type="date"
                    v-model="formData.endDate"
                    class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <!-- Rating Component -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                <div class="flex items-center space-x-1">
                  <button
                    v-for="star in 5"
                    :key="star"
                    @click="setRating(star)"
                    class="text-2xl focus:outline-none"
                    :class="star <= rating ? 'text-yellow-400' : 'text-gray-300'"
                  >
                    <i class="fas fa-star"></i>
                  </button>
                  <span class="ml-2 text-sm text-gray-600">({{ rating }}/5)</span>
                </div>
              </div>

              <!-- Toggle Switches -->
              <div class="space-y-3">
                <label class="block text-sm font-medium text-gray-700">Preferences</label>
                <div v-for="toggle in toggles" :key="toggle.id" class="flex items-center justify-between">
                  <span class="text-sm text-gray-700">{{ toggle.label }}</span>
                  <button
                    @click="toggle.value = !toggle.value"
                    :class="[
                      'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
                      toggle.value ? 'bg-indigo-600' : 'bg-gray-200'
                    ]"
                  >
                    <span
                      :class="[
                        'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                        toggle.value ? 'translate-x-5' : 'translate-x-0'
                      ]"
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Advanced Form Elements -->
        <section class="bg-white rounded-lg shadow p-6">
          <h2 class="text-xl font-semibold mb-6">Advanced Form Elements</h2>
          
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- Left Column - Input Variations -->
            <div class="space-y-6">
              <h3 class="text-lg font-medium text-gray-900">Input Variations</h3>
              
              <!-- Input with Floating Label -->
              <div class="relative">
                <input
                  type="text"
                  v-model="floatingInput"
                  id="floating-input"
                  class="peer block w-full px-3 pt-6 pb-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-transparent"
                  placeholder="Floating Label Input"
                />
                <label
                  for="floating-input"
                  class="absolute left-3 top-2 text-xs text-gray-600 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-xs peer-focus:text-indigo-600"
                >
                  Floating Label Input
                </label>
              </div>

              <!-- Input with Prefix/Suffix -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Price (with prefix/suffix)</label>
                <div class="flex rounded-md shadow-sm">
                  <span class="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                    $
                  </span>
                  <input
                    type="number"
                    v-model="priceInput"
                    class="flex-1 block w-full px-3 py-2 border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="0.00"
                  />
                  <span class="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                    USD
                  </span>
                </div>
              </div>

              <!-- Password with Strength Indicator -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Password with Strength</label>
                <div class="relative">
                  <input
                    :type="showPassword ? 'text' : 'password'"
                    v-model="passwordInput"
                    class="block w-full pr-20 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter password"
                  />
                  <div class="absolute inset-y-0 right-0 flex items-center space-x-1 pr-3">
                    <button
                      @click="generatePassword"
                      class="text-gray-400 hover:text-gray-600 text-sm"
                      title="Generate Password"
                    >
                      <i class="fas fa-dice"></i>
                    </button>
                    <button
                      @click="showPassword = !showPassword"
                      class="text-gray-400 hover:text-gray-600"
                    >
                      <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                    </button>
                  </div>
                </div>
                <!-- Password Strength -->
                <div class="mt-2">
                  <div class="flex items-center space-x-2">
                    <div class="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        class="h-2 rounded-full transition-all duration-300"
                        :class="passwordStrengthColor"
                        :style="{ width: passwordStrengthWidth }"
                      ></div>
                    </div>
                    <span class="text-xs font-medium" :class="passwordStrengthColor">
                      {{ passwordStrengthText }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Multi-level Cascading Select -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Location (Cascading)</label>
                <div class="grid grid-cols-3 gap-2">
                  <select
                    v-model="selectedCountry"
                    @change="onCountryChange"
                    class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select Country</option>
                    <option v-for="country in countries" :key="country.code" :value="country.code">
                      {{ country.name }}
                    </option>
                  </select>
                  <select
                    v-model="selectedState"
                    @change="onStateChange"
                    :disabled="!selectedCountry"
                    class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
                  >
                    <option value="">Select State</option>
                    <option v-for="state in availableStates" :key="state.code" :value="state.code">
                      {{ state.name }}
                    </option>
                  </select>
                  <select
                    v-model="selectedCity"
                    :disabled="!selectedState"
                    class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
                  >
                    <option value="">Select City</option>
                    <option v-for="city in availableCities" :key="city" :value="city">
                      {{ city }}
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Right Column - Advanced Controls -->
            <div class="space-y-6">
              <h3 class="text-lg font-medium text-gray-900">Advanced Controls</h3>
              
              <!-- Searchable Multi-Select with Chips -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Tags (Searchable Multi-Select)</label>
                <div class="border border-gray-300 rounded-md p-2 min-h-20 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500">
                  <!-- Selected Tags -->
                  <div class="flex flex-wrap gap-2 mb-2" v-if="selectedTags.length">
                    <span
                      v-for="tag in selectedTags"
                      :key="tag"
                      class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {{ tag }}
                      <button @click="removeTag(tag)" class="ml-1 text-blue-600 hover:text-blue-800">
                        <i class="fas fa-times text-xs"></i>
                      </button>
                    </span>
                  </div>
                  <!-- Search Input -->
                  <input
                    type="text"
                    v-model="tagSearch"
                    @keydown.enter.prevent="addCustomTag"
                    class="w-full border-0 p-0 focus:ring-0 focus:outline-none"
                    placeholder="Search or type to add..."
                  />
                  <!-- Dropdown -->
                  <div v-if="tagSearch && filteredTags.length" class="mt-2 max-h-40 overflow-y-auto border-t pt-2">
                    <div
                      v-for="tag in filteredTags"
                      :key="tag"
                      @click="addTag(tag)"
                      class="px-2 py-1 hover:bg-gray-100 cursor-pointer text-sm"
                    >
                      {{ tag }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Color Picker -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Brand Color</label>
                <div class="flex items-center space-x-3">
                  <input
                    type="color"
                    v-model="selectedColor"
                    class="h-10 w-16 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    v-model="selectedColor"
                    class="flex-1 block border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="#000000"
                  />
                  <!-- Color Presets -->
                  <div class="flex space-x-1">
                    <button
                      v-for="color in colorPresets"
                      :key="color"
                      @click="selectedColor = color"
                      :style="{ backgroundColor: color }"
                      class="w-8 h-8 rounded border-2 border-gray-300 hover:border-gray-400"
                      :class="selectedColor === color ? 'ring-2 ring-indigo-500' : ''"
                    ></button>
                  </div>
                </div>
              </div>

              <!-- Range Slider with Dual Handles -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Price Range: ${{ priceRange.min }} - ${{ priceRange.max }}
                </label>
                <div class="px-3">
                  <div class="relative">
                    <!-- Track -->
                    <div class="h-2 bg-gray-200 rounded-full"></div>
                    <!-- Active Track -->
                    <div
                      class="absolute top-0 h-2 bg-indigo-500 rounded-full"
                      :style="{
                        left: (priceRange.min / 1000) * 100 + '%',
                        width: ((priceRange.max - priceRange.min) / 1000) * 100 + '%'
                      }"
                    ></div>
                    <!-- Min Handle -->
                    <input
                      type="range"
                      v-model="priceRange.min"
                      :max="priceRange.max - 50"
                      min="0"
                      step="50"
                      class="absolute top-0 w-full h-2 opacity-0 cursor-pointer"
                    />
                    <!-- Max Handle -->
                    <input
                      type="range"
                      v-model="priceRange.max"
                      :min="priceRange.min + 50"
                      max="1000"
                      step="50"
                      class="absolute top-0 w-full h-2 opacity-0 cursor-pointer"
                    />
                  </div>
                  <!-- Labels -->
                  <div class="flex justify-between text-xs text-gray-500 mt-2">
                    <span>$0</span>
                    <span>$1,000</span>
                  </div>
                </div>
              </div>

              <!-- Rich Text Editor Placeholder -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Description (Rich Text)</label>
                <div class="border border-gray-300 rounded-lg">
                  <!-- Toolbar -->
                  <div class="flex items-center space-x-2 p-2 border-b border-gray-200 bg-gray-50">
                    <button
                      v-for="tool in editorTools"
                      :key="tool.name"
                      @click="applyFormat(tool.command)"
                      class="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded"
                      :title="tool.title"
                    >
                      <i :class="tool.icon" class="text-sm"></i>
                    </button>
                  </div>
                  <!-- Content Area -->
                  <div
                    contenteditable
                    class="p-3 min-h-32 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-inset"
                    @input="updateRichText"
                    ref="richTextEditor"
                  >
                    Type your content here...
                  </div>
                </div>
              </div>

              <!-- Searchable Select (Single) -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Framework (Searchable Select)</label>
                <div class="relative">
                  <div
                    @click="toggleFrameworkDropdown"
                    class="relative w-full cursor-pointer rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <span v-if="selectedFramework" class="block truncate">{{ selectedFramework.name }}</span>
                    <span v-else class="block truncate text-gray-500">Select a framework...</span>
                    <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                      <i class="fas fa-chevron-down text-gray-400" :class="{ 'rotate-180': isFrameworkDropdownOpen }"></i>
                    </span>
                  </div>

                  <!-- Dropdown -->
                  <div
                    v-show="isFrameworkDropdownOpen"
                    class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                  >
                    <!-- Search Input -->
                    <div class="px-3 py-2 border-b border-gray-100">
                      <input
                        ref="frameworkSearchInput"
                        type="text"
                        v-model="frameworkSearch"
                        @keydown.enter.prevent="selectFirstFramework"
                        @keydown.escape="closeFrameworkDropdown"
                        @keydown.arrow-down.prevent="navigateFrameworkDown"
                        @keydown.arrow-up.prevent="navigateFrameworkUp"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Search frameworks..."
                      />
                    </div>
                    
                    <!-- Options -->
                    <div v-if="filteredFrameworks.length === 0" class="px-3 py-2 text-sm text-gray-500">
                      No frameworks found
                    </div>
                    <div
                      v-for="(framework, index) in filteredFrameworks"
                      :key="framework.id"
                      @click="selectFramework(framework)"
                      :class="[
                        'cursor-pointer px-3 py-2 text-sm hover:bg-indigo-50',
                        index === highlightedFrameworkIndex ? 'bg-indigo-100' : '',
                        selectedFramework?.id === framework.id ? 'bg-indigo-500 text-white' : 'text-gray-900'
                      ]"
                    >
                      <div class="flex items-center">
                        <img :src="framework.logo" :alt="framework.name" class="w-5 h-5 mr-3 rounded" />
                        <div>
                          <div class="font-medium">{{ framework.name }}</div>
                          <div class="text-xs" :class="selectedFramework?.id === framework.id ? 'text-indigo-200' : 'text-gray-500'">
                            {{ framework.description }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Searchable Multi-Select with Avatar -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Team Members (Multi-Select)</label>
                <div class="relative">
                  <!-- Selected Items Display -->
                  <div class="min-h-10 border border-gray-300 rounded-md p-2 bg-white focus-within:ring-1 focus-within:ring-indigo-500 focus-within:border-indigo-500">
                    <div class="flex flex-wrap gap-2">
                      <!-- Selected Members -->
                      <span
                        v-for="member in selectedMembers"
                        :key="member.id"
                        class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                      >
                        <img :src="member.avatar" :alt="member.name" class="w-4 h-4 rounded-full mr-1" />
                        {{ member.name }}
                        <button @click="removeMember(member)" class="ml-1 text-indigo-600 hover:text-indigo-800">
                          <i class="fas fa-times text-xs"></i>
                        </button>
                      </span>
                      
                      <!-- Search Input -->
                      <input
                        type="text"
                        v-model="memberSearch"
                        @focus="isMemberDropdownOpen = true"
                        @keydown.escape="closeMemberDropdown"
                        @keydown.enter.prevent="selectFirstMember"
                        class="flex-1 min-w-20 border-0 p-0 focus:ring-0 focus:outline-none"
                        placeholder="Search members..."
                      />
                    </div>
                  </div>

                  <!-- Dropdown -->
                  <div
                    v-show="isMemberDropdownOpen && memberSearch"
                    class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5"
                  >
                    <div v-if="filteredMembers.length === 0" class="px-3 py-2 text-sm text-gray-500">
                      No members found
                    </div>
                    <div
                      v-for="member in filteredMembers"
                      :key="member.id"
                      @click="addMember(member)"
                      class="cursor-pointer px-3 py-2 text-sm hover:bg-indigo-50 flex items-center"
                    >
                      <img :src="member.avatar" :alt="member.name" class="w-8 h-8 rounded-full mr-3" />
                      <div>
                        <div class="font-medium text-gray-900">{{ member.name }}</div>
                        <div class="text-xs text-gray-500">{{ member.role }} • {{ member.department }}</div>
                      </div>
                      <div class="ml-auto">
                        <span v-if="selectedMembers.find(m => m.id === member.id)" class="text-green-500">
                          <i class="fas fa-check"></i>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Time Picker -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Meeting Time</label>
                <div class="grid grid-cols-3 gap-2">
                  <select
                    v-model="selectedTime.hour"
                    class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option v-for="hour in 24" :key="hour - 1" :value="hour - 1">
                      {{ String(hour - 1).padStart(2, '0') }}
                    </option>
                  </select>
                  <select
                    v-model="selectedTime.minute"
                    class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option v-for="minute in minutes" :key="minute" :value="minute">
                      {{ String(minute).padStart(2, '0') }}
                    </option>
                  </select>
                  <select
                    v-model="selectedTime.period"
                    class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
                <p class="text-sm text-gray-500 mt-1">
                  Selected: {{ formatTime(selectedTime) }}
                </p>
              </div>
            </div>
          </div>
        </section>

        <!-- Form Validation Example -->
        <section class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold mb-4">Form Validation</h3>
          <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <i class="fas fa-exclamation-triangle text-yellow-400"></i>
              </div>
              <div class="ml-3">
                <p class="text-sm text-yellow-700">
                  Please fill in all required fields before submitting.
                </p>
              </div>
            </div>
          </div>
          
          <!-- Validation Messages -->
          <div v-if="validationErrors.length" class="mb-4">
            <div v-for="error in validationErrors" :key="error" class="text-sm text-red-600 mb-1">
              <i class="fas fa-exclamation-circle mr-1"></i>
              {{ error }}
            </div>
          </div>
          
          <button @click="validateForm" class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
            Validate Form
          </button>
        </section>
      </div>

      <!-- Data Display Tab -->
      <div v-show="activeTab === 'data'" class="space-y-8">
        <!-- Advanced Table -->
        <section class="bg-white rounded-lg shadow overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-xl font-semibold">Advanced Data Table</h2>
          </div>
          
          <!-- Table Controls -->
          <div class="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <!-- Search -->
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i class="fas fa-search text-gray-400"></i>
                </div>
                <input
                  type="text"
                  v-model="searchQuery"
                  class="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Search users..."
                />
              </div>
              
              <!-- Filters -->
              <div class="flex space-x-3">
                <select
                  v-model="statusFilter"
                  class="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                </select>
                
                <button
                  @click="exportData"
                  class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                >
                  <i class="fas fa-download mr-1"></i>
                  Export
                </button>
              </div>
            </div>
          </div>

          <!-- Table -->
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input type="checkbox" @change="toggleAllSelection" class="rounded" />
                  </th>
                  <th
                    v-for="column in tableColumns"
                    :key="column.key"
                    @click="sortBy(column.key)"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    {{ column.label }}
                    <i v-if="sortColumn === column.key" :class="sortDirection === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'" class="ml-1"></i>
                  </th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr
                  v-for="user in filteredAndSortedUsers"
                  :key="user.id"
                  class="hover:bg-gray-50"
                  :class="selectedUsers.includes(user.id) ? 'bg-indigo-50' : ''"
                >
                  <td class="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      :value="user.id"
                      v-model="selectedUsers"
                      class="rounded"
                    />
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="flex-shrink-0 h-10 w-10">
                        <img class="h-10 w-10 rounded-full" :src="user.avatar" :alt="user.name" />
                      </div>
                      <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">{{ user.name }}</div>
                        <div class="text-sm text-gray-500">{{ user.email }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span
                      :class="[
                        'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                        user.status === 'active' ? 'bg-green-100 text-green-800' :
                        user.status === 'inactive' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      ]"
                    >
                      {{ user.status }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ user.role }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ formatDate(user.lastLogin) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div class="flex items-center justify-end space-x-2">
                      <button class="text-indigo-600 hover:text-indigo-900">
                        <i class="fas fa-eye"></i>
                      </button>
                      <button class="text-green-600 hover:text-green-900">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button class="text-red-600 hover:text-red-900">
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div class="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div class="flex items-center justify-between">
              <div class="text-sm text-gray-500">
                Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to 
                {{ Math.min(currentPage * itemsPerPage, filteredAndSortedUsers.length) }} 
                of {{ filteredAndSortedUsers.length }} results
              </div>
              <div class="flex space-x-2">
                <button
                  @click="currentPage--"
                  :disabled="currentPage === 1"
                  class="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
                >
                  Previous
                </button>
                <span class="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-md text-sm">
                  {{ currentPage }}
                </span>
                <button
                  @click="currentPage++"
                  :disabled="currentPage >= totalPages"
                  class="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- Cards & Layout Tab -->
      <div v-show="activeTab === 'cards'" class="space-y-8">
        <!-- Stats Cards -->
        <section>
          <h2 class="text-xl font-semibold mb-6">Statistics Cards</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div
              v-for="stat in statsCards"
              :key="stat.id"
              class="bg-white rounded-lg shadow p-6 border-l-4"
              :class="stat.color"
            >
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-600">{{ stat.title }}</p>
                  <p class="text-3xl font-bold text-gray-900">{{ stat.value }}</p>
                  <p class="text-sm text-gray-500 mt-1">
                    <span :class="stat.trend === 'up' ? 'text-green-600' : 'text-red-600'">
                      <i :class="stat.trend === 'up' ? 'fas fa-arrow-up' : 'fas fa-arrow-down'"></i>
                      {{ stat.change }}
                    </span>
                    from last month
                  </p>
                </div>
                <div class="p-3 rounded-full bg-gray-100">
                  <i :class="stat.icon" class="text-2xl text-gray-600"></i>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Complex Cards -->
        <section>
          <h2 class="text-xl font-semibold mb-6">Complex Card Layouts</h2>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- Activity Timeline Card -->
            <div class="bg-white rounded-lg shadow">
              <div class="px-6 py-4 border-b border-gray-200">
                <h3 class="text-lg font-medium">Recent Activity</h3>
              </div>
              <div class="p-6">
                <div class="flow-root">
                  <ul class="-mb-8">
                    <li v-for="(activity, index) in activities" :key="activity.id" class="relative pb-8">
                      <div v-if="index < activities.length - 1" class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"></div>
                      <div class="relative flex space-x-3">
                        <div>
                          <span :class="[
                            'h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white',
                            activity.type === 'success' ? 'bg-green-500' :
                            activity.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                          ]">
                            <i :class="activity.icon" class="text-white text-sm"></i>
                          </span>
                        </div>
                        <div class="flex-1 min-w-0">
                          <div>
                            <p class="text-sm text-gray-900">{{ activity.message }}</p>
                            <p class="text-xs text-gray-500">{{ activity.time }}</p>
                          </div>
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- Chart Card -->
            <div class="bg-white rounded-lg shadow">
              <div class="px-6 py-4 border-b border-gray-200">
                <h3 class="text-lg font-medium">Performance Chart</h3>
              </div>
              <div class="p-6">
                <div class="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div class="text-center">
                    <i class="fas fa-chart-line text-4xl text-gray-400 mb-4"></i>
                    <p class="text-gray-600">Chart Component Placeholder</p>
                    <p class="text-sm text-gray-500">Integrate with Chart.js or similar</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- Interactive Tab -->
      <div v-show="activeTab === 'interactive'" class="space-y-8">
        <!-- Toast Notifications -->
        <section class="bg-white rounded-lg shadow p-6">
          <h2 class="text-xl font-semibold mb-6">Toast Notifications</h2>
          
          <!-- Toast Types -->
          <div class="mb-6">
            <h3 class="text-md font-medium text-gray-900 mb-4">Toast Types</h3>
            <div class="grid grid-cols-2 md:grid-cols-5 gap-3">
              <button
                @click="showSuccessToast"
                class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
              >
                <i class="fas fa-check-circle mr-2"></i>
                Success
              </button>
              <button
                @click="showErrorToast"
                class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
              >
                <i class="fas fa-exclamation-circle mr-2"></i>
                Error
              </button>
              <button
                @click="showWarningToast"
                class="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 text-sm"
              >
                <i class="fas fa-exclamation-triangle mr-2"></i>
                Warning
              </button>
              <button
                @click="showInfoToast"
                class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
              >
                <i class="fas fa-info-circle mr-2"></i>
                Info
              </button>
              <button
                @click="showDarkToast"
                class="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 text-sm"
              >
                <i class="fas fa-bell mr-2"></i>
                Dark
              </button>
            </div>
          </div>

          <!-- Toast Positions -->
          <div class="mb-6">
            <h3 class="text-md font-medium text-gray-900 mb-4">Toast Positions</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button
                @click="showCenterToast"
                class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
              >
                <i class="fas fa-crosshairs mr-2"></i>
                Center
              </button>
              <button
                @click="showTopRightToast"
                class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
              >
                <i class="fas fa-arrow-up mr-2"></i>
                Top Right
              </button>
              <button
                @click="showTopLeftToast"
                class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
              >
                <i class="fas fa-arrow-up mr-2"></i>
                Top Left
              </button>
              <button
                @click="showBottomRightToast"
                class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
              >
                <i class="fas fa-arrow-down mr-2"></i>
                Bottom Right
              </button>
            </div>
          </div>

          <!-- Toast Options -->
          <div class="mb-6">
            <h3 class="text-md font-medium text-gray-900 mb-4">Toast Options</h3>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
              <button
                @click="showPermanentToast"
                class="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm"
              >
                <i class="fas fa-infinity mr-2"></i>
                Permanent
              </button>
              <button
                @click="showWithTitleToast"
                class="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm"
              >
                <i class="fas fa-heading mr-2"></i>
                With Title
              </button>
              <button
                @click="showProgressToast"
                class="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm"
              >
                <i class="fas fa-tasks mr-2"></i>
                With Progress
              </button>
            </div>
          </div>

          <!-- Clear All -->
          <div>
            <button
              @click="clearAllToasts"
              class="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
            >
              <i class="fas fa-trash mr-2"></i>
              Clear All Toasts
            </button>
          </div>
        </section>

        <!-- Dialog System -->
        <section class="bg-white rounded-lg shadow p-6">
          <h2 class="text-xl font-semibold mb-6">Dialog System</h2>
          
          <!-- Basic Alerts -->
          <div class="mb-6">
            <h3 class="text-md font-medium text-gray-900 mb-4">Alert Dialogs</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button
                @click="showAlertDialog"
                class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
              >
                <i class="fas fa-info-circle mr-2"></i>
                Alert
              </button>
              <button
                @click="showSuccessDialog"
                class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
              >
                <i class="fas fa-check-circle mr-2"></i>
                Success
              </button>
              <button
                @click="showWarningDialog"
                class="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 text-sm"
              >
                <i class="fas fa-exclamation-triangle mr-2"></i>
                Warning
              </button>
              <button
                @click="showErrorDialog"
                class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
              >
                <i class="fas fa-exclamation-circle mr-2"></i>
                Error
              </button>
            </div>
          </div>

          <!-- Confirm Dialogs -->
          <div class="mb-6">
            <h3 class="text-md font-medium text-gray-900 mb-4">Confirm Dialogs</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                @click="showBasicConfirmDialog"
                class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
              >
                <i class="fas fa-question-circle mr-2"></i>
                Confirm
              </button>
              <button
                @click="showConfirmDeleteDialog"
                class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
              >
                <i class="fas fa-trash mr-2"></i>
                Confirm Delete
              </button>
              <button
                @click="showPromptDialog"
                class="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm"
              >
                <i class="fas fa-edit mr-2"></i>
                Prompt Input
              </button>
            </div>
          </div>

          <!-- Dialog Examples -->
          <div class="mb-6">
            <h3 class="text-md font-medium text-gray-900 mb-4">Complex Examples</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                @click="showSaveConfirm"
                class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
              >
                <i class="fas fa-save mr-2"></i>
                Save Confirmation
              </button>
              <button
                @click="showUsernamePrompt"
                class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
              >
                <i class="fas fa-user-plus mr-2"></i>
                Username Prompt
              </button>
            </div>
          </div>

          <!-- Dialog Result Display -->
          <div v-if="lastDialogResult" class="mt-4 p-4 bg-gray-50 rounded-md">
            <p class="text-sm text-gray-600 mb-2">Last dialog result:</p>
            <pre class="text-xs text-gray-800 font-mono">{{ lastDialogResult }}</pre>
          </div>
        </section>

        <!-- Modals & Overlays -->
        <section class="bg-white rounded-lg shadow p-6">
          <h2 class="text-xl font-semibold mb-6">Modals & Overlays</h2>
          <div class="flex flex-wrap gap-4">
            <button
              @click="showModal = true"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Open Modal
            </button>
            <button
              @click="showNotification"
              class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Show Notification
            </button>
          </div>
        </section>

        <!-- Drag & Drop -->
        <section class="bg-white rounded-lg shadow p-6">
          <h2 class="text-xl font-semibold mb-6">Drag & Drop Lists</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div v-for="column in kanbanColumns" :key="column.id" class="bg-gray-50 rounded-lg p-4">
              <h3 class="font-medium text-gray-900 mb-4">{{ column.title }}</h3>
              <div
                @drop="onDrop($event, column.id)"
                @dragover.prevent
                @dragenter.prevent
                class="space-y-3 min-h-40"
              >
                <div
                  v-for="item in column.items"
                  :key="item.id"
                  @dragstart="onDragStart($event, item)"
                  draggable="true"
                  class="bg-white rounded-md p-3 shadow-sm cursor-move border-2 border-transparent hover:border-indigo-200"
                >
                  <p class="text-sm font-medium text-gray-900">{{ item.title }}</p>
                  <p class="text-xs text-gray-500 mt-1">{{ item.description }}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Progress Indicators -->
        <section class="bg-white rounded-lg shadow p-6">
          <h2 class="text-xl font-semibold mb-6">Progress Indicators</h2>
          <div class="space-y-6">
            <!-- Linear Progress -->
            <div>
              <div class="flex justify-between items-center mb-2">
                <span class="text-sm font-medium text-gray-700">Upload Progress</span>
                <span class="text-sm text-gray-600">{{ uploadProgress }}%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div
                  class="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  :style="{ width: uploadProgress + '%' }"
                ></div>
              </div>
            </div>

            <!-- Circular Progress -->
            <div class="flex items-center space-x-8">
              <div class="relative w-16 h-16">
                <svg class="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
                  <circle
                    cx="32" cy="32" r="28"
                    stroke="currentColor" stroke-width="4" fill="transparent"
                    class="text-gray-200"
                  />
                  <circle
                    cx="32" cy="32" r="28"
                    stroke="currentColor" stroke-width="4" fill="transparent"
                    :stroke-dasharray="circumference"
                    :stroke-dashoffset="circumference - (circularProgress / 100) * circumference"
                    class="text-green-500 transition-all duration-500"
                  />
                </svg>
                <div class="absolute inset-0 flex items-center justify-center">
                  <span class="text-sm font-medium text-gray-700">{{ circularProgress }}%</span>
                </div>
              </div>

              <div class="space-y-2">
                <button
                  @click="simulateProgress"
                  class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
                >
                  Start Progress
                </button>
                <button
                  @click="resetProgress"
                  class="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm block"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>

    <!-- Modal Component -->
    <div v-if="showModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="showModal = false"></div>
        
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                <i class="fas fa-info text-blue-600"></i>
              </div>
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 class="text-lg leading-6 font-medium text-gray-900">Modal Title</h3>
                <div class="mt-2">
                  <p class="text-sm text-gray-500">
                    This is an example modal component. You can customize it with different content, sizes, and animations.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              @click="showModal = false"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Notifications -->
    <div class="fixed top-4 right-4 z-50 space-y-2">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        class="bg-white rounded-lg shadow-lg border-l-4 border-green-500 p-4 max-w-sm transform transition-all duration-500"
        :class="notification.show ? 'translate-x-0' : 'translate-x-full'"
      >
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <i class="fas fa-check-circle text-green-500"></i>
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium text-gray-900">{{ notification.title }}</p>
            <p class="text-sm text-gray-500">{{ notification.message }}</p>
          </div>
          <div class="ml-auto">
            <button @click="removeNotification(notification.id)" class="text-gray-400 hover:text-gray-600">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed } from 'vue'
import { ErpBreadcrumb } from '../../../ui-kit/elements/breadcrumb'
import { 
  success as successToast, 
  error as errorToast, 
  warning as warningToast, 
  info as infoToast, 
  dark as darkToast, 
  toast 
} from '../../../ui-kit/composables/useToast'
import { 
  alert, 
  success, 
  warning, 
  error, 
  confirm, 
  confirmDelete, 
  prompt 
} from '../../../ui-kit/composables/useDialog'

export default {
  name: 'DummyUIElements',
  components: {
    ErpBreadcrumb
  },
  setup() {
    const breadcrumbItems = ref([
      { name: 'Dashboard', path: '/dummy/dashboard' },
      { name: 'UI Elements', path: '/dummy/elements', active: true }
    ])

    const activeTab = ref('forms')
    const tabs = ref([
      { id: 'forms', name: 'Forms', icon: 'fas fa-edit' },
      { id: 'data', name: 'Data Display', icon: 'fas fa-table' },
      { id: 'cards', name: 'Cards & Layout', icon: 'fas fa-th-large' },
      { id: 'interactive', name: 'Interactive', icon: 'fas fa-mouse-pointer' }
    ])

    // Form Data
    const formData = reactive({
      email: '',
      startDate: '',
      endDate: ''
    })

    const selectedSkills = ref([])
    const availableSkills = ref([
      'JavaScript', 'Vue.js', 'React', 'Node.js', 'Python', 'PHP', 'Laravel', 'MySQL', 'MongoDB', 'AWS'
    ])

    const rating = ref(0)
    const toggles = ref([
      { id: 'notifications', label: 'Email Notifications', value: true },
      { id: 'marketing', label: 'Marketing Emails', value: false },
      { id: 'updates', label: 'Product Updates', value: true }
    ])

    const previewImage = ref(null)
    const validationErrors = ref([])
    
    // Dialog Data
    const lastDialogResult = ref(null)

    // Advanced Form Elements Data
    const floatingInput = ref('')
    const priceInput = ref('')
    const passwordInput = ref('')
    const showPassword = ref(false)
    const selectedCountry = ref('')
    const selectedState = ref('')
    const selectedCity = ref('')
    const selectedTags = ref([])
    const tagSearch = ref('')
    const selectedColor = ref('#3B82F6')
    const priceRange = ref({ min: 100, max: 500 })
    const richTextContent = ref('')
    const selectedTime = ref({ hour: 9, minute: 0, period: 'AM' })
    
    // Searchable Select Data
    const selectedFramework = ref(null)
    const frameworkSearch = ref('')
    const isFrameworkDropdownOpen = ref(false)
    const highlightedFrameworkIndex = ref(-1)
    const selectedMembers = ref([])
    const memberSearch = ref('')
    const isMemberDropdownOpen = ref(false)

    // Static Data
    const colorPresets = ref(['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#06B6D4'])
    const availableTags = ref([
      'JavaScript', 'Vue.js', 'React', 'Node.js', 'Python', 'PHP', 'Laravel', 
      'MySQL', 'MongoDB', 'AWS', 'Docker', 'Kubernetes', 'GraphQL', 'TypeScript'
    ])
    const countries = ref([
      { code: 'TH', name: 'Thailand' },
      { code: 'US', name: 'United States' },
      { code: 'JP', name: 'Japan' }
    ])
    const locationData = ref({
      TH: {
        states: [
          { code: 'BKK', name: 'Bangkok', cities: ['Bangkok', 'Nonthaburi', 'Samut Prakan'] },
          { code: 'CNX', name: 'Chiang Mai', cities: ['Chiang Mai', 'Lamphun', 'Lampang'] }
        ]
      },
      US: {
        states: [
          { code: 'CA', name: 'California', cities: ['Los Angeles', 'San Francisco', 'San Diego'] },
          { code: 'NY', name: 'New York', cities: ['New York City', 'Buffalo', 'Albany'] }
        ]
      },
      JP: {
        states: [
          { code: 'TK', name: 'Tokyo', cities: ['Tokyo', 'Shibuya', 'Shinjuku'] },
          { code: 'OS', name: 'Osaka', cities: ['Osaka', 'Kyoto', 'Kobe'] }
        ]
      }
    })
    const editorTools = ref([
      { name: 'bold', icon: 'fas fa-bold', command: 'bold', title: 'Bold' },
      { name: 'italic', icon: 'fas fa-italic', command: 'italic', title: 'Italic' },
      { name: 'underline', icon: 'fas fa-underline', command: 'underline', title: 'Underline' },
      { name: 'link', icon: 'fas fa-link', command: 'createLink', title: 'Insert Link' },
      { name: 'list', icon: 'fas fa-list-ul', command: 'insertUnorderedList', title: 'Bullet List' }
    ])
    const minutes = ref([0, 15, 30, 45])
    const frameworks = ref([
      {
        id: 1,
        name: 'Vue.js',
        description: 'Progressive JavaScript Framework',
        logo: 'https://vuejs.org/images/logo.png'
      },
      {
        id: 2,
        name: 'React',
        description: 'JavaScript Library for Building UIs',
        logo: 'https://reactjs.org/favicon.ico'
      },
      {
        id: 3,
        name: 'Angular',
        description: 'TypeScript-based Web Framework',
        logo: 'https://angular.io/assets/images/logos/angular/angular.png'
      },
      {
        id: 4,
        name: 'Svelte',
        description: 'Cybernetically Enhanced Web Apps',
        logo: 'https://svelte.dev/favicon.png'
      },
      {
        id: 5,
        name: 'Next.js',
        description: 'React Framework for Production',
        logo: 'https://nextjs.org/favicon.ico'
      },
      {
        id: 6,
        name: 'Nuxt.js',
        description: 'Vue.js Framework for Server-side Rendering',
        logo: 'https://nuxtjs.org/icon.png'
      }
    ])
    const teamMembers = ref([
      {
        id: 1,
        name: 'John Doe',
        role: 'Frontend Developer',
        department: 'Engineering',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'
      },
      {
        id: 2,
        name: 'Jane Smith',
        role: 'UI/UX Designer',
        department: 'Design',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face'
      },
      {
        id: 3,
        name: 'Mike Johnson',
        role: 'Backend Developer',
        department: 'Engineering',
        avatar: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=32&h=32&fit=crop&crop=face'
      },
      {
        id: 4,
        name: 'Sarah Wilson',
        role: 'Product Manager',
        department: 'Product',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=32&h=32&fit=crop&crop=face'
      },
      {
        id: 5,
        name: 'Tom Brown',
        role: 'DevOps Engineer',
        department: 'Engineering',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face'
      },
      {
        id: 6,
        name: 'Lisa Davis',
        role: 'QA Engineer',
        department: 'Quality',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face'
      }
    ])

    // Table Data
    const searchQuery = ref('')
    const statusFilter = ref('')
    const sortColumn = ref('')
    const sortDirection = ref('asc')
    const selectedUsers = ref([])
    const currentPage = ref(1)
    const itemsPerPage = ref(10)

    const tableColumns = ref([
      { key: 'name', label: 'User' },
      { key: 'status', label: 'Status' },
      { key: 'role', label: 'Role' },
      { key: 'lastLogin', label: 'Last Login' }
    ])

    const users = ref([
      {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
        status: 'active',
        role: 'Admin',
        lastLogin: new Date('2024-01-15')
      },
      {
        id: 2,
        name: 'Jane Smith',
        email: 'jane@example.com',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face',
        status: 'inactive',
        role: 'User',
        lastLogin: new Date('2024-01-10')
      },
      {
        id: 3,
        name: 'Mike Johnson',
        email: 'mike@example.com',
        avatar: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=32&h=32&fit=crop&crop=face',
        status: 'pending',
        role: 'Manager',
        lastLogin: new Date('2024-01-12')
      }
    ])

    // Stats Cards
    const statsCards = ref([
      {
        id: 1,
        title: 'Total Users',
        value: '2,543',
        change: '+12%',
        trend: 'up',
        icon: 'fas fa-users',
        color: 'border-blue-500'
      },
      {
        id: 2,
        title: 'Revenue',
        value: '$45,231',
        change: '+8%',
        trend: 'up',
        icon: 'fas fa-dollar-sign',
        color: 'border-green-500'
      },
      {
        id: 3,
        title: 'Orders',
        value: '1,234',
        change: '-3%',
        trend: 'down',
        icon: 'fas fa-shopping-cart',
        color: 'border-orange-500'
      },
      {
        id: 4,
        title: 'Growth',
        value: '23.5%',
        change: '+5%',
        trend: 'up',
        icon: 'fas fa-chart-line',
        color: 'border-purple-500'
      }
    ])

    // Activities
    const activities = ref([
      {
        id: 1,
        message: 'New user registered',
        time: '2 minutes ago',
        type: 'success',
        icon: 'fas fa-user-plus'
      },
      {
        id: 2,
        message: 'Order #1234 completed',
        time: '1 hour ago',
        type: 'success',
        icon: 'fas fa-check'
      },
      {
        id: 3,
        message: 'System maintenance scheduled',
        time: '3 hours ago',
        type: 'warning',
        icon: 'fas fa-exclamation-triangle'
      }
    ])

    // Interactive Elements
    const showModal = ref(false)
    const notifications = ref([])
    const uploadProgress = ref(0)
    const circularProgress = ref(0)
    const circumference = ref(2 * Math.PI * 28)

    // Kanban Data
    const kanbanColumns = ref([
      {
        id: 'todo',
        title: 'To Do',
        items: [
          { id: 1, title: 'Design Homepage', description: 'Create new homepage design' },
          { id: 2, title: 'Fix Login Bug', description: 'Resolve authentication issue' }
        ]
      },
      {
        id: 'progress',
        title: 'In Progress',
        items: [
          { id: 3, title: 'API Integration', description: 'Connect to external API' }
        ]
      },
      {
        id: 'done',
        title: 'Done',
        items: [
          { id: 4, title: 'User Testing', description: 'Complete user testing phase' }
        ]
      }
    ])

    // Computed Properties
    const isValidEmail = computed(() => {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    })

    const filteredAndSortedUsers = computed(() => {
      let filtered = users.value

      // Filter by search
      if (searchQuery.value) {
        filtered = filtered.filter(user => 
          user.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.value.toLowerCase())
        )
      }

      // Filter by status
      if (statusFilter.value) {
        filtered = filtered.filter(user => user.status === statusFilter.value)
      }

      // Sort
      if (sortColumn.value) {
        filtered.sort((a, b) => {
          let aVal = a[sortColumn.value]
          let bVal = b[sortColumn.value]
          
          if (sortDirection.value === 'asc') {
            return aVal > bVal ? 1 : -1
          } else {
            return aVal < bVal ? 1 : -1
          }
        })
      }

      return filtered
    })

    const totalPages = computed(() => {
      return Math.ceil(filteredAndSortedUsers.value.length / itemsPerPage.value)
    })

    // Advanced Form Computed Properties
    const passwordStrength = computed(() => {
      const password = passwordInput.value
      if (!password) return { score: 0, text: 'No password', color: 'text-gray-400', width: '0%' }
      
      let score = 0
      if (password.length >= 8) score += 1
      if (/[a-z]/.test(password)) score += 1
      if (/[A-Z]/.test(password)) score += 1
      if (/\d/.test(password)) score += 1
      if (/[^A-Za-z\d]/.test(password)) score += 1

      const levels = [
        { text: 'Very Weak', color: 'text-red-600', width: '20%' },
        { text: 'Weak', color: 'text-orange-500', width: '40%' },
        { text: 'Fair', color: 'text-yellow-500', width: '60%' },
        { text: 'Good', color: 'text-blue-500', width: '80%' },
        { text: 'Strong', color: 'text-green-600', width: '100%' }
      ]

      return { score, ...levels[score - 1] || levels[0] }
    })

    const passwordStrengthColor = computed(() => passwordStrength.value.color)
    const passwordStrengthWidth = computed(() => passwordStrength.value.width)
    const passwordStrengthText = computed(() => passwordStrength.value.text)

    const availableStates = computed(() => {
      if (!selectedCountry.value || !locationData.value[selectedCountry.value]) return []
      return locationData.value[selectedCountry.value].states
    })

    const availableCities = computed(() => {
      if (!selectedState.value) return []
      const state = availableStates.value.find(s => s.code === selectedState.value)
      return state ? state.cities : []
    })

    const filteredTags = computed(() => {
      if (!tagSearch.value) return []
      return availableTags.value.filter(tag => 
        tag.toLowerCase().includes(tagSearch.value.toLowerCase()) &&
        !selectedTags.value.includes(tag)
      )
    })

    const filteredFrameworks = computed(() => {
      if (!frameworkSearch.value) return frameworks.value
      return frameworks.value.filter(framework =>
        framework.name.toLowerCase().includes(frameworkSearch.value.toLowerCase()) ||
        framework.description.toLowerCase().includes(frameworkSearch.value.toLowerCase())
      )
    })

    const filteredMembers = computed(() => {
      if (!memberSearch.value) return []
      return teamMembers.value.filter(member =>
        (member.name.toLowerCase().includes(memberSearch.value.toLowerCase()) ||
         member.role.toLowerCase().includes(memberSearch.value.toLowerCase()) ||
         member.department.toLowerCase().includes(memberSearch.value.toLowerCase())) &&
        !selectedMembers.value.find(selected => selected.id === member.id)
      )
    })

    // Methods
    const addSkill = (event) => {
      const skill = event.target.value
      if (skill && !selectedSkills.value.includes(skill)) {
        selectedSkills.value.push(skill)
      }
      event.target.value = ''
    }

    const removeSkill = (skill) => {
      const index = selectedSkills.value.indexOf(skill)
      if (index > -1) {
        selectedSkills.value.splice(index, 1)
      }
    }

    const setRating = (value) => {
      rating.value = value
    }

    const fileInputRef = ref(null)
    const richTextEditor = ref(null)
    const frameworkSearchInput = ref(null)

    const triggerFileInput = () => {
      if (fileInputRef.value) {
        fileInputRef.value.click()
      }
    }

    const handleFileUpload = (event) => {
      const file = event.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          previewImage.value = e.target.result
        }
        reader.readAsDataURL(file)
      }
    }

    const validateForm = () => {
      validationErrors.value = []
      
      if (!formData.email) {
        validationErrors.value.push('Email is required')
      } else if (!isValidEmail.value) {
        validationErrors.value.push('Please enter a valid email address')
      }
      
      if (!formData.startDate) {
        validationErrors.value.push('Start date is required')
      }
      
      if (!formData.endDate) {
        validationErrors.value.push('End date is required')
      }
      
      if (selectedSkills.value.length === 0) {
        validationErrors.value.push('Please select at least one skill')
      }

      if (validationErrors.value.length === 0) {
        showNotification('Form validation passed!', 'All fields are valid.')
      }
    }

    const sortBy = (column) => {
      if (sortColumn.value === column) {
        sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
      } else {
        sortColumn.value = column
        sortDirection.value = 'asc'
      }
    }

    const toggleAllSelection = (event) => {
      if (event.target.checked) {
        selectedUsers.value = filteredAndSortedUsers.value.map(user => user.id)
      } else {
        selectedUsers.value = []
      }
    }

    const exportData = () => {
      showNotification('Export Started', 'Your data is being exported...')
    }

    const formatDate = (date) => {
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }).format(date)
    }

    const showNotification = (title = 'Success', message = 'Operation completed successfully.') => {
      const id = Date.now()
      const notification = { id, title, message, show: false }
      notifications.value.push(notification)
      
      // Trigger animation
      setTimeout(() => {
        notification.show = true
      }, 100)
      
      // Auto remove after 5 seconds
      setTimeout(() => {
        removeNotification(id)
      }, 5000)
    }

    const removeNotification = (id) => {
      const index = notifications.value.findIndex(n => n.id === id)
      if (index > -1) {
        notifications.value[index].show = false
        setTimeout(() => {
          notifications.value.splice(index, 1)
        }, 300)
      }
    }

    const showConfirmDialog = () => {
      if (confirm('Are you sure you want to delete this item?')) {
        showNotification('Deleted', 'Item has been deleted successfully.')
      }
    }

    const simulateProgress = () => {
      uploadProgress.value = 0
      circularProgress.value = 0
      
      const interval = setInterval(() => {
        uploadProgress.value += Math.random() * 10
        circularProgress.value += Math.random() * 10
        
        if (uploadProgress.value >= 100) {
          uploadProgress.value = 100
          circularProgress.value = 100
          clearInterval(interval)
          showNotification('Complete!', 'Progress simulation finished.')
        }
      }, 200)
    }

    const resetProgress = () => {
      uploadProgress.value = 0
      circularProgress.value = 0
    }

    const onDragStart = (event, item) => {
      event.dataTransfer.dropEffect = 'move'
      event.dataTransfer.effectAllowed = 'move'
      event.dataTransfer.setData('item', JSON.stringify(item))
    }

    const onDrop = (event, columnId) => {
      const item = JSON.parse(event.dataTransfer.getData('item'))
      
      // Remove from old column
      kanbanColumns.value.forEach(column => {
        column.items = column.items.filter(i => i.id !== item.id)
      })
      
      // Add to new column
      const targetColumn = kanbanColumns.value.find(col => col.id === columnId)
      if (targetColumn) {
        targetColumn.items.push(item)
      }
    }

    // Advanced Form Methods
    const generatePassword = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
      let password = ''
      for (let i = 0; i < 12; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      passwordInput.value = password
    }

    const onCountryChange = () => {
      selectedState.value = ''
      selectedCity.value = ''
    }

    const onStateChange = () => {
      selectedCity.value = ''
    }

    const addTag = (tag) => {
      if (!selectedTags.value.includes(tag)) {
        selectedTags.value.push(tag)
      }
      tagSearch.value = ''
    }

    const removeTag = (tag) => {
      const index = selectedTags.value.indexOf(tag)
      if (index > -1) {
        selectedTags.value.splice(index, 1)
      }
    }

    const addCustomTag = () => {
      const tag = tagSearch.value.trim()
      if (tag && !selectedTags.value.includes(tag)) {
        selectedTags.value.push(tag)
        tagSearch.value = ''
      }
    }

    const applyFormat = (command) => {
      document.execCommand(command, false, null)
    }

    const updateRichText = (event) => {
      richTextContent.value = event.target.innerHTML
    }

    const formatTime = (time) => {
      const hour = time.hour === 0 ? 12 : time.hour > 12 ? time.hour - 12 : time.hour
      return `${String(hour).padStart(2, '0')}:${String(time.minute).padStart(2, '0')} ${time.period}`
    }

    // Searchable Select Methods
    const toggleFrameworkDropdown = () => {
      isFrameworkDropdownOpen.value = !isFrameworkDropdownOpen.value
      if (isFrameworkDropdownOpen.value) {
        frameworkSearch.value = ''
        highlightedFrameworkIndex.value = -1
      }
    }

    const closeFrameworkDropdown = () => {
      isFrameworkDropdownOpen.value = false
      frameworkSearch.value = ''
      highlightedFrameworkIndex.value = -1
    }

    const selectFramework = (framework) => {
      selectedFramework.value = framework
      closeFrameworkDropdown()
    }

    const selectFirstFramework = () => {
      if (filteredFrameworks.value.length > 0) {
        selectFramework(filteredFrameworks.value[0])
      }
    }

    const navigateFrameworkDown = () => {
      if (highlightedFrameworkIndex.value < filteredFrameworks.value.length - 1) {
        highlightedFrameworkIndex.value++
      }
    }

    const navigateFrameworkUp = () => {
      if (highlightedFrameworkIndex.value > 0) {
        highlightedFrameworkIndex.value--
      }
    }

    const addMember = (member) => {
      if (!selectedMembers.value.find(m => m.id === member.id)) {
        selectedMembers.value.push(member)
      }
      memberSearch.value = ''
    }

    const removeMember = (member) => {
      const index = selectedMembers.value.findIndex(m => m.id === member.id)
      if (index > -1) {
        selectedMembers.value.splice(index, 1)
      }
    }

    const closeMemberDropdown = () => {
      isMemberDropdownOpen.value = false
      memberSearch.value = ''
    }

    const selectFirstMember = () => {
      if (filteredMembers.value.length > 0) {
        addMember(filteredMembers.value[0])
      }
    }

    // Toast Methods
    const showSuccessToast = () => {
      successToast('Operation completed successfully!', {
        title: 'Success',
        position: 'top-right'
      })
    }

    const showErrorToast = () => {
      errorToast('Something went wrong. Please try again.', {
        title: 'Error',
        position: 'top-right'
      })
    }

    const showWarningToast = () => {
      warningToast('Please check your input and try again.', {
        title: 'Warning',
        position: 'top-right'
      })
    }

    const showInfoToast = () => {
      infoToast('Here is some important information for you.', {
        title: 'Information',
        position: 'top-right'
      })
    }

    const showDarkToast = () => {
      darkToast('This is a dark themed notification.', {
        title: 'Notification',
        position: 'top-right'
      })
    }

    const showCenterToast = () => {
      toast({
        message: 'This toast appears in the center of the screen.',
        title: 'Center Toast',
        type: 'info',
        position: 'center',
        duration: 4000
      })
    }

    const showTopRightToast = () => {
      toast({
        message: 'This toast appears in the top-right corner.',
        title: 'Top Right',
        type: 'success',
        position: 'top-right'
      })
    }

    const showTopLeftToast = () => {
      toast({
        message: 'This toast appears in the top-left corner.',
        title: 'Top Left',
        type: 'warning',
        position: 'top-left'
      })
    }

    const showBottomRightToast = () => {
      toast({
        message: 'This toast appears in the bottom-right corner.',
        title: 'Bottom Right',
        type: 'error',
        position: 'bottom-right'
      })
    }

    const showPermanentToast = () => {
      toast({
        message: 'This toast will not disappear automatically. Click the X to close it.',
        title: 'Permanent Toast',
        type: 'dark',
        position: 'top-right',
        duration: 0
      })
    }

    const showWithTitleToast = () => {
      toast({
        message: 'This toast has both a title and a message to show more detailed information.',
        title: 'Detailed Notification',
        type: 'info',
        position: 'top-right',
        duration: 6000
      })
    }

    const showProgressToast = () => {
      toast({
        message: 'Watch the progress bar at the bottom of this toast.',
        title: 'Progress Toast',
        type: 'success',
        position: 'top-right',
        duration: 8000
      })
    }

    const clearAllToasts = () => {
      toast.clear()
    }

    // Dialog Methods
    const showAlertDialog = async () => {
      const result = await alert('This is a basic alert dialog. Click OK to continue.')
      lastDialogResult.value = { type: 'alert', result }
    }

    const showSuccessDialog = async () => {
      const result = await success('Operation completed successfully! Your data has been saved.')
      lastDialogResult.value = { type: 'success', result }
    }

    const showWarningDialog = async () => {
      const result = await warning('Please review your information before proceeding. Some fields may need attention.')
      lastDialogResult.value = { type: 'warning', result }
    }

    const showErrorDialog = async () => {
      const result = await error('An error occurred while processing your request. Please try again later.')
      lastDialogResult.value = { type: 'error', result }
    }

    const showBasicConfirmDialog = async () => {
      const result = await confirm('Are you sure you want to proceed with this action?')
      lastDialogResult.value = { type: 'confirm', result, message: result ? 'User confirmed' : 'User cancelled' }
    }

    const showConfirmDeleteDialog = async () => {
      const result = await confirmDelete('Are you sure you want to delete this item? This action cannot be undone.')
      lastDialogResult.value = { type: 'confirmDelete', result, message: result ? 'User confirmed deletion' : 'User cancelled deletion' }
    }

    const showPromptDialog = async () => {
      const result = await prompt('Please enter your name:', 'John Doe')
      lastDialogResult.value = { type: 'prompt', result, message: result ? `User entered: "${result}"` : 'User cancelled' }
    }

    const showSaveConfirm = async () => {
      const result = await confirm('Do you want to save your changes before leaving this page?')
      if (result) {
        await success('Changes saved successfully!')
        lastDialogResult.value = { type: 'saveFlow', result: 'saved' }
      } else {
        lastDialogResult.value = { type: 'saveFlow', result: 'discarded' }
      }
    }

    const showUsernamePrompt = async () => {
      const username = await prompt('Enter a username for your new account:', '')
      if (username) {
        if (username.length < 3) {
          await error('Username must be at least 3 characters long.')
          lastDialogResult.value = { type: 'usernameFlow', result: 'error', username }
        } else {
          await success(`Username "${username}" is available and has been reserved for you.`)
          lastDialogResult.value = { type: 'usernameFlow', result: 'success', username }
        }
      } else {
        lastDialogResult.value = { type: 'usernameFlow', result: 'cancelled' }
      }
    }

    return {
      breadcrumbItems,
      activeTab,
      tabs,
      formData,
      selectedSkills,
      availableSkills,
      rating,
      toggles,
      previewImage,
      validationErrors,
      searchQuery,
      statusFilter,
      sortColumn,
      sortDirection,
      selectedUsers,
      currentPage,
      itemsPerPage,
      tableColumns,
      users,
      statsCards,
      activities,
      showModal,
      notifications,
      uploadProgress,
      circularProgress,
      circumference,
      kanbanColumns,
      isValidEmail,
      filteredAndSortedUsers,
      totalPages,
      addSkill,
      removeSkill,
      setRating,
      fileInputRef,
      richTextEditor,
      triggerFileInput,
      handleFileUpload,
      validateForm,
      sortBy,
      toggleAllSelection,
      exportData,
      formatDate,
      showNotification,
      removeNotification,
      showConfirmDialog,
      simulateProgress,
      resetProgress,
      onDragStart,
      onDrop,
      // Advanced Form Elements
      floatingInput,
      priceInput,
      passwordInput,
      showPassword,
      passwordStrengthColor,
      passwordStrengthWidth,
      passwordStrengthText,
      selectedCountry,
      selectedState,
      selectedCity,
      countries,
      availableStates,
      availableCities,
      selectedTags,
      tagSearch,
      filteredTags,
      availableTags,
      selectedColor,
      colorPresets,
      priceRange,
      editorTools,
      selectedTime,
      minutes,
      generatePassword,
      onCountryChange,
      onStateChange,
      addTag,
      removeTag,
      addCustomTag,
      applyFormat,
      updateRichText,
      formatTime,
      // Searchable Select
      selectedFramework,
      frameworkSearch,
      frameworkSearchInput,
      isFrameworkDropdownOpen,
      highlightedFrameworkIndex,
      frameworks,
      filteredFrameworks,
      toggleFrameworkDropdown,
      closeFrameworkDropdown,
      selectFramework,
      selectFirstFramework,
      navigateFrameworkDown,
      navigateFrameworkUp,
      selectedMembers,
      memberSearch,
      isMemberDropdownOpen,
      teamMembers,
      filteredMembers,
      addMember,
      removeMember,
      closeMemberDropdown,
      selectFirstMember,
      // Toast Methods
      showSuccessToast,
      showErrorToast,
      showWarningToast,
      showInfoToast,
      showDarkToast,
      showCenterToast,
      showTopRightToast,
      showTopLeftToast,
      showBottomRightToast,
      showPermanentToast,
      showWithTitleToast,
      showProgressToast,
      clearAllToasts,
      // Dialog Methods & Data
      lastDialogResult,
      showAlertDialog,
      showSuccessDialog,
      showWarningDialog,
      showErrorDialog,
      showBasicConfirmDialog,
      showConfirmDeleteDialog,
      showPromptDialog,
      showSaveConfirm,
      showUsernamePrompt
    }
  }
}
</script>

<style scoped>
.rotate-180 {
  transform: rotate(180deg);
}

/* Smooth transitions */
.transition-all {
  transition: all 0.2s ease-in-out;
}

/* Focus styles for better accessibility */
.focus\:ring-2:focus {
  --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);
  --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color);
  box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);
}

/* Custom scrollbar for dropdowns */
.overflow-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.overflow-auto::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.overflow-auto::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>