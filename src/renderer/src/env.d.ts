/// <reference types="vite/client" />
import { AxiosInstance } from 'axios'

interface ImportMetaEnv {
  readonly MAIN_VITE_SOME_KEY: string
  // more env variables...
  // readonly VITE_TEST_NAME: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance
  }
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'

  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>
  export default component
}
