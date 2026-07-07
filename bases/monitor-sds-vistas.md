# Monitor SDS — Vistas del Dashboard

Este documento contiene el código HTML de las dos vistas principales del dashboard **Monitor SDS**: **Estatus** y **Alertas**.

---

## 1. Vista Estatus

```html
<!DOCTYPE html>
<html class="light" lang="es" style="">
<head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Monitor SDS - Estatus</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&amp;family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    "colors": {
                        "surface-container-highest": "#e1e2ee",
                        "secondary": "#466270",
                        "surface-variant": "#e1e2ee",
                        "tertiary-fixed-dim": "#ffb59d",
                        "surface-dim": "#d8d9e6",
                        "error-container": "#ffdad6",
                        "background": "#faf8ff",
                        "on-error-container": "#93000a",
                        "secondary-fixed-dim": "#adcbda",
                        "on-primary-container": "#f8f7ff",
                        "on-secondary-fixed": "#001f2a",
                        "success": "#2E7D32",
                        "on-secondary-fixed-variant": "#2e4b57",
                        "on-primary": "#ffffff",
                        "inverse-surface": "#2e303a",
                        "surface-container-low": "#f2f3ff",
                        "surface-container": "#ecedfa",
                        "on-secondary": "#ffffff",
                        "on-tertiary-fixed-variant": "#832600",
                        "on-error": "#ffffff",
                        "on-surface": "#191b24",
                        "on-secondary-container": "#4a6774",
                        "inverse-on-surface": "#eff0fd",
                        "on-background": "#191b24",
                        "tertiary-container": "#cc4204",
                        "tertiary-fixed": "#ffdbd0",
                        "primary-container": "#0066ff",
                        "outline-variant": "#C4C7C5",
                        "primary": "#0050cb",
                        "surface-container-lowest": "#ffffff",
                        "primary-fixed": "#dae1ff",
                        "on-surface-variant": "#424656",
                        "on-primary-fixed-variant": "#003fa4",
                        "inverse-primary": "#b3c5ff",
                        "on-tertiary": "#ffffff",
                        "tertiary": "#a33200",
                        "surface-bright": "#faf8ff",
                        "primary-fixed-dim": "#b3c5ff",
                        "secondary-fixed": "#c9e7f7",
                        "surface-container-high": "#e6e7f4",
                        "surface": "#faf8ff",
                        "on-tertiary-container": "#fff6f4",
                        "warning": "#F9A825",
                        "outline": "#727687",
                        "error": "#D32F2F",
                        "on-tertiary-fixed": "#390c00",
                        "surface-tint": "#0054d6",
                        "on-primary-fixed": "#001849",
                        "secondary-container": "#c6e4f4"
                    },
                    "borderRadius": {
                        "DEFAULT": "0.25rem",
                        "lg": "0.5rem",
                        "xl": "0.75rem",
                        "full": "9999px"
                    },
                    "spacing": {
                        "container-max-width": "1440px",
                        "unit": "4px",
                        "gutter": "16px",
                        "margin-desktop": "24px",
                        "margin-mobile": "16px"
                    },
                    "fontFamily": {
                        "headline-md": ["Inter"],
                        "title-md": ["Inter"],
                        "body-md": ["Inter"],
                        "headline-lg": ["Inter"],
                        "label-md": ["Inter"],
                        "body-lg": ["Inter"],
                        "body-sm": ["Inter"]
                    }
                }
            }
        }
    </script>
<style>
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .chart-gradient-blue {
            background: linear-gradient(180deg, rgba(0, 102, 255, 0.15) 0%, rgba(0, 102, 255, 0) 100%);
        }
        .chart-gradient-red {
            background: linear-gradient(180deg, rgba(211, 47, 47, 0.1) 0%, rgba(211, 47, 47, 0) 100%);
        }
    </style>
</head>
<body class="bg-background text-on-surface font-body-md antialiased min-h-screen">
<!-- TopAppBar Section -->
<header class="bg-surface-container-lowest sticky top-0 z-50 shadow-sm border-b border-outline-variant">
<div class="max-w-container-max-width mx-auto px-margin-desktop h-16 flex items-center justify-between">
<!-- Brand & Search -->
<div class="flex items-center gap-8 flex-1">
<div class="flex items-center gap-3">
<img alt="Monitor SDS" class="h-8 w-auto" data-alt="A professional, high-resolution vector logo for a software platform called Monitor SDS. The logo features minimalist geometric shapes suggesting connectivity and data flow, using a primary blue color scheme against a clean white background. The aesthetic is corporate, modern, and reliable, suitable for a technical monitoring dashboard." src="https://lh3.googleusercontent.com/aida-public/AB6AXuD1fC4958JM4DLDCX6WuChAR7rRK2Oqa8G_fBr_AocoCmWprZ3HCc_42Wm4TFAeAh23wPmPkAGhsKbr6t6rTYtSKb53ehh3JyhRbStwZ9ZfhfwAROnQ91x6XxWcBB3lnuJFv49SyqgRMqr9yamctzOMnx_qDYGe4LBTmOyNEMHybaeUqdKcefGTr2q64aF54xOjD2qdLSrCycExgM_4Pc496z2FdBQHCIjeOd-24NtLEcQlz-FEaYCS"/>
<span class="font-headline-md text-headline-md font-bold text-primary">Monitor SDS</span>
</div>
<div class="hidden md:flex items-center bg-surface-container-low px-4 py-2 rounded-full border border-outline-variant w-full max-w-md focus-within:ring-2 focus-within:ring-primary transition-all">
<span class="material-symbols-outlined text-on-surface-variant mr-2">search</span>
<input class="bg-transparent border-none focus:ring-0 p-0 text-body-md w-full placeholder:text-on-surface-variant" placeholder="Buscar cliente..." type="text"/>
</div>
</div>
<!-- Navigation Links (Tabs) -->
<nav class="flex gap-8 mx-8">
<a class="text-primary font-bold border-b-2 border-primary pb-1 hover:text-primary transition-colors duration-200 font-label-md text-label-md" href="#">Estatus</a>
<a class="text-on-surface-variant font-medium pb-1 hover:text-primary transition-colors duration-200 font-label-md text-label-md" href="#">Alertas</a>
</nav>
</div>
</header>
<main class="max-w-container-max-width mx-auto p-margin-desktop space-y-6">
<!-- Row 1: 8 KPI Cards -->
<section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4">
<!-- Total Clientes -->
<div class="bg-surface-container-lowest p-4 rounded-xl shadow-sm border border-outline-variant hover:shadow-md transition-shadow">
<p class="text-on-surface-variant font-label-md text-label-md mb-1">Total Clientes</p>
<h3 class="text-headline-md font-headline-md text-on-surface">1,248</h3>
</div>
<!-- Clientes Activos -->
<div class="bg-surface-container-lowest p-4 rounded-xl shadow-sm border border-outline-variant hover:shadow-md transition-shadow">
<p class="text-on-surface-variant font-label-md text-label-md mb-1">Clientes Activos</p>
<div class="flex items-center gap-2">
<h3 class="text-headline-md font-headline-md text-on-surface">1,120</h3>
<span class="bg-success/10 text-success text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Activo</span>
</div>
</div>
<!-- Clientes Expirados -->
<div class="bg-surface-container-lowest p-4 rounded-xl shadow-sm border border-outline-variant hover:shadow-md transition-shadow">
<p class="text-on-surface-variant font-label-md text-label-md mb-1">Expirados</p>
<div class="flex items-center gap-2">
<h3 class="text-headline-md font-headline-md text-on-surface">128</h3>
<span class="bg-error/10 text-error text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Red</span>
</div>
</div>
<!-- Total Equipos -->
<div class="bg-surface-container-lowest p-4 rounded-xl shadow-sm border border-outline-variant hover:shadow-md transition-shadow">
<p class="text-on-surface-variant font-label-md text-label-md mb-1">Total Equipos</p>
<h3 class="text-headline-md font-headline-md text-on-surface">15,402</h3>
</div>
<!-- % Equipos Online -->
<div class="bg-surface-container-lowest p-4 rounded-xl shadow-sm border border-outline-variant hover:shadow-md transition-shadow flex justify-between items-center">
<div>
<p class="text-on-surface-variant font-label-md text-label-md mb-1">Online</p>
<h3 class="text-headline-md font-headline-md text-success">92.4%</h3>
</div>
<div class="relative w-10 h-10">
<svg class="w-full h-full transform -rotate-90">
<circle class="text-surface-container-high" cx="20" cy="20" fill="transparent" r="16" stroke="currentColor" stroke-width="4"></circle>
<circle class="text-success" cx="20" cy="20" fill="transparent" r="16" stroke="currentColor" stroke-dasharray="100.5" stroke-dashoffset="10" stroke-width="4"></circle>
</svg>
</div>
</div>
<!-- % Equipos Offline -->
<div class="bg-surface-container-lowest p-4 rounded-xl shadow-sm border border-outline-variant hover:shadow-md transition-shadow flex justify-between items-center">
<div>
<p class="text-on-surface-variant font-label-md text-label-md mb-1">Offline</p>
<h3 class="text-headline-md font-headline-md text-error">7.6%</h3>
</div>
<div class="relative w-10 h-10">
<svg class="w-full h-full transform -rotate-90">
<circle class="text-surface-container-high" cx="20" cy="20" fill="transparent" r="16" stroke="currentColor" stroke-width="4"></circle>
<circle class="text-error" cx="20" cy="20" fill="transparent" r="16" stroke="currentColor" stroke-dasharray="100.5" stroke-dashoffset="92.4" stroke-width="4"></circle>
</svg>
</div>
</div>
<!-- Cobertura -->
<div class="bg-surface-container-lowest p-4 rounded-xl shadow-sm border border-outline-variant hover:shadow-md transition-shadow">
<p class="text-on-surface-variant font-label-md text-label-md mb-1">Cobertura</p>
<h3 class="text-headline-md font-headline-md text-on-surface">98.2%</h3>
</div>
<!-- Equipos Nuevos -->
<div class="bg-surface-container-lowest p-4 rounded-xl shadow-sm border border-outline-variant hover:shadow-md transition-shadow">
<p class="text-on-surface-variant font-label-md text-label-md mb-1">Nuevos (Mes)</p>
<div class="flex items-center gap-2">
<h3 class="text-headline-md font-headline-md text-on-surface">+45</h3>
<span class="material-symbols-outlined text-success">trending_up</span>
</div>
</div>
</section>
<!-- Consolidated Charts Section -->
<div class="grid grid-cols-1 gap-6">
<!-- Consolidated Desynchronized Chart -->
<section class="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant">
<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
<div class="flex items-center gap-2">
<h4 class="font-title-lg text-title-lg text-on-surface">Equipos Desincronizados</h4>
<span class="bg-error text-on-error px-2 py-0.5 rounded text-[10px] font-bold">ALERT STATE</span>
</div>
<div class="flex bg-surface-container-high p-1 rounded-lg">
<button class="px-4 py-1.5 text-label-md font-medium rounded-md bg-surface-container-lowest shadow-sm text-primary transition-all">Semana</button>
<button class="px-4 py-1.5 text-label-md font-medium rounded-md text-on-surface-variant hover:text-on-surface transition-all">Mes</button>
<button class="px-4 py-1.5 text-label-md font-medium rounded-md text-on-surface-variant hover:text-on-surface transition-all">Año</button>
</div>
</div>
<div class="h-56 w-full relative overflow-hidden rounded-lg bg-error-container/5 border border-error/10">
<div class="absolute inset-0 chart-gradient-red opacity-30"></div>
<svg class="absolute inset-0 w-full h-full" preserveaspectratio="none" viewbox="0 0 1000 200">
<path d="M0,160 L125,120 L250,180 L375,80 L500,120 L625,40 L750,90 L875,30 L1000,60" fill="none" stroke="#D32F2F" stroke-width="3"></path>
<!-- Tooltip Marker -->
<circle cx="875" cy="30" fill="#D32F2F" r="4"></circle>
</svg>
<div class="absolute bottom-4 left-4 flex gap-4">
<span class="text-body-sm text-on-surface-variant font-medium">Lunes</span>
<span class="text-body-sm text-on-surface-variant font-medium">Martes</span>
<span class="text-body-sm text-on-surface-variant font-medium">Miércoles</span>
<span class="text-body-sm text-on-surface-variant font-medium">Jueves</span>
<span class="text-body-sm text-on-surface-variant font-medium">Viernes</span>
<span class="text-body-sm text-on-surface-variant font-medium">Sábado</span>
<span class="text-body-sm text-on-surface-variant font-medium">Domingo</span>
</div>
</div>
</section>
<!-- Consolidated Discovered Chart -->
<section class="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant">
<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
<h4 class="font-title-lg text-title-lg text-on-surface">Equipos Descubiertos</h4>
<div class="flex bg-surface-container-high p-1 rounded-lg">
<button class="px-4 py-1.5 text-label-md font-medium rounded-md bg-surface-container-lowest shadow-sm text-primary transition-all">Semana</button>
<button class="px-4 py-1.5 text-label-md font-medium rounded-md text-on-surface-variant hover:text-on-surface transition-all">Mes</button>
<button class="px-4 py-1.5 text-label-md font-medium rounded-md text-on-surface-variant hover:text-on-surface transition-all">Año</button>
</div>
</div>
<div class="h-56 w-full relative overflow-hidden rounded-lg bg-primary-container/5 border border-primary/10">
<div class="absolute inset-0 chart-gradient-blue"></div>
<svg class="absolute inset-0 w-full h-full" preserveaspectratio="none" viewbox="0 0 1000 200">
<path d="M0,180 Q125,40 250,100 T500,60 T750,140 T1000,20 L1000,200 L0,200 Z" fill="rgba(0, 80, 203, 0.05)"></path>
<path d="M0,180 Q125,40 250,100 T500,60 T750,140 T1000,20" fill="none" stroke="#0050cb" stroke-width="3"></path>
</svg>
</div>
</section>
</div>
<!-- Comparison Chart Section -->
<section class="grid grid-cols-1 gap-gutter">
<div class="bg-surface-container-lowest p-gutter rounded-xl shadow-sm border border-outline-variant">
<div class="flex justify-between items-center mb-6">
<h4 class="font-title-lg text-title-lg text-on-surface">Equipos Registrados vs. Descubiertos (Histórico)</h4>
<div class="flex gap-6">
<div class="flex items-center gap-2 font-label-md text-label-md text-on-surface-variant">
<span class="w-4 h-1 rounded-full bg-primary"></span>
            Registrados
        </div>
<div class="flex items-center gap-2 font-label-md text-label-md text-on-surface-variant">
<span class="w-4 h-1 rounded-full bg-outline border border-dashed border-outline-variant"></span>
            Descubiertos
        </div>
</div>
</div>
<div class="h-64 w-full bg-surface-container-low/30 rounded-lg relative overflow-hidden flex items-end border border-outline-variant/20">
<svg class="w-full h-full" preserveaspectratio="none" viewbox="0 0 1000 200">
<!-- Registered Line -->
<path d="M0,180 L100,160 L200,155 L300,140 L400,130 L500,110 L600,95 L700,80 L800,75 L900,65 L1000,50" fill="none" stroke="#0050cb" stroke-width="3"></path>
<!-- Discovered Line -->
<path d="M0,190 L100,180 L200,175 L300,165 L400,150 L500,145 L600,135 L700,125 L800,120 L900,115 L1000,110" fill="none" stroke="#727687" stroke-dasharray="8,5" stroke-width="2"></path>
<!-- Points for registered -->
<circle cx="1000" cy="50" fill="#0050cb" r="5"></circle>
<circle cx="0" cy="180" fill="#0050cb" r="5"></circle>
</svg>
<div class="absolute inset-0 grid grid-cols-10 pointer-events-none">
<div class="border-r border-outline-variant/10 h-full"></div>
<div class="border-r border-outline-variant/10 h-full"></div>
<div class="border-r border-outline-variant/10 h-full"></div>
<div class="border-r border-outline-variant/10 h-full"></div>
<div class="border-r border-outline-variant/10 h-full"></div>
<div class="border-r border-outline-variant/10 h-full"></div>
<div class="border-r border-outline-variant/10 h-full"></div>
<div class="border-r border-outline-variant/10 h-full"></div>
<div class="border-r border-outline-variant/10 h-full"></div>
</div>
</div>
</div>
</section>
<!-- Row 4: Donut Charts -->
<section class="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
<!-- Estado de Monitoreo -->
<div class="bg-surface-container-lowest p-gutter rounded-xl shadow-sm border border-outline-variant flex flex-col sm:flex-row items-center gap-8">
<div class="w-48 h-48 relative">
<svg class="w-full h-full transform rotate-180" viewbox="0 0 36 36">
<circle cx="18" cy="18" fill="none" r="16" stroke="#f0f0f0" stroke-width="3"></circle>
<circle cx="18" cy="18" fill="none" r="16" stroke="#2E7D32" stroke-dasharray="75, 100" stroke-dashoffset="0" stroke-width="3"></circle>
<circle cx="18" cy="18" fill="none" r="16" stroke="#D32F2F" stroke-dasharray="15, 100" stroke-dashoffset="-75" stroke-width="3"></circle>
<circle cx="18" cy="18" fill="none" r="16" stroke="#727687" stroke-dasharray="10, 100" stroke-dashoffset="-90" stroke-width="3"></circle>
</svg>
<div class="absolute inset-0 flex flex-col items-center justify-center">
<span class="text-headline-md font-bold">15.4k</span>
<span class="text-body-sm text-on-surface-variant">Total</span>
</div>
</div>
<div class="flex-1 w-full">
<h4 class="font-title-lg text-title-lg text-on-surface mb-4">Estado de Monitoreo</h4>
<ul class="space-y-3">
<li class="flex items-center justify-between">
<span class="flex items-center gap-2 font-label-md text-label-md"><span class="w-3 h-3 rounded-full bg-success"></span> Online</span>
<span class="font-bold">14,231</span>
</li>
<li class="flex items-center justify-between">
<span class="flex items-center gap-2 font-label-md text-label-md"><span class="w-3 h-3 rounded-full bg-error"></span> Offline</span>
<span class="font-bold">850</span>
</li>
<li class="flex items-center justify-between">
<span class="flex items-center gap-2 font-label-md text-label-md"><span class="w-3 h-3 rounded-full bg-outline"></span> Unknown</span>
<span class="font-bold">321</span>
</li>
</ul>
</div>
</div>
<!-- Equipos por Fabricante -->
<div class="bg-surface-container-lowest p-gutter rounded-xl shadow-sm border border-outline-variant flex flex-col sm:flex-row items-center gap-8">
<div class="w-48 h-48 relative">
<svg class="w-full h-full" viewbox="0 0 36 36">
<circle cx="18" cy="18" fill="none" r="16" stroke="#0050cb" stroke-dasharray="40, 100" stroke-dashoffset="0" stroke-width="4"></circle>
<circle cx="18" cy="18" fill="none" r="16" stroke="#466270" stroke-dasharray="30, 100" stroke-dashoffset="-40" stroke-width="4"></circle>
<circle cx="18" cy="18" fill="none" r="16" stroke="#a33200" stroke-dasharray="20, 100" stroke-dashoffset="-70" stroke-width="4"></circle>
<circle cx="18" cy="18" fill="none" r="16" stroke="#F9A825" stroke-dasharray="10, 100" stroke-dashoffset="-90" stroke-width="4"></circle>
</svg>
</div>
<div class="flex-1 w-full">
<h4 class="font-title-lg text-title-lg text-on-surface mb-4">Equipos por Fabricante</h4>
<div class="grid grid-cols-2 gap-4">
<div>
<p class="text-body-sm text-on-surface-variant">Kyocera</p>
<p class="font-bold text-title-md">6,160</p>
</div>
<div>
<p class="text-body-sm text-on-surface-variant">HP</p>
<p class="font-bold text-title-md">4,620</p>
</div>
<div>
<p class="text-body-sm text-on-surface-variant">Canon</p>
<p class="font-bold text-title-md">3,080</p>
</div>
<div>
<p class="text-body-sm text-on-surface-variant">Epson</p>
<p class="font-bold text-title-md">1,542</p>
</div>
</div>
</div>
</div>
</section>
<!-- Row 5: Horizontal Bar Charts -->
<section class="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
<div class="bg-surface-container-lowest p-gutter rounded-xl shadow-sm border border-outline-variant">
<h4 class="font-title-lg text-title-lg text-on-surface mb-6">Top 5 Equipos por Cliente</h4>
<div class="space-y-4">
<div class="space-y-1">
<div class="flex justify-between text-body-sm"><span>Global Logistics S.A.</span><span class="font-bold">2,450</span></div>
<div class="w-full bg-surface-container-high h-2 rounded-full overflow-hidden"><div class="bg-primary h-full w-[95%]"></div></div>
</div>
<div class="space-y-1">
<div class="flex justify-between text-body-sm"><span>Educa Corp</span><span class="font-bold">1,820</span></div>
<div class="w-full bg-surface-container-high h-2 rounded-full overflow-hidden"><div class="bg-primary h-full w-[75%]"></div></div>
</div>
<div class="space-y-1">
<div class="flex justify-between text-body-sm"><span>Health Services Int</span><span class="font-bold">1,400</span></div>
<div class="w-full bg-surface-container-high h-2 rounded-full overflow-hidden"><div class="bg-primary h-full w-[60%]"></div></div>
</div>
<div class="space-y-1">
<div class="flex justify-between text-body-sm"><span>Bank of Commerce</span><span class="font-bold">980</span></div>
<div class="w-full bg-surface-container-high h-2 rounded-full overflow-hidden"><div class="bg-primary h-full w-[40%]"></div></div>
</div>
</div>
</div>
<div class="bg-surface-container-lowest p-gutter rounded-xl shadow-sm border border-outline-variant">
<h4 class="font-title-lg text-title-lg text-on-surface mb-6">Equipos por Modelo</h4>
<div class="space-y-4">
<div class="space-y-1">
<div class="flex justify-between text-body-sm"><span>TASKalfa 4053ci</span><span class="font-bold">1,120</span></div>
<div class="w-full bg-surface-container-high h-2 rounded-full overflow-hidden"><div class="bg-secondary h-full w-[85%]"></div></div>
</div>
<div class="space-y-1">
<div class="flex justify-between text-body-sm"><span>LaserJet Pro M404n</span><span class="font-bold">940</span></div>
<div class="w-full bg-surface-container-high h-2 rounded-full overflow-hidden"><div class="bg-secondary h-full w-[70%]"></div></div>
</div>
<div class="space-y-1">
<div class="flex justify-between text-body-sm"><span>imageRUNNER C3226i</span><span class="font-bold">760</span></div>
<div class="w-full bg-surface-container-high h-2 rounded-full overflow-hidden"><div class="bg-secondary h-full w-[55%]"></div></div>
</div>
<div class="space-y-1">
<div class="flex justify-between text-body-sm"><span>EcoTank L3250</span><span class="font-bold">530</span></div>
<div class="w-full bg-surface-container-high h-2 rounded-full overflow-hidden"><div class="bg-secondary h-full w-[35%]"></div></div>
</div>
</div>
</div>
</section>
<!-- Row 7: Complementary Cards -->
<section class="grid grid-cols-1 md:grid-cols-2 gap-gutter pb-12">
<div class="bg-surface-container-lowest p-gutter rounded-xl shadow-sm border border-outline-variant flex items-center justify-between">
<div class="space-y-1">
<p class="text-on-surface-variant font-label-md text-label-md">Antigüedad Promedio</p>
<h3 class="text-display-lg font-display-lg text-on-surface">2.4 <span class="text-title-md font-medium text-on-surface-variant">Años</span></h3>
</div>
<div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
<span class="material-symbols-outlined text-primary text-4xl">calendar_month</span>
</div>
</div>
<div class="bg-surface-container-lowest p-gutter rounded-xl shadow-sm border border-outline-variant flex items-center justify-between">
<div class="space-y-1">
<p class="text-on-surface-variant font-label-md text-label-md">Último Contacto Promedio</p>
<h3 class="text-display-lg font-display-lg text-on-surface">14 <span class="text-title-md font-medium text-on-surface-variant">Minutos</span></h3>
</div>
<div class="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center">
<span class="material-symbols-outlined text-success text-4xl">sensors</span>
</div>
</div>
</section>
</main>
<footer class="bg-surface-container-low border-t border-outline-variant py-8 mt-auto">
<div class="max-w-container-max-width mx-auto px-margin-desktop flex flex-col md:flex-row justify-between items-center gap-4">
<p class="text-body-sm text-on-surface-variant">© 2024 Monitor SDS - Plataforma de Monitoreo de Equipos</p>
<div class="flex gap-6">
<a class="text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Centro de Soporte</a>
<a class="text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Términos de Servicio</a>
<a class="text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Privacidad</a>
</div>
</div>
</footer>
<script>
    // KPI card hover effect
    document.querySelectorAll('section > div.bg-surface-container-lowest').forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.classList.add('shadow-md');
            card.style.transform = 'translateY(-2px)';
            card.style.transition = 'all 0.2s ease-out';
        });
        card.addEventListener('mouseleave', () => {
            card.classList.remove('shadow-md');
            card.style.transform = 'translateY(0)';
        });
    });

    // Tab interaction simulation
    document.querySelectorAll('.flex.bg-surface-container-high button').forEach(button => {
        button.addEventListener('click', () => {
            const container = button.closest('.flex');
            container.querySelectorAll('button').forEach(btn => {
                btn.classList.remove('bg-surface-container-lowest', 'shadow-sm', 'text-primary');
                btn.classList.add('text-on-surface-variant');
            });
            button.classList.add('bg-surface-container-lowest', 'shadow-sm', 'text-primary');
            button.classList.remove('text-on-surface-variant');
        });
    });
</script>
</body>
</html>
```

---

## 2. Vista Alertas

```html
<!DOCTYPE html>
<html class="light" lang="es" style="">
<head>
<meta charset="utf-8">
<meta content="width=device-width, initial-scale=1.0" name="viewport">
<title>Monitor SDS - Alertas</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&amp;display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet">
<style>
        body {
            font-family: 'Inter', sans-serif;
            background-color: #F5F7FA;
        }
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
            vertical-align: middle;
        }
        .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
            height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #e1e2ee;
            border-radius: 10px;
        }
        /* Elevation-1 for Material 3 */
        .elevation-1 {
            box-shadow: 0px 1px 3px rgba(0,0,0,0.05);
        }
    </style>
<script id="tailwind-config">
      tailwind.config = {
        darkMode: "class",
        theme: {
          extend: {
            "colors": {
                    "surface-container-highest": "#e1e2ee",
                    "secondary": "#466270",
                    "surface-variant": "#e1e2ee",
                    "tertiary-fixed-dim": "#ffb59d",
                    "surface-dim": "#d8d9e6",
                    "error-container": "#ffdad6",
                    "background": "#faf8ff",
                    "on-error-container": "#93000a",
                    "secondary-fixed-dim": "#adcbda",
                    "on-primary-container": "#f8f7ff",
                    "on-secondary-fixed": "#001f2a",
                    "success": "#2E7D32",
                    "on-secondary-fixed-variant": "#2e4b57",
                    "on-primary": "#ffffff",
                    "inverse-surface": "#2e303a",
                    "surface-container-low": "#f2f3ff",
                    "surface-container": "#ecedfa",
                    "on-secondary": "#ffffff",
                    "on-tertiary-fixed-variant": "#832600",
                    "on-error": "#ffffff",
                    "on-surface": "#191b24",
                    "on-secondary-container": "#4a6774",
                    "inverse-on-surface": "#eff0fd",
                    "on-background": "#191b24",
                    "tertiary-container": "#cc4204",
                    "tertiary-fixed": "#ffdbd0",
                    "primary-container": "#0066ff",
                    "outline-variant": "#C4C7C5",
                    "primary": "#0050cb",
                    "surface-container-lowest": "#ffffff",
                    "primary-fixed": "#dae1ff",
                    "on-surface-variant": "#424656",
                    "on-primary-fixed-variant": "#003fa4",
                    "inverse-primary": "#b3c5ff",
                    "on-tertiary": "#ffffff",
                    "tertiary": "#a33200",
                    "surface-bright": "#faf8ff",
                    "primary-fixed-dim": "#b3c5ff",
                    "secondary-fixed": "#c9e7f7",
                    "surface-container-high": "#e6e7f4",
                    "surface": "#faf8ff",
                    "on-tertiary-container": "#fff6f4",
                    "warning": "#F9A825",
                    "outline": "#727687",
                    "error": "#D32F2F",
                    "on-tertiary-fixed": "#390c00",
                    "surface-tint": "#0054d6",
                    "on-primary-fixed": "#001849",
                    "secondary-container": "#c6e4f4"
            },
            "borderRadius": {
                    "DEFAULT": "0.25rem",
                    "lg": "0.5rem",
                    "xl": "0.75rem",
                    "full": "9999px"
            },
            "spacing": {
                    "container-max-width": "1440px",
                    "unit": "4px",
                    "gutter": "16px",
                    "margin-desktop": "24px",
                    "margin-mobile": "16px"
            },
            "fontFamily": {
                    "headline-md": ["Inter"],
                    "title-md": ["Inter"],
                    "body-md": ["Inter"],
                    "headline-lg": ["Inter"],
                    "display-lg": ["Inter"],
                    "title-lg": ["Inter"],
                    "label-md": ["Inter"],
                    "body-lg": ["Inter"],
                    "body-sm": ["Inter"]
            },
            "fontSize": {
                    "headline-md": ["20px", {"lineHeight": "28px", "fontWeight": "600"}],
                    "title-md": ["14px", {"lineHeight": "20px", "fontWeight": "500"}],
                    "body-md": ["13px", {"lineHeight": "18px", "fontWeight": "400"}],
                    "headline-lg": ["24px", {"lineHeight": "32px", "fontWeight": "600"}],
                    "display-lg": ["32px", {"lineHeight": "40px", "letterSpacing": "-0.02em", "fontWeight": "600"}],
                    "title-lg": ["16px", {"lineHeight": "24px", "fontWeight": "500"}],
                    "label-md": ["12px", {"lineHeight": "16px", "letterSpacing": "0.5px", "fontWeight": "500"}],
                    "body-lg": ["14px", {"lineHeight": "20px", "fontWeight": "400"}],
                    "body-sm": ["12px", {"lineHeight": "16px", "fontWeight": "400"}]
            }
          },
        },
      }
    </script>
</head>
<body class="bg-surface">
<!-- TopNavBar -->
<header class="bg-surface-container-lowest border-b border-outline-variant shadow-sm sticky top-0 z-50">
<div class="flex justify-between items-center w-full px-margin-desktop h-16 max-w-container-max-width mx-auto">
<!-- Brand & Search Area -->
<div class="flex items-center gap-8">
<span class="font-headline-md text-headline-md font-bold text-primary">Monitor SDS</span>
<div class="hidden md:flex items-center bg-surface-container px-4 py-2 rounded-full w-96 border border-outline-variant/30">
<span class="material-symbols-outlined text-on-surface-variant text-lg mr-2">search</span>
<input class="bg-transparent border-none focus:ring-0 text-body-md w-full placeholder:text-on-surface-variant" placeholder="Buscar por número de serie o cliente..." type="text">
</div>
</div>
<!-- Navigation Links -->
<nav class="flex items-center gap-8 h-full">
<a class="text-on-surface-variant font-medium pb-1 hover:text-primary transition-colors duration-200 h-full flex items-center" href="#">Estatus</a>
<a class="text-primary font-bold border-b-2 border-primary pb-1 h-full flex items-center" href="#">Alertas</a>
</nav>
<!-- Actions -->
<div class="flex items-center gap-4">
<button class="relative p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors">

<span class="absolute top-2 right-2 w-2 h-2 bg-error rounded-full"></span>
</button>
<div class="w-8 h-8 rounded-full bg-primary-fixed overflow-hidden border border-outline-variant">

</div>
</div>
</div>
</header>
<div class="flex min-h-screen max-w-container-max-width mx-auto">
<!-- SideNavBar -->

<!-- Main Content Area -->
<main class="flex-grow p-margin-desktop overflow-hidden">
<div class="grid grid-cols-12 gap-gutter">
<!-- Page Title -->
<div class="col-span-12 mb-2">
<h1 class="font-headline-lg text-headline-lg text-on-surface">Gestión de Alertas Críticas</h1>
<p class="text-on-surface-variant font-body-md text-body-md">Equipos con interrupción de comunicación o duplicidad de registros.</p>
</div>
<!-- Row 1: KPI Cards -->
<div class="col-span-12 md:col-span-3">
<div class="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant elevation-1 relative overflow-hidden group hover:border-error transition-colors">
<div class="flex justify-between items-start mb-4">
<span class="p-2 bg-error-container text-on-error-container rounded-lg">
<span class="material-symbols-outlined">wifi_off</span>
</span>
<span class="text-error font-bold text-headline-md">12</span>
</div>
<h3 class="font-title-md text-title-md text-on-surface">Sin contacto 24h</h3>
<p class="text-on-surface-variant text-label-md mt-1">Crítico: Acción Requerida</p>
<div class="absolute bottom-0 left-0 h-1 bg-error w-full"></div>
</div>
</div>
<div class="col-span-12 md:col-span-3">
<div class="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant elevation-1 relative overflow-hidden group hover:border-warning transition-colors">
<div class="flex justify-between items-start mb-4">
<span class="p-2 bg-warning/10 text-warning rounded-lg">
<span class="material-symbols-outlined">running_with_errors</span>
</span>
<span class="text-warning font-bold text-headline-md">45</span>
</div>
<h3 class="font-title-md text-title-md text-on-surface">Sin contacto 7 días</h3>
<p class="text-on-surface-variant text-label-md mt-1">Requiere Seguimiento</p>
<div class="absolute bottom-0 left-0 h-1 bg-warning w-full"></div>
</div>
</div>
<div class="col-span-12 md:col-span-3">
<div class="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant elevation-1 relative overflow-hidden group hover:border-secondary transition-colors">
<div class="flex justify-between items-start mb-4">
<span class="p-2 bg-secondary-container text-on-secondary-container rounded-lg">
<span class="material-symbols-outlined">device_unknown</span>
</span>
<span class="text-secondary font-bold text-headline-md">08</span>
</div>
<h3 class="font-title-md text-title-md text-on-surface">Nunca Contactados</h3>
<p class="text-on-surface-variant text-label-md mt-1">Posible error de red</p>
<div class="absolute bottom-0 left-0 h-1 bg-secondary w-full"></div>
</div>
</div>
<div class="col-span-12 md:col-span-3">
<div class="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant elevation-1 relative overflow-hidden group hover:border-primary transition-colors">
<div class="flex justify-between items-start mb-4">
<span class="p-2 bg-primary-fixed text-on-primary-fixed-variant rounded-lg">
<span class="material-symbols-outlined">content_copy</span>
</span>
<span class="text-primary font-bold text-headline-md">03</span>
</div>
<h3 class="font-title-md text-title-md text-on-surface">SN Duplicados</h3>
<p class="text-on-surface-variant text-label-md mt-1">Conflicto de Identidad</p>
<div class="absolute bottom-0 left-0 h-1 bg-primary w-full"></div>
</div>
</div>
<!-- Row 2: Horizontal Health Timeline -->
<div class="col-span-12">

</div>
<!-- Row 3: Tables Set 1 -->
<div class="col-span-12 xl:col-span-6">
<div class="bg-surface-container-lowest rounded-xl border border-outline-variant elevation-1 overflow-hidden h-full flex flex-col">
<div class="p-4 border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
<h3 class="font-title-md text-title-md text-on-surface flex items-center gap-2">
<span class="material-symbols-outlined text-error">notification_important</span>
                                Equipos sin contacto 24h
                            </h3>
<button class="text-primary font-label-md text-label-md hover:underline">Ver Todo</button>
</div>
<div class="overflow-x-auto flex-grow custom-scrollbar">
<table class="w-full text-left border-collapse">
<thead class="bg-surface-container-lowest sticky top-0">
<tr class="text-on-surface-variant font-label-md text-label-md border-b border-outline-variant">
<th class="px-4 py-3">Cliente</th>
<th class="px-4 py-3">Serial Number</th>
<th class="px-4 py-3">Estado</th>
<th class="px-4 py-3">Último Contacto</th>
</tr>
</thead>
<tbody class="text-body-sm">
<tr class="border-b border-outline-variant hover:bg-surface-container transition-colors odd:bg-surface-container-lowest even:bg-surface-container-low/30">
<td class="px-4 py-3 font-medium">Bancolombia S.A.</td>
<td class="px-4 py-3 font-mono">SN-8829-XP</td>
<td class="px-4 py-3">
<span class="px-2 py-0.5 rounded-full bg-error-container text-on-error-container text-[10px] font-bold uppercase">OFFLINE</span>
</td>
<td class="px-4 py-3 text-on-surface-variant">23h 12m</td>
</tr>
<tr class="border-b border-outline-variant hover:bg-surface-container transition-colors odd:bg-surface-container-lowest even:bg-surface-container-low/30">
<td class="px-4 py-3 font-medium">Sura Corp</td>
<td class="px-4 py-3 font-mono">SN-9912-LQ</td>
<td class="px-4 py-3">
<span class="px-2 py-0.5 rounded-full bg-error-container text-on-error-container text-[10px] font-bold uppercase">OFFLINE</span>
</td>
<td class="px-4 py-3 text-on-surface-variant">19h 45m</td>
</tr>
<tr class="border-b border-outline-variant hover:bg-surface-container transition-colors odd:bg-surface-container-lowest even:bg-surface-container-low/30">
<td class="px-4 py-3 font-medium">Hospital General</td>
<td class="px-4 py-3 font-mono">SN-0034-KL</td>
<td class="px-4 py-3">
<span class="px-2 py-0.5 rounded-full bg-error-container text-on-error-container text-[10px] font-bold uppercase">OFFLINE</span>
</td>
<td class="px-4 py-3 text-on-surface-variant">22h 05m</td>
</tr>
</tbody>
</table>
</div>
</div>
</div>
<div class="col-span-12 xl:col-span-6">
<div class="bg-surface-container-lowest rounded-xl border border-outline-variant elevation-1 overflow-hidden h-full flex flex-col">
<div class="p-4 border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
<h3 class="font-title-md text-title-md text-on-surface flex items-center gap-2">
<span class="material-symbols-outlined text-warning">warning</span>
                                Equipos sin contacto 7 días
                            </h3>
<button class="text-primary font-label-md text-label-md hover:underline">Ver Todo</button>
</div>
<div class="overflow-x-auto flex-grow custom-scrollbar">
<table class="w-full text-left border-collapse">
<thead class="bg-surface-container-lowest sticky top-0">
<tr class="text-on-surface-variant font-label-md text-label-md border-b border-outline-variant">
<th class="px-4 py-3">Cliente</th>
<th class="px-4 py-3">Serial Number</th>
<th class="px-4 py-3">Modelo</th>
<th class="px-4 py-3">IP</th>
</tr>
</thead>
<tbody class="text-body-sm">
<tr class="border-b border-outline-variant hover:bg-surface-container transition-colors odd:bg-surface-container-lowest even:bg-surface-container-low/30">
<td class="px-4 py-3 font-medium">Ecopetrol</td>
<td class="px-4 py-3 font-mono">SN-4455-TT</td>
<td class="px-4 py-3">LaserJet M608</td>
<td class="px-4 py-3 text-on-surface-variant">10.0.1.55</td>
</tr>
<tr class="border-b border-outline-variant hover:bg-surface-container transition-colors odd:bg-surface-container-lowest even:bg-surface-container-low/30">
<td class="px-4 py-3 font-medium">U. Nacional</td>
<td class="px-4 py-3 font-mono">SN-1234-RT</td>
<td class="px-4 py-3">OfficeJet 9010</td>
<td class="px-4 py-3 text-on-surface-variant">192.168.2.11</td>
</tr>
<tr class="border-b border-outline-variant hover:bg-surface-container transition-colors odd:bg-surface-container-lowest even:bg-surface-container-low/30">
<td class="px-4 py-3 font-medium">Nutresa</td>
<td class="px-4 py-3 font-mono">SN-7788-UY</td>
<td class="px-4 py-3">PageWide 777</td>
<td class="px-4 py-3 text-on-surface-variant">172.16.0.42</td>
</tr>
</tbody>
</table>
</div>
</div>
</div>
<!-- Row 4: Tables Set 2 -->
<div class="col-span-12 xl:col-span-6">
<div class="bg-surface-container-lowest rounded-xl border border-outline-variant elevation-1 overflow-hidden h-full flex flex-col">
<div class="p-4 border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
<h3 class="font-title-md text-title-md text-on-surface flex items-center gap-2">
<span class="material-symbols-outlined text-secondary">cloud_off</span>
                                Equipos Nunca Contactados
                            </h3>
</div>
<div class="overflow-x-auto flex-grow custom-scrollbar">
<table class="w-full text-left border-collapse">
<thead class="bg-surface-container-lowest sticky top-0">
<tr class="text-on-surface-variant font-label-md text-label-md border-b border-outline-variant">
<th class="px-4 py-3">Cliente</th>
<th class="px-4 py-3">Serial Number</th>
<th class="px-4 py-3">Fecha Registro</th>
<th class="px-4 py-3">IP Intento</th>
</tr>
</thead>
<tbody class="text-body-sm">
<tr class="border-b border-outline-variant hover:bg-surface-container transition-colors odd:bg-surface-container-lowest even:bg-surface-container-low/30">
<td class="px-4 py-3">Cementos Argos</td>
<td class="px-4 py-3 font-mono">SN-0000-NEW</td>
<td class="px-4 py-3">12/10/2023</td>
<td class="px-4 py-3 font-mono text-[11px]">10.200.5.1</td>
</tr>
<tr class="border-b border-outline-variant hover:bg-surface-container transition-colors odd:bg-surface-container-lowest even:bg-surface-container-low/30">
<td class="px-4 py-3">Almacenes Éxito</td>
<td class="px-4 py-3 font-mono">SN-9999-Z</td>
<td class="px-4 py-3">15/10/2023</td>
<td class="px-4 py-3 font-mono text-[11px]">10.150.12.8</td>
</tr>
</tbody>
</table>
</div>
</div>
</div>
<div class="col-span-12 xl:col-span-6">
<div class="bg-surface-container-lowest rounded-xl border border-outline-variant elevation-1 overflow-hidden h-full flex flex-col">
<div class="p-4 border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
<h3 class="font-title-md text-title-md text-on-surface flex items-center gap-2">
<span class="material-symbols-outlined text-primary">dynamic_feed</span>
                                Serial Number Duplicado
                            </h3>
</div>
<div class="overflow-x-auto flex-grow custom-scrollbar">
<table class="w-full text-left border-collapse">
<thead class="bg-surface-container-lowest sticky top-0">
<tr class="text-on-surface-variant font-label-md text-label-md border-b border-outline-variant">
<th class="px-4 py-3">SN</th>
<th class="px-4 py-3">Cliente A</th>
<th class="px-4 py-3">Cliente B</th>
<th class="px-4 py-3">Acción</th>
</tr>
</thead>
<tbody class="text-body-sm">
<tr class="border-b border-outline-variant hover:bg-surface-container transition-colors odd:bg-surface-container-lowest even:bg-surface-container-low/30">
<td class="px-4 py-3 font-mono font-bold text-primary">SN-DUP-8812</td>
<td class="px-4 py-3">Logística SAS</td>
<td class="px-4 py-3">Renting Ltda</td>
<td class="px-4 py-3">
<button class="bg-primary-container text-on-primary-container px-3 py-1 rounded text-[10px] font-bold hover:opacity-80">DEPURAR</button>
</td>
</tr>
<tr class="border-b border-outline-variant hover:bg-surface-container transition-colors odd:bg-surface-container-lowest even:bg-surface-container-low/30">
<td class="px-4 py-3 font-mono font-bold text-primary">SN-DUP-5500</td>
<td class="px-4 py-3">Hotel Continental</td>
<td class="px-4 py-3">Eventos Plaza</td>
<td class="px-4 py-3">
<button class="bg-primary-container text-on-primary-container px-3 py-1 rounded text-[10px] font-bold hover:opacity-80">DEPURAR</button>
</td>
</tr>
</tbody>
</table>
</div>
</div>
</div>
</div>
</main>
</div>
<!-- Mobile Bottom NavBar (Visible on small screens) -->
<div class="md:hidden fixed bottom-0 left-0 right-0 bg-surface-container-low border-t border-outline-variant flex justify-around py-2 z-50">
<button class="flex flex-col items-center gap-1 text-on-surface-variant">
<span class="material-symbols-outlined">dashboard</span>
<span class="text-[10px]">Estatus</span>
</button>
<button class="flex flex-col items-center gap-1 text-primary">
<span class="material-symbols-outlined" style="font-variation-settings: &quot;FILL&quot; 1;">report_problem</span>
<span class="text-[10px] font-bold">Alertas</span>
</button>
<button class="flex flex-col items-center gap-1 text-on-surface-variant">
<span class="material-symbols-outlined">print</span>
<span class="text-[10px]">Equipos</span>
</button>
<button class="flex flex-col items-center gap-1 text-on-surface-variant">
<span class="material-symbols-outlined">settings</span>
<span class="text-[10px]">Ajustes</span>
</button>
</div>
<script>
        // Simple micro-interaction for active states
        document.querySelectorAll('a, button').forEach(el => {
            el.addEventListener('mousedown', () => {
                el.classList.add('scale-95', 'opacity-80');
            });
            el.addEventListener('mouseup', () => {
                el.classList.remove('scale-95', 'opacity-80');
            });
            el.addEventListener('mouseleave', () => {
                el.classList.remove('scale-95', 'opacity-80');
            });
        });
    </script>
</body>
</html>
```
