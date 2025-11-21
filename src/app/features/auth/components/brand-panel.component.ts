import { Component } from '@angular/core';

@Component({
  selector: 'app-brand-panel',
  template: `
    <div class="brand-panel">
      <div class="brand-content">
        <!-- Espaciador superior -->
        <div></div>

        <!-- Logo y título centrados -->
        <div class="brand-main">
          <img src="assets/icons/svg/mirar.svg" alt="MIRAR" class="brand-logo" />
          <h1 class="system-title">MIRAR</h1>
          <p class="system-acronym">
            Sistema Integral de Gestión de Riesgos de Agua Potable y Saneamiento
          </p>
          <p class="system-subtitle">SIIRAyS - AAPS</p>
        </div>

        <!-- Redes sociales en la parte inferior -->
        <div class="social-links">
          <a href="#" aria-label="Facebook"><i class="pi pi-facebook"></i></a>
          <a href="#" aria-label="Twitter"><i class="pi pi-twitter"></i></a>
          <a href="#" aria-label="Instagram"><i class="pi pi-instagram"></i></a>
          <a href="#" aria-label="LinkedIn"><i class="pi pi-linkedin"></i></a>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .brand-panel {
        position: relative;
        padding: 3rem;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        min-height: 100vh;
      }

      .brand-content {
        position: relative;
        z-index: 1;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        height: 100%;
        color: #ffffff;
        text-align: center;
        padding: 2rem 0 4rem 0;
      }

      .brand-main {
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .brand-logo {
        width: 200px;
        margin-bottom: 1rem;
        filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.3));
      }

      .system-title {
        font-size: 4rem;
        font-weight: 800;
        letter-spacing: 0.15em;
        text-transform: uppercase;
        margin: 0 0 0.5rem 0;
        color: #ffffff;
        text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.2);
      }

      .system-acronym {
        font-size: 1.35rem;
        font-weight: 500;
        color: rgba(255, 255, 255, 0.9);
        margin: 0 0 0.25rem 0;
        line-height: 1.6;
      }

      .system-subtitle {
        font-size: 1.15rem;
        font-weight: 400;
        color: rgba(255, 255, 255, 0.9);
        margin: 0;
      }

      .social-links {
        display: flex;
        gap: 1rem;
        justify-content: center;
        margin-top: 2rem;

        a {
          width: 45px;
          height: 45px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          text-decoration: none;
          transition: all 0.3s ease;
          border: 1px solid rgba(255, 255, 255, 0.2);

          &:hover {
            background: rgba(255, 255, 255, 0.25);
            transform: translateY(-3px);
            box-shadow: 0 6px 20px rgba(255, 255, 255, 0.2);
          }

          .pi {
            font-size: 1.25rem;
          }
        }
      }

      // Responsive
      @media (max-width: 768px) {
        .system-title {
          font-size: 2.5rem;
        }

        .system-acronym {
          font-size: 1rem;
        }

        .system-subtitle {
          font-size: 0.9rem;
        }

        .brand-panel {
          padding: 2rem 1rem;
        }

        .social-links a {
          width: 35px;
          height: 35px;

          .pi {
            font-size: 1rem;
          }
        }
      }

      @media (max-width: 480px) {
        .system-title {
          font-size: 2rem;
        }

        .brand-logo {
          width: 150px;
        }
      }
    `,
  ],
})
export class BrandPanelComponent {}
