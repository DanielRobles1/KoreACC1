import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TipoPolizaModalComponent } from './modal-tipopoliza.component';

describe('TipoPolizaModalComponent', () => {
  let component: TipoPolizaModalComponent;
  let fixture: ComponentFixture<TipoPolizaModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TipoPolizaModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TipoPolizaModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
