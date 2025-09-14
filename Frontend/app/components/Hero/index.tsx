"use client"
import React, { useState, useEffect } from 'react';
// import { Button } from '@/components/ui/button';

import Image from "next/image";
import image from "@/public/image/image1.png"
const Hero = () => {
  
  return (
    <div className="w-full bg-white">
      <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="flex flex-col-reverse lg:flex-row items-center justify-between gap-12">
          {/* Content Section */}
          <div className="w-full lg:w-1/2 space-y-8 text-center lg:text-left">
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-gray-900">
              <span className="block mt-2 bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
              Quick and Easy Loans for Your Financial Needs.
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 font-medium max-w-2xl">
            Our loan services offer a hassle-free and streamlined borrowing experience, providing you with the funds you need in a timely manner to meet your financial requirements.
            </p>
            
            <div className="pt-4">
              {/* <button 
                className="h-12 px-8 text-base font-medium bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-90 transition-all duration-200"
              >
                Try Now
              </button> */}
            </div>
          </div>

          {/* Image Section */}
          <div className="w-full lg:w-1/2">
            <div className="relative w-full max-w-lg mx-auto">
              <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
              <div className="absolute top-0 -right-4 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
              <div className="relative">
              <Image
                                src={image}
                                alt="Questions"
                                className="h-[320px] w-auto"
                            />
                {/* <img
                  src={image}
                  alt="Interview preparation"
                  className="relative rounded-lg shadow-2xl"
                  width={500}
                  height={320}
                /> */}
              </div>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
};

export default Hero;

// Add these keyframes to your global CSS or use them inline
const styles = {
  '@keyframes blob': {
    '0%': {
      transform: 'translate(0px, 0px) scale(1)',
    },
    '33%': {
      transform: 'translate(30px, -50px) scale(1.1)',
    },
    '66%': {
      transform: 'translate(-20px, 20px) scale(0.9)',
    },
    '100%': {
      transform: 'translate(0px, 0px) scale(1)',
    },
  },
};