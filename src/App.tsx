/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export default function App() {
  return (
    <main
      id="bannerstation-screen"
      className="flex min-h-screen w-full flex-col items-center justify-center bg-black p-4 sm:p-6 gap-3 sm:gap-4"
    >
      <h1
        id="bannerstation-title"
        className="font-condensed text-center text-4xl font-extrabold uppercase tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl leading-none"
      >
        BANNERSTATION
      </h1>

      <div
        id="bannerstation-square"
        className="aspect-square w-[min(88vw,calc(88vh-5rem))] bg-[#171717] rounded-none shrink-0"
      />
    </main>
  );
}

