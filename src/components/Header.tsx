import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react'; // Import icons

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-white text-gray-800 p-4 shadow-md border-b border-gray-200">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo with Emojis */}
        <Link to="/" className="text-xl font-semibold flex items-center z-20" onClick={closeMenu}> {/* Added z-20 to keep logo clickable above menu */}
          smoothie banane fraise <span className="ml-2">🍌🍓</span>
        </Link>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden z-20" // Show only on mobile, z-20 to be above menu
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex space-x-6"> {/* Hide on mobile, show on desktop */}
          <Link to="/" className="hover:underline">accueil</Link>
          <Link to="/programme" className="hover:underline">générateur de programme</Link>
          <Link to="/coach-virtuel" className="hover:underline">coach virtuel</Link>
          <Link to="/blog" className="hover:underline">blog</Link>
          <Link to="/mon-espace" className="hover:underline">mon espace</Link>
        </nav>
      </div>

      {/* Mobile Menu Panel */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-white z-10 flex flex-col items-center pt-16 space-y-6 md:hidden"> {/* Full screen overlay on mobile */}
           {/* Close button is now part of the header row */}
          <Link to="/" className="text-xl font-semibold" onClick={closeMenu}>accueil</Link>
          <Link to="/programme" className="text-xl font-semibold" onClick={closeMenu}>générateur de programme</Link>
          <Link to="/coach-virtuel" className="text-xl font-semibold" onClick={closeMenu}>coach virtuel</Link>
          <Link to="/blog" className="text-xl font-semibold" onClick={closeMenu}>blog</Link>
          <Link to="/mon-espace" className="text-xl font-semibold" onClick={closeMenu}>mon espace</Link>
        </div>
      )}
    </header>
  );
};

export default Header;