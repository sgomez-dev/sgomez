import { Composition } from "remotion";
import { Shatter404 } from "./Shatter404";

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
  </>
);
