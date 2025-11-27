<template>
  <div class="mt-6">
    <h2 id="payment-details-heading" class="text-lg font-bold leading-6 text-gray-900">Basic Information</h2>
    <p class="mt-1 text-sm text-gray-500">Manage your website's system information and settings with ease using System Information Config.</p>
  </div>

  <div class="mt-6 grid grid-cols-4 gap-6">
    <div class="col-span-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label for="name" class="block text-sm font-medium text-gray-700">Name</label>
          <input
            v-model="localStepData.name"
            type="text"
            name="name"
            id="name"
            autocomplete="name"
            @input="validateStep('name')"
            :class="{ 'border-red-500': isFieldInvalid('name') }"
            class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm"
          >
          <div v-if="isFieldInvalid('name')" class="text-red-500 text-xs mt-1">Name is required.</div>
        </div>

        <div>
          <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
          <input
            v-model="localStepData.email"
            type="text"
            name="email"
            id="email"
            autocomplete="email"
            @input="validateStep('email')"
            :class="{ 'border-red-500': isFieldInvalid('email') }"
            class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm"
          >
          <div v-if="isFieldInvalid('email')" class="text-red-500 text-xs mt-1">Email is required.</div>
        </div>
      </div>
    </div>
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
      requiredFields: ['email'],
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
    this.requiredFields.forEach((fieldName) => {
      this.validateStep(fieldName);
    });
  },
};
</script>