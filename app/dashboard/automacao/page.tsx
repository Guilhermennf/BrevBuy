"use client";

import { ProductAutomation } from "@/components/upload/automation-upload";
import { SubscriptionGuard } from "@/components/subscription-guard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Clock, TrendingUp, CheckCircle } from "lucide-react";

export default function AutomacaoPage() {
  const automationStats = [
    {
      title: "Produtos Cadastrados",
      value: "127",
      description: "Este mês",
      icon: TrendingUp,
      trend: "+23%",
    },
    {
      title: "Tempo Economizado",
      value: "8.5h",
      description: "Horas poupadas",
      icon: Clock,
      trend: "↗️",
    },
    {
      title: "Taxa de Sucesso",
      value: "94%",
      description: "Precisão da IA",
      icon: CheckCircle,
      trend: "↗️",
    },
    {
      title: "Processamento",
      value: "2.3s",
      description: "Tempo médio por imagem",
      icon: Zap,
      trend: "⚡",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Automação de Produtos</h1>
          <p className="text-muted-foreground">
            Cadastre produtos automaticamente usando inteligência artificial
          </p>
        </div>
        <Badge
          variant="secondary"
          className="bg-green-100 text-green-800 no-hover"
        >
          IA Ativa
        </Badge>
      </div>

      <SubscriptionGuard featureName="A automação de produtos">
        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {automationStats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">
                      {stat.description}
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <stat.icon className="h-5 w-5 text-muted-foreground mb-1" />
                    <span className="text-xs text-green-600">{stat.trend}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Componente principal de automação */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Cadastro Automático de Produtos
            </CardTitle>
            <CardDescription>
              Faça upload de qualquer imagem de produto e deixe a IA preencher
              automaticamente os campos de nome, preço, descrição e categoria.
              Funciona com screenshots de sites, fotos de produtos, capturas de
              tela de lojas, etc.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProductAutomation />
          </CardContent>
        </Card>
      </SubscriptionGuard>
    </div>
  );
}
