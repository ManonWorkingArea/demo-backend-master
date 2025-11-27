    <template>
        <div>
            <h2>Header Group</h2>
            <ul>
                <li v-for="(item, index) in formDataArray" :key="index">
                    <input type="checkbox" :disabled="shouldDisableCheckbox(index)" v-model="selectedItems[index]"/>{{ item }}
                </li>
            </ul>

            <h3>Selected Items:</h3>
            <ul>
                <li v-for="(item, index) in headerGroup" :key="index">{{ item }}</li>
            </ul>

            <pre>{{headerGroup}}</pre>
        </div>
    </template>
  
    <script>
    export default {
    data() {
        return {
        formDataArray: [
            "สมาชิก ส.อ.ท.",
            "เลขนิติบุคคล",
            "ชื่อ - นามสกุล",
            "เบอร์ติดต่อ",
            "อีเมล์",
            "ชื่อบริษัท",
            "สำนักงานใหญ่ (ถ้ามี)",
            "สาขา (ถ้ามี)",
            "ที่อยู่ในการออกใบเสร็จรับเงิน",
            "อุตสาหกรรม",
            "ผลิตภัณฑ์",
            null,
            "รายชื่อผู้ติดต่อ"
        ],
        selectedItems: [],
        headerGroup: [],
        headLimit: 5
        };
    },
    created() {
        this.selectedItems = Array(this.formDataArray.length).fill(false);
    },
    watch: {
        selectedItems: {
            handler() {
                this.addToHeaderGroup();
            },
            deep: true
        }
    },
    methods: {
        addToHeaderGroup() {
            this.headerGroup = [];
            let addedItems = 0;
            for (let i = 0; i < this.selectedItems.length && addedItems < this.headLimit; i++) {
                if (this.selectedItems[i]) {
                this.headerGroup.push(this.formDataArray[i]);
                addedItems++;
                }
            }
        },
        shouldDisableCheckbox(index) {
            return !this.selectedItems[index] && this.headerGroup.length >= this.headLimit;
        }
    }
    };  
    </script>