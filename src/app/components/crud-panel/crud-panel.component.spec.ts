import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { CrudPanelComponent } from './crud-panel.component';

describe('CrudPanelComponent', () => {
  let component: CrudPanelComponent;
  let fixture: ComponentFixture<CrudPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrudPanelComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CrudPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
