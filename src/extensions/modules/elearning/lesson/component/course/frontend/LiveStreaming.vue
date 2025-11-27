<template>
    <div id="FullScreenContainer">
      <div id="TopBar">
        <div id="Title">{{ title }}</div>
        <button id="CloseButton" @click="closeWidget">ปิดหน้าจอ</button>
      </div>
      <div id="WidgetContainer"></div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      email: {
        type: String,
        required: true,
      },
      nickname: {
        type: String,
        required: true,
      },
      title: {
        type: String,
        required: true,
      },
      lesson: {
        type: String,
        required: true,
      },
      licenseKey: {
        type: String,
        required: true,
      },
    },
    methods: {
      closeWidget() {
        document.body.classList.remove('no-scroll');
        this.$router.push(`/lesson/detail/${this.lesson}`);
      },
    },
    mounted() {
      document.body.classList.add('no-scroll');
      try {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.async = true;
        script.innerHTML = `
          var _options = {
            '_license_key': '${this.licenseKey}',
            '_role_token': '',
            '_registrant_token': '',
            '_personal_token': '',
            '_presenter_token': '',
            '_password_token': '',
            '_widget_containerID': 'WidgetContainer',
            '_widget_width': '100%',
            '_widget_height': '100%',
            '_email': '${this.email}',
            '_nickname': '${this.nickname}',
            '_avatar_url': '',
          };
          (function() {
            !function(i){
              i.Widget=function(c){
                'function'==typeof c&&i.Widget.__cbs.push(c),
                i.Widget.initialized&&(i.Widget.__cbs.forEach(function(i){i()}),
                i.Widget.__cbs=[])
              },
              i.Widget.__cbs=[]
            }(window);
            var ab = document.createElement('script');
            ab.type = 'text/javascript';
            ab.async = true;
            ab.src = 'https://embed.livewebinar.com/em?t=' + _options['_license_key'] + '&' + Object.keys(_options).reduce(function(a, k) {
              a.push(k + '=' + encodeURIComponent(_options[k]));
              return a;
            }, []).join('&');
            var s = document.getElementsByTagName('script')[0];
            s.parentNode.insertBefore(ab, s);
          })();
        `;
        document.getElementById('WidgetContainer').appendChild(script);
      } catch (error) {
        console.error('Error loading script:', error);
      }
    },
    beforeUnmount() {
      document.body.classList.remove('no-scroll');
    },
  };
  </script>
  
  <style>
  #FullScreenContainer {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    background-color: #fff;
    z-index: 1000;
    display: flex;
    flex-direction: column;
  }
  
  #TopBar {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #333;
    color: #fff;
    padding: 2px 10px;
    z-index: 1001;
  }
  
  #Title {
    font-size: 14px;
  }
  
  #CloseButton {
    background-color: #f44336;
    border: none;
    color: white;
    padding: 3px 10px;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    font-size: 14px;
    margin: 2px 1px;
    cursor: pointer;
    border-radius: 0px;
  }
  
  #WidgetContainer {
    width: 100%;
    height: calc(100vh - 36px); /* Adjusted height to compensate for TopBar */
    flex-grow: 1;
  }
  
  .no-scroll {
    overflow: hidden;
  }
  </style>
  