import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PolizaHomeComponent } from './poliza-home.component';

describe('PolizaHomeComponent', () => {
  let component: PolizaHomeComponent;
  let fixture: ComponentFixture<PolizaHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PolizaHomeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PolizaHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
