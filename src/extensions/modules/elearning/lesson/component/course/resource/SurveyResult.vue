<template>
  <div class="survey-layout p-2 mb-3">
    <div class="flex flex-col">
      <div class="mb-4">
        <div>
          <span class="font-semibold">Name:</span> {{ surveyData.name }}
        </div>
        <div>
          <span class="font-semibold">Description:</span> {{ surveyData.description }}
        </div>
      </div>

      <div class="">
        <div v-for="(choiceGroup, groupIndex) in surveyData.choiceGroups" :key="groupIndex" :class="{'error-class': choiceGroup.error}" class="choice-group border border-b-0 border-gray-400 mb-2 rounded-sm">

          <template v-if="choiceGroup.groupType === 'custom'">
            <div class="flex border-b border-gray-400 p-1 bg-gray-100">
              <h3 class="w-2/5 text-md font-semibold">{{ groupIndex + 1 }}. {{ choiceGroup.groupName }}</h3>
              <div class="w-3/5 space-y-0">

                  <div v-for="(choice, choiceIndex) in choiceGroup.choices" :key="choiceIndex" class="flex items-center">
                    <template v-if="choice.type === 'radio'">
                      <div class="w-full flex justify-start">
                        <label class="flex items-center px-2 text-sm">
                          <input type="radio" v-model="choiceGroup.selectedChoice" :value="choice.choiceText" class="mr-2 text-sm"> {{ choice.choiceText }}
                        </label>
                      </div>
                    </template>
                    <template v-else-if="choice.type === 'textarea'">
                      <textarea v-model="choice.choiceValue" class="w-full p-1 h-32 rounded-sm"></textarea>
                    </template>
                  </div>
              
              </div>
            </div>
          </template>
          
          <template v-if="choiceGroup.groupType==='score'">

            <h3 class="text-md font-semibold p-1 border-b border-gray-400 bg-gray-100">{{ groupIndex + 1 }}. {{ choiceGroup.groupName }}</h3>
            <div class="space-y-0">
              <div v-for="(choice, choiceIndex) in choiceGroup.choices" :key="choiceIndex" :class="{'error-class': choiceGroup.error}" class="flex items-center border-b border-gray-400 p-1 flex-col md:flex-row">
                <div class="w-full md:w-2/5 flex flex-col justify-start">
                  <p class="mb-1 px-2 text-sm">{{ groupIndex + 1 }}.{{ choiceIndex + 1 }}. {{ choice.choiceText }}</p>
                </div>
                <div class="w-full md:w-3/5 mt-2 md:mt-0">

                  <template v-if="choice.type === 'radio'">
                    <div :class="['grid', 'gap-0', 'md:grid-cols-' + surveyData.score, 'md:grid-rows-1', 'grid-cols-1', 'md:grid-cols-' + surveyData.score]">
                      <label v-for="(count, optionIndex) in surveyData.score" :key="count" class="flex items-center px-2 text-sm">
                        <input type="radio" :value="surveyData.score - optionIndex" v-model="choice.choiceValue" @change="updateCustomScore(choice)" class="mr-2 text-sm">
                        {{ scoreItemLabels[surveyData.score - optionIndex - 1] }}
                      </label>
                    </div>
                  </template>
                  
                  <template v-else-if="choice.type === 'textarea'">
                    <textarea v-model="choice.choiceValue" class="w-full p-1 h-32 rounded-sm"></textarea>
                  </template>

                </div>
              </div>
              
            </div>

          </template>

        </div>
      </div>
    </div>

    <div class="mt-2">
      <p class="font-semibold">Summary Score: {{ summaryScore }}</p>
    </div>

    <div class="mt-2 space-x-2 mb-5">
      <button @click="saveResult" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">ส่งข้อมูล</button>
      <button @click="clearSurvey" class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">เคลียร์ข้อมูล</button>
    </div>

    <div v-if="hasErrors" class="mt-2 p-4 bg-red-200 border border-red-400 rounded">
      <h3 class="font-semibold text-red-700">เกิดข้อผิดพลาด (s):</h3>
      <ul>
        <li v-for="(error, index) in errors" :key="index" class="text-red-700">{{ error }}</li>
      </ul>
    </div>
  </div>
</template>

<script>
  import debug from '@/plugins/Logger.js';
  export default {
    props: {
      surveyData: Object,
      scoreItemLabels: Array,
      surveyResults: Array
    },
    data() {
      return {
        errors: [],
        hasErrors: false,
        preview:[]
      };
    },
    computed: {
      summaryScore() {
        let totalScore = 0;
        this.surveyData.choiceGroups.forEach((choiceGroup) => {
          if (choiceGroup.groupType !== 'custom') {
            choiceGroup.choices.forEach((choice) => {
              if (choice.type === 'radio') {
                const choiceValue = Number(choice.choiceValue) || 0;
                if (choiceValue === 5 && choice.hasCustomScore) {
                  const customScore = Number(choice.customScore) || 0;
                  totalScore += customScore;
                } else {
                  totalScore += choiceValue;
                }
              }
            });
          }
        });
        return totalScore;
      }
    },
    methods: {
      updateCustomScore(choice) {
        debug.log("choice",choice);
      },
      sanitizeString(str) {
        const correctedPattern = /[,!@#$%^&*();/|<>"']+/g;
        return str.replace(correctedPattern, '');
      },
      saveResult() {
        this.errors = [];
        this.hasErrors = false;
        this.surveyData.choiceGroups.forEach((choiceGroup) => {
          choiceGroup.choices.forEach(() => {
            choiceGroup.error = false;
          });
            if (choiceGroup.groupType === 'custom') {
              let hasRequiredChoice = choiceGroup.choices.some(choice => choice.isRequested && choice.type === 'radio');
              if (hasRequiredChoice && !choiceGroup.selectedChoice) {
                this.errors.push(`ตัวเลือกในกลุ่ม "${choiceGroup.groupName}" ยังไม่ได้เลือกคำตอบ.`);
                choiceGroup.error = true;
              }
              choiceGroup.choices.forEach((choice) => {
                if (choice.isRequested && choice.type === 'textarea' && !choice.choiceValue) {
                  this.errors.push(`ข้อความ "${choiceGroup.groupName}" ยังไม่ได้กรอกข้อมูล.`);
                  choiceGroup.error = true;
                }
              });
            } else {
              choiceGroup.choices.forEach((choice) => {
                if (choice.isRequested && choice.type === 'radio' && choice.choiceValue === null) {
                  this.errors.push(`ตัวเลือก "${choice.choiceText}" ยังไม่ได้เลือกคำตอบ.`);
                  choiceGroup.error = true;
                } else if (choice.isRequested && choice.type === 'textarea' && !choice.choiceValue) {
                  this.errors.push(`ข้อความ "${choice.choiceText}" ยังไม่ได้กรอกข้อมูล.`);
                  choiceGroup.error = true;
                }
              });
            }
          });
        if (this.errors.length > 0) {
          this.hasErrors = true;
        } else {
          const result = {
            name: this.surveyData.name,
            score: this.surveyData.score,
            scoreSummary: this.summaryScore,
            choiceGroups: this.surveyData.choiceGroups.map((choiceGroup) => {
              if (choiceGroup.groupType === 'custom') {
                return {
                  groupName: choiceGroup.groupName,
                  groupType: choiceGroup.groupType,
                  choices: choiceGroup.choices.map((choice) => ({
                    choiceText: choice.choiceText,
                    type: choice.type,
                  })),
                  selectedChoice: choiceGroup.choices.some(choice => choice.type === 'textarea')
                  ? this.sanitizeString(choiceGroup.choices.find(choice => choice.type === 'textarea' && choice.choiceValue)?.choiceValue || '')
                  : choiceGroup.selectedChoice,
                };
              } else {
                return {
                  groupName: choiceGroup.groupName,
                  groupType: choiceGroup.groupType,
                  choices: choiceGroup.choices.map((choice) => {
                    return {
                      choiceText: choice.choiceText,
                      type: choice.type,
                      choiceValue: choice.type === 'textarea' ? this.sanitizeString(choice.choiceValue || '') : choice.choiceValue, // Apply sanitizeString if textarea
                    };
                  }),
                };
              }
            }),
          };
          this.preview = result
          this.$emit("save-result", result);
        }
      },
      clearSurvey() {
        this.surveyData.choiceGroups.forEach((choiceGroup) => {
          if (choiceGroup.groupType === 'custom') {
            choiceGroup.selectedChoice = null;
          } else {
            choiceGroup.choices.forEach((choice) => {
              if (choice.type === 'radio') {
                choice.choiceValue = null;
              } else if (choice.type === 'textarea') {
                choice.choiceValue = '';
              }
            });
          }
        });
      },
    }
  };
  </script>
  
<style scoped>
.error-class { 
  border: 2px solid #ff8e8e;
}
</style>
