import { Component, OnInit, Inject, PLATFORM_ID, SimpleChanges, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgTemplateOutlet } from '@angular/common';

import { TablesComponent } from '../../views/base/tables/tables.component';
//import { TiendasService } from '../../core/application/services/tiendas/tiendas-service.service';
import { TablaColumn, TablaRow } from '../../views/base/tables/tables.model';
import { isPlatformBrowser } from '@angular/common';
import { firstValueFrom } from 'rxjs';


import { ConsumoGenericoService } from '../../core/application/services/consumo-generico/consumo-generico.service';

import {
  BorderDirective,
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  CardFooterComponent,
  CardGroupComponent,
  CardHeaderComponent,
  CardImgDirective,
  CardLinkDirective,
  CardSubtitleDirective,
  CardTextDirective,
  CardTitleDirective,
  ColComponent,
  GutterDirective,
  ListGroupDirective,
  ListGroupItemDirective,
  NavComponent,
  NavItemComponent,
  NavLinkDirective,
  RowComponent,
  TextColorDirective
} from '@coreui/angular';

type CardColor = {
  color: string
  textColor?: string
}

@Component({
  selector: 'app-tiendas',
  templateUrl: './tiendas.component.html',
  styleUrls: ['./tiendas.component.scss'],
  standalone: true,
  imports: [TablesComponent, ColComponent, TextColorDirective, CardComponent, CardBodyComponent]
})
export class TiendasComponent {

  @Input()  searchValue: string = '';
  columns: TablaColumn[] = [];
  rows: TablaRow[] = [];
  rowsMemory: TablaRow[] = [];
  acciones: boolean = false;
  userRoles: string[] = [];

  colors: CardColor[] = [
    { color: 'primary', textColor: 'primary' },
    { color: 'secondary', textColor: 'secondary' },
    { color: 'success', textColor: 'success' },
    { color: 'danger', textColor: 'danger' },
    { color: 'warning', textColor: 'warning' },
    { color: 'info', textColor: 'info' },
    { color: 'light' },
    { color: 'dark' }
  ];

  imgContext = { $implicit: 'top', bottom: 'bottom' };

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    //private tiendasService: TiendasService,
    private consumogenericoServices: ConsumoGenericoService
  ) { }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.fetchTableData();
      const rolesAsignados = sessionStorage.getItem('roles_asignados');
      if (rolesAsignados) {
        this.userRoles = rolesAsignados.split(',');  // Convertir la cadena de roles a un array
      }
    
      // Lógica para controlar la visibilidad de los botones en base a los roles del usuario
      if (this.userRoles.includes('CEO')  || this.userRoles.includes('Administrador')) {
        this.acciones = true
      }
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['searchValue']) {
      this.filterTiendas();
    }
  }

  filterTiendas() {
    if (this.searchValue && this.searchValue.trim() !== '') {
      const lowerCaseSearchValue = this.searchValue.toLowerCase();
      this.rows = this.rowsMemory.filter(row =>
        Object.values(row).some(val => val.toString().toLowerCase().includes(lowerCaseSearchValue))
      );
    } else {
      this.rows = [...this.rowsMemory]; 
    }
  }

  async fetchTableData() {
    try {
      const data = await this.consumogenericoServices.consultarGenerico(
        "1", 
        `product`
      ).toPromise();
  
      
      if (Array.isArray(data)) {
  
        // Eliminar el campo `_id` de cada elemento
        const sanitizedData = data.map((item: any) => {
          const { _id, Remitente, ...rest } = item;
          return { _id, Remitente, ...rest };  // Se desestructura y devuelve los campos de `rest` directamente
        });

        // Generar las columnas y filas para la tabla
        this.columns = this.generateColumns(sanitizedData);
        this.rows = this.generateRows(sanitizedData);
  
        // Guardar los datos en el servicio
        //this.tiendasService.setTiendas(sanitizedData);
  
      } else {
        console.error('Los datos descomprimidos no son un array');
      }
    } catch (error) {
      console.error('Error al obtener los datos de la tabla:', error);
    }
  }  

  generateColumns(data: any[]): TablaColumn[] {
    if (data.length === 0) return [];
    const excludedFields = ['_id', 'Remitente'];
    return Object.keys(data[0]).filter(key => !excludedFields.includes(key)).map(key => ({
      key,
      title: this.capitalizeFirstLetter(key.replace(/([A-Z])/g, ' $1').trim())
    }));
  }

  generateRows(data: any[]): TablaRow[] {
    return data.map(item => {
      const transformedItem = { ...item };
      Object.keys(transformedItem).forEach(key => {
        if (Array.isArray(transformedItem[key])) {
          transformedItem[key] = transformedItem[key].join(', ');
        } else if (typeof transformedItem[key] === 'object' && transformedItem[key] !== null) {
          transformedItem[key] = Object.entries(transformedItem[key])
            .map(([k, v]) => `${k}: ${String(v)}`)
            .join(' | ');
        }
      });
      return transformedItem;
    });
  }

  capitalizeFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
  
  action: string = 'Crear / Modificar';
  changeButtonText(action: string) {
    this.action = action;
  }
}
