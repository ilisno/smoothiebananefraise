import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const ProgrammeGenerator: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Générateur de Programme</h1>
        <p className="text-gray-600">Cette page est en cours de construction. Ici, vous pourrez créer votre programme personnalisé.</p>
        {/* Future form and logic will go here */}
      </main>
      <Footer />
    </div>
  );
};

export default ProgrammeGenerator;