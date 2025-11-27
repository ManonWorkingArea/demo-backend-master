<template>
	<div :style="{ height: sectionHeight }" :class="{ 'bg-gray-100': routerMode === 'blank' }">
		<Topbar v-if="routerMode === 'default' || routerMode === 'standard'" />
		<Cookie :hasAgreedToCookiePolicy="hasAgreedToCookiePolicy" />
		<Header v-if="routerMode === 'default' || routerMode === 'standard'" />
		<main class="relative w-full">
		<router-view />
		</main>
		<Footer/>
		<!-- Inline Footer with Fixed Position -->
		<!-- <footer class="fixed-footer text-xs">
		<div>Your browser: {{ browserName }}</div>
		<div>Browser data: {{ rawUserAgent }}</div>
		</footer> -->
		<div v-if="isLocked" class="lock-screen">
		<div class="lock-message">
			<font-awesome-icon icon="lock" class="text-white text-lg" />
			<p>{{ lockMessage }}</p>
		</div>
		</div>
		<!-- Alert Modal -->
		<div v-if="showAlertModal" class="alert-modal">
		<div class="modal-content">
			<p>{{ alertMessage }}</p>
			<button @click="closeAlertModal">ตกลง</button>
		</div>
		</div>
	</div>
	</template>

	<script>
	import { getAblyChannel, publishMessage, subscribeToMessages, unsubscribeFromMessages } from '@/services/ably';
	import Header from '@/interface/theme/Customize.vue';
	import Footer from '@/interface/theme/FooterCustomize.vue';
	import Cookie from '@/utils/cookie';
	import Topbar from '@/interface/template/Topbar';
	import storageManager from '@/plugins/storage';

	export default {
	name: 'Frontend',
	components: {
		Topbar,
		Header,
		Footer,
		Cookie
	},
	data() {
		const session = storageManager.get('session');
		const configs = storageManager.get("configs");

		return {
		hasAgreedToCookiePolicy: false,
		configs: configs,
		session: session,
		browserName: '',
		rawUserAgent: navigator.userAgent, // Store the raw user agent string
		messages: [], // Array to store incoming messages
		isLocked: false,
		lockUserId: null,
		lockMessage: '', // Store the lock message
		showAlertModal: false,
		alertMessage: '',
		ablyChannel: getAblyChannel(configs.siteID), // Initialize ablyChannel here
		claritySiteID: 'mfsj1dyr89' // Add your Clarity site ID here
		};
	},
	computed: {
		routerMode() {
		return this.$route.meta.mode || 'default'; // Default value if not provided
		},
		sectionHeight() {
		const windowHeight = window.innerHeight;
		const sectionRatio = 1; // Example: 100% of the window height
		return `${windowHeight * sectionRatio}px`;
		},
	},
	methods: {
		getBrowserName(userAgent) {
		if (userAgent.includes("Edg")) return "Edge";
		if (userAgent.includes("Firefox")) return "Firefox";
		if (userAgent.includes("Opera") || userAgent.includes("OPR")) return "Opera";
		if (userAgent.includes("Chrome") && !userAgent.includes("Edg") && !userAgent.includes("OPR")) return "Chrome";
		if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) return "Safari";
		if (userAgent.includes("MSIE") || userAgent.includes("Trident/7")) return "Internet Explorer";
		if (userAgent.includes("FBAV")) return "Facebook In-App Browser";
		if (userAgent.includes("Line")) return "LINE In-App Browser";
		// Add other browsers as needed
		return "Unknown"; // Default if none of the above
		},
		addRedBorder() {
		const style = document.createElement('style');
		style.innerHTML = `
			body::before {
			content: '';
			position: fixed;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			border: 1px solid red;
			pointer-events: none;
			z-index: 1000;
			}
		`;
		document.head.appendChild(style);
		},
		async handleIncomingMessage(msg) {
		// Check if the sender is 'host' and the session matches the site's ID
		if (!msg.data || (msg.data.sender === 'host' && msg.data.session === this.configs.siteID)) {

			this.messages.push(msg.data); // Add the message data to the messages array
			const user = this.session && this.session.user ? this.session.user : null;
			const clientData = user && user.firstname && user.lastname ? `${user.firstname} ${user.lastname}` : 'Guest';

			if (msg.data.text === 'reload()') {
			location.reload();
			} else if (msg.data.text.startsWith('reload(')) {
			const match = msg.data.text.match(/reload\((.*?)\)/);
			if (match) {
				const userID = match[1];
				if (userID === this.session.userID) {
				location.reload();
				}
			}
			} else if (msg.data.text.startsWith('logout')) {
			const userID = msg.data.text.match(/logout\((.*?)\)/)[1];
			if (userID === this.session.userID) {
				storageManager.delete('session');
				storageManager.delete('erp'); // ลบ ERP mode
				window.location.href = "/";
			}
			} else if (msg.data.text === 'call()') {
			const userID = this.session.userID || 'Guest';
			const responseMessage = { 
				sender: 'client', 
				text: `${userID} :: ${clientData} is alive on page ${window.location.pathname}` 
			};
			try {
				await publishMessage(this.ablyChannel, responseMessage);
			} catch (error) {
				console.error('Failed to send response message:', error);
			}
			} else if (msg.data.text.startsWith('call(')) {
			const userID = msg.data.text.match(/call\((.*?)\)/)[1];
			if (userID === this.session.userID) {
				const responseMessage = { 
				sender: 'client', 
				text: `Respond : ${userID} :: ${clientData} is alive on page ${window.location.pathname}` 
				};
				try {
				await publishMessage(this.ablyChannel, responseMessage);
				} catch (error) {
				console.error('Failed to send response message:', error);
				}
			}
			} else if (msg.data.text.startsWith('lock(')) {
			const match = msg.data.text.match(/lock\((.*?)(?:,'(.*?)')?\)/);
			if (match) {
				const userID = match[1]; 
				const message = match[2] || 'ล็อคหน้าจอ';
				if (userID === this.session.userID) {
				this.isLocked = true;
				this.lockUserId = userID;
				this.lockMessage = message;
				}
			} else {
				console.error('Failed to parse lock message:', msg.data.text);
			}
			} else if (msg.data.text.startsWith('device(')) {
			const userID = msg.data.text.match(/device\((.*?)\)/)[1];
			if (userID === this.session.userID) {
				const browserData = {
				browserName: this.browserName,
				rawUserAgent: this.rawUserAgent
				};
				const responseMessage = { sender: 'client', text: `Browser Data: ${JSON.stringify(browserData)}` };
				try {
				await publishMessage(this.ablyChannel, responseMessage);
				// console.log('Sent browser data response message');
				} catch (error) {
				console.error('Failed to send response message:', error);
				}
			}
			} else if (msg.data.text.startsWith('route(')) {
			const match = msg.data.text.match(/route\((.*?),'(.*?)'\)/);
			if (match) {
				const userID = match[1];
				const routePath = match[2]; // Extract route path from message
				if (userID === this.session.userID) {
				this.$router.push(routePath); // Navigate to the specified route
				}
			} else {
				console.error('Failed to parse route message:', msg.data.text);
			}
			} else if (msg.data.text.startsWith('alert(')) {
			const match = msg.data.text.match(/alert\((.*?),(.*?)\)/);
			if (match) {
				const userID = match[1]; // Extract userID from message
				const message = match[2].replace(/'/g, ''); // Extract alert message from message and remove quotes
				if (userID === '*' || userID === this.session.userID) {
				this.showAlertModal = true;
				this.alertMessage = message; // Set the alert message
				}
			} else {
				console.error('Failed to parse alert message:', msg.data.text);
			}
			}
		}
		},
		closeAlertModal() {
		this.showAlertModal = false;
		const responseMessage = { sender: 'client', text: `${this.session.userID} has accept the alert` };
		try {
			publishMessage(this.ablyChannel, responseMessage);
			// console.log('Sent OK response message');
		} catch (error) {
			console.error('Failed to send response message:', error);
		}
		},
		injectClarityScript() {
		const script = document.createElement('script');
		script.type = 'text/javascript';
		script.async = true;
		script.innerHTML = `
			(function(c,l,a,r,i,t,y){
			c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
			t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
			y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
			})(window, document, "clarity", "script", "${this.claritySiteID}");
		`;
		document.head.appendChild(script);
		}
	},
	mounted() {
		this.browserName = this.getBrowserName(this.rawUserAgent);
		if (this.browserName === 'Unknown') {
		this.addRedBorder();
		}

		// Subscribe to messages from Ably
		subscribeToMessages(this.ablyChannel, this.handleIncomingMessage);

		// Inject the Clarity script
		this.injectClarityScript();
	},
	beforeUnmount() {
		// Unsubscribe from messages when the component is destroyed
		unsubscribeFromMessages(this.ablyChannel);
	}
	};
	</script>

	<style scoped>
	/* Add CSS for the fixed footer */
	.fixed-footer {
	position: relative;
	left: 0;
	bottom: 0;
	width: 100%;
	background-color: #e4e4e4;
	color: #9d9d9d;
	text-align: center;
	padding: 10px 0;
	z-index: 1030;
	}

	/* Add CSS for the lock screen */
	.lock-screen {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.5);
	display: flex;
	justify-content: center;
	align-items: center;
	z-index: 2000;
	}

	.lock-message {
	text-align: center;
	color: white;
	}

	.lock-message .icon-key {
	font-size: 2rem;
	margin-bottom: 1rem;
	}

	/* Add CSS for the alert modal */
	.alert-modal {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.5);
	display: flex;
	justify-content: center;
	align-items: center;
	z-index: 3000;
	animation: fadeIn 0.3s ease-in-out;
	}

	.modal-content {
	background-color: white;
	padding: 10px;
	border-radius: 5px;
	text-align: center;
	box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
	transition: transform 0.3s ease-in-out;
	transform: scale(1.1);
	min-width: 250px;
	}

	.modal-content p {
	margin-bottom: 20px;
	font-size: 16px;
	color: #333;
	}

	.modal-content button {
	padding: 5px 20px;
	background-color: #007bff;
	color: white;
	border: none;
	border-radius: 5px;
	cursor: pointer;
	font-size: 14px;
	transition: background-color 0.3s ease;
	}

	.modal-content button:hover {
	background-color: #0056b3;
	}

	@keyframes fadeIn {
	from {
		opacity: 0;
	}
	to {
		opacity: 1;
	}
	}
	</style>
  