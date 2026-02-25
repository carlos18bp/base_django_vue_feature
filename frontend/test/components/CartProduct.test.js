import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import CartProduct from "@/components/product/CartProduct.vue";
import { useLanguageStore } from "@/stores/language";

describe("CartProduct Component", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  test("renders product information correctly", () => {
    const product = {
      id: 1,
      title: "Beautiful Candle",
      price: 150,
      quantity: 2,
      gallery_urls: ["http://example.com/image.jpg"],
    };

    const wrapper = mount(CartProduct, {
      props: {
        product,
      },
    });

    expect(wrapper.text()).toContain("Beautiful Candle");
    expect(wrapper.text()).toContain("Qty 2");
    expect(wrapper.text()).toContain("$300"); // 150 * 2
  });

  test("displays product image", () => {
    const product = {
      id: 1,
      title: "Product",
      price: 100,
      quantity: 1,
      gallery_urls: ["http://example.com/image.jpg"],
    };

    const wrapper = mount(CartProduct, {
      props: {
        product,
      },
    });

    const img = wrapper.find("img");
    expect(img.attributes("src")).toBe("http://example.com/image.jpg");
  });

  test("emits addProduct event when Add button clicked", async () => {
    const product = {
      id: 1,
      title: "Product",
      price: 100,
      quantity: 1,
      gallery_urls: ["http://example.com/image.jpg"],
    };

    const wrapper = mount(CartProduct, {
      props: {
        product,
      },
    });

    const addButton = wrapper.findAll("a").find((a) => a.text() === "Add");
    await addButton.trigger("click");

    expect(wrapper.emitted("addProduct")).toBeTruthy();
    expect(wrapper.emitted("addProduct")[0]).toEqual([product]);
  });

  test("emits removeProduct event when Remove button clicked", async () => {
    const product = {
      id: 1,
      title: "Product",
      price: 100,
      quantity: 1,
      gallery_urls: ["http://example.com/image.jpg"],
    };

    const wrapper = mount(CartProduct, {
      props: {
        product,
      },
    });

    const removeButton = wrapper.findAll("a").find((a) => a.text() === "Remove");
    await removeButton.trigger("click");

    expect(wrapper.emitted("removeProduct")).toBeTruthy();
    expect(wrapper.emitted("removeProduct")[0]).toEqual([product.id]);
  });

  test("calculates total price correctly", () => {
    const product = {
      id: 1,
      title: "Expensive Product",
      price: 250,
      quantity: 3,
      gallery_urls: ["http://example.com/image.jpg"],
    };

    const wrapper = mount(CartProduct, {
      props: {
        product,
      },
    });

    expect(wrapper.text()).toContain("$750"); // 250 * 3
  });

  test("does not render when product is null", () => {
    const wrapper = mount(CartProduct, {
      props: {
        product: null,
      },
    });

    expect(wrapper.html()).toBe("<!--v-if-->");
  });

  test("hides title when currentLanguage is not 'en'", () => {
    const product = {
      id: 1,
      title: "Beautiful Candle",
      price: 150,
      quantity: 2,
      gallery_urls: ["http://example.com/image.jpg"],
    };

    const languageStore = useLanguageStore();
    languageStore.setCurrentLanguage("es");

    const wrapper = mount(CartProduct, {
      props: {
        product,
      },
    });

    expect(wrapper.text()).not.toContain("Beautiful Candle");
    expect(wrapper.text()).toContain("Qty 2");
  });
});
