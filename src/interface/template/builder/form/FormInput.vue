<template>
  <div>
    <label :for="data.uid" class="block font-bold mb-1">{{ data.name }}</label>
    <input
      class="w-full rounded-sm border border-gray-200 p-3"
      :id="data.uid"
      :value="inputValue"
      :type="data.inputType"
      :placeholder="data.placeholder"
      :class="inputClasses"
      @input="updateInputValue"
    >
    <!-- Display validation message -->
    <p v-if="validationMessage" class="text-red-500 text-xs mt-1">{{ validationMessage }}</p>
  </div>
</template>

<script>
import storageManager from '@/plugins/storage';
import requestClient from '@/plugins/requestClient';
const Request = new requestClient(false);
export default {
  props: {
    data: {
      type: Object,
      required: true,
    },
    modelValue: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      session: storageManager.get('session'),
      configs: storageManager.get('configs'),
      inputValue: this.modelValue,
      validationMessage: '',
      isCheckingRemote: false,
      isLocked:false
    };
  },
  computed: {
    inputClasses() {
      const classes = {
        'text-center': this.data.align === 'center',
      };
      if (this.data.fontSize) {
        classes[`text-${this.data.fontSize}`] = true;
      }
      if (this.data.fontWeight) {
        classes[`font-${this.data.fontWeight}`] = true;
      }
      if (this.data.color) {
        classes[`text-${this.data.color}`] = true;
      }
      return classes;
    },
  },
  watch: {
    modelValue(newValue) {
      this.inputValue = newValue;
      this.validateInput();
    },
    'data.SyncData': {
      handler(newSyncData) {
        if (newSyncData) {
          this.inputValue = this.session[this.data.SyncDataLocation][this.data.SyncDataKey];
          this.isLocked = true
          this.$emit('update:modelValue', this.inputValue);
        } else {
          this.inputValue = this.modelValue;
        }
      },
      immediate: true, // Trigger the watcher immediately on component mount
    },
  },
  methods: {
  updateInputValue(event) {
    let newValue = event.target.value;

    // If input type is 'number', remove all non-numeric characters except digits and decimal point
    if (this.data.inputType === 'number') {
      newValue = newValue.replace(/[^0-9.-]+/g, ''); // Adjust regex as needed
      event.target.value = newValue;
    }

    // Proceed with updating inputValue and validation as before
    this.inputValue = newValue;
    if (this.validateInput()) { // Ensure validation is passed before emitting
      this.$emit('update:modelValue', this.inputValue);
    }
  },
  validateInput() {
    this.validationMessage = ''; // Reset validation message
    if (this.data.inputType === 'email' && !this.isValidEmail(this.inputValue)) {
      this.validationMessage = 'กรุณาตรวจสอบรูปแบบอีเมล์ให้ถูกต้อง';
      return false;
    } else if (this.data.inputType === 'text' && this.inputValue.trim().length === 0) {
      this.validationMessage = 'ไม่ได้กรอกข้อมูล.';
      return false;
    } else if (this.data.minLength && this.inputValue.length < this.data.minLength) {
      this.validationMessage = `ตัวอักษรขั้นต่ำ ${this.data.minLength} ตัว.`;
      return false;
    } else if (this.data.maxLength && this.inputValue.length > this.data.maxLength) {
      this.inputValue = this.inputValue.slice(0, this.data.maxLength);
      this.validationMessage = `ตัวอักษรไม่เกิน ${this.data.maxLength} ตัว.`;
      return false;
    }
    // Ensure local validation passes and remote validation is required
    if (this.data.remoteValid && this.validationMessage === '' && !this.data.SyncData) {
      this.checkRemoteValidity();
    } else if (this.validationMessage === '') {
      // If there's no validation message and remote validation is not required, proceed
      return true;
    }
  },
  isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  },
  async checkRemoteValidity() {
    this.isCheckingRemote = true;
    try {
      const requestData = {
        method: 'find',
        args: [{ $and: [{ [this.data.remoteValidKey]: this.inputValue }] }],
      };
      const response = await Request.POST(`${this.data.remoteValidCollection}/query`, requestData, this.configs.key);

      if (response.status !== 200) {
        throw new Error('Failed to fetch data from API');
      }

      // Assume response.data contains the result of the query
      if (response.data.length > 0) {
        // Duplicate found
        this.inputValue= ''
        this.validationMessage = 'กรุณาตรวจสอบ มีข้อมูลนี้ในระบบแล้ว';
        return false;
      } else {
        // No duplicates, emit 
        this.$emit('update:modelValue', this.inputValue);
        return true;
      }
    } catch (error) {
      this.validationMessage = error.message || 'พบปัญหา ไม่สามารถตรวจสอบได้ในขณะนี้';
    } finally {
      this.isCheckingRemote = false;
    }
  },
},

};
</script>


<style scoped>
/* Component-specific styles */
</style>
