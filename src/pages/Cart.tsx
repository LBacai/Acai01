import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../lib/utils';
import { Trash2, Plus, Minus, ArrowRight } from 'lucide-react';

export const Cart = () => {
  const { items, updateQuantity, removeFromCart, total } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background pt-20 px-4 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center mb-6">
          <Trash2 className="w-10 h-10 text-gray-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Seu carrinho está vazio</h2>
        <p className="text-gray-400 mb-8">Que tal experimentar nosso açaí?</p>
        <Link 
          to="/menu"
          className="px-8 py-3 bg-primary text-white rounded-full font-medium hover:bg-primary-dark transition-colors"
        >
          Ver Cardápio
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-32 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Seu Pedido</h1>

        <div className="space-y-4 mb-8">
          {items.map((item) => (
            <div key={item.instanceId} className="bg-surface p-4 rounded-xl flex items-start gap-4 border border-white/5">
              <img 
                src={item.image_url} 
                alt={item.name}
                className="w-20 h-20 object-cover rounded-lg shrink-0"
              />
              
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-medium truncate">{item.name}</h3>
                <p className="text-accent font-bold mb-1">
                  {formatCurrency(item.price + item.selectedAddons.reduce((acc, add) => acc + add.price, 0))}
                </p>
                
                {item.selectedAddons.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {item.selectedAddons.map(addon => (
                      <span key={addon.id} className="text-xs bg-white/5 text-gray-400 px-2 py-0.5 rounded">
                        + {addon.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-3 bg-black/20 rounded-lg p-1">
                  <button 
                    onClick={() => updateQuantity(item.instanceId, item.quantity - 1)}
                    className="p-1 hover:text-red-400 transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="text-white w-4 text-center text-sm">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.instanceId, item.quantity + 1)}
                    className="p-1 hover:text-green-400 transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <button 
                  onClick={() => removeFromCart(item.instanceId)}
                  className="text-gray-500 hover:text-red-400 text-xs flex items-center gap-1"
                >
                  <Trash2 size={12} /> Remover
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-surface p-6 rounded-2xl border border-white/5 space-y-4">
          <div className="flex justify-between text-gray-400">
            <span>Subtotal</span>
            <span>{formatCurrency(total)}</span>
          </div>
          <div className="flex justify-between text-gray-400">
            <span>Taxa de Entrega</span>
            <span>A calcular</span>
          </div>
          <div className="h-px bg-white/10 my-4" />
          <div className="flex justify-between text-white text-xl font-bold">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>

          <Link 
            to="/checkout"
            className="w-full py-4 bg-accent hover:bg-accent-hover text-black font-bold rounded-xl transition-colors flex items-center justify-center gap-2 mt-6"
          >
            Finalizar Pedido
            <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    </div>
  );
};
