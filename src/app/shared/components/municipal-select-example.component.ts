/**
 * EJEMPLO: Selector de Municipios con Banderas de Departamento
 *
 * Este es un ejemplo de cómo crear un selector reutilizable
 * para municipios que muestre la bandera del departamento correspondiente.
 *
 * USAR ESTE CÓDIGO COMO REFERENCIA para implementar selects similares.
 */

import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { DepartmentFlagPipe } from '@shared/pipes/department-flag.pipe';
import { DEPARTAMENTOS_ARRAY } from '@shared/constants/departamentos.constant';

/**
 * Interface para opciones de municipio
 */
interface MunicipioOption {
  id: string;
  nombre: string;
  departamento: string; // Código del departamento: "LA_PAZ", "COCHABAMBA", etc.
}

/**
 * Interface para grupos de municipios por departamento
 */
interface MunicipioGroup {
  label: string; // Nombre del departamento para mostrar
  code: string; // Código del departamento
  items: MunicipioOption[];
}

/**
 * EJEMPLO DE USO:
 *
 * <app-municipal-select-example
 *   [municipios]="municipiosData"
 *   [selectedId]="selectedMunicipioId()"
 *   (selectedIdChange)="selectedMunicipioId.set($event)"
 * />
 */
@Component({
  selector: 'app-municipal-select-example',
  standalone: true,
  imports: [CommonModule, FormsModule, SelectModule, DepartmentFlagPipe],
  template: `
    <div class="municipal-select-wrapper">
      <!-- SELECT SIMPLE (sin agrupar) -->
      <p-select
        [options]="municipios()"
        [ngModel]="selectedId()"
        (ngModelChange)="onSelectionChange($event)"
        optionLabel="nombre"
        optionValue="id"
        [filter]="true"
        filterBy="nombre"
        placeholder="Seleccione un municipio"
        [showClear]="true"
        styleClass="w-full"
      >
        <!-- Item seleccionado -->
        <ng-template pTemplate="selectedItem" let-selected>
          @if (selected) {
            <div class="municipality-selected">
              <img
                [src]="getMunicipio(selected.id)?.departamento | departmentFlag"
                [alt]="getMunicipio(selected.id)?.departamento"
                width="24"
                height="16"
                class="department-flag"
              />
              <span>{{ selected.nombre }}</span>
            </div>
          }
        </ng-template>

        <!-- Items del dropdown -->
        <ng-template let-muni pTemplate="item">
          <div class="municipality-item">
            <img
              [src]="muni.departamento | departmentFlag"
              [alt]="muni.departamento"
              width="20"
              height="14"
              class="department-flag"
            />
            <span>{{ muni.nombre }}</span>
          </div>
        </ng-template>
      </p-select>

      <!-- SELECT AGRUPADO POR DEPARTAMENTO -->
      <p-select
        [options]="municipiosAgrupados()"
        [ngModel]="selectedId()"
        (ngModelChange)="onSelectionChange($event)"
        [group]="true"
        optionLabel="nombre"
        optionValue="id"
        [filter]="true"
        filterBy="nombre"
        placeholder="Seleccione municipio (agrupado)"
        [showClear]="true"
        styleClass="w-full mt-3"
      >
        <!-- Header del grupo (departamento) -->
        <ng-template let-group pTemplate="group">
          <div class="department-group-header">
            <img
              [src]="group.code | departmentFlag"
              [alt]="group.label"
              width="24"
              height="16"
              class="department-flag"
            />
            <span class="font-semibold">{{ group.label }}</span>
            <span class="text-xs text-gray-500">({{ group.items.length }})</span>
          </div>
        </ng-template>

        <!-- Items dentro del grupo -->
        <ng-template let-muni pTemplate="item">
          <div class="municipality-item-grouped">
            <span>{{ muni.nombre }}</span>
          </div>
        </ng-template>

        <!-- Item seleccionado -->
        <ng-template pTemplate="selectedItem" let-selected>
          @if (selected) {
            <div class="municipality-selected">
              <img
                [src]="getMunicipio(selected.id)?.departamento | departmentFlag"
                [alt]="getMunicipio(selected.id)?.departamento"
                width="24"
                height="16"
                class="department-flag"
              />
              <span>{{ selected.nombre }}</span>
            </div>
          }
        </ng-template>
      </p-select>
    </div>
  `,
  styles: [
    `
      .municipal-select-wrapper {
        width: 100%;
      }

      .department-flag {
        border-radius: 2px;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        object-fit: cover;
      }

      .municipality-selected,
      .municipality-item,
      .municipality-item-grouped {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .municipality-item-grouped {
        padding-left: 1rem;
      }

      .department-group-header {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 0.75rem;
        background: var(--mirar-surface-50, #f8fafc);
        border-bottom: 1px solid var(--mirar-border, #e2e8f0);
      }
    `,
  ],
})
export class MunicipalSelectExampleComponent {
  // === INPUTS ===
  /**
   * Lista de municipios disponibles
   */
  municipios = input<MunicipioOption[]>([]);

  /**
   * ID del municipio seleccionado
   */
  selectedId = input<string>('');

  // === OUTPUTS ===
  /**
   * Emite el ID del municipio seleccionado
   */
  selectedIdChange = output<string>();

  // === COMPUTED ===
  /**
   * Agrupa municipios por departamento
   */
  municipiosAgrupados = computed<MunicipioGroup[]>(() => {
    const grouped = new Map<string, MunicipioOption[]>();

    // Agrupar por departamento
    this.municipios().forEach((muni) => {
      const dept = muni.departamento;
      if (!grouped.has(dept)) {
        grouped.set(dept, []);
      }
      grouped.get(dept)!.push(muni);
    });

    // Convertir a array de grupos ordenado por departamento
    const groups: MunicipioGroup[] = [];
    DEPARTAMENTOS_ARRAY.forEach((dept) => {
      const items = grouped.get(dept.codigo);
      if (items && items.length > 0) {
        groups.push({
          label: dept.nombre,
          code: dept.codigo,
          items: items.sort((a, b) => a.nombre.localeCompare(b.nombre)),
        });
      }
    });

    return groups;
  });

  // === MÉTODOS ===
  /**
   * Obtener municipio por ID
   */
  getMunicipio(id: string): MunicipioOption | undefined {
    return this.municipios().find((m) => m.id === id);
  }

  /**
   * Manejar cambio de selección
   */
  onSelectionChange(municipioId: string): void {
    this.selectedIdChange.emit(municipioId);
  }
}

/*
 * ============================================================
 * EJEMPLO DE DATOS (municipios-data.ts)
 * ============================================================
 */

export const MUNICIPIOS_EJEMPLO: MunicipioOption[] = [
  // La Paz
  { id: '1', nombre: 'La Paz', departamento: 'LA_PAZ' },
  { id: '2', nombre: 'El Alto', departamento: 'LA_PAZ' },
  { id: '3', nombre: 'Achocalla', departamento: 'LA_PAZ' },
  { id: '4', nombre: 'Mecapaca', departamento: 'LA_PAZ' },
  { id: '5', nombre: 'Viacha', departamento: 'LA_PAZ' },

  // Cochabamba
  { id: '6', nombre: 'Cochabamba', departamento: 'COCHABAMBA' },
  { id: '7', nombre: 'Quillacollo', departamento: 'COCHABAMBA' },
  { id: '8', nombre: 'Sacaba', departamento: 'COCHABAMBA' },
  { id: '9', nombre: 'Tiquipaya', departamento: 'COCHABAMBA' },

  // Santa Cruz
  { id: '10', nombre: 'Santa Cruz de la Sierra', departamento: 'SANTA_CRUZ' },
  { id: '11', nombre: 'Montero', departamento: 'SANTA_CRUZ' },
  { id: '12', nombre: 'Warnes', departamento: 'SANTA_CRUZ' },

  // Potosí
  { id: '13', nombre: 'Potosí', departamento: 'POTOSI' },
  { id: '14', nombre: 'Uyuni', departamento: 'POTOSI' },
  { id: '15', nombre: 'Tupiza', departamento: 'POTOSI' },

  // Chuquisaca
  { id: '16', nombre: 'Sucre', departamento: 'CHUQUISACA' },
  { id: '17', nombre: 'Tarabuco', departamento: 'CHUQUISACA' },

  // Oruro
  { id: '18', nombre: 'Oruro', departamento: 'ORURO' },
  { id: '19', nombre: 'Huanuni', departamento: 'ORURO' },

  // Tarija
  { id: '20', nombre: 'Tarija', departamento: 'TARIJA' },
  { id: '21', nombre: 'Bermejo', departamento: 'TARIJA' },

  // Beni
  { id: '22', nombre: 'Trinidad', departamento: 'BENI' },
  { id: '23', nombre: 'Riberalta', departamento: 'BENI' },

  // Pando
  { id: '24', nombre: 'Cobija', departamento: 'PANDO' },
  { id: '25', nombre: 'Porvenir', departamento: 'PANDO' },
];

/*
 * ============================================================
 * EJEMPLO DE USO EN UN COMPONENTE PADRE
 * ============================================================
 */

/*
import { Component, signal } from '@angular/core';
import { MunicipalSelectExampleComponent, MUNICIPIOS_EJEMPLO } from './municipal-select-example.component';

@Component({
  selector: 'app-demo',
  standalone: true,
  imports: [MunicipalSelectExampleComponent],
  template: `
    <div class="p-4">
      <h2>Selector de Municipios con Banderas</h2>

      <app-municipal-select-example
        [municipios]="municipios"
        [selectedId]="selectedMunicipioId()"
        (selectedIdChange)="selectedMunicipioId.set($event)"
      />

      @if (selectedMunicipioId()) {
        <p class="mt-3">
          Municipio seleccionado: {{ getSelectedMunicipioName() }}
        </p>
      }
    </div>
  `
})
export class DemoComponent {
  municipios = MUNICIPIOS_EJEMPLO;
  selectedMunicipioId = signal<string>('');

  getSelectedMunicipioName(): string {
    const muni = this.municipios.find(m => m.id === this.selectedMunicipioId());
    return muni?.nombre || '';
  }
}
*/
