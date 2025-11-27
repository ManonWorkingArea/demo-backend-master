<template><div class="finance-component"><h4><i class="fas fa-exchange-alt"></i> Credit/Debit Notes</h4><p>จัดการใบปรับยอด Credit Note และ Debit Note</p><div class="row"><div class="col-md-6"><button class="btn btn-success" @click="createCreditNote"><i class="fas fa-plus-circle"></i> สร้าง Credit Note</button></div><div class="col-md-6"><button class="btn btn-warning" @click="createDebitNote"><i class="fas fa-plus-square"></i> สร้าง Debit Note</button></div></div></div></template>
<script>
export default {
  name: 'CreditDebitNotesList',
  methods: {
    createCreditNote() { this.$router.push({ name: 'finance-credit-note-create' }) },
    createDebitNote() { this.$router.push({ name: 'finance-debit-note-create' }) }
  }
}
</script>