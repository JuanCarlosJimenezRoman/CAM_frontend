import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-test',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding: 20px; background: lightblue;">
      <h2>¡Componente de Test Funcionando!</h2>
      <p>El routing de Angular está funcionando correctamente</p>
      <button (click)="showAlert()">Hacer click para probar</button>
    </div>
  `
})
export class TestComponent {
  showAlert() {
    alert('¡JavaScript funcionando!');
  }
}
