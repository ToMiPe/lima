import { Pipe, PipeTransform } from '@angular/core';
import { getBanderaDepartamento } from '@shared/constants/departamentos.constant';

/**
 * Pipe para obtener la ruta de la bandera de un departamento
 * @example
 * <img [src]="'LA_PAZ' | departmentFlag" alt="La Paz" />
 * <img [src]="epsa.department | departmentFlag" alt="Departamento" />
 */
@Pipe({
  name: 'departmentFlag',
  standalone: true,
})
export class DepartmentFlagPipe implements PipeTransform {
  transform(primary: string | undefined | null, fallback?: string | undefined | null): string {
    const value = primary || fallback || 'BO';
    return getBanderaDepartamento(value);
  }
}
