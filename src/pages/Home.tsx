import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Clock, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

export const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section Parallax */}
      <div 
        className="relative h-[80vh] flex items-center justify-center overflow-hidden parallax-bg"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1494597564530-871f2b93ac55?q=80&w=2013&auto=format&fit=crop")',
        }}
      >
        <div className="absolute inset-0 bg-black/60 bg-gradient-to-t from-background via-black/40 to-black/30" />
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block py-1 px-3 rounded-full bg-primary/20 text-primary border border-primary/30 text-sm font-semibold mb-4 backdrop-blur-sm">
              O Melhor de Guarulhos
            </span>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Açaí Premium <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                Do Seu Jeito
              </span>
            </h1>
            <p className="text-gray-300 text-lg md:text-xl mb-8 max-w-2xl mx-auto">
              Sabor autêntico, ingredientes selecionados e entrega rápida no Jardim Pinhal e região.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                to="/menu"
                className="w-full sm:w-auto px-8 py-4 bg-accent hover:bg-accent-hover text-black font-bold rounded-full transition-all transform hover:scale-105 flex items-center justify-center gap-2"
              >
                Peça Agora
                <ArrowRight size={20} />
              </Link>
              <a 
                href="#info"
                className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-full backdrop-blur-md transition-all border border-white/10"
              >
                Saiba Mais
              </a>
            </div>
          </motion.div>
        </div>

        {/* Floating Elements Animation */}
        <div className="absolute top-1/4 left-10 w-24 h-24 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-10 w-32 h-32 bg-accent/10 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      {/* Info Section */}
      <section id="info" className="py-16 px-4 bg-surface/50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-background p-6 rounded-2xl border border-white/5 flex flex-col items-center text-center hover:border-primary/50 transition-colors">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary mb-4">
              <Clock size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Horário</h3>
            <p className="text-gray-400">Todos os dias<br/>08:00 às 21:00</p>
          </div>
          
          <div className="bg-background p-6 rounded-2xl border border-white/5 flex flex-col items-center text-center hover:border-primary/50 transition-colors">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary mb-4">
              <MapPin size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Localização</h3>
            <p className="text-gray-400">Jardim Pinhal<br/>Guarulhos - SP</p>
          </div>

          <div className="bg-background p-6 rounded-2xl border border-white/5 flex flex-col items-center text-center hover:border-primary/50 transition-colors">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary mb-4">
              <Star size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Qualidade</h3>
            <p className="text-gray-400">Ingredientes Premium<br/>Satisfação Garantida</p>
          </div>
        </div>
      </section>
    </div>
  );
};
