export const openKey = Symbol() as InjectionKey<Ref<string[]>>;
export const idKey = Symbol() as InjectionKey<string>;
export const isOpenKey = Symbol() as InjectionKey<ComputedRef<boolean>>;
export const handleToggleKey = Symbol() as InjectionKey<(id: string) => void>;
