<template>
    <div>
      <div v-if="debug" class="progress-bar">
        <div class="progress" :style="{ width: progressPlaying + '%' }"></div>
        <div
          v-for="(marker, index) in markers"
          :key="index"
          class="marker"
          :style="{ left: marker.position + '%', backgroundColor: marker.status === 'unactive' ? 'gray' : (marker.status === 'active' ? 'red' : 'green') }"
        ></div>
      </div>

      <div v-for="(marker, index) in markers" :key="index">
        <div v-if="marker.status === 'active'" class="popup">
          <div class="popup-content">
            <h1 class="font-bold pb-4">ระบบตรวจสอบการเรียน</h1>
            <p class="pb-2">คลิ๊ก "เรียนต่อ" ภายใน {{ marker.countdown }} วินาที <br/>หากหมดเวลา วีดีโอนี้จะหยุดและนำผู้เรียนไปหน้าหลักโดยอัตโนมัติ</p>
            <button class="font-bold" @click="closePopup(index)">เรียนต่อ</button>
          </div>
        </div>
      </div>

      <div v-if="debug" class="bg-white p-2 mt-3 text-gray-600 text-sm">
        <button @click="startPlaying" :disabled="playingStarted || timeIsUp">Start | </button>
        <button @click="pausePlaying" :disabled="!playingStarted || timeIsUp">Pause | </button>
        <button @click="resetComponent">Reset | </button>
        <button @click="stopPlaying">Stop </button>
        <br/><br/>
        <p><span class="font-bold">Total Time : </span>{{playingTime}}</p>
        <p><span class="font-bold">Timer: </span>{{ timer.toFixed(0) }}</p>
        <p><span class="font-bold">Percent: </span>{{ playerPercent}}%</p>
        <p><span class="font-bold">Timeout: </span>{{ timeout}}</p>
        <p><span class="font-bold">Popup: </span>{{ Popups}}</p>
        <p><span class="font-bold">Status: </span>{{ progressStatus }}</p>

        <p><span class="font-bold">Progress Plauing: </span>{{ progressPlaying }}</p>
        <p><span class="font-bold">Playing Time: </span>{{ playingStartTime }}</p>
        <p><span class="font-bold">Playing Started: </span>{{ playingStarted }}</p>
        <p><span class="font-bold">Time is Up: </span>{{ timeIsUp }}</p>
        <p><span class="font-bold">Timer Status: </span>{{ timerStatus }}</p>
        <p><span class="font-bold">Timer: </span>{{ timer }}</p>
        <p><span class="font-bold">Elapsed Time: </span>{{ elapsedTime }}</p>

        <span class="font-bold">Marker</span>
        <pre>{{markers}}</pre><br/>
        <span class="font-bold">Events</span>
        <pre>{{events}}</pre>

      </div>
    </div>
  </template>
  
  <script>
  import debug from '@/plugins/Logger.js';
  export default {
    props: {
      playingTime: Number,
      Popups: Number,
      timeout: Number,
      debug: Boolean,
      status: Boolean,
    },
    data() {
      return {
        events: [],
        playerPercent:0,
        markers: [],
        progressPlaying: 0,
        playingStartTime: null,
        playingStarted: false,
        timeIsUp: false,
        progressStatus: 'not started',
        timerStatus: true,
        timer: 0,
        elapsedTime: 0,
      };
    },
    created() {
      debug.log('Popups prop received:', this.Popups);
    },
    mounted() {
      this.playingStartTime = Date.now();
      for (let i = 0; i < this.Popups; i++) {
        const position = (i === 0) ? (0.05 + Math.random() * 0.05) : (i / this.Popups);
        this.markers.push({
          position: position * 100,
          status: 'unactive',
          timer: 0,
          countdown: 0, 
          active: false,
        });
      }
    },
    methods: {
      pushEvent(message) {
        this.events.push({
          message,
          date: new Date(),
        });
        this.$emit('idle-event', this.events);
      },
      end() {
        this.stopPlaying();
      },
      startCountdownTimer(index) {
        const marker = this.markers[index];
        const updateTimer = () => {
          if (marker.active && marker.countdown > 0) {
            marker.countdown -= 1;
            setTimeout(updateTimer, 1000);
          }
        };
        marker.timerId = setTimeout(() => {
          debug.log("Countdown Time Up!!");
          this.triggerTimeout(index);
        }, marker.countdown * 1000);
        updateTimer();
      },
      closePopup(index) {
        const marker = this.markers[index];
        if (marker.active) {
          marker.status = 'closed';
          marker.countdown = 0;
          this.timerStatus = true;
          this.pushEvent(`Popup ${index + 1} is closed.`);
          this.$emit('idle-action', `close`);
          clearTimeout(marker.timerId);
        }
      },
      triggerTimeout() {
        this.$emit('idle-action', `timeout`);
      },
      resetComponent() {
        this.events = [];
        this.progressPlaying = 0;
        this.playingStarted = false;
        this.timeIsUp = false;
        this.progressStatus = 'not started';
        this.timerStatus = true;
        this.timer = 0;
        this.markers.forEach((marker) => {
          marker.status = 'unactive';
          marker.countdown = 0;
          marker.active = false;
        });
        for (let i = 0; i < this.Popups; i++) {
          const position = (i === 0) ? (0.10 + Math.random() * 0.05) : (i / this.Popups);
          this.markers[i].position = position * 100;
        }
        this.pushEvent('Component reset.');
      },
      startPlaying() {
        if (this.status) { // Check the status prop
          if (!this.playingStarted && !this.timeIsUp) {
            if (this.progressStatus === 'paused') {
              this.playingStartTime = this.timer - this.elapsedTime;
            } else {
              this.timer = 0;
              this.playingStartTime = this.timer;
            }
            this.playingStarted = true;
            this.updatePlayingProgress();
            this.pushEvent(`Marker started.`);
            this.progressStatus = 'started';
          }
        }
      },
      
      pausePlaying() {
        if (this.status) { // Check the status prop
          if (this.playingStarted) {
            this.playingStarted = false;
            this.elapsedTime = this.timer - this.playingStartTime;
            this.pushEvent(`Marker paused.`);
            this.progressStatus = 'paused';
          }
        }
      },
      stopPlaying() {
        this.playingStarted = false;
        this.timeIsUp = false;
        this.progressPlaying = 0;
        this.progressStatus = 'not started';
        this.events = [];
        this.markers.forEach((marker) => {
          marker.status = 'unactive';
        });
        this.markers.forEach((marker) => {
          if (marker.status === 'active') {
            marker.status = 'closed';
          }
        });
        this.pushEvent(`Marker stopped.`);
      },
      updatePlayingProgress() {
        this.$emit('idle-status', this.progressStatus);
        this.playerPercent = (this.timer/(this.playingTime/1000)) * 100
        if (this.playingStarted && !this.timeIsUp && this.timerStatus) {
          this.timer += 0.27;
          if (this.timer <= (this.playingTime/1000) && !this.isAnyPopupActive()) {
            this.progressPlaying = (this.timer / (this.playingTime/1000)) * 100;
            for (let index = 0; index < this.markers.length; index++) {
              const marker = this.markers[index];
              if (this.progressPlaying >= marker.position) {
                if (marker.status === 'unactive') {
                  marker.status = 'active';
                  this.timerStatus = false;
                  marker.timer = 0;
                  marker.countdown = this.timeout;
                  marker.active = true;
                  this.startCountdownTimer(index);
                  this.pushEvent(`Marker active.`);
                  this.$emit('idle-action', `open`);
                }
              }
            }
            if (this.progressPlaying >= 99.995) {
              this.progressStatus = 'completed';
            }
          }
          if (this.timer >= (this.playingTime/1000)) {
            this.timeIsUp = true;
            this.markers.forEach((marker) => {
              marker.status = 'unactive';
            });
            this.pushEvent(`Time is up.`);
            this.progressStatus = 'completed';
          }
        }
      },
      isAnyPopupActive() {
        return this.markers.some((marker) => marker.status === 'active');
      },
    },
  };
  </script>
  
  <style scoped>
  .popup {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 99999999999999;
  }
  
  .popup-content {
    background-color: #fff;
    padding: 10px;
    border-radius: 5px;
    box-shadow: 0px 0px 3px rgba(0, 0, 0, 0.5);
    text-align: center;
  }
  
  button {
    margin-top: 10px;
  }
  
  .progress-bar {
    width: 100%;
    background-color: #ddd;
    height: 5px;
    position: relative;
  }
  
  .progress {
    background-color: #ff0000;
    height: 100%;
    width: 0;
    transition: width 1s linear;
  }
  
  .marker {
    position: absolute;
    width: 8px;
    height: 5px;
    top: 0;
  }
  
  .marker[style*="background-color: gray"] {
    background-color: gray;
  }
  
  .marker[style*="background-color: red"] {
    background-color: red;
  }
  
  .marker[style*="background-color: green"] {
    background-color: green;
  }
  </style>
  