import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CrudPanelComponent, CrudAction, CrudColumn } from 'src/app/components/crud-panel/crud-panel.component';
import { PeriodoContableService } from '@app/services/periodo-contable.service';
import { PeriodoContableDto, PeriodoTipo } from '@app/models/periodo';
import { ModalComponent } from '@app/components/modal/modal/modal.component';
import { FormsModule } from '@angular/forms';
import { ToastMessageComponent } from '@app/components/modal/toast-message-component/toast-message-component.component';
import { ToastService, ToastState } from '@app/services/toast-service.service';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { fmtDate, periodoEtiqueta } from '@app/utils/fecha-utils';
import { AuthService } from '@app/services/auth.service';

@Component({
  selector: 'app-periodos',
  standalone: true,
  imports: [CommonModule, CrudPanelComponent, ModalComponent, FormsModule, ToastMessageComponent, SidebarComponent],
  templateUrl: './periodos.component.html',
  styleUrl: './periodos.component.scss'
})
export class PeriodosComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private periodosService: PeriodoContableService,
    public toast: ToastService,
    private auth: AuthService
  ) { }

  sidebarOpen = true;
  vm!: ToastState;
  idEjercicio!: number;
  anioEjercicio: number | null = null;

  columns: CrudColumn[] = [
    // { key: 'id_periodo', header: '#', width: '72px' },
    { key: 'tipo_periodo', header: 'Tipo' },
    { key: 'etiqueta', header: 'Período' },
    { key: 'esta_abierto', header: 'Abierto' },
  ];

  periodos: PeriodoContableDto[] = [];

  actions: CrudAction[] = [
    { id: 'delete', label: 'Eliminar', tooltip: 'Eliminar' },
    { id: 'cerrar', label: 'Cerrar', tooltip: 'Cerrar' },
  ];

  // botón primario
  primaryActionLabel = 'Generar períodos';

  modalPeriodoOpen = false;
  modalPeriodoTitle = 'Crear período';
  formPeriodo: Partial<PeriodoContableDto> = {
    tipo_periodo: 'MENSUAL',
    fecha_inicio: '',
    fecha_fin: '',
    esta_abierto: true,
  };
  editPeriodoId: number | null = null;

  autoCreate = true;
  autoCreateTipo: Exclude<PeriodoTipo, 'PERSONALIZADO'> = 'MENSUAL';
  isGenerating = false;

  confirmOpen = false;
  confirmTitle = 'Confirmar acción';
  confirmMessage = '';
  private confirmKind: 'delete' | 'cerrar' | null = null;
  private confirmPayload: any = null;

  ngOnInit() {
    this.toast.state$.subscribe(s => (this.vm = s));

    const id = Number(this.route.snapshot.paramMap.get('id_ejercicio'));
    if (!id) {
      this.toast.error('No se recibió id_ejercicio.', 'Error', 0);
      this.router.navigate(['/empresa']);
      return;
    }

    this.idEjercicio = id;
    const st = (history.state as any) || {};
    const anioFromState = Number(st?.anio);
    this.anioEjercicio = Number.isFinite(anioFromState) ? anioFromState : null;
    this.loadPeriodos();
    if (st?.openGenerarModal) {
      if (st?.defaultTipo) this.autoCreateTipo = st.defaultTipo;

      Promise.resolve().then(() => this.onPrimaryPeriodo());

      history.replaceState({ ...st, openGenerarModal: false }, '');
    }
  }

  back() {
    this.router.navigate(['/empresa']);
  }

  get periodosTitle(): string {
    const anio = this.anioEjercicio ?? '—';
    return `Períodos del ejercicio ${anio}`;
  }

  loadPeriodos() {
    this.periodosService.getPeriodosByEjercicio(this.idEjercicio).subscribe({
      next: (items) => {
        this.periodos = (items ?? []).map((p: any) => {
          const fi = fmtDate(p.fecha_inicio);
          const ff = fmtDate(p.fecha_fin);

          const abierto =
            p.esta_abierto === true ||
            p.esta_abierto === 1 ||
            p.esta_abierto === '1' ||
            p.esta_abierto === 'true';

          return {
            ...p,
            esta_abierto: abierto,
            fecha_inicio: fi,
            fecha_fin: ff,
            etiqueta: periodoEtiqueta(fi, ff),
          };
        }) as any;
      },
      error: () => this.toast.error('Fallo al cargar los períodos', 'Error', 0),
    });
  }


  onPrimaryPeriodo() {
    this.modalPeriodoTitle = 'Generar períodos';
    this.editPeriodoId = null;
    this.autoCreate = true;
    this.autoCreateTipo = 'MENSUAL';
    this.modalPeriodoOpen = true;
  }

  onPeriodoAction(evt: { action: string; row: PeriodoContableDto }) {
    if (evt.action === 'delete') {
      this.openConfirmDelete(evt.row);
      return;
    }

    if (evt.action === 'cerrar') {
      this.openConfirmCerrar(evt.row);
      return;
    }

    this.toast.warning(`Acción no soportada: ${evt.action}`, 'Aviso', 2500);
  }


  closePeriodoModal() { this.modalPeriodoOpen = false; }
  cancelPeriodoModal() { this.modalPeriodoOpen = false; }
  confirmPeriodoModal() {
    if (!this.autoCreate) {
      this.toast.warning('Activa "Generar automáticamente" para continuar.', 'Aviso', 2500);
      return;
    }
    this.modalPeriodoOpen = false;
    this.generatePeriodsForExercise(this.autoCreateTipo);
  }

  generatePeriodsForExercise(tipo: Exclude<PeriodoTipo, 'PERSONALIZADO'> = 'MENSUAL') {
    if (this.isGenerating) return;

    this.isGenerating = true;

    const userId = this.auth.getUserIdOrThrow();
    const centroId = 300;

    this.periodosService.generate(this.idEjercicio, tipo, userId, centroId).subscribe({
      next: (periodosGenerados) => {
        this.loadPeriodos();
        const n = Array.isArray(periodosGenerados) ? periodosGenerados.length : undefined;
        this.toast.success(
          n != null
            ? `Períodos ${tipo.toLowerCase()} generados: ${n}.`
            : `Períodos ${tipo.toLowerCase()} generados correctamente.`,
          'Éxito',
          2500
        );
      },
      error: (err) => {
        console.error(err);
        this.toast.error('No se pudieron generar los períodos.', 'Error', 0);
      },
      complete: () => (this.isGenerating = false),
    });
  }

  openConfirmDelete(row: PeriodoContableDto) {
    const idp = row.id_periodo;
    if (!idp) return;

    this.confirmTitle = 'Confirmar eliminación';
    this.confirmMessage = `¿Eliminar el período ${row.etiqueta ?? (fmtDate(row.fecha_inicio) + ' → ' + fmtDate(row.fecha_fin))}?`;
    this.confirmKind = 'delete';
    this.confirmPayload = { id_periodo: idp };
    this.confirmOpen = true;
  }

  openConfirmCerrar(row: PeriodoContableDto) {
    const idp = row.id_periodo;
    if (!idp) return;

    if (row.esta_abierto !== true) {
      this.toast.info('Este período ya está cerrado.', 'Aviso');
      return;
    }

    this.confirmTitle = 'Confirmar cierre';
    this.confirmMessage = `¿Cerrar el período ${row.etiqueta ?? (fmtDate(row.fecha_inicio) + ' → ' + fmtDate(row.fecha_fin))}?
                            Este proceso no se puede deshacer.`;
    this.confirmKind = 'cerrar';
    this.confirmPayload = { id_periodo: idp, esta_abierto: false };
    this.confirmOpen = true;
  }

  closeConfirm() {
    this.confirmOpen = false;
    this.confirmKind = null;
    this.confirmPayload = null;
  }

  cancelConfirm() {
    this.closeConfirm();
  }

  confirmProceed() {
    const kind = this.confirmKind;
    const payload = this.confirmPayload;
    this.closeConfirm();

    if (kind === 'delete') {
      const idp = payload?.id_periodo as number | undefined;
      if (!idp) return;

      this.periodosService.delete(idp).subscribe({
        next: () => {
          this.periodos = this.periodos.filter(p => p.id_periodo !== idp);
          this.toast.success('Período eliminado.', 'Éxito', 2500);
        },
        error: () => this.toast.error('No se pudo eliminar el período.', 'Error', 0),
      });
      return;
    }

    if (kind === 'cerrar') {
      const idp = payload?.id_periodo as number | undefined;
      const esta_abierto = payload?.esta_abierto as boolean | undefined;
      if (!idp || typeof esta_abierto !== 'boolean') return;

      this.periodosService.setAbierto(idp, esta_abierto).subscribe({
        next: () => {
          this.loadPeriodos();
          this.toast.success('Período cerrado.', 'Éxito', 2500);
        },
        error: () => this.toast.error('No se pudo cerrar el período.', 'Error', 0),
      });
      return;
    }
  }

  onSidebarToggle(open: boolean) { this.sidebarOpen = open; }
}
