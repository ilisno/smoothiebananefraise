import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { DollarSign, Target, Clock, TrendingUp } from 'lucide-react'; // Import des icônes

const Index: React.FC = () => {
  const benefits = [
    {
      icon: <DollarSign className="h-8 w-8 text-primary mb-3" />,
      title: "ÉCONOMISEZ GROS",
      description: "L'efficacité d'un pro, le prix en moins.",
    },
    {
      icon: <Target className="h-8 w-8 text-primary mb-3" />,
      title: "SUR MESURE TOTAL",
      description: "Un programme unique, fait pour vous.",
    },
    {
      icon: <Clock className="h-8 w-8 text-primary mb-3" />,
      title: "LIBERTÉ MAXIMALE",
      description: "Entraînez-vous où et quand vous voulez.",
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-primary mb-3" />,
      title: "RÉSULTATS VISIBLES",
      description: "Progressez plus vite grâce à un plan optimisé.",
    },
  ];

  return (
    <>
      <Helmet>
        <title>Smoothie Banane Fraise - Tes Outils Musculation Gratuits</title>
        <meta name="description" content="accède à tous nos outils gratuits pour transformer ton physique : générateur de programme personnalisé, coach virtuel ia, blog avec conseils et articles, et ton espace personnel." />
        <meta name="keywords" content="musculation, fitness, programme musculation gratuit, coach virtuel, blog musculation, entraînement, nutrition, outils fitness gratuits, espace personnel musculation" />
      </Helmet>

      <div className="container mx-auto px-4 py-12 md:py-16 flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
        {/* Header section */}
        <header className="text-center md:text-left mb-12 md:mb-16 w-full max-w-6xl">
          {/* Content container (Text + Desktop Image) */}
          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-8">
            {/* Text container */}
            <div className="md:flex-1 md:pr-8">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-4">
                Tes outils pour
                <br />
                <span className="bg-primary text-primary-foreground px-3 py-1 rounded-lg inline-block mt-2">transformer ton physique</span>
              </h1>
              {/* Updated Subtitle */}
              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl md:max-w-none mx-auto md:mx-0">
                Obtenez votre programme de musculation personnalisé pour 10x moins cher qu'un coaching classique.
              </p>
            </div>

            {/* Desktop Image */}
            <div className="flex-shrink-0 mt-8 md:mt-0 w-48 md:w-64 lg:w-80 hidden md:block">
               <img
                src="/landingimg.png"
                alt="Illustration de personnes s'entraînant"
                className="w-full h-auto rounded-lg shadow-lg"
              />
            </div>
          </div>
        </header>

        {/* Single CTA Button */}
        <div className="w-full max-w-md text-center mb-12 md:mb-16"> {/* Container for the CTA */}
            {/* Changed structure: Link wraps Button */}
            <Link
              to="/generateur-programme"
              onClick={() => console.log('CTA Créer mon programme button clicked')}
              className="inline-block w-full" // Make the link a block element to contain the button's width
            >
              <Button
                size="lg"
                className="w-full py-8 text-xl font-bold border-4 border-yellow-400 hover:border-yellow-500 transition-colors" // Apply button styles directly
              >
                Créer mon programme
              </Button>
            </Link>
            {/* Added text below the button */}
            <p className="text-center text-sm text-muted-foreground mt-4">
                Résultats garantis, satisfait ou 100% remboursé
            </p>
        </div>

        {/* New Benefits Section */}
        <section className="w-full max-w-6xl text-center py-12 md:py-16 border-t"> {/* Added border-t for separation */}
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-8 md:mb-12">
                Le coaching réinventé, c'est surtout
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
                {benefits.map((benefit, index) => (
                    <div key={index} className="flex flex-col items-center text-center">
                        {benefit.icon}
                        <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                        <p className="text-muted-foreground">{benefit.description}</p>
                    </div>
                ))}
            </div>
        </section>


        {/* Mobile Background Element with Parallax - Moved here */}
        {/* It's now a block element below the grid, visible only on max-md */}
        <div
          className="w-full h-64 bg-cover bg-center bg-fixed z-0 max-md:block hidden mt-12 rounded-lg overflow-hidden" // Added mt-12, rounded-lg, overflow-hidden
          style={{ backgroundImage: "url('/landingimg.png')" }} // Set the background image
        ></div>


        {/* le bouton flottant du coach virtuel est géré dans app.tsx */}

      </div>
    </>
  );
};

export default Index;