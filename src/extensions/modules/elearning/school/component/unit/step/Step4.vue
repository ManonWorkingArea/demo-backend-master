<template>
  <div class="mt-6">
    <h2 id="payment-details-heading" class="text-lg font-bold leading-6 text-gray-900">Preview</h2>
    <p class="mt-1 text-sm text-gray-500">Manage your website's system information and settings with ease using System Information Config.</p>
  </div>

  <div v-if="collectedData" class="mt-5">
    <h2 class="font-semibold text-sm mb-3">Output Data</h2>
    <pre class="bg-gray-100 p-3 text-sm text-gray-600 rounded-md">{{ collectedData }}</pre>
  </div>

</template>

<script>
export default {
  props: {
    stepData: Object,
    collectedData: Object,
  },
  data() {
    return {
      localStepData: this.stepData,
      requiredFields: [],
      errors: {},
    };
  },
  methods: {
    validateStep(fieldName) {
      const fieldValue = this.localStepData[fieldName];
      const isRequired = this.requiredFields.includes(fieldName);
      if (isRequired) {
        this.errors[fieldName] = fieldValue.trim() === '';
      } else {
        this.errors[fieldName] = false;
      }
      const isValid = !Object.values(this.errors).some((error) => error);
      this.$emit('step-validation', isValid);
    },
    resetStepData() {
      for (const key in this.localStepData) {
        this.localStepData[key] = '';
      }
      this.$emit('step-reset', this.localStepData);
      this.$emit('step-validation', false);
    },
    isFieldInvalid(fieldName) {
      return this.errors[fieldName];
    },
  },
  created() {
    for (const fieldName in this.localStepData) {
      this.errors[fieldName] = false;
    }
    this.$emit('step-validation', true);
    this.requiredFields.forEach((fieldName) => {
      this.validateStep(fieldName);
    });
  },
};
</script>
