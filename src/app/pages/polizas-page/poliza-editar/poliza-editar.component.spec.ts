import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PolizaEditarComponent } from './poliza-editar.component';

describe('PolizaEditarComponent', () => {
  let component: PolizaEditarComponent;
  let fixture: ComponentFixture<PolizaEditarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PolizaEditarComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PolizaEditarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
