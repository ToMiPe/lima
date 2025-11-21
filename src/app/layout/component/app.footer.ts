import { Component, signal } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-footer',
  template: `<div class="layout-footer">
    {{ NAME() }} de
    <a
      href="https://aaps.gob.bo"
      target="_blank"
      rel="noopener noreferrer"
      class="text-primary font-bold hover:underline"
      >AAPS</a
    >
  </div>`,
})
export class AppFooter {
  protected NAME = signal(environment.SYSTEM_ID);
}
