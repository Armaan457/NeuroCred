import React from 'react';
import { Bot, Zap, BarChart, Lock } from 'lucide-react';

const features = [
  {
    title: "Fast Loan Approval – Instant decision on your application",
    description: "Loan Approval & Rejection – Easy Application Judgment. Know Your Eligibility in Minutes!",
    Icon: Zap,
    details: ["Instant decision-making", "Transparent approval criteria", "AI-driven accuracy"]
  },
  {
    title: "Custom Credit Scoring – Tailored to your financial profile",
    description: "Know Your Financial Strength. We go beyond traditional credit scores!",
    Icon: BarChart,
    details: ["Real-time credit score updates", "Improved loan eligibility", "AI-based financial insights"]
  },
  {
    title: "Hassle-Free Application – Quick and secure loan processing",
    description: "No paperwork. No long queues. Just a few clicks, and you’re done!",
    Icon: Lock,
    details: ["100% Online Process – Apply anytime, anywhere", "Secure KYC Verification – Digital verification for fast approval", "Track Your Application – Get real-time updates"]
    // badge: "Coming Soon"
  }
];
const Features = () => {
  return (
    <div id="features" className="text-class w-full py-16 px-4">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Bot className="w-8 h-8 text-blue-600 animate-bounce" />
            <h2 className="text-5xl font-bold text-gray-800">
              Everything You Need, All in One Place
            </h2>
          </div>
          <p className="text-2xl text-gray-600">
            Your AI-Powered Loan Plan Recommendation Partner
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 p-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300
                        transform hover:-translate-y-2 group relative overflow-hidden"
            >
              {/* Background Gradient Animation */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-50 to-blue-50 opacity-0
                            group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Coming Soon Badge */}
              {feature.badge && (
                <div className="absolute top-4 right-4 px-3 py-1 text-xs font-semibold text-blue-600 bg-purple-100 rounded-full animate-pulse z-20">
                  {feature.badge}
                </div>
              )}
              
              {/* Content */}
              <div className="relative z-10">
                {/* Icon */}
                <div className="mb-4 transform group-hover:scale-110 transition-transform duration-300">
                  <feature.Icon className="w-12 h-12 text-blue-600" />
                </div>
                
                {/* Title */}
                <h3 className="text-xl font-bold mb-3 text-gray-800 group-hover:text-blue-600
                             transition-colors duration-300">
                  {feature.title}
                </h3>
                
                {/* Description */}
                <p className="text-xl text-gray-600 mb-6 group-hover:text-gray-700 transition-colors duration-300">
                  {feature.description}
                </p>
                
                {/* Details List */}
                <ul className="space-y-2">
                  {feature.details.map((detail, i) => (
                    <li
                      key={i}
                      className="flex items-center text-gray-600 opacity-0 transform translate-y-2
                               group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300"
                      style={{ transitionDelay: `${i * 100}ms` }}
                    >
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Features;