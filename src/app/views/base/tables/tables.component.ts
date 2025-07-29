import {
  Component,
  OnInit,
  Input,
  OnChanges,
  EventEmitter,
  SimpleChanges,
  ChangeDetectionStrategy,
  ViewChild,
  ViewContainerRef,
  AfterViewInit,
  Output,
  NgZone,
} from '@angular/core';
import { TablaColumn, TablaRow } from './tables.model';
import { CommonModule } from '@angular/common';
import {
  RowComponent,
  ColComponent,
  TextColorDirective,
  CardComponent,
  CardHeaderComponent,
  CardBodyComponent,
  TableDirective,
  TableColorDirective,
} from '@coreui/angular';
import { ConsumoGenericoService } from '../../../core/application/services/consumo-generico/consumo-generico.service';
import { ChangeDetectorRef, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import Swal from 'sweetalert2';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';

@Component({
  selector: 'app-tables',
  templateUrl: './tables.component.html',
  styleUrls: ['./tables.component.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    ScrollingModule,
    CommonModule,
    RowComponent,
    ColComponent,
    TextColorDirective,
    CardComponent,
    CardHeaderComponent,
    CardBodyComponent,
    TableDirective,
    TableColorDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TablesComponent implements OnChanges, AfterViewInit, OnInit {
  @Input() columns: TablaColumn[] = [];
  @Input() rows: TablaRow[] = [];
  @Input() nombre: string = '';
  @Input() descripcion: string = '';
  @Input() acciones: boolean = false;
  @Input() PQR: boolean = false;
  @Input() anulacion: boolean = false;
  @Input() desasignar: boolean = false;
  @Input() nombreModal: string = '';
  @Input() valueacciones: string = '';
  @Input() filtroEstado: string[] = [];
  @Input() isCollapsed: boolean = false;
  @Input() actions: boolean = false;
  @Input() visualizacion: boolean = false;
  @Input() valueactions: string = '';
  @Input() nombremetodo!: string;
  @Input() isValidModal: boolean = false;
  @Output() closeEvent = new EventEmitter<void>();
  @Output() updated = new EventEmitter<void>();

  filteredRows: TablaRow[] = [];
  paginatedRows: TablaRow[] = [];
  userRoles: string[] = [];
  columnPositions: number[] = [];

  // Variables de paginación
  currentPage: number = 1;
  itemsPerPage: number = 50;
  totalPages: number = 1;
  paginationRange: (number | null)[] = [];

  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  @ViewChild('modalContainer', { read: ViewContainerRef, static: true })
  modalContainer!: ViewContainerRef;
  @ViewChild(CdkVirtualScrollViewport, { static: false })
  viewPort!: CdkVirtualScrollViewport;
  private filterSubject = new Subject<void>();

  constructor(
    private consumogenericoServices: ConsumoGenericoService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {
    this.filterSubject.pipe(debounceTime(300)).subscribe(() => {
      this.applyFilter();
    });
  }

  public get inverseOfTranslation(): string {
    if (!this.viewPort || !this.viewPort['_renderedContentOffset']) {
      return '-0px';
    }
    let offset = this.viewPort['_renderedContentOffset'];
    return `-${offset}px`;
  }

  ngAfterViewInit() {}

  visibleColumns: string[] = [];
  isTogglerOpen: boolean = false;

  ngOnInit(): void {
    this.loadColumnPreferences();
    this.loadColumnOrder();
    this.columnPositions = this.columns.map((_, index) => index);
    const rolesAsignados = sessionStorage.getItem('roles_asignados');
    if (rolesAsignados) {
      this.userRoles = rolesAsignados.split(','); // Convertir la cadena de roles a un array
    }

    // Lógica para controlar la visibilidad de los botones en base a los roles del usuario
    if (!this.userRoles.includes('CEO') && !this.userRoles.includes('Logistica')) {
      this.anulacion = false;
    }
  }

  draggedIndex: number = -1;

  dragStart(index: number) {
    this.draggedIndex = index;
  }

  dragOver(event: DragEvent, index: number) {
    event.preventDefault(); // Permite soltar el elemento
  }

  trackByFn(index: number, item: any): any {
    return item?.id ?? index;
  }

  getStatusClass(value: string): string {
    if (!value) return '';
    const activeStates = [
      'Cargado',
      'ACTIVO',
      'Entregad',
      'Pagad',
      'Marketing',
      'Referido',
      'Archivad',
      'Digitalizad',
      'OK',
      'Debito',
      'No',
      'Gestionada',
      'Activo',
    ];
    return activeStates.some((state) => value.includes(state))
      ? 'status active'
      : 'status inactive';
  }

  getStatusClassWallet(value: string): string {
    if (!value) return '';
    const activeStates = ['Habilitada'];
    return activeStates.some((state) => value.includes(state))
      ? 'status active'
      : 'status inactive';
  }

  drop(index: number) {
    if (this.draggedIndex !== -1 && this.draggedIndex !== index) {
      const [movedColumn] = this.columns.splice(this.draggedIndex, 1);
      this.columns.splice(index, 0, movedColumn);
      this.saveColumnOrder();
    }
    this.draggedIndex = -1;
  }

  changeColumnPosition(fromIndex: number, toIndex: number) {
    if (fromIndex === toIndex || toIndex < 0 || toIndex >= this.columns.length)
      return;

    const movedColumn = this.columns.splice(fromIndex, 1)[0];
    this.columns.splice(toIndex, 0, movedColumn);

    // Actualizar las posiciones para reflejar el cambio
    this.columnPositions = this.columns.map((_, index) => index);
    this.saveColumnOrder();
  }

  toggleColumnVisibility(columnKey: string): void {
    const index = this.visibleColumns.indexOf(columnKey);
    if (index === -1) {
      this.visibleColumns.push(columnKey);
    } else {
      this.visibleColumns.splice(index, 1);
    }
    this.saveColumnPreferences();
  }

  isColumnVisible(columnKey: string): boolean {
    return this.visibleColumns.includes(columnKey);
  }

  selectAllColumns(): void {
    if (this.columns && this.columns.length > 0) {
      this.visibleColumns = this.columns.map((column) => column.key);
      this.saveColumnPreferences();
    }
  }

  cleanValue(value: string | null | undefined): number | null {
    if (value === undefined || value === null || value.trim() === '') {
      return null; // Retorna null si el valor es undefined, null o está vacío
    }
    return parseFloat(value.replace(/[%\s]/g, '')); // Elimina % y espacios, y convierte a número
  }

  deselectAllColumns(): void {
    this.visibleColumns = [];
    this.saveColumnPreferences();
  }

  saveColumnPreferences(): void {
    let valorTexto: string = this.descripcion;
    if (this.descripcion.length == 0) {
      valorTexto = this.nombre;
    }

    localStorage.setItem(
      `visibleColumns_${valorTexto}`,
      JSON.stringify(this.visibleColumns)
    );
  }

  private cache = new Map<string, any>();

  loadColumnPreferences(): void {
    const cacheKey = `visibleColumns_${this.nombre || this.descripcion}`;

    if (this.cache.has(cacheKey)) {
      this.visibleColumns = this.cache.get(cacheKey);
      return;
    }

    const savedColumns = localStorage.getItem(cacheKey);
    if (savedColumns) {
      this.visibleColumns = JSON.parse(savedColumns);
      this.cache.set(cacheKey, this.visibleColumns);
    } else {
      this.selectAllColumns();
    }
  }

  sortByColumn(columnKey: string) {
    if (this.sortColumn === columnKey) {
      // Alternar la dirección si se hace clic en la misma columna
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      // Ordenar por una nueva columna
      this.sortColumn = columnKey;
      this.sortDirection = 'asc'; // Restablecer la dirección de ordenación a ascendente
    }

    this.applySort();
  }

  applySort() {
    this.rows.sort((a, b) => {
      const valueA = a[this.sortColumn];
      const valueB = b[this.sortColumn];

      // Si alguno de los valores es vacío o null, lo tratamos como un valor mínimo para que se ordenen al final
      if (valueA == null || valueA === '') {
        return 1; // Coloca los valores nulos o vacíos al final
      }
      if (valueB == null || valueB === '') {
        return -1; // Coloca los valores nulos o vacíos al final
      }

      let comparison = 0;

      // Si los valores son números, realiza la comparación numérica
      if (typeof valueA === 'number' && typeof valueB === 'number') {
        comparison = valueA - valueB;
      } else {
        // De lo contrario, realiza la comparación de cadenas de texto
        comparison = valueA.toString().localeCompare(valueB.toString());
      }

      // Devuelve el resultado de la comparación basado en la dirección de ordenamiento
      return this.sortDirection === 'asc' ? comparison : -comparison;
    });

    // Actualizar los datos paginados después del ordenamiento
    this.updatePageData();
  }

  async desasignarGuia(nombreModal: string, row: TablaRow) {
    if (row['EstadoLogistico'].trim() !== 'Admitida') {
      Swal.fire({
        icon: 'warning',
        title: 'No se puede desasignar',
        text: 'La guía ya fue despachada.',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Entendido',
      });
      return;
    }

    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción desasignará la guía de la planilla y no se podrá deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, desasignar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        // Enviar actualización al servidor
        const objetoActualizacion = [
          {
            gpA_IdGuiaPlanilla: Number(row['IdGuiaPlanilla']),
            guI_IdGuia: Number(row['IdGuia']),
            plA_IdPlanilla: Number(row['IdPlanilla']),
            egP_IdEstadoGuiaPlanilla: 2,
            gpA_CreadoEstadoGuiaPlanilla: 'sistema',
          },
        ];
      }
    });
  }

  async anularGuia(nombreModal: string, row: TablaRow) {
    if (row['Estado'] !== 'Creado' && row['Estado'] !== 'Creada' && row['Estado'] !== 'GENERADA EN MEDELLIN' && row['Estado'] !== 'Creación del número de órden') {
      Swal.fire({
        icon: 'warning',
        title: 'No se puede anular',
        text: 'La guía ya fue despachada y no se puede anular.',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Entendido',
      });
      return;
    }

    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción anulará la guía y no se podrá deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, anular',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        // Enviar actualización al servidor
        const objetoActualizacion = { Estado: 'Anulada' };

        this.consumogenericoServices
          .actualizarGenerico(
            objetoActualizacion,
            row['_id'],
            'metodoGenerico?coleccion=PedidosInter'
          )
          .subscribe(
            (response) => {
              Swal.fire({
                icon: 'success',
                title: 'Éxito',
                text: 'Documento actualizado exitosamente',
              });

              row['Estado'] = 'Anulada';
              this.cdr.detectChanges();
            },
            (error) => {
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text:
                  error.message ||
                  'Hubo un problema al actualizar el documento. Por favor, inténtelo de nuevo.',
              });
            }
          );
      }
    });
  }

  async abrirModal(nombreModal: string, row: TablaRow) {
    if (!this.modalContainer) {
      console.error('modalContainer no está definido');
      return;
    }

    this.modalContainer.clear();

  }

  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.loadColumnPreferences();
    if (changes['columns']) {
      this.loadColumnOrder();
    }
    if (changes['rows'] || changes['filtroEstado']) {
      this.applyFilter();
      this.cdr.markForCheck();
    }
  }

  private applyFilter(): void {
    this.ngZone.runOutsideAngular(() => {
      const filtered = this.rows.filter(
        (row) =>
          this.filtroEstado.length === 0 ||
          this.filtroEstado.includes(row['Estado'])
      );

      this.totalPages = Math.ceil(filtered.length / this.itemsPerPage);
      this.currentPage =
        this.currentPage > this.totalPages ? 1 : this.currentPage;

      this.ngZone.run(() => {
        this.filteredRows = filtered;
        this.updatePageData();
        this.cdr.markForCheck();
      });
    });
  }

  private updatePageData(): void {
    this.filteredRows = this.rows.filter((row) => {
      return this.filtroEstado.length
        ? this.filtroEstado.includes(row['Estado'])
        : true;
    });

    // Calcular las páginas
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedRows = this.filteredRows.slice(startIndex, endIndex);

    // Calcular el número total de páginas
    this.totalPages = Math.ceil(this.filteredRows.length / this.itemsPerPage);
    this.updatePaginationRange();
  }

  updatePaginationRange(): void {
    const range: (number | null)[] = [];
    const delta = 1;

    if (this.totalPages <= 5 + 2 * delta) {
      for (let i = 1; i <= this.totalPages; i++) {
        range.push(i);
      }
    } else {
      const left = Math.max(2, this.currentPage - delta);
      const right = Math.min(this.totalPages - 1, this.currentPage + delta);

      range.push(1);
      if (left > 2) range.push(null); // Usa 'null' en lugar de '...'
      for (let i = left; i <= right; i++) {
        range.push(i);
      }
      if (right < this.totalPages - 1) range.push(null); // Usa 'null' en lugar de '...'
      range.push(this.totalPages);
    }

    this.paginationRange = range;
  }

  // Métodos de paginación
  goToPage(page: number): void {
    if (typeof page === 'number') {
      this.currentPage = page;
      this.updatePageData();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePageData();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePageData();
    }
  }

  // En TablesComponent
  saveColumnOrder(): void {
    let storageKey = `columnOrder_${this.descripcion}_${this.nombre}`;
    localStorage.setItem(
      storageKey,
      JSON.stringify(this.columns.map((col) => col.key))
    );
  }

  loadColumnOrder(): void {
    let storageKey = `columnOrder_${this.descripcion}_${this.nombre}`;
    const savedOrder = localStorage.getItem(storageKey);

    if (savedOrder && this.columns.length > 0) {
      const order = JSON.parse(savedOrder) as string[];

      // Reordenar las columnas según lo guardado
      this.columns.sort((a, b) => {
        const indexA = order.indexOf(a.key);
        const indexB = order.indexOf(b.key);

        // Si alguna clave no está en el orden guardado, mándala al final
        const safeIndexA = indexA === -1 ? Number.MAX_SAFE_INTEGER : indexA;
        const safeIndexB = indexB === -1 ? Number.MAX_SAFE_INTEGER : indexB;

        return safeIndexA - safeIndexB;
      });

      // Actualizar las posiciones
      this.columnPositions = this.columns.map((_, index) => index);
    }
  }
}
