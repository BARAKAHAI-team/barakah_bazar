import React from 'react';
import { Layers, ShoppingBag, Home, ShieldCheck } from 'lucide-react';

export const OneShoppingJourneySection: React.FC = () => {
  const steps = [
    {
      num: '01',
      icon: Layers,
      title: 'Three Collections',
      desc: 'Separate collection experiences under one storefront.',
    },
    {
      num: '02',
      icon: ShoppingBag,
      title: 'One Cart',
      desc: 'Products from all three collections can be combined.',
    },
    {
      num: '03',
      icon: Home,
      title: 'One Address',
      desc: 'Delivery details are collected once at checkout.',
    },
    {
      num: '04',
      icon: ShieldCheck,
      title: 'One Payment',
      desc: 'One secure payment step for the complete order.',
    },
  ];

  return (
    <section className="py-14 sm:py-18 bg-[#FBF8F2] relative border-b border-[#EADFC8]/60 overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] bg-[#B8892D]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-[min(1240px,92%)] mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-[680px] mx-auto mb-12 sm:mb-16">
          <h2 className="font-serif text-[30px] sm:text-[38px] lg:text-[42px] font-bold text-[#1A2E22] tracking-tight mb-3">
            One Barakah Shopping Journey
          </h2>
          <p className="text-[#5F5545] text-[13.5px] sm:text-[15px] leading-relaxed m-0 font-normal">
            No matter which collection you shop, the customer journey comes back to one shared cart and one delivery/payment flow.
          </p>
        </div>

        {/* 4-Step Journey Grid */}
        <div className="relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden lg:block absolute top-[28px] left-[12%] right-[12%] h-[1px] border-t border-dashed border-[#D5C6A9] z-0" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6 relative z-10">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={idx}
                  className="flex flex-col items-center text-center group transition-transform duration-300 hover:-translate-y-1"
                >
                  {/* Circular Icon Badge */}
                  <div className="relative w-14 h-14 rounded-full bg-white border border-[#D5C6A9] shadow-xs flex items-center justify-center text-[#B8892D] mb-5 transition-all duration-300 group-hover:border-[#B8892D] group-hover:shadow-md group-hover:scale-105">
                    <Icon size={22} strokeWidth={1.75} className="transition-colors group-hover:text-[#966E20]" />
                  </div>

                  {/* Title */}
                  <h3 className="font-serif text-[17px] sm:text-[18px] font-bold text-[#1A2E22] tracking-tight mb-2">
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="text-[12.5px] sm:text-[13px] text-[#695F4F] leading-relaxed max-w-[230px] m-0 font-normal">
                    {step.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
