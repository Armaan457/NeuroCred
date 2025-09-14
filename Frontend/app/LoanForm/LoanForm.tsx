"use client"
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { apiService, LoanApplicationData, LoanPredictionResponse } from '../services/api';
import MarkdownRenderer from '../components/MarkdownRenderer/MarkdownRenderer';
import './LoanForm.css';

interface LoanFormData {
  no_of_dependents: number | string;
  education: string;
  self_employed: boolean;
  income_annum: number | string;
  loan_amount: number | string;
  loan_term: number | string;
  cibil_score: number | string;
}

interface ValidationErrors {
  no_of_dependents?: string;
  education?: string;
  income_annum?: string;
  loan_amount?: string;
  loan_term?: string;
  cibil_score?: string;
}

const LoanApplicationForm: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<LoanFormData>({
    no_of_dependents: 0,
    education: '',
    self_employed: false,
    income_annum: 0,
    loan_amount: 0,
    loan_term: 0,
    cibil_score: 0,
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    success?: boolean;
    message?: string;
  }>({});
  const [predictionResult, setPredictionResult] = useState<LoanPredictionResponse | null>(null);

  const educationOptions = [
    'Not Graduate',
    'Graduate',
    'Post Graduate',
    'Professional'
  ];

  useEffect(() => {
    // Check if user is authenticated - for now, skip authentication check
    // const token = localStorage.getItem('token');
    // if (!token) {
    //   router.push('/Login');
    // }
  }, [router]);

  // Function to generate and download PDF report
  const generateAndDownloadReport = async (predictionData: LoanPredictionResponse, formData: LoanFormData) => {
    try {
      // Import jsPDF dynamically to avoid SSR issues
      const { jsPDF } = await import('jspdf');
      
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      const margin = 20;
      const maxWidth = pageWidth - (margin * 2);
      let yPosition = margin;

      // Helper function to add text with automatic wrapping and page breaks
      const addText = (text: string, fontSize: number = 10, isBold: boolean = false, isCenter: boolean = false) => {
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', isBold ? 'bold' : 'normal');
        
        const lines = doc.splitTextToSize(text, maxWidth);
        
        // Check if we need a new page
        if (yPosition + (lines.length * fontSize * 0.5) > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
        }
        
        lines.forEach((line: string) => {
          const x = isCenter ? (pageWidth - doc.getTextWidth(line)) / 2 : margin;
          doc.text(line, x, yPosition);
          yPosition += fontSize * 0.5;
        });
        
        yPosition += 5; // Add some spacing after text
      };

      // Helper function to add a section separator
      const addSeparator = () => {
        yPosition += 5;
        doc.setDrawColor(0, 0, 0);
        doc.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 10;
      };

      // Generate PDF content
      const date = new Date().toLocaleDateString();
      const time = new Date().toLocaleTimeString();
      
      // Helper function to get numeric value
      const getNumericValue = (value: string | number): number => {
        return typeof value === 'string' ? parseFloat(value) || 0 : value;
      };

      // Helper function to clean markdown formatting
      const cleanMarkdown = (text: string): string => {
        return text
          .replace(/\*\*(.*?)\*\*/g, '$1')
          .replace(/\*(.*?)\*/g, '$1')
          .replace(/#{1,6}\s/g, '')
          .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
          .replace(/`([^`]+)`/g, '$1')
          .replace(/^\s*[-*+]\s+/gm, '• ')
          .replace(/^\s*\d+\.\s+/gm, (match) => {
            const num = match.match(/\d+/)?.[0];
            return `${num}. `;
          })
          .replace(/\n{3,}/g, '\n\n')
          .trim();
      };

      const maxAbsValue = Math.max(...Object.values(predictionData.shap_values).map(v => Math.abs(v as number)));
      
      const getImpactLevel = (relativeImpact: number, rawValue: number) => {
        if (rawValue === 0) return 'None';
        
        let level = '';
        if (relativeImpact < 0.01) level = 'Minimal';
        else if (relativeImpact >= 0.8) level = 'Very High';
        else if (relativeImpact >= 0.6) level = 'High';
        else if (relativeImpact >= 0.4) level = 'Medium';
        else if (relativeImpact >= 0.2) level = 'Low';
        else level = 'Very Low';
        
        // Add positive/negative prefix
        const prefix = rawValue >= 0 ? '+' : '-';
        return `${prefix} ${level}`;
      };

      // PDF Header
      addText('LOAN PREDICTION REPORT', 18, true, true);
      addText('NeuroCred Platform', 14, false, true);
      addSeparator();

      // Report Info
      addText(`Report Generated: ${date} at ${time}`, 10);
      addText('', 8); // Empty line
      addText('DISCLAIMER: This is an AI-powered prediction for educational purposes only. This is NOT an official loan approval or rejection. Consult with licensed financial institutions for actual loan applications.', 9, false, false);
      addSeparator();

      // Prediction Summary
      addText('PREDICTION SUMMARY', 14, true);
      addText(`Approval Probability: ${predictionData.approve_chances}%`, 12, true);
      addText(`Prediction Status: ${predictionData.approve_chances >= 50 ? 'LIKELY APPROVED' : 'LIKELY REJECTED'}`, 11, true);
      addSeparator();

      // Application Details
      addText('APPLICATION DETAILS', 14, true);
      addText('Personal Information:', 11, true);
      addText(`• Number of Dependents: ${getNumericValue(formData.no_of_dependents)}`, 10);
      addText(`• Education Level: ${formData.education}`, 10);
      addText(`• Employment Type: ${formData.self_employed ? 'Self-Employed' : 'Employed'}`, 10);
      addText('', 8);
      addText('Financial Information:', 11, true);
      addText(`• Annual Income: ₹${getNumericValue(formData.income_annum).toLocaleString()}`, 10);
      addText(`• Loan Amount Requested: ₹${getNumericValue(formData.loan_amount).toLocaleString()}`, 10);
      addText(`• Loan Term: ${getNumericValue(formData.loan_term)} months`, 10);
      addText(`• CIBIL Score: ${getNumericValue(formData.cibil_score)}`, 10);
      addSeparator();

      // Factor Impact Analysis
      addText('FACTOR IMPACT ANALYSIS', 14, true);
      addText('Key Influencing Factors (ordered by impact):', 11, true);
      addText('', 8);

      const factors = Object.entries(predictionData.shap_values)
        .map(([factor, value]) => {
          const numValue = value as number;
          const relativeImpact = maxAbsValue > 0 ? Math.abs(numValue) / maxAbsValue : 0;
          const impactLevel = getImpactLevel(relativeImpact, numValue);
          return {
            factor: factor.replace(/_/g, ' ').toUpperCase(),
            level: impactLevel,
            relativeImpact
          };
        })
        .sort((a, b) => b.relativeImpact - a.relativeImpact);

      factors.forEach((item, index) => {
        addText(`${index + 1}. ${item.factor}`, 10, true);
        addText(`   Impact: ${item.level}`, 10);
        addText('', 6);
      });

      addSeparator();

      // Detailed Explanation
      addText('DETAILED EXPLANATION', 14, true);
      const cleanedExplanation = cleanMarkdown(predictionData.reason);
      addText(cleanedExplanation, 10);
      addSeparator();

      // Next Steps
      addText('NEXT STEPS', 14, true);
      addText('Based on this prediction analysis:', 11, true);
      addText('', 8);
      addText('1. EDUCATIONAL PURPOSE: Use this analysis to understand how lending decisions might be influenced by various financial factors.', 10);
      addText('', 6);
      addText('2. IMPROVEMENT AREAS: Focus on the factors marked with "-" (negative impact) to potentially improve your financial profile.', 10);
      addText('', 6);
      addText('3. FINANCIAL PLANNING: Consider the recommendations provided in the detailed explanation section.', 10);
      addText('', 6);
      addText('4. REAL APPLICATIONS: For actual loan applications, contact licensed financial institutions and provide accurate, up-to-date information.', 10);
      addSeparator();

      // Legal Notice
      addText('LEGAL NOTICE', 14, true);
      addText('• This report is generated by an AI model for educational and simulation purposes', 10);
      addText('• This is NOT a guarantee of loan approval or rejection from any financial institution', 10);
      addText('• Results may vary based on actual lender criteria and current market conditions', 10);
      addText('• Always consult with qualified financial advisors for real financial decisions', 10);
      addText('• NeuroCred is not a licensed financial institution or lender', 10);
      addText('', 10);
      addText(`Report ID: NeuroCred-${Date.now()}`, 9);
      addText('Generated by: NeuroCred AI Platform', 9);

      // Save the PDF
      doc.save(`loan-prediction-report-${new Date().toISOString().split('T')[0]}.pdf`);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      // Fallback to text download if PDF generation fails
      generateTextReport(predictionData, formData);
    }
  };

  // Fallback text report function
  const generateTextReport = (predictionData: LoanPredictionResponse, formData: LoanFormData) => {
    const reportContent = generateReportContent(predictionData, formData);
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `loan-prediction-report-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Function to generate report content
  const generateReportContent = (predictionData: LoanPredictionResponse, formData: LoanFormData): string => {
    const date = new Date().toLocaleDateString();
    const time = new Date().toLocaleTimeString();
    
    // Helper function to get numeric value
    const getNumericValue = (value: string | number): number => {
      return typeof value === 'string' ? parseFloat(value) || 0 : value;
    };

    // Helper function to clean markdown formatting
    const cleanMarkdown = (text: string): string => {
      return text
        .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold formatting
        .replace(/\*(.*?)\*/g, '$1')     // Remove italic formatting
        .replace(/#{1,6}\s/g, '')        // Remove headers
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Convert links to text
        .replace(/`([^`]+)`/g, '$1')     // Remove code formatting
        .replace(/^\s*[-*+]\s+/gm, '• ') // Convert bullet points
        .replace(/^\s*\d+\.\s+/gm, (match) => {
          const num = match.match(/\d+/)?.[0];
          return `${num}. `;
        }) // Clean numbered lists
        .replace(/\n{3,}/g, '\n\n')      // Remove excessive line breaks
        .trim();
    };

    const maxAbsValue = Math.max(...Object.values(predictionData.shap_values).map(v => Math.abs(v as number)));
    
    const getImpactLevel = (relativeImpact: number, rawValue: number) => {
      if (rawValue === 0) return 'None';
      
      let level = '';
      if (relativeImpact < 0.01) level = 'Minimal';
      else if (relativeImpact >= 0.8) level = 'Very High';
      else if (relativeImpact >= 0.6) level = 'High';
      else if (relativeImpact >= 0.4) level = 'Medium';
      else if (relativeImpact >= 0.2) level = 'Low';
      else level = 'Very Low';
      
      // Add positive/negative prefix
      const prefix = rawValue >= 0 ? '+' : '-';
      return `${prefix} ${level}`;
    };

    return `
═══════════════════════════════════════════════════════════════════════════════
                LOAN PREDICTION REPORT -  NeuroCred Platform
═══════════════════════════════════════════════════════════════════════════════

Report Generated: ${date} at ${time}

DISCLAIMER: This is an AI-powered prediction for educational purposes only. 
This is NOT an official loan approval or rejection. Consult with licensed 
financial institutions for actual loan applications.

═══════════════════════════════════════════════════════════════════════════════
                              PREDICTION SUMMARY
═══════════════════════════════════════════════════════════════════════════════

Approval Probability: ${predictionData.approve_chances}%
Prediction Status: ${predictionData.approve_chances >= 50 ? 'LIKELY APPROVED' : 'LIKELY REJECTED'}

═══════════════════════════════════════════════════════════════════════════════
                             APPLICATION DETAILS
═══════════════════════════════════════════════════════════════════════════════

Personal Information:
• Number of Dependents: ${getNumericValue(formData.no_of_dependents)}
• Education Level: ${formData.education}
• Employment Type: ${formData.self_employed ? 'Self-Employed' : 'Employed'}

Financial Information:
• Annual Income: ₹${getNumericValue(formData.income_annum).toLocaleString()}
• Loan Amount Requested: ₹${getNumericValue(formData.loan_amount).toLocaleString()}
• Loan Term: ${getNumericValue(formData.loan_term)} months
• CIBIL Score: ${getNumericValue(formData.cibil_score)}

═══════════════════════════════════════════════════════════════════════════════
                           FACTOR IMPACT ANALYSIS
═══════════════════════════════════════════════════════════════════════════════

Key Influencing Factors (ordered by impact):

${Object.entries(predictionData.shap_values)
  .map(([factor, value]) => {
    const numValue = value as number;
    const relativeImpact = maxAbsValue > 0 ? Math.abs(numValue) / maxAbsValue : 0;
    const impactLevel = getImpactLevel(relativeImpact, numValue);
    return {
      factor: factor.replace(/_/g, ' ').toUpperCase(),
      level: impactLevel,
      relativeImpact
    };
  })
  .sort((a, b) => b.relativeImpact - a.relativeImpact)
  .map((item, index) => 
    `${index + 1}. ${item.factor}
   Impact-> ${item.level}
`).join('\n')}

═══════════════════════════════════════════════════════════════════════════════
                              DETAILED EXPLANATION
═══════════════════════════════════════════════════════════════════════════════

${cleanMarkdown(predictionData.reason)}

═══════════════════════════════════════════════════════════════════════════════
                                  NEXT STEPS
═══════════════════════════════════════════════════════════════════════════════

Based on this prediction analysis:

1. EDUCATIONAL PURPOSE: Use this analysis to understand how lending decisions 
   might be influenced by various financial factors.

2. IMPROVEMENT AREAS: Focus on the factors marked with "-" (negative impact) to potentially 
   improve your financial profile.

3. FINANCIAL PLANNING: Consider the recommendations provided in the detailed 
   explanation section.

4. REAL APPLICATIONS: For actual loan applications, contact licensed financial 
   institutions and provide accurate, up-to-date information.

═══════════════════════════════════════════════════════════════════════════════
                                   LEGAL NOTICE
═══════════════════════════════════════════════════════════════════════════════

• This report is generated by an AI model for educational and simulation purposes
• This is NOT a guarantee of loan approval or rejection from any financial institution
• Results may vary based on actual lender criteria and current market conditions
• Always consult with qualified financial advisors for real financial decisions
• NeuroCred is not a licensed financial institution or lender

Report ID: NeuroCred-${Date.now()}
Generated by: NeuroCred Platform

End of Report
═══════════════════════════════════════════════════════════════════════════════
    `.trim();
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Helper function to get numeric value
    const getNumericValue = (value: string | number): number => {
      return typeof value === 'string' ? parseFloat(value) || 0 : value;
    };

    // Number of dependents validation
    const dependents = getNumericValue(formData.no_of_dependents);
    if (dependents < 0) {
      newErrors.no_of_dependents = 'Number of dependents cannot be negative';
    }

    // Education validation
    if (!formData.education) {
      newErrors.education = 'Education is required';
    }

    // Income validation
    const income = getNumericValue(formData.income_annum);
    if (income < 100000) {
      newErrors.income_annum = 'Annual income must be at least ₹1,00,000';
    }

    // Loan amount validation
    const loanAmount = getNumericValue(formData.loan_amount);
    if (loanAmount < 10000) {
      newErrors.loan_amount = 'Loan amount must be at least ₹10,000';
    }

    // Loan term validation
    const loanTerm = getNumericValue(formData.loan_term);
    if (loanTerm < 6 || loanTerm > 84) {
      newErrors.loan_term = 'Loan term must be between 6 and 84 months';
    }

    // CIBIL score validation
    const cibilScore = getNumericValue(formData.cibil_score);
    if (cibilScore < 300 || cibilScore > 900) {
      newErrors.cibil_score = 'CIBIL score must be between 300 and 900';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setIsLoading(true);
      setPredictionResult(null);
      setSubmitStatus({});
      
      try {
        // Helper function to get numeric value
        const getNumericValue = (value: string | number): number => {
          return typeof value === 'string' ? parseFloat(value) || 0 : value;
        };

        // Prepare data for ML prediction API
        const predictionData: LoanApplicationData = {
          no_of_dependents: getNumericValue(formData.no_of_dependents),
          education: formData.education,
          self_employed: formData.self_employed,
          income_annum: getNumericValue(formData.income_annum),
          loan_amount: getNumericValue(formData.loan_amount),
          loan_term: getNumericValue(formData.loan_term),
          cibil_score: getNumericValue(formData.cibil_score),
        };

        const result = await apiService.predictLoanApproval(predictionData);
        
        setPredictionResult(result);
        setSubmitStatus({
          success: true,
          message: `Loan Approval Prediction Complete! Approval Chances: ${result.approve_chances}%`
        });

      } catch (error: unknown) {
        setSubmitStatus({
          success: false,
          message: error instanceof Error ? error.message : 'An error occurred while processing your application'
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked 
        : type === 'number' 
          ? (value === '' ? '' : Number(value)) 
          : value
    }));

    // Clear error when user starts typing
    if (errors[name as keyof ValidationErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const getApprovalColor = (percentage: number) => {
    if (percentage >= 75) return '#66BB6A'; // Light Green
    if (percentage >= 50) return '#FF9800'; // Orange  
    if (percentage >= 25) return '#FFA726'; // Light Orange
    return '#F44336'; // Red
  };

  const getFactorColor = (value: number, allValues: number[]) => {
    const absValue = Math.abs(value);
    const maxAbsValue = Math.max(...allValues.map(v => Math.abs(v)));
    
    // Normalize the intensity based on the maximum absolute value (0 to 1)
    const intensity = maxAbsValue > 0 ? absValue / maxAbsValue : 0;
    
    if (value > 0) {
      // Positive values - Lighter green shades
      if (intensity >= 0.8) return '#4CAF50'; // Medium green (was dark)
      if (intensity >= 0.6) return '#66BB6A'; // Regular green
      if (intensity >= 0.4) return '#81C784'; // Light green
      if (intensity >= 0.2) return '#A5D6A7'; // Lighter green
      return '#C8E6C9'; // Very light green
    } else if (value < 0) {
      // Negative values - Lighter red shades
      if (intensity >= 0.8) return '#F44336'; // Medium red (was dark)
      if (intensity >= 0.6) return '#EF5350'; // Regular red
      if (intensity >= 0.4) return '#E57373'; // Light red
      if (intensity >= 0.2) return '#EF9A9A'; // Lighter red
      return '#FFCDD2'; // Very light red
    } else {
      // Zero or very close to zero - Neutral grey
      return '#9E9E9E';
    }
  };

  return (
    <motion.div 
      className="loan-form-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <form onSubmit={handleSubmit} className="loan-form">
        <h2>Loan Application</h2>

        <div className="form-group">
          <label htmlFor="no_of_dependents">Number of Dependents*</label>
          <input
            type="number"
            id="no_of_dependents"
            name="no_of_dependents"
            value={formData.no_of_dependents}
            onChange={handleInputChange}
            min="0"
            max="10"
            className={errors.no_of_dependents ? 'error' : ''}
            required
          />
          {errors.no_of_dependents && (
            <span className="error-message">{errors.no_of_dependents}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="education">Education*</label>
          <select
            id="education"
            name="education"
            value={formData.education}
            onChange={handleInputChange}
            className={errors.education ? 'error' : ''}
            required
          >
            <option value="">Select Education</option>
            {educationOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          {errors.education && (
            <span className="error-message">{errors.education}</span>
          )}
        </div>

        <div className="form-group checkbox-group">
          <label>
            <input
              type="checkbox"
              name="self_employed"
              checked={formData.self_employed}
              onChange={handleInputChange}
            />
            Self Employed
          </label>
        </div>

        <div className="form-group">
          <label htmlFor="income_annum">Annual Income (₹)*</label>
          <input
            type="number"
            id="income_annum"
            name="income_annum"
            value={formData.income_annum}
            onChange={handleInputChange}
            min="100000"
            className={errors.income_annum ? 'error' : ''}
            required
          />
          {errors.income_annum && (
            <span className="error-message">{errors.income_annum}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="loan_amount">Loan Amount (₹)*</label>
          <input
            type="number"
            id="loan_amount"
            name="loan_amount"
            value={formData.loan_amount}
            onChange={handleInputChange}
            min="10000"
            className={errors.loan_amount ? 'error' : ''}
            required
          />
          {errors.loan_amount && (
            <span className="error-message">{errors.loan_amount}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="loan_term">Loan Term (months)*</label>
          <input
            type="number"
            id="loan_term"
            name="loan_term"
            value={formData.loan_term}
            onChange={handleInputChange}
            min="6"
            max="84"
            className={errors.loan_term ? 'error' : ''}
            required
          />
          {errors.loan_term && (
            <span className="error-message">{errors.loan_term}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="cibil_score">CIBIL Score*</label>
          <input
            type="number"
            id="cibil_score"
            name="cibil_score"
            value={formData.cibil_score}
            onChange={handleInputChange}
            min="300"
            max="900"
            className={errors.cibil_score ? 'error' : ''}
            required
          />
          {errors.cibil_score && (
            <span className="error-message">{errors.cibil_score}</span>
          )}
        </div>

        <motion.button
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="submit-button"
          disabled={isLoading}
        >
          {isLoading ? 'Submitting...' : 'Submit Application'}
        </motion.button>

        {submitStatus.message && (
          <div className={`status-message ${submitStatus.success ? 'success' : 'error'}`} style={{ marginTop: '20px' }}>
            {submitStatus.message}
          </div>
        )}

        {/* Display prediction results */}
        {predictionResult && (
          <div className="prediction-results">
            <h3>Loan Approval Prediction Results</h3>
            <div 
              className="approval-chance"
              style={{ borderColor: getApprovalColor(predictionResult.approve_chances) }}
            >
              <div>
                <strong style={{ color: getApprovalColor(predictionResult.approve_chances) }}>
                  {predictionResult.approve_chances}%
                </strong>
                <div className="approval-chance-label">Approval Chances</div>
              </div>
            </div>
            <div className="shap-values">
              <h4>Key Influencing Factors:</h4>
              <div className="shap-items">
                {(() => {
                  const shapValues = Object.values(predictionResult.shap_values) as number[];
                  const maxAbsValue = Math.max(...shapValues.map(v => Math.abs(v)));
                  
                  return Object.entries(predictionResult.shap_values).map(([factor, value]) => {
                    const numValue = value as number;
                    const factorColor = getFactorColor(numValue, shapValues);
                    
                    // Method 1: Impact Score (0-100 scale based on relative importance)
                    const relativeImpact = maxAbsValue > 0 ? Math.abs(numValue) / maxAbsValue : 0;
                    // Use a minimum threshold to avoid showing 0 for very small but non-zero values
                    
                    // Method 3: Impact level description
                    const getImpactLevel = (relativeImpact: number, rawValue: number) => {
                      // Handle very small values differently
                      if (rawValue === 0) return 'None';
                      
                      let level = '';
                      if (relativeImpact < 0.01) level = 'Minimal';
                      else if (relativeImpact >= 0.8) level = 'Very High';
                      else if (relativeImpact >= 0.6) level = 'High';
                      else if (relativeImpact >= 0.4) level = 'Medium';
                      else if (relativeImpact >= 0.2) level = 'Low';
                      else level = 'Very Low';
                      
                      // Add positive/negative prefix
                      const prefix = rawValue >= 0 ? '+' : '-';
                      return `${prefix} ${level}`;
                    };
                    
                    return (
                      <div key={factor} className="shap-item">
                        <span className="factor-name">{factor.replace(/_/g, ' ')}</span>
                        <div 
                          className="factor-indicator"
                          style={{ backgroundColor: factorColor }}
                        ></div>
                        <span 
                          className="factor-value"
                          style={{ color: factorColor }}
                        >
                          {getImpactLevel(relativeImpact, numValue)}
                        </span>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
            <div className="explanation">
              <h4>Explanation:</h4>
              <MarkdownRenderer content={predictionResult.reason} className="explanation-content" />
            </div>
            
            {/* Download Report Button */}
            <div className="download-section">
              <motion.button
                type="button"
                onClick={() => generateAndDownloadReport(predictionResult, formData)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="download-report-button"
              >
                📄 Download PDF Report
              </motion.button>
              <p className="download-note">
                Get a comprehensive PDF report with your prediction results, factor analysis, and improvement recommendations.
              </p>
            </div>
          </div>
        )}
      </form>
    </motion.div>
  );
};

export default LoanApplicationForm;