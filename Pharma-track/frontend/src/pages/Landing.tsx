import Navbar from "../components/landing/Navbar";
import Footer from "../components/landing/Footer"
import Hero from "../components/landing/Hero";
import StatsSection from "../components/landing/StatsSection";
import RolesSection from "../components/landing/RolesSection";
import ComplexitySection from "../components/landing/ComplexitySection";
import NetworkSection from "../components/landing/NetworkSection";
import CTASection from "../components/landing/CTASection";

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#0a0f0a] text-white">
      <Navbar/>
      <main>
        <Hero />
        <StatsSection />
        <RolesSection />
        <ComplexitySection />
        <NetworkSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}