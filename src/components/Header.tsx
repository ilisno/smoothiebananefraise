import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button'; // Pour un style cohérent si besoin

const Header: React.FC = () => {
  return (
    <header className="bg-background border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="text-lg font-semibold hover:text-primary transition-colors">
          Smoothie Banane Fraise 🍌🍓
        </Link>
        <nav className="flex items-center space-x-4">
          {/* Le bouton "Générateur" a été supprimé car le logo/titre principal y mène déjà */}
          <Button variant="ghost" asChild>
            <Link to="/blog">Blog</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
};

export default Header;