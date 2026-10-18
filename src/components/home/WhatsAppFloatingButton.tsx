"use client";

import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import * as motion from "framer-motion/m";
import { WHATSAPP_5192 } from "@/lib/whatsapp-numbers";

export function WhatsAppFloatingButton() {
  const whatsappUrl = `https://wa.me/${WHATSAPP_5192}?text=Olá! Vim pelo site e gostaria de saber mais sobre o desconto na conta de luz.`;
  const [heroVisible, setHeroVisible] = useState(true);

  useEffect(() => {
    const hero = document.getElementById("inicio");
    if (!hero || typeof IntersectionObserver === "undefined") {
      setHeroVisible(false);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => setHeroVisible(entry.isIntersecting));
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  return (
    <motion.a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`fixed bottom-6 right-6 z-30 h-14 w-14 rounded-full bg-[#25D366] text-white items-center justify-center shadow-lg hover:shadow-xl transition-shadow ${heroVisible ? "hidden sm:flex" : "flex"}`}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20, delay: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Fale conosco no WhatsApp"
    >
      <MessageCircle className="w-7 h-7" fill="white" />
      
      {/* Pulse Animation */}
      <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-25" />
    </motion.a>
  );
}
