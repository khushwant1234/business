"use client";

import * as React from "react";

import type { ToastProps } from "@/components/ui/toast";

type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
};

const TOAST_LIMIT = 3;
const TOAST_REMOVE_DELAY = 3000;

let count = 0;
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return String(count);
}

type State = { toasts: ToasterToast[] };

const listeners: Array<(state: State) => void> = [];
let memoryState: State = { toasts: [] };

function dispatch(state: State) {
  memoryState = state;
  listeners.forEach((listener) => listener(memoryState));
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

function addToRemoveQueue(id: string) {
  if (toastTimeouts.has(id)) {
    return;
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(id);
    dispatch({
      toasts: memoryState.toasts.filter((toast) => toast.id !== id),
    });
  }, TOAST_REMOVE_DELAY);

  toastTimeouts.set(id, timeout);
}

function toast({ ...props }: Omit<ToasterToast, "id">) {
  const id = genId();

  const update = (next: ToasterToast) => {
    dispatch({
      toasts: memoryState.toasts.map((toast) => (toast.id === id ? { ...toast, ...next } : toast)),
    });
  };

  const dismiss = () => {
    addToRemoveQueue(id);
  };

  dispatch({
    toasts: [{ ...props, id, onOpenChange: (open: boolean) => !open && dismiss() }, ...memoryState.toasts].slice(0, TOAST_LIMIT),
  });

  return {
    id,
    dismiss,
    update,
  };
}

function useToast() {
  const [state, setState] = React.useState<State>(memoryState);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, []);

  return {
    ...state,
    toast,
    dismiss: (id?: string) => {
      if (id) {
        addToRemoveQueue(id);
        return;
      }

      memoryState.toasts.forEach((currentToast) => addToRemoveQueue(currentToast.id));
    },
  };
}

export { useToast, toast };
