<template>
<div>
    <div v-if="!showMoreText">{{ shortText }}</div>
    <div v-if="showMoreText" v-html="longText"></div>
    <button @click="toggleMoreText">
        {{ loading ? 'Loading...' : (showMoreText ? buttonText.showLess : buttonText.showMore) }}
    </button>
</div>
</template>

<script>
export default {
    props: {
        longText: {
            type: String,
            required: true,
        },
        buttonText: {
            type: Object,
            default: () => ({
                showMore: 'Load More',
                showLess: 'Show Less',
            }),
        },
    },
    data() {
        return {
            shortText: '',
            longTextArray: [],
            showMoreText: false,
            loading: false,
        }
    },
    created() {
        // Find the index of the first hr tag in the longText
        const hrIndex = this.longText.indexOf('<hrx>')

        // If an hr tag is found, use it as the split point
        if (hrIndex !== -1) {
            this.shortText = this.longText.slice(0, hrIndex)
        } else {
            this.shortText = this.longText.slice(0, this.maxCharacters)
        }
    },
    methods: {
        toggleMoreText() {
            this.loading = true
            setTimeout(() => {
                this.showMoreText = !this.showMoreText
                this.loading = false
            }, 1000)
        },
    },
}
</script>
