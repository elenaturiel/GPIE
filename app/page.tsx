import { BottleLayer } from "@/components/BottleLayer";
import { Experience } from "@/components/Experience";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Demo } from "@/components/sections/Demo";
import { Hero } from "@/components/sections/Hero";
import { How } from "@/components/sections/How";
import { Pilot } from "@/components/sections/Pilot";
import { Problem } from "@/components/sections/Problem";
import { Specs } from "@/components/sections/Specs";
import { Where } from "@/components/sections/Where";

export default function Home() {
  return (
    <>
      <a className="skip" href="#piloto">
        Saltar al formulario del piloto
      </a>
      <BottleLayer />
      <Header />
      <main id="top">
        <Hero />
        <Specs />
        <Demo />
        <Problem />
        <How />
        <Where />
        <Pilot />
      </main>
      <Footer />
      <Experience />
    </>
  );
}
