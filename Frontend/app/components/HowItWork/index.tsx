'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  motion,
  MotionValue,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';
import { Award, Check, MessageSquare, Search } from 'lucide-react';
import Image from 'next/image';
import step1 from '@/public/image/step1.png';
import step2 from '@/public/image/step2.png';
import step3 from '@/public/image/step3.png';
import step4 from '@/public/image/step4.png';

const stepImages = [step1, step2, step3, step4];

const AnimatedIllustration: React.FC<{ index: number }> = ({ index }) => {
  const image = stepImages[index];

  return (
    <div className="w-32 h-32 md:w-40 md:h-40 relative">
      <Image
        src={image}
        alt={`Step ${index + 1}`}
        layout="fill"
        objectFit="contain"
      />
    </div>
  );
};

type ProcessStepProps = {
  step: string;
  description: string;
  index: number;
  icon: any;
  marginTop: number;
};

const ProcessStep: React.FC<ProcessStepProps> = ({
  step,
  description,
  index,
  icon: Icon,
  marginTop,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      className={`relative w-full md:w-96 ${
        index % 2 === 0 ? 'md:mr-auto' : 'md:ml-auto'
      }`}
      style={{ marginTop }}
    >
      <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl p-6 md:p-8 relative overflow-hidden border border-blue-300/10">
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="bg-blue-100 rounded-lg p-3">
              <div className="text-indigo-950 font-mono font-bold text-lg">
                {String(index + 1).padStart(2, '0')}
              </div>
            </div>
            <Icon className="w-6 h-6 text-blue-400" />
          </div>
          <h3 className="text-black-300 text-class text-2xl md:text-4xl font-bold mb-3">
            {step}
          </h3>
          <p className="text-black-100/90 text-class text-base md:text-xl leading-relaxed">
            {description}
          </p>
        </div>
      </div>
      <div
        className={`absolute top-1/2 -translate-y-1/2 text-black-400 ${
          index % 2 === 0
            ? 'hidden md:block md:right-[-200px]'
            : 'hidden md:block md:left-[-200px]'
        }`}
      >
        <AnimatedIllustration index={index} />
      </div>
    </motion.div>
  );
};

const ScrollingBead: React.FC<{ progress: MotionValue<number> }> = ({
  progress,
}) => {
  const springProgress = useSpring(progress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className="w-4 h-4 bg-blue-400 rounded-full absolute left-1/2 -translate-x-1/2"
      style={{ top: springProgress }}
    />
  );
};

const WorkingProcess: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [firstStepTop, setFirstStepTop] = useState(0);
  const [lastStepBottom, setLastStepBottom] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(
    scrollYProgress,
    [0, 1],
    [firstStepTop, lastStepBottom]
  );

  const steps = [
    {
      step: 'Apply Online',
      description:
        'Fill out a quick and secure loan application form with your personal and financial details',
      icon: Check,
    },
    {
      step: 'Get Instant Credit Assessment',
      description:
        'Our AI-powered system evaluates your credit score and eligibility within minutes.',
      icon: MessageSquare,
    },
    {
      step: 'Submit Documents for Verification',
      description:
        'Upload necessary documents (ID proof, income proof, and bank details) for fast processing.',
      icon: Search,
    },
    {
      step: 'Receive Your Loan',
      description:
        'Once approved, the loan amount is credited directly to your bank account.',
      icon: Award,
    },
  ];

  useEffect(() => {
    const updatePositions = () => {
      const content = document.getElementById('process-content');
      if (content) {
        const steps = content.children;
        if (steps.length > 0) {
          const firstStep = steps[0].getBoundingClientRect();
          const lastStep = steps[steps.length - 1].getBoundingClientRect();
          const contentRect = content.getBoundingClientRect();

          setFirstStepTop(firstStep.top - contentRect.top);
          setLastStepBottom(lastStep.bottom - contentRect.top - 12);
        }
      }
    };

    updatePositions();
    window.addEventListener('resize', updatePositions);
    return () => window.removeEventListener('resize', updatePositions);
  }, []);

  return (
    <section id="working-process">
      <div className="min-h-screen py-16 px-4 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto mb-16"
        >
          <h1 className="text-4xl md:text-6xl text-class font-bold text-indigo-950 flex items-center">
            How it Works
            <span className="ml-6 h-1 flex-grow bg-blue-400" />
          </h1>
        </motion.div>

        <div ref={containerRef} className="max-w-7xl mx-auto relative">
          {/* Central Line */}
          <div className="absolute left-1/2 top-0 w-0.5 h-full bg-blue-400/20 hidden md:block" />
          {/* Scrolling Bead */}
          <div className="hidden md:block">
            <ScrollingBead progress={y} />
          </div>
          <div id="process-content" className="relative flex flex-col gap-12">
            {steps.map((step, index) => (
              <ProcessStep
                key={index}
                {...step}
                index={index}
                marginTop={0}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WorkingProcess;




// 'use client'
// import React, {useEffect, useRef, useState} from "react";
// import {motion, MotionValue, useScroll, useSpring, useTransform} from "framer-motion";
// import {Award, Check, MessageSquare, Search} from "lucide-react";
// // import '../CSS/styles.css'



// const AnimatedIllustration: React.FC<{
//     index: number
// }> = ({index}) => {
//     const animations: {
//         [key: number]: JSX.Element
//     } = {
//         0: (
//             <motion.svg
//                 className="w-32 h-32"
//                 viewBox="0 0 24 24"
//                 initial={{scale: 0.8, opacity: 0.3}}
//                 animate={{
//                     scale: [0.8, 1, 0.8],
//                     opacity: [0.3, 1, 0.3]
//                 }}
//                 transition={{
//                     duration: 3,
//                     repeat: Infinity,
//                     ease: "easeInOut"
//                 }}
//             >
//                 <motion.path
//                     fill="#4A90E2"
//                     d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"
//                     initial={{pathLength: 0}}
//                     animate={{pathLength: 1}}
//                     transition={{duration: 2, repeat: Infinity}}
//                 />
//             </motion.svg>
//         ),
//         1: (
//             <motion.svg
//                 className="w-32 h-32"
//                 viewBox="0 0 24 24"
//                 // initial={{rotate: 0}}
//                 // animate={{rotate: 360}}
//                 transition={{duration: 20, repeat: Infinity, ease: "linear"}}
//             >
//                 <defs>
//                     <linearGradient id="aiGradient" x1="0%" y1="0%" x2="100%" y2="100%">
//                         <stop offset="0%" style={{stopColor: '#4A90E2'}}>
//                             <animate
//                                 attributeName="stop-color"
//                                 values="#4A90E2; #2563eb; #4A90E2"
//                                 dur="4s"
//                                 repeatCount="indefinite"
//                             />
//                         </stop>
//                         <stop offset="100%" style={{stopColor: '#2563eb'}}>
//                             <animate
//                                 attributeName="stop-color"
//                                 values="#2563eb; #4A90E2; #2563eb"
//                                 dur="4s"
//                                 repeatCount="indefinite"
//                             />
//                         </stop>
//                     </linearGradient>
//                 </defs>
//                 <motion.path
//                     fill="url(#aiGradient)"
//                     d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7"
//                     initial={{scale: 1}}
//                     animate={{scale: [1, 1.2, 1]}}
//                     transition={{duration: 3, repeat: Infinity}}
//                 />
//             </motion.svg>
//         ),
//         2: (
//             <motion.svg
//                 className="w-40 h-40"
//                 viewBox="0 0 64 64"
//                 xmlns="http://www.w3.org/2000/svg"
//                 initial={{scale: 1}}
//                 animate={{scale: [1, 1.05, 1]}}
//                 transition={{duration: 2, repeat: Infinity}}
//             >
//                 <motion.rect
//                     x="18"
//                     y="10"
//                     width="28"
//                     height="40"
//                     rx="4"
//                     fill="#4A90E2"
//                     initial={{y: 0}}
//                     animate={{y: [-2, 2, -2]}}
//                     transition={{duration: 3, repeat: Infinity}}
//                 />
//                 <motion.rect
//                     x="20"
//                     y="12"
//                     width="24"
//                     height="36"
//                     rx="3"
//                     fill="#2563eb"
//                     animate={{y: [-2, 2, -2]}}
//                     transition={{duration: 3, repeat: Infinity}}
//                 />

//                 <motion.line
//                     x1="24"
//                     y1="20"
//                     x2="40"
//                     y2="20"
//                     stroke="#1D3557"
//                     strokeWidth="2"
//                     animate={{scaleX: [1, 1.1, 1]}}
//                     transition={{duration: 1.5, repeat: Infinity}}
//                 />
//                 <motion.line
//                     x1="24"
//                     y1="28"
//                     x2="40"
//                     y2="28"
//                     stroke="#1D3557"
//                     strokeWidth="2"
//                     animate={{scaleX: [1, 1.1, 1]}}
//                     transition={{duration: 1.5, repeat: Infinity, delay: 0.3}}
//                 />
//                 <motion.line
//                     x1="24"
//                     y1="36"
//                     x2="36"
//                     y2="36"
//                     stroke="#1D3557"
//                     strokeWidth="2"
//                     animate={{scaleX: [1, 1.1, 1]}}
//                     transition={{duration: 1.5, repeat: Infinity, delay: 0.6}}
//                 />

//                 <motion.g
//                     initial={{x: 0, y: 0}}
//                     animate={{x: [-4, 4, -4], y: [-2, 2, -2]}}
//                     transition={{duration: 3, repeat: Infinity}}
//                 >
//                     <circle cx={46} cy={42} r={6} fill="#4A90E2"/>
//                     <rect x={44} y={48} width={4} height={10} rx={2} fill="#4A90E2"/>
//                 </motion.g>

//                 <motion.g>
//                     {[...Array(3)].map((_, i) => (
//                         <motion.circle
//                             key={i}
//                             cx={20 + i * 12}
//                             cy={8}
//                             r="2"
//                             fill="#2563eb"
//                             initial={{scale: 0.8, opacity: 0.6}}
//                             animate={{scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6]}}
//                             transition={{
//                                 duration: 2,
//                                 repeat: Infinity,
//                                 delay: i * 0.3,
//                             }}
//                         />
//                     ))}
//                 </motion.g>
//             </motion.svg>
//         ),
//         3: (
//             <motion.svg
//                 className="w-40 h-40"
//                 viewBox="0 0 64 64"
//                 xmlns="http://www.w3.org/2000/svg"
//                 initial={{scale: 1}}
//                 animate={{scale: [1, 1.1, 1], rotate: [0, 5, -5, 0]}}
//                 transition={{duration: 2, repeat: Infinity}}
//             >
//                 <motion.path
//                     fill="#4A90E2"
//                     d="M32 4C26 4 22 6 22 6V20C22 26 26 30 32 30C38 30 42 26 42 20V6C42 6 38 4 32 4Z"
//                     animate={{rotate: [0, 5, -5, 0]}}
//                     transition={{duration: 2, repeat: Infinity}}
//                 />
//                 <motion.rect
//                     x="24"
//                     y="30"
//                     width="16"
//                     height="4"
//                     fill="#2563eb"
//                     animate={{scaleY: [0.9, 1.1, 0.9]}}
//                     transition={{duration: 1.5, repeat: Infinity}}
//                 />
//                 <motion.rect
//                     x="20"
//                     y="34"
//                     width="24"
//                     height="6"
//                     fill="#2563eb"
//                     animate={{scaleY: [0.9, 1.1, 0.9]}}
//                     transition={{duration: 1.5, repeat: Infinity}}
//                 />

//                 <motion.g
//                     initial={{scale: 0.8, opacity: 0}}
//                     animate={{
//                         scale: [1, 1.3, 1],
//                         opacity: [0.5, 1, 0.5],
//                     }}
//                     transition={{
//                         duration: 2,
//                         repeat: Infinity,
//                     }}
//                 >
//                     <circle cx={32} cy={4} r={2} fill="#4A90E2"/>
//                     <circle cx={24} cy={8} r={1.5} fill="#4A90E2"/>
//                     <circle cx={40} cy={8} r={1.5} fill="#4A90E2"/>
//                     <circle cx={28} cy={12} r={1} fill="#4A90E2"/>
//                     <circle cx={36} cy={12} r={1} fill="#4A90E2"/>
//                 </motion.g>

//                 <motion.g>
//                     {[...Array(6)].map((_, i) => (
//                         <motion.circle
//                             key={i}
//                             cx={Math.random() * 64}
//                             cy={Math.random() * 32 + 32}
//                             r="1.5"
//                             fill={i % 2 === 0 ? "#4A90E2" : "#2563eb"}
//                             initial={{y: 0}}
//                             animate={{y: [0, -10, 0]}}
//                             transition={{
//                                 duration: 2,
//                                 delay: i * 0.2,
//                                 repeat: Infinity,
//                             }}
//                         />
//                     ))}
//                 </motion.g>

//                 <motion.path
//                     fill="#4A90E2"
//                     d="M16 10C12 16 16 20 20 20V12C16 12 16 10 16 10ZM48 10C52 16 48 20 44 20V12C48 12 48 10 48 10Z"
//                     animate={{scaleX: [1, 1.1, 1]}}
//                     transition={{duration: 1.5, repeat: Infinity}}
//                 />
//             </motion.svg>
//         )
//     };

//     return animations[index];
// };

// type ProcessStepProps = {
//   step: string;
//   description: string;
//   index: number;
//   icon: any;
//   marginTop: number;
// };

// const ProcessStep: React.FC<ProcessStepProps> = ({
//   step,
//   description,
//   index,
//   icon: Icon,
//   marginTop,
// }) => {
//   return (
//     <motion.div
//       initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
//       whileInView={{ opacity: 1, x: 0 }}
//       viewport={{ once: true, margin: '-100px' }}
//       className={`relative w-full md:w-96 ${
//         index % 2 === 0 ? 'md:mr-auto' : 'md:ml-auto'
//       }`}
//       style={{ marginTop }}
//     >
//       <div
//         className="bg-gradient-to-br from-blue-100 to-purple-100  rounded-xl p-6 md:p-8 relative overflow-hidden border border-blue-300/10"
//       >
//         <div className="relative z-10">
//           <div className="flex items-start justify-between mb-4">
//             <div className="bg-blue-100 rounded-lg p-3">
//               <div className="text-indigo-950 font-mono font-bold text-lg">
//                 {String(index + 1).padStart(2, '0')}
//               </div>
//             </div>
//             <Icon className="w-6 h-6 text-blue-400" />
//           </div>

//           <h3 className="text-black-300 text-class text-2xl md:text-4xl font-bold mb-3">{step}</h3>
//           <p className="text-black-100/90 text-class text-base md:text-xl leading-relaxed">
//             {description}
//           </p>
//         </div>
//       </div>
//       <div
//         className={`absolute top-1/2 -translate-y-1/2 text-black-400 ${
//           index % 2 === 0
//             ? 'hidden md:block md:right-[-200px]'
//             : 'hidden md:block md:left-[-200px]'
//         }`}
//       >
//         <AnimatedIllustration index={index} />
//       </div>
//     </motion.div>
//   );
// };

// const ScrollingBead: React.FC<{ progress: MotionValue<number> }> = ({ progress }) => {
//   const springProgress = useSpring(progress, {
//     stiffness: 100,
//     damping: 30,
//     restDelta: 0.001,
//   });

//   return (
//     <motion.div
//       className="w-4 h-4 bg-blue-400 rounded-full absolute left-1/2 -translate-x-1/2"
//       style={{ top: springProgress }}
//     />
//   );
// };

// const WorkingProcess: React.FC = () => {
//   const containerRef = useRef<HTMLDivElement>(null);
//   const [firstStepTop, setFirstStepTop] = useState(0);
//   const [lastStepBottom, setLastStepBottom] = useState(0);
//   const [margins, setMargins] = useState<number[]>([]);

//   const { scrollYProgress } = useScroll({
//     target: containerRef,
//     offset: ['start end', 'end start'],
//   });

//   const y = useTransform(scrollYProgress, [0, 1], [firstStepTop, lastStepBottom]);

//   const steps = [
//     {
//       step: 'Select your Ideal Interview',
//       description:
//         'Browse our catalog for a pre-set interview or customize one based on the job description you are targeting',
//       icon: Check,
//     },
//     {
//       step: 'Practice with Ava, our AI Interviewer',
//       description:
//         'Practice with role-specific questions, respond to insightful follow-up questions from Ava, our AI interviewer and receive instant, actionable feedback',
//       icon: MessageSquare,
//     },
//     {
//       step: 'Resume Review and 1:1 Coaching',
//       description:
//         'Level up your skills with our AI-powered builder and get the opportunity to dig deeper into your interview report through personalized sessions with our coaches',
//       icon: Search,
//     },
//     {
//       step: 'Land Your Dream Job',
//       description:
//         "Reach your goals with confidence through comprehensive preparation. We'll support you every step of the way",
//       icon: Award,
//     },
//   ];

//   useEffect(() => {
//     const updatePositions = () => {
//       const content = document.getElementById('process-content');
//       if (content) {
//         const steps = content.children;
//         if (steps.length > 0) {
//           const firstStep = steps[0].getBoundingClientRect();
//           const lastStep = steps[steps.length - 1].getBoundingClientRect();
//           const contentRect = content.getBoundingClientRect();

//           setFirstStepTop(firstStep.top - contentRect.top);
//           setLastStepBottom(lastStep.bottom - contentRect.top - 12);
//         }
//       }
//     };

//     updatePositions();
//     window.addEventListener('resize', updatePositions);
//     return () => window.removeEventListener('resize', updatePositions);
//   }, []);

//   return (
//     <section id="working-process">
//       <div className="min-h-screen py-16 px-4 md:px-12">
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="max-w-7xl mx-auto mb-16"
//         >
//           <h1 className="text-4xl md:text-6xl text-class font-bold text-indigo-950 flex items-center">
//             How it Works
//             <span className="ml-6 h-1 flex-grow bg-blue-400" />
//           </h1>
//         </motion.div>

//         <div ref={containerRef} className="max-w-7xl mx-auto relative">
//           <div className="absolute left-1/2 top-0 w-0.5 h-full bg-blue-400/20 hidden md:block" />
//           <div className="hidden md:block">
//             <ScrollingBead progress={y} />
//           </div>
//           <div id="process-content" className="relative flex flex-col gap-12">
//             {steps.map((step, index) => (
//               <ProcessStep
//                 key={index}
//                 {...step}
//                 index={index}
//                 marginTop={margins[index] || 0}
//               />
//             ))}
//           </div>
//         </div>
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 1 }}
//           className="mt-12 sm:mt-16 text-center"
//         >

//         </motion.div>
//       </div>
//     </section>
//   );
// };

// export default WorkingProcess;