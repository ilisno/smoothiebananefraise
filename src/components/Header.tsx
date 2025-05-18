import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import { Menu, X } from 'lucide-react'; // Import icons
import { usePopup } from '@/contexts/PopupContext'; // Import usePopup hook
import { cn } from '@/lib/utils'; // Import cn utility for conditional classes

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { showRandomPopup } = usePopup(); // Use the showRandomPopup hook
  const navigate = useNavigate(); // Hook for navigation

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // Function to handle the click on the "coach virtuel" link
  const handleCoachVirtuelClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault(); // Prevent default navigation
    closeMenu(); // Close mobile menu if open

    // Define a callback function that navigates after the popup is closed
    const handlePopupCloseAndNavigate = () => {
        console.log("Popup closed, navigating to Coach Virtuel...");
        navigate('/coach-virtuel');
    };

    // Show a random popup. When it's closed, the callback will run.
    showRandomPopup({ onCloseCallback: handlePopupCloseAndNavigate });
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
          <Link to="/" className="hover:underline">Accueil</Link>
          <Link to="/programme" className="hover:underline">Générateur de programme</Link>
          {/* Modified Link to trigger the popup */}
          <Link to="/coach-virtuel" className="hover:underline" onClick={handleCoachVirtuelClick}>Coach virtuel</Link>
          <Link to="/blog" className="hover:underline">Blog</Link>
          <Link to="/mon-espace" className="hover:underline">Mon espace</Link>
        </nav>
      </div>

      {/* Mobile Menu Panel */}
      {/* Use cn utility for conditional classes for animation */}
      <div className={cn(
        "fixed inset-0 bg-white z-10 flex flex-col items-center pt-16 space-y-6 md:hidden",
        "transition-all duration-300 ease-in-out", // Transition properties
        isMenuOpen ? "opacity-100 translate-x-0 visible pointer-events-auto" : "opacity-0 translate-x-full invisible pointer-events-none" // States
      )}>
         {/* Close button is now part of the header row */}
        <Link to="/" className="text-xl font-semibold" onClick={closeMenu}>Accueil</Link>
        <Link to="/programme" className="text-xl font-semibold" onClick={closeMenu}>Générateur de programme</Link>
        {/* Modified Link to trigger the popup */}
        <Link to="/coach-virtuel" className="text-xl font-semibold" onClick={handleCoachVirtuelClick}>Coach virtuel</Link>
        <Link to="/blog" className="text-xl font-semibold" onClick={closeMenu}>Blog</Link>
        <Link to="/mon-espace" className="text-xl font-semibold" onClick={closeMenu}>Mon espace</Link>
      </div>
    </header>
  );
};

export default Header;