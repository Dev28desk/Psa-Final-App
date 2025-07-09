import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, Phone, User, MapPin, CreditCard, CheckCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { firebaseOTP, ConfirmationResult } from '@/services/firebase';
import { apiRequest } from '@/lib/queryClient';
import { useQuery } from '@tanstack/react-query';

// Step schemas
const phoneSchema = z.object({
  phone: z.string().min(10, 'Phone number must be 10 digits').regex(/^[0-9]{10}$/, 'Invalid phone number'),
});

const otpSchema = z.object({
  otp: z.string().min(6, 'OTP must be 6 digits').max(6, 'OTP must be 6 digits'),
});

const personalSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['male', 'female', 'other']),
  address: z.string().min(10, 'Address must be at least 10 characters'),
  emergencyContact: z.string().min(10, 'Emergency contact must be 10 digits').regex(/^[0-9]{10}$/, 'Invalid contact number'),
});

const selectionSchema = z.object({
  sportId: z.string().min(1, 'Please select a sport'),
  batchId: z.string().min(1, 'Please select a batch'),
});

type PhoneForm = z.infer<typeof phoneSchema>;
type OTPForm = z.infer<typeof otpSchema>;
type PersonalForm = z.infer<typeof personalSchema>;
type SelectionForm = z.infer<typeof selectionSchema>;

const STEPS = [
  { id: 1, title: 'Phone Number', icon: Phone },
  { id: 2, title: 'Verify OTP', icon: Phone },
  { id: 3, title: 'Personal Details', icon: User },
  { id: 4, title: 'Sport & Batch', icon: MapPin },
  { id: 5, title: 'Payment', icon: CreditCard },
  { id: 6, title: 'Complete', icon: CheckCircle },
];

export default function StudentRegistration() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [verifiedPhone, setVerifiedPhone] = useState('');
  const [registrationData, setRegistrationData] = useState<any>({});
  const [countdown, setCountdown] = useState(0);
  const { toast } = useToast();

  // Forms for each step
  const phoneForm = useForm<PhoneForm>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: '' }
  });

  const otpForm = useForm<OTPForm>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: '' }
  });

  const personalForm = useForm<PersonalForm>({
    resolver: zodResolver(personalSchema),
    defaultValues: {
      name: '',
      email: '',
      dateOfBirth: '',
      gender: 'male',
      address: '',
      emergencyContact: ''
    }
  });

  const selectionForm = useForm<SelectionForm>({
    resolver: zodResolver(selectionSchema),
    defaultValues: {
      sportId: '',
      batchId: ''
    }
  });

  // Fetch sports and batches
  const { data: sports } = useQuery({
    queryKey: ['/api/sports'],
    enabled: currentStep >= 4
  });

  const { data: batches } = useQuery({
    queryKey: ['/api/batches'],
    enabled: currentStep >= 4 && !!selectionForm.watch('sportId')
  });

  const selectedSportId = selectionForm.watch('sportId');
  const filteredBatches = batches?.filter((batch: any) => batch.sportId === parseInt(selectedSportId));

  // Initialize Firebase reCAPTCHA when component mounts
  useEffect(() => {
    firebaseOTP.initializeRecaptcha();
    return () => firebaseOTP.cleanup();
  }, []);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Step 1: Send OTP
  const handleSendOTP = async (data: PhoneForm) => {
    setIsLoading(true);
    try {
      const result = await firebaseOTP.sendOTP(data.phone);
      
      if (result.success && result.confirmationResult) {
        setConfirmationResult(result.confirmationResult);
        setVerifiedPhone(data.phone);
        setCountdown(60); // 60 second countdown
        setCurrentStep(2);
        toast({
          title: "OTP Sent",
          description: `Verification code sent to +91${data.phone}`,
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to send OTP",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (data: OTPForm) => {
    if (!confirmationResult) {
      toast({
        title: "Error",
        description: "Please request OTP first",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await firebaseOTP.verifyOTP(confirmationResult, data.otp);
      
      if (result.success) {
        setCurrentStep(3);
        toast({
          title: "Phone Verified",
          description: "Phone number verified successfully",
        });
      } else {
        toast({
          title: "Invalid OTP",
          description: result.error || "Please enter the correct OTP",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Personal Details
  const handlePersonalDetails = async (data: PersonalForm) => {
    setRegistrationData({ ...registrationData, ...data, phone: verifiedPhone });
    setCurrentStep(4);
  };

  // Step 4: Sport & Batch Selection
  const handleSelection = async (data: SelectionForm) => {
    const selectedSport = sports?.find((s: any) => s.id === parseInt(data.sportId));
    const selectedBatch = filteredBatches?.find((b: any) => b.id === parseInt(data.batchId));
    
    setRegistrationData({
      ...registrationData,
      ...data,
      selectedSport,
      selectedBatch,
      registrationFee: selectedSport?.registrationFee || 500 // Default fee
    });
    setCurrentStep(5);
  };

  // Step 5: Payment
  const handlePayment = async () => {
    setIsLoading(true);
    try {
      // Create student account
      const studentData = {
        ...registrationData,
        status: 'active',
        enrollmentDate: new Date().toISOString(),
      };

      const response = await apiRequest('POST', '/api/students/register', studentData);
      
      if (response.success) {
        setCurrentStep(6);
        toast({
          title: "Registration Complete",
          description: "Welcome to Parmanand Sports Academy!",
        });
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to complete registration",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (countdown > 0) return;
    
    setIsLoading(true);
    try {
      firebaseOTP.resetRecaptcha();
      firebaseOTP.initializeRecaptcha();
      
      const result = await firebaseOTP.sendOTP(verifiedPhone);
      
      if (result.success && result.confirmationResult) {
        setConfirmationResult(result.confirmationResult);
        setCountdown(60);
        toast({
          title: "OTP Resent",
          description: "New verification code sent",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to resend OTP",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resend OTP",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const progress = (currentStep / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Join Parmanand Sports Academy
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Complete your registration in {STEPS.length} simple steps
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between mb-4">
            {STEPS.map((step) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <div key={step.id} className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                      isCompleted
                        ? 'bg-green-500 text-white'
                        : isActive
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs text-center">{step.title}</span>
                </div>
              );
            })}
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Steps */}
        <Card>
          <CardHeader>
            <CardTitle>{STEPS[currentStep - 1]?.title}</CardTitle>
            <CardDescription>
              Step {currentStep} of {STEPS.length}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Step 1: Phone Number */}
            {currentStep === 1 && (
              <Form {...phoneForm}>
                <form onSubmit={phoneForm.handleSubmit(handleSendOTP)} className="space-y-4">
                  <FormField
                    control={phoneForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <div className="flex">
                            <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md">
                              +91
                            </span>
                            <Input
                              placeholder="Enter 10-digit phone number"
                              {...field}
                              className="rounded-l-none"
                              maxLength={10}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending OTP...
                      </>
                    ) : (
                      <>
                        Send OTP
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            )}

            {/* Step 2: OTP Verification */}
            {currentStep === 2 && (
              <Form {...otpForm}>
                <form onSubmit={otpForm.handleSubmit(handleVerifyOTP)} className="space-y-4">
                  <div className="text-center mb-4">
                    <p className="text-sm text-gray-600">
                      Enter the 6-digit code sent to +91{verifiedPhone}
                    </p>
                  </div>
                  <FormField
                    control={otpForm.control}
                    name="otp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>OTP Code</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter 6-digit OTP"
                            {...field}
                            className="text-center text-2xl tracking-widest"
                            maxLength={6}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep(1)}
                      className="w-full"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          Verify OTP
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="text-center">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleResendOTP}
                      disabled={countdown > 0 || isLoading}
                      className="text-sm"
                    >
                      {countdown > 0 ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
                    </Button>
                  </div>
                </form>
              </Form>
            )}

            {/* Step 3: Personal Details */}
            {currentStep === 3 && (
              <Form {...personalForm}>
                <form onSubmit={personalForm.handleSubmit(handlePersonalDetails)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={personalForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={personalForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input placeholder="your.email@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={personalForm.control}
                      name="dateOfBirth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date of Birth</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={personalForm.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gender</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select gender" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={personalForm.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your complete address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={personalForm.control}
                    name="emergencyContact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Emergency Contact</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter emergency contact number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep(2)}
                      className="w-full"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    <Button type="submit" className="w-full">
                      Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </Form>
            )}

            {/* Step 4: Sport & Batch Selection */}
            {currentStep === 4 && (
              <Form {...selectionForm}>
                <form onSubmit={selectionForm.handleSubmit(handleSelection)} className="space-y-4">
                  <FormField
                    control={selectionForm.control}
                    name="sportId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select Sport</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Choose your sport" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {sports?.map((sport: any) => (
                              <SelectItem key={sport.id} value={sport.id.toString()}>
                                {sport.name} - ₹{sport.feeAmount}/month
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {selectedSportId && (
                    <FormField
                      control={selectionForm.control}
                      name="batchId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Select Batch</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Choose your batch" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {filteredBatches?.map((batch: any) => (
                                <SelectItem key={batch.id} value={batch.id.toString()}>
                                  {batch.name} - {batch.timeSlot}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep(3)}
                      className="w-full"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    <Button type="submit" className="w-full" disabled={!selectedSportId || !selectionForm.watch('batchId')}>
                      Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </Form>
            )}

            {/* Step 5: Payment */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Registration Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Student Name:</span>
                      <span>{registrationData.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sport:</span>
                      <span>{registrationData.selectedSport?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Batch:</span>
                      <span>{registrationData.selectedBatch?.name}</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span>Registration Fee:</span>
                      <span>₹{registrationData.registrationFee}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep(4)}
                    className="w-full"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button onClick={handlePayment} className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Pay ₹{registrationData.registrationFee}
                        <CreditCard className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Step 6: Complete */}
            {currentStep === 6 && (
              <div className="text-center space-y-4">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                <h3 className="text-2xl font-bold text-green-600">Registration Complete!</h3>
                <p className="text-gray-600">
                  Welcome to Parmanand Sports Academy! Your account has been created successfully.
                </p>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <p className="text-sm">
                    <strong>Your Student ID:</strong> SA{Date.now().toString().slice(-6)}
                  </p>
                  <p className="text-sm">
                    You can now login with your phone number: +91{verifiedPhone}
                  </p>
                </div>
                <Button onClick={() => window.location.href = '/mobile'} className="w-full">
                  Go to Student App
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* reCAPTCHA container */}
        <div id="recaptcha-container"></div>
      </div>
    </div>
  );
}