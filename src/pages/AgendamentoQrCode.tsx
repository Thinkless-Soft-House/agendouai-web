import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import axios from "axios";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, Loader2, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getApiEndpoint } from "@/lib/api";

// Schema para validação do formulário - modificado para incluir CPF
const agendamentoFormSchema = z.object({
  email: z.string().email({ message: "Email inválido" }),
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  telefone: z.string().min(10, "Telefone inválido"),
  cpf: z.string().min(11, "CPF inválido").max(14, "CPF inválido"),
  empresaId: z.string(),
  particaoId: z.string(),
  data: z.date({
    required_error: "Por favor selecione uma data",
  }),
  horarios: z.array(z.string()).min(1, { message: "Selecione pelo menos um horário" }),
});

type AgendamentoFormValues = z.infer<typeof agendamentoFormSchema>;

const AgendamentoQrCode = () => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const [particoes, setParticoes] = useState<any[]>([]);
  const [diasDisponiveis, setDiasDisponiveis] = useState<Date[]>([]);
  const [horariosDisponiveis, setHorariosDisponiveis] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [userExists, setUserExists] = useState(false);

  // Extrair parâmetros da URL
  const empresaId = searchParams.get("empresaId");
  const empresaNome = searchParams.get("empresaNome");
  const particaoId = searchParams.get("particaoId");
  const particaoNome = searchParams.get("particaoNome");

  // Verificar tipo de QR Code
  const isParticaoSpecific = !!particaoId;

  // Configuração do formulário
  const form = useForm<AgendamentoFormValues>({
    resolver: zodResolver(agendamentoFormSchema),
    defaultValues: {
      email: "",
      nome: "",
      telefone: "",
      cpf: "",
      empresaId: empresaId || "",
      particaoId: particaoId || "",
      data: undefined,
      horarios: [],
    },
  });

  // Função para verificar se o email já existe
  const checkEmail = async () => {
    const email = form.getValues("email");

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({
        title: "Email inválido",
        description: "Por favor, insira um email válido antes de verificar.",
        variant: "destructive",
      });
      return;
    }

    setIsCheckingEmail(true);

    try {
      // Usando a rota de filtro com o parâmetro login para buscar por email
      const response = await axios.get(getApiEndpoint(`usuario/filter`), {
        params: {
          login: email
        }
      });

      // Verificar a resposta da API
      if (response.data && 
          response.data.data && 
          response.data.data.data && 
          response.data.data.data.length > 0) {
        // Usuário encontrado - preencher dados
        setUserExists(true);
        const userData = response.data.data.data[0]; // Pega o primeiro resultado do array

        // Verificar se os dados de pessoa existem
        if (userData.pessoa) {
          form.setValue("nome", userData.pessoa.nome || "");
          form.setValue("telefone", userData.pessoa.telefone || "");
          form.setValue("cpf", userData.pessoa.cpfCnpj || "");
        }

        toast({
          title: "Usuário encontrado",
          description: "Seus dados foram preenchidos automaticamente.",
        });
      } else {
        // Usuário não encontrado
        setUserExists(false);
        toast({
          title: "Usuário não encontrado",
          description: "Por favor, preencha seus dados para continuar.",
        });
      }
    } catch (error) {
      console.error("Erro ao verificar email:", error);
      setUserExists(false);
      toast({
        title: "Erro na verificação",
        description: "Não foi possível verificar o email. Por favor, preencha seus dados manualmente.",
        variant: "destructive",
      });
    } finally {
      setIsCheckingEmail(false);
      setEmailVerified(true);
    }
  };

  // Função para criar novo usuário
  const createUser = async (userData: { nome: string; email: string; telefone: string; cpf: string }) => {
    try {
      const payload = {
        login: userData.email,
        senha: "123456", // Senha padrão
        permissaoId: 2, // Cliente
        status: 1, // Ativo
        pessoa: {
          nome: userData.nome,
          telefone: userData.telefone,
          // Usar CPF fornecido ou valor padrão
          cpfCnpj: userData.cpf || "00000000000",
          municipio: "Não informado",
          estado: "MG",
          endereco: "Não informado",
          cep: "00000000",
        },
      };

      const response = await axios.post(getApiEndpoint("usuario/createWithoutPassword"), payload);

      if (response.data && response.data.data) {
        toast({
          title: "Usuário criado com sucesso",
          description: "Seu cadastro foi realizado automaticamente.",
        });
        return response.data.data;
      }

      return null;
    } catch (error) {
      console.error("Erro ao criar usuário:", error);
      toast({
        title: "Erro ao criar cadastro",
        description: "Não foi possível criar seu cadastro. O agendamento será feito sem vínculo com uma conta.",
        variant: "destructive",
      });
      return null;
    }
  };

  // Função para carregar disponibilidade da partição
  const loadDisponibilidade = async (particaoId: string) => {
    if (!particaoId) return;

    setIsLoading(true);
    try {
      // Buscar detalhes da partição incluindo disponibilidades
      const response = await axios.get(getApiEndpoint(`sala/${particaoId}`));

      if (!response.data || !response.data.data) {
        throw new Error("Dados da partição não encontrados");
      }

      const particao = response.data.data;
      console.log("Dados da partição:", particao);

      if (!particao.disponibilidades || !Array.isArray(particao.disponibilidades)) {
        throw new Error("Dados de disponibilidade inválidos");
      }

      // Filtrar apenas disponibilidades ativas
      const disponibilidadesAtivas = particao.disponibilidades.filter(
        (disp: any) => disp.ativo === true
      );
      
      console.log("Disponibilidades ativas:", disponibilidadesAtivas);

      // Gerar próximos 30 dias disponíveis com base nas configurações
      const hoje = new Date();
      const proximosDias: Date[] = [];

      // Mapear dias da semana para identificar dias disponíveis
      const diasDisponiveisDaSemana = disponibilidadesAtivas.map(
        (disp: any) => Number(disp.diaSemana)
      );
      
      console.log("Dias disponíveis da semana:", diasDisponiveisDaSemana);

      // Buscar próximos 30 dias
      for (let i = 0; i < 30; i++) {
        const data = new Date();
        data.setDate(hoje.getDate() + i);

        // Verificar se o dia da semana está disponível (0=Domingo, 1=Segunda, etc)
        if (diasDisponiveisDaSemana.includes(data.getDay())) {
          proximosDias.push(data);
        }
      }

      setDiasDisponiveis(proximosDias);

      // Limpar data e horário selecionados
      form.setValue("data", undefined);
      form.setValue("horarios", []);
      setHorariosDisponiveis([]);
    } catch (error) {
      console.error("Erro ao carregar disponibilidade:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a disponibilidade. Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Função para carregar partições da empresa
  const loadParticoes = async (empresaId: string) => {
    if (!empresaId) return;

    setIsLoading(true);
    try {
      // Usando a rota de filtro para buscar partições da empresa
      const response = await axios.get(getApiEndpoint(`sala/filter`), {
        params: {
          empresaId,
        },
      });

      if (response.data && response.data.data && response.data.data.data) {
        // Filtrar apenas partições ativas
        const particoesAtivas = response.data.data.data.filter(
          (particao: any) => particao.status === 1
        );
        setParticoes(particoesAtivas);
      } else {
        toast({
          title: "Aviso",
          description: "Não encontramos partições disponíveis para esta empresa.",
          variant: "destructive",
        });
        setParticoes([]);
      }
    } catch (error) {
      console.error("Erro ao carregar partições:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as partições. Tente novamente mais tarde.",
        variant: "destructive",
      });
      setParticoes([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Função para gerar horários disponíveis quando uma data é selecionada
  const generateTimeSlots = async (date: Date, particaoId: string) => {
    if (!date || !particaoId) return;

    setIsLoading(true);
    try {
      // Obter o dia da semana (0=Domingo, 1=Segunda, etc)
      const diaSemana = date.getDay().toString();
      console.log("Gerando slots para dia da semana:", diaSemana);

      // Buscar detalhes da partição
      const response = await axios.get(getApiEndpoint(`sala/${particaoId}`));

      if (!response.data || !response.data.data) {
        throw new Error("Dados da partição não encontrados");
      }

      const particao = response.data.data;

      if (!particao.disponibilidades || !Array.isArray(particao.disponibilidades)) {
        throw new Error("Dados de disponibilidade inválidos");
      }

      // Encontrar a configuração para o dia da semana selecionado
      const configDia = particao.disponibilidades.find(
        (disp: any) => disp.diaSemana === diaSemana && disp.ativo === true
      );
      
      console.log("Configuração para o dia selecionado:", configDia);

      if (!configDia) {
        setHorariosDisponiveis([]);
        return;
      }

      // Extrair horários de início e fim
      const horaInicio = configDia.hrAbertura || "08:00";
      const horaFim = configDia.hrFim || "18:00";
      const intervaloMinutos = configDia.intervaloMinutos || 60;
      
      console.log(`Horário: ${horaInicio} até ${horaFim}, intervalo: ${intervaloMinutos} minutos`);

      // Gerar slots de horário
      const slots: string[] = [];

      const [inicioHora, inicioMinuto] = horaInicio.split(":").map(Number);
      const [fimHora, fimMinuto] = horaFim.split(":").map(Number);

      let atual = new Date();
      atual.setHours(inicioHora, inicioMinuto, 0);

      const fim = new Date();
      fim.setHours(fimHora, fimMinuto, 0);

      while (atual < fim) {
        const formattedTime = format(atual, "HH:mm");
        slots.push(formattedTime);
        atual.setMinutes(atual.getMinutes() + intervaloMinutos);
      }
      
      console.log("Slots gerados:", slots);

      // Verificar horários já agendados para a data selecionada
      const dataFormatada = format(date, "yyyy-MM-dd");

      try {
        // Buscar agendamentos existentes usando a mesma rota que o sistema interno usa
        const agendamentosResponse = await axios.get(
          getApiEndpoint(`reserva/sala/${particaoId}/data/${dataFormatada}`)
        );

        if (agendamentosResponse.data && agendamentosResponse.data.data) {
          const agendamentosExistentes = agendamentosResponse.data.data;
          console.log("Agendamentos existentes:", agendamentosExistentes);

          // Filtrar slots já agendados
          const horariosOcupados = agendamentosExistentes.map(
            (ag: any) => ag.horaInicio
          );
          
          console.log("Horários ocupados:", horariosOcupados);

          const slotsDisponiveis = slots.filter(
            (slot) => !horariosOcupados.includes(slot)
          );
          
          console.log("Slots disponíveis após filtro:", slotsDisponiveis);

          setHorariosDisponiveis(slotsDisponiveis);
        } else {
          // Se não há agendamentos, todos os slots estão disponíveis
          setHorariosDisponiveis(slots);
        }
      } catch (error) {
        console.error("Erro ao verificar agendamentos existentes:", error);
        // Em caso de erro, mostrar todos os slots
        setHorariosDisponiveis(slots);
      }
    } catch (error) {
      console.error("Erro ao gerar horários:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os horários disponíveis.",
        variant: "destructive",
      });
      setHorariosDisponiveis([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Quando a partição mudar, carregue a disponibilidade
  const onPartitionChange = (particaoId: string) => {
    form.setValue("particaoId", particaoId);
    loadDisponibilidade(particaoId);
  };

  // Quando a data mudar, gere os horários disponíveis
  const onDateChange = (date: Date) => {
    form.setValue("data", date);
    form.setValue("horarios", []);

    const particaoId = form.getValues("particaoId");
    if (particaoId) {
      generateTimeSlots(date, particaoId);
    }
  };

  // Função para remover um horário selecionado
  const removeHorario = (horarioToRemove: string) => {
    const currentHorarios = form.getValues("horarios");
    const newHorarios = currentHorarios.filter((h) => h !== horarioToRemove);
    form.setValue("horarios", newHorarios);
  };

  // Enviar formulário
  const onSubmit = async (data: AgendamentoFormValues) => {
    setIsSubmitting(true);

    try {
      // Se o usuário não existir, criar um novo
      let usuarioId = 0;
      if (!userExists) {
        const newUser = await createUser({
          nome: data.nome,
          email: data.email,
          telefone: data.telefone,
          cpf: data.cpf,
        });
        
        if (newUser && newUser.id) {
          usuarioId = newUser.id;
        } else {
          toast({
            title: "Aviso",
            description: "Não foi possível criar um usuário. O agendamento será feito sem vínculo com uma conta.",
            variant: "destructive",
          });
        }
      } else {
        // Buscar ID do usuário pelo email
        try {
          const userResponse = await axios.get(getApiEndpoint(`usuario/filter`), {
            params: { login: data.email }
          });
          
          if (userResponse.data?.data?.data?.length > 0) {
            usuarioId = userResponse.data.data.data[0].id;
          }
        } catch (error) {
          console.error("Erro ao buscar ID do usuário:", error);
        }
      }

      // Criar agendamentos para cada horário selecionado
      const results = await Promise.all(
        data.horarios.map(async (horario) => {
          // Formatar data e hora para o formato esperado pelo backend
          const dataHora = new Date(data.data);
          const [hora, minuto] = horario.split(":").map(Number);
          dataHora.setHours(hora, minuto, 0);
          
          // Calcular horário de fim (1 hora depois)
          const horaFim = `${(hora + 1).toString().padStart(2, '0')}:${minuto.toString().padStart(2, '0')}`;
          
          // Criar payload compatível com a rota /reserva
          const reservaDTO = {
            date: data.data.toISOString().split('T')[0],
            horaInicio: horario,
            horaFim: horaFim,
            observacao: "",
            diaSemanaIndex: data.data.getDay(),
            salaId: Number(data.particaoId),
            usuarioId: usuarioId,
          };

          return axios.post(getApiEndpoint("reserva"), reservaDTO);
        })
      );

      toast({
        title: "Agendamentos realizados!",
        description: `${data.horarios.length} horário(s) agendado(s) com sucesso para ${format(
          data.data,
          "dd/MM/yyyy"
        )}.`,
      });

      // Limpar formulário
      form.reset({
        email: "",
        nome: "",
        telefone: "",
        cpf: "",
        empresaId: empresaId || "",
        particaoId: data.particaoId, // Manter a partição selecionada
        data: undefined,
        horarios: [],
      });

      // Limpar estados
      setEmailVerified(false);
      setUserExists(false);
      setHorariosDisponiveis([]);
    } catch (error) {
      console.error("Erro ao realizar agendamento:", error);
      toast({
        title: "Erro",
        description: "Não foi possível realizar o agendamento. Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (empresaId) {
      loadParticoes(empresaId);
    }

    // Se particaoId for fornecido (via QR code), carregar disponibilidade
    if (particaoId) {
      loadDisponibilidade(particaoId);
    }
  }, [empresaId, particaoId]);

  return (
    <div className="container mx-auto py-10 px-4">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Agendamento Online</CardTitle>
          <CardDescription>
            {isParticaoSpecific
              ? `Agende seu horário na partição ${particaoNome} da empresa ${empresaNome}`
              : `Agende seu horário na empresa ${empresaNome}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Email e Verificação */}
              <div className="flex flex-col space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <div className="flex space-x-2">
                        <FormControl>
                          <Input
                            placeholder="seu@email.com"
                            {...field}
                            disabled={isCheckingEmail || emailVerified}
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={checkEmail}
                          disabled={isCheckingEmail || emailVerified}
                        >
                          {isCheckingEmail ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : emailVerified ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            "Verificar"
                          )}
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Campos sempre visíveis, mas inicialmente desabilitados */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="nome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Seu nome completo"
                            {...field}
                            disabled={!emailVerified || userExists} // Desabilitado até email ser verificado ou se usuário existir
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cpf"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CPF</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="000.000.000-00"
                            {...field}
                            disabled={!emailVerified || userExists} // Desabilitado até email ser verificado ou se usuário existir
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="telefone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="(00) 00000-0000"
                            {...field}
                            disabled={!emailVerified || userExists} // Desabilitado até email ser verificado ou se usuário existir
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="empresaId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Empresa</FormLabel>
                        <FormControl>
                          <Input
                            value={empresaNome || ""}
                            disabled
                            className="bg-muted"
                          />
                        </FormControl>
                        <FormDescription>
                          Empresa selecionada pelo QR Code
                        </FormDescription>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="particaoId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Partição</FormLabel>
                        {isParticaoSpecific ? (
                          <FormControl>
                            <Input
                              value={particaoNome || ""}
                              disabled
                              className="bg-muted"
                            />
                          </FormControl>
                        ) : (
                          <Select
                            value={field.value}
                            onValueChange={onPartitionChange}
                            disabled={!emailVerified || isLoading || particoes.length === 0}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione uma partição" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {isLoading ? (
                                <SelectItem value="carregando">Carregando partições...</SelectItem>
                              ) : particoes.length === 0 ? (
                                <SelectItem value="sem-particoes">Nenhuma partição disponível</SelectItem>
                              ) : (
                                particoes.map((particao) => (
                                  <SelectItem
                                    key={particao.id}
                                    value={particao.id.toString()}
                                  >
                                    {particao.nome}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                        )}
                        {isParticaoSpecific && (
                          <FormDescription>
                            Partição pré-selecionada pelo QR Code
                          </FormDescription>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="data"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Data</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                                disabled={!emailVerified || !form.getValues("particaoId") || isLoading}
                              >
                                {field.value ? (
                                  format(field.value, "PPP", { locale: ptBR })
                                ) : (
                                  "Selecione uma data"
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={onDateChange}
                              disabled={(date) => {
                                // Desabilitar datas passadas
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);

                                if (date < today) return true;

                                // Verificar se a data está na lista de dias disponíveis
                                return !diasDisponiveis.some(
                                  (availableDate) =>
                                    availableDate.getDate() === date.getDate() &&
                                    availableDate.getMonth() === date.getMonth() &&
                                    availableDate.getFullYear() === date.getFullYear()
                                );
                              }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="horarios"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Horários</FormLabel>
                        <FormControl>
                          <div className="space-y-4">
                            {horariosDisponiveis.length === 0 ? (
                              <div className="text-sm text-muted-foreground border rounded-md p-3">
                                {form.getValues("data")
                                  ? "Não há horários disponíveis"
                                  : "Selecione uma data primeiro"}
                              </div>
                            ) : (
                              <>
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                                  {horariosDisponiveis.map((horario) => {
                                    const isSelected = field.value.includes(horario);
                                    return (
                                      <Button
                                        key={horario}
                                        type="button"
                                        variant={isSelected ? "default" : "outline"}
                                        className={cn(
                                          "h-10",
                                          isSelected && "bg-primary text-primary-foreground"
                                        )}
                                        disabled={!emailVerified}
                                        onClick={() => {
                                          const newValue = isSelected
                                            ? field.value.filter((h) => h !== horario)
                                            : [...field.value, horario];
                                          field.onChange(newValue);
                                        }}
                                      >
                                        {horario}
                                      </Button>
                                    );
                                  })}
                                </div>
                              </>
                            )}
                          </div>
                        </FormControl>

                        {field.value.length > 0 && (
                          <div className="mt-4">
                            <FormLabel className="text-sm mb-2 block">
                              Horários selecionados:
                            </FormLabel>
                            <div className="flex flex-wrap gap-2">
                              {field.value.map((horario) => (
                                <Badge
                                  key={horario}
                                  variant="secondary"
                                  className="flex items-center gap-1"
                                >
                                  {horario}
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-4 w-4 p-0 ml-1"
                                    onClick={() => removeHorario(horario)}
                                    disabled={!emailVerified}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || isLoading || !emailVerified}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  "Confirmar Agendamento"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <p className="text-sm text-muted-foreground">
            Seus dados serão usados apenas para este agendamento.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AgendamentoQrCode;
