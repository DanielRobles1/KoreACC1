import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToastMessageComponentComponent } from './toast-message-component.component';

describe('ToastMessageComponentComponent', () => {
  let component: ToastMessageComponentComponent;
  let fixture: ComponentFixture<ToastMessageComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToastMessageComponentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ToastMessageComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
