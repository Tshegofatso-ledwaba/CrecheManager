import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

// South African phone number validation
// Format: +27 XX XXX XXXX or 0XX XXX XXXX
const saPhoneRegex = /^(\+27|0)[1-9][0-9]{8}$/;

const applicationFormSchema = z.object({
  childFirstName: z.string().min(2, "First name must be at least 2 characters"),
  childLastName: z.string().min(2, "Last name must be at least 2 characters"),
  childDob: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: "Please enter a valid date",
  }),
  childGender: z.enum(["male", "female", "other"], {
    required_error: "Please select a gender",
  }),
  allergies: z.string().optional(),
  medicalConditions: z.string().optional(),
  medications: z.string().optional(),
  emergencyName: z.string().min(2, "Emergency contact name must be at least 2 characters"),
  emergencyRelationship: z.string().min(2, "Relationship must be at least 2 characters"),
  emergencyPhone: z.string()
    .min(10, "Phone number must be at least 10 digits")
    .max(12, "Phone number must not exceed 12 characters")
    .refine(val => saPhoneRegex.test(val.replace(/\s+/g, '')), {
      message: "Please enter a valid South African phone number (e.g., 0XX XXX XXXX or +27 XX XXX XXXX)",
    }),
  emergencyEmail: z.string().email("Please enter a valid email").optional().or(z.literal("")),
});

type ApplicationFormValues = z.infer<typeof applicationFormSchema>;

interface ApplicationFormProps {
  onComplete: () => void;
}

export function ApplicationForm({ onComplete }: ApplicationFormProps) {
  const [step, setStep] = useState<number>(1);
  const { toast } = useToast();

  const form = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationFormSchema),
    defaultValues: {
      childFirstName: "",
      childLastName: "",
      childDob: "",
      childGender: undefined,
      allergies: "",
      medicalConditions: "",
      medications: "",
      emergencyName: "",
      emergencyRelationship: "",
      emergencyPhone: "",
      emergencyEmail: "",
    },
  });

  const applicationMutation = useMutation({
    mutationFn: async (data: ApplicationFormValues) => {
      console.log("Submitting application with data:", data);
      // Ensure all required fields are properly formatted
      const formattedData = {
        childFirstName: data.childFirstName,
        childLastName: data.childLastName,
        childDob: new Date(data.childDob).toISOString(),
        childGender: data.childGender,
        allergies: data.allergies || "",
        medicalConditions: data.medicalConditions || "",
        medications: data.medications || "",
        emergencyName: data.emergencyName,
        emergencyRelationship: data.emergencyRelationship,
        emergencyPhone: data.emergencyPhone.replace(/\s+/g, ''), // Remove spaces
        emergencyEmail: data.emergencyEmail || "",
      };
      
      console.log("Formatted data:", formattedData);
      const res = await apiRequest("POST", "/api/applications", formattedData);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Application Submitted",
        description: "Your child's application has been submitted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      onComplete();
    },
    onError: (error: any) => {
      console.error("Application submission error:", error);
      
      let errorMessage = "Failed to submit application.";
      
      // Try to extract error details from response
      if (error.cause?.errors) {
        const validationErrors = error.cause.errors;
        errorMessage = validationErrors.map((err: any) => 
          `${err.path.join('.')}: ${err.message}`
        ).join(', ');
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Failed to Submit Application",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: ApplicationFormValues) => {
    // Validate all fields before submission
    const isValid = await form.trigger();
    if (isValid) {
      applicationMutation.mutate(data);
    }
  };

  const handleNext = async () => {
    let isValid = true;
    
    if (step === 1) {
      // Validate child information fields
      isValid = await form.trigger(["childFirstName", "childLastName", "childDob", "childGender"]);
    } else if (step === 2) {
      // Medical information fields are optional, no validation needed
      isValid = true;
    } else if (step === 3) {
      // Validate emergency contact fields
      isValid = await form.trigger(["emergencyName", "emergencyRelationship", "emergencyPhone"]);
    }
    
    if (isValid) {
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    setStep(step - 1);
  };

  const calculateAge = (dob: string) => {
    if (!dob) return '';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return `${age} ${age === 1 ? 'year' : 'years'} old`;
  };

  // Format SA phone numbers as user types
  const formatSAPhoneNumber = (value: string) => {
    // Remove all non-digit characters
    const digitsOnly = value.replace(/\D/g, '');
    
    // Handle +27 format or 0 format
    if (digitsOnly.startsWith('27')) {
      const formattedNumber = '+27 ' + digitsOnly.substring(2).replace(/(\d{2})(\d{3})(\d{4})/, '$1 $2 $3');
      return formattedNumber.substring(0, 16); // Limit length
    } else if (digitsOnly.startsWith('0')) {
      return digitsOnly.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3').substring(0, 12);
    }
    
    // Default formatting
    return value;
  };

  // Handle phone number changes with formatting
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>, onChange: (...event: any[]) => void) => {
    const formatted = formatSAPhoneNumber(e.target.value);
    onChange(formatted);
  };

  // Create step titles and icons for progress indicator
  const steps = [
    { title: "Child Info", icon: "👶" },
    { title: "Medical", icon: "🏥" },
    { title: "Emergency", icon: "📞" },
    { title: "Documents", icon: "📄" }
  ];

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <Card className="border-2 border-primary/10 shadow-lg">
      <CardHeader className="pb-0">
        <CardTitle className="text-xl font-bold text-center bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          Child Enrollment Application
        </CardTitle>
        
        {/* Progress Bar */}
        <div className="w-full mt-6 mb-2">
          <div className="flex justify-between mb-2">
            {steps.map((stepItem, index) => (
              <div 
                key={index} 
                className={`flex flex-col items-center transition-all duration-300
                  ${index + 1 === step ? 'scale-110' : 'opacity-70'}`}
              >
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-lg mb-1
                    ${index + 1 < step ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300' : 
                      index + 1 === step ? 'bg-primary/20 text-primary' : 
                      'bg-gray-100 text-gray-400 dark:bg-gray-800'}
                  `}
                >
                  {index + 1 < step ? <CheckCircle2 className="h-5 w-5" /> : stepItem.icon}
                </div>
                <span className="text-xs text-center font-medium">{stepItem.title}</span>
              </div>
            ))}
          </div>
          <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden dark:bg-gray-700">
            <motion.div 
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-primary to-violet-500"
              initial={{ width: "0%" }}
              animate={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 mt-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div 
                  key="step1"
                  className="space-y-4"
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, x: -20 }}
                  variants={fadeInUp}
                >
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Child Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="childFirstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter first name" 
                              {...field} 
                              className="border-gray-300 focus:border-primary transition-colors"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="childLastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter last name" 
                              {...field} 
                              className="border-gray-300 focus:border-primary transition-colors"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="childDob"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date of Birth</FormLabel>
                          <FormControl>
                            <Input 
                              type="date" 
                              {...field} 
                              className="border-gray-300 focus:border-primary transition-colors"
                            />
                          </FormControl>
                          {field.value && (
                            <FormDescription className="text-primary">
                              {calculateAge(field.value)}
                            </FormDescription>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="childGender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gender</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="border-gray-300 focus:border-primary transition-colors">
                                <SelectValue placeholder="Select gender" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                              <SelectItem value="other">Other/Prefer not to say</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div 
                  key="step2"
                  className="space-y-4"
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, x: -20 }}
                  variants={fadeInUp}
                >
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Medical Information
                  </h4>
                  <FormField
                    control={form.control}
                    name="allergies"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Allergies (if any)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="E.g., peanuts, dairy, etc." 
                            {...field} 
                            className="border-gray-300 focus:border-primary transition-colors"
                          />
                        </FormControl>
                        <FormDescription>Leave blank if your child has no known allergies</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="medicalConditions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Medical Conditions (if any)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Please describe any medical conditions we should be aware of" 
                            className="resize-none min-h-[100px] border-gray-300 focus:border-primary transition-colors" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>Include any conditions that may require special attention</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="medications"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Medications (if any)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="List any medications the child is currently taking" 
                            {...field} 
                            className="border-gray-300 focus:border-primary transition-colors"
                          />
                        </FormControl>
                        <FormDescription>Include dosage information if applicable</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>
              )}

              {step === 3 && (
                <motion.div 
                  key="step3"
                  className="space-y-4"
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, x: -20 }}
                  variants={fadeInUp}
                >
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Emergency Contact
                  </h4>
                  <FormField
                    control={form.control}
                    name="emergencyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter emergency contact name" 
                            {...field} 
                            className="border-gray-300 focus:border-primary transition-colors"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="emergencyRelationship"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Relationship to Child</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="E.g., Parent, Grandparent, etc." 
                            {...field} 
                            className="border-gray-300 focus:border-primary transition-colors"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="emergencyPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="0XX XXX XXXX or +27 XX XXX XXXX" 
                              {...field} 
                              onChange={(e) => handlePhoneChange(e, field.onChange)}
                              className="border-gray-300 focus:border-primary transition-colors"
                            />
                          </FormControl>
                          <FormDescription>
                            South African format (e.g., 012 345 6789 or +27 12 345 6789)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="emergencyEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email (Optional)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="example@email.com" 
                              type="email" 
                              {...field} 
                              className="border-gray-300 focus:border-primary transition-colors"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div 
                  key="step4"
                  className="space-y-4"
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, x: -20 }}
                  variants={fadeInUp}
                >
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Required Documents
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Please note that the following documents will be required before your child can start attending:
                  </p>
                  <div className="space-y-4">
                    <motion.div 
                      className="border rounded p-4 space-y-2 bg-gray-50 dark:bg-gray-800 transition-colors"
                      whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                    >
                      <h5 className="font-medium">Birth Certificate</h5>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        An official copy of your child's birth certificate
                      </p>
                      <Input 
                        type="file" 
                        disabled 
                        className="cursor-not-allowed bg-gray-100 dark:bg-gray-700"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        You'll be able to upload this document after your application is approved
                      </p>
                    </motion.div>
                    
                    <motion.div 
                      className="border rounded p-4 space-y-2 bg-gray-50 dark:bg-gray-800 transition-colors" 
                      whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                    >
                      <h5 className="font-medium">Vaccination Record</h5>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        An up-to-date record of your child's vaccinations
                      </p>
                      <Input 
                        type="file" 
                        disabled 
                        className="cursor-not-allowed bg-gray-100 dark:bg-gray-700"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        You'll be able to upload this document after your application is approved
                      </p>
                    </motion.div>
                    
                    <motion.div 
                      className="border rounded p-4 space-y-2 bg-gray-50 dark:bg-gray-800 transition-colors"
                      whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                    >
                      <h5 className="font-medium">Medical Insurance Card (if applicable)</h5>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        A copy of your child's medical insurance card
                      </p>
                      <Input 
                        type="file" 
                        disabled 
                        className="cursor-not-allowed bg-gray-100 dark:bg-gray-700"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        You'll be able to upload this document after your application is approved
                      </p>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div 
              className="flex justify-between mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {step > 1 && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handlePrevious}
                  className="border-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <span className="mr-2">←</span> Previous
                </Button>
              )}
              
              {step < 4 ? (
                <Button 
                  type="button" 
                  className={`ml-auto bg-gradient-to-r from-primary to-violet-600 hover:opacity-90 transition-opacity`}
                  onClick={handleNext}
                >
                  Next <span className="ml-2">→</span>
                </Button>
              ) : (
                <Button 
                  type="submit" 
                  className="ml-auto bg-gradient-to-r from-primary to-violet-600 hover:opacity-90 transition-opacity"
                  disabled={applicationMutation.isPending}
                >
                  {applicationMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Application"
                  )}
                </Button>
              )}
            </motion.div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
