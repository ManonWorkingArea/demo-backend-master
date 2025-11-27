<template>
    <div class="px-4 py-20 text-sm">
        <h1 class="text-lg font-bold pb-3">Subject: Your Email Subject</h1>
        <p>Dear User,</p>
        <p class="pt-3">This is the body of your email. Here you can add the main content of your message.</p>
        <p class="pt-3">Best regards,</p>
        <p>Your Name</p>
    </div>
</template>
  
<script>
export default {
    props: {
        data: {
            type: Object,
            required: true
        }
    },
    methods: {
    },
    computed: {
  },
};
</script>
