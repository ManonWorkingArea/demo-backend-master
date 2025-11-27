<template>
<div>
	<Authen />
	<component :is="componentToLoad" v-if="configs.siteType === 'unit' || login" />
</div>
</template>

<script>
import { useTitle } from 'vue-page-title';
import { getRouteTitle } from '@/plugins/language.js';

import Authen from '@/utils/authen.vue';
import BackendDesktop from '../component/Dashboard-desktop.vue';
import BackendMobile from '../component/Dashboard-mobile.vue';
import Frontend from '../../frontend/component/Homepage.vue'; // Modified import statement
import storageManager from '@/plugins/storage.js';
import deviceUtils from "@/plugins/DeviceUtils";
import debug from '@/plugins/Logger.js';

export default {
name: 'Home',
created() {
	debug.option(this.$route);
},
components: {
	BackendDesktop,
	BackendMobile,
	Authen,
	Frontend,
},
data() {
	return {
	login: storageManager.get('session', 'login'),
	configs: storageManager.get('configs'),
	deviceType: deviceUtils.deviceDetect(),
	};
},
mounted() {},
setup() {
	useTitle(getRouteTitle());
},
computed: {
	componentToLoad() {
	if (this.configs.siteType === 'unit') {
		debug.log("Load Front");
		return Frontend;
	} else {
		debug.log("Load Back");
		return this.deviceType === 'desktop' ? BackendDesktop : BackendMobile;
	}
	},
},
};
</script>
  