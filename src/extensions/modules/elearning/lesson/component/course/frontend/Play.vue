<script>
import storageManager from '@/plugins/storage';
import convertUtils from "@/plugins/convertUtils";
import deviceUtils from "@/plugins/DeviceUtils";
import Hls from "hls.js";
import Plyr from "plyr";
import IdleComponent from './Idle.vue';
import Playlist from './Playlist.vue';
import LiveStreaming from './LiveStreaming.vue';

import debug from '@/plugins/Logger.js';

import requestClient from '@/plugins/requestClient';
const Request = new requestClient(false);

const statusArray = [
    { name: 'pending', label: 'รอเรียน', styleClass: 'bg-gray-300 text-gray-600', icon: 'hourglass-start' },
    { name: 'processing', label: 'กำลังเรียน', styleClass: 'bg-yellow-300 text-yellow-800', icon: 'spinner' },
    { name: 'complete', label: 'เรียนจบแล้ว', styleClass: 'bg-green-300 text-green-800', icon: 'check' },
];

export default {
    name: 'Lesson Player',
    components: {
        idle: IdleComponent,
        LiveStreaming,
        Playlist
    },
    data() {
        return {
            // Idle Check
            receivedEvents: [],
            receivedProgressStatus: '',

            playOption: 'step',
            login: storageManager.get('session', 'login'),
            configs: storageManager.get('configs'),
            session: storageManager.get('session'),
            dataItem: this.$route.params.cid,
            playerItem: this.$route.params.pid,
            enroll: storageManager.get('session', 'enroll'),
            deviceType: deviceUtils.deviceDetect(),
            exam: [],
            lesson: [],
            stopTrigger:false,
            lessonLoaded: false,
            players: [],
            player: [],
            progress: [],
            progressArray: [],
            param_id: "",
            param_ep: "",
            loading_sources: true,
            playerLogo: "",
            playerSource: "",
            playerPoster: "",
            isFullscreen: false,
            userIp: '0.0.0.0', // Default IP address
            playerOptions: {
                controls: [
                    "play-large",
                    "current-time",
                    "play",
                    "mute",
                    "volume",
                    "progress",
                    "settings",
                    "fullscreen"
                ],
                settings: ["quality", "speed", "loop"],
                timer: null,
                realtime: [],
            },
            totalPopups: 2
        }
    },
    methods: {
        startIdle() {
            this.$refs.idleComponent.startPlaying();
        },
        pauseIdle() {
            this.$refs.idleComponent.pausePlaying();
        },
        processIdle() {
            this.$refs.idleComponent.updatePlayingProgress();
        },
        resetIdle() {
            this.$refs.idleComponent.stopPlaying();
        },
        handleCustomMethodResult(result) {
            debug.slack("Result from custom method in idle.vue:", result);
        },
        handleIdleFunction(action) {
            switch (action) {
                case 'open':
                    this.pauseVideo();
                    debug.log('Idle - Open');
                    break;
                case 'close':
                    this.playVideo();
                    debug.log('Idle - Close');
                    break;
                case 'timeout':
                    debug.log('Idle - Timeout');
                    this.$router.push('/lesson/detail/' + this.lesson._id);
                    break;
                default:
                    debug.log('Idle - Unknown Action: ', action);
                    break;
            }
        },
        // Event handler for event-added event from idle.vue
        handleEventAdded(events) {
            this.receivedEvents = events;
        },
        // Event handler for progress-status-updated event from idle.vue
        handleProgressStatusUpdated(status) {
            this.receivedProgressStatus = status;
        },
        handlePopupStatusUpdated(status) {
            this.receivedPopupStatus = status;
        },
        convertToMilliseconds(timeString) {
            const [hours, minutes, seconds] = timeString.split(":").map(Number);
            const totalMilliseconds = (hours * 60 * 60 + minutes * 60 + seconds) * 1000;
            return totalMilliseconds;
        },
        toggleElementFullscreen() {
            debug.log("Fullscreen");
            this.isFullscreen = !this.isFullscreen;
        },
        async getUserIP() {
            try {
                const response = await fetch('https://api.ipify.org?format=json');
                if (!response.ok) throw new Error('Failed to fetch IP address');
                const data = await response.json();
                this.userIp = data.ip; // Update the userIp data property with the fetched IP address
                console.log('Fetched User IP Address:', this.userIp); // Optional: for debugging
            } catch (error) {
                console.error('Error fetching user IP:', error);
                // Optionally handle the error, e.g., by showing an error message to the user
            }
        },
        updateCurrentDateTime() {
            const currentDateTimeElement = document.getElementById("currentDateTime");
            if (currentDateTimeElement) {
                const currentDate = new Date();
                currentDateTimeElement.textContent = currentDate.toLocaleString("en-US", {
                    timeZone: "GMT",
                });
            }
        },
        stripHtmlTags(html) {
            const tempElement = document.createElement("div");
            tempElement.innerHTML = html;
            return tempElement.textContent || tempElement.innerText || "";
        },
        getStatus(status) {
            const statusObj = statusArray.find(item => item.name === status);
            if (statusObj) {
                return `<p class="inline-flex rounded-full px-2 text-xs font-semibold leading-5 capitalize ${statusObj.styleClass}">
          <i class="fa fa-${statusObj.icon} mr-1 mt-1"></i>${statusObj.label}
          </p>`;
            }
            return '';
        },
        checkExam(type) {
            return this.exam.some(item => item.type === type);
        },
        getFilteredExams(type) {
            if (this.exam && this.exam.length) {
                return this.exam.filter((exam) => exam.type === type);
            }
            return [];
        },
        formatSeconds(seconds) {
            return convertUtils.secondsToTime(seconds);
        },
        formatThaidate(date) {
            return convertUtils.toThaiDatetime(date);
        },
        detectDevice() {
            return deviceUtils.deviceDetect();
        },
        pauseVideo() {
            const videoStreaming = this.$refs.videoStreaming;
            if (videoStreaming.paused) {
                return;
            }
            videoStreaming.pause();
        },
        playVideo() {
            const videoStreaming = this.$refs.videoStreaming;
            if (videoStreaming.paused) {
                videoStreaming.play();
            }
        },
        callChildFunction() {
            const childRef = this.$refs.childRef;
            if (childRef) {
                childRef.getData();
                childRef.calculateAnalytics();
            }
        },
        callChildAnalytics() {
            const childRef = this.$refs.childRef;
            if (childRef) {
                childRef.getData(true);
                childRef.calculateAnalytics();
            }
        },
        videoStreaming() {
            const _self = this;
            const video = this.$refs.videoStreaming;
            const skip = this.lesson.skip
            debug.log(skip);

            const defaultOptions = {
                controls: ['play', 'fast-forward', 'progress', 'custom-button', 'current-time', 'duration', 'mute', 'volume', 'settings'],
                fullscreen: { enabled: false },
                tooltips: true,
                youtube: {
                    noCookie: true, // Use YouTube without cookies
                    rel: 1, // Hide related videos
                    showinfo: 0, // Hide video info
                    modestbranding: 1, // Hide YouTube logo
                    iv_load_policy: 3,
                    enablejsapi: 1
                }
            };

            let player;

            // Check if the source URL is a YouTube video
            if (this.playerSource.includes('youtube.com') || this.playerSource.includes('youtu.be')) {
                const youtubeId = this.playerSource.match(/(?:\?v=|\/embed\/)(.{11})/)[1];
                const youtubeUrl = `https://www.youtube.com/embed/${youtubeId}?origin=${window.location.host}&amp;enablejsapi=1&amp;modestbranding=1&amp;iv_load_policy=3&amp;playsinline=1&amp;showinfo=0&amp;rel=0`;
                const iframe = document.createElement('iframe');
                iframe.src = youtubeUrl;
                iframe.allowfullscreen = true;
                iframe.allowtransparency = true;
                iframe.allow = 'autoplay';

                // plyr__video-wrapper
                const videoWrapper = document.createElement('div');
                videoWrapper.classList.add('plyr__video-wrapper');
                videoWrapper.appendChild(iframe);

                // plyr__video-embed
                const videoEmbed = document.createElement('div');
                videoEmbed.classList.add('plyr__video-embed');
                videoEmbed.appendChild(videoWrapper);

                video.parentNode.replaceChild(videoEmbed, video);

                // Player Config
                player = new Plyr(videoEmbed, {
                    ...defaultOptions,
                    youtube: {
                        ...defaultOptions.youtube,
                        iv_load_policy: 3,
                        modestbranding: 1,
                        rel: 0,
                        origin: window.location.host,
                        enablejsapi: 1,
                    },
                });

                player.on('ready', () => {
                    debug.log("youtube ready", skip);
                    if (skip === "no") {
                        const progress = document.querySelector('.plyr__progress');
                        progress.classList.add('pointer-events-none');
                        progress.classList.add('opacity-30');
                    }
                });

                // Add event listeners for seek time updates and play status detection
                player.on('timeupdate', () => {
                    const currentTime = player.currentTime;
                    debug.log(currentTime);
                    _self.updateTimer(currentTime);
                    _self.getTimer(currentTime);
                });

                player.on('playing', () => {
                    debug.log("playing");
                });

                player.on('pause', () => {
                    debug.log("pause");
                    _self.showTimer();
                });

                player.on('ended', () => {
                    debug.log("ended");
                    _self.stopTimer();
                    _self.callChildFunction();
                });
            } else if (Hls.isSupported() && this.playerSource.endsWith('.m3u8')) {
                const hls = new Hls();
                hls.loadSource(this.playerSource);

                hls.on(Hls.Events.MANIFEST_PARSED, function() {
                    const availableQualities = hls.levels.map(l => l.height);
                    defaultOptions.quality = {
                        default: availableQualities[0],
                        options: availableQualities,
                        forced: true,
                        onChange: e => updateQuality(e)
                    };
                    player = new Plyr(video, defaultOptions);
                    addPlayerEventListeners(player, _self);
                });

                hls.attachMedia(video);
                window.hls = hls;
            } else {
                video.src = this.playerSource;
                video.type = 'video/mp4';
                player = new Plyr(video, defaultOptions);
                addPlayerEventListeners(player, _self);
            }

            function addPlayerEventListeners(player, _self) {
                // Custom button click event
                const customButton = document.createElement('button');
                customButton.innerHTML = '<i class="fas fa-expand"></i>';
                // Add a class to the custom button
                customButton.classList.add('custom-button-class');

                customButton.addEventListener('click', () => {
                    _self.toggleElementFullscreen();
                });
                // Append the custom button to the Plyr control bar
                const controlBar = player.elements.controls;
                controlBar.appendChild(customButton);

                player.on('ready', () => {
                    const progress = _self.getLastplay();
                    let currentTime = '';
                    if (progress.length > 0) {
                        currentTime = progress[0].lastplay || 0;
                    }
                    let isFirstPlay = true;

                    if (skip === "no") {
                        const progress = document.querySelector('.plyr__progress');
                        progress.classList.add('pointer-events-none');
                        progress.classList.add('opacity-30');
                    }

                    localStorage.setItem('realtime', 0);

                    player.on('play', () => {
                        _self.startIdle();
                        if (isFirstPlay) {
                            player.currentTime = currentTime;
                            isFirstPlay = false;
                        }
                    });
                    player.on('pause', () => {
                        _self.pauseIdle();
                        _self.showTimer();
                        _self.callChildFunction();
                        pausePlayer();
                    });
                    player.on('ended', () => {
                        _self.stopTimer();
                        _self.resetIdle();
                        _self.callChildFunction();
                    });
                    player.on('progress', () => {

                        const currentTime = player.currentTime;
                        _self.updateTimer(currentTime);
                    });
                    player.on('timeupdate', () => {
                        const percentagePlayed = (player.currentTime / player.duration) * 100;
                        //console.log(percentagePlayed);
                        if (percentagePlayed > 95) {
                            //this.stopVideo(); // Call the stop function when over 80%
                            if(!_self.stopTrigger) {
                                _self.stopTrigger = true,
                                _self.stopTimer();
                            }
                            //console.log("percentagePlayed",percentagePlayed);
                        }

                        _self.processIdle();
                        const currentTime = player.currentTime;
                        _self.getTimer(currentTime);
                    });
                    // Listen for Plyr full-screen events
                    player.on('enterfullscreen', () => {
                        debug.log("enterfullscreen");
                    });

                    player.on('exitfullscreen', () => {
                        debug.log("exitfullscreen");
                    });
                });

                // Define a function to pause the player
                function pausePlayer() {
                    if (player && typeof player.pause === 'function') {
                        player.pause();
                    }
                }
            }

            function updateQuality(newQuality) {
                window.hls.levels.forEach((level, levelIndex) => {
                    if (level.height === newQuality) {
                        window.hls.currentLevel = levelIndex;
                    }
                });
            }
        },
        getTimer: function(currentTime) {
            let realtime = localStorage.getItem('realtime') || 0;
            realtime = parseInt(realtime) + 1;
            localStorage.setItem('realtime', realtime);

            if (realtime % 60 === 0) {
                console.log("Update Progress");
                localStorage.setItem('realtime', 0);
                this.progressPlayer('seek', 5, currentTime);
                //this.callChildAnalytics();
            }
        },
        updateTimer: function() {},
        stopTimer: function() {
            this.progressComplete();
        },
        getLastplay: function() {
            return this.progress;
        },
        showTimer: () => {},
        getVideoUrl(deviceType) {
            return this.player.video[deviceType];
        },
        progressPlayer: async function(payload, timer = 0, currentTime = 0) {
            try {
                const { pid, cid } = this.$route.params;
                const { userID } = this.session;

                const progressRes = await Request.POST('progress/query', {
                    method: "find",
                    args: [{ $and: [{ playerID: pid, courseID: cid, userID: userID }] }],
                }, this.configs.key);
                if (progressRes.status !== 200) {
                    throw new Error(`Failed to fetch player data from API`);
                }
                const progress = progressRes.data;

                if (progressRes.status === 200) {
                    if (progress.length > 0) {
                        if (currentTime !== 0) {
                            let progressData = {
                                review: progress[0].review,
                                progress: progress[0].progress,
                            };

                            if (progress[0].status === "complete") {
                                progressData.review = progress[0].review + timer;
                            } else if (progress[0].status === "processing" || progress[0].status === "pending") {
                                progressData.progress = progress[0].progress + timer;
                            }

                            const updateData = progress[0].status === "complete" ?
                                { review: progressData.review } :
                                { progress: progressData.progress };

                            const status = progress[0].status === "complete" ? "complete" : "processing";

                            const updatedProgressRes = await Request.PUT(`progress/${progress[0]._id}`, {
                                data: {
                                    ...updateData,
                                    lastplay: currentTime,
                                    status,
                                },
                            }, this.configs.key);
                            if (updatedProgressRes.status !== 200) {
                                throw new Error(`Failed to fetch player data from API`);
                            }
                            const updatedProgress = updatedProgressRes.data

                            if (updatedProgressRes.status === 200) {
                                this.progress = updatedProgress;
                            }
                        }
                        this.progress = progress;
                    } else {
                        const newProgressRes = await Request.POST('progress', {
                            data: { userID, courseID: cid, playerID: pid, progress: 0, lastplay: 0, status: 'pending' },
                            options: {},
                        }, this.configs.key);
                        if (progressRes.status !== 200) {
                            throw new Error(`Failed to fetch player data from API`);
                        }
                        if (newProgressRes.status === 200) {
                            this.progress = newProgressRes.data;
                        }
                    }
                }
                await this.getData();
            } catch (error) {
                //debug.log(error);
            }
        },
        progressComplete: async function() {
            try {
                const { pid, cid } = this.$route.params;
                const { userID } = this.session;

                const progressRes = await Request.POST('progress/query', {
                    method: "find",
                    args: [{ $and: [{ playerID: pid, courseID: cid, userID }] }],
                }, this.configs.key);
                if (progressRes.status !== 200) {
                    throw new Error(`Failed to fetch player data from API`);
                }

                const progress = progressRes.data;

                if (progressRes.status === 200) {

                    if (progress.length > 0) {

                        const updatedProgressRes = await Request.PUT(`progress/${progress[0]._id}`, {
                            data: {
                                lastplay: 0,
                                status: 'complete'
                            },
                        }, this.configs.key);
                        if (updatedProgressRes.status !== 200) {
                            throw new Error(`Failed to fetch player data from API`);
                        }

                        const updatedProgress = updatedProgressRes.data;

                        if (updatedProgressRes.status === 200) {
                            this.progress = updatedProgress;
                            await this.getData();
                        }
                    } else {
                        //("No Progress Recorrd Can't Complete");
                    }
                }
            } catch (error) {
                //debug.log(error);
            }
        },
        async getData() {
            try {
                this.loading_sources = false;
                const responseHost = await Request.GET(`course/${this.dataItem}`, this.configs.key);

                if (responseHost.status === 200) {
                    this.lesson = responseHost.data;
                    this.lessonLoaded = true; // Mark lesson as loaded
                    // Make Default Player
                    const playerID = this.$route.params.pid;
                    const responsePlayer = await Request.GET(`player/${playerID}`, this.configs.key);

                    if (responsePlayer.status === 200) {
                        this.player = responsePlayer.data;
                        let videoUrl = "";
                        if (this.player.type === "demand") {
                            videoUrl = this.player.video[this.deviceType];
                        } else if (this.player.type === "streaming") {
                            videoUrl = this.player.video.streaming;
                        } else if (this.player.type === "youtube") {
                            videoUrl = this.player.video.youtube;
                        } else if (this.player.type === "live") {
                            videoUrl = this.player.video.live;
                        }
                        this.playerSource   = videoUrl;
                        this.playerPoster   = "https://vz-28af3134-886.b-cdn.net/24b5e108-1c7f-438d-8fde-8c49fa43a9c0/thumbnail.jpg";
                        this.playerLogo     = this.configs.siteLogo;
                        // Set Page Title
                        this.$setPageTitle(this.player.name + " / หลักสูตร " + this.lesson.name);
                    }
                }
            } catch (error) {
                //debug.log(error);
            }
        }
    },
    async mounted() {
        try {
            this.getUserIP();
            await this.getData();
            await this.progressPlayer("firstrun");
            this.videoStreaming();
        } catch (error) {
            //debug.log(Error);
        }
    },
    setup() {},
    watch: {
        '$route.params.cid': {
            deep: true,
            immediate: true,
            handler() {
                //debug.log("watch");
            }
        }
    },
    computed: {
        randomPopups() {
            return Math.floor(Math.random() * 5) + 1; // Generates a random number between 1 and 5
        },
        computedTotalPlayingTime() {
            // Check if player.duration is available before using it
            if (this.player && this.player.duration) {
                // Assuming convertToMilliseconds is a method in your component
                return this.convertToMilliseconds(this.player.duration);
            } else {
                // Return a default value or handle the case when player.duration is not available
                return 0; // Default value
            }
        },
        currentDateTime() {
            const currentDate = new Date();
            return currentDate.toLocaleString("en-US", { timeZone: "GMT" });
        },
    }
};
</script>

<template>

    <div class="bg-gray-100">
        <div class="hidden sm:block mx-auto max-w-2xl px-4 pt-3 pb-4 sm:px-18 sm:pt-3 sm:pb-4 lg:grid lg:max-w-7xl lg:grid-cols-2 lg:gap-x-4">
            <div class="lg:flex lg:items-center lg:justify-between">
                <div class="min-w-0 flex-1">
                    <nav class="flex" aria-label="Breadcrumb">
                        <ol role="list" class="flex items-center space-x-4">
                            <li>
                                <div>
                                    <router-link :to="'/'" class="text-gray-400 hover:text-gray-500">
                                        <svg class="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                  <path fill-rule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clip-rule="evenodd" />
                                </svg>
                                        <span class="sr-only">Home</span>
                                    </router-link>
                                </div>
                            </li>
    
                            <template v-if="this.lesson.standalone">
                                <li>
                                  <div class="flex items-center">
                                    <svg class="h-5 w-5 flex-shrink-0 text-gray-300" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                                      <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                                    </svg>
                                    <router-link :to="'/user/profile'" class="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">หน้าหลัก</router-link>
                                  </div>
                                </li>
                              </template>
                              <template v-else>
                                <li>
                                  <div class="flex items-center">
                                    <svg class="h-5 w-5 flex-shrink-0 text-gray-300" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                                      <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                                    </svg>
                                    <router-link :to="session.mode === 'bypass' ? '/user/employee' : '/lesson/home'" class="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">หลักสูตร</router-link>
                                  </div>
                                </li>
                            </template>
    
                            <li>
                                <div class="flex items-center">
                                    <svg class="h-5 w-5 flex-shrink-0 text-gray-300" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                              <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                            </svg>
                                    <router-link :to="'/lesson/detail/' + lesson._id" class="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700 max-w-xs truncate min-w-xs">{{this.lesson.name}}</router-link>
                                </div>
                            </li>
                            <li>
                                <div class="flex items-center">
                                    <svg class="h-5 w-5 flex-shrink-0 text-gray-300" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                              <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                            </svg>
                                    <span class="ml-4 text-sm font-bold text-gray-600 hover:text-gray-700  max-w-xs truncate min-w-xs">{{this.player.name}}</span>
                                </div>
                            </li>
                        </ol>
                    </nav>
                </div>
            </div>
        </div>
        
        <div class="bg-gray-800">
            <div class="mx-auto pt-8 pb-5 max-w-2xl sm:px-2 sm:pt-8 sm:pb-8 lg:max-w-7xl lg:px-8">
                <section aria-labelledby="details-heading" class="mb-5">
                    <div class="flex flex-col items-center text-center">
                        <router-link :to="'/lesson/detail/' + lesson._id">
                            <h2 id="details-heading" class="text-2xl font-bold tracking-tight text-white sm:text-2xl">{{this.lesson.name}}</h2>
                        </router-link>
                        <p class="mt-3 max-w-3xl text-lg text-white">{{this.player.name}}</p>
                    </div>
                </section>

                <template v-if="this.player.type==='live'">
                    <LiveStreaming
                    :email="session.user.email"
                    :nickname="`${session.user.firstname} ${session.user.lastname}`"
                    :licenseKey="playerSource"
                    :lesson="lesson._id"
                    :title="`${player.name}`"
                    />
                </template>

                <template v-else>
                    <figure class="fullscreen-figure" :class="{ fullscreen: isFullscreen }" style="user-select: none;" draggable="false">
                        <div class="relative flex items-center justify-center w-full">
                            <div class="absolute text-white z-50 p-1 left-5 top-2">
                                <img :src="playerLogo" alt="" class="w-24 lg:w-36 xs:w-10 sm:w-10">
                            </div>
                            <div class="absolute text-white z-50 p-1" style="text-shadow: rgba(0, 0, 0, 0.8) 1px 1px 3px; opacity: 0.6; top: 50%; left: 50%; transform: translate(-50%, -50%);">
                                <span class="font-bold">
                        Licensed to : </span> <br/> {{ session.user.firstname + " " + session.user.lastname}} ({{ userIp }}) <br/> {{ currentDateTime }}
                            </div>
                            <video ref="videoStreaming" controls crossorigin playsinline class="w-full"><source :src="videoSource"/></video>
                        </div>
                    </figure>
        
                    <idle ref="idleComponent" class="mt-3" v-if="lessonLoaded" :Popups="Number(this.lesson.idle_popup)" :timeout="Number(lesson.idle_timeout)" :debug="lesson.idle_debug" :status="lesson.idle === 'yes' ? true : false" :playingTime="computedTotalPlayingTime"
                        @idle-action="handleIdleFunction" @idle-event="handleEventAdded" @idle-status="handleProgressStatusUpdated" />

                </template>
    
                <!-- Display events received from idle.vue -->
                <!-- <div v-for="(event, index) in receivedEvents" :key="index">
                <p>{{ event.date }}: {{ event.message }}</p>
              </div> -->
    
                <!-- Display progressStatus received from idle.vue -->
                <!-- <p>Progress Status from idle.vue: {{ receivedProgressStatus }}</p>
              <p>Popup Status from idle.vue: {{ receivedPopupStatus }}</p>
              <p>{{ player.duration }}</p> -->
            </div>
        </div>
    
        <div class="bg-gray-100 py-6">
            <div class="mx-auto max-w-7xl sm:px-6 lg:px-8">
                <section aria-labelledby="details-heading" class="mb-5">
                    <div class="flex flex-col items-center text-center">
                        <h2 id="details-heading" class="text-2xl font-bold tracking-tight text-gray-900 sm:text-2xl">รายละเอียดเนื้อหา</h2>
                        <p class="mt-3 max-w-3xl text-lg text-gray-600">รายละเอียดเนื้อหาของหลักสูตรนี้ คุณต้องทำการเข้าเรียนตามลำดับแต่ละบทเรียน</p>
                    </div>
                </section>
                <div class="overflow-hidden bg-white shadow sm:rounded-md">
    
                    <Playlist ref="childRef" :dataItem="this.dataItem" :courseData="this.lesson" :playerItem="this.playerItem" :playOption="this.lesson.display" :debug="false"></Playlist>
    
                </div>
            </div>
        </div>
    </div>
</template>

<style>
.playing-icon {
    animation: fade-in-out 1s infinite;
}

@keyframes fade-in-out {
    0% {
        opacity: 0;
        transform: scale(0.8);
    }
    50% {
        opacity: 1;
        transform: scale(1);
    }
    100% {
        opacity: 0;
        transform: scale(0.8);
    }
}

a.block {
    position: relative;
}

a.block::before {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 20px;
    height: 20px;
}

a.block::before.not-available {
    content: "Not Available";
    font-size: 14px;
    text-align: center;
    background-color: #ccc;
    color: #fff;
    padding: 4px;
    border-radius: 4px;
}

a.block::before.play {
    content: "►";
    font-size: 20px;
    color: #000;
}

/* Style for the custom button */

.plyr__controls .custom-button {
    background-color: #007bff;
    /* Change the background color as needed */
    color: #fff;
    /* Change the text color as needed */
    border: none;
    padding: 8px 12px;
    cursor: pointer;
    border-radius: 4px;
}

.custom-button-class {
    padding: 5px 8px 0px 8px;
    font-size: 19px;
    border-radius: 3px;
}

.custom-button-class:hover {
    background: #00b3ff;
}

.fullscreen-figure {
    transition: all 0.3s ease;
}

/* You can optionally add some other styles for the fullscreen state */

.fullscreen {
    width: 100%;
    position: fixed;
    top: 0;
    left: 0;
    background-color: white;
    z-index: 9999;
}

.fullscreen .plyr {
    height: 100vh;
}

.plyr--video {
    width: 100%;
    border-radius: 0px;
    border: 1px solid #292929;
    box-shadow: 0 1px 5px rgba(0, 0, 0, 0.4);
}
</style>