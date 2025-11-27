<template>
  <div>

    <div class="flex">
      <div class="w-1/2 pr-4">
        <label :for="data.uid" class="block font-bold mb-1">
          {{ data.name }}
        </label>
      </div>
    </div>
    
    <div>
      <div>
        <span class="block mb-1 text-gray-500">เลือก <span class="text-gray-900">วัน/เดือน/ปี</span></span>
        <div class="flex">
          <select v-model="year" class="form-select rounded-sm border border-gray-200 p-3 mr-2 w-20" @change="updateInputValue">
            <option v-for="yearOption in yearOptions" :key="yearOption.value" :value="yearOption.value" class="pr-5">{{ yearOption.label }}</option>
          </select>
          <select v-model="month" class="form-select rounded-sm border border-gray-200 p-3 mr-2" @change="updateInputValue">
            <option v-for="monthOption in monthOptions" :key="monthOption.value" :value="monthOption.value">{{ monthOption.label }}</option>
          </select>
          <select v-model="day" class="form-select rounded-sm border border-gray-200 p-3 mr-2 w-20" @change="updateInputValue">
            <option v-for="dayOption in dayOptions" :key="dayOption" :value="dayOption">{{ dayOption }}</option>
          </select>
        </div>
      </div>

      <div v-if="showTime">
        <span class="block mb-1 mt-2 text-gray-500">เลือกเวลา <span class="text-gray-900">ชั่วโมง:นาที</span></span>
        <div class="flex mt-2">
          <select v-model="hour" class="form-select rounded-sm border border-gray-200 p-3 mr-2 w-20" @change="updateInputValue">
            <option v-for="hourOption in hourOptions" :key="hourOption" :value="hourOption">{{ hourOption }}</option>
          </select>
          <select v-model="minute" class="form-select rounded-sm border border-gray-200 p-3 mr-2 w-20" @change="updateInputValue">
            <option v-for="minuteOption in minuteOptions" :key="minuteOption" :value="minuteOption">{{ minuteOption }}</option>
          </select>
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
      type: String,
      required: true,
    },
    defaultTime: {
      type: String, // assuming default time is provided in ISO format
      default: '', // optional prop, default time is optional
    },
  },
  data() {
    const currentDateTime = new Date();
    currentDateTime.setMinutes(currentDateTime.getMinutes() + currentDateTime.getTimezoneOffset() + 420);

    return {
      year: this.defaultTime ? new Date(this.defaultTime).getFullYear().toString() : currentDateTime.getFullYear().toString(),
      month: this.defaultTime ? (new Date(this.defaultTime).getMonth() + 1).toString().padStart(2, '0') : (currentDateTime.getMonth() + 1).toString().padStart(2, '0'),
      day: this.defaultTime ? new Date(this.defaultTime).getDate().toString().padStart(2, '0') : currentDateTime.getDate().toString().padStart(2, '0'),
      hour: this.defaultTime ? new Date(this.defaultTime).getHours().toString().padStart(2, '0') : currentDateTime.getHours().toString().padStart(2, '0'),
      minute: this.defaultTime ? new Date(this.defaultTime).getMinutes().toString().padStart(2, '0') : currentDateTime.getMinutes().toString().padStart(2, '0'),
      showTime: this.data.showDateTime === 'datetime',
    };
  },
  computed: {
    inputValue() {
      const formattedMonth = this.month.toString().padStart(2, '0');
      const formattedDay = this.day.toString().padStart(2, '0');
      const formattedHour = this.hour.toString().padStart(2, '0');
      const formattedMinute = this.minute.toString().padStart(2, '0');
      return `${this.year}-${formattedMonth}-${formattedDay}T${formattedHour}:${formattedMinute}`;
    },
    yearOptions() {
      const currentYear = new Date().getFullYear();
      const startYear = 1924; // Start at 1950
      const thaiYearOffset = 543; // Thai year offset

      return Array.from({ length: currentYear - startYear + 1 }, (_, index) => {
        const year = startYear + index;
        const thaiYear = year + thaiYearOffset; // Convert to Thai year
        return { value: year.toString(), label: thaiYear.toString() };
      });
    },
    monthOptions() {
      const thaiMonthLabels = [
        'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน',
        'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม',
        'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
      ];

      return thaiMonthLabels.map((label, index) => ({
        value: (index + 1).toString().padStart(2, '0'),
        label: label
      }));
    },
    dayOptions() {
      return Array.from({ length: 31 }, (_, index) => (index + 1).toString().padStart(2, '0'));
    },
    hourOptions() {
      return Array.from({ length: 24 }, (_, index) => index.toString().padStart(2, '0'));
    },
    minuteOptions() {
      return Array.from({ length: 60 }, (_, index) => index.toString().padStart(2, '0'));
    },
  },
  methods: {
    updateInputValue() {
      const year = this.year;
      const month = this.month;
      const day = this.day;
      let hour = this.hour;
      let minute = this.minute;

      if (!this.showTime) {
        hour = '00';
        minute = '00';
      }

      const selectedDate = new Date(year, month - 1, day, hour, minute);
      selectedDate.setMinutes(selectedDate.getMinutes() - selectedDate.getTimezoneOffset() - 420);
      const utcDate = selectedDate.toISOString();

      this.$emit('update:modelValue', utcDate);
    },
  },
  mounted() {
    if (this.defaultTime) {
      this.updateInputValue();
    }
  },
};
</script>


<style scoped>
/* Add your component-specific styles here */
</style>
