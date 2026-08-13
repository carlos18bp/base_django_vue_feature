import { ref, nextTick } from 'vue';
import { useManualSearch } from '@/lib/manual/useManualSearch';

// Small literal fixture — matches the row shape `useManualSearch` builds
// from `sectionsRef.value` (id/title/summary/keywords/steps/route per
// process, grouped under a section with an `id` and `processes` array).
// Kept isolated from the real MANUAL_SECTIONS content data.
const buildSections = () => [
  {
    id: 'orders',
    processes: [
      {
        id: 'create-order',
        title: { en: 'Create a new order', es: 'Crear un nuevo pedido' },
        summary: {
          en: 'Walk through placing a purchase order for a customer.',
          es: 'Recorrido para registrar un pedido de compra de un cliente.',
        },
        keywords: ['order', 'checkout', 'purchase'],
        steps: {
          en: ['Open the orders page', 'Click new order', 'Fill the customer details'],
          es: ['Abre la página de pedidos', 'Haz clic en nuevo pedido'],
        },
        route: '/manual/orders/create',
      },
    ],
  },
];

const DEBOUNCE_MS = 120;

describe('useManualSearch', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // Falla si una regresión en las opciones de Fuse (keys/threshold) o en el
  // debounce (DEBOUNCE_MS no aplicado o aplicado dos veces) rompe la
  // búsqueda: tras 120ms el proceso indexado por su título/keywords debe
  // aparecer en los resultados.
  test('results contains the matching process id after the debounce window elapses', async () => {
    const query = ref('');
    const locale = ref('en');
    const sections = ref(buildSections());

    const { results } = useManualSearch(query, locale, sections);

    query.value = 'order';
    await nextTick();
    jest.advanceTimersByTime(DEBOUNCE_MS);

    expect(results.value.map((match) => match.process.id)).toEqual(['create-order']);
  });

  // Falla si isSearching deja de reflejar "hay una query activa sin
  // resultados" (el driver del estado "sin resultados" en la UI) o si Fuse
  // empieza a devolver falsos positivos para términos que no matchean nada.
  test('results is empty and isSearching stays true for a non-matching term', async () => {
    const query = ref('');
    const locale = ref('en');
    const sections = ref(buildSections());

    const { results, isSearching } = useManualSearch(query, locale, sections);

    query.value = 'zzz-nonexistent-zzz';
    await nextTick();
    jest.advanceTimersByTime(DEBOUNCE_MS);

    expect(results.value).toEqual([]);
    expect(isSearching.value).toBe(true);
  });
});
