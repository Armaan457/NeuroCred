"use client"
import React from 'react';
import { useRouter } from 'next/navigation';

const NavItem = ({ href, children }) => (
  <li>
    <a
      href={href}
      className="text-gray-600 text-xl hover:text-purple-600 flex items-center gap-2 font-medium"
    >
      {children}
    </a>
  </li>
);

const navBarLinks = [
  { title: "Home", href: "/" },
  { title: "Loan Prediction", href: "/LoanForm" },
  { title: "CIBIL Calculator", href: "/CibilForm" },
  { title: "Features", href: "#features" },
  { title: "How it Works", href: "#working-process" },
];

const Navbar = () => {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    const resizeListener = () => {
      if (window.innerWidth >= 960) setOpen(false);
    };
    window.addEventListener("resize", resizeListener);
    return () => window.removeEventListener("resize", resizeListener);
  }, []);

  return (
    <nav id="home" className="w-full border-0 bg-white">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        {/* Logo */}
        <h1 className="text-4xl font-bold text-black">
          NeuroCred
        </h1>

        {/* Desktop Navigation */}
        <ul className="ml-10 hidden items-center gap-8 lg:flex">
          {navBarLinks.map((link) => (
            <NavItem key={link.title} href={link.href}>
              {link.title}
            </NavItem>
          ))}
        </ul>

        <div className="flex items-center space-x-2">
          {/* Mobile Console Button */}
          <button
            onClick={() => router.push("/SignUp")}
            className="px-2 py-1 text-sm block lg:hidden bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            SignUp
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setOpen(!open)}
            className="inline-block lg:hidden p-2"
          >
            {open ? (
              <svg 
                className="h-8 w-8" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M6 18L18 6M6 6l12 12" 
                />
              </svg>
            ) : (
              <svg 
                className="h-8 w-8" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4 6h16M4 12h16m-7 6h7" 
                />
              </svg>
            )}
          </button>

          {/* Desktop Console Button */}
          <button
            onClick={() => router.push("/SignUp")}
            className="px-4 py-2 text-base hidden lg:block bg-black text-white rounded hover:bg-gray-600"
          >
            SignUp
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="container mx-auto mt-3 border-t border-blue-gray-50 px-2 pt-4">
          <ul className="flex flex-col gap-4">
            {navBarLinks.map((link) => (
              <NavItem key={link.title} href={link.href}>
                {link.title}
              </NavItem>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;