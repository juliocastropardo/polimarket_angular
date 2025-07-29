import { Component, OnInit, Inject, PLATFORM_ID, SimpleChanges, Input, OnChanges } from '@angular/core';
import { ConsumoGenericoService } from '../../core/application/services/consumo-generico/consumo-generico.service';
import { TablesComponent } from '../../views/base/tables/tables.component';
import { TablaColumn, TablaRow } from '../../views/base/tables/tables.model';
import { isPlatformBrowser } from '@angular/common';
import {
  CardBodyComponent,
  CardComponent,
  ColComponent,
  TextColorDirective
} from '@coreui/angular';

type CardColor = {
  color: string
  textColor?: string
}

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.scss'],
  standalone: true,
  imports: [TablesComponent, ColComponent, TextColorDirective, CardComponent, CardBodyComponent]
})
export class ClientesComponent implements OnInit, OnChanges {

  @Input() searchValue: string = '';

  columns: TablaColumn[] = [];
  rows: TablaRow[] = [];
  rowsMemory: TablaRow[] = [];

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
    private consumogenericoServices: ConsumoGenericoService,
  ) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['searchValue']) {
      this.filterUsuarioTienda();
    }
  }

  filterUsuarioTienda() {
    if (this.searchValue && this.searchValue.trim() !== '') {
      const lowerCaseSearchValue = this.searchValue.toLowerCase();
      this.rows = this.rowsMemory.filter(row =>
        Object.values(row).some(val => val.toString().toLowerCase().includes(lowerCaseSearchValue))
      );
    } else {
      this.rows = [...this.rowsMemory]; 
    }
  }

  ngOnInit() {
      this.fetchTableData();
  }

  async fetchTableData() {
    try {
      const data = await this.consumogenericoServices.consultarGenerico(
        "1", 
        `customer`
      ).toPromise();

      if (Array.isArray(data)) {
  
        // Aplanar los resultados procesados
        const flattenedData = data.flat();
  
        // Sanitizar los datos
        const sanitizedData = flattenedData.map(item => {
  
          const formatCurrency = (value: number | string | undefined): string => {
            if (value && !isNaN(Number(value))) {
              return `$${parseFloat(value as string).toLocaleString()}`;
            }
            return 'N/A';
          };
          
          // Cambiar las claves para que coincidan con las del objeto original
          return {
            ...item
          };
        });
  
        // Generar columnas y filas
        this.columns = this.generateColumns(sanitizedData);
  
        this.rows = this.generateRows(sanitizedData);
  
        this.rows = [...this.rows]; // Asegurarse de que se actualizan las filas correctamente
        this.rowsMemory = [...this.rows]; // Guardar una copia en memoria para futuras manipulaciones

      } else {
        console.error('La respuesta de la API no es un array:', data);
      }
    } catch (error) {
      console.error('Error al obtener los datos de conciliación de pagos:', error);
    }
  }

  generateColumns(data: any[]): TablaColumn[] {
    if (data.length === 0) return [];
    return Object.keys(data[0])
        .filter(key => key !== '_id' && key !== 'cognitoId' && key !== 'tiendas' && key !== 'state' && key !== 'tipo') // Omitir las claves no deseadas
        .map(key => {
            const pascalCaseKey = this.toPascalCase(key); // Convertir la clave a PascalCase
            return {
                key: pascalCaseKey,
                title: pascalCaseKey // Usar la misma clave en formato PascalCase para el título
            };
        });
  }

  private toPascalCase(value: string): string {
      return value
          .replace(/([a-z])([A-Z])/g, '$1 $2') // Agregar espacio entre palabras en camelCase
          .replace(/[_\s]+(.)?/g, (_, chr) => chr ? chr.toUpperCase() : '') // Convertir a PascalCase
          .replace(/^./, char => char.toUpperCase()); // Asegurarse de que la primera letra sea mayúscula
  }

  generateRows(data: any[]): TablaRow[] {
    return data.map(item => {
      const transformedItem: any = {};
  
      Object.keys(item).forEach(key => {
        const pascalCaseKey = this.toPascalCase(key); // Convertir la clave a PascalCase
        let value = item[key];
  
        if (Array.isArray(value)) {
          value = value.join(', ');
        } else if (typeof value === 'object' && value !== null) {
          value = Object.entries(value)
            .map(([k, v]) => `${k}: ${String(v)}`)
            .join(' | ');
        }

        transformedItem[pascalCaseKey] = value;
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

