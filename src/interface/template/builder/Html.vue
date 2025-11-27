<template>
    <div v-html="data.content"></div>
</template>
  
<script>
    export default {
        props: {
            data: {
                type: Object,
                required: true
            }
        },
    };
</script>
