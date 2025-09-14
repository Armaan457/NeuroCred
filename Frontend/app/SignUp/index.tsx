"use client"
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import './SignUp.css';

interface SignUpFormData {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
}

const SignUp: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<SignUpFormData>({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const buttonVariants = {
    idle: { scale: 1 },
    hover: { scale: 1.02 },
    tap: { scale: 0.95 }
  };

  const handleSendOTP = async () => {
    try {
      setIsLoading(true);
      setError('');

      const response = await fetch('http://localhost:1000/api/auth/request-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('signupData', JSON.stringify(formData));
        router.push('/OtpVerify');
      } else {
        setError(data.message || 'Failed to send OTP');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = () => {
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid()) {
      await handleSendOTP();
    } else {
      setError('Please fill all required fields correctly.');
    }
  };

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h1>
          <p className="text-gray-600 mb-6">Sign up to get started!</p>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                type="text"
                placeholder="Full Name"
                className="input-field"
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              />
            </div>

            <div>
              <input
                type="email"
                placeholder="Email"
                className="input-field"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>

            <div>
              <input
                type="tel"
                placeholder="Phone Number"
                className="input-field"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
              />
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="input-field pr-12"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
              />
              <button
                type="button"
                className="absolute right-4 top-1/2 transform -translate-y-1/2"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>

            <div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Confirm Password"
                className="input-field"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                required
              />
            </div>

            <motion.button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-4 rounded-lg font-semibold disabled:opacity-50"
              variants={buttonVariants}
              initial="idle"
              whileHover="hover"
              whileTap="tap"
              disabled={isLoading || !isFormValid()}
            >
              {isLoading ? (
                <div className="spinner" />
              ) : (
                "Sign Up"
              )}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <a href="/Login" className="text-blue-500 font-semibold hover:underline">
                Login
              </a>
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SignUp;



// "use client"
// import React, { useState } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import './SignUp.css'; // We'll create this file for additional animations

// interface SignUpFormData {
//   fullName: string;
//   email: string;
//   phoneNumber: string;
//   password: string;
//   confirmPassword: string;
// }

// const SignUp: React.FC = () => {
//   const [formData, setFormData] = useState<SignUpFormData>({
//     fullName: '',
//     email: '',
//     phoneNumber: '',
//     password: '',
//     confirmPassword: '',
//   });
//   const [showPassword, setShowPassword] = useState<boolean>(false);
//   const [isLoading, setIsLoading] = useState<boolean>(false);

//   // Animation variants
//   const containerVariants = {
//     hidden: { opacity: 0, y: 20 },
//     visible: {
//       opacity: 1,
//       y: 0,
//       transition: {
//         duration: 0.6,
//         staggerChildren: 0.1
//       }
//     }
//   };

//   const itemVariants = {
//     hidden: { opacity: 0, x: -20 },
//     visible: {
//       opacity: 1,
//       x: 0,
//       transition: { duration: 0.5 }
//     }
//   };

//   const buttonVariants = {
//     idle: { scale: 1 },
//     hover: { 
//       scale: 1.02,
//       transition: {
//         duration: 0.3,
//         yoyo: Infinity
//       }
//     },
//     tap: { scale: 0.95 }
//   };

//   return (
//     <motion.div
//       className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-6"
//       initial="hidden"
//       animate="visible"
//       variants={containerVariants}
//     >
//       <motion.div 
//         className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden"
//         whileHover={{ boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
//         transition={{ duration: 0.3 }}
//       >
//         <div className="p-8">
//           <motion.h1 
//             className="text-3xl font-bold text-gray-800 mb-2"
//             variants={itemVariants}
//           >
//             Create an Account
//           </motion.h1>
//           <motion.p 
//             className="text-gray-600 mb-8"
//             variants={itemVariants}
//           >
//             Sign up to get started!
//           </motion.p>

//           <form className="space-y-6">
//             {/* Full Name Input */}
//             <motion.div variants={itemVariants} className="input-container">
//               <motion.input
//                 whileFocus={{ scale: 1.02 }}
//                 type="text"
//                 placeholder="Full Name"
//                 className="input-field"
//                 onChange={(e) => setFormData({...formData, fullName: e.target.value})}
//               />
//               <motion.span 
//                 className="input-highlight"
//                 initial={{ scaleX: 0 }}
//                 whileFocus={{ scaleX: 1 }}
//               />
//             </motion.div>

//             {/* Email Input */}
//             <motion.div variants={itemVariants} className="input-container">
//               <motion.input
//                 whileFocus={{ scale: 1.02 }}
//                 type="email"
//                 placeholder="Email"
//                 className="input-field"
//                 onChange={(e) => setFormData({...formData, email: e.target.value})}
//               />
//             </motion.div>

//             {/* Phone Input */}
//             <motion.div variants={itemVariants} className="input-container">
//               <motion.input
//                 whileFocus={{ scale: 1.02 }}
//                 type="tel"
//                 placeholder="Phone Number"
//                 className="input-field"
//                 onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
//               />
//             </motion.div>

//             {/* Password Input */}
//             <motion.div variants={itemVariants} className="input-container relative">
//               <motion.input
//                 whileFocus={{ scale: 1.02 }}
//                 type={showPassword ? "text" : "password"}
//                 placeholder="Password"
//                 className="input-field pr-12"
//                 onChange={(e) => setFormData({...formData, password: e.target.value})}
//               />
//               <motion.button
//                 type="button"
//                 className="absolute right-4 top-1/2 transform -translate-y-1/2"
//                 onClick={() => setShowPassword(!showPassword)}
//                 // whileHover={{ scale: 1.1 }}
//                 // whileTap={{ scale: 0.9 }}
//               >
//                 {showPassword ? "👁️" : "👁️‍🗨️"}
//               </motion.button>
//             </motion.div>

//             {/* Confirm Password Input */}
//             <motion.div variants={itemVariants} className="input-container">
//               <motion.input
//                 whileFocus={{ scale: 1.02 }}
//                 type={showPassword ? "text" : "password"}
//                 placeholder="Confirm Password"
//                 className="input-field"
//                 onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
//               />
//             </motion.div>

//             {/* Submit Button */}
//             <motion.button
//               variants={buttonVariants}
//               initial="idle"
//               whileHover="hover"
//               whileTap="tap"
//               className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-4 rounded-lg font-semibold"
//             >
//               {isLoading ? (
//                 <motion.div
//                   className="spinner"
//                   animate={{ rotate: 360 }}
//                   transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
//                 />
//               ) : (
//                 "Sign Up"
//               )}
//             </motion.button>
//           </form>

//           <motion.div
//             variants={itemVariants}
//             className="mt-6 text-center"
//           >
//             <p className="text-gray-600">
//               Already have an account?{' '}
//               <motion.a
//                 href="/Login"
//                 className="text-blue-500 font-semibold"
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//               >
//                 Login
//               </motion.a>
//             </p>
//           </motion.div>
//         </div>
//       </motion.div>
//     </motion.div>
//   );
// };

// export default SignUp;