"use client"; // Cette directive est nécessaire car le composant utilise des hooks (useState, useNavigate)

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Home, MessageCircle, BookOpen, User, Dumbbell } from 'lucide-react'; // ajout de l'icône dumbbell

const Header: React.FC = () => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsSheetOpen(false);
  };

  return (
    <header className="bg-background border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="text-lg font-semibold hover:text-primary transition-colors">
          smoothie banane fraise 🍌🍓
        </Link>

        {/* navigation pour desktop */}
        <nav className="hidden md:flex items-center space-x-2">
           <Button variant="ghost" asChild>
            <Link to="/">accueil</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link to="/generateur-programme">générateur de programme</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link to="/coach-virtuel">coach virtuel</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link to="/blog">blog</Link>
          </Button>
           <Button variant="ghost" asChild>
            <Link to="/espace-personnel">mon espace</Link>
          </Button>
        </nav>

        {/* menu hamburger pour mobile */}
        <div className="md:hidden">
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">ouvrir le menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle className="text-left">menu</SheetTitle>
              </SheetHeader>
              <div className="grid gap-4 py-4">
                 <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => handleNavigation('/')}
                >
                  <Home className="mr-2 h-4 w-4" />
                  accueil
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => handleNavigation('/generateur-programme')}
                >
                  <Dumbbell className="mr-2 h-4 w-4" />
                  générateur de programme
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => handleNavigation('/coach-virtuel')}
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  coach virtuel
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => handleNavigation('/blog')}
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  blog
                </Button>
                 <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => handleNavigation('/espace-personnel')}
                >
                  <User className="mr-2 h-4 w-4" />
                  mon espace
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;