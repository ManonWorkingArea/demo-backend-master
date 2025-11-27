<template>
  <div class="loader"></div>
  <div class="flex space-x-0 items-center">
    <!-- Step Navigation -->
    <div
      v-for="(step, index) in steps"
      :key="index"
      class="flex-1 cursor-pointer hover:bg-gray-50"
      @click="isStepClickable(index) && goToStep(index)"
    >
      <div
        class="flex items-center py-3 px-2"
        :class="{
          'border-r-0': index === steps.length - 1,
          'border-r border-gray-100': index !== steps.length - 1,
        }"
      >
        <div :class="['md:h-8 md:w-8 md:mr-2', 'w-full text-center', { 'text-blue-500': index <= currentStepIndex }]">
          <font-awesome-icon
            :icon="['fas', step.icon]"
            :class="[
              'h-8 w-8 mr-2 mb-4',
              { 'text-blue-500': index <= currentStepIndex }
            ]"
          />
        </div>
        <div>
          <p class="font-semibold hidden sm:block">{{ step.title }}</p>
          <p class="text-sm text-gray-500 mb-2 hidden sm:block">{{ step.subtitle }}</p>
        </div>
      </div>
      <div class="bg-gray-200 h-2" :class="{ 'bg-blue-500': index <= currentStepIndex }"></div>
    </div>
  </div>

  <div class="py-6 px-4 sm:p-6">
    <div class="w-full">
      <component
        :is="currentStep.component"
        :stepData="stepData[currentStepIndex]"
        :collectedData="collectedData"
        @step-input="updateStepData"
        @step-validation="updateStepValidation"
        @step-reset="resetData($event)"
      />
    </div>

    <div class="border-t border-1 border-dashed border-gray-300 mt-5 pt-5">
      <div class="flex justify-between">

        <div class="flex space-x-1">
          <button
            @click="prevStep"
            :disabled="currentStepIndex === 0"
            :class="{
              'px-2 py-2 text-white bg-gray-400 rounded-sm hover:bg-gray-500': currentStepIndex === 0 || !isCurrentStepComplete(currentStepIndex - 1),
              'px-2 py-2 text-white bg-blue-500 rounded-sm hover:bg-blue-600': currentStepIndex !== 0 && isCurrentStepComplete(currentStepIndex - 1),
            }"
          >
            <font-awesome-icon :icon="['fas','chevron-left']"/>
          </button>

          <button
            @click="nextStep"
            :disabled="currentStepIndex === totalSteps - 1 || !isCurrentStepComplete()"
            :class="{
              'px-2 py-2 text-white bg-gray-400 rounded-sm hover:bg-gray-500': currentStepIndex === totalSteps - 1 || !isCurrentStepComplete(),
              'px-2 py-2 text-white bg-blue-500 rounded-sm hover:bg-blue-600': currentStepIndex !== totalSteps - 1 && isCurrentStepComplete(),
            }"
          >
            <font-awesome-icon :icon="['fas','chevron-right']"/>
          </button>
        </div>

        <div class="flex space-x-2">
          <button
            @click="resetData"
            class="px-4 py-2 text-white bg-red-500 rounded-md hover:bg-red-600"
          >
            Reset
          </button>

          <button
            @click="saveData"
            class="px-4 py-2 text-white bg-green-500 rounded-md hover:bg-green-600"
          >
            <font-awesome-icon :icon="['fas','save']"/> Save
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script>

export default {
  props: {
    steps: Array,
    stepData: Array,
  },
  data() {
    return {
      currentStepIndex: 0,
      stepValidations: [],
      collectedData: null,
    };
  },
  components: {
    
  },
  computed: {
    currentStep() {
      return this.steps[this.currentStepIndex];
    },
    totalSteps() {
      return this.steps.length;
    },
  },
  methods: {
    nextStep() {
      if (this.isCurrentStepComplete() && this.currentStepIndex < this.totalSteps - 1) {
        this.saveData();
        this.currentStepIndex++;
      }
    },
    prevStep() {
      if (this.currentStepIndex > 0) {
        this.saveData();
        this.currentStepIndex--;
      }
    },
    updateStepData(newData) {
      this.$emit('update-step-data', { index: this.currentStepIndex, data: newData });
    },
    saveData() {
      const combinedData = {};
      this.stepData.forEach((data) => {
        Object.assign(combinedData, data);
      });
      this.collectedData = combinedData;
    },
    resetData() {
      this.stepData.forEach((step) => {
        for (const key in step) {
          step[key] = '';
        }
      });
      this.collectedData = null;
      this.currentStepIndex = 0;
    },
    goToStep(index) {
      if (index >= 0 && index < this.totalSteps) {
        this.currentStepIndex = index;
        this.saveData();
      }
    },
    isCurrentStepComplete() {
      return this.stepValidations[this.currentStepIndex];
    },
    isStepClickable(index) {
      return this.isCurrentStepComplete(index) || index === this.currentStepIndex;
    },
    updateStepValidation(isValid) {
      console.log('Validation status:', isValid);
      this.stepValidations.splice(this.currentStepIndex, 1, isValid);
    },
  },
};
</script>

<style scoped>
/* Add any custom styles here */
/* HTML: <div class="loader"></div> */
.loader {
  width: fit-content;
  font-weight: bold;
  font-family: monospace;
  font-size: 16px;
  clip-path: inset(0 3ch 0 0);
  animation: l4 1s steps(4) infinite;
}
.loader:before {
  content:"Loading..."
}
@keyframes l4 {to{clip-path: inset(0 -1ch 0 0)}}
</style>
