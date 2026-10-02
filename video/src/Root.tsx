import { Composition } from "remotion";
import { Shatter404 } from "./Shatter404";
import { BuildSequence } from "./BuildSequence";
import { BUILD_FPS, BUILD_FRAMES } from "./build-timeline";

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
  </>
);
