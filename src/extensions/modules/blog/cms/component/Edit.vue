<template>
  <div>
    <div>
      <ContentForm
        :mode="'edit'"
        :initialData="initialData"
        @closeEdit="closeEdit"
      />
    </div>
  </div>
</template>

<script>
import storageManager from '@/plugins/storage';
import ContentForm from '@/extensions/modules/blog/cms/component/_plugin/ContentForm.vue'; // นำเข้า EditForm.vue

export default {
  data() {
    const accessToken = storageManager.get('session', 'token');
    const session = storageManager.get('session');
    return {
      configs: storageManager.get('configs'),
      hostkey: this.$Key,
      accessToken,
      session,
      loading_sources: true,
      isEditMode: true, // เพิ่มตัวแปรเพื่อควบคุมโหมดการแก้ไข
      initialData: {}, // ข้อมูลเริ่มต้นสำหรับการแก้ไข
    };
  },
  components: {
    ContentForm, // เพิ่ม EditForm ใน components
  },
  methods: {
    openEdit(data) {
      this.isEditMode = true;
      this.initialData = data;
    },
    closeEdit() {
      this.isEditMode = false;
      this.initialData = {};
    },
  }
}
</script>