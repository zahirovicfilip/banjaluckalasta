import Nav from '@/components/Nav';
import PageStack from '@/components/PageStack';
import Hero from '@/components/sections/Hero';
import Stats from '@/components/sections/Stats';
import Technique from '@/components/sections/Technique';
import Winners from '@/components/sections/Winners';
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
        {/* The hero and the winners page hold still while the next page slides over them.
            The camp opener is the sheet that covers the winners page. */}
        <PageStack
          pages={[
            { id: 'top', node: <Hero /> },
            { id: 'pobjednici', node: <Winners /> },
          ]}
        >
          <Camp />
          <Stats />
          <Technique />
          <People />
          <Results />
          {/* The quote poster lives in the hero unless the animated hero is switched on. */}
          {hero.animated && <Quote />}
          <Videos />
          <Join />
        </PageStack>
      </main>
      <Footer />
    </>
  );
}
