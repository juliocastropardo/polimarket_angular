import { Component, Inject, PLATFORM_ID, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TiendasComponent } from '../../../components/tiendas/tiendas.component';
import { CreacionOwnerAccount } from '../../../components/creacionowneraccount/creacionowneraccount.component';
import { TablaColumn, TablaRow } from '../../base/tables/tables.model';
import { isPlatformBrowser } from '@angular/common';
import { ClientesComponent } from '../../../components/clientes/clientes.component';

type CardColor = {
  color: string;
  textColor?: string;
};

@Component({
  selector: 'app-ventas',
  templateUrl: './ventas.component.html',
  styleUrls: ['./ventas.component.scss'],
  standalone: true,
  imports: [
    CreacionOwnerAccount,
    FormsModule,
    ClientesComponent,
    TiendasComponent,
  ],
})
export class VentasComponent {
  columns: TablaColumn[] = [];
  rows: TablaRow[] = [];
  searchValueTiendas: string = '';
  searchValueDocuments: string = '';
  searchValueCuentas: string = '';
  searchValueUsuario: string = '';

  @ViewChild(ClientesComponent) clientesComponent!: ClientesComponent;
  @ViewChild(TiendasComponent) tiendasComponent!: TiendasComponent;

  colors: CardColor[] = [
    { color: 'primary', textColor: 'primary' },
    { color: 'secondary', textColor: 'secondary' },
    { color: 'success', textColor: 'success' },
    { color: 'danger', textColor: 'danger' },
    { color: 'warning', textColor: 'warning' },
    { color: 'info', textColor: 'info' },
    { color: 'light' },
    { color: 'dark' },
  ];

  imgContext = { $implicit: 'top', bottom: 'bottom' };

  constructor() {}

  ngOnInit() {}

  action: string = 'Crear / Modificar';
  changeButtonText(action: string) {
    this.action = action;
  }

  isCuentaModalOpen = false;
  isDocumentoModalOpen = false;
  isAccountModalOpen = false;
  isUsuarioModalOpen = false;

  openAccountModal() {
    this.isAccountModalOpen = true;
  }

  closeAccountModal() {
    this.isAccountModalOpen = false;
    if (this.clientesComponent) {
      this.clientesComponent.fetchTableData();
    }
  }

  openDocumentoModal() {
    this.isDocumentoModalOpen = true;
  }

  openUsuarioModal() {
    this.isUsuarioModalOpen = true;
  }

  closeUsuarioModal() {
    this.isUsuarioModalOpen = false;
    if (this.clientesComponent) {
      this.clientesComponent.fetchTableData();
    }
  }
}
