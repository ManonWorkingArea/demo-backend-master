<template>
    <div class="bg-white shadow sm:rounded-lg">
        <div class="px-4 py-5 sm:px-6">
            <h2 id="applicant-information-title" class="text-lg font-bold leading-6 text-gray-900">Wallet</h2>
        </div>
        <div class="border-t border-gray-200 px-4 py-5 sm:px-6">
            <div>Balance <span class="font-bold">({{ credits }})</span></div><br/>
            <form @submit.prevent="handleSubmit">
                <label for="walletMember">Member : </label>
                <input type="text" id="walletMember" v-model="walletMember" required><br/>
                <label for="amount">Amount : </label>
                <input type="number" id="amount" v-model="amount" required><br/>
                <label for="method">Method : </label>
                <select id="method" v-model="walletMethod">
                  <option value="deposit">Deposit</option>
                  <option value="withdraw">Withdraw</option>
                  <option value="transfer">Transfer</option>
                  </select><br/>
                <label v-if="walletMethod === 'transfer'" for="targetMemberId">Target Member : </label>
                <input v-if="walletMethod === 'transfer'" type="text" id="targetMemberId" v-model="targetMemberId" required>
                <br/>
                <button type="submit">Submit</button>
            </form>
            <button @click="balance">Check</button> <br/><br/> <button @click="reset">Reset</button> <br/>
            <pre>{{ transaction }}</pre>
        </div>
    </div>
</template>
  
<script>
import wallet from "@/plugins/Wallet.js";
import dialog from '@/plugins/Dialog.js';
import debug from '@/plugins/Logger.js';

export default {
    props: {
        member: Object,
        tabs: Object,
    },
    data() {
        return {
            message: 'Wallet',
            credits: 0,
            amount: 0,
            walletMember: this.member._id,
            walletMethod: 'deposit',
            transaction: [],
        };
    },
    methods: {
        async callbackFunction() {
            try {
            console.log("callbackFunction");
            } catch (error) {
            console.error(error);
            }
        },
        updateBadge(badgeValue) {
            this.$emit('update-badge', { code: this.tabs.code, badge: badgeValue });
        },
        // Depositing
        async deposit() {
            try {
                dialog.confirm({
                    title: 'คุณต้องการเพิ่มคะแนน?',
                    message: 'เติมยอด ' + this.amount + ' เข้าสู่บัญชีของคุณ !',
                    confirm: async () => {
                    try {
                        const result = await wallet.deposit(this.walletMember, this.amount);
                        if (result && result.status === 200) {
                            this.balance();
                        }
                    } catch (error) {
                        debug.log(error)
                    }
                    },
                    cancel: () => {}
                });
            } catch (error) {
                console.error("Error", error);
            }
        },
        // Withdraw
        async withdraw() {
            try {
                dialog.confirm({
                    title: 'คุณต้องการถอนคะแนน?',
                    message: 'ถอนยอด ' + this.amount + ' ออกจากบัญชีของคุณ !',
                    confirm: async () => {
                    try {
                        const result = await wallet.withdraw(this.walletMember, this.amount);
                        if (result && result.status === 200) {
                            this.balance();
                        }
                    } catch (error) {
                        debug.log(error)
                    }
                    },
                    cancel: () => {}
                });
            } catch (error) {
                console.error("Error", error);
            }
        },
        // Transferring
        async transfer() {
            try {
                dialog.confirm({
                    title: 'คุณต้องการโอนคะแนน?',
                    message: 'โอนยอด ' + this.amount + ' เข้าสู่บัญชีของสมาชิกอื่น !',
                    confirm: async () => {
                    try {
                        const result = await wallet.transfer(this.walletMember, this.targetMemberId, this.amount);
                        if (result && result.status === 200) {
                            this.balance();
                        }
                    } catch (error) {
                        debug.log(error)
                    }
                    },
                    cancel: () => {}
                });
            } catch (error) {
                console.error("Error", error);
            }
        },
        // Balance
        async balance() {
            try {
                await wallet.balance(this.walletMember);
                this.credits = wallet.credits
                this.updateBadge(this.credits)
            } catch (error) {
                console.error("Error", error);
            }
        },
        // Balance
        async reset() {
            try {
                dialog.confirm({
                    title: 'คุณต้องการรีเซ็ตคะแนน?',
                    message: 'ลบยอด ' + this.credits + ' จากบัญชีของคุณ !',
                    confirm: async () => {
                    try {
                        await wallet.reset(this.walletMember);
                        this.credits = wallet.credits
                    } catch (error) {
                        debug.log(error)
                    }
                    },
                    cancel: () => {}
                });
            } catch (error) {
                console.error("Error", error);
            }
        },
        // Transaction
        async balanceTransactions() {
            try {
                const transaction = await wallet.transaction(this.walletMember, 5);
                this.transaction = transaction
                debug.log('Transaction logs:', transaction);
            } catch (error) {
                console.error("Error", error);
            }
        },
        // HandleSubmit
        async handleSubmit() {
            if (this.walletMethod === 'deposit') {
                this.deposit();
            } else if (this.walletMethod === 'transfer') {
                this.transfer();
            } else if (this.walletMethod === 'withdraw') {
                this.withdraw();
            } else if (this.walletMethod === 'balance') {
                this.balance();
            }
        },
    },
    async mounted() {
        try {
            await this.balance();
            await this.balanceTransactions();
            this.$setPageTitle(this.member.firstname + " " + this.member.lastname + " / Wallet");
        } catch (error) {
            debug.log(Error);
        }
    },
};
</script>
  
<style scoped>
.styled-text {
    color: blue;
    font-size: 20px;
}
</style>
  