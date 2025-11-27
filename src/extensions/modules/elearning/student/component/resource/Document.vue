<template>
    <div class="bg-white shadow sm:rounded-lg">
        <div class="px-4 py-5 sm:px-6">
            <h2 id="applicant-information-title" class="text-lg font-bold leading-6 text-gray-900">เอกสาร</h2>
        </div>
        <div class="border-t border-gray-200 px-4 py-5 sm:px-6"></div>
    </div>
</template>
  
<script>
import debug from '@/plugins/Logger.js';
export default {
    props: {
        member: Object,
    },
    data() {
        return {
            message: 'Document',
        };
    },
    mounted() {
        debug.log("this.member.firstname:", this.member.firstname);
        debug.log("this.member.lastname:", this.member.lastname);

        const pageTitle = this.member.firstname + " " + this.member.lastname + " / เอกสาร";
        debug.log("pageTitle:", pageTitle);

        this.$setPageTitle(pageTitle);
    },
};
</script>
  
<style scoped>
.styled-text {
    color: blue;
    font-size: 20px;
}
</style>
  