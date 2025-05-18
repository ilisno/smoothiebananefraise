import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu } from 'lucide-react'; // Import the Menu icon

import { Button } from '@/components/ui/button'; // Import Button component
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose, // Import SheetClose to close the sheet on link click
} from '@/components/ui/sheet'; // Import Sheet components

const Header: React.FC = () => {
  const [isSheetOpen, setIsSheetOpen] = useState(false); // State to manage sheet open/close

  return (
    <header className="bg-white text-gray-800 p-4 shadow-md border-b border-gray-200">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo with Emojis */}
        <Link to="/" className="text-xl font-semibold flex items-center">
          smoothie banane fraise <span className="ml-2">🍌🍓</span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex space-x-6"> {/* Hide on mobile, show on md and up */}
          <Link to="/" className="hover:underline">accueil</Link>
          <Link to="/programme" className="hover:underline">générateur de programme</Link>
          <Link to="/coach-virtuel" className="hover:underline">coach virtuel</Link>
          <Link to="/blog" className="hover:underline">blog</Link>
          <Link to="/mon-espace" className="hover:underline">mon espace</Link>
        </nav>

        {/* Mobile Menu (Hamburger Icon) */}
        <div className="md:hidden"> {/* Show only on mobile */}
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            {/* Removed asChild={false} - using default behavior */}
            <SheetTrigger
              className="md:hidden" // Apply mobile visibility class directly here
              asChild={false} // Explicitly set asChild to false
              aria-label="Toggle Menu"
            >
              {/* Using Button component directly inside Trigger */}
              <Button variant="ghost" size="icon">
                 <Menu className="h-6 w-6" /> {/* Menu icon is now inside the Button */}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64 p-6"> {/* Sidebar content */}
              <nav className="flex flex-col space-y-4"> {/* Stack links vertically */}
                 <SheetClose asChild> {/* Close sheet when link is clicked */}
                    {/* Removed manual onClick */}
                    <Link to="/" className="text-lg font-medium hover:underline">accueil</Link>
                 </SheetClose>
                 <SheetClose asChild> {/* Close sheet when link is clicked */}
                    {/* Removed manual onClick */}
                    <Link to="/programme" className="text-lg font-medium hover:underline">générateur de programme</Link>
                 </SheetClose>
                 <SheetClose asChild> {/* Close sheet when link is clicked */}
                    {/* Removed manual onClick */}
                    <Link to="/coach-virtuel" className="text-lg font-medium hover:underline">coach virtuel</Link>
                 </SheetClose>
                 <SheetClose asChild> {/* Close sheet when link is clicked */}
                    {/* Removed manual onClick */}
                    <Link to="/blog" className="text-lg font-medium hover:underline">blog</Link>
                 </SheetClose>
                 <SheetClose asChild> {/* Close sheet when link is clicked */}
                    {/* Removed manual onClick */}
                    <Link to="/mon-espace" className="text-lg font-medium hover:underline">mon espace</Link>
                 </SheetClose>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;