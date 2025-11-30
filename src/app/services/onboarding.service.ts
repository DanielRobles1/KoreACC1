import { Injectable } from '@angular/core';
import { ShepherdService } from 'angular-shepherd';

@Injectable({ providedIn: 'root' })
export class OnboardingService {
  private storageKey = 'koreacc_onboarding_done_v1';

  constructor(private shepherd: ShepherdService) {}

  maybeStartGlobalTour() {
    if (localStorage.getItem(this.storageKey)) return;

    this.configureTour();
    this.shepherd.start();
    localStorage.setItem(this.storageKey, 'true');
  }

  private configureTour() {
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
        text: `
          Este es tu panel contable. Te mostraremos rápido dónde crear pólizas,
          ver movimientos y navegar por los módulos principales.
        `,
        buttons: [
          {
            text: 'Saltar',
            classes:
              'shepherd-button-secondary ' +
              'px-3 py-1 rounded-full border border-slate-500/70 ' +
              'text-slate-200 text-xs font-medium ' +
              'hover:bg-slate-800/80 hover:border-slate-300/70 ' +
              'transition-colors',
            action: this.shepherd.complete
          },
          {
            text: 'Siguiente',
            classes:
              'shepherd-button-primary ' +
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
        text: `
          Desde aquí accedes a pólizas, reportes, catálogos, configuración
          y más módulos de KoreACC.
        `,
        buttons: [
          {
            text: 'Atrás',
            classes:
              'shepherd-button-secondary ' +
              'px-3 py-1 rounded-full border border-slate-500/70 ' +
              'text-slate-200 text-xs font-medium ' +
              'hover:bg-slate-800/80 hover:border-slate-300/70 ' +
              'transition-colors',
            action: this.shepherd.back
          },
          {
            text: 'Siguiente',
            classes:
              'shepherd-button-primary ' +
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
        text: `
          Usa este botón para capturar una nueva póliza contable. Aquí inicia
          casi todo el flujo de registro.
        `,
        buttons: [
          {
            text: 'Atrás',
            classes:
              'shepherd-button-secondary ' +
              'px-3 py-1 rounded-full border border-slate-500/70 ' +
              'text-slate-200 text-xs font-medium ' +
              'hover:bg-slate-800/80 hover:border-slate-300/70 ' +
              'transition-colors',
            action: this.shepherd.back
          },
          {
            text: 'Finalizar',
            classes:
              'shepherd-button-primary ' +
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
  }
}
