import React from "react";

export const FrameworksModal = ({ onClose }) => {
  const skills = [
    { name: "github", displayName: "GitHub", experience: "5+ años" },
    { name: "javascript", displayName: "JavaScript", experience: "3+ años" },
    { name: "react", displayName: "React", experience: "3+ años" },
    { name: "tailwindcss", displayName: "Tailwind CSS", experience: "2+ años" },
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
    { name: "sonarqube", displayName: "SonarQube", experience: "2+ años" },
    { name: "nextjs", displayName: "Next.js", experience: "2+ años" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 overflow-hidden">
      <div className="bg-primary max-w-4xl w-full rounded-lg p-6 relative overflow-y-auto max-h-[90vh]">
        {/* Botón cerrar */}
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-white text-2xl cursor-pointer"
          onClick={onClose}
        >
          &times;
        </button>

        <h2 className="text-2xl font-bold mb-6">Habilidades Detalladas</h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {skills.map((skill, index) => (
            <div
              key={index}
              className="flex flex-col items-center bg-gray-700 p-4 rounded-lg shadow-sm hover:shadow-md transition"
            >
              <img
                src={`/models/assets/logos/${skill.name}.svg`}
                alt={skill.displayName}
                className="w-12 h-12 mb-2"
              />
              <p className="font-semibold">{skill.displayName}</p>
              <p className="text-sm text-gray-500">{skill.experience}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
