import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpresaPrincipalComponent } from './empresa-principal.component';

describe('EmpresaPrincipalComponent', () => {
  let component: EmpresaPrincipalComponent;
  let fixture: ComponentFixture<EmpresaPrincipalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmpresaPrincipalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EmpresaPrincipalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
