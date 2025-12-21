'use client';
import Image from "next/image";
import { Albert_Sans } from "next/font/google";

const albertSans = Albert_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function FeaturesBar() {
  const features = [
    {
      title: "Free Shipping",
      desc: "On select launches & offers",
      icon: "/truckIcon.svg",
      width: 44,
      height: 44,
      mr: "mr-2",
    },
    {
      title: "Easy Returns",
      desc: "7-day return window",
      icon: "/moneyBackIcon.svg",
      width: 44,
      height: 44,
      mr: "mr-0",
    },
    {
      title: "Premium Support",
      desc: "Phone and email support",
      icon: "/customerSupportIcon.svg",
      width: 40,
      height: 40,
      mr: "mr-0",
    },
    {
      title: "Secure Payments",
      desc: "Secured by Razorpay",
      icon: "/secureIcon.svg",
      width: 40,
      height: 40,
      mr: "mr-0",
    },
  ];

  return (
    <section className={`relative w-full bg-white pt-12 pb-24 z-10 ${albertSans.className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 justify-items-center">
          {features.map((feature, index) => (
            <div
              key={index}
              className="w-60 h-32 flex flex-col md:flex-row items-center justify-start text-center md:text-left gap-4 transition-transform duration-300 hover:scale-[1.03]"
            >
              {/* Icon */}
              <div className="w-20 h-20 bg-gray-900 flex items-center justify-center">
                <Image
                  src={feature.icon}
                  alt={feature.title}
                  width={feature.width}
                  height={feature.height}
                  className="object-contain"
                />
              </div>

              {/* Text */}
              <div>
                <h3 className={`font-semibold text-gray-900 text-base sm:text-lg ${feature.mr}`}>
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
