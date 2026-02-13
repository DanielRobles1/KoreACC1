import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TipopolizaComponent } from './tipopoliza.component';

describe('TipopolizaComponent', () => {
  let component: TipopolizaComponent;
  let fixture: ComponentFixture<TipopolizaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TipopolizaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TipopolizaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
