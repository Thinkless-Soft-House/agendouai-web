
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Check, X, Sparkles, Coffee, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Pricing = () => {
  const [isAnnual, setIsAnnual] = useState(false);
  
  // Desconto anual (1 mês grátis = 16.67% de desconto)
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

  return (
    <div className="bg-gradient-to-b from-background to-secondary/20">
      <div className="container py-20 px-4 md:px-6">
        <div className="text-center space-y-4 mb-16">
          <Badge variant="outline" className="px-4 py-1 border-primary/20 bg-primary/5 text-primary">
            Preços
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Escolha o plano ideal para você
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Do profissional independente à empresa em expansão, temos o plano perfeito para suas necessidades.
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
              <Card key={plan.name} className={`flex flex-col relative ${plan.popular ? 'border-primary shadow-lg shadow-primary/10' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-0 right-0 flex justify-center">
                    <Badge className="bg-primary px-3 py-1">Mais Popular</Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="mb-6">
                    {calculatedPrice === null ? (
                      <div className="flex items-center">
                        <Coffee className="h-5 w-5 mr-2 text-muted-foreground" />
                        <span className="text-muted-foreground">Vamos conversar</span>
                      </div>
                    ) : (
                      <>
                        <div className="text-3xl font-bold">
                          R$ {calculatedPrice.toFixed(2).replace('.', ',')}
                        </div>
                        <div className="text-muted-foreground">
                          {isAnnual ? '/ano' : '/mês'}
                        </div>
                      </>
                    )}
                  </div>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        {feature.included ? (
                          <Check className="h-5 w-5 mr-2 text-green-500 shrink-0 mt-0.5" />
                        ) : (
                          <X className="h-5 w-5 mr-2 text-muted-foreground shrink-0 mt-0.5" />
                        )}
                        <span className={feature.included ? "" : "text-muted-foreground"}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  {plan.isCustom ? (
                    <Button 
                      className="w-full group" 
                      variant={plan.buttonVariant}
                    >
                      {plan.buttonText}
                      <Coffee className="ml-2 h-4 w-4 group-hover:animate-bounce" />
                    </Button>
                  ) : (
                    <Link to="/app/signup" className="w-full">
                      <Button 
                        className="w-full group" 
                        variant={plan.buttonVariant}
                      >
                        {plan.buttonText}
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </Link>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>

        <div className="mt-20 text-center">
          <h2 className="text-2xl font-bold mb-4">Ainda com dúvidas?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
            Nossa equipe está pronta para ajudar você a escolher o plano ideal para o seu negócio.
          </p>
          <Button className="group">
            Fale Conosco
            <Sparkles className="ml-2 h-4 w-4 group-hover:animate-pulse" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
