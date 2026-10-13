import React from 'react';
import { Award, Truck, ShieldCheck, Headphones } from 'lucide-react';

interface CategoryTrustBarProps {
  slug: string;
}

export const CategoryTrustBar: React.FC<CategoryTrustBarProps> = ({ slug }) => {
  const trustData: Record<
    string,
    { title: string; subtitle: string; icon: React.ReactNode }[]
  > = {
    bridal: [
      {
        title: 'Artisanal Bridal Detailing',
        subtitle: 'Hand-done zari, zardozi needlework and ornate hemlines.',
        icon: <Award className="w-4 h-4 text-[#800020]" strokeWidth={1.8} />,
      },
      {
        title: 'Versatile Celebration Styles',
        subtitle: 'Lehengas, royal anarkalis and three-piece festive sets.',
        icon: <ShieldCheck className="w-4 h-4 text-[#800020]" strokeWidth={1.8} />,
      },
      {
        title: 'Insured Pan-India Dispatch',
        subtitle: 'Direct door-to-door courier with live tracking updates.',
        icon: <Truck className="w-4 h-4 text-[#800020]" strokeWidth={1.8} />,
      },
      {
        title: 'Direct Stylist Support',
        subtitle: 'Instant sizing, fitting, and color guidance via WhatsApp.',
        icon: <Headphones className="w-4 h-4 text-[#800020]" strokeWidth={1.8} />,
      },
    ],
    'coconut-oil': [
      {
        title: '100% Cold-Pressed Purity',
        subtitle: 'Traditional wooden marachekku press from sun-dried copra.',
        icon: <Award className="w-4 h-4 text-[#123B20]" strokeWidth={1.8} />,
      },
      {
        title: 'Zero Additives or Bleach',
        subtitle: 'Unrefined, sulfur-free and strictly lab-tested for purity.',
        icon: <ShieldCheck className="w-4 h-4 text-[#123B20]" strokeWidth={1.8} />,
      },
      {
        title: 'Direct from Kerala Groves',
        subtitle: 'Rooted in the coastal coconut heritage of coastal Malabar.',
        icon: <Truck className="w-4 h-4 text-[#123B20]" strokeWidth={1.8} />,
      },
      {
        title: 'Wholesale & Retail Support',
        subtitle: 'Household orders and direct bulk enquiries welcomed.',
        icon: <Headphones className="w-4 h-4 text-[#123B20]" strokeWidth={1.8} />,
      },
    ],
    naturals: [
      {
        title: '100% Pure Organic Soy Wax',
        subtitle: 'Clean, smokeless burn free from petroleum paraffin.',
        icon: <Award className="w-4 h-4 text-[#5B1730]" strokeWidth={1.8} />,
      },
      {
        title: 'Artisanal Therapeutic Aromas',
        subtitle: 'Infused with Damask rose, jasmine, sandalwood, and oud.',
        icon: <ShieldCheck className="w-4 h-4 text-[#5B1730]" strokeWidth={1.8} />,
      },
      {
        title: 'Carefully Hand-Poured',
        subtitle: 'Artisanal small batches created with intention and blessing.',
        icon: <Truck className="w-4 h-4 text-[#5B1730]" strokeWidth={1.8} />,
      },
      {
        title: 'Luxury Gifting Concierge',
        subtitle: 'Custom hamper packaging and corporate gifting assistance.',
        icon: <Headphones className="w-4 h-4 text-[#5B1730]" strokeWidth={1.8} />,
      },
    ],
  };

  const pillars = trustData[slug] || trustData['bridal'];

  return (
    <section className="bg-[#FFFDF9] border-b border-[#EADFC8]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#EADFC8]">
          {pillars.map((item, idx) => (
            <div
              key={idx}
              className="py-4 sm:py-5 px-3 md:px-5 flex items-start gap-3 group hover:bg-[#FAF6EE]/60 transition-colors"
            >
              <div className="p-2 rounded-full bg-[#FAF6EE] border border-[#EADFC8] shrink-0 group-hover:scale-105 transition-transform mt-0.5">
                {item.icon}
              </div>
              <div className="space-y-0.5">
                <h4 className="font-serif text-sm font-bold text-[#1C1917] m-0 leading-tight">
                  {item.title}
                </h4>
                <p className="text-xs text-[#78716C] leading-relaxed m-0 font-normal">
                  {item.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
