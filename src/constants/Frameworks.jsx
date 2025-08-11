import { OrbitingCircles } from "./OrbitingCircles";

export function Frameworks() {
  const skills = [
    { name: "github", displayName: "GitHub", experience: "5+ años" },
    { name: "javascript", displayName: "JavaScript", experience: "3+ años" },
    { name: "react", displayName: "React", experience: "3+ años" },
    { name: "tailwindcss", displayName: "Tailwind CSS", experience: "2+ años" },
    {
      name: "framer-motion",
      displayName: "FramerMotion",
      experience: "1+ años",
    },
    { name: "vitejs", displayName: "Vite", experience: "3+ años" },
    { name: "angular", displayName: "Angular", experience: "1+ años" },
    { name: "nodejs", displayName: "Node.js", experience: "2+ años" },
    { name: "typescript", displayName: "TypeScript", experience: "2+ años" },
    { name: "python", displayName: "Python", experience: "3+ años" },
    { name: "googlecloud", displayName: "Google Cloud", experience: "1+ años" },
    { name: "aws", displayName: "AWS", experience: "1+ años" },
    { name: "jenkins", displayName: "Jenkins", experience: "2+ años" },
    { name: "docker", displayName: "Docker", experience: "2+ años" },
    { name: "kubernetes", displayName: "Kubernetes", experience: "2+ años" },
    { name: "mongodb", displayName: "MongoDB", experience: "3+ años" },
    { name: "mysql", displayName: "MySQL", experience: "1+ años" },
    { name: "firebase", displayName: "Firebase", experience: "2+ años" },
    { name: "postman", displayName: "Postman", experience: "3+ años" },
    { name: "sonarqube", displayName: "SonarQube", experience: "2+ año" },
    { name: "nextjs", displayName: "Next.js", experience: "2+ años" },
  ];

  return (
    <div className="relative flex h-[15rem] w-full flex-col items-center justify-center">
      <OrbitingCircles iconSize={40}>
        {skills.map((skill, index) => (
          <Icon
            key={index}
            src={`/models/assets/logos/${skill.name}.svg`}
            skill={skill}
          />
        ))}
      </OrbitingCircles>

      <OrbitingCircles iconSize={25} radius={100} reverse speed={2}>
        {skills.reverse().map((skill, index) => (
          <Icon
            key={index}
            src={`/models/assets/logos/${skill.name}.svg`}
            skill={skill}
          />
        ))}
      </OrbitingCircles>
    </div>
  );
}

const Icon = ({ src, skill, onMouseEnter, onMouseLeave }) => (
  <img
    src={src}
    className="duration-200 rounded-sm hover:scale-110 cursor-pointer"
    onTouchStart={(e) => onMouseEnter(skill, e)}
    onTouchEnd={onMouseLeave}
    alt={skill.displayName}
  />
);
