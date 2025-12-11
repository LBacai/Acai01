import React, { useState, useEffect } from 'react';
import { Product, Addon, supabase } from '../../lib/supabase';
import { formatCurrency } from '../../lib/utils';
import { X, Plus, Minus, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number, addons: Addon[]) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({ product, isOpen, onClose, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);
  const [addons, setAddons] = useState<Addon[]>([]);
  const [selectedAddons, setSelectedAddons] = useState<Addon[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (product && isOpen) {
      fetchAddons(product.id);
      setQuantity(1);
      setSelectedAddons([]);
    }
  }, [product, isOpen]);

  const fetchAddons = async (productId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('product_addons')
        .select('addons(*)')
        .eq('product_id', productId);

      if (error) throw error;
      
      const availableAddons = data?.map((item: any) => item.addons) || [];
      setAddons(availableAddons);
    } catch (error) {
      console.error('Error fetching addons:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAddon = (addon: Addon) => {
    setSelectedAddons(prev => {
      const exists = prev.find(a => a.id === addon.id);
      if (exists) {
        return prev.filter(a => a.id !== addon.id);
      }
      return [...prev, addon];
    });
  };

  const handleAddToCart = () => {
    if (product) {
      onAddToCart(product, quantity, selectedAddons);
      onClose();
    }
  };

  const calculateTotal = () => {
    if (!product) return 0;
    const addonsTotal = selectedAddons.reduce((sum, addon) => sum + addon.price, 0);
    return (product.price + addonsTotal) * quantity;
  };

  if (!isOpen || !product) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />
        
        <motion.div 
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg bg-surface rounded-t-3xl sm:rounded-2xl overflow-hidden border border-white/10 max-h-[90vh] flex flex-col"
        >
          {/* Header Image */}
          <div className="relative h-48 sm:h-56 shrink-0">
            <img 
              src={product.image_url || 'https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/600x400/1a1a1a/FFF?text=Acai'} 
              alt={product.name}
              className="w-full h-full object-cover"
            />
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors backdrop-blur-md"
            >
              <X size={20} />
            </button>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-surface to-transparent h-24" />
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto flex-1">
            <div className="flex justify-between items-start mb-2">
              <h2 className="text-2xl font-bold text-white">{product.name}</h2>
              <span className="text-xl font-bold text-accent">{formatCurrency(product.price)}</span>
            </div>
            <p className="text-gray-400 mb-6">{product.description}</p>

            {/* Addons Section */}
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="animate-spin text-primary" />
              </div>
            ) : addons.length > 0 ? (
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">Adicionais</h3>
                <div className="space-y-3">
                  {addons.map(addon => {
                    const isSelected = selectedAddons.some(a => a.id === addon.id);
                    return (
                      <div 
                        key={addon.id}
                        onClick={() => toggleAddon(addon)}
                        className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                          isSelected 
                            ? 'bg-primary/10 border-primary' 
                            : 'bg-black/20 border-white/5 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                            isSelected ? 'border-primary bg-primary' : 'border-gray-500'
                          }`}>
                            {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                          </div>
                          <span className={isSelected ? 'text-white' : 'text-gray-400'}>{addon.name}</span>
                        </div>
                        <span className="text-accent font-medium">+{formatCurrency(addon.price)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>

          {/* Footer Actions */}
          <div className="p-4 bg-surface border-t border-white/10 shrink-0">
            <div className="flex items-center justify-between gap-4 mb-4">
              <span className="text-gray-400">Quantidade</span>
              <div className="flex items-center gap-4 bg-black/20 rounded-lg p-1">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 hover:text-primary transition-colors"
                >
                  <Minus size={18} />
                </button>
                <span className="text-white font-bold w-6 text-center">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 hover:text-primary transition-colors"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              className="w-full py-4 bg-accent hover:bg-accent-hover text-black font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <span>Adicionar ao Carrinho</span>
              <span className="bg-black/10 px-2 py-0.5 rounded text-sm">
                {formatCurrency(calculateTotal())}
              </span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
