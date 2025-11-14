declare type CoverPart<T, V extends Partial<Record<keyof T, unknown>>> = Omit<T, keyof V> & V

declare type ReplacePart<T, K extends keyof T, V> = Omit<T, K> & Record<K, V>

declare type PartialPart<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
declare type RequiredPart<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>
