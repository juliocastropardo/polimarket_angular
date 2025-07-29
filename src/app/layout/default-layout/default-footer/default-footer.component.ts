import { Component } from '@angular/core';
import { FooterComponent } from '@coreui/angular';
import { QuicklinkModule } from 'ngx-quicklink';

@Component({
    imports: [QuicklinkModule],
    selector: 'app-default-footer',
    templateUrl: './default-footer.component.html',
    styleUrls: ['./default-footer.component.scss'],
    standalone: true,
})
export class DefaultFooterComponent extends FooterComponent {
  constructor() {
    super();
  }
}
