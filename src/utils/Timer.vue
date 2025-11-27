<template>
<div v-if="mode==='display'">
    <div v-if="timeLeft >= 0 || !timerStarted">
        <p>{{ formattedTime }}</p>
    </div>
    <div v-else>
        <p>OO:OO:OO</p>
    </div>
</div>
</template>

<script>
export default {
    props: {
        timer: {
            type: Number,
            default: 5, // Default to 5 minutes
        },
        mode: {
            type: String,
            default: "display", // Default to 5 minutes
        },
    },
    data() {
        return {
            endTime: null,
            timeLeft: null,
            interval: null,
            timerStarted: false,
        };
    },
    computed: {
        formattedTime() {
            let timeToDisplay = this.timeLeft !== null ? this.timeLeft : this.timer * 60;
            const minutes = Math.floor(timeToDisplay / 60);
            const seconds = timeToDisplay % 60;
            return `${minutes}:${seconds.toString().padStart(2, '0')}`;
        },
    },
    methods: {
        checkAndEmitStatus() {
            const timers = JSON.parse(sessionStorage.getItem('timers')) || [];
            const now = new Date().getTime();
            const hasActiveTimer = timers.some(timer => now < timer.endTime);

            this.$emit('timer-status', hasActiveTimer ? 'resume' : 'fresh');
        },
        updateCountdown() {
            const now = new Date().getTime();
            this.timeLeft = Math.floor((this.endTime - now) / 1000);

            if (this.timeLeft < 0) {
                clearInterval(this.interval);
                this.timeLeft = 0;
                this.timerFinished(); // Handle the timer finishing
            }
        },
        startTimer() {
            if (this.timerStarted) return;

            const now = new Date().getTime();
            const duration = this.timer * 60 * 1000; // Convert minutes to milliseconds
            this.endTime = now + duration;
            this.timeLeft = duration / 1000;
            this.timerStarted = true;

            this.storeTimer({
                startTime: now,
                endTime: this.endTime
            });
            this.initializeCountdown();
        },
        storeTimer(timerObj) {
            let timers = JSON.parse(sessionStorage.getItem('timers')) || [];
            timers.push(timerObj);
            sessionStorage.setItem('timers', JSON.stringify(timers));
            this.$emit('update-timer', timerObj); // Emit an event with the new timer details
        },
        resetTimer() {
            clearInterval(this.interval);
            this.endTime = null;
            this.timeLeft = null;
            this.timerStarted = false;
            sessionStorage.removeItem('timers');
        },
        timerFinished() {
            this.$emit('timer-finished', {
                endTime: this.endTime
            });
            this.clearFinishedTimer(this.endTime);
            this.timerStarted = false;
        },
        clearFinishedTimer(endTime) {
            let timers = JSON.parse(sessionStorage.getItem('timers')) || [];
            timers = timers.filter(timer => timer.endTime !== endTime);
            if (timers.length > 0) {
                sessionStorage.setItem('timers', JSON.stringify(timers));
            } else {
                sessionStorage.removeItem('timers'); // Clear if no timers left
            }
        },
        initializeCountdown() {
            this.updateCountdown();
            this.interval = setInterval(this.updateCountdown, 1000);
        },
        checkSessionAndAutoStart() {
            const timers = JSON.parse(sessionStorage.getItem('timers')) || [];
            const now = new Date().getTime();
            const activeTimer = timers.find(timer => now < timer.endTime);

            if (activeTimer) {
                this.endTime = activeTimer.endTime;
                this.timerStarted = true;
                this.initializeCountdown();
            }
        }
    },
    mounted() {
        this.checkSessionAndAutoStart();
        this.$nextTick(() => {
            this.checkAndEmitStatus();
        });
    },
    beforeUnmount() {
        clearInterval(this.interval);
    },
};
</script>
