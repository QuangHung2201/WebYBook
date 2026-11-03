export function cn(...values) {
  return values
    .flatMap((value) => {
      if (!value) return [];
      if (typeof value === 'string') return [value];
      if (Array.isArray(value)) return value.filter(Boolean);
      if (typeof value === 'object') return Object.keys(value).filter((key) => value[key]);
      return [];
    })
    .join(' ');
}
