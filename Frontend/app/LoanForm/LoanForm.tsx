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

      } catch (error: any) {
        setSubmitStatus({
          success: false,
          message: error.message || 'An error occurred while processing your application'
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

  return (
    <motion.div 
      className="loan-form-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <form onSubmit={handleSubmit} className="loan-form">
        <h2>Loan Application</h2>

        {submitStatus.message && (
          <div className={`status-message ${submitStatus.success ? 'success' : 'error'}`}>
            {submitStatus.message}
          </div>
        )}

        {/* Display prediction results */}
        {predictionResult && (
          <div className="prediction-results">
            <h3>Loan Approval Prediction Results</h3>
            <div className="approval-chance">
              <strong>Approval Chances: {predictionResult.approve_chances}%</strong>
            </div>
            <div className="shap-values">
              <h4>Key Influencing Factors:</h4>
              <ul>
                {Object.entries(predictionResult.shap_values).map(([factor, value]) => (
                  <li key={factor}>
                    {factor.replace(/_/g, ' ')}: {((value as number) * 100).toFixed(2)}% impact
                  </li>
                ))}
              </ul>
            </div>
            <div className="explanation">
              <h4>Explanation:</h4>
              <MarkdownRenderer content={predictionResult.reason} className="explanation-content" />
            </div>
          </div>
        )}

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
      </form>
    </motion.div>
  );
};

export default LoanApplicationForm;