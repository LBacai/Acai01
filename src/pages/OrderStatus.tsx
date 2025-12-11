import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { formatCurrency } from '../lib/utils';
import { Loader2, CheckCircle, Package, Truck, Clock, MapPin, Home, Receipt } from 'lucide-react';

type OrderDetails = {
  id: string;
  status: string;
  total: number;
  created_at: string;
  delivery_fee: number;
  address: {
    street: string;
    number: string;
    district: string;
  };
  items: {
    quantity: number;
    unit_price: number;
    extras: any; // JSONB
    product: {
      name: string;
      image_url: string;
    };
  }[];
};

const steps = [
  { id: 'pending', label: 'Recebido', icon: Clock },
  { id: 'preparing', label: 'Preparando', icon: Package },
  { id: 'delivery', label: 'Em Entrega', icon: Truck },
  { id: 'completed', label: 'Entregue', icon: CheckCircle },
];

export const OrderStatus = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchOrder();
      
      const subscription = supabase
        .channel(`order-${id}`)
        .on('postgres_changes', { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'orders', 
          filter: `id=eq.${id}` 
        }, (payload) => {
          setOrder(prev => prev ? { ...prev, status: payload.new.status } : null);
        })
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [id]);

  const fetchOrder = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          address:addresses(street, number, district),
          items:order_items(quantity, unit_price, extras, product:products(name, image_url))
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setOrder(data);
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentStepIndex = (status: string) => {
    const statusMap: Record<string, number> = {
      'pending': 0,
      'preparing': 1,
      'delivery': 2,
      'completed': 3,
      'cancelled': -1
    };
    return statusMap[status] ?? 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <h1 className="text-xl text-white mb-4">Pedido não encontrado</h1>
        <Link to="/" className="text-primary hover:underline">Voltar para Home</Link>
      </div>
    );
  }

  const currentStep = getCurrentStepIndex(order.status);

  return (
    <div className="min-h-screen bg-background pt-20 pb-24 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-surface rounded-2xl border border-white/5 overflow-hidden mb-6">
          <div className="p-6 border-b border-white/5 text-center bg-gradient-to-b from-primary/10 to-surface">
            <h1 className="text-xl font-bold text-white mb-1">Pedido #{order.id.slice(0, 8)}</h1>
            <p className="text-gray-400 text-sm">
              Realizado em {new Date(order.created_at).toLocaleDateString()} às {new Date(order.created_at).toLocaleTimeString().slice(0, 5)}
            </p>
          </div>

          {/* Status Stepper */}
          <div className="p-6 bg-black/20">
            <div className="flex justify-between relative">
              {/* Progress Bar Background */}
              <div className="absolute top-1/2 left-0 w-full h-1 bg-white/10 -translate-y-1/2 z-0" />
              
              {/* Active Progress Bar */}
              <div 
                className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 z-0 transition-all duration-500"
                style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
              />

              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = index <= currentStep;
                const isCurrent = index === currentStep;

                return (
                  <div key={step.id} className="relative z-10 flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                      isActive 
                        ? 'bg-primary border-primary text-white' 
                        : 'bg-surface border-white/10 text-gray-500'
                    } ${isCurrent ? 'ring-4 ring-primary/20 scale-110' : ''}`}>
                      <Icon size={18} />
                    </div>
                    <span className={`text-[10px] mt-2 font-medium uppercase tracking-wider ${isActive ? 'text-white' : 'text-gray-500'}`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
            
            {order.status === 'cancelled' && (
              <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
                <p className="text-red-400 font-bold">Este pedido foi cancelado.</p>
              </div>
            )}
          </div>

          {/* Delivery Info */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <MapPin size={14} /> Endereço de Entrega
              </h3>
              <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                <p className="text-white font-medium">
                  {order.address.street}, {order.address.number}
                </p>
                <p className="text-gray-400 text-sm mt-1">{order.address.district}</p>
              </div>
            </div>
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Receipt size={14} /> Resumo do Pedido
              </h3>
              <div className="bg-black/20 p-4 rounded-xl border border-white/5 space-y-3">
                {order.items.map((item, idx) => (
                  <div key={idx} className="text-sm">
                    <div className="flex justify-between text-white">
                      <span>{item.quantity}x {item.product.name}</span>
                      <span className="text-gray-400">{formatCurrency(item.unit_price * item.quantity)}</span>
                    </div>
                    {item.extras && Array.isArray(item.extras) && item.extras.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1 pl-4 border-l-2 border-white/10">
                        {item.extras.map((extra: any, i: number) => (
                          <span key={i} className="text-xs text-gray-500">
                            + {extra.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                <div className="pt-3 mt-2 border-t border-white/10 flex justify-between font-bold text-white text-lg">
                  <span>Total</span>
                  <span className="text-accent">{formatCurrency(order.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Link 
          to="/"
          className="block w-full py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-colors text-center flex items-center justify-center gap-2 border border-white/5 hover:border-white/20"
        >
          <Home size={20} />
          Voltar para o Início
        </Link>
      </div>
    </div>
  );
};
