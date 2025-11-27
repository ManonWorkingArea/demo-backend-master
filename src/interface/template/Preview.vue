<template>
	<div v-if="visible" class="inline-preview-container">
		<div class="">
			<!-- Preview Content -->
			<div class="">
				<div class="inline-iframe-container flex justify-center" :class="{'full-width-desktop': currentViewport === 'desktop'}">
					<!-- Browser Frame for Desktop/Laptop -->
					<div v-if="currentViewport === 'desktop' || currentViewport === 'laptop'" class="browser-frame">
						<div class="browser-header">
							<div class="browser-controls">
								<div class="control-btn close"></div>
								<div class="control-btn minimize"></div>
								<div class="control-btn maximize"></div>
							</div>
							<div class="browser-address-bar">
								<div class="address-input">{{ `localhost:3000/cms/iframe/${dataItem}` }}</div>
							</div>
							<div class="browser-menu">
								<div class="menu-dots"></div>
							</div>
						</div>
						<iframe 
							ref="viewportFrameInline" 
							:src="`/cms/iframe/${dataItem}`" 
							:style="inlineIframeStyle"
							class="browser-content"
						></iframe>
					</div>

					<!-- Mobile Device Frame -->
					<div v-else-if="currentViewport === 'mobile'" class="device-frame mobile-frame">
						<div class="device-header">
							<div class="notch"></div>
							<div class="speaker"></div>
						</div>
						<div class="device-screen">
							<div class="mobile-browser-bar">
								<div class="mobile-address">{{ `localhost:3000/cms/iframe/${dataItem}` }}</div>
								<div class="mobile-refresh">⟳</div>
							</div>
							<iframe 
								ref="viewportFrameInline" 
								:src="`/cms/iframe/${dataItem}`" 
								:style="inlineIframeStyle"
								class="device-content"
							></iframe>
						</div>
						<div class="device-footer">
							<div class="home-indicator"></div>
						</div>
					</div>

					<!-- Tablet Device Frame -->
					<div v-else-if="currentViewport === 'tablet'" class="device-frame tablet-frame">
						<div class="tablet-container">
							<div class="tablet-left-control">
								<div class="camera"></div>
							</div>
							<div class="tablet-screen-area">
								<div class="device-screen tablet-screen">
									<div class="tablet-browser-bar">
										<div class="tablet-address">{{ `localhost:3000/cms/iframe/${dataItem}` }}</div>
										<div class="tablet-menu">⋯</div>
									</div>
									<iframe 
										ref="viewportFrameInline" 
										:src="`/cms/iframe/${dataItem}`" 
										:style="inlineIframeStyle"
										class="device-content tablet-content"
									></iframe>
								</div>
							</div>
							<div class="tablet-right-control">
								<div class="home-button"></div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
export default {
props: {
	visible: {
	type: Boolean,
	required: true,
	},
	dataItem: {
	type: String,
	required: true,
	},
	viewport: {
	type: String,
	default: 'desktop',
	},
},
data() {
	return {
	currentViewport: this.viewport,
	};
},
computed: {
	inlineIframeStyle() {
		let width = '100%';
		let maxWidth = '100%';
		let height = '600px';
		
		switch (this.currentViewport) {
			case 'mobile':
				width = '345px';
				maxWidth = '345px';
				height = '650px';
				break;
			case 'laptop':
				width = '1124px';
				maxWidth = '1124px';
				height = '700px';
				break;
			case 'tablet':
				width = '800px';
				maxWidth = '800px';
				height = '700px';
				break;
			case 'desktop':
				width = '100%';
				maxWidth = 'none';
				height = '800px';
				break;
			default:
				break;
		}
		return {
			width,
			maxWidth,
			height,
			border: 'none',
			borderRadius: this.currentViewport === 'mobile' || this.currentViewport === 'tablet' ? '0' : '4px',
		};
	},
},
methods: {
	hideComponent() {
	this.$emit('close');
	},
},
watch: {
	viewport(newViewport) {
		this.currentViewport = newViewport;
	}
},
};
</script>

<style scoped>
/* Inline Preview Styles */
.inline-preview-container {
width: 100%;
margin: 0px 0;
}

.inline-iframe-container {
padding: 20px;
min-height: 640px;
max-width: none;
}

.full-width-desktop {
width: 100%;
max-width: none;
padding: 10px;
}

/* Browser Frame Styles */
.browser-frame {
border-radius: 8px;
overflow: hidden;
box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
background: #2d2d2d;
width: 100%;
max-width: none;
border: 4px solid #2d2d2d;
}

.browser-header {
height: 40px;
background: #3a3a3a;
display: flex;
align-items: center;
padding: 0 12px;
border-bottom: 1px solid #4a4a4a;
}

.browser-controls {
display: flex;
gap: 8px;
margin-right: 16px;
}

.control-btn {
width: 12px;
height: 12px;
border-radius: 50%;
}

.control-btn.close {
background: #ff5f57;
}

.control-btn.minimize {
background: #ffbd2e;
}

.control-btn.maximize {
background: #28ca42;
}

.browser-address-bar {
flex: 1;
max-width: 400px;
margin-right: 16px;
}

.address-input {
background: #2d2d2d;
border: 1px solid #4a4a4a;
border-radius: 20px;
padding: 4px 12px;
font-size: 13px;
color: #e0e0e0;
}

.browser-menu {
width: 20px;
}

.menu-dots {
width: 4px;
height: 4px;
background: #e0e0e0;
border-radius: 50%;
position: relative;
}

.menu-dots::before,
.menu-dots::after {
content: '';
position: absolute;
width: 4px;
height: 4px;
background: #e0e0e0;
border-radius: 50%;
}

.menu-dots::before {
top: -6px;
}

.menu-dots::after {
top: 6px;
}

.browser-content {
width: 100%;
display: block;
}

/* Device Frame Styles */
.device-frame {
border-radius: 20px;
overflow: hidden;
box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
background: #000000;
padding: 8px;
}

.mobile-frame {
width: 391px;
background: #1a1a1a;
}

.tablet-frame {
width: 1000px;
height: 700px;
background: #2a2a2a;
border-radius: 30px;
position: relative;
border: 3px solid #1a1a1a;
display: flex;
padding: 15px;
box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.tablet-container {
display: flex;
width: 100%;
height: 100%;
background: #2a2a2a;
border-radius: 25px;
}

.tablet-left-control {
width: 60px;
display: flex;
align-items: center;
justify-content: center;
background: #2a2a2a;
}

.camera {
width: 8px;
height: 8px;
background: #333333;
border-radius: 50%;
border: 1px solid #555555;
}

.tablet-screen-area {
flex: 1;
display: flex;
background: #2a2a2a;
border-radius: 20px;
overflow: hidden;
margin: 0 10px;
}

.tablet-screen {
flex: 1;
background: #ffffff;
border-radius: 20px;
overflow: hidden;
margin: 15px 8px;
box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.1);
border: 2px solid #1a1a1a;
display: flex;
flex-direction: column;
}

.tablet-right-control {
width: 60px;
display: flex;
align-items: center;
justify-content: center;
background: #2a2a2a;
}

.home-button {
width: 35px;
height: 35px;
border: 2px solid #333333;
border-radius: 50%;
background: #1a1a1a;
position: relative;
box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3);
}

.home-button::after {
content: '';
position: absolute;
top: 50%;
left: 50%;
transform: translate(-50%, -50%);
width: 12px;
height: 12px;
border-radius: 2px;
background: #444444;
}

.device-header {
height: 25px;
background: #000000;
display: flex;
align-items: center;
justify-content: center;
position: relative;
border-radius: 23px 23px 0 0;
}

.notch {
width: 120px;
height: 20px;
background: #000000;
border-radius: 0 0 15px 15px;
position: relative;
}

.speaker {
width: 40px;
height: 4px;
background: #333333;
border-radius: 2px;
position: absolute;
top: 8px;
}

.device-screen {
background: #ffffff;
border-radius: 15px;
overflow: hidden;
margin: 8px;
box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.1);
}

.device-content {
width: calc(100% - 16px);
height: calc(100% - 40px);
display: block;
border-radius: 18px;
border: none;
margin: 8px;
}

.device-footer {
height: 25px;
background: #000000;
display: flex;
align-items: center;
justify-content: center;
border-radius: 0 0 23px 23px;
}

.home-indicator {
width: 134px;
height: 4px;
background: #ffffff;
border-radius: 2px;
opacity: 0.7;
}

/* Mobile Browser Bar */
.mobile-browser-bar {
height: 40px;
background: #f8f9fa;
display: flex;
align-items: center;
padding: 0 12px;
border-bottom: 1px solid #e1e5e9;
justify-content: space-between;
}

.mobile-address {
flex: 1;
background: #ffffff;
border: 1px solid #dadce0;
border-radius: 20px;
padding: 6px 12px;
font-size: 12px;
color: #5f6368;
margin-right: 8px;
overflow: hidden;
text-overflow: ellipsis;
white-space: nowrap;
}

.mobile-refresh {
	width: 28px;
	height: 28px;
	background: #ffffff;
	border: 1px solid #dadce0;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 14px;
	color: #5f6368;
}

/* Tablet Browser Bar */
.tablet-browser-bar {
	height: 40px;
	background: #f1f3f4;
	display: flex;
	align-items: center;
	padding: 5px 16px;
	border-bottom: 1px solid #dadce0;
	justify-content: space-between;
}

.tablet-address {
flex: 1;
background: #ffffff;
border: 1px solid #dadce0;
border-radius: 18px;
padding: 5px 12px;
font-size: 13px;
color: #5f6368;
margin-right: 12px;
overflow: hidden;
text-overflow: ellipsis;
white-space: nowrap;
}

.tablet-menu {
width: 24px;
height: 24px;
background: #ffffff;
border: 1px solid #dadce0;
border-radius: 50%;
display: flex;
align-items: center;
justify-content: center;
font-size: 12px;
color: #5f6368;
}

.tablet-content {
width: 100%;
height: calc(100% - 35px);
display: block;
border: none;
border-radius: 0 0 18px 18px;
}

/* Responsive adjustments */
@media (max-width: 1200px) {
.browser-frame {
	transform: none;
	transform-origin: center;
}
}

@media (max-width: 800px) {
.device-frame {
	transform: scale(0.7);
	transform-origin: center;
}
}
</style>