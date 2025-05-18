import React from 'react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <header className="bg-white text-gray-800 p-4 shadow-md border-b border-gray-200"> {/* Changed background and text color, added border */}
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo with Emojis */}
        <Link to="/" className="text-xl font-semibold flex items-center"> {/* Adjusted text size and weight, added flex for alignment */}
          smoothie banane fraise <span className="ml-2">🍌🍓</span> {/* Added emojis */}
        </Link>
        {/* Navigation Links */}
        <nav className="space-x-6"> {/* Added space between links */}
          <Link to="/" className="hover:underline">accueil</Link>
          <Link to="/programme" className="hover:underline">générateur de programme</Link>
          {/* Placeholder links for other pages */}
          <Link to="/coach-virtuel" className="hover:underline">coach virtuel</Link>
          <Link to="/blog" className="hover:underline">blog</Link>
          <Link to="/mon-espace" className="hover:underline">mon espace</Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;