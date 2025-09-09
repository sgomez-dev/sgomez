import { motion } from "motion/react";
import { contain } from "three/src/extras/TextureUtils";

export const FrameworksModal = ({ onClose }) => {
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
    { name: "sonarqube", displayName: "SonarQube", experience: "2+ años" },
    { name: "nextjs", displayName: "Next.js", experience: "2+ años" },
    { name: "n8n", displayName: "n8n", experience: "1+ años" },
  ];

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 1,
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      x: -20,
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 overflow-hidden">
      <div className="bg-primary max-w-4xl w-full rounded-lg p-6 relative overflow-y-auto max-h-[90vh]">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-white text-2xl cursor-pointer"
          onClick={onClose}
        >
          &times;
        </button>

        <h2 className="text-2xl font-bold mb-6">Habilidades Detalladas</h2>

        <motion.div
          initial="hidden"
          whileInView="visible"
          variants={containerVariants}
          viewport={{ once: true }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6"
        >
          {skills.map((skill, index) => (
            <motion.div
              variants={itemVariants}
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
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};
