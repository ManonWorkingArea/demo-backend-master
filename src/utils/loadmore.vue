<template>
<div>
    <slot></slot>
    <div v-if="showMoreText">{{ moreText }}</div>
    <button @click="toggleMoreText">
        {{ loading ? 'Loading...' : (showMoreText ? buttonText.showLess : buttonText.showMore) }}
    </button>
</div>
</template>

<script>
export default {
    props: {
        url: {
            type: String,
            required: true
        },
        keyTitle: {
            type: String,
            default: ''
        },
        buttonText: {
            type: Object,
            default: () => ({
                showMore: 'Load More',
                showLess: 'Show Less'
            })
        }
    },
    data() {
        return {
            moreText: '',
            showMoreText: false,
            loading: false
        }
    },
    methods: {
        async loadMoreData() {
            this.loading = true
            try {
                const response = await fetch(this.url)
                const data = await response.json()
                if (this.keyTitle) {
                    this.moreText = data[this.keyTitle]
                } else {
                    this.moreText = JSON.stringify(data, null, 2)
                }
            } catch (error) {
                console.error(error)
                this.moreText = 'An error occurred while loading the data.'
            } finally {
                this.loading = false
            }
        },
        toggleMoreText() {
            if (this.showMoreText) {
                this.showMoreText = false
            } else if (!this.moreText) {
                this.loadMoreData()
                this.showMoreText = true
            } else {
                this.showMoreText = true
            }
        }
    }
}
</script>
