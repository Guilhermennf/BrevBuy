"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import {
    Package,
    TrendingUp,
    Settings,
    BarChart3,
    ChevronDown,
    ChevronRight,
    Menu,
    X,
    LogOut,
    User,
    PackageCheck,
    Crown,
    Clock,
    AlertTriangle,
    CheckCircle,
    ChevronsUpDown,
    Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Command,
    CommandGroup,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import {
    SubscriptionProvider,
    useSubscription,
} from "@/hooks/use-subscription";

const navigation = [
    {
        name: "Dashboard",
        href: "/dashboard",
        icon: BarChart3,
    },
    {
        name: "Produtos",
        icon: Package,
        children: [
            { name: "Todos os produtos", href: "/dashboard/produtos" },
            { name: "Disponíveis", href: "/dashboard/produtos/disponiveis" },
            { name: "Vendidos", href: "/dashboard/produtos/vendidos" },
        ],
    },
    {
        name: "Categorias",
        href: "/dashboard/categorias",
        icon: PackageCheck,
    },
    {
        name: "Automação",
        href: "/dashboard/automacao",
        icon: TrendingUp,
        premium: true,
    },
    {
        name: "Configurações",
        href: "/dashboard/configuracoes",
        icon: Settings,
    },
];

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { data: session, status } = useSession();
    const [expandedItems, setExpandedItems] = useState<string[]>(["Produtos"]);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [subscriptionPopoverOpen, setSubscriptionPopoverOpen] =
        useState(false);
    const [isLargeScreen, setIsLargeScreen] = useState(true);
    const router = useRouter();
    const { subscription, loading } = useSubscription();

    // Detect screen size for responsive popover alignment
    useEffect(() => {
        const checkScreenSize = () => {
            setIsLargeScreen(window.innerWidth >= 640); // sm breakpoint
        };

        checkScreenSize();
        window.addEventListener("resize", checkScreenSize);

        return () => window.removeEventListener("resize", checkScreenSize);
    }, []);

    // Subscription options for the popover
    const subscriptionOptions = [
        {
            value: "manage",
            label: "Gerenciar Assinatura",
            href: "/dashboard/configuracoes",
            icon: Settings,
            show:
                subscription?.hasAccess &&
                subscription?.subscriptionStatus === "active",
        },
        {
            value: "upgrade",
            label:
                subscription?.subscriptionStatus === "cancelled"
                    ? "Reativar Assinatura"
                    : subscription?.isTrialActive
                    ? "Fazer Upgrade para PRO"
                    : "Ver Planos PRO",
            href: "/dashboard/configuracoes",
            icon: Crown,
            show:
                !subscription?.hasAccess ||
                subscription?.subscriptionStatus !== "active",
        },
    ];

    useEffect(() => {
        if (status === "loading") return; // Ainda carregando

        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    const toggleExpanded = (itemName: string) => {
        setExpandedItems((prev) =>
            prev.includes(itemName)
                ? prev.filter((name) => name !== itemName)
                : [...prev, itemName]
        );
    };

    const handleSignOut = () => {
        signOut({ callbackUrl: "/" });
    };

    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!session) {
        return null;
    }

    const NavItem = ({ item }: { item: any }) => {
        const hasChildren = item.children && item.children.length > 0;
        const isExpanded = expandedItems.includes(item.name);

        if (hasChildren) {
            return (
                <div>
                    <button
                        onClick={() => toggleExpanded(item.name)}
                        className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    >
                        <div className="flex items-center">
                            <item.icon className="mr-3 h-4 w-4" />
                            {item.name}
                            {item.premium && (
                                <Crown className="ml-2 h-3 w-3 text-yellow-500" />
                            )}
                        </div>
                        {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                        ) : (
                            <ChevronRight className="h-4 w-4" />
                        )}
                    </button>
                    {isExpanded && (
                        <div className="ml-6 mt-1 space-y-1">
                            {item.children.map((child: any) => (
                                <Link
                                    key={child.name}
                                    href={child.href}
                                    onClick={() => setSidebarOpen(false)}
                                    className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                                >
                                    {child.name}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            );
        }

        return (
            <Link
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
                <item.icon className="mr-3 h-4 w-4" />
                {item.name}
                {item.premium && (
                    <Crown className="ml-2 h-3 w-3 text-yellow-500" />
                )}
            </Link>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!session) {
        return null;
    }

    return (
        <SubscriptionProvider>
            <div className="flex h-screen bg-background overflow-hidden">
                {/* Mobile sidebar overlay */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 z-40 bg-background/80 mobile-overlay lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Sidebar */}
                <aside
                    className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border
                transform transition-transform duration-200 ease-in-out
                lg:translate-x-0 lg:static lg:inset-0 lg:z-auto
                ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            `}
                >
                    <div className="flex h-full flex-col">
                        {/* Logo */}
                        <div className="flex h-16 items-center justify-between px-6 border-b border-border shrink-0">
                            <div className="flex items-center gap-2">
                                <Package className="h-8 w-8 text-primary" />
                                <span className="text-lg font-semibold">
                                    BrevBuy
                                </span>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="lg:hidden"
                                onClick={() => setSidebarOpen(false)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Navigation */}
                        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto sidebar-scrollbar">
                            {navigation.map((item) => (
                                <NavItem key={item.name} item={item} />
                            ))}
                        </nav>
                    </div>
                </aside>

                {/* Main content area */}
                <div className="flex flex-1 flex-col min-w-0">
                    {/* Top header */}
                    <header className="flex h-16 items-center justify-between border-b border-border bg-background px-6 shrink-0">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSidebarOpen(true)}
                                className="lg:hidden"
                            >
                                <Menu className="h-4 w-4" />
                            </Button>

                            {/* Plan selector */}
                            <Popover
                                open={subscriptionPopoverOpen}
                                onOpenChange={setSubscriptionPopoverOpen}
                            >
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={subscriptionPopoverOpen}
                                        className="w-[120px] justify-between gap-2 border-primary/20 hover:border-primary/40"
                                    >
                                        <div className="flex items-center gap-2">
                                            {subscription?.hasAccess &&
                                            subscription?.subscriptionStatus ===
                                                "active" ? (
                                                <>
                                                    <Crown className="h-4 w-4 text-yellow-500" />
                                                    <span className=" sm:inline font-medium text-green-700">
                                                        PRO
                                                    </span>
                                                </>
                                            ) : subscription?.isTrialActive ? (
                                                <>
                                                    <Clock className="h-4 w-4 text-blue-500" />
                                                    <span className="hidden sm:inline font-medium text-blue-700">
                                                        Teste (
                                                        {
                                                            subscription.daysLeftInTrial
                                                        }
                                                        d)
                                                    </span>
                                                </>
                                            ) : (
                                                <>
                                                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                                                    <span className="hidden sm:inline font-medium text-orange-700">
                                                        {subscription?.subscriptionStatus ===
                                                        "cancelled"
                                                            ? "Cancelado"
                                                            : "Gratuito"}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                        <ChevronsUpDown className="h-4 w-4 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent
                                    className="w-[250px] p-0"
                                    align={isLargeScreen ? "start" : "center"}
                                    alignOffset={0}
                                    sideOffset={4}
                                >
                                    <Command>
                                        <CommandList>
                                            <CommandGroup>
                                                <CommandItem disabled>
                                                    <div className="flex items-center gap-3 w-full">
                                                        <div
                                                            className={cn(
                                                                "flex items-center justify-center w-8 h-8 rounded-full",
                                                                subscription?.hasAccess &&
                                                                    subscription?.subscriptionStatus ===
                                                                        "active"
                                                                    ? "bg-green-100"
                                                                    : subscription?.isTrialActive
                                                                    ? "bg-blue-100"
                                                                    : "bg-orange-100"
                                                            )}
                                                        >
                                                            {subscription?.hasAccess &&
                                                            subscription?.subscriptionStatus ===
                                                                "active" ? (
                                                                <Crown className="h-4 w-4 text-green-600" />
                                                            ) : subscription?.isTrialActive ? (
                                                                <Clock className="h-4 w-4 text-blue-600" />
                                                            ) : (
                                                                <AlertTriangle className="h-4 w-4 text-orange-600" />
                                                            )}
                                                        </div>
                                                        <div className="flex-1">
                                                            <p
                                                                className={cn(
                                                                    "font-medium",
                                                                    subscription?.hasAccess &&
                                                                        subscription?.subscriptionStatus ===
                                                                            "active"
                                                                        ? "text-green-400"
                                                                        : subscription?.isTrialActive
                                                                        ? "text-blue-800"
                                                                        : "text-orange-800"
                                                                )}
                                                            >
                                                                {subscription?.hasAccess &&
                                                                subscription?.subscriptionStatus ===
                                                                    "active"
                                                                    ? "Plano PRO Ativo"
                                                                    : subscription?.isTrialActive
                                                                    ? "Período Gratuito"
                                                                    : subscription?.subscriptionStatus ===
                                                                      "cancelled"
                                                                    ? "Assinatura Cancelada"
                                                                    : "Plano Gratuito"}
                                                            </p>
                                                            <p
                                                                className={cn(
                                                                    "text-xs",
                                                                    subscription?.hasAccess &&
                                                                        subscription?.subscriptionStatus ===
                                                                            "active"
                                                                        ? "text-green-300"
                                                                        : subscription?.isTrialActive
                                                                        ? "text-blue-600"
                                                                        : "text-orange-600"
                                                                )}
                                                            >
                                                                {subscription?.hasAccess &&
                                                                subscription?.subscriptionStatus ===
                                                                    "active"
                                                                    ? `${
                                                                          subscription.planType ===
                                                                          "monthly"
                                                                              ? "Mensal"
                                                                              : "Anual"
                                                                      } - Acesso completo`
                                                                    : subscription?.isTrialActive
                                                                    ? `${subscription.daysLeftInTrial} dias restantes`
                                                                    : subscription?.subscriptionStatus ===
                                                                      "cancelled"
                                                                    ? "Reative para ter acesso"
                                                                    : "Acesso limitado"}
                                                            </p>
                                                        </div>
                                                        {subscription?.hasAccess &&
                                                            subscription?.subscriptionStatus ===
                                                                "active" && (
                                                                <CheckCircle className="h-4 w-4 text-green-400" />
                                                            )}
                                                    </div>
                                                </CommandItem>
                                                <DropdownMenuSeparator />
                                                {/* Action options */}
                                                {subscriptionOptions
                                                    .filter(
                                                        (option) => option.show
                                                    )
                                                    .map((option) => {
                                                        const IconComponent =
                                                            option.icon;
                                                        return (
                                                            <CommandItem
                                                                key={
                                                                    option.value
                                                                }
                                                                value={
                                                                    option.value
                                                                }
                                                                onSelect={() => {
                                                                    setSubscriptionPopoverOpen(
                                                                        false
                                                                    );
                                                                    window.location.href =
                                                                        option.href;
                                                                }}
                                                            >
                                                                <IconComponent className="mr-2 h-4 w-4" />
                                                                {option.label}
                                                                <Check
                                                                    className={cn(
                                                                        "ml-auto h-4 w-4 opacity-0"
                                                                    )}
                                                                />
                                                            </CommandItem>
                                                        );
                                                    })}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="flex-1" />

                        {/* User menu */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="gap-2"
                                >
                                    <User className="h-4 w-4" />
                                    <span className="hidden sm:inline max-w-[150px] truncate">
                                        {session.user?.name ||
                                            session.user?.email}
                                    </span>
                                    <ChevronDown className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuItem disabled>
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium truncate">
                                            {session.user?.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {session.user?.email}
                                        </p>
                                    </div>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link
                                        href="/dashboard/configuracoes"
                                        className="cursor-pointer"
                                    >
                                        <Settings className="mr-2 h-4 w-4" />
                                        Configurações
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleSignOut}>
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Sair
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </header>

                    {/* Page content */}
                    <main className="flex-1 overflow-auto bg-muted/20">
                        <div className="p-6">{children}</div>
                    </main>
                </div>
            </div>
        </SubscriptionProvider>
    );
}
