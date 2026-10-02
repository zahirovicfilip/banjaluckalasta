import Nav from '@/components/Nav';
import Hero from '@/components/sections/Hero';
import Stats from '@/components/sections/Stats';
import Technique from '@/components/sections/Technique';
import History from '@/components/sections/History';
import People from '@/components/sections/People';
import Results from '@/components/sections/Results';
import Quote from '@/components/sections/Quote';
import Videos from '@/components/sections/Videos';
import Camp from '@/components/sections/Camp';
import Join from '@/components/sections/Join';
import Footer from '@/components/sections/Footer';
import { hero } from '@/content/site';

export default function Home() {
  return (
    <>
      <Nav />
      <main id="main">
        <Hero />
        <Stats />
        <Technique />
        <History />
        <People />
        <Results />
        {/* The quote poster lives in the hero unless the animated hero is switched on. */}
        {hero.animated && <Quote />}
        <Videos />
        <Camp />
        <Join />
      </main>
      <Footer />
    </>
  );
}
