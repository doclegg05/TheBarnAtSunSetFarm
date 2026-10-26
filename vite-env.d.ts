/// <reference types="vite/client" />

declare module '*?responsive' {
  const image: import('./scripts/responsiveImages').ResponsiveImage;
  export default image;
}
