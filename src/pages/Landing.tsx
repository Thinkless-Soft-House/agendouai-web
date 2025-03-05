<lov-code>
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  CalendarRange,
  Clock,
  Users,
  Star,
  BarChart3,
  Building,
  Award,
  Send,
  ArrowRight,
  Check,
  Coffee,
  Sparkles,
} from "lucide-react";
import { ErrorBoundary } from "@/components/error/ErrorFallback";
import AnimatedGrid from "@/components/landing/AnimatedGrid";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ErrorFallback } from "@/components/error/ErrorFallback";

const Landing = () => {
  const [isAnnual, setIsAnnual] = React.useState(false);
  
  // Desconto anual (2 meses grátis = 16.67% de desconto)
  const annualDiscount = 0.8333;
  
  // Estrutura dos planos
  const plans = [
    {
      name: "Primeiros Passos",
      description: "Para quem está começando a organizar sua agenda",
      price: 0,
      features: [
        { text: "1 usuário", included: true },
        { text: "1 partição", included: true },
        { text: "15 agendamentos por mês", included: true },
        { text: "Lembretes automáticos", included: false },
        { text: "Suporte", included: false },
      ],
      popular: false,
      buttonText: "Começar Grátis",
      buttonVariant: "outline" as const,
    },
    {
      name: "Agenda Eficiente",
      description: "Ideal para profissionais independentes",
      price: 49.90,
      features: [
        { text: "2 usuários", included: true },
        { text: "2 partições", included: true },
        { text: "50 agendamentos por mês", included: true },
        { text: "Lembretes via email", included: true },
        { text: "Suporte prioritário por email", included: true },
        { text: "Implantação assistida", included: true },
      ],
      popular: true,
      buttonText: "Escolher Plano",
      buttonVariant: "default" as const,
    },
    {
      name: "Agenda Pro",
      description: "Para pequenas equipes e empresas",
      price: 89.90,
      features: [
        { text: "5 usuários", included: true },
        { text: "5 partições", included: true },
        { text: "100 agendamentos por mês", included: true },
        { text: "Lembretes via email", included: true },
        { text: "Suporte via WhatsApp e email", included: true },
        { text: "Implantação assistida", included: true },
        { text: "Relatórios avançados", included: true },
      ],
      popular: false,
      buttonText: "Escolher Plano",
      buttonVariant: "default" as const,
    },
    {
      name: "Agenda Personalizada",
      description: "Solução sob medida para sua empresa",
      price: null,
      features: [
        { text: "Usuários ilimitados", included: true },
        { text: "Partições ilimitadas", included: true },
        { text: "Agendamentos ilimitados", included: true },
        { text: "Integrações customizadas", included: true },
        { text: "Atendimento VIP", included: true },
        { text: "Implantação completa", included: true },
      ],
      popular: false,
      buttonText: "Agendar Café",
      buttonVariant: "outline" as const,
      isCustom: true,
    },
  ];

  // Melhorar o smooth scroll
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      
      if (anchor && anchor.hash && anchor.hash.startsWith('#')) {
        e.preventDefault();
        const targetElement = document.querySelector(anchor.hash);
        if (targetElement) {
          window.scrollTo({
            top: targetElement.getBoundingClientRect().top + window.scrollY - 80,
            behavior: 'smooth'
          });
          
          // Atualizar a URL sem recarregar a página
          window.history.pushState(null, '', anchor.hash);
        }
      }
    };

    document.addEventListener('click', handleAnchorClick);
    return () => document.removeEventListener('click', handleAnchorClick);
  }, []);

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div className="bg-white">
        <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-white/95 backdrop-blur-sm border-b">
          <div className="flex items-center space-x-2">
            <CalendarRange className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Agendou Aí</span>
          </div>
          <div className="flex items-center space-x-4">
            <a href="#features" className="text-sm font-medium hover:text-primary transition-colors">
              Recursos
            </a>
            <a href="#how-it-works" className="text-sm font-medium hover:text-primary transition-colors">
              Como Funciona
            </a>
            <a href="#testimonials" className="text-sm font-medium hover:text-primary transition-colors">
              Depoimentos
            </a>
            <a href="#pricing" className="text-sm font-medium hover:text-primary transition-colors">
              Preços
            </a>
            <a href="#contact" className="text-sm font-medium hover:text-primary transition-colors">
              Contato
            </a>
            <Link to="/app/login">
              <Button className="transition-transform hover:scale-105">
                Entrar no App
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </nav>

        <section className="pt-32 pb-24 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in">
              <h1 className="text-5xl font-bold tracking-tight leading-tight">
                Simplifique o agendamento para seu 
                <span className="text-primary"> negócio</span>
              </h1>
              <p className="text-xl text-gray-600">
                Transforme a maneira como você gerencia agendamentos com nossa plataforma intuitiva.
                Deixe para trás as confusões de agenda e maximize seu tempo útil.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/app/login">
                  <Button size="lg" className="w-full sm:w-auto transition-all hover:scale-105">
                    Comece Agora
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <a href="#demo">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto transition-all hover:scale-105">
                    Ver Demonstração
                  </Button>
                </a>
              </div>
            </div>
            <div className="relative animate-fade-in">
              <div className="aspect-video bg-gradient-to-tr from-primary/20 to-primary/5 rounded-lg shadow-xl flex items-center justify-center">
                <AnimatedGrid className="w-3/4 aspect-[4/3]" />
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="py-24 bg-gray-50">
          <div className="px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Recursos que Impulsionam seu Negócio</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Nosso sistema de agendamento foi projetado para atender às necessidades específicas de diversos segmentos.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <CalendarRange className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Agendamento Inteligente</h3>
                <p className="text-gray-600">
                  Permita que clientes agendem serviços 24/7 sem conflitos ou sobreposições.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <Users className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Gestão de Clientes</h3>
                <p className="text-gray-600">
                  Mantenha um banco de dados completo de clientes para melhorar o relacionamento.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <BarChart3 className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Relatórios Detalhados</h3>
                <p className="text-gray-600">
                  Acompanhe métricas importantes para tomar decisões baseadas em dados.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <Building className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Múltiplas Unidades</h3>
                <p className="text-gray-600">
                  Gerencie várias localizações ou filiais em uma única plataforma centralizada.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <Clock className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Disponibilidade em Tempo Real</h3>
                <p className="text-gray-600">
                  Exiba apenas os horários realmente disponíveis, evitando conflitos.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <Star className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Avaliações de Serviço</h3>
                <p className="text-gray-600">
                  Colete feedback valioso para melhorar continuamente a qualidade do atendimento.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="py-24">
          <div className="px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Como Funciona</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Processo simples e eficiente para você começar a usar imediatamente.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">1</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Cadastre-se</h3>
                <p className="text-gray-600">
                  Crie sua conta em menos de 2 minutos e configure o perfil da sua empresa.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">2</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Configure Serviços</h3>
                <p className="text-gray-600">
                  Adicione seus serviços, colaboradores e defina a disponibilidade de cada um.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">3</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Comece a Receber Agendamentos</h3>
                <p className="text-gray-600">
                  Compartilhe seu link de agendamento e gerencie sua agenda de forma eficiente.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="testimonials" className="py-24 bg-gray-50">
          <div className="px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">O Que Nossos Clientes Dizem</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Depoimentos de empresas que transformaram seu negócio com nossa plataforma.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
                  <div>
                    <h4 className="font-semibold">Marcos Silva</h4>
                    <p className="text-sm text-gray-600">Barbearia Vintage</p>
                  </div>
                </div>
                <p className="text-gray-600">
                  "Desde que implementamos o Agendou Aí?, reduzi em 70% o tempo gasto com o gerenciamento de agendamentos. Meus clientes adoram a facilidade para marcar horários."
                </p>
                <div className="flex mt-4">
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
                  <div>
                    <h4 className="font-semibold">Ana Oliveira</h4>
                    <p className="text-sm text-gray-600">Clínica Estética Beleza</p>
                  </div>
                </div>
                <p className="text-gray-600">
                  "O sistema é intuitivo e nos ajudou a reduzir drasticamente as faltas dos clientes com lembretes automáticos. Nossa agenda está sempre otimizada."
                </p>
                <div className="flex mt-4">
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
                  <div>
                    <h4 className="font-semibold">Carlos Santos</h4>
                    <p className="text-sm text-gray-600">Coworking Centro</p>
                  </div>
                </div>
                <p className="text-gray-600">
                  "Como administrador de um espaço compartilhado, o controle de múltiplas salas era um desafio. O Agendou Aí? resolveu esse problema com uma interface simples e poderosa."
                </p>
                <div className="flex mt-4">
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <Star className="h-5 w-5 text-gray-300 fill-current" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="pricing" className="py-24 bg-gray-50">
          <div className="px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Planos Simples e Transparentes</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Escolha o plano ideal para o tamanho do seu negócio.
              </p>
              
              <div className="flex items-center justify-center space-x-2 mt-10">
                <Label htmlFor="billing-switch" className={!isAnnual ? "font-bold" : "text-muted-foreground"}>Mensal</Label>
                <Switch 
                  id="billing-switch" 
                  checked={isAnnual}
                  onCheckedChange={setIsAnnual}
                />
                <Label htmlFor="billing-switch" className={isAnnual ? "font-bold" : "text-muted-foreground"}>
                  Anual <Badge variant="outline" className="ml-1 bg-green-100 text-green-800 border-green-200">2 meses grátis</Badge>
                </Label>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {plans.map((plan) => {
                const calculatedPrice = plan.price === null 
                  ? null 
                  : isAnnual 
                    ? Math.round(plan.price * 12 * annualDiscount * 100) / 100
                    : plan.price;
                
                return (
                  <div key={plan.name} className={`bg-white rounded-lg shadow-sm overflow-hidden border ${plan.popular ? 'border-2 border-primary relative' : 'border-muted'}`}>
                    {plan.popular && (
                      <div className="absolute top-0 right-0 bg-primary text-white text-xs font-semibold px-3 py-1 rounded-bl-lg">
                        MAIS POPULAR
                      </div>
                    )}
                    <div className="p-6">
                      <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                      <p className="text-gray-600 mb-6">{plan.description}</p>
                      <div className="flex items-baseline mb-6">
                        {calculatedPrice === null ? (
                          <div className="flex items-center">
                            <Coffee className="h-5 w-5 mr-2 text-muted-foreground" />
                            <span className="text-muted-foreground">Vamos conversar</span>
                          </div>
                        ) : (
                          <>
                            <span className="text-4xl font-bold">R${calculatedPrice.toFixed(2).replace('.', ',')}</span>
                            <span className="text-gray-600 ml-2">{isAnnual ? '/ano' : '/mês'}</span>
                          </>
                        )}
                      </div>
                      <ul className="space-y-3 mb-6">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-start">
                            {feature.included ? (
                              <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                            ) : (
                              <div className="h-5 w-5 mr-2 mt-0.5 border border-gray-300 rounded-full"></div>
                            )}
                            <span className={feature.included ? "" : "text-muted-foreground"}>
                              {feature.text}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="p-6 border-t">
                      {plan.isCustom ? (
                        <Button 
                          variant={plan.buttonVariant as any} 
                          className="w-full group"
                        >
                          {plan.buttonText}
                          <Coffee className="ml-2 h-4 w-4 group-hover:animate-bounce" />
                        </Button>
                      ) : (
                        <Link to="/app/login" className="w-full">
                          <Button 
                            variant={plan.buttonVariant as any} 
                            className="w-full group"
                          >
                            {plan.buttonText}
                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section id="demo" className="py-24">
          <div className="px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-4">Veja o Agendou Aí? em Ação</h2>
                <p className="text-gray-600 mb-6">
                  Nossa plataforma foi projetada para ser intuitiva e fácil de usar, tanto para empresas quanto para clientes.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span>Interface limpa e moderna para gerenciamento descomplicado</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span>Visualização de agenda por dia, semana ou mês</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span>Dashboard com métricas importantes para seu negócio</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span>Notificações e lembretes para reduzir faltas</span>
                  </li>
                </ul>
              </div>
              <div className="bg-gray-100 rounded-lg aspect-video flex items-center justify-center">
                <div className="text-center">
                  <CalendarRange className="h-12 w-12 text-primary mx-auto mb-4" />
                  <p className="text-gray-600">Vídeo demonstrativo</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="py-24">
          <div className="px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <h2 className="text-3xl font-bold mb-4">Entre em Contato</h2>
                <p className="text-gray-600 mb-6">
                  Estamos aqui para ajudar. Entre em contato conosco para saber mais sobre como podemos ajudar seu negócio.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="mt-1 bg-primary/10 p-2 rounded-full mr-3">
                      <Send className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Email</h4>
                      <p className="text-gray-600">contato@thinkless.com.br</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="mt-1 bg-primary/10 p-2 rounded-full mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold">Telefone</h4>
                      <p className="text-gray-600">Ligue para nós</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="mt-1 bg-primary/10 p-2 rounded-full mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                        <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21"></path>
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold">WhatsApp</h4>
                      <p className="text-gray-600">+55 31 99560-3437</p>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium mb-1">
                        Nome
                      </label>
                      <input
                        type="text"
                        id="name"
                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium mb-1">
                      Assunto
                    </label>
                    <input
                      type="text"
                      id="subject"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium mb-1">
                      Mensagem
                    </label>
                    <textarea
                      id="message"
                      rows={4}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    ></textarea>
                  </div>
                  <Button className="w-full md:w-auto transition-all hover:scale-105">Enviar Mensagem</Button>
                </form>
              </div>
            </div>
          </div>
        </section>

        <footer className="py-12 bg-gray-900 text-white">
          <div className="px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <CalendarRange className="h-6 w-6 text-primary" />
                  <span className="text-xl font-bold">Agendou Aí</span>
                </div>
                <p className="text-gray-400">
                  Simplificando o gerenciamento de agendamentos para empresas de todos os tamanhos.
                </p>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4">Produtos</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-white">Agendamento</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">CRM</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">Pagamentos</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">Marketing</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4">Empresa</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-white">Sobre nós</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">Carreiras</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">Blog</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">Parceiros</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4">Legal</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-white">Termos de Serviço</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">Privacidade</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">Cookies</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400">© {new Date().getFullYear()} Agendou Aí?. Todos os direitos reservados.</p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <a href="#" className="text-gray-400 hover:text-white">
                  <span className="sr-only">Facebook</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.47
