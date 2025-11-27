<template>
  <div>
    <label class="block font-bold mb-3">{{ data.name }}</label>
    <div :class="{ 'flex flex-row': data.inline }">
      <div
        v-for="(option, index) in data.options"
        :key="index"
        class="flex items-center mb-3 pb-3 border-b border-gray-200"
        :class="{ 'mr-4': data.inline && index !== data.options.length - 1 }"
      >
        <input
          :id="getOptionId(option)"
          class="mr-2 input-lg"
          v-model="selectedOption"
          :value="option.value"
          :name="data.name"
          type="radio"
          :checked="index === data.defaultOption"
          @change="handleRadioChange"
          :style="{ marginTop: option.description ? '-20px' : '0' }"
        >
        <div>
          <label :for="getOptionId(option)" :class="{ 'font-bold': option.description }" class="w-full">{{ option.label }}</label>
          <p class="w-full text-gray-600">{{ option.description }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    data: {
      type: Object,
      required: true,
    },
    modelValue: {
      required: true,
    },
  },
  data() {
    return {
      selectedOption: this.modelValue ? { value: this.modelValue.value, label: this.modelValue.label, description: this.modelValue.description } : null,
    };
  },
  methods: {
    getOptionId(option) {
      return `${this.data.name}-${option.value}`;
    },
    handleRadioChange() {
      let destinations = [];
      if (this.data.logics && Array.isArray(this.data.logics)) {
        destinations = this.data.logics
          .map(logicConfig => logicConfig.destination)
          .filter(destination => destination);
      }
      
      // Apply logic to destination elements
      destinations.forEach(destination => {
        if (destination && destination.uid) {
          // ใช้ข้อมูลจาก destination object แทนการเข้าถึงผ่าน $parent.builder
          const { rowIndex, columnIndex, objIndex } = destination;
          
          // ตรวจสอบว่ามี parent builder และสามารถเข้าถึงได้
          if (this.$parent && this.$parent.builder && 
              this.$parent.builder[rowIndex] && 
              this.$parent.builder[rowIndex].columns && 
              this.$parent.builder[rowIndex].columns[columnIndex] && 
              this.$parent.builder[rowIndex].columns[columnIndex].object &&
              this.$parent.builder[rowIndex].columns[columnIndex].object[objIndex]) {
            
            const targetObject = this.$parent.builder[rowIndex].columns[columnIndex].object[objIndex];
            
            // ตรวจสอบว่า targetObject มี uid ตรงกับ destination
            if (targetObject.uid === destination.uid) {
              // Apply การเปลี่ยนแปลงตาม logic configuration
              const logicConfig = this.data.logics.find(logic => 
                logic.destination && logic.destination.uid === destination.uid
              );
              
              if (logicConfig && logicConfig.method) {
                if (logicConfig.method === 'show') {
                  targetObject.show = true;
                  targetObject.hidden = false;
                } else if (logicConfig.method === 'hide') {
                  targetObject.show = false;
                  targetObject.hidden = true;
                }
                console.log(`Applied logic to element ${destination.uid}: ${logicConfig.method}`);
              }
            }
          } else {
            console.warn('Could not find target element for logic configuration:', destination);
          }
        }
      });
      
      const finalDestinations = destinations.length > 0 ? destinations : null;
      // Emit an object with both value and label properties
      const selectedOption = this.data.options.find(option => option.value === this.selectedOption);
      const newValue = selectedOption ? selectedOption.value : null;
      this.$emit('update:modelValue', { 
        value: newValue, 
        label: selectedOption ? selectedOption.label : null, 
        description: selectedOption ? selectedOption.description : null 
      }, finalDestinations);
    },
  },
  watch: {
    selectedOption(newValue) {
      let destinations = [];
      if (this.data.logics && Array.isArray(this.data.logics)) {
        destinations = this.data.logics
          .map(logicConfig => logicConfig.destination)
          .filter(destination => destination);
      }
      
      // Apply logic to destination elements
      destinations.forEach(destination => {
        if (destination && destination.uid) {
          // ใช้ข้อมูลจาก destination object แทนการเข้าถึงผ่าน $parent.builder
          const { rowIndex, columnIndex, objIndex } = destination;
          
          // ตรวจสอบว่ามี parent builder และสามารถเข้าถึงได้
          if (this.$parent && this.$parent.builder && 
              this.$parent.builder[rowIndex] && 
              this.$parent.builder[rowIndex].columns && 
              this.$parent.builder[rowIndex].columns[columnIndex] && 
              this.$parent.builder[rowIndex].columns[columnIndex].object &&
              this.$parent.builder[rowIndex].columns[columnIndex].object[objIndex]) {
            
            const targetObject = this.$parent.builder[rowIndex].columns[columnIndex].object[objIndex];
            
            // ตรวจสอบว่า targetObject มี uid ตรงกับ destination
            if (targetObject.uid === destination.uid) {
              // Apply การเปลี่ยนแปลงตาม logic configuration
              const logicConfig = this.data.logics.find(logic => 
                logic.destination && logic.destination.uid === destination.uid
              );
              
              if (logicConfig && logicConfig.method) {
                if (logicConfig.method === 'show') {
                  targetObject.show = true;
                  targetObject.hidden = false;
                } else if (logicConfig.method === 'hide') {
                  targetObject.show = false;
                  targetObject.hidden = true;
                }
                console.log(`Applied logic to element ${destination.uid}: ${logicConfig.method}`);
              }
            }
          } else {
            console.warn('Could not find target element for logic configuration:', destination);
          }
        }
      });
      
      const finalDestinations = destinations.length > 0 ? destinations : null;
      const selectedOption = this.data.options.find(option => option.value === newValue);
      const newValueObject = selectedOption ? { 
        value: newValue, 
        label: selectedOption.label, 
        description: selectedOption.description 
      } : null;
      this.$emit('update:modelValue', newValueObject, finalDestinations);
    },
  },
  mounted() {
    if (this.data.defaultOption !== undefined) {
      const defaultOptionIndex = this.data.defaultOption;
      const defaultOption = this.data.options[defaultOptionIndex];
      this.selectedOption = defaultOption.value;
      this.handleRadioChange();
    }
  },
};
</script>

<style scoped>
.input-lg {
  width: 1.25em;
  height: 1.25em;
}
</style>
