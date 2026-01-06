import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstadoResComponent } from './estado-res.component';

describe('EstadoResComponent', () => {
  let component: EstadoResComponent;
  let fixture: ComponentFixture<EstadoResComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EstadoResComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EstadoResComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
