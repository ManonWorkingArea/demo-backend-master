<template><div class="finance-component"><h4><i class="fas fa-eye"></i> {{ componentTitle }}</h4><p>Component สำหรับ {{ componentTitle }} - พัฒนาด้วย Dynamic Loading</p></div></template>
<script>
export default {
  name: 'AccountsReceivableDetail',
  data() { return { componentTitle: 'รายละเอียดใบแจ้งหนี้ลูกหนี้' } },
  async mounted() { await this.initComponent() },
  methods: {
    async initComponent() { if (window.ERP_CORE?.modules?.finance?.init) await window.ERP_CORE.modules.finance.init(this) },
    async apiCall(url, options = {}) { return window.ERP_CORE?.modules?.finance?.apiCall ? await window.ERP_CORE.modules.finance.apiCall(url, options) : { success: false } }
  }
}
</script>