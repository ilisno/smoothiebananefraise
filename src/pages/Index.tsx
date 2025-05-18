import React from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button'; // Using shadcn Button
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Using shadcn Card
import { DollarSign, Target, Clock, LineChart, Zap, Heart, Scale, Dumbbell, MessageSquare, Activity } from 'lucide-react'; // Importing icons

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
          // Updated classes for red background, white text, yellow border, and rounded corners
          className="bg-sbf-red text-white hover:bg-sbf-yellow hover:text-sbf-red text-lg px-8 py-6 rounded-md font-semibold shadow-lg transition-colors duration-300 border-2 border-sbf-yellow"
        >
           <Link to="/programme">Créer mon programme</Link>
        </Button>

        {/* Guarantee Text */}
        <p className="mt-4 text-gray-600 text-sm italic">
          Résultats garantis, satisfait ou <strong>100% remboursé</strong>
        </p>

        {/* Separator Line */}
        <hr className="w-full max-w-4xl my-12 border-gray-300" />

        {/* Benefits Section 1 (Kept as is, focuses on general advantages) */}
        <section className="mt-16 w-full max-w-4xl">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">
            Le coaching réinventé, c'est surtout
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-white shadow-md flex flex-col items-center text-center p-6"> {/* Added flex, items-center, text-center, p-6 */}
              <DollarSign size={40} className="text-sbf-red mb-3" /> {/* Added Icon */}
              <CardHeader className="p-0 mb-3"> {/* Adjusted padding */}
                <CardTitle className="text-gray-800 text-xl font-semibold">ÉCONOMISEZ GROS</CardTitle> {/* Changed text color */}
              </CardHeader>
              <CardContent className="p-0"> {/* Adjusted padding */}
                <p className="text-gray-600">L'efficacité d'un pro, le prix en moins.</p>
              </CardContent>
            </Card>
            <Card className="bg-white shadow-md flex flex-col items-center text-center p-6"> {/* Added flex, items-center, text-center, p-6 */}
              <Target size={40} className="text-sbf-red mb-3" /> {/* Added Icon */}
              <CardHeader className="p-0 mb-3"> {/* Adjusted padding */}
                <CardTitle className="text-gray-800 text-xl font-semibold">SUR MESURE TOTAL</CardTitle> {/* Changed text color */}
              </CardHeader>
              <CardContent className="p-0"> {/* Adjusted padding */}
                <p className="text-gray-600">Un programme unique, fait pour vous.</p>
              </CardContent>
            </Card>
            <Card className="bg-white shadow-md flex flex-col items-center text-center p-6"> {/* Added flex, items-center, text-center, p-6 */}
              <Clock size={40} className="text-sbf-red mb-3" /> {/* Added Icon */}
              <CardHeader className="p-0 mb-3"> {/* Adjusted padding */}
                <CardTitle className="text-gray-800 text-xl font-semibold">LIBERTÉ MAXIMALE</CardTitle> {/* Changed text color */}
              </CardHeader>
              <CardContent className="p-0"> {/* Adjusted padding */}
                <p className="text-gray-600">Entraînez-vous où et quand vous voulez.</p>
              </CardContent>
            </Card>
            <Card className="bg-white shadow-md flex flex-col items-center text-center p-6"> {/* Added flex, items-center, text-center, p-6 */}
              <LineChart size={40} className="text-sbf-red mb-3" /> {/* Added Icon */}
              <CardHeader className="p-0 mb-3"> {/* Adjusted padding */}
                <CardTitle className="text-gray-800 text-xl font-semibold">RÉSULTATS VISIBLES</CardTitle> {/* Changed text color */}
              </CardHeader>
              <CardContent className="p-0"> {/* Adjusted padding */}
                <p className="text-gray-600">Progressez plus vite grâce à un plan optimisé.</p>
              </CardContent>
            </Card>
          </div>
        </section>


        {/* Separator Line */}
        <hr className="w-full max-w-4xl my-12 border-gray-300" />

        {/* Features Section */}
        <section className="mt-16 w-full max-w-4xl text-center"> {/* Center align text */}
           <h2 className="text-3xl font-bold text-gray-800 mb-8">
             Nos Fonctionnalités Clés
           </h2>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8"> {/* Three columns on medium screens */}

             {/* Feature Card: Programme Generator */}
             <Card className="bg-white shadow-md flex flex-col items-center text-center p-6">
               <Dumbbell size={40} className="text-sbf-red mb-3" />
               <CardHeader className="p-0 mb-3">
                 <CardTitle className="text-gray-800 text-xl font-semibold">Générateur de Programme</CardTitle>
               </CardHeader>
               <CardContent className="p-0 flex-grow flex flex-col justify-between"> {/* Added flex-grow and justify-between */}
                 <p className="text-gray-600 text-sm mb-4">
                   Créez un programme d'entraînement 100% personnalisé en quelques clics, adapté à vos objectifs, votre niveau et votre matériel.
                 </p>
                 <Button asChild variant="outline" className="mt-auto text-sbf-red border-sbf-red hover:bg-sbf-red hover:text-white"> {/* Added mt-auto */}
                   <Link to="/programme">Créer mon programme</Link>
                 </Button>
               </CardContent>
             </Card>

             {/* Feature Card: Coach Virtuel */}
             <Card className="bg-white shadow-md flex flex-col items-center text-center p-6">
               <MessageSquare size={40} className="text-sbf-red mb-3" />
               <CardHeader className="p-0 mb-3">
                 <CardTitle className="text-gray-800 text-xl font-semibold">Coach Virtuel</CardTitle>
               </CardHeader>
               <CardContent className="p-0 flex-grow flex flex-col justify-between"> {/* Added flex-grow and justify-between */}
                 <p className="text-gray-600 text-sm mb-4">
                   Posez toutes vos questions sur la musculation, la nutrition ou l'entraînement à notre coach IA, disponible 24/7.
                 </p>
                 <Button asChild variant="outline" className="mt-auto text-sbf-red border-sbf-red hover:bg-sbf-red hover:text-white"> {/* Added mt-auto */}
                   <Link to="/coach-virtuel">Parler au coach</Link>
                 </Button>
               </CardContent>
             </Card>

             {/* Feature Card: Performance Tracking (Placeholder) */}
             <Card className="bg-white shadow-md flex flex-col items-center text-center p-6 opacity-60 cursor-not-allowed"> {/* Added opacity and cursor */}
               <Activity size={40} className="text-gray-500 mb-3" /> {/* Changed icon color */}
               <CardHeader className="p-0 mb-3">
                 <CardTitle className="text-gray-800 text-xl font-semibold">Suivi des Performances</CardTitle>
               </CardHeader>
               <CardContent className="p-0 flex-grow flex flex-col justify-between"> {/* Added flex-grow and justify-between */}
                 <p className="text-gray-600 text-sm mb-4">
                   Suivez vos progrès, enregistrez vos séances et visualisez votre évolution au fil du temps. (Bientôt disponible)
                 </p>
                 {/* Disabled button or placeholder */}
                 <Button variant="outline" className="mt-auto text-gray-500 border-gray-300" disabled> {/* Added mt-auto and disabled */}
                   Bientôt disponible
                 </Button>
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