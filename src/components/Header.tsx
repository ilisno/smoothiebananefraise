import React from 'react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <header className="bg-sbf-red text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo Placeholder */}
        <Link to="/" className="text-2xl font-bold text-sbf-yellow">
          Smoothie<span className="text-white">Banana</span>Fraise
        </Link>
        {/* Navigation (placeholder for now) */}
        <nav>
          {/* <Link to="/programme" className="ml-4 hover:underline">Programme</Link>
          <Link to="/blog" className="ml-4 hover:underline">Blog</Link>
          <Link to="/chatbot" className="ml-4 hover:underline">Chatbot</Link> */}
        </nav>
      </div>
    </header>
  );
};

export default Header;