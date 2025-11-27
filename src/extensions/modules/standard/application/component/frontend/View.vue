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
          <router-link :to="'/user/profile'" class="text-gray-400 hover:text-gray-500">
            <svg class="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clip-rule="evenodd" />
            </svg>
            <span class="sr-only">Home</span>
          </router-link>
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
          <a href="#" class="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700" aria-current="page">{{assetData.name}}</a>
        </div>
      </li>
    </ol>
  </nav>
  
<div class="bg-gray-50">
  <!-- <pre>{{ userApply }}</pre> -->

  <main class="mx-auto max-w-2xl pb-24 pt-4 sm:px-6 sm:pt-8 lg:max-w-7xl lg:px-8">
    <div class="space-y-2 px-4 sm:flex sm:items-baseline sm:justify-between sm:space-y-0 sm:px-0">
      <div class="flex sm:items-baseline sm:space-x-4">
        <h1 class="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">ใบสมัคร #{{userApply._id}}</h1>
      </div>
      <p class="text-sm text-gray-600">ลงทะเบียนเมื่อ <time datetime="2021-03-22" class="font-medium text-gray-900">{{userApply.createdAt}}</time></p>
    </div>

    <nav class="bg-white mt-8" aria-label="Progress">
      <ol role="list" class="divide-y divide-gray-300 rounded-md border border-gray-300 md:flex md:divide-y-0">
        <li class="relative md:flex md:flex-1">
          <!-- Completed Step -->

          <router-link :to="'/application/form/'+assetData._id +'/form'" class="group flex items-center">
            <span class="flex items-center px-6 py-4 text-sm font-medium">
              <span class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-gray-300 group-hover:border-indigo-600">
                <span class="text-gray-500 group-hover:text-indigo-600">01</span>
              </span>
              <span class="ml-4 text-md font-medium text-gray-500 group-hover:text-indigo-600">
                <span class="block text-gray-400">แบบฟอร์ม</span>
                <span class="block font-bold text-lg">Form</span>
              </span>
            </span>
          </router-link>

          <!-- Arrow separator for lg screens and up -->
          <div class="absolute right-0 top-0 hidden h-full w-5 md:block" aria-hidden="true">
            <svg class="h-full w-full text-gray-300" viewBox="0 0 22 80" fill="none" preserveAspectRatio="none">
              <path d="M0 -2L20 40L0 82" vector-effect="non-scaling-stroke" stroke="currentcolor" stroke-linejoin="round" />
            </svg>
          </div>
        </li>
        <li class="relative md:flex md:flex-1">
          <!-- Current Step -->
          <router-link :to="'/application/document/'+assetData._id" class="group flex items-center">
            <span class="flex items-center px-6 py-4 text-sm font-medium">
              <span class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-gray-300 group-hover:border-indigo-600">
                <span class="text-gray-500 group-hover:text-indigo-600">02</span>
              </span>
              <span class="ml-4 text-md font-medium text-gray-500 group-hover:text-indigo-600">
                <span class="block text-gray-400">เอกสารการสมัคร</span>
                <span class="block font-bold text-lg">Document</span>
              </span>
            </span>
          </router-link>

          <!-- Arrow separator for lg screens and up -->
          <div class="absolute right-0 top-0 hidden h-full w-5 md:block" aria-hidden="true">
            <svg class="h-full w-full text-gray-300" viewBox="0 0 22 80" fill="none" preserveAspectRatio="none">
              <path d="M0 -2L20 40L0 82" vector-effect="non-scaling-stroke" stroke="currentcolor" stroke-linejoin="round" />
            </svg>
          </div>
        </li>
        <li class="relative md:flex md:flex-1">
          <!-- Upcoming Step -->
          <router-link :to="'/application/form/'+assetData._id +'/form'" class="group flex items-center">
            <span class="flex items-center px-6 py-4 text-sm font-medium">
              <span class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-gray-300 group-hover:border-indigo-600">
                <span class="text-gray-500 group-hover:text-indigo-600">03</span>
              </span>
              <span class="ml-4 text-md font-medium text-gray-500 group-hover:text-indigo-600">
                <span class="block text-gray-400">แบบประเมิน</span>
                <span class="block font-bold text-lg">Assemption</span>
              </span>
            </span>
          </router-link>
        </li>
      </ol>
    </nav>
    

    <!-- Products -->
    <section aria-labelledby="products-heading" class="mt-6">
      <h2 id="products-heading" class="sr-only">Products purchased</h2>

      <div class="space-y-4">
        <div class="border-b border-t border-gray-200 bg-white shadow-sm sm:rounded-lg sm:border">
          <div class="px-2 py-3 sm:px-3 lg:grid lg:grid-cols-12 lg:gap-x-8 lg:p-4">
            <div class="sm:flex lg:col-span-7">

              <div class="mt-6 sm:mt-0">
                <h3 class="text-base font-bold text-gray-900">
                  <a href="#">{{assetData.name}}</a>
                </h3>
                <p class="mt-3 text-sm text-gray-500">This durable and portable insulated tumbler will keep your beverage at the perfect temperature during your next adventure.</p>
              </div>
            </div>

            <div class="mt-6 lg:col-span-5 lg:mt-0">
              <dl class="grid grid-cols-2 gap-x-6 text-sm">
                <div>
                  <dt class="font-bold text-gray-900">ผู้พิจารณา</dt>
                  <dd class="mt-3 text-gray-500">
                    <span class="block">Floyd Miles</span>
                    <span class="block">7363 Cynthia Pass</span>
                  </dd>
                </div>
                <div>
                  <dt class="font-bold text-gray-900">สถานะ</dt>
                  <dd class="mt-3 space-y-3 text-gray-500">
                    <p>f•••@example.com</p>
                    <button type="button" class="font-medium text-indigo-600 hover:text-indigo-500">Edit</button>
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <div class="border-t border-gray-200 px-2 py-3 sm:px-3 lg:p-3">
            <h4 class="font-bold">ความคืบหน้า</h4>
            <p class="text-sm font-medium text-gray-900">ล่าสุดเมื่อ <time datetime="2021-03-24">March 24, 2021</time></p>
            <div class="mt-2" aria-hidden="true">
              <div class="overflow-hidden rounded-full bg-gray-200">
                <div class="h-2 rounded-full bg-indigo-600" style="width: calc((1 * 2 + 1) / 8 * 100%)"></div>
              </div>
              <div class="mt-2 hidden grid-cols-4 text-sm font-medium text-gray-600 sm:grid">
                <div class="text-indigo-600">ลงทะเบียน</div>
                <div class="text-center text-indigo-600">ส่งใบสมัคร</div>
                <div class="text-center">ประเมินผล</div>
                <div class="text-right">รับรองการประเมิน</div>
              </div>
            </div>
          </div>
        </div>
      
        <!-- More products... -->
      </div>
    </section>

    <section aria-labelledby="reviews-heading" class="border-t border-gray-200 pt-10 lg:pt-16">
      <div class="space-y-2 px-4 mb-5 sm:flex sm:items-baseline sm:justify-between sm:space-y-0 sm:px-0">
        <div class="flex sm:items-baseline sm:space-x-4">
          <h1 class="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">การสนทนา</h1>
        </div>
        <p class="text-sm text-gray-600">ส่งล่าสุดเมื่อ <time datetime="2021-03-22" class="font-medium text-gray-900">{{userApply.createdAt}}</time></p>
      </div>

      <div class="space-y-10 bg-gray-100 px-4 py-6 sm:rounded-lg sm:px-6 lg:px-8 lg:py-8">
        <div class="flex flex-col sm:flex-row">
            <div class="order-2 mt-6 sm:ml-16 sm:mt-0">
              <h3 class="text-sm font-medium text-gray-900">This is the best white t-shirt out there</h3>
              <p class="sr-only">5 out of 5 stars</p>

              <div class="mt-3 space-y-6 text-sm text-gray-600">
                <p>I've searched my entire life for a t-shirt that reflects every color in the visible spectrum. Scientists said it couldn't be done, but when I look at this shirt, I see white light bouncing right back into my eyes. Incredible!</p>
              </div>
            </div>

            <div class="order-1 flex items-center sm:flex-col sm:items-start">
              <img src="https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&amp;ixqx=oilqXxSqey&amp;ixid=eyJhcHBfaWQiOjEyMDd9&amp;auto=format&amp;fit=facearea&amp;facepad=2&amp;w=256&amp;h=256&amp;q=80" alt="Mark Edwards." class="h-12 w-12 rounded-full">

              <div class="ml-4 sm:ml-0 sm:mt-4">
                <p class="text-sm font-medium text-gray-900">Mark Edwards</p>
                <div class="mt-2 flex items-center">
                  <svg class="text-gray-900 h-5 w-5 flex-shrink-0" x-state:on="Active" x-state:off="Default" x-state-description="Active: &quot;text-gray-900&quot;, Default: &quot;text-gray-200&quot;" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
<path fill-rule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clip-rule="evenodd"></path>
</svg>
                  <svg class="text-gray-900 h-5 w-5 flex-shrink-0" x-state-description="undefined: &quot;text-gray-900&quot;, undefined: &quot;text-gray-200&quot;" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
<path fill-rule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clip-rule="evenodd"></path>
</svg>
                  <svg class="text-gray-900 h-5 w-5 flex-shrink-0" x-state-description="undefined: &quot;text-gray-900&quot;, undefined: &quot;text-gray-200&quot;" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
<path fill-rule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clip-rule="evenodd"></path>
</svg>
                  <svg class="text-gray-900 h-5 w-5 flex-shrink-0" x-state-description="undefined: &quot;text-gray-900&quot;, undefined: &quot;text-gray-200&quot;" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
<path fill-rule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clip-rule="evenodd"></path>
</svg>
                  <svg class="text-gray-900 h-5 w-5 flex-shrink-0" x-state-description="undefined: &quot;text-gray-900&quot;, undefined: &quot;text-gray-200&quot;" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
<path fill-rule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clip-rule="evenodd"></path>
</svg>
                  
                </div>
              </div>
            </div>
          </div>
        <div class="flex flex-col sm:flex-row">
            <div class="order-2 mt-6 sm:ml-16 sm:mt-0">
              <h3 class="text-sm font-medium text-gray-900">Adds the perfect variety to my wardrobe</h3>
              <p class="sr-only">4 out of 5 stars</p>

              <div class="mt-3 space-y-6 text-sm text-gray-600">
      <p>I used to be one of those unbearable minimalists who only wore the same black v-necks every day. Now, I have expanded my wardrobe with three new crewneck options! Leaving off one star only because I wish the heather gray was more gray.</p>
    </div>
            </div>

            <div class="order-1 flex items-center sm:flex-col sm:items-start">
              <img src="https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&amp;auto=format&amp;fit=facearea&amp;facepad=2.5&amp;w=256&amp;h=256&amp;q=80" alt="Blake Reid." class="h-12 w-12 rounded-full">

              <div class="ml-4 sm:ml-0 sm:mt-4">
                <p class="text-sm font-medium text-gray-900">Blake Reid</p>
                <div class="mt-2 flex items-center">
                  <svg class="text-gray-900 h-5 w-5 flex-shrink-0" x-state:on="Active" x-state:off="Default" x-state-description="Active: &quot;text-gray-900&quot;, Default: &quot;text-gray-200&quot;" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
<path fill-rule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clip-rule="evenodd"></path>
</svg>
                  <svg class="text-gray-900 h-5 w-5 flex-shrink-0" x-state-description="undefined: &quot;text-gray-900&quot;, undefined: &quot;text-gray-200&quot;" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
<path fill-rule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clip-rule="evenodd"></path>
</svg>
                  <svg class="text-gray-900 h-5 w-5 flex-shrink-0" x-state-description="undefined: &quot;text-gray-900&quot;, undefined: &quot;text-gray-200&quot;" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
<path fill-rule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clip-rule="evenodd"></path>
</svg>
                  <svg class="text-gray-900 h-5 w-5 flex-shrink-0" x-state-description="undefined: &quot;text-gray-900&quot;, undefined: &quot;text-gray-200&quot;" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
<path fill-rule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clip-rule="evenodd"></path>
</svg>
                  <svg class="text-gray-200 h-5 w-5 flex-shrink-0" x-state-description="undefined: &quot;text-gray-900&quot;, undefined: &quot;text-gray-200&quot;" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
<path fill-rule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clip-rule="evenodd"></path>
</svg>
                  
                </div>
              </div>
            </div>
          </div>
        <div class="flex flex-col sm:flex-row">
            <div class="order-2 mt-6 sm:ml-16 sm:mt-0">
              <h3 class="text-sm font-medium text-gray-900">All good things come in 6-Packs</h3>
              <p class="sr-only">5 out of 5 stars</p>

              <div class="mt-3 space-y-6 text-sm text-gray-600">
      <p>Tasty beverages, strong abs that will never be seen due to aforementioned tasty beverages, and these Basic Tees!</p>
    </div>
            </div>

            <div class="order-1 flex items-center sm:flex-col sm:items-start">
              <img src="https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&amp;auto=format&amp;fit=facearea&amp;facepad=2&amp;w=256&amp;h=256&amp;q=80" alt="Ben Russel." class="h-12 w-12 rounded-full">

              <div class="ml-4 sm:ml-0 sm:mt-4">
                <p class="text-sm font-medium text-gray-900">Ben Russel</p>
                <div class="mt-2 flex items-center">
                  <svg class="text-gray-900 h-5 w-5 flex-shrink-0" x-state:on="Active" x-state:off="Default" x-state-description="Active: &quot;text-gray-900&quot;, Default: &quot;text-gray-200&quot;" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
<path fill-rule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clip-rule="evenodd"></path>
</svg>
                  <svg class="text-gray-900 h-5 w-5 flex-shrink-0" x-state-description="undefined: &quot;text-gray-900&quot;, undefined: &quot;text-gray-200&quot;" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
<path fill-rule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clip-rule="evenodd"></path>
</svg>
                  <svg class="text-gray-900 h-5 w-5 flex-shrink-0" x-state-description="undefined: &quot;text-gray-900&quot;, undefined: &quot;text-gray-200&quot;" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
<path fill-rule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clip-rule="evenodd"></path>
</svg>
                  <svg class="text-gray-900 h-5 w-5 flex-shrink-0" x-state-description="undefined: &quot;text-gray-900&quot;, undefined: &quot;text-gray-200&quot;" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
<path fill-rule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clip-rule="evenodd"></path>
</svg>
                  <svg class="text-gray-900 h-5 w-5 flex-shrink-0" x-state-description="undefined: &quot;text-gray-900&quot;, undefined: &quot;text-gray-200&quot;" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
<path fill-rule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clip-rule="evenodd"></path>
</svg>
                  
                </div>
              </div>
            </div>
          </div>
        
      </div>
    </section>

    <!-- Billing -->
    <section aria-labelledby="summary-heading" class="mt-16">
      <h2 id="summary-heading" class="sr-only">Billing Summary</h2>

      <div class="bg-gray-100 px-4 py-6 sm:rounded-lg sm:px-6 lg:grid lg:grid-cols-12 lg:gap-x-8 lg:px-8 lg:py-8">
        <dl class="grid grid-cols-2 gap-6 text-sm sm:grid-cols-2 md:gap-x-8 lg:col-span-7">
          <div>
            <dt class="font-medium text-gray-900">Billing address</dt>
            <dd class="mt-3 text-gray-500">
              <span class="block">Floyd Miles</span>
              <span class="block">7363 Cynthia Pass</span>
              <span class="block">Toronto, ON N3Y 4H8</span>
            </dd>
          </div>
          <div>
            <dt class="font-medium text-gray-900">Payment information</dt>
            <dd class="-ml-4 -mt-1 flex flex-wrap">
              <div class="ml-4 mt-4 flex-shrink-0">
                <svg aria-hidden="true" width="36" height="24" viewBox="0 0 36 24" class="h-6 w-auto">
                  <rect width="36" height="24" rx="4" fill="#224DBA" />
                  <path d="M10.925 15.673H8.874l-1.538-6c-.073-.276-.228-.52-.456-.635A6.575 6.575 0 005 8.403v-.231h3.304c.456 0 .798.347.855.75l.798 4.328 2.05-5.078h1.994l-3.076 7.5zm4.216 0h-1.937L14.8 8.172h1.937l-1.595 7.5zm4.101-5.422c.057-.404.399-.635.798-.635a3.54 3.54 0 011.88.346l.342-1.615A4.808 4.808 0 0020.496 8c-1.88 0-3.248 1.039-3.248 2.481 0 1.097.969 1.673 1.653 2.02.74.346 1.025.577.968.923 0 .519-.57.75-1.139.75a4.795 4.795 0 01-1.994-.462l-.342 1.616a5.48 5.48 0 002.108.404c2.108.057 3.418-.981 3.418-2.539 0-1.962-2.678-2.077-2.678-2.942zm9.457 5.422L27.16 8.172h-1.652a.858.858 0 00-.798.577l-2.848 6.924h1.994l.398-1.096h2.45l.228 1.096h1.766zm-2.905-5.482l.57 2.827h-1.596l1.026-2.827z" fill="#fff" />
                </svg>
                <p class="sr-only">Visa</p>
              </div>
              <div class="ml-4 mt-4">
                <p class="text-gray-900">Ending with 4242</p>
                <p class="text-gray-600">Expires 02 / 24</p>
              </div>
            </dd>
          </div>
        </dl>

        <dl class="mt-8 divide-y divide-gray-200 text-sm lg:col-span-5 lg:mt-0">
          <div class="flex items-center justify-between pb-4">
            <dt class="text-gray-600">Subtotal</dt>
            <dd class="font-medium text-gray-900">$72</dd>
          </div>
          <div class="flex items-center justify-between py-4">
            <dt class="text-gray-600">Shipping</dt>
            <dd class="font-medium text-gray-900">$5</dd>
          </div>
          <div class="flex items-center justify-between py-4">
            <dt class="text-gray-600">Tax</dt>
            <dd class="font-medium text-gray-900">$6.16</dd>
          </div>
          <div class="flex items-center justify-between pt-4">
            <dt class="font-medium text-gray-900">Order total</dt>
            <dd class="font-medium text-indigo-600">$83.16</dd>
          </div>
        </dl>
      </div>
    </section>
  </main>
</div>


</template>