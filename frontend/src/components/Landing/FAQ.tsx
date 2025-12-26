import Link from "next/link";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

function FAQ() {
  return (
    <section
      className="py-16 px-4 bg-background rounded-3xl mx-4 md:mx-10 my-6"
      id="faq"
    >
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground">
            Common questions about PortSmith API Gateway
          </p>
        </div>

        <div className="space-y-4">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>
                How do I get started with an API?
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-muted-foreground">
                  Simply sign up for a free account, browse our available APIs, and generate an API key for the service you want to use. You can then start making requests immediately using your key in the X-API-Key header.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger>What APIs are available?</AccordionTrigger>
              <AccordionContent>
                <p className="text-muted-foreground">
                  We offer a variety of APIs including weather services, AI tools, image processing, and more. Visit our documentation page to see the complete list of available APIs with interactive documentation. Don't see what you need? Request a new API integration through our contact form.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger>Is there a free tier?</AccordionTrigger>
              <AccordionContent>
                <p className="text-muted-foreground">
                  Yes! We offer a generous free tier for all APIs with reasonable rate limits perfect for development and testing. Check the pricing page for specific limits and premium features available in paid plans.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger>
                How do I monitor my API usage?
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-muted-foreground">
                  Your dashboard provides real-time analytics showing request counts, response times, and error rates. You can track usage across all your API keys and receive notifications when approaching rate limits.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5">
              <AccordionTrigger>
                Can I request a new API integration?
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-muted-foreground">
                  Absolutely! We're always looking to expand our API offerings. Use the "Request API" button in the navigation or dashboard to submit your request. We review all submissions and prioritize based on community demand.
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <div className="text-center pt-8">
          <p className="text-muted-foreground mb-4">
            Still have questions?
          </p>
          <Button asChild>
            <Link href="/contact">Contact Support</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

export default FAQ;
