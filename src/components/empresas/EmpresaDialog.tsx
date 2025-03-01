
import React, { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Empresa } from "@/pages/Empresas";

interface EmpresaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  empresa: Empresa | null;
  onSave: () => void;
}

// Esquema de validação
const empresaSchema = z.object({
  nome: z.string().min(2, { message: "O nome deve ter pelo menos 2 caracteres" }),
  cnpj: z.string().min(14, { message: "CNPJ inválido" }),
  endereco: z.string().min(5, { message: "Endereço muito curto" }),
  telefone: z.string().min(10, { message: "Telefone inválido" }),
  email: z.string().email({ message: "Email inválido" }),
  status: z.enum(["active", "inactive"], { 
    errorMap: () => ({ message: "Selecione um status" }) 
  }),
});

type EmpresaFormValues = z.infer<typeof empresaSchema>;

export function EmpresaDialog({ open, onOpenChange, empresa, onSave }: EmpresaDialogProps) {
  const isEditing = !!empresa;

  const form = useForm<EmpresaFormValues>({
    resolver: zodResolver(empresaSchema),
    defaultValues: {
      nome: "",
      cnpj: "",
      endereco: "",
      telefone: "",
      email: "",
      status: "active",
    },
  });

  // Atualiza o formulário quando a empresa muda
  useEffect(() => {
    if (empresa) {
      form.reset({
        nome: empresa.nome,
        cnpj: empresa.cnpj,
        endereco: empresa.endereco,
        telefone: empresa.telefone,
        email: empresa.email,
        status: empresa.status,
      });
    } else {
      form.reset({
        nome: "",
        cnpj: "",
        endereco: "",
        telefone: "",
        email: "",
        status: "active",
      });
    }
  }, [empresa, form]);

  const onSubmit = (values: EmpresaFormValues) => {
    // Aqui faríamos a chamada para a API
    console.log("Form values:", values);
    
    // Simular delay de API
    setTimeout(() => {
      onSave();
    }, 500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Empresa" : "Nova Empresa"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Edite os detalhes da empresa abaixo."
              : "Preencha os campos abaixo para criar uma nova empresa."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Empresa</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome da empresa" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cnpj"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CNPJ</FormLabel>
                    <FormControl>
                      <Input placeholder="00.000.000/0000-00" {...field} />
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
                      <Input placeholder="(00) 00000-0000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="contato@empresa.com.br" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endereco"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço</FormLabel>
                  <FormControl>
                    <Input placeholder="Rua, número, bairro, cidade - UF" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">Ativa</SelectItem>
                      <SelectItem value="inactive">Inativa</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {isEditing ? "Salvar Alterações" : "Criar Empresa"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
