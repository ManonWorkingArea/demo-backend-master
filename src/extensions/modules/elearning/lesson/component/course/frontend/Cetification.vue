<script>
import html2canvas from "html2canvas";
//import jsPDF from "jspdf";
import QRCode from "qrcode";
import convertUtils from "@/plugins/convertUtils";
import storageManager from '@/plugins/storage';

import ResultComponent from '../resource/CertificationRender.vue';

import requestClient from '@/plugins/requestClient';
const Request = new requestClient(false);

import debug from '@/plugins/Logger.js';

export default {
  components: {
    ResultComponent,
  },
  name: "Certification",
  props: {
    dataItem: {
      type: String,
      default: null,
    },
    userId: {
      type: String,
      default: null,
    },
  },
  data() {
    return {
      configs: storageManager.get('configs'),
      session: storageManager.get('session'),
      certification: [],
      lesson: [],
      user: [],
      cert: {
        image: "",
      },
      qrCodeUrl: null,
      showImage: false,
      certImageSrc: null,
      certificationTemplate: [],
      certMode:"",
      backgroundImage: null,
      courseIDs: ['646399b1db2e5913d490fdc1', '646399b3db2e5913d490fdc2', '646399b5db2e5913d490fdc3', '646399b6db2e5913d490fdc4', '646399b8db2e5913d490fdc5', '65c967c4e83775a8e0d42771', '64ba0f8e95b73060a5db8674'],
    };
  },
  computed: {
    resolvedDataItem() {
      return this.dataItem || this.$route.params.cid;
    },
    resolvedUserId() {
      return this.userId || this.$route.params.uid;
    },
  },
  async mounted() {
    try {
      if (this.resolvedUserId) {
        this.certMode = "new"
        await this.getUserAndCertificationData();
      } else {
        this.certMode = "old"
        await this.getData();
      }
    } catch (error) {
      debug.log(error);
    }
  },
  methods: {
    handleBackgroundImage(imageUrl) {
      this.backgroundImage = imageUrl;
    },
    getCustomStyle() {
      debug.log("Theme", this.cert.template);
      if (this.cert.template === 'custom') {
        return {
          backgroundColor: 'red',
          fontSize: '16px',
          paddingTop: '400px',
        };
      } else {
        return {};
      }
    },
    formatDateWithAge(date, age) {
      const newDate = new Date(date);
      const ageNumber = parseInt(age, 10);
      newDate.setFullYear(newDate.getFullYear() + ageNumber);
      debug.log("date", date);
      debug.log("newDate", newDate);
      return this.formatThaidate(newDate, 'date');
    },
    formatThaidate(date) {
      return convertUtils.toThaiDatetime(date, 'date');
    },
    async generateQRCode() {
      try {
        const url = "https://fti.academy/lesson/certification/" + this.resolvedDataItem + "/" + this.resolvedUserId;
        const qrCodeUrl = await QRCode.toDataURL(url);
        this.qrCodeUrl = qrCodeUrl;
      } catch (error) {
        console.error(error);
      }
    },
    downloadPDF() {
      this.$refs.resultComponentRef.captureDivAsCanvas();
      /*
      html2canvas(this.$refs.resultComponentRef.$el, {
        useCORS: true,
        allowTaint: true,
        scale: 4, // Increase the scale for higher resolution (you can experiment with values 3, 4, or higher)
        dpi: 600, // Add this to increase DPI (dots per inch)
        imageSmoothingEnabled: true, // Smoothens the image
      }).then((resultComponentCanvas) => {
        const resultComponentImage = resultComponentCanvas.toDataURL("image/png");

        const pdf = new jsPDF("l", "mm", [297, 210]);
        pdf.addImage( 
          resultComponentImage,
          "JPEG",
          0,
          0,
          pdf.internal.pageSize.width,
          pdf.internal.pageSize.height,
          undefined,
          "NONE"
        );

        pdf.save("fti_academy_certification_" + this.dataItem + ".pdf");
      });
      */
    },
    async generateImage() {
      const element = this.$refs.certContainer;
      const bgImage = this.backgroundImage;

      try {
        const canvas = await html2canvas(element, {
          useCORS: true,
          background: bgImage,
          allowTaint: true,
          scale: 4, // Increase scale for higher resolution rendering
          dpi: 600, // Increase DPI for sharper images
          imageSmoothingEnabled: true, // Smoothens the image

        });
        this.certImageSrc = canvas.toDataURL("image/jpeg", 1.0);
        this.showImage = true;
      } catch (error) {
        console.error(error);
      }
    },
    async getData() {
      try {
        this.loading_sources = false;

        const pipeline = [
          {
            $match: {
              $expr: {
                $eq: ["$_id", { $toObjectId: this.resolvedDataItem }],
              },
            },
          },
          {
            $lookup: {
              from: "user",
              let: { userId: { $toObjectId: "$userID" } },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ["$_id", "$$userId"] },
                  },
                },
              ],
              as: "user",
            },
          },
          {
            $unwind: "$user",
          },
          {
            $lookup: {
              from: "course",
              let: { courseId: { $toObjectId: "$courseID" } },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ["$_id", "$$courseId"] },
                  },
                },
              ],
              as: "course",
            },
          },
          {
            $unwind: "$course",
          },
          {
            $lookup: {
              from: "form",
              let: { userId: "$userID", courseId: "$courseID" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ["$userID", "$$userId"] },
                        { $eq: ["$courseID", "$$courseId"] }
                      ]
                    }
                  }
                },
                {
                  $set: { formID: { $toObjectId: "$formID" } }
                }
              ],
              as: "forms"
            }
          },
        ];

        const certresAPI = await fetch(`https://gateway.cloudrestfulapi.com/api/certification/aggregate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json', 'client-token-key': this.configs.key
          },
          body: JSON.stringify({ pipeline })
        });

        const CertReturn = await certresAPI.json();
        debug.log("CertReturn", CertReturn[0]);

        if (certresAPI.status === 200) {
          this.certification = CertReturn[0];
          this.lesson = CertReturn[0].course;
          this.user = CertReturn[0].user;

          if (CertReturn[0].course.certification_template === "custom") {
            const responseHost = await Request.GET(`certification_template/${CertReturn[0].course.certificationId}`, this.configs.key);
            if (responseHost.status === 200) {
              this.certificationTemplate = responseHost.data;
            }
          } else {
            const requestData = {
              method: 'find',
              args: [{ $and: [{ unit: this.session.current._id, default: true }] }],
            };
            const resAPICert = await Request.POST('certification_template/query', requestData, this.configs.key);
            if (resAPICert.status !== 200) {
              throw new Error(`Failed to fetch player data from API`);
            }
            debug.log("resAPICert", resAPICert.data);
            this.certificationTemplate = resAPICert.data[0];
          }

          this.generateQRCode().then(() => {
            this.generateImage();
          });
        }
      } catch (error) {
        debug.log(error)
      }
    },
    async getUserAndCertificationData() {
      try {
        this.loading_sources = false;

        const pipeline = [
          {
            $match: {
              $expr: {
                $eq: ["$_id", { $toObjectId: this.resolvedDataItem }],
              },
            },
          },
          {
            $lookup: {
              from: "user",
              let: { userId: { $toObjectId: this.resolvedUserId } },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ["$_id", "$$userId"] },
                  },
                },
              ],
              as: "user",
            },
          },
          {
            $unwind: "$user",
          },
          {
            $lookup: {
              from: "form",
              let: { userId: this.resolvedUserId, courseId: this.resolvedDataItem },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ["$userID", "$$userId"] },
                        { $eq: ["$courseID", "$$courseId"] }
                      ]
                    }
                  }
                },
                {
                  $set: { formID: { $toObjectId: "$formID" } }
                }
              ],
              as: "forms"
            }
          },
          {
            $lookup: {
              from: "enroll",
              let: { userId: this.resolvedUserId, courseId: this.resolvedDataItem },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ["$userID", "$$userId"] },
                        { $eq: ["$courseID", "$$courseId"] }
                      ]
                    }
                  }
                },
                {
                  $set: { formID: { $toObjectId: "$formID" } }
                }
              ],
              as: "enrolls"
            }
          },
          {
            $replaceRoot: {
              newRoot: {
                course: "$$ROOT",user: "$user",forms: "$forms",enrolls: "$enrolls"
              }
            }
          }
        ];

        const certresAPI = await fetch(`https://gateway.cloudrestfulapi.com/api/course/aggregate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json', 'client-token-key': this.configs.key
          },
          body: JSON.stringify({ pipeline })
        });

        const CertReturn = await certresAPI.json();
        debug.slack("CertReturn", CertReturn[0].course.certificationId);

        if (certresAPI.status === 200) {
          this.certification = CertReturn[0];
          this.lesson = CertReturn[0].course;
          this.user = CertReturn[0].user;
          this.enroll = CertReturn[0].enrolls;

          let post = CertReturn[0]?.enrolls[0]?.analytics?.post;
          let retest = CertReturn[0]?.enrolls[0]?.analytics?.retest;

          if (post?.score >= post?.measure) {
            console.log("pass");
            // Case 1: Post score is greater than or equal to post measure
            // Do nothing
          } else if (post?.score < post?.measure && retest?.score >= retest?.measure) {
            console.log("pass");
            // Case 2: Post score is less than post measure and Retest score is greater than or equal to retest measure
            // Do nothing
          } else if (post?.score < post?.measure && retest?.score < retest?.measure) {
            console.log("no pass");
            // Case 3: Post score is less than post measure and Retest score is less than retest measure
            //this.$router.push("/");
          } else {
            console.log("no pass");
            // Case 4: Post score is less than post measure and no retest
            //this.$router.push("/");
          }

          if (CertReturn[0].course.certification_template === "custom") {
            const responseHost = await Request.GET(`certification_template/${CertReturn[0].course.certificationId}`, this.configs.key);
            if (responseHost.status === 200) {
              this.certificationTemplate = responseHost.data;
            }
          } else {
            const requestData = {
              method: 'find',
              args: [{ $and: [{ unit: this.session.current._id, default: true }] }],
            };
            const resAPICert = await Request.POST('certification_template/query', requestData, this.configs.key);
            if (resAPICert.status !== 200) {
              throw new Error(`Failed to fetch player data from API`);
            }
            debug.log("resAPICert", resAPICert.data);
            this.certificationTemplate = resAPICert.data[0];
          }

          this.generateQRCode().then(() => {
            this.generateImage();
          });
        }
      } catch (error) {
        debug.log(error)
      }
    },
  },
};
</script>

<template>
  <div>
    <div class="mx-auto max-w-2xl px-3 pt-2 pb-2 sm:px-6 sm:pt-2 sm:pb-2 lg:max-w-7xl">
      <!-- Heading and button layout -->
      <div class="flex items-center justify-between flex-wrap sm:flex-nowrap">
        <!-- Heading -->
        <h1 class="text-md font-bold w-full sm:w-auto text-center mb-3 sm:mb-0">{{ lesson.name }}</h1>
      </div>
    
      <!-- Buttons layout (moves to new row in mobile) -->
      <div class="flex flex-col sm:flex-row sm:justify-between mt-3 space-y-2 sm:space-y-0">
        <router-link :to="'/lesson/detail/' + lesson._id" class="bg-gray-500 hover:bg-gray-600 text-white py-1 px-3 rounded text-sm w-full sm:w-auto text-center">
          กลับหน้าหลัก
        </router-link>
        <button @click="downloadPDF" class="bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded text-sm w-full sm:w-auto text-center sm:ml-3">
          <font-awesome-icon :icon="['fas', 'download']" class="mr-1.5 h-3 w-3 flex-shrink-0 text-white" />
          ดาวน์โหลดใบรับรอง
        </button>
      </div>
    </div>
    
    

    <div class="flex items-center justify-center pt-5 pb-5 bg-gray-600">
      <result-component
        :certId="userId"
        :pages="certificationTemplate.pages"
        :certMode="certMode"
        :certData="certification"
        :debug="false"
        @backgroundImageChange="handleBackgroundImage"
        ref="resultComponentRef"
      />
    </div>
  </div>
</template>

<style scoped>
@media print {
  html,
  body {
    width: 297mm;
    height: 210mm;
    margin: 0;
    padding: 0;
  }

  .certification-container {
    width: 297mm;
    height: 210mm;
    position: relative;
  }

  .certification-img {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
}

.certification-container {
  width: 297mm;
  height: 210mm;
  position: relative;
}

.certification-img {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.certification-content {
  z-index: 2;
  position: absolute;
  width: 100%;
  height: 100%;
  text-align: center;
  padding-top: 375px;
  padding-left: 50px;
  padding-right: 50px;
}

.eco-cert {
  padding-top: 275px;
}
.eco-cert .text-blue-800 {
  color: #036214;
}

.certification-bg {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.certification-bg img {
  position: absolute;
  z-index: 1;
}

.certification-qr {
  position: absolute;
  z-index: 9;
  bottom: 50px;
  left: 50px;
  width: 110px;
}
</style>
