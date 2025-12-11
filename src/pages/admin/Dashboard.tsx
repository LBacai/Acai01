import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { formatCurrency } from '../../lib/utils';
import { Loader2, Package, LogOut, MapPin, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type Order = {
  id: string;
  total: number;
  status: string;
  created_at: string;
  payment_method: string;
  customer: {
    full_name: string;
    phone: string;
  };
  address: {
    street: string;
    number: string;
    district: string;
  };
  items: {
    quantity: number;
    extras: any; // JSONB
    product: {
      name: string;
    };
  }[];
};

export const Dashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    fetchOrders();

    const subscription = supabase
      .channel('orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchOrders();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/admin');
    }
  };

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          customer:customers(full_name, phone),
          address:addresses(street, number, district),
          items:order_items(quantity, extras, product:products(name))
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);
      
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'preparing': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'delivery': return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
      case 'completed': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'cancelled': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Pendente',
      preparing: 'Preparando',
      delivery: 'Em Entrega',
      completed: 'Entregue',
      cancelled: 'Cancelado'
    };
    return labels[status] || status;
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      pix: 'PIX',
      card: 'Cartão',
      money: 'Dinheiro'
    };
    return labels[method] || method;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-white">
      {/* Header */}
      <header className="bg-surface border-b border-white/10 sticky top-0 z-10 backdrop-blur-md bg-surface/80">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Package className="text-white w-5 h-5" />
            </div>
            <h1 className="font-bold text-lg">Toledos Admin</h1>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium"
          >
            <LogOut size={18} />
            Sair
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Pedidos Recentes</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {orders.map((order) => (
            <div key={order.id} className={`bg-surface border rounded-xl p-5 transition-all hover:shadow-lg ${getStatusColor(order.status).replace('text-', 'border-').split(' ')[2]}`}>
              {/* Header do Card */}
              <div className="flex justify-between items-start mb-4 pb-4 border-b border-white/5">
                <div>
                  <h3 className="font-bold text-lg text-white">{order.customer?.full_name || 'Cliente'}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                    <Phone size={12} />
                    <span>{order.customer?.phone}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}>
                    {getStatusLabel(order.status)}
                  </span>
                  <span className="text-xs text-gray-500">#{order.id.slice(0, 6)}</span>
                </div>
              </div>

              {/* Itens */}
              <div className="space-y-4 mb-6">
                <div className="bg-black/20 rounded-lg p-3">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Itens do Pedido</p>
                  <ul className="space-y-3">
                    {order.items?.map((item, idx) => (
                      <li key={idx} className="text-sm">
                        <div className="flex justify-between text-white font-medium">
                          <span>{item.quantity}x {item.product?.name}</span>
                        </div>
                        {/* Renderizar Adicionais */}
                        {item.extras && Array.isArray(item.extras) && item.extras.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {item.extras.map((extra: any, i: number) => (
                              <span key={i} className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded">
                                + {extra.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Endereço */}
                <div className="flex items-start gap-3 text-sm text-gray-300">
                  <MapPin size={16} className="mt-0.5 text-gray-500 shrink-0" />
                  <div>
                    <p className="font-medium text-white">Entrega</p>
                    <p className="text-gray-400 leading-relaxed">
                      {order.address?.street}, {order.address?.number} <br/>
                      {order.address?.district}
                    </p>
                  </div>
                </div>

                {/* Pagamento */}
                <div className="flex justify-between items-center pt-2 border-t border-white/5">
                  <div className="text-sm">
                    <span className="text-gray-500 block text-xs">Pagamento ({getPaymentMethodLabel(order.payment_method)})</span>
                    <span className="font-bold text-accent text-lg">{formatCurrency(order.total)}</span>
                  </div>
                  <span className="text-xs text-gray-500">{new Date(order.created_at).toLocaleTimeString().slice(0, 5)}</span>
                </div>
              </div>

              {/* Ações */}
              <div className="grid grid-cols-1 gap-2">
                {order.status === 'pending' && (
                  <button 
                    onClick={() => updateStatus(order.id, 'preparing')}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold transition-colors shadow-lg shadow-blue-900/20"
                  >
                    Aceitar Pedido
                  </button>
                )}
                {order.status === 'preparing' && (
                  <button 
                    onClick={() => updateStatus(order.id, 'delivery')}
                    className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold transition-colors shadow-lg shadow-purple-900/20"
                  >
                    Enviar para Entrega
                  </button>
                )}
                {order.status === 'delivery' && (
                  <button 
                    onClick={() => updateStatus(order.id, 'completed')}
                    className="w-full py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold transition-colors shadow-lg shadow-green-900/20"
                  >
                    Concluir Entrega
                  </button>
                )}
              </div>
            </div>
          ))}

          {orders.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-500 border border-white/5 rounded-2xl bg-surface/50">
              <Package className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-lg font-medium">Nenhum pedido recebido hoje.</p>
              <p className="text-sm opacity-60">Aguardando novos clientes...</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
