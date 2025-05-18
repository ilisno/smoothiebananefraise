import React from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button'; // Using shadcn Button

const Index: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />

      <main className="flex-grow container mx-auto px-4 py-12 flex flex-col items-center justify-center text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
          Programme de musculation personnalisé, scientifique et facile à suivre
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl">
          Obtenez un programme d'entraînement sur mesure basé sur les dernières recherches scientifiques pour atteindre vos objectifs plus rapidement.
        </p>

        {/* Call To Action Button */}
        <Button
          asChild // Use asChild to render as a Link
          className="bg-sbf-yellow text-sbf-red hover:bg-sbf-red hover:text-sbf-yellow text-lg px-8 py-6 rounded-full font-semibold shadow-lg transition-colors duration-300"
        >
           <Link to="/programme">Créer mon programme</Link>
        </Button>

        {/* Optional: Testimonials or Advantages Section */}
        {/* <section className="mt-16 w-full max-w-4xl">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">Pourquoi nous choisir ?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-3">Scientifique</h3>
              <p className="text-gray-600">Programmes basés sur les dernières études.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-3">Personnalisé</h3>
              <p className="text-gray-600">Adapté à vos objectifs et votre niveau.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-3">Simple</h3>
              <p className="text-gray-600">Facile à suivre et à comprendre.</p>
            </div>
          </div>
        </section> */}
      </main>

      <Footer />
    </div>
  );
};

export default Index;