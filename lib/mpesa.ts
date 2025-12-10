// lib/mpesa.ts

interface MpesaConfig {
  consumerKey: string;
  consumerSecret: string;
  shortcode: string;
  passkey: string;
  environment: 'sandbox' | 'production';
  callbackUrl: string;
}

class MpesaService {
  private config: MpesaConfig;
  private baseUrl: string;

  constructor() {
    this.config = {
      consumerKey: process.env.MPESA_CONSUMER_KEY!,
      consumerSecret: process.env.MPESA_CONSUMER_SECRET!,
      shortcode: process.env.MPESA_SHORTCODE!,
      passkey: process.env.MPESA_PASSKEY!,
      environment: (process.env.MPESA_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox',
      callbackUrl: process.env.MPESA_CALLBACK_URL!,
    };

    this.baseUrl =
      this.config.environment === 'sandbox'
        ? 'https://sandbox.safaricom.co.ke'
        : 'https://api.safaricom.co.ke';
  }

  // Generate access token
  async getAccessToken(): Promise<string> {
    try {
      const auth = Buffer.from(
        `${this.config.consumerKey}:${this.config.consumerSecret}`
      ).toString('base64');

      const response = await fetch(
        `${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
        {
          headers: {
            Authorization: `Basic ${auth}`,
          },
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to get M-Pesa access token: ${error}`);
      }

      const data = await response.json();
      return data.access_token;
    } catch (error) {
      console.error('M-Pesa token error:', error);
      throw error;
    }
  }

  // Initiate STK Push
  async stkPush(params: {
    phoneNumber: string;
    amount: number;
    accountReference: string;
    transactionDesc: string;
  }): Promise<any> {
    try {
      const accessToken = await this.getAccessToken();
      const timestamp = this.generateTimestamp();
      const password = this.generatePassword(timestamp);

      // Format phone number
      const phone = this.formatPhoneNumber(params.phoneNumber);

      const requestBody = {
        BusinessShortCode: this.config.shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline', // Use 'CustomerBuyGoodsOnline' for Till Number
        Amount: Math.round(params.amount),
        PartyA: phone,
        PartyB: this.config.shortcode,
        PhoneNumber: phone,
        CallBackURL: this.config.callbackUrl,
        AccountReference: params.accountReference,
        TransactionDesc: params.transactionDesc,
      };

      console.log('STK Push Request:', {
        ...requestBody,
        Password: '***hidden***',
      });

      const response = await fetch(
        `${this.baseUrl}/mpesa/stkpush/v1/processrequest`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error('M-Pesa STK Push error:', data);
        throw new Error(data.errorMessage || 'STK Push failed');
      }

      return data;
    } catch (error) {
      console.error('STK Push error:', error);
      throw error;
    }
  }

  // Generate timestamp in format: YYYYMMDDHHmmss
  private generateTimestamp(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    const second = String(date.getSeconds()).padStart(2, '0');

    return `${year}${month}${day}${hour}${minute}${second}`;
  }

  // Generate password: Base64(Shortcode + Passkey + Timestamp)
  private generatePassword(timestamp: string): string {
    const str = `${this.config.shortcode}${this.config.passkey}${timestamp}`;
    return Buffer.from(str).toString('base64');
  }

  // Format phone number to 254XXXXXXXXX
  formatPhoneNumber(phone: string): string {
    // Remove any spaces, dashes, or plus signs
    let cleaned = phone.replace(/[\s\-+]/g, '');

    // Handle different formats
    if (cleaned.startsWith('0')) {
      return '254' + cleaned.substring(1);
    } else if (cleaned.startsWith('254')) {
      return cleaned;
    } else if (cleaned.startsWith('7') || cleaned.startsWith('1')) {
      return '254' + cleaned;
    }

    return cleaned;
  }
}

export const mpesaService = new MpesaService();