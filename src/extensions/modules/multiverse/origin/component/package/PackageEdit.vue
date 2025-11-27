<script>
import PackageForm from './PackageForm.vue';

export default {
  components: {
    PackageForm
  },
  methods: {
    handleSubmitSuccess(data) {
      console.log('Package created successfully:', data);
    },
    handleSubmitError(error) {
      console.error('Error creating package:', error);
    }
  },
  setup() {
    //console.log("Setup");
  },
};
</script>

<template>
  <main class="flex-1 pb-8">
    <div class="">
      <div class="flex-1 bg-gray-100">
        <div class="">
          <div class="">
            <div class="space-y-6 sm:px-6 lg:col-span-9 lg:px-0">
              <PackageForm 
                mode="edit"
                @submit-success="handleSubmitSuccess"
                @submit-error="handleSubmitError"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
/* ไม่ต้องการ styles เพิ่มเติม เนื่องจากใช้จาก PackageForm */
</style>
