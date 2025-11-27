<script>
import { translate } from '@/plugins/language.js';
export default {
    props: ['check'],
    components: {},
    data() {
      return {}
    },
    methods: {
      translate,
    }
};
</script>

<template>
<span v-if="check" class="text-xs font-medium bg-emerald-600 pl-2 pr-2 pt-1 pb-1 ml-5 text-white"><font-awesome-icon :icon="['fas','check']" class="text-white"/> {{translate('general-public')	}}</span>
<span v-if="!check" class="text-xs font-medium bg-rose-600 pl-2 pr-2 pt-1 pb-1 ml-5 text-white"><font-awesome-icon :icon="['fas','times']" class="text-white"/> {{translate('general-unpublic')	}}</span>
</template> 

