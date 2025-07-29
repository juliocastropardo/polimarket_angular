import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators  } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { ConsumoGenericoService } from '../../core/application/services/consumo-generico/consumo-generico.service';

@Component({
  selector: 'app-creacion-owner-account',
  templateUrl: './creacionowneraccount.component.html',
  styleUrls: ['./creacionowneraccount.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule]
})
export class CreacionOwnerAccount implements OnInit {

  @Input() isOpen: boolean = false;
  @Output() closeEvent = new EventEmitter<void>();
  form: FormGroup;
  selectedFileFoto: File | null = null;
  selectedFileBanner: File | null = null;
  emailAddress: string = "";

  tiendas: any[] = [];

  constructor(
    private fb: FormBuilder,
    private consumogenericoServices: ConsumoGenericoService,) 
    {
      this.emailAddress = sessionStorage.getItem('emailaddress')?.toString() || '';
      this.form = this.fb.group({
        nombreTienda: ['', Validators.required],
        nombre: ['', Validators.required],
        tipoDocumento: ['', Validators.required],
        documento: ['', Validators.required],
        correo: [{ value: this.emailAddress, disabled: true }],
        telefono: ['', Validators.required],
        fotoPerfil: [''],
        banner: [''],
      });
  }

  async cargarDocumento(key: string, userData: File) {
    const bucketName = 'logigho-documentos-tienda-prod';
    
    try {
      let base64String = await this.convertirArchivoABase64(userData);
      const fileExtension = userData.name.split('.').pop(); 
      const mimeType = userData.type; 

      base64String = `${mimeType}|${fileExtension}|${base64String}`;
    } catch (error) {
      console.error('Error cargando archivo:', error);
    }
  }

  async convertirArchivoABase64(file: File): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = (error) => {
        reject(error);
      };
      reader.readAsDataURL(file); // Lee el archivo como una URL de datos
    });
  }

  ngOnInit(): void {
    this.fetchTableDataTienda();
  }

  onFileChangeFoto(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.selectedFileFoto = input.files[0];
    }
  }

  onFileChangeBanner(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.selectedFileBanner = input.files[0];
    }
  }

  async fetchTableDataTienda() {
    try {
  
      

    } catch (error) {
      console.error('Error fetching data', error);
    }
  }

  async createDocument() {
      if (this.form.valid) {
        const formData = this.form.value;  
    
        // Crear el campo 'name' basado en la lógica existente
        const formatDate = (date: Date): string => {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          const hours = String(date.getHours()).padStart(2, '0');
          const minutes = String(date.getMinutes()).padStart(2, '0');
          const seconds = String(date.getSeconds()).padStart(2, '0');
          return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        };
    
        const nombreArchivoFoto = this.form.get('nombreTienda')?.value + "_" + this.form.get('nombre')?.value.replace(/[:\- ]/g, "_") + "_Foto_Perfil"
        const nombreArchivoBanner = this.form.get('nombreTienda')?.value + "_" + this.form.get('nombre')?.value.replace(/[:\- ]/g, "_") + "_Banner"
    
        const transactionData = {
          nombre: this.form.get('nombre')?.value,
          tipoDocumento: this.form.get('tipoDocumento')?.value,
          numTelefono: this.form.get('telefono')?.value,
          fotoPerfil: nombreArchivoFoto,
          banner: nombreArchivoBanner,
          updatedAt: formatDate(new Date())
        };

        const data = await this.consumogenericoServices.consultarGenerico("1",`metodoGenerico?coleccion=Users&username=${this.form.get('correo')?.value.split("@")[0].toLowerCase()}`).toPromise();    
        // Descomprimir los datos
        this.consumogenericoServices.actualizarGenerico(transactionData, data[0]['_id'], 'metodoGenerico?coleccion=Users').subscribe(
          async response => {
            Swal.fire({
              icon: 'success',
              title: 'Éxito',
              text: 'Usuario Actualizado'
            });
    
            if (this.selectedFileFoto) {
              await this.cargarDocumento(nombreArchivoFoto, this.selectedFileFoto);
            } else {
              Swal.fire({
                icon: 'warning',
                title: 'Advertencia',
                text: 'No se ha seleccionado un archivo!'
              });
              return;
            }
      
            if (this.selectedFileBanner) {
              await this.cargarDocumento(nombreArchivoBanner, this.selectedFileBanner);
            } else {
              Swal.fire({
                icon: 'warning',
                title: 'Advertencia',
                text: 'No se ha seleccionado un archivo!'
              });
              return;
            }
    
            this.close();
          },
          error => {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: error.message || 'Hubo un problema al insertar la Factura. Por favor, inténtelo de nuevo.'
            });
          }
        );
      } else {
        Swal.fire({
          icon: 'warning',
          title: 'Formulario inválido',
          text: 'Por favor, complete todos los campos del formulario.'
        });
      }
    }

  close() {
    this.isOpen = false;
    this.selectedFileFoto = null; // Limpia el archivo seleccionado
    this.selectedFileBanner = null;
    this.closeEvent.emit();
  }
}
