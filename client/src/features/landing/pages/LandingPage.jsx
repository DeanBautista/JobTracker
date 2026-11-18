import { useEffect } from "react";
import ClosingSection from "@/features/landing/components/ClosingSection";
import DashboardPreview from "@/features/landing/components/DashboardPreview";
import FactsStrip from "@/features/landing/components/FactsStrip";
import FaqSection from "@/features/landing/components/FaqSection";
import FeaturesSection from "@/features/landing/components/FeaturesSection";
import HeroSection from "@/features/landing/components/HeroSection";
import HowItWorksSection from "@/features/landing/components/HowItWorksSection";
import LandingFooter from "@/features/landing/components/LandingFooter";
import LandingHeader from "@/features/landing/components/LandingHeader";
import SignupSection from "@/features/landing/components/SignupSection";

export default function LandingPage() {
  useEffect(() => {
    document.title = "Job Tracker – Keep every job application in one place";
  }, []);

  return (
    <>
      <a
        href="#main"
        className="absolute top-2 -left-[9999px] z-[100] rounded-md bg-ink px-3.5 py-2 text-on-ink focus:left-2"
      >
        Skip to content
      </a>

      <LandingHeader />
      <main id="main">
        <HeroSection />
        <FactsStrip />
        <FeaturesSection />
        <HowItWorksSection />
        <DashboardPreview />
        <SignupSection />
        <FaqSection />
        <ClosingSection />
      </main>
      <LandingFooter />
    </>
  );
}