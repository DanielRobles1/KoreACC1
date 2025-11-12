import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from "../sidebar/sidebar.component";
import { Observable } from 'rxjs';
import { ReportesService } from '@app/services/reportes.service';
import { Empresa } from '@app/models/empresa';

@Component({
  selector: 'app-reportes-layout',
  standalone: true,
  imports: [CommonModule, SidebarComponent], 
  templateUrl: './reportes-layout.component.html',
  styleUrls: ['./reportes-layout.component.scss']
})
export class ReportesLayoutComponent implements OnChanges {
  @Input() open = true;
  @Output() openChange = new EventEmitter<boolean>();

  @Input() empresaId = 1;

  empresa$!: Observable<Empresa>;

  constructor(private reportesService: ReportesService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['empresaId']) {
      this.empresa$ = this.reportesService.getEmpresaInfo(this.empresaId);
    }
  }

  onToggle(v: boolean) {
    this.open = v;
    this.openChange.emit(v);
  }
}