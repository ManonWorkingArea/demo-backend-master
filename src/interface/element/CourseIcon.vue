<script>
import { Tooltip }  from '@programic/vue3-tooltip';
import {ls}         from 'vue-lsp'
export default {
    props: ['order','title','chcek'],
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
<span v-if="ls.get('master')">
    <Tooltip title="Master ของหลักสูตรอื่น"><font-awesome-icon :icon="['fas','lock']" class="text-rose-400"/></Tooltip>{{title}}
</span>
<span v-if="!ls.get('master') && chcek!='none'">
    <Tooltip title="เชื่อมโยงกับ Master แล้ว"><font-awesome-icon :icon="['fas','link']" class="text-green-600"/></Tooltip>{{title}}
</span>
<span v-if="!ls.get('master') && chcek==='none'">
    <Tooltip title="ไม่เชื่อมโยงกับ Master ใดๆแล้ว"><font-awesome-icon :icon="['fas','link-slash']"  class="text-rose-400"/> </Tooltip>{{title}}
</span>
</template> 

