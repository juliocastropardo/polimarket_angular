import { TestBed } from '@angular/core/testing';

import { ConsumoGenericoService } from './consumo-generico.service';

describe('PedidosServiceService', () => {
  let service: ConsumoGenericoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConsumoGenericoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
