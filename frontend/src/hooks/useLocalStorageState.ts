import { useEffect, useState } from "react";

export function useLocalStorageState<T>(
  load: () => T,
  save: (value: T) => void
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(load);

  useEffect(() => {
    save(value);
  }, [save, value]);

  return [value, setValue];
}
