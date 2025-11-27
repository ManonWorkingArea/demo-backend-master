<template>
  <!-- Root wrapper for the entire template -->

    <div v-if="props.editPopupOpen" class="fixed inset-0 z-[999] bg-black bg-opacity-50 flex items-center justify-center editor-modal-wrapper" @click.self="emit('cancel-edit-popup')">
      <!-- editor-modal-content -->
      <div :class="['bg-white rounded-lg shadow-xl flex flex-col editor-modal-content', props.fullScreenMode ? 'w-full h-full rounded-none' : 'w-3/4 max-w-4xl h-[80vh]']" role="dialog" aria-modal="true" aria-labelledby="editPopupTitle">
        <!-- Header -->
        <div class="flex items-center justify-between px-4 py-3 border-b bg-gray-50 rounded-t-lg">
          <h3 id="editPopupTitle" class="text-lg font-semibold text-gray-700">
            Edit Element ({{ props.selectedItem?.type }} - {{ props.selectedItem?.uid }})
          </h3>
          <div class="flex items-center space-x-2">
            <button
              @click="emit('toggle-full-screen-mode')"
              class="text-gray-500 hover:text-gray-700 focus:outline-none p-1 rounded-full hover:bg-gray-200"
              :title="props.fullScreenMode ? 'Exit Fullscreen' : 'Enter Fullscreen'"
            >
              <font-awesome-icon :icon="props.fullScreenMode ? 'compress-alt' : 'expand-alt'" class="h-4 w-4" />
            </button>
            <button
              @click="emit('cancel-edit-popup')"
              class="text-gray-500 hover:text-gray-700 focus:outline-none p-1 rounded-full hover:bg-gray-200"
              title="Close Editor"
            >
              <font-awesome-icon icon="times" class="h-4 w-4" />
            </button>
          </div>
        </div>

        <!-- Body -->
        <div class="flex-grow overflow-y-hidden flex flex-col">
          <!-- Tabs Navigation -->
          <div class="flex-shrink-0">
            <div class="flex border-b">
              <button
                @click="setActiveTab('content')"
                :class="['px-4 py-2 focus:outline-none', props.activeTab === 'content' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500 hover:text-blue-500']"
              >
                Content
              </button>
              <button
                @click="setActiveTab('style')"
                :class="['px-4 py-2 focus:outline-none', props.activeTab === 'style' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500 hover:text-blue-500']"
              >
                Style
              </button>
              <button
                @click="setActiveTab('options')"
                :class="['px-4 py-2 focus:outline-none', props.activeTab === 'options' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500 hover:text-blue-500']"
              >
                Options
              </button>
              <button
                @click="setActiveTab('responsive')"
                :class="['px-4 py-2 focus:outline-none', props.activeTab === 'responsive' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500 hover:text-blue-500']"
              >
                Responsive
              </button>
              <button
                @click="setActiveTab('logic')"
                :class="['px-4 py-2 focus:outline-none', props.activeTab === 'logic' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500 hover:text-blue-500']"
              >
                Logic
              </button>
            </div>
          </div>

          <!-- Tab Content Wrapper -->
          <div class="flex-grow overflow-y-auto">
            <!-- Content Tab -->
            <div v-if="props.activeTab === 'content'" class="tab-content p-4">
              <template v-if="props.selectedItem && props.isValidType(props.selectedItem.type)">
                <component
                  v-if="props.componentImport"
                  :is="props.componentImport"
                  :item="props.selectedItem"
                  :flattened-categories="props.flattenedCategories"
                  :selected-item="props.selectedItem"
                  :menu-items="props.navItems || []"
                  @update-item="$emit('update-item', $event)"
                  mode="edit"
                />
                <div v-else>
                  <p>Loading component...</p>
                </div>
              </template>
              <div v-else-if="props.selectedItem">
                <p class="text-gray-500">Invalid item type: {{ props.selectedItem.type }}</p>
              </div>
              <div v-else>
                <p class="text-gray-500">No item selected.</p>
              </div>
            </div>

            <!-- Style Tab -->
            <div v-else-if="props.activeTab === 'style'" class="tab-content p-4">
              <div class="content-editor overflow-auto" style="min-height: 600px; max-height: 600px; scrollbar-width: thin; scrollbar-color: rgba(0, 0, 0, 0.2) transparent; right: -20px;">
                <div class="section-group">
                  <div class="border-b border-gray-200 pb-3 mb-3">
                    <span class="popup-label block font-bold text-lg">Style Config</span>
                    <span class="popup-label text-gray-500">ตั้งค่าการแสดงผลของเนื้อหา</span>
                  </div>
                </div>
                <div class="section-group mt-3">
                  <label class="popup-label block mb-2 pb-2 font-semibold">ตำแหน่งของวัตถุ (Position)</label>
                  <div class="grid grid-cols-4 gap-2">
                    <label :class="['radio-label p-2 flex flex-col items-center justify-center cursor-pointer border border-gray-300 rounded-sm', { 'bg-gray-200': props.selectedItem.position === 'static' }]">
                      <span><img src="https://vue-project.sgp1.digitaloceanspaces.com/ui-icon/staticpng.png" alt="Unset" class="w-10 h-10 mb-2"/></span>
                      <input type="radio" :checked="props.selectedItem.position === 'static'" @change="$emit('update-item', { ...props.selectedItem, position: 'static' })" value="static" class="radio-input hidden"/>
                      <span class="text-center text-sm text-gray-500">Static</span>
                    </label>
                    <label :class="['radio-label p-2 flex flex-col items-center justify-center cursor-pointer border border-gray-300 rounded-sm', { 'bg-gray-200': props.selectedItem.position === 'relative' }]">
                      <span><img src="https://vue-project.sgp1.digitaloceanspaces.com/ui-icon/relativepng.png" alt="Block" class="w-10 h-10 mb-2"/></span>
                      <input type="radio" :checked="props.selectedItem.position === 'relative'" @change="$emit('update-item', { ...props.selectedItem, position: 'relative' })" value="relative" class="radio-input hidden"/>
                      <span class="text-center text-sm text-gray-500">Relative</span>
                    </label>
                    <label :class="['radio-label p-2 flex flex-col items-center justify-center cursor-pointer border border-gray-300 rounded-sm', { 'bg-gray-200': props.selectedItem.position === 'absolute' }]">
                      <span><img src="https://vue-project.sgp1.digitaloceanspaces.com/ui-icon/absolutepng.png" alt="Full Width" class="w-10 h-10 mb-2"/></span>
                      <input type="radio" :checked="props.selectedItem.position === 'absolute'" @change="$emit('update-item', { ...props.selectedItem, position: 'absolute' })" value="absolute" class="radio-input hidden"/>
                      <span class="text-center text-sm text-gray-500">Absolute</span>
                    </label>
                    <label :class="['radio-label p-2 flex flex-col items-center justify-center cursor-pointer border border-gray-300 rounded-sm', { 'bg-gray-200': props.selectedItem.position === 'fixed' }]">
                      <span><img src="https://vue-project.sgp1.digitaloceanspaces.com/ui-icon/fixedpng.png" alt="Full Width" class="w-10 h-10 mb-2"/></span>
                      <input type="radio" :checked="props.selectedItem.position === 'fixed'" @change="$emit('update-item', { ...props.selectedItem, position: 'fixed' })" value="fixed" class="radio-input hidden"/>
                      <span class="text-center text-sm text-gray-500">Fixed</span>
                    </label>
                  </div>
                </div>
                <div class="section-group mt-3">
                  <label class="popup-label block font-semibold">Background</label>
                  <div class="grid grid-cols-2 gap-4 mt-3">
                    <div>
                      <label class="popup-label font-medium">Background Type:</label>
                      <select :value="props.selectedItem.bgType" @change="$emit('update-item', { ...props.selectedItem, bgType: $event.target.value })" class="popup-select w-full mb-3 rounded-sm border border-gray-200">
                        <option value="none">None</option>
                        <option value="color">Color</option>
                        <option value="image">Image</option>
                        <option value="gradient">Gradient</option>
                        <option value="video">Video</option>
                      </select>
                    </div>
                    <div>
                      <div v-if="props.selectedItem.bgType === 'color'" class="relative">
                        <label class="block popup-label">Color:</label>
                        <input :value="props.selectedItem.bgColor" @input="$emit('update-item', { ...props.selectedItem, bgColor: $event.target.value })" type="text" class="w-full popup-input rounded-sm border border-gray-200" @click="showColorPickerHandler('bgColor')"/>
                        <div v-if="props.showColorPickerField === 'bgColor'">
                          <input class="absolute right-2 top-[32px] w-35 h-35" type="color" :value="props.selectedItem.bgColor" @input="$emit('update-item', { ...props.selectedItem, bgColor: $event.target.value }); updateColorHandler('bgColor')" @click.stop/>
                        </div>
                      </div>
                      <div v-else-if="props.selectedItem.bgType === 'image'">
                        <label class="block popup-label">Image URL:</label>
                        <input :value="props.selectedItem.bgImage" @input="$emit('update-item', { ...props.selectedItem, bgImage: $event.target.value })" type="text" class="w-full popup-input rounded-sm border border-gray-200"/>
                      </div>
                      <div v-else-if="props.selectedItem.bgType === 'gradient'" class="grid grid-cols-2 gap-4">
                        <div class="relative">
                          <label class="block popup-label">Gradient Color 1:</label>
                          <input :value="props.selectedItem.bgGradientColor1" @input="$emit('update-item', { ...props.selectedItem, bgGradientColor1: $event.target.value })" type="text" class="w-full popup-input rounded-sm border border-gray-200" @click="showColorPickerHandler('bgGradientColor1')"/>
                          <div v-if="props.showColorPickerField === 'bgGradientColor1'">
                            <input class="absolute right-2 top-[32px] w-35 h-35" type="color" :value="props.selectedItem.bgGradientColor1" @input="$emit('update-item', { ...props.selectedItem, bgGradientColor1: $event.target.value }); updateColorHandler('bgGradientColor1')" @click.stop/>
                          </div>
                        </div>
                        <div class="relative">
                          <label class="block popup-label">Gradient Color 2:</label>
                          <input :value="props.selectedItem.bgGradientColor2" @input="$emit('update-item', { ...props.selectedItem, bgGradientColor2: $event.target.value })" type="text" class="w-full popup-input rounded-sm border border-gray-200" @click="showColorPickerHandler('bgGradientColor2')"/>
                          <div v-if="props.showColorPickerField === 'bgGradientColor2'">
                            <input class="absolute right-2 top-[32px] w-35 h-35" type="color" :value="props.selectedItem.bgGradientColor2" @input="$emit('update-item', { ...props.selectedItem, bgGradientColor2: $event.target.value }); updateColorHandler('bgGradientColor2')" @click.stop/>
                          </div>
                        </div>
                      </div>
                      <div v-else-if="props.selectedItem.bgType === 'video'">
                        <label class="block popup-label">Video URL:</label>
                        <input :value="props.selectedItem.bgVideo" @input="$emit('update-item', { ...props.selectedItem, bgVideo: $event.target.value })" type="text" class="w-full popup-input rounded-sm border border-gray-200"/>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="section-group mt-3" v-if="props.selectedItem.type === 'row'">
                   <label class="popup-label block font-semibold">Inner Background</label>
                   <div class="grid grid-cols-2 gap-4 mt-3">
                      <div>
                         <label class="popup-label font-medium">Background Type:</label>
                         <select :value="props.selectedItem.bgInnerType" @change="$emit('update-item', { ...props.selectedItem, bgInnerType: $event.target.value })" class="popup-select w-full mb-3 rounded-sm border border-gray-200">
                            <option value="none">None</option>
                            <option value="color">Color</option>
                            <option value="image">Image</option>
                            <option value="gradient">Gradient</option>
                            <option value="video">Video</option>
                         </select>
                      </div>
                      <div>
                         <div v-if="props.selectedItem.bgInnerType === 'color'" class="relative">
                            <label class="block popup-label">Color:</label>
                            <input :value="props.selectedItem.bgInnerColor" @input="$emit('update-item', { ...props.selectedItem, bgInnerColor: $event.target.value })" type="text" class="w-full popup-input rounded-sm border border-gray-200" @click="showColorPickerHandler('bgInnerColor')"/>
                            <div v-if="props.showColorPickerField === 'bgInnerColor'">
                               <input class="absolute right-2 top-[32px] w-35 h-35" type="color" :value="props.selectedItem.bgInnerColor" @input="$emit('update-item', { ...props.selectedItem, bgInnerColor: $event.target.value }); updateColorHandler('bgInnerColor')" @click.stop/>
                            </div>
                         </div>
                         <div v-else-if="props.selectedItem.bgInnerType === 'image'">
                            <label class="block popup-label">Image URL:</label>
                            <input :value="props.selectedItem.bgInnerImage" @input="$emit('update-item', { ...props.selectedItem, bgInnerImage: $event.target.value })" type="text" class="w-full popup-input rounded-sm border border-gray-200"/>
                         </div>
                         <div v-else-if="props.selectedItem.bgInnerType === 'gradient'" class="grid grid-cols-2 gap-4">
                            <div class="relative">
                               <label class="block popup-label">Gradient Color 1:</label>
                               <input :value="props.selectedItem.bgInnerGradientColor1" @input="$emit('update-item', { ...props.selectedItem, bgInnerGradientColor1: $event.target.value })" type="text" class="w-full popup-input rounded-sm border border-gray-200" @click="showColorPickerHandler('bgInnerGradientColor1')"/>
                               <div v-if="props.showColorPickerField === 'bgInnerGradientColor1'">
                                  <input class="absolute right-2 top-[32px] w-35 h-35" type="color" :value="props.selectedItem.bgInnerGradientColor1" @input="$emit('update-item', { ...props.selectedItem, bgInnerGradientColor1: $event.target.value }); updateColorHandler('bgInnerGradientColor1')" @click.stop/>
                               </div>
                            </div>
                            <div class="relative">
                               <label class="block popup-label">Gradient Color 2:</label>
                               <input :value="props.selectedItem.bgInnerGradientColor2" @input="$emit('update-item', { ...props.selectedItem, bgInnerGradientColor2: $event.target.value })" type="text" class="w-full popup-input rounded-sm border border-gray-200" @click="showColorPickerHandler('bgInnerGradientColor2')"/>
                               <div v-if="props.showColorPickerField === 'bgInnerGradientColor2'">
                                  <input class="absolute right-2 top-[32px] w-35 h-35" type="color" :value="props.selectedItem.bgInnerGradientColor2" @input="$emit('update-item', { ...props.selectedItem, bgInnerGradientColor2: $event.target.value }); updateColorHandler('bgInnerGradientColor2')" @click.stop/>
                               </div>
                            </div>
                         </div>
                         <div v-else-if="props.selectedItem.bgInnerType === 'video'">
                            <label class="block popup-label">Video URL:</label>
                            <input :value="props.selectedItem.bgInnerVideo" @input="$emit('update-item', { ...props.selectedItem, bgInnerVideo: $event.target.value })" type="text" class="w-full popup-input rounded-sm border border-gray-200"/>
                         </div>
                      </div>
                   </div>
                </div>
                <div class="section-group">
                  <label class="popup-label block font-semibold">Border</label>
                  <div class="grid grid-cols-2 gap-4 mt-3">
                    <div>
                      <label class="popup-label block font-medium">Style:</label>
                      <select :value="props.selectedItem.borderStyle" @change="$emit('update-item', { ...props.selectedItem, borderStyle: $event.target.value })" class="w-full popup-select rounded-sm border border-gray-200">
                        <option value="none">None</option>
                        <option value="solid">Solid</option>
                        <option value="dotted">Dotted</option>
                        <option value="dashed">Dashed</option>
                        <option value="double">Double</option>
                        <option value="hidden">Hidden</option>
                      </select>
                    </div>
                    <div class="relative">
                      <label class="block popup-label">Color:</label>
                      <input :value="props.selectedItem.borderColor" @input="$emit('update-item', { ...props.selectedItem, borderColor: $event.target.value })" type="text" class="w-full popup-input rounded-sm border border-gray-200" @click="showColorPickerHandler('borderColor')"/>
                      <div v-if="props.selectedItem.borderStyle && props.selectedItem.borderStyle !== 'none'">
                        <input class="absolute right-2 top-[32px] w-35 h-35" type="color" :value="props.selectedItem.borderColor" @input="$emit('update-item', { ...props.selectedItem, borderColor: $event.target.value }); updateColorHandler('borderColor')" @click.stop/>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="section-group mt-3">
                  <label class="popup-label font-semibold">Width</label>
                  <div class="grid grid-cols-4 gap-2">
                    <div>
                      <label class="block popup-label">Left:</label>
                      <input :value="props.selectedItem.borderLeftWidth" @input="$emit('update-item', { ...props.selectedItem, borderLeftWidth: $event.target.value })" type="text" class="w-full popup-input rounded-sm border border-gray-200" placeholder="Left Width"/>
                    </div>
                    <div>
                      <label class="block popup-label">Top:</label>
                      <input :value="props.selectedItem.borderTopWidth" @input="$emit('update-item', { ...props.selectedItem, borderTopWidth: $event.target.value })" type="text" class="w-full popup-input rounded-sm border border-gray-200" placeholder="Top Width"/>
                    </div>
                    <div>
                      <label class="block popup-label">Right:</label>
                      <input :value="props.selectedItem.borderRightWidth" @input="$emit('update-item', { ...props.selectedItem, borderRightWidth: $event.target.value })" type="text" class="w-full popup-input rounded-sm border border-gray-200" placeholder="Right Width"/>
                    </div>
                    <div>
                      <label class="block popup-label">Bottom:</label>
                      <input :value="props.selectedItem.borderBottomWidth" @input="$emit('update-item', { ...props.selectedItem, borderBottomWidth: $event.target.value })" type="text" class="w-full popup-input rounded-sm border border-gray-200" placeholder="Bottom Width"/>
                    </div>
                  </div>
                </div>
                <div class="section-group mt-3">
                  <label class="popup-label font-semibold">Radius</label>
                  <div class="grid grid-cols-4 gap-2">
                    <div>
                      <label class="block popup-label">Top Left:</label>
                      <input :value="props.selectedItem.borderRadiusTopLeft" @input="$emit('update-item', { ...props.selectedItem, borderRadiusTopLeft: $event.target.value })" type="text" class="w-full popup-input rounded-sm border border-gray-200" placeholder="Top Left Radius"/>
                    </div>
                    <div>
                      <label class="block popup-label">Top Right:</label>
                      <input :value="props.selectedItem.borderRadiusTopRight" @input="$emit('update-item', { ...props.selectedItem, borderRadiusTopRight: $event.target.value })" type="text" class="w-full popup-input rounded-sm border border-gray-200" placeholder="Top Right Radius"/>
                    </div>
                    <div>
                      <label class="block popup-label">Bottom Right:</label>
                      <input :value="props.selectedItem.borderRadiusBottomRight" @input="$emit('update-item', { ...props.selectedItem, borderRadiusBottomRight: $event.target.value })" type="text" class="w-full popup-input rounded-sm border border-gray-200" placeholder="Bottom Right Radius"/>
                    </div>
                    <div>
                      <label class="block popup-label">Bottom Left:</label>
                      <input :value="props.selectedItem.borderRadiusBottomLeft" @input="$emit('update-item', { ...props.selectedItem, borderRadiusBottomLeft: $event.target.value })" type="text" class="w-full popup-input rounded-sm border border-gray-200" placeholder="Bottom Left Radius"/>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Options Tab -->
            <div v-else-if="props.activeTab === 'options'" class="tab-content p-4">
              <!-- <ComponentOptions
                v-if="props.selectedItem && props.selectedItem.type"
                :itemType="props.selectedItem.type"
                :itemOptions="props.selectedItem.options || {}"
                :builderOptions="props.getAllBuilderOptions()"
                :selectedItem="props.selectedItem"
                @update-item-options="handleUpdateItemOptionsInternal"
              />
              <div v-else>
                <p class="text-gray-500">Please select an item to see its options, or this item type has no specific options.</p>
              </div> -->
              <div>Options Tab (ComponentOptions currently commented out)</div>
            </div>

            <!-- Responsive Tab -->
            <div v-else-if="props.activeTab === 'responsive'" class="tab-content p-4">
              <h3 class="text-lg font-semibold mb-2">Responsive Settings</h3>
              <p class="text-gray-600 mb-3">Adjust visibility for different screen sizes.</p>
              <div v-if="props.selectedItem && props.selectedItem.uid" class="space-y-3">
                <div>
                  <div class="flex items-center space-x-4">
                    <div class="flex items-center">
                      <input type="checkbox" :id="'responsive-mobile-' + props.selectedItem.uid" :checked="props.selectedItem.responsive?.mobile !== false" @change="toggleResponsiveVisibility('mobile', $event.target.checked)" class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"/>
                      <label :for="'responsive-mobile-' + props.selectedItem.uid" class="ml-2 block text-sm text-gray-900">Mobile</label>
                    </div>
                    <div class="flex items-center">
                      <input type="checkbox" :id="'responsive-tablet-' + props.selectedItem.uid" :checked="props.selectedItem.responsive?.tablet !== false" @change="toggleResponsiveVisibility('tablet', $event.target.checked)" class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"/>
                      <label :for="'responsive-tablet-' + props.selectedItem.uid" class="ml-2 block text-sm text-gray-900">Tablet</label>
                    </div>
                    <div class="flex items-center">
                      <input type="checkbox" :id="'responsive-desktop-' + props.selectedItem.uid" :checked="props.selectedItem.responsive?.desktop !== false" @change="toggleResponsiveVisibility('desktop', $event.target.checked)" class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"/>
                      <label :for="'responsive-desktop-' + props.selectedItem.uid" class="ml-2 block text-sm text-gray-900">Desktop</label>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else>
                <p class="text-gray-500">Select an item to configure responsive settings.</p>
              </div>
            </div>

            <div v-else-if="props.activeTab === 'logic'" class="tab-content p-4">
              <div>Logic Tab Content Placeholder</div>
              <h3 class="text-lg font-semibold mb-2">Logic Settings</h3>
              <p class="text-gray-600 mb-3">Define conditional visibility based on data.</p>
              <div v-if="props.selectedItem && props.selectedItem.uid">
                <button @click="addLogicItemHandler" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm mb-3">
                  Add Logic Condition
                </button>
                <div v-if="props.selectedItem.logics && props.selectedItem.logics.length > 0" class="space-y-2">
                  <div v-for="(logicItem, index) in props.selectedItem.logics" :key="logicItem.uid || index" class="p-3 border rounded bg-gray-50">
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
                      <input type="text" placeholder="Field (e.g., user.role)" v-model="logicItem.field" @input="updateLogicItemHandler(index, logicItem)" class="p-2 border rounded text-sm col-span-1 md:col-span-1">
                      <select v-model="logicItem.operator" @change="updateLogicItemHandler(index, logicItem)" class="p-2 border rounded text-sm col-span-1 md:col-span-1">
                        <option value="equals">Equals</option>
                        <option value="not_equals">Not Equals</option>
                        <option value="contains">Contains</option>
                        <option value="greater_than">Greater Than</option>
                        <option value="less_than">Less Than</option>
                      </select>
                      <input type="text" placeholder="Value" v-model="logicItem.value" @input="updateLogicItemHandler(index, logicItem)" class="p-2 border rounded text-sm col-span-1 md:col-span-1">
                    </div>
                    <div class="mt-2 flex justify-end">
                       <button @click="deleteLogicItemInternal(index, logicItem)" class="bg-red-500 hover:bg-red-700 text-white text-xs py-1 px-2 rounded">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
                <p v-else class="text-sm text-gray-500">No logic conditions defined for this item.</p>
              </div>
              <div v-else><p class="text-gray-500">Select an item to configure logic settings.</p></div>
            </div>

        </div>

         <!-- End of commented out main content -->

        <!-- Footer with Save/Cancel Buttons -->
        <div
          :class="[
            'flex-shrink-0 px-4 py-3 border-t bg-gray-50 rounded-b-lg',
            props.fullScreenMode ? 'fixed inset-x-0 bottom-0 z-10' : 'flex justify-end'
          ]"
        >
          <button
            @click.prevent="emit('save-edited-item')"
            class="popup-button mr-2 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
          >
            <font-awesome-icon
              :icon="['fas', 'save']"
              class="mx-auto h-4 w-4 text-white mr-1"
            />
            บันทึกข้อมูล
          </button>
          <button
            @click="emit('cancel-edit-popup')"
            class="popup-button bg-gray-400 hover:bg-gray-500 text-white py-2 px-4 rounded"
          >
            ยกเลิก
          </button>
        </div>

      </div> <!-- closes editor-modal-content -->
    </div>
    </div>

</template>

<script setup>
import { defineProps, defineEmits } from "vue";
// import ComponentOptions from "./builder/ComponentOptions.vue";

const props = defineProps({
  editPopupOpen: Boolean,
  fullScreenMode: Boolean,
  activeTab: String,
  selectedItem: Object,
  componentImport: Object, // Or Function, or String
  flattenedCategories: Array,
  navItems: Array, // เพิ่ม navItems prop สำหรับส่งไปยัง navigation element
  showColorPickerField: String,
  paddingValue: String,
  marginValue: String,
  paddingInnerValue: String,
  setAllPadding: Boolean,
  setAllMargin: Boolean,
  setAllInnerPadding: Boolean,
  isValidType: Function, // Keep for basic content tab
  getAllBuilderOptions: Function,
  getSelectedOptionLabel: Function,
  getParentLogicObjectName: Function,
});

const emit = defineEmits([
  "toggle-full-screen-mode",
  "cancel-edit-popup",
  "set-active-tab",
  "update-item", // Keep for basic content tab
  "save-edited-item",
  "update:paddingValue",
  "update:marginValue",
  "update:paddingInnerValue",
  "update:setAllPadding",
  "update:setAllMargin",
  "update:setAllInnerPadding",
  "show-color-picker",
  "update-color",
  "add-logic-item",
  "delete-logic-item",
  "update-logic-item",
  // "logic-item-method-chosen" // This one seems not used in template yet
]);

const setActiveTab = (tabName) => {
  console.log(`[ElementEditor.vue] Tab button clicked for: ${tabName}. Emitting 'set-active-tab'.`);
  emit("set-active-tab", tabName);
};

const showColorPickerHandler = (fieldName) => {
  emit('show-color-picker', fieldName);
};

const updateColorHandler = (fieldName) => {
  emit('update-color', fieldName);
};

const deleteLogicItemInternal = (index, logicItem) => {
  emit('delete-logic-item', { itemUid: props.selectedItem.uid, logicUid: logicItem.uid, index });
};

const toggleResponsiveVisibility = (device, isVisible) => {
  const currentResponsive = props.selectedItem.responsive || {};
  emit('update-item', {
    ...props.selectedItem,
    responsive: {
      ...currentResponsive,
      [device]: isVisible,
    },
  });
};

const addLogicItemHandler = () => {
  // Basic structure, parent (Builder.vue) will handle providing UID
  emit('add-logic-item', { itemUid: props.selectedItem.uid });
};

const updateLogicItemHandler = (index, logicItem) => {
  emit('update-logic-item', { itemUid: props.selectedItem.uid, index, logicItemData: logicItem });
};

</script>

<style>
/* Add any specific styles for the editor if needed */
.w-35 {
    width: 35px; /* Or your desired size */
}
.h-35 {
    height: 35px; /* Or your desired size */
}
</style>