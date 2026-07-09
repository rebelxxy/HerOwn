import { state } from '../state.js';
import { pageShell, sectionHead } from '../components/layout.js';

export function renderSOS() {
  const emergencyText = "I feel unsafe. This is my current location: 35.6812, 139.7671. Please contact me now.";
  return pageShell(`
    ${sectionHead(
      "SOS / Emergency",
      "Hold for SOS.",
      "For immediate danger in Japan, call 110 for police or 119 for ambulance/fire. This page gathers location, contacts, and nearby safe places in one view."
    )}
    <div class="sos-layout">
      <section class="surface">
        <button class="sos-button ${state.sosRevealed ? "is-holding" : ""}" type="button" data-sos>
          Hold<br />for SOS
        </button>
        <div class="button-row">
          <button class="button" type="button" data-copy="Location copied: 35.6812, 139.7671">Copy location</button>
          <button class="soft-button" type="button" data-copy="${emergencyText}">Copy help text</button>
        </div>
      </section>
      <section class="surface">
        <div class="map-panel" aria-label="Safety map illustration">
          <div class="map-road one"></div>
          <div class="map-road two"></div>
          <div class="map-road three"></div>
          <div class="map-pin home">You</div>
          <div class="map-pin police">P</div>
          <div class="map-pin store">24</div>
          <div class="map-pin cafe">C</div>
        </div>
        <div class="info-grid">
          <div class="info-box"><span>Current location</span><strong>${state.sosRevealed ? "Tokyo Station area" : "Hold SOS to reveal"}</strong></div>
          <div class="info-box"><span>Emergency contacts</span><strong>Mina · Mom</strong></div>
          <div class="info-box"><span>Police</span><strong>110</strong></div>
          <div class="info-box"><span>Ambulance / Fire</span><strong>119</strong></div>
          <div class="info-box"><span>Nearest police box</span><strong>${state.sosRevealed ? "450 m" : "Hidden"}</strong></div>
          <div class="info-box"><span>Nearest convenience store</span><strong>${state.sosRevealed ? "120 m" : "Hidden"}</strong></div>
        </div>
      </section>
    </div>
  `);
}
