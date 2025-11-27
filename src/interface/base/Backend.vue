<script>
import Header from '@/interface/template/backend/Header';
import Footer from '@/interface/template/backend/Footer';
import Topbar from '@/interface/template/Topbar'
import backtotop from '@/interface/base/backtotop.vue'

import CookiePolicyPopup from '@/utils/cookie';
import { handleIdleActivity } from '@/plugins/Idle'
import storageManager from '@/plugins/storage';

import Session from '@/interface/template/selectSession.vue';
import debug from '@/plugins/Logger.js';

debug.log("Load Backend Layout");

export default {
	name: 'Backend',
	components: {
		Topbar,
		Header,
		Footer,
		Session,
		backtotop,
		CookiePolicyPopup
	},
	data() {
		const session = storageManager.get('session');
		return {
			selectSession: false,
			login: session.login,
			role: session.role,
			session: session.current,
			configs: storageManager.get('configs'),
			currentRouteMeta: {},
		}
	},
	computed: {},
	methods: {
		sessionExpired() {
			debug.log("Session expired");
			storageManager.delete('session');
			storageManager.delete('erp'); // ลบ ERP mode
			this.$router.push("/member/login");
			location.reload();
		},
		async checkActiveSession() {
			try {
				debug.log("Role", this.role);
				if (this.role == "admin" || this.role == "manager") {
					if (this.session == "none") {
						debug.log("Not Set Current Session");
						this.selectSession = true;
					} else {
						this.selectSession = false;
					}
				} else {
					this.selectSession = false;
				}
				debug.log("selectSession", this.selectSession)
				// Access current route meta and store it in currentRouteMeta
				this.currentRouteMeta = this.$route.meta;
			} catch (error) {
				debug.log(error)
			}
		}
	},
	async mounted() {
		handleIdleActivity(this.sessionExpired, 90, false)
		try {
			await this.checkActiveSession();

			if (this.configs.siteType !== "origin" && this.configs.siteType !== "collection" && this.configs.siteType !== "asset") {
				debug.log("Access via " + this.configs.siteType);
			} else {
				debug.log("Access via " + this.configs.siteType);
			}
		} catch (error) {
			debug.log(Error);
		}
	},
	setup() {
		function onIdle() {
			debug.log('The user has been idle for more than 1 minutes.')
		}
		handleIdleActivity(onIdle)
	},
}
</script>

<template>
	<div class="min-h-screen bg-gray-100">
		<Topbar/>
		<CookiePolicyPopup/>
		<Header />
		<Session/>
		<router-view/>
		<backtotop/>
		<Footer />
	</div>
</template>