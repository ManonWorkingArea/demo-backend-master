// Define a JavaScript module to manage member credits
import storageManager from '@/plugins/storage';
import toast from '@/plugins/ToastUI.js';

import requestClient from '@/plugins/requestClient';
const Request = new requestClient(false);

const config  = storageManager.get('configs');

const handleError = (error, errorMessage = 'Unknown error') => {
  //this.toast = toast({ type: 'error', message: `Failed: ${error ? error.message : errorMessage}`, autohide: true });
  console.error(errorMessage);
  throw error;
};

const wallet  = {
  credits: 0,
  apiUrl: 'wallet',
  apiKey: config.key,
  initialize(initialPoints = 0) {
    this.credits = initialPoints;
  },
  async api(requestData, mode) {
    try {
      const api     = mode ? this.apiUrl + mode : this.apiUrl;
      const request = mode ? requestData : { data: requestData, options: {} };
      const resAPI  = await Request.POST(api, request, this.apiKey);
      const status  = resAPI.status;
      if (!resAPI.status===200) {
        throw new Error(`API request failed with status: ${status}`);
      }
      const finalRes  = resAPI.data;
      finalRes.status = status;
      return finalRes;
    } catch (error) {
      handleError(error);
    }
  },
  async adjusts(memberId, type, amount, toMemberId) {
    try {
      const currentPoint = await this.balance(memberId);
      const processDate = new Date().toISOString();
      const adjustPointAPI = await Request.PUT(`user/${memberId}`, {
        data: {
          point: { active: currentPoint, history: { type, point: amount, date: processDate, remark: toMemberId } },
        },
        options: {},
      }, this.apiKey);
  
      if (adjustPointAPI.status === 200) {
        await this.balance(memberId);
        return { status: 200, message: "Points updated successfully." };
      } else {
        throw new Error(`Failed to update user credits via API (${type}).`);
      }
    } catch (error) {
      return handleError(error, `Error while updating credits (${type}).`);
    }
  },  
  async balance(memberId) {
    try {
      if (!memberId.trim()) {
        throw new Error("Please enter a valid member ID.");
      }
      const requestData = {
        method: 'find',
        args: [
          {
            $and: [{ user: memberId }],
          },
        ],
        paging: { page: 1, limit: 200 },
      };
      const finalRes = await this.api(requestData, "/query");
      if (finalRes && finalRes.data && finalRes.data.length > 0) {
        const pointTransactions = finalRes.data;
        const realPoints = pointTransactions.reduce((acc, transaction) => {
          if (transaction.type === 'in') {
            return acc + transaction.point;
          } else if (transaction.type === 'out') {
            return acc - transaction.point;
          }
          return acc;
        }, 0);
        this.credits = realPoints;
        return realPoints;
      } else {
        throw new Error("No data returned from API.");
      }
    } catch (error) {
      return handleError(error, 'Error while fetching balance.');
    }
  },  
  async deposit(memberId, amount) {
    try {
      this.toast = toast({ type: 'pending', message: `กำลังเพิ่มคะแนน`});
      if (amount <= 0) {
        throw new Error("Deposit amount must be greater than zero.");
      }
      const requestData = {
        user: memberId,
        point: amount,
        type: 'in',
        mode: 'deposit',
      };
      const resAPI = await this.api(requestData);
  
      if (resAPI.status !== 200) {
        throw new Error("Failed to deposit credits via API.");
      }
      const updateResult = await this.adjusts(memberId, 'deposit', amount);
      this.toast.hide('เพิ่มคะแนนเสร็จแล้ว', 'success', 300, () => {});
      return updateResult;
    } catch (error) {
      return handleError(error, 'Error while adding credits.');
    }
  },
  async withdraw(memberId, amount) {
    try {
      this.toast = toast({ type: 'pending', message: `กำลังถอนคะแนน`});
      if (amount <= 0) {
        throw new Error("Withdrawal amount must be greater than zero.");
      }
      const currentPoint = await this.balance(memberId);
      if (amount > currentPoint) {
        throw new Error("Withdrawal amount exceeds the current credits.");
      }
      const requestData = {
        user: memberId,
        point: amount,
        type: 'out',
        mode: 'withdraw',
      };
      const resAPI = await this.api(requestData);
  
      if (resAPI.status !== 200) {
        throw new Error("Failed to withdraw credits via API.");
      }
  
      const updateResult = await this.adjusts(memberId, 'withdraw', amount);
      this.toast.hide('ถอนคะแนนเสร็จแล้ว', 'success', 300, () => {});
      return updateResult;
    } catch (error) {
      return handleError(error, 'Error while removing credits.');
    }
  },
  async transfer(memberId, toMemberId, amount) {
    try {
      this.toast = toast({ type: 'pending', message: `กำลังโอนคะแนน`});
      if (amount <= 0 || !toMemberId) {
        throw new Error("Please enter a valid point amount and target member ID.");
      }
      const currentPoint = await this.balance(memberId);
      if (amount > currentPoint) {
        throw new Error("Transfer amount exceeds the current credits.");
      }
      const depositRequestData = {
        user: toMemberId,
        point: amount,
        type: 'in',
        mode: 'receive',
        remark: memberId,
      };
      const firstRes = await this.api(depositRequestData);
  
      if (firstRes.status !== 200) {
        throw new Error("Failed to receive credits via API.");
      }
  
      await this.adjusts(toMemberId, 'receive', amount, memberId);
  
      const withdrawRequestData = {
        user: memberId,
        point: amount,
        type: 'out',
        mode: 'send',
        remark: toMemberId,
      };
      const finalRes = await this.api(withdrawRequestData);
  
      if (finalRes.status !== 200) {
        throw new Error("Failed to send credits via API.");
      }
  
      const updateResult = await this.adjusts(memberId, 'send', amount, toMemberId);
      this.toast.hide('โอนคะแนนเสร็จแล้ว', 'success', 300, () => {});
      return updateResult;
    } catch (error) {
      return handleError(error, 'Error while transferring credits.');
    }
  },
  async transaction(memberId, numItemsToShow) {
    try {
      if (!memberId.trim()) {
        throw new Error("Please enter a valid member ID.");
      }
      const requestData = {
        method: 'find',
        args: [
          {
            $and: [{ user: memberId }],
          },
        ],
        paging: { page: 1, limit: numItemsToShow },
        sort: { createdAt: -1 }
      };
      const response = await this.api(requestData, "/query");
  
      if (response && response.data && response.data.length > 0) {
        toast({ type: 'success', message: `Get Transaction Success`, autohide: true });
        return response.data;
      } else {
        throw new Error("No transaction log data returned from API.");
      }
    } catch (error) {
      return handleError(error, 'Error while fetching transaction log.');
    }
  },
  async reset(memberId) {
    try {
      this.toast = toast({ type: 'pending', message: `กำลังรีเซ็ตคะแนน`});
      const currentPoint = await this.balance(memberId);
  
      const requestData = {
        user: memberId,
        point: currentPoint,
        type: 'out',
        mode: 'reset',
      };
  
      const resAPI = await this.api(requestData);
  
      if (resAPI.status === 200) {
        this.credits = 0; // Update the local credits balance
        const updateResult = await this.adjusts(memberId, 'reset', currentPoint);
        this.toast.hide('รีเซ็ตคะแนนเสร็จแล้ว', 'success', 300, () => {});
        return updateResult;
      } else {
        throw new Error("Failed to reset credits via API.");
      }
    } catch (error) {
      return handleError(error, 'Error while resetting credits.');
    }
  },
};

export default wallet;