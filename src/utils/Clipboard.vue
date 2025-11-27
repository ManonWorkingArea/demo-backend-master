<template>
    <button @click="copyToClipboard" class="text-xs">
        <span v-html="buttonTextWithIcon"></span>
    </button>
</template>
  
<script>
export default {
    props: {
        text: {
            type: String,
            required: true
        },
        buttonText: {
            type: String,
            required: true
        },
        buttonTextDone: {
            type: String,
            required: true
        }
    },
    data() {
        return {
            currentButtonText: this.buttonText,
            clipboardIcon: '<i class="far fa-clipboard"></i>',
            checkIcon: '<i class="fas fa-check"></i>'
        };
    },
    computed: {
        buttonTextWithIcon() {
            return this.currentButtonText === this.buttonText ?
                this.clipboardIcon + ' ' + this.currentButtonText :
                this.checkIcon + ' ' + this.currentButtonText;
        }
    },
    methods: {
        copyToClipboard() {
            navigator.clipboard.writeText(this.text).then(() => {
                this.currentButtonText = this.buttonTextDone;
                setTimeout(() => {
                    this.currentButtonText = this.buttonText;
                }, 1000);
            }).catch(err => {
                console.error('Failed to copy: ', err);
            });
        }
    }
};
</script>
  