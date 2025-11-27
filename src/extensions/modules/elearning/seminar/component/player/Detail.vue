<script>
import {player} from "@/master/type";
// Component
import feather from 'feather-icons';
import Loader from '@/interface/template/Loader.vue';

import FileBrowser from '@/interface/modal/FileBrowser.vue';
import SetContentSource   from '@/interface/modal/SetContentSource.vue';
import storageManager from '@/plugins/storage';

import Hls from "hls.js";
import Plyr from "plyr";

import moment from 'moment';
moment().format();

export default {
    data() {
      return {
        login: storageManager.get('session','login'),
        courseData: [],
        playerData: [],
        examData: [],
        schoolAdmin: [],
        accessSession: [],
        playerType:[],
        dataItem: this.$route.params.id,
        accessToken: storageManager.get('session','token'),
        selectFileCallback:'',
        cover:'',
        type:'',
        typeName:'',
        
        loading_sources: true,
        selectSession: false,
        FileBrowserOpen: false,
        CoverBrowserOpen: false,
        readMoreActivated: false,

        contentType:'',
        SetContentSourceModal:false,
        setContentTriggerObj:"",
        videoContent:'',

        parentID:'',
        longText:'',
        playerLogo:"",
        playerSource:"",
        playerPoster:"",
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
          settings: ["quality", "speed", "loop"]
        }
      }
    },
    components: {
    Loader,
    FileBrowser,
    SetContentSource
    },
    computed: {
      categoryData() {
        //console.log("categoryData",ls.get('categoryList'))
        const access         = storageManager.get('session','access')
        const categoryList = access.category
        return categoryList;
      }
    },
    methods: {
      objectFindByKey(array, key, value) {
        for (var i = 0; i < array.length; i++) {
          if (array[i][key] === value) {
            return array[i];
          }
        }
        return null;
      },
      dateTime(value) {
        return moment(value).format("DD/MM/YYYY hh:mm:ss");
      },
      activateReadMore(){
        this.readMoreActivated = true;
      },
      unActivateReadMore(){
        this.readMoreActivated = false;
      },
      async getData() {
        if(this.login) {
        try {
          //console.log("Auth : Course List : ",ls.get('auth'));
          this.loading_sources  = false;
          const resAPI          = await fetch("https://asia-southeast2-elearning-6871c.cloudfunctions.net/players/" + this.dataItem, {
            method: 'GET',
            headers: {'Content-Type': 'application/json','Authorization': 'Bearer ' + this.accessToken},
          });

          const RestReturn   = await resAPI.json();
          console.log(RestReturn);

          if(RestReturn.success) {
            this.playerData       = RestReturn.data;
            this.parentID         = RestReturn.data.courseId;
            this.type             = RestReturn.data.type
            this.cover            = RestReturn.data.cover
          
            const courseReturn    = await this.getCourseData(this.parentID)
            console.log("courseReturn",courseReturn);
            if(courseReturn.success) {
              // Get EP Source
              if(this.playerData.video===undefined) {
                this.playerSource     = "";
                this.playerPoster     = ""
                this.playerLogo       = "https://fti.academy/theme/skin/vodi/assets/img/logo/color-logo.png"
              } else {
                this.playerSource     = this.playerData.video.desktop;
                this.playerPoster     = "https://vz-28af3134-886.b-cdn.net/24b5e108-1c7f-438d-8fde-8c49fa43a9c0/thumbnail.jpg"
                this.playerLogo       = "https://fti.academy/theme/skin/vodi/assets/img/logo/color-logo.png"

                if(RestReturn.data.type==="demand") {
                  this.videoContent = this.playerData.video.desktop;
                } else if(RestReturn.data.type==="streaming") {
                  this.videoContent = this.playerData.video.streaming;
                } else if(RestReturn.data.type==="youtube") {
                  this.videoContent = this.playerData.video.youtube;
                }
            }
              
              this.courseData       = courseReturn.data;
              this.loading_sources  = true;
              this.videoStreaming();
            }
          }
        } catch (error) {
          console.log(error)
        }
        }
      },
      async getCourseData(id) {
        if(this.login) {
        try {
          //console.log("Auth : Course List : ",ls.get('auth'));
          this.loading_sources  = false;
          const resAPI          = await fetch("https://asia-southeast2-elearning-6871c.cloudfunctions.net/mcourses/" + id, {
            method: 'GET',
            headers: {'Content-Type': 'application/json','Authorization': 'Bearer ' + this.accessToken},
          });

          return await resAPI.json();
        } catch (error) {
          console.log(error)
        }
        }
      },
      OpenFileBrowser() {
        this.FileBrowserOpen = true;
      },
      changeFileTrigger(payload) {
        this.FileBrowserOpen = payload;
      },
      OpenCoverBrowser() {
        this.CoverBrowserOpen = true;
      },
      changeCoverTrigger(payload) {
        this.CoverBrowserOpen = payload;
      },
      selectFileTrigger(payload) {
      console.log("callback",payload.callback);
        if(payload!=undefined) {
          this.selectFileCallback = payload;
          // Set Return Function form select file popup
          console.log("selectFileTrigger",payload)
          if(payload.callback==="video"){
            this.updataVideo(payload.file);
          } else if(payload.callback==="cover") {
            console.log("change cover");
            this.updataCover(payload.file);
          }
        }
      },
      async updataVideo(file) {
          if(this.login) {
              try {
                const callApi       = await fetch("https://asia-southeast2-elearning-6871c.cloudfunctions.net/players/" + this.dataItem, {
                  method: 'PUT',
                  headers: {'Content-Type': 'application/json','Authorization': 'Bearer ' + this.accessToken},
                  body: JSON.stringify({
                    "video":{
                      "desktop":file,
                      "mobile":file
                    },
                  })
                });
                const finalRes   = await callApi.json();

                if(finalRes.success) {
                  window.location.reload();
                }
              } catch (error) {
              console.log(error)
              }
          }
      },
      async updataCover(file) {
          if(this.login) {
              try {
                const callApi       = await fetch("https://asia-southeast2-elearning-6871c.cloudfunctions.net/players/" + this.dataItem, {
                  method: 'PUT',
                  headers: {'Content-Type': 'application/json','Authorization': 'Bearer ' + this.accessToken},
                  body: JSON.stringify({
                    "cover":file,
                  })
                });
                const finalRes   = await callApi.json();

                if(finalRes.success) {
                  this.cover = file
                }
              } catch (error) {
              console.log(error)
              }
          }
      },
      openSetContentSource(item,type) {
        this.setContentTriggerObj = item;
        this.contentType = type;
        this.SetContentSourceModal = true;
      },
      SetContentTrigger(payload) {
        this.SetContentSourceModal = payload;
      },
      async SetContentSource(payload) {
        console.log("payload",payload);
        if(this.login) {
            try {
              if(this.contentType==="streaming") { 
                const callApi       = await fetch("https://asia-southeast2-elearning-6871c.cloudfunctions.net/players/" + this.dataItem, {
                  method: 'PUT',
                  headers: {'Content-Type': 'application/json','Authorization': 'Bearer ' + this.accessToken},
                  body: JSON.stringify({
                    "video":{
                      "streaming":payload.contentURL,
                    },
                  })
                });
                const finalRes   = await callApi.json();
                console.log("SetContentSource");
                if(finalRes.success) {
                  this.SetContentSourceModal = false;
                  window.location.reload();
                }
              } else if(this.contentType==="youtube") { 
                const callApi       = await fetch("https://asia-southeast2-elearning-6871c.cloudfunctions.net/players/" + this.dataItem, {
                  method: 'PUT',
                  headers: {'Content-Type': 'application/json','Authorization': 'Bearer ' + this.accessToken},
                  body: JSON.stringify({
                    "video":{
                      "youtube":payload.contentURL,
                    },
                  })
                });
                const finalRes   = await callApi.json();
                console.log("SetContentSource");
                if(finalRes.success) {
                  this.SetContentSourceModal = false;
                  window.location.reload();
                }
              }
            } catch (error) {
            console.log(error)
            }
        }
      },
      async deletePlayer(id) {
        if(this.login) {
          try {
            console.log("id",id)
            const resAPI = await fetch("https://asia-southeast2-elearning-6871c.cloudfunctions.net/players/" + id, {
              method: 'DELETE',
              headers: {'Content-Type': 'application/json','Authorization': 'Bearer ' + this.accessToken},
            });
            const finalRes   = await resAPI.json();

            if(finalRes.success) {
              console.log(finalRes);
              window.location.href = "/lesson/detail/"  + this.parentID
            }
          } catch (error) {
            console.log(error)
          }
        }
      },
      videoStreaming() {
        const _self     = this
        var url         = _self.videoContent;
        const video     = this.$refs.videoStreaming;

        let extension   = url.split(".").pop();
        console.log("tage url", url);
        console.log("tage video", video);
        console.log("extension video", extension);
        const defaultOptions = {};

        if(extension==="mp4") {
          const player = new Plyr(video, defaultOptions);
          player.on('timeupdate', (event) => {
            const instance = event.detail.plyr;
            console.log(instance);
          });
        }
        else if(extension==="m3u8") {
          if (Hls.isSupported()) {
            const hls = new Hls();
            hls.loadSource(url);
            hls.on(Hls.Events.MANIFEST_PARSED, function() {
              const availableQualities = hls.levels.map(l => l.height);
              defaultOptions.quality = {
                default: availableQualities[0],
                options: availableQualities,
                forced: true,
                onChange: e => updateQuality(e)
              };
              const player = new Plyr(video, defaultOptions);
              //------ ini Player Function
              player.on("ready", () => {
              });

              player.on('play', () => {
                console.log("Play");
              });

              player.on('pause', () => {
                //_self.showTimer()
              });

              player.on('timeupdate', () => {
                //_self.getTimer()
              });

              player.on('ended', () => {
                //_self.stopTimer()
              });

              player.on('progress', () => {
              // _self.updateTimer()
              });
              //------ ini Player Function=
            });
            hls.attachMedia(video);
            window.hls = hls;
          } else {
            const player = new Plyr(video, defaultOptions);
            player.on('timeupdate', (event) => {
              const instance = event.detail.plyr;
              console.log(instance);
            });
          }
        }
      
        function updateQuality(newQuality) {
          window.hls.levels.forEach((level, levelIndex) => {
            if (level.height === newQuality) {
              console.log("Found quality match with " + newQuality);
              window.hls.currentLevel = levelIndex;
            }
          });
        }
      },
      changeSession() {
        this.selectSession = true;
      },
      updated() {
        feather.replace();
      },
      async removeVideo() {
          if(this.login) {
              try {
                const callApi       = await fetch("https://asia-southeast2-elearning-6871c.cloudfunctions.net/players/" + this.dataItem, {
                  method: 'PUT',
                  headers: {'Content-Type': 'application/json','Authorization': 'Bearer ' + this.accessToken},
                  body: JSON.stringify({
                    "video":{},
                  })
                });
                const finalRes   = await callApi.json();

                if(finalRes.success) {
                  window.location.reload();
                }
              } catch (error) {
              console.log(error)
              }
          }
      },
      async removeCover() {
          if(this.login) {
              try {
                const callApi       = await fetch("https://asia-southeast2-elearning-6871c.cloudfunctions.net/players/" + this.dataItem, {
                  method: 'PUT',
                  headers: {'Content-Type': 'application/json','Authorization': 'Bearer ' + this.accessToken},
                  body: JSON.stringify({
                    "cover":"",
                  })
                });
                const finalRes   = await callApi.json();

                if(finalRes.success) {
                  this.cover = ""
                }
              } catch (error) {
              console.log(error)
              }
          }
      },
    },
    async mounted () {
      try {
        await this.getData();
        const access = storageManager.get('session','access')
this.accessSession  =  access.current;
        this.videoStreaming();
        this.playerType = player
        this.typeName = this.objectFindByKey(this.playerType, 'code', this.type).name
      } catch (error) {
        console.log(Error);
      }
    },
    setup() {
      //console.log("Setup");
    },
};
</script>

<template>

  <FileBrowser 
  v-if="FileBrowserOpen" 
  :isWindowsOpen="true" 
  :allowFileType="['mp4']" 
  :callbackFunction="'video'" 
  @file-browser-trigger="changeFileTrigger" 
  @file-browser-callback="selectFileTrigger" />

  <FileBrowser 
  v-if="CoverBrowserOpen" 
  :isWindowsOpen="true" 
  :allowFileType="['jpg','png']" 
  :callbackFunction="'cover'" 
  @file-browser-trigger="changeCoverTrigger" 
  @file-browser-callback="selectFileTrigger" />

  <SetContentSource v-if="SetContentSourceModal" :isWindowsOpen="true" :setContentTriggerObj="this.setContentTriggerObj" :contentType="this.contentType" :contentOriginal="this.videoContent" @set-content-trigger="SetContentTrigger" @set-content-event="SetContentSource"/>

	<div v-if="!loading_sources" class="text-center"><Loader/></div>
    <div v-if="loading_sources">
    
    <!-- Page header -->
    <div class="mx-auto max-w-3xl px-4 mt-5 sm:px-6 md:flex md:items-center md:justify-between md:space-x-5 lg:max-w-7xl lg:px-8">
      
      <div class="flex items-center space-x-5">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">{{ courseData.name }}</h1>
          <a v-for="(categoryItem) in courseData.category" :key="categoryItem.id" href="#" class="text-xs font-medium bg-indigo-600 pl-2 pr-2 pt-1 pb-1 mr-1 rounded text-white">
            {{this.objectFindByKey(this.categoryData, 'slug', categoryItem).name}}
          </a>  
        </div>
      </div>
      <div class="justify-stretch mt-6 flex flex-col-reverse space-y-4 space-y-reverse sm:flex-row-reverse sm:justify-end sm:space-y-0 sm:space-x-3 sm:space-x-reverse md:mt-0 md:flex-row md:space-x-3">
        
        <button 
        @click="$router.push('/lesson/detail/'+this.parentID)"
        type="button" 
        class="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-100">
        <font-awesome-icon :icon="['fas','chevron-left']" class="text-black text-[12px] mr-2"/> ย้อนกลับ
        </button>

      </div>
    </div>

    <div class="mx-auto mt-8 grid max-w-3xl grid-cols-1 gap-6 sm:px-6 lg:max-w-7xl lg:grid-flow-col-dense lg:grid-cols-1">
      <div class="space-y-6 lg:col-span-2 lg:col-start-1">
        <!-- Comments-->
        <section aria-labelledby="notes-title">
          <div class="bg-white shadow sm:overflow-hidden sm:rounded-lg">
            <div class="divide-y divide-gray-200">
              <div class="px-4 py-5 sm:px-6 relative">
                <h2 id="notes-title" class="text-lg font-bold text-gray-900">บทเรียน : {{playerData.name}}</h2>
                <p class="text-sm font-medium text-gray-500">
                  ประเภท <a href="#" class="text-indigo-400">{{playerData.type || 'n/a'}}</a>  
                  <span class="font-medium text-gray-200">|</span> 
                  ความยาว <a href="#" class="text-indigo-400">{{playerData.duration || 'n/a'}}</a> นาที
                  <span class="font-medium text-gray-200">|</span> 
                  วิทยากร <a href="#" class="text-indigo-400">{{playerData.lecturer || 'n/a'}}</a>
                </p>
                <div class="absolute top-4 right-4 ml-3 inline-flex items-center ">
                <button 
                @click="$router.push('/lesson/player/edit/' + this.dataItem)"
                type="button" 
                class="mr-3 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-100">
                <font-awesome-icon :icon="['fas','edit']" class="text-black pr-3"/> แก้ไขข้อมูล 
                </button>
                <button 
                @click="deletePlayer(this.dataItem)"
                type="button" 
                class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-100">
                <font-awesome-icon :icon="['fas','trash']" class="text-black pr-3"/> ลบบทเรียน 
                </button>
                </div>
              </div>
              <div class="px-4 py-6 sm:px-6">
              <div v-html="playerData.description"></div>
              </div>
            </div>
            
          </div>
        </section>
      </div>

    </div>

    <div class="mx-auto mt-8 grid max-w-3xl grid-cols-1 gap-6 sm:px-6 lg:max-w-7xl lg:grid-flow-col-dense lg:grid-cols-2">
      <div class="space-y-6 lg:col-span-1 lg:col-start-1">

        <section aria-labelledby="notes-title">
          <div class="bg-white shadow sm:overflow-hidden sm:rounded-lg">
            <div class="divide-y divide-gray-200">
              <div class="px-4 py-5 sm:px-6 relative">
              <h2 id="notes-title" class="text-lg font-bold text-gray-900">เนื้อหาบทเรียน <small class="text-sm font-medium bg-indigo-600 pl-2 pr-2 pt-1 pb-1 rounded text-white">{{this.typeName}}</small></h2>
              
              <span class="absolute top-4 right-4 ">
                <button 
                @click="removeVideo"
                type="button" 
                class="ml-3 inline-flex items-center rounded-md ounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-100">
                <font-awesome-icon :icon="['fas','trash']" class="text-gray-400"/>
                </button>
                <button 
                v-if="this.type=='demand'"
                @click="OpenFileBrowser"
                type="button" 
                class="ml-3 inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                <font-awesome-icon :icon="['fas','cloud-upload']" class="text-gray-200 pr-3"/> เลือกวีดีโอ
                </button>

                <button 
                v-if="this.type=='streaming'"
                @click="openSetContentSource(this.videoContent,'streaming')"
                type="button" 
                class="ml-3 inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                <font-awesome-icon :icon="['fas','cloud-upload']" class="text-gray-200 pr-3"/> เลือกวีดีโอ
                </button>

                <button 
                v-if="this.type=='youtube'"
                @click="openSetContentSource(this.videoContent,'youtube')"
                type="button" 
                class="aml-3 inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                <font-awesome-icon :icon="['fas','cloud-upload']" class="text-gray-200 pr-3"/> เลือกวีดีโอ
                </button>
              </span>

              </div>
              <div class="px-4 py-6 sm:px-6">
                <figure v-if="(playerData.video!=undefined)">
                  
                  <div class="relative" v-if="this.type=='streaming' || this.type=='demand'">
                      <div class="absolute text-white z-10 p-1 left-5">
                        <img :src="playerLogo" alt="" class="w-24 lg:w-36 xs:w-10 sm:w-10">
                      </div>
                      <video ref="videoStreaming" controls crossorigin playsinline class="w-full"><source :src="this.videoContent"></video>
                  </div>

                  <div class="w-full" v-if="this.type=='youtube'" v-html="this.videoContent">
                  </div>

                </figure>

                <button v-if="(playerData.video===undefined)"
                @click="OpenFileBrowser" 
                type="button"
                class="relative bg-cover block w-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                <div class="bg-white/80 p-3">
                  <font-awesome-icon :icon="['fas','cloud-upload']" class="mx-auto h-12 w-12 text-black"/>
                  <span class="mt-2 block text-sm font-medium text-black">เลือกวีดีโอ</span>
                </div>
                </button>
                
              </div>
            </div>
          </div>
        </section>

      </div>

      <div class="space-y-6 lg:col-span-1 lg:col-start-2">

        <section aria-labelledby="notes-title">
          <div class="bg-white shadow sm:overflow-hidden sm:rounded-lg">
            <div class="divide-y divide-gray-200">
              <div class="px-4 py-5 sm:px-6 relative">
              <h2 id="notes-title" class="text-lg font-bold text-gray-900">ภาพตัวอย่าง <small class="text-sm font-medium">(Thumbnail)</small></h2>
                <span class="absolute top-4 right-4 ">

                  <button 
                  @click="removeCover"
                  type="button" 
                  class="ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-100">
                  <font-awesome-icon :icon="['fas','trash']" class="text-gray-400"/>
                  </button>

                  <button 
                  @click="OpenCoverBrowser"
                  type="button" 
                  class="ml-3 inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                  <font-awesome-icon :icon="['fas','cloud-upload']" class="text-gray-200 pr-3"/> เลือกรูปหน้าปก
                  </button>
                  
                </span>
              </div>

              <div class="px-4 py-6 sm:px-6">
                <img :src="this.cover" class="">

                <button
                v-if="this.cover===undefined"
                @click="OpenCoverBrowser" 
                type="button"
                class="relative bg-cover block w-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                <div class="bg-white/80 p-3">
                  <font-awesome-icon :icon="['fas','cloud-upload']" class="mx-auto h-12 w-12 text-black"/>
                  <span class="mt-2 block text-sm font-medium text-black">เลือกรูปหน้าปก</span>
                </div>
                </button>
                
              </div>
            </div>
          </div>
        </section>
      </div>

    </div>
  </div>
</template>