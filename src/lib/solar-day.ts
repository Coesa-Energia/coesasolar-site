const SUNRISE_MINUTE = 6 * 60;
const SUNSET_MINUTE = 18 * 60;

export function solarMinuteAtX(clientX: number, left: number, width: number) {
  const progress = Math.min(1, Math.max(0, ((clientX - left) / width - 0.08) / 0.84));
  return Math.round((SUNRISE_MINUTE + progress * (SUNSET_MINUTE - SUNRISE_MINUTE)) / 5) * 5;
}

export function solarPowerKw(minute: number) {
  if (minute <= SUNRISE_MINUTE || minute >= SUNSET_MINUTE) return 0;
  const daylight = (minute - SUNRISE_MINUTE) / (SUNSET_MINUTE - SUNRISE_MINUTE);
  return 850 * Math.sin(Math.PI * daylight) ** 1.6;
}

export function solarEnergyMwh(minute: number) {
  let energy = 0;
  for (let at = SUNRISE_MINUTE; at < Math.min(minute, SUNSET_MINUTE); at += 5) {
    const next = Math.min(at + 5, minute, SUNSET_MINUTE);
    energy += ((solarPowerKw(at) + solarPowerKw(next)) / 2) * ((next - at) / 60) / 1000;
  }
  return energy;
}
