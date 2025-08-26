import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { Loader, Send, Mail, User, Info, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Support = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !message) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // In a real app, this would send the form data to a backend API
      // For now, we'll simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Log the email that would be sent
      console.log("Support request would be sent to:", "221fa04296@vignan.ac.in");
      console.log("Support request details:", {
        name,
        email,
        subject,
        message
      });
      
      // Show success message
      toast({
        title: "Message Sent",
        description: "Your message has been sent successfully. We'll get back to you soon!",
      });
      
      // Reset form and show success state
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
      setIsSubmitted(true);
      
      // Reset success state after a while
      setTimeout(() => {
        setIsSubmitted(false);
      }, 5000);
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error",
        description: "Failed to send your message. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Support</h1>
        <p className="text-muted-foreground">
          Get help with the alumni database system
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Contact Us
              </CardTitle>
              <CardDescription>
                Send us a message and we'll get back to you as soon as possible
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!isSubmitted ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">
                      Your Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-9"
                        placeholder="Enter your name"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-9"
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="subject" className="text-sm font-medium">
                      Subject
                    </label>
                    <Input
                      id="subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="What is this regarding?"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium">
                      Your Message *
                    </label>
                    <Textarea
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="How can we help you?"
                      rows={5}
                      required
                    />
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              ) : (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="rounded-full bg-green-100 p-3 text-green-600 mb-4">
                    <CheckCircle className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-medium text-center">Message Sent!</h3>
                  <p className="text-center text-muted-foreground mt-2 mb-4">
                    Thank you for reaching out. We'll respond to your inquiry as soon as possible.
                  </p>
                  <Button variant="outline" onClick={() => setIsSubmitted(false)}>
                    Send Another Message
                  </Button>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col items-start border-t pt-4 text-sm text-muted-foreground">
              <p>
                Your message will be sent to our support team at{" "}
                <a href="mailto:221fa04296@vignan.ac.in" className="font-medium text-primary hover:underline">
                  221fa04296@vignan.ac.in
                </a>
              </p>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <Mail className="h-5 w-5 text-primary" />
                <div>
                  <h3 className="font-medium">Email</h3>
                  <p className="text-muted-foreground">
                    <a href="mailto:221fa04296@vignan.ac.in" className="hover:underline">
                      221fa04296@vignan.ac.in
                    </a>
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Info className="h-5 w-5 text-primary" />
                <div>
                  <h3 className="font-medium">Technical Support</h3>
                  <p className="text-muted-foreground">
                    For technical issues, please include screenshots and detailed steps to reproduce the problem.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>
                Common questions and answers about the alumni database system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>How do I add a new alumni profile?</AccordionTrigger>
                  <AccordionContent>
                    Navigate to the Alumni page and click on the "Add Alumni" button in the top right corner. 
                    Fill in the required information and click "Save" to add the new profile to the database.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-2">
                  <AccordionTrigger>How does the crawler feature work?</AccordionTrigger>
                  <AccordionContent>
                    The crawler can automatically gather alumni information from websites and social media profiles. 
                    Navigate to the Crawlers page to configure and run the crawlers for different platforms. 
                    You can set up login credentials, search terms, and other parameters to customize the crawl.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-3">
                  <AccordionTrigger>Can I export the alumni data?</AccordionTrigger>
                  <AccordionContent>
                    Yes, you can export the alumni data in CSV, Excel, or JSON formats. 
                    On the Alumni page, click the "Export" button and select your preferred format.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-4">
                  <AccordionTrigger>How do I update my account settings?</AccordionTrigger>
                  <AccordionContent>
                    Click on your profile name in the top navigation bar, then select "Settings" from the dropdown menu. 
                    Here you can update your personal information, change your password, and manage notification preferences.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-5">
                  <AccordionTrigger>Is there a limit to how many alumni I can add?</AccordionTrigger>
                  <AccordionContent>
                    The system can handle thousands of alumni profiles without performance issues. 
                    However, very large imports (over 10,000 profiles at once) should be done in batches 
                    for optimal performance.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              
              <Separator className="my-6" />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Resources</h3>
                
                <div className="rounded-md border p-4">
                  <h4 className="font-medium mb-2">User Documentation</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Comprehensive guides on using all features of the alumni database system.
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    View Documentation
                  </Button>
                </div>
                
                <div className="rounded-md border p-4">
                  <h4 className="font-medium mb-2">Video Tutorials</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Step-by-step video guides to help you make the most of the system.
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    Watch Tutorials
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Support;