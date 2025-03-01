
import React, { useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Particao } from "@/pages/Particoes";
import { Empresa } from "@/pages/Empresas";

// Schema para validação do formulário
const particaoFormSchema = z.object({
  nome: z
    .string()
    .min(3, { message: "Nome deve ter pelo menos 3 caracteres" })
    .max(50, { message: "Nome deve ter no máximo 50 caracteres" }),
  tipo: z.enum(["sala", "funcionario", "equipamento"], {
    required_error: "Por favor selecione um tipo de partição",
  }),
  empresaId: z.string({ required_error: "Por favor selecione uma empresa" }),
  descricao: z
    .string()
    .min(5, { message: "Descrição deve ter pelo menos 5 caracteres" })
    .max(200, { message: "Descrição deve ter no máximo 200 caracteres" }),
  capacidade: z
    .number()
    .min(1, { message: "Capacidade deve ser pelo menos 1" })
    .max(100, { message: "Capacidade deve ser no máximo 100" })
    .optional(),
  disponivel: z.boolean().default(true),
});

type ParticaoFormValues = z.infer<typeof particaoFormSchema>;

interface ParticaoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  particao: Particao | null;
  empresas: Empresa[];
  onSave: () => void;
}

export function ParticaoDialog({
  open,
  onOpenChange,
  particao,
  empresas,
  onSave,
}: ParticaoDialogProps) {
  // Configuração do formulário com React Hook Form e Zod
  const form = useForm<ParticaoFormValues>({
    resolver: zodResolver(particaoFormSchema),
    defaultValues: {
      nome: "",
      tipo: "sala",
      empresaId: "",
      descricao: "",
      capacidade: undefined,
      disponivel: true,
    },
  });

  // Preencher o formulário com os dados da partição quando estiver editando
  useEffect(() => {
    if (particao) {
      form.reset({
        nome: particao.nome,
        tipo: particao.tipo,
        empresaId: particao.empresaId,
        descricao: particao.descricao,
        capacidade: particao.capacidade,
        disponivel: particao.disponivel,
      });
    } else {
      form.reset({
        nome: "",
        tipo: "sala",
        empresaId: empresas.length > 0 ? empresas[0].id : "",
        descricao: "",
        capacidade: undefined,
        disponivel: true,
      });
    }
  }, [particao, empresas, form]);

  // Função para lidar com o envio do formulário
  function onSubmit(data: ParticaoFormValues) {
    // Em um cenário real, aqui enviaríamos os dados para a API
    console.log("Dados do formulário:", data);
    
    // Notificar o componente pai que a operação foi concluída
    onSave();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
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
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite o nome da partição" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="tipo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="sala">Sala</SelectItem>
                        <SelectItem value="funcionario">Funcionário</SelectItem>
                        <SelectItem value="equipamento">Equipamento</SelectItem>
                      </SelectContent>
                    </Select>
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
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma empresa" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {empresas.map((empresa) => (
                          <SelectItem key={empresa.id} value={empresa.id}>
                            {empresa.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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

            {form.watch("tipo") === "sala" && (
              <FormField
                control={form.control}
                name="capacidade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacidade</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        placeholder="Capacidade da sala"
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value ? parseInt(value, 10) : undefined);
                        }}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>
                      Número máximo de pessoas que a sala pode acomodar
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="disponivel"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Disponibilidade</FormLabel>
                    <FormDescription>
                      Marque se a partição está disponível para agendamento
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

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
