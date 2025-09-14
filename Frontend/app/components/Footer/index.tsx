'use client';
import React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if the bearer token exists in localStorage or any other place you're storing it
    const token = localStorage.getItem("authToken"); // Replace with your logic if stored elsewhere
    setIsLoggedIn(!!token); // If token exists, the user is logged in
  }, []);

  const handleClick = () => {
    if (isLoggedIn) {
      router.push("/LoanForm");
    } else {
      router.push("/SignUp");
    }
  };

  return (
    <footer className="text-class bg-gradient-to-br from-blue-100 to-purple-100">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-6">
          {/* <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Get Started Today!
          </h2> */}
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Don&apos;t wait—apply for your loan now and get instant approval!
          </p>
          <div>
          <button
      onClick={handleClick}
      className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-br from-blue-400 to-purple-400 hover:bg-blue-700 md:text-lg md:px-10"
    >
      🚀 Apply Now
    </button>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <div className="text-center space-y-4">
            <p className="text-lg text-gray-700">
              Made with ❤️ by{' '}
              <a 
                href="https://github.com/Armaan457" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-purple-600 hover:text-purple-800 font-semibold underline decoration-2 hover:decoration-blue-800 transition-colors"
              >
                Armaan
              </a>
              {' '}and{' '}
              <a 
                href="https://github.com/KhushamBansal" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-purple-600 hover:text-purple-800 font-semibold underline decoration-2 hover:decoration-blue-800 transition-colors"
              >
                Khusham
              </a>
            </p>
            <p className="text-base text-gray-500">
              © {currentYear} All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;