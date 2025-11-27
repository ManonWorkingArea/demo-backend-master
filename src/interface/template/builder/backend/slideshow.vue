<template>
    <div>
    </div>
    </template>
    
    <script>
        export default {
            props: {
                dataItem: {
                    type: Object,
                    required: true,
                },
            },
            computed: {
                selectedItem() {
                    return this.dataItem;
                },
            },
            methods: {
                update(field, value) {
                    this.$emit('update', { field, value });
                },
            },
        };
    </script>
      