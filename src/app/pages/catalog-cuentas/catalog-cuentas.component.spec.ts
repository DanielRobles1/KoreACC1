import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CatalogCuentasComponent } from './catalog-cuentas.component';

describe('CatalogCuentasComponent', () => {
  let component: CatalogCuentasComponent;
  let fixture: ComponentFixture<CatalogCuentasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CatalogCuentasComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CatalogCuentasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
