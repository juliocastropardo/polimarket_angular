import { AfterContentInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { ChartjsComponent } from '@coreui/angular-chartjs';
import { IconDirective } from '@coreui/icons-angular';
import { ColComponent, RowComponent, WidgetStatDComponent } from '@coreui/angular';
import { ChartData } from 'chart.js';
import { CicloEntrega } from './ciclo-entrega.model';
import { CommonModule } from '@angular/common';

type BrandData = {
  icon: string
  values: any[]
  capBg?: any
  color?: string
  labels?: string[]
  data: ChartData
}

@Component({
  selector: 'app-widgets-brand',
  templateUrl: './widgets-brand.component.html',
  styleUrls: ['./widgets-brand.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
  standalone: true,
  imports: [CommonModule, RowComponent, ColComponent, WidgetStatDComponent, IconDirective, ChartjsComponent]
})
export class WidgetsBrandComponent implements OnInit, AfterContentInit {

  enviacicloentrega: string = "";
  enviaporcentajedevolucion: string = "";
  enviaporcentajeentrega: string = "";
  enviaporcentajenovedad: string = "";
  intercicloentrega: string = "";
  interporcentajedevolucion: string = "";
  interporcentajeentrega: string = "";
  interporcentajenovedad: string = "";
  coorcicloentrega: string = "";
  coorporcentajedevolucion: string = "";
  coorporcentajeentrega: string = "";
  coorporcentajenovedad: string = "";
  hokocicloentrega: string = "";
  hokoporcentajedevolucion: string = "";
  hokoporcentajeentrega: string = "";
  hokoporcentajenovedad: string = "";

  ciclosEntrega: CicloEntrega[] = [];

  constructor(
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  @Input() withCharts?: boolean;
  // @ts-ignore
  chartOptions = {
    elements: {
      line: {
        tension: 0.4
      },
      point: {
        radius: 0,
        hitRadius: 10,
        hoverRadius: 4,
        hoverBorderWidth: 3
      }
    },
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      x: {
        display: false
      },
      y: {
        display: false
      }
    }
  };
  labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
  datasets = {
    borderWidth: 2,
    fill: true
  };
  colors = {
    backgroundColor: 'rgba(255,255,255,.1)',
    borderColor: 'rgba(255,255,255,.55)',
    pointHoverBackgroundColor: '#fff',
    pointBackgroundColor: 'rgba(255,255,255,.55)'
  };
  brandData: BrandData[] = [
    {
      icon: 'assets/images/INTER.png',
      values: [{ title: 'Ciclo Entrega', value: "" }, { title: '% Devolucion', value: this.coorporcentajedevolucion }, { title: '% Entrega', value: '459' }, { title: '% Novedad', value: '459' }],
      capBg: { '--cui-card-cap-bg': '#0A236B' },
      labels: [...this.labels],
      data: {
        labels: [...this.labels],
        datasets: [{ ...this.datasets, data: [65, 59, 84, 84, 51, 55, 40], label: 'Interrapidisimo', ...this.colors }]
      }
    },
    {
      icon: 'assets/images/envia.png',
      values: [{ title: 'Ciclo Entrega', value: '89K' }, { title: '% Devolucion', value: '459' }, { title: '% Entrega', value: '459' }, { title: '% Novedad', value: '459' }],
      capBg: { '--cui-card-cap-bg': '#F7C5C5' },
      data: {
        labels: [...this.labels],
        datasets: [{ ...this.datasets, data: [1, 13, 9, 17, 34, 41, 38], label: 'Envia', ...this.colors }]
      }
    },
    {
      icon: 'assets/images/COORDINADORA.png',
      values: [{ title: 'Ciclo Entrega', value: '89K' }, { title: '% Devolucion', value: '459' }, { title: '% Entrega', value: '459' }, { title: '% Novedad', value: '459' }],
      capBg: { '--cui-card-cap-bg': '#4875b4' },
      data: {
        labels: [...this.labels],
        datasets: [{ ...this.datasets, data: [78, 81, 80, 45, 34, 12, 40], label: 'Coordinadora', ...this.colors }]
      }
    },
    {
      icon: 'assets/images/HOKO.png',
      values: [{ title: 'Ciclo Entrega', value: '89K' }, { title: '% Devolucion', value: '459' }, { title: '% Entrega', value: '459' }, { title: '% Novedad', value: '459' }],
      capBg: { '--cui-card-cap-bg': '#BEBEBE' },
      data: {
        labels: [...this.labels],
        datasets: [{ ...this.datasets, data: [35, 23, 56, 22, 97, 23, 64], label: 'Hoko', ...this.colors }]
      }
    }
  ];

  async fetchTableData(): Promise<void> {
  }

  updateCicloEntregaValues(): void {
    this.ciclosEntrega.forEach(ciclo => {
      this.enviacicloentrega = ciclo.enviacicloentrega;
      this.enviaporcentajedevolucion = ciclo.enviaporcentajedevolucion;
      this.enviaporcentajeentrega = ciclo.enviaporcentajeentrega;
      this.enviaporcentajenovedad = ciclo.enviaporcentajenovedad;
      this.intercicloentrega = ciclo.intercicloentrega;
      this.interporcentajedevolucion = ciclo.interporcentajedevolucion;
      this.interporcentajeentrega = ciclo.interporcentajeentrega;
      this.interporcentajenovedad = ciclo.interporcentajenovedad;
      this.coorcicloentrega = ciclo.coorcicloentrega;
      this.coorporcentajedevolucion = ciclo.coorporcentajedevolucion;
      this.coorporcentajeentrega = ciclo.coorporcentajeentrega;
      this.coorporcentajenovedad = ciclo.coorporcentajenovedad;
      this.hokocicloentrega = ciclo.hokocicloentrega;
      this.hokoporcentajedevolucion = ciclo.hokoporcentajedevolucion;
      this.hokoporcentajeentrega = ciclo.hokoporcentajeentrega;
      this.hokoporcentajenovedad = ciclo.hokoporcentajenovedad;
    });
  }

  updateBrandData(): void {
    this.brandData = [
      {
        icon: 'assets/images/INTER.png',
        values: [{ title: 'Ciclo Entrega', value: this.intercicloentrega }, { title: '% Devolucion', value: this.interporcentajedevolucion }, { title: '% Entrega', value: this.interporcentajeentrega }, { title: '% Novedad', value: this.interporcentajenovedad }],
        capBg: { '--cui-card-cap-bg': '#0A236B' },
        labels: [...this.labels],
        data: {
          labels: [...this.labels],
          datasets: [{ ...this.datasets, data: [65, 59, 84, 84, 51, 55, 40], label: 'Interrapidisimo', ...this.colors }]
        }
      },
      {
        icon: 'assets/images/envia.png',
        values: [{ title: 'Ciclo Entrega', value: this.enviacicloentrega }, { title: '% Devolucion', value: this.enviaporcentajedevolucion }, { title: '% Entrega', value: this.enviaporcentajeentrega }, { title: '% Novedad', value: this.enviaporcentajenovedad }],
        capBg: { '--cui-card-cap-bg': '#F7C5C5' },
        data: {
          labels: [...this.labels],
          datasets: [{ ...this.datasets, data: [1, 13, 9, 17, 34, 41, 38], label: 'Envia', ...this.colors }]
        }
      },
      {
        icon: 'assets/images/COORDINADORA.png',
        values: [{ title: 'Ciclo Entrega', value: this.coorcicloentrega }, { title: '% Devolucion', value: this.coorporcentajedevolucion }, { title: '% Entrega', value: this.coorporcentajeentrega }, { title: '% Novedad', value: this.coorporcentajenovedad }],
        capBg: { '--cui-card-cap-bg': '#4875b4' },
        data: {
          labels: [...this.labels],
          datasets: [{ ...this.datasets, data: [78, 81, 80, 45, 34, 12, 40], label: 'Coordinadora', ...this.colors }]
        }
      },
      {
        icon: 'assets/images/HOKO.png',
        values: [{ title: 'Ciclo Entrega', value: this.hokocicloentrega }, { title: '% Devolucion', value: this.hokoporcentajedevolucion }, { title: '% Entrega', value: this.hokoporcentajeentrega }, { title: '% Novedad', value: this.hokoporcentajenovedad }],
        capBg: { '--cui-card-cap-bg': '#BEBEBE' },
        data: {
          labels: [...this.labels],
          datasets: [{ ...this.datasets, data: [35, 23, 56, 22, 97, 23, 64], label: 'Hoko', ...this.colors }]
        }
      }
    ];
  }

  ngOnInit(): void {
    this.fetchTableData(); // Llama a fetchTableData después de la inicialización del componente
  }

  ngAfterContentInit(): void {}
}
