import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { TableDinamicoService } from './table-dinamico.service';
import { CommonModule } from '@angular/common';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap'; 

@Component({
  selector: 'app-table-dinamico',
  templateUrl: './table-dinamico.component.html',
  standalone: true,
  imports: [CommonModule, NgbTooltipModule],
  styleUrls: ['./table-dinamico.component.css']
})
export class TableDinamicoComponent implements OnInit {

  datos_dinamicos_table: any = { aplica_check: false, header: [], body: [] };
  sortBy: string = 'Nombre';
  sortOrder: string = 'asc';
  selectedItems: Set<number> = new Set<number>();

  @Output() _datoSeleccionado = new EventEmitter<{datos : Set<number>}>();
  @Output() _datosActualizar = new EventEmitter<{ _id: string, estado: boolean }>();
  @Output() _datoGuia = new EventEmitter<{ _guia : string, _id : number }>();

  /** Se emite cuando se obtienen datos del componente padre al componente hijo que se necesite. */
  @Output() _datosObtenido = new EventEmitter<string>();

  //@Output() sortChange: EventEmitter<string> = new EventEmitter<string>();

  @Output() sortChange = new EventEmitter<{title : string, order : string, indice : number}>();

  constructor(private tableService: TableDinamicoService) {}

  ngOnInit() {
    // Se suscribe al observable para obtener los datos de la tabla.
    this.tableService.getDatosObservable().subscribe(
      (datos: any) => {  
        this.datos_dinamicos_table = datos;
      }
    );
  }

  /**
    * Método para obtener las claves de un objeto.
    * @param objeto Objeto del que se quieren obtener las claves.
    * @returns Un array de strings que contiene las claves del objeto.
  */
  obtenerClaves(objeto: any): string[] {
    return Object.keys(objeto);
  }

  /**
    * Método para obtener el valor de una clave específica en un objeto.
    * @param fila Objeto del que se quiere obtener el valor.
    * @param clave Clave cuyo valor se quiere obtener.
    * @returns El valor asociado a la clave en el objeto.
  */
  obtenerValor(fila: any, clave: string): any {
    return (fila as any)[clave];
  }

  /**
    * Método para verificar si un valor es booleano.
    * @param valor Valor a verificar.
    * @returns true si el valor es booleano, de lo contrario false.
  */
  esBooleano(valor: any): boolean {
    return typeof valor === 'boolean';
  }

  /**
   * Emite los datos obtenidos del componente padre al componente hijo que se necesite.
   * @param _id Identificador del dato.
   * @param _fecha Fecha del dato.
   */
  ObtenerIdDato(_id : string){
    this._datosObtenido.emit(_id);
  }

  /**
    * Emite la actualización del estado de un dato.
    * @param event Evento de clic.
    * @param _id Identificador del dato.
    * @param estado Estado del dato.
  */
  ActualizarEstado(event: MouseEvent, _id : string = "", estado: boolean){
    event.preventDefault();
    this._datosActualizar.emit({_id, estado});
  }

  onSortChange(title : string, order : string, i : number): void {
    // Suscribirse al evento sortChange para manejar el cambio de orden

    const indice : number = i + 1;
    this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    this.sortChange.emit({title, order, indice});
  }

  ObtenerNumeroGuia(_id: string) {

    const registros = this.datos_dinamicos_table.body;    
    // Filtramos para obtener el registro que coincida con la guía
    const infoRegistro = registros.filter((dato: any) => dato.id == _id);
    
    // Mapeamos el numeroGuia si hay algún resultado
    const numeroGuia = infoRegistro.map((dato: any) => dato.numeroGuia);
    this._datoGuia.emit({ _guia: numeroGuia[0], _id: parseInt(_id) });
}


  CheckSeleccionados(id: number): void {
    if (this.selectedItems.has(id)) {
      this.selectedItems.delete(id);
    } else {
      this.selectedItems.add(id);
    }
    var datos = this.selectedItems;
    
    this._datoSeleccionado.emit({ datos });
  }

}
