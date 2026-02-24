export const isPopoverOpenKey = Symbol() as InjectionKey<Ref<boolean>>;

export const handleTriggerKey = Symbol() as InjectionKey<() => void>;
export const closePopoverKey = Symbol() as InjectionKey<
  (focusTrigger: boolean) => void
>;
export const setTriggerElementKey = Symbol() as InjectionKey<
  (element: HTMLElement | SVGElement | null | undefined) => void
>;
