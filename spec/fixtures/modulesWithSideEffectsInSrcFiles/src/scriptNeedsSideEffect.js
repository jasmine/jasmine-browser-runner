window._scriptSyncSuccess = window._moduleWithSyncSideEffectLoaded;

let resolve;
window.secondaryModuleLoading = new Promise((intresolve) => {
  resolve = intresolve;
});

// Load again to check if module is executed again or not (when loaded from the same path)
import('myPackage/moduleWithSideEffects.mjs').then((_module) => {
  // We are done
  resolve();
});