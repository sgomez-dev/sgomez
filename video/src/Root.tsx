import { Composition } from "remotion";
import { Shatter404 } from "./Shatter404";
import { ConstellationDesktop, ConstellationMobile } from "./stills";

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
      height={1080}
      defaultProps={{ bg: "transparent" }}
    />
    <Composition id="Constellation" component={ConstellationDesktop} durationInFrames={1} fps={FPS} width={1920} height={1080} />
    <Composition id="ConstellationMobile" component={ConstellationMobile} durationInFrames={1} fps={FPS} width={900} height={1200} />
  </>
);
