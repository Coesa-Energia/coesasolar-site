"use client";

import { openLeadForm } from "@/lib/lead-funnel";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import coesaLogoGreen from "@/assets/logos/coesa-green.png";
import styles from "./HomeNavbar.module.css";

const navLinks = [
  { href: "/#inicio", label: "Início" },
  { href: "/#beneficios", label: "Benefícios" },
  { href: "/#planos", label: "Planos" },
  { href: "/#como-funciona", label: "Como Funciona" },
  { href: "/blog", label: "Blog" },
  { href: "/carreiras", label: "Carreiras" },
  { href: "/#faq", label: "FAQ" },
];

export function HomeNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToForm = () => {
    openLeadForm("navbar");
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${styles.navbar} ${isScrolled ? styles.scrolled : styles.top}`}
      >
        <div className="container mx-auto px-4">
          <nav className="flex items-center justify-between h-20">
            <a href="/#inicio" className="flex-shrink-0">
              <Image src={coesaLogoGreen} alt="COESA" width={192} height={108} sizes="(min-width: 1024px) 100px, 72px" className={`h-10 w-auto lg:h-14 ${styles.brand}`} priority />
            </a>
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <a key={link.href} href={link.href} className={`text-sm transition-colors ${styles.navLink}`}>
                  {link.label}
                </a>
              ))}
            </div>
            <div className="hidden lg:flex items-center gap-3">
              <Button onClick={scrollToForm} size="sm" className={`${styles.simulate} font-medium px-6 rounded-full`}>
                Simular
              </Button>
              <Button asChild size="sm" variant="outline" className={`${styles.access} font-medium px-6 rounded-full bg-transparent`}>
                <a href="https://cliente.coesaenergia.com.br/login" target="_blank" rel="noopener noreferrer">Acesso</a>
              </Button>
            </div>
            <button
              className={`lg:hidden p-2 ${styles.menuButton}`}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? "Fechar menu" : "Abrir menu"}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </nav>
        </div>
      </motion.header>
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div initial={{}} animate={{}} exit={{}} className="fixed inset-0 z-40 overflow-y-auto bg-black pt-20 lg:hidden">
            <div className="container mx-auto px-4 py-8 pb-12 flex flex-col gap-6">
              {navLinks.map((link) => (
                <a key={link.href} href={link.href} className="text-2xl text-white/80 hover:text-white py-2" onClick={() => setIsMobileMenuOpen(false)}>
                  {link.label}
                </a>
              ))}
              <Button onClick={scrollToForm} size="lg" className="bg-white text-black hover:bg-white/90 font-medium mt-4 rounded-sm w-full py-6">
                Simular Economia
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 font-medium rounded-sm w-full py-6 bg-transparent">
                <a href="https://cliente.coesaenergia.com.br/login" target="_blank" rel="noopener noreferrer">Acesso</a>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
