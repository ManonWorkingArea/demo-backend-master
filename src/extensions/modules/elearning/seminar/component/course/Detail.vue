<script>
import {mode, display, kind, player, exam} from "@/master/type";
import { ref } from 'vue';
// Component
import feather from 'feather-icons';
import Loader from '@/interface/template/Loader.vue';
import Toggle from '@vueform/toggle'
import FileBrowser from '@/interface/modal/FileBrowser.vue';
import { VueDraggableNext } from 'vue-draggable-next'
import storageManager from '@/plugins/storage';
import { Tooltip } from '@programic/vue3-tooltip';

import moment from 'moment';
moment().format();

import CourseIcon       from '@/interface/element/CourseIcon.vue';
import CourseStat       from '@/interface/element/CourseStat.vue';

const message = [
  'vue.js 3.0',
  'vue.draggable',
  'draggable',
  'component',
  'for',
  'based',
  'on',
  'Sortablejs',
]
export default {
    data() {
      const session = storageManager.get('session')
      return {
        contentType:[],
        courseData: [],
        playerData: [],
        playerCount:'0',
        examData: [],

        documentData: [],
        documentCount:'0',

        playerParent:[],
        playerFolder:[],
        playerChild:[],

        playerParentCount:'',
        playerChildCount:'',

        examCount:'0',
        schoolAdmin: [],
        subArray:[],
        dataItem: this.$route.params.id,
        accessToken: session.token,
        login: session.login,
        selectCourseCover:'',
        loading_sources: true,
        FileBrowserOpen: false,
        FileBrowserDocOpen: false,
        readMoreActivated: false,
        dragging: false,
        cover:'',
        type:'',
        ref:'',
        display:'',
        mode:'',
        modeName:'',
        displayName:'',
        kindName:'',
        principles:'',
        objective:'',
        target:'',
        structure:'',
        enabled: true,
        order: 6,
        status:'',
        endpoint:"",
        valuePoint:"",
        playerRef:"",
        examRef:"",
        MasterText:session.MasterText,
        master: session.master,
        list: message.map((name, index) => {
          return { name, order: index + 1 }
        }),
      }
    },
    components: {
      Loader,
      CourseIcon,
      CourseStat,
      Toggle,
      Tooltip,
      draggable: VueDraggableNext,
      FileBrowser
    },
    computed: {
      playerType() {
        console.log("PlayerType",player);
        return player;
      },
      examType() {
        console.log("examType",exam);
        return exam;
      },
      categoryData() {
        //console.log("categoryData",ls.get('categoryList'))
        const session         = storageManager.get('session')
        const categoryList    = session.category;
        return categoryList;
      },
      draggingInfo() {
        console.log("Drag");
        return this.dragging ? "under drag" : "";
      },
      dragOptions() {
        return {
          animation: 1,
          group: 'description',
          disabled: false,
          ghostClass: 'ghost',
        }
      },
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
      log(event) {
        console.log(event)
        for (var key of Object.keys(this.playerParent)) {
          console.log(key + " -> " + this.playerParent[key].id)
          //this.values[this.answerList[key].id] = this.answerList[key].detail
          this.reOrderPlayer(this.playerParent[key].id,('0' + key).slice(-2));
        }
      },
      log_sub(event) {
        console.log(event)
        for (var key of Object.keys(this.playerFolder[event])) {
          console.log(key + " -> " + this.playerFolder[event][key].id)
          //this.values[this.answerList[key].id] = this.answerList[key].detail
          this.reOrderPlayer(this.playerFolder[event][key].id,('0' + key).slice(-2));
        }
      },
      sort() {
        this.list = this.list.sort((a, b) => a.order - b.order)
      },
      dateTime(value) {
        return moment(value).format("DD/MM/YYYY hh:mm:ss");
      },
      async getData() {
        if(this.login) {
        try {
          //console.log("Auth : Course List : ",ls.get('auth'));
          this.loading_sources  = false;
          
          const resAPI          = await fetch("https://asia-southeast2-elearning-6871c.cloudfunctions.net/"+this.endpoint+"/" + this.dataItem, {
            method: 'GET',
            headers: {'Content-Type': 'application/json','Authorization': 'Bearer ' + this.accessToken},
          });

          const RestReturn   = await resAPI.json();
          console.log(RestReturn);

          if(RestReturn.success) {
            this.courseData     = RestReturn.data;

            this.principles   = this.courseData.principles;
            this.objective   = this.courseData.objective;
            this.target   = this.courseData.target;
            this.structure   = this.courseData.structure;

            this.cover          = RestReturn.data.cover
            this.mode           = RestReturn.data.mode
            this.display        = RestReturn.data.display
            this.type           = RestReturn.data.type
            this.ref            = RestReturn.data.ref
            this.playerRef      = RestReturn.data.playerRef ?? this.ref
            this.examRef        = RestReturn.data.examRef ?? this.ref
            this.status         = RestReturn.data.status ?? true
  
            const childPlayerRes   = await this.getPlayerData()
            console.log("getPlayerData",childPlayerRes);

            const childDocumentRes   = await this.getDocumentData()
            console.log("getDocumentData",childDocumentRes);

            const childExamRes   = await this.getExamData()
            console.log("getExamData",childExamRes);

            if(childExamRes.success) {

              if(childPlayerRes.data!=undefined) {
                this.playerData      = childPlayerRes.data;
                this.playerData.sort(function(a,b){return a.order < b.order ? -1 : 1});
                this.playerCount     = this.playerData.length

                // Generrate Sub Item 
                childPlayerRes.data.forEach(element => {
                  if(element.type!="folder" && element.mode==="sub")
                  ref(this.playerChild.push(element));
                });

                // Generrate Sub Item 
                childPlayerRes.data.forEach(element => {
                  if(element.mode!="sub")
                  ref(this.playerParent.push(element));
                });

                this.playerParent.forEach(element => {
                  let key = element.id
                  this.playerFolder[key]=[];
                  this.playerChild.forEach(element2 => {
                    console.log("root",element2.root)
                    if(element2.root===element.id){
                      console.log(element2.root + " - " + element.id);
                      this.playerFolder[key].push(element2);
                    }
                  });
                });

                console.log("Folder",this.playerParent);
                console.log("Sub",this.playerChild);
                console.log("playerFolder",this.playerFolder);

                this.playerParent.sort(function(a,b){return a.order < b.order ? -1 : 1});
                this.playerChild.sort(function(a,b){return a.order < b.order ? -1 : 1});

                this.playerParentCount = this.playerParent.length
                this.playerChildCount = this.playerChild.length
              }else {
                this.playerCount        = "0";
                this.playerParentCount  = "0";
                this.playerChildCount   = "0";
              }

              if(childExamRes.data!=undefined) {
                this.examData         = childExamRes.data;
                this.examCount        = this.examData.length
              }

              if(childDocumentRes.data!=undefined) {
                this.documentData     = childDocumentRes.data;
                this.documentCount    = this.documentData.length
              }
            
              this.loading_sources  = true;
            }
          }
        } catch (error) {
          console.log(error)
        }
        }
      },
      async getPlayerData() {
        if(this.login) {
          try {
            if(this.master) {
              this.valuePoint = this.dataItem;
            } else {
              this.valuePoint = this.playerRef;
            }
            //console.log("Auth : Course List : ",ls.get('auth'));
            const resAPI          = await fetch("https://asia-southeast2-elearning-6871c.cloudfunctions.net/players/course/" + this.valuePoint, {
              method: 'GET',
              headers: {'Content-Type': 'application/json','Authorization': 'Bearer ' + this.accessToken},
            });
            return await resAPI.json();
          } catch (error) {
            console.log(error)
          }
        }
      },
      async getExamData() {
        if(this.login) {
          try {
            if(this.master) {
              this.valuePoint = this.dataItem;
            } else {
              this.valuePoint = this.examRef;
            }
            //console.log("Auth : Course List : ",ls.get('auth'));
            const resAPI          = await fetch("https://asia-southeast2-elearning-6871c.cloudfunctions.net/exams/course/" + this.valuePoint, {
              method: 'GET',
              headers: {'Content-Type': 'application/json','Authorization': 'Bearer ' + this.accessToken},
            });
            return await resAPI.json();
          } catch (error) {
            console.log(error)
          }
        }
      },
      async getDocumentData() {
        if(this.login) {
          try {
            if(this.master) {
              this.valuePoint = this.dataItem;
            } else {
              this.valuePoint = this.playerRef;
            }
            //console.log("Auth : Course List : ",ls.get('auth'));
            const resAPI  = await fetch("https://asia-southeast2-elearning-6871c.cloudfunctions.net/mcourses/documents/" + this.dataItem, {
              method: 'GET',
              headers: {'Content-Type': 'application/json','Authorization': 'Bearer ' + this.accessToken},
            });
            const RestReturn   = await resAPI.json();
            console.log(RestReturn);

            if(RestReturn.success) {
              if(RestReturn.data!=undefined) {
                this.documentData     = RestReturn.data;
                this.documentCount    = this.documentData.length
              }
              return RestReturn;
            }
            
          } catch (error) {
            console.log(error)
          }
        }
      },
      async getCategoryData() {
        if(this.login) {
          try {
            //console.log("Auth : Course List : ",ls.get('auth'));
            this.loading_sources = false;
            const resAPI = await fetch("https://asia-southeast2-elearning-6871c.cloudfunctions.net/catagories/",
            {
              method: 'GET',
              headers: {'Content-Type': 'application/json','Authorization': 'Bearer ' + this.accessToken},
            });
            const RestReturn   = await resAPI.json();
            console.log("Category",RestReturn);
            return RestReturn
          } catch (error) {
            console.log(error)
          }
        }
      },
      async deleteData(id) {
        if(this.login) {
          try {
            this.loading_sources = false;
            const resAPI          = await fetch("https://asia-southeast2-elearning-6871c.cloudfunctions.net/schools/removeAdmin/" + this.dataItem, {
              method: 'POST',
              headers: {'Content-Type': 'application/json','Authorization': 'Bearer ' + this.accessToken},
              body: JSON.stringify({
                userId: id,
              })
            });
            console.log(resAPI);
            this.loading_sources = true;
            await this.getData();
          } catch (error) {
            console.log(error)
          }
        }
      },
      changeFileTrigger(payload) {
        this.FileBrowserOpen = payload;
      },
      selectFileTrigger(payload) {
        console.log("selectFileTrigger");
        if(payload!=undefined) {
          this.selectCourseCover = payload;
          // Set Return Function form select file popup
          console.log("selectFileReturnFunction",payload.file)
          this.updataCover(payload.file);
        }
      },
      async updataCover(cover) {
          if(this.login) {
              try {
                const callApi       = await fetch("https://asia-southeast2-elearning-6871c.cloudfunctions.net/"+this.endpoint+"/" + this.dataItem, {
                  method: 'PUT',
                  headers: {'Content-Type': 'application/json','Authorization': 'Bearer ' + this.accessToken},
                  body: JSON.stringify({
                    "cover":cover,
                  })
                });
                const finalRes   = await callApi.json();

                if(finalRes.success) {
                  this.cover = cover
                  this.$swal({
                    toast: true,
                    position: 'bottom-end',
                    showConfirmButton: false,
                    timer: 3000,
                    icon: 'success',
                    title: 'แก้ไขรูปหน้าปก',
                    text: 'แก้ไขรูปหน้าปก สำเร็จแล้ว',
                  });
                }
              } catch (error) {
              console.log(error)
              }
          }
      },
      OpenFileDocumentBrowser()
      {
        this.FileBrowserDocOpen = true;
      },
      changeFileDocumentTrigger(payload) {
        this.FileBrowserDocOpen = payload;
      },
      selectFileDocumentTrigger(payload) {
        console.log("selectFileDocumentTrigger");
        if(payload!=undefined) {
          this.FileBrowserDocOpen = false;
          // Set Return Function form select file popup
          console.log("selectFileDocumentTrigger",payload.file)
          this.addDocument(payload.file);
        }
      },
      async addData() {
        if(this.login) {
            try {


                this.activeBlock = true
                const accessToken   = storageManager.get('session','token')
                const callApi   = await fetch("https://asia-southeast2-elearning-6871c.cloudfunctions.net/modes?limit=5000", {
                  method: 'GET',
                  headers: {'Content-Type': 'application/json','Authorization': 'Bearer ' + accessToken},
                });
                const finalRes   = await callApi.json();

                if(finalRes.success) {
                  console.log(finalRes);
                  this.activeBlock = false
                }        
              

              
            } catch (error) {
            console.log(error)
            }
        }
    },
      async addDocument(file) {
        if(this.login) {
          try {
            this.loading_sources = false;

            let filetype    = file.replace("/", '').substring(file.replace("/", '').lastIndexOf(".")+1);
            let filename    = file.substring(file.lastIndexOf('/'));

            console.log("filename",filename)
            const resAPI    = await fetch("https://asia-southeast2-elearning-6871c.cloudfunctions.net/mcourses/documents/" + this.dataItem, {
              method: 'POST',
              headers: {'Content-Type': 'application/json','Authorization': 'Bearer ' + this.accessToken},
              body: JSON.stringify({
                "file": file,
                "name": filename.replace(/\//g, ""),
                "type": filetype,
              })
            });
            console.log(resAPI);
            this.loading_sources = true;
            await this.getDocumentData();
          } catch (error) {
            console.log(error)
          }
        }
      },
      async deleteDocument(id,index) {
        if(this.login) {
          try {
            const resAPI          = await fetch("https://asia-southeast2-elearning-6871c.cloudfunctions.net/mcourses/documents/" + this.dataItem + "/" + id, {
              method: 'DELETE',
              headers: {'Content-Type': 'application/json','Authorization': 'Bearer ' + this.accessToken},
            });
            const finalRes   = await resAPI.json();
            if(finalRes.success) {
                this.documentData.splice(index, 1);
                console.log(finalRes);
              }
          } catch (error) {
            console.log(error)
          }
        }
      },
      async toggleStatus() {
          if(this.login) {
              try {
                const callApi       = await fetch("https://asia-southeast2-elearning-6871c.cloudfunctions.net/"+this.endpoint+"/" + this.dataItem, {
                  method: 'PUT',
                  headers: {'Content-Type': 'application/json','Authorization': 'Bearer ' + this.accessToken},
                  body: JSON.stringify({
                    "status":this.status,
                  })
                });
                const finalRes   = await callApi.json();

                if(finalRes.success) {
                  console.log("Update Status");
                }
              } catch (error) {
              console.log(error)
              }
          }
      },
      async changePlayerRef() {
        if(this.login) {
            try {
              console.log(this.playerRef);
              
              const callApi       = await fetch("https://asia-southeast2-elearning-6871c.cloudfunctions.net/"+this.endpoint+"/" + this.dataItem, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json','Authorization': 'Bearer ' + this.accessToken},
                body: JSON.stringify({
                  "playerRef":this.playerRef,
                })
              });
              const finalRes   = await callApi.json();

              if(finalRes.success) {
                console.log("Update playerRef");
                location.reload()
              }
            } catch (error) {
            console.log(error)
            }
        }
      },
      async changeExamRef() {
        if(this.login) {
            try {
              console.log(this.examRef);
              
              const callApi       = await fetch("https://asia-southeast2-elearning-6871c.cloudfunctions.net/"+this.endpoint+"/" + this.dataItem, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json','Authorization': 'Bearer ' + this.accessToken},
                body: JSON.stringify({
                  "examRef":this.examRef,
                })
              });
              const finalRes   = await callApi.json();

              if(finalRes.success) {
                console.log("Update examRef");
                location.reload()
              }
            } catch (error) {
            console.log(error)
            }
        }
      },
      async unlinkMaster() {
        if(this.login) {
            try {
              const callApi       = await fetch("https://asia-southeast2-elearning-6871c.cloudfunctions.net/"+this.endpoint+"/" + this.dataItem, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json','Authorization': 'Bearer ' + this.accessToken},
                body: JSON.stringify({
                  "ref":"none",
                  "examRef":this.dataItem,
                  "playerRef":this.dataItem,
                })
              });
              const finalRes   = await callApi.json();

              if(finalRes.success) {
                console.log("Update Unline Master");
                location.reload()
              }
            } catch (error) {
            console.log(error)
            }
        }
      },
      async deletePlayer(id,index) {
          if(this.login) {
            try {
              console.log("id",id);
              console.log("index",index);
              this.$swal({ 
                title: "ต้องการลบข้อมูลนี้ ?",
                text: "หลังจากลบแล้วจะไม่สามารถกู้คืนข้อมูลนี้ได้อีก !",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "ตกลง ลบเลย",
                cancelButtonText: "ยกเลิก",
                closeOnConfirm: false,
                closeOnCancel: false 
              }).then((confirmed) => {
                if (confirmed.isConfirmed) {
                  console.log("Delete");
                  this.confirmDeletePlayer(id,index);
                } else {
                  console.log("Cancel");
                }
              });
            } catch (error) {
              console.log(error)
            }
          }
      },
      async confirmDeletePlayer(id,index) {
          if(this.login) {
            try {
              console.log("id",id)
              const resAPI = await fetch("https://asia-southeast2-elearning-6871c.cloudfunctions.net/players/" + id, {
                method: 'DELETE',
                headers: {'Content-Type': 'application/json','Authorization': 'Bearer ' + this.accessToken},
              });
              const finalRes   = await resAPI.json();

              if(finalRes.success) {
                this.playerParent.splice(index, 1);
                console.log(finalRes);
              }
            } catch (error) {
              console.log(error)
            }
          }
      },
      async deleteSubPlayer(id,array,index) {
          if(this.login) {
            try {
              console.log("id",id);
              console.log("index",index);
              this.$swal({ 
                title: "ต้องการลบข้อมูลนี้ ?",
                text: "หลังจากลบแล้วจะไม่สามารถกู้คืนข้อมูลนี้ได้อีก !",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "ตกลง ลบเลย",
                cancelButtonText: "ยกเลิก",
                closeOnConfirm: false,
                closeOnCancel: false 
              }).then((confirmed) => {
                if (confirmed.isConfirmed) {
                  console.log("Delete");
                  this.confirmDeleteSubPlayer(id,array,index);
                } else {
                  console.log("Cancel");
                }
              });
            } catch (error) {
              console.log(error)
            }
          }
      },
      async confirmDeleteSubPlayer(id,array,index) {
          if(this.login) {
            try {
              console.log("id",id)
              const resAPI = await fetch("https://asia-southeast2-elearning-6871c.cloudfunctions.net/players/" + id, {
                method: 'DELETE',
                headers: {'Content-Type': 'application/json','Authorization': 'Bearer ' + this.accessToken},
              });
              const finalRes   = await resAPI.json();

              if(finalRes.success) {
                this.playerFolder[array].splice(index, 1);
                console.log(finalRes);
              }
            } catch (error) {
              console.log(error)
            }
          }
      },
      async deleteExam(id,index) {
          if(this.login) {
            try {
              console.log("id",id);
              console.log("index",index);
              this.$swal({ 
                title: "ต้องการลบข้อมูลนี้ ?",
                text: "หลังจากลบแล้วจะไม่สามารถกู้คืนข้อมูลนี้ได้อีก !",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "ตกลง ลบเลย",
                cancelButtonText: "ยกเลิก",
                closeOnConfirm: false,
                closeOnCancel: false 
              }).then((confirmed) => {
                if (confirmed.isConfirmed) {
                  console.log("Delete");
                  this.confirmDeleteExam(id,index);
                } else {
                  console.log("Cancel");
                }
              });
            } catch (error) {
              console.log(error)
            }
          }
      },
      async confirmDeleteExam(id,index) {
          if(this.login) {
            try {
              const resAPI = await fetch("https://asia-southeast2-elearning-6871c.cloudfunctions.net/exams/" + id, {
                method: 'DELETE',
                headers: {'Content-Type': 'application/json','Authorization': 'Bearer ' + this.accessToken},
              });
              const finalRes   = await resAPI.json();
              if(finalRes.success) {
                this.examData.splice(index, 1);
                this.$swal({
                  toast: true,
                  position: 'bottom-end',
                  showConfirmButton: false,
                  timer: 3000,
                  icon: 'success',
                  title: 'ลบข้อมูล',
                  text: 'ลบข้อมุลนี้ สำเร็จแล้ว',
                });
              }
            } catch (error) {
              console.log(error)
            }
          }
      },
      async reOrderPlayer(id,order) {
        if(this.login) {
            try {
              const callApi       = await fetch("https://asia-southeast2-elearning-6871c.cloudfunctions.net/players/" + id, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json','Authorization': 'Bearer ' + this.accessToken},
                body: JSON.stringify({
                  "order":order,
                })
              });
              const finalRes   = await callApi.json();

              if(finalRes.success) {
                console.log("ReOrder");
              }
            } catch (error) {
            console.log(error)
            }
        }
      },
      OpenFileBrowser()
      {
        this.FileBrowserOpen = true;
      },
      checkMove: function(evt){
        return (evt.draggedContext.element.name!=='apple');
      },
      updated() {
      feather.replace();
      },
    },
    async mounted () {
      try {

        if(this.master) {
          this.endpoint = "mcourses";
        } else {
          this.endpoint = "courses";
        }

        await this.getData();
        
        this.modeType     = mode
        this.modeName     = this.objectFindByKey(this.modeType, 'code', this.mode).name

        this.displayType  = display
        this.displayName  = this.objectFindByKey(this.displayType, 'code', this.display).name

        this.kindType     = kind
        this.kindName     = this.objectFindByKey(this.kindType, 'code', this.type).name

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
:callbackFunction="'cover'"
:allowFileType="['jpg','gif','png','jpeg']" 
@file-browser-trigger="changeFileTrigger" 
@file-browser-callback="selectFileTrigger"/>

<FileBrowser 
v-if="FileBrowserDocOpen" 
:isWindowsOpen="true" 
:callbackFunction="'document'"
:allowFileType="['doc','docx','xls','xlsx','pdf']" 
@file-browser-trigger="changeFileDocumentTrigger" 
@file-browser-callback="selectFileDocumentTrigger"/>

<div v-if="!loading_sources" class="text-center"><Loader/></div>
<div v-if="loading_sources">
    <div class="mx-auto max-w-3xl px-4 mt-5 sm:px-6 md:flex md:items-center md:justify-between md:space-x-5 lg:max-w-7xl lg:px-8">
      <div class="flex items-center space-x-5">
        <div>
          
          <h1 class="text-2xl font-bold text-gray-900">
            <CourseIcon :title="courseData.name" :chcek="courseData.ref"/>
          </h1>
          <p class="mt-2 text-sm font-medium text-gray-500"><CourseStat :check="courseData.id"/>
          <a v-for="(categoryItem) in courseData.category" :key="categoryItem.id" href="#" class="text-xs font-medium bg-indigo-600 pl-2 pr-2 pt-1 pb-1 mr-1 rounded text-white">
            {{this.objectFindByKey(this.categoryData, 'slug', categoryItem).name}}
          </a>  
          </p>
          
        </div>
      </div>
      
    </div>
    
    <div class="mx-auto mt-8 grid max-w-3xl grid-cols-1 gap-6 sm:px-6 lg:max-w-7xl lg:grid-flow-col-dense lg:grid-cols-3">
      <div class="space-y-6 lg:col-span-2 lg:col-start-1">
        <!-- Description list-->
        <section aria-labelledby="applicant-information-title">
          <div class="bg-white shadow relative overflow-hidden sm:rounded-lg">

            <div class="absolute right-0 top-0 h-16 w-16" v-if="this.master">
              <div
                class="absolute transform rotate-45 bg-rose-600 text-sm text-center text-white font-medium py-1 left-[-64px] top-[32px] w-[170px]">
                Master Mode
              </div>
            </div>

            <div class="absolute right-0 top-0 h-16 w-16" v-if="!this.master">
              <div
                class="absolute transform rotate-45 bg-emerald-600 text-sm text-center text-white font-medium py-1 left-[-64px] top-[32px] w-[170px]">
                Child Mode
              </div>
            </div>

            <div class="px-4 py-5 sm:px-6">

              <dl class="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                <div class="sm:col-span-1">
                  <dt class="text-sm font-bold text-black">ประเภทหลักสูตร</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{kindName}}</dd>
                </div>
                <div class="sm:col-span-1">
                  <dt class="text-sm font-bold text-black">รูปแบบในการเรียน</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{modeName}}</dd>
                </div>
                <div class="sm:col-span-1">
                  <dt class="text-sm font-bold text-black">เงื่อนไข</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{displayName}}</dd>
                </div>
                <div class="sm:col-span-1">
                  <dt class="text-sm font-bold text-black">ราคา</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{courseData.regular_price}} ({{courseData.sale_price}})</dd>
                </div>
              </dl>
              
            </div>
          </div>
        </section>
    
        <!---  Render Player Data ---->

        <section aria-labelledby="notes-title">
          <div class="bg-white shadow sm:overflow-hidden sm:rounded-lg">
            <div class="divide-y divide-gray-200">
              
              <div class="px-4 py-5 sm:px-6 relative">
                <h2 id="notes-title" class="text-lg font-bold text-gray-900"><font-awesome-icon :icon="['fas','book']" class="text-black mr-2"/> บทเรียน/เนื้อหา ({{playerCount}}) </h2>
                <button 
                v-if="this.playerRef===this.dataItem&&!this.master"
                @click="$router.push('/lesson/player/add/' + this.dataItem + '/' + this.playerParentCount)"
                type="button" 
                class="absolute top-4 right-4 ml-3 inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                <font-awesome-icon :icon="['fas','plus']" class="text-gray-200 pr-3"/> เพิ่ม 
                </button>

                <button 
                v-if="this.master"
                @click="$router.push('/lesson/player/add/' + this.dataItem + '/' + this.playerParentCount)"
                type="button" 
                class="absolute top-4 right-4 ml-3 inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                <font-awesome-icon :icon="['fas','plus']" class="text-gray-200 pr-3"/> เพิ่ม 
                </button>

                <!-- <button 
                @click="addData"
                type="button" 
                class="absolute top-4 right-4 ml-3 inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                <font-awesome-icon :icon="['fas','plus']" class="text-gray-200 pr-3"/> addData 
                </button> -->

              </div>

              <!---  Set : Use Ref Player Data ---->

              <div v-if="!this.master && courseData.ref!='none'" class="flex items-center justify-between lg:flex lg:items-center lg:justify-between pl-5 pr-5 pt-1 pb-1 bg-gray-50">
                <div class="min-w-0 flex-1">ใช้ข้อมูลบทเรียนจาก</div>
                <div class="mt-0 flex lg:mt-0 lg:ml-4">
                  <span class="sm:ml-3">
                    <div>
                      <select @change="changePlayerRef($event)" v-model="playerRef" class="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm">
                        <option :value="courseData.ref">Master Data</option>
                        <option :value="this.dataItem">หลักสูตรนี้</option>
                      </select>
                    </div>
                  </span>
                </div>
              </div>

              <!---  Set : Use Ref Player Data ---->

              <div class="px-4 py-6 sm:px-6 bg-gray-50">

                <draggable
                role="list_parent" class="space-y-2"
                tag="ul"
                :list="playerParent"
                handle=".handle"
                v-bind="dragOptions"
                @change="log"
                :move="checkMove"
                @start="isDragging = true"
                @end="isDragging = false" >

                  <transition-group type="transition" name="flip-list">
                    
                    <template v-for="(playerItem,index) in playerParent" :key="playerItem.id">

                      <!--------  Player Type : Folder  ------->

                      <template v-if="playerItem.type==='folder'&&playerItem.mode!='sub'" > 

                        <li class="p-5 b-1 bot rounded-md border-gray-200 bg-white border-dashed border-[1px]">
                      
                          <div class="flex space-x-3 border-b border-gray-200 pb-3 mb-3 border-dashed">
                            <div class="flex-shrink-0">
                              <Tooltip title="ลากเพื่อจัดลำดับ" size="12" v-if="this.master || courseData.ref==='none'">
                                <button 
                                type="button" 
                                class="cursor-move font-medium text-gray-900 handle mr-3 relative top-[-5px]">
                                <font-awesome-icon :icon="['fas','align-justify']" class="text-gray-500"/> 
                                </button>
                              </Tooltip>
                              <font-awesome-icon :icon="['fas','folder']" class="text-yellow-500 text-3xl"/>
                            </div>
                            <div>
                              <div class="text-sm">
                                <a href="javascript:void(0);" class="text-base font-bold text-gray-900">{{playerItem.name}} ({{playerItem.order}})</a>
                              </div>
                              <div class="mt-1 text-sm text-gray-400">
                                <span>รหัส : <span class="font-bold text-indigo-300">{{playerItem.slug}}</span></span>
                                <span class="font-medium text-gray-500 mr-3 ml-3">&middot;</span>
                                <span>ประเภท : <span class="font-bold text-indigo-300">{{this.objectFindByKey(this.playerType, 'code', playerItem.type).name}}</span></span>
                              </div>

                            </div>
                          </div>

                          <div class="mt-2 space-x-2 text-sm">
    
                            <span v-if="this.master || courseData.ref==='none'">

                              <button 
                              @click="$router.push('/lesson/player/sub/'+this.dataItem+'/' + playerItem.id + '/' + this.playerChildCount)"
                              type="button" class="font-medium text-gray-900 mr-3">
                              <font-awesome-icon :icon="['fas','plus']" class="text-gray-500"/> เพิ่มบทเรียนย่อย
                              </button>
                              <span class="font-medium text-gray-500 mr-3">&middot;</span>

                              <button 
                              @click="$router.push('/lesson/player/edit/' + playerItem.id)"
                              type="button" class="font-medium text-gray-900 mr-3">
                              <font-awesome-icon :icon="['fas','pencil']" class="text-gray-500"/> แก้ไข
                              </button>
                              <span class="font-medium text-gray-500 mr-3">&middot;</span>

                              <button 
                              @click="deletePlayer(playerItem.id,index)" 
                              type="button" class="font-medium text-gray-900 mr-3">
                              <font-awesome-icon :icon="['fas','trash']" class="text-gray-500"/> ลบ
                              </button>

                            </span>

                          </div>

                          <!--------  Render Sub Item  ------->

                          <div class="mt-2 space-x-2 w-full text-sm bot rounded-md border-[1px] overflow-hidden rounded-md border border-gray-150 bg-white"> 

                            <draggable
                              role="list_child" class="divide-y divide-gray-150"
                              tag="ul"
                              :list="playerFolder[playerItem.id]"
                              handle=".handle-sub"
                              v-bind="dragOptions"
                              @change="log_sub(playerItem.id)"
                              :move="checkMove"
                              @start="isDragging = true"
                              @end="isDragging = false"
                            >
                              <transition-group type="transition" name="flip-list">

                              <li v-for="(subItem,subIndex) in this.playerFolder[playerItem.id]" :key="subItem.id" class="px-3 py-2 text-gray-600 hover:bg-gray-50">

                                <font-awesome-icon :icon="['fas','align-justify']" v-if="this.master || courseData.ref==='none'" class="cursor-move text-gray-200 mr-3 handle-sub hover:text-gray-400"/>

                                <a :href="'/lesson/player/detail/'+subItem.id" class="font-medium text-sm text-gray-600 hover:text-indigo-600 hover:font-bold">{{subItem.name}}</a>
                                <span v-if="this.master || courseData.ref==='none'" class="float-right">
                                  
                                  <button 
                                  @click="$router.push('/lesson/player/edit/' + subItem.id)"
                                  type="button" class="font-medium text-gray-500 mr-3 hover:text-gray-700">
                                  <font-awesome-icon :icon="['fas','pencil']" class="text-gray-500"/> แก้ไข
                                  </button>

                                  <span class="font-medium text-gray-500 mr-3">&middot;</span>
                                  <button 
                                  @click="deleteSubPlayer(subItem.id,playerItem.id,subIndex)"
                                  type="button" class="font-medium text-gray-500 mr-3 hover:text-gray-700">
                                  <font-awesome-icon :icon="['fas','trash']" class="text-gray-500"/> ลบ
                                  </button>

                                </span>
                              </li>

                            </transition-group>
                          </draggable>

                          </div>

                          <!--------  Render Sub Item  ------->

                        </li>
                        
                      </template>

                      <!--------  Player Type : Standard  ------->

                      <template v-if="playerItem.type!='folder'&&playerItem.mode!='sub'">

                        <li class="p-5 b-1 bot rounded-md border-gray-200 bg-white border-dashed border-[1px]">
                      
                          <div class="flex space-x-3 border-b border-gray-200 pb-3 mb-3 border-dashed">
                            <Tooltip title="ลากเพื่อจัดลำดับ" size="12" v-if="this.master || courseData.ref==='none'">
                              <button 
                              type="button" 
                              class="cursor-move font-medium text-gray-900 handle mr-3 relative top-[-5px]">
                              <font-awesome-icon :icon="['fas','align-justify']" class="text-gray-500"/> 
                              </button>
                            </Tooltip>

                            <div class="flex-shrink-0">
                              <img class="h-10 w-10 object-cover" :src="playerItem.cover || 'https://dummyimage.com/800x600/ededed/303030.png&text=++++++COVER+++++'" alt="">
                            </div>

                            <div>
                              <div class="text-sm">
                                <a :href="'/lesson/player/detail/'+playerItem.id" class="font-bold text-gray-900">{{playerItem.name}} ({{playerItem.order}})</a>
                              </div>
                              <div class="mt-1 text-sm text-gray-400">
                                <span>รหัส : <span class="font-bold text-indigo-300">{{playerItem.slug}}</span></span>
                                <span class="font-medium text-gray-200">|</span> 
                                <span>ประเภท : <span class="font-bold text-indigo-300">{{this.objectFindByKey(this.playerType, 'code', playerItem.type).name}}</span></span>
                                <span class="font-medium text-gray-200">|</span> 
                                <span>ความยาว : <span class="font-bold text-indigo-300">{{playerItem.duration}}</span> นาที</span>
                              </div>
                              
                              
                            </div>
                          </div>

                          <div class="mt-2 space-x-2 text-sm">
    
                            <span v-if="this.master || courseData.ref==='none'">

                              <button 
                              @click="$router.push('/lesson/player/edit/' + playerItem.id)"
                              type="button" class="font-medium text-gray-900 mr-3">
                              <font-awesome-icon :icon="['fas','pencil']" class="text-gray-500"/> แก้ไข
                              </button>

                              <span class="font-medium text-gray-500 mr-3">&middot;</span>

                              <button 
                              @click="deletePlayer(playerItem.id,index)" 
                              type="button" class="font-medium text-gray-900 mr-3">
                              <font-awesome-icon :icon="['fas','trash']" class="text-gray-500"/> ลบ
                              </button>

                              <span class="font-medium text-gray-500 mr-3">&middot;</span>

                            </span>

                            <span class="font-medium text-gray-500">
                              <font-awesome-icon :icon="['fas','video']" class="text-rose-600" :class="playerItem.video===undefined ? 'text-rose-600' : 'text-lime-600'"/>
                              <span v-if="(playerItem.video===undefined)" class="ml-2 bg-blue-100 pl-2 pr-2 rounded text-xs">ไม่มีเนื้อหา</span>
                              <span v-if="(playerItem.video!=undefined && playerItem.type==='demand')" class="ml-2 bg-blue-100 pl-2 pr-2 rounded text-xs">{{playerItem.video.desktop}}</span>
                              <span v-if="(playerItem.video!=undefined && playerItem.type==='streaming')" class="ml-2 bg-blue-100 pl-2 pr-2 rounded text-xs">{{playerItem.video.streaming}}</span>
                              <span v-if="(playerItem.video!=undefined && playerItem.type==='youtube')" class="ml-2 bg-blue-100 pl-2 pr-2 rounded text-xs">{{playerItem.video.youtube}}</span>
                            </span>
                              
                          </div>

                        </li>
                        
                      </template>

                    </template>
                    
                  </transition-group>
                </draggable>

              </div>
            </div>
          </div>
        </section>
    
      <section aria-labelledby="notes-title">
        <div class="bg-white shadow sm:overflow-hidden sm:rounded-lg">
          <div class="divide-y divide-gray-200">
            <div class="px-4 py-5 sm:px-6 relative">
            <h2 id="notes-title" class="text-lg font-bold text-gray-900"><font-awesome-icon :icon="['fas','square-check']" class="text-black mr-2"/>แบบทดสอบ ({{examCount}})</h2>
              <span class="absolute top-4 right-4">
                <button
                v-if="this.examRef===this.dataItem&&!this.master"
                @click="$router.push('/lesson/exam/add/' + this.dataItem)"
                type="button" 
                class="ml-3 inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                <font-awesome-icon :icon="['fas','plus']" class="text-gray-200 pr-3"/> เพิ่ม 
                </button>

                <button
                v-if="this.master"
                @click="$router.push('/lesson/exam/add/' + this.dataItem)"
                type="button" 
                class="ml-3 inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                <font-awesome-icon :icon="['fas','plus']" class="text-gray-200 pr-3"/> เพิ่ม 
                </button>
              </span>

            </div>

            <div v-if="!this.master && courseData.ref!='none'" class="flex items-center justify-between lg:flex lg:items-center lg:justify-between pl-5 pr-5 pt-1 pb-1 bg-gray-50">
              <div class="min-w-0 flex-1">ใช้ข้อมูลแบบทดสอบจาก</div>
              <div class="mt-0 flex lg:mt-0 lg:ml-4">
                <span class="sm:ml-3">
                  <div>
                    <select @change="changeExamRef($event)" v-model="examRef" class="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm">
                      <option :value="courseData.ref">Master Data</option>
                      <option :value="this.dataItem">หลักสูตรนี้</option>
                    </select>
                  </div>
                </span>
              </div>
            </div>

            <div class="px-4 py-6 sm:px-6">

              <ul role="list" class="space-y-8">
                
                <li v-for="(examItem, index) in examData" :key="examItem.id">
                  <div class="flex space-x-3">
                    <div>
                      <div class="text-sm">
                        <a :href="'/lesson/exam/detail/'+examItem.id" class="font-bold text-gray-900">{{(index+1)}}.{{examItem.name}}</a>
                      </div>
                      <div class="mt-1 text-sm text-gray-400">
                        <span>ข้อสอบ : <span class="font-bold text-indigo-300">{{examItem.total}}</span> ข้อ</span>
                        <span class="font-medium text-gray-200">|</span> 
                        <span>เวลาสอบ : <span class="font-bold text-indigo-300">{{examItem.timer}}</span> นาที</span>
                        <span class="font-medium text-gray-200">|</span> 
                        <span>ประเภท : <span class="font-bold text-indigo-300">{{this.objectFindByKey(this.examType, 'code', examItem.type).name}}</span></span>
                      </div>
                      <div class="mt-2 space-x-2 text-sm">
                        <span class="font-medium text-gray-500">0/{{examItem.total}}</span>

                        <span v-if="this.master || courseData.ref==='none'">

                          <span class="font-medium text-gray-500 mr-3">&middot;</span>

                          <button 
                          @click="$router.push('/lesson/exam/edit/' + examItem.id)"
                          type="button" class="font-medium text-gray-900 mr-3">
                          <font-awesome-icon :icon="['fas','pencil']" class="text-gray-500"/> แก้ไข
                          </button>
          
                          <span class="font-medium text-gray-500 mr-3">&middot;</span>

                          <button 
                          @click="deleteExam(examItem.id,index)" 
                          type="button" class="font-medium text-gray-900 mr-3">
                          <font-awesome-icon :icon="['fas','trash']" class="text-gray-500"/> ลบ
                          </button>
                          
                        </span>
                  
                      </div>
                    </div>
                  </div>
                </li>
        
              </ul>
            </div>
          </div>
        
        </div>
      </section>
      
      <section aria-labelledby="notes-title">
        <div class="bg-white shadow sm:overflow-hidden sm:rounded-lg">
          <div class="divide-y divide-gray-200">

            <div class="px-4 py-5 sm:px-6 relative">
            <h2 id="notes-title" class="text-lg font-bold text-gray-900"><font-awesome-icon :icon="['fas','file']" class="text-black mr-2"/>เอกสารประกอบการเรียน</h2>
            <span class="absolute top-4 right-4">
              <button
              v-if="this.master"
              @click="OpenFileDocumentBrowser" 
              type="button" 
              class="ml-3 inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
              <font-awesome-icon :icon="['fas','plus']" class="text-gray-200 pr-3"/> เพิ่ม 
              </button>
            </span>
            
            </div>

            <div class="px-4 py-6 sm:px-6">

              <div class="overflow-hidden bg-white shadow sm:rounded-md">
                <ul role="list" class="divide-y divide-gray-200">
                  <li v-for="(document,documentIndex) in documentData" :key="document.id">
                    <div class="block hover:bg-gray-50">
                      <div class="flex items-center px-4 py-4 sm:px-6">
                        <div class="flex min-w-0 flex-1 items-center">
                          <div class="flex-shrink-0">
                            <div class="float-left mr-3">
                              <div :class="'fi fi-'+document.type">
                                <div class="fi-content">{{document.type}}</div>
                              </div>
                            </div> 
                          </div>
                          <div class="min-w-0 flex-1 px-4 md:grid md:grid-cols-1 md:gap-1">
                            <div>
                              <p class="text-sm font-bold text-indigo-600">{{document.name}}</p>
                              <p class="text-sm font-medium text-gray-600">{{document.type}}</p>
                            </div>
                          </div>
                        </div>
                        <div>
                          <span v-if="this.master || courseData.ref==='none'">
      
                            <button 
                            @click="deleteDocument(document.id,documentIndex)" 
                            type="button" class="font-medium text-gray-900 mr-3">
                            <font-awesome-icon :icon="['fas','trash']" class="text-gray-500"/> ลบ
                            </button>
                            
                          </span>
                        </div>
                      </div>
                      
                    </div>
                    
                  </li>
                </ul>
              </div>
          </div>
        </div>
        
        </div>
      </section>

      <section aria-labelledby="applicant-information-title">
        <div class="bg-white shadow relative overflow-hidden sm:rounded-lg">

          <div class="px-4 py-5 sm:px-6">

            <div v-if="principles!=undefined&&principles!=''">
              <h2 id="applicant-information-title" class="leading-6 text-sm font-bold text-black">หลักการและเหตุผล</h2>
              <read-more 
              class="readmore text-sm text-gray-900" 
              more-str="แสดงเนื้อหา" 
              :text="principles" 
              link="#"
              less-str="ย่อเนื้อหา" 
              :max-chars="200" 
              >
              </read-more>
            </div>

            <div v-if="objective!=undefined&&objective!=''">
              <h2 id="applicant-information-title" class="leading-6 text-sm font-bold text-black">วัตถุประสงค์</h2>
              <read-more 
              class="readmore text-sm text-gray-900" 
              more-str="แสดงเนื้อหา" 
              :text="objective" 
              link="#"
              less-str="ย่อเนื้อหา" 
              :max-chars="200" 
              >
              </read-more>
            </div>
            
            <div v-if="target!=undefined&&target!=''">
              <h2 id="applicant-information-title" class="leading-6 text-sm font-bold text-black">กลุ่มเป้าหมาย</h2>
              <read-more 
              class="readmore text-sm text-gray-900" 
              more-str="แสดงเนื้อหา" 
              :text="target" 
              link="#"
              less-str="ย่อเนื้อหา" 
              :max-chars="200" 
              >
              </read-more>
            </div>
            

            <div v-if="structure!=undefined&&structure!=''">
              <h2 id="applicant-information-title" class="leading-6 text-sm font-bold text-black">โครงสร้างหลักสูตร</h2>
              <read-more 
              class="readmore text-sm text-gray-900" 
              more-str="แสดงเนื้อหา" 
              :text="structure" 
              link="#"
              less-str="ย่อเนื้อหา" 
              :max-chars="200" 
              >
              </read-more>
            </div>
            
          </div>
        </div>
      </section>
  
    </div>
  
    <section aria-labelledby="timeline-title" class="lg:col-span-1 lg:col-start-3">
      
      <div class="justify-stretch mb-6 mt-6 flex flex-col-reverse space-y-4 space-y-reverse sm:flex-row-reverse sm:justify-start sm:space-y-0 sm:space-x-3 sm:space-x-reverse md:mt-0 md:flex-row md:space-x-3">
        <button 
        @click="$router.push('/lesson/edit/' + this.dataItem)"
        type="button" 
        class="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-100">
        <font-awesome-icon :icon="['fas','pencil']" class="text-black text-[12px] mr-2"/> แก้ไขข้อมูล
        </button>
    
        <button 
        type="button" 
        class="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-100">
        <font-awesome-icon :icon="['fas','trash']" class="text-black text-[12px] mr-2"/> ลบข้อมูล
        </button>
    
        <button 
        @click="$router.push('/lesson/index')"
        type="button" 
        class="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-100">
        <font-awesome-icon :icon="['fas','home']" class="text-black text-[12px] mr-2"/> ย้อนกลับ
        </button>
    
      </div>

      <div class="mb-5 bg-white px-4 py-5 shadow sm:rounded-lg sm:px-6">
      
        <div class="">
          <div class="mt-1 flex items-center">
            <div class="flex">
              <div class="relative flex cursor-pointer items-center py-1 px-1 border-r-[1px] pr-5 mr-1">
                <div class="relative text-sm font-medium text-blue-gray-900">
                  <span><Toggle v-model="status" @change="toggleStatus"/></span>
                </div>
              </div>
              <div class="ml-3 rounded-md border border-transparent bg-transparent py-2 px-3 text-sm font-bold text-blue-gray-900 hover:text-blue-gray-700 focus:border-blue-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-blue-gray-50">
              Course Status
              <p class="font-medium">การแสดงผลของหลักสูตร</p>
              </div>
            </div>
          </div>
        </div>
        
      </div>

      <div class="bg-white px-4 py-5 shadow sm:rounded-lg sm:px-6">
        
        <div class="mb-5">
          
          <div class="rounded-md bg-red-50 p-4 mb-5" v-if="this.master">
            <div class="flex">
              <div class="flex-shrink-0">
                <!-- Heroicon name: mini/x-circle -->
                <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-bold text-red-800">แก้ไขข้อมูลใน Master Mode</h3>
                <div class="mt-2 text-sm text-red-700">
                  <ul role="list" class="list-disc space-y-1">
                    <li>การแก้ไขข้อมูลใน Master หลังจากข้อมูลได้รับการบันทึกแล้ว หลักสููตรอื่นๆภายใต้ข้อมูลของ Master จะถูกเปลี่ยนแปลงไปด้วย กรุณาระมัดระวังในการแก้ไขข้อมูลในส่วนนี้</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <button 
          @click="OpenFileBrowser" 
          type="button"
          v-bind:style="{ 'background-image': 'url(' + this.cover + ')' }" 
          class="relative bg-cover block w-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
            <div class="bg-white/80 p-3">
              <font-awesome-icon :icon="['fas','cloud-upload']" class="mx-auto h-12 w-12 text-black"/>
              <span class="mt-2 block text-sm font-medium text-black">เลือกรูปหน้าปก</span>
            </div>
          </button>

        </div>
      </div>

      <div class="divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow mt-5">

        <div class="px-4 py-5 sm:p-6">

          <div class="grid grid-cols-4 gap-6">
            <div class="col-span-4 sm:col-span-6">
                <h2 id="timeline-title" class="text-lg font-bold text-gray-900">สถิติของหลักสูตรนี้</h2>
                <div class="flow-root">
        
                  <dl class="mt-3 grid grid-cols-1 gap-5 sm:grid-cols-1 lg:grid-cols-1">
                    <div class="relative overflow-hidden rounded-lg bg-white px-4 pt-5 pb-12 shadow sm:px-6 sm:pt-6">
                      <dt>
                        <div class="absolute rounded-md bg-indigo-500 p-3">
                          <font-awesome-icon :icon="['fas','users']" class="h-6 w-6 text-white"/>
                        </div>
                        <p class="ml-16 truncate text-sm font-medium text-gray-500">ผู้ลงทะเบียนหลักสูตร</p>
                      </dt>
                      <dd class="ml-16 flex items-baseline pb-6 sm:pb-7">
                        <p class="text-2xl font-semibold text-gray-900">0</p>
                        <p class="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                          <!-- Heroicon name: mini/arrow-up -->
                          <svg class="h-5 w-5 flex-shrink-0 self-center text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fill-rule="evenodd" d="M10 17a.75.75 0 01-.75-.75V5.612L5.29 9.77a.75.75 0 01-1.08-1.04l5.25-5.5a.75.75 0 011.08 0l5.25 5.5a.75.75 0 11-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0110 17z" clip-rule="evenodd" />
                          </svg>
                          <span class="sr-only"> Increased by </span>
                          0
                        </p>
                        <div class="absolute inset-x-0 bottom-0 bg-gray-50 px-4 py-4 sm:px-6">
                          <div class="text-sm">
                            <a href="#" class="font-medium text-indigo-600 hover:text-indigo-500"> ดูรายชื่อทั้งหมด<span class="sr-only"> Total Subscribers stats</span></a>
                          </div>
                        </div>
                      </dd>
                    </div>
                
                    <div class="relative overflow-hidden rounded-lg bg-white px-4 pt-5 shadow sm:px-6 sm:pt-6">
                      <dt>
                        <div class="absolute rounded-md bg-indigo-500 p-3">
                          <font-awesome-icon :icon="['fas','award']" class="h-6 w-6 text-white"/>
                        </div>
                        <p class="ml-16 truncate text-sm font-medium text-gray-500">ผู้ผ่านการอบรม</p>
                      </dt>
                      <dd class="ml-16 flex items-baseline pb-6 sm:pb-7">
                        <p class="text-2xl font-semibold text-gray-900">0</p>
                        <p class="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                          <!-- Heroicon name: mini/arrow-up -->
                          <svg class="h-5 w-5 flex-shrink-0 self-center text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fill-rule="evenodd" d="M10 17a.75.75 0 01-.75-.75V5.612L5.29 9.77a.75.75 0 01-1.08-1.04l5.25-5.5a.75.75 0 011.08 0l5.25 5.5a.75.75 0 11-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0110 17z" clip-rule="evenodd" />
                          </svg>
                          <span class="sr-only"> Increased by </span>
                          0%
                        </p>
                      </dd>
                    </div>
                
                    <div class="relative overflow-hidden rounded-lg bg-white px-4 pt-5 shadow sm:px-6 sm:pt-6">
                      <dt>
                        <div class="absolute rounded-md bg-indigo-500 p-3">
                          <font-awesome-icon :icon="['fas','arrow-pointer']" class="h-6 w-6 text-white"/>
                        </div>
                        <p class="ml-16 truncate text-sm font-medium text-gray-500">ยอดผู้เข้าชม</p>
                      </dt>
                      <dd class="ml-16 flex items-baseline pb-6 sm:pb-7">
                        <p class="text-2xl font-semibold text-gray-900">0</p>
                        <p class="ml-2 flex items-baseline text-sm font-semibold text-red-600">
                          <!-- Heroicon name: mini/arrow-down -->
                          <svg class="h-5 w-5 flex-shrink-0 self-center text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fill-rule="evenodd" d="M10 3a.75.75 0 01.75.75v10.638l3.96-4.158a.75.75 0 111.08 1.04l-5.25 5.5a.75.75 0 01-1.08 0l-5.25-5.5a.75.75 0 111.08-1.04l3.96 4.158V3.75A.75.75 0 0110 3z" clip-rule="evenodd" />
                          </svg>
                          <span class="sr-only"> Decreased by </span>
                          0%
                        </p>
                      </dd>
                    </div>
                  </dl>
                  
                </div>
            </div>
          </div>

        </div>
        <div class="bg-gray-50 px-4 py-4 sm:px-6 text-right" v-if="courseData.ref!='none'&&!this.master">

          <button 
          @click="unlinkMaster()"
          type="button" 
          class="w-full inline-flex justify-center rounded-md border border-transparent bg-rose-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
          <font-awesome-icon :icon="['fas','save']" class="pr-2 pl-2"/>ยกเลิกการอ้างอิงกับ Master data
          </button>
          <p class="text-left text-sm text-rose-400 pt-3">หลังจากยกเลิกแล้ว การแก้ไขข้อมูลจะไม่มีผลต่อเนื่องกันระหว่าง Master และหลักสูตรนี้ ขั้นตอนนี้ไม่สามารถย้อนกลับได้</p>

        </div>
      </div>

    </section>
  </div>
</div>

</template>
<style src="@vueform/toggle/themes/default.css"></style>
<style>
.button {
  margin-top: 35px;
}
.flip-list-move {
  transition: transform 0.5s;
}

.flip-list-sub-move {
  transition: transform 0.5s;
}
.no-move {
  transition: transform 0s;
}
.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}
.list-group {
  min-height: 20px;
}
.list-group-item {
  cursor: move;
}
.list-group-item i {
  cursor: pointer;
}
.btn {
  @apply font-bold py-2 px-4 rounded;
}
.btn-blue {
  @apply bg-blue-500 text-white;
}
.btn-blue:hover {
  @apply bg-blue-700;
}


.toggle-container:focus {
  box-shadow:unset;
  outline: unset;
}
</style>
