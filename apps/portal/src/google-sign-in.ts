import { ClientError } from "@ronin/runner-client";
import type { Locale } from "@ronin/content";

interface GoogleId {
  initialize(config: {
    client_id: string;
    nonce: string;
    callback(response: { credential?: string }): void;
  }): void;
  renderButton(
    slot: HTMLElement,
    options: {
      theme: "outline";
      size: "large";
      text: "continue_with";
      locale: Locale;
    },
  ): void;
}
let loading: Promise<GoogleId> | undefined;
function loadGoogle() {
  if (loading) return loading;
  loading = new Promise<GoogleId>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    const fail = () => {
      script.remove();
      reject(new ClientError("GOOGLE_UNAVAILABLE"));
    };
    const timeout = window.setTimeout(fail, 8000);
    script.addEventListener(
      "error",
      () => {
        clearTimeout(timeout);
        fail();
      },
      { once: true },
    );
    script.addEventListener(
      "load",
      () => {
        clearTimeout(timeout);
        const id = (
          window as Window & { google?: { accounts?: { id?: GoogleId } } }
        ).google?.accounts?.id;
        if (id) resolve(id);
        else fail();
      },
      { once: true },
    );
    document.head.append(script);
  }).catch((error) => {
    loading = undefined;
    throw error;
  });
  return loading;
}

export async function renderGoogleButton(
  slot: HTMLElement,
  clientId: string,
  nonce: string,
  locale: Locale,
  onCredential: (token: string) => void,
) {
  const google = await loadGoogle();
  google.initialize({
    client_id: clientId,
    nonce,
    callback: (response) => {
      if (typeof response.credential === "string" && response.credential)
        onCredential(response.credential);
    },
  });
  slot.replaceChildren();
  google.renderButton(slot, {
    theme: "outline",
    size: "large",
    text: "continue_with",
    locale,
  });
}
