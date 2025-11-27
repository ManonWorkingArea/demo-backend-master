<template>
  <div class="tab-content">
    <div
      class="content-editor overflow-auto bg-white rounded-lg h-full"
    >
      <!-- Section Header -->
      <div class="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <font-awesome-icon :icon="['fas', 'palette']" class="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <h3 class="text-lg font-semibold text-gray-900">Style Configuration</h3>
            <p class="text-sm text-gray-500">ตั้งค่าการแสดงผลของเนื้อหา</p>
          </div>
        </div>
      </div>

      <div class="px-6 py-4">
        <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <!-- Left Column -->
          <div class="space-y-6">
            <!-- Position Section -->
            <div class="bg-white border border-gray-200 rounded-lg shadow-sm">
              <div class="bg-gray-50 border-b border-gray-200 px-4 py-3 rounded-t-lg">
                <div class="flex items-center space-x-2">
                  <font-awesome-icon :icon="['fas', 'arrows-alt']" class="h-4 w-4 text-gray-600" />
                  <span class="text-sm font-semibold text-gray-700">Element Position</span>
                </div>
                <p class="text-xs text-gray-500 mt-1">ตำแหน่งของวัตถุ (Position)</p>
              </div>
              <div class="p-4">
                <div class="grid grid-cols-2 gap-3">
                  <label class="relative cursor-pointer group">
                    <input
                      type="radio"
                      value="static"
                      :checked="selectedItem.position === 'static'"
                      @change="$emit('update-selected-item-property', { property: 'position', value: $event.target.value })"
                      class="sr-only"
                    />
                    <div class="border-2 rounded-lg p-3 transition-all duration-200 flex flex-col items-center justify-center h-20"
                         :class="selectedItem.position === 'static' 
                           ? 'border-blue-500 bg-blue-50 shadow-md' 
                           : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'">
                      <img
                        src="https://vue-project.sgp1.digitaloceanspaces.com/ui-icon/staticpng.png"
                        alt="Static"
                        class="w-8 h-8 mb-1"
                      />
                      <span class="text-xs font-medium"
                            :class="selectedItem.position === 'static' ? 'text-blue-700' : 'text-gray-700'">
                        Static
                      </span>
                    </div>
                  </label>

                  <label class="relative cursor-pointer group">
                    <input
                      type="radio"
                      value="relative"
                      :checked="selectedItem.position === 'relative'"
                      @change="$emit('update-selected-item-property', { property: 'position', value: $event.target.value })"
                      class="sr-only"
                    />
                    <div class="border-2 rounded-lg p-3 transition-all duration-200 flex flex-col items-center justify-center h-20"
                         :class="selectedItem.position === 'relative' 
                           ? 'border-blue-500 bg-blue-50 shadow-md' 
                           : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'">
                      <img
                        src="https://vue-project.sgp1.digitaloceanspaces.com/ui-icon/relativepng.png"
                        alt="Relative"
                        class="w-8 h-8 mb-1"
                      />
                      <span class="text-xs font-medium"
                            :class="selectedItem.position === 'relative' ? 'text-blue-700' : 'text-gray-700'">
                        Relative
                      </span>
                    </div>
                  </label>

                  <label class="relative cursor-pointer group">
                    <input
                      type="radio"
                      value="absolute"
                      :checked="selectedItem.position === 'absolute'"
                      @change="$emit('update-selected-item-property', { property: 'position', value: $event.target.value })"
                      class="sr-only"
                    />
                    <div class="border-2 rounded-lg p-3 transition-all duration-200 flex flex-col items-center justify-center h-20"
                         :class="selectedItem.position === 'absolute' 
                           ? 'border-blue-500 bg-blue-50 shadow-md' 
                           : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'">
                      <img
                        src="https://vue-project.sgp1.digitaloceanspaces.com/ui-icon/absolutepng.png"
                        alt="Absolute"
                        class="w-8 h-8 mb-1"
                      />
                      <span class="text-xs font-medium"
                            :class="selectedItem.position === 'absolute' ? 'text-blue-700' : 'text-gray-700'">
                        Absolute
                      </span>
                    </div>
                  </label>

                  <label class="relative cursor-pointer group">
                    <input
                      type="radio"
                      value="fixed"
                      :checked="selectedItem.position === 'fixed'"
                      @change="$emit('update-selected-item-property', { property: 'position', value: $event.target.value })"
                      class="sr-only"
                    />
                    <div class="border-2 rounded-lg p-3 transition-all duration-200 flex flex-col items-center justify-center h-20"
                         :class="selectedItem.position === 'fixed' 
                           ? 'border-blue-500 bg-blue-50 shadow-md' 
                           : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'">
                      <img
                        src="https://vue-project.sgp1.digitaloceanspaces.com/ui-icon/fixedpng.png"
                        alt="Fixed"
                        class="w-8 h-8 mb-1"
                      />
                      <span class="text-xs font-medium"
                            :class="selectedItem.position === 'fixed' ? 'text-blue-700' : 'text-gray-700'">
                        Fixed
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <!-- Background Section -->
            <div class="bg-white border border-gray-200 rounded-lg shadow-sm">
              <div class="bg-gray-50 border-b border-gray-200 px-4 py-3 rounded-t-lg">
                <div class="flex items-center space-x-2">
                  <font-awesome-icon :icon="['fas', 'fill-drip']" class="h-4 w-4 text-gray-600" />
                  <span class="text-sm font-semibold text-gray-700">Background Settings</span>
                </div>
              </div>
              <div class="p-4 space-y-4">
                <!-- Background Type -->
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-gray-700">Background Type</label>
                  <select
                    :value="selectedItem.bgType"
                    @change="$emit('update-selected-item-property', { property: 'bgType', value: $event.target.value })"
                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="none">None</option>
                    <option value="color">Color</option>
                    <option value="image">Image</option>
                    <option value="gradient">Gradient</option>
                    <option value="video">Video</option>
                  </select>
                </div>

                <!-- Background Color -->
                <div v-if="selectedItem.bgType === 'color'" class="space-y-2">
                  <label class="block text-sm font-medium text-gray-700">Background Color</label>
                  <div class="flex items-center space-x-3">
                    <div class="relative flex-1">
                      <input
                        :value="selectedItem.bgColor"
                        @input="$emit('update-selected-item-property', { property: 'bgColor', value: $event.target.value })"
                        type="text"
                        placeholder="#000000"
                        class="w-full px-3 py-2 pr-12 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        @click="$emit('show-color-picker', 'bgColor')"
                      />
                      <!-- Color Swatch -->
                      <div 
                        class="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-6 border border-gray-300 rounded cursor-pointer"
                        :style="{ backgroundColor: selectedItem.bgColor || '#ffffff' }"
                        @click="$emit('show-color-picker', 'bgColor')"
                      ></div>
                    </div>
                    <!-- Color Picker -->
                    <div v-if="showColorPickerField === 'bgColor'" class="relative">
                      <input
                        class="w-12 h-10 border-2 border-gray-300 rounded-lg shadow-sm cursor-pointer"
                        type="color"
                        :value="selectedItem.bgColor || '#ffffff'"
                        @input="$emit('update-color-value', { fieldName: 'bgColor', value: $event.target.value })"
                        @click.stop
                      />
                    </div>
                  </div>
                </div>

                <!-- Background Image -->
                <div v-else-if="selectedItem.bgType === 'image'" class="space-y-2">
                  <label class="block text-sm font-medium text-gray-700">Image URL</label>
                  <input
                    :value="selectedItem.bgImage"
                    @input="$emit('update-selected-item-property', { property: 'bgImage', value: $event.target.value })"
                    type="text"
                    placeholder="https://example.com/image.jpg"
                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <!-- Background Video -->
                <div v-else-if="selectedItem.bgType === 'video'" class="space-y-2">
                  <label class="block text-sm font-medium text-gray-700">Video URL</label>
                  <input
                    :value="selectedItem.bgVideo"
                    @input="$emit('update-selected-item-property', { property: 'bgVideo', value: $event.target.value })"
                    type="text"
                    placeholder="https://example.com/video.mp4"
                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <!-- Gradient Colors -->
                <div v-if="selectedItem.bgType === 'gradient'" class="grid grid-cols-1 gap-4">
                  <div class="space-y-2">
                    <label class="block text-sm font-medium text-gray-700">Gradient Color 1</label>
                    <div class="flex items-center space-x-3">
                      <div class="relative flex-1">
                        <input
                          :value="selectedItem.bgGradientColor1"
                          @input="$emit('update-selected-item-property', { property: 'bgGradientColor1', value: $event.target.value })"
                          type="text"
                          placeholder="#000000"
                          class="w-full px-3 py-2 pr-12 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          @click="$emit('show-color-picker', 'bgGradientColor1')"
                        />
                        <!-- Color Swatch -->
                        <div 
                          class="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-6 border border-gray-300 rounded cursor-pointer"
                          :style="{ backgroundColor: selectedItem.bgGradientColor1 || '#000000' }"
                          @click="$emit('show-color-picker', 'bgGradientColor1')"
                        ></div>
                      </div>
                      <!-- Color Picker -->
                      <div v-if="showColorPickerField === 'bgGradientColor1'" class="relative">
                        <input
                          class="w-12 h-10 border-2 border-gray-300 rounded-lg shadow-sm cursor-pointer"
                          type="color"
                          :value="selectedItem.bgGradientColor1 || '#000000'"
                          @input="$emit('update-color-value', { fieldName: 'bgGradientColor1', value: $event.target.value })"
                          @click.stop
                        />
                      </div>
                    </div>
                  </div>
                  <div class="space-y-2">
                    <label class="block text-sm font-medium text-gray-700">Gradient Color 2</label>
                    <div class="flex items-center space-x-3">
                      <div class="relative flex-1">
                        <input
                          :value="selectedItem.bgGradientColor2"
                          @input="$emit('update-selected-item-property', { property: 'bgGradientColor2', value: $event.target.value })"
                          type="text"
                          placeholder="#ffffff"
                          class="w-full px-3 py-2 pr-12 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          @click="$emit('show-color-picker', 'bgGradientColor2')"
                        />
                        <!-- Color Swatch -->
                        <div 
                          class="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-6 border border-gray-300 rounded cursor-pointer"
                          :style="{ backgroundColor: selectedItem.bgGradientColor2 || '#ffffff' }"
                          @click="$emit('show-color-picker', 'bgGradientColor2')"
                        ></div>
                      </div>
                      <!-- Color Picker -->
                      <div v-if="showColorPickerField === 'bgGradientColor2'" class="relative">
                        <input
                          class="w-12 h-10 border-2 border-gray-300 rounded-lg shadow-sm cursor-pointer"
                          type="color"
                          :value="selectedItem.bgGradientColor2 || '#ffffff'"
                          @input="$emit('update-color-value', { fieldName: 'bgGradientColor2', value: $event.target.value })"
                          @click.stop
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Inner Background Section (for Row type only) -->
            <div v-if="selectedItem.type === 'row'" class="bg-white border border-gray-200 rounded-lg shadow-sm">
              <div class="bg-gray-50 border-b border-gray-200 px-4 py-3 rounded-t-lg">
                <div class="flex items-center space-x-2">
                  <font-awesome-icon :icon="['fas', 'layer-group']" class="h-4 w-4 text-gray-600" />
                  <span class="text-sm font-semibold text-gray-700">Inner Background Settings</span>
                </div>
                <p class="text-xs text-gray-500 mt-1">พื้นหลังด้านในของ Row</p>
              </div>
              <div class="p-4 space-y-4">
                <!-- Inner Background Type -->
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-gray-700">Inner Background Type</label>
                  <select
                    :value="selectedItem.bgInnerType"
                    @change="$emit('update-selected-item-property', { property: 'bgInnerType', value: $event.target.value })"
                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="none">None</option>
                    <option value="color">Color</option>
                    <option value="image">Image</option>
                    <option value="gradient">Gradient</option>
                    <option value="video">Video</option>
                  </select>
                </div>

                <!-- Inner Background Color -->
                <div v-if="selectedItem.bgInnerType === 'color'" class="space-y-2">
                  <label class="block text-sm font-medium text-gray-700">Inner Background Color</label>
                  <div class="flex items-center space-x-3">
                    <div class="relative flex-1">
                      <input
                        :value="selectedItem.bgInnerColor"
                        @input="$emit('update-selected-item-property', { property: 'bgInnerColor', value: $event.target.value })"
                        type="text"
                        placeholder="#000000"
                        class="w-full px-3 py-2 pr-12 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        @click="$emit('show-color-picker', 'bgInnerColor')"
                      />
                      <!-- Color Swatch -->
                      <div 
                        class="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-6 border border-gray-300 rounded cursor-pointer"
                        :style="{ backgroundColor: selectedItem.bgInnerColor || '#ffffff' }"
                        @click="$emit('show-color-picker', 'bgInnerColor')"
                      ></div>
                    </div>
                    <!-- Color Picker -->
                    <div v-if="showColorPickerField === 'bgInnerColor'" class="relative">
                      <input
                        class="w-12 h-10 border-2 border-gray-300 rounded-lg shadow-sm cursor-pointer"
                        type="color"
                        :value="selectedItem.bgInnerColor || '#ffffff'"
                        @input="$emit('update-color-value', { fieldName: 'bgInnerColor', value: $event.target.value })"
                        @click.stop
                      />
                    </div>
                  </div>
                </div>

                <!-- Inner Background Image -->
                <div v-else-if="selectedItem.bgInnerType === 'image'" class="space-y-2">
                  <label class="block text-sm font-medium text-gray-700">Inner Image URL</label>
                  <input
                    :value="selectedItem.bgInnerImage"
                    @input="$emit('update-selected-item-property', { property: 'bgInnerImage', value: $event.target.value })"
                    type="text"
                    placeholder="https://example.com/image.jpg"
                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <!-- Inner Background Video -->
                <div v-else-if="selectedItem.bgInnerType === 'video'" class="space-y-2">
                  <label class="block text-sm font-medium text-gray-700">Inner Video URL</label>
                  <input
                    :value="selectedItem.bgInnerVideo"
                    @input="$emit('update-selected-item-property', { property: 'bgInnerVideo', value: $event.target.value })"
                    type="text"
                    placeholder="https://example.com/video.mp4"
                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <!-- Inner Gradient Colors -->
                <div v-if="selectedItem.bgInnerType === 'gradient'" class="grid grid-cols-1 gap-4">
                  <div class="space-y-2">
                    <label class="block text-sm font-medium text-gray-700">Inner Gradient Color 1</label>
                    <div class="flex items-center space-x-3">
                      <div class="relative flex-1">
                        <input
                          :value="selectedItem.bgInnerGradientColor1"
                          @input="$emit('update-selected-item-property', { property: 'bgInnerGradientColor1', value: $event.target.value })"
                          type="text"
                          placeholder="#000000"
                          class="w-full px-3 py-2 pr-12 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          @click="$emit('show-color-picker', 'bgInnerGradientColor1')"
                        />
                        <!-- Color Swatch -->
                        <div 
                          class="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-6 border border-gray-300 rounded cursor-pointer"
                          :style="{ backgroundColor: selectedItem.bgInnerGradientColor1 || '#000000' }"
                          @click="$emit('show-color-picker', 'bgInnerGradientColor1')"
                        ></div>
                      </div>
                      <!-- Color Picker -->
                      <div v-if="showColorPickerField === 'bgInnerGradientColor1'" class="relative">
                        <input
                          class="w-12 h-10 border-2 border-gray-300 rounded-lg shadow-sm cursor-pointer"
                          type="color"
                          :value="selectedItem.bgInnerGradientColor1 || '#000000'"
                          @input="$emit('update-color-value', { fieldName: 'bgInnerGradientColor1', value: $event.target.value })"
                          @click.stop
                        />
                      </div>
                    </div>
                  </div>
                  <div class="space-y-2">
                    <label class="block text-sm font-medium text-gray-700">Inner Gradient Color 2</label>
                    <div class="flex items-center space-x-3">
                      <div class="relative flex-1">
                        <input
                          :value="selectedItem.bgInnerGradientColor2"
                          @input="$emit('update-selected-item-property', { property: 'bgInnerGradientColor2', value: $event.target.value })"
                          type="text"
                          placeholder="#ffffff"
                          class="w-full px-3 py-2 pr-12 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          @click="$emit('show-color-picker', 'bgInnerGradientColor2')"
                        />
                        <!-- Color Swatch -->
                        <div 
                          class="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-6 border border-gray-300 rounded cursor-pointer"
                          :style="{ backgroundColor: selectedItem.bgInnerGradientColor2 || '#ffffff' }"
                          @click="$emit('show-color-picker', 'bgInnerGradientColor2')"
                        ></div>
                      </div>
                      <!-- Color Picker -->
                      <div v-if="showColorPickerField === 'bgInnerGradientColor2'" class="relative">
                        <input
                          class="w-12 h-10 border-2 border-gray-300 rounded-lg shadow-sm cursor-pointer"
                          type="color"
                          :value="selectedItem.bgInnerGradientColor2 || '#ffffff'"
                          @input="$emit('update-color-value', { fieldName: 'bgInnerGradientColor2', value: $event.target.value })"
                          @click.stop
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column -->
          <div class="space-y-6">
            <!-- Border Section -->
            <div class="bg-white border border-gray-200 rounded-lg shadow-sm">
              <div class="bg-gray-50 border-b border-gray-200 px-4 py-3 rounded-t-lg">
                <div class="flex items-center space-x-2">
                  <font-awesome-icon :icon="['fas', 'border-style']" class="h-4 w-4 text-gray-600" />
                  <span class="text-sm font-semibold text-gray-700">Border Settings</span>
                </div>
              </div>
              <div class="p-4 space-y-4">
                <!-- Border Style & Color in one row -->
                <div class="grid grid-cols-1 gap-4">
                  <div class="space-y-2">
                    <label class="block text-sm font-medium text-gray-700">Border Style</label>
                    <select
                      :value="selectedItem.borderStyle"
                      @change="$emit('update-selected-item-property', { property: 'borderStyle', value: $event.target.value })"
                      class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="none">None</option>
                      <option value="solid">Solid</option>
                      <option value="dotted">Dotted</option>
                      <option value="dashed">Dashed</option>
                      <option value="double">Double</option>
                      <option value="hidden">Hidden</option>
                    </select>
                  </div>
                  <div v-if="selectedItem.borderStyle !== 'none'" class="space-y-2">
                    <label class="block text-sm font-medium text-gray-700">Border Color</label>
                    <div class="flex items-center space-x-3">
                      <div class="relative flex-1">
                        <input
                          :value="selectedItem.borderColor"
                          @input="$emit('update-selected-item-property', { property: 'borderColor', value: $event.target.value })"
                          type="text"
                          placeholder="#000000"
                          class="w-full px-3 py-2 pr-12 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          @click="$emit('show-color-picker', 'borderColor')"
                        />
                        <!-- Color Swatch -->
                        <div 
                          class="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-6 border border-gray-300 rounded cursor-pointer"
                          :style="{ backgroundColor: selectedItem.borderColor || '#000000' }"
                          @click="$emit('show-color-picker', 'borderColor')"
                        ></div>
                      </div>
                      <!-- Color Picker -->
                      <div v-if="showColorPickerField === 'borderColor'" class="relative">
                        <input
                          class="w-12 h-10 border-2 border-gray-300 rounded-lg shadow-sm cursor-pointer"
                          type="color"
                          :value="selectedItem.borderColor || '#000000'"
                          @input="$emit('update-color-value', { fieldName: 'borderColor', value: $event.target.value })"
                          @click.stop
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Border Width -->
                <div v-if="selectedItem.borderStyle !== 'none'">
                  <label class="block text-sm font-medium text-gray-700 mb-3">Border Width</label>
                  <div class="grid grid-cols-2 gap-3">
                    <div class="space-y-2">
                      <label class="block text-xs font-medium text-gray-500 uppercase tracking-wide">Top</label>
                      <input
                        :value="selectedItem.borderTopWidth"
                        @input="$emit('update-selected-item-property', { property: 'borderTopWidth', value: $event.target.value })"
                        type="text"
                        placeholder="0"
                        class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div class="space-y-2">
                      <label class="block text-xs font-medium text-gray-500 uppercase tracking-wide">Right</label>
                      <input
                        :value="selectedItem.borderRightWidth"
                        @input="$emit('update-selected-item-property', { property: 'borderRightWidth', value: $event.target.value })"
                        type="text"
                        placeholder="0"
                        class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div class="space-y-2">
                      <label class="block text-xs font-medium text-gray-500 uppercase tracking-wide">Bottom</label>
                      <input
                        :value="selectedItem.borderBottomWidth"
                        @input="$emit('update-selected-item-property', { property: 'borderBottomWidth', value: $event.target.value })"
                        type="text"
                        placeholder="0"
                        class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div class="space-y-2">
                      <label class="block text-xs font-medium text-gray-500 uppercase tracking-wide">Left</label>
                      <input
                        :value="selectedItem.borderLeftWidth"
                        @input="$emit('update-selected-item-property', { property: 'borderLeftWidth', value: $event.target.value })"
                        type="text"
                        placeholder="0"
                        class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <!-- Border Radius -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-3">Border Radius</label>
                  <div class="grid grid-cols-2 gap-3">
                    <div class="space-y-2">
                      <label class="block text-xs font-medium text-gray-500 uppercase tracking-wide">Top Left</label>
                      <input
                        :value="selectedItem.borderRadiusTopLeft"
                        @input="$emit('update-selected-item-property', { property: 'borderRadiusTopLeft', value: $event.target.value })"
                        type="text"
                        placeholder="0"
                        class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div class="space-y-2">
                      <label class="block text-xs font-medium text-gray-500 uppercase tracking-wide">Top Right</label>
                      <input
                        :value="selectedItem.borderRadiusTopRight"
                        @input="$emit('update-selected-item-property', { property: 'borderRadiusTopRight', value: $event.target.value })"
                        type="text"
                        placeholder="0"
                        class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div class="space-y-2">
                      <label class="block text-xs font-medium text-gray-500 uppercase tracking-wide">Bottom Left</label>
                      <input
                        :value="selectedItem.borderRadiusBottomLeft"
                        @input="$emit('update-selected-item-property', { property: 'borderRadiusBottomLeft', value: $event.target.value })"
                        type="text"
                        placeholder="0"
                        class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div class="space-y-2">
                      <label class="block text-xs font-medium text-gray-500 uppercase tracking-wide">Bottom Right</label>
                      <input
                        :value="selectedItem.borderRadiusBottomRight"
                        @input="$emit('update-selected-item-property', { property: 'borderRadiusBottomRight', value: $event.target.value })"
                        type="text"
                        placeholder="0"
                        class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
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
export default {
  name: 'StyleTab',
  props: {
    selectedItem: {
      type: Object,
      required: true,
    },
    showColorPickerField: {
      type: String,
      default: null,
    },
    // หากมีการใช้ divStyles หรือ fullScreenMode ใน template นี้ ก็ต้องเพิ่ม props ด้วย
    // fullScreenMode: {
    //   type: Boolean,
    //   default: false,
    // }
  },
  emits: ['show-color-picker', 'update-selected-item-property', 'update-color-value'],
  // data() {
  //   return {
  //     // หากต้องการจัดการ local state บางอย่างภายใน component นี้
  //   };
  // },
  // computed: {
  //   // หากมีการใช้ divStyles ใน template นี้
  //   // divStyles() {
  //   //   if (this.fullScreenMode) { // สมมติว่า fullScreenMode ถูก pass มาเป็น prop
  //   //     const height = `calc(100vh - Xpx)`; // ปรับ Xpx ตามความสูงของ header/footer ของ popup
  //   //     return {
  //   //       height,
  //   //       overflowY: "scroll",
  //   //       scrollbarWidth: "thin",
  //   //       scrollbarColor: "rgba(0, 0, 0, 0.2) transparent",
  //   //       right: "-20px", // หรือค่าที่เหมาะสม
  //   //     };
  //   //   } else {
  //   //     return {
  //   //       minHeight: "600px", // หรือค่าที่เหมาะสม
  //   //       maxHeight: "600px", // หรือค่าที่เหมาะสม
  //   //       scrollbarWidth: "thin",
  //   //       scrollbarColor: "rgba(0, 0, 0, 0.2) transparent",
  //   //       right: "-20px", // หรือค่าที่เหมาะสม
  //   //     };
  //   //   }
  //   // }
  // },
  // methods: {
  //   // ไม่จำเป็นต้องย้าย showColorPicker และ updateColor มาที่นี่
  //   // เนื่องจากเรา emit event ให้ parent (Builder.vue) จัดการ
  // }
};
</script>

<style scoped>
/* สามารถเพิ่ม style เฉพาะสำหรับ StyleTab.vue ที่นี่ได้ถ้าจำเป็น */
.content-editor {
  /* คุณอาจจะต้องปรับ min-height/max-height ถ้า fullScreenMode มีผลต่อขนาดของส่วนนี้ */
}
</style> 