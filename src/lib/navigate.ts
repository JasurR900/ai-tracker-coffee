type RouterLike = {
  push: (href: string) => void;
  replace: (href: string) => void;
};

/** Client-side navigation. */
export function navigate(router: RouterLike, path: string, replace = false) {
  if (replace) router.replace(path);
  else router.push(path);
}
