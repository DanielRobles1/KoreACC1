"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.OnboardingService = void 0;
var core_1 = require("@angular/core");
var OnboardingService = /** @class */ (function () {
    function OnboardingService(shepherd) {
        this.shepherd = shepherd;
        this.storageKey = 'koreacc_onboarding_done_v1';
    }
    OnboardingService.prototype.maybeStartGlobalTour = function () {
        if (localStorage.getItem(this.storageKey))
            return;
        this.configureTour();
        this.shepherd.start();
        localStorage.setItem(this.storageKey, 'true');
    };
    OnboardingService.prototype.configureTour = function () {
        this.shepherd.defaultStepOptions = {
            scrollTo: true,
            cancelIcon: { enabled: true },
            // Tailwind + tema base
            classes: 
            // contenedor principal
            'shepherd-theme-koreacc ' +
                'bg-slate-900/95 border border-emerald-500/40 ' +
                'backdrop-blur-md rounded-2xl shadow-2xl ' +
                'text-slate-50 px-4 py-3 ' +
                'max-w-xs sm:max-w-sm ' +
                'text-sm leading-relaxed',
            canClickTarget: false
        };
        this.shepherd.modal = true;
        this.shepherd.addSteps([
            {
                id: 'intro',
                title: 'Bienvenido a KoreACC',
                text: "\n          Este es tu panel contable. Te mostraremos r\u00E1pido d\u00F3nde crear p\u00F3lizas,\n          ver movimientos y navegar por los m\u00F3dulos principales.\n        ",
                buttons: [
                    {
                        text: 'Saltar',
                        classes: 'shepherd-button-secondary ' +
                            'px-3 py-1 rounded-full border border-slate-500/70 ' +
                            'text-slate-200 text-xs font-medium ' +
                            'hover:bg-slate-800/80 hover:border-slate-300/70 ' +
                            'transition-colors',
                        action: this.shepherd.complete
                    },
                    {
                        text: 'Siguiente',
                        classes: 'shepherd-button-primary ' +
                            'px-4 py-1.5 rounded-full ' +
                            'bg-emerald-500 text-slate-950 text-xs font-semibold ' +
                            'shadow-md hover:bg-emerald-400 hover:shadow-lg ' +
                            'transition-transform transition-shadow ' +
                            'hover:-translate-y-px',
                        action: this.shepherd.next
                    }
                ]
            },
            {
                id: 'menu',
                attachTo: { element: '.app-sidebar', on: 'right' },
                title: 'Menú principal',
                text: "\n          Desde aqu\u00ED accedes a p\u00F3lizas, reportes, cat\u00E1logos, configuraci\u00F3n\n          y m\u00E1s m\u00F3dulos de KoreACC.\n        ",
                buttons: [
                    {
                        text: 'Atrás',
                        classes: 'shepherd-button-secondary ' +
                            'px-3 py-1 rounded-full border border-slate-500/70 ' +
                            'text-slate-200 text-xs font-medium ' +
                            'hover:bg-slate-800/80 hover:border-slate-300/70 ' +
                            'transition-colors',
                        action: this.shepherd.back
                    },
                    {
                        text: 'Siguiente',
                        classes: 'shepherd-button-primary ' +
                            'px-4 py-1.5 rounded-full ' +
                            'bg-emerald-500 text-slate-950 text-xs font-semibold ' +
                            'shadow-md hover:bg-emerald-400 hover:shadow-lg ' +
                            'transition-transform transition-shadow ' +
                            'hover:-translate-y-px',
                        action: this.shepherd.next
                    }
                ]
            },
            {
                id: 'polizas',
                attachTo: { element: '.btn-nueva-poliza', on: 'bottom' },
                title: 'Nueva póliza',
                text: "\n          Usa este bot\u00F3n para capturar una nueva p\u00F3liza contable. Aqu\u00ED inicia\n          casi todo el flujo de registro.\n        ",
                buttons: [
                    {
                        text: 'Atrás',
                        classes: 'shepherd-button-secondary ' +
                            'px-3 py-1 rounded-full border border-slate-500/70 ' +
                            'text-slate-200 text-xs font-medium ' +
                            'hover:bg-slate-800/80 hover:border-slate-300/70 ' +
                            'transition-colors',
                        action: this.shepherd.back
                    },
                    {
                        text: 'Finalizar',
                        classes: 'shepherd-button-primary ' +
                            'px-4 py-1.5 rounded-full ' +
                            'bg-emerald-500 text-slate-950 text-xs font-semibold ' +
                            'shadow-md hover:bg-emerald-400 hover:shadow-lg ' +
                            'transition-transform transition-shadow ' +
                            'hover:-translate-y-px',
                        action: this.shepherd.complete
                    }
                ]
            }
        ]);
    };
    OnboardingService = __decorate([
        core_1.Injectable({ providedIn: 'root' })
    ], OnboardingService);
    return OnboardingService;
}());
exports.OnboardingService = OnboardingService;
