import { useProductStore } from '@/stores/product';

export default {
  created() {     
    const productStore = useProductStore();
    const storedCartProducts = localStorage.getItem('cartProducts');
    productStore.cartProducts = storedCartProducts
      ? JSON.parse(storedCartProducts)
      : [];    
  },
  methods: {
    globalMethod() {
      console.log('This is a global method');
    },
  },
};