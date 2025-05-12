import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Search, Mail, MessageCircle, Phone, Book, Video, FileText, HelpCircle } from "lucide-react";

export default function HelpPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  
  const faqItems = [
    {
      question: "How do I enroll my child?",
      answer: "To enroll your child, log in to your parent account and navigate to the Applications section. Click on 'New Application' and follow the step-by-step process to submit your child's information and required documents."
    },
    {
      question: "What are the fee payment methods?",
      answer: "Little Stars Creche accepts several payment methods including EFT (Electronic Fund Transfer), direct bank deposit, and debit orders. All payments should reference your child's name and account number. For more information, visit the Fees section in your parent dashboard."
    },
    {
      question: "What is the daily schedule?",
      answer: "Our daily schedule varies by age group, but generally includes arrival/free play (7:00-8:30), morning circle time (8:30-9:00), structured learning activities (9:00-10:30), outdoor play (10:30-11:15), lunch (11:30-12:15), nap time (12:30-14:30), afternoon activities (14:30-15:30), and departure (15:30-17:30)."
    },
    {
      question: "How do I communicate with teachers?",
      answer: "You can communicate with teachers through our messaging system. Simply navigate to the Messages section in your dashboard, select the teacher's name, and send your message. Teachers typically respond within 24 hours during weekdays."
    },
    {
      question: "What should my child bring daily?",
      answer: "Please ensure your child brings a backpack containing a change of clothes, a water bottle, a sun hat, and any prescribed medication if needed. For younger children, please include diapers, wipes, and comfort items. All items should be clearly labeled with your child's name."
    },
    {
      question: "How is attendance tracked?",
      answer: "Attendance is marked daily by teachers when your child arrives. You can view your child's attendance record in the Attendance section of your parent dashboard. If your child will be absent, please notify the creche through the system or by phone before 8:00 AM."
    },
  ];
  
  const filteredFAQs = searchTerm.length > 0
    ? faqItems.filter(item => 
        item.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.answer.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : faqItems;
  
  return (
    <div className="container mx-auto py-10">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Help & Support</h2>
          <p className="text-muted-foreground">
            Find answers to common questions or get in touch with our support team.
          </p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search for help..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Tabs defaultValue="faq" className="space-y-4">
          <TabsList className="grid grid-cols-4 md:w-[600px]">
            <TabsTrigger value="faq">FAQ</TabsTrigger>
            <TabsTrigger value="contact">Contact Us</TabsTrigger>
            <TabsTrigger value="guides">Guides</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>
          
          <TabsContent value="faq" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
                <CardDescription>
                  Common questions about Little Stars Creche
                </CardDescription>
              </CardHeader>
              <CardContent>
                {searchTerm.length > 0 && filteredFAQs.length === 0 ? (
                  <div className="text-center py-6">
                    <HelpCircle className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                    <h3 className="mt-2 text-lg font-medium">No results found</h3>
                    <p className="text-muted-foreground">
                      We couldn't find any FAQ matching "{searchTerm}"
                    </p>
                  </div>
                ) : (
                  <Accordion type="single" collapsible className="w-full">
                    {filteredFAQs.map((item, index) => (
                      <AccordionItem key={index} value={`item-${index}`}>
                        <AccordionTrigger className="text-left">
                          {item.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          {item.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="contact" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Contact Us</CardTitle>
                <CardDescription>
                  Get in touch with our support team
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <div className="bg-primary-100 p-3 rounded-full mr-4">
                        <Mail className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">Email Us</h3>
                        <p className="text-sm text-muted-foreground">admin@littlestars.co.za</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="bg-primary-100 p-3 rounded-full mr-4">
                        <Phone className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">Call Us</h3>
                        <p className="text-sm text-muted-foreground">+27 12 345 6789</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="bg-primary-100 p-3 rounded-full mr-4">
                        <MessageCircle className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">Live Chat</h3>
                        <p className="text-sm text-muted-foreground">Available 8:00 - 16:00 SAST</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-medium">Send us a message</h3>
                    <div className="space-y-2">
                      <Input placeholder="Your name" />
                    </div>
                    <div className="space-y-2">
                      <Input placeholder="Your email" type="email" />
                    </div>
                    <div className="space-y-2">
                      <Textarea placeholder="Your message" rows={4} />
                    </div>
                    <Button>Send Message</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="guides" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User Guides</CardTitle>
                <CardDescription>
                  Helpful guides for using Little Stars Creche system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="border">
                    <CardContent className="p-4 flex items-center">
                      <div className="bg-primary-100 p-3 rounded-full mr-4">
                        <Book className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">Parent Dashboard Guide</h3>
                        <p className="text-sm text-muted-foreground">Learn to navigate your dashboard</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border">
                    <CardContent className="p-4 flex items-center">
                      <div className="bg-primary-100 p-3 rounded-full mr-4">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">Application Process</h3>
                        <p className="text-sm text-muted-foreground">Step-by-step enrollment guide</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border">
                    <CardContent className="p-4 flex items-center">
                      <div className="bg-primary-100 p-3 rounded-full mr-4">
                        <Mail className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">Communication Guide</h3>
                        <p className="text-sm text-muted-foreground">How to message teachers and staff</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border">
                    <CardContent className="p-4 flex items-center">
                      <div className="bg-primary-100 p-3 rounded-full mr-4">
                        <Video className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">Video Tutorials</h3>
                        <p className="text-sm text-muted-foreground">Visual guides for key features</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="resources" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Resources</CardTitle>
                <CardDescription>
                  Helpful resources for parents and guardians
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 mr-3 text-muted-foreground" />
                      <div>
                        <h3 className="font-medium">Parent Handbook</h3>
                        <p className="text-sm text-muted-foreground">Complete guide to our policies</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Download</Button>
                  </div>
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 mr-3 text-muted-foreground" />
                      <div>
                        <h3 className="font-medium">Fee Structure</h3>
                        <p className="text-sm text-muted-foreground">Current fee schedules and policies</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Download</Button>
                  </div>
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 mr-3 text-muted-foreground" />
                      <div>
                        <h3 className="font-medium">Curriculum Overview</h3>
                        <p className="text-sm text-muted-foreground">Details about our learning approach</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Download</Button>
                  </div>
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 mr-3 text-muted-foreground" />
                      <div>
                        <h3 className="font-medium">Calendar</h3>
                        <p className="text-sm text-muted-foreground">Annual schedule of events and holidays</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Download</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}