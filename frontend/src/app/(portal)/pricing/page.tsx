import Pricing from "@/components/Pricing";
import ScrollNavbar from "@/components/Landing/scroll-navbar";
import Footer from "@/components/Landing/Footer";

export default function PricingPage() {
  return (
    <>
      <ScrollNavbar />
      <div className="min-h-screen flex flex-col pt-20">
        <Pricing />
      </div>
      <Footer />
    </>
  );
}