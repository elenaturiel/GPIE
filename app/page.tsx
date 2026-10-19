import { BottleLayer } from "@/components/BottleLayer";
import { Experience } from "@/components/Experience";
import { Footer } from "@/components/Footer";
import { LeadDialog } from "@/components/LeadDialog";
import { Header } from "@/components/Header";
import { Demo } from "@/components/sections/Demo";
import { Band } from "@/components/sections/Band";
import { Calc } from "@/components/sections/Calc";
import { Hero } from "@/components/sections/Hero";
import { Marquee } from "@/components/sections/Marquee";
import { How } from "@/components/sections/How";
import { Pilot } from "@/components/sections/Pilot";
import { Problem } from "@/components/sections/Problem";
import { Specs } from "@/components/sections/Specs";
import { Steps } from "@/components/sections/Steps";
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
        <Marquee />
        <Band />
        <Problem />
        <How />
        <Where />
        <Calc />
        <Steps />
        <Pilot />
      </main>
      <Footer />
      <LeadDialog />
      <Experience />
    </>
  );
}
