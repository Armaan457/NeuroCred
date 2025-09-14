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

      } catch (error: any) {
        setSubmitStatus({
          success: false,
          message: error.message || 'An error occurred while calculating CIBIL score'
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
    if (score >= 750) return '#4CAF50'; // Green
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

        {submitStatus.message && (
          <div className={`status-message ${submitStatus.success ? 'success' : 'error'}`}>
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
          </div>
        )}

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
      </form>
    </motion.div>
  );
};

export default CibilScoreForm;