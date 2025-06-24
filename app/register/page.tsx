"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Package, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

export default function RegisterPage() {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (formData.password !== formData.confirmPassword) {
            toast({
                title: "Erro",
                description: "As senhas não coincidem.",
                variant: "destructive",
            });
            setLoading(false);
            return;
        }

        try {
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                toast({
                    title: "Conta criada com sucesso!",
                    description: "Agora você pode fazer login.",
                });
                router.push("/login");
            } else {
                toast({
                    title: "Erro ao criar conta",
                    description: data.error || "Ocorreu um erro inesperado.",
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Erro",
                description: "Ocorreu um erro inesperado.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
            <div className="w-full max-w-md space-y-6">
                {/* Back to home */}
                <Link
                    href="/"
                    className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar para início
                </Link>

                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                            <Package className="h-6 w-6 text-primary" />
                        </div>
                        <CardTitle className="text-2xl font-bold">
                            Criar sua conta
                        </CardTitle>
                        <CardDescription>
                            Preencha os dados para começar a usar o sistema
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nome completo</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    type="text"
                                    placeholder="Seu nome completo"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="bg-background/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="seu@email.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="bg-background/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Senha</Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    minLength={6}
                                    className="bg-background/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">
                                    Confirmar senha
                                </Label>
                                <Input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    placeholder="••••••••"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    className="bg-background/50"
                                />
                            </div>
                            <Button
                                type="submit"
                                className="w-full bg-primary hover:bg-primary/90"
                                disabled={loading}
                            >
                                {loading ? "Criando conta..." : "Criar conta"}
                            </Button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-muted-foreground">
                                Já tem uma conta?{" "}
                                <Link
                                    href="/login"
                                    className="text-primary hover:underline"
                                >
                                    Fazer login
                                </Link>
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <div className="text-center text-xs text-muted-foreground">
                    <p>
                        Ao criar uma conta, você concorda com nossos{" "}
                        <Link href="#" className="underline hover:no-underline">
                            Termos de Uso
                        </Link>{" "}
                        e{" "}
                        <Link href="#" className="underline hover:no-underline">
                            Política de Privacidade
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
