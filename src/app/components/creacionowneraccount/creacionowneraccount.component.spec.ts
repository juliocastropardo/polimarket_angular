import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreacionOwnerAccount } from './creacionowneraccount.component';

describe('CreaciondocumentoComponent', () => {
  let component: CreacionOwnerAccount;
  let fixture: ComponentFixture<CreacionOwnerAccount>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreacionOwnerAccount]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreacionOwnerAccount);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
