<script>
export default {
	name: 'Loader',
	components: {},
	methods: {},
};
</script>

<template>
<div class="fixed inset-0 z-50 flex items-center justify-center">
  <div class="absolute inset-0 bg-white"></div>
  <div class="relative z-10 text-center">
    <div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
    <h3 class="text-3xl font-bold tracking-tight text-gray-900 mt-4">กำลังโหลดข้อมูล</h3>
    <p class="mt-2 text-base text-gray-500">ระบบกำลังโหลดข้อมูล กรุณารอสักครู่.</p>
  </div>
</div>
</template>

<style scoped>
.lds-ellipsis {
    display: inline-block;
    position: relative;
    width: 80px;
    height: 80px;
  }
  .lds-ellipsis div {
    position: absolute;
    top: 33px;
    width: 13px;
    height: 13px;
    border-radius: 50%;
    background: #ff5252;
    animation-timing-function: cubic-bezier(0, 1, 1, 0);
  }
  .lds-ellipsis div:nth-child(1) {
    left: 8px;
    animation: lds-ellipsis1 0.6s infinite;
  }
  .lds-ellipsis div:nth-child(2) {
    left: 8px;
    animation: lds-ellipsis2 0.6s infinite;
  }
  .lds-ellipsis div:nth-child(3) {
    left: 32px;
    animation: lds-ellipsis2 0.6s infinite;
  }
  .lds-ellipsis div:nth-child(4) {
    left: 56px;
    animation: lds-ellipsis3 0.6s infinite;
  }
  @keyframes lds-ellipsis1 {
    0% {
      transform: scale(0);
    }
    100% {
      transform: scale(1);
    }
  }
  @keyframes lds-ellipsis3 {
    0% {
      transform: scale(1);
    }
    100% {
      transform: scale(0);
    }
  }
  @keyframes lds-ellipsis2 {
    0% {
      transform: translate(0, 0);
    }
    100% {
      transform: translate(24px, 0);
    }
  }
</style>
