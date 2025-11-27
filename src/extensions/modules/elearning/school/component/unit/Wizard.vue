<template>
    <div>
      <Subhead
        :navigation="[
          {
            name: 'ย้อนกลับ',
            link: '/school/dashboard',
            style: 'chevron-left',
            class: 'primary-btn',
            visible: true,
            type: 'button',
          }
        ]"
      />
  
      <main class="flex-1 pb-8">
        <div class="mt-6">
          <div class="flex-1 bg-gray-100">
            <div class="mt-6">
              <div class="mx-auto max-w-7xl px-6 sm:px-6 lg:px-6">
                <div class="space-y-6 sm:px-6 lg:col-span-9 lg:px-0">
                    
                  <div class="loader"></div>
  
                  <section
                    aria-labelledby="payment-details-heading"
                    class="relative"
                    :data-content="'กำลังติดต่อฐานข้อมูล กรุณารอสักครู่.....'"
                    :class="[(activeBlock ? 'isblock' : 'isunblock')]"
                  >

                    <div class="shadow bg-white sm:overflow-hidden sm:rounded-md">
                        <wizard ref="wizardComponent" :steps="formSteps" :step-data="formData" @update-step-data="updateStepData"></wizard>

                        <div class="py-6 px-4 sm:p-6">

                            <div v-if="parentCollectedData">
                                <h2 class="font-semibold text-sm mb-3">Output Data</h2>
                                <pre class="bg-gray-100 p-3 text-sm text-gray-600 rounded-md">{{ parentCollectedData }}</pre>
                            </div>

                            <div class="flex space-x-2">
                                <button @click="resetDataFromWizard" class="px-4 py-2 text-white bg-red-500 rounded-md hover:bg-red-600">
                                  Reset
                                </button>
                      
                                <button @click="getDataFromWizard" class="px-4 py-2 text-white bg-green-500 rounded-md hover:bg-green-600">
                                  <font-awesome-icon :icon="['fas','save']"/> Save
                                </button>
                            </div>

                        </div>

                    </div>

                  </section>

                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </template>
  
  <script>
  import Subhead from '@/interface/template/outline/Subhead.vue';
  import Wizard from '@/interface/template/wizard/Wizard.vue';
  import Step1 from './step/Step1.vue';
  import Step2 from './step/Step2.vue';
  import Step3 from './step/Step3.vue';
  import Step4 from './step/Step4.vue';
  
  export default {
    components: {
      Wizard,Subhead,
    },
    data() {
      return {
        formSteps: [
          { title: 'Basic Information', subtitle: 'Basic Information', icon: 'file', component: Step1 },
          { title: 'Database & Disk', subtitle: 'Database & Disk', icon: 'database', component: Step2 },
          { title: 'Theme & Pages', subtitle: 'Theme & Pages', icon: 'plug', component: Step3 },
          { title: 'Preview', subtitle: 'Preview', icon: 'eye', component: Step4 },
        ],
        formData: [
          {
            name: '',
            email: '',
          },
          {
            age: '',
            location: '',
          },
          {
            age2: '',
            location2: '',
          },
          {},
        ],
        parentCollectedData: null,
      };
    },
    methods: {
        updateStepData({ index, data }) {
                this.formData[index] = { ...this.formData[index], ...data };
        },
        getDataFromWizard() {
            if (this.$refs.wizardComponent) {
                // Call saveData in the wizard component using a ref
                this.$refs.wizardComponent.saveData();
                // Now you can update parentCollectedData
                this.parentCollectedData = this.$refs.wizardComponent.collectedData;
            } else {
                this.parentCollectedData = 'No Component Found'
            }
        },
        resetDataFromWizard() {
            if (this.$refs.wizardComponent) {
                // Call saveData in the wizard component using a ref
                this.$refs.wizardComponent.resetData();
            } else {
                this.parentCollectedData = 'No Component Found'
            }
        },
    },
  };
  </script>
  