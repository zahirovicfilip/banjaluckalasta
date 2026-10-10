import CampStage from '@/components/sections/CampStage';
import Community from '@/components/sections/Community';
import Reel from '@/components/sections/Reel';

/**
 * The camp chapter: the drone fly-in over Jezero Manjača as an opener, the week's programme
 * (pick a day), the jump clips from the finale, then the club's work off the bridge as a
 * highlighted band.
 */
export default function Camp() {
  return (
    <>
      {/* The opener comes after the camp interlude, then flows into the programme on one
          stage (CampStage). */}
      <CampStage />
      <Reel />
      <Community />
    </>
  );
}
