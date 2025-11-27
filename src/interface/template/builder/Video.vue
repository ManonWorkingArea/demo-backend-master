<template>
    <h1>{{ data.name }}</h1>
</template>
  
<script>
    export default {
        props: {
            data: {
                type: Object,
                required: true
            }
        }
    };
</script>
