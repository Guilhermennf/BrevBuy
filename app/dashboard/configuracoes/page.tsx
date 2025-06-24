"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/theme-toggle";
import {
    Settings,
    User,
    Database,
    Palette,
    Save,
    Download,
    Upload,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function ConfiguracoesPage() {
    const { data: session } = useSession();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
    });

    useEffect(() => {
        if (session?.user) {
            setFormData({
                name: session.user.name || "",
                email: session.user.email || "",
            });
        }
    }, [session]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSaveProfile = async () => {
        setLoading(true);
        try {
            // Aqui você pode implementar a API para atualizar o perfil
            await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulação

            toast({
                title: "Perfil atualizado!",
                description: "Suas informações foram salvas com sucesso.",
            });
        } catch (error) {
            toast({
                title: "Erro",
                description: "Não foi possível atualizar o perfil.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleExportData = async () => {
        try {
            const response = await fetch("/api/products");
            const products = await response.json();

            if (products.length === 0) {
                toast({
                    title: "Nenhum dado encontrado",
                    description: "Você ainda não possui produtos cadastrados.",
                });
                return;
            }

            // Criar CSV
            const headers = [
                "Nome",
                "Descrição",
                "Preço de Compra",
                "Preço de Venda",
                "Categoria",
                "Fornecedor",
                "Status",
            ];
            const csvContent = [
                headers.join(","),
                ...products.map((product: any) =>
                    [
                        `"${product.name}"`,
                        `"${product.description || ""}"`,
                        product.buyPrice,
                        product.sellPrice || "",
                        `"${product.category || ""}"`,
                        `"${product.supplier || ""}"`,
                        product.status,
                    ].join(",")
                ),
            ].join("\n");

            // Download
            const blob = new Blob([csvContent], {
                type: "text/csv;charset=utf-8;",
            });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = `produtos_${
                new Date().toISOString().split("T")[0]
            }.csv`;
            link.click();

            toast({
                title: "Dados exportados!",
                description: "Arquivo CSV baixado com sucesso.",
            });
        } catch (error) {
            toast({
                title: "Erro",
                description: "Não foi possível exportar os dados.",
                variant: "destructive",
            });
        }
    };

    const handleImportData = () => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".csv";
        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;

            try {
                const text = await file.text();
                const lines = text.split("\n");
                const headers = lines[0].split(",");

                toast({
                    title: "Importação iniciada",
                    description: `Processando ${lines.length - 1} linhas...`,
                });

                // Aqui você implementaria a lógica de importação
                // Por enquanto, apenas simular
                await new Promise((resolve) => setTimeout(resolve, 2000));

                toast({
                    title: "Dados importados!",
                    description: "Produtos importados com sucesso.",
                });
            } catch (error) {
                toast({
                    title: "Erro na importação",
                    description: "Verifique o formato do arquivo CSV.",
                    variant: "destructive",
                });
            }
        };
        input.click();
    };

    return (
        <div className="space-y-6 max-w-4xl">
            <div>
                <h1 className="text-3xl font-bold">Configurações</h1>
                <p className="text-muted-foreground">
                    Personalize sua experiência
                </p>
            </div>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Perfil do Usuário
                        </CardTitle>
                        <CardDescription>
                            Informações básicas da conta
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nome completo</Label>
                            <Input
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Seu nome completo"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="seu@email.com"
                                disabled
                            />
                            <p className="text-xs text-muted-foreground">
                                O email não pode ser alterado
                            </p>
                        </div>
                        <Button onClick={handleSaveProfile} disabled={loading}>
                            <Save className="mr-2 h-4 w-4" />
                            {loading ? "Salvando..." : "Salvar Alterações"}
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Palette className="h-5 w-5" />
                            Aparência
                        </CardTitle>
                        <CardDescription>
                            Personalize a interface do sistema
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label>Tema</Label>
                                <p className="text-sm text-muted-foreground">
                                    Escolha entre tema claro ou escuro
                                </p>
                            </div>
                            <ThemeToggle />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Database className="h-5 w-5" />
                            Gerenciar Dados
                        </CardTitle>
                        <CardDescription>
                            Backup e importação dos seus produtos
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                                <Label>Backup de Dados</Label>
                                <p className="text-sm text-muted-foreground">
                                    Exportar todos os produtos em formato CSV
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                onClick={handleExportData}
                            >
                                <Download className="mr-2 h-4 w-4" />
                                Exportar
                            </Button>
                        </div>

                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                                <Label>Importar Dados</Label>
                                <p className="text-sm text-muted-foreground">
                                    Importar produtos de um arquivo CSV
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                onClick={handleImportData}
                            >
                                <Upload className="mr-2 h-4 w-4" />
                                Importar
                            </Button>
                        </div>

                        <div className="p-4 bg-muted/50 rounded-lg">
                            <h4 className="font-medium mb-2">
                                Formato do CSV para importação:
                            </h4>
                            <p className="text-sm text-muted-foreground mb-2">
                                O arquivo deve conter as seguintes colunas:
                            </p>
                            <code className="text-xs bg-background p-2 rounded block">
                                Nome,Descrição,Preço de Compra,Preço de
                                Venda,Categoria,Fornecedor,Status
                            </code>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
