import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardContableService, DashboardContableDTO } from '../../services/dashboard-contable.service';
import { BaseChartDirective } from 'ng2-charts';

import { ChartConfiguration } from 'chart.js';
import { SidebarComponent } from "@app/components/sidebar/sidebar.component";

@Component({
  selector: 'app-dashboard-contable',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, SidebarComponent],
  templateUrl: './dashboard-contable.component.html',
  styleUrls: ['./dashboard-contable.component.scss']
})

export class DashboardContableComponent implements OnInit {
  sidebarOpen = true;

onSidebarToggle(open: boolean) {
  this.sidebarOpen = open;
}
  loading = signal(true);
  errorMsg = signal<string | null>(null);
  data = signal<DashboardContableDTO | null>(null);


  // KPIs (ejemplo: total por tipo)
  totalIngresos = computed(() =>
    (this.data()?.resumen ?? [])
      .filter(r => r.tipo === 'ingreso')
      .reduce((a, b) => a + b.total_polizas, 0)
  );
  totalEgresos = computed(() =>
    (this.data()?.resumen ?? [])
      .filter(r => r.tipo === 'egreso')
      .reduce((a, b) => a + b.total_polizas, 0)
  );
  totalDiario = computed(() =>
    (this.data()?.resumen ?? [])
      .filter(r => r.tipo === 'diario')
      .reduce((a, b) => a + b.total_polizas, 0)
  );

  // Chart.js config
  lineLabels: string[] = [];
  lineData: ChartConfiguration<'line'>['data'] = { labels: [], datasets: [] };
  lineOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'top' } },
    scales: {
      y: { beginAtZero: true }
    }
  };

  constructor(private svc: DashboardContableService) {}

  ngOnInit(): void {
    this.svc.getResumen().subscribe({
      next: (res) => {
        this.data.set(res);
        this.setupChart(res);
        this.loading.set(false);
      },
      error: (e) => {
        this.errorMsg.set('No se pudo cargar el dashboard');
        this.loading.set(false);
      }
    });
  }

private setupChart(res: DashboardContableDTO) {
  const movs = res.movimientos ?? [];

  const labels = [...new Set(movs.map(m => m.mes))].sort();

  const ganancias = labels.map(
    l => movs.find(m => m.mes === l)?.ganancias ?? 0
  );
  const perdidas = labels.map(
    l => movs.find(m => m.mes === l)?.perdidas ?? 0
  );
  const utilidad = ganancias.map((g, i) => g - perdidas[i]);

  // Junta todos los valores para calcular rango
  const allValues = [...ganancias, ...perdidas, ...utilidad].filter(v => !isNaN(v));
  const min = allValues.length ? Math.min(...allValues) : 0;
  const max = allValues.length ? Math.max(...allValues) : 0;

  // Un margen para que no queden pegadas al borde
  const padding = (max - min) === 0 ? 1 : (max - min) * 0.1;

  this.lineLabels = labels;
  this.lineData = {
    labels,
    datasets: [
      {
        label: 'Ganancias',
        data: ganancias,
        tension: 0.25,
        fill: false,
      },
      {
        label: 'Pérdidas',
        data: perdidas,
        tension: 0.25,
        fill: false,
      },
      {
        label: 'Utilidad neta',
        data: utilidad,
        tension: 0.25,
        fill: false,
      }
    ]
  };

  this.lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const v = ctx.parsed.y ?? 0;
            // si quieres pesos:
            return `${ctx.dataset.label}: ${v.toLocaleString('es-MX', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}`;
          }
        }
      }
    },
    scales: {
      y: {
        suggestedMin: min - padding,
        suggestedMax: max + padding
      }
    }
  };
}



}
