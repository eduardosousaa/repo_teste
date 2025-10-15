import { setCookie, parseCookies, destroyCookie } from "nookies";

const DEFAULT_TOKEN_NAME = "token";

export default function TokenService() {
  return {
    setToken: (
      token: string,
      tokenName: string = DEFAULT_TOKEN_NAME,
      maxAgeSeconds: number = 60 * 60
    ) => {
      setCookie(null, tokenName, token, {
        maxAge: maxAgeSeconds,
        path: "/",
      });
    },

    getToken: (tokenName: string = DEFAULT_TOKEN_NAME) => {
      const cookies = parseCookies();
      return cookies[tokenName] || null;
    },

    removeToken: (tokenName: string = DEFAULT_TOKEN_NAME) => {
      destroyCookie(null, tokenName, { path: "/" });
    },
  };
}
