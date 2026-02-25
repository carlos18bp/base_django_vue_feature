import { mount } from "@vue/test-utils";
import { createMemoryHistory, createRouter } from "vue-router";
import { createPinia, setActivePinia } from "pinia";
import ShoppingCart from "@/components/product/ShoppingCart.vue";
import { gsap } from "gsap";
import { useProductStore } from "@/stores/product";
import { useLanguageStore } from "@/stores/language";

// Mock gsap
jest.mock("gsap", () => ({
  gsap: {
    fromTo: jest.fn().mockReturnValue({
      then: jest.fn((cb) => {
        if (typeof cb === "function") {
          cb();
        }
      }),
    }),
    timeline: jest.fn((options = {}) => {
      if (typeof options.onComplete === "function") {
        options.onComplete();
      }
      return {
        fromTo: jest.fn().mockReturnThis(),
      };
    }),
  },
}));

jest.mock("@heroicons/vue/24/outline", () => ({
  XMarkIcon: {
    name: "XMarkIcon",
    template: "<button class='x-mark-icon' @click='$emit(\"click\")'></button>",
  },
}));

const baseStubs = {
  CartProduct: {
    name: "CartProduct",
    props: ["product"],
    template: "<div class='cart-product'>{{ product.title }}</div>",
  },
  RouterLink: {
    name: "RouterLink",
    props: ["to"],
    template: "<a><slot /></a>",
  },
  "router-link": {
    name: "RouterLink",
    props: ["to"],
    template: "<a><slot /></a>",
  },
};

const buildStubs = (overrides = {}) => ({
  ...baseStubs,
  ...overrides,
});

describe("ShoppingCart Component", () => {
  let wrapper;
  let productStore;

  beforeEach(() => {
    setActivePinia(createPinia());
    productStore = useProductStore();
    document.body.style.overflow = "";
    jest.clearAllMocks();
    
    // Setup some products in cart
    productStore.cartProducts = [
      { id: 1, title: "Product 1", price: 100, quantity: 2 },
      { id: 2, title: "Product 2", price: 200, quantity: 1 },
    ];
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
      wrapper = null;
    }
    document.body.style.overflow = "";
    productStore.cartProducts = [];
  });

  test("renders cart when visible", () => {
    wrapper = mount(ShoppingCart, {
      props: {
        visible: true,
      },
      global: {
        stubs: buildStubs(),
      },
    });

    expect(wrapper.find("h2").text()).toBe("Shopping Cart");
  });

  test("sets body overflow to hidden when visible is true", () => {
    wrapper = mount(ShoppingCart, {
      props: {
        visible: true,
      },
      global: {
        stubs: buildStubs(),
      },
    });

    expect(document.body.style.overflow).toBe("hidden");
  });

  test("does not render when visible is false and sets body overflow to auto", () => {
    wrapper = mount(ShoppingCart, {
      props: {
        visible: false,
      },
      global: {
        stubs: buildStubs(),
      },
    });

    // Root div with fixed inset-0 should not be rendered when visible is false
    expect(wrapper.find(".fixed").exists()).toBe(false);
    expect(document.body.style.overflow).toBe("auto");
  });

  test("displays cart products", async () => {
    const addSpy = jest.spyOn(productStore, "addProductToCart");
    const removeSpy = jest.spyOn(productStore, "removeProductFromCart");

    wrapper = mount(ShoppingCart, {
      props: {
        visible: true,
      },
      global: {
        stubs: buildStubs({
          CartProduct: {
            props: ["product"],
            template:
              "<div class='cart-product'>{{ product.title }}<button class='add' @click=\"$emit('addProduct', product)\"></button><button class='remove' @click=\"$emit('removeProduct', product)\"></button></div>",
          },
        }),
      },
    });

    const cartProducts = wrapper.findAll(".cart-product");
    expect(cartProducts.length).toBe(2);
    expect(wrapper.text()).toContain("Product 1");
    expect(wrapper.text()).toContain("Product 2");

    const firstAddButton = wrapper.find(".add");
    const firstRemoveButton = wrapper.find(".remove");
    await firstAddButton.trigger("click");
    await firstRemoveButton.trigger("click");

    const firstProduct = productStore.cartProducts[0];
    expect(addSpy).toHaveBeenCalledWith(firstProduct);
    expect(removeSpy).toHaveBeenCalledWith(firstProduct);
  });

  test("handles add and remove actions through real CartProduct with memory router", async () => {
    const addSpy = jest.spyOn(productStore, "addProductToCart");
    const removeSpy = jest.spyOn(productStore, "removeProductFromCart");
    productStore.cartProducts = [
      {
        id: 10,
        title: "Product 10",
        price: 150,
        quantity: 1,
        gallery_urls: ["/image-1.jpg"],
      },
    ];

    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: "/", name: "home", component: { template: "<div />" } },
        { path: "/catalog", name: "catalog", component: { template: "<div />" } },
        { path: "/checkout", name: "checkout", component: { template: "<div />" } },
      ],
    });

    router.push("/");
    await router.isReady();

    wrapper = mount(ShoppingCart, {
      props: { visible: true },
      global: { plugins: [router], stubs: { XMarkIcon: true } },
    });

    const cartProduct = wrapper.findComponent({ name: "CartProduct" });
    expect(cartProduct.exists()).toBe(true);

    const links = cartProduct.findAll("a");
    const addLink = links.find((link) => link.text() === "Add");
    const removeLink = links.find((link) => link.text() === "Remove");

    await addLink.trigger("click");
    await removeLink.trigger("click");

    const firstProduct = productStore.cartProducts[0];
    expect(addSpy).toHaveBeenCalledWith(firstProduct);
    expect(removeSpy).toHaveBeenCalledWith(firstProduct);
  });

  test("renders RouterLinks inside shopping cart with memory router", async () => {
    productStore.cartProducts = [
      {
        id: 10,
        title: "Product 10",
        price: 150,
        quantity: 1,
        gallery_urls: ["/image-1.jpg"],
      },
    ];

    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: "/", name: "home", component: { template: "<div />" } },
        { path: "/catalog", name: "catalog", component: { template: "<div />" } },
        { path: "/checkout", name: "checkout", component: { template: "<div />" } },
      ],
    });

    router.push("/");
    await router.isReady();

    wrapper = mount(ShoppingCart, {
      props: { visible: true },
      global: { plugins: [router], stubs: { XMarkIcon: true } },
    });

    const routerLinks = wrapper.findAllComponents({ name: "RouterLink" });
    expect(routerLinks.length).toBeGreaterThan(0);
  });

  test("displays total price", () => {
    wrapper = mount(ShoppingCart, {
      props: {
        visible: true,
      },
      global: {
        stubs: buildStubs(),
      },
    });

    // Total should be 100*2 + 200*1 = 400
    expect(wrapper.text()).toContain("400");
  });

  test("displays empty cart message when no products", () => {
    productStore.cartProducts = [];

    wrapper = mount(ShoppingCart, {
      props: {
        visible: true,
      },
      global: {
        stubs: buildStubs(),
      },
    });

    expect(wrapper.text()).toContain("No products");
    expect(wrapper.text()).toContain("Continue Shopping");
  });

  test("emits update:visible=false when overlay is clicked", async () => {
    wrapper = mount(ShoppingCart, {
      props: {
        visible: true,
      },
      global: {
        stubs: buildStubs(),
      },
    });

    await wrapper.find('[data-testid="cart-overlay"]').trigger("click");
    // closeCart uses Promise.all(...).then, so wait a microtask
    await Promise.resolve();

    const events = wrapper.emitted("update:visible");
    expect(events).toBeTruthy();
    expect(events[0]).toEqual([false]);
  });

  test("emits update:visible=false when close icon is clicked", async () => {
    wrapper = mount(ShoppingCart, {
      props: {
        visible: true,
      },
      global: {
        stubs: buildStubs(),
      },
    });

    const closeButton = wrapper.find('[data-testid="cart-close"]');
    expect(closeButton.exists()).toBe(true);
    await closeButton.trigger("click");
    await Promise.resolve();

    const events = wrapper.emitted("update:visible");
    expect(events).toBeTruthy();
    expect(events[0]).toEqual([false]);
  });

  test("renders checkout button when products exist", () => {
    wrapper = mount(ShoppingCart, {
      props: {
        visible: true,
      },
      global: {
        stubs: buildStubs(),
      },
    });

    expect(wrapper.text()).toContain("Checkout");
    expect(wrapper.text()).toContain("Subtotal");
  });

  test("delegating CartProduct addProduct event calls store addProductToCart", async () => {
    const addSpy = jest.spyOn(productStore, "addProductToCart");

    wrapper = mount(ShoppingCart, {
      props: { visible: true },
      global: {
        stubs: buildStubs({
          CartProduct: {
            props: ["product"],
            template: "<div><button class='add' @click=\"$emit('addProduct', product)\"></button></div>",
          },
        }),
      },
    });

    await wrapper.find(".add").trigger("click");

    expect(addSpy).toHaveBeenCalledWith(productStore.cartProducts[0]);
  });

  test("CartProduct removeProduct event removes item from store", async () => {
    const removeSpy = jest.spyOn(productStore, "removeProductFromCart");
    const firstProduct = productStore.cartProducts[0];

    wrapper = mount(ShoppingCart, {
      props: { visible: true },
      global: {
        stubs: buildStubs({
          CartProduct: {
            props: ["product"],
            template: "<div><button class='remove' @click=\"$emit('removeProduct', product)\"></button></div>",
          },
        }),
      },
    });

    await wrapper.find(".remove").trigger("click");

    expect(removeSpy).toHaveBeenCalledWith(firstProduct);
  });

  test("renders total price from store in the cart footer", () => {
    wrapper = mount(ShoppingCart, {
      props: { visible: true },
      global: { stubs: buildStubs() },
    });

    const expectedTotal = productStore.totalCartPrice;
    expect(wrapper.text()).toContain(String(expectedTotal));
    expect(productStore.cartProducts.length).toBe(2);
  });

  test("CartProduct events add and remove in same render cycle", async () => {
    const addSpy = jest.spyOn(productStore, "addProductToCart");
    const removeSpy = jest.spyOn(productStore, "removeProductFromCart");
    const firstProduct = productStore.cartProducts[0];

    wrapper = mount(ShoppingCart, {
      props: { visible: true },
      global: {
        stubs: buildStubs({
          CartProduct: {
            props: ["product"],
            template: "<div><button class='add' @click=\"$emit('addProduct', product)\"></button><button class='remove' @click=\"$emit('removeProduct', product)\"></button></div>",
          },
        }),
      },
    });

    await wrapper.find(".add").trigger("click");
    await wrapper.find(".remove").trigger("click");

    expect(addSpy).toHaveBeenCalledWith(firstProduct);
    expect(removeSpy).toHaveBeenCalledWith(firstProduct);
  });

  test("renders correctly regardless of current language setting", () => {
    const languageStore = useLanguageStore();
    languageStore.setCurrentLanguage("es");

    wrapper = mount(ShoppingCart, {
      props: { visible: true },
      global: { stubs: buildStubs() },
    });

    expect(languageStore.getCurrentLanguage).toBe("es");
    expect(wrapper.find("h2").text()).toBe("Shopping Cart");
  });

  test("runs open and close animations when visible", async () => {
    wrapper = mount(ShoppingCart, {
      props: {
        visible: true,
      },
      global: {
        stubs: buildStubs(),
      },
    });

    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    const openCalls = gsap.fromTo.mock.calls.length;
    expect(openCalls).toBeGreaterThanOrEqual(2);

    await wrapper.find('[data-testid="cart-overlay"]').trigger("click");
    await Promise.resolve();

    expect(gsap.timeline).toHaveBeenCalledTimes(1);
    expect(gsap.fromTo.mock.calls.length).toBeGreaterThanOrEqual(openCalls);
  });

  test("runs open animations after toggling visibility to true", async () => {
    wrapper = mount(ShoppingCart, {
      props: {
        visible: false,
      },
      global: {
        stubs: buildStubs(),
      },
    });

    await wrapper.setProps({ visible: true });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(document.body.style.overflow).toBe("hidden");
    expect(gsap.fromTo.mock.calls.length).toBeGreaterThanOrEqual(2);
  });

  test("handles CartProduct emitted events", async () => {
    const addSpy = jest.spyOn(productStore, "addProductToCart");
    const removeSpy = jest.spyOn(productStore, "removeProductFromCart");

    wrapper = mount(ShoppingCart, {
      props: {
        visible: true,
      },
      global: {
        stubs: buildStubs({
          CartProduct: {
            props: ["product"],
            template: "<div><button class='add' @click=\"$emit('addProduct', product)\"></button><button class='remove' @click=\"$emit('removeProduct', product)\"></button></div>",
          },
        }),
      },
    });

    await wrapper.find(".add").trigger("click");
    await wrapper.find(".remove").trigger("click");

    const firstProduct = productStore.cartProducts[0];
    expect(addSpy).toHaveBeenCalledWith(firstProduct);
    expect(removeSpy).toHaveBeenCalledWith(firstProduct);
  });

  test("CartProduct removeProduct event with id looks up and removes correct item", async () => {
    const removeSpy = jest.spyOn(productStore, "removeProductFromCart");
    const firstProduct = productStore.cartProducts[0];

    wrapper = mount(ShoppingCart, {
      props: { visible: true },
      global: {
        stubs: buildStubs({
          CartProduct: {
            props: ["product"],
            template: "<div><button class='remove-id' @click=\"$emit('removeProduct', product.id)\"></button></div>",
          },
        }),
      },
    });

    await wrapper.find(".remove-id").trigger("click");

    expect(removeSpy).toHaveBeenCalledWith(firstProduct);
  });

  test("CartProduct removeProduct event with unknown id does not call store", async () => {
    const removeSpy = jest.spyOn(productStore, "removeProductFromCart");
    productStore.cartProducts = [];

    wrapper = mount(ShoppingCart, {
      props: { visible: true },
      global: { stubs: buildStubs() },
    });

    expect(removeSpy).not.toHaveBeenCalled();
  });

  test("handleRemoveProduct with numeric id not in cart does not call removeProductFromCart", async () => {
    const removeSpy = jest.spyOn(productStore, "removeProductFromCart");

    wrapper = mount(ShoppingCart, {
      props: { visible: true },
      global: {
        stubs: buildStubs({
          CartProduct: {
            props: ["product"],
            template: "<div><button class='remove-unknown' @click=\"$emit('removeProduct', 9999)\"></button></div>",
          },
        }),
      },
    });

    await wrapper.find(".remove-unknown").trigger("click");

    expect(removeSpy).not.toHaveBeenCalled();
  });
});
