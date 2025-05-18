import React from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button'; // Using shadcn Button
import { Card, CardContent, CardHeader, CardTitle, CardDescription as CardDescriptionShadcn, CardFooter } from '@/components/ui/card'; // Using shadcn Card, Added CardFooter
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'; // Using shadcn Accordion
import { DollarSign, Target, Clock, LineChart, ChevronRight, Quote } from 'lucide-react'; // Importing icons

const Index: React.FC = () => {
  // Placeholder Testimonials
  const testimonials = [
    {
      quote: "J'ai économisé une fortune et mes résultats n'ont jamais été aussi bons ! Le programme est vraiment adapté.",
      author: "Alex D.",
    },
    {
      quote: "Simple, rapide et efficace. J'adore la flexibilité et les conseils personnalisés.",
      author: "Sophie L.",
    },
    {
      quote: "Enfin un programme qui prend en compte mon matériel et mon emploi du temps chargé.",
      author: "Marc P.",
    },
  ];

  // Placeholder FAQ
  const faqItems = [
    {
      question: "Comment le programme est-il personnalisé ?",
      answer: "Notre générateur utilise les informations que vous fournissez (objectif, expérience, matériel, etc.) pour créer un plan d'entraînement unique et adapté à vos besoins.",
    },
    {
      question: "Est-ce vraiment moins cher qu'un coach ?",
      answer: "Oui, l'accès à notre générateur est proposé à un prix bien inférieur à celui d'un coaching individuel classique, tout en offrant une personnalisation poussée.",
    },
    {
      question: "Puis-je ajuster mon programme plus tard ?",
      answer: "Actuellement, le générateur crée un programme basé sur vos inputs. Pour des ajustements continus ou des conseils, notre Coach Virtuel sera bientôt disponible.",
    },
     {
      question: "Que se passe-t-il si je ne suis pas satisfait ?",
      answer: "Nous offrons une garantie 'satisfait ou 100% remboursé' car nous sommes confiants dans l'efficacité de nos programmes.",
    },
  ];


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
          Résultats garantis, satisfait ou 100% remboursé
        </p>

        {/* Separator Line */}
        <hr className="w-full max-w-4xl my-12 border-gray-300" />

        {/* Benefits Section */}
        <section className="mt-8 w-full max-w-4xl"> {/* Adjusted margin-top */}
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
            <Card className="bg-white shadow-md p-6 flex flex-col items-center text-center"> {/* Added flex, items-center, text-center, p-6 */}
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

        {/* How it Works Section */}
        <section className="mt-8 w-full max-w-4xl text-left">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
                Comment ça marche ?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="bg-white shadow-md p-6 flex flex-col items-center text-center">
                    <div className="flex items-center justify-center w-12 h-12 bg-sbf-yellow text-gray-800 rounded-full text-xl font-bold mb-4">1</div>
                    <CardTitle className="text-gray-800 text-xl font-semibold mb-3">Remplis le formulaire</CardTitle>
                    <CardDescriptionShadcn className="text-gray-600">
                        Indique tes objectifs, ton niveau, ton matériel et tes disponibilités.
                    </CardDescriptionShadcn>
                </Card>
                 <Card className="bg-white shadow-md p-6 flex flex-col items-center text-center">
                    <div className="flex items-center justify-center w-12 h-12 bg-sbf-yellow text-gray-800 rounded-full text-xl font-bold mb-4">2</div>
                    <CardTitle className="text-gray-800 text-xl font-semibold mb-3">Obtiens ton programme</CardTitle>
                    <CardDescriptionShadcn className="text-gray-600">
                        Notre IA génère instantanément un programme sur mesure pour 4 semaines.
                    </CardDescriptionShadcn>
                </Card>
                 <Card className="bg-white shadow-md p-6 flex flex-col items-center text-center">
                    <div className="flex items-center justify-center w-12 h-12 bg-sbf-yellow text-gray-800 rounded-full text-xl font-bold mb-4">3</div>
                    <CardTitle className="text-gray-800 text-xl font-semibold mb-3">Transforme ton physique</CardTitle>
                    <CardDescriptionShadcn className="text-gray-600">
                        Suis ton plan et constate des progrès rapides et durables.
                    </CardDescriptionShadcn>
                </Card>
            </div>
        </section>

         {/* Separator Line */}
        <hr className="w-full max-w-4xl my-12 border-gray-300" />

        {/* Testimonials Section */}
        <section className="mt-8 w-full max-w-4xl">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
                Ce que disent nos utilisateurs
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {testimonials.map((testimonial, index) => (
                    <Card key={index} className="bg-white shadow-md p-6 flex flex-col justify-between">
                        <CardContent className="p-0 mb-4 italic text-gray-700">
                            <Quote size={24} className="text-gray-400 mb-2" />
                            "{testimonial.quote}"
                        </CardContent>
                        <CardFooter className="p-0 text-right font-semibold text-gray-800">
                            - {testimonial.author}
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </section>

         {/* Separator Line */}
        <hr className="w-full max-w-4xl my-12 border-gray-300" />

        {/* FAQ Section */}
        <section className="mt-8 w-full max-w-3xl text-left"> {/* Centered and max-width */}
            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
                Questions Fréquentes
            </h2>
            <Accordion type="single" collapsible className="w-full">
                {faqItems.map((item, index) => (
                    <AccordionItem value={`faq-${index}`} key={index}>
                        <AccordionTrigger className="text-lg font-semibold text-gray-800 hover:no-underline">
                            {item.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-gray-700">
                            {item.answer}
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </section>

         {/* Separator Line */}
        <hr className="w-full max-w-4xl my-12 border-gray-300" />

        {/* Second Call To Action Button */}
         <Button
          asChild // Use asChild to render as a Link
          className="bg-sbf-red text-white hover:bg-sbf-yellow hover:text-sbf-red text-lg px-8 py-6 rounded-md font-semibold shadow-lg transition-colors duration-300 border-2 border-sbf-yellow mt-8" // Added margin-top
        >
           <Link to="/programme">Je veux mon programme personnalisé !</Link> {/* Slightly different text */}
        </Button>


      </main>

      <Footer />
    </div>
  );
};

export default Index;