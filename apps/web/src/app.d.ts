// See https://svelte.dev/docs/kit/types#app.d.ts
declare global {
  namespace App {
    interface PageData {
      /** The page's id in the style of a Minecraft resource location, shown in the header. */
      namespace: string;
    }
  }
}

export {};
