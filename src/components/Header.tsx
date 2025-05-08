import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Header: React.FC = () => {
  return (
    <header className="py-4 px-6 mb-8 border-b">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-primary hover:text-primary/90 transition-colors">
          Smoothie Banane Fraise 🍌🍓
        </Link>
        <nav>
          <Button asChild variant="default">
            <Link to="/blog">Blog</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
};

export default Header;