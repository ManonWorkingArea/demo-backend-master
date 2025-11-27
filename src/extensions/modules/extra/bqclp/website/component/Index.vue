<script>
import Subhead from '@/interface/template/outline/Subhead.vue';
import storageManager from '@/plugins/storage';
import FileBrowser          from '@/interface/modal/FileBrowser.vue';

export default {
  name: 'ContactUs',
  inject: ['apiServer'],
  data() {
    return {
        title: '',
        slug: 'newpage-slug',
        content: '',
        display: 'single',
        type: 'page',
        owner: '',
        configs: storageManager.get('configs'),
        session: storageManager.get('session'),
        activeBlock: false,
        editing: undefined,
        isComment: undefined,
        isCounter: undefined,
        isMenu: undefined,
        layout: undefined,
        parent:undefined,
        FileBrowserOpen: false,
        parentList: [],
        searchTerm: '',
        showDropdown: false,
        destination: 'form', // default value is 'form'
        defaultCollectionOptions: ['form', 'message'], // dynamic options
    }
  },
  components: {
    Subhead,FileBrowser
  },
  computed: {
    filteredParentList() {
      return this.parentList.filter((parent) =>
        parent.title.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    },
  },
  methods: {
    slugify(str) {
      if (!str || typeof str !== 'string') {
        return '';
      }
      str = str.trim().toLowerCase();
      var from = "àáãäâèéëêìíïîòóöôùúüûñç·/_,:;";
      var to = "aaaaaeeeeiiiioooouuuunc------";
      for (var i = 0, l = from.length; i < l; i++) {
        str = str.replace(new RegExp(from.charAt(i), "g"), to.charAt(i));
      }
      str = str
        .replace(/[^a-z0-9 -]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
      var lastDotIndex = str.lastIndexOf(".");
      if (lastDotIndex !== -1) {
        str = str.substring(0, lastDotIndex);
      }
      return str;
    },
    async checkSlugExists(slug) {
      try {
        const apiUrl = 'https://gateway.cloudrestfulapi.com/api/post/query';
        const requestBody = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json','client-token-key':this.configs.key },
          body: JSON.stringify({
            method: 'find',
            args: [
              {
                $and: [
                  { owner: this.session.current.id },
                  { slug: slug },
                ],
              },
            ],
          }),
        };
        const response = await fetch(apiUrl, requestBody);
        const data = await response.json();
        return data.length > 0;
      } catch (error) {
        console.log(error);
        return false;
      }
    },
    updateSlug() {
      const newSlug = this.slugify(this.slug);
      let count = 1;
      const checkSlug = async (slug) => {
        const slugExists = await this.checkSlugExists(slug);
        if (slugExists) {
          slug = `${slug}-${count}`;
          count++;
          checkSlug(slug);
        } else {
          console.log('Slug is available',slug);
          this.slug = slug;
          this.editing = false;
        }
      };
      checkSlug(newSlug);
    },
    onTitleInput() {
      let slug = this.slugify(this.title);
      let count = 1;
      const checkSlug = async (slug) => {
        const slugExists = await this.checkSlugExists(slug);
        if (slugExists) {
          slug = `${slug}-${count}`;
          count++;
          checkSlug(slug);
        } else {
          console.log('Slug is available',slug);
          this.slug = slug;
        }
      };
      checkSlug(slug);
    },
    removeParent() {
      this.searchTerm = ''
      this.parent = undefined;
    },
    OpenFileBrowser(index)
    {
      this.selectedSlideItemIndex = index;
      this.FileBrowserOpen = true;
    },
    changeFileTrigger(payload) {
      this.FileBrowserOpen = payload;
    },
    selectFileTrigger(payload) {
      console.log("selectFileTrigger");
      if(payload!=undefined) {
        this.selectCourseCover = payload;
        console.log("selectFileReturnFunction",payload.file)
        this.feature_image = payload.file
        this.selectedSlideItemIndex = undefined;
      }
    },
    selectParent(parent) {
      console.log('Selected parent:', parent);
      this.parent = parent
      this.showDropdown = false;
    },
    async getData() {
      if (storageManager.get('session', 'login')) {
        try {
          this.loading_sources = false;

          const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/post/query", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json','client-token-key':this.configs.key },
            body: JSON.stringify({
              method: 'find',
              args: [
                { $and: [{ owner: this.session.current._id,type: 'page' }] }
              ]
            })
          });

          const RestReturn  = await resAPI.json();
          this.parentList   = RestReturn;
          this.loading_sources = true;

        } catch (error) {
          console.log(error)
        }
      }
    },
    async addPost() {
      try {
        this.activeBlock = true;
        const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/post/", {
          method: 'POST',
          headers: {'Content-Type': 'application/json','client-token-key':this.configs.key},
          body: JSON.stringify({
            data: {
                title: this.title,
                slug: this.slug,
                content: this.content,
                display: this.display,
                type: this.type,
                isComment: this.isComment,
                isCounter: this.isCounter,
                isMenu: this.isMenu,
                status: this.status,
                authen: this.authen,
                parent: this.parent,
                destination: this.destination,
                feature_image: this.feature_image,
                owner: this.session.current._id,
                builder: [],
            },
            options: {
              uniqueFields: [
                ["slug"]
              ]
            }
          })
        });
        const finalRes   = await resAPI.json();
        console.log(finalRes);
        this.$router.replace(`/cms/edit/${finalRes._id}`);
      } catch (error) {
        console.log(error)
      }
    }
  },
  setup() {
  },
  async mounted() {
    try {
        await this.getData();
        const parentId = this.$route.params.id;
        const parent = this.parentList.find((item) => item._id === parentId);
        if (parent) {
        this.parent = parent;
        }
    } catch (error) {
        console.log(Error);
    }
  },
}
</script>

<template>

    <Subhead
      :navigation="
      [
      {
          name: 'ย้อนกลับ',
          link: '/cms/content',
          style: 'chevron-left',
          class: 'default-btn',
          visible: true,
          type: 'button',
      },
      ]"
    />

    <FileBrowser class="z-[9999]"
    v-if="FileBrowserOpen" 
    :isWindowsOpen="true" 
    :callbackFunction="'cover'"
    :allowFileType="['jpg','gif','png','jpeg']" 
    @file-browser-trigger="changeFileTrigger" 
    @file-browser-callback="selectFileTrigger"/>

  <div class="mt-8 mx-auto max-w-3xl px-4 sm:px-6 md:flex md:items-center md:justify-between md:space-x-5 lg:max-w-7xl lg:px-8">
    <div class="flex items-center space-x-5 w-full">
      <div class="w-full">
      <input
        v-model="title"
        type="text"
        name="title"
        id="title"
        autocomplete="title"
        class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 text-lg"
        placeholder="Title"
        @keyup.enter="onTitleInput"
      >
      <div>
        <div class="mt-3 flex items-center h-[50px] bg-gray-200 rounded-md p-4 pl-5 pr-5">
          <span class="text-gray-500 mr-3 border-r border-gray-300 pr-3"><i class="fas fa-home"></i></span>
          <span class="text-green-500 mr-2"><i class="fas fa-lock"></i></span>
          <p class="hidden md:block text-gray-700">https://<span class="text-gray-400">{{ session.current.hostname }}</span>/cms/read/</p>
          <template v-if="!editing && slug">
            <p class="pl-0 ml-0 text-green-600">{{ slug }}</p>
            <button @click="editing = true" class="ml-2"><i class="w-3 h-3 fas fa-pencil-alt text-gray-500"></i></button>
          </template>
          <template v-else>
            <input v-model="slug" @keyup.enter="updateSlug" type="text" class="slug-input p-1 rounded-sm border border-gray-300 focus:outline-none">
            <button @click="updateSlug" class="ml-2"><i class="w-4 h-4 fas fa-save text-gray-500"></i></button>
          </template>
        </div>
      </div>

      </div>
    </div>
  </div>

  <div class="mx-auto mt-4 grid max-w-3xl grid-cols-1 gap-6 sm:px-6 lg:max-w-7xl lg:grid-flow-col-dense lg:grid-cols-3">
    <div class="space-y-6 lg:col-span-2 lg:col-start-1">

      <section aria-labelledby="applicant-information-title">
        <div class="bg-white shadow sm:rounded-lg">
          <div class="border-t border-gray-200 px-4 py-5 sm:px-6">
            <div class="section-group">
              <label class="popup-label block mb-2 pb-2 font-semibold">ประเภทเนื้อหา</label>
              <div class="grid grid-cols-4 gap-2">
                <label class="radio-label p-2 flex flex-col items-center justify-center cursor-pointer border border-gray-300 rounded-sm" :class="{ 'bg-gray-200': type === 'page' }">
                  <span>
                    <img src="https://vue-project.sgp1.digitaloceanspaces.com/ui-icon/staticpng.png" alt="Unset" class="w-10 h-10 mb-2" />
                  </span>
                  <input type="radio" v-model="type" value="page" class="radio-input hidden" />
                  <span class="text-center text-sm text-gray-500">Page</span>
                </label>
                <label class="radio-label p-2 flex flex-col items-center justify-center cursor-pointer border border-gray-300 rounded-sm" :class="{ 'bg-gray-200': type === 'form' }">
                  <span>
                    <img src="https://vue-project.sgp1.digitaloceanspaces.com/ui-icon/relativepng.png" alt="Block" class="w-10 h-10 mb-2" />
                  </span>
                  <input type="radio" v-model="type" value="form" class="radio-input hidden" />
                  <span class="text-center text-sm text-gray-500">Form</span>
                </label>
                <label class="radio-label p-2 flex flex-col items-center justify-center cursor-pointer border border-gray-300 rounded-sm" :class="{ 'bg-gray-200': type === 'layout' }">
                  <span>
                    <img src="https://vue-project.sgp1.digitaloceanspaces.com/ui-icon/absolutepng.png" alt="Full Width" class="w-10 h-10 mb-2" />
                  </span>
                  <input type="radio" v-model="type" value="layout" class="radio-input hidden" />
                  <span class="text-center text-sm text-gray-500">Layout</span>
                </label>

                <label class="radio-label p-2 flex flex-col items-center justify-center cursor-pointer border border-gray-300 rounded-sm" :class="{ 'bg-gray-200': type === 'menu' }">
                  <span>
                    <img src="https://vue-project.sgp1.digitaloceanspaces.com/ui-icon/absolutepng.png" alt="Full Width" class="w-10 h-10 mb-2" />
                  </span>
                  <input type="radio" v-model="type" value="menu" class="radio-input hidden" />
                  <span class="text-center text-sm text-gray-500">Menu</span>
                </label>
                
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Applicant Information -->
      <section aria-labelledby="applicant-information-title" v-if="type === 'page'">
        <div class="bg-white shadow sm:rounded-lg p-4">
          <h2 id="applicant-information-title" class="text-lg font-medium leading-6 text-gray-900">Page Content</h2>
      
          <div class="mt-6">
            <label class="popup-label block mb-2 pb-2 font-semibold">การแสดงผล</label>
            <div class="grid grid-cols-2 gap-4">
              <label class="radio-label flex flex-col items-center justify-center cursor-pointer border border-gray-300 rounded-sm p-4" :class="{ 'bg-gray-200': display === 'single' }">
                <img src="https://vue-project.sgp1.digitaloceanspaces.com/ui-icon/staticpng.png" alt="Unset" class="w-10 h-10 mb-2" />
                <input type="radio" v-model="display" value="single" class="radio-input hidden" />
                <span class="text-center text-sm text-gray-500">หน้าเว็บ</span>
              </label>
              <label class="radio-label flex flex-col items-center justify-center cursor-pointer border border-gray-300 rounded-sm p-4" :class="{ 'bg-gray-200': display === 'group' }">
                <img src="https://vue-project.sgp1.digitaloceanspaces.com/ui-icon/relativepng.png" alt="Block" class="w-10 h-10 mb-2" />
                <input type="radio" v-model="display" value="group" class="radio-input hidden" />
                <span class="text-center text-sm text-gray-500">หน้ารวม</span>
              </label>
            </div>
          </div>
      
          <label class="popup-label block mt-3 font-semibold">การแสดงผล</label>
          <div class="grid grid-cols-2 gap-4">
            <div class="col-span-4 sm:col-span-1 flex items-start">
              <label for="isComment" class="flex items-center">
                <input
                  v-model="isComment"
                  type="checkbox"
                  id="isComment"
                  class="rounded-sm border-gray-300 focus:border-gray-900 focus:ring-gray-900"
                />
                <div class="ml-3">
                  <label for="isComment" class="block text-md font-medium text-gray-700">Comment</label>
                  <p class="text-xs text-gray-500">Enable comments for the page</p>
                </div>
              </label>
            </div>
          
            <div class="col-span-4 sm:col-span-1 flex items-start">
              <label for="isCounter" class="flex items-center">
                <input
                  v-model="isCounter"
                  type="checkbox"
                  id="isCounter"
                  class="rounded-sm border-gray-300 focus:border-gray-900 focus:ring-gray-900"
                />
                <div class="ml-3">
                  <label for="isCounter" class="block text-md font-medium text-gray-700">Visitor Counter</label>
                  <p class="text-xs text-gray-500">Display a visitor counter on the page</p>
                </div>
              </label>
            </div>
          
            <div class="col-span-4 sm:col-span-1 flex items-start">
              <label for="isMenu" class="flex items-center">
                <input
                  v-model="isMenu"
                  type="checkbox"
                  id="isMenu"
                  class="rounded-sm border-gray-300 focus:border-gray-900 focus:ring-gray-900"
                />
                <div class="ml-3">
                  <label for="isMenu" class="block text-md font-medium text-gray-700">Menu</label>
                  <p class="text-xs text-gray-500">Include the page in the site navigation menu</p>
                </div>
              </label>
            </div>
          
          </div>
          
        </div>
      </section>

      <section aria-labelledby="applicant-information-title" v-if="type === 'layout'">
        <div class="bg-white shadow sm:rounded-lg">
          <div class="px-4 py-5 sm:px-6">
            <h2 id="applicant-information-title" class="text-lg font-medium leading-6 text-gray-900">Layout Content</h2>
          </div>
          <div class="border-t border-gray-200 px-4 py-5 sm:px-6">
            <div class="grid grid-cols-2 gap-2">

              <div class="col-span-4 sm:col-span-1">
                <label for="title" class="block text-sm font-medium text-gray-700">title</label>
                <input 
                v-model="title" 
                type="text" name="title" id="title" autocomplete="title" 
                class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm">
              </div>	

              <div class="col-span-4 sm:col-span-1">
                <label for="slug" class="block text-sm font-medium text-gray-700">slug</label>
                <input 
                v-model="slug" 
                type="text" name="slug" id="slug" autocomplete="slug" 
                class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm">
              </div>

              <div class="col-span-4 sm:col-span-1">
                <label for="content" class="block text-sm font-medium text-gray-700">content</label>
                <input 
                v-model="content" 
                type="text" name="content" id="content" autocomplete="content" 
                class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm">
              </div>

            </div>

          </div>
        </div>
      </section>

      <section aria-labelledby="applicant-information-title" v-if="type === 'form'">
        <div class="bg-white shadow sm:rounded-lg">
          <div class="px-4 py-5 sm:px-6">
            <h2 id="applicant-information-title" class="text-lg font-medium leading-6 text-gray-900">Form Content</h2>
          </div>
          <div class="border-t border-gray-200 px-4 py-5 sm:px-6">
            <div class="grid grid-cols-2 gap-2">

              <div class="mt-2 col-span-4 sm:col-span-1">
                <label for="default-collection" class="block text-sm font-medium text-gray-700">Default Collection</label>
                <div class="mt-1 flex">
                  <div v-for="(option, index) in defaultCollectionOptions" :key="index" class="mr-4">
                    <input type="radio" :id="option" :name="option" :value="option" v-model="destination" class="focus:ring-gray-900 h-4 w-4 text-gray-900 border-gray-300 inline-block align-middle">
                    <label :for="option" class="ml-2 block text-sm text-gray-900 inline-block align-middle">{{ option }}</label>
                  </div>
                </div>
              </div>
              

              <div class="col-span-4 sm:col-span-1">
                <label for="title" class="block text-sm font-medium text-gray-700">Form Name</label>
                <input 
                v-model="title" 
                type="text" name="title" id="title" autocomplete="title" 
                class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm">
              </div>	

              <div class="mt-2 col-span-4 sm:col-span-1">
                <label for="slug" class="block text-sm font-medium text-gray-700">Thank you mwessage</label>
                <input 
                v-model="slug" 
                type="text" name="slug" id="slug" autocomplete="slug" 
                class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm">
              </div>

              <div class="mt-2 col-span-4 sm:col-span-1">
                <label for="content" class="block text-sm font-medium text-gray-700">Login Request</label>
                <input 
                v-model="content" 
                type="text" name="content" id="content" autocomplete="content" 
                class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm">
              </div>

              <div class="mt-2 col-span-4 sm:col-span-1">
                <label for="content" class="block text-sm font-medium text-gray-700">Send Tank you email</label>
                <input 
                v-model="content" 
                type="text" name="content" id="content" autocomplete="content" 
                class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm">
              </div>

              <div class="mt-2 col-span-4 sm:col-span-1">
                <label for="content" class="block text-sm font-medium text-gray-700">Admin Email</label>
                <input 
                v-model="content" 
                type="text" name="content" id="content" autocomplete="content" 
                class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm">
              </div>

              <div class="mt-2 col-span-4 sm:col-span-1">
                <label for="content" class="block text-sm font-medium text-gray-700">Reply Request</label>
                <input 
                v-model="content" 
                type="text" name="content" id="content" autocomplete="content" 
                class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm">
              </div>

              <div class="mt-2 col-span-4 sm:col-span-1">
                <label for="content" class="block text-sm font-medium text-gray-700">Submit Button</label>
                <input 
                v-model="content" 
                type="text" name="content" id="content" autocomplete="content" 
                class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm">
              </div>

            </div>

          </div>
        </div>
      </section>
    </div>

    <section aria-labelledby="timeline-title" class="lg:col-span-1 lg:col-start-3">
      <div class="bg-white shadow sm:rounded-lg">
        <div class="p-3">
          <h2 id="timeline-title" class="text-lg font-medium text-gray-900">Option</h2>
        </div>
  
        <div class="relative w-full">
          <div class="aspect-w-16 aspect-h-6">
            <div class="absolute inset-0 flex items-center justify-center cursor-pointer" @click="OpenFileBrowser">
              <div class="w-full h-full bg-gray-200 flex items-center justify-center">
                <span class="text-gray-400" v-if="!feature_image">No image selected</span>
                <img v-else :src="feature_image" alt="Selected Image" class="object-cover object-center w-full h-full" />
              </div>
              <div class="absolute inset-0 flex flex-col items-center justify-center opacity-0 hover:opacity-100">
                <div class="absolute inset-0 bg-black bg-opacity-20"></div>
                <span class="text-white bg-black p-2"><i class="fas fa-upload text-white text-lg mr-2"></i> Click to select an image</span>
              </div>
            </div>
          </div>
      </div>
  
        <div class="p-3">
          <div class="mt-3 flow-root">
            <!-- Checkbox -->
            <div class="flex items-center space-x-2">
              <input type="checkbox" v-model="status" id="status" class="form-checkbox text-blue-500 h-4 w-4">
              <label for="status" class="text-gray-700">เผยแพร่</label>
            </div>
            <div class="flex items-center space-x-2">
              <input type="checkbox" v-model="authen" id="authen" class="form-checkbox text-blue-500 h-4 w-4">
              <label for="authen" class="text-gray-700">สำหรับสมาชิก</label>
            </div>
          </div>
  
          <div class="mt-4 text-gray-700">Created: 2023-05-24 | Updated: 2023-05-25</div>
  
          <div class="mt-4 pt-3 pb-3 border-t border-gray-300">
            <label for="parent-page" class="block text-sm font-medium text-gray-700">หน้าหลัก</label>
            <div class="relative">
              <input
                v-model="searchTerm"
                @input="showDropdown = true"
                type="text"
                id="parent-page-search"
                name="parent-page-search"
                class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 text-lg"
                placeholder="Search parent page..."
              >
              <ul v-if="showDropdown" class="absolute z-10 w-full bg-white border border-gray-300 mt-1 py-1 text-sm rounded-md shadow-sm">
                <li
                  v-for="parent in filteredParentList"
                  :key="parent._id"
                  @click="selectParent(parent)"
                  class="px-3 py-2 cursor-pointer hover:bg-gray-100"
                >
                  {{ parent.title }}
                </li>
              </ul>
              <div v-if="parent" class="mt-2 text-gray-500">
                ตั้งเป็นหน้าย่อยของ : <span class="font-semibold">{{ parent.title }}</span>
                <button class="text-red-500 ml-2" @click="removeParent">ลบออก</button>
              </div>
            </div>
          </div>
          
        </div>
  
        <!-- Footer -->
        <div class="mt-2 bg-gray-100 rounded-md p-4 flex justify-between items-center">
          <div class="flex">
            <button
              @click.prevent="addPost"
              type="button"
              class="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-100"
            >
              <i class="fas fa-pencil text-black text-[12px] mr-2"></i> บันทึกข้อมูล
            </button>
          </div>
          <div class="flex">
            <a
              href="#"
              class="inline-flex items-center justify-center text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-100"
            >
              <i class="fas fa-trash text-black text-[12px] mr-2"></i> ลบหน้านี้
            </a>
          </div>
        </div>
      </div>
    </section>
    
  </div>
</template>