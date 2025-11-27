<template>
<div class="popup-wrapper">
    <div class="overlay" @click="togglePopup" v-if="showPopup"></div>
    <div class="open-button" @click="togglePopup">
        <slot name="openButton"></slot>
    </div>

    <div v-if="showPopup" class="popup" :style="{ width: width + 'px', height: height + 'px', padding: padding }">

        <div v-if="showTitle" class="popup-title">{{ title }}</div>
        <div class="popup-content" :style="{ flex: 1 }">
            <div :class="['scrollable-content', { 'fixed-height': height !== 'auto' }]" :style="{ height: height !== 'auto' ? (height-100) + 'px' : 'auto' }">

                <template v-if="contentType === 'url' && loading">
                    <div class="popup-loader">
                        <!-- spinner content goes here -->
                    </div>
                </template>
                <template v-else-if="error">
                    {{ error }}
                </template>
                <template v-else>
                    <slot :data="data" />
                </template>

            </div>

        </div>

        <button class="close-button" @click="hidePopup">
            <span class="close-icon">x</span>
        </button>
    </div>
</div>
</template>

<script>
import axios from 'axios'

export default {
    props: {
        showTitle: {
            type: Boolean,
            default: true,
        },
        title: {
            type: String,
            default: 'Popup Title'
        },
        width: {
            type: String,
            default: 'auto'
        },
        height: {
            type: String,
            default: 'auto'
        },
        openButton: {
            type: String,
            default: 'Open'
        },
        url: String,
        closeButton: {
            type: String,
            default: 'Close'
        },
        contentType: {
            type: String,
            default: 'text'
        }
    },
    data() {
        return {
            data: null,
            loading: false,
            error: null,
            showPopup: false
        }
    },
    mounted() {
        //document.body.classList.add('overflow-hidden');
    },
    beforeUnmount() {
        // Ensure overflow-hidden is removed if the popup was open when the component is destroyed
        if (this.showPopup) {
            document.body.classList.remove('overflow-hidden');
        }
    },
    computed: {
        padding() {
            console.log(this.showTitle)
            return this.showTitle ? '15px 10px 17px 10px' : '0px';
        },
        popupStyles() {
            let styles = {};
            if (this.width !== 'auto') {
                styles.width = parseInt(this.width, 10) + 'px';
            }
            if (this.height !== 'auto') {
                styles.height = parseInt(this.height, 10) + 'px';
            }
            return styles;
        },
    },
    methods: {
        openPopup() {
            this.showPopup = true
            document.body.classList.add('overflow-hidden')
        },
        closePopup() {
            this.showPopup = false
            document.body.classList.remove('overflow-hidden')
        },
        async togglePopup() {
            if (this.showPopup) {
                this.closePopup()
            } else {
                this.openPopup()
                if (this.contentType === 'url') {
                    this.fetchData()
                } else {
                    this.data = this.url
                }
                //this.fetchData()
            }
        },
        hidePopup() {
            this.closePopup()
        },
        // async togglePopup() {
        //     this.showPopup = !this.showPopup
        //     if (this.showPopup && this.contentType === 'url') {
        //         this.fetchData()

        //     } else {
        //         this.data = this.url

        //     }
        // },
        // hidePopup() {
        //     this.showPopup = false
        //     //document.body.classList.remove('overflow-hidden');
        // },

        async fetchData() {
            try {
                this.loading = true
                const response = await axios.get(this.url)
                this.data = response.data
                this.$emit('success', this.data)
            } catch (error) {
                this.error = error.message
                this.$emit('error', {
                    status: error.status,
                    message: error.message
                })
            } finally {
                this.loading = false
            }
        }
    }
}
</script>

<style>
@media (max-width: 480px) {
    .popup {
        width: 90% !important;
        height: auto !important;
    }
}

.open-button {
    cursor: pointer;
    float: left;
    width: 100%;
}

.popup-loader {
    width: 30px;
    height: 30px;
    display: block;
    margin: 20px auto;
    position: relative;
    border: 3px solid #c9c9c9;
    border-radius: 50%;
    box-sizing: border-box;
    animation: animloader 2s linear infinite;
    position: fixed;
    top: 40%;
    left: 40%;
}

.popup-loader::after {
    content: '';
    box-sizing: border-box;
    width: 6px;
    height: 24px;
    background: #c9c9c9;
    transform: rotate(-45deg);
    position: absolute;
    bottom: -20px;
    left: 27px;
}

@keyframes animloader {
    0% {
        transform: translate(-10px, -10px);
    }

    25% {
        transform: translate(-10px, 10px);
    }

    50% {
        transform: translate(10px, 10px);
    }

    75% {
        transform: translate(10px, -10px);
    }

    100% {
        transform: translate(-10px, -10px);
    }
}

.popup-wrapper {
    /* styles for the popup wrapper go here */
}

.popup-trigger {
    /* styles for the element that triggers the popup go here */
}

.popup {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 800px;
    background-color: #ffffff;
    border-radius: 10px;
    z-index: 9999;
}

.popup-title {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 20px;
    border-bottom: 1px solid #ebebeb;
    padding-bottom: 10px;
    margin-bottom: 10px;
}

.popup-content {
    flex: 1;
}

.scrollable-content {
    overflow-y: scroll;
}

.scrollable-content.fixed-height {
    height: 100%;
}

.overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 999;
    /* other styles for the overlay go here */
}

.popup-wrapper .popup .close-button {
    position: absolute;
    top: 5px;
    right: 5px;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background-color: black;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
}

.popup-wrapper .popup .close-button .close-icon {
    font-size: 20px;
}
</style>
