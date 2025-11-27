<template>
  <div>
    <div class="login-component">
      <div class="field">
        <label class="label">รหัสผ่านใหม่:</label>
        <div class="control">
          <input class="input" type="text" v-model="localLocalAction.request.newPassword" @input="updateAction" />
        </div>
      </div>
      <div class="field">
        <label class="label">Request ID:</label>
        <div class="control">
          <input class="input" type="text" v-model="localLocalAction.request.requestId" @input="updateAction" />
        </div>
      </div>
    </div>

    <div class="changepwd-component">

      <div class="field col-span-2">
        <label class="label">ความยาวของรหัสผ่าน:</label>
        <div class="control">
          <input class="input" type="number" v-model.number="localLocalAction.request.passwordConfig.length" min="1" @input="updateRegex" />
        </div>
      </div>

      <div class="relative flex items-start">
        <div class="flex h-6 items-center">
          <input id="includeNumbers" aria-describedby="includeNumbers-description" name="includeNumbers" type="checkbox" v-model="localLocalAction.request.passwordConfig.includeNumbers" @change="updateRegex" class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600">
        </div>
        <div class="ml-3 text-sm leading-6">
          <label for="includeNumbers" class="font-medium text-gray-900">รวมตัวเลข</label>
        </div>
      </div>
      
      <div class="relative flex items-start">
        <div class="flex h-6 items-center">
          <input id="includeLowercase" aria-describedby="includeLowercase-description" name="includeLowercase" type="checkbox" v-model="localLocalAction.request.passwordConfig.includeLowercase" @change="updateRegex" class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600">
        </div>
        <div class="ml-3 text-sm leading-6">
          <label for="includeLowercase" class="font-medium text-gray-900">รวมตัวอักษรตัวเล็ก</label>
        </div>
      </div>
      
      <div class="relative flex items-start">
        <div class="flex h-6 items-center">
          <input id="includeUppercase" aria-describedby="includeUppercase-description" name="includeUppercase" type="checkbox" v-model="localLocalAction.request.passwordConfig.includeUppercase" @change="updateRegex" class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600">
        </div>
        <div class="ml-3 text-sm leading-6">
          <label for="includeUppercase" class="font-medium text-gray-900">รวมตัวอักษรตัวใหญ่</label>
        </div>
      </div>
      
      <div class="relative flex items-start">
        <div class="flex h-6 items-center">
          <input id="beginWithLetter" aria-describedby="beginWithLetter-description" name="beginWithLetter" type="checkbox" v-model="localLocalAction.request.passwordConfig.beginWithLetter" @change="updateRegex" class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600">
        </div>
        <div class="ml-3 text-sm leading-6">
          <label for="beginWithLetter" class="font-medium text-gray-900">เริ่มต้นด้วยตัวอักษร</label>
        </div>
      </div>
      
      <div class="relative flex items-start">
        <div class="flex h-6 items-center">
          <input id="includeSymbols" aria-describedby="includeSymbols-description" name="includeSymbols" type="checkbox" v-model="localLocalAction.request.passwordConfig.includeSymbols" @change="updateRegex" class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600">
        </div>
        <div class="ml-3 text-sm leading-6">
          <label for="includeSymbols" class="font-medium text-gray-900">รวมสัญลักษณ์พิเศษ</label>
        </div>
      </div>
      
      <div class="relative flex items-start">
        <div class="flex h-6 items-center">
          <input id="noSimilarCharacters" aria-describedby="noSimilarCharacters-description" name="noSimilarCharacters" type="checkbox" v-model="localLocalAction.request.passwordConfig.noSimilarCharacters" @change="updateRegex" class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600">
        </div>
        <div class="ml-3 text-sm leading-6">
          <label for="noSimilarCharacters" class="font-medium text-gray-900">ไม่ใช้ตัวอักษรที่คล้ายกัน</label>
        </div>
      </div>
      
      <div class="relative flex items-start">
        <div class="flex h-6 items-center">
          <input id="noDuplicateCharacters" aria-describedby="noDuplicateCharacters-description" name="noDuplicateCharacters" type="checkbox" v-model="localLocalAction.request.passwordConfig.noDuplicateCharacters" @change="updateRegex" class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600">
        </div>
        <div class="ml-3 text-sm leading-6">
          <label for="noDuplicateCharacters" class="font-medium text-gray-900">ไม่ใช้ตัวอักษรซ้ำ</label>
        </div>
      </div>
      
      <div class="relative flex items-start">
        <div class="flex h-6 items-center">
          <input id="noSequentialCharacters" aria-describedby="noSequentialCharacters-description" name="noSequentialCharacters" type="checkbox" v-model="localLocalAction.request.passwordConfig.noSequentialCharacters" @change="updateRegex" class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600">
        </div>
        <div class="ml-3 text-sm leading-6">
          <label for="noSequentialCharacters" class="font-medium text-gray-900">ไม่ใช้ตัวอักษรที่เรียงกัน</label>
        </div>
      </div>

      
      
      <div class="output">
        <label class="label">Regex ที่สร้างขึ้น:</label>
        <pre>{{ localLocalAction.request.generatedRegex }}</pre>
      </div>
    </div>
  </div>
</template>


<script>
export default {
  name: 'ChangepwdComponent',
  props: {
    localAction: {
      type: Object,
      required: true
    }
  },
  data() {
      return {
        localLocalAction: {
          ...this.localAction,
          request: {
            ...this.localAction.request,
            passwordConfig: {
              ...this.localAction.request?.passwordConfig, // Initialize from localAction.request if it exists
              length: this.localAction.request?.passwordConfig?.length || 8,
              includeNumbers: this.localAction.request?.passwordConfig?.includeNumbers || true,
              includeLowercase: this.localAction.request?.passwordConfig?.includeLowercase || true,
              includeUppercase: this.localAction.request?.passwordConfig?.includeUppercase || true,
              beginWithLetter: this.localAction.request?.passwordConfig?.beginWithLetter || false,
              includeSymbols: this.localAction.request?.passwordConfig?.includeSymbols || false,
              noSimilarCharacters: this.localAction.request?.passwordConfig?.noSimilarCharacters || false,
              noDuplicateCharacters: this.localAction.request?.passwordConfig?.noDuplicateCharacters || false,
              noSequentialCharacters: this.localAction.request?.passwordConfig?.noSequentialCharacters || false,
            },
            generatedRegex: this.localAction.request?.generatedRegex || ''
          }
        }
      };
    },
    methods: {
      updateAction() {
        this.$emit('update-action', { ...this.localLocalAction });
      },
      updateRegex() {
        const {
          length,
          includeNumbers,
          includeLowercase,
          includeUppercase,
          includeSymbols,
          beginWithLetter,
          noSimilarCharacters,
          noDuplicateCharacters,
          noSequentialCharacters,
        } = this.localLocalAction.request.passwordConfig;

        let regexParts = [];

        // Starting character
        if (beginWithLetter) {
          regexParts.push('(?=.*[A-Za-z])');
        }

        // Character classes
        if (includeLowercase) {
          regexParts.push('(?=.*[a-z])');
        }
        if (includeUppercase) {
          regexParts.push('(?=.*[A-Z])');
        }
        if (includeNumbers) {
          regexParts.push('(?=.*\\d)');
        }
        if (includeSymbols) {
          regexParts.push('(?=.*[!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~])');
        }

        // Avoid similar characters
        if (noSimilarCharacters) {
          regexParts.push('(?!.*[iloILO0])');
        }

        // Avoid duplicate characters
        if (noDuplicateCharacters) {
          regexParts.push('(?!.*(.).*\\1)');
        }

        // Avoid sequential characters
        if (noSequentialCharacters) {
          regexParts.push('(?!.*(?:abc|123|789|XYZ))');
        }

        // Length
        regexParts.push(`.{${length}}`);

        // Combine all parts into a final regex string
        this.localLocalAction.request.generatedRegex = regexParts.join('');

        // Update the action with the new regex and configuration
        this.updateAction();
      },
    },
    mounted() {
      this.updateRegex(); // Generate regex on component mount
    },
  };
</script>

<style scoped>
.login-component {
  width: 100%;
  display: grid;
  grid-template-columns: 1fr;
  gap: 15px;
  padding: 20px;
  background-color: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 5px;
  box-sizing: border-box;
}

.changepwd-component {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* Two equal-width columns */
  gap: 15px;
  padding: 20px;
  background-color: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 5px;
  box-sizing: border-box;
  margin-top:10px;
}

.field {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.field-inline {
  display: flex;
  align-items: center;
}

.field-inline .label {
  margin-right: 10px;
  margin-bottom: 0;
  font-weight: bold;
}

.field-inline .control {
  flex: 0 0 auto;
}

.field-inline .control input[type="checkbox"] {
  margin: 0;
  transform: translateY(1px); /* Adjust for vertical alignment */
}


.label {
  font-weight: bold;
  margin-bottom: 5px;
}

.control {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.input {
  width: 100%;
  box-sizing: border-box;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.output {
  grid-column: span 2; /* Make the output span across both columns */
  margin-top: 20px;
  font-family: monospace;
}
</style>
