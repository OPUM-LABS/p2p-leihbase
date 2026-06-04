import type { Location } from "~~/models/location";
import type { Product } from "~~/models/product";

export const useReservationDialog = function () {
  const isOpen = useState<boolean>(() => false);
  const product = useState<Product | null>(() => null);
  const location = useState<Location | null>(() => null);

  const { pb } = usePocketbase();
  const userStore = useUserStore();
  const { open: openVerificationDialog } = useVerificationDialog();

  async function open(_location: Location, _product: Product) {
    // Check authentication status
    if (!pb.authStore.isValid) {
      userStore.setAuthenticationIntent(
        "reservation",
        `/l/${_location.slug}/p/${_product.id}`
      );
      navigateTo("/signup");
      return;
    }

    // Checkout verification status
    if (!pb.authStore.record?.verified) {
      await pb.collection("users").authRefresh();
    }
    if (!pb.authStore.record?.verified) {
      openVerificationDialog();
      return;
    }

    // Open reservation dialog
    isOpen.value = true;
    product.value = _product;
    location.value = _location;
  }

  return {
    open,
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
