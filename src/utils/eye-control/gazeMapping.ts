/**
 * gazeMapping.ts — Directional eye control utilities.
 * The directional model no longer maps gaze to screen coordinates.
 * This file is retained for future use and backward compatibility.
 */

export type EyeDirection = 'CENTER' | 'LEFT' | 'RIGHT' | 'UP' | 'DOWN';

/**
 * A simple hysteresis state machine for stable directional classification.
 * External code should use the DirectionalEyeProvider context instead.
 */
export class DirectionClassifier {
  private current: EyeDirection = 'CENTER';

  constructor(
    private enterH = 0.10,
    private exitH  = 0.05,
    private enterV = 0.08,
    private exitV  = 0.04,
  ) {}

  classify(dx: number, dy: number): EyeDirection {
    const prev = this.current;

    if (prev === 'CENTER') {
      if (dx < -this.enterH)      this.current = 'LEFT';
      else if (dx > this.enterH)  this.current = 'RIGHT';
      else if (dy < -this.enterV) this.current = 'UP';
      else if (dy > this.enterV)  this.current = 'DOWN';
    } else {
      const exitH = prev === 'LEFT' ? dx > -this.exitH : prev === 'RIGHT' ? dx < this.exitH : false;
      const exitV = prev === 'UP'   ? dy > -this.exitV  : prev === 'DOWN'  ? dy < this.exitV  : false;
      if (exitH || exitV) this.current = 'CENTER';
    }
    return this.current;
  }

  reset() { this.current = 'CENTER'; }
  get direction() { return this.current; }
}

/** Simple first-order low-pass filter for eye coordinate smoothing. */
export class LowPassFilter {
  private value: number | null = null;
  constructor(private alpha = 0.25) {}
  update(v: number): number {
    this.value = this.value === null ? v : this.alpha * v + (1 - this.alpha) * this.value;
    return this.value;
  }
  reset() { this.value = null; }
}
