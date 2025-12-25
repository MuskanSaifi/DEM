import React, { Suspense } from 'react';
import DashboardPage from './PageWrapper'; // 👈 Your actual client component

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardPage />
    </Suspense>
  );
}
