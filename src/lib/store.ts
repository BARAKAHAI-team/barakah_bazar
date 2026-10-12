'use client';

// Lightweight event emitter for client-side badge counts and auth state updates
type Listener = () => void;
const listeners: Set<Listener> = new Set();

export const clientStore = {
  cartCount: 0,
  wishlistCount: 0,
  isLoggedIn: false,
  userName: null as string | null,

  setCartCount(count: number) {
    this.cartCount = count;
    this.notify();
  },

  setWishlistCount(count: number) {
    this.wishlistCount = count;
    this.notify();
  },

  setAuth(isLoggedIn: boolean, name: string | null = null) {
    this.isLoggedIn = isLoggedIn;
    this.userName = name;
    this.notify();
  },

  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  notify() {
    listeners.forEach((l) => l());
  },
};
