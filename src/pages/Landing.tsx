<lov-code>
import React from "react";
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
} from "lucide-react";

const Landing = () => {
  return (
    <div className="bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-white/95 backdrop-blur-sm border-b">
        <div className="flex items-center space-x-2">
          <CalendarRange className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">AgendaFácil</span>
        </div>
        <div className="flex items-center space-x-4">
          <a href="#features" className="text-sm font-medium hover:text-primary">
            Recursos
          </a>
          <a href="#how-it-works" className="text-sm font-medium hover:text-primary">
            Como Funciona
          </a>
          <a href="#testimonials" className="text-sm font-medium hover:text-primary">
            Depoimentos
          </a>
          <a href="#pricing" className="text-sm font-medium hover:text-primary">
            Preços
          </a>
          <a href="#contact" className="text-sm font-medium hover:text-primary">
            Contato
          </a>
          <Link to="/login">
            <Button>
              Entrar no App
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-24 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-5xl font-bold tracking-tight leading-tight">
              Simplifique o agendamento para seu 
              <span className="text-primary"> negócio</span>
            </h1>
            <p className="text-xl text-gray-600">
              Transforme a maneira como você gerencia agendamentos com nossa plataforma intuitiva.
              Deixe para trás as confusões de agenda e maximize seu tempo útil.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/login">
                <Button size="lg" className="w-full sm:w-auto">
                  Comece Agora
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <a href="#demo">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Ver Demonstração
                </Button>
              </a>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-video bg-gradient-to-tr from-primary/20 to-primary/5 rounded-lg shadow-xl flex items-center justify-center">
              <div className="bg-white p-6 rounded-lg shadow-lg w-3/4 aspect-[4/3]">
                <div className="w-full h-4 bg-gray-100 rounded-full mb-4"></div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="aspect-square bg-gray-100 rounded-md"></div>
                  <div className="aspect-square bg-gray-100 rounded-md"></div>
                  <div className="aspect-square bg-gray-100 rounded-md"></div>
                  <div className="aspect-square bg-gray-100 rounded-md"></div>
                  <div className="aspect-square bg-primary/20 rounded-md"></div>
                  <div className="aspect-square bg-gray-100 rounded-md"></div>
                </div>
              </div>
            </div>
            <div className="absolute -top-4 -right-4 bg-white p-3 rounded-lg shadow-lg">
              <CalendarRange className="h-8 w-8 text-primary" />
            </div>
            <div className="absolute -bottom-4 -left-4 bg-white p-3 rounded-lg shadow-lg">
              <Clock className="h-8 w-8 text-primary" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
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

      {/* How It Works Section */}
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

      {/* Testimonials Section */}
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
                "Desde que implementamos o AgendaFácil, reduzi em 70% o tempo gasto com o gerenciamento de agendamentos. Meus clientes adoram a facilidade para marcar horários."
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
                "Como administrador de um espaço compartilhado, o controle de múltiplas salas era um desafio. O AgendaFácil resolveu esse problema com uma interface simples e poderosa."
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

      {/* Demo Section */}
      <section id="demo" className="py-24">
        <div className="px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">Veja o AgendaFácil em Ação</h2>
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

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-gray-50">
        <div className="px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Planos Simples e Transparentes</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Escolha o plano ideal para o tamanho do seu negócio.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">Básico</h3>
                <p className="text-gray-600 mb-6">Ideal para profissionais autônomos</p>
                <div className="flex items-baseline mb-6">
                  <span className="text-4xl font-bold">R$49</span>
                  <span className="text-gray-600 ml-2">/mês</span>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span>1 usuário</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span>Até 50 agendamentos/mês</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span>Lembretes por email</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span>Suporte via email</span>
                  </li>
                </ul>
              </div>
              <div className="p-6 border-t">
                <Button variant="outline" className="w-full">Começar Grátis</Button>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden border-2 border-primary relative">
              <div className="absolute top-0 right-0 bg-primary text-white text-xs font-semibold px-3 py-1 rounded-bl-lg">
                MAIS POPULAR
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">Profissional</h3>
                <p className="text-gray-600 mb-6">Para pequenas empresas</p>
                <div className="flex items-baseline mb-6">
                  <span className="text-4xl font-bold">R$99</span>
                  <span className="text-gray-600 ml-2">/mês</span>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span>Até 5 usuários</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span>Agendamentos ilimitados</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span>Lembretes por email e SMS</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span>Relatórios básicos</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span>Suporte via chat</span>
                  </li>
                </ul>
              </div>
              <div className="p-6 border-t">
                <Button className="w-full">Começar Agora</Button>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">Empresarial</h3>
                <p className="text-gray-600 mb-6">Para empresas em crescimento</p>
                <div className="flex items-baseline mb-6">
                  <span className="text-4xl font-bold">R$199</span>
                  <span className="text-gray-600 ml-2">/mês</span>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span>Usuários ilimitados</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span>Agendamentos ilimitados</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span>Múltiplas localizações</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span>Relatórios avançados</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span>API para integração</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span>Suporte prioritário</span>
                  </li>
                </ul>
              </div>
              <div className="p-6 border-t">
                <Button variant="outline" className="w-full">Fale com Vendas</Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
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
                    <Building className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Endereço</h4>
                    <p className="text-gray-600">Av. Paulista, 1000 - São Paulo, SP</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="mt-1 bg-primary/10 p-2 rounded-full mr-3">
                    <Send className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Email</h4>
                    <p className="text-gray-600">contato@agendafacil.com</p>
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
                <Button className="w-full md:w-auto">Enviar Mensagem</Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900 text-white">
        <div className="px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <CalendarRange className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">AgendaFácil</span>
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
            <p className="text-gray-400">© 2023 AgendaFácil. Todos os direitos reservados.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">Facebook</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">Instagram</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4
