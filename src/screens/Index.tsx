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
  DeferredHomeSection,
} from "@/components/home";
import { HomeBlogSection, type BlogArticle } from "@/components/blog/HomeBlogSection";
import styles from "./Index.module.css";

const Index = ({ latestArticles }: { latestArticles?: BlogArticle[] } = {}) => {
  return (
    <div className="min-h-screen bg-background">
      <HomeNavbar />
      <main>
        <HeroSection />
        <section className={styles.trust} aria-labelledby="trust-title">
          <h2 id="trust-title">Escolhida por mais de 2.000 clientes em todo o Brasil.</h2>
        </section>
        <ConnectionIntroSection />
        <ConnectionSceneSection />
        <PredictableBillSection />
        <BenefitsSection />
        <WhyChooseSection />
        <CalculatorSection />
        <PlansSection />
        <HowItWorksSection />
        <DeferredHomeSection section="usina" />
        <DeferredHomeSection section="app" />
        <DeferredHomeSection section="simulacao" />
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
