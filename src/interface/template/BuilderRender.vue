<template>
  <Color></Color>

  <template v-if="page.authen && !login">
    <Authen/>
  </template>

  <template v-else>

    <template v-if="!page.password || isValidPassword">
    
      <div v-if="page.type === 'form'">

        <form>
          
          <div v-for="(row,rowIndex) in builder" :key="row.text" :class="[getRowWrapperClass(row), styles(row).classes]" :style="styles(row).style" :id="row.customId">
    
            <div :class="[getRowInsideWrapperClass(row), InnerStyles(row).classes]" :style="InnerStyles(row).style">
    
              <div v-if="row.dataMode === 'set'" class="flex items-center bg-blue-100 pl-4 pt-2">
                <div class="flex justify-between w-full mb-2">
                  <div class="flex flex-col">
                    <h3 class="font-bold text-lg">{{ row.dataSetName }}</h3>
                  </div>
                </div>
              </div>
    
              <div v-if="row.dataMode === 'set' && row.dataSetLimit>1" class="mb-2 grid grid-cols-2 items-center bg-blue-50 mb-1 pl-4 pt-2">
                <div class="text-left">
                  {{ rowIndex + 1 }}.
                </div>
                <div class="text-right">
                  <a href="javascript:void(0)" @click="duplicateRow(rowIndex)" class="text-sm text-white bg-blue-500 pl-2 pr-2 pt-2 pb-2 rounded-sm"><font-awesome-icon :icon="['fas', 'plus']" /> เพิ่ม{{ row.dataSetName }}ใหม่</a>
                </div>
              </div>
              
              <div v-if="row.dataMode === 'copy'" class="mb-2 grid grid-cols-2 items-center bg-blue-50 mb-1 pl-4 pt-2">
                <div class="text-left">
                  {{ rowIndex + 1 }}.
                </div>
                <div class="text-right">
                  <a href="javascript:void(0)" class="text-sm text-white bg-red-500 pl-2 pr-2 pt-2 pb-2 rounded-sm" @click="removeRowData(rowIndex)">
                    <font-awesome-icon :icon="['fas', 'trash']" /> ลบออก
                  </a>
                </div>
              </div>
    
              <template v-if="row.mode === 'tab'">
                <div class="flex flex-col">
                  <div class="flex" style="margin-bottom: -1px; z-index: 9;">
                    <div
                      v-for="(column, index) in row.columns"
                      :key="column.text"
                      :class="['px-4 py-2 mr-1 cursor-pointer', {'bg-white-500 text-black font-bold border-t border-l border-r border-b border-gray-300 border-b-white': index === activeTabIndex}, {'bg-gray-200 border-t border-l border-r border-b border-gray-300': index !== activeTabIndex}]"
                      @click="activeTabIndex = index"
                    >
                      {{ column.text }}
                    </div>
                  </div>
                  <div class="border border-t border-gray-300 p-4">
                    <div v-for="(column, index) in row.columns" :key="column.text" :class="{'hidden': index !== activeTabIndex}" :id="column.customId">
                      <template v-for="obj in column.object" :key="obj.name">
                        <component :is="getComponentType(obj.type)"
                        v-if="obj.show || shouldShowInput(obj)"
                        v-model="obj.value"
                        :data="obj"
                        :class="[styles(obj).classes, { 'error-input': obj.required && obj.hasError }]"
                        :style="styles(obj).style"
                        :item="obj"
                        :id="obj.customId"
                        @run-flow="handleFlowRun"
                        @update:modelValue="handleModelValueUpdate">
                        </component>
                        <div v-if="debug">{{ obj.value }}</div>
    
                        <template v-if="obj.type === 'button'">

                          <!-- Render the div only if errorDetails has data -->
                          <div v-if="errorDetails && errorDetails.length" class="mt-4">
                            <h3 class="text-lg font-semibold mb-2">Error Details:</h3>
                            <ul>
                              <li v-for="(error, index) in errorDetails" :key="index" class="text-red-500 mb-1">
                                Field <span class="font-semibold">{{ error.name }}:</span> {{ error.error }}
                              </li>
                            </ul>
                          </div>

                          <div class="mt-2 pt-5 border-t border-gray-200">
                            <button
                              type="button"
                              :class="[
                                'mr-3 rounded-md border border-gray-300',
                                obj.style === 'primary' ? 'bg-indigo-500 text-white' : 'bg-white text-gray-700',
                                'px-4 py-2 text-sm font-medium shadow-sm',
                                obj.textSize
                              ]"
                              @click="submitForm"
                            >
                              {{ obj.label }}
                            </button>
                            <button
                              type="button"
                              class="rounded-md border border-gray-300 bg-white text-gray-700 px-4 py-2 text-sm font-medium shadow-sm hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100"
                              @click="clearForm"
                            >
                              Clear
                            </button>
                          </div>

                        </template>

                        <template v-if="obj.type === 'flow_button'">

                          <!-- Render the div only if errorDetails has data -->
                          <div v-if="errorDetails && errorDetails.length" class="mt-4">
                            <h3 class="text-lg font-semibold mb-2">Error Details:</h3>
                            <ul>
                              <li v-for="(error, index) in errorDetails" :key="index" class="text-red-500 mb-1">
                                Field <span class="font-semibold">{{ error.name }}:</span> {{ error.error }}
                              </li>
                            </ul>
                          </div>

                          <div class="mt-2 pt-5 border-t border-gray-200">
                            <button
                              type="button"
                              :class="[
                                'mr-3 rounded-md border border-gray-300',
                                obj.style === 'primary' ? 'bg-indigo-500 text-white' : 'bg-white text-gray-700',
                                'px-4 py-2 text-sm font-medium shadow-sm',
                                obj.textSize
                              ]"
                              @click="callFlow(obj.flow)"
                            >
                              {{ obj.label }}
                            </button>
                          </div>

                        </template>
    
                      </template>
                    </div>
                  </div>
                </div>
              </template>
    
              <template v-else-if="row.mode !== 'tab'">
                <template v-if="row.columns.length > 0">

                  <!-- {{ row.dataMode }} -->
                  <!-- <pre>{{ row.alignment }}</pre>
                  <pre>{{ row.columns.length }}</pre>
                  <pre>{{ row.col }}</pre> -->

                  <div :class="gridClasses(row)">
                    <div v-for="(group, groupIndex) in columnGroups(row)" :key="groupIndex" :class="flexClasses(row)">
                      <div
                        v-for="(column, colIndex) in group"
                        :key="column.text"
                        :id="column.customId"
                        :class="columnClasses(row, colIndex)"
                        :style="columnStyle(row, colIndex)"
                      >



                        
                        <!-- <template v-for="obj in column.object" :key="obj.name">
                          <component :is="getComponentType(obj.type)"
                          v-if="obj.show || shouldShowInput(obj)"
                          v-model="obj.value"
                          :data="obj"
                          :class="[styles(obj).classes, { 'error-input': obj.required && obj.hasError }]"
                          :style="styles(obj).style"
                          :item="obj"
                          @update:modelValue="handleModelValueUpdate">
                          </component>
                          <div v-if="debug">{{ obj.value }}</div>
      
                          <template v-if="obj.type === 'button'">
  
                            <div v-if="errorDetails && errorDetails.length" class="">
                              <h3 class="text-md font-semibold text-red-500">{{translate('builder-error')}}</h3>
                              <span class="text-gray-500">{{translate('builder-error-detail')}}</span>
                              <ul class="mt-2">
                                <li v-for="(error, index) in errorDetails" :key="index" class="text-red-500 text-sm">
                                  <span class="font-semibold">{{ error.name }} :</span> {{ error.error }}
                                </li>
                              </ul>
                            </div>
  
                            <div class="mt-2 pt-5 border-t border-gray-200">
                              <button
                                type="button"
                                :class="[
                                  'mr-3 rounded-md border border-gray-300',
                                  obj.style === 'primary' ? 'bg-indigo-500 text-white' : 'bg-white text-gray-700',
                                  'px-4 py-2 text-sm font-medium shadow-sm',
                                  obj.textSize
                                ]"
                                @click="submitForm"
                              >
                                {{ obj.label }}
                              </button>
                              <button
                                type="button"
                                class="rounded-md border border-gray-300 bg-white text-gray-700 px-4 py-2 text-sm font-medium shadow-sm hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100"
                                @click="clearForm"
                              >
                                Clear
                              </button>
                            </div>
                          </template>
      
                        </template> -->



                        </div>
                      </div>
                    </div>
    
                  
                  
                  <div :class="getGridColumnClasses(row)">
                    <div v-for="column in row.columns" :key="column.text" :class="[getColumnClasses(column, row), columnStyles(column)]" :style="columnStyles(column)" :id="column.customId">
                      
                      
                      
                      <template v-for="obj in column.object" :key="obj.name">
                        <component :is="getComponentType(obj.type)"
                        v-if="obj.show || shouldShowInput(obj)"
                        v-model="obj.value"
                        :data="obj"
                        :class="[styles(obj).classes, { 'error-input': obj.required && obj.hasError }]"
                        :style="styles(obj).style"
                        :item="obj"
                        :id="obj.customId"
                        @run-flow="handleFlowRun"
                        @update:modelValue="handleModelValueUpdate">
                        </component>
                        <div v-if="debug">{{ obj.value }}</div>
    
                        <template v-if="obj.type === 'button'">

                          <div v-if="errorDetails && errorDetails.length" class="">
                            <h3 class="text-md font-semibold text-red-500">{{translate('builder-error')}}</h3>
                            <span class="text-gray-500">{{translate('builder-error-detail')}}</span>
                            <ul class="mt-2">
                              <li v-for="(error, index) in errorDetails" :key="index" class="text-red-500 text-sm">
                                <span class="font-semibold">{{ error.name }} :</span> {{ error.error }}
                              </li>
                            </ul>
                          </div>

                          <div class="mt-2 pt-5 border-t border-gray-200">
                            <button
                              type="button"
                              :class="[
                                'mr-3 rounded-md border border-gray-300',
                                obj.style === 'primary' ? 'bg-indigo-500 text-white' : 'bg-white text-gray-700',
                                'px-4 py-2 text-sm font-medium shadow-sm',
                                obj.textSize
                              ]"
                              @click="submitForm"
                            >
                              {{ obj.label }}
                            </button>
                            <button
                              type="button"
                              class="rounded-md border border-gray-300 bg-white text-gray-700 px-4 py-2 text-sm font-medium shadow-sm hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100"
                              @click="clearForm"
                            >
                              Clear
                            </button>
                          </div>
                        </template>

                        <template v-if="obj.type === 'flow_button'">
                          <button
                              type="button"
                              :class="[
                                'mr-3 rounded-md border border-gray-300',
                                obj.style === 'primary' ? 'bg-indigo-500 text-white' : 'bg-white text-gray-700',
                                'px-4 py-2 text-sm font-medium shadow-sm',
                                obj.textSize
                              ]"
                              @click="callFlow(obj.flow)"
                            >
                              {{ obj.label }}
                            </button>
                        </template>
    
                      </template>




                    </div>
                  </div>
                </template>
              </template>
    
            </div>
          </div>
        </form>
    
        <transition name="fade">
          <div v-if="showPopup" class="fixed inset-0 z-50 flex items-center justify-center">
            <div class="bg-gray-900 bg-opacity-50 fixed inset-0"></div>
            <div class="bg-white rounded-lg shadow-lg p-6 transform translate-y-[-50%]">
              <div v-if="isSubmitting">
                <p class="text-center text-gray-700">{{submitTitle}}</p>
              </div>
              <div v-else-if="isSubmitted">
                <p class="text-center text-green-600 text-2xl">{{submitSubject}}</p>
                <p class="text-center text-gray-700">{{submitMessage}}</p>
                <button class="mt-4 bg-gray-200 text-gray-700 py-2 px-4 rounded-md shadow-sm hover:bg-gray-300 w-full block" @click="closePopup">{{translate('general-close')}}</button>
              </div>
            </div>
          </div>
        </transition>
    
      </div>
    
      <div v-else-if="page.type === 'page'">
        <template v-if="page.display === 'single'">
          <div v-for="row in builder" :key="row.text" :class="[getRowWrapperClass(row), styles(row).classes]" :style="styles(row).style" :id="row.customId">
            <div :class="getRowInsideWrapperClass(row)">
              <template v-if="row.mode === 'tab'">
                <div class="flex flex-col">
                  <div class="flex">
                    <div
                      v-for="(column, index) in row.columns"
                      :key="column.text"
                      :class="['px-4 py-2 cursor-pointer border-b-2 border-transparent', {'bg-indigo-500 text-white': index === activeTabIndex}, {'bg-gray-200': index !== activeTabIndex}]"
                      @click="activeTabIndex = index"
                    >
                      {{ column.text }}
                    </div>
                  </div>
                  <div class="border border-t-0 p-4">
                    <div v-for="(column, index) in row.columns" :key="column.text" :class="{'hidden': index !== activeTabIndex}">
                      <template v-for="obj in column.object" :key="obj.name">
                        <component :is="getComponentType(obj.type)"
                        v-if="obj.show || shouldShowInput(obj)"
                        v-model="obj.value"
                        :data="obj"
                        :class="[styles(obj).classes, { 'error-input': obj.required && obj.hasError }]"
                        :style="styles(obj).style"
                        :item="obj"
                        :id="obj.customId"
                        @run-flow="handleFlowRun"
                        @update:modelValue="handleModelValueUpdate">
                        </component>
                        <div v-if="debug">{{ obj.value }}</div>
                      </template>
                    </div>
                  </div>
                </div>
              </template>
      
              <template v-else-if="row.mode !== 'tab'">
                <template v-if="row.columns.length > 0">
                  <div :class="getGridColumnClasses(row)">
                    <div v-for="column in row.columns" :key="column.text" :class="[getColumnClasses(column, row), columnStyles(column)]" :style="columnStyles(column)" :id="column.customId">
                      <template v-for="obj in column.object" :key="obj.name">
                        <component :is="getComponentType(obj.type)"
                        v-if="obj.show || shouldShowInput(obj)"
                        v-model="obj.value"
                        :data="obj"
                        :class="[styles(obj).classes, { 'error-input': obj.required && obj.hasError }]"
                        :style="styles(obj).style"
                        :item="obj"
                        :id="obj.customId"
                        @run-flow="handleFlowRun"
                        @update:modelValue="handleModelValueUpdate">
                        </component>
                        <div v-if="debug">{{ obj.value }}</div>
                      </template>
                    </div>
                  </div>
                </template>
              </template>
      
            </div>
          </div>
        </template>
        <template v-else-if="page.display === 'group'">
        <Page :data="this.page"></Page>
        </template>
    
      </div>
    
      <div v-else-if="page.type === 'post'">
        <Post :data="this.page"></Post>
      </div>
    
      <div v-else>
        <div v-for="row in builder" :key="row.text" :class="[getRowWrapperClass(row), styles(row).classes]" :style="styles(row).style" :id="row.customId">
          <div :class="getRowInsideWrapperClass(row)">
            <template v-if="row.mode === 'tab'">
              <div class="flex flex-col">
                <div class="flex">
                  <div
                    v-for="(column, index) in row.columns"
                    :key="column.text"
                    :class="['px-4 py-2 cursor-pointer border-b-2 border-transparent', {'bg-indigo-500 text-white': index === activeTabIndex}, {'bg-gray-200': index !== activeTabIndex}]"
                    @click="activeTabIndex = index"
                  >
                    {{ column.text }}
                  </div>
                </div>
                <div class="border border-t-0 p-4">
                  <div v-for="(column, index) in row.columns" :key="column.text" :class="{'hidden': index !== activeTabIndex}">
                    <template v-for="obj in column.object" :key="obj.name">
                      <component :is="getComponentType(obj.type)"
                      v-if="obj.show || shouldShowInput(obj)"
                      v-model="obj.value"
                      :data="obj"
                      :class="[styles(obj).classes, { 'error-input': obj.required && obj.hasError }]"
                      :style="styles(obj).style"
                      :item="obj"
                      :id="obj.customId"
                      @run-flow="handleFlowRun"
                      @update:modelValue="handleModelValueUpdate">
                      </component>
                      <div v-if="debug">{{ obj.value }}</div>
                    </template>
                  </div>
                </div>
              </div>
            </template>
    
            <template v-else-if="row.mode !== 'tab'">
              <template v-if="row.columns.length > 0">
                <div :class="getGridColumnClasses(row)">
                  <div v-for="column in row.columns" :key="column.text" :class="[getColumnClasses(column, row), columnStyles(column)]" :style="columnStyles(column)" :id="column.customId">
                    <template v-for="obj in column.object" :key="obj.name">
                      <component :is="getComponentType(obj.type)"
                      v-if="obj.show || shouldShowInput(obj)"
                      v-model="obj.value"
                      :data="obj"
                      :class="[styles(obj).classes, { 'error-input': obj.required && obj.hasError }]"
                      :style="styles(obj).style"
                      :item="obj"
                      :id="obj.customId"
                      @run-flow="handleFlowRun"
                      @update:modelValue="handleModelValueUpdate">
                      </component>
                      <div v-if="debug">{{ obj.value }}</div>
                    </template>
                  </div>
                </div>
              </template>
            </template>
    
          </div>
        </div>
      </div>

    </template>

    <tenplate v-else>
      <div class="flex justify-center items-center h-[50vh]">
        <div class="w-80 border border-gray-200 p-6 rounded-lg shadow-lg">
          <div class="flex justify-center items-center mb-2">
            <font-awesome-icon :icon="['fas','lock']" class="text-2xl text-gray-700"/>
            
          </div>
          <p class="text-center text-gray-400 mb-10">เนื้อหานี้ถูกเข้ารหัสไว้</p>
          <p class="text-center text-gray-600 mb-6">กรุณากรอกรหัสผ่านก่อนเข้าสู่เนื้อหานี้</p>
          <input type="password" v-model="enteredPassword" placeholder="กรอกรหัสผ่าน" class="w-full px-4 py-2 mb-4 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-400">
          <button @click="checkPassword" class="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600"><font-awesome-icon :icon="['fas','key']"/> เข้าสู่เนื้อหา</button>
        </div>
      </div>
    </tenplate>

  </template>
</template>
  
  <script>
  import storageManager from '@/plugins/storage';
  import Color from './builder/Color.vue';
  import Post from './builder/Post.vue';
  import Page from './builder/Page.vue';

  import Header from './builder/Header.vue';
  import Image from './builder/Image.vue';
  import Preview from './builder/Preview.vue';
  import Paragraph from './builder/Paragraph.vue';
  import Video from './builder/Video.vue';
  import Slideshow from './builder/Slideshow.vue';
  import Lesson from './builder/Lesson.vue';
  import lesson_widget_usage from './builder/lesson_widget_usage.vue';
  import LessonHR from './builder/Lesson_hr.vue';
  import LessonCategories from './builder/LessonCategories.vue';
  import LessonCategoriesDropdown from './builder/LessonCategoriesDropdown.vue';
  import LessonCalendar from './builder/LessonCalendar.vue';
  import Popup from './builder/Popup.vue';


  import Youtube from './builder/Youtube.vue';

  import Html from './builder/Html.vue';
  import flowRun from './builder/flowRun.vue';
  import Navigation from './builder/Navigation.vue';
  import Usernav from './builder/Usernav.vue';
  import Table from './builder/Table.vue';
  import Calendar from './builder/Calendar.vue';

  import enroll_list from './builder/enroll_list.vue';
  import enroll_counter from './builder/enroll_counter.vue';
  import order_list from './builder/order_list.vue';
  import order_counter from './builder/order_counter.vue';
  import user_nav from './builder/user_nav.vue';
  import user_profile from './builder/user_profile.vue';
  import news_ticker from './builder/news_ticker.vue';
  import note from './builder/note.vue';
  import authen from './builder/authen.vue';

  import email_body from './builder/email_body.vue';

  import FormInput from './builder/form/FormInput.vue';
  import FormHidden from './builder/form/FormHidden.vue';
  import FormTextarea from './builder/form/FormTextarea.vue';
  import FormRadiobox from './builder/form/FormRadiobox.vue';
  import FormCheckbox from './builder/form/FormCheckbox.vue';
  import FormSelect from './builder/form/FormSelect.vue';
  import FormUpload from './builder/form/FormUpload.vue';
  import FormAddress from './builder/form/FormAddress.vue';
  import FormDatetime from './builder/form/formDatetimepicker.vue';
  
  import { generateStyles } from '@/plugins/builder.js';
  import { generateInnerStyles } from '@/plugins/builder-inner.js';

  import Authen from '@/utils/UserAuthenPopup.vue';

  // เอา requestClient ออกเนื่องจากใช้ API ระบบใหม่แล้ว
  // import requestClient from '@/plugins/requestClient';
  // const Request = new requestClient(false);

  import dialog from '@/plugins/Dialog.js';

  import debug from '@/plugins/Logger.js';

  import { translate } from '@/plugins/language.js';

  import { doFlow } from '@/plugins/Flow.js';
  import { getCurrentInstance, inject } from 'vue';
  
  export default {
    props: {
        dataItem: {
          type: String,
          required: true
        },
        masterItem: {
          type: String,
          required: true
        },
        mode: {
          type: String,
          required: true
        },
        liveBuilder: {
          type: Array,
          default: null
        },
        livePage: {
          type: Object,
          default: null
        }
    },
    setup() {
      // Inject API services
      const apiRequest = inject('apiRequest', null);
      const tenant = inject('tenant', null);
      const instance = getCurrentInstance();
      
      return {
        apiRequest,
        tenant,
        instance
      };
    },
    data() {
      return {
        login: storageManager.get('session', 'login'),
        configs: storageManager.get('configs'),
        session: storageManager.get('session'),
        enteredPassword: '',
        storedPassword: sessionStorage.getItem('password'),
        isValidPassword: false,
        debug:false,
        currentLoginComponent : Authen,
        builder: [],
        page: [],
        post: [],
        status: [],
        form: [],
        activeTabIndex: 0,
        isSubmitting: false,
        isSubmitted: false,
        showPopup: false,
        limitItem:100,
        limitOptions: [10, 50, 100, 200, 500, 1000, 2000], // Define the available options
        currentPage: 1,
        totalPages: 0,
        totalItems: 0,
        submitTitle:this.translate('form-submit'),
        submitSubject:this.translate('form-success'),
        submitMessage:this.translate('form-thankyou'),
        errorDetails:[],
        isDevice: window.innerWidth <= 768 ? 'mobile' : 'desktop',
        componentTypes: 
        [ 
          'header', 
          'image', 
          'preview',
          'paragraph', 
          'video',
          'html', 
          'slideshow', 
          'lesson_widget_usage',
          'lesson_widget',
          'lesson_widget_hr',
          'LessonCategories', 
          'lesson_calendar',
          'LessonCategoriesDropdown',
          'navigation', 
          'usernav', 
          'popup',
          'address',
          'table',
          'calendar',
          'datetime',
          'textarea',
          'radiobox',
          'input',
          'hidden',
          'checkbox',
          'select',
          'upload',
          'flow_run',
          'Youtube',

          'enroll_list',
          'enroll_counter',
          'order_list',
          'order_counter',
          'user_profile',
          'user_nav',
          'news_ticker',
          'note',
          'authen',
          'email_body'
        ],
      };
    },
    components: {
      Color,
      Header,
      Html,
      Image,
      Preview,
      Paragraph,
      Video,
      Slideshow,
      Lesson,
      LessonHR,
      lesson_widget_usage,
      LessonCalendar,
      LessonCategories,
      LessonCategoriesDropdown,
      FormInput,
      FormHidden,
      FormTextarea,
      FormRadiobox,
      FormCheckbox,
      FormSelect,
      FormUpload,
      FormAddress,
      FormDatetime,
      Navigation,
      Usernav,
      Popup,
      Table,
      Calendar,
      Post,
      Page,
      Authen,
      flowRun,
      Youtube,

      user_nav,
      user_profile,
      order_counter,
      order_list,
      enroll_counter,
      enroll_list,
      news_ticker,
      note,
      authen,
      email_body
    },
    computed: {
      styles() {
        return (data) => generateStyles(data);
      },
      InnerStyles() {
        return (data) => generateInnerStyles(data);
      },
      columnStyles() {
        return (column) => [this.styles(column).classes, this.styles(column).style];
      },
    },
    created() {},
    async mounted() {
      try {
        await this.getData();
        if (this.storedPassword === this.page.password) {
          this.isValidPassword = true;
        }
      } catch (error) {
        debug.log(Error);
      }
    },
    watch: {
      'column.object': {
        handler(newValue) {
          newValue.forEach((obj) => {
            this.handleInputChange(obj);
          });
        },
        deep: true
      }
    },
    methods: {
      // ===========================================
      // NEW API SYSTEM FUNCTIONS (Temporary Testing)
      // ===========================================
      
      /**
       * Helper function to make API calls using the new system
       */
      async makeApiCall(endpoint, method = 'GET', body = null, collection = null) {
        console.log('🔄 Making API call in BuilderRender:', { endpoint, method, body, collection });
        
        try {
          // Try new API system first
          if (this.apiRequest) {
            console.log('📡 Using new ApiRequest system');
            const result = await this.apiRequest.apiCall(endpoint, method, collection, body);
            console.log('✅ New API call successful:', result);
            return result;
          }
          
          // Fallback to old system
          console.log('📡 Falling back to old $Request system');
          const globalProperties = this.instance.appContext.config.globalProperties;
          
          // Ensure endpoint has /api/ prefix for fallback system
          const fullEndpoint = endpoint.startsWith('/api/') ? endpoint : `/api/${endpoint}`;
          console.log('📍 Using endpoint:', fullEndpoint);
          
          if (method === 'GET') {
            const response = await globalProperties.$Request.GET(fullEndpoint, this.configs.key);
            return response;
          } else if (method === 'POST') {
            const requestBody = { data: body, options: {} };
            const response = await globalProperties.$Request.POST(fullEndpoint, requestBody, this.configs.key);
            return response;
          } else if (method === 'PUT') {
            const requestBody = { data: body, options: {} };
            const response = await globalProperties.$Request.PUT(fullEndpoint, requestBody, this.configs.key);
            return response;
          } else if (method === 'DELETE') {
            const response = await globalProperties.$Request.DELETE(fullEndpoint, this.configs.key);
            return response;
          }
          
          throw new Error(`Unsupported method: ${method}`);
          
        } catch (error) {
          console.error('❌ API call failed:', error);
          throw error;
        }
      },

      /**
       * Helper function for fetch-based API calls (query endpoints)
       */
      async makeQueryCall(endpoint, queryBody) {
        console.log('🔍 Making query call in BuilderRender:', { endpoint, queryBody });
        
        try {
          // Try to use apiRequest for queries if possible
          if (this.apiRequest) {
            console.log('📡 Using new ApiRequest system for query');
            const result = await this.apiRequest.apiCall(endpoint, 'POST', null, queryBody);
            console.log('✅ New query call successful:', result);
            return result;
          }
          
          // Fallback to direct fetch
          console.log('📡 Falling back to direct fetch for query');
          
          // Build the full URL with proper /api/ prefix
          let fullUrl;
          if (endpoint.includes('://')) {
            // Full URL provided (legacy support)
            fullUrl = endpoint;
          } else {
            // Relative endpoint - build full URL
            const baseUrl = 'https://gateway.cloudrestfulapi.com';
            const apiEndpoint = endpoint.startsWith('/api/') ? endpoint : `/api/${endpoint}`;
            const queryEndpoint = apiEndpoint.endsWith('/query') ? apiEndpoint : `${apiEndpoint}/query`;
            fullUrl = `${baseUrl}${queryEndpoint}`;
          }
          
          console.log('📍 Using query URL:', fullUrl);
          
          const response = await fetch(fullUrl, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'client-token-key': this.configs.key 
            },
            body: JSON.stringify(queryBody)
          });

          if (response.ok) {
            const data = await response.json();
            console.log('✅ Query call successful:', data);
            return { data: data.data, total: data.total, status: response.status };
          } else {
            throw new Error(`Query failed with status: ${response.status}`);
          }
          
        } catch (error) {
          console.error('❌ Query call failed:', error);
          throw error;
        }
      },

      // ===========================================
      // EXISTING METHODS
      // ===========================================

      columnGroups(row) {
    const groups = [];
    for (let i = 0; i < row.columns.length; i += row.col) {
      groups.push(row.columns.slice(i, i + row.col));
    }
    return groups;
  },
  gridClasses(row) {
    const alignmentClass = {
      center: 'justify-center',
      left: 'justify-start',
      right: 'justify-end'
    }[row.alignment] || 'justify-start';

    return `grid grid-cols-1 gap-${row.gapSize} ${alignmentClass} w-full`;
  },
  flexClasses(row) {
    const alignmentClass = {
      center: 'justify-center',
      left: 'justify-start',
      right: 'justify-end'
    }[row.alignment] || 'justify-start';

    return `flex items-center ${alignmentClass} w-full`;
  },
  columnClasses(row, colIndex) {
    const baseClasses = [
      'w-full',
      'bg-white',
      'sm:w-[calc(var(--col-width))]',
      'ml-0',
      'mr-0',
    ];

    if (colIndex > 0) baseClasses.push('sm:ml-0 lg:ml-0');
    if (colIndex < row.columns.length - 1) baseClasses.push('sm:mr-0 lg:mr-0');

    return baseClasses.join(' ');
  },
  columnStyle(row, colIndex) {
    const gapSize = `${row.gapSize / 4}rem`; // Assuming gapSize is in rem units
    const colWidth = `${100 / row.col}%`;
    const isFirstItem = colIndex === 0;
    const isLastItem = colIndex === row.columns.length - 1;

    return {
      '--col-width': colWidth,
      flex: '0 1 auto',
      marginLeft: isFirstItem || this.isDevice === 'mobile' ? '0' : gapSize,
      marginRight: isLastItem || this.isDevice === 'mobile' ? '0' : gapSize,
    };
  }
,



      translate,
      checkPassword() {
        // Check if the entered password matches the stored password
        if (this.enteredPassword === this.page.password) {
          // Password is correct, store it in session storage
          sessionStorage.setItem('password', this.enteredPassword);
          // Set isValidPassword flag to true
          this.isValidPassword = true;
          // Do anything else you need to do after successful password verification
        } else {
          // Password is incorrect, handle the error
          alert('Incorrect password!');
        }
      },
      getComponentType(type) {
        switch (type) {
          case 'header':
          return 'Header';

          case 'image':
          return 'Image';

          case 'preview':
          return 'Preview';

          case 'html':
          return 'Html';

          case 'paragraph':
          return 'Paragraph';

          case 'video':
          return 'Video';

          case 'slideshow':
          return 'Slideshow';

          case 'lesson_widget':
          return 'Lesson';

          case 'lesson_widget_usage':
          return 'lesson_widget_usage';

          case 'lesson_widget_hr':
          return 'LessonHR';

          case 'lesson_calendar':
          return 'LessonCalendar';

          case 'lesson_categories':
          return 'LessonCategories';

          case 'lesson_categories_dropdown':
          return 'LessonCategoriesDropdown';

          case 'navigation':
          return 'Navigation';

          case 'usernav':
          return 'Usernav';

          case 'popup':
          return 'Popup';

          case 'address':
          return 'FormAddress';

          case 'table':
          return 'Table';

          case 'calendar':
          return 'Calendar';

          case 'datetime':
          return 'FormDatetime';

          case 'textarea':
          return 'FormTextarea';

          case 'radiobox':
          return 'FormRadiobox';

          case 'input':
          return 'FormInput';

          case 'hidden':
          return 'FormHidden';

          case 'checkbox':
          return 'FormCheckbox';

          case 'select':
          return 'FormSelect';

          case 'upload':
          return 'FormUpload';

          case 'flow_run':
          return 'flowRun';

          case 'enroll_list':
          return 'enroll_list';

          case 'enroll_counter':
          return 'enroll_counter';

          case 'order_list':
          return 'order_list';

          case 'order_counter':
          return 'order_counter';

          case 'user_profile':
          return 'user_profile';

          case 'user_nav':
          return 'user_nav';

          case 'news_ticker':
          return 'news_ticker';

          case 'note':
          return 'note';

          case 'authen':
          return 'authen';

          case 'youtube':
          return 'Youtube';

          case 'email_body':
          return 'email_body';
          
          default:
          return '';
        }
      },
      shouldShowObject(obj) {
        if (obj && obj.show !== undefined) {
          if (!obj.show && (this.shouldShowInput(obj) || this.shouldShowInput(obj) === undefined || this.shouldShowInput(obj) === null || this.shouldShowInput(obj) === '')) {
            return false;
          } else {
            return !(!obj.show && !this.shouldShowInput(obj));
          }
        }
        return this.shouldShowInput(obj);
      },
      handleModelValueUpdate(newValue, destinations) {

        //console.log("handleModelValueUpdate",newValue, destinations);

        if (destinations && Array.isArray(destinations) && destinations.length > 0) {
          destinations.forEach(destination => {
            const { rowIndex, columnIndex, obj } = destination;
            const targetRow = this.builder[rowIndex];
            if (targetRow) {
              const targetColumn = targetRow.columns[columnIndex];
              if (targetColumn) {
                const targetObject = targetColumn.object[obj];
                if (targetObject && targetObject.logics && targetObject.logics.length > 0) {
                  targetObject.logics.forEach(logicConfig => {
                    const { default: logicDefault,method: logicMethod } = logicConfig;
                    //console.log("logicConfig",logicConfig);
                    //console.log("logicDefault",logicDefault);
                    //console.log("newValue",newValue.value);
                    if (logicDefault === newValue.value) {
                      if(logicMethod==="show")
                      {
                        targetObject.show = true;
                        targetObject.required = true;
                      }
                      else
                      {
                        targetObject.show = false;
                        targetObject.required = false;
                      }
                      
                    } else {
                      if(logicMethod==="show")
                      {
                        targetObject.show = false;
                        targetObject.required = false;
                      }
                      else
                      {
                        targetObject.show = true;
                        targetObject.required = true;
                      }
                    }
                  });
                }
              }
            }
          });
        }
      },
      shouldShowInput(obj) {
        if (obj.logics && obj.logics.length > 0) {
          const logicConfig = obj.logics[0];
          if (logicConfig.request && logicConfig.method === 'show') {
            if(logicConfig.method === 'show') {
              //debug.log(obj,false)
              return false;
            } else if(logicConfig.method === 'hide') {
              //debug.log(obj,true)
              return true;
            }
          }
        }
        //debug.log(obj,true)
        return true;
      },
      /*getGridColumnClasses(row) {
        let colSize = 'grid';
        colSize += ' grid-cols-1 sm:grid-cols-2';
        if (row.col && !isNaN(parseInt(row.col)) && parseInt(row.col) > 0) {
          colSize += ` md:grid-cols-3`;
          colSize += ` lg:grid-cols-${row.col} xl:grid-cols-${row.col}`;
        } else {
          colSize += ` md:grid-cols-1`;
          colSize += ` lg:grid-cols-1 xl:grid-cols-1`;
        }
        return colSize;
      },*/
      getGridColumnClasses(row) {
        let colSize = 'grid grid-cols-1';
        
        if (row.col && !isNaN(parseInt(row.col)) && parseInt(row.col) > 0) {
          colSize += ` md:grid-cols-${row.col}`;
          if (row.gapSize) {
            colSize += ` gap-${row.gapSize}`;
          } else {
            colSize += ` gap-0`;
          }
        }
        return colSize;
      },
      getRowWrapperClass(row) {
          let classes = '';
          if (row.bsz === 'block' || !row.bsz) {
            classes = `row-obj mx-auto`;
          } else if (row.bsz === 'w-full') {
            classes = `row-obj w-full`;
          }
          if (row.dataMode === 'set' ) {
            classes += ' set-wraper-master';
          }
          if (row.dataMode === 'copy' ) {
            classes += ' set-wraper-copy';
          }
          return classes;
      },
      convertClassObjectToString(classObject) {
        return Object.keys(classObject).filter((key) => classObject[key]).join(' ');
      },
      getRowInsideWrapperClass(row) {
        if (row.sz === 'w-full') {
          let classes = '';
          if (row.bsz === 'block' || !row.bsz) {
            classes = `row-inside mx-auto pl-5 pr-5 ${row.width}`;
          } else if (row.bsz === 'unset') {
            classes = `row-inside mx-auto pl-5 pr-5`;
          } else if (row.bsz === 'w-full') {
            classes = `row-inside`;
          }
          if (row.dataMode === 'set' ) {
            classes += ' set-wraper-master';
          }
          if (row.dataMode === 'copy' ) {
            classes += ' set-wraper-copy';
          }
          return classes;
        }
      },
      getColumnClasses(column) {
        return {
          'col-obj': true,
          ['col-span-'+column.colspan]: true,
          'inline': column.inline,
          'text-left': column.alignment === 'left',
          'text-center': column.alignment === 'center',
          'text-right': column.alignment === 'right',
          'w-full': column.sz === 'w-full',
          'space-x-2': column.inline && column.spacing === 'space',
          'mr-2': column.inline && column.spacing === 'margin',
          'pr-2': column.inline && column.spacing === 'padding',
          [column.customClass]: !!column.customClass
        };
      },
  
      getObjectClasses(obj) {
        return {
          ...this.getPaddingClasses(obj.padding),
          ...this.getMarginClasses(obj.margin),
        };
      },
  
      getPaddingClasses(padding) {
        return {
          [`pt-${padding.t}`]: padding && padding.t !== undefined && padding.t !== 0,
          [`pr-${padding.r}`]: padding && padding.r !== undefined && padding.r !== 0,
          [`pb-${padding.b}`]: padding && padding.b !== undefined && padding.b !== 0,
          [`pl-${padding.l}`]: padding && padding.l !== undefined && padding.l !== 0,
        };
      },
  
      getMarginClasses(margin) {
        return {
          [`mt-${margin.t}`]: margin && margin.t !== undefined && margin.t !== 0,
          [`mr-${margin.r}`]: margin && margin.r !== undefined && margin.r !== 0,
          [`mb-${margin.b}`]: margin && margin.b !== undefined && margin.b !== 0,
          [`ml-${margin.l}`]: margin && margin.l !== undefined && margin.l !== 0,
        };
      },
      getImageStyle(align, spacing) {
        const style = {
          display: 'inline-block',
          textAlign: align || 'left', // Use the provided alignment value or default to 'left'
        };
        if (spacing === 'space') {
          style.margin = '0 5px'; // Adjust the spacing values as needed
        } else if (spacing === 'margin') {
          style.margin = '5px'; // Adjust the spacing values as needed
        } else if (spacing === 'padding') {
          style.padding = '5px'; // Adjust the spacing values as needed
        }
        return style;
      },
      duplicateRow(rowIndex) {
        const rowToDuplicate = JSON.parse(JSON.stringify(this.builder[rowIndex]));
        rowToDuplicate.bsz = 'block';
        rowToDuplicate.dataMode = 'copy';
        rowToDuplicate.value = '';
        this.builder.splice(rowIndex + 1, 0, rowToDuplicate);
      },
      removeRowData(rowIndex) {
        if (rowIndex >= 0 && rowIndex < this.builder.length) {
          this.builder.splice(rowIndex, 1);
        }
      },
      async getUserForm() {
        try {
          console.log('🔄 BuilderRender: Getting user form with new API system');
          const requestData = {
            method: 'find',
            args: [{ $and: [{ formID:this.page._id,courseID:this.page.course,userID:this.session.userID }]}]
          };
  
          const response = await this.makeQueryCall('api/form', requestData);
  
          if (response.status !== 200) {
            throw new Error(`Failed to fetch player data from API`);
          }
          console.log('✅ BuilderRender: User form data retrieved:', response.data);
          return response.data;
        } catch (error) {
          console.error('❌ BuilderRender: An error occurred while fetching player data:', error);
          throw error;
        }
      },
      handleFlowRun(flow) {
        this.callFlow(flow); // Assuming `callFlow` is the function you want to trigger
      },
      async callFlow(flow) {
        const { formData, hasError } = await this.collectFormData(true);
        const reformattedData = {};
        for (const key in formData) {
          if (key !== 'setData') {
            const fieldData = formData[key];
            if (fieldData && fieldData.name) {
              reformattedData[fieldData.name] = fieldData.value;
            }
          }
        }
        if (!hasError) {
          try {
            await doFlow(flow, reformattedData);
          } catch (error) {
            console.error('Error executing flow:', error);
          }
        }
    },
      async collectFormData(silent = false) {
        this.errorDetails = [];
        this.submitTitle = Array.isArray(this.status) && this.status.length > 0 ? "Submit Data to " + this.status[0].code : this.translate('form-submit');
        this.submitSubject = Array.isArray(this.status) && this.status.length > 0 ? "Data " + this.status[0].code + " submitted successfully!" : this.translate('form-success');
        this.submitMessage = Array.isArray(this.status) && this.status.length > 0 ? 'Thank you for your ' + this.status[0].code + " submission." : this.translate('form-thankyou');
        
        if (!silent) {
            this.showPopup = true;
            this.isSubmitting = true;
        }

        const formData = {};
        let hasError = false;
        let rowIndex = 0;
        let colIndex = 0;
        let objIndex = 0;
        let setIndex = null;

        const result = [];

        this.builder.forEach((row) => {
            const rowResult = [];
            rowIndex++;
            colIndex++;
            row.columns.forEach((column) => {
                column.object.forEach((obj) => {
                    objIndex++;
                    if (['input', 'hidden', 'address', 'datetime', 'textarea', 'radiobox', 'checkbox', 'select', 'upload'].includes(obj.type)) {
                        let type = obj.type;
                        let mode = obj.type;
                        if (obj.type === 'input') {
                            type = obj.inputType;
                            mode = obj.type;
                        }

                        if (obj.type === 'address') {
                            type = 'address';
                            mode = obj.inputType;
                        }

                        if (row.dataMode === 'set') {
                            setIndex = row.dataSetName;
                        }

                        if (row.dataMode === 'set' || row.dataMode === 'copy') {
                            const dataItem = {
                                set: setIndex,
                                name: obj.name,
                                value: obj.value || 'N/A',
                                type: type,
                                mode: mode,
                            };
                            rowResult.push(dataItem);
                        } else if (row.dataMode === 'standalone') {
                            formData[obj.type + "-" + objIndex + "-" + rowIndex + "-" + colIndex] = {
                                name: obj.name,
                                value: obj.value || 'N/A',
                                type: type,
                                mode: mode,
                            };
                        }

                        if (obj.required && (obj.value === undefined || obj.value === null || obj.value === '' || obj.value.length === 0)) {
                            obj.hasError = true;
                            hasError = true;
                            this.errorDetails.push({
                                name: obj.name,
                                error: obj.reqError // You can replace this with the actual error message
                            });
                        } else {
                            obj.hasError = false;
                        }
                    }
                });
            });
            result.push(rowResult); // Push rowResult for the current row to the result array
        });

        if (result.length > 0) {
            const groupedData = {};
            result.forEach((row) => {
                if (row && row[0] && row[0].set !== undefined) {
                    const set = row[0].set;
                    if (!groupedData[set]) {
                        groupedData[set] = [];
                    }
                    groupedData[set].push(row);
                }
            });
            formData.setData = groupedData;
        }

        return { formData, hasError };
    },

      async submitForm(saveToAPI = false) {
        const { formData, hasError } = await this.collectFormData();

        console.log("formData", formData);
        console.log("builder", this.builder);

        if (!hasError) {
          try {
            const requestData = {
              data: {
                parent: this.configs.siteID,
                formData,
                formID: this.page._id,
                courseID: this.page.course,
                userID: this.session.userID,
                status: Array.isArray(this.status) && this.status.length > 0 ? false : true,
                process: Array.isArray(this.status) && this.status.length > 0 ? this.status[0].code : undefined,
              },
              options: {}
            };

            if (saveToAPI) {
              console.log('🔄 BuilderRender: Submitting form with new API system');
              
              // Ensure proper API endpoint format
              const endpoint = this.page.destination.startsWith('/api/') ? this.page.destination : `/api/${this.page.destination}`;
              
              const resAPI = await this.makeApiCall(endpoint, 'POST', requestData.data);

              if (resAPI.status === 200) {
                console.log('✅ BuilderRender: Form data submitted successfully');
                this.isSubmitting = false;
                this.isSubmitted = true;

                if (this.page.next === 'order') {
                  console.log('🔄 BuilderRender: Creating order with new API system');
                  try {
                    const orderData = {
                      "userID": this.session.userID,
                      "courseID": this.page.course,
                      "unit": this.configs.siteID,
                      "ref1": this.page.ref1,
                      "ref2": this.session.user.citizen,
                      "price": 700,
                      "payment": 'bill_payment',
                      "type": 'lesson',
                      "approve": 'manual',
                      status: Array.isArray(this.status) && this.status.length > 0 ? false : true,
                      process: Array.isArray(this.status) && this.status.length > 0 ? this.status[0].code : undefined,
                    };
                    
                    const orderResponse = await this.makeApiCall('api/order', 'POST', orderData);
                    
                    if (orderResponse.data && orderResponse.data._id) {
                      console.log('✅ BuilderRender: Order created successfully');
                      this.$router.push('/lesson/pay/' + orderResponse.data._id);
                    }
                  } catch (orderError) {
                    console.error('❌ BuilderRender: Order creation failed:', orderError);
                    // Fallback to old order API
                    const orderAPI = await fetch("https://gateway.cloudrestfulapi.com/api/order/", {
                      method: 'POST',
                      headers: {'Content-Type': 'application/json', 'client-token-key': this.configs.key},
                      body: JSON.stringify({
                        data: {
                          "userID": this.session.userID,
                          "courseID": this.page.course,
                          "unit": this.configs.siteID,
                          "ref1": this.page.ref1,
                          "ref2": this.session.user.citizen,
                          "price": 700,
                          "payment": 'bill_payment',
                          "type": 'lesson',
                          "approve": 'manual',
                          status: Array.isArray(this.status) && this.status.length > 0 ? false : true,
                          process: Array.isArray(this.status) && this.status.length > 0 ? this.status[0].code : undefined,
                        },
                        options: {}
                      })
                    });

                    const getOrder = await orderAPI.json();
                    if (getOrder) {
                      this.$router.push('/lesson/pay/' + getOrder._id);
                    }
                  }
                }

                this.clearForm();
                this.builder.forEach((row) => {
                  row.columns.forEach((column) => {
                    column.object.forEach((obj) => {
                      obj.value = '';
                    });
                  });
                });
              } else {
                console.error('Form submission failed');
              }
            }

            this.builder.forEach((row) => {
              row.columns.forEach((column) => {
                column.object.forEach((obj) => {
                  obj.hasError = false;
                });
              });
            });
          } catch (error) {
            console.error('Error occurred during form submission:', error);
          }
        } else {
          console.log('Objects with errors:', this.errorDetails);
          this.isSubmitting = false;
          this.isSubmitted = false;
          this.showPopup = false;
        }
      },

      closePopup() {
        this.showPopup = false;
        location.reload();
      },
  
      clearForm() {
        this.builder.forEach((row) => {
          row.columns.forEach((column) => {
            column.object.forEach((obj) => {
              if (obj.type === 'input' || obj.type === 'textarea' || obj.type === 'radiobox' || obj.type === 'checkbox' || obj.type === 'select' || obj.type === 'upload') {
                obj.value = '';
              }
            });
          });
        });
      },
      async getData() {
        let resAPI;

        console.log("getData",this.dataItem);

        // Use live data if mode is 'live'
        if (this.mode === 'live' && this.liveBuilder && this.livePage) {
          this.builder = this.liveBuilder;
          this.page = this.livePage;
          this.status = this.livePage.status || 'active';
          
          if (this.livePage && this.livePage.type === 'page') {
            this.$setPageTitle(this.livePage.title);
          }
          
          return;
        }

        if (this.mode === 'id') {
          console.log('🔄 BuilderRender: Loading data by ID with new API system');
          resAPI = await this.makeApiCall(`api/post/${this.dataItem}`, 'GET');
        } else if (this.mode === 'slug') {
          console.log('🔄 BuilderRender: Loading data by slug with new API system');
          const requestData = {
            method: 'find',
            args: [
              {
                $and: [
                  { owner: this.configs.siteID },
                  { slug: this.dataItem },
                ],
              },
            ],
          };

          resAPI = await this.makeQueryCall('api/post', requestData);
        } else {
          return;
        }

        try {
          let pageLayout = null;
          let savedLayout = null;

          if (this.mode === 'id') {
            pageLayout = resAPI.data;
            savedLayout = resAPI.data.builder;
          } else if (this.mode === 'slug') {
            pageLayout = resAPI.data[0];
            savedLayout = resAPI.data[0].builder;
          }

          if (pageLayout && pageLayout.type === 'page') {
            this.$setPageTitle(pageLayout.title);
          }

          if (pageLayout) {
            this.builder  = savedLayout;
            this.page     = pageLayout;
            this.status   = pageLayout.status
            if (pageLayout.display === 'group') {
              const postData = await this.getPostData(pageLayout._id);
              this.post = postData.data;
            }
          }

          if (this.page.type === 'form' && this.page.authen && this.login) {
            try {
              this.form = await this.getUserForm();
              if (this.form.length > 0) {
                dialog.prompt({
                  title: 'การลงทะเบียนสำเร็จแล้ว',
                  message: 'คุณลงทะเบียนหลักสูตรนี้เรียบร้อยแล้ว!',
                  confirm: async () => {
                    this.$router.push('/user/profile');
                  },
                  cancel: () => {}
                });
                
              } else {
                console.log("ยังไม่ได้ลงทะเบียน");
              }
            } catch (error) {
              console.error("Error retrieving user form:", error);
            }
          }
        } catch (error) {
          debug.log(error);
        }
      },

      async getPostData(post_id) {
        try {
          this.loading = true;
          this.activeBlock = true

          const andConditions = [{ parent: post_id }];

          if (this.statusFilter !== 'all') {
            andConditions.push({ status: this.statusFilter });
          }

          const pipeline = [
            {
              $match: {
                $and: andConditions,
              },
            },
            {
              $facet: {
                post: [
                  {
                    $skip: (this.currentPage - 1) * this.limitItem,
                  },
                  {
                    $limit: this.limitItem,
                  },
                ],
                totalCount: [
                  {
                    $count: 'count',
                  },
                ],
              },
            },
          ];

          console.log('🔄 BuilderRender: Getting post data with new API system');
          const resAPI = await this.makeApiCall('api/post/aggregate', 'POST', { pipeline });

          const data = resAPI.data;
          const postResults = data[0].post;
          const totalCount = data[0].totalCount[0].count;

          console.log('✅ BuilderRender: Post data retrieved successfully');
          debug.log('Post Results:', postResults);
          debug.log('Total Count:', totalCount);

          if (data) {
              const totalCount = data[0]?.totalCount?.[0]?.count || 0;

              const formattedData = {
                  data: data[0].post,
                  total: totalCount,
                  paging: {
                      page: this.currentPage,
                      limit: this.limitItem,
                      totalPages: Math.ceil(totalCount / this.limitItem)
                  }
              };

              this.listItems = formattedData.data;
              this.totalItems = formattedData.total;
              this.totalPages = formattedData.paging.totalPages;

              //debug.log("data",this.listItems);

              this.loading = false;
              this.activeBlock = false;
              return formattedData;
          }
        } catch (error) {
            debug.log(error);
        }
      },
    },
  };
  </script>
  <style scoped>
  .vueperslide__title {
    background-color: #000;
  }
  .vueperslide__content  {
  
  }
  .error-input {
    border: 1px solid rgb(255 0 0 / 12%);
    background: rgb(255 0 0 / 6%);
    padding: 5px;
  }

  .error-input > label{
    color: red!important;
  }
  .error-message {
    color: red; /* Add your desired error message styling */
  }
  .set-wraper-master .grid{
    border: 1px dashed #ddd;
    padding: 10px;
  }
  .set-wraper-copy .grid {
    border: 1px dashed #ddd;
    padding: 10px;
  }
  
  </style>