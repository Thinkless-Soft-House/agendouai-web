
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Check, X } from "lucide-react";

const Pricing = () => {
  const [annual, setAnnual] = useState(false);

  // Cálculo de preços com desconto anual (equivalente a 1 mês grátis)
  const getPrice = (monthlyPrice: number, isAnnual: boolean) => {
    if (!isAnnual) return monthlyPrice;
    return (monthlyPrice * 11).toFixed(2);
  };

  const plans = [
    {
      name: "Agendou Solzinho",
      description: "Para quem está começando no mundo dos agendamentos",
      originalPrice: 0,
      priceMonthly: 0,
      features: [
        { name: "1 usuário", included: true },
        { name: "1 partição", included: true },
        { name: "15 agendamentos por mês", included: true },
        { name: "Lembretes", included: false },
        { name: "Suporte", included: false },
      ],
      popular: false,
      buttonText: "Começar Grátis",
      buttonLink: "/app/signup",
      buttonVariant: "outline" as const,
    },
    {
      name: "Agendou Legal",
      description: "Para profissionais que querem organizar sua agenda",
      originalPrice: 49.90,
      priceMonthly: 49.90,
      features: [
        { name: "2 usuários", included: true },
        { name: "2 partições", included: true },
        { name: "50 agendamentos por mês", included: true },
        { name: "Lembretes via email", included: true },
        { name: "Suporte prioritário por email", included: true },
        { name: "Implantação com equipe especializada", included: true },
      ],
      popular: true,
      buttonText: "Assinar Agora",
      buttonLink: "/app/signup",
      buttonVariant: "default" as const,
    },
    {
      name: "Agendou Tudo",
      description: "Para empresas que precisam de mais recursos",
      originalPrice: 99.90,
      priceMonthly: 99.90,
      features: [
        { name: "5 usuários", included: true },
        { name: "5 partições", included: true },
        { name: "100 agendamentos por mês", included: true },
        { name: "Lembretes via email", included: true },
        { name: "Suporte via WhatsApp e email prioritário", included: true },
        { name: "Implantação com equipe especializada", included: true },
      ],
      popular: false,
      buttonText: "Assinar Agora",
      buttonLink: "/app/signup",
      buttonVariant: "outline" as const,
    },
    {
      name: "Agendou Pro",
      description: "Plano personalizado para grandes empresas",
      originalPrice: null,
      priceMonthly: null,
      features: [
        { name: "Usuários ilimitados", included: true },
        { name: "Partições ilimitadas", included: true },
        { name: "Agendamentos ilimitados", included: true },
        { name: "Lembretes personalizados", included: true },
        { name: "Suporte dedicado", included: true },
        { name: "Implantação com consultoria personalizada", included: true },
      ],
      popular: false,
      buttonText: "Entre em Contato",
      buttonLink: "/#contato",
      buttonVariant: "outline" as const,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navegação simples */}
      <header className="px-4 lg:px-6 h-14 flex items-center border-b">
        <Link className="flex items-center justify-center" to="/">
          <span className="font-bold text-xl">Agendou Aí?</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:underline underline-offset-4" to="/">
            Início
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" to="/pricing">
            Preços
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" to="/#contato">
            Contato
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" to="/app/login">
            Login
          </Link>
        </nav>
      </header>
      
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Planos e Preços
                </h1>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Escolha o plano que melhor se adapta às suas necessidades de agendamento.
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">Mensal</span>
                <Switch
                  checked={annual}
                  onCheckedChange={setAnnual}
                  aria-label="Alternar entre planos mensais e anuais"
                />
                <span className="text-sm font-medium">Anual (1 mês grátis)</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-6 mt-8 md:grid-cols-2 lg:grid-cols-4">
              {plans.map((plan) => (
                <Card 
                  key={plan.name}
                  className={`flex flex-col ${plan.popular ? 'border-primary shadow-lg' : ''}`}
                >
                  {plan.popular && (
                    <div className="px-4 py-1 text-xs font-medium text-center text-primary-foreground bg-primary rounded-t-lg">
                      Mais Popular
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="mb-4">
                      {plan.priceMonthly === null ? (
                        <div>
                          <span className="text-4xl font-bold">Personalizado</span>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-baseline">
                            <span className="text-4xl font-bold">
                              {plan.priceMonthly === 0 ? 'Grátis' : `R$${getPrice(plan.priceMonthly, annual)}`}
                            </span>
                            {plan.priceMonthly > 0 && (
                              <span className="ml-1 text-sm font-medium text-gray-500">
                                /{annual ? 'ano' : 'mês'}
                              </span>
                            )}
                          </div>
                          {annual && plan.priceMonthly > 0 && (
                            <div className="mt-1 text-sm text-green-600">
                              Economia de R${plan.priceMonthly.toFixed(2)}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    <ul className="space-y-2 text-sm">
                      {plan.features.map((feature) => (
                        <li key={feature.name} className="flex items-center">
                          {feature.included ? (
                            <Check className="mr-2 h-4 w-4 text-green-500" />
                          ) : (
                            <X className="mr-2 h-4 w-4 text-gray-300" />
                          )}
                          <span className={feature.included ? '' : 'text-gray-400'}>
                            {feature.name}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      asChild 
                      variant={plan.buttonVariant}
                      className="w-full"
                    >
                      <Link to={plan.buttonLink}>
                        {plan.buttonText}
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      
      <footer className="border-t py-6 md:py-8">
        <div className="container flex flex-col items-center justify-center gap-4 px-4 md:px-6">
          <div className="text-center">
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} Agendou Aí? - Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Pricing;
