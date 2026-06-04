import type { Location } from "~~/models/location";
import type { Product } from "~~/models/product";

export const useReservationDialog = function () {
  const isOpen = useState<boolean>(() => false);
  const product = useState<Product | null>(() => null);
  const location = useState<Location | null>(() => null);

  function open(_location: Location, _product: Product) {
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
