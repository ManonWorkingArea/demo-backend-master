import storageManager from '@/plugins/storage';
import { emailTemplate } from './email/emailTemplate.js';
import CryptoJS from 'crypto-js';

import requestClient from '@/plugins/requestClient';
const Request = new requestClient(false);

const endpoint = 'https://gateway.cloudrestfulapi.com/email/send'; // Updated endpoint
const session = storageManager.get('session');
const configs = storageManager.get('configs');

export async function sendEmail(data, templateType = '') {
  
  let email_provider;

  if (session.interface === 'frontend') {
    ({ email_provider } = configs);
  } else {
    ({ email_provider } = session.current);
  }

  const { name, email, subject, body } = data;

  try {
    let emailBody;
    let emailSubject;

    if (templateType === 'welcome') {
      ({ emailBody, emailSubject } = getWelcomeTemplate(data));
    } else if (templateType === 'reset-password') {
      ({ emailBody, emailSubject } = await getResetPasswordTemplate(data));
    } else if (templateType === 'change-password') {
      ({ emailBody, emailSubject } = await getChangePasswordTemplate(data));
    } else if (templateType === 'new-template') { 
      ({ emailBody, emailSubject } = getNewTemplate(data));
    } else {
      emailBody = body;
      emailSubject = subject;
    }

    emailBody = emailTemplate.replace('{{ content }}', emailBody).replace('{{ subject }}', emailSubject).replace('{{ provider }}', email_provider);

    const emailData = await recordEmailData(name, email, emailSubject, emailBody);

    const response = await Request.POST(endpoint, {
      subject: emailSubject,
      text: emailBody,
      html: emailBody ,
      fromEmail: "noreply@fti.academy",
      fromName: "Academy Customer Support",
      toEmail: email,
      toName: name,
    }, configs.key);

    if (response.status === 200) { // Check the response status code
      const responseData = response.data;
      console.log(responseData.message);
      await updateEmailStatus(emailData._id, 'confirm');
      return responseData;
    } else {
      console.log('Failed to send email');
      const errorMessage = 'Failed to send email';
      await updateEmailStatus(emailData._id, 'fail', errorMessage);
      return errorMessage;
    }
  } catch (error) {
    console.error('Error sending email:', error);
    return error.message;
  }
}

async function recordEmailData(name, email, subject, body) {
  try {
    const payload = {
      data: {
        name: name,
        email: email,
        subject: subject,
        body: body,
        status: 'submit'
      },
      options: {
        fieldType: [],
        uniqueFields: []
      }
    };

    const { status, data } = await Request.POST('message/', payload, configs.key);

    if (status === 200) {
      console.log('Email data recorded successfully');
      return data;
    } else {
      return 'Failed to record email data';
    }
  } catch (error) {
    console.error('Error recording email data:', error);
    return error.message;
  }
}

async function updateEmailStatus(id, status, error = '') {
  try {
    const payload = {
      data: {
        status: status,
        error: error
      }
    };

    const { status: responseStatus } = await Request.PUT(`message/${id}`, payload, configs.key);

    if (responseStatus === 200) {
      console.log('Email status updated successfully');
    } else {
      return 'Failed to update email status';
    }
  } catch (error) {
    console.error('Error updating email status:', error);
    return error.message;
  }
}

function getNewTemplate(data) {
  const emailBody = `Hello ${data.name},\n\nThis is your custom email body.\n\nYour custom data: ${data.content}`;
  const emailSubject = 'Custom Email';
  return { emailBody, emailSubject };
}

function getWelcomeTemplate() {
  const emailBody = 'Welcome to our website!';
  const emailSubject = 'Welcome Email';
  return { emailBody, emailSubject };
}

function getChangePasswordTemplate() {
  const emailBody = `
  <p>สวัสดีค่ะ,</p>
  <p>ขอแจ้งให้ทราบว่าบัญชีของคุณได้รับการเปลี่ยนแปลงรหัสผ่านเรียบร้อยแล้วค่ะ</p>
  <p>หากคุณไม่ได้ดำเนินการเปลี่ยนรหัสผ่านนี้ กรุณาติดต่อทีมงานเพื่อรายงานให้ทราบค่ะ</p></br></br>
  <p>ขอบคุณค่ะ</p>
  `;
  const emailSubject = 'แจ้งเตือน: บัญชีของคุณได้รับการเปลี่ยนรหัสผ่าน';
  return { emailBody, emailSubject };
}

async function getResetPasswordTemplate(data) {
  try {
    const payload = {
      method: 'find',
      args: [
        {
          $and: [
            { email: data.email }
          ]
        }
      ]
    };

    const { data: loginData } = await Request.POST('user/query', payload, configs.key);

    if (loginData.length > 0) {
      const newPassword = generatePassword(6);
      const salt = CryptoJS.lib.WordArray.random(16);
      const hash = CryptoJS.SHA256(newPassword + salt).toString();
      
      try {
        const updatePayload = {
          data: {
            password: hash,
            salt: salt.toString(),
            req_reset: true
          }
        };

        const { status } = await Request.PUT(`user/${loginData[0]._id}`, updatePayload, configs.key);
    
        if (status === 200) {
          console.log('Email status updated successfully');
        } else {
          return 'Failed to update email status';
        }
      } catch (error) {
        console.error('Error updating email status:', error);
        return error.message;
      }

      const emailSubject = 'แจ้งเตือน: รีเซ็ตรหัสผ่าน';
      const emailBody = `
        <p>สวัสดีค่ะ,</p>
        <p>ขอแจ้งให้ทราบว่าบัญชีของคุณได้รับการเปลี่ยนแปลงรหัสผ่านเรียบร้อยแล้วค่ะ</p>
        <p>รหัสผ่านใหม่ของคุณคือ: <strong>${newPassword}</strong></p>
        <p>โปรดจำรหัสผ่านใหม่นี้ไว้เพื่อเข้าสู่ระบบในครั้งถัดไปค่ะ</p>
        <p>หากคุณไม่ได้ดำเนินการเปลี่ยนรหัสผ่านนี้ กรุณาติดต่อทีมงานเพื่อรายงานให้ทราบค่ะ</p></br></br>
        <p>ขอบคุณค่ะ</p>
      `;
      return { emailBody, emailSubject };
    } else {
      console.log("No User");
      return 'User not found';
    }
  } catch (error) {
    console.error('Error retrieving user information:', error);
    return error.message;
  }
}

function generatePassword(length) {
  const characters = '0123456789';
  let password = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    password += characters[randomIndex];
  }
  return password;
}
