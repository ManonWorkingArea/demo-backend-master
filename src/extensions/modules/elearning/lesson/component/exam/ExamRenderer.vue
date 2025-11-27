<template>
  <div class="bg-gray-100 min-h-screen py-6">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="bg-white rounded-lg shadow mb-6 p-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">{{ examConfig.name }}</h1>
            <p class="text-gray-600 mt-1">{{ examConfig.description || 'แบบทดสอบประเมินทักษะแบบเลเวล' }}</p>
          </div>
          <div class="text-right">
            <div class="text-sm text-gray-500">คำถามทั้งหมด</div>
            <div class="text-2xl font-bold text-indigo-600">{{ totalQuestions }} ข้อ</div>
          </div>
        </div>
        
        <!-- Progress Bar -->
        <div class="mt-4">
          <div class="flex justify-between text-sm text-gray-600 mb-2">
            <span>ความคืบหน้า</span>
            <span>{{ answeredQuestions }}/{{ totalQuestions }} ข้อ</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div class="bg-indigo-600 h-2 rounded-full transition-all duration-300" 
                 :style="{ width: progressPercentage + '%' }"></div>
          </div>
        </div>
      </div>

      <!-- Questions by Category -->
      <div v-for="category in examConfig.level_categories" :key="category.id" class="mb-8">
        <div class="bg-white rounded-lg shadow overflow-hidden">
          <!-- Category Header -->
          <div class="px-6 py-4" :style="{ backgroundColor: category.color + '20', borderLeft: '4px solid ' + category.color }">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-xl font-semibold" :style="{ color: category.color }">{{ category.name }}</h2>
                <p class="text-sm text-gray-600 mt-1">รหัส: {{ category.code }}</p>
              </div>
              <div class="text-right">
                <div class="text-sm text-gray-500">ความคืบหน้า</div>
                <div class="text-lg font-semibold" :style="{ color: category.color }">
                  {{ getCategoryProgress(category.id) }}/{{ getCategoryQuestionCount(category.id) }} ข้อ
                </div>
              </div>
            </div>
          </div>

          <!-- Questions in Category -->
          <div class="p-6 space-y-6">
            <div v-for="(question, qIndex) in getQuestionsByCategory(category.id)" :key="question.id"
                 class="border border-gray-200 rounded-lg p-4">
              
              <!-- Question Header -->
              <div class="flex items-start justify-between mb-4">
                <div class="flex-1">
                  <h3 class="text-lg font-medium text-gray-900">
                    ข้อ {{ qIndex + 1 }}: {{ question.title }}
                  </h3>
                  <p class="text-gray-600 mt-2" v-if="question.description">{{ question.description }}</p>
                </div>
                <div class="ml-4 flex-shrink-0">
                  <span v-if="userAnswers[question.id]" 
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    ✓ ตอบแล้ว
                  </span>
                  <span v-else 
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    ยังไม่ตอบ
                  </span>
                </div>
              </div>

              <!-- Answer Choices -->
              <div class="space-y-3">
                <div v-for="(scoreLevel, levelIndex) in examConfig.level_structure.score_levels" 
                     :key="scoreLevel.id"
                     class="relative">
                  <label class="flex items-start p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                         :class="{
                           'border-indigo-500 bg-indigo-50': userAnswers[question.id] === scoreLevel.id,
                           'border-gray-200': userAnswers[question.id] !== scoreLevel.id
                         }">
                    <input type="radio" 
                           :name="`question_${question.id}`"
                           :value="scoreLevel.id"
                           v-model="userAnswers[question.id]"
                           @change="updateAnswer(question.id, scoreLevel.id)"
                           class="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300">
                    
                    <div class="ml-3 flex-1">
                      <div class="flex items-center justify-between">
                        <span class="text-sm font-medium text-gray-900">
                          {{ String.fromCharCode(65 + levelIndex) }}. {{ scoreLevel.label }}
                        </span>
                        <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                              :class="{
                                'bg-indigo-100 text-indigo-800': userAnswers[question.id] === scoreLevel.id,
                                'bg-gray-100 text-gray-800': userAnswers[question.id] !== scoreLevel.id
                              }">
                          {{ scoreLevel.percentage }}%
                        </span>
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Results Summary -->
      <div v-if="isCompleted" class="bg-white rounded-lg shadow p-6">
        <h2 class="text-xl font-bold text-gray-900 mb-4">📊 สรุปผลการทำแบบทดสอบ</h2>
        
        <!-- Spider Chart -->
        <div class="mb-8">
          <SpiderChart 
            :skillData="chartData"
            :maxLevel="examConfig.level_structure.output_levels"
            :overallScore="overallScore"
            :passPercentage="examConfig.level_structure.pass_percentage"
          />
        </div>
        
        <!-- Category Scores -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div v-for="category in examConfig.level_categories" :key="category.id"
               class="border rounded-lg p-4" :style="{ borderColor: category.color }">
            <div class="flex items-center justify-between mb-2">
              <h3 class="font-medium" :style="{ color: category.color }">{{ category.name }}</h3>
              <span class="text-sm font-medium">{{ getCategoryScore(category.id).toFixed(1) }}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div class="h-2 rounded-full transition-all duration-300"
                   :style="{ 
                     width: getCategoryScore(category.id) + '%',
                     backgroundColor: category.color 
                   }"></div>
            </div>
            <div class="text-xs text-gray-500 mt-1">
              {{ getCategoryLevel(category.id) }}/{{ examConfig.level_structure.output_levels }}
            </div>
          </div>
        </div>

        <!-- Overall Score -->
        <div class="bg-gray-50 rounded-lg p-4">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-semibold text-gray-900">คะแนนรวม</h3>
              <p class="text-sm text-gray-600">ค่าเฉลี่ยของทุกทักษะ</p>
            </div>
            <div class="text-right">
              <div class="text-3xl font-bold" 
                   :class="{
                     'text-green-600': overallScore >= examConfig.level_structure.pass_percentage,
                     'text-red-600': overallScore < examConfig.level_structure.pass_percentage
                   }">
                {{ overallScore.toFixed(1) }}%
              </div>
              <div class="text-sm font-medium"
                   :class="{
                     'text-green-600': overallScore >= examConfig.level_structure.pass_percentage,
                     'text-red-600': overallScore < examConfig.level_structure.pass_percentage
                   }">
                {{ overallScore >= examConfig.level_structure.pass_percentage ? '✅ ผ่านเกณฑ์' : '❌ ไม่ผ่านเกณฑ์' }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="bg-white rounded-lg shadow p-6 mt-6">
        <div class="flex justify-between items-center">
          <button @click="resetAnswers" 
                  class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
            🔄 เริ่มใหม่
          </button>
          
          <div class="space-x-3">
            <button v-if="!isCompleted" @click="scrollToFirstUnanswered"
                    class="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700">
              ไปข้อที่ยังไม่ได้ตอบ
            </button>
            <button @click="submitExam" 
                    :disabled="!isCompleted"
                    class="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed">
              {{ isCompleted ? '📋 ส่งแบบทดสอบ' : `เหลืออีก ${totalQuestions - answeredQuestions} ข้อ` }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SpiderChart from './SpiderChart.vue';

export default {
  name: 'ExamRenderer',
  components: {
    SpiderChart
  },
  props: {
    examConfig: {
      type: Object,
      required: true,
      default: () => ({
        name: 'แบบทดสอบ',
        description: '',
        level_categories: [],
        level_structure: {
          score_levels: [],
          output_levels: 10,
          pass_percentage: 60
        }
      })
    },
    questions: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      userAnswers: {}, // { questionId: scoreLevelId }
    }
  },
  computed: {
    totalQuestions() {
      return this.questions.length;
    },
    answeredQuestions() {
      return Object.keys(this.userAnswers).length;
    },
    progressPercentage() {
      return this.totalQuestions > 0 ? (this.answeredQuestions / this.totalQuestions) * 100 : 0;
    },
    isCompleted() {
      return this.answeredQuestions === this.totalQuestions;
    },
    overallScore() {
      if (!this.isCompleted) return 0;
      
      const categoryScores = this.examConfig.level_categories.map(category => 
        this.getCategoryScore(category.id)
      );
      
      return categoryScores.reduce((sum, score) => sum + score, 0) / categoryScores.length;
    },
    chartData() {
      return this.examConfig.level_categories.map(category => ({
        name: category.name,
        level: this.getCategoryLevel(category.id),
        percentage: this.getCategoryScore(category.id),
        color: category.color
      }));
    }
  },
  methods: {
    getQuestionsByCategory(categoryId) {
      return this.questions.filter(q => q.category_id === categoryId);
    },
    getCategoryQuestionCount(categoryId) {
      return this.getQuestionsByCategory(categoryId).length;
    },
    getCategoryProgress(categoryId) {
      const categoryQuestions = this.getQuestionsByCategory(categoryId);
      return categoryQuestions.filter(q => this.userAnswers[q.id]).length;
    },
    getCategoryScore(categoryId) {
      const categoryQuestions = this.getQuestionsByCategory(categoryId);
      if (categoryQuestions.length === 0) return 0;
      
      let totalScore = 0;
      let answeredCount = 0;
      
      categoryQuestions.forEach(question => {
        if (this.userAnswers[question.id]) {
          const scoreLevel = this.examConfig.level_structure.score_levels.find(
            level => level.id === this.userAnswers[question.id]
          );
          if (scoreLevel) {
            totalScore += scoreLevel.percentage;
            answeredCount++;
          }
        }
      });
      
      return answeredCount > 0 ? totalScore / answeredCount : 0;
    },
    getCategoryLevel(categoryId) {
      const score = this.getCategoryScore(categoryId);
      return Math.round((score / 100) * this.examConfig.level_structure.output_levels);
    },
    updateAnswer(questionId, scoreLevelId) {
      this.userAnswers = { ...this.userAnswers, [questionId]: scoreLevelId };
      this.$emit('answer-updated', {
        questionId,
        scoreLevelId,
        answers: { ...this.userAnswers }
      });
    },
    resetAnswers() {
      this.userAnswers = {};
      this.$emit('exam-reset');
    },
    scrollToFirstUnanswered() {
      const unansweredQuestion = this.questions.find(q => !this.userAnswers[q.id]);
      if (unansweredQuestion) {
        const element = document.querySelector(`[name="question_${unansweredQuestion.id}"]`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    },
    submitExam() {
      if (!this.isCompleted) {
        alert('กรุณาตอบคำถามให้ครบทุกข้อก่อนส่งแบบทดสอบ');
        return;
      }
      
      const results = {
        userAnswers: this.userAnswers,
        categoryScores: {},
        overallScore: this.overallScore,
        passed: this.overallScore >= this.examConfig.level_structure.pass_percentage
      };
      
      // Calculate category scores
      this.examConfig.level_categories.forEach(category => {
        results.categoryScores[category.id] = {
          name: category.name,
          code: category.code,
          score: this.getCategoryScore(category.id),
          level: this.getCategoryLevel(category.id)
        };
      });
      
      this.$emit('exam-submitted', results);
    }
  }
}
</script>

<style scoped>
.transition-colors {
  transition: background-color 0.2s ease-in-out, border-color 0.2s ease-in-out;
}
</style> 