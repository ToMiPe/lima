import { Pipe, PipeTransform } from '@angular/core';
import { getDepartamentoPorCodigoNumerico } from '@shared/constants/departamentos.constant';

/**
 * Pipe para obtener el nombre de un departamento desde su código numérico
 * @example
 * <span>{{ '03' | departmentName }}</span> <!-- Cochabamba -->
 * <span>{{ codMuni.substring(0, 2) | departmentName }}</span>
 */
@Pipe({
  name: 'departmentName',
  standalone: true,
})
export class DepartmentNamePipe implements PipeTransform {
  transform(codigo: string | undefined | null): string {
    if (!codigo) return '';
    const departamento = getDepartamentoPorCodigoNumerico(codigo);
    return departamento?.nombre || '';
  }
}
