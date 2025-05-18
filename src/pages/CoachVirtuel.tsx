import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const CoachVirtuel: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-12 text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Coach Virtuel</h1>
        <p className="text-xl text-gray-600">
          Cette page est un espace réservé pour la fonctionnalité Coach Virtuel.
          Le popup sera déclenché avant d'accéder à cette section.
        </p>
        {/* Future chatbot component will go here */}
      </main>
      <Footer />
    </div>
  );
};

export default CoachVirtuel;