'use client';

import React from 'react';
import { MessageCircle } from 'lucide-react';

interface FloatingWhatsAppProps {
  categorySlug?: string;
  categoryName?: string;
}

export const FloatingWhatsApp: React.FC<FloatingWhatsAppProps> = ({
  categorySlug,
  categoryName,
}) => {
  const getWhatsAppMessage = (): string => {
    if (categorySlug === 'bridal') {
      return 'Hello Barakah Bazaar Bridal Team, I would like assistance with bridal collection designs, sizing, and ordering.';
    }
    if (categorySlug === 'coconut-oil') {
      return 'Hello Kerala Pure Coconut Oil Team, I would like to place an order or ask a question regarding your coconut oil.';
    }
    if (categorySlug === 'naturals') {
      return 'Hello Barakah Naturals Team, I would like to inquire about your candles and wellness collection.';
    }
    return 'Hello Barakah Bazaar, I would like assistance with an order.';
  };

  const message = encodeURIComponent(getWhatsAppMessage());
  const phoneNumber = '918951789665'; // Authentic merchant WhatsApp from mock sites
  const href = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <aside
      aria-label="Direct WhatsApp Ordering and Customer Care"
      className="fixed bottom-5 right-5 z-40 group"
    >
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contact us on WhatsApp for orders and sizing"
        className="flex items-center gap-2.5 bg-[#25D366] hover:bg-[#20BA5A] text-white py-2.5 px-3.5 sm:px-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 no-underline"
      >
        <MessageCircle className="w-5 h-5 fill-white text-[#25D366]" />
        <span className="hidden sm:inline text-xs font-bold tracking-wide uppercase">
          WhatsApp Order
        </span>
      </a>
    </aside>
  );
};
