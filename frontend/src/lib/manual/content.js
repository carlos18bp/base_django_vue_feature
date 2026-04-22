import { BookOpen } from 'lucide-vue-next';

/**
 * @typedef {{ es: string, en: string }} LocalizedText
 * @typedef {{ es: string[], en: string[] }} LocalizedList
 *
 * @typedef {Object} ManualProcess
 * @property {string} id
 * @property {LocalizedText} title
 * @property {LocalizedText} summary
 * @property {LocalizedText} why
 * @property {LocalizedList} steps
 * @property {string} [route]
 * @property {LocalizedList} [tips]
 * @property {string[]} keywords
 *
 * @typedef {Object} ManualSection
 * @property {string} id
 * @property {LocalizedText} title
 * @property {any} icon
 * @property {ManualProcess[]} processes
 */

/** @type {ManualSection[]} */
export const MANUAL_SECTIONS = [
  {
    id: 'base-project',
    title: { es: 'Proyecto base', en: 'Base project' },
    icon: BookOpen,
    processes: [
      {
        id: 'homepage-overview',
        title: {
          es: 'Recorrido por la página principal',
          en: 'Homepage overview',
        },
        summary: {
          es: 'Conoce las secciones principales de la página de inicio y cómo se organizan.',
          en: 'Get familiar with the main sections of the home page and how they are organized.',
        },
        why: {
          es: 'La página de inicio es la primera impresión del sitio y te orienta hacia el resto del contenido.',
          en: 'The home page is the first impression of the site and points you toward the rest of the content.',
        },
        steps: {
          es: [
            'Abre la aplicación en la raíz del dominio.',
            'Observa la cabecera con el logotipo, el menú y los iconos de búsqueda y carrito.',
            'Revisa los bloques destacados con productos y artículos del blog.',
            'Desplázate hasta el pie de página para ver la información de contacto y enlaces secundarios.',
            'Usa el menú superior para saltar a Blogs, Catálogo, Acerca de o Contacto.',
          ],
          en: [
            'Open the app at the root of the domain.',
            'Notice the header with the logo, menu, and search / cart icons.',
            'Review the highlighted blocks featuring products and blog articles.',
            'Scroll to the footer to see contact details and secondary links.',
            'Use the top menu to jump into Blogs, Catalog, About Us, or Contact.',
          ],
        },
        route: '/',
        tips: {
          es: [
            'La cabecera se mantiene fija al hacer scroll para facilitar la navegación.',
            'Puedes abrir la barra de búsqueda desde el icono de la lupa en la cabecera.',
          ],
          en: [
            'The header stays sticky on scroll to make navigation easier.',
            'You can open the search bar from the magnifier icon in the header.',
          ],
        },
        keywords: ['home', 'inicio', 'landing', 'homepage', 'overview', 'menu', 'header', 'footer'],
      },
      {
        id: 'blog-flow',
        title: {
          es: 'Flujo de blog',
          en: 'Blog flow',
        },
        summary: {
          es: 'Explora el listado de artículos y abre el detalle de cada publicación.',
          en: 'Browse the article list and open the detail view for each post.',
        },
        why: {
          es: 'El blog centraliza contenido editorial y es un canal clave para SEO y para educar al usuario.',
          en: 'The blog is the editorial hub of the site and a key channel for SEO and user education.',
        },
        steps: {
          es: [
            'Entra a Blogs desde el menú superior.',
            'Revisa las tarjetas con el título, resumen e imagen de cada artículo.',
            'Haz clic en una tarjeta para abrir el detalle.',
            'Lee el artículo completo y comparte o vuelve al listado.',
          ],
          en: [
            'Go to Blogs from the top menu.',
            'Scan the cards showing the title, summary, and image of each article.',
            'Click a card to open the detail view.',
            'Read the full post, then share or return to the list.',
          ],
        },
        route: '/blogs',
        keywords: ['blog', 'blogs', 'articles', 'articulo', 'articulos', 'posts', 'noticias', 'news'],
      },
      {
        id: 'catalog-and-checkout',
        title: {
          es: 'Catálogo y checkout',
          en: 'Catalog and checkout',
        },
        summary: {
          es: 'Navega el catálogo, añade productos al carrito y finaliza la compra.',
          en: 'Browse the catalog, add products to the cart, and complete the purchase.',
        },
        why: {
          es: 'Es el recorrido principal de compra: describe cómo un visitante se convierte en cliente.',
          en: 'This is the core purchase journey: it describes how a visitor becomes a customer.',
        },
        steps: {
          es: [
            'Abre Catálogo desde el menú superior para ver todos los productos disponibles.',
            'Haz clic en un producto para ver su detalle y descripción ampliada.',
            'Añade el producto al carrito desde el detalle o directamente desde la tarjeta.',
            'Abre el carrito con el icono de la bolsa en la cabecera para revisar cantidades.',
            'Pulsa Checkout para introducir tus datos de envío y confirmar el pedido.',
          ],
          en: [
            'Open Catalog from the top menu to see every available product.',
            'Click a product to open its detail view and extended description.',
            'Add the product to the cart from the detail or directly from the card.',
            'Open the cart using the bag icon in the header to review quantities.',
            'Click Checkout to enter shipping information and confirm the order.',
          ],
        },
        route: '/catalog',
        tips: {
          es: [
            'El contador rojo sobre el icono del carrito indica la cantidad de productos añadidos.',
            'Puedes ajustar cantidades en el panel del carrito sin salir de la vista actual.',
          ],
          en: [
            'The red counter on the cart icon shows how many products have been added.',
            'You can adjust quantities in the cart panel without leaving the current view.',
          ],
        },
        keywords: [
          'catalog',
          'catalogo',
          'product',
          'producto',
          'productos',
          'cart',
          'carrito',
          'checkout',
          'pago',
          'compra',
        ],
      },
    ],
  },
];
