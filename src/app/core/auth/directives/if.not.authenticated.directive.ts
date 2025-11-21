/* eslint-disable @angular-eslint/directive-selector */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Directive, TemplateRef, ViewContainerRef, inject, effect } from '@angular/core';
import { AuthFacade } from '../services/auth.facade';

@Directive({
  selector: '[ifNotAuthenticated]',
  standalone: true,
})
export class IfNotAuthenticatedDirective {
  private readonly authFacade = inject(AuthFacade);
  private readonly templateRef = inject(TemplateRef<any>);
  private readonly viewContainer = inject(ViewContainerRef);

  constructor() {
    effect(() => {
      const isAuthenticated = this.authFacade.isAuthenticated();

      if (!isAuthenticated) {
        this.viewContainer.createEmbeddedView(this.templateRef);
      } else {
        this.viewContainer.clear();
      }
    });
  }
}
