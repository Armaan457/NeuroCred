import React from 'react';
import { Bot, Zap, BarChart, Lock, LucideIcon } from 'lucide-react';
import './Features.css';

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
    <div id="features" className="text-class w-full py-20 px-4">
      <div className="features-title-container">
        <div className="mx-auto max-w-6xl">
          <div className="text-center features-title">
            <div className="flex flex-wrap items-center justify-center mb-8">
              <Bot className="w-8 h-8 text-blue-600 animate-bounce mr-2" />
              <h2 className="text-4xl md:text-5xl font-bold text-gray-800">
                Everything You Need, All in One Place
              </h2>
            </div>
            <p className="text-xl md:text-2xl text-gray-600 mt-6">
              Your AI-Powered Financial Learning & Prediction Platform
            </p>
          </div>
        </div>
      </div>
      
      <div className="features-cards-container">
        <div className="mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8 p-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className="feature-card bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300
                          transform hover:-translate-y-2 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-50 to-blue-50 opacity-0
                              group-hover:opacity-100 transition-opacity duration-300" />
                
                {feature.badge && (
                  <div className="absolute top-4 right-4 px-3 py-1 text-xs font-semibold text-blue-600 bg-purple-100 rounded-full animate-pulse z-20">
                    {feature.badge}
                  </div>
                )}
                
                <div className="relative z-10">
                  <div className="mb-4 transform group-hover:scale-110 transition-transform duration-300">
                    <feature.Icon className="w-12 h-12 text-blue-600" />
                  </div>
                  
                  <h3 className="text-xl font-bold mb-3 text-gray-800 group-hover:text-blue-600
                               transition-colors duration-300">
                    {feature.title}
                  </h3>
                  
                  <p className="text-xl text-gray-600 mb-6 group-hover:text-gray-700 transition-colors duration-300">
                    {feature.description}
                  </p>
                  
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
    </div>
  );
};

export default Features;
