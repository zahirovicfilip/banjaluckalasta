import Nav from '@/components/Nav';
import Hero from '@/components/sections/Hero';
import Story from '@/components/sections/Story';
import Technique from '@/components/sections/Technique';
import Winners from '@/components/sections/Winners';
import People from '@/components/sections/People';
import Results from '@/components/sections/Results';
import Quote from '@/components/sections/Quote';
import Videos from '@/components/sections/Videos';
import Camp from '@/components/sections/Camp';
import Join from '@/components/sections/Join';
import Airsoft from '@/components/sections/Airsoft';
import Footer from '@/components/sections/Footer';
import { KampInterlude, LastaInterlude } from '@/components/sections/Interludes';
import { hero } from '@/content/site';

export default function Home() {
  return (
    <>
      <Nav />
      <main id="main">
        {/* Between the first chapters, a still line with photos falling past it (Interlude). */}
        <div id="top">
          <Hero />
        </div>
        <LastaInterlude />
        {/* The winners page arrives over the interlude as a light sheet with rounded corners. Its
            bottom padding is the strip the next interlude slides over, so no text is ever under it. */}
        <div id="pobjednici" className="relative z-10 -mt-9 -scroll-mt-[88px] rounded-t-[2.25rem] bg-bg pb-12 sm:-mt-12 sm:rounded-t-[3rem] sm:pb-16">
          <Winners />
        </div>
        <KampInterlude />
        <Camp />
        <Story />
        <Technique />
        <People />
        <Results />
        {/* The quote poster lives in the hero unless the animated hero is switched on. */}
        {hero.animated && <Quote />}
        <Videos />
        {/* The sister club, in its own colours (the whole page switches theme while it is on screen). */}
        <Airsoft />
        <Join />
      </main>
      <Footer />
    </>
  );
}
