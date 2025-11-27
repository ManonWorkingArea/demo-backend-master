<template>
  <form 
    @submit.prevent="handleSubmit" 
    :class="['smart-form', formClasses]"
    :novalidate="!nativeValidation"
  >
    <!-- Form Header -->
    <div v-if="title || description" class="form-header">
      <h2 v-if="title" class="form-title">{{ title }}</h2>
      <p v-if="description" class="form-description">{{ description }}</p>
    </div>

    <!-- Form Fields -->
    <div class="form-body">
      <div
        v-for="(field, index) in processedFields"
        :key="field.id || field.name || index"
        :class="['form-field', `field-${field.type}`, fieldClasses(field)]"
        v-show="isFieldVisible(field)"
      >
        <!-- Field Label -->
        <label
          v-if="field.label && field.type !== 'checkbox' && field.type !== 'radio'"
          :for="getFieldId(field)"
          :class="['field-label', { required: field.required }]"
        >
          {{ field.label }}
          <span v-if="field.tooltip" class="field-tooltip" :title="field.tooltip">
            <font-awesome-icon :icon="['fas', 'info-circle']" />
          </span>
        </label>

        <!-- Field Description -->
        <p v-if="field.description" class="field-description">
          {{ field.description }}
        </p>

        <!-- Form Group for Radio/Checkbox groups -->
        <fieldset v-if="field.type === 'radio' || field.type === 'checkbox-group'" class="field-group">
          <legend v-if="field.label" :class="['field-legend', { required: field.required }]">
            {{ field.label }}
          </legend>
          
          <div :class="['options-container', field.layout || 'vertical']">
            <label
              v-for="option in field.options"
              :key="option.value"
              :class="['option-label', field.type]"
            >
              <input
                :type="field.type === 'radio' ? 'radio' : 'checkbox'"
                :name="field.name"
                :value="option.value"
                :checked="isOptionSelected(field, option.value)"
                :disabled="field.disabled || option.disabled"
                @change="handleFieldChange(field, $event)"
                class="option-input"
              />
              <span class="option-text">{{ option.label }}</span>
            </label>
          </div>
        </fieldset>

        <!-- Single Checkbox -->
        <label v-else-if="field.type === 'checkbox'" :class="['checkbox-label', { required: field.required }]">
          <input
            :type="'checkbox'"
            :name="field.name"
            :checked="getFieldValue(field)"
            :disabled="field.disabled"
            @change="handleFieldChange(field, $event)"
            class="checkbox-input"
          />
          <span class="checkbox-text">{{ field.label }}</span>
        </label>

        <!-- Select Field -->
        <select
          v-else-if="field.type === 'select'"
          :id="getFieldId(field)"
          :name="field.name"
          :value="getFieldValue(field)"
          :disabled="field.disabled"
          :required="field.required"
          :multiple="field.multiple"
          @change="handleFieldChange(field, $event)"
          :class="['field-input', 'select-input', { 'has-error': hasFieldError(field) }]"
        >
          <option v-if="field.placeholder" value="">{{ field.placeholder }}</option>
          <option
            v-for="option in field.options"
            :key="option.value"
            :value="option.value"
            :disabled="option.disabled"
          >
            {{ option.label }}
          </option>
        </select>

        <!-- Textarea -->
        <textarea
          v-else-if="field.type === 'textarea'"
          :id="getFieldId(field)"
          :name="field.name"
          :value="getFieldValue(field)"
          :placeholder="field.placeholder"
          :disabled="field.disabled"
          :required="field.required"
          :rows="field.rows || 4"
          :maxlength="field.maxLength"
          @input="handleFieldChange(field, $event)"
          @blur="handleFieldBlur(field)"
          :class="['field-input', 'textarea-input', { 'has-error': hasFieldError(field) }]"
        ></textarea>

        <!-- File Input -->
        <div v-else-if="field.type === 'file'" class="file-input-container">
          <input
            :id="getFieldId(field)"
            type="file"
            :name="field.name"
            :disabled="field.disabled"
            :required="field.required"
            :accept="field.accept"
            :multiple="field.multiple"
            @change="handleFileChange(field, $event)"
            class="file-input"
          />
          <label :for="getFieldId(field)" class="file-label">
            <font-awesome-icon :icon="['fas', 'cloud-upload-alt']" />
            <span>{{ field.placeholder || 'Choose file(s)' }}</span>
          </label>
          <div v-if="getFieldValue(field)" class="file-preview">
            <div
              v-for="(file, idx) in Array.isArray(getFieldValue(field)) ? getFieldValue(field) : [getFieldValue(field)]"
              :key="idx"
              class="file-item"
            >
              {{ file.name || file }}
              <button type="button" @click="removeFile(field, idx)" class="remove-file">
                <font-awesome-icon :icon="['fas', 'times']" />
              </button>
            </div>
          </div>
        </div>

        <!-- Range Input -->
        <div v-else-if="field.type === 'range'" class="range-container">
          <input
            :id="getFieldId(field)"
            type="range"
            :name="field.name"
            :value="getFieldValue(field)"
            :min="field.min"
            :max="field.max"
            :step="field.step"
            :disabled="field.disabled"
            @input="handleFieldChange(field, $event)"
            class="range-input"
          />
          <div class="range-display">
            <span class="range-value">{{ getFieldValue(field) }}</span>
            <span v-if="field.unit" class="range-unit">{{ field.unit }}</span>
          </div>
        </div>

        <!-- Regular Input Fields -->
        <input
          v-else
          :id="getFieldId(field)"
          :type="field.type || 'text'"
          :name="field.name"
          :value="getFieldValue(field)"
          :placeholder="field.placeholder"
          :disabled="field.disabled"
          :required="field.required"
          :readonly="field.readonly"
          :min="field.min"
          :max="field.max"
          :step="field.step"
          :pattern="field.pattern"
          :maxlength="field.maxLength"
          :autocomplete="field.autocomplete"
          @input="handleFieldChange(field, $event)"
          @blur="handleFieldBlur(field)"
          @focus="handleFieldFocus(field)"
          :class="['field-input', { 'has-error': hasFieldError(field) }]"
        />

        <!-- Field Error -->
        <div v-if="hasFieldError(field)" class="field-error">
          <font-awesome-icon :icon="['fas', 'exclamation-circle']" />
          <span>{{ getFieldError(field) }}</span>
        </div>

        <!-- Field Help Text -->
        <div v-if="field.help && !hasFieldError(field)" class="field-help">
          {{ field.help }}
        </div>

        <!-- Character Count -->
        <div
          v-if="field.maxLength && (field.type === 'text' || field.type === 'textarea')"
          class="character-count"
        >
          {{ (getFieldValue(field) || '').length }} / {{ field.maxLength }}
        </div>
      </div>
    </div>

    <!-- Form Actions -->
    <div class="form-actions" :class="actionsAlignment">
      <button
        v-if="showCancelButton"
        type="button"
        @click="handleCancel"
        :disabled="isSubmitting"
        class="form-button button-cancel"
      >
        {{ cancelButtonText }}
      </button>

      <button
        v-if="showResetButton"
        type="button"
        @click="handleReset"
        :disabled="isSubmitting"
        class="form-button button-reset"
      >
        {{ resetButtonText }}
      </button>

      <button
        type="submit"
        :disabled="!isFormValid || isSubmitting"
        class="form-button button-submit"
        :class="{ loading: isSubmitting }"
      >
        <span v-if="isSubmitting" class="loading-spinner"></span>
        {{ isSubmitting ? submittingText : submitButtonText }}
      </button>
    </div>

    <!-- Form Footer -->
    <div v-if="$slots.footer" class="form-footer">
      <slot name="footer"></slot>
    </div>
  </form>
</template>

<script>
export default {
  name: 'SmartForm',
  props: {
    // Form Configuration
    title: String,
    description: String,
    fields: {
      type: Array,
      required: true
    },
    modelValue: {
      type: Object,
      default: () => ({})
    },
    
    // Validation
    validationRules: {
      type: Object,
      default: () => ({})
    },
    validateOnChange: {
      type: Boolean,
      default: true
    },
    validateOnBlur: {
      type: Boolean,
      default: true
    },
    nativeValidation: {
      type: Boolean,
      default: false
    },

    // Styling
    layout: {
      type: String,
      default: 'vertical',
      validator: value => ['vertical', 'horizontal', 'inline'].includes(value)
    },
    size: {
      type: String,
      default: 'medium',
      validator: value => ['small', 'medium', 'large'].includes(value)
    },
    variant: {
      type: String,
      default: 'default',
      validator: value => ['default', 'bordered', 'floating'].includes(value)
    },

    // Buttons
    submitButtonText: {
      type: String,
      default: 'Submit'
    },
    submittingText: {
      type: String,
      default: 'Submitting...'
    },
    cancelButtonText: {
      type: String,
      default: 'Cancel'
    },
    resetButtonText: {
      type: String,
      default: 'Reset'
    },
    showCancelButton: {
      type: Boolean,
      default: false
    },
    showResetButton: {
      type: Boolean,
      default: false
    },
    actionsAlignment: {
      type: String,
      default: 'right',
      validator: value => ['left', 'center', 'right', 'between'].includes(value)
    },

    // Behavior
    autoSave: {
      type: Boolean,
      default: false
    },
    autoSaveDelay: {
      type: Number,
      default: 1000
    },
    preventEnterSubmit: {
      type: Boolean,
      default: false
    },
    resetOnSubmit: {
      type: Boolean,
      default: false
    },

    // State
    loading: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      formData: { ...this.modelValue },
      errors: {},
      touched: {},
      isSubmitting: false,
      autoSaveTimeout: null
    }
  },
  computed: {
    formClasses() {
      return {
        [`form-${this.layout}`]: true,
        [`form-${this.size}`]: true,
        [`form-${this.variant}`]: true,
        'form-disabled': this.disabled,
        'form-loading': this.loading
      }
    },
    processedFields() {
      return this.fields.map(field => ({
        ...field,
        id: field.id || `field-${field.name}`,
        type: field.type || 'text'
      }))
    },
    isFormValid() {
      if (this.disabled) return false
      
      // Check required fields
      const requiredFields = this.processedFields.filter(field => 
        field.required && this.isFieldVisible(field)
      )
      
      for (const field of requiredFields) {
        const value = this.getFieldValue(field)
        if (!value || (Array.isArray(value) && value.length === 0)) {
          return false
        }
      }
      
      // Check for errors
      return Object.keys(this.errors).length === 0
    }
  },
  methods: {
    // Field Utilities
    getFieldId(field) {
      return field.id || `field-${field.name}`
    },
    getFieldValue(field) {
      return this.formData[field.name] || field.defaultValue || ''
    },
    isFieldVisible(field) {
      if (typeof field.condition === 'function') {
        return field.condition(this.formData)
      }
      if (typeof field.condition === 'object') {
        const { field: condField, value: condValue } = field.condition
        return this.formData[condField] === condValue
      }
      return field.visible !== false
    },
    fieldClasses(field) {
      return {
        [`field-${field.size || this.size}`]: true,
        'field-required': field.required,
        'field-disabled': field.disabled || this.disabled,
        'field-readonly': field.readonly,
        'field-has-error': this.hasFieldError(field),
        'field-touched': this.touched[field.name]
      }
    },

    // Validation
    hasFieldError(field) {
      return !!this.errors[field.name]
    },
    getFieldError(field) {
      return this.errors[field.name]
    },
    validateField(field, value = null) {
      const fieldValue = value !== null ? value : this.getFieldValue(field)
      const rules = this.validationRules[field.name] || field.validation || {}
      
      // Clear previous error
      this.$delete(this.errors, field.name)
      
      // Required validation
      if (field.required) {
        if (!fieldValue || (Array.isArray(fieldValue) && fieldValue.length === 0)) {
          this.$set(this.errors, field.name, `${field.label || field.name} is required`)
          return false
        }
      }
      
      // Skip other validations if field is empty and not required
      if (!fieldValue && !field.required) return true
      
      // Min/Max length
      if (rules.minLength && fieldValue.length < rules.minLength) {
        this.$set(this.errors, field.name, `Minimum ${rules.minLength} characters required`)
        return false
      }
      if (rules.maxLength && fieldValue.length > rules.maxLength) {
        this.$set(this.errors, field.name, `Maximum ${rules.maxLength} characters allowed`)
        return false
      }
      
      // Pattern validation
      if (rules.pattern && !new RegExp(rules.pattern).test(fieldValue)) {
        this.$set(this.errors, field.name, rules.message || 'Invalid format')
        return false
      }
      
      // Email validation
      if (field.type === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(fieldValue)) {
          this.$set(this.errors, field.name, 'Invalid email address')
          return false
        }
      }
      
      // URL validation
      if (field.type === 'url') {
        try {
          new URL(fieldValue)
        } catch {
          this.$set(this.errors, field.name, 'Invalid URL')
          return false
        }
      }
      
      // Custom validation function
      if (typeof rules.validator === 'function') {
        const result = rules.validator(fieldValue, this.formData)
        if (result !== true) {
          this.$set(this.errors, field.name, result || 'Invalid value')
          return false
        }
      }
      
      return true
    },
    validateForm() {
      this.errors = {}
      let isValid = true
      
      this.processedFields.forEach(field => {
        if (this.isFieldVisible(field)) {
          if (!this.validateField(field)) {
            isValid = false
          }
        }
      })
      
      return isValid
    },

    // Event Handlers
    handleFieldChange(field, event) {
      let value = event.target.value
      
      // Handle different input types
      if (field.type === 'checkbox') {
        value = event.target.checked
      } else if (field.type === 'checkbox-group') {
        const currentValues = this.getFieldValue(field) || []
        if (event.target.checked) {
          value = [...currentValues, event.target.value]
        } else {
          value = currentValues.filter(v => v !== event.target.value)
        }
      } else if (field.type === 'number' || field.type === 'range') {
        value = parseFloat(value) || 0
      } else if (field.type === 'select' && field.multiple) {
        value = Array.from(event.target.selectedOptions, option => option.value)
      }
      
      // Update form data
      this.$set(this.formData, field.name, value)
      
      // Validate on change if enabled
      if (this.validateOnChange) {
        this.validateField(field, value)
      }
      
      // Emit change event
      this.$emit('fieldChange', { field: field.name, value, formData: this.formData })
      this.$emit('update:modelValue', { ...this.formData })
      
      // Auto-save
      if (this.autoSave) {
        this.scheduleAutoSave()
      }
    },
    handleFieldBlur(field) {
      this.$set(this.touched, field.name, true)
      
      if (this.validateOnBlur) {
        this.validateField(field)
      }
      
      this.$emit('fieldBlur', { field: field.name, formData: this.formData })
    },
    handleFieldFocus(field) {
      this.$emit('fieldFocus', { field: field.name, formData: this.formData })
    },
    handleFileChange(field, event) {
      const files = Array.from(event.target.files)
      const value = field.multiple ? files : files[0]
      
      this.$set(this.formData, field.name, value)
      this.$emit('fieldChange', { field: field.name, value, formData: this.formData })
      this.$emit('update:modelValue', { ...this.formData })
    },
    handleSubmit() {
      if (this.preventEnterSubmit && event.submitter === null) {
        return
      }
      
      this.isSubmitting = true
      
      // Mark all fields as touched
      this.processedFields.forEach(field => {
        this.$set(this.touched, field.name, true)
      })
      
      if (this.validateForm()) {
        this.$emit('submit', { ...this.formData })
        
        if (this.resetOnSubmit) {
          this.handleReset()
        }
      } else {
        this.isSubmitting = false
        this.$emit('invalid', { errors: this.errors, formData: this.formData })
      }
    },
    handleCancel() {
      this.$emit('cancel')
    },
    handleReset() {
      this.formData = {}
      this.errors = {}
      this.touched = {}
      this.$emit('reset')
      this.$emit('update:modelValue', {})
    },

    // Helper Methods
    isOptionSelected(field, optionValue) {
      const value = this.getFieldValue(field)
      if (field.type === 'radio') {
        return value === optionValue
      } else if (field.type === 'checkbox-group') {
        return Array.isArray(value) && value.includes(optionValue)
      }
      return false
    },
    removeFile(field, index) {
      const currentValue = this.getFieldValue(field)
      if (Array.isArray(currentValue)) {
        const newValue = currentValue.filter((_, idx) => idx !== index)
        this.$set(this.formData, field.name, newValue)
      } else {
        this.$set(this.formData, field.name, null)
      }
      this.$emit('update:modelValue', { ...this.formData })
    },
    scheduleAutoSave() {
      if (this.autoSaveTimeout) {
        clearTimeout(this.autoSaveTimeout)
      }
      
      this.autoSaveTimeout = setTimeout(() => {
        this.$emit('autoSave', { ...this.formData })
      }, this.autoSaveDelay)
    },

    // Public Methods
    validate() {
      return this.validateForm()
    },
    reset() {
      this.handleReset()
    },
    setFieldValue(fieldName, value) {
      this.$set(this.formData, fieldName, value)
      this.$emit('update:modelValue', { ...this.formData })
    },
    setFieldError(fieldName, error) {
      this.$set(this.errors, fieldName, error)
    },
    clearFieldError(fieldName) {
      this.$delete(this.errors, fieldName)
    },
    clearErrors() {
      this.errors = {}
    }
  },
  watch: {
    modelValue: {
      deep: true,
      handler(newValue) {
        this.formData = { ...newValue }
      }
    },
    loading(newValue) {
      if (!newValue) {
        this.isSubmitting = false
      }
    }
  },
  mounted() {
    // Set initial form data
    this.formData = { ...this.modelValue }
    
    // Set default values for fields
    this.processedFields.forEach(field => {
      if (field.defaultValue !== undefined && this.formData[field.name] === undefined) {
        this.$set(this.formData, field.name, field.defaultValue)
      }
    })
    
    this.$emit('update:modelValue', { ...this.formData })
  },
  beforeUnmount() {
    if (this.autoSaveTimeout) {
      clearTimeout(this.autoSaveTimeout)
    }
  }
}
</script>

<style scoped>
/* Form Container */
.smart-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 100%;
}

.form-disabled {
  opacity: 0.6;
  pointer-events: none;
}

.form-loading {
  position: relative;
}

.form-loading::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  z-index: 10;
}

/* Form Header */
.form-header {
  text-align: center;
  margin-bottom: 1rem;
}

.form-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
}

.form-description {
  color: #6b7280;
  font-size: 0.875rem;
  margin: 0;
  line-height: 1.5;
}

/* Form Body */
.form-body {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-horizontal .form-body {
  gap: 1rem;
}

.form-inline .form-body {
  flex-direction: row;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: flex-end;
}

/* Form Field */
.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.form-horizontal .form-field {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 1rem;
  align-items: start;
}

.form-inline .form-field {
  flex: 1;
  min-width: 200px;
}

.field-disabled {
  opacity: 0.6;
}

/* Field Label */
.field-label,
.field-legend {
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.field-label.required::after,
.field-legend.required::after {
  content: '*';
  color: #ef4444;
  margin-left: 0.125rem;
}

.field-tooltip {
  color: #6b7280;
  cursor: help;
}

.field-description {
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0;
  line-height: 1.4;
}

/* Field Inputs */
.field-input {
  padding: 0.625rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  width: 100%;
  box-sizing: border-box;
}

.field-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.field-input:disabled {
  background-color: #f9fafb;
  cursor: not-allowed;
}

.field-input.has-error {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

/* Size Variants */
.form-small .field-input,
.field-small .field-input {
  padding: 0.5rem 0.625rem;
  font-size: 0.75rem;
}

.form-large .field-input,
.field-large .field-input {
  padding: 0.75rem 1rem;
  font-size: 1rem;
}

/* Input Types */
.textarea-input {
  resize: vertical;
  min-height: 6rem;
  font-family: inherit;
}

.select-input {
  cursor: pointer;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 0.5rem center;
  background-repeat: no-repeat;
  background-size: 1rem;
  padding-right: 2.5rem;
}

/* File Input */
.file-input-container {
  position: relative;
}

.file-input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.file-label {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.625rem 0.75rem;
  border: 2px dashed #d1d5db;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #f9fafb;
  color: #6b7280;
  font-size: 0.875rem;
}

.file-label:hover {
  border-color: #3b82f6;
  background: #f0f9ff;
  color: #3b82f6;
}

.file-preview {
  margin-top: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.375rem 0.5rem;
  background: #f3f4f6;
  border-radius: 0.25rem;
  font-size: 0.75rem;
}

.remove-file {
  background: none;
  border: none;
  color: #ef4444;
  cursor: pointer;
  padding: 0.125rem;
}

/* Range Input */
.range-container {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.range-input {
  flex: 1;
  -webkit-appearance: none;
  background: transparent;
  cursor: pointer;
}

.range-input::-webkit-slider-track {
  width: 100%;
  height: 0.5rem;
  background: #e5e7eb;
  border-radius: 0.25rem;
}

.range-input::-webkit-slider-thumb {
  -webkit-appearance: none;
  height: 1.25rem;
  width: 1.25rem;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.range-display {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  color: #374151;
  min-width: 3rem;
}

/* Checkbox and Radio */
.field-group {
  border: none;
  padding: 0;
  margin: 0;
}

.options-container {
  display: flex;
  gap: 0.75rem;
}

.options-container.vertical {
  flex-direction: column;
}

.options-container.horizontal {
  flex-direction: row;
  flex-wrap: wrap;
}

.option-label,
.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
  color: #374151;
}

.option-input,
.checkbox-input {
  width: 1rem;
  height: 1rem;
  cursor: pointer;
}

/* Field Validation */
.field-error {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  color: #ef4444;
  font-size: 0.75rem;
  font-weight: 500;
}

.field-help {
  color: #6b7280;
  font-size: 0.75rem;
  line-height: 1.4;
}

.character-count {
  text-align: right;
  font-size: 0.75rem;
  color: #6b7280;
}

/* Form Actions */
.form-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.form-actions.left {
  justify-content: flex-start;
}

.form-actions.center {
  justify-content: center;
}

.form-actions.right {
  justify-content: flex-end;
}

.form-actions.between {
  justify-content: space-between;
}

.form-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  border: 1px solid;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 2.5rem;
}

.button-submit {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
}

.button-submit:hover:not(:disabled) {
  background: #2563eb;
  border-color: #2563eb;
}

.button-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.button-cancel {
  background: white;
  border-color: #d1d5db;
  color: #374151;
}

.button-cancel:hover {
  background: #f9fafb;
}

.button-reset {
  background: #f59e0b;
  border-color: #f59e0b;
  color: white;
}

.button-reset:hover {
  background: #d97706;
  border-color: #d97706;
}

/* Loading */
.loading-spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Form Footer */
.form-footer {
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

/* Responsive Design */
@media (max-width: 768px) {
  .form-horizontal .form-field {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
  
  .form-inline .form-body {
    flex-direction: column;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .form-actions.between {
    flex-direction: column-reverse;
  }
}

/* Dark Mode */
@media (prefers-color-scheme: dark) {
  .form-title {
    color: #f9fafb;
  }
  
  .form-description,
  .field-label,
  .field-legend {
    color: #d1d5db;
  }
  
  .field-input {
    background: #374151;
    border-color: #4b5563;
    color: #f9fafb;
  }
  
  .field-input:focus {
    border-color: #60a5fa;
  }
  
  .field-input:disabled {
    background: #1f2937;
  }
  
  .file-label {
    background: #374151;
    border-color: #4b5563;
    color: #d1d5db;
  }
  
  .file-label:hover {
    border-color: #60a5fa;
    background: #1e3a8a;
    color: #60a5fa;
  }
  
  .form-actions {
    border-color: #4b5563;
  }
  
  .button-cancel {
    background: #374151;
    border-color: #4b5563;
    color: #d1d5db;
  }
}
</style>
