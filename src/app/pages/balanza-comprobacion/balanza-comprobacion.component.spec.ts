import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BalanzaComprobacionComponent } from './balanza-comprobacion.component';

describe('BalanzaComprobacionComponent', () => {
  let component: BalanzaComprobacionComponent;
  let fixture: ComponentFixture<BalanzaComprobacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BalanzaComprobacionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BalanzaComprobacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
