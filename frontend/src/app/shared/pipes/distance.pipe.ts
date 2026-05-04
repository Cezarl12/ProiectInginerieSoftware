import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'distance', standalone: true })
export class DistancePipe implements PipeTransform {
  transform(km: number | null | undefined): string {
    if (km == null) return '';
    return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
  }
}
