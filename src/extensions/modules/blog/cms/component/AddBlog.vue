<template>
  <div>
    <ContentForm
      :mode="'add'"
      :type="'post'"
      :initialData="initialData"
      @closeEdit="closeEdit"
    />
  </div>
</template>

<script>
import storageManager from '@/plugins/storage';
import ContentForm from '@/extensions/modules/blog/cms/component/_plugin/ContentForm.vue';

export default {
  data() {
    const accessToken = storageManager.get('session', 'token');
    const session = storageManager.get('session');
    const routeParams = this.$route.params;
    
    return {
      configs: storageManager.get('configs'),
      hostkey: this.$Key,
      accessToken,
      session,
      loading_sources: true,
      isEditMode: true,
      initialData: {
        type: 'blog', // กำหนดประเภทเป็นบล็อก
        owner: session.current._id, // เจ้าของบล็อก
        status: 'draft', // สถานะเริ่มต้นเป็นฉบับร่าง
        parent: routeParams.id || null, // เพิ่ม parent post id จาก route
        pageID: routeParams.id || null, // เพิ่ม pageID สำหรับความสัมพันธ์
      },
    };
  },
  components: {
    ContentForm,
  },
  created() {
    // ถ้ามี parent id จาก route ให้ดึงข้อมูล parent
    if (this.$route.params.id) {
      this.fetchParentPageDetails();
    }
  },
  methods: {
    async fetchParentPageDetails() {
      try {
        // เรียกใช้ API เพื่อดึงรายละเอียดของ parent page
        const response = await this.$api.get(`/api/page/${this.$route.params.id}`);
        const parentPage = response.data;
        
        // อัปเดต initialData ด้วยข้อมูลเพิ่มเติมจาก parent page
        this.initialData = {
          ...this.initialData,
          destination: parentPage.destination || '',
          course: parentPage.course || '',
        };
      } catch (error) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูล parent page:', error);
      }
    },
    openEdit(data) {
      this.isEditMode = true;
      this.initialData = { ...this.initialData, ...data };
    },
    closeEdit() {
      this.isEditMode = false;
      this.initialData = {
        type: 'blog',
        owner: this.session.current._id,
        status: 'draft',
        parent: this.$route.params.id || null,
        pageID: this.$route.params.id || null,
      };
      this.$router.push('/cms/blog'); // กลับไปหน้ารายการบล็อก
    },
  }
}
</script> 