<template>
    <div class="loader-spinner"></div>
</template>
<style scoped>
/* HTML: <div class="loader"></div> */
/* HTML: <div class="loader"></div> */
.loader-spinner {
    width: 34px;
    aspect-ratio: 1;
    display: flex;
    color: #757575;
    border: 2px solid;
    box-sizing: border-box;
    border-radius: 50%;
    background: 
      radial-gradient(circle 3px, currentColor 95%,#0000),
      linear-gradient(currentColor 50%,#0000 0) 50%/2px 60% no-repeat;
    animation: l1 2s infinite linear;
  }
  .loader-spinner:before {
    content: "";
    flex: 1;
    background:linear-gradient(currentColor 50%,#0000 0) 50%/2px 80% no-repeat;
    animation: inherit;
  }
  @keyframes l1 {
    100% {transform: rotate(1turn)}
  }
</style>