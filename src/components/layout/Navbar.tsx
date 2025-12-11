import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Menu as MenuIcon } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export const Navbar = () => {
  const { count } = useCart();

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-dark to-primary rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              Toledos
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-300 hover:text-white transition-colors">Home</Link>
            <Link to="/menu" className="text-gray-300 hover:text-white transition-colors">Cardápio</Link>
            <Link to="/admin" className="text-gray-300 hover:text-white transition-colors">Admin</Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link to="/cart" className="relative p-2 text-gray-300 hover:text-primary transition-colors">
              <ShoppingBag size={24} />
              {count > 0 && (
                <span className="absolute top-0 right-0 bg-accent text-black text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {count}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};
