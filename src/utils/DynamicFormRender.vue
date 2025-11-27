<template>
  {{ formDocumentID }}
  <template v-if="formRawData && formRawData.setData">
      <div v-for="(key, index) in Object.keys(formRawData.setData)" :key="index">
        <div v-for="(contactItem, contactIndex) in formRawData.setData[key]" :key="`contact_${index}_${contactIndex}`" class="w-full text-lg font-normal text-gray-700">
          <!-- <pre>{{ contactItem }}</pre> -->
          <data-set :value="contactItem" :set="key" @set-updated="handleSetDataUpdated"></data-set>
        </div>
      </div>
    </template>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 text-sm mt-3">
      <template v-for="(value, key) in formInput" :key="key">
          <div class="bg-white p-2" v-if="value.value">
            <h2 class="text-md font-semibold mb-1 flex justify-between items-center">
              <span class="truncate">{{ value.name }}</span>
              <button @click="toggleEditMode(value.key)" v-if="!editMode[value.key] && session.role==='admin'">
                <font-awesome-icon :icon="['fas', 'pencil']" class="w-3 text-gray-400" />
              </button>
            </h2> 

              <template v-if="editMode[value.key] && value.master.type === 'select'">
                <div class="relative">
                  <select v-model="newValue[value.key].value" class="mr-2">
                    <option v-for="(option, index) in value.master.options" :key="index" :value="option.value">
                      {{ option.label }}
                    </option>
                  </select>
                  <button @click="updateValueAndLabel(value.key, newValue, value.master.options)" class="mt-1 bg-gray-300 right-[6px] p-2 text-sm top-[6px] rounded-sm text-gray-600">
                    <font-awesome-icon :icon="['fas', 'save']" class="w-3 text-gray-600" /> บันทึก
                  </button>
                </div>
              </template>            

              <template v-if="editMode[value.key] && value.master.type === 'radiobox'">
                <div class="relative">
                  <div v-for="(option, index) in value.master.options" :key="index">

                    <label class="flex items-start mb-2 mt-2 pb-2 pt-2 border-b border-gray-200">
                      <input type="radio" :value="option.value" v-model="newValue[value.key].value" class="mr-2">
                      <div>
                        <span :class="{ 'font-semibold': option.description }">{{ option.label }}</span><br/>
                        <span class="text-gray-600" v-if="option.description">{{ option.description }}</span>
                      </div>
                    </label>
                  
                  </div>
                  <button @click="updateValueAndLabel(value.key, newValue,value.master.options)" class="mt-1 bg-gray-300 right-[6px] p-2 text-sm top-[6px] rounded-sm text-gray-600">
                    <font-awesome-icon :icon="['fas', 'save']" class="w-3 text-gray-600" /> บันทึก
                  </button>
                </div>
              </template>
          
              <template v-if="editMode[value.key] && value.master.type === 'input'">
                <div class="relative">
                <template v-if="newValue[value.key].label">
                  <input v-if="editMode[value.key]" v-model="newValue[value.key].label" placeholder="New value" class="w-full text-gray-500 p-3 text-sm  rounded-sm border border-gray-200"  @keypress.enter="updateInputValue(value.key)">
                  
                </template>
                <template v-else>
                  <input v-if="editMode[value.key]" v-model="newValue[value.key]" placeholder="New value" class="w-full text-gray-500 p-3 text-sm  rounded-sm border border-gray-200"  @keypress.enter="updateInputValue(value.key)">
                </template>
                <button v-if="editMode[value.key]" @click="updateInputValue(value.key)" class="mt-1 bg-gray-300 right-[6px] p-2 text-sm top-[6px] rounded-sm text-gray-600"><font-awesome-icon :icon="['fas', 'save']" class="w-3 text-gray-600" /> บันทึก</button>
                </div>
              </template>

              <template v-else>
                <div class="mb-1" v-if="!editMode[value.key]">
                  <p class="text-gray-500">
                      <template v-if="typeof value.value === 'object' && value.value.label">
                        {{ value.value.label }}
                      </template>
                      <template v-else>
                        {{ value.value }}
                      </template>
                  </p>
                  
              </div> 
              </template>

          </div>
      </template>
    </div>
  
    <template v-if="addressArray.length>0">

    <h2 class="leading-6 text-gray-900 p-3 mt-3 bg-blue-50 border border-gray-200 rounded-sm"><font-awesome-icon :icon="['fas', 'map']" class="" /> ที่อยู่</h2>

    <div class="mt-5 mb-5">
        <address-renderer :addresses="addressArray" @address-updated="handleAddressUpdated" class="text-sm"></address-renderer>
    </div>

    </template>

    <template v-if="formUpload.length>0">
    <h2 class="leading-6 text-gray-900 p-3 bg-blue-50 border border-gray-200 rounded-sm"><font-awesome-icon :icon="['fas', 'file']" class="" /> เอกสาร/รูปภาพ</h2>
    <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-3 text-sm mt-5">
        <div v-for="(item, key) in formUpload" :key="key" class="bg-white p-2">
            <h2 class="text-md font-semibold mb-1" style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">{{ item.name }}</h2>
            <div class="mb-1">
                <div class="image-container">
                <img v-for="(image, index) in item.value" :src="image" :key="index" class="thumbnail" @click="openLightbox(image)" />
                </div>
                <template v-if="session.role==='admin'|| session.role==='user'">
                  <form-upload :data="item.master" :item="item.key" @update:modelValue="handleUploadUpdated" :resetFlag="resetFlag" class="text-sm mt-3"></form-upload>
                </template>
            </div>
        </div>
        <div v-if="showLightbox" class="lightbox" @click="closeLightbox">
          <span class="close">&times;</span>
          <img :src="currentImage" class="lightbox-image" alt="lightbox-image" />
        </div>
      </div>
    </template>

  </template>
  
  <script>
  import toast from '@/plugins/ToastUI.js';
  import storageManager from '@/plugins/storage';
  import DataSet from '@/utils/DynamicFormDatasetRender.vue';
  import AddressRenderer from '@/utils/AddressRenderer.vue';
  import requestClient from '@/plugins/requestClient';
  const Request = new requestClient(false);

  import FormUpload from '@/interface/template/builder/form/FormUpload.vue';
  export default {
    components: {
      AddressRenderer,DataSet,FormUpload
    },
    props: {
      formData: {
        type: Object,
        required: true
      },
      formID: { type: String }
    },
    data() {
      return {
        configs: storageManager.get('configs'),
        session: storageManager.get('session'),
        editMode: {},
        newValue: {},
        formInput: [],
        headerGroup: [],
        formUpload:[],
        setData:[],
        addressArray: [],
        showLightbox: false,
        currentImage: null,
        resetFlag: false,
        postData:this.formData.posts.builder,
        formDocument:this.formData.forms,
        formRawData:this.formData.forms.formData,
        formDocumentID: null
      };
    },
    mounted() {
      this.processFormData();
      this.formDocumentID = this.formID;
    },
    methods: {
      performSearch(type,name) {
        this.searchResult = null;
        this.searchInitiated = true;

        for (const item of this.postData) {
          for (const column of item.columns) {
            const foundObject = column.object.find(
              (obj) => obj.type === type && obj.name === name
            );
            if (foundObject) {
              this.searchResult = foundObject;
              return foundObject;
            }
          }
        }
      },
      openLightbox(image) {
        this.currentImage = image;
        this.showLightbox = true;
      },
      closeLightbox() {
      this.showLightbox = false;
      },
      toggleEditMode(key) {
          this.editMode[key] = !this.editMode[key];
          if (!this.newValue[key]) {
              this.newValue[key] = this.formDocument.formData[key].value;
          }
      },
      handleAddressUpdated(updatedAddresses) {
        this.addressArray = updatedAddresses;
        updatedAddresses.forEach(addressItem => {
          console.log(addressItem.key,addressItem.value)
          this.updateValueByKey(addressItem.key, addressItem.value);
        });
      },
      handleUploadUpdated(upload,item) {
        console.log("handleUploadUpdated",upload,item);
        if (Object.prototype.hasOwnProperty.call(this.formDocument.formData, item)) {
            this.formDocument.formData[item].value = upload;
            console.log("Find",item);
            console.log("found",this.formDocument.formData[item]);
            const index = this.formInput.findIndex(item => item.key === item);
            if (index !== -1) {
              this.formInput[index] = { ...this.formInput[index], value: upload };
            }
            this.resetChildComponent();
            this.updateFormDataInAPI();
            
        } else {
          console.error(`Key ${item} not found in formDocument.`);
        }
      },
      resetChildComponent() {
        setTimeout(() => {
          this.resetFlag = true;
        }, 2000);
      },
      handleSetDataUpdated(updatedData,updatedSet) {
        this.formDocument.formData.setData[updatedSet] = [updatedData];
        console.log("Edit", this.formDocument);
        this.updateFormDataInAPI();
      },
      findFormDataByKey(key) {
        if (Object.prototype.hasOwnProperty.call(this.formDocument.formData, key)) {
          return this.formDocument.formData[key];
        } else {
          return null;
        }
      },
      updateValueByKey(key, newValue) {
        if (Object.prototype.hasOwnProperty.call(this.formDocument.formData, key)) {
            this.formDocument.formData[key].value = newValue;
            const index = this.formInput.findIndex(item => item.key === key);
            if (index !== -1) {
                this.formInput[index] = { ...this.formInput[index], value: newValue };
            }
            this.updateFormDataInAPI();
        } else {
          console.error(`Key ${key} not found in formDocument.`);
        }
    },
    updateInputValue(key) {
      this.editMode[key] = false
      this.updateValueByKey(key, this.newValue[key]);
    },
    updateSingleValue(key, newValue) {
      this.formDocument.formData[key].value = newValue;
      this.updateFormDataInAPI();
    },
    updateValueAndLabel(key, newValue,master) {
      this.editMode[key] = false
      const option = master.find(item => item.value === newValue[key].value);
      this.formDocument.formData[key].value['value'] = newValue[key].value;
      this.formDocument.formData[key].value['label'] = option.label;
      this.updateFormDataInAPI();
    },
    async updateFormDataInAPI() {
        try {
          this.toast = toast({ type: 'pending', message: 'กำลังบันทึกข้อมูล..' });
          let updateData = this.formDocument
          delete updateData._id;
          console.log(this.formDocumentID);
          const { data, status } = await Request.PUT(
            `form/${this.formDocumentID}`,
            { data: updateData },
            this.configs.key
          );

          console.log(status);
          if(status===200) {
            this.toast.hide('บันทึกข้อมูลเสร็จแล้ว.', 'success', 30, () => {
              this.resetFlag = false;
              this.processFormData();
              console.log("Form data update successful:", data);
            });
          } else  {
            this.toast.hide('เกิดข้อผิดพลาด.', 'error', 30, () => {
              console.log("Form data update successful:", data);
            });
          }
        } catch (error) {
          console.error("Error updating form data:", error);
        }
      },
      processFormData() {
        this.formUpload = [];
        this.formInput = [];
        this.addressArray = [];
        this.setData = [];

        const formDataKeys = Object.keys(this.formRawData);
        formDataKeys.forEach(key => {
            const value = this.formRawData[key];
            if (key !== 'setData' && value.type !== 'hidden') {
              if (value.type === 'upload') {
                  const files = Array.isArray(value.value) ? value.value : [value.value];
                  this.formUpload.push({ key, ...value, files });
              } else if (value.type !== 'address') {
                  this.formInput.push({ key, ...value });
              } else {
                  this.addressArray.push({ key, ...value });
              }
            }
        });

        if (this.formRawData.setData) {
            Object.keys(this.formRawData.setData).forEach(key => {
                const setDataItems = this.formRawData.setData[key];
                setDataItems.forEach((setItem, index) => {
                    const uniqueKey = `contact_${key}_${index}`;
                    const processedItem = {
                        key,
                        index,
                        uniqueKey,
                        value: setItem
                    };
                    processedItem.value.forEach(item => {
                        if (item.type === 'text' || item.type === 'number' || item.type === 'email') {
                            item.type = 'input';
                        }
                        const searchResult = this.performSearch(item.type, item.name);
                        if (searchResult) {
                            item.master = searchResult;
                        }
                    });

                    this.setData.push(processedItem);
                });
            });
        }
        this.headerGroup = this.formInput.slice(0, 4);

        this.formInput.forEach(item => {
          if (item.type === 'text' || item.type === 'number' || item.type === 'email') {
            item.type = 'input';
          }
          const searchResult = this.performSearch(item.type, item.name);
          if (searchResult) {
            item.master = searchResult;
          }
        });

        this.formUpload.forEach(item => {
          const searchResult = this.performSearch(item.type, item.name);
          if (searchResult) {
            item.master = searchResult;
          }
        });
      }
    }
  };
  </script>
  
  <style scoped>
  .image-container {
    width: 100%;
    height: 0;
    padding-top: 100%; /* Maintain aspect ratio of the image */
    position: relative;
    overflow: hidden;
  }
  
  .thumbnail {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 10px;
    -o-object-fit: cover;
    object-fit: cover;
    border: solid #e3e3e3 4px;
  }
  /* Lightbox styles */
.lightbox {

    position: fixed;
    z-index: 999;
    padding: 20px;
    background-color: rgba(0, 0, 0, 0.7);
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: auto;
  }
  
  .lightbox-image {
    display: block;
    margin: 0 auto;
    max-width: 90%;
    max-height: 90%;
  }
  
  .close {
    position: absolute;
    top: 15px;
    right: 25px;
    color: white;
    font-size: 35px;
    font-weight: bold;
    cursor: pointer;
  }
  
  .close:hover {
    color: #ccc;
  }
  </style>
  