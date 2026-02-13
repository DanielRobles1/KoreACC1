import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CatalogCentrosComponent } from './catalog-centros.component';

describe('CatalogCentrosComponent', () => {
  let component: CatalogCentrosComponent;
  let fixture: ComponentFixture<CatalogCentrosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CatalogCentrosComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CatalogCentrosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
