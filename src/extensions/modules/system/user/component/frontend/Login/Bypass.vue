<script>
import storageManager from '@/plugins/storage';

export default {
    name: 'Bypass',
    components: {},
    data() {
        return {
          configs: storageManager.get('configs'),
          hostname: storageManager.get('hostname'),
          username: '',
          password: '',
          errorStage: false,
          errorMessage: '',
          newmember: false,
          showForm: false,
          activeBlock: false,
          memberMode: 'login',
          dataItem: this.$route.params.id,
        }
    },
    mounted() {
      this.login();
    },
    methods: {

        async login() {
            try {
                this.activeBlock = true;
                const { data, status } = await this.$Request.GET(`user/${this.dataItem}`, this.configs.key);
                if (status === 200) {
                  if (data === null || data === '' || data === undefined) {
                    this.errorStage = true
                    this.errorMessage = "ไม่พบข้อมูลบัญชีผู้ใช้นี้";
                    this.activeBlock = false;
                    console.log("ไม่พบข้อมูลบัญชีผู้ใช้นี้",data);
                    return;
                  } else {
                    if (data.role != "user") {
                        this.errorStage = true
                        this.activeBlock = false;
                        this.errorMessage = "ไม่มีสิทธิ์เข้าใช้งานเว็บไซต์นี้";
                        console.log("ไม่มีสิทธิ์เข้าใช้งานเว็บไซต์นี้");
                    } else {
                        const resAPI = await this.$Request.POST('enroll/query', {
                            method: 'find',
                            hidden: ['userID'],
                            args: [{
                                $and: [
                                  { userID: data._id }
                                ]
                            }]
                        }, this.configs.key);

                        const getEnroll = resAPI.data;
                        if (resAPI.status === 200) {

                          console.log("Access");

                          let unitList = [];
                          let currentAccess = "";

                          const session = {
                            active: true,
                            token: data._id,
                            refresh: "",
                            login: true,
                            userID: data._id,
                            user: data,
                            loader: false,
                            role: data.role,
                            nav: "normal-nav",
                            layout: "frontend-layout",
                            current: currentAccess,
                            list: unitList,
                            enroll: getEnroll,
                            channel: 'web',
                          };
                          storageManager.update('session', session)
                          //debug.log("session",session);
                          window.location.href = "/user/profile"
                        }
                    }
                  }
                }

            } catch (error) {
                //debug.log(error)
            }
        },
    },

};
</script>

<template>
    <div>
        ...</div>
</template>

<style scoped>
.input-label {
    font-size: 15px;
    background: #fff;
    position: absolute;
    left: 10px;
    top: -10px;
    padding-left: 4px;
    padding-right: 5px;
    color: #000000;
    font-weight: bold;
}
</style>