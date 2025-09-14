"use client"
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { apiService, CIBILScoreData, CIBILScoreResponse } from '../services/api';
import MarkdownRenderer from '../components/MarkdownRenderer/MarkdownRenderer';
import './CibilForm.css';

interface CibilFormData {
  on_time_payments_percent: number | string;
  days_late_avg: number | string;
  utilization_percent: number | string;
  credit_age_years: number | string;
  num_secured_loans: number | string;
  num_unsecured_loans: number | string;
  has_credit_card: boolean;
  num_inquiries_6months: number | string;
  num_new_accounts_6months: number | string;
}

interface ValidationErrors {
  on_time_payments_percent?: string;
  days_late_avg?: string;
  utilization_percent?: string;
  credit_age_years?: string;
  num_secured_loans?: string;
  num_unsecured_loans?: string;
  num_inquiries_6months?: string;
  num_new_accounts_6months?: string;
}

const CibilScoreForm: React.FC = () => {
  const [formData, setFormData] = useState<CibilFormData>({
    on_time_payments_percent: 95,
    days_late_avg: 0,
    utilization_percent: 30,
    credit_age_years: 3,
    num_secured_loans: 0,
    num_unsecured_loans: 0,
    has_credit_card: false,
    num_inquiries_6months: 0,
    num_new_accounts_6months: 0,
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [cibilResult, setCibilResult] = useState<CIBILScoreResponse | null>(null);
  const [submitStatus, setSubmitStatus] = useState<{
    success?: boolean;
    message?: string;
  }>({});

  // Function to generate and download PDF report for CIBIL Score
  const generateAndDownloadCibilReport = async (cibilData: CIBILScoreResponse, formData: CibilFormData) => {
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

      // PDF Header
      addText('CIBIL SCORE ANALYSIS REPORT', 18, true, true);
      addText('NeuroCred Platform', 14, false, true);
      addSeparator();

      // Report Info
      addText(`Report Generated: ${date} at ${time}`, 10);
      addText('', 8); // Empty line
      addText('DISCLAIMER: This is an AI-powered analysis for educational purposes only. This is NOT an official CIBIL score. Consult with licensed financial institutions for actual credit reports.', 9, false, false);
      addSeparator();

      // CIBIL Score Summary
      addText('CIBIL SCORE SUMMARY', 14, true);
      addText(`Calculated CIBIL Score: ${cibilData['CIBIL Score']}`, 12, true);
      const scoreCategory = cibilData['CIBIL Score'] >= 750 ? 'EXCELLENT' : 
                           cibilData['CIBIL Score'] >= 650 ? 'GOOD' : 'NEEDS IMPROVEMENT';
      addText(`Score Category: ${scoreCategory}`, 11, true);
      addSeparator();

      // Input Details
      addText('INPUT DETAILS', 14, true);
      addText('Payment History:', 11, true);
      addText(`• On-Time Payments: ${getNumericValue(formData.on_time_payments_percent)}%`, 10);
      addText(`• Average Days Late: ${getNumericValue(formData.days_late_avg)} days`, 10);
      addText('', 8);
      addText('Credit Utilization:', 11, true);
      addText(`• Credit Utilization: ${getNumericValue(formData.utilization_percent)}%`, 10);
      addText('', 8);
      addText('Credit Profile:', 11, true);
      addText(`• Credit Age: ${getNumericValue(formData.credit_age_years)} years`, 10);
      addText(`• Secured Loans: ${getNumericValue(formData.num_secured_loans)}`, 10);
      addText(`• Unsecured Loans: ${getNumericValue(formData.num_unsecured_loans)}`, 10);
      addText(`• Has Credit Card: ${formData.has_credit_card ? 'Yes' : 'No'}`, 10);
      addText(`• Credit Inquiries (6 months): ${getNumericValue(formData.num_inquiries_6months)}`, 10);
      addText(`• New Accounts (6 months): ${getNumericValue(formData.num_new_accounts_6months)}`, 10);
      addSeparator();

      // Score Breakdown Analysis
      addText('SCORE BREAKDOWN ANALYSIS', 14, true);
      addText('Component-wise Impact on Your CIBIL Score:', 11, true);
      addText('', 8);

      const breakdown = Object.entries(cibilData.Breakdown)
        .map(([factor, value]) => ({
          factor: factor.replace(/_/g, ' ').toUpperCase(),
          percentage: ((value as number) * 100).toFixed(1),
          value: value as number
        }))
        .sort((a, b) => b.value - a.value);

      breakdown.forEach((item, index) => {
        addText(`${index + 1}. ${item.factor}`, 10, true);
        addText(`   Contribution: ${item.percentage}%`, 10);
        addText('', 6);
      });

      addSeparator();

      // Improvement Suggestions
      addText('IMPROVEMENT SUGGESTIONS', 14, true);
      const cleanedSuggestions = cleanMarkdown(cibilData.Suggestions);
      addText(cleanedSuggestions, 10);
      addSeparator();

      // Action Plan
      addText('RECOMMENDED ACTION PLAN', 14, true);
      addText('Based on your current score analysis:', 11, true);
      addText('', 8);
      addText('1. EDUCATIONAL PURPOSE: Use this analysis to understand credit scoring factors and their relative importance.', 10);
      addText('', 6);
      addText('2. FOCUS AREAS: Prioritize improving the components with the lowest contribution percentages.', 10);
      addText('', 6);
      addText('3. FINANCIAL PLANNING: Implement the improvement suggestions gradually over time.', 10);
      addText('', 6);
      addText('4. REAL CREDIT MONITORING: For actual credit scores, obtain official reports from authorized bureaus.', 10);
      addSeparator();

      // Legal Notice
      addText('LEGAL NOTICE', 14, true);
      addText('• This report is generated by an AI model for educational and simulation purposes', 10);
      addText('• This is NOT an official CIBIL score from credit bureaus', 10);
      addText('• Actual credit scores may vary based on bureau-specific algorithms and data', 10);
      addText('• Always consult with authorized credit bureaus for official credit reports', 10);
      addText('• NeuroCred is not a credit bureau or financial institution', 10);
      addText('', 10);
      addText(`Report ID: NeuroCred-CIBIL-${Date.now()}`, 9);
      addText('Generated by: NeuroCred AI Platform', 9);

      // Save the PDF
      doc.save(`cibil-score-analysis-${new Date().toISOString().split('T')[0]}.pdf`);
      
    } catch (error) {
      console.error('Error generating CIBIL PDF:', error);
      // Fallback to text download if PDF generation fails
      generateCibilTextReport(cibilData, formData);
    }
  };

  // Fallback text report function for CIBIL
  const generateCibilTextReport = (cibilData: CIBILScoreResponse, formData: CibilFormData) => {
    const reportContent = generateCibilReportContent(cibilData, formData);
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cibil-score-analysis-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Function to generate CIBIL report content
  const generateCibilReportContent = (cibilData: CIBILScoreResponse, formData: CibilFormData): string => {
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
        .replace(/^\s*\d+\.\s+/gm, (match, offset, string) => {
          const num = match.match(/\d+/)?.[0];
          return `${num}. `;
        }) // Clean numbered lists
        .replace(/\n{3,}/g, '\n\n')      // Remove excessive line breaks
        .trim();
    };

    const scoreCategory = cibilData['CIBIL Score'] >= 750 ? 'EXCELLENT' : 
                         cibilData['CIBIL Score'] >= 650 ? 'GOOD' : 'NEEDS IMPROVEMENT';

    return `
═══════════════════════════════════════════════════════════════════════════════
            CIBIL SCORE ANALYSIS REPORT - NeuroCred Platform
═══════════════════════════════════════════════════════════════════════════════

Report Generated: ${date} at ${time}

DISCLAIMER: This is an AI-powered analysis for educational purposes only. 
This is NOT an official CIBIL score. Consult with licensed financial 
institutions for actual credit reports.

═══════════════════════════════════════════════════════════════════════════════
                            CIBIL SCORE SUMMARY
═══════════════════════════════════════════════════════════════════════════════

Calculated CIBIL Score: ${cibilData['CIBIL Score']}
Score Category: ${scoreCategory}

═══════════════════════════════════════════════════════════════════════════════
                               INPUT DETAILS
═══════════════════════════════════════════════════════════════════════════════

Payment History:
• On-Time Payments: ${getNumericValue(formData.on_time_payments_percent)}%
• Average Days Late: ${getNumericValue(formData.days_late_avg)} days

Credit Utilization:
• Credit Utilization: ${getNumericValue(formData.utilization_percent)}%

Credit Profile:
• Credit Age: ${getNumericValue(formData.credit_age_years)} years
• Secured Loans: ${getNumericValue(formData.num_secured_loans)}
• Unsecured Loans: ${getNumericValue(formData.num_unsecured_loans)}
• Has Credit Card: ${formData.has_credit_card ? 'Yes' : 'No'}
• Credit Inquiries (6 months): ${getNumericValue(formData.num_inquiries_6months)}
• New Accounts (6 months): ${getNumericValue(formData.num_new_accounts_6months)}

═══════════════════════════════════════════════════════════════════════════════
                          SCORE BREAKDOWN ANALYSIS
═══════════════════════════════════════════════════════════════════════════════

Component-wise Impact on Your CIBIL Score:

${Object.entries(cibilData.Breakdown)
  .map(([factor, value]) => ({
    factor: factor.replace(/_/g, ' ').toUpperCase(),
    percentage: ((value as number) * 100).toFixed(1),
    value: value as number
  }))
  .sort((a, b) => b.value - a.value)
  .map((item, index) => 
    `${index + 1}. ${item.factor}
   Contribution: ${item.percentage}%
`).join('\n')}

═══════════════════════════════════════════════════════════════════════════════
                            IMPROVEMENT SUGGESTIONS
═══════════════════════════════════════════════════════════════════════════════

${cleanMarkdown(cibilData.Suggestions)}

═══════════════════════════════════════════════════════════════════════════════
                           RECOMMENDED ACTION PLAN
═══════════════════════════════════════════════════════════════════════════════

Based on your current score analysis:

1. EDUCATIONAL PURPOSE: Use this analysis to understand credit scoring factors 
   and their relative importance.

2. FOCUS AREAS: Prioritize improving the components with the lowest contribution 
   percentages.

3. FINANCIAL PLANNING: Implement the improvement suggestions gradually over time.

4. REAL CREDIT MONITORING: For actual credit scores, obtain official reports 
   from authorized bureaus.

═══════════════════════════════════════════════════════════════════════════════
                                   LEGAL NOTICE
═══════════════════════════════════════════════════════════════════════════════

• This report is generated by an AI model for educational and simulation purposes
• This is NOT an official CIBIL score from credit bureaus
• Actual credit scores may vary based on bureau-specific algorithms and data
• Always consult with authorized credit bureaus for official credit reports
• NeuroCred is not a credit bureau or financial institution

Report ID: NeuroCred-CIBIL-${Date.now()}
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

    // On-time payments validation
    const onTimePayments = getNumericValue(formData.on_time_payments_percent);
    if (onTimePayments < 0 || onTimePayments > 100) {
      newErrors.on_time_payments_percent = 'On-time payments percentage must be between 0 and 100';
    }

    // Days late validation
    const daysLate = getNumericValue(formData.days_late_avg);
    if (daysLate < 0) {
      newErrors.days_late_avg = 'Average days late cannot be negative';
    }

    // Credit utilization validation
    const utilization = getNumericValue(formData.utilization_percent);
    if (utilization < 0 || utilization > 100) {
      newErrors.utilization_percent = 'Credit utilization must be between 0 and 100%';
    }

    // Credit age validation
    const creditAge = getNumericValue(formData.credit_age_years);
    if (creditAge < 0) {
      newErrors.credit_age_years = 'Credit age cannot be negative';
    }

    // Loans validation
    const securedLoans = getNumericValue(formData.num_secured_loans);
    if (securedLoans < 0) {
      newErrors.num_secured_loans = 'Number of secured loans cannot be negative';
    }

    const unsecuredLoans = getNumericValue(formData.num_unsecured_loans);
    if (unsecuredLoans < 0) {
      newErrors.num_unsecured_loans = 'Number of unsecured loans cannot be negative';
    }

    // Inquiries validation
    const inquiries = getNumericValue(formData.num_inquiries_6months);
    if (inquiries < 0) {
      newErrors.num_inquiries_6months = 'Number of inquiries cannot be negative';
    }

    // New accounts validation
    const newAccounts = getNumericValue(formData.num_new_accounts_6months);
    if (newAccounts < 0) {
      newErrors.num_new_accounts_6months = 'Number of new accounts cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setIsLoading(true);
      setCibilResult(null);
      setSubmitStatus({});
      
      try {
        // Helper function to get numeric value
        const getNumericValue = (value: string | number): number => {
          return typeof value === 'string' ? parseFloat(value) || 0 : value;
        };

        const cibilData: CIBILScoreData = {
          on_time_payments_percent: getNumericValue(formData.on_time_payments_percent),
          days_late_avg: getNumericValue(formData.days_late_avg),
          utilization_percent: getNumericValue(formData.utilization_percent),
          credit_age_years: getNumericValue(formData.credit_age_years),
          num_secured_loans: getNumericValue(formData.num_secured_loans),
          num_unsecured_loans: getNumericValue(formData.num_unsecured_loans),
          has_credit_card: formData.has_credit_card,
          num_inquiries_6months: getNumericValue(formData.num_inquiries_6months),
          num_new_accounts_6months: getNumericValue(formData.num_new_accounts_6months),
        };

        const result = await apiService.calculateCIBILScore(cibilData);
        
        setCibilResult(result);
        setSubmitStatus({
          success: true,
          message: `CIBIL Score Calculated: ${result['CIBIL Score']}`
        });

      } catch (error: unknown) {
        setSubmitStatus({
          success: false,
          message: error instanceof Error ? error.message : 'An error occurred while calculating CIBIL score'
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const getScoreColor = (score: number) => {
    if (score >= 750) return '#66BB6A'; // Light Green
    if (score >= 650) return '#FF9800'; // Orange
    return '#F44336'; // Red
  };

  return (
    <motion.div 
      className="cibil-form-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <form onSubmit={handleSubmit} className="cibil-form">
        <h2>CIBIL Score Calculator</h2>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="on_time_payments_percent">On-time Payments (%)*</label>
            <input
              type="number"
              id="on_time_payments_percent"
              name="on_time_payments_percent"
              value={formData.on_time_payments_percent}
              onChange={handleInputChange}
              min="0"
              max="100"
              step="0.1"
              className={errors.on_time_payments_percent ? 'error' : ''}
              required
            />
            {errors.on_time_payments_percent && (
              <span className="error-message">{errors.on_time_payments_percent}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="days_late_avg">Average Days Late</label>
            <input
              type="number"
              id="days_late_avg"
              name="days_late_avg"
              value={formData.days_late_avg}
              onChange={handleInputChange}
              min="0"
              className={errors.days_late_avg ? 'error' : ''}
            />
            {errors.days_late_avg && (
              <span className="error-message">{errors.days_late_avg}</span>
            )}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="utilization_percent">Credit Utilization (%)*</label>
            <input
              type="number"
              id="utilization_percent"
              name="utilization_percent"
              value={formData.utilization_percent}
              onChange={handleInputChange}
              min="0"
              max="100"
              step="0.1"
              className={errors.utilization_percent ? 'error' : ''}
              required
            />
            {errors.utilization_percent && (
              <span className="error-message">{errors.utilization_percent}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="credit_age_years">Credit Age (Years)*</label>
            <input
              type="number"
              id="credit_age_years"
              name="credit_age_years"
              value={formData.credit_age_years}
              onChange={handleInputChange}
              min="0"
              step="0.1"
              className={errors.credit_age_years ? 'error' : ''}
              required
            />
            {errors.credit_age_years && (
              <span className="error-message">{errors.credit_age_years}</span>
            )}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="num_secured_loans">Secured Loans</label>
            <input
              type="number"
              id="num_secured_loans"
              name="num_secured_loans"
              value={formData.num_secured_loans}
              onChange={handleInputChange}
              min="0"
              className={errors.num_secured_loans ? 'error' : ''}
            />
            {errors.num_secured_loans && (
              <span className="error-message">{errors.num_secured_loans}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="num_unsecured_loans">Unsecured Loans</label>
            <input
              type="number"
              id="num_unsecured_loans"
              name="num_unsecured_loans"
              value={formData.num_unsecured_loans}
              onChange={handleInputChange}
              min="0"
              className={errors.num_unsecured_loans ? 'error' : ''}
            />
            {errors.num_unsecured_loans && (
              <span className="error-message">{errors.num_unsecured_loans}</span>
            )}
          </div>
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="has_credit_card"
              checked={formData.has_credit_card}
              onChange={handleInputChange}
            />
            I have a credit card
          </label>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="num_inquiries_6months">Credit Inquiries (Last 6 Months)</label>
            <input
              type="number"
              id="num_inquiries_6months"
              name="num_inquiries_6months"
              value={formData.num_inquiries_6months}
              onChange={handleInputChange}
              min="0"
              className={errors.num_inquiries_6months ? 'error' : ''}
            />
            {errors.num_inquiries_6months && (
              <span className="error-message">{errors.num_inquiries_6months}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="num_new_accounts_6months">New Accounts (Last 6 Months)</label>
            <input
              type="number"
              id="num_new_accounts_6months"
              name="num_new_accounts_6months"
              value={formData.num_new_accounts_6months}
              onChange={handleInputChange}
              min="0"
              className={errors.num_new_accounts_6months ? 'error' : ''}
            />
            {errors.num_new_accounts_6months && (
              <span className="error-message">{errors.num_new_accounts_6months}</span>
            )}
          </div>
        </div>

        <button 
          type="submit" 
          className="calculate-btn"
          disabled={isLoading}
        >
          {isLoading ? 'Calculating...' : 'Calculate CIBIL Score'}
        </button>

        {submitStatus.message && (
          <div className={`status-message ${submitStatus.success ? 'success' : 'error'}`} style={{ marginTop: '20px' }}>
            {submitStatus.message}
          </div>
        )}

        {/* Display CIBIL results */}
        {cibilResult && (
          <div className="cibil-results">
            <div 
              className="score-display"
              style={{ borderColor: getScoreColor(cibilResult['CIBIL Score']) }}
            >
              <div className="score-number" style={{ color: getScoreColor(cibilResult['CIBIL Score']) }}>
                {cibilResult['CIBIL Score']}
              </div>
              <div className="score-label">CIBIL Score</div>
            </div>
            
            <div className="breakdown">
              <h4>Score Breakdown:</h4>
              <div className="breakdown-items">
                {Object.entries(cibilResult.Breakdown).map(([factor, value]) => (
                  <div key={factor} className="breakdown-item">
                    <span className="factor-name">{factor.replace(/_/g, ' ')}</span>
                    <div className="factor-bar">
                      <div 
                        className="factor-fill" 
                        style={{ width: `${(value as number) * 100}%` }}
                      ></div>
                    </div>
                    <span className="factor-value">{((value as number) * 100).toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="suggestions">
              <h4>Improvement Suggestions:</h4>
              <MarkdownRenderer content={cibilResult.Suggestions} className="suggestions-content" />
            </div>
            
            {/* Download Report Button */}
            <div className="download-section">
              <motion.button
                type="button"
                onClick={() => generateAndDownloadCibilReport(cibilResult, formData)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="download-report-button"
              >
                📄 Download PDF Report
              </motion.button>
              <p className="download-note">
                Get a comprehensive PDF report with your CIBIL score analysis, breakdown, and improvement recommendations.
              </p>
            </div>
          </div>
        )}
      </form>
    </motion.div>
  );
};

export default CibilScoreForm;