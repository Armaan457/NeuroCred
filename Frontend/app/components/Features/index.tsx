import React from 'react';
import { Bot, Zap, BarChart, Lock, LucideIcon } from 'lucide-react';

interface Feature {
  title: string;
  description: string;
  Icon: LucideIcon;
  details: string[];
  badge?: string;
}

const features: Feature[] = [
  {
    title: "Loan Eligibility Prediction - AI powered assessment simulation",
    description: "Experience Loan Prediction Technology - Test Your Eligibility with Advanced AI Models!",
    Icon: Zap,
    details: ["Instant prediction results", "Transparent evaluation criteria", "AI-driven accuracy for learning"]
  },
  {
    title: "CIBIL Score Simulation - Educational financial profiling",
    description: "Understand Your Financial Profile. Learn how credit scoring works beyond traditional methods!",
    Icon: BarChart,
    details: ["Simulated credit score analysis", "Educational insights into improving CIBIL score", "AI-based financial learning tools"]
  },
  {
    title: "Interactive Learning Platform - Explore financial predictions",
    description: "No real applications. No actual loans. Just powerful learning and prediction simulations!",
    Icon: Lock,
    details: ["100% Educational Platform - Learn anytime, anywhere", "Safe Simulation Environment - Practice with realistic scenarios", "Track Your Learning - Monitor your financial knowledge growth"]
  }
];

const Features = () => {
  return (
    <section id="features" className="w-full bg-white py-24 px-4 text-class">
      <div className="max-w-6xl mx-auto">
        {/* Header Block */}
        <div className="text-center border-b border-gray-200/60 pb-10 mb-12">
          <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
            <Bot className="w-8 h-8 text-blue-600 animate-bounce" />
            <h2 className="text-3xl md:text-5xl font-bold text-gray-800">
              Everything You Need, All in One Place
            </h2>
          </div>
          <p className="text-xl text-gray-600 font-medium">
            Your AI-Powered Financial Learning & Prediction Platform
          </p>
        </div>

        {/* Grid Block */}
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-50 to-blue-50 opacity-0 hover:opacity-100 transition-opacity duration-300" />
              
              {feature.badge && (
                <div className="absolute top-4 right-4 px-2.5 py-1 text-xs font-semibold text-blue-600 bg-purple-100 rounded-full z-10">
                  {feature.badge}
                </div>
              )}
              
              <div className="relative z-10">
                <div className="mb-4">
                  <feature.Icon className="w-10 h-10 text-blue-600" />
                </div>
                
                <h3 className="text-xl font-bold mb-2 text-gray-800">
                  {feature.title}
                </h3>
                
                <p className="text-gray-600 mb-4">
                  {feature.description}
                </p>
                
                <ul className="space-y-2 text-sm text-gray-600">
                  {feature.details.map((detail, i) => (
                    <li key={i} className="flex items-center">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 flex-shrink-0" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
