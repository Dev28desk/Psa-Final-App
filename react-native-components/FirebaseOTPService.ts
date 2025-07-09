import auth from '@react-native-firebase/auth';

export interface OTPResult {
  success: boolean;
  confirmation?: any;
  error?: string;
}

export interface VerificationResult {
  success: boolean;
  phoneNumber?: string;
  error?: string;
}

export class FirebaseOTPService {
  private confirmation: any = null;

  // Send OTP to phone number
  async sendOTP(phoneNumber: string): Promise<OTPResult> {
    try {
      // Format phone number for India (+91)
      const formattedPhone = phoneNumber.startsWith('+91') 
        ? phoneNumber 
        : `+91${phoneNumber}`;

      const confirmation = await auth().signInWithPhoneNumber(formattedPhone);
      this.confirmation = confirmation;
      
      return {
        success: true,
        confirmation: confirmation
      };
    } catch (error: any) {
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  }

  // Verify OTP code
  async verifyOTP(otpCode: string): Promise<VerificationResult> {
    try {
      if (!this.confirmation) {
        return {
          success: false,
          error: 'No OTP verification in progress'
        };
      }

      const userCredential = await this.confirmation.confirm(otpCode);
      const phoneNumber = userCredential.user.phoneNumber;
      
      // Sign out from Firebase (we'll handle our own auth)
      await auth().signOut();
      
      return {
        success: true,
        phoneNumber: phoneNumber.replace('+91', '') // Remove +91 prefix
      };
    } catch (error: any) {
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  }

  // Clear verification state
  resetVerification(): void {
    this.confirmation = null;
  }

  // Get user-friendly error messages
  private getErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/invalid-phone-number':
        return 'Invalid phone number format';
      case 'auth/invalid-verification-code':
        return 'Invalid OTP code';
      case 'auth/code-expired':
        return 'OTP code has expired';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please try again later';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection';
      default:
        return 'Verification failed. Please try again';
    }
  }
}

export const firebaseOTP = new FirebaseOTPService();