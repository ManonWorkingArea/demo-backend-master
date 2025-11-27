import storageManager from '@/plugins/storage';
import requestClient from '@/plugins/requestClient';
import { generateHtmlEmail } from './templateRender';
import { replaceShortcodesWithConfig } from './shortcode';

const Request = new requestClient(false);
const endpoint = 'https://gateway.cloudrestfulapi.com/email/send';
const configs = storageManager.get('configs');

export async function sendEmail(data) {
  const { name, email, subject, body, senderName, senderEmail, emailTemplateId } = data;

  try {
    // Retrieve email template configuration by ID
    const emailTemplateConfig = await fetchEmailTemplate(emailTemplateId);

    //console.log("emailTemplateConfig",emailTemplateConfig);

    if (!emailTemplateConfig) {
      throw new Error('Email template configuration not found.');
    }

    // Replace shortcodes in the email body
    const processedBody = replaceShortcodesWithConfig(body, { name, email });

    // Generate the final email body using the template
    const emailBody = generateHtmlEmail(emailTemplateConfig, {
      subject,
      content: processedBody,
    });

    const emailData = await recordEmailData(name, email, subject, emailBody);

    const response = await Request.POST(endpoint, {
      subject: subject,
      text: emailBody,
      html: emailBody,
      fromEmail: senderEmail,
      fromName: senderName,
      toEmail: email,
      toName: name,
    }, configs.key);

    if (response.status === 200) {
      const responseData = response.data;
      //console.log(responseData.message);
      await updateEmailStatus(emailData._id, 'confirm');
      return responseData;
    } else {
      //console.log('Failed to send email');
      const errorMessage = 'Failed to send email';
      await updateEmailStatus(emailData._id, 'fail', errorMessage);
      return errorMessage;
    }
  } catch (error) {
    console.error('Error sending email:', error);
    return error.message;
  }
}

async function fetchEmailTemplate(templateId) {
    try {
      const response = await Request.GET(`email_template/${templateId}`, configs.key);
  
      if (response.status === 200) {
        const responseData = response.data.content;
        //console.log("Response Type:", typeof responseData);
        //console.log("Response Data:", responseData);
        return JSON.parse(responseData);
      } else {
        throw new Error('Failed to fetch email template');
      }
    } catch (error) {
      console.error('Error fetching email template:', error);
      return null;
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
      //console.log('Email data recorded successfully');
      return data;
    } else {
      return 'Failed to record email data';
    }
  } catch (error) {
    //console.error('Error recording email data:', error);
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
      //console.log('Email status updated successfully');
    } else {
      return 'Failed to update email status';
    }
  } catch (error) {
    //console.error('Error updating email status:', error);
    return error.message;
  }
}
