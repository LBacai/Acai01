import React, { useEffect, useState } from 'react';
import { supabase, Product, Category, Addon } from '../lib/supabase';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../lib/utils';
import { Plus, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { ProductModal } from '../components/product/ProductModal';

export const Menu = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Modal State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { addToCart } = useCart();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        supabase.from('products').select('*').eq('is_active', true),
        supabase.from('categories').select('*')
      ]);

      if (prodRes.data) setProducts(prodRes.data);
      if (catRes.data) setCategories(catRes.data);
    } catch (error) {
      console.error('Error fetching menu:', error);
    } finally {
      setLoading(false);
    }
  };

  const openProductModal = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleAddToCart = (product: Product, quantity: number, addons: Addon[]) => {
    addToCart(product, quantity, addons);
  };

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.category_id === selectedCategory);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-24 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Nosso Cardápio</h1>

        {/* Categories Filter */}
        <div className="flex overflow-x-auto gap-4 mb-8 pb-2 scrollbar-hide">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-6 py-2 rounded-full whitespace-nowrap transition-colors ${
              selectedCategory === 'all' 
                ? 'bg-primary text-white' 
                : 'bg-surface text-gray-400 hover:text-white'
            }`}
          >
            Todos
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-6 py-2 rounded-full whitespace-nowrap transition-colors ${
                selectedCategory === cat.id 
                  ? 'bg-primary text-white' 
                  : 'bg-surface text-gray-400 hover:text-white'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-surface rounded-2xl overflow-hidden border border-white/5 hover:border-primary/50 transition-all group"
            >
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={product.image_url || 'https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/600x400/1a1a1a/FFF?text=Acai'} 
                  alt={product.name}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent opacity-60" />
              </div>
              
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-white">{product.name}</h3>
                  <span className="text-accent font-bold">{formatCurrency(product.price)}</span>
                </div>
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">{product.description}</p>
                
                <button
                  onClick={() => openProductModal(product)}
                  className="w-full py-3 bg-white/5 hover:bg-primary hover:text-white text-gray-300 rounded-xl transition-colors flex items-center justify-center gap-2 font-medium"
                >
                  <Plus size={18} />
                  Adicionar
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <ProductModal 
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
};
