<script>
export default {
  name: 'Block',
  data() {
    return {
    }
  },
  components: {
  },
  methods: {

  },
  setup() {
  },
  mounted() {
  }
}
</script>

<template>
<div class="min-h-screen absolute w-full h-full z-50 whitespace-nowrap overflow-auto scrollbar-hide mt-[-65px]" v-observe-visibility="visibilityChanged">
  <div class="min-h-full bg-white bg-opacity-60 md:grid md:place-items-center">
    <div class="mx-auto max-w-max">
      <main class="sm:flex">
        <div class="sm:ml-6">
          <div class="text-center">
            <h3 class="text-3xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              <div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
              <div class="text-center">กำลังบันทึกข้อมูล</div>
            </h3>
            <p class="mt-1 text-base text-gray-500">ระบบกำลังทำการบันทึกข้อมูล กรุณารอสักครู่.</p>
          </div>
        </div>
      </main>
    </div>
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
