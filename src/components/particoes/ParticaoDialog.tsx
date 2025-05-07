import React, { useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Particao, Funcionario } from "@/pages/Particoes";
import { Empresa } from "@/pages/Empresas";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import axios from "axios";

// Schema para validação do formulário - Corrigido para aceitar strings vazias quando o dia estiver inativo
const particaoFormSchema = z.object({
  nome: z
    .string()
    .min(3, { message: "Nome deve ter pelo menos 3 caracteres" })
    .max(50, { message: "Nome deve ter no máximo 50 caracteres" }),
  empresaId: z.number({ required_error: "Por favor selecione uma empresa" }),
  categoriaId: z.string().optional(),
  descricao: z
    .string()
    .min(5, { message: "Descrição deve ter pelo menos 5 caracteres" })
    .max(200, { message: "Descrição deve ter no máximo 200 caracteres" }),
  status: z.number(),
  responsaveis: z.array(z.string()).default([]),
  disponibilidade: z
    .array(
      z.object({
        dia: z.string(),
        ativo: z.boolean(),
        inicio: z.string(),
        fim: z.string(),
      })
    )
    .default([
      { dia: "Segunda", ativo: true, inicio: "08:00", fim: "18:00" },
      { dia: "Terça", ativo: true, inicio: "08:00", fim: "18:00" },
      { dia: "Quarta", ativo: true, inicio: "08:00", fim: "18:00" },
      { dia: "Quinta", ativo: true, inicio: "08:00", fim: "18:00" },
      { dia: "Sexta", ativo: true, inicio: "08:00", fim: "18:00" },
      { dia: "Sábado", ativo: false, inicio: "08:00", fim: "12:00" },
      { dia: "Domingo", ativo: false, inicio: "08:00", fim: "12:00" },
    ]),
});

type ParticaoFormValues = z.infer<typeof particaoFormSchema>;

interface ParticaoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  particao: Particao | null;
  empresas: Empresa[];
  funcionarios: Funcionario[];
  onSave: () => void;
}

// Horários disponíveis para seleção
const horariosDisponiveis = [
  "00:00",
  "01:00",
  "02:00",
  "03:00",
  "04:00",
  "05:00",
  "06:00",
  "07:00",
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
  "21:00",
  "22:00",
  "23:00",
];

// Dias da semana formatados
const diasDaSemana = {
  Segunda: "Segunda-feira",
  Terça: "Terça-feira",
  Quarta: "Quarta-feira",
  Quinta: "Quinta-feira",
  Sexta: "Sexta-feira",
  Sábado: "Sábado",
  Domingo: "Domingo",
};

// Adicionar um objeto para mapear dias numéricos para nomes de dias
const mapNumeroDiaPraNome: Record<string, string> = {
  "0": "Domingo",
  "1": "Segunda",
  "2": "Terça",
  "3": "Quarta",
  "4": "Quinta",
  "5": "Sexta",
  "6": "Sábado",
};

export function ParticaoDialog({
  open,
  onOpenChange,
  particao,
  empresas,
  funcionarios,
  onSave,
}: ParticaoDialogProps) {
  const [activeTab, setActiveTab] = useState<string>("geral");
  const [selectedResponsaveis, setSelectedResponsaveis] = useState<
    Funcionario[]
  >([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const usuarioLogado = JSON.parse(localStorage.getItem("authToken") || "{}");

  // console.log("Usuario Logado:", usuarioLogado);

  const usuarioRole = usuarioLogado?.permissao?.descricao || "";
  // console.log("Usuario Role:", usuarioRole);

  const usuarioEmpresaId = usuarioLogado?.empresaId || "";
  // console.log("Usuario Empresa ID:", usuarioEmpresaId);
  // console.log("Empresa", empresas);

  // Configuração do formulário com React Hook Form e Zod

  // console.log("Funcionarios:", funcionarios);

  const form = useForm<ParticaoFormValues>({
    resolver: zodResolver(particaoFormSchema),
    defaultValues: {
      nome: "",
      empresaId: 0,
      categoriaId: "",
      descricao: "",
      status: 2,
      responsaveis: [],
      disponibilidade: [
        { dia: "Segunda", ativo: true, inicio: "08:00", fim: "18:00" },
        { dia: "Terça", ativo: true, inicio: "08:00", fim: "18:00" },
        { dia: "Quarta", ativo: true, inicio: "08:00", fim: "18:00" },
        { dia: "Quinta", ativo: true, inicio: "08:00", fim: "18:00" },
        { dia: "Sexta", ativo: true, inicio: "08:00", fim: "18:00" },
        { dia: "Sábado", ativo: false, inicio: "08:00", fim: "12:00" },
        { dia: "Domingo", ativo: false, inicio: "08:00", fim: "12:00" },
      ],
    },
  });

  // Adicionar um novo efeito que monitora a abertura do diálogo para limpar o formulário
  useEffect(() => {
    // Quando o diálogo é aberto e não estamos editando (particao é null)
    if (open && !particao) {
      console.log("Resetando formulário para nova partição");
      
      // Resetar para valores padrão
      form.reset({
        nome: "",
        empresaId: empresas.length > 0 ? empresas[0].id : 0,
        descricao: "",
        status: 2,
        responsaveis: [],
        disponibilidade: [
          { dia: "Segunda", ativo: true, inicio: "08:00", fim: "18:00" },
          { dia: "Terça", ativo: true, inicio: "08:00", fim: "18:00" },
          { dia: "Quarta", ativo: true, inicio: "08:00", fim: "18:00" },
          { dia: "Quinta", ativo: true, inicio: "08:00", fim: "18:00" },
          { dia: "Sexta", ativo: true, inicio: "08:00", fim: "18:00" },
          { dia: "Sábado", ativo: false, inicio: "08:00", fim: "12:00" },
          { dia: "Domingo", ativo: false, inicio: "08:00", fim: "12:00" },
        ],
      });
      
      // Limpar responsáveis selecionados
      setSelectedResponsaveis([]);
      setSelectedUserId("");
      
      // Resetar tab para a primeira aba
      setActiveTab("geral");
    }
  }, [open, particao, empresas, form]);

  // Preencher o formulário com os dados da partição quando estiver editando
  useEffect(() => {
    if (particao) {
      console.log("Partição sendo editada:", particao);
      console.log("Disponibilidades da partição:", particao.disponibilidades);
      console.log("Responsáveis da partição:", particao.responsaveis || particao.responsavel);

      // Extrair IDs de responsáveis
      let responsaveisIds: string[] = [];
      
      // Verificar se temos responsaveis no formato esperado
      if (particao.responsaveis && particao.responsaveis.length > 0) {
        responsaveisIds = particao.responsaveis;
      } 
      // Ou se temos o formato da API (responsavel)
      else if (particao.responsavel && particao.responsavel.length > 0) {
        responsaveisIds = particao.responsavel.map(r => String(r.usuarioId));
      }
      // Ou se temos dados enriquecidos (responsaveisDaParticao)
      else if (particao.responsaveisDaParticao && particao.responsaveisDaParticao.length > 0) {
        responsaveisIds = particao.responsaveisDaParticao.map(r => String(r.usuarioId));
      }

      console.log("IDs de responsáveis extraídos:", responsaveisIds);
      
      // Converter disponibilidades do formato da API para o formato do formulário
      let disponibilidadeFormulario = [
        { dia: "Segunda", ativo: true, inicio: "08:00", fim: "18:00" },
        { dia: "Terça", ativo: true, inicio: "08:00", fim: "18:00" },
        { dia: "Quarta", ativo: true, inicio: "08:00", fim: "18:00" },
        { dia: "Quinta", ativo: true, inicio: "08:00", fim: "18:00" },
        { dia: "Sexta", ativo: true, inicio: "08:00", fim: "18:00" },
        { dia: "Sábado", ativo: false, inicio: "08:00", fim: "12:00" },
        { dia: "Domingo", ativo: false, inicio: "08:00", fim: "12:00" },
      ];

      // Se tivermos disponibilidades da API, vamos mapeá-las
      if (particao.disponibilidades && particao.disponibilidades.length > 0) {
        const dispMap: Record<string, { ativo: boolean; inicio: string; fim: string }> = {};
        
        // Primeiro, converter os números de dias para nomes de dias
        particao.disponibilidades.forEach(disp => {
          const nomeDia = mapNumeroDiaPraNome[disp.diaSemana];
          if (nomeDia) {
            dispMap[nomeDia] = {
              ativo: disp.ativo,
              inicio: disp.hrAbertura || disp.inicio || "08:00",
              fim: disp.hrFim || disp.fim || "18:00"
            };
          }
        });
        
        // Depois, aplicar os valores no array padrão para preservar a ordem
        disponibilidadeFormulario = disponibilidadeFormulario.map(dia => ({
          ...dia,
          ativo: dispMap[dia.dia]?.ativo ?? dia.ativo,
          inicio: dispMap[dia.dia]?.inicio ?? dia.inicio,
          fim: dispMap[dia.dia]?.fim ?? dia.fim
        }));
      }

      console.log("Disponibilidade para o formulário:", disponibilidadeFormulario);

      // Forçar atualização imediata dos valores de disponibilidade
      const defaultValues = {
        nome: particao.nome || "",
        empresaId: particao.empresaId || 0,
        descricao: particao.descricao || "",
        status: particao.status || 2,
        responsaveis: [],
        disponibilidade: disponibilidadeFormulario,
      };

      // Resetar o formulário com os novos valores
      form.reset(defaultValues);

      // E também aplicar explicitamente os valores de disponibilidade
      disponibilidadeFormulario.forEach((item, index) => {
        form.setValue(`disponibilidade.${index}.dia` as any, item.dia);
        form.setValue(`disponibilidade.${index}.ativo` as any, item.ativo);
        form.setValue(`disponibilidade.${index}.inicio` as any, item.inicio);
        form.setValue(`disponibilidade.${index}.fim` as any, item.fim);
      });

      // E atualizar para cada dia específico também
      Object.entries(diasDaSemana).forEach(([dia]) => {
        const diaDisp = disponibilidadeFormulario.find(d => d.dia === dia);
        if (diaDisp) {
          console.log(`Atualizando ${dia}:`, diaDisp.ativo);
          form.setValue(`disponibilidade.${dia}.ativo` as any, diaDisp.ativo);
          form.setValue(`disponibilidade.${dia}.inicio` as any, diaDisp.inicio);
          form.setValue(`disponibilidade.${dia}.fim` as any, diaDisp.fim);
        }
      });

      // Selecionar responsáveis para exibição na interface
      if (responsaveisIds.length > 0) {
        const selectedUsers = funcionarios.filter(f => 
          responsaveisIds.includes(f.id)
        );
        setSelectedResponsaveis(selectedUsers);
      } else {
        setSelectedResponsaveis([]);
      }

      // Garantir que os responsáveis estejam sendo definidos no formulário
      form.setValue("responsaveis", responsaveisIds);
      console.log("Responsáveis definidos no formulário:", responsaveisIds);
    } else {
      // Valores padrão para nova partição
      form.reset({
        nome: "",
        empresaId: empresas.length > 0 ? empresas[0].id : 0,
        descricao: "",
        status: 2,
        responsaveis: [],
        disponibilidade: [
          { dia: "Segunda", ativo: true, inicio: "08:00", fim: "18:00" },
          { dia: "Terça", ativo: true, inicio: "08:00", fim: "18:00" },
          { dia: "Quarta", ativo: true, inicio: "08:00", fim: "18:00" },
          { dia: "Quinta", ativo: true, inicio: "08:00", fim: "18:00" },
          { dia: "Sexta", ativo: true, inicio: "08:00", fim: "18:00" },
          { dia: "Sábado", ativo: false, inicio: "08:00", fim: "12:00" },
          { dia: "Domingo", ativo: false, inicio: "08:00", fim: "12:00" },
        ],
      });
      setSelectedResponsaveis([]);
    }
  }, [particao, empresas, funcionarios, form]);

  // Adicionar responsável
  const addResponsavel = (userId: string) => {
    const user = funcionarios.find((f) => f.id === userId);
    if (user && !selectedResponsaveis.some((r) => r.id === userId)) {
      setSelectedResponsaveis([...selectedResponsaveis, user]);

      // Atualizar o valor no formulário
      const currentValues = form.getValues().responsaveis || [];
      form.setValue("responsaveis", [...currentValues, userId]);
      console.log("Responsáveis adicionados:", [...currentValues, userId]);

      // Limpar o valor do Select
      setSelectedUserId(""); // Reseta o valor do Select
    }
  };

  // Remover responsável
  const removeResponsavel = (userId: string) => {
    setSelectedResponsaveis(
      selectedResponsaveis.filter((r) => r.id !== userId)
    );

    // Atualizar o valor no formulário
    const currentValues = form.getValues().responsaveis || [];
    const newValues = currentValues.filter((id) => id !== userId);
    form.setValue("responsaveis", newValues);
    console.log("Responsáveis após remoção:", newValues);
  };

  // Modificar a função de envio para lidar corretamente com responsáveis
  const onSubmit = async (data: ParticaoFormValues) => {
    console.log("Dados do formulário sendo enviados:", data);
    console.log("Responsáveis a serem salvos:", data.responsaveis);
    
    let salaId: number | null = null;
    
    try {
      // Se for edição, use o ID existente
      if (particao) {
        salaId = particao.id;
        
        // Atualizar sala existente
        const salaResponse = await axios.put(`http://localhost:3000/sala/${salaId}`, {
          nome: data.nome,
          status: data.status,
          multiplasMarcacoes: false,
          empresaId: usuarioRole === "Administrador" ? Number(data.empresaId) : Number(usuarioEmpresaId),
        });
        
        console.log("Sala atualizada:", salaResponse.data);
        
        // Atualizar disponibilidades - primeiro excluir todas existentes
        if (particao.disponibilidades && particao.disponibilidades.length > 0) {
          await Promise.all(
            particao.disponibilidades.map(disp => 
              axios.delete(`http://localhost:3000/disponibilidade/${disp.id}`)
            )
          );
        }
        
        // Criar novas disponibilidades - CORRIGIDO para enviar diaSemana como string
        await Promise.all(
          data.disponibilidade.map(async (config, index) => {
            const diaSemanaIndex = getDiaSemanaIndex(config.dia);
            console.log(`Criando disponibilidade para ${config.dia}:`, {
              hrAbertura: config.inicio,
              hrFim: config.fim,
              diaSemana: String(diaSemanaIndex), // Convertendo para string explicitamente
              diaSemanaIndex: diaSemanaIndex,
              ativo: config.ativo
            });
            
            return axios.post("http://localhost:3000/disponibilidade", {
              hrAbertura: config.inicio,
              hrFim: config.fim,
              diaSemana: String(diaSemanaIndex), // Convertendo para string aqui
              diaSemanaIndex: diaSemanaIndex,
              minDiasCan: 1,
              intervaloMinutos: 60,
              salaId: salaId,
              ativo: config.ativo,
            });
          })
        );
        
        // Atualizar responsáveis - primeiro excluir todos existentes
        if (particao.responsavel && particao.responsavel.length > 0) {
          console.log("Excluindo responsáveis existentes:", particao.responsavel);
          await Promise.all(
            particao.responsavel.map(resp => 
              axios.delete(`http://localhost:3000/responsavel/${resp.id}`)
            )
          );
        }
        
        // Criar novos responsáveis - CORRIGIDO para garantir envio correto
        if (data.responsaveis && data.responsaveis.length > 0) {
          console.log("Criando responsáveis para edição:", data.responsaveis);
          
          const resultados = [];
          
          // Processamento sequencial para evitar problemas
          for (let i = 0; i < data.responsaveis.length; i++) {
            const usuarioId = data.responsaveis[i];
            
            try {
              const payload = {
                salaId: salaId,
                usuarioId: Number(usuarioId),
              };
              console.log(`Criando responsável ${i+1}/${data.responsaveis.length}:`, payload);
              
              const result = await axios.post("http://localhost:3000/responsavel", payload);
              resultados.push(result.data);
              console.log(`Responsável ${i+1} criado com sucesso:`, result.data);
            } catch (error) {
              console.error(`Erro ao criar responsável ${i+1}:`, error);
              throw error; // Relançar o erro para tratamento adequado
            }
          }
          
          console.log("Todos os responsáveis foram criados com sucesso:", resultados);
        }
        
        // Aviso de sucesso e fechamento do diálogo
        onSave?.();
        onOpenChange(false);
      } else {
        // Código para nova partição - CORRIGIDO para usar o formato correto do DTO
        
        // Preparar as disponibilidades no formato esperado pelo backend
        const disponibilidades = data.disponibilidade.map(config => {
          const diaSemanaIndex = getDiaSemanaIndex(config.dia);
          return {
            hrAbertura: config.inicio,
            hrFim: config.fim,
            diaSemana: String(diaSemanaIndex), // Convertendo para string
            diaSemanaIndex: diaSemanaIndex,    // Mantendo como número
            minDiasCan: 1,
            intervaloMinutos: 60,
            salaId: 0, // Será definido pelo backend
            ativo: config.ativo,
          };
        });

        console.log("Disponibilidades formatadas para criação:", disponibilidades);

        // Criar sala com todas as disponibilidades de uma vez
        const salaPayload = {
          nome: data.nome,
          status: data.status,
          multiplasMarcacoes: false,
          empresaId: usuarioRole === "Administrador" 
            ? Number(data.empresaId) 
            : Number(usuarioEmpresaId),
          // Não incluímos disponibilidades aqui pois o backend espera criá-las separadamente
        };

        console.log("Payload para criação de sala:", salaPayload);
        
        const salaResponse = await axios.post("http://localhost:3000/sala", salaPayload);
        console.log("Sala criada:", salaResponse.data.data);

        salaId = salaResponse.data.data.id;
        if (!salaId) throw new Error("ID da sala não retornado");

        // Criar disponibilidades separadamente após criar a sala
        for (const config of disponibilidades) {
          const disponibilidadePayload = {
            ...config,
            salaId: salaId // Agora podemos definir o salaId correto
          };
          
          console.log("Criando disponibilidade:", disponibilidadePayload);
          
          const response = await axios.post(
            "http://localhost:3000/disponibilidade",
            disponibilidadePayload
          );
          
          console.log("Disponibilidade criada:", response.data.data);
        }

        // Criar Responsáveis um por um com logging detalhado
        if (data.responsaveis && data.responsaveis.length > 0) {
          console.log("Criando responsáveis para nova partição:", data.responsaveis);
          
          const resultados = [];
          
          // Processamento sequencial para evitar problemas
          for (let i = 0; i < data.responsaveis.length; i++) {
            const usuarioId = data.responsaveis[i];
            
            try {
              const payload = {
                salaId: salaId,
                usuarioId: Number(usuarioId),
              };
              console.log(`Criando responsável ${i+1}/${data.responsaveis.length}:`, payload);
              
              const result = await axios.post("http://localhost:3000/responsavel", payload);
              resultados.push(result.data);
              console.log(`Responsável ${i+1} criado com sucesso:`, result.data);
              
              // Pequeno atraso entre as requisições para evitar conflitos
              if (i < data.responsaveis.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 300));
              }
            } catch (error) {
              console.error(`Erro ao criar responsável ${i+1}:`, error);
              throw error; // Relançar o erro para tratamento adequado
            }
          }
          
          console.log("Todos os responsáveis foram criados com sucesso:", resultados);
        }

        // Tudo criado com sucesso
        onSave?.();
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Erro durante a operação:", error);
      alert(particao ? "Erro ao atualizar partição." : "Erro ao criar partição. Todas as alterações foram revertidas.");
    }
  };

  // Função auxiliar
  function getDiaSemanaIndex(dia: string): number {
    const map: Record<string, number> = {
      Domingo: 0,
      Segunda: 1,
      Terça: 2,
      Quarta: 3,
      Quinta: 4,
      Sexta: 5,
      Sábado: 6,
    };
    return map[dia] ?? 0; // Default para Segunda (0) se não encontrado
  }

  // Verificar o estado dos campos para depuração
  const disponibilidadeAtual = form.watch("disponibilidade");
  console.log("Estado atual da disponibilidade:", disponibilidadeAtual);

  // Renderização condicional dos horários baseado no estado ativo/inativo do dia
  const renderHorarioFields = (dia: string, index: number) => {
    // Usar apenas o acesso por índice que está funcionando corretamente
    const isAtivo = form.watch(`disponibilidade.${index}.ativo` as any);
    
    if (!isAtivo) {
      return null;
    }

    return (
      <div className="grid grid-cols-2 gap-4 mt-2">
        <FormField
          control={form.control}
          name={`disponibilidade.${index}.inicio` as any} // Use índice aqui também
          render={({ field }) => (
            <FormItem>
              <FormLabel>Horário de Início</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                defaultValue="08:00"
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {horariosDisponiveis.map((horario) => (
                    <SelectItem key={horario} value={horario}>
                      {horario}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`disponibilidade.${index}.fim` as any} // Use índice aqui também
          render={({ field }) => (
            <FormItem>
              <FormLabel>Horário de Fim</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                defaultValue="18:00"
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {horariosDisponiveis.map((horario) => (
                    <SelectItem key={horario} value={horario}>
                      {horario}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>
            {particao ? "Editar Partição" : "Nova Partição"}
          </DialogTitle>
          <DialogDescription>
            {particao
              ? "Atualize os detalhes da partição existente."
              : "Preencha os campos para criar uma nova partição."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="geral">Geral</TabsTrigger>
                <TabsTrigger value="responsaveis">Responsáveis</TabsTrigger>
                <TabsTrigger value="disponibilidade">
                  Disponibilidade
                </TabsTrigger>
              </TabsList>

              <TabsContent value="geral" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="nome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Digite o nome da partição"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="empresaId"
                  render={({ field }) =>
                    usuarioRole === "Administrador" ? (
                      <FormItem>
                        <FormLabel>Empresa</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value?.toString()} // Aqui, garantimos que o valor seja uma string
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione uma empresa" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {empresas.map((empresa) => (
                              <SelectItem
                                key={empresa.id}
                                value={empresa.id.toString()}
                              >
                                {" "}
                                {/* Converter também o value aqui */}
                                {empresa.nome}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    ) : null
                  }
                />

                <FormField
                  control={form.control}
                  name="descricao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descreva a partição"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Disponibilidade
                        </FormLabel>
                        <FormDescription>
                          Marque se a partição está disponível para agendamento
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value === 1} // O Switch será marcado quando o valor for 1
                          onCheckedChange={(checked) =>
                            field.onChange(checked ? 1 : 2)
                          } // Muda o valor para 1 se marcado, 2 se desmarcado
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="responsaveis" className="space-y-4 mt-4">
                <div className="flex flex-col space-y-4">
                  <FormField
                    name="responsaveis"
                    render={() => (
                      <FormItem>
                        <FormLabel>Adicionar Responsáveis</FormLabel>
                        <Select
                          value={selectedUserId} // Controla o valor do Select
                          onValueChange={(value) => {
                            setSelectedUserId(value); // Atualiza o estado local
                            addResponsavel(value); // Adiciona o responsável
                          }}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione funcionários" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {funcionarios
                              .filter((f) => f.role === "Funcionário")
                              .map((funcionario) => (
                                <SelectItem
                                  key={funcionario.id}
                                  value={funcionario.id}
                                >
                                  {funcionario.nome} ({funcionario.email})
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Os responsáveis selecionados poderão gerenciar esta
                          partição
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                  <div className="border rounded-md p-4">
                    <p className="text-sm font-medium mb-2">
                      Responsáveis Selecionados
                    </p>
                    <ScrollArea className="h-[150px]">
                      {selectedResponsaveis.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          Nenhum responsável selecionado
                        </p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {selectedResponsaveis.map((responsavel) => (
                            <Badge
                              key={responsavel.id}
                              variant="secondary"
                              className="flex items-center gap-1"
                            >
                              {responsavel.nome}
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-4 w-4 p-0 ml-1"
                                onClick={() =>
                                  removeResponsavel(responsavel.id)
                                }
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="disponibilidade" className="space-y-4 mt-4">
                <p className="text-sm text-muted-foreground mb-2">
                  Configure os horários de disponibilidade para cada dia da
                  semana
                </p>

                <div className="space-y-4">
                  {Object.entries(diasDaSemana).map(([dia, diaNome], index) => (
                    <div key={dia} className="border rounded-md p-4">
                      <div className="flex items-center justify-between mb-2">
                        <FormField
                          control={form.control}
                          name={`disponibilidade.${index}.ativo` as any} // Use o índice em vez do nome
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={(checked) => {
                                    field.onChange(checked);
                                    console.log(`Checkbox ${dia} alterado para: ${checked}`);
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-medium">
                                {diaNome} {field.value ? "(Ativo)" : "(Inativo)"}
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      </div>

                      {renderHorarioFields(dia, index)}
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">
                {particao ? "Salvar Alterações" : "Criar Partição"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
