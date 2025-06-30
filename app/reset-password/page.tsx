"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Package, ArrowLeft, Lock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { resetPasswordSchema, ResetPasswordFormData } from "@/lib/validations";
import { useToast } from "@/hooks/use-toast";
import { PasswordInput } from "@/components/ui/password-input";

export default function ResetPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [validatingToken, setValidatingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [passwordReset, setPasswordReset] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: token || "",
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    const validateToken = async () => {
      if (!token || !email) {
        setValidatingToken(false);
        setTokenValid(false);
        toast({
          title: "Link inválido",
          description: "O link de redefinição de senha é inválido.",
          variant: "destructive",
        });
        return;
      }

      try {
        const response = await fetch(
          `/api/auth/reset-password?token=${encodeURIComponent(
            token
          )}&email=${encodeURIComponent(email)}`,
          {
            method: "GET",
          }
        );

        const result = await response.json();

        if (response.ok && result.valid) {
          setTokenValid(true);
        } else {
          setTokenValid(false);
          toast({
            title: "Token inválido",
            description:
              result.error || "O token de redefinição é inválido ou expirou.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Erro ao validar token:", error);
        setTokenValid(false);
        toast({
          title: "Erro",
          description: "Erro ao validar token. Tente novamente.",
          variant: "destructive",
        });
      } finally {
        setValidatingToken(false);
      }
    };

    validateToken();
  }, [token, email, toast]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    setLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: data.token,
          password: data.password,
          confirmPassword: data.confirmPassword,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setPasswordReset(true);
        toast({
          title: "Senha redefinida!",
          description: result.message,
        });
      } else {
        toast({
          title: "Erro",
          description: result.error || "Erro ao redefinir senha",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro inesperado:", error);
      toast({
        title: "Erro",
        description: "Erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (validatingToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Package className="h-6 w-6 text-primary animate-spin" />
              </div>
              <CardTitle className="text-2xl font-bold">
                Validando link...
              </CardTitle>
              <CardDescription>
                Aguarde enquanto verificamos o link de redefinição
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <Link
            href="/login"
            className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para login
          </Link>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
                <Lock className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <CardTitle className="text-2xl font-bold">
                Link inválido
              </CardTitle>
              <CardDescription>
                O link de redefinição de senha é inválido ou expirou. Solicite
                um novo link para continuar.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button asChild className="w-full">
                  <Link href="/forgot-password">Solicitar novo link</Link>
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/login">Voltar para login</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (passwordReset) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-2xl font-bold">
                Senha redefinida!
              </CardTitle>
              <CardDescription>
                Sua senha foi redefinida com sucesso. Agora você pode fazer
                login com sua nova senha.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                asChild
                className="w-full"
                onClick={() => router.push("/login")}
              >
                <Link href="/login">Fazer login</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <Link
          href="/login"
          className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para login
        </Link>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">
              Redefinir senha
            </CardTitle>
            <CardDescription>Digite sua nova senha abaixo</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <input type="hidden" {...register("token")} />

              <div className="space-y-2">
                <Label htmlFor="password">Nova senha</Label>
                <PasswordInput
                  id="password"
                  placeholder="••••••••"
                  {...register("password")}
                  className="bg-background/50"
                />
                {errors.password && (
                  <p className="text-sm text-red-500">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
                <PasswordInput
                  id="confirmPassword"
                  placeholder="••••••••"
                  {...register("confirmPassword")}
                  className="bg-background/50"
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90"
                disabled={loading}
              >
                {loading ? "Redefinindo..." : "Redefinir senha"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
