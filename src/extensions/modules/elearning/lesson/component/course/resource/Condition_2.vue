<template>
  <div class="p-4">
    <div class="grid grid-cols-2 gap-4 mb-4">
      <div v-for="(caseItem, caseIndex) in cases" :key="caseIndex" class="bg-white p-4 rounded-lg shadow-md">

        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label for="caseName" class="block text-gray-700 font-bold mb-2">Case Name:</label>
            <input type="text" v-model="caseItem.caseName" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300" />
          </div>
          <div>
            <label for="caseConditionRef" class="block text-gray-700 font-bold mb-2">Case Condition Reference:</label>
            <input type="text" v-model="caseItem.caseConditionRef" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300" />
          </div>
        </div>


        <div class="mb-4">
          <label class="block text-gray-700 font-bold mb-2">Select Conditions:</label>
          <div class="grid grid-cols-3 gap-2">
            <div v-for="(condition) in conditions" :key="condition.code" class="flex items-center mb-2">
              <label class="flex items-center">
                <input type="checkbox" v-model="caseItem.selectedConditions[condition.code]" class="mr-2" />
                {{ condition.name }}
              </label>
            </div>
          </div>
        </div>
        
        <div v-for="condition in conditions" :key="condition.code" class="mb-4">
          <div v-if="caseItem.selectedConditions[condition.code]" class="bg-gray-100 p-4 rounded-lg">
            <strong class="block text-gray-700 font-bold mb-2">{{ condition.name }}</strong>

            <div v-for="exam in examData" :key="exam._id" class="mb-2">
              <label class="flex items-center">
                <input type="radio" :name="'examSelection_' + caseIndex + '_' + condition.code" v-model="caseItem.selectedExam[condition.code]" :value="exam._id" class="mr-2" />
                {{ exam.name }}
              </label>
            </div>

            <label class="block text-gray-700 font-bold mb-2">Conditions:</label>


            <div class="grid grid-cols-2 gap-2 mb-2">
              <div v-for="date in dates" :key="date.code">
                <label class="flex items-center">
                  <input type="checkbox" v-model="caseItem.selectedDates[condition.code][date.code]" @change="handleDateCheckboxChange(caseItem, condition.code, date.code)" class="mr-2" />
                  {{ date.name }}
                </label>
                <div v-if="caseItem.selectedDates[condition.code][date.code]" class="mt-2">
                  <!-- <label class="block text-gray-700 font-bold mb-1">Select Date and Time:</label> -->
                  <Datepicker v-model="caseItem.dateTimeValues[condition.code][date.code]" :clearable="true" class="w-full">
                    <template v-slot:clear="{ onClear }">
                      <button @click="onClear" class="mt-2 text-sm text-red-500">Clear</button>
                    </template>
                  </Datepicker>
                </div>
              </div>
            </div>
            
          </div>
        </div>
        <div class="flex justify-end space-x-2 mt-4">
          <button v-if="caseIndex > 0" @click="removeCase(caseIndex)" class="px-4 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-700">Remove Case</button>
          <button v-if="caseIndex === 0" @click="clearCase()" class="px-4 py-2 bg-yellow-500 text-white rounded-lg shadow hover:bg-yellow-700">Clear Case</button>
        </div>
      </div>
    </div>
    <div class="flex justify-end mt-4">
      <button @click="addCase" class="px-4 py-2 bg-green-500 text-white rounded-lg shadow hover:bg-green-700">Add Case</button>
    </div>

    <pre class="mt-8 bg-gray-100 p-4 rounded-lg shadow">{{ conditionArray }}</pre>

    <button @click="logCases" class="px-4 py-2 mt-4 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-700">Log Cases Data</button>

    <div class="mt-8">
      <h3 class="text-xl font-bold mb-2">Check Date Difference</h3>
      <input type="text" v-model="caseName" placeholder="Case Name" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300 mb-2" />
      <input type="text" v-model="optionName" placeholder="Option Name" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300 mb-2" />
      <input type="text" v-model="dateNameFrom" placeholder="Date From" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300 mb-2" />
      <input type="text" v-model="dateNameTo" placeholder="Date To (Optional)" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300 mb-2" />
      <button @click="checkDateDiff" class="px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-700">Check</button>
      <p class="mt-2">{{ dateDiffStatus }}</p>
    </div>

    <div class="mt-8">
      <h3 class="text-xl font-bold mb-2">Get Condition Data</h3>
      <input type="text" v-model="caseName" placeholder="Case Name" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300 mb-2" />
      <input type="text" v-model="optionName" placeholder="Option Name" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300 mb-2" />
      <input type="text" v-model="dateNameFrom" placeholder="Date From" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300 mb-2" />
      <button @click="fetchConditionData" class="px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-700">Fetch</button>
      <p class="mt-2">{{ conditionData }}</p>
    </div>
  </div>
</template>

<script>
import Datepicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import { dayDiff, getData } from './Condition';

export default {
  components: {
    Datepicker,
  },
  props: {
    dataItem: String,
    courseData: Object,
    examData: Array,
    tabs: Object,
  },
  data() {
    return {
      cases: [],
      dates: [
        { code: 'start_date', name: 'เปิดสอบ' },
        { code: 'stop_date', name: 'ปิดสอบ' },
        { code: 'result_date', name: 'ประกาศผล' },
        { code: 'cert_date', name: 'ใบรับรอง' },
      ],
      conditions: [
        { code: 'pretest', name: 'สอบก่อนเรียน' },
        { code: 'posttest', name: 'สอบวัดผล' },
        { code: 'retest', name: 'สอบซ่อม' },
      ],
      caseName: '',
      optionName: '',
      dateNameFrom: '',
      dateNameTo: '',
      dateDiffStatus: '',
      conditionData: null,
    };
  },
  computed: {
    conditionArray() {
      const conditions = {
        case: [],
      };
      this.cases.forEach((caseItem) => {
        const caseObj = {
          name: caseItem.caseName,
          code: caseItem.caseConditionRef,
          option: {},
        };
        this.conditions.forEach((condition) => {
          if (caseItem.selectedConditions[condition.code]) {
            caseObj.option[condition.code] = {
              examId: caseItem.selectedExam[condition.code],
              dates: {},
            };
            this.dates.forEach((date) => {
              if (caseItem.selectedDates[condition.code][date.code]) {
                caseObj.option[condition.code].dates[date.code] = caseItem.dateTimeValues[condition.code][date.code];
              }
            });
          }
        });
        conditions.case.push(caseObj);
      });
      return conditions;
    },
  },
  methods: {
    selectedConditions(caseItem) {
      return this.conditions.filter((condition) => caseItem.selectedConditions[condition.code]);
    },
    addCase() {
      const newCase = {
        caseName: '',
        caseConditionRef: '',
        selectedConditions: {},
        selectedExam: {},
        selectedDates: {},
        dateTimeValues: {},
      };

      this.conditions.forEach((condition) => {
        newCase.selectedConditions[condition.code] = false;
        newCase.selectedExam[condition.code] = '';
        newCase.selectedDates[condition.code] = {};
        newCase.dateTimeValues[condition.code] = {};
        this.dates.forEach((date) => {
          newCase.selectedDates[condition.code][date.code] = false;
          newCase.dateTimeValues[condition.code][date.code] = null;
        });
      });

      this.cases.push(newCase);
    },
    removeCase(index) {
      this.cases.splice(index, 1);
    },
    clearCase() {
      this.cases = [];
    },
    handleDateCheckboxChange(caseItem, conditionCode, dateCode) {
      if (caseItem.selectedDates[conditionCode][dateCode]) {
        caseItem.dateTimeValues[conditionCode][dateCode] = new Date();
      } else {
        caseItem.dateTimeValues[conditionCode][dateCode] = null;
      }
    },
    checkDateDiff() {
      this.dateDiffStatus = dayDiff(
        this.conditionArray,
        this.caseName,
        this.optionName,
        this.dateNameFrom,
        this.dateNameTo
      );
    },
    fetchConditionData() {
      const response = getData(this.conditionArray, this.caseName, this.optionName, this.dateNameFrom);
      if (response.status === 'success') {
        this.conditionData = JSON.stringify(response.data, null, 2);
      } else {
        this.conditionData = response.message;
      }
    },
    logCases() {
      console.log('Cases data:', this.cases);
    },
  },
};
</script>

<style scoped>
/* Add any necessary styling here */
</style>
