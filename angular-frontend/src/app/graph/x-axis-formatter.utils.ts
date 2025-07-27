import { type NumberValue, timeFormat } from "d3";

export type xAxisMode = 'absolute' | 'relative';

export function makeXAxisTickFormatter(
  mode: xAxisMode,
  domainStart: NumberValue | Date
): (domainValue: NumberValue | Date, index: number) => string {
  const formatAbsolute = timeFormat('%H:%M:%S');
  const formatRelative = timeFormat('%M:%S');

  return (d, _index) => {
    if (mode === 'absolute') {
      if (d instanceof Date) return formatAbsolute(d);
      return formatAbsolute(new Date(Number(d)));
    } else {
      const t = d instanceof Date ? d.getTime() : Number(d);
      const t0 = domainStart instanceof Date ? domainStart.getTime() : Number(domainStart);
      const elapsed = Math.max(0, t - t0);
      return formatRelative(new Date(elapsed));
    }
  };
}
