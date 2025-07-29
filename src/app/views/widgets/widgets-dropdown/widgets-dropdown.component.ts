import { TablaColumn, TablaRow } from '../../base/tables/tables.model';
import {
  AfterContentInit,
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  Input,
  ViewChild
} from '@angular/core';
import { getStyle } from '@coreui/utils';
import { ChartjsComponent } from '@coreui/angular-chartjs';
import { RouterLink } from '@angular/router';
import { IconDirective } from '@coreui/icons-angular';
import { RowComponent, ColComponent, WidgetStatAComponent, TemplateIdDirective, ThemeDirective, DropdownComponent, ButtonDirective, DropdownToggleDirective, DropdownMenuDirective, DropdownItemDirective, DropdownDividerDirective } from '@coreui/angular';

@Component({
    selector: 'app-widgets-dropdown',
    templateUrl: './widgets-dropdown.component.html',
    styleUrls: ['./widgets-dropdown.component.scss'],
    changeDetection: ChangeDetectionStrategy.Default,
    standalone: true,
    imports: [ RowComponent, ColComponent, WidgetStatAComponent, TemplateIdDirective, IconDirective, ThemeDirective, DropdownComponent, ButtonDirective, DropdownToggleDirective, DropdownMenuDirective, DropdownItemDirective, RouterLink, DropdownDividerDirective, ChartjsComponent]
})
export class WidgetsDropdownComponent implements OnInit, AfterContentInit {
  envio: any;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
  ) {}

  public sumaventas: string = "0";
  public numeroventas: string = "0";
  public numerocerrados: string = "0";
  public numeroabiertos: string = "0";
  public numeroentregas: string = "0";
  public numerodevoluciones: string = "0";
  public costoflete: string = "0";
  public costodevolucion: string = "0";
  public costoDevolucionPromedio: string = "0";
  columns: TablaColumn[] = [];
  rows: TablaRow[] = [];
  rowsMemory: TablaRow[] = [];
  data: any[] = [];
  options: any[] = [];
  labels = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
    'January',
    'February',
    'March',
    'April'
  ];
  datasets = [
    [{
      label: 'My First dataset',
      backgroundColor: 'transparent',
      borderColor: 'rgba(255,255,255,.55)',
      pointBackgroundColor: getStyle('--cui-primary'),
      pointHoverBorderColor: getStyle('--cui-primary'),
      data: [65, 59, 84, 84, 51, 55, 40]
    }], [{
      label: 'My Second dataset',
      backgroundColor: 'transparent',
      borderColor: 'rgba(255,255,255,.55)',
      pointBackgroundColor: getStyle('--cui-info'),
      pointHoverBorderColor: getStyle('--cui-info'),
      data: [1, 18, 9, 17, 34, 22, 11]
    }], [{
      label: 'My Third dataset',
      backgroundColor: 'rgba(255,255,255,.2)',
      borderColor: 'rgba(255,255,255,.55)',
      pointBackgroundColor: getStyle('--cui-warning'),
      pointHoverBorderColor: getStyle('--cui-warning'),
      data: [78, 81, 80, 45, 34, 12, 40],
      fill: true
    }], [{
      label: 'My Fourth dataset',
      backgroundColor: 'rgba(255,255,255,.2)',
      borderColor: 'rgba(255,255,255,.55)',
      data: [78, 81, 80, 45, 34, 12, 40, 85, 65, 23, 12, 98, 34, 84, 67, 82],
      barPercentage: 0.7
    }]
  ];
  optionsDefault = {
    plugins: {
      legend: {
        display: false
      }
    },
    maintainAspectRatio: false,
    scales: {
      x: {
        border: {
          display: false,
        },
        grid: {
          display: false,
          drawBorder: false
        },
        ticks: {
          display: false
        }
      },
      y: {
        min: 30,
        max: 89,
        display: false,
        grid: {
          display: false
        },
        ticks: {
          display: false
        }
      }
    },
    elements: {
      line: {
        borderWidth: 1,
        tension: 0.4
      },
      point: {
        radius: 4,
        hitRadius: 10,
        hoverRadius: 4
      }
    }
  };


  private async fetchTableData(): Promise<void> {
    try {
  
        this.columns = this.generateColumns(this.rowsMemory);
        this.rows = [...this.rowsMemory];
  
        let sumaventas: number = 0;
        let numeroventas: number = 0;
        let numerocerrados: number = 0;
        let numeroentregas: number = 0;
        let numerodevoluciones: number = 0;
        let costoflete: number = 0;
        let sumaCostoDevolucion: number = 0;  // Nueva variable para la suma de costo de Devolucion
  
        const estadoscerrados = ['Error por Saldo', 'Entregada', 'Devolucion', 'Pagada', 'Pagado', 'Cancelado'];
        const estadosentregas = ['Entregada', 'Pagada', 'Pagado'];
        const estadosdevoluciones = ['Devolucion'];
  
        this.rowsMemory.forEach((item: any) => {
          sumaventas += item["Total recaudo"];
          costoflete += item["Total Flete"];
          if (estadoscerrados.includes(item["Estado"])) {
            numerocerrados += 1;
          }
          if (estadosentregas.includes(item["Estado"])) {
            numeroentregas += 1;
          }
          if (estadosdevoluciones.includes(item["Estado"])) {
            numerodevoluciones += 1;
            sumaCostoDevolucion += item["Total por devolución"];  // Sumar el valor de "Total por devolución"
          }
        });
  
        this.sumaventas = this.formatCurrency(sumaventas);
        numeroventas = this.rowsMemory.length;
        this.numeroventas = this.formatCurrencyvalor(numeroventas);
        this.numerocerrados = this.formatCurrencyvalor(numerocerrados);
  
        // Calcular y asignar numeroabiertos
        let numeroabiertos = numeroventas - numerocerrados;
        this.numeroabiertos = this.formatCurrencyvalor(numeroabiertos);
  
        // Asignar numeroentregas
        this.numeroentregas = this.formatCurrencyvalor(numeroentregas);
        this.numerodevoluciones = this.formatCurrencyvalor(numerodevoluciones);
  
        this.costoflete = this.formatCurrency(costoflete / numeroventas);
  
        // Calcular y asignar el costo de Devolucion promedio
        const costoDevolucionPromedio = numerodevoluciones > 0 ? sumaCostoDevolucion / numerodevoluciones : 0;
        this.costoDevolucionPromedio = this.formatCurrency(costoDevolucionPromedio);
  
    } catch (error) {
      console.error('Error al obtener y procesar los datos:', error);
    }
  }

  
  getCountByStatus(status: string): number {
    return this.rows.filter(row => row["Estado"] === status).length;
  }

  private processBlockAsync(block: any[]): Promise<void> {
    return new Promise((resolve) => {
      const processBlock = async () => {
        try {
          const sanitizedBlock = block.map(item => {
            const { _id, ...rest } = item;
            return rest;
          });
          this.rowsMemory.push(...sanitizedBlock);
          resolve();
        } catch (error) {
          console.error('Error procesando el bloque:', error);
          resolve();
        }
      };

      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(processBlock);
      } else {
        setTimeout(processBlock, 1);
      }
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-CO', { 
      style: 'currency', 
      currency: 'COP', 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 0 
    }).format(amount);
  }

  formatCurrencyvalor(amount: number): string {
    return new Intl.NumberFormat('es-CO', { 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 0 
    }).format(amount);
  }

  generateColumns(data: any[]): TablaColumn[] {
    if (data.length === 0) return [];
    return Object.keys(data[0]).map(key => ({
      key,
      title: this.capitalizeFirstLetter(key.replace(/([A-Z])/g, ' $1').trim())
    }));
  }

  capitalizeFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  ngOnInit(): void { 
  }

  ngAfterContentInit(): void {
    this.changeDetectorRef.detectChanges();

  }

  setData() {
    for (let idx = 0; idx < 4; idx++) {
      this.data[idx] = {
        labels: idx < 3 ? this.labels.slice(0, 7) : this.labels,
        datasets: this.datasets[idx]
      };
    }
    this.setOptions();
  }

  setOptions() {
    for (let idx = 0; idx < 4; idx++) {
      const options = JSON.parse(JSON.stringify(this.optionsDefault));
      switch (idx) {
        case 0: {
          this.options.push(options);
          break;
        }
        case 1: {
          options.scales.y.min = -9;
          options.scales.y.max = 39;
          options.elements.line.tension = 0;
          this.options.push(options);
          break;
        }
        case 2: {
          options.scales.x = { display: false };
          options.scales.y = { display: false };
          options.elements.line.borderWidth = 2;
          options.elements.point.radius = 0;
          this.options.push(options);
          break;
        }
        case 3: {
          options.scales.x.grid = { display: false, drawTicks: false };
          options.scales.x.grid = { display: false, drawTicks: false, drawBorder: false };
          options.scales.y.min = undefined;
          options.scales.y.max = undefined;
          options.elements = {};
          this.options.push(options);
          break;
        }
      }
    }
  }
}

@Component({
    selector: 'app-chart-sample',
    template: '<c-chart type="line" [data]="data" [options]="options" width="300" #chart></c-chart>',
    standalone: true,
    imports: [ChartjsComponent]
})
export class ChartSample implements AfterViewInit {

  constructor() {}

  @ViewChild('chart') chartComponent!: ChartjsComponent;

  colors = {
    label: 'My dataset',
    backgroundColor: 'rgba(77,189,116,.2)',
    borderColor: '#4dbd74',
    pointHoverBackgroundColor: '#fff'
  };

  labels = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  data = {
    labels: this.labels,
    datasets: [{
      data: [65, 59, 84, 84, 51, 55, 40],
      ...this.colors,
      fill: { value: 65 }
    }]
  };

  options = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    elements: {
      line: {
        tension: 0.4
      }
    }
  };

  ngAfterViewInit(): void {
    setTimeout(() => {
      const data = () => {
        return {
          ...this.data,
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
          datasets: [{
            ...this.data.datasets[0],
            data: [42, 88, 42, 66, 77],
            fill: { value: 55 }
          }, { ...this.data.datasets[0], borderColor: '#ffbd47', data: [88, 42, 66, 77, 42] }]
        };
      };
      const newLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May'];
      const newData = [42, 88, 42, 66, 77];
      let { datasets, labels } = { ...this.data };
      // @ts-ignore
      const before = this.chartComponent?.chart?.data.datasets.length;
      // @ts-ignore
      // this.data = data()
      this.data = {
        ...this.data,
        datasets: [{ ...this.data.datasets[0], data: newData }, {
          ...this.data.datasets[0],
          borderColor: '#ffbd47',
          data: [88, 42, 66, 77, 42]
        }],
        labels: newLabels
      };
      // @ts-ignore
      setTimeout(() => {
        const after = this.chartComponent?.chart?.data.datasets.length;
      });
    }, 5000);
  }
}
