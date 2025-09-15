import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecuperarcontrComponent } from './recuperarcontr.component';

describe('RecuperarcontrComponent', () => {
  let component: RecuperarcontrComponent;
  let fixture: ComponentFixture<RecuperarcontrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecuperarcontrComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RecuperarcontrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
