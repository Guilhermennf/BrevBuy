"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn, getSession } from "next-auth/react";
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

export default function LoginPage() {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const result = await signIn("credentials", {
                email: formData.email,
                password: formData.password,
                redirect: false,
            });

            if (result?.error) {
                toast({
                    title: "Erro no login",
                    description: "Email ou senha incorretos.",
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "Login realizado com sucesso!",
                    description: "Redirecionando para o dashboard...",
                });
                router.push("/dashboard");
                router.refresh();
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
                            Bem-vindo de volta
                        </CardTitle>
                        <CardDescription>
                            Entre na sua conta para acessar o dashboard
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
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
                                    className="bg-background/50"
                                />
                            </div>
                            <Button
                                type="submit"
                                className="w-full bg-primary hover:bg-primary/90"
                                disabled={loading}
                            >
                                {loading ? "Entrando..." : "Entrar"}
                            </Button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-muted-foreground">
                                Não tem uma conta?{" "}
                                <Link
                                    href="/register"
                                    className="text-primary hover:underline"
                                >
                                    Criar conta
                                </Link>
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <div className="text-center text-xs text-muted-foreground">
                    <p>
                        Ao entrar, você concorda com nossos{" "}
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
