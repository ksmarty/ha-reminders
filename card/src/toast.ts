/**
 * Surface a message through Home Assistant's toast notification.
 *
 * Failures used to disappear: a rejected service call in the list only
 * produced an unhandled promise rejection, which the user never saw — the
 * browser console and the HA log were the only places it showed up.
 */
export function showToast(
  source: EventTarget,
  message: string,
  isError = false,
): void {
  const text = message.trim();
  if (!text) return;
  source.dispatchEvent(
    new CustomEvent("hass-notification", {
      detail: { message: text, ...(isError ? { duration: 8000 } : {}) },
      bubbles: true,
      composed: true,
    }),
  );
}

/** Turn a rejected service call into something worth showing a human. */
export function errorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error && err.message) return err.message;
  const detail = (err as { body?: { message?: string } } | null)?.body?.message;
  return detail || fallback;
}
