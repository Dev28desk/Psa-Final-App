import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithPhoneNumber, 
  RecaptchaVerifier,
  ConfirmationResult,
  PhoneAuthProvider,
  signInWithCredential
} from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBu6-8FLc1eGaaBeetVyvBcEX5AoL1xGqQ",
  authDomain: "psa-nashik-app.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "psa-nashik-app",
  storageBucket: "psa-nashik-app.firebasestorage.app",
  messagingSenderId: "610461935332",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:610461935332:web:ed897ed463933072196ef1",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Make auth globally available
if (typeof window !== 'undefined') {
  (window as any).recaptchaVerifier = null;
}

export interface PhoneAuthResult {
  success: boolean;
  confirmationResult?: ConfirmationResult;
  error?: string;
}

export interface OTPVerificationResult {
  success: boolean;
  phoneNumber?: string;
  error?: string;
}

export class FirebaseOTPService {
  private recaptchaVerifier: RecaptchaVerifier | null = null;

  // Initialize reCAPTCHA verifier
  initializeRecaptcha(containerId: string = 'recaptcha-container'): void {
    if (this.recaptchaVerifier) {
      return; // Already initialized
    }

    this.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: 'invisible',
      callback: () => {
        console.log('reCAPTCHA solved');
      },
      'expired-callback': () => {
        console.log('reCAPTCHA expired');
      }
    });

    // Store globally for cleanup
    (window as any).recaptchaVerifier = this.recaptchaVerifier;
  }

  // Send OTP to phone number
  async sendOTP(phoneNumber: string): Promise<PhoneAuthResult> {
    try {
      if (!this.recaptchaVerifier) {
        return {
          success: false,
          error: 'reCAPTCHA not initialized. Please refresh and try again.'
        };
      }

      // Format phone number (ensure it starts with country code)
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
      
      console.log('Sending OTP to:', formattedPhone);
      
      const confirmationResult = await signInWithPhoneNumber(
        auth, 
        formattedPhone, 
        this.recaptchaVerifier
      );

      return {
        success: true,
        confirmationResult
      };
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      
      // Reset reCAPTCHA on error
      this.resetRecaptcha();
      
      return {
        success: false,
        error: this.getErrorMessage(error.code) || error.message
      };
    }
  }

  // Verify OTP code
  async verifyOTP(confirmationResult: ConfirmationResult, otpCode: string): Promise<OTPVerificationResult> {
    try {
      const result = await confirmationResult.confirm(otpCode);
      
      return {
        success: true,
        phoneNumber: result.user.phoneNumber || undefined
      };
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      
      return {
        success: false,
        error: this.getErrorMessage(error.code) || 'Invalid OTP. Please try again.'
      };
    }
  }

  // Alternative verification method using credential
  async verifyWithCredential(verificationId: string, otpCode: string): Promise<OTPVerificationResult> {
    try {
      const credential = PhoneAuthProvider.credential(verificationId, otpCode);
      const result = await signInWithCredential(auth, credential);
      
      return {
        success: true,
        phoneNumber: result.user.phoneNumber || undefined
      };
    } catch (error: any) {
      console.error('Error verifying with credential:', error);
      
      return {
        success: false,
        error: this.getErrorMessage(error.code) || 'Invalid OTP. Please try again.'
      };
    }
  }

  // Reset reCAPTCHA verifier
  resetRecaptcha(): void {
    if (this.recaptchaVerifier) {
      this.recaptchaVerifier.clear();
      this.recaptchaVerifier = null;
      (window as any).recaptchaVerifier = null;
    }
  }

  // Get user-friendly error messages
  private getErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/invalid-phone-number':
        return 'Invalid phone number. Please enter a valid phone number.';
      case 'auth/too-many-requests':
        return 'Too many requests. Please try again later.';
      case 'auth/invalid-verification-code':
        return 'Invalid OTP. Please enter the correct code.';
      case 'auth/code-expired':
        return 'OTP has expired. Please request a new code.';
      case 'auth/quota-exceeded':
        return 'SMS quota exceeded. Please try again tomorrow.';
      case 'auth/captcha-check-failed':
        return 'reCAPTCHA verification failed. Please try again.';
      case 'auth/missing-phone-number':
        return 'Phone number is required.';
      case 'auth/user-disabled':
        return 'This phone number has been disabled.';
      default:
        return 'An error occurred. Please try again.';
    }
  }

  // Cleanup
  cleanup(): void {
    this.resetRecaptcha();
  }
}

// Export singleton instance
export const firebaseOTP = new FirebaseOTPService();

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    firebaseOTP.cleanup();
  });
}