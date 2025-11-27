<template>
    <template v-if="isDevice==='desktop'">
        <Header :dataItem="dataItem" :mode="'id'"/>
        <SubHeader :dataItem="subHeaderID" :mode="'id'"/>
    </template>

    <template v-if="isDevice==='mobile'">

        <header class="bg-white border-b border-gray-200 z-10 w-full" :class="[headerPosition, headerPosition === 'fixed' ? 'shadow-md top-0' : '']" ref="header">
            <Topbar v-if="topbar.show" :topbar="topbar" :columns="topbar.columns" />
            <div class="bg-white">
                <div class="mx-auto max-w-7xl px-6 lg:px-8 grid grid-cols-5">
                <div class="col-span-2 flex justify-left items-center">
                    <div class="flex items-center" @click="showMobileMenu = true">
                    <font-awesome-icon :icon="['fas','bars']" class="text-gray-400 text-xl mr-4" />
                    </div>
                </div>
                <div class="col-span-1 flex justify-center items-center">
                    <Logo :logo="{type: 'image',size: 'h-[50px]'}" />
                </div>
                <div class="col-span-2 flex justify-end items-center profile-icon">
                    <UserNav :userbar="userbar"/>
                </div>
                </div>
            </div>

            <div v-if="showMobileMenu" class="fixed inset-0 z-20 bg-white">
                <Topbar v-if="topbar.show" :topbar="topbar" :columns="topbar.columns" />
                <div class="flex justify-between items-center py-4 px-6 border-b border-gray-200">
                    <Logo :logo="{type: 'image',size: 'h-[50px]'}" />
                    <font-awesome-icon :icon="['fas','times']" class="text-gray-500 text-2xl ml-auto" @click="showMobileMenu = false" />
                </div>
                <Navigator :nav="{navigator:navigator}" @menu-item-close="handleMenuItemClickInParent"/>
            </div>

            <SubHeader :dataItem="subHeaderID" :mode="'id'" />
  
        </header>

    </template>

  </template>
  
  <script>
import Navigator  from './Customize/Navigator.vue';
import UserNav    from './Customize/UserNav.vue';
import Logo       from './Customize/Logo.vue';
import Topbar     from './Customize/Topbar.vue';
import storageManager from '@/plugins/storage';
import Header from '@/interface/template/BuilderRender.vue';
import SubHeader from '@/interface/template/BuilderRender.vue';
  
  export default {
    components: {
        Navigator,
        UserNav,
        Logo,
        Topbar,
        Header,
        SubHeader
    },
    props: {
        headerLayout: {
            type: String,
            default: 'layout1'
        },
        headerPosition: {
            type: String,
            default: 'relative'
        },
        nav: {
            type: String,
            default: 'desktop'
        },
        logo: {
            type: Object,
            default: () => ({ type: 'text', size: 'h-1' })
        },
        userbar: {
            type: Object,
            default: () => ({ type: 'text', endpoint: 'user'})
        },
        topbar: {
            type: Object,
            default: () => ({
                show: false,
                text: "",
                bg: "",
                color: ""
            })
        }
    },
    data() {
        const configs = storageManager.get('configs');
        const session = storageManager.get('session');
    return {
        configs,
        session,
        dataItem: configs.header,
        subHeaderID: configs.subheader,
        navigator: configs.navigator,
        isDevice: window.innerWidth <= 768 ? 'mobile' : 'desktop',
        showMobileMenu: false,
    }
    },
    methods: {
        handleMenuItemClickInParent() {
            this.showMobileMenu = false
        },
        handleResize() {
            this.isDevice = window.innerWidth <= 768 ? 'mobile' : 'desktop';
        }
    },
    beforeUnmount() {
        window.removeEventListener('resize', this.handleResize);
    },
    mounted() {
        window.addEventListener('resize', this.handleResize);
        if (this.headerPosition === 'fixed') {
            const headerHeight      = this.$refs.header.clientHeight;
            const mainElement       = document.querySelector('main');
            mainElement.style.top   = `${headerHeight}px`;
            mainElement.style.marginBottom   = `${headerHeight}px`;
        }
    }
  }
  </script>
  