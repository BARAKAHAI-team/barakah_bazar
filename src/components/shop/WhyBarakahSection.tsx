import React from 'react';

// Custom bespoke SVGs for Pure, Halal, Trusted
const PureIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5 text-[#B8892D]' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
    <path d="M12 22a7.99 7.99 0 0 0 6.64-12.43L12 2.69 5.36 9.57A7.99 7.99 0 0 0 12 22z" fill="currentColor" fillOpacity="0.1" />
    <path d="M12 12c0 2.21-1.79 4-4 4" />
  </svg>
);

const HalalIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5 text-[#B8892D]' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="9.5" />
    <path d="M14.5 8.5a5.5 5.5 0 1 0 0 7 4.5 4.5 0 0 1 0-7z" fill="currentColor" fillOpacity="0.12" />
    <polygon points="12 10.5 12.8 12.1 14.6 12.3 13.3 13.6 13.6 15.4 12 14.5 10.4 15.4 10.7 13.6 9.4 12.3 11.2 12.1 12 10.5" fill="currentColor" strokeWidth="0.5" />
  </svg>
);

const TrustedIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5 text-[#B8892D]' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="currentColor" fillOpacity="0.1" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
);

export const WhyBarakahSection: React.FC = () => {
  const points = [
    {
      icon: PureIcon,
      title: 'Pure',
      desc: '100% natural cold-pressed Kerala oils, authentic silks, and botanical waxes with zero synthetic adulterants.',
    },
    {
      icon: HalalIcon,
      title: 'Halal',
      desc: 'Ethically sourced, permissible, and produced with honest principles adhering strictly to Islamic values.',
    },
    {
      icon: TrustedIcon,
      title: 'Trusted',
      desc: 'Verified artisan origins, secure encrypted checkout, and direct doorstep delivery across India.',
    },
  ];

  return (
    <section id="why-barakah" className="py-12 sm:py-16 bg-white border-t border-[#EADFC8]/60">
      <div className="w-[min(1280px,92%)] mx-auto">
        {/* Section Header - Short & Crisp */}
        <div className="text-center max-w-[560px] mx-auto mb-8 sm:mb-10">
          <span className="text-[10px] font-bold tracking-[2.5px] text-[#8A641A] uppercase mb-1.5 block">
            OUR VALUES
          </span>
          <h2 className="font-serif text-[28px] sm:text-[34px] font-bold text-[#1A1A17] tracking-tight mb-2">
            Why BarakahBazar
          </h2>
          <p className="text-[#685c4a] text-[13px] sm:text-[14px] leading-relaxed m-0">
            Kerala pure coconut oil, bespoke royal couture, and artisanal scented candles crafted with uncompromised barakah.
          </p>
        </div>

        {/* 2-Column Grid: 3 Points + Clean Image */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center max-w-[1100px] mx-auto">
          {/* Left: 3 Factual Points (Pure, Halal, Trusted) */}
          <div className="lg:col-span-7 flex flex-col gap-3.5 sm:gap-4">
            {points.map((pt, idx) => {
              const IconComponent = pt.icon;
              return (
                <div
                  key={idx}
                  className="bg-[#FAF7F2] rounded-xl p-4 sm:p-4.5 border border-[#E5DAC6] flex items-start gap-4 transition-all hover:border-[#B8892D]/40 hover:bg-[#FDFBF7]"
                >
                  <div className="w-11 h-11 shrink-0 rounded-xl bg-white border border-[#EADFC8] flex items-center justify-center text-[#B8892D] shadow-2xs mt-0.5">
                    <IconComponent className="w-5 h-5 text-[#B8892D]" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-[16px] sm:text-[17px] text-[#1A1A17] mb-1 leading-snug">
                      {pt.title}
                    </h3>
                    <p className="text-[12.5px] sm:text-[13px] text-[#6b6255] leading-relaxed m-0 font-normal">
                      {pt.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Clean Product Photo */}
          <div className="lg:col-span-5">
            <div className="rounded-xl overflow-hidden border border-[#E5DAC6] shadow-[0_8px_25px_rgba(75,56,20,0.08)] bg-[#FAF7F2]">
              <img
                src="/images/home/barakah_luxury_hero.jpg"
                alt="BarakahBazar Authentic Showcase"
                className="w-full h-[230px] sm:h-[270px] lg:h-[285px] object-cover object-center"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
