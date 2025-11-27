<template>
    <div class="bg-gray-100">

        <!-- Authentication Modal -->
        <div v-if="!isAuthenticated" class="fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center items-center z-[9999]">
            <div class="bg-white p-8 rounded-lg w-full md:w-1/4 min-w-min md:min-w-0" style="min-width: 200px;"> <!-- Enhanced styling for larger modal with full width on mobile -->
                <!-- Big Alert Icon -->
                <div class="flex justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                </div>
                <!-- Warning Text -->
                <div class="text-center mb-4 text-lg font-medium text-gray-800">
                หน้านี้มีการจำกัดการเข้าถึง <br/>โปรดกรอกรหัสผ่านเพื่อดำเนินการต่อไป
                </div>
                <!-- Authentication Form -->
                <div class="text-center">
                <div v-if="authError" class="text-red-500 mb-4">รหัสผ่านไม่ถูกต้อง</div>
                <input type="password" v-model="inputPassword" placeholder="กรอกรหัสผ่าน" class="border p-2 rounded w-full">
                <button @click="checkPassword" class="bg-blue-500 text-white p-2 rounded mt-4 w-full">ดูข้อมูล</button>
                </div>
            </div>
        </div>

        <!-- Main Content -->
        <div v-if="isAuthenticated" class="mx-auto px-4 pb-12 pt-8 sm:px-6 sm:pb-12 sm:pt-6 lg:grid lg:max-w-7xl lg:gap-x-8 lg:px-8">
            <div class="lg:flex lg:items-center lg:justify-between">
                <EnrollDashboard
                :pageTitle="courseData.name"
                :courseData="courseData"
                :isPublic="true"
                />
            </div>
        </div>
    </div>
  </template>

  
    
<script>
import { ref } from 'vue';
import EnrollDashboard   from '@/extensions/modules/elearning/lesson/component/course/resource/EnrollDashboard.vue';
import storageManager from '@/plugins/storage';
import requestClient from '@/plugins/requestClient';
const Request = new requestClient(false);
export default {
    data() {
        const session = storageManager.get('session')


    return {
        dataItem: this.$route.params.id,
        accessToken: session.token,
        login: session.login,
        configs: storageManager.get('configs'),
        session: session,
            courseData: [],
            // Existing data properties...
    isAuthenticated: false,
    inputPassword: '',
    authError: false,
        };
        
    },
    components: {
      EnrollDashboard,
    },
    methods: {
        checkPassword() {
            if (this.inputPassword === '767241') {
            this.isAuthenticated = true;
            this.authError = false;
            sessionStorage.setItem('isAuthenticated', 'true'); // Store authentication status
            } else {
            this.authError = true;
            }
        },
        processingData(rawdata) {
        const formattedData = {
          players: [],
          categories: [],
          document: [],
          exam: [],
          course: null,
        };

        const seenCategoryIds     = new Set();
        const seenDocumentIds     = new Set();
        const seenExamIds         = new Set();
        const seenPlayerIds       = new Set();
        const playerParentItems   = [];
        const playerParentChild   = [];
        const playerParentFolder  = [];

        rawdata.forEach((entry) => {

          // Player Data Format
          if (Array.isArray(entry.player)) {
            entry.player.forEach((player) => {
              if (!seenPlayerIds.has(player._id)) {
                formattedData.players.push(player);
                seenPlayerIds.add(player._id);
              }
            });
          } else if (entry.player && !seenPlayerIds.has(entry.player._id)) {
            formattedData.players.push(entry.player);
            seenPlayerIds.add(entry.player._id);
          }

          // Category Data Format
          if (Array.isArray(entry.category)) {
            entry.category.forEach((category) => {
              if (!seenCategoryIds.has(category._id)) {
                formattedData.categories.push(category);
                seenCategoryIds.add(category._id);
              }
            });
          } else if (entry.category && !seenCategoryIds.has(entry.category._id)) {
            formattedData.categories.push(entry.category);
            seenCategoryIds.add(entry.category._id);
          }

          // Document Data Format
          if (Array.isArray(entry.document)) {
            entry.document.forEach((document) => {
              if (!seenDocumentIds.has(document._id)) {
                formattedData.document.push(document);
                seenDocumentIds.add(document._id);
              }
            });
          } else if (entry.document && !seenDocumentIds.has(entry.document._id)) {
            formattedData.document.push(entry.document);
            seenDocumentIds.add(entry.document._id);
          }
          // Exam Data Format
          if (Array.isArray(entry.exam)) {
            entry.exam.forEach((exam) => {
              if (!seenExamIds.has(exam._id)) {
                formattedData.exam.push(exam);
                seenExamIds.add(exam._id);
              }
            });
          } else if (entry.exam && !seenExamIds.has(entry.exam._id)) {
            formattedData.exam.push(entry.exam);
            seenExamIds.add(entry.exam._id);
          }
          // Course Data Format
          if (!formattedData.course) {
            formattedData.course = entry.course;
          }
        });

        formattedData.players.forEach(element => {
          if (element.type !== "folder" && element.mode === "sub") {
            playerParentChild.push(element);
          }
        });
        formattedData.players.forEach(element => {
          if(element.mode!="sub")
          ref(playerParentItems.push(element));
        });
        
        playerParentItems.forEach(element => {
          let key = element._id
          playerParentFolder[key]=[];
          playerParentChild.forEach(element2 => {
            
            if(element2.root===element._id){
              playerParentFolder[key].push(element2);
            }
          });
        });
        // Return an object with all the processed data
        return {
          formattedData,
          playerParentItems,
          playerParentChild,
          playerParentFolder
        };
      },
        async getQueryData() {
        try {
          let RestReturn = null;
          const pipeline = [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", { $toObjectId: this.dataItem }],
                },
              },
            },
            {
              $lookup: {
                from: "player",
                let: { courseIdStr: { $toString: { $ifNull: ["$$ROOT.master", "$_id"] } } },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ["$$courseIdStr", "$courseId"],
                      },
                    },
                  },
                ],
                as: "players"
              }
            },
            {
              $addFields: {
                playersCount: { $size: "$players" }
              }
            },
            {
              $lookup: {
                from: "exam",
                let: { courseIdStr: { $toString: { $ifNull: ["$$ROOT.master", "$_id"] } } },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ["$$courseIdStr", "$courseId"],
                      },
                    },
                  },
                ],
                as: "exams"
              }
            },
            {
              $addFields: {
                examsCount: { $size: "$exams" }
              }
            },
            {
              $lookup: {
                from: "document",
                let: { courseIdStr: { $toString: { $ifNull: ["$$ROOT.master", "$_id"] } } },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ["$$courseIdStr", "$courseId"],
                      },
                    },
                  },
                ],
                as: "documents"
              }
            },
            {
              $addFields: {
                documentsCount: { $size: "$documents" }
              }
            },
            {
    "$lookup": {
      "from": "enroll",
      "let": { "courseIdStr": { "$toString": { "$ifNull": ["$$ROOT._id", "$_id"] } } },
      "pipeline": [
        {
          "$match": {
            "$expr": {
              "$eq": ["$$courseIdStr", "$courseID"]
            }
          }
        },
        {
          "$group": {
            "_id": null,
            "count": { "$sum": 1 }
          }
        },
        {
          "$project": {
            "_id": 0,
            "count": 1
          }
        }
      ],
      "as": "enrollsCountArray"
    }
  },
  {
    "$addFields": {
      "enrollsCount": {
        "$ifNull": [ { "$arrayElemAt": ["$enrollsCountArray.count", 0] }, 0 ]
      }
    }
  },
            {
                "$lookup": {
                  "from": "form",
                  "let": { "courseIdStr": { "$toString": { "$ifNull": ["$$ROOT._id", "$_id"] } } },
                  "pipeline": [
                    {
                      "$match": {
                        "$expr": {
                          "$eq": ["$$courseIdStr", "$courseID"]
                        }
                      }
                    },
                    {
                      "$group": {
                        "_id": null,
                        "count": { "$sum": 1 }
                      }
                    },
                    {
                      "$project": {
                        "_id": 0,
                        "count": 1
                      }
                    }
                  ],
                  "as": "formsCountArray"
                }
              },
              {
                "$addFields": {
                  "formsCount": { 
                    "$ifNull": [ { "$arrayElemAt": ["$formsCountArray.count", 0] }, 0 ] 
                  }
                }
              },
            {
              $lookup: {
                from: "category",
                let: { categoryCodes: { $ifNull: ["$$ROOT.category", []] } },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $in: ["$code", "$$categoryCodes"],
                      },
                    },
                  },
                ],
                as: "categories",
              },
            },
            {
              $group: {
                _id: "$_id",
                // Summary fields
                material: { $first: "$playersCount" },
                document: { $first: "$documentsCount" },
                contest: { $first: "$examsCount" },
                enroll: { $first: "$enrollsCount" },
                form: { $first: "$formsCount" },
                course: { $first: "$$ROOT" },
                category: { $first: "$categories" },
                //player: { $first: "$players" },
                //document: { $first: "$documents" },
                exam: { $first: "$exams" },
                //enrolls: { $first: "$enrolls" },
                
              },
            },
          ];


          const requestData = {
            pipeline
          };
          const resAPI = await Request.POST(`course/aggregate`, requestData, this.configs.key);

          if(resAPI.status===200) {

            RestReturn = resAPI.data;

            if (RestReturn && RestReturn.length > 0) {
              const returnData      = this.processingData(RestReturn);
              this.masterDataRecord = returnData;
              //this.resetData();
              this.courseApiData = RestReturn;
              //this.aggregateAndMapCountsToTabs();
              // Assign Data
              this.playerData   = returnData.formattedData.players ?? null;
              this.courseData   = returnData.formattedData.course ?? null;
              this.courseData.categories   = returnData.formattedData.categories ?? null;
              this.examData     = returnData.formattedData.exam ?? null;
              this.documentData = returnData.formattedData.document ?? null;

              this.playerParent = returnData.playerParentItems;
              this.playerChild  = returnData.playerParentChild;
              this.playerFolder = returnData.playerParentFolder;

              if(this.masterDataRecord) {
                this.playerData.sort(function(a,b){return a.order < b.order ? -1 : 1});
                this.playerParent.sort(function(a,b){return a.order < b.order ? -1 : 1});
                this.playerChild.sort(function(a,b){return a.order < b.order ? -1 : 1});
              }

              this.playerCount        = this.playerData.length;
              this.playerParentCount  = this.playerParent.length
              this.playerChildCount   = this.playerChild.length

              this.courseCategory = this.courseData.categories;
              this.principles     = this.courseData.principles;
              this.objective      = this.courseData.objective;
              this.target         = this.courseData.target;
              this.structure      = this.courseData.structure;
              this.description    = this.courseData.description;
              this.cover          = this.courseData.cover
              this.mode           = this.courseData.mode
              this.display        = this.courseData.display
              this.type           = this.courseData.type
              this.ref            = this.courseData.master
              this.playerRef      = this.courseData.playerRef ?? this.courseData.master
              this.examRef        = this.courseData.examRef ?? this.courseData.master
              this.status         = this.courseData.status ?? true
              this.visibility     = this.courseData.visibility ?? true
              this.examCount      = this.examData.length ?? 0;
              this.documentCount  = this.documentData.length ?? 0;

              this.$setPageTitle("รายละเอียด / " + this.courseData.name);
            }
          }
        } catch (error) {
          //debug.log(error)
        }
      },
    },
    async mounted () {
      try {
        this.isAuthenticated = sessionStorage.getItem('isAuthenticated') === 'true';
        await this.getQueryData();
      } catch (error) {
        console.error(Error);
      }
    },
};
</script>

<style>
/* Your component's styles go here */
</style>
