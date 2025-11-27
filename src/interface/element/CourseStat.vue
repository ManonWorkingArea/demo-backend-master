<script>
import { Tooltip }  from '@programic/vue3-tooltip';
import {ls}         from 'vue-lsp'
export default {
    props: ['title','chcek'],
    components: {
      Tooltip
    },
    data() {
      return {
        master:ls.get('master')
      }
    },
};
</script>

<template>
<Tooltip title="จำนวนบทเรียน" size="12">
<span class="bg-gray-600 text-[12px] text-white rounded mr-2 pl-1 pr-1 pt-1 pb-1">
0 <font-awesome-icon :icon="['fas','book']" class="text-white mr-2"/>
</span>
</Tooltip>

<Tooltip title="แบบทดสอบ" size="12">
<span class="bg-gray-600 text-[12px] text-white rounded mr-2 pl-1 pr-1 pt-1 pb-1">
0 <font-awesome-icon :icon="['fas','square-check']" class="text-white mr-2"/> 
</span>
</Tooltip>

<Tooltip title="ผู้ลงทะเบียน" size="12">
<span class="bg-gray-600 text-[12px] text-white rounded mr-2 pl-1 pr-1 pt-1 pb-1">
0 <font-awesome-icon :icon="['fas','user']" class="text-white mr-2"/>
</span>
</Tooltip>
</template> 

