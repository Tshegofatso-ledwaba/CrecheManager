import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { z } from "zod";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { InsertUserSchema } from "@shared/schema";
import { motion } from "framer-motion";

// South African phone number validation
// Format: +27 XX XXX XXXX or 0XX XXX XXXX
const saPhoneRegex = /^(\+27|0)[1-9][0-9]{8}$/;

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const { user, loginMutation, registerMutation, logoutMutation } = useAuth();
  const [, setLocation] = useLocation();

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

  // Clear any existing session when auth page loads
  useEffect(() => {
    // We only want this to run once when the component mounts
    const isAuthPage = window.location.pathname.includes('/auth');
    
    // Only run logout once on initial mount if the user is logged in
    if (isAuthPage && user) {
      console.log("Logging out existing user on auth page");
      logoutMutation.mutate();
    }
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Redirection is handled in useAuth hook's onSuccess callback
  // No need for redirecting here

  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  // Registration form
  const registerForm = useForm<z.infer<typeof InsertUserSchema>>({
    resolver: zodResolver(InsertUserSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      role: "parent",
      agreeToTerms: false,
    },
  });

  const onLoginSubmit = (data: LoginFormValues) => {
    console.log("Login form submitted with:", { email: data.email });
    try {
      loginMutation.mutate({
        email: data.email,
        password: data.password,
      });
    } catch (error) {
      console.error("Error during login form submission:", error);
    }
  };

  const onRegisterSubmit = (data: z.infer<typeof InsertUserSchema>) => {
    registerMutation.mutate({
      name: data.name,
      email: data.email,
      password: data.password,
      phone: data.phone,
      role: "parent",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Auth Form Card */}
        <Card className="w-full shadow-lg">
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-gray-900">Creche Management System</h2>
              <p className="mt-2 text-sm text-gray-600">
                {activeTab === "login" ? "Sign in to your account" : "Create a new parent account"}
              </p>
            </div>

            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "login" | "register")}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <div className="text-center text-sm text-gray-500 mb-4">
                  <p>Please enter your login credentials to continue</p>
                </div>

                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="you@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex items-center justify-between">
                      <FormField
                        control={loginForm.control}
                        name="rememberMe"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="text-sm cursor-pointer">Remember me</FormLabel>
                          </FormItem>
                        )}
                      />

                      <Button variant="link" className="p-0 h-auto text-sm text-primary">
                        Forgot password?
                      </Button>
                    </div>

                    <motion.div
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <Button
                        type="submit"
                        className="w-full bg-primary"
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? (
                          <motion.div
                            className="flex items-center justify-center gap-2"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          >
                            <motion.div
                              className="h-4 w-4 rounded-full border-2 border-t-transparent border-white animate-spin"
                              animate={{ rotate: 360 }}
                              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                            />
                            <span>Signing in...</span>
                          </motion.div>
                        ) : (
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                          >
                            Sign in
                          </motion.span>
                        )}
                      </Button>
                    </motion.div>
                    
                    <div className="mt-4 text-center">
                      <Button 
                        variant="outline" 
                        type="button" 
                        onClick={() => setLocation("/")}
                        className="mx-auto"
                      >
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-5 w-5 mr-2" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor" 
                          strokeWidth={2}
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            d="M3 12l2-2m0 0l7-7 7 7m-14 0l2 2m0 0l7 7 7-7m-14 0l2-2" 
                          />
                        </svg>
                        Go to Home
                      </Button>
                    </div>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="register">
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                    <FormField
                      control={registerForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="you@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registerForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={registerForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="0XX XXX XXXX or +27 XX XXX XXXX" 
                              {...field} 
                              onChange={(e) => handlePhoneChange(e, field.onChange)}
                            />
                          </FormControl>
                          <FormDescription>
                            Enter a South African phone number (e.g., 083 123 4567 or +27 83 123 4567)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="agreeToTerms"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-sm">
                              I agree to the <Button variant="link" className="p-0 h-auto">Terms and Conditions</Button>
                            </FormLabel>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <motion.div
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <Button
                        type="submit"
                        className="w-full bg-primary"
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? (
                          <motion.div
                            className="flex items-center justify-center gap-2"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          >
                            <motion.div
                              className="h-4 w-4 rounded-full border-2 border-t-transparent border-white animate-spin"
                              animate={{ rotate: 360 }}
                              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                            />
                            <span>Creating account...</span>
                          </motion.div>
                        ) : (
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                          >
                            Create Account
                          </motion.span>
                        )}
                      </Button>
                    </motion.div>
                    
                    <div className="mt-4 text-center">
                      <Button 
                        variant="outline" 
                        type="button" 
                        onClick={() => setLocation("/")}
                        className="mx-auto"
                      >
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-5 w-5 mr-2" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor" 
                          strokeWidth={2}
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            d="M3 12l2-2m0 0l7-7 7 7m-14 0l2 2m0 0l7 7 7-7m-14 0l2-2" 
                          />
                        </svg>
                        Go to Home
                      </Button>
                    </div>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Info Section */}
        <div className="hidden lg:flex flex-col justify-center">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-gray-900">Welcome to our Creche Management System</h2>
            <p className="text-gray-600">
              Our digital platform allows parents to easily apply for childcare and helps administrators manage all aspects of the creche:
            </p>
            <ul className="space-y-2">
              <li className="flex items-center">
                <div className="bg-primary/10 p-2 rounded mr-3">
                  <svg className="h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span>Online application for child admission</span>
              </li>
              <li className="flex items-center">
                <div className="bg-primary/10 p-2 rounded mr-3">
                  <svg className="h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span>Medical and allergy tracking</span>
              </li>
              <li className="flex items-center">
                <div className="bg-primary/10 p-2 rounded mr-3">
                  <svg className="h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span>Fee management and payment tracking</span>
              </li>
              <li className="flex items-center">
                <div className="bg-primary/10 p-2 rounded mr-3">
                  <svg className="h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span>Direct messaging between parents and admins</span>
              </li>
              <li className="flex items-center">
                <div className="bg-primary/10 p-2 rounded mr-3">
                  <svg className="h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span>Attendance tracking and reporting</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
