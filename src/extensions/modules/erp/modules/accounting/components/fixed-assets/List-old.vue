<template>
  <div class="placeholder-component">
    <div class="text-center py-12">
      <i class="fas fa-building fa-4x text-gray-300 mb-4"></i>
      <h2 class="text-2xl font-bold text-gray-700 mb-2">Fixed Assets Management</h2>
      <p class="text-gray-500 mb-4">ทะเบียนสินทรัพย์ถาวรและคำนวณค่าเสื่อม</p>
      <div class="text-sm text-gray-400">
        <p>🔹 ทะเบียนสินทรัพย์ (อาคาร/เครื่องจักร/ยานพาหนะ/อื่นๆ)</p>
        <p>🔹 คำนวณค่าเสื่อมราคา (เส้นตรง/ยอดลดลง)</p>
        <p>🔹 บันทึกการซื้อ/ขาย/จำหน่าย</p>
        <p>🔹 รายงานสินทรัพย์ถาวร</p>
      </div>
      <p class="text-yellow-600 font-semibold mt-6">⚠️ Component Under Construction</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FixedAssetsList',
  mounted() {
    console.log('Fixed Assets List component loaded');
  }
}
</script>

<style scoped>
.placeholder-component {
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f9fafb;
  border-radius: 8px;
}
</style>
