<template>
  <div class="create-user-container">
    <!-- Header -->
    <div class="page-header">
      <div class="header-left">
        <h2>
          <i class="fas fa-user-plus"></i>
          สร้าง User Account
        </h2>
        <p class="subtitle">สร้างบัญชีผู้ใช้ใหม่ผ่าน Gateway API</p>
      </div>
      <div class="header-actions">
        <button @click="goBack" class="btn-secondary">
          <i class="fas fa-arrow-left"></i>
          ย้อนกลับ
        </button>
      </div>
    </div>

    <!-- User Form Component -->
    <UserForm />
  </div>
</template>

<script>
import UserForm from './Form.vue'

export default {
  name: 'UserCreate',
  
  components: {
    UserForm
  },

  methods: {
    goBack() {
      this.$router.push({ name: 'hr-user-management' })
    }
  }
}
</script>

<style scoped>
.create-user-container {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #e5e7eb;
}

.header-left h2 {
  font-size: 28px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.header-left h2 i {
  color: #3b82f6;
  margin-right: 12px;
}

.subtitle {
  color: #6b7280;
  margin: 0;
  font-size: 14px;
}

.btn-secondary {
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid #d1d5db;
  background: white;
  color: #374151;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-secondary:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 16px;
  }
}
</style>