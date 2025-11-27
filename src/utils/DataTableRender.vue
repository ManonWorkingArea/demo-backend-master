<template>
    <div v-if="showPopup" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
        <div class="popup-inner bg-white w-11/12 md:w-3/4 lg:w-2/3 xl:w-1/2 2xl:w-2/5 overflow-auto rounded-lg shadow-lg p-4">
            <h3 class="text-lg font-semibold mb-4">Preview Data</h3>
            <div class="overflow-x-auto max-h-[600px]"> <!-- Added max-h-80 class to limit height and enable scrolling -->
                <table id="previewTable" class="min-w-full leading-normal">
                    <thead>
                        <tr class="bg-gray-100 text-left text-gray-600 uppercase text-sm leading-normal">
                            <th class="py-2 px-3">#</th>
                            <!-- In both previewTable and dataTable -->
                            <th class="py-2 px-3" v-for="header in allTableHeaders" :key="header">
                                <div style="display: flex; align-items: center; white-space: nowrap;">
                                    <input type="checkbox" v-model="columnsVisibility[header]" style="margin-right: 8px;"> 
                                    <!-- Updated to show editable header name -->
                                    <span v-if="!headerEditing[header]">{{ editableHeaders[header] }}</span>
                                    <input v-else v-model="editableHeaders[header]" @keyup.enter="finalizeHeaderEdit(header)" type="text" class="form-input">
                                    <button @click="editHeader(header)" class="ml-2">Edit</button>
                                </div>
                            </th>
                        </tr>
                    </thead>
                    
                    <tbody class="text-gray-600 text-sm font-light">
                        <tr class="border-b border-gray-200 hover:bg-gray-100" v-for="(item, index) in dataArray" :key="index">
                            <td class="py-2 px-3 whitespace-nowrap">{{ index + 1 }}</td>
                            <td class="py-2 px-3" v-for="header in allTableHeaders" :key="header+'-'+index" :style="{ opacity: columnsVisibility[header] ? '1' : '0.5' }">
                                {{ item[header] ? item[header] : '-' }}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div class="flex justify-end space-x-2 mt-4">
                <button @click="exportTableToCSV" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Export to CSV</button>
                <button @click="closePopup" class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">Close</button>
            </div>
        </div>
    </div>
    

<div>
    <table id="dataTable" :class="{ 'hidden': !showTable }">
        <thead>
            <tr>
                <th>#</th>
                <th v-for="header in allTableHeaders" :key="header"><span v-if="!headerEditing[header]">{{ editableHeaders[header] }}</span></th>

            </tr>
        </thead>
        <tbody>
            <tr v-for="(item, index) in dataArray" :key="index">
                <td>{{ index + 1 }}</td>
                <td v-for="header in allTableHeaders" :key="header+'-'+index" :style="{ opacity: columnsVisibility[header] ? '1' : '0.5' }">
                    {{ item[header] ? item[header] : '-' }}
                </td>

            </tr>
        </tbody>
    </table>
    <button @click="exportToCSV" :class="{ 'hidden': !showExport }" class="bg-blue-500 hover:bg-blue-700 text-white py-2 px-3 rounded text-sm mr-2">
        {{ exportButtonText }}
    </button>
</div>
</template>

<script>
export default {
    props: {
        listItems: {
            type: Array,
            required: true,
        },
        table: {
            type: Boolean,
            default: true,
        },
        export: {
            type: Boolean,
            default: true,
        },
        parent: {
            type: Object,
        },
        status: {
            type: String
        },
        exportButtonText: { // New prop for button text
            type: String,
            default: 'Export CSV',
        },
    },
    data() {
        return {
            loading: true,
            showTable: this.table,
            showExport: this.export,
            dataArray: [],
            showPopup: false,
            columnsVisibility: {}, // Tracks visibility for adjusting opacity
            allTableHeaders: [],
            headerEditing: {}, // Tracks which headers are being edited
        editableHeaders: {}, // Temporary storage for editable header values
        };
    },
    watch: {
        listItems: {
            handler(newVal) {
                this.formatListItems(newVal);
                this.initializeColumnVisibility();
            },
            immediate: true,
            deep: true,
        },
    },
    computed: {
        tableHeaders() {
            if (this.dataArray.length === 0) {
                return [];
            }
            const headers = new Set();
            this.dataArray.forEach(item => {
                Object.keys(item).forEach(key => headers.add(key));
            });
            return Array.from(headers);
        },
    },
    methods: {
        editHeader(header) {
            this.headerEditing[header] = true;
        },
        finalizeHeaderEdit(header) {
            this.headerEditing[header] = false;
        },
        initializeColumnVisibility() {
            this.allTableHeaders = this.dataArray.length > 0 ? Object.keys(this.dataArray[0]) : [];
            const undefinedIndex = this.allTableHeaders.indexOf("undefined");
            if (undefinedIndex !== -1) {
                this.allTableHeaders.splice(undefinedIndex, 1);
            }
            this.allTableHeaders.forEach(header => {
                this.columnsVisibility[header] = true;
                this.headerEditing[header] = false;
                this.editableHeaders[header] = header;
            });
            this.columnsVisibility['process'] = true;
        },
        formatListItems() {
            const formattedData = this.listItems.flatMap(item => {
                const parentData = item;
                
                // จัดการ formData ทั่วไป (ไม่ต้องรอ setData)
                const baseData = Object.entries(item.formData).reduce((acc, [key, field]) => {
                    console.log("key", key);
                    if (!field || typeof field !== 'object') return acc;

                    switch (field.type) {
                        case 'select':
                            acc[field.name] = field.value?.label || '';
                            break;
                            
                        case 'radiobox':
                            acc[field.name] = field.value?.label || '';
                            break;
                            
                        case 'text':
                        case 'email':
                        case 'number':
                            acc[field.name] = field.value || '';
                            break;
                            
                        case 'datetime':
                            acc[field.name] = field.value || '';
                            break;
                            
                        case 'upload':
                            acc[field.name] = Array.isArray(field.value) ? field.value.join(', ') : field.value || '';
                            break;
                            
                        case 'billing':
                        case 'delivery':
                        case 'tax':
                            if (field.value && typeof field.value === 'object') {
                                const province = (field.value['province'] || '').toString().trim().toLowerCase();
                                const isInBangkok = province === 'กรุงเทพ' || province === 'กรุงเทพมหานคร';
                                
                                // ถ้าเป็นข้อมูลเขต ให้ตัดคำว่า "อำเภอ" ออกถ้ามี
                                let districtValue = (field.value['district'] || '').toString().trim();
                                if (isInBangkok && districtValue.startsWith('อำเภอเขต')) {
                                    districtValue = districtValue.replace('อำเภอเขต', '');
                                } else if (isInBangkok && districtValue.startsWith('เขต')) {
                                    districtValue = districtValue.replace('เขต', '');
                                }
                                
                                const masterFormat = {
                                    "NO": "เลขที่ ",
                                    "MOO": "ม.",
                                    "SOI_TH": "ซ.",
                                    "BUILDING_TH": "",
                                    "ROAD_TH": "ถนน",
                                    "subdistrict": isInBangkok ? "แขวง" : "ตำบล",
                                    "district": isInBangkok ? "เขต" : "อำเภอ",
                                    "province": isInBangkok ? "" : "จังหวัด",
                                    "zipcode": ""
                                };

                                let fullAddressComponents = [];
                                Object.keys(masterFormat).forEach(key => {
                                    let addressPart = (field.value[key] || '').toString().trim();
                                    // ใช้ค่า districtValue ที่ปรับแล้วสำหรับเขต
                                    if (key === 'district' && isInBangkok) {
                                        addressPart = districtValue;
                                    }
                                    
                                    if (addressPart && !['n/a', 'unset', '-', 'ไม่มีข้อมูล'].includes(addressPart.toLowerCase())) {
                                        fullAddressComponents.push(`${masterFormat[key]}${addressPart}`);
                                        acc[`${field.name}-${key}`] = addressPart;
                                    } else {
                                        acc[`${field.name}-${key}`] = '-';
                                    }
                                });
                                
                                acc[`${field.name}-ที่อยู่แบบเต็ม`] = fullAddressComponents.length > 0 ? 
                                    fullAddressComponents.join(' ').trim() : 
                                    '-';
                            }
                        break;
                    }
                    return acc;
                }, {});

                // เพิ่มข้อมูลพื้นฐาน
                
                // เพิ่มการตรวจสอบว่า item.order มีค่า (เป็น object ไม่ใช่ array)
                baseData['TAX_ID'] = item.order?.detailData?.tax_id || '';
                baseData['TRANSFER_DATE'] = item.order?.detailData?.transfered_date || '';
                baseData['TRANSFER_REF2'] = item.order?.detailData?.transfered_ref2 || '';
                baseData['TRANSFER_REF1'] = item.order?.detailData?.transfered_ref1 || '';
                baseData['SUB_SECTION_AMOUNT'] = item.order?.detailData?.transfered_amount || '';
                baseData['INV_NO'] = item.order?.detailData?.tranNo || '';
                /*
                baseData['TRANSFER_SEQ'] = "";
                baseData['SUB_SECTION_QTY'] = "1";
                baseData['TRANSFER_DATE1'] = "";
                baseData['BANK_ACCOUNT'] = "0140963012502";
                baseData['NOTE_TH'] = "Example of item description";
                baseData['BANK_CODE'] = "014";
                baseData['DIV_CODE'] = "115-99";

                baseData['BUDGET_YEAR'] = "2567";
                baseData['BUDGET_MONTH'] = "1";
                baseData['CR_BY'] = "FTI-Academy";*/

                // ข้อมูลสถานะและคะแนน
                baseData['สถานะ'] = parentData.process;
                baseData['ความคืบหน้า'] = parentData?.enroll?.analytics?.complete + "/" + parentData?.enroll?.analytics?.total ?? '0/0';
                baseData['สอบก่อนเรียน'] = parentData?.enroll?.analytics?.pre?.score ?? 0;
                baseData['สอบหลังเรียน'] = parentData?.enroll?.analytics?.post?.score ?? 0;
                baseData['สอบซ่อม'] = parentData?.enroll?.analytics?.retest?.score ?? 0;

                // คำนวณผลการสอบ
                const analytics = parentData?.enroll?.analytics;
                let postScore = parseInt(analytics?.post?.score ?? 0);
                let retestScore = parseInt(analytics?.retest?.score ?? 0);
                let measure = parseInt(analytics?.post?.measure ?? 33);

                if (postScore >= measure) {
                    baseData['ผล'] = "ผ่าน";
                } else if (retestScore < measure) {
                    baseData['ผล'] = "ไม่ผ่าน";
                } else {
                    baseData['ผล'] = "ผ่าน";
                }

                // จัดการข้อมูลรอบสอบ
                const examRoundValue = item.formData?.["radiobox-14-0-9"]?.value?.value;
                if (examRoundValue === 'round-1') {
                    baseData['รอบสอบ'] = 'รอบ 1';
                } else if (examRoundValue === 'round-2') {
                    baseData['รอบสอบ'] = 'รอบ 2';
                } else {
                    baseData['รอบสอบ'] = examRoundValue ?? 'ไม่ได้เลือก';
                }

                // จัดการวันที่ใบรับรอง
                let certCreateDate = '';
                let certExpireDate = '';
                const examRound = item.formData?.["radiobox-14-0-9"]?.value?.value;
                if (examRound === 'round-1') {
                    certCreateDate = '4 เดือน กันยายน พ.ศ. 2567';
                    certExpireDate = '3 เดือน กันยายน พ.ศ. 2572';
                } else if (examRound === 'round-2') {
                    certCreateDate = '7 เดือน กันยายน พ.ศ. 2567';
                    certExpireDate = '6 เดือน กันยายน พ.ศ. 2572';
                }

                // จัดการข้อมูลใบรับรอง
                const courseID = item.courseID;
                const userID = item.userID;
                
                if (baseData['ผล'] === "ผ่าน") {
                    baseData['วันที่ออกใบรับรอง'] = certCreateDate;
                    baseData['วันหมดอายุ'] = certExpireDate;
                    baseData['URL'] = "https://doa.fti.or.th/lesson/certification/" + courseID + "/" + userID;
                    baseData['Certification Code'] = userID;
                    baseData['Certification ID'] = "68/1/" + item.formData?.["input-6-0-5"]?.value;
                } else {
                    baseData['วันที่ออกใบรับรอง'] = '';
                    baseData['วันหมดอายุ'] = '';
                    baseData['URL'] = '';
                    baseData['Certification Code'] = '';
                    baseData['Certification ID'] = '';
                }

                // จัดการ setData (ถ้ามี)
                const setDataFields = item.formData.setData || {};
                const setDataArrays = Object.keys(setDataFields).flatMap(setDataKey => {
                    return setDataFields[setDataKey].flatMap(contactSet => {
                        return contactSet.reduce((acc, detail) => {
                            let dataValue = '';
                            if(detail.type === 'select') {
                                dataValue = detail.value.label;
                            } else {
                                dataValue = detail.value;
                            }
                            acc[`${setDataKey}-${detail.name}`] = dataValue;
                            return acc;
                        }, {});
                    });
                });

                // ถ้าไม่มี setData ให้ return baseData เลย
                if (setDataArrays.length === 0) {
                    return [baseData];
                }

                // ถ้ามี setData ให้ merge กับ baseData
                return setDataArrays.map(setData => ({
                    ...setData,
                    ...baseData
                }));
            });

            this.dataArray = formattedData;
            console.log("ListItems:", this.listItems);
            console.log("FormattedData:", formattedData);
        },
        exportToCSV() {
            document.body.classList.add('body-scroll-lock');
            this.showPopup = true;
        },
        closePopup() {
            document.body.classList.remove('body-scroll-lock');
            this.showPopup = false;
        },
        exportTableToCSV() {
            let csvContent = "data:text/csv;charset=utf-8,";
            const headers = this.allTableHeaders.filter(header => this.columnsVisibility[header]);
            csvContent += headers.join(",") + "\r\n";

            this.dataArray.forEach(item => {
                let row = headers.map(header => {
                    const cellValue = item[header] ? item[header].toString() : '';
                    return `"${cellValue.replace(/"/g, '""')}"`;
                }).join(",");
                csvContent += row + "\r\n";
            });

            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            const fileName  = this.parent.name  + " - (" + (this.status ? this.status : 'ทั้งหมด') + ') - ข้อมูลการกรอกแบบฟอร์ม.csv';
            link.setAttribute("download", fileName);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            this.showPopup = false;
        }
    },
    mounted() {
        this.loading = false;
    },
};
</script>

<style scoped>
.popup {
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 999;
}

.popup-inner {
    /* Existing styles for larger screens */
    width: 70%;
    max-width: 1000px;
    margin: auto;
    padding: 20px;
    background-color: #fff;
    border-radius: 5px;
    overflow-auto: auto;
    position: relative;
    z-index: 1050;
}

/* Media query for screens smaller than 768px */
@media (max-width: 768px) {
    .popup-inner {
        width: 100%; /* Make the popup full width */
        max-width: 100%; /* Ensure it does not exceed the screen size */
        border-radius: 0; /* Optional: remove border radius for full edge-to-edge appearance */
        margin: 0; /* Remove margin to fit the entire width */
        overflow: hidden; /* Adjust overflow as needed */
    }
}
</style>
