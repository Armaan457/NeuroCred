"use client"

import CibilScoreForm from './CibilForm';
import ProtectedRoute from '../components/ProtectedRoute';

export default function CibilPage() {
  return (
    <ProtectedRoute>
      <CibilScoreForm />
    </ProtectedRoute>
  );
}