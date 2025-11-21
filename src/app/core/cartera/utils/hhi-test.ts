/**
 * Test básico para verificar el HHICalculatorService
 * Ejecutar desde el dashboard temporalmente para verificar funcionamiento
 */

import { ReporteCartera } from '@core/cartera';
import { HHICalculatorService } from '@core/cartera';

// Datos de prueba simplificados
const datosTest: ReporteCartera[] = [
  {
    agencia: 'Agencia A',
    saldo_capital: 50000,
    // ... otros campos no relevantes para HHI
  } as ReporteCartera,
  {
    agencia: 'Agencia A',
    saldo_capital: 30000,
  } as ReporteCartera,
  {
    agencia: 'Agencia B',
    saldo_capital: 40000,
  } as ReporteCartera,
  {
    agencia: 'Agencia C',
    saldo_capital: 20000,
  } as ReporteCartera,
];

// Función para ejecutar test
export function testHHICalculator() {
  const calculator = new HHICalculatorService();
  const resultado = calculator.calcularHHIAgencias(datosTest);

  console.log('🧮 TEST HHI CALCULATOR:');
  console.log('📊 HHI:', resultado.hhi);
  console.log('🚨 Nivel:', resultado.nivelRiesgo);
  console.log('📝 Interpretación:', resultado.interpretacion);
  console.log('💰 Total cartera:', resultado.totalCartera);
  console.log('🏛️ Agencias:');

  resultado.agencias.forEach((agencia, index) => {
    console.log(
      `  ${index + 1}. ${agencia.agencia}: $${agencia.monto.toLocaleString()} (${agencia.participacion.toFixed(2)}%)`,
    );
  });

  // Verificación manual:
  // Total: 80,000 + 40,000 + 20,000 = 140,000
  // Agencia A: 80,000 / 140,000 = 57.14%
  // Agencia B: 40,000 / 140,000 = 28.57%
  // Agencia C: 20,000 / 140,000 = 14.29%
  // HHI = 57.14² + 28.57² + 14.29² = 3265.0 + 816.2 + 204.2 = 4285.4
  // Nivel: ALTO (>2500)

  return resultado;
}
