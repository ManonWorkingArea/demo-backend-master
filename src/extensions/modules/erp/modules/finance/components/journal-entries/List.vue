<template><div class="finance-component"><h4><i class="fas fa-pen-alt"></i> Journal Entries</h4><p>บันทึกรายการบัญชี</p><div class="d-flex justify-content-between mb-3"><div></div><button class="btn btn-primary" @click="createJournal"><i class="fas fa-plus"></i> สร้างรายการบัญชี</button></div><div class="table-responsive"><table class="table table-bordered"><thead><tr><th>วันที่</th><th>รายการ</th><th>เดบิต</th><th>เครดิต</th><th>การดำเนินการ</th></tr></thead><tbody><tr><td colspan="5" class="text-center text-muted">ไม่มีข้อมูล</td></tr></tbody></table></div></div></template>
<script>
export default {
  name: 'JournalEntriesList',
  methods: {
    createJournal() { this.$router.push({ name: 'finance-journal-create' }) }
  }
}
</script>