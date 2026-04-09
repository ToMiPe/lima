import {
  Component,
  input,
  output,
  signal,
  effect,
  AfterViewInit,
  ElementRef,
  ViewChild,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { DepartmentStats, MapClickEvent } from '../models';

/**
 * Componente de mapa SVG de Perú interactivo
 * Carga un archivo SVG real con geometría de departamentos y aplica colores según datos
 */
@Component({
  selector: 'app-peru-map-svg',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="map-container">
      <!-- Mapa SVG de Perú -->
      <div class="svg-wrapper" #svgContainer></div>

      <!-- Tooltip para mostrar datos del departamento -->
      @if (hoveredDeptData()) {
        <div
          class="map-tooltip"
          [style.left.px]="tooltipPosition.x"
          [style.top.px]="tooltipPosition.y"
        >
          <div class="tooltip-header">{{ hoveredDeptData()!.name }}</div>
          <div class="tooltip-body">
            <div class="tooltip-row">
              <span class="tooltip-icon"><i class="pi pi-users"></i></span>
              <span class="tooltip-label">Beneficiarios:</span>
              <span class="tooltip-value">{{ formatInteger(hoveredDeptData()!.count) }}</span>
            </div>
            <div class="tooltip-row">
              <span class="tooltip-icon">&#128202;</span>
              <span class="tooltip-label">Participación:</span>
              <span class="tooltip-value"
                >{{ formatPercentage(hoveredDeptData()!.percentage) }}%</span
              >
            </div>
            @if (hoveredDeptData()!.totalAmount > 0) {
              <div class="tooltip-row">
                <span class="tooltip-icon"><i class="pi pi-dollar"></i></span>
                <span class="tooltip-label">Monto:</span>
                <span class="tooltip-value">{{
                  formatCurrency(hoveredDeptData()!.totalAmount)
                }}</span>
              </div>
            }
          </div>
          <div class="tooltip-footer">Click para filtrar</div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .map-container {
        position: relative;
        width: 100%;
        height: 100%;
        min-height: 500px;
      }

      .svg-wrapper {
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        background: transparent;
        padding: 1rem;
      }

      :host ::ng-deep svg {
        width: 100%;
        height: 100%;
        max-width: 100%;
        max-height: 600px;
        display: block;
      }

      :host ::ng-deep path[id^='PE-'] {
        fill: #e5e7eb;
        stroke: #ffffff;
        stroke-width: 2;
        stroke-linejoin: round;
        stroke-linecap: round;
        transition: all 0.3s ease;
      }

      :host ::ng-deep path[id^='PE-']:hover {
        opacity: 0.85;
        stroke: #00843d;
        stroke-width: 5;
        filter: drop-shadow(0 0 10px rgba(0, 132, 61, 0.6));
        cursor: pointer;
        z-index: 10;
      }

      /* Lago Titicaca - estilo especial */
      :host ::ng-deep path#PE-LKT {
        fill: #60a5fa !important;
        stroke: #3b82f6;
        cursor: default;
        pointer-events: none;
      }

      /* Tooltip */
      .map-tooltip {
        position: absolute;
        background: white;
        color: #1f2937;
        padding: 0;
        border-radius: 12px;
        font-size: 0.875rem;
        pointer-events: none;
        transform: translate(-50%, calc(-100% - 15px));
        white-space: nowrap;
        box-shadow:
          0 10px 25px rgba(0, 0, 0, 0.15),
          0 0 0 1px rgba(0, 132, 61, 0.2);
        z-index: 1000;
        min-width: 200px;
      }

      .tooltip-header {
        background: linear-gradient(135deg, #00843d, #005e2c);
        color: white;
        padding: 0.75rem 1rem;
        border-radius: 12px 12px 0 0;
        font-weight: 700;
        font-size: 0.9375rem;
        text-align: center;
      }

      .tooltip-body {
        padding: 0.75rem 1rem;
      }

      .tooltip-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.375rem 0;
      }

      .tooltip-row:not(:last-child) {
        border-bottom: 1px solid #f3f4f6;
      }

      .tooltip-icon {
        font-size: 1rem;
        width: 20px;
        text-align: center;
      }

      .tooltip-label {
        color: #6b7280;
        font-size: 0.8125rem;
      }

      .tooltip-value {
        margin-left: auto;
        font-weight: 600;
        color: #00843d;
      }

      .tooltip-footer {
        background: #f9fafb;
        padding: 0.5rem 1rem;
        border-radius: 0 0 12px 12px;
        text-align: center;
        font-size: 0.75rem;
        color: #6b7280;
        font-style: italic;
      }

      .map-tooltip::after {
        content: '';
        position: absolute;
        bottom: -8px;
        left: 50%;
        transform: translateX(-50%);
        width: 0;
        height: 0;
        border-left: 8px solid transparent;
        border-right: 8px solid transparent;
        border-top: 8px solid #f9fafb;
      }
    `,
  ],
})
export class PeruMapSvgComponent implements AfterViewInit {
  private http = inject(HttpClient);

  // Inputs y outputs con la nueva sintaxis de signals
  departmentData = input.required<DepartmentStats[]>();
  onMapClick = output<MapClickEvent>();

  // Signals para el tooltip
  hoveredDeptData = signal<DepartmentStats | null>(null);
  tooltipPosition = { x: 0, y: 0 };

  // ViewChild para acceder al contenedor del SVG
  @ViewChild('svgContainer', { static: false })
  svgContainer!: ElementRef<HTMLDivElement>;

  // Ruta al archivo SVG
  private svgPath = '/assets/icons/maps/peru-departments.svg';
  private svgLoaded = false;

  constructor() {
    // Effect: Actualizar colores cuando cambien los datos
    effect(() => {
      const data = this.departmentData();
      if (this.svgLoaded && data.length > 0) {
        this.applyDepartmentColors();
      }
    });
  }

  ngAfterViewInit(): void {
    this.loadSvgMap();
  }

  /**
   * Carga el archivo SVG y lo inyecta en el DOM
   */
  private async loadSvgMap(): Promise<void> {
    try {
      const svgContent = await this.http.get(this.svgPath, { responseType: 'text' }).toPromise();

      if (svgContent) {
        this.svgContainer.nativeElement.innerHTML = svgContent;

        // Dar tiempo para que el SVG se renderice en el DOM
        setTimeout(() => {
          this.attachEventListeners();
          this.applyDepartmentColors();
          this.svgLoaded = true;
        }, 100);
      }
    } catch (error) {
      console.error('Error al cargar el mapa SVG:', error);
    }
  }

  /**
   * Adjunta event listeners a los paths del SVG
   */
  private attachEventListeners(): void {
    const paths = this.svgContainer.nativeElement.querySelectorAll('path[id^="PE-"]');

    paths.forEach((path) => {
      const element = path as SVGPathElement;

      // Ignorar el Lago Titicaca (no es un departamento)
      if (element.id === 'PE-LKT') return;

      const departmentName = element.getAttribute('title') || element.id;

      // Hover: Mostrar tooltip
      element.addEventListener('mouseenter', (e: MouseEvent) => {
        element.style.opacity = '0.85';
        element.style.cursor = 'pointer';
        element.style.stroke = '#00843d';
        element.style.strokeWidth = '5';
        element.style.zIndex = '10';
        element.style.filter = 'drop-shadow(0 0 10px rgba(0, 132, 61, 0.6))';

        // Mostrar tooltip con datos completos
        const deptStats = this.departmentData().find(
          (d: DepartmentStats) => this.normalizeId(d.name) === element.id,
        );
        if (deptStats) {
          this.hoveredDeptData.set(deptStats);
          this.updateTooltipPosition(e);
        }
      });

      element.addEventListener('mousemove', (e: MouseEvent) => {
        this.updateTooltipPosition(e);
      });

      element.addEventListener('mouseleave', () => {
        element.style.opacity = '1';
        element.style.stroke = '#ffffff';
        element.style.strokeWidth = '2';
        element.style.zIndex = '';
        element.style.filter = 'none';

        // Ocultar tooltip
        this.hoveredDeptData.set(null);
      });

      // Click: Emitir evento con el departamento seleccionado
      element.addEventListener('click', () => {
        const stats = this.departmentData().find(
          (d: DepartmentStats) => this.normalizeId(d.name) === element.id,
        );
        if (stats) {
          this.onMapClick.emit({
            departmentId: stats.id,
            departmentName: departmentName,
            stats: stats,
          });
        }
      });
    });
  }

  /**
   * Aplica colores a los departamentos según sus datos
   */
  private applyDepartmentColors(): void {
    const paths = this.svgContainer.nativeElement.querySelectorAll('path[id^="PE-"]');

    if (!paths || paths.length === 0) {
      console.warn('No se encontraron paths del mapa');
      return;
    }

    // Calcular el valor máximo para normalizar los colores
    const dataValues = this.departmentData()
      .map((d) => d.value || 0)
      .filter((v) => v > 0);
    const maxValue = dataValues.length > 0 ? Math.max(...dataValues) : 1;
    const hasData = dataValues.length > 0;
    paths.forEach((path) => {
      const element = path as SVGPathElement;

      // Ignorar el Lago Titicaca
      if (element.id === 'PE-LKT') {
        element.style.fill = '#60a5fa'; // Azul agua
        element.style.stroke = '#3b82f6';
        element.style.strokeWidth = '1';
        return;
      }

      const departmentData = this.departmentData().find(
        (d: DepartmentStats) => this.normalizeId(d.name) === element.id,
      );

      if (departmentData && departmentData.value && departmentData.value > 0) {
        // Calcular intensidad del color basado en el valor (mínimo 0.2 para que siempre sea visible)
        const intensity = Math.max(0.2, departmentData.value / maxValue);
        const color = this.getColorByIntensity(intensity);
        element.style.fill = color;
      } else {
        // Color por defecto para departamentos sin datos (gris claro)
        element.style.fill = '#d1d5db';
      }

      // Aplicar borde blanco por defecto
      element.style.stroke = '#ffffff';
      element.style.strokeWidth = '2';
      element.style.strokeLinejoin = 'round';
      element.style.strokeLinecap = 'round';
    });
  }

  /**
   * Convierte intensidad (0-1) en un color del gradiente ADRA
   */
  private getColorByIntensity(intensity: number): string {
    // Gradiente institucional: Solo tonos de verde ADRA
    const colors = [
      { stop: 0, rgb: [193, 225, 193] }, // Verde muy claro (fondo)
      { stop: 0.3, rgb: [134, 196, 134] }, // Verde claro
      { stop: 0.6, rgb: [67, 160, 71] }, // Verde medio
      { stop: 0.8, rgb: [0, 132, 61] }, // Verde ADRA
      { stop: 1, rgb: [0, 100, 46] }, // Verde ADRA oscuro
    ];

    // Encontrar los dos colores más cercanos
    let lowerColor = colors[0];
    let upperColor = colors[1];

    for (let i = 0; i < colors.length - 1; i++) {
      if (intensity >= colors[i].stop && intensity <= colors[i + 1].stop) {
        lowerColor = colors[i];
        upperColor = colors[i + 1];
        break;
      }
    }

    // Interpolar entre los dos colores
    const range = upperColor.stop - lowerColor.stop;
    const rangeIntensity = (intensity - lowerColor.stop) / range;

    const r = Math.round(
      lowerColor.rgb[0] + (upperColor.rgb[0] - lowerColor.rgb[0]) * rangeIntensity,
    );
    const g = Math.round(
      lowerColor.rgb[1] + (upperColor.rgb[1] - lowerColor.rgb[1]) * rangeIntensity,
    );
    const b = Math.round(
      lowerColor.rgb[2] + (upperColor.rgb[2] - lowerColor.rgb[2]) * rangeIntensity,
    );

    return `rgb(${r}, ${g}, ${b})`;
  }

  /**
   * Actualiza la posición del tooltip según la posición del mouse
   */
  private updateTooltipPosition(event: MouseEvent): void {
    const containerRect = this.svgContainer.nativeElement.getBoundingClientRect();
    this.tooltipPosition = {
      x: event.clientX - containerRect.left,
      y: event.clientY - containerRect.top,
    };
  }

  /**
   * Formatea un número entero con separadores de miles (punto)
   */
  formatInteger(value: number): string {
    return new Intl.NumberFormat('es-PE', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }

  /**
   * Formatea un número con separadores de miles (punto) y decimales (coma)
   */
  formatNumber(value: number): string {
    return new Intl.NumberFormat('es-PE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }

  /**
   * Formatea un porcentaje con 1 decimal y coma
   */
  formatPercentage(value: number): string {
    return new Intl.NumberFormat('es-PE', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(value);
  }

  /**
   * Formatea un monto como moneda (S/ con punto como miles y coma como decimales)
   */
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }

  /**
   * Normaliza el nombre del departamento para que coincida con los IDs del SVG
   * Los IDs siguen el formato ISO: PE-XXX donde XXX es la abreviación
   */
  private normalizeId(name: string): string {
    const departmentCodes: Record<string, string> = {
      amazonas: 'PE-AMA',
      ancash: 'PE-ANC',
      apurimac: 'PE-APU',
      arequipa: 'PE-ARE',
      ayacucho: 'PE-AYA',
      cajamarca: 'PE-CAJ',
      callao: 'PE-CAL',
      cusco: 'PE-CUS',
      huancavelica: 'PE-HUV',
      huanuco: 'PE-HUC',
      ica: 'PE-ICA',
      junin: 'PE-JUN',
      'la libertad': 'PE-LAL',
      lambayeque: 'PE-LAM',
      lima: 'PE-LIM',
      loreto: 'PE-LOR',
      'madre de dios': 'PE-MDD',
      moquegua: 'PE-MOQ',
      pasco: 'PE-PAS',
      piura: 'PE-PIU',
      puno: 'PE-PUN',
      'san martin': 'PE-SAM',
      tacna: 'PE-TAC',
      tumbes: 'PE-TUM',
      ucayali: 'PE-UCA',
    };

    const normalized = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Elimina acentos
      .trim();

    return departmentCodes[normalized] || `PE-${normalized.substring(0, 3).toUpperCase()}`;
  }
}
