<script>

// Component
import feather from 'feather-icons';
import Loader from '@/interface/template/Loader.vue';
import storageManager from '@/plugins/storage';
import moment from 'moment';
moment().format();

export default {
    data() {
      return {
        login: storageManager.get('session','login'),
        configs: storageManager.get('configs'),
        session: storageManager.get('session'),
        assetData: [],
        userApply: [],
        dataItem: this.$route.params.id,
        loading_sources: true,
        documentTypeOptions: ['.jpg', '.jpeg', '.png', '.gif', '.doc', '.docx', '.pdf', '.xls', '.xlsx'],
        isFormOpen: false,
        formTitle: '',
        formAction: '',
        form: {
          name: '',
          slug: '',
          description: '',
        },
        editIndex: -1,
        currentSection: '',
        sections: ['status', 'form', 'document']
      }
    },
    components: {
      Loader
    },
    methods: {

      updateDocumentType() {
      if (this.form.documentType.length > 1) {
        this.form.documentType = [this.form.documentType[this.form.documentType.length - 1]];
      }
    },

      capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
      },

      closeForm() {
        this.isFormOpen = false;
      },

      openForm(action, section) {
        this.isFormOpen = true;
        this.currentSection = section;

        if (action === 'add') {
          this.formTitle = 'Add Item';
          this.formAction = 'Add';

          if (section === 'form') {
            this.form = {
              name: '',
              slug: '',
              description: '',
              type: 'form',
              default: false,
              builder: [],
            };
          } else {
            this.form = {
              name: '',
              slug: '',
              description: '',
              default: false,
            };
          }
        } else if (action === 'edit') {
          this.formTitle = 'Edit Item';
          this.formAction = 'Save';
        }
      },

      saveItem() {
        if (this.formAction === 'Add') {
          this.assetData[this.currentSection].push({ ...this.form });
        } else if (this.formAction === 'Save') {
          this.assetData[this.currentSection][this.editIndex] = { ...this.form };
        }
        this.updateData();
        this.isFormOpen = false;
      },

      editItem(index, section) {
        this.openForm('edit', section);
        this.form = { ...this.assetData[section][index] };
        this.editIndex = index;
      },

      removeItem(index, section) {
        this.assetData[section].splice(index, 1);
        this.updateData();
      },

      moveItemUp(index, section) {
        if (index > 0) {
          this.swapItems(index, index - 1, section);
        }
      },

      moveItemDown(index, section) {
        if (index < this.assetData[section].length - 1) {
          this.swapItems(index, index + 1, section);
        }
      },

      swapItems(index1, index2, section) {
        [this.assetData[section][index1], this.assetData[section][index2]] = [this.assetData[section][index2], this.assetData[section][index1]];
        this.updateData();
      },

      makeDefault(index, section) {
        if (section === 'form') {
          this.assetData.form.forEach((item, i) => {
            if (i === index) {
              item.default = true;
            } else {
              item.default = false;
            }
          });
        } else if (section === 'status') {
          this.assetData.status.forEach((item, i) => {
            if (i === index) {
              item.default = true;
            } else {
              item.default = false;
            }
          });
        } else if (section === 'document') {
          this.assetData.document.forEach((item, i) => {
            if (i === index) {
              item.default = true;
            } else {
              item.default = false;
            }
          });
        }
        this.updateData();
      },

      dateTime(value) {
        return moment(value).format("DD/MM/YYYY hh:mm:ss");
      },
      async getUserData() {
        if(storageManager.get('session','login')) {
          try {
            this.loading_sources  = false;
            const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/apply/query", {
                  method: 'POST',
                  headers: {'Content-Type': 'application/json','client-token-key':this.configs.key},
                  body: JSON.stringify({
                      method: 'find',
                      args: [
                      {
                        $and: [
                          { 
                            userID: this.session.userID,
                            applicationID: this.dataItem
                          }
                        ]
                      }
                      ]
                  })
              });

              const RestReturn   = await resAPI.json();
            if(resAPI.status === 200) {
                return RestReturn[0];
            }
            this.loading_sources = true;
          } catch (error) {
            console.log(error)
          }
        }
      },
      async getData() {
        if(storageManager.get('session','login')) {
          try {
            let item              = this.$route.params.id;
            this.loading_sources  = false;
            const resAPI          = await fetch("https://gateway.cloudrestfulapi.com/api/application/" + item,
            {
              method: 'GET',
              headers: {'Content-Type': 'application/json','client-token-key':this.configs.key},
            });

            const RestReturn   = await resAPI.json();
            console.log("RestReturn",RestReturn);

            if(resAPI.status === 200) {
              this.assetData   = RestReturn;
              this.userApply   = await this.getUserData();

              console.log(this.userApply);
              this.loading_sources  = true;
            }
            this.loading_sources = true;

          } catch (error) {
            console.log(error)
          }
        }
      },
      async updateData() {
        try {
          const response = await fetch('https://gateway.cloudrestfulapi.com/api/application/' + this.assetData._id, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json','client-token-key':this.configs.key
            },
            body: JSON.stringify({
              data: {
                form: this.assetData.form,
                document: this.assetData.document,
                status: this.assetData.status,
              },
              options: {}
            })
          });
          const data = await response.json();
          console.log(data);

          if(response.status===200) {
            this.$swal({
              toast: true,
              position: 'bottom-end',
              showConfirmButton: false,
              timer: 3000,
              icon: 'success',
              title: 'บันทึกข้อมูลหน้าเว็บ',
              text: 'บันทึกข้อมูลสำหรับหน้าเว็บนี้ สำเร็จแล้ว',
            });
          }
        } catch (error) {
          console.error(error);
        }
      },
      async applyApplication() {
        let finalRes = null;
        if (this.login) {
          try {
            this.activeBlock = true;

            const statusItem = this.assetData.status.find(item => item.firstItem === true);
            console.log(statusItem);
            
            const registerIndex = this.assetData.status.findIndex((status) => status.slug === statusItem.slug);

            if (registerIndex !== -1 && registerIndex < this.assetData.status.length - 1) {
              const nextStatus = this.assetData.status
              .slice(registerIndex + 1)
              .find((status) => status.submit === true && status.action === 'user');
              console.log("Next status:", nextStatus);
              const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/apply/", {
                method: 'POST',
                headers: {'Content-Type': 'application/json','client-token-key':this.configs.key},
                body: JSON.stringify({
                  data: {
                    "userID":this.session.userID,
                    "applicationID":this.dataItem,
                    "form":[],
                    "document":[],
                    "assign":false,
                    "status":statusItem.slug,
                    "next": nextStatus ? nextStatus.slug : undefined,
                  },
                  options: {}
                })
              });

              finalRes = await resAPI.json();
              console.log("finalRes", finalRes);

              if (resAPI.status === 200) {
                this.activeBlock = false;

                this.$swal({
                  icon: 'success',
                  title: 'ลงทะเบียนเรียบร้อยแล้ว',
                  text: 'ระบบกำลังดึงข้อมูลหลักสูตรของคุณ กรุณารอสักครู่',
                  showCancelButton: false,
                  confirmButtonText: 'OK',
                }).then(() => {
                  this.userApply = finalRes
                });
              }
            } else {
              console.log("No status found after 'register'.");
            }
          } catch (error) {
            console.log(error)
          }
        }
        else
        {
          console.log("not Logic");
        }
      },
      async actionApplication(doStatus) {
        try {
          const currentIndex = this.assetData.status.findIndex(status => status.slug === doStatus);
          const nextStatus = this.assetData.status.slice(currentIndex + 1).find(status => status.slug !== doStatus && status.action === 'user');
          if (nextStatus) {
            console.log("Next status:", nextStatus);
          } else {
            console.log("No next status found.");
          }
          const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/apply/" + this.userApply._id, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json','client-token-key':this.configs.key },
            body: JSON.stringify({
              data: {
                "status": doStatus,
                "next": nextStatus ? nextStatus.slug : '',
              },
              options: {}
            })
          });

          const finalRes = await resAPI.json();
          console.log("finalRes", finalRes);
          this.userApply = finalRes

        } catch (error) {
          console.log(error);
        }
      },
      updated() {
        feather.replace();
      },
    },
    async mounted () {
      try {
        await this.getData();
      } catch (error) {
        console.log(Error);
      }
    },
    setup() {
      //console.log("Setup");
    },
    computed: {
    firstStatusItem() {
      if (this.assetData.status && this.assetData.status.length > 0) {
        return this.assetData.status[0].slug;
      }
      return null; // or any other default value you prefer
    },
    getNextStatusName() {
      const currentIndex = this.assetData.status.findIndex(status => status.slug === this.userApply.next);
      if (currentIndex !== -1 && currentIndex < this.assetData.status.length - 1) {
        return this.assetData.status[currentIndex].name;
      } else {
        return '';
      }
    }
  },
  watch: {
    userApply(newValue) {
      console.log('userApply updated:', newValue);
    },
  },

};
</script>

<template>

  <div v-if="!loading_sources" class="text-center"><Loader/></div>

  <nav class="flex border-b border-gray-200 bg-white" aria-label="Breadcrumb">
    <ol role="list" class="mx-auto flex w-full max-w-screen-xl space-x-4 px-4 sm:px-6 lg:px-8">
      <li class="flex">
        <div class="flex items-center">
          <a href="#" class="text-gray-400 hover:text-gray-500">
            <svg class="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clip-rule="evenodd" />
            </svg>
            <span class="sr-only">Home</span>
          </a>
        </div>
      </li>
      <li class="flex">
        <div class="flex items-center">
          <svg class="h-full w-6 flex-shrink-0 text-gray-200" viewBox="0 0 24 44" preserveAspectRatio="none" fill="currentColor" aria-hidden="true">
            <path d="M.293 0l22 22-22 22h1.414l22-22-22-22H.293z" />
          </svg>
          <router-link :to="'/application/home/'" class=" ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">
            แบบฟอร์มทั้งหมด
          </router-link>
        </div>
      </li>
      <li class="flex">
        <div class="flex items-center">
          <svg class="h-full w-6 flex-shrink-0 text-gray-200" viewBox="0 0 24 44" preserveAspectRatio="none" fill="currentColor" aria-hidden="true">
            <path d="M.293 0l22 22-22 22h1.414l22-22-22-22H.293z" />
          </svg>
          <router-link :to="'/application/view/' + assetData._id" class=" ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">
            {{assetData.name}}
          </router-link>
        </div>
      </li>
      <li class="flex">
        <div class="flex items-center">
          <svg class="h-full w-6 flex-shrink-0 text-gray-200" viewBox="0 0 24 44" preserveAspectRatio="none" fill="currentColor" aria-hidden="true">
            <path d="M.293 0l22 22-22 22h1.414l22-22-22-22H.293z" />
          </svg>
          <a href="#" class="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700" aria-current="page">แบบฟอร์ม A</a>
        </div>
      </li>
    </ol>
  </nav>
  
<div class="bg-gray-50">

  <main class="mx-auto max-w-2xl pb-24 pt-4 sm:px-6 sm:pt-8 lg:max-w-7xl lg:px-8">
    <div class="space-y-2 px-4 sm:flex sm:items-baseline sm:justify-between sm:space-y-0 sm:px-0">
      <div class="flex sm:items-baseline sm:space-x-4">
        <h1 class="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">เอกสารการสมัคร #{{userApply._id}}</h1>
      </div>
      <p class="text-sm text-gray-600">ลงทะเบียนเมื่อ <time datetime="2021-03-22" class="font-medium text-gray-900">March 22, 2021</time></p>
    </div>
    
    <!-- Products -->
    <section aria-labelledby="products-heading" class="mt-6">

      <div class="mt-3 grid grid-cols-4">
    
        <div class="border-b border-t border-gray-200 bg-white shadow-sm sm:rounded-lg sm:border">
          <div class="px-4 py-4 sm:px-4 lg:p-4">
            <div class="">
              <label for="cover-photo" class="block text-sm font-bold leading-6 text-gray-900">Document A</label>
              <p class="text-sm font-medium text-gray-500">คำอธิบายเกี่ยวกับเอกสารนี้</p>
              <div class="mt-3 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
                <div class="text-center">
                  <svg class="mx-auto h-12 w-12 text-gray-300" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z" clip-rule="evenodd" />
                  </svg>
                  <div class="mt-4 flex text-sm leading-6 text-gray-600">
                    <label for="file-upload" class="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500">
                      <span>Upload a file</span>
                      <input id="file-upload" name="file-upload" type="file" class="sr-only">
                    </label>
                    <p class="pl-1">or drag and drop</p>
                  </div>
                  <p class="text-xs leading-5 text-gray-600">PNG, JPG, GIF up to 10MB</p>
                </div>
              </div>
            </div>
          </div>
    
          <div class="border-t border-gray-200 px-4 py-4 sm:px-4 lg:p-4">
            <h4 class="sr-only">Status</h4>
            <p class="text-sm font-medium text-gray-900">เอกสารที่อัพโหลดแล้ว <time datetime="2021-03-23">March 23, 2021</time></p>
            <div class="mt-6" aria-hidden="true">
              <ul role="list" class="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3 sm:gap-x-4 lg:grid-cols-3 xl:gap-x-4">
                <li class="relative">
                  <div class="group aspect-h-7 aspect-w-10 block w-full overflow-hidden rounded-lg bg-gray-100 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 focus-within:ring-offset-gray-100">
                    <img src="https://images.unsplash.com/photo-1582053433976-25c00369fc93?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=512&q=80" alt="" class="pointer-events-none object-cover group-hover:opacity-75">
                    <button type="button" class="absolute inset-0 focus:outline-none">
                      <span class="sr-only">View details for IMG_4985.HEIC</span>
                    </button>
                  </div>
                  <p class="pointer-events-none mt-2 block truncate text-sm font-medium text-gray-900">IMG_4985.HEIC</p>
                  <p class="pointer-events-none block text-sm font-medium text-gray-500">3.9 MB</p>
                </li>
                <!-- Repeat the list items for each product -->
              </ul>
            </div>
          </div>
        </div>

        <div class="border-b border-t border-gray-200 bg-white shadow-sm sm:rounded-lg sm:border">
          <div class="px-4 py-4 sm:px-4 lg:p-4">
            <div class="">
              <label for="cover-photo" class="block text-sm font-bold leading-6 text-gray-900">Document B</label>
              <p class="text-sm font-medium text-gray-500">คำอธิบายเกี่ยวกับเอกสารนี้</p>
              <div class="mt-3 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
                <div class="text-center">
                  <svg class="mx-auto h-12 w-12 text-gray-300" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z" clip-rule="evenodd" />
                  </svg>
                  <div class="mt-4 flex text-sm leading-6 text-gray-600">
                    <label for="file-upload" class="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500">
                      <span>Upload a file</span>
                      <input id="file-upload" name="file-upload" type="file" class="sr-only">
                    </label>
                    <p class="pl-1">or drag and drop</p>
                  </div>
                  <p class="text-xs leading-5 text-gray-600">PNG, JPG, GIF up to 10MB</p>
                </div>
              </div>
            </div>
          </div>
    
          <div class="border-t border-gray-200 px-4 py-4 sm:px-4 lg:p-4">
            <h4 class="sr-only">Status</h4>
            <p class="text-sm font-medium text-gray-900">เอกสารที่อัพโหลดแล้ว <time datetime="2021-03-23">March 23, 2021</time></p>
            <div class="mt-6" aria-hidden="true">
              <ul role="list" class="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3 sm:gap-x-4 lg:grid-cols-3 xl:gap-x-4">
                <li class="relative">
                  <div class="group aspect-h-7 aspect-w-10 block w-full overflow-hidden rounded-lg bg-gray-100 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 focus-within:ring-offset-gray-100">
                    <img src="https://images.unsplash.com/photo-1582053433976-25c00369fc93?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=512&q=80" alt="" class="pointer-events-none object-cover group-hover:opacity-75">
                    <button type="button" class="absolute inset-0 focus:outline-none">
                      <span class="sr-only">View details for IMG_4985.HEIC</span>
                    </button>
                  </div>
                  <p class="pointer-events-none mt-2 block truncate text-sm font-medium text-gray-900">IMG_4985.HEIC</p>
                  <p class="pointer-events-none block text-sm font-medium text-gray-500">3.9 MB</p>
                </li>
                <!-- Repeat the list items for each product -->
              </ul>
            </div>
          </div>
        </div>

        <div class="border-b border-t border-gray-200 bg-white shadow-sm sm:rounded-lg sm:border">
          <div class="px-4 py-4 sm:px-4 lg:p-4">
            <div class="">
              <label for="cover-photo" class="block text-sm font-bold leading-6 text-gray-900">Document C</label>
              <p class="text-sm font-medium text-gray-500">คำอธิบายเกี่ยวกับเอกสารนี้</p>
              <div class="mt-3 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
                <div class="text-center">
                  <svg class="mx-auto h-12 w-12 text-gray-300" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z" clip-rule="evenodd" />
                  </svg>
                  <div class="mt-4 flex text-sm leading-6 text-gray-600">
                    <label for="file-upload" class="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500">
                      <span>Upload a file</span>
                      <input id="file-upload" name="file-upload" type="file" class="sr-only">
                    </label>
                    <p class="pl-1">or drag and drop</p>
                  </div>
                  <p class="text-xs leading-5 text-gray-600">PNG, JPG, GIF up to 10MB</p>
                </div>
              </div>
            </div>
          </div>
    
          <div class="border-t border-gray-200 px-4 py-4 sm:px-4 lg:p-4">
            <h4 class="sr-only">Status</h4>
            <p class="text-sm font-medium text-gray-900">เอกสารที่อัพโหลดแล้ว <time datetime="2021-03-23">March 23, 2021</time></p>
            <div class="mt-6" aria-hidden="true">
              <ul role="list" class="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3 sm:gap-x-4 lg:grid-cols-3 xl:gap-x-4">
                <li class="relative">
                  <div class="group aspect-h-7 aspect-w-10 block w-full overflow-hidden rounded-lg bg-gray-100 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 focus-within:ring-offset-gray-100">
                    <img src="https://images.unsplash.com/photo-1582053433976-25c00369fc93?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=512&q=80" alt="" class="pointer-events-none object-cover group-hover:opacity-75">
                    <button type="button" class="absolute inset-0 focus:outline-none">
                      <span class="sr-only">View details for IMG_4985.HEIC</span>
                    </button>
                  </div>
                  <p class="pointer-events-none mt-2 block truncate text-sm font-medium text-gray-900">IMG_4985.HEIC</p>
                  <p class="pointer-events-none block text-sm font-medium text-gray-500">3.9 MB</p>
                </li>

              </ul>
            </div>
          </div>
        </div>
    
      </div>
    </section>

    <section aria-labelledby="summary-heading" class="mt-16">
      <h2 id="summary-heading" class="sr-only">Information to Upload Document in System</h2>
    
      <div class="bg-gray-100 px-4 py-6 sm:rounded-lg sm:px-6">
          <div class="overflow-hidden">
            <div class="px-4 py-5 sm:p-6">
              <h3 class="text-lg font-medium leading-6 text-gray-900">Upload Document</h3>
              <div class="mt-4">
                <p class="text-gray-600">To upload your document:</p>
                <ol class="list-decimal list-inside mt-2 text-gray-700">
                  <li>Click on the "Choose File" button.</li>
                  <li>Select the document you want to upload from your device.</li>
                  <li>Review the document details.</li>
                  <li>Allowed File Types: PDF, DOCX, JPG, PNG.</li>
                  <li>File Size Limit: Maximum 10MB.</li>
                  <li>Click "Upload" to proceed.</li>
                </ol>
              </div>
            </div>
          </div>
      </div>
    </section>
    
    
  
  </main>
</div>


</template>