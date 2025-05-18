import React from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button'; // Using shadcn Button
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Using shadcn Card

const Index: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />

      <main className="flex-grow container mx-auto px-4 py-12 flex flex-col items-center justify-center text-center">
        {/* Main Heading and Subtitle */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
          Tes outils pour <br className="hidden md:block"/>
          <span className="bg-sbf-red text-white px-3 py-1 rounded-md inline-block mt-2 md:mt-0">
            transformer ton physique
          </span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl">
          Obtenez votre programme de musculation personnalisé pour 10x moins cher qu'un coaching classique.
        </p>

        {/* Placeholder for Illustration */}
        {/* <div className="mb-8">[Illustration de personnes s'entraînant]</div> */}

        {/* Call To Action Button */}
        <Button
          asChild // Use asChild to render as a Link
          className="bg-sbf-yellow text-sbf-red hover:bg-sbf-red hover:text-sbf-yellow text-lg px-8 py-6 rounded-full font-semibold shadow-lg transition-colors duration-300"
        >
           <Link to="/programme">Créer mon programme</Link>
        </Button>

        {/* Guarantee Text */}
        <p className="mt-4 text-gray-600 text-sm italic">
          Résultats garantis, satisfait ou 100% remboursé
        </p>

        {/* Benefits Section */}
        <section className="mt-16 w-full max-w-4xl">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">
            Le coaching réinventé, c'est surtout
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-white shadow-md">
              <CardHeader>
                <CardTitle className="text-sbf-red text-xl">ÉCONOMISEZ GROS</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">L'efficacité d'un pro, le prix en moins.</p>
              </CardContent>
            </Card>
            <Card className="bg-white shadow-md">
              <CardHeader>
                <CardTitle className="text-sbf-red text-xl">SUR MESURE TOTAL</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Un programme unique, fait pour vous.</p>
              </CardContent>
            </Card>
            <Card className="bg-white shadow-md">
              <CardHeader>
                <CardTitle className="text-sbf-red text-xl">LIBERTÉ MAXIMALE</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Entraînez-vous où et quand vous voulez.</p>
              </CardContent>
            </Card>
            <Card className="bg-white shadow-md">
              <CardHeader>
                <CardTitle className="text-sbf-red text-xl">RÉSULTATS VISIBLES</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Progressez plus vite grâce à un plan optimisé.</p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;