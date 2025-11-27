<template>
    <div v-if="loading" class="loading-overlay">
        <div class="preloader">
            <div class="lines">
              <div class="line line-1"></div>
              <div class="line line-2"></div>
              <div class="line line-3"></div>
            </div>
            
            <div class="loading-text">กำลังโหลด</div>
          </div>
    </div>
</template>
  
  <script>
  export default {
    name: "LoadingOverlay",
    props: {
      loading: Boolean,
      text: String,
    },
  };
  </script>
  
  <style>
  .loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(255, 255, 255, 1);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .loading-spinner {
    border: 8px solid #f3f3f3;
    border-top: 8px solid #3498db;
    border-radius: 50%;
    width: 50px;
    height: 50px;
    animation: spin 2s linear infinite;
  }
  
  .loading-text {
    margin-top: 20px;
    font-size: 20px;
    font-weight: bold;
    text-align: center;
  }
  
  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  .loading-wrapper {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }


  .loading-wrapper {
    margin: 32px;
    text-align: center;
    perspective: 800px;
  }
  
  .loading-wrapper .cover {
    display: inline-block;
    width: 200px;
    height: 144px;
    border: 8px solid #218EED;
    border-radius: 4px;
    box-sizing: border-box;
    background-color: #fff;
    z-index: 1;
  }
  
  
  @keyframes browzePage {
    0%   { 
      transform: rotateY( 0deg );
      background-color: #fff;
      }
    50% {
        background-color: #f2f2f2;
      }
    100% { 
      transform: rotateY( -180deg );
      background-color: #fff; 
    }
  }
  
  .loading-wrapper .page {
    display: inline-block;
    width: 100px;
    height: 144px;
    border-width: 8px 8px 8px 0;
    border-radius: 4px;
    border-style: solid;
    border-color: #218EED;
    background-color: #fff;
    box-sizing: border-box;
    left: -104px;
    position: relative;
    z-index: 2;
    transform-style: preserve-3d;
    transition: transform 1s;
    transform-origin: left top;
    animation: browzePage 1s infinite;
  }
  
  .loading-wrapper .inner-border {
    display: inline-block;
    width: 1px;
    height: 144px;
    position: relative;
    background-color: rgba(0,0,0,0.06);
    left: -208px;
    z-index: 3;
  }
  
  .loading-wrapper p {
    font-family: Roboto;
    text-align: center;
    position: relative;
    color: #218EED;
    left: -48px;
    margin-top: 24px;
  }




  .preloader {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 80px;
    height: 60px;
    margin: -30px 0 0 -40px;
  }
  .preloader .lines {
    width: 80px;
    height: 40px;
    position: absolute;
  }
  .preloader .lines .line {
    width: 80px;
    height: 10px;
    background-color: #949494;
    position: absolute;
    clip: rect(0, 0, 20px, 0);
  }
  .preloader .lines .line.line-1 {
    top: 0;
    -webkit-animation: slide 2s ease 0s infinite;
            animation: slide 2s ease 0s infinite;
  }
  .preloader .lines .line.line-2 {
    top: 15px;
    -webkit-animation: slide 2s ease 0.25s infinite;
            animation: slide 2s ease 0.25s infinite;
  }
  .preloader .lines .line.line-3 {
    top: 30px;
    -webkit-animation: slide 2s ease 0.5s infinite;
            animation: slide 2s ease 0.5s infinite;
  }
  .preloader .loading-text {
    position: absolute;
    top: 50px;
    text-align: center;
    width: 100%;
    color: #454545;
    font-size: 13px;
    letter-spacing: 3px;
    line-height: 10px;
    height: 10px;
    -webkit-animation: fade 1s ease 0s infinite;
            animation: fade 1s ease 0s infinite;
  }
  
  @-webkit-keyframes slide {
    0% {
      clip: rect(0, 0, 20px, 0);
    }
    30% {
      clip: rect(0, 80px, 20px, 0);
    }
    50% {
      clip: rect(0, 80px, 20px, 0);
    }
    80% {
      clip: rect(0, 80px, 20px, 80px);
    }
    100% {
      clip: rect(0, 80px, 20px, 80px);
    }
  }
  
  @keyframes slide {
    0% {
      clip: rect(0, 0, 20px, 0);
    }
    30% {
      clip: rect(0, 80px, 20px, 0);
    }
    50% {
      clip: rect(0, 80px, 20px, 0);
    }
    80% {
      clip: rect(0, 80px, 20px, 80px);
    }
    100% {
      clip: rect(0, 80px, 20px, 80px);
    }
  }
  @-webkit-keyframes fade {
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }
  @keyframes fade {
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }

  
  </style>
  