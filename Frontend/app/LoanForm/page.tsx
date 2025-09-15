"use client"

import LoanForm from "./LoanForm"
import ProtectedRoute from '../components/ProtectedRoute';

export default function Home() {
  return (
    <ProtectedRoute>
      <LoanForm />
    </ProtectedRoute>
  );
}
