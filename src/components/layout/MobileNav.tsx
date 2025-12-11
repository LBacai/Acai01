import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Coffee, ShoppingBag, User } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { cn } from '../../lib/utils';

export const MobileNav = () => {
  const location = useLocation();
  const { count } = useCart();

  const links = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/menu', icon: Coffee, label: 'Cardápio' },
    { to: '/cart', icon: ShoppingBag, label: 'Carrinho', badge: count },
    { to: '/admin', icon: User, label: 'Perfil' },
  ];

  return (
    <div className="md:hidden fixed bottom-0 w-full bg-surface border-t border-white/10 z-50 pb-safe">
      <div className="flex justify-around items-center h-16">
        {links.map(({ to, icon: Icon, label, badge }) => {
          const isActive = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1",
                isActive ? "text-primary" : "text-gray-500"
              )}
            >
              <div className="relative">
                <Icon size={24} />
                {badge ? (
                  <span className="absolute -top-2 -right-2 bg-accent text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {badge}
                  </span>
                ) : null}
              </div>
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
