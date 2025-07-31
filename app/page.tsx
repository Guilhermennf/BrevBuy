"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Package, ArrowRight, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Dashboard from "@/assets/images/dashboard.png";
import Products from "@/assets/images/products.png";
import Categories from "@/assets/images/categories.png";
import { ThemeToggle } from "@/components/theme/theme-toggle";

const systemPreviews = [
  {
    title: "Dashboard",
    description:
      "Visualize seus produtos, vendas e lucros em um só lugar. Tenha uma visão completa do seu negócio com gráficos e métricas em tempo real.",
    image: Dashboard,
  },
  {
    title: "Gestão de Produtos",
    description:
      "Cadastre e gerencie seus produtos de forma simples. Acompanhe estoque, preços de compra e venda, e histórico de vendas.",
    image: Products,
  },
  {
    title: "Categorias",
    description:
      "Crie categorias para organizar seus produtos. Categorize por tipo, marca, categoria, etc.",
    image: Categories,
  },
];

export default function LandingPage() {
  const { data: session } = useSession();
  const [activePreview, setActivePreview] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Função simplificada para trocar de preview sem transição problemática
  const handlePreviewChange = (index: number) => {
    if (index === activePreview) return;
    setTimeout(() => {
      setActivePreview(index);
    }, 200);
  };

  // Fechar menu quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        mobileMenuOpen &&
        !target.closest("#mobile-menu") &&
        !target.closest("#mobile-menu-button")
      ) {
        setMobileMenuOpen(false);
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden"; // Previne scroll do body
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2 flex-shrink-0">
              <Package className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              <span className="text-lg sm:text-xl font-bold">BrevBuy</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <ThemeToggle />
              {session ? (
                <Link href="/dashboard">
                  <Button className="flex items-center">
                    <span className="hidden lg:inline">Ir para Dashboard</span>
                    <span className="lg:hidden">Dashboard</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <div className="flex items-center space-x-2 lg:space-x-4">
                  <Link href="/login">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="lg:size-default"
                    >
                      Entrar
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button size="sm" className="lg:size-default">
                      <span className="hidden lg:inline">Começar Agora</span>
                      <span className="lg:hidden">Começar</span>
                      <ArrowRight className="ml-1 lg:ml-2 h-3 w-3 lg:h-4 lg:w-4" />
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                id="mobile-menu-button"
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 relative z-60"
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Backdrop escuro para mobile menu */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Navigation Dropdown */}
      <div
        id="mobile-menu"
        className={`fixed top-16 left-0 right-0 z-50 md:hidden transition-all duration-300 ease-in-out ${
          mobileMenuOpen
            ? "opacity-100 translate-y-0 visible"
            : "opacity-0 -translate-y-4 invisible"
        }`}
      >
        <div className="mx-4 mt-2 bg-background/95 backdrop-blur border border-border/40 rounded-lg shadow-lg">
          <div className="p-4 space-y-3">
            {/* Theme toggle for mobile */}
            <div className="flex justify-center">
              <ThemeToggle />
            </div>
            {session ? (
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block"
              >
                <Button
                  className="w-full justify-between group hover:bg-primary/90"
                  size="sm"
                >
                  Ir para Dashboard
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            ) : (
              <div className="space-y-3">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block"
                >
                  <Button
                    variant="ghost"
                    className="w-full hover:bg-muted"
                    size="sm"
                  >
                    Entrar
                  </Button>
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block"
                >
                  <Button
                    className="w-full justify-between group hover:bg-primary/90"
                    size="sm"
                  >
                    Começar Agora
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-20 sm:py-32 px-4">
        <div className="container mx-auto text-center">
          {/* <Badge variant="secondary" className="mb-6">
            ✨ Sistema de Gestão Inteligente
          </Badge> */}

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6">
            A solução <span className="text-slate-400">definitiva</span>
            <br />
            para gestão de produtos.
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto px-4">
            Uma plataforma completa para gerenciar produtos de revenda com
            automação, análise de lucros e controle total do seu estoque.
          </p>

          {session ? (
            <Link href="/dashboard">
              <Button size="lg" className="bg-primary/90 hover:bg-primary">
                Acessar Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <Link href="/register">
              <Button size="lg" className="bg-primary/90 hover:bg-primary">
                Começar Agora
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* Preview Section */}
      <section className="py-20 px-4 bg-muted/20 overflow-hidden">
        <div className="container mx-auto">
          {/* Desktop Layout */}
          <div className="hidden lg:grid lg:grid-cols-2 gap-16 items-start">
            {/* Preview Text */}
            <div className="space-y-12">
              {systemPreviews.map((preview, index) => (
                <div
                  key={index}
                  onClick={() => handlePreviewChange(index)}
                  className={`p-6 rounded-lg transition-all duration-300 cursor-pointer border-l-4 ${
                    index === activePreview
                      ? "bg-muted/30 border-primary"
                      : "border-transparent hover:bg-muted/30 hover:border-muted-foreground/20"
                  }`}
                  style={{ borderLeftWidth: 4 }}
                >
                  <h3
                    className={`text-xl font-semibold mb-2 transition-colors ${
                      index === activePreview ? "text-primary" : ""
                    }`}
                  >
                    {preview.title}
                  </h3>
                  <p className="text-muted-foreground">{preview.description}</p>
                </div>
              ))}
            </div>

            {/* Preview Image - Desktop */}
            <div className="relative w-[45rem] h-[400px] overflow-hidden rounded-xl sm:w-auto lg:mt-0 lg:w-[67rem] lg:h-[510px] border">
              {systemPreviews.map((preview, index) => (
                <img
                  key={index}
                  src={preview.image.src}
                  alt={`Preview do ${preview.title}`}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                    index === activePreview ? "opacity-100" : "opacity-0"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Mobile Layout - Horizontal Tabs */}
          <div className="lg:hidden">
            {/* Mobile Tabs */}
            <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
              {systemPreviews.map((preview, index) => (
                <button
                  key={index}
                  onClick={() => handlePreviewChange(index)}
                  className={`flex-shrink-0 px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                    index === activePreview
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {preview.title}
                </button>
              ))}
            </div>

            {/* Mobile Description */}
            <div className="mb-8 text-center">
              <h3 className="text-xl font-semibold mb-2 text-primary">
                {systemPreviews[activePreview].title}
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {systemPreviews[activePreview].description}
              </p>
            </div>

            {/* Mobile Image */}
            <div className="relative w-full h-[300px] sm:h-[400px] rounded-l-lg overflow-hidden border-l border-t border-b">
              {systemPreviews.map((preview, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-all duration-500 ease-out ${
                    index === activePreview
                      ? "opacity-100 translate-x-0"
                      : "opacity-0 translate-x-full"
                  }`}
                >
                  <img
                    src={preview.image.src}
                    alt={`Preview do ${preview.title}`}
                    className="w-[200%] h-full object-cover object-left"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
