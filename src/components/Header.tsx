import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'; 
import { Menu, Home, MessageCircle, BookOpen } from 'lucide-react'; 

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
          Smoothie Banane Fraise 🍌🍓
        </Link>
        
        {/* Navigation pour desktop */}
        <nav className="hidden md:flex items-center space-x-2">
          <Button variant="ghost" asChild>
            <Link to="/">Générateur de Programme</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link to="/chatbot-musculation">Coach IA</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link to="/blog">Blog</Link>
          </Button>
        </nav>

        {/* Menu hamburger pour mobile */}
        <div className="md:hidden">
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Ouvrir le menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle className="text-left">Menu</SheetTitle>
              </SheetHeader>
              <div className="grid gap-4 py-4">
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => handleNavigation('/')}
                >
                  <Home className="mr-2 h-4 w-4" />
                  Générateur de Programme
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => handleNavigation('/chatbot-musculation')}
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Coach IA
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => handleNavigation('/blog')}
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  Blog
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