<script>
import {useRoute} from 'vue-router';
import debug from '@/plugins/Logger.js';
import storageManager from '../plugins/storage.js';

export default {
	name: 'Authen',
    data() {
      return {
        configs: storageManager.get('configs'),
        session: storageManager.get('session'),
      };
    },
    created() {
        debug.option(this.$route);
    },
    computed: {
    },
	components: {
	},
	mounted() {
    this.checkAuth();
	},
	updated() {
	},
	methods: {
        async checkAuth()
        {
            const route      = useRoute();
            const pageAuth   = route.meta.auth;
            const page       = route.name;

            const session 		= storageManager.get('session');
            let accessToken     = session.token;
            let hasLogin        = session.login;
            let activeSchool    = session.current;

            debug.log("hasLogin",hasLogin)
            debug.log("Page -> Auth:",pageAuth)
            debug.log("User -> Token:",accessToken)
            debug.log("User -> Login:",hasLogin)

            if(this.session.interface==="frontend")
            {
                debug.log("Front-End");
            }
            else if(this.session.interface==="backend")
            {
                debug.log("Back-End");
                if(hasLogin) {// ถ้าเข้าสู๋ระบบแล้ว
                    if (page=="Login" || activeSchool==undefined) { // ห้ามเข้าสู่ระบบซ้ำ || ยังไม่ได้เลือกโรงเรียน
                        debug.log("Not Login Again");
                        this.$router.replace({path: '/'});
                    } else {// เลือกโรงเรียนแล้ว
                        debug.log("Has School Active");
                        if(pageAuth) {
                            debug.log("This page is : Authen Request");
                            if(accessToken==="" || accessToken ===null || accessToken==undefined) {
                                debug.log("Your Cannot Access");
                            } else {
                                debug.log("Your Can Access");
                            }
                        } else {
                            debug.log("This page is : No Authen Request");
                        }
                    }
                    debug.log("Login");
                } else {// ยังไม่ได้เข้าสู่ระบบ
                    debug.log("Not Login");
                    if(page!="Login") { 
                        window.location.href = "/member/login"
                        //this.$router.replace({path: '/member/login'});
                        debug.log("Not Login Page",page);
                    } else {
                        debug.log("Login Page",page);
                    }
                }
            }
        },
    },
    setup() { 
    },
};
</script>

<template>
<div></div>
</template>