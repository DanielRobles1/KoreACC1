import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportesLayoutComponent } from './reportes-layout.component';

describe('ReportesLayoutComponent', () => {
  let component: ReportesLayoutComponent;
  let fixture: ComponentFixture<ReportesLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportesLayoutComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReportesLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
