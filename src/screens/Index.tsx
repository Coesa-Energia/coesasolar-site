import {
  HomeNavbar,
  HeroSection,
  BenefitsSection,
  WhyChooseSection,
  AboutSection,
  PressSection,
  PlansSection,
  HowItWorksSection,
  FAQSection,
  CTASection,
  HomeFooter,
  WhatsAppFloatingButton,
  CalculatorSection,
} from "@/components/home";
import { HomeBlogSection, type BlogArticle } from "@/components/blog/HomeBlogSection";

const Index = ({ latestArticles }: { latestArticles?: BlogArticle[] } = {}) => {
  return (
    <div className="min-h-screen bg-background">
      <HomeNavbar />
      <main>
        <HeroSection />
        <BenefitsSection />
        <WhyChooseSection />
        <CalculatorSection />
        <PlansSection />
        <HowItWorksSection />
        <AboutSection />
        <PressSection />
        <HomeBlogSection initialArticles={latestArticles} />
        <FAQSection />
        <CTASection />
      </main>
      <HomeFooter />
      <WhatsAppFloatingButton />
    </div>
  );
};

export default Index;
