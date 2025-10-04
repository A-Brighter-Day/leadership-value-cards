import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import ValueCard from "@/components/card/ValueCard";
import { LeadershipValue, SelectedValues, UserInfo } from "@/types";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { generatePDF } from "@/lib/pdf-generator";
import { sendPdfEmail } from "@/lib/email-service";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  companyCode: z.string().optional(),
});

interface SubmissionStepProps {
  coreValues: LeadershipValue[];
  onComplete: (userInfo: UserInfo) => void;
  onBack: () => void;
}

const SubmissionStep = ({
  coreValues,
  onComplete,
  onBack,
}: SubmissionStepProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      companyCode: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      // Submit data to backend
      await apiRequest("POST", "/api/submissions", {
        name: values.name,
        email: values.email,
        companyCode: values.companyCode || null,
        coreValues: coreValues.map((value) => value.value),
      });

      const pdfBase64 = generatePDF(coreValues, {
        name: values.name,
        email: values.email,
      });

      const emailResult = await sendPdfEmail(
        pdfBase64,
        {
          name: values.name,
          email: values.email,
        },
        coreValues
      );

      if (emailResult.success) {
        toast({
          title: "Email Sent",
          description: "Your PDF has been sent to your email.",
          variant: "default",
        });
      } else {
        toast({
          title: "Email Error",
          description: "Could not send the email. Please try again later.",
          variant: "destructive",
        });
      }

      // Call onComplete to move to next step
      onComplete({
        name: values.name,
        email: values.email,
        companyCode: values.companyCode,
      });
    } catch (error) {
      console.error("Failed to submit:", error);
      toast({
        title: "Error",
        description: "Failed to submit your information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-semibold text-primary mb-2">
          You're Almost Done!
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Enter your information to receive your personalized Leadership Values
          PDF.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* User Information Form */}
        <div className="bg-white border border-muted rounded-lg p-6">
          <h3 className="font-medium text-primary mb-4">Your Information</h3>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
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
                control={form.control}
                name="companyCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Code (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., TimeForge" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>

        {/* Core Values Preview */}
        <div className="bg-white border border-muted rounded-lg p-6">
          <h3 className="font-medium text-primary mb-4">
            Your Core Leadership Values
          </h3>
          <div className="space-y-3">
            {coreValues.map((value, index) => (
              <div
                key={value.id}
                className="flex items-center p-3 bg-blue-50 rounded-md"
              >
                <div className="min-w-8 w-8 h-8 flex-shrink-0 flex items-center justify-center bg-blue-500 text-white rounded-full mr-3 font-medium">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-primary">{value.value}</h4>
                  <p className="text-sm text-muted-foreground">
                    {value.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col sm:flex-row gap-2 justify-between">
        <Button variant="outline" onClick={onBack} className="px-6">
          Back to Core Values
        </Button>
        <Button
          type="submit"
          onClick={form.handleSubmit(onSubmit)}
          disabled={isSubmitting}
          className="px-6 bg-blue-600 hover:bg-blue-500"
        >
          {isSubmitting ? "Submitting..." : "Generate My PDF"}
        </Button>
      </div>
    </div>
  );
};

export default SubmissionStep;
