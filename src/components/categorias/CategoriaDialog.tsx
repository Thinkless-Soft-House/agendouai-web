
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
import { Categoria } from "@/pages/Categorias";

interface CategoriaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoria: Categoria | null;
  onSave: () => void;
}

// Esquema de validação
const categoriaSchema = z.object({
  nome: z.string().min(2, { message: "O nome deve ter pelo menos 2 caracteres" }),
  nomeParticao: z.string().min(2, { message: "O nome da partição deve ter pelo menos 2 caracteres" }),
});

type CategoriaFormValues = z.infer<typeof categoriaSchema>;

export function CategoriaDialog({ open, onOpenChange, categoria, onSave }: CategoriaDialogProps) {
  const isEditing = !!categoria;

  const form = useForm<CategoriaFormValues>({
    resolver: zodResolver(categoriaSchema),
    defaultValues: {
      nome: "",
      nomeParticao: "",
    },
  });

  // Atualiza o formulário quando a categoria muda
  useEffect(() => {
    if (categoria) {
      form.reset({
        nome: categoria.nome,
        nomeParticao: categoria.nomeParticao,
      });
    } else {
      form.reset({
        nome: "",
        nomeParticao: "",
      });
    }
  }, [categoria, form]);

  const onSubmit = (values: CategoriaFormValues) => {
    // Aqui faríamos a chamada para a API
    console.log("Form values:", values);
    
    // Simular delay de API
    setTimeout(() => {
      onSave();
    }, 500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Categoria" : "Nova Categoria"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Edite os detalhes da categoria abaixo."
              : "Preencha os campos abaixo para criar uma nova categoria."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Categoria</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Barbearia, Consultório, Coworking" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nomeParticao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Partição</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Cadeira, Sala, Mesa" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {isEditing ? "Salvar Alterações" : "Criar Categoria"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
