import { twMerge } from "tailwind-merge";
import Marquee from "../constants/Marquee";
import { certifications } from "../constants";
const firstRow = certifications.slice(0, certifications.length / 2);
const secondRow = certifications.slice(certifications.length / 2);

const CertCard = ({ img, title, institution, date, url }) => {
  return (
    <figure
      className={twMerge(
        "relative h-full w-64 cursor-pointer overflow-hidden rounded-xl border p-4 border-gray-50/[.1] bg-gradient-to-r bg-indigo to-storm hover:bg-royal hover-animation"
      )}
    >
      <div className="flex flex-row items-center gap-2">
        <img
          className="rounded-full bg-white/10"
          width="32"
          height="32"
          alt=""
          src={img}
        />
        <div className="flex flex-col">
          <figcaption className="text-sm font-medium text-white">
            {title}
          </figcaption>
          <p className="text-xs font-medium text-white/40">{institution}</p>
        </div>
      </div>
      <blockquote className="mt-2 text-sm">{date}</blockquote>
      <a
        href={url}
        target="_blank"
        className="mt-2 text-sm inline-flex items-center gap-1 cursor-pointer hover-animation"
      >
        Ver certificado
        <img src="/models/assets/arrow-up.svg" className="size-3" />
      </a>
    </figure>
  );
};

export default function Certifications() {
  return (
    <div className="items-start mt-25 md:mt-35 c-space">
      <h2 className="text-heading">Certificaciones</h2>
      <div className="relative flex flex-col items-center justify-center w-full mt-12 overflow-hidden">
        <Marquee pauseOnHover className="[--duration:60s]">
          {firstRow.map((certification) => (
            <CertCard key={`${certification.title}`} {...certification} />
          ))}
        </Marquee>

        <Marquee reverse pauseOnHover className="[--duration:60s]">
          {secondRow.map((certification, index) => (
            <CertCard
              key={`${certification.institution}-${index}`}
              {...certification}
            />
          ))}
        </Marquee>
        <div className="absolute inset-y-0 left-0 w-1/4 pointer-events-none bg-gradient-to-r from-primary"></div>
        <div className="absolute inset-y-0 right-0 w-1/4 pointer-events-none bg-gradient-to-l from-primary"></div>
      </div>
    </div>
  );
}
