// stores/loaderStore.js
import { create } from "zustand";
import { useShallow } from "zustand/shallow";

type LoaderType = {
  loading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
};
export const useLoaderStore = create<LoaderType>((set) => ({
  loading: false,
  startLoading: () => set({ loading: true }),
  stopLoading: () => set({ loading: false }),
}));

export const useLoaderState = () =>
  useLoaderStore(
    useShallow((state: LoaderType) => ({
      loading: state.loading,
    }))
  );

// Selector for Actions Only
export const useLoaderActions = () =>
  useLoaderStore(
    useShallow((state: LoaderType) => ({
      startLoading: state.startLoading,
      stopLoading: state.stopLoading,
    }))
  );
