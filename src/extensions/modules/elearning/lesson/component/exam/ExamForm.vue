<script>
import {result, show, type, shuffle} from "@/master/exam_option";
import {useRoute} from 'vue-router'
import storageManager from '@/plugins/storage';

import Datepicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css'

import editor from '@/interface/template/editor.vue';
import ExamDemo from './ExamDemo.vue';

export default {
  name: 'ExamForm',
  props: {
    mode: {
      type: String,
      default: 'add', // 'add' or 'edit'
      validator: (value) => ['add', 'edit'].includes(value)
    },
    examData: {
      type: Object,
      default: () => ({})
    },
    course: {
      type: String,
      required: true
    },
    history: {
      type: String,
      required: true
    }
  },
  emits: ['submit', 'cancel'],
  data() {
    const route = useRoute();
    const session = storageManager.get('session')
    return {
      PageName: route.meta.title,
      PageIcon: route.meta.icon,
      PagePath: route.meta.path,
      ParentName: route.meta.parent,
      ParentPage: route.meta.page,

      accessSession: [],
      resultData: [],
      showData: [],
      typeData: [],
      shuffleData: [],
      displayData: [],

      checkedType: 'general',
      checkedResult: 'now',
      checkedShow: 'now',
      
      name: '',
      slug: '',
      total: '',
      timer: '',
      is_score: 'no',
      is_result: 'no',
      is_repeat: 'no',
      adminmode: 'no',
      verified: 'no',
      is_question_shuffle: 'normal',
      is_answer_shuffle: 'normal',
      measure: '',
      measurement_type: 'score',
      type: 'general',
      description: '',
      result: 'now',
      watermark: 'no',
      watermarkOptions: [],
      result_duedate: new Date(),
      show: 'now',
      show_duedate: new Date(),
      end_duedate: new Date(),
      
      // Level configuration data
      level_categories: [
        { id: 1, name: 'การอ่าน', code: 'reading', color: '#3B82F6' },
        { id: 2, name: 'การเขียน', code: 'writing', color: '#10B981' },
        { id: 3, name: 'การฟัง', code: 'listening', color: '#F59E0B' },
        { id: 4, name: 'การพูด', code: 'speaking', color: '#EF4444' },
        { id: 5, name: 'การใช้ไวยากรณ์', code: 'grammar', color: '#8B5CF6' }
      ],
      level_structure: {
        max_percentage: 100,  // คะแนนเต็มแต่ละข้อเป็น %
        output_levels: 10,    // แสดงผลเป็น 10 ระดับ (1-10)
        pass_percentage: 60,  // เปอร์เซ็นต์ขั้นต่ำที่ถือว่าผ่าน
        score_levels: [       // ระดับคะแนนที่กำหนดเอง
          { id: 1, label: 'ผิดสนิท', percentage: 0 },
          { id: 2, label: 'ผิดมาก', percentage: 25 },
          { id: 3, label: 'ใกล้ถูก', percentage: 60 },
          { id: 4, label: 'ถูกส่วนใหญ่', percentage: 85 },
          { id: 5, label: 'ถูกสมบูรณ์', percentage: 100 }
        ]
      },
      
      activeBlock: false,
      loading_sources: true,
      login: storageManager.get('session','login'),
      accessToken:storageManager.get('session','token'),
      configs: storageManager.get('configs'),
      MasterText:session.MasterText,
      master: session.master,
      ipChecked: false,
      dateChecked: false,
      nameChecked: false
    }
  },
  components: {
    Datepicker,
    editor,
    ExamDemo
  },
  computed: {
    isEditMode() {
      return this.mode === 'edit'
    },
    isAddMode() {
      return this.mode === 'add'
    },
    availableScores() {
      // แสดงระดับคะแนนที่กำหนดเอง
      return this.level_structure.score_levels.map(level => ({
        label: level.label,
        value: `${level.percentage}%`
      }));
    }
  },
  methods: {
    slugify(str) {
      str = str.replace(/^\s+|\s+$/g, ''); // trim
      str = str.toLowerCase();
      // remove accents, swap ñ for n, etc
      var from = "àáãäâèéëêìíïîòóöôùúüûñç·/_,:;";
      var to   = "aaaaaeeeeiiiioooouuuunc------";
      for (var i=0, l=from.length ; i<l ; i++) {
          str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
      }
      str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
          .replace(/\s+/g, '-') // collapse whitespace and replace by -
          .replace(/-+/g, '-'); // collapse dashes
      return str;
    },
    updateItem_description(newContent) {
      this.description = newContent;
    },
    addCategory() {
      const newId = Math.max(...this.level_categories.map(cat => cat.id)) + 1;
      const colors = ['#8B5CF6', '#F97316', '#06B6D4', '#84CC16', '#EC4899'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      
      this.level_categories.push({
        id: newId,
        name: `ทักษะ ${newId}`,
        code: `skill_${newId}`,
        color: randomColor
      });
    },
    removeCategory(index) {
      if (this.level_categories.length > 1) {
        this.level_categories.splice(index, 1);
      }
    },
    addScoreLevel() {
      const newId = Math.max(...this.level_structure.score_levels.map(level => level.id)) + 1;
      this.level_structure.score_levels.push({
        id: newId,
        label: `ระดับ ${newId}`,
        percentage: 50
      });
    },
    removeScoreLevel(index) {
      if (this.level_structure.score_levels.length > 2) {
        this.level_structure.score_levels.splice(index, 1);
      }
    },
    async loadMasterData() {
      try {
        this.loading_sources = false;
        const access = storageManager.get('session')
        
        this.resultData = result
        this.showData = show
        this.typeData = type
        this.shuffleData = shuffle
        this.school = access.current._id;
        this.loading_sources = true;
      } catch (error) {
        console.log(error)
      }
    },
    initializeFormData() {
      if (this.isEditMode && this.examData) {
        // Load data for edit mode
        this.name = this.examData.name || ''
        this.slug = this.examData.slug || ''
        this.total = this.examData.total || ''
        this.timer = this.examData.timer || ''
        this.measure = this.examData.measure || ''
        this.measurement_type = this.examData.measurement_type || 'score'
        this.is_score = this.examData.is_score || 'no'
        this.is_result = this.examData.is_result || 'no'
        this.description = this.examData.description || ''
        this.result = this.examData.result || 'now'
        this.result_duedate = this.examData.result_duedate ? new Date(this.examData.result_duedate) : new Date()
        this.show = this.examData.show || 'now'
        this.show_duedate = this.examData.show_duedate ? new Date(this.examData.show_duedate) : new Date()
        this.end_duedate = this.examData.end_duedate ? new Date(this.examData.end_duedate) : new Date()
        this.type = this.examData.type || 'general'
        this.adminmode = this.examData.adminmode || 'no'
        this.verified = this.examData.verified || 'no'
        this.is_repeat = this.examData.is_repeat || 'no'
        this.watermark = this.examData.watermark || 'no'
        this.watermarkOptions = this.examData.watermarkOptions || []

        this.checkedType = this.examData.type || 'general'
        this.checkedResult = this.examData.result || 'now'
        this.checkedShow = this.examData.show || 'now'

        this.is_answer_shuffle = this.examData.is_answer_shuffle || 'normal'
        this.is_question_shuffle = this.examData.is_question_shuffle || 'normal'

        // Set checkbox values based on watermarkOptions
        this.ipChecked = this.watermarkOptions.includes('ip')
        this.dateChecked = this.watermarkOptions.includes('date') 
        this.nameChecked = this.watermarkOptions.includes('name')
        
        // Load level configuration data
        if (this.examData.level_categories) {
          this.level_categories = this.examData.level_categories;
        }
        if (this.examData.level_structure) {
          this.level_structure = this.examData.level_structure;
        }
      }
    },
    handleSubmit() {
      const watermarkOptions = [];
      if (this.ipChecked) watermarkOptions.push('ip');
      if (this.dateChecked) watermarkOptions.push('date');
      if (this.nameChecked) watermarkOptions.push('name');

      const formData = {
        name: this.name,
        slug: this.slugify(this.slug),
        total: this.total,
        timer: this.timer,
        measure: this.measure,
        measurement_type: this.measurement_type,
        is_score: this.is_score,
        is_result: this.is_result,
        is_repeat: this.is_repeat,
        description: this.description,
        result: this.checkedResult,
        result_duedate: this.result_duedate,
        show: this.checkedShow,
        show_duedate: this.show_duedate,
        end_duedate: this.end_duedate,
        type: this.checkedType,
        adminmode: this.adminmode,
        verified: this.verified,
        is_answer_shuffle: this.is_answer_shuffle,
        is_question_shuffle: this.is_question_shuffle,
        watermark: this.watermark,
        watermarkOptions: watermarkOptions
      };

      // Add level configuration for level type
      if (this.measurement_type === 'level') {
        formData.level_categories = this.level_categories;
        formData.level_structure = this.level_structure;
      }

      // Add courseId for add mode
      if (this.isAddMode) {
        formData.courseId = this.course;
      }

      this.$emit('submit', formData);
    },
    handleCancel() {
      this.$emit('cancel');
    },
    getDemoQuestions() {
      // สร้างข้อสอบตัวอย่าง 2 ข้อสำหรับแต่ละทักษะ
      const questions = [];
      let questionId = 1;
      
      this.level_categories.forEach(category => {
        questions.push({
          id: questionId++,
          category_id: category.id,
          title: `ข้อสอบตัวอย่างสำหรับ${category.name} ข้อที่ 1`,
          description: `ประเมินทักษะ${category.name}เบื้องต้น`
        });
        
        questions.push({
          id: questionId++,
          category_id: category.id,
          title: `ข้อสอบตัวอย่างสำหรับ${category.name} ข้อที่ 2`,
          description: `ประเมินทักษะ${category.name}ขั้นสูง`
        });
      });
      
      return questions;
    },
    handleDemoCompleted(results) {
      console.log('📊 ผลลัพธ์จากการทดสอบ:', results);
      
      // แสดงผลลัพธ์
      this.$nextTick(() => {
        alert(`
🎉 ทดสอบเสร็จสิ้น!

📊 คะแนนรวม: ${results.overallScore.toFixed(1)}%
${results.passed ? '✅ ผ่านเกณฑ์' : '❌ ไม่ผ่านเกณฑ์'}

📈 คะแนนแต่ละทักษะ:
${Object.values(results.categoryScores).map(cat => 
  `• ${cat.name}: ${cat.score.toFixed(1)}% (ระดับ ${cat.level}/${this.level_structure.output_levels})`
).join('\n')}

💡 นี่เป็นเพียงการทดสอบ สามารถปรับแต่งการตั้งค่าได้ด้านบน
        `);
      });
    }
  },
  async mounted() {
    try {
      await this.loadMasterData();
      this.initializeFormData();
      
      const access = storageManager.get('session','access')
      this.accessSession = access.current;
    } catch (error) {
      console.log(error);
    }
  },
  watch: {
    examData: {
      handler() {
        this.initializeFormData();
      },
      deep: true
    }
  }
}
</script>

<template>
<div v-if="loading_sources">
    <div class="flex-1 bg-gray-100">
        <div class="mt-4">
            <div class="mx-auto">
                <div class="sm:px-6 lg:col-span-9 lg:px-0">
                    <!-- Loading Overlay -->
                    <form @submit.prevent="handleSubmit">
                        <section aria-labelledby="exam-form-section" class="relative" :data-content="'กำลังติดต่อฐานข้อมูล กรุณารอสักครู่.....'" :class="[(activeBlock?'isblock' : 'isunblock')]">

                            <!-- Section 1: ข้อมูลแบบทดสอบ -->
                            <div class="divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow mb-8">
                                <div class="bg-blue-700 text-white px-2 py-3 sm:px-3 rounded-t-lg flex items-center">
                                    <!-- Icon -->
                                    <div class="mr-4">
                                        <font-awesome-icon :icon="['fas','clipboard-list']" class="text-3xl text-white" />
                                    </div>
                                    <!-- Vertical Line -->
                                    <div class="h-10 w-px bg-white opacity-50 mr-4"></div>
                                    <!-- Text Content -->
                                    <div>
                                        <h2 id="exam-info-heading" class="text-lg font-bold leading-6">ข้อมูลแบบทดสอบ</h2>
                                        <p class="mt-0 text-sm text-indigo-200">กรอกข้อมูลของแบบทดสอบให้ครบถ้วนและถูกต้อง</p>
                                    </div>
                                </div>
                                
                                <div class="px-5 pb-5">
                                    <div class="bg-blue-50 -mx-4 sm:-mx-6 px-4 sm:px-6 py-2 mb-3 border-b border-blue-100">
                                        <h3 class="text-sm font-semibold text-blue-800">ข้อมูลเบื้องต้นของแบบทดสอบ</h3>
                                    </div>

                                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                                        <div class="col-span-6 sm:col-span-6">
                                            <label for="name" class="block text-md font-bold text-gray-700">ชื่อแบบทดสอบ</label>
                                            <input 
                                                v-model="name" 
                                                type="text" 
                                                name="name" 
                                                id="name" 
                                                class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm">
                                        </div>

                                        <div class="col-span-6 sm:col-span-6">
                                            <label for="slug" class="block text-md font-bold text-gray-700">รหัสแบบทดสอบ</label>
                                            <input 
                                                v-model="slug"
                                                type="text" 
                                                name="slug" 
                                                id="slug" 
                                                class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm">
                                        </div>
                                    </div>

                                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                        <div>
                                            <label for="total" class="block text-md font-bold text-gray-700">จำนวนข้อสอบ</label>
                                            <input 
                                                v-model="total" 
                                                type="number" 
                                                name="total" 
                                                id="total" 
                                                class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm">
                                        </div>

                                        <div>
                                            <label for="timer" class="block text-md font-bold text-gray-700">เวลาสอบ (นาที)</label>
                                            <input 
                                                v-model="timer"
                                                type="number" 
                                                name="timer" 
                                                id="timer" 
                                                class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm">
                                        </div>

                                        <div>
                                            <label class="block text-md font-bold text-gray-700">จัดเรียงคำถาม</label>
                                            <div class="space-y-3 mt-3">
                                                <div v-for="(shuffleItem) in shuffleData" :key="shuffleItem.code" class="flex items-center space-x-3">
                                                    <input 
                                                        v-model="is_question_shuffle" 
                                                        :id="'q_'+shuffleItem.code" 
                                                        :value="shuffleItem.code" 
                                                        type="radio" 
                                                        class="h-4 w-4 cursor-pointer rounded-full border-gray-300 text-indigo-600 focus:ring-indigo-500">
                                                    <label :for="'q_'+shuffleItem.code" class="text-sm font-medium text-gray-700">{{shuffleItem.name}}</label>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label class="block text-md font-bold text-gray-700">จัดเรียงคำตอบ</label>
                                            <div class="space-y-3 mt-3">
                                                <div v-for="(shuffleItem) in shuffleData" :key="shuffleItem.code" class="flex items-center space-x-3">
                                                    <input 
                                                        v-model="is_answer_shuffle" 
                                                        :id="'a_'+shuffleItem.code" 
                                                        :value="shuffleItem.code" 
                                                        type="radio" 
                                                        class="h-4 w-4 cursor-pointer rounded-full border-gray-300 text-indigo-600 focus:ring-indigo-500">
                                                    <label :for="'a_'+shuffleItem.code" class="text-sm font-medium text-gray-700">{{shuffleItem.name}}</label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Section 2: การตั้งค่าประเภทและโหมด -->
                            <div class="divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow mb-8">
                                <div class="bg-blue-700 text-white px-2 py-3 sm:px-3 rounded-t-lg flex items-center">
                                    <!-- Icon -->
                                    <div class="mr-4">
                                        <font-awesome-icon :icon="['fas','cogs']" class="text-3xl text-white" />
                                    </div>
                                    <!-- Vertical Line -->
                                    <div class="h-10 w-px bg-white opacity-50 mr-4"></div>
                                    <!-- Text Content -->
                                    <div>
                                        <h2 id="exam-settings-heading" class="text-lg font-bold leading-6">การตั้งค่าประเภทและโหมด</h2>
                                        <p class="mt-0 text-sm text-indigo-200">กำหนดประเภทและโหมดการทำงานของแบบทดสอบ</p>
                                    </div>
                                </div>
                                <div class="px-5 pb-5">
                                    <div class="bg-blue-50 -mx-4 sm:-mx-6 px-4 sm:px-6 py-2 mb-3 border-b border-blue-100">
                                        <h3 class="text-sm font-semibold text-blue-800">ประเภทแบบทดสอบ</h3>
                                    </div>
                                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-2 mb-6">
                                        <div v-for="(typeItem) in typeData" :key="typeItem.code" class="w-full">
                                            <div class="flex items-start p-3 border border-gray-200 rounded-md">
                                                <div class="flex h-5 items-center">
                                                    <input 
                                                        v-model="checkedType" 
                                                        :id="typeItem.code" 
                                                        :value="typeItem.code" 
                                                        type="radio" 
                                                        class="h-4 w-4 cursor-pointer rounded-full border-gray-300 text-indigo-600 focus:ring-indigo-500">
                                                </div>
                                                <div class="ml-3 text-sm w-[90%]">
                                                    <label :for="typeItem.code" class="font-bold text-gray-900">{{typeItem.name}}</label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="bg-blue-50 -mx-4 sm:-mx-6 px-4 sm:px-6 py-2 mb-3 border-t border-b border-blue-100">
                                        <h3 class="text-sm font-semibold text-blue-800">ยืนยันตัว (Video Mode)</h3>
                                    </div>
                                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-2">
                                        <div class="w-full p-3 border border-gray-200 rounded-md">
                                            <div class="flex items-start">
                                                <div class="flex h-5 items-center">
                                                    <input 
                                                        v-model="verified" 
                                                        id="verified_yes" 
                                                        value="yes" 
                                                        name="verified" 
                                                        type="radio" 
                                                        class="h-4 w-4 cursor-pointer rounded-full border-gray-300 text-indigo-600 focus:ring-indigo-500">
                                                </div>
                                                <div class="ml-3 text-sm w-[90%]">
                                                    <label for="verified_yes" class="font-bold text-gray-900">ใช้งาน</label>
                                                    <p class="text-[16px] text-gray-500">เปิดใช้งานการยืนยันตัวตนผ่านวิดีโอ</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="w-full p-3 border border-gray-200 rounded-md">
                                            <div class="flex items-start">
                                                <div class="flex h-5 items-center">
                                                    <input 
                                                        v-model="verified" 
                                                        id="verified_no" 
                                                        value="no" 
                                                        name="verified" 
                                                        type="radio" 
                                                        class="h-4 w-4 cursor-pointer rounded-full border-gray-300 text-indigo-600 focus:ring-indigo-500">
                                                </div>
                                                <div class="ml-3 text-sm w-[90%]">
                                                    <label for="verified_no" class="font-bold text-gray-900">ไม่ใช้งาน</label>
                                                    <p class="text-[16px] text-gray-500">ไม่ต้องการยืนยันตัวตนผ่านวิดีโอ</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Section 3: การตั้งค่าการวัดผลและแสดงผลลัพธ์ -->
                            <div class="divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow mb-8">
                                <div class="bg-blue-700 text-white px-2 py-3 sm:px-3 rounded-t-lg flex items-center">
                                    <!-- Icon -->
                                    <div class="mr-4">
                                        <font-awesome-icon :icon="['fas','chart-bar']" class="text-3xl text-white" />
                                    </div>
                                    <!-- Vertical Line -->
                                    <div class="h-10 w-px bg-white opacity-50 mr-4"></div>
                                    <!-- Text Content -->
                                    <div>
                                        <h2 id="exam-scoring-heading" class="text-lg font-bold leading-6">การตั้งค่าการวัดผลและแสดงผลลัพธ์</h2>
                                        <p class="mt-0 text-sm text-indigo-200">กำหนดเงื่อนไขการวัดผลและการแสดงผลลัพธ์</p>
                                    </div>
                                </div>
                                <div class="px-5 pb-5">
                                    <div class="bg-blue-50 -mx-4 sm:-mx-6 px-4 sm:px-6 py-2 mb-3 border-b border-blue-100">
                                        <h3 class="text-sm font-semibold text-blue-800">ประเภทการวัดผล</h3>
                                    </div>
                                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-2 mb-6">
                                        <div class="w-full p-3 border border-gray-200 rounded-md">
                                            <div class="flex items-start">
                                                <div class="flex h-5 items-center">
                                                    <input 
                                                        v-model="measurement_type" 
                                                        id="measurement_score" 
                                                        value="score" 
                                                        name="measurement_type" 
                                                        type="radio" 
                                                        class="h-4 w-4 cursor-pointer rounded-full border-gray-300 text-indigo-600 focus:ring-indigo-500">
                                                </div>
                                                <div class="ml-3 text-sm w-[90%]">
                                                    <label for="measurement_score" class="font-bold text-gray-900">วัดผลด้วยคะแนน</label>
                                                    <p class="text-[16px] text-gray-500">ใช้คะแนนในการวัดผลการเรียนรู้แบบดั้งเดิม</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="w-full p-3 border border-gray-200 rounded-md">
                                            <div class="flex items-start">
                                                <div class="flex h-5 items-center">
                                                    <input 
                                                        v-model="measurement_type" 
                                                        id="measurement_level" 
                                                        value="level" 
                                                        name="measurement_type" 
                                                        type="radio" 
                                                        class="h-4 w-4 cursor-pointer rounded-full border-gray-300 text-indigo-600 focus:ring-indigo-500">
                                                </div>
                                                <div class="ml-3 text-sm w-[90%]">
                                                    <label for="measurement_level" class="font-bold text-gray-900">วัดผลด้วยเลเวล</label>
                                                    <p class="text-[16px] text-gray-500">ใช้ระดับความสามารถในการวัดผล สำหรับกราฟแมงมุม</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="bg-blue-50 -mx-4 sm:-mx-6 px-4 sm:px-6 py-2 mb-3 border-b border-blue-100">
                                        <h3 class="text-sm font-semibold text-blue-800">การวัดผล</h3>
                                    </div>
                                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-2 mb-6">
                                        <div class="w-full p-3 border border-gray-200 rounded-md">
                                            <div class="flex items-start">
                                                <div class="flex h-5 items-center">
                                                    <input 
                                                        v-model="is_score" 
                                                        id="is_score_yes" 
                                                        value="yes" 
                                                        name="is_score" 
                                                        type="radio" 
                                                        class="h-4 w-4 cursor-pointer rounded-full border-gray-300 text-indigo-600 focus:ring-indigo-500">
                                                </div>
                                                <div class="ml-3 text-sm w-[90%]">
                                                    <label for="is_score_yes" class="font-bold text-gray-900">วัดผล</label>
                                                    <p class="text-[16px] text-gray-500">ใช้ในการวัดผลการเรียนรู้</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="w-full p-3 border border-gray-200 rounded-md">
                                            <div class="flex items-start">
                                                <div class="flex h-5 items-center">
                                                    <input 
                                                        v-model="is_score" 
                                                        id="is_score_no" 
                                                        value="no" 
                                                        name="is_score" 
                                                        type="radio" 
                                                        class="h-4 w-4 cursor-pointer rounded-full border-gray-300 text-indigo-600 focus:ring-indigo-500">
                                                </div>
                                                <div class="ml-3 text-sm w-[90%]">
                                                    <label for="is_score_no" class="font-bold text-gray-900">ไม่วัดผล</label>
                                                    <p class="text-[16px] text-gray-500">ไม่ใช้ในการวัดผล</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div v-if="is_score==='yes'" class="p-4 border border-gray-200 rounded-md mb-6">
                                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label for="measure" class="block text-sm font-medium text-gray-700">ผ่านเกณฑ์</label>
                                                <input 
                                                    v-model="measure"
                                                    type="number" 
                                                    name="measure" 
                                                    id="measure" 
                                                    class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm">
                                            </div>
                                            
                                            <div>
                                                <label class="block text-sm font-medium text-gray-700 mb-2">ทำแบบทดสอบซ้ำ</label>
                                                <div class="grid grid-cols-2 gap-2">
                                                    <div class="flex items-start p-3 border border-gray-200 rounded-md">
                                                        <input 
                                                            v-model="is_repeat" 
                                                            id="is_repeat_yes" 
                                                            value="yes" 
                                                            name="is_repeat" 
                                                            type="radio" 
                                                            class="h-4 w-4 mt-0.5 cursor-pointer rounded-full border-gray-300 text-indigo-600 focus:ring-indigo-500">
                                                        <label for="is_repeat_yes" class="ml-3 text-sm font-medium text-gray-900">สอบซ้ำได้</label>
                                                    </div>
                                                    <div class="flex items-start p-3 border border-gray-200 rounded-md">
                                                        <input 
                                                            v-model="is_repeat" 
                                                            id="is_repeat_no" 
                                                            value="no" 
                                                            name="is_repeat" 
                                                            type="radio" 
                                                            class="h-4 w-4 mt-0.5 cursor-pointer rounded-full border-gray-300 text-indigo-600 focus:ring-indigo-500">
                                                        <label for="is_repeat_no" class="ml-3 text-sm font-medium text-gray-900">สอบซ้ำไม่ได้</label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="bg-blue-50 -mx-4 sm:-mx-6 px-4 sm:px-6 py-2 mb-3 border-t border-b border-blue-100">
                                        <h3 class="text-sm font-semibold text-blue-800">เฉลยผลลัพธ์และ Admin Mode</h3>
                                    </div>
                                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <div>
                                            <p class="text-sm font-medium text-gray-700 mb-2">แสดงผลลัพธ์</p>
                                            <div class="grid grid-cols-1 gap-2">
                                                <div class="w-full p-3 border border-gray-200 rounded-md">
                                                    <div class="flex items-start">
                                                        <div class="flex h-5 items-center">
                                                            <input 
                                                                v-model="is_result" 
                                                                id="is_result_yes" 
                                                                value="yes" 
                                                                name="is_result" 
                                                                type="radio" 
                                                                class="h-4 w-4 cursor-pointer rounded-full border-gray-300 text-indigo-600 focus:ring-indigo-500">
                                                        </div>
                                                        <div class="ml-3 text-sm w-[90%]">
                                                            <label for="is_result_yes" class="font-bold text-gray-900">แสดงผลลัพธ์</label>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="w-full p-3 border border-gray-200 rounded-md">
                                                    <div class="flex items-start">
                                                        <div class="flex h-5 items-center">
                                                            <input 
                                                                v-model="is_result" 
                                                                id="is_result_no" 
                                                                value="no" 
                                                                name="is_result" 
                                                                type="radio" 
                                                                class="h-4 w-4 cursor-pointer rounded-full border-gray-300 text-indigo-600 focus:ring-indigo-500">
                                                        </div>
                                                        <div class="ml-3 text-sm w-[90%]">
                                                            <label for="is_result_no" class="font-bold text-gray-900">ไม่แสดงผลลัพธ์</label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <p class="text-sm font-medium text-gray-700 mb-2">เฉลย (Admin Mode)</p>
                                            <div class="grid grid-cols-1 gap-2">
                                                <div class="w-full p-3 border border-gray-200 rounded-md">
                                                    <div class="flex items-start">
                                                        <div class="flex h-5 items-center">
                                                            <input 
                                                                v-model="adminmode" 
                                                                id="adminmode_yes" 
                                                                value="yes" 
                                                                name="adminmode" 
                                                                type="radio" 
                                                                class="h-4 w-4 cursor-pointer rounded-full border-gray-300 text-indigo-600 focus:ring-indigo-500">
                                                        </div>
                                                        <div class="ml-3 text-sm w-[90%]">
                                                            <label for="adminmode_yes" class="font-bold text-gray-900">แสดง</label>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="w-full p-3 border border-gray-200 rounded-md">
                                                    <div class="flex items-start">
                                                        <div class="flex h-5 items-center">
                                                            <input 
                                                                v-model="adminmode" 
                                                                id="adminmode_no" 
                                                                value="no" 
                                                                name="adminmode" 
                                                                type="radio" 
                                                                class="h-4 w-4 cursor-pointer rounded-full border-gray-300 text-indigo-600 focus:ring-indigo-500">
                                                        </div>
                                                        <div class="ml-3 text-sm w-[90%]">
                                                            <label for="adminmode_no" class="font-bold text-gray-900">ซ่อน</label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Section 4: การตั้งค่าวันที่และลายน้ำ -->
                            <div class="divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow mb-8">
                                <div class="bg-blue-700 text-white px-2 py-3 sm:px-3 rounded-t-lg flex items-center">
                                    <!-- Icon -->
                                    <div class="mr-4">
                                        <font-awesome-icon :icon="['fas','calendar-alt']" class="text-3xl text-white" />
                                    </div>
                                    <!-- Vertical Line -->
                                    <div class="h-10 w-px bg-white opacity-50 mr-4"></div>
                                    <!-- Text Content -->
                                    <div>
                                        <h2 id="exam-dates-heading" class="text-lg font-bold leading-6">การตั้งค่าวันที่และลายน้ำ</h2>
                                        <p class="mt-0 text-sm text-indigo-200">กำหนดเวลาการแสดงผล การประกาศผล และลายน้ำ</p>
                                    </div>
                                </div>
                                <div class="px-5 pb-5">
                                    <div class="bg-blue-50 -mx-4 sm:-mx-6 px-4 sm:px-6 py-2 mb-3 border-b border-blue-100">
                                        <h3 class="text-sm font-semibold text-blue-800">การแสดงผลแบบทดสอบ</h3>
                                    </div>
                                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-2 mb-6">
                                        <div v-for="(showItem) in showData" :key="showItem.code" class="w-full">
                                            <div class="flex items-start p-3 border border-gray-200 rounded-md">
                                                <div class="flex h-5 items-center">
                                                    <input 
                                                        v-model="checkedShow" 
                                                        :id="'show_'+showItem.code" 
                                                        :value="showItem.code" 
                                                        type="radio" 
                                                        class="h-4 w-4 cursor-pointer rounded-full border-gray-300 text-indigo-600 focus:ring-indigo-500">
                                                </div>
                                                <div class="ml-3 text-sm w-[90%]">
                                                    <label :for="'show_'+showItem.code" class="font-bold text-gray-900">{{showItem.name}}</label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div v-if="checkedShow==='duedate'" class="p-4 border border-gray-200 rounded-md mb-6">
                                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label class="block text-sm font-medium text-gray-700">วันที่เปิดสอบ</label>
                                                <datepicker v-model="show_duedate" :clearable="true" class="custom-datepicker mt-1">
                                                    <template v-slot:clear="{ onClear }">
                                                        <button @click="onClear" class="text-gray-400 hover:text-gray-600 transition-colors">ล้างข้อมูล</button>
                                                    </template>
                                                </datepicker>
                                            </div>
                                            <div>
                                                <label class="block text-sm font-medium text-gray-700">วันที่ปิดสอบ</label>
                                                <datepicker v-model="end_duedate" :clearable="true" class="custom-datepicker mt-1">
                                                    <template v-slot:clear="{ onClear }">
                                                        <button @click="onClear" class="text-gray-400 hover:text-gray-600 transition-colors">ล้างข้อมูล</button>
                                                    </template>
                                                </datepicker>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="bg-blue-50 -mx-4 sm:-mx-6 px-4 sm:px-6 py-2 mb-3 border-t border-b border-blue-100">
                                        <h3 class="text-sm font-semibold text-blue-800">การประกาศผล</h3>
                                    </div>
                                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-2 mb-6">
                                        <div v-for="(resultItem) in resultData" :key="resultItem.code" class="w-full">
                                            <div class="flex items-start p-3 border border-gray-200 rounded-md">
                                                <div class="flex h-5 items-center">
                                                    <input 
                                                        v-model="checkedResult" 
                                                        :id="'result_'+resultItem.code" 
                                                        :value="resultItem.code" 
                                                        type="radio" 
                                                        class="h-4 w-4 cursor-pointer rounded-full border-gray-300 text-indigo-600 focus:ring-indigo-500">
                                                </div>
                                                <div class="ml-3 text-sm w-[90%]">
                                                    <label :for="'result_'+resultItem.code" class="font-bold text-gray-900">{{resultItem.name}}</label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div v-if="checkedResult==='duedate'" class="p-4 border border-gray-200 rounded-md mb-6">
                                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label class="block text-sm font-medium text-gray-700">วันที่ประกาศผล</label>
                                                <datepicker v-model="result_duedate" :clearable="true" class="custom-datepicker mt-1">
                                                    <template v-slot:clear="{ onClear }">
                                                        <button @click="onClear" class="text-gray-400 hover:text-gray-600 transition-colors">ล้างข้อมูล</button>
                                                    </template>
                                                </datepicker>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="bg-blue-50 -mx-4 sm:-mx-6 px-4 sm:px-6 py-2 mb-3 border-t border-b border-blue-100">
                                        <h3 class="text-sm font-semibold text-blue-800">ลายน้ำ</h3>
                                    </div>
                                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-2 mb-6">
                                        <div class="w-full p-3 border border-gray-200 rounded-md">
                                            <div class="flex items-start">
                                                <div class="flex h-5 items-center">
                                                    <input 
                                                        v-model="watermark" 
                                                        id="watermark_yes" 
                                                        value="yes" 
                                                        name="watermark" 
                                                        type="radio" 
                                                        class="h-4 w-4 cursor-pointer rounded-full border-gray-300 text-indigo-600 focus:ring-indigo-500">
                                                </div>
                                                <div class="ml-3 text-sm w-[90%]">
                                                    <label for="watermark_yes" class="font-bold text-gray-900">แสดง</label>
                                                    <p class="text-[16px] text-gray-500">แสดงลายน้ำในแบบทดสอบ</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="w-full p-3 border border-gray-200 rounded-md">
                                            <div class="flex items-start">
                                                <div class="flex h-5 items-center">
                                                    <input 
                                                        v-model="watermark" 
                                                        id="watermark_no" 
                                                        value="no" 
                                                        name="watermark" 
                                                        type="radio" 
                                                        class="h-4 w-4 cursor-pointer rounded-full border-gray-300 text-indigo-600 focus:ring-indigo-500">
                                                </div>
                                                <div class="ml-3 text-sm w-[90%]">
                                                    <label for="watermark_no" class="font-bold text-gray-900">ซ่อน</label>
                                                    <p class="text-[16px] text-gray-500">ไม่แสดงลายน้ำ</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div v-if="watermark === 'yes'" class="p-4 border border-gray-200 rounded-md">
                                        <label class="block text-sm font-medium text-gray-700 mb-3">ตัวเลือกลายน้ำ</label>
                                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div class="flex items-start p-3 border border-gray-200 rounded-md">
                                                <input 
                                                    v-model="ipChecked" 
                                                    type="checkbox" 
                                                    class="h-4 w-4 mt-0.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500">
                                                <label class="ml-3 text-sm font-medium text-gray-900">IP Address</label>
                                            </div>
                                            <div class="flex items-start p-3 border border-gray-200 rounded-md">
                                                <input 
                                                    v-model="dateChecked" 
                                                    type="checkbox" 
                                                    class="h-4 w-4 mt-0.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500">
                                                <label class="ml-3 text-sm font-medium text-gray-900">วันเวลาที่สอบ</label>
                                            </div>
                                            <div class="flex items-start p-3 border border-gray-200 rounded-md">
                                                <input 
                                                    v-model="nameChecked" 
                                                    type="checkbox" 
                                                    class="h-4 w-4 mt-0.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500">
                                                <label class="ml-3 text-sm font-medium text-gray-900">ชื่อ-นามสกุล</label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Section: การตั้งค่าเลเวลและทักษะ (แสดงเมื่อ measurement_type = 'level') -->
                            <div v-if="measurement_type === 'level'" class="divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow mb-8">
                                <div class="bg-purple-700 text-white px-2 py-3 sm:px-3 rounded-t-lg flex items-center">
                                    <div class="mr-4">
                                        <font-awesome-icon :icon="['fas','layer-group']" class="text-3xl text-white" />
                                    </div>
                                    <div class="h-10 w-px bg-white opacity-50 mr-4"></div>
                                    <div>
                                        <h2 class="text-lg font-bold leading-6">การตั้งค่าเลเวลและทักษะ</h2>
                                        <p class="mt-0 text-sm text-purple-200">กำหนดหมวดหมู่ทักษะและระดับสำหรับการวัดผลแบบเลเวล</p>
                                    </div>
                                </div>
                                
                                <div class="px-5 pb-5">
                                    <!-- โครงสร้างเลเวล -->
                                    <div class="bg-purple-50 -mx-4 sm:-mx-6 px-4 sm:px-6 py-2 mb-3 border-b border-purple-100">
                                        <h3 class="text-sm font-semibold text-purple-800">โครงสร้างเลเวล</h3>
                                    </div>
                                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700">คะแนนเต็มแต่ละข้อ</label>
                                            <div class="mt-1 relative">
                                                <input 
                                                    v-model="level_structure.max_percentage"
                                                    type="number" 
                                                    min="1" 
                                                    max="100"
                                                    class="block w-full rounded-md border border-gray-300 py-2 px-3 pr-8 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-purple-500 sm:text-sm">
                                                <div class="absolute inset-y-0 right-0 flex items-center pr-3">
                                                    <span class="text-gray-500 sm:text-sm">%</span>
                                                </div>
                                            </div>
                                            <p class="mt-1 text-xs text-gray-500">คะแนนเต็มที่แต่ละข้อสามารถให้ได้</p>
                                        </div>
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700">ระดับการแสดงผล</label>
                                            <input 
                                                v-model="level_structure.output_levels"
                                                type="number" 
                                                min="5" 
                                                max="20"
                                                class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-purple-500 sm:text-sm">
                                            <p class="mt-1 text-xs text-gray-500">แสดงผลในกราฟแมงมุม 1-N ระดับ</p>
                                        </div>
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700">เปอร์เซ็นต์ผ่านเกณฑ์</label>
                                            <div class="mt-1 relative">
                                                <input 
                                                    v-model="level_structure.pass_percentage"
                                                    type="number" 
                                                    min="0"
                                                    max="100"
                                                    class="block w-full rounded-md border border-gray-300 py-2 px-3 pr-8 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-purple-500 sm:text-sm">
                                                <div class="absolute inset-y-0 right-0 flex items-center pr-3">
                                                    <span class="text-gray-500 sm:text-sm">%</span>
                                                </div>
                                            </div>
                                            <p class="mt-1 text-xs text-gray-500">% ขั้นต่ำที่ถือว่าผ่าน</p>
                                        </div>
                                    </div>

                                    <!-- ระดับคะแนน -->
                                    <div class="bg-purple-50 -mx-4 sm:-mx-6 px-4 sm:px-6 py-2 mb-3 border-b border-purple-100">
                                        <h3 class="text-sm font-semibold text-purple-800">ระดับคะแนน</h3>
                                        <p class="text-xs text-purple-600 mt-1">กำหนดระดับคะแนนและเปอร์เซ็นต์ที่จะใช้ในการสร้างข้อสอบ</p>
                                    </div>
                                    <div class="space-y-3 mb-6">
                                        <div v-for="(scoreLevel, index) in level_structure.score_levels" :key="scoreLevel.id" 
                                             class="border border-gray-200 rounded-lg p-4 bg-white">
                                            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                                                <div>
                                                    <label class="block text-sm font-medium text-gray-700">ชื่อระดับ</label>
                                                    <input 
                                                        v-model="scoreLevel.label"
                                                        type="text" 
                                                        placeholder="เช่น ถูกสมบูรณ์, ใกล้ถูก"
                                                        class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-purple-500 sm:text-sm">
                                                </div>
                                                <div>
                                                    <label class="block text-sm font-medium text-gray-700">เปอร์เซ็นต์</label>
                                                    <div class="mt-1 relative">
                                                        <input 
                                                            v-model="scoreLevel.percentage"
                                                            type="number" 
                                                            min="0"
                                                            max="100"
                                                            class="block w-full rounded-md border border-gray-300 py-2 px-3 pr-8 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-purple-500 sm:text-sm">
                                                        <div class="absolute inset-y-0 right-0 flex items-center pr-3">
                                                            <span class="text-gray-500 sm:text-sm">%</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label class="block text-sm font-medium text-gray-700">จัดการ</label>
                                                    <div class="mt-1 flex items-center space-x-2">
                                                        <div class="flex items-center px-3 py-2 bg-gray-100 rounded-md text-sm">
                                                            <span class="font-medium text-gray-700">{{ scoreLevel.label }}</span>
                                                            <span class="ml-2 px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium">
                                                                {{ scoreLevel.percentage }}%
                                                            </span>
                                                        </div>
                                                        <button 
                                                            @click="removeScoreLevel(index)"
                                                            :disabled="level_structure.score_levels.length <= 2"
                                                            type="button"
                                                            class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed">
                                                            <font-awesome-icon :icon="['fas','trash']" class="mr-1" />
                                                            ลบ
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- ปุ่มเพิ่มระดับคะแนน -->
                                    <div class="flex justify-center mb-6">
                                        <button 
                                            @click="addScoreLevel"
                                            type="button"
                                            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                                            <font-awesome-icon :icon="['fas','plus']" class="mr-2" />
                                            เพิ่มระดับคะแนน
                                        </button>
                                    </div>

                                    <!-- หมวดหมู่ทักษะ -->
                                    <div class="bg-purple-50 -mx-4 sm:-mx-6 px-4 sm:px-6 py-2 mb-3 border-b border-purple-100">
                                        <h3 class="text-sm font-semibold text-purple-800">หมวดหมู่ทักษะ</h3>
                                    </div>
                                    <div class="space-y-4 mb-6">
                                        <div v-for="(category, index) in level_categories" :key="category.id" 
                                             class="border border-gray-200 rounded-lg p-4">
                                            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                                                <div>
                                                    <label class="block text-sm font-medium text-gray-700">ชื่อทักษะ</label>
                                                    <input 
                                                        v-model="category.name"
                                                        type="text" 
                                                        class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-purple-500 sm:text-sm">
                                                </div>
                                                <div>
                                                    <label class="block text-sm font-medium text-gray-700">รหัส</label>
                                                    <input 
                                                        v-model="category.code"
                                                        type="text" 
                                                        class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-purple-500 sm:text-sm">
                                                </div>
                                                <div>
                                                    <label class="block text-sm font-medium text-gray-700">สี</label>
                                                    <div class="flex items-center space-x-2">
                                                        <input 
                                                            v-model="category.color"
                                                            type="color" 
                                                            class="h-10 w-16 rounded border border-gray-300">
                                                        <button 
                                                            @click="removeCategory(index)"
                                                            :disabled="level_categories.length <= 1"
                                                            type="button"
                                                            class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed">
                                                            <font-awesome-icon :icon="['fas','trash']" class="mr-1" />
                                                            ลบ
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- ปุ่มเพิ่มหมวดหมู่ -->
                                    <div class="flex justify-between items-center mb-6">
                                        <button 
                                            @click="addCategory"
                                            type="button"
                                            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
                                            <font-awesome-icon :icon="['fas','plus']" class="mr-2" />
                                            เพิ่มหมวดหมู่ทักษะ
                                        </button>
                                        <div class="text-sm text-gray-600">
                                            <strong>ระดับคะแนนที่แนะนำ:</strong> 
                                            <span class="inline-flex space-x-1 ml-1">
                                                <span v-for="(score, index) in availableScores" :key="index" 
                                                      class="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                                                    {{ score.value }}
                                                </span>
                                            </span>
                                        </div>
                                    </div>

                                    <!-- ตัวอย่างการใช้งาน -->
                                    <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                        <h4 class="text-sm font-semibold text-gray-800 mb-2">💡 ตัวอย่างการใช้งาน</h4>
                                        <ul class="text-sm text-gray-600 space-y-1">
                                            <li>• <strong>กำหนดคะแนน</strong> ให้แต่ละคำตอบเป็นเปอร์เซ็นต์ตรงๆ (เช่น 0%, 25%, 75%, 100%)</li>
                                            <li>• <strong>จำนวนข้อสอบ</strong> ในแต่ละทักษะไม่จำกัด ยืดหยุ่นตามเนื้อหา</li>
                                            <li>• <strong>การประมวลผล</strong> จะนำเปอร์เซ็นต์ของแต่ละทักษะมาหาค่าเฉลี่ย</li>
                                            <li>• <strong>ผลลัพธ์</strong> จะแสดงเป็นกราฟแมงมุมตามระดับการแสดงผลที่กำหนด</li>
                                        </ul>
                                        
                                        <div class="mt-3 p-3 bg-purple-50 rounded-lg">
                                            <h5 class="text-xs font-semibold text-purple-800 mb-1">ตัวอย่างคำตอบ:</h5>
                                            <div class="text-xs text-purple-700 space-y-1">
                                                <div>A) คำตอบผิด → <span class="font-semibold">0%</span></div>
                                                <div>B) คำตอบใกล้ถูก → <span class="font-semibold">60%</span></div>
                                                <div>C) คำตอบถูกส่วนใหญ่ → <span class="font-semibold">85%</span></div>
                                                <div>D) คำตอบถูกสมบูรณ์ → <span class="font-semibold">100%</span></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Section 5: คำอธิบายรายวิชา -->
                            <div class="divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow">
                                <div class="bg-blue-700 text-white px-2 py-3 sm:px-3 rounded-t-lg flex items-center">
                                    <!-- Icon -->
                                    <div class="mr-4">
                                        <font-awesome-icon :icon="['fas','file-alt']" class="text-3xl text-white" />
                                    </div>
                                    <!-- Vertical Line -->
                                    <div class="h-10 w-px bg-white opacity-50 mr-4"></div>
                                    <!-- Text Content -->
                                    <div>
                                        <h2 id="exam-description-heading" class="text-lg font-bold leading-6">คำอธิบายรายวิชา</h2>
                                        <p class="mt-0 text-sm text-indigo-200">เพิ่มรายละเอียดและคำอธิบายเกี่ยวกับแบบทดสอบ</p>
                                    </div>
                                </div>
                                
                                <div class="px-5 pb-5">
                                    <div class="bg-blue-50 -mx-4 sm:-mx-6 px-4 sm:px-6 py-2 mb-3 border-b border-blue-100">
                                        <label for="description_editor" class="block text-sm font-bold text-blue-800">คำอธิบาย</label>
                                    </div>
                                    <div class="mb-6">
                                        <editor v-if="isEditMode && description" :content="description" @update-content="updateItem_description"/>
                                        <editor v-else-if="isAddMode" :content="description" @update-content="updateItem_description"/>
                                    </div>
                                </div>
                                
                                <!-- Action Buttons -->
                                <div class="bg-gray-50 px-4 py-4 sm:px-6 flex justify-between items-center rounded-b-lg shadow border-t border-gray-200">
                                    <div></div>
                                    <div>
                                        <button
                                            @click="handleCancel"
                                            type="button" 
                                            class="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                                            ยกเลิก
                                        </button>

                                        <button 
                                            type="submit" 
                                            class="ml-3 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                                            <font-awesome-icon :icon="['fas','save']" class="mr-2" />บันทึกข้อมูล
                                        </button>
                                    </div>
                                </div>
                            </div>

                        </section>
                    </form>
                    
                    <!-- Demo Section (แสดงเมื่อเป็นแบบ level) -->
                    <div v-if="measurement_type === 'level'" class="mt-8">
                        <div class="bg-white rounded-lg shadow mb-6 p-6">
                            <div class="flex items-center justify-between">
                                <div>
                                    <h2 class="text-xl font-bold text-gray-900 flex items-center">
                                        <font-awesome-icon :icon="['fas','play-circle']" class="mr-3 text-indigo-600" />
                                        ทดสอบแบบทดสอบ
                                    </h2>
                                    <p class="text-gray-600 mt-1">ทดลองใช้งานแบบทดสอบตามการตั้งค่าที่กำหนด</p>
                                </div>
                            </div>
                        </div>
                        
                        <ExamDemo 
                            v-if="level_categories.length > 0 && level_structure.score_levels.length > 0"
                            :examConfig="{
                                name: name || 'แบบทดสอบตัวอย่าง',
                                description: description || 'แบบทดสอบประเมินทักษะแบบเลเวล',
                                measurement_type: measurement_type,
                                level_categories: level_categories,
                                level_structure: level_structure
                            }"
                            :questions="getDemoQuestions()"
                            @exam-completed="handleDemoCompleted"
                        />
                        
                        <div v-else class="bg-white rounded-lg shadow p-8 text-center">
                            <font-awesome-icon :icon="['fas','exclamation-triangle']" class="text-4xl text-yellow-500 mb-4" />
                            <h3 class="text-lg font-semibold text-gray-900 mb-2">ไม่สามารถสร้างข้อสอบตัวอย่างได้</h3>
                            <p class="text-gray-600">กรุณาตั้งค่าหมวดหมู่ทักษะและระดับคะแนนก่อน</p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    </div>
</div>
</template>

<style scoped>
/* Custom Datepicker Styles */
.custom-datepicker :deep(.v3dp__datepicker) {
  width: 100%;
}

.custom-datepicker :deep(.v3dp__input_wrapper) {
  width: 100%;
}

.custom-datepicker :deep(.v3dp__datepicker input[type=text]) {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  border: 1px solid #d1d5db;
  transition: all 0.2s;
}

.custom-datepicker :deep(.v3dp__datepicker input[type=text]:focus) {
  border-color: #374151;
  box-shadow: 0 0 0 1px #374151;
}

.custom-datepicker :deep(.v3dp__clearable) {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
}

/* Loading Block Styles */
.isblock::before {
  content: attr(data-content);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.8);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  font-weight: 600;
  color: #374151;
}

.isunblock::before {
  display: none;
}
</style> 