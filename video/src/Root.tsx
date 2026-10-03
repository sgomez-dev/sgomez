import { Composition } from "remotion";
import { Shatter404 } from "./Shatter404";
import { BuildSequence } from "./BuildSequence";
import { BUILD_FPS, BUILD_FRAMES } from "./build-timeline";
import { SkyQuetzMonogram } from "./SkyQuetzMonogram";
import { MONO_FPS, MONO_FRAMES, MONO_H, MONO_W } from "./monogram-timeline";
import { HeroLoop } from "./HeroLoop";
import { HERO_FPS, HERO_FRAMES, HERO_SIZE } from "./hero-timeline";
import { ProjectReel } from "./ProjectReel";
import { REEL_FPS, REEL_FRAMES, REEL_H, REEL_W } from "./reel-timeline";

export const FPS = 60;
export const FRAMES = 120;

export const Root = () => (
  <>
    <Composition
      id="Shatter404"
      component={Shatter404}
      durationInFrames={FRAMES}
      fps={FPS}
      width={1920}
      height={1200}
      defaultProps={{ bg: "transparent" }}
    />
    <Composition id="BuildDesktop" component={BuildSequence} durationInFrames={BUILD_FRAMES} fps={BUILD_FPS} width={1200} height={1200} defaultProps={{ width: 1200, height: 1200 }} />
    <Composition id="BuildMobile" component={BuildSequence} durationInFrames={BUILD_FRAMES} fps={BUILD_FPS} width={600} height={600} defaultProps={{ width: 600, height: 600 }} />
    <Composition id="ProjectReel" component={ProjectReel} durationInFrames={REEL_FRAMES} fps={REEL_FPS} width={REEL_W} height={REEL_H} defaultProps={{ slug: "claude-canvas" }} />
    <Composition id="SkyQuetzMonogram" component={SkyQuetzMonogram} durationInFrames={MONO_FRAMES} fps={MONO_FPS} width={MONO_W} height={MONO_H} defaultProps={{ bg: "transparent" }} />
    <Composition id="HeroLoop" component={HeroLoop} durationInFrames={HERO_FRAMES} fps={HERO_FPS} width={HERO_SIZE} height={HERO_SIZE} defaultProps={{ bg: "transparent" }} />
  </>
);
