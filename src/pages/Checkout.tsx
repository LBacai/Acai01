import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabase';
import { formatCurrency } from '../lib/utils';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type CheckoutForm = {
  fullName: string;
  phone: string;
  cep: string;
  street: string;
  number: string;
  district: string;
  paymentMethod: 'pix' | 'money' | 'card';
};

export const Checkout = () => {
  const { items, total, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<CheckoutForm>();

  const onSubmit = async (data: CheckoutForm) => {
    setLoading(true);
    try {
      // 1. Criar Cliente
      const { data: customer, error: custError } = await supabase
        .from('customers')
        .insert({ full_name: data.fullName, phone: data.phone })
        .select()
        .single();
      
      if (custError) throw custError;

      // 2. Criar Endereço
      const { data: address, error: addrError } = await supabase
        .from('addresses')
        .insert({
          customer_id: customer.id,
          cep: data.cep,
          street: data.street,
          number: data.number,
          district: data.district
        })
        .select()
        .single();

      if (addrError) throw addrError;

      // 3. Criar Pedido
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_id: customer.id,
          address_id: address.id,
          total: total,
          payment_method: data.paymentMethod,
          status: 'pending'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 4. Itens do Pedido com Adicionais
      const orderItems = items.map(item => {
        const addonsTotal = item.selectedAddons.reduce((sum, addon) => sum + addon.price, 0);
        const finalUnitPrice = item.price + addonsTotal;

        return {
          order_id: order.id,
          product_id: item.id,
          quantity: item.quantity,
          unit_price: finalUnitPrice, // Preço final unitário (Base + Adicionais)
          extras: item.selectedAddons // Salva o JSON dos adicionais
        };
      });

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      clearCart();
      navigate(`/order/${order.id}`);

    } catch (error) {
      console.error('Checkout error:', error);
      alert('Erro ao processar pedido. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-20 pb-24 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-8">Finalizar Pedido</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Dados Pessoais */}
          <section className="bg-surface p-6 rounded-2xl border border-white/5">
            <h2 className="text-lg font-semibold text-white mb-4">Seus Dados</h2>
            <div className="space-y-4">
              <div>
                <input
                  {...register('fullName', { required: true })}
                  placeholder="Nome Completo"
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary outline-none"
                />
                {errors.fullName && <span className="text-red-500 text-xs">Obrigatório</span>}
              </div>
              <div>
                <input
                  {...register('phone', { required: true })}
                  placeholder="WhatsApp / Telefone"
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary outline-none"
                />
              </div>
            </div>
          </section>

          {/* Endereço */}
          <section className="bg-surface p-6 rounded-2xl border border-white/5">
            <h2 className="text-lg font-semibold text-white mb-4">Entrega</h2>
            <div className="grid grid-cols-2 gap-4">
              <input
                {...register('cep', { required: true })}
                placeholder="CEP"
                className="col-span-2 bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary outline-none"
              />
              <input
                {...register('street', { required: true })}
                placeholder="Rua"
                className="col-span-2 bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary outline-none"
              />
              <input
                {...register('number', { required: true })}
                placeholder="Número"
                className="bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary outline-none"
              />
              <input
                {...register('district', { required: true })}
                placeholder="Bairro"
                className="bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary outline-none"
              />
            </div>
          </section>

          {/* Pagamento */}
          <section className="bg-surface p-6 rounded-2xl border border-white/5">
            <h2 className="text-lg font-semibold text-white mb-4">Pagamento</h2>
            <div className="grid grid-cols-3 gap-3">
              <label className="cursor-pointer">
                <input type="radio" value="pix" {...register('paymentMethod')} className="hidden peer" defaultChecked />
                <div className="bg-black/20 border border-white/10 p-4 rounded-xl text-center peer-checked:border-primary peer-checked:bg-primary/10 transition-all">
                  <span className="text-white font-medium">PIX</span>
                </div>
              </label>
              <label className="cursor-pointer">
                <input type="radio" value="card" {...register('paymentMethod')} className="hidden peer" />
                <div className="bg-black/20 border border-white/10 p-4 rounded-xl text-center peer-checked:border-primary peer-checked:bg-primary/10 transition-all">
                  <span className="text-white font-medium">Cartão</span>
                </div>
              </label>
              <label className="cursor-pointer">
                <input type="radio" value="money" {...register('paymentMethod')} className="hidden peer" />
                <div className="bg-black/20 border border-white/10 p-4 rounded-xl text-center peer-checked:border-primary peer-checked:bg-primary/10 transition-all">
                  <span className="text-white font-medium">Dinheiro</span>
                </div>
              </label>
            </div>
          </section>

          {/* Total e Botão */}
          <div className="fixed bottom-0 left-0 w-full bg-surface border-t border-white/10 p-4 md:relative md:bg-transparent md:border-0 md:p-0 z-10">
            <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
              <div className="md:hidden">
                <p className="text-gray-400 text-sm">Total</p>
                <p className="text-white font-bold text-lg">{formatCurrency(total)}</p>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 md:w-full py-4 bg-accent hover:bg-accent-hover text-black font-bold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" /> : 'Confirmar Pedido'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
