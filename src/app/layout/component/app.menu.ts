import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';
import { ITEMS_MENU } from '@layout/constants/items.menu.constant';
import { AuthFacade } from '@core/auth/services';
import { UserRole } from '@core/auth/interfaces';

interface MenuItemWithRoles extends MenuItem {
  roles?: UserRole[];
  items?: MenuItemWithRoles[];
}

@Component({
  selector: 'app-menu',
  imports: [CommonModule, AppMenuitem, RouterModule],
  template: `<ul class="layout-menu">
    @for (item of model(); track $index) {
      @if (!item.separator) {
        <li app-menuitem [item]="item" [index]="$index" [root]="true"></li>
      } @else {
        <li class="menu-separator"></li>
      }
    }
  </ul>`,
})
export class AppMenu {
  private readonly authFacade = inject(AuthFacade);

  /**
   * Signal computado que filtra el menú según los roles del usuario
   */
  model = computed(() => {
    const userRoles = this.authFacade.userRoles();
    return this.filterMenuByRoles(ITEMS_MENU, userRoles);
  });

  /**
   * Filtra items del menú según roles del usuario
   */
  private filterMenuByRoles(
    items: MenuItemWithRoles[],
    userRoles: UserRole[],
  ): MenuItemWithRoles[] {
    return items
      .filter((item) => this.canAccessItem(item, userRoles))
      .map((item) => {
        // Si tiene sub-items, filtrarlos también
        if (item.items && item.items.length > 0) {
          return {
            ...item,
            items: this.filterMenuByRoles(item.items, userRoles),
          };
        }
        return item;
      })
      .filter((item) => {
        // Eliminar secciones que quedaron sin items después del filtrado
        if (item.items) {
          return item.items.length > 0;
        }
        return true;
      });
  }

  /**
   * Verifica si el usuario tiene acceso a un item
   */
  private canAccessItem(item: MenuItemWithRoles, userRoles: UserRole[]): boolean {
    // Si no tiene roles definidos, es público (visible para todos autenticados)
    if (!item.roles || item.roles.length === 0) {
      return true;
    }

    // Verificar si el usuario tiene alguno de los roles requeridos
    return item.roles.some((requiredRole) => userRoles.includes(requiredRole));
  }
}
