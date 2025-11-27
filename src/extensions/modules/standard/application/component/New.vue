<script>
import Breadcrumbs from '@/interface/template/outline/Breadcrumbs.vue';
import storageManager from '@/plugins/storage';

export default {
  name: 'Add Application',
  data() {
    return {
        name: '',
        form: [],
        document: [],
        status: [],
        approver: [],
        slug: '',
        code: '',
        description: '',
        display: '',
        web: '',
        isDefault: '',
        method: '',
        limit: '',

        session: storageManager.get('session'),
        configs: storageManager.get('configs'),
        activeBlock: false
    }
  },
  components: {
    Breadcrumbs
  },
  methods: {
    async addApplication() {
      try {
        this.activeBlock = true;
        const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/application/", {
          method: 'POST',
          headers: {'Content-Type': 'application/json','client-token-key':this.configs.key},
          body: JSON.stringify({
            data: {
              name: this.name,
              form: this.form,
              document: this.document,
              approver: this.approver,
              status: this.status,

              slug: this.slug,
              code: this.code,
              description: this.description,
              display: this.display,
              web: this.web,
              isDefault: this.isDefault,
              method: this.method,
              limit: this.limit,

              parent: this.session.current._id,
            },
            options: {
              fieldType: [],
              uniqueFields: []
            }
          })
        });
        const finalRes   = await resAPI.json();

        if(resAPI.status===200) {
          window.location.href = "/application/dashboard"
        }

        console.log(finalRes);
      } catch (error) {
        console.log(error)
      }
    }
  },
  setup() {
  },
  mounted() {
  }
}
</script>

<template>

  <breadcrumbs
  :navigation="
  [
    {
      name: 'ย้อนกลับ',
      link: '/application/dashboard',
      style: 'chevron-left'
    }
  ]"
  /> 

  <div class="flex-1 bg-gray-100 pt-2 pb-5">
    <div class="mt-2">
        <div class="mx-auto max-w-7xl px-6 sm:px-6 lg:px-6">
            <div class="space-y-6 sm:px-6 lg:col-span-9 lg:px-0">
              <form @submit.prevent="addApplication">
                <section aria-labelledby="payment-details-heading" class="relative" :data-content="'กำลังติดต่อฐานข้อมูล กรุณารอสักครู่.....'" :class="[(activeBlock?'isblock' : 'isunblock')]">
                  
                    <div class="shadow sm:overflow-hidden sm:rounded-md">
                      <div class="bg-white py-6 px-4 sm:p-6">
                        <div>
                          <h2 id="payment-details-heading" class="text-lg font-medium leading-6 text-gray-900">ข้อมูลใบสมัคร</h2>
                          <p class="mt-1 text-sm text-gray-500">กรอกข้อมูลของใบสมัครให้ครบถ้วน.</p>
                        </div>

                        <div class="mt-6 grid grid-cols-4 gap-6">

                          <div class="col-span-4 sm:col-span-2">
                            <label for="name" class="block text-sm font-medium text-gray-700">ชื่อ</label>
                            <input 
                            v-model="name" 
                            type="text" name="name" id="name" autocomplete="name" 
                            class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm">
                          </div>	

                        </div>

                        <div class="mt-6 grid grid-cols-3 gap-6">
                          <!-- Input for slug -->
                          <div class="col-span-3 sm:col-span-1">
                            <label for="slug" class="block text-sm font-medium text-gray-700">Slug</label>
                            <input
                              v-model="slug"
                              type="text"
                              id="slug"
                              class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm"
                              required
                            >
                          </div>
                      
                          <!-- Input for code -->
                          <div class="col-span-3 sm:col-span-1">
                            <label for="code" class="block text-sm font-medium text-gray-700">Code</label>
                            <input
                              v-model="code"
                              type="text"
                              id="code"
                              class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm"
                              required
                            >
                          </div>
                      
                          <!-- Textarea for description -->
                          <div class="col-span-3">
                            <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
                            <textarea
                              v-model="description"
                              id="description"
                              class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm"
                              rows="3"
                              required
                            ></textarea>
                          </div>
                      
                          <!-- Checkbox for display -->
                          <div class="col-span-3 sm:col-span-1">
                            <label class="flex items-center">
                              <input
                                type="checkbox"
                                v-model="display"
                                class="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                              >
                              <span class="ml-2 text-sm text-gray-700">Display</span>
                            </label>
                          </div>
                      
                          <!-- Checkbox for web -->
                          <div class="col-span-3 sm:col-span-1">
                            <label class="flex items-center">
                              <input
                                type="checkbox"
                                v-model="web"
                                class="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                              >
                              <span class="ml-2 text-sm text-gray-700">Web</span>
                            </label>
                          </div>
                      
                          <!-- Checkbox for default -->
                          <div class="col-span-3 sm:col-span-1">
                            <label class="flex items-center">
                              <input
                                type="checkbox"
                                v-model="isDefault"
                                class="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                              >
                              <span class="ml-2 text-sm text-gray-700">Default</span>
                            </label>
                          </div>
                      
                          <!-- Radio buttons for method -->
                          <div class="col-span-3 sm:col-span-1">
                            <label class="block text-sm font-medium text-gray-700">Method</label>
                            <div class="mt-1">
                              <label class="inline-flex items-center">
                                <input
                                  type="radio"
                                  v-model="method"
                                  value="user"
                                  class="form-radio h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                                >
                                <span class="ml-2 text-sm text-gray-700">User</span>
                              </label>
                              <label class="inline-flex items-center ml-6">
                                <input
                                  type="radio"
                                  v-model="method"
                                  value="product"
                                  class="form-radio h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                                >
                                <span class="ml-2 text-sm text-gray-700">Product</span>
                              </label>
                              <label class="inline-flex items-center ml-6">
                                <input
                                  type="radio"
                                  v-model="method"
                                  value="corporate"
                                  class="form-radio h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                                >
                                <span class="ml-2 text-sm text-gray-700">Corporate</span>
                              </label>
                              <label class="inline-flex items-center ml-6">
                                <input
                                  type="radio"
                                  v-model="method"
                                  value="form"
                                  class="form-radio h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                                >
                                <span class="ml-2 text-sm text-gray-700">Form</span>
                              </label>
                              <label class="inline-flex items-center ml-6">
                                <input
                                  type="radio"
                                  v-model="method"
                                  value="assessment"
                                  class="form-radio h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                                >
                                <span class="ml-2 text-sm text-gray-700">Assessment</span>
                              </label>
                            </div>
                          </div>
                      
                          <!-- Radio buttons for limit -->
                          <div class="col-span-3 sm:col-span-1">
                            <label class="block text-sm font-medium text-gray-700">Limit</label>
                            <div class="mt-1">
                              <label class="inline-flex items-center">
                                <input
                                  type="radio"
                                  v-model="limit"
                                  value="general"
                                  class="form-radio h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                                >
                                <span class="ml-2 text-sm text-gray-700">General</span>
                              </label>
                              <label class="inline-flex items-center ml-6">
                                <input
                                  type="radio"
                                  v-model="limit"
                                  value="company"
                                  class="form-radio h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                                >
                                <span class="ml-2 text-sm text-gray-700">Company</span>
                              </label>
                              <label class="inline-flex items-center ml-6">
                                <input
                                  type="radio"
                                  v-model="limit"
                                  value="admin"
                                  class="form-radio h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                                >
                                <span class="ml-2 text-sm text-gray-700">Admin</span>
                              </label>
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>

                </section>

                <section aria-labelledby="plan-heading" class="mt-8">
                  <div class="shadow sm:overflow-hidden sm:rounded-md">
                      <div class="bg-gray-50 px-4 py-3 text-right sm:px-6 border-t">
                        <button type="submit" class="inline-flex justify-center rounded-md border border-transparent bg-gray-800 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2">
                          <font-awesome-icon :icon="['fas','save']" class="pr-2 pl-2"/>บันทึกข้อมูล</button>
                      </div>
                  </div>
                </section>
              </form>
            </div>
        </div>
    </div>
</div>

</template>