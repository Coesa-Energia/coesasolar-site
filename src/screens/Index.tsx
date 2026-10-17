import {
  HomeNavbar,
  HeroSection,
  BenefitsSection,
  WhyChooseSection,
  PressSection,
  PlansSection,
  HowItWorksSection,
  FAQSection,
  CTASection,
  HomeFooter,
  WhatsAppFloatingButton,
  CalculatorSection,
  LeadFormDock,
  ConnectionIntroSection,
  ConnectionSceneSection,
  PredictableBillSection,
  SolarDaySection,
  SolarFarmSection,
  ClientAreaSection,
  SimulationSection,
} from "@/components/home";
import { HomeBlogSection, type BlogArticle } from "@/components/blog/HomeBlogSection";

const Index = ({ latestArticles }: { latestArticles?: BlogArticle[] } = {}) => {
  return (
    <div className="min-h-screen bg-background">
      <HomeNavbar />
      <main>
        <HeroSection />
        <ConnectionIntroSection />
        <ConnectionSceneSection />
        <PredictableBillSection />
        <BenefitsSection />
        <WhyChooseSection />
        <CalculatorSection />
        <PlansSection />
        <HowItWorksSection />
        <SolarFarmSection />
        <ClientAreaSection />
        <SimulationSection />
        <SolarDaySection />
        <PressSection />
        <HomeBlogSection initialArticles={latestArticles} />
        <FAQSection />
        <CTASection />
      </main>
      <HomeFooter />
      <WhatsAppFloatingButton />
      <LeadFormDock />
    </div>
  );
};

export default Index;
