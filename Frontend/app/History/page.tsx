"use client"

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProtectedRoute from '../components/ProtectedRoute';
import Footer from '../components/Footer';
import MarkdownRenderer from '../components/MarkdownRenderer/MarkdownRenderer';
import { apiService, LoanHistoryItem, CIBILHistoryItem } from '../services/api';
import {
  FileText,
  CreditCard,
  Calendar,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Award
} from 'lucide-react';

export default function HistoryPage() {
  const [activeTab, setActiveTab] = useState<'loan' | 'cibil'>('loan');
  const [loanHistory, setLoanHistory] = useState<LoanHistoryItem[]>([]);
  const [cibilHistory, setCibilHistory] = useState<CIBILHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const fetchHistory = async () => {
    setLoading(true);
    setError('');
    try {
      const [loanRes, cibilRes] = await Promise.all([
        apiService.getLoanHistory().catch(() => ({ loan_history: [] })),
        apiService.getCibilHistory().catch(() => ({ cibil_history: [] }))
      ]);
      setLoanHistory(loanRes.loan_history || []);
      setCibilHistory(cibilRes.cibil_history || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch history';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      return date.toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch {
      return dateStr;
    }
  };

  const getCibilBadgeColor = (score: number) => {
    if (score >= 750) return 'bg-green-100 text-green-800 border-green-300';
    if (score >= 700) return 'bg-blue-100 text-blue-800 border-blue-300';
    if (score >= 650) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-red-100 text-red-800 border-red-300';
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <main className="flex-grow container mx-auto px-4 py-8 max-w-6xl">
          {/* Header section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Your History</h1>
              <p className="text-gray-600 mt-1">
                View previous loan prediction analysis and CIBIL score calculations
              </p>
            </div>
            <button
              onClick={fetchHistory}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 text-gray-700 font-medium transition"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-gray-200 mb-6 space-x-4">
            <button
              onClick={() => setActiveTab('loan')}
              className={`flex items-center gap-2 pb-3 px-2 font-semibold text-lg border-b-2 transition-all ${
                activeTab === 'loan'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <FileText className="w-5 h-5" />
              Loan Application History ({loanHistory.length})
            </button>
            <button
              onClick={() => setActiveTab('cibil')}
              className={`flex items-center gap-2 pb-3 px-2 font-semibold text-lg border-b-2 transition-all ${
                activeTab === 'cibil'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <CreditCard className="w-5 h-5" />
              CIBIL Score History ({cibilHistory.length})
            </button>
          </div>

          {/* Loading / Error States */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col justify-center items-center py-16 gap-3">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
              <p className="text-gray-500">Loading history records...</p>
            </div>
          ) : (
            <div>
              {/* Tab 1: Loan Application History */}
              {activeTab === 'loan' && (
                <div>
                  {loanHistory.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 shadow-sm">
                      <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-800">No Loan Predictions Yet</h3>
                      <p className="text-gray-500 mt-2">
                        Apply for loan eligibility predictions to see your history logged here.
                      </p>
                      <a
                        href="/LoanForm"
                        className="inline-block mt-6 px-6 py-2.5 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition"
                      >
                        Try Loan Prediction
                      </a>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {loanHistory.map((item) => {
                        const isApproved = item.outputs.approve_chances >= 50;
                        const isExpanded = !!expandedItems[item.id];

                        return (
                          <div
                            key={item.id}
                            className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden transition-all hover:shadow-md"
                          >
                            <div
                              onClick={() => toggleExpand(item.id)}
                              className="p-5 flex flex-col md:flex-row md:items-center justify-between cursor-pointer gap-4"
                            >
                              <div className="flex items-start gap-4">
                                <div
                                  className={`p-3 rounded-full flex-shrink-0 ${
                                    isApproved ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                  }`}
                                >
                                  {isApproved ? (
                                    <CheckCircle2 className="w-6 h-6" />
                                  ) : (
                                    <XCircle className="w-6 h-6" />
                                  )}
                                </div>
                                <div>
                                  <div className="flex items-center gap-3">
                                    <span className="font-bold text-lg text-gray-900">
                                      {item.outputs.approve_chances}% Approval Chance
                                    </span>
                                    <span
                                      className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                                        isApproved
                                          ? 'bg-green-50 text-green-700 border-green-200'
                                          : 'bg-red-50 text-red-700 border-red-200'
                                      }`}
                                    >
                                      {isApproved ? 'Likely Approved' : 'Risk Flagged'}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                                    <span className="flex items-center gap-1">
                                      <Calendar className="w-4 h-4" />
                                      {formatDate(item.created_at)}
                                    </span>
                                    <span>•</span>
                                    <span>
                                      Amount: ₹{Number(item.inputs.loan_amount).toLocaleString('en-IN')}
                                    </span>
                                    <span>•</span>
                                    <span>Term: {item.inputs.loan_term} months</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-3 justify-between md:justify-end">
                                <span className="text-sm font-medium text-purple-600">
                                  {isExpanded ? 'Hide Details' : 'View Details'}
                                </span>
                                {isExpanded ? (
                                  <ChevronUp className="w-5 h-5 text-purple-600" />
                                ) : (
                                  <ChevronDown className="w-5 h-5 text-purple-600" />
                                )}
                              </div>
                            </div>

                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.3 }}
                                  className="border-t border-gray-100 bg-gray-50 p-5"
                                >
                                  {/* Inputs Breakdown */}
                                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-purple-600" />
                                    Application Details
                                  </h4>
                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 bg-white p-4 rounded-xl border border-gray-200 text-sm">
                                    <div>
                                      <span className="text-gray-500 block">Annual Income</span>
                                      <span className="font-semibold text-gray-900">
                                        ₹{Number(item.inputs.income_annum).toLocaleString('en-IN')}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-gray-500 block">CIBIL Score</span>
                                      <span className="font-semibold text-gray-900">
                                        {item.inputs.cibil_score}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-gray-500 block">Dependents</span>
                                      <span className="font-semibold text-gray-900">
                                        {item.inputs.no_of_dependents}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-gray-500 block">Education</span>
                                      <span className="font-semibold text-gray-900">
                                        {item.inputs.education || 'N/A'}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-gray-500 block">Self Employed</span>
                                      <span className="font-semibold text-gray-900">
                                        {item.inputs.self_employed ? 'Yes' : 'No'}
                                      </span>
                                    </div>
                                  </div>

                                  {/* SHAP / Reason Explanation */}
                                  {item.outputs.reason && (
                                    <div className="bg-white p-5 rounded-xl border border-gray-200">
                                      <h4 className="font-semibold text-gray-800 mb-2">
                                        AI Explanation & SHAP Insights
                                      </h4>
                                      <MarkdownRenderer content={item.outputs.reason} />
                                    </div>
                                  )}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: CIBIL Score History */}
              {activeTab === 'cibil' && (
                <div>
                  {cibilHistory.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 shadow-sm">
                      <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-800">No CIBIL History Found</h3>
                      <p className="text-gray-500 mt-2">
                        Calculate your CIBIL score to store history records here.
                      </p>
                      <a
                        href="/CibilForm"
                        className="inline-block mt-6 px-6 py-2.5 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition"
                      >
                        Calculate CIBIL Score
                      </a>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {cibilHistory.map((item) => {
                        const score = item.outputs.cibil_score;
                        const isExpanded = !!expandedItems[item.id];

                        return (
                          <div
                            key={item.id}
                            className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden transition-all hover:shadow-md"
                          >
                            <div
                              onClick={() => toggleExpand(item.id)}
                              className="p-5 flex flex-col md:flex-row md:items-center justify-between cursor-pointer gap-4"
                            >
                              <div className="flex items-start gap-4">
                                <div className="p-3 bg-purple-100 text-purple-600 rounded-full flex-shrink-0">
                                  <Award className="w-6 h-6" />
                                </div>
                                <div>
                                  <div className="flex items-center gap-3">
                                    <span className="font-bold text-2xl text-gray-900">{score}</span>
                                    <span
                                      className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${getCibilBadgeColor(
                                        score
                                      )}`}
                                    >
                                      {score >= 750
                                        ? 'Excellent'
                                        : score >= 700
                                        ? 'Good'
                                        : score >= 650
                                        ? 'Fair'
                                        : 'Needs Attention'}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                                    <span className="flex items-center gap-1">
                                      <Calendar className="w-4 h-4" />
                                      {formatDate(item.created_at)}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-3 justify-between md:justify-end">
                                <span className="text-sm font-medium text-purple-600">
                                  {isExpanded ? 'Hide Suggestions' : 'View Breakdown & Tips'}
                                </span>
                                {isExpanded ? (
                                  <ChevronUp className="w-5 h-5 text-purple-600" />
                                ) : (
                                  <ChevronDown className="w-5 h-5 text-purple-600" />
                                )}
                              </div>
                            </div>

                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.3 }}
                                  className="border-t border-gray-100 bg-gray-50 p-5 space-y-4"
                                >
                                  {/* Score Breakdown */}
                                  {item.outputs.breakdown && (
                                    <div className="bg-white p-5 rounded-xl border border-gray-200">
                                      <h4 className="font-semibold text-gray-800 mb-3">
                                        Score Contribution Breakdown
                                      </h4>
                                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                        {Object.entries(item.outputs.breakdown).map(([key, val]) => (
                                          <div
                                            key={key}
                                            className="p-3 bg-gray-50 rounded-lg border border-gray-100 flex justify-between items-center"
                                          >
                                            <span className="text-sm text-gray-600 capitalize">
                                              {key.replace(/_/g, ' ')}
                                            </span>
                                            <span className="text-sm font-semibold text-gray-900">
                                              {val} pts
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* AI Suggestions */}
                                  {item.outputs.suggestions && (
                                    <div className="bg-white p-5 rounded-xl border border-gray-200">
                                      <h4 className="font-semibold text-gray-800 mb-2">
                                        Improvement Suggestions
                                      </h4>
                                      <MarkdownRenderer content={item.outputs.suggestions} />
                                    </div>
                                  )}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}
