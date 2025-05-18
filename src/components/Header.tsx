import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import { Menu, X } from 'lucide-react'; // Import icons
import { usePopup } from '@/contexts/PopupContext'; // Import usePopup hook

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { showPopup, hidePopup } = usePopup(); // Use the popup hook
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

    showPopup({
      id: 'coach_virtuel_popup', // Unique ID for this popup
      title: "Accède à ton Coach Virtuel",
      description: "Discute avec notre IA pour obtenir des conseils personnalisés, des ajustements de programme, et des réponses à toutes tes questions fitness.",
      imageSrc: "/popup-placeholder-2.jpg", // Updated image source
      imageAlt: "Chatbot icon",
      primaryButtonText: "Découvrir la whey de qualité", // Example button from the image
      primaryButtonAction: () => {
         console.log("Primary button clicked from Coach Virtuel popup: Discover Whey -> https://go.nordvpn.net/aff_c?offer_id=15&aff_id=122852&url_id=1172");
         window.open('https://go.nordvpn.net/aff_c?offer_id=15&aff_id=122852&url_id=1172', '_blank');
         hidePopup();
      },
      secondaryButtonText: "Accéder au Coach Virtuel",
      secondaryButtonAction: () => {
         console.log("Secondary button clicked from Coach Virtuel popup: Navigate to Coach Virtuel");
         navigate('/coach-virtuel'); // Navigate to the Coach Virtuel page
         hidePopup();
      },
    });
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
          {/* Modified Link to trigger the popup */}
          <Link to="/coach-virtuel" className="hover:underline" onClick={handleCoachVirtuelClick}>coach virtuel</Link>
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
          {/* Modified Link to trigger the popup */}
          <Link to="/coach-virtuel" className="text-xl font-semibold" onClick={handleCoachVirtuelClick}>coach virtuel</Link>
          <Link to="/blog" className="text-xl font-semibold" onClick={closeMenu}>blog</Link>
          <Link to="/mon-espace" className="text-xl font-semibold" onClick={closeMenu}>mon espace</Link>
        </div>
      )}
    </header>
  );
};

export default Header;