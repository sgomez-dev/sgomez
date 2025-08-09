import { myProjects } from "@/constants";
import { Project } from "@/constants/Project";
export const Projects = () => {
  return (
    <section className="relative c-space section-spacing">
      <h2 className="text-heading">Mis proyectos</h2>
      <div className="bg-gradient-to-r from-transparent via-neutral-700 to-transparent mt-12 h-[1px] w-full" />
      {myProjects.map((project) => (
        <Project key={project.id} {...project} />
      ))}
    </section>
  );
};
