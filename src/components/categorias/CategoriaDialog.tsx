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
import { Categoria, useCategorias } from "@/hooks/useCategorias";

interface CategoriaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoria: Categoria | null;
  onSave: () => void;
}

// Esquema de validação
const categoriaSchema = z.object({
  description: z
    .string()
    .min(2, { message: "O nome deve ter pelo menos 2 caracteres" }),
  partitionPrefix: z
    .string()
    .min(2, { message: "O nome da partição deve ter pelo menos 2 caracteres" }),
});

type CategoriaFormValues = z.infer<typeof categoriaSchema>;

const getAuthHeaders = () => {
  const accessToken = localStorage.getItem("authToken")?.replace(/^"|"$/g, "");
  return {
    "Content-Type": "application/json",
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };
};

export function CategoriaDialog({
  open,
  onOpenChange,
  categoria,
  onSave,
}: CategoriaDialogProps) {
  const isEditing = !!categoria;

  const form = useForm<CategoriaFormValues>({
    resolver: zodResolver(categoriaSchema),
    defaultValues: {
      description: "",
      partitionPrefix: "",
    },
  });

  // Atualiza o formulário quando a categoria muda
  useEffect(() => {
    if (categoria) {
      form.reset({
        description: categoria.description || "",
        partitionPrefix: categoria.partitionPrefix || "",
      });
    } else {
      form.reset({
        description: "",
        partitionPrefix: "",
      });
    }
  }, [categoria, form]);

  const onSubmit = async (values: CategoriaFormValues) => {
    try {
      if (isEditing && categoria) {
        // Atualizar categoria
        const payload = {
          description: values.description,
          partitionPrefix: values.partitionPrefix,
        };

        const apiUrl = import.meta.env.VITE_API_URL || "";
        const endpoint = apiUrl.startsWith("http")
          ? `${apiUrl}/company-categories/${categoria.id}`
          : `http://${apiUrl}/company-categories/${categoria.id}`;

        const response = await fetch(endpoint, {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`Erro na requisição: ${response.statusText}`);
        }
      } else {
        // Criar nova categoria
        const payload = {
          description: values.description,
          partitionPrefix: values.partitionPrefix,
        };

        const apiUrl = import.meta.env.VITE_API_URL || "";
        const endpoint = apiUrl.startsWith("http")
          ? `${apiUrl}/company-categories`
          : `http://${apiUrl}/company-categories`;

        const response = await fetch(endpoint, {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`Erro na requisição: ${response.statusText}`);
        }
      }

      if (onSave) onSave();
    } catch (error) {
      console.error("Erro ao salvar categoria:", error);
    }
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
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 py-4"
          >
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Categoria</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Barbearia, Consultório, Coworking"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="partitionPrefix"
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
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
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
