import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { NgScrollbar } from 'ngx-scrollbar';
import { IconModule, IconDirective, IconSetService } from '@coreui/icons-angular';
import { cilFolder, cilTruck, cilBank, cilHome, brandSet, cilBell, cilMenu, cilList, cilEnvelopeOpen, cilTask, cilCommentSquare, cilUser, cilCreditCard, cilFile, cilLockLocked, cilAccountLogout, cilSettings, cilSun, cilMoon, cilUserFemale, cilContrast, cilCloudDownload, cilPeople, cilBarChart, cilOptions, cilCalendar, cilChartPie } from '@coreui/icons';
import { cilsavings } from './custom-icons'; 
import { ConsumoGenericoService } from '../../core/application/services/consumo-generico/consumo-generico.service';
import { switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

import {
  ContainerComponent,
  ShadowOnScrollDirective,
  SidebarBrandComponent,
  SidebarComponent,
  SidebarFooterComponent,
  SidebarHeaderComponent,
  SidebarNavComponent,
  SidebarToggleDirective,
  SidebarTogglerDirective
} from '@coreui/angular';
import { DefaultFooterComponent, DefaultHeaderComponent } from './';
import { navItems } from './_nav';
import { INavData } from '@coreui/angular';

@Component({
  selector: 'app-dashboard',
  templateUrl: './default-layout.component.html',
  styleUrls: ['./default-layout.component.scss'],
  standalone: true,
  imports: [
    IconModule,
    SidebarComponent,
    SidebarHeaderComponent,
    SidebarBrandComponent,
    RouterLink,
    NgScrollbar,
    SidebarNavComponent,
    DefaultHeaderComponent,
    ShadowOnScrollDirective,
    ContainerComponent,
    RouterOutlet,
    DefaultFooterComponent
  ]
})
export class DefaultLayoutComponent {
  public navItems: INavData[] = [];
  public isSidebarExpanded = false;
  private userRoles: string[] = [];
  private modules: any[] = [];

  constructor(
    public iconSet: IconSetService,
    private consumogenericoServices: ConsumoGenericoService,
    private router: Router
  ) {
    iconSet.icons = { cilFolder,cilTruck, cilsavings, cilChartPie, cilBank, cilHome, cilBell, cilMenu, cilList, cilEnvelopeOpen, cilTask, cilCommentSquare, cilUser, cilCreditCard, cilFile, cilLockLocked, cilAccountLogout, cilSettings, cilSun, cilMoon, cilUserFemale, cilContrast, cilCloudDownload, cilPeople, cilBarChart, cilOptions, cilCalendar, ...brandSet  };
    if (this.router) {
      this.router.events.subscribe(event => {
      });
    } else {
      console.error('Router is not available');
    }
  }

  private validateModuleAccess(): void {
    const currentModule = this.router.url;
  
    // Verificar si el usuario tiene token activo antes de ejecutar validaciones
    const token = sessionStorage.getItem('id_token'); 
    if (!token) {
      console.warn('Usuario no autenticado, deteniendo validación de permisos.');
      return;
    }
  
    const hasAccess = this.modules.some(module => module.ruta === currentModule);
  
    if (!hasAccess && currentModule !== "/app/maps") {
      // Redirige al login con un parámetro en la URL
      localStorage.setItem('accesoDenegado', 'true');
      this.router.navigate(['/login']);
    }
  }   

  expandSidebar() {
    const sidebar = document.getElementById('sidebar1');
    if (sidebar) {
      sidebar.classList.add('expanded');
    }
    this.isSidebarExpanded = true;
  }

  collapseSidebar() {
    const sidebar = document.getElementById('sidebar1');
    if (sidebar) {
      sidebar.classList.remove('expanded');
    }
    this.isSidebarExpanded = false;
    this.collapseAllMenus();
  }

  collapseAllMenus() {
    const navGroups = document.querySelectorAll('.nav-group');
    navGroups.forEach(group => {
      group.classList.remove('show');
      const navGroupItems = group.querySelector('.nav-group-items');
      if (navGroupItems) {
        (navGroupItems as HTMLElement).style.display = 'none';
      }
    });
  }

  async ngOnInit(): Promise<void> {
    await this.fetchUsers();
  }
  
  async fetchUsers(): Promise<void> {
    const parametrosOpcionales = { email: sessionStorage.getItem('emailaddress')?.toLocaleLowerCase() };
    this.consumogenericoServices.consultarGenerico("1", "users", parametrosOpcionales).pipe(
      switchMap(data => {
        // Descomprimir los datos
        return data.Resultado;
      })
    ).subscribe({
      next: (decompressedData) => {
        if (Array.isArray(decompressedData)) {
          const user = decompressedData.find(user => user.roles && Array.isArray(user.roles));
          if (user) {
            sessionStorage.setItem('tiendas_asignadas', user.tiendas);
            sessionStorage.setItem('roles_asignados', user.roles);
            sessionStorage.setItem('tiendas_id', user.idtiendas);
            if (user?.idMensajero) {
              sessionStorage.setItem('idMensajero', user.idMensajero);
            }
            this.userRoles = user.roles;
            this.fetchModules(); // Llama a fetchModules una vez que se obtienen los roles
          }
        }
      },
      error: (error) => {
        console.error('Error fetching or processing user data:', error);
      }
    });
  }

  private buildNavItems(modules: any[]): INavData[] {
    // Crear un mapa para buscar módulos por ID
    const moduleMap = new Map<string, any>();
    modules.forEach(module => {
      moduleMap.set(module.ID, module);
    });
  
    // Función recursiva para construir la jerarquía
    const buildHierarchy = (parentId: string | null): INavData[] => {
      return modules
        .filter(module => module.moduloPadre === parentId)
        .sort((a, b) => {
          // Comparar IDs como números para un orden correcto
          return Number(a.ID) - Number(b.ID);
        }) // Ordenar por ID numéricamente
        .map(module => {
          const children = buildHierarchy(module.ID); // Llamada recursiva para encontrar hijos
          return {
            name: module.Nombre.split("|")[0].trim(), // Nombre del módulo
            url: module.ruta, // Ruta del módulo
            iconComponent: { name: module.iconComponent }, // Icono
            open: false,
            ...(children.length > 0 ? { children } : {}), // Solo asignar 'children' si hay hijos
          };
        });
    };
  
    // Construir el árbol comenzando con módulos raíz (sin moduloPadre)
    const navItems = buildHierarchy(null);
  
    // Aquí puedes aplicar más transformaciones si es necesario antes de devolver la lista
    return navItems;
  }

  private fetchModules(): void {
    this.consumogenericoServices
      .consultarGenerico("1", "module?estado=ACTIVO")
      .pipe(
        switchMap(data => data.Resultado)
      )
      .subscribe({
        next: (decompressedData) => {
          if (Array.isArray(decompressedData)) {
            this.modules = decompressedData.filter(module =>
              module.roles.some((role: any) => this.userRoles.includes(role))
            );

            this.navItems = this.buildNavItems(this.modules);
            this.validateModuleAccess();
            setTimeout(() => this.collapseSidebar(), 500);
          }
        },
        error: (error) => {
          console.error('Error fetching or processing module data:', error);
        }
      });
  }

  onScrollbarUpdate($event: any) {
    return;
  }
  
  filterNavItems(navItems: INavData[], parentModuleName: string = ''): INavData[] {
    return navItems.reduce((filtered: INavData[], item: INavData) => {
      // Filtrar los hijos si existen
      const filteredChildren = item.children ? this.filterNavItems(item.children, item.name) : [];
  
      // Validar si el elemento principal debe ser incluido
      const includeItem = this.modules.some(module => {
        const moduleName = module.Nombre.split("|")[0].trim();
        let isIncluded;
        if (module.Nombre.split("|").length > 1){
          isIncluded = moduleName === item.name && module.Nombre.split("|")[1].trim().toLowerCase() === parentModuleName.toLowerCase();
        } else {
          isIncluded = moduleName === item.name;
        }
  
        return isIncluded;
      });
  
      // Incluye el item y sus hijos si es necesario
      if (includeItem || filteredChildren.length > 0) {
        filtered.push({ 
          ...item, 
          children: filteredChildren.length > 0 ? filteredChildren : item.children 
        });
      }
  
      return filtered;
    }, []);
  }
    
  
}
