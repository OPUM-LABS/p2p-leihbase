import type { Location } from "~~/models/location";
import type { Product } from "~~/models/product";

export const useReservationDialog = function () {
  const isOpen = useState<boolean>(() => false);
  const product = useState<Product | null>(() => null);
  const location = useState<Location | null>(() => null);

  const { pb, user } = usePocketbase();
  const userStore = useUserStore();
  const { open: openVerificationDialog } = useVerificationDialog();

  async function open(
    arg1: Location | Product,
    arg2?: Product | Location | null
  ) {
    let _product: Product;
    let _location: Location | null = null;

    if (arg2) {
      // Called with (location, product)
      _location = arg1 as Location;
      _product = arg2 as Product;
    } else {
      // Called with (product)
      _product = arg1 as Product;
    }

    // Check authentication status
    if (!pb.authStore.isValid) {
      const redirectUrl = _location?.slug
        ? `/l/${_location.slug}/p/${_product.id}`
        : `/items/${_product.id}`;
      userStore.setAuthenticationIntent("reservation", redirectUrl);
      navigateTo("/signup");
      return;
    }

    // Checkout verification status
    if (!user.value?.verified) {
      try {
        await pb.collection("users").authRefresh();
      } catch (e) {}
    }
    if (!user.value?.verified) {
      openVerificationDialog();
      return;
    }

    // Open reservation dialog
    isOpen.value = true;
    product.value = _product;
    location.value = _location;
  }

  function close() {
    isOpen.value = false;
  }

  return {
    open,
    close,
    isOpen,
    product,
    location,
  };
};

export const useVerificationDialog = function () {
  const isOpen = useState<boolean | undefined>(() => false);

  function open() {
    isOpen.value = true;
  }

  return {
    open,
    isOpen,
  };
};
