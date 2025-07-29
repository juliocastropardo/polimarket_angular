import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableDinamicoComponent } from './table-dinamico.component';

describe('TableDinamicoComponent', () => {
  let component: TableDinamicoComponent;
  let fixture: ComponentFixture<TableDinamicoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableDinamicoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TableDinamicoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
