import { Timeline } from "@/constants/Timeline";
import { experiences } from "@/constants";
export const Experiences = () => {
  return (
    <div id="experience" className="w-full">
      <Timeline data={experiences} />
    </div>
  );
};
