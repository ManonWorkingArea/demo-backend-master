<template>
	<component :is="layoutComponent">
	</component>
	
	<!-- API Test Button - แสดงเฉพาะ localhost -->
	<button 
		v-if="isLocalhost"
		@click="showApiModal = true" 
		class="api-test-btn"
		title="API Gateway Tester"
	>
		🌐
	</button>
	
	<!-- API Request Modal -->
	<div v-if="showApiModal" class="modal-overlay" @click="closeModal">
		<div class="modal-container" @click.stop>
			<div class="modal-header">
				<h3>🌐 API Gateway Tester</h3>
				<button @click="showApiModal = false" class="close-btn">×</button>
			</div>
			<div class="modal-body">
				<ApiRequestDemo />
			</div>
		</div>
	</div>
</template>
  
<script>
import storageManager from '@/plugins/storage';
import LayoutPublic from '@/interface/base/Public';
import LayoutFrontend from '@/interface/base/Frontend';
import LayoutBackend from '@/interface/base/Backend';
import ApiRequestDemo from '@/components/ApiRequestDemo.vue';

export default {
	components: {
		'backend-layout': LayoutBackend,
		'frontend-layout': LayoutFrontend,
		'public-layout': LayoutPublic,
		ApiRequestDemo
	},
	data() {
		return {
			layoutData: '',
			showApiModal: false
		};
	},
	mounted() {
		const configs = storageManager.get('configs');

		let defaultSession = {
			host: window.location.protocol + "//" + window.location.host,
			nav: 'normal-nav',
			layout: 'public-layout',
			interface: "backend",
			login: false,
			loader: true,
			master: false,
			masterText: "Master Mode",
			list: [],
			category: []
		};

		if (configs.siteType === "unit") {
			defaultSession.layout = 'frontend-layout';
			defaultSession.interface = 'frontend';
			defaultSession.role = 'public';
		}

		const loader = storageManager.get('session', 'loader');

		if (loader == true || loader == undefined || loader == null) {
			storageManager.set('session', defaultSession);
		}

		this.layoutData = storageManager.get('session', 'layout');
	},
	updated() {

	},
	computed: {
		layoutComponent() {
			let layoutComponent;
			switch (this.layoutData) {
				case 'backend-layout':
					layoutComponent = LayoutBackend;
					break;
				case 'frontend-layout':
					layoutComponent = LayoutFrontend;
					break;
				default:
					layoutComponent = LayoutPublic;
			}
			return layoutComponent;
		},
		isLocalhost() {
			return window.location.hostname === 'localhost' || 
					window.location.hostname === '127.0.0.1' || 
					window.location.hostname === '0.0.0.0';
		}
	},
	methods: {
		closeModal(event) {
			if (event.target === event.currentTarget) {
				this.showApiModal = false;
			}
		}
	}
};
</script>
  
<style>
#app {}
input:-webkit-autofill,
input:-webkit-autofill:focus {
  transition: background-color 0s 600000s, color 0s 600000s !important;
}
/* TooltipPlugin.css */
.tooltip {
    /* Generic tooltip styles */
    background-color: #333;
    color: #fff;
    padding: 0.5rem;
    border-radius: 0.25rem;
    position: absolute;
    z-index: 9999;
  }
  
.tooltip-top {
}

.tooltip-bottom {
}

.tooltip-left {

}

.tooltip-right {

}

.vue-back-to-top {
	@apply p-2 bg-indigo-500 hover:bg-indigo-600 text-white transition
	duration-500
	ease-in-out
	transform
	hover:-translate-y-1 hover:scale-110;
	border-radius: 50%;
	font-size: 22px;
	line-height: 22px;
}
.fade-enter-active {
	animation: coming 0.4s;
	animation-delay: 0.2s;
	opacity: 0;
}
.fade-leave-active {
	animation: going 0.4s;
}

.readmore span {
	text-align: center; 
	width: 100%;
	float: left;
	display: block;
	height: 20px;
	margin-top: -20px;
}

.readmore p {
	padding-bottom: 20px;
}

.readmore a {
	border: 1px solid rgb(217 217 217);
    border-radius: 5px;
    padding: 2px 10px;
    color: #373737;
    background: rgb(35 40 47 / 10%);
}

.feather-16{
    width: 16px;
    height: 16px;
}

.feather-22{
    width: 22px;
    height: 22px;
}

.feather-24{
    width: 24px;
    height: 24px;
}

.feather-32{
    width: 32px;
    height: 32px;
}

@keyframes going {
from {
transform: translateX(0);
}
to {
transform: translateX(-10px);
opacity: 0;
}
}
@keyframes coming {
from {
transform: translateX(-10px);
opacity: 0;
}
to {
transform: translateX(0px);
opacity: 1;
}
}

.isblock
{
	pointer-events: none;
	cursor: progress;
}

.isblock:before {
    /*content: 'กำลังติดต่อฐานข้อมูล กรุณารอสักครู่.....';*/
	content: attr(data-content);
    opacity: 1;
    background: rgb(255 255 255 / 95%);
    color: #000;
    font-size: 18px;
    position: absolute;
    top: 0;
    right: 0;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    z-index: 99;
	text-align: center;
	white-space: pre-wrap;
}

div.isblock.blocking{
	opacity: 1;
}

.swal2-popup.swal2-toast .swal2-title {
    margin: 0.1em 1em !important;
}

/* For Webkit-based browsers (Chrome, Safari and Opera) */
.scrollbar-hide::-webkit-scrollbar {
    display: none;
}

/* For IE, Edge and Firefox */
.scrollbar-hide {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
}

.tooltip .tooltip-container .title {
    line-height: 1.3rem;
}

.body-scroll-lock {
	overflow: hidden;
}

/* API Test Button */
.api-test-btn {
	position: fixed;
	top: 20px;
	left: 20px;
	width: 40px;
	height: 40px;
	border-radius: 8px;
	background: #f8f9fa;
	color: #495057;
	border: 1px solid #dee2e6;
	font-size: 16px;
	cursor: pointer;
	z-index: 1000;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	transition: all 0.2s ease;
}

.api-test-btn:hover {
	background: #e9ecef;
	border-color: #adb5bd;
	transform: translateY(-1px);
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

/* Modal Styles */
.modal-overlay {
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background: rgba(0, 0, 0, 0.4);
	z-index: 9999;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 20px;
}

.modal-container {
	background: #ffffff;
	border-radius: 8px;
	border: 1px solid #e9ecef;
	max-width: 85vw;
	max-height: 80vh;
	width: 700px;
	display: flex;
	flex-direction: column;
	box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.modal-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 12px 16px;
	border-bottom: 1px solid #e9ecef;
	background: #f8f9fa;
	border-radius: 8px 8px 0 0;
}

.modal-header h3 {
	margin: 0;
	color: #495057;
	font-size: 1rem;
	font-weight: 600;
}

.close-btn {
	background: none;
	border: none;
	color: #6c757d;
	font-size: 18px;
	cursor: pointer;
	padding: 2px 6px;
	border-radius: 4px;
	transition: all 0.2s;
	line-height: 1;
}

.close-btn:hover {
	background: #e9ecef;
	color: #495057;
}

.modal-body {
	flex: 1;
	overflow-y: auto;
	max-height: calc(80vh - 50px);
	padding: 8px;
}

.modal-body .api-request-demo {
	margin: 0;
	padding: 0;
	min-height: auto;
	background: transparent;
}
</style>
