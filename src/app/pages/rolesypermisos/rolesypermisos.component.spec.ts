import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RolesypermisosComponent } from './rolesypermisos.component';

describe('RolesypermisosComponent', () => {
  let component: RolesypermisosComponent;
  let fixture: ComponentFixture<RolesypermisosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RolesypermisosComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RolesypermisosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
