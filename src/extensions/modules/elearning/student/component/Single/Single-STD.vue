<script>
// Component
import feather from "feather-icons";
import Loader from "@/interface/template/Loader.vue";
import Subhead from "@/interface/template/outline/Subhead.vue";

import Image from "@/interface/template/Image.vue";

import { useRoute } from "vue-router";
import storageManager from "@/plugins/storage";
import convertUtils from "@/plugins/convertUtils";

import Enroll from "@/extensions/modules/elearning/student/component/resource/Enroll.vue";
import Document from "@/extensions/modules/elearning/student/component/resource/Document.vue";
import Order from "@/extensions/modules/elearning/student/component/resource/Order.vue";
import Profile from "@/extensions/modules/elearning/student/component/resource/Profile.vue";
import Wallet from "@/extensions/modules/elearning/student/component/resource/Wallet.vue";

import moment from "moment";

moment().format();

export default {
  components: {
    Loader,
    Subhead,
    Image,
    Enroll,
    Document,
    Order,
    Profile,
    Wallet,
  },
  data() {
    const route = useRoute();
    return {
      configs: storageManager.get("configs"),
      receivedData: "",
      dropdownOpen: false,
      showCertAreaList: false,
      editingExamRound: false,
      editingCertAge: false,
      selectedAreaId: "", // Holds the selected area id
      selectedExamRound: "",
      selectedCertAge: "",
      PageName: route.meta.title,
      PageIcon: route.meta.icon,
      PagePath: route.meta.path,
      ParentName: route.meta.parent,
      ParentPage: route.meta.page,
      schoolData: [],
      profile: [],
      profileLoaded: false,
      enroll: [],
      order: [],
      dataItem: this.$route.params.id,
      loading_sources: true,
      back: "",
      capturedImageSrc: null,
      showPopup: false,
      // Tab Content
      activeTab: "enroll",
      tabs: [
        {
          code: "enroll",
          icon: "book",
          shortname: "Enroll",
          name: "หลักสูตร",
          description: "Personal details and application.",
          badge: 0,
        },
        {
          code: "order",
          icon: "shopping-cart",
          shortname: "Order",
          name: "คำสั่งซื้อ",
          description: "Asset details.",
          badge: 0,
        },
        {
          code: "document",
          icon: "file",
          shortname: "File",
          name: "เอกสาร",
          description: "Admin settings.",
          badge: 0,
        },
        {
          code: "profile",
          icon: "user",
          shortname: "Profile",
          name: "ข้อมูลส่วนตัว",
          description: "Storage information.",
          badge: null,
        },
        {
          code: "wallet",
          icon: "wallet",
          shortname: "Wallet",
          name: "Wallet",
          description: "Wallet information.",
          badge: 0,
        },
      ],
    };
  },
  methods: {
    isTabVisible(tab) {
      const conditions = {
        // 'form': this.courseData.type === 'onsite',
        // 'material': this.courseData.type === 'e_learning' || this.courseData.type === 'online_course',
        // 'survey': this.courseData.survey === 'yes',
      };

      return tab.code in conditions ? conditions[tab.code] : true;
    },
    handleUpdateBadge(payload) {
      const tab = this.tabs.find((tab) => tab.code === payload.code);
      if (tab) {
        tab.badge = payload.badge;
      }
      return tab;
    },
    async setActiveTab(tabCode) {
      this.activeTab = tabCode;
      window.location.hash = `#${tabCode}`;
      const componentMap = {
        form: this.$refs.form,
        material: this.$refs.material,
        survey: this.$refs.survey,
        enroll: this.$refs.enroll,
        document: this.$refs.document,
        contest: this.$refs.contest,
        certification: this.$refs.certification,
      };
      const childComponent = componentMap[tabCode];
      if (childComponent) {
        childComponent.callbackFunction();
      }
      await this.delay(1);
      const selectedTab = this.tabs.find((tab) => tab.code === tabCode);
      if (selectedTab) {
        this.$setPageTitle(selectedTab.name + " / " + this.profile.firstname);
      }
    },
    delay(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    },
    redirectToExternalUrl(token) {
      window.open("https://doa.fti.or.th/bypass?token=" + token, "_blank");
    },
    toggleCertAreaList(area) {
      this.showCertAreaList = !this.showCertAreaList;
      this.selectedAreaId = area;
    },
    toggleCerAgeList(age) {
      this.editingCertAge = !this.editingCertAge;
      this.selectedCertAge = age;
    },
    editExamRound(round) {
      this.editingExamRound = !this.editingExamRound;
      this.selectedExamRound = round;
    },
    openPopup(imageUrl) {
      this.imageUrl = imageUrl;
      this.originalImageUrl = imageUrl;
      this.showPopup = true;
    },
    closePopup() {
      this.showPopup = false;
    },
    handleFileUrlUpdated(fileUrl) {
      this.updataData(fileUrl);
    },
    async updateData(image) {
      const { data, status } = await this.$Request.PUT(
        `user/${this.profile._id}`,
        {
          data: {
            avatar_img: image,
          },
          options: {},
        },
        this.configs.key
      );

      console.log("Data:", data);
      console.log("Status:", status);

      if (status === 200) {
        await this.getData(true);
        console.log("Update Profile Image");
      }
    },
    async submitArea(enroll) {
      try {
        enroll.activeBlock = true;
        this.showCertAreaList = false;
        // Prepare the request headers
        const headers = new Headers();
        headers.append("API-KEY", "5CB584F5ECFD7");
        headers.append("SECRET-KEY", "6A5891C7352197F8A5CE8A9B67EF3");

        // Make the POST request using the fetch API
        const response = await fetch("https://api2.fti.academy/api/editcert", {
          method: "POST",
          headers,
          body: JSON.stringify({
            student: this.profile.token,
            area_cert: this.selectedAreaId,
          }),
        });
        const result = await response.json();

        this.updateEnroll(enroll._id);
        console.log("result", result);
      } catch (error) {
        console.error("An error occurred:", error);
      }
    },
    async submitRound(enroll) {
      try {
        this.editingExamRound = false;
        enroll.activeBlock = true;
        const headers = new Headers();
        headers.append("API-KEY", "5CB584F5ECFD7");
        headers.append("SECRET-KEY", "6A5891C7352197F8A5CE8A9B67EF3");
        const response = await fetch("https://api2.fti.academy/api/editround", {
          method: "POST",
          headers,
          body: JSON.stringify({
            student: this.profile.token,
            exam_round: this.selectedExamRound,
          }),
        });
        const result = await response.json();
        this.updateEnrollRound(enroll._id);
        console.log("result", result);
      } catch (error) {
        console.error("An error occurred:", error);
      }
    },
    async submitAge(enroll) {
      try {
        this.editingCertAge = false;
        enroll.activeBlock = true;
        // Prepare the request headers
        const headers = new Headers();
        headers.append("API-KEY", "5CB584F5ECFD7");
        headers.append("SECRET-KEY", "6A5891C7352197F8A5CE8A9B67EF3");

        // Make the POST request using the fetch API
        const response = await fetch("https://api2.fti.academy/api/edit_certage", {
          method: "POST",
          headers,
          body: JSON.stringify({
            student: this.profile.token,
            cert_age: this.selectedCertAge,
          }),
        });
        const result = await response.json();
        this.updateEnrollAge(enroll._id);
        console.log("result", result);
      } catch (error) {
        console.error("An error occurred:", error);
      }
    },
    async updateEnrollAge(id) {
      try {
        const { data: existingData } = await this.$Request.GET(
          `enroll/${id}`,
          null,
          this.configs.key
        );
        const newData = {
          ...existingData,
          analytics: {
            ...existingData.analytics,
            option: {
              ...existingData.analytics.option,
              cert_age: this.selectedCertAge,
            },
          },
        };

        delete newData._id;

        const { data, status } = await this.$Request.PUT(
          `enroll/${id}`,
          { data: newData },
          this.configs.key
        );

        console.log("Data:", data);
        console.log("Status:", status);

        await this.getData(false);

        if (status === 200) {
          console.log("Enroll " + id + " updated successfully!");
        }
      } catch (error) {
        console.log(error);
      }
    },
    async updateEnrollRound(id) {
      try {
        const { data: existingData } = await this.$Request.GET(
          `enroll/${id}`,
          null,
          this.configs.key
        );
        const newData = {
          ...existingData,
          analytics: {
            ...existingData.analytics,
            option: {
              ...existingData.analytics.option,
              exam_round: this.selectedExamRound,
            },
          },
        };

        delete newData._id;

        const { data, status } = await this.$Request.PUT(
          `enroll/${id}`,
          { data: newData },
          this.configs.key
        );

        console.log("Data:", data);
        console.log("Status:", status);

        await this.getData(false);

        if (status === 200) {
          console.log("Enroll " + id + " updated successfully!");
        }
      } catch (error) {
        console.log(error);
      }
    },
    async updateEnroll(id) {
      try {
        const { data: existingData } = await this.$Request.GET(
          `enroll/${id}`,
          null,
          this.configs.key
        );
        const newData = {
          ...existingData,
          analytics: {
            ...existingData.analytics,
            option: {
              ...existingData.analytics.option,
              cert_area: this.selectedAreaId,
            },
          },
        };

        delete newData._id;

        const { data, status } = await this.$Request.PUT(
          `enroll/${id}`,
          { data: newData },
          this.configs.key
        );

        console.log("Data:", data);
        console.log("Status:", status);

        await this.getData(false);

        if (status === 200) {
          console.log("Enroll " + id + " updated successfully!");
        }
      } catch (error) {
        console.log(error);
      }
    },
    getCertAreaValue(certAreaId) {
      const area = this.cert_area.find((item) => item.id === certAreaId);
      return area ? area.value : "";
    },
    getCertAgeValue(certAgeId) {
      const age = this.cert_age.find((item) => item.id === certAgeId);
      return age ? age.value : "";
    },
    openCertificatePage(token, lesson) {
      window.open(
        "https://doa.fti.or.th/certification-force?token=" + token + "&session=" + lesson,
        "_blank"
      );
    },
    formatThaidate(date) {
      return convertUtils.toThaiDatetime(date, "short");
    },
    dateTime(value) {
      return moment(value).format("DD/MM/YYYY hh:mm:ss");
    },
    async getData(force) {
      if (storageManager.get("session", "login")) {
        try {
          let item = this.$route.params.id;

          if (force) {
            this.loading_sources = false;
          }

          const pipeline = [
            {
              $match: {
                _id: item,
              },
            },
            {
              $lookup: {
                from: "enroll",
                let: { enrollIds: "$enroll" },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $in: [
                          { $toString: "$_id" },
                          { $map: { input: "$$enrollIds", in: { $toString: "$$this" } } },
                        ],
                      },
                    },
                  },
                  {
                    $addFields: {
                      courseID: {
                        $cond: [
                          { $in: [{ $type: "$courseID" }, ["string", "objectId"]] },
                          { $toObjectId: "$courseID" },
                          "$courseID",
                        ],
                      },
                    },
                  },
                  {
                    $lookup: {
                      from: "course",
                      localField: "courseID",
                      foreignField: "_id",
                      as: "courseData",
                    },
                  },
                  {
                    $addFields: {
                      courseData: { $arrayElemAt: ["$courseData", 0] },
                    },
                  },
                  {
                    $unset: ["courseID"],
                  },
                  {
                    $lookup: {
                      from: "order",
                      localField: "courseData._id",
                      foreignField: "courseData._id",
                      as: "orderData",
                    },
                  },
                ],
                as: "enrollData",
              },
            },
            {
              $lookup: {
                from: "course",
                localField: "enrollData.courseID",
                foreignField: "_id",
                as: "courseData",
              },
            },
            {
              $lookup: {
                from: "order",
                let: { orderIds: "$order" },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $in: [
                          { $toString: "$_id" },
                          { $map: { input: "$$orderIds", in: { $toString: "$$this" } } },
                        ],
                      },
                    },
                  },
                  {
                    $addFields: {
                      courseID: {
                        $cond: [
                          { $in: [{ $type: "$courseID" }, ["string", "objectId"]] },
                          { $toObjectId: "$courseID" },
                          "$courseID",
                        ],
                      },
                      userID: {
                        $cond: [
                          { $in: [{ $type: "$userID" }, ["string", "objectId"]] },
                          { $toObjectId: "$userID" },
                          "$userID",
                        ],
                      },
                    },
                  },
                  {
                    $lookup: {
                      from: "course",
                      localField: "courseID",
                      foreignField: "_id",
                      as: "courseData",
                    },
                  },
                  {
                    $addFields: {
                      courseData: { $arrayElemAt: ["$courseData", 0] },
                    },
                  },
                  {
                    $unset: ["courseID"],
                  },
                ],
                as: "orderData",
              },
            },
            {
              $addFields: {
                enroll: {
                  $cond: [
                    { $isArray: "$enrollData" },
                    {
                      $map: {
                        input: "$enrollData",
                        as: "enroll",
                        in: {
                          $mergeObjects: [
                            "$$enroll",
                            {
                              orderData: {
                                $arrayElemAt: [
                                  "$orderData",
                                  {
                                    $indexOfArray: [
                                      "$enrollData.courseData._id",
                                      "$$enroll.courseData._id",
                                    ],
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    },
                    [],
                  ],
                },
                order: "$orderData",
              },
            },
            {
              $project: {
                profile: {
                  $arrayToObject: {
                    $filter: {
                      input: { $objectToArray: "$$ROOT" },
                      cond: {
                        $not: {
                          $in: [
                            "$$this.k",
                            ["enrollData", "orderData", "courseData", "enroll", "order"],
                          ],
                        },
                      },
                    },
                  },
                },
                enroll: "$enroll",
                order: "$order",
              },
            },
          ];

          const { data: RestReturn, status } = await this.$Request.POST(
            "user/aggregate",
            { pipeline },
            this.configs.key
          );

          if (status === 200) {
            const enrollData = RestReturn[0].enroll;
            const orderData = RestReturn[0].order;
            const profileData = RestReturn[0].profile;

            this.profile = profileData;
            this.profileLoaded = true;
            this.order = orderData;
            this.credits =
              profileData && profileData.point && profileData.point.active
                ? profileData.point.active
                : 0;

            // Set activeBlock to false for each item in enrollData
            const processedEnrollData = enrollData.map((item) => ({
              ...item,
              activeBlock: false,
            }));

            this.enroll = processedEnrollData; // Use processedEnrollData

            if (!this.profile.avatar_img) {
              this.profile.avatar_img =
                "https://doa-academy.sgp1.digitaloceanspaces.com/2023/12/1701849647875.png";
            }
            if (force) {
              this.loading_sources = true;
            }
          }
        } catch (error) {
          console.log(error);
        }
      }
    },
    async deleteData(id) {
      if (storageManager.get("session", "login")) {
        try {
          this.loading_sources = false;
          let accessToken = storageManager.get("session", "token");
          let item = this.$route.params.id;
          const resAPI = await fetch(
            "https://asia-southeast2-elearning-6871c.cloudfunctions.net/schools/removeAdmin/" +
              item,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + accessToken,
              },
              body: JSON.stringify({
                userId: id,
              }),
            }
          );

          console.log(await resAPI);

          this.loading_sources = true;
          await this.getData(true);
        } catch (error) {
          console.log(error);
        }
      }
    },
    async getProfileData(id) {
      if (storageManager.get("session", "login")) {
        try {
          const url = `https://faas-sgp1-18bc02ac.doserverless.co/api/v1/web/fn-3bf765c8-bb4f-4bac-ba41-9698000f7334/default/getstudentdata?id=${id}`;
          const response = await fetch(url);
          const data = await response.json();
          console.log(data);
        } catch (error) {
          console.log(error);
        }
      }
    },
    updated() {
      feather.replace();
    },
  },
  async mounted() {
    try {
      await this.getData(true);
    } catch (error) {
      console.log(Error);
    }
  },
  setup() {
    //console.log("Setup");
  },
  created() {
    if (window.location.hash) {
      const hash = window.location.hash.replace("#", "");
      if (this.tabs.some((tab) => tab.code === hash)) {
        this.activeTab = hash;
      }
    }
  },
  computed: {
    TabData() {
      return this.tabs.find((tab) => tab.code === this.activeTab);
    },
    showTaxInvoice() {
      return (
        this.enroll.orderData.address.tax.address.taX_ID &&
        this.enroll.orderData.address.tax.address.owneR_NAME_TH
      );
    },
    imageStyle() {
      return {
        transform: `translate(${this.imagePositionX}px, ${this.imagePositionY}px) scale(${
          this.zoomPercentage / 100
        }) rotate(${this.rotationAngle}deg)`,
      };
    },
  },
};
</script>

<template>
  <div v-if="!loading_sources" class="text-center">
    <Loader />
  </div>

  <Subhead
    v-if="loading_sources"
    :navigation="[
      {
        name: 'ย้อนกลับ',
        link: this.back ? this.back : '/student/dashboard',
        style: 'chevron-left',
        class: 'default-btn',
        visible: true,
        type: 'button',
      },
    ]"
  />

  <Image
    v-if="showPopup"
    :cropImageWidth="'600px'"
    :cropImageHeight="'600px'"
    :uploadPath="'Upload/_profile/'"
    :imageUrl="imageUrl"
    :filePrefix="this.profile._id"
    @fileUrlUpdated="handleFileUrlUpdated"
    @close-popup-event="closePopup"
  />

  <div class="bg-white border-b border-gray-200">
    <div
      v-if="loading_sources"
      class="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8"
    >
      <div class="pt-5">
        <div
          class="mx-auto max-w-3xl md:flex md:items-center md:justify-between md:space-x-5 lg:max-w-7xl"
        >
          <div class="flex items-center space-x-5">
            <div class="flex-shrink-0">
              <div class="relative">
                <div class="h-24 w-24 rounded-md cursor-pointer">
                  <img
                    class="h-full w-full rounded-md"
                    :src="profile.avatar_img"
                    :key="profile.avatar_img"
                    alt=""
                  />
                  <div
                    class="absolute inset-0 rounded-md bg-black bg-opacity-0 hover:bg-opacity-50 flex justify-center items-center transition duration-300"
                    @click="openPopup(profile.avatar_img)"
                  >
                    <font-awesome-icon
                      :icon="['fas', 'upload']"
                      class="text-white text-[24px] opacity-0 hover:opacity-100"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h1 class="text-2xl font-bold text-gray-900">
                {{ this.profile.firstname + " " + this.profile.lastname }}
              </h1>
              <p class="text-sm text-gray-800">
                ลงทะเบียน :
                <span class="text-gray-500">{{ this.profile?.createdAt }}</span>
              </p>
              <p class="text-sm text-gray-800">
                Email : <span class="text-gray-500">{{ this.profile?.email }}</span>
              </p>
              <p class="text-sm text-gray-800">
                Phone : <span class="text-gray-500">{{ this.profile?.phone }}</span>
              </p>
            </div>
          </div>
          <div
            class="justify-stretch mt-6 flex flex-col-reverse space-y-4 space-y-reverse sm:flex-row-reverse sm:justify-end sm:space-y-0 sm:space-x-3 sm:space-x-reverse md:mt-0 md:flex-row md:space-x-3"
          >
            <button
              @click="$router.push('/school/edit/' + this.dataItem)"
              type="button"
              class="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-100"
            >
              <font-awesome-icon
                :icon="['fas', 'pencil']"
                class="text-black text-[12px] mr-2"
              />
              แก้ไข
            </button>

            <button
              @click="redirectToExternalUrl(this.profile.token)"
              type="button"
              class="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-100"
            >
              <font-awesome-icon
                :icon="['fas', 'key']"
                class="text-black text-[12px] mr-2"
              />
              เข้าสู่ระบบ
            </button>

            <button
              type="button"
              class="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-100"
            >
              <font-awesome-icon
                :icon="['fas', 'trash']"
                class="text-black text-[12px] mr-2"
              />
              ลบ
            </button>
          </div>
        </div>
      </div>

      <div>
        <div class="border-t border-gray-200 pt-3 mt-5">
          <ul class="flex space-x-2 tab-navigation" id="tab-list">
            <template v-for="tab in tabs" :key="tab.code">
              <li
                v-if="isTabVisible(tab)"
                :class="{
                  'text-gray-500': activeTab !== tab.code,
                  'text-black': activeTab === tab.code,
                  'border-b-4 border-blue-500': activeTab === tab.code,
                }"
                @click="setActiveTab(tab.code)"
                class="cursor-pointer py-2 px-2"
              >
                <span class="hidden md:inline">
                  <font-awesome-icon :icon="['fas', tab.icon]" />
                  {{ tab.name }}
                  <span
                    v-if="tab.badge !== null"
                    class="text-xs bg-red-500 text-white py-0 px-1 rounded-md text-center"
                    >{{ tab.badge }}</span
                  >
                </span>
                <span class="md:hidden text-xs">
                  <font-awesome-icon :icon="['fas', tab.icon]" />
                  {{ tab.shortname }}
                </span>
              </li>
            </template>
          </ul>

          <div class="mobile-navigation">
            <div class="dropdown" @click="dropdownOpen = !dropdownOpen">
              <div class="dropdown-selected">
                <div class="flex justify-between">
                  <div class="flex">
                    <div class="tab-icon">
                      <font-awesome-icon
                        :icon="['fas', TabData.icon]"
                        class="text-sm mr-2"
                      />
                    </div>
                    <div class="flex flex-col">
                      <div class="status-name">
                        {{ TabData.name }}
                        <span
                          v-if="TabData.badge !== null"
                          class="text-xs bg-red-500 text-white py-0 px-1 rounded-md text-center"
                          >{{ TabData.badge }}</span
                        >
                      </div>
                      <div
                        class="status-description text-xs text-gray-400 single-line-ellipsis"
                      >
                        {{ TabData.description }}
                      </div>
                    </div>
                  </div>
                  <div class="tab-icon icon-line">
                    <font-awesome-icon
                      :icon="dropdownOpen ? ['fas', 'caret-up'] : ['fas', 'caret-down']"
                      class="text-sm ml-2"
                    />
                  </div>
                </div>
              </div>
              <div class="dropdown-content" v-show="dropdownOpen">
                <template v-for="(tab, index) in tabs" :key="index">
                  <div
                    class="dropdown-item"
                    v-if="isTabVisible(tab)"
                    @click="setActiveTab(tab.code)"
                  >
                    <div class="flex">
                      <div class="tab-icon">
                        <font-awesome-icon
                          :icon="['fas', tab.icon]"
                          class="text-sm mr-2"
                        />
                      </div>
                      <div class="flex flex-col">
                        <div
                          class="status-name"
                          :class="{ 'font-bold': tab.code === TabData.code }"
                        >
                          {{ tab.name }}
                          <span
                            v-if="tab.badge !== null"
                            class="text-xs bg-red-500 text-white py-0 px-1 rounded-md text-center"
                            >{{ tab.badge }}</span
                          >
                        </div>
                        <div
                          class="status-description text-xs text-gray-400 single-line-ellipsis"
                        >
                          {{ tab.description }}
                        </div>
                      </div>
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div
    class="mx-auto mt-8 grid max-w-3xl grid-cols-1 gap-6 sm:px-6 lg:max-w-7xl lg:grid-flow-col-dense lg:grid-cols-1"
  >
    <div class="space-y-6 lg:col-span-2 lg:col-start-1">
      <section
        aria-labelledby="applicant-information-title"
        v-if="activeTab === 'enroll'"
      >
        <Enroll
          v-if="profileLoaded"
          :member="profile"
          ref="enroll"
          :tabs="TabData"
          @update-badge="handleUpdateBadge"
        />
      </section>

      <section aria-labelledby="applicant-information-title" v-if="activeTab === 'order'">
        <Order
          v-if="profileLoaded"
          :member="profile"
          ref="order"
          :tabs="TabData"
          @update-badge="handleUpdateBadge"
        />
      </section>

      <section
        aria-labelledby="applicant-information-title"
        v-if="activeTab === 'document'"
      >
        <Document
          v-if="profileLoaded"
          :member="profile"
          ref="document"
          :tabs="TabData"
          @update-badge="handleUpdateBadge"
        />
      </section>

      <section
        aria-labelledby="applicant-information-title"
        v-if="activeTab === 'wallet'"
      >
        <Wallet
          v-if="profileLoaded"
          :member="profile"
          ref="wallet"
          :tabs="TabData"
          @update-badge="handleUpdateBadge"
        />
      </section>

      <section
        aria-labelledby="applicant-information-title"
        v-if="activeTab === 'profile'"
      >
        <Profile
          v-if="profileLoaded"
          :member="profile"
          ref="profile"
          :tabs="TabData"
          @update-badge="handleUpdateBadge"
        />
      </section>
      <!-- Description list-->

      <section
        v-for="enroll in this.enroll"
        :key="enroll._id"
        aria-labelledby="enroll-card"
      >
        <div
          class="bg-white shadow sm:overflow-hidden sm:rounded-lg relative"
          :data-content="'กำลังติดต่อฐานข้อมูล กรุณารอสักครู่.....'"
          :class="[enroll.activeBlock ? 'isblock' : 'isunblock']"
        >
          <div class="divide-y divide-gray-200">
            <div class="bg-black px-4 py-5 sm:px-6 flex justify-between items-center">
              <h2 id="notes-title" class="text-[18px] font-bold text-white">
                {{ enroll.courseData.name }}
              </h2>
              <button
                class="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
              >
                {{ enroll.orderData.status }}
              </button>
            </div>

            <div class="px-2 py-3 sm:px-3">
              <p>
                <span class="text-gray-500">ชื่อผู้อบรม : </span>
                <span class="text-gray-600 font-semibold">{{
                  this.profile.firstname + " " + this.profile.lastname
                }}</span>
              </p>
              <p>
                <span class="text-gray-500">ลงทะเบียนเมื่อ : </span>
                <span class="text-gray-600 font-semibold">{{
                  enroll.orderData.adddate
                }}</span>
              </p>
              <p>
                <span class="text-gray-500">สถานะ : </span>
                <span class="text-gray-600 font-semibold">{{
                  enroll.orderData.status
                }}</span>
              </p>
            </div>

            <div class="px-4 py-6 sm:px-6">
              <ul role="list" class="space-y-8">
                <li>
                  <div>
                    <div class="flex justify-between items-center">
                      <p class="font-semibold text-gray-900">ผลการเรียน</p>

                      <button
                        class="bg-yellow-500 hover:bg-yellow-600 text-black font-medium py-2 px-4 rounded"
                        v-if="
                          enroll.analytics.post.message === 'ผ่านการรับรอง' ||
                          enroll.analytics.retest.message === 'ผ่านการรับรอง'
                        "
                        @click="
                          openCertificatePage(
                            this.profile.token,
                            enroll.courseData.lesson_old_id
                          )
                        "
                      >
                        <font-awesome-icon
                          :icon="['fas', 'download']"
                          class="text-[12px]"
                        />
                        ดาวน์โหลดใบประกาศ
                      </button>

                      <div
                        class="w-32 text-center text-[16px] bg-gray-500 text-white font-medium rounded"
                      >
                        <template v-if="enroll.analytics.status === 'complete'">
                          <template
                            v-if="
                              enroll.analytics.post.score >= enroll.analytics.post.measure
                            "
                          >
                            <div
                              class="w-32 text-center text-[16px] font-medium rounded"
                              :class="{
                                'bg-green-500 text-white':
                                  enroll.analytics.post.message === 'ผ่านการรับรอง',
                                'bg-red-500 text-white':
                                  enroll.analytics.post.message !== 'ผ่านการรับรอง',
                              }"
                            >
                              {{ enroll.analytics.post.message }}
                            </div>
                          </template>

                          <template v-else>
                            <div
                              class="w-32 text-center text-[16px] font-medium rounded"
                              :class="{
                                'bg-green-500 text-white':
                                  enroll.analytics.retest.message === 'ผ่านการรับรอง',
                                'bg-red-500 text-white':
                                  enroll.analytics.retest.message !== 'ผ่านการรับรอง',
                              }"
                            >
                              {{ enroll.analytics.retest.message }}
                            </div>
                          </template>
                        </template>

                        <template v-else>
                          <div class="text-[14px] font-medium p-2">
                            กำลังเรียน ({{ enroll.analytics.processing }}/{{
                              enroll.analytics.total
                            }})
                          </div>
                        </template>
                      </div>
                    </div>

                    <div class="mt-4">
                      <span
                        class="flex items-left mb-2 justify-left text-sm text-gray-500 font-medium"
                      >
                        ความคืบหน้าในการเรียน :
                        <strong
                          >{{
                            Math.floor(
                              (enroll.analytics.complete / enroll.analytics.total) * 100
                            )
                          }}%</strong
                        >
                      </span>
                      <div class="bg-gray-200 h-4 rounded-full">
                        <div
                          class="bg-blue-500 h-full rounded-full"
                          :style="{
                            width: `${
                              (enroll.analytics.complete / enroll.analytics.total) * 100
                            }%`,
                          }"
                        ></div>
                      </div>
                    </div>

                    <div class="mt-4">
                      <div class="grid grid-cols-4 gap-2">
                        <div class="col-span-1">
                          <div class="border border-gray-200 shadow-sm rounded-md p-4">
                            <div class="text-center">
                              <div v-if="editingExamRound">
                                <select
                                  v-model="selectedExamRound"
                                  class="text-md text-blue-500 mr-1"
                                >
                                  <option value="first">รอบแรก</option>
                                  <option value="second">รอบสอง</option>
                                </select>
                                <button
                                  @click="submitRound(enroll)"
                                  class="bg-blue-500 text-white font-medium py-2 px-3 rounded mt-2"
                                >
                                  บันทึก
                                </button>
                              </div>
                              <div v-else>
                                <div class="text-2xl font-bold text-blue-500">
                                  {{
                                    enroll.analytics.option.exam_round === "first"
                                      ? "รอบแรก"
                                      : "รอบสอง"
                                  }}
                                </div>
                              </div>

                              <div class="font-medium text-gray-500">
                                รอบการสอบ
                                <button
                                  @click="
                                    editExamRound(enroll.analytics.option.exam_round)
                                  "
                                  class="bg-transparent font-normal text-sm py-1 px-2 rounded"
                                >
                                  <template v-if="editingExamRound">
                                    <font-awesome-icon
                                      :icon="['fas', 'close']"
                                      class="text-gray-500 hover:text-red-700 text-[12px]"
                                    />
                                    ปิด
                                  </template>

                                  <template v-else>
                                    <font-awesome-icon
                                      :icon="['fas', 'pencil']"
                                      class="text-gray-500 hover:text-red-700 text-[12px]"
                                    />
                                    แก้ไข
                                  </template>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div class="col-span-1">
                          <div class="border border-gray-200 shadow-sm rounded-md p-4">
                            <div class="text-center">
                              <div
                                class="text-2xl font-bold"
                                :class="{
                                  'text-green-500':
                                    enroll.analytics.pre.score >=
                                    enroll.analytics.pre.measure,
                                  'text-red-500':
                                    enroll.analytics.pre.score <
                                    enroll.analytics.pre.measure,
                                }"
                              >
                                {{
                                  enroll.analytics.pre.score
                                    ? enroll.analytics.pre.score
                                    : "0"
                                }}
                              </div>

                              <div class="font-medium text-gray-500">
                                สอบก่อนเรียน
                                <button
                                  class="bg-transparent font-normal text-sm py-1 px-2 rounded"
                                >
                                  <font-awesome-icon
                                    :icon="['fas', 'search']"
                                    class="text-gray-500 hover:text-gray-700 text-[12px]"
                                  />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div class="col-span-1">
                          <div class="border border-gray-200 shadow-sm rounded-md p-4">
                            <div class="text-center">
                              <div
                                class="text-2xl font-bold"
                                :class="{
                                  'text-green-500':
                                    enroll.analytics.post.score >=
                                    enroll.analytics.post.measure,
                                  'text-red-500':
                                    enroll.analytics.post.score <
                                    enroll.analytics.post.measure,
                                }"
                              >
                                {{
                                  enroll.analytics.post.score
                                    ? enroll.analytics.post.score
                                    : "0"
                                }}
                              </div>

                              <div class="font-medium text-gray-500">
                                สอบวัดผล
                                <button
                                  class="bg-transparent font-normal text-sm py-1 px-2 rounded"
                                >
                                  <font-awesome-icon
                                    :icon="['fas', 'search']"
                                    class="text-gray-500 hover:text-gray-700 text-[12px]"
                                  />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div class="col-span-1">
                          <div class="border border-gray-200 shadow-sm rounded-md p-4">
                            <div class="text-center">
                              <template
                                v-if="
                                  enroll.analytics.post.score >=
                                  enroll.analytics.post.measure
                                "
                              >
                                <div class="text-2xl font-bold text-gray-300">
                                  {{
                                    enroll.analytics.retest.score
                                      ? enroll.analytics.retest.score
                                      : "ไม่มีสอบ"
                                  }}
                                </div>
                              </template>

                              <template v-else>
                                <div class="text-2xl font-bold text-red-500">
                                  {{
                                    enroll.analytics.retest.score
                                      ? enroll.analytics.retest.score
                                      : "0"
                                  }}
                                </div>
                              </template>

                              <div class="font-medium text-gray-500">
                                สอบซ่อม
                                <button
                                  class="bg-transparent font-normal text-sm py-1 px-2 rounded"
                                >
                                  <font-awesome-icon
                                    :icon="['fas', 'search']"
                                    class="text-gray-500 hover:text-gray-700 text-[12px]"
                                  />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              </ul>
            </div>

            <div class="px-4 py-6 sm:px-6">
              <ul role="list" class="space-y-8">
                <li>
                  <div>
                    <div class="text-md">
                      <p class="font-semibold text-gray-900">ข้อมูลใบรับรอง</p>
                    </div>

                    <div class="mt-4">
                      <div class="grid grid-cols-1 gap-2">
                        <div class="col-span-1">
                          <div class="border border-gray-200 shadow-sm rounded-md p-4">
                            <div class="text-center">
                              <div class="text-lg font-bold text-blue-500">
                                {{ getCertAreaValue(enroll.analytics.option.cert_area) }}
                              </div>
                              <div class="font-medium text-gray-500">
                                พื้นที่การใช้ใบรับรอง
                                <button
                                  @click="
                                    toggleCertAreaList(enroll.analytics.option.cert_area)
                                  "
                                  class="bg-transparent font-normal text-sm py-1 px-2 rounded"
                                >
                                  <template v-if="showCertAreaList">
                                    <font-awesome-icon
                                      :icon="['fas', 'close']"
                                      class="text-red-500 hover:text-red-700 text-[12px]"
                                    />
                                    ปิด
                                  </template>

                                  <template v-else>
                                    <font-awesome-icon
                                      :icon="['fas', 'pencil']"
                                      class="text-gray-500 hover:text-gray-700 text-[12px]"
                                    />
                                    แก้ไข
                                  </template>
                                </button>
                              </div>
                              <div
                                v-show="showCertAreaList"
                                class="mt-4 text-left p-2 border border-gray-100"
                              >
                                <ul>
                                  <li
                                    v-for="area in cert_area"
                                    :key="area.id"
                                    class="mb-3 pb-3 border-b border-gray-100"
                                  >
                                    <label class="flex items-center">
                                      <input
                                        type="radio"
                                        v-model="selectedAreaId"
                                        :value="area.id"
                                        class="mr-2"
                                      />
                                      {{ area.value }}
                                    </label>
                                  </li>
                                </ul>
                                <button
                                  @click="submitArea(enroll)"
                                  class="mt-2 bg-blue-500 text-white font-medium py-1 px-3 rounded"
                                >
                                  บันทึก
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div class="col-span-1">
                          <div
                            class="border border-gray-200 shadow-sm rounded-md p-4"
                            :class="{ 'opacity-50': !enroll.analytics.option.cert_age }"
                          >
                            <div class="text-center">
                              <div class="text-lg font-bold text-blue-500">
                                {{
                                  getCertAgeValue(enroll.analytics.option.cert_age) ||
                                  "none"
                                }}
                              </div>
                              <div class="font-medium text-gray-500">
                                การจำหน่ายสาร
                                <button
                                  @click="
                                    toggleCerAgeList(enroll.analytics.option.cert_age)
                                  "
                                  class="bg-transparent font-normal text-sm py-1 px-2 rounded"
                                >
                                  <template v-if="editingCertAge">
                                    <font-awesome-icon
                                      :icon="['fas', 'close']"
                                      class="text-red-500 hover:text-red-700 text-[12px]"
                                    />
                                    ปิด
                                  </template>

                                  <template v-else>
                                    <font-awesome-icon
                                      :icon="['fas', 'pencil']"
                                      class="text-gray-500 hover:text-gray-700 text-[12px]"
                                    />
                                    แก้ไข
                                  </template>
                                </button>
                              </div>
                              <div
                                v-show="editingCertAge"
                                class="mt-4 text-left p-2 border border-gray-100"
                              >
                                <ul>
                                  <li
                                    v-for="age in cert_age"
                                    :key="age.id"
                                    class="mb-3 pb-3 border-b border-gray-100"
                                  >
                                    <label class="flex items-center">
                                      <input
                                        type="radio"
                                        v-model="selectedCertAge"
                                        :value="age.id"
                                        class="mr-2"
                                      />
                                      {{ age.value }}
                                    </label>
                                  </li>
                                </ul>
                                <button
                                  @click="submitAge(enroll)"
                                  class="mt-2 bg-blue-500 text-white font-medium py-1 px-3 rounded"
                                >
                                  บันทึก
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              </ul>
            </div>

            <div class="px-4 py-6 sm:px-6">
              <div class="flex justify-between items-center">
                <p class="font-semibold text-gray-900">ข้อมูลการสั่งซื้อ</p>
                <div
                  class="w-24 text-center text-[24px] bg-gray-500 text-white font-medium rounded"
                >
                  {{ enroll.orderData.price }}
                </div>
              </div>
              <div class="mt-2 space-y-2 text-md">
                <div class="mb-5">
                  <p>
                    <span class="text-gray-500">ชื่อผู้สั่งซื้อ : </span>
                    <span class="text-gray-600 font-semibold">{{
                      enroll.orderData.address.invoice.name
                    }}</span>
                  </p>
                  <p>
                    <span class="text-gray-500">วันที่สั่งซื้อ : </span>
                    <span class="text-gray-600 font-semibold">{{
                      enroll.orderData.adddate
                    }}</span>
                  </p>
                  <p>
                    <span class="text-gray-500">ช่องทางการชำระเงิน : </span>
                    <span class="text-gray-600 font-semibold">{{
                      enroll.orderData.payment === "transfer" ? "โอนเงิน" : "บิลเพย์เมนต์"
                    }}</span>
                  </p>
                  <p>
                    <span class="text-gray-500">ใบเสร็จ : </span>
                    <span class="text-gray-600 font-semibold">{{
                      enroll.analytics.option.get_receipt === "online"
                        ? "ออนไลน์"
                        : "ตัวจริง"
                    }}</span>
                  </p>
                  <p>
                    <span class="text-gray-500">Ref1 : </span>
                    <span class="text-gray-600 font-semibold">{{
                      enroll.orderData.ref1
                    }}</span>
                  </p>
                  <p>
                    <span class="text-gray-500">Ref2 : </span>
                    <span class="text-gray-600 font-semibold">{{
                      enroll.orderData.ref2
                    }}</span>
                  </p>
                  <p>
                    <span class="text-gray-500">Ref3 : </span>
                    <span class="text-gray-600 font-semibold">{{
                      enroll.orderData.ref3
                    }}</span>
                  </p>
                </div>

                <div
                  class="flex items-start justify-between border-t border-gray-200 pt-5 pb-5"
                >
                  <div class="w-{{ showTaxInvoice ? '1/3' : '2/3' }} pr-5">
                    <div class="flex items-center">
                      <div>
                        <div class="flex items-center justify-between">
                          <div class="block font-medium text-gray-700 mb-2">
                            ที่อยู่ที่ติดต่อได้/จัดส่งเอกสาร
                          </div>
                          <button
                            class="bg-transparent font-normal text-sm py-1 px-2 rounded"
                          >
                            <font-awesome-icon
                              :icon="['fas', 'pencil']"
                              class="text-gray-500 hover:text-gray-700 text-[10px]"
                            />
                          </button>
                        </div>
                        <span class="font-normal text-sm text-gray-500">
                          {{ enroll.orderData.address.delivery.name }} <br />
                          {{ enroll.orderData.address.delivery.phone }} <br />
                          เลขที่
                          {{
                            enroll.orderData.address.delivery.address.mailinG_NO || "-"
                          }}
                          หมู่
                          {{
                            enroll.orderData.address.delivery.address.mailinG_MOO || "-"
                          }}
                          ถนน
                          {{
                            enroll.orderData.address.delivery.address.mailinG_ROAD_TH ||
                            "-"
                          }}
                          อาคาร
                          {{
                            enroll.orderData.address.delivery.address
                              .mailinG_BUILDING_TH || "-"
                          }}
                          ตำบล
                          {{
                            enroll.orderData.address.delivery.address
                              .mailinG_SUB_DISTRICT_TH || "-"
                          }}
                          อำเภอ
                          {{
                            enroll.orderData.address.delivery.address
                              .mailinG_DISTRICT_TH || "-"
                          }}
                          จังหวัด {{ enroll.orderData.address.delivery.province || "-" }}
                          {{ enroll.orderData.address.delivery.zipcode || "-" }}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div
                    class="w-{{ showTaxInvoice ? '1/3' : '2/3' }} border-l border-r border-gray-300 pl-4 pr-5"
                  >
                    <div class="flex items-center">
                      <div>
                        <div class="flex items-center justify-between">
                          <div class="block font-medium text-gray-700 mb-2">
                            ที่อยู่ออกใบเสร็จ
                          </div>
                          <button
                            class="bg-transparent font-normal text-sm py-1 px-2 rounded"
                          >
                            <font-awesome-icon
                              :icon="['fas', 'pencil']"
                              class="text-gray-500 hover:text-gray-700 text-[10px]"
                            />
                          </button>
                        </div>
                        <span class="font-normal text-sm text-gray-500">
                          {{ enroll.orderData.address.invoice.name }} <br />
                          {{ enroll.orderData.address.invoice.phone }} <br />
                          เลขที่
                          {{
                            enroll.orderData.address.invoice.address.officE_NO ||
                            enroll.orderData.address.invoice.address.taX_NO ||
                            "-"
                          }}
                          หมู่
                          {{
                            enroll.orderData.address.invoice.address.officE_MOO ||
                            enroll.orderData.address.invoice.address.taX_MOO ||
                            "-"
                          }}
                          ถนน
                          {{
                            enroll.orderData.address.invoice.address.officE_ROAD_TH ||
                            enroll.orderData.address.invoice.address.taX_ROAD_TH ||
                            "-"
                          }}
                          อาคาร
                          {{
                            enroll.orderData.address.invoice.address.officE_BUILDING_TH ||
                            enroll.orderData.address.invoice.address.taX_BUILDING_TH ||
                            "-"
                          }}
                          ตำบล
                          {{
                            enroll.orderData.address.invoice.address
                              .officE_SUB_DISTRICT_TH ||
                            enroll.orderData.address.invoice.address
                              .taX_SUB_DISTRICT_TH ||
                            "-"
                          }}
                          อำเภอ
                          {{
                            enroll.orderData.address.invoice.address.officE_DISTRICT_TH ||
                            enroll.orderData.address.invoice.address.taX_DISTRICT_TH ||
                            "-"
                          }}
                          จังหวัด {{ enroll.orderData.address.invoice.province || "-" }}
                          {{ enroll.orderData.address.invoice.zipcode || "-" }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div
                    v-if="
                      enroll.orderData.bill === 'offline' &&
                      enroll.orderData.receipt === 'corp'
                    "
                    class="w-{{ showTaxInvoice ? '1/3' : 'hidden' }} pl-4"
                  >
                    <div class="flex items-center">
                      <div>
                        <div class="flex items-center justify-between">
                          <div class="block font-medium text-gray-700 mb-2">
                            ที่อยู่ออกใบกำกับภาษี
                          </div>
                          <button
                            class="bg-transparent font-normal text-sm py-1 px-2 rounded"
                          >
                            <font-awesome-icon
                              :icon="['fas', 'pencil']"
                              class="text-gray-500 hover:text-gray-700 text-[10px]"
                            />
                          </button>
                        </div>
                        <span class="font-normal text-sm text-gray-500">
                          {{ enroll.orderData.address.tax.address.owneR_NAME_TH }} ({{
                            enroll.orderData.address.tax.address.taX_ID
                          }})<br />
                          {{ enroll.orderData.address.tax.phone }} <br />
                          เลขที่
                          {{ enroll.orderData.address.tax.address.taX_NO || "-" }} หมู่
                          {{ enroll.orderData.address.tax.address.taX_MOO || "-" }} ถนน
                          {{
                            enroll.orderData.address.tax.address.taX_ROAD_TH || "-"
                          }}
                          อาคาร
                          {{
                            enroll.orderData.address.tax.address.taX_BUILDING_TH || "-"
                          }}
                          ตำบล
                          {{
                            enroll.orderData.address.tax.address.taX_SUB_DISTRICT_TH ||
                            "-"
                          }}
                          อำเภอ
                          {{
                            enroll.orderData.address.tax.address.taX_DISTRICT_TH || "-"
                          }}
                          จังหวัด {{ enroll.orderData.address.tax.province || "-" }}
                          {{ enroll.orderData.address.invoice.zipcode || "-" }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <footer
            class="border-t border-gray-300 bg-gray-200 py-4 px-6 flex items-center justify-center"
          >
            <div class="flex space-x-4">
              <button
                class="bg-blue-500 hover:bg-blue-600 text-sm text-white py-2 px-4 rounded"
              >
                Button 1
              </button>
              <button
                class="bg-blue-500 hover:bg-blue-600 text-sm text-white py-2 px-4 rounded"
              >
                Button 2
              </button>
              <button
                class="bg-blue-500 hover:bg-blue-600 text-sm text-white py-2 px-4 rounded"
              >
                Button 3
              </button>
            </div>
          </footer>
        </div>
      </section>

      <!-- Comments-->

      <section aria-labelledby="notes-title">
        <div class="bg-white shadow sm:overflow-hidden sm:rounded-lg">
          <div class="divide-y divide-gray-200">
            <div class="px-4 py-5 sm:px-6">
              <h2 id="notes-title" class="text-lg font-medium text-gray-900">
                คำสั่งซื้อ
              </h2>
            </div>
            <div class="px-4 py-6 sm:px-6">
              <ul role="list" class="space-y-8">
                <li v-for="order in this.order" :key="order._id">
                  <div class="flex space-x-3">
                    <div>
                      <div class="text-md">
                        <a href="#" class="font-medium text-gray-900"
                          >{{ order.courseData.name }} - {{ order.status }}</a
                        >
                      </div>
                      <div class="sm:col-span-1">
                        <dt class="text-sm font-medium text-gray-500">
                          ที่อยู่ในการติดต่อ/จัดส่งเอกสาร
                        </dt>
                        <dd class="mt-1 text-sm text-gray-900">
                          {{ order.address.delivery.name }}
                        </dd>
                        <dd class="mt-1 text-sm text-gray-900">
                          {{ order.address.delivery.address.mailinG_NO }}
                          {{ order.address.delivery.address.mailinG_MOO }}
                          {{ order.address.delivery.address.mailinG_ROAD_TH }}
                          {{ order.address.delivery.address.mailinG_BUILDING_TH }}
                          {{ order.address.delivery.address.mailinG_SUB_DISTRICT_TH }}
                          {{ order.address.delivery.address.mailinG_DISTRICT_TH }}
                        </dd>

                        <dd class="mt-1 text-sm text-gray-900">
                          {{ order.address.delivery.province }}
                        </dd>
                        <dd class="mt-1 text-sm text-gray-900">
                          {{ order.address.delivery.phone }}
                        </dd>
                      </div>

                      <div class="mt-4 sm:col-span-1">
                        <dt class="text-sm font-medium text-gray-500">
                          ที่อยู่ออกใบเสร็จ
                        </dt>
                        <dd class="mt-1 text-sm text-gray-900">
                          {{ order.address.invoice.name }}
                        </dd>
                        <dd class="mt-1 text-sm text-gray-900">
                          {{ order.address.invoice.address.officE_NO }}
                          {{ order.address.invoice.address.officE_MOO }}
                          {{ order.address.invoice.address.officE_ROAD_TH }}
                          {{ order.address.invoice.address.officE_BUILDING_TH }}
                          {{ order.address.invoice.address.officE_SUB_DISTRICT_TH }}
                          {{ order.address.invoice.address.officE_DISTRICT_TH }}
                        </dd>

                        <dd class="mt-1 text-sm text-gray-900">
                          {{ order.address.invoice.province }}
                        </dd>
                        <dd class="mt-1 text-sm text-gray-900">
                          {{ order.address.invoice.phone }}
                        </dd>
                      </div>

                      <div class="mt-4 sm:col-span-1">
                        <dt class="text-sm font-medium text-gray-500">
                          ที่อยู่ในการออกใบกำกับภาษี
                        </dt>
                        <dd class="mt-1 text-sm text-gray-900">
                          {{ order.address.tax.name }}
                        </dd>

                        <dd class="mt-1 text-sm text-gray-900">
                          {{ order.address.tax.address.owneR_NAME_TH }}
                        </dd>
                        <dd class="mt-1 text-sm text-gray-900">
                          {{ order.address.tax.address.taX_ID }}
                          {{ order.address.tax.address.taX_NO }}
                          {{ order.address.tax.address.taX_MOO }}
                          {{ order.address.tax.address.taX_ROAD_TH }}
                          {{ order.address.tax.address.taX_BUILDING_TH }}
                          {{ order.address.tax.address.taX_SUB_DISTRICT_TH }}
                          {{ order.address.tax.address.taX_DISTRICT_TH }}
                        </dd>

                        <dd class="mt-1 text-sm text-gray-900">
                          {{ order.address.tax.province }}
                        </dd>
                        <dd class="mt-1 text-sm text-gray-900">
                          {{ order.address.tax.phone }}
                        </dd>
                      </div>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style>
.master-image {
  display: inline-block;
  vertical-align: top;
}

canvas {
  display: inline-block;
  vertical-align: top;
  border: 1px solid #ccc;
  margin-left: 10px;
}

.tab-navigation {
  display: flex;
}

.mobile-navigation {
  display: none;
}

.dropdown {
  position: relative;
  display: inline-block;
  padding: 10px;
  border: 1px solid #d0d0d0;
  width: 100%;
  border-radius: 5px;
  box-shadow: 0px 1px 4px 0px rgba(0, 0, 0, 0.1);
}

.dropdown-content {
  display: none;
  position: absolute;
  background-color: #fff;
  box-shadow: 0px 1px 4px 0px rgba(0, 0, 0, 0.1);
  z-index: 1;
  width: 100%;
  left: 0;
  top: 70px;
  border: solid 1px #d0d0d0;
  border-radius: 5px;
}

.dropdown-content .dropdown-item {
  color: black;
  padding: 12px 16px;
  text-decoration: none;
  display: block;
}

.dropdown-content .dropdown-item:hover {
  background-color: #bbbbbb;
}
.dropdown:hover .dropdown-content {
  display: block;
}

/* Hide tab navigation and show custom dropdown on small screens */
@media (max-width: 768px) {
  .tab-navigation {
    display: none;
  }

  .mobile-navigation {
    display: block;
    padding: 10px;
  }
}

.single-line-ellipsis {
  white-space: nowrap; /* Prevent line breaks */
  overflow: hidden; /* Hide overflowing content */
  text-overflow: ellipsis; /* Display ellipsis (...) for truncated text */
}
</style>
