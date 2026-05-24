const axios = require('axios');

const sendSMS = async (mobile, otp) => {
  const isSMSConfigured =
    process.env.FAST2SMS_API_KEY &&
    process.env.FAST2SMS_API_KEY !== 'your_fast2sms_api_key';

  if (!isSMSConfigured) {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📱 DEV MODE — SMS not configured`);
    console.log(`   To: +91${mobile}`);
    console.log(`   OTP: ${otp}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    return { success: true, dev: true };
  }

  try {
    // Using Quick SMS route — no DLT needed
    const response = await axios.post(
      'https://www.fast2sms.com/dev/bulkV2',
      {
        route:    'q',
        message:  `Your XTREAME STORE OTP is: ${otp}. Valid for 10 minutes. Do not share with anyone.`,
        language: 'english',
        flash:    0,
        numbers:  mobile
      },
      {
        headers: {
          authorization: process.env.FAST2SMS_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Fast2SMS response:', response.data);

    if (response.data.return === true) {
      return { success: true };
    } else {
      throw new Error(response.data.message || 'SMS sending failed');
    }
  } catch (err) {
    const errMsg = err.response?.data?.message || err.message;
    console.error('SMS Error:', errMsg);
    throw new Error(`SMS failed: ${errMsg}`);
  }
};

module.exports = sendSMS;
