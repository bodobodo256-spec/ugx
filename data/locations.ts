export interface LocationItem {
  name: string;
  slug: string;
  count?: number;
}

export const LOCATIONS: LocationItem[] = [
  { name: 'Kampala', slug: 'kampala' },
  { name: 'Kira', slug: 'kira' },
  { name: 'Wakiso', slug: 'wakiso' },
  { name: 'Mukono', slug: 'mukono' },
  { name: 'Entebbe', slug: 'entebbe' },
  { name: 'Nansana', slug: 'nansana' },
  { name: 'Arua', slug: 'arua' },
  { name: 'Entebbe Road', slug: 'entebbe-road' },
  { name: 'Fort Portal', slug: 'fort-portal' },
  { name: 'Gulu', slug: 'gulu' },
  { name: 'Jinja', slug: 'jinja' },
  { name: 'Lira', slug: 'lira' },
  { name: 'Mbarara', slug: 'mbarara' },
  { name: 'Rukungiri', slug: 'rukungiri' }
];
