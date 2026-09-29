export const personalInfo = {
  name: "Kumari Aleti",
  title: "Full Stack Developer",
  shortTagline: "Building practical web applications and AI-powered systems with modern full-stack technologies.",
  location: "Macherla, Andhra Pradesh",
  email: "aletikumari08@gmail.com",
  phone: "+91-6305196288",
  github: "https://github.com/kumarialeti",
  linkedin: "https://linkedin.com/in/kumari-aleti-0a924b366",
  resumePath: "/resume.pdf",
};

export const about = {
  heading: "About Me",
  content: "I'm a Computer Science Engineering student specializing in Artificial Intelligence and Machine Learning, with hands-on experience building full-stack web applications and AI-powered systems. My work spans React.js, Node.js, Express.js, FastAPI, PostgreSQL, MongoDB, REST APIs, authentication, multi-agent architectures, and RAG pipelines.\n\nI enjoy working across the stack—from building responsive interfaces and backend APIs to designing database structures and integrating AI capabilities into practical applications.",
};

export const education = {
  degree: "Bachelor of Technology – CSE (Artificial Intelligence & Machine Learning)",
  institution: "Aditya College of Engineering and Technology, Andhra Pradesh",
  cgpa: "7.87 / 10.0",
  graduation: "May 2027",
};

export const skills = {
  frontend: ["React.js", "Vite", "JavaScript (ES6+)", "HTML5", "CSS3", "Tailwind CSS", "Redux Toolkit", "React Router"],
  backend: ["Node.js", "Express.js", "FastAPI (Python)", "REST API Development", "Middleware", "Async/Await"],
  databases: ["PostgreSQL", "SQL queries", "Joins", "Indexing", "Schema design", "MongoDB", "Mongoose", "SQLite", "SQLAlchemy", "ChromaDB", "Vector Database"],
  ai: ["Python", "LangChain", "LangGraph", "Multi-Agent Architecture", "RAG Pipelines", "Hugging Face Embeddings", "Groq API", "Llama 3.1", "Google Gemini API", "Scikit-learn", "NumPy", "Pandas", "Flask"],
  auth: ["JWT Authentication", "bcrypt", "Socket.io", "RESTful API Design"],
  tools: ["Docker", "Docker Compose", "Nginx", "Render", "Vercel", "Git", "GitHub", "CI/CD"],
};

export const experience = [
  {
    role: "Full Stack Developer Intern",
    company: "SmartBridge and APSCHE",
    duration: "June 2025 – July 2025",
    location: "Andhra Pradesh, India",
    responsibilities: [
      "Developed and deployed full-stack web application features using React.js, Node.js, and REST APIs in a structured, industry-aligned internship program.",
      "Collaborated in an Agile team, participating in sprint planning, code reviews, and feature delivery using Git and GitHub."
    ]
  },
  {
    role: "AI & Machine Learning Virtual Intern",
    company: "SmartBridge Educational Services (in collaboration with APSCHE)",
    duration: "Short-Term Virtual Internship Program — 2 Months (120 Hours)",
    location: "Virtual",
    responsibilities: [
      "Completed a structured 120-hour virtual internship on Artificial Intelligence and Machine Learning.",
      "Worked with Python, NumPy, Pandas, Scikit-learn, and data visualization with Matplotlib/Seaborn.",
      "Built and trained a Scikit-learn classification model as a capstone project to predict a country's Human Development Index (HDI) tier from Life Expectancy, Mean Years of Schooling, and GNI per capita.",
      "Deployed the model as a Flask web application."
    ]
  },
  {
    role: "Web Development Intern",
    company: "TechSonix Solutions",
    duration: "April 2025",
    location: "Remote",
    responsibilities: [
      "Built and maintained frontend components.",
      "Integrated third-party REST APIs.",
      "Improved UI responsiveness across device breakpoints.",
      "Gained hands-on experience with API integration and Git/GitHub version control workflows."
    ]
  }
];

export const projects = [
  {
    id: "agrisaarthi",
    name: "AgriSaarthi",
    subtitle: "AI-Powered Multi-Agent Agricultural Assistant Platform",
    year: "2026",
    description: "Built a full-stack AI-powered agricultural assistant with a React/Vite/Tailwind CSS frontend, a Node.js/Express.js REST API backend, and PostgreSQL for farmer profiles, fields, crops, and chat history.",
    technologies: ["React", "Vite", "Tailwind CSS", "Node.js", "Express.js", "PostgreSQL", "FastAPI", "LangGraph", "Gemini API", "ChromaDB"],
    github: "https://github.com/kumarialeti/AgriSaarthi",
    live: "https://agri-saarthi-one.vercel.app",
    features: [
      {
        title: "Full-Stack Architecture",
        details: ["React/Vite/Tailwind CSS frontend", "Node.js/Express.js REST API backend", "PostgreSQL database"]
      },
      {
        title: "Multi-Agent AI",
        details: ["LangGraph multi-agent orchestration", "FastAPI AI service", "Specialized Weather, Market, and Crop Health agents", "Google Gemini API"]
      },
      {
        title: "RAG",
        details: ["ChromaDB local vector store", "Agricultural knowledge base", "Retrieval-Augmented Generation", "Grounded responses"]
      },
      {
        title: "Safety Validation",
        details: ["Safety-validation node", "Prevents unsupported chemical advice", "Helps prevent hallucinated market data"]
      },
      {
        title: "Live Data",
        details: ["Open-Meteo API for real-time weather", "Agmarknet API through data.gov.in for state/crop-based market prices", "Graceful fallback on API failure"]
      },
      {
        title: "Multilingual",
        details: ["English", "Telugu", "Hindi"]
      },
      {
        title: "Security",
        details: ["JWT authentication", "Owner-scoped access"]
      },
      {
        title: "Deployment",
        details: ["Docker Compose"]
      }
    ]
  },
  {
    id: "medicarepro",
    name: "MediCarePro (DocSpot)",
    subtitle: "Full-Stack Telemedicine & Appointment Platform",
    year: "2025",
    description: "Built and deployed a full-stack telemedicine platform with a React/Vite frontend and Node.js/Express.js REST API backend on MongoDB, implementing role-based dashboards and authorization for patients, doctors, and admins.",
    technologies: ["React", "Vite", "Node.js", "Express.js", "MongoDB", "Socket.io", "JWT"],
    github: "https://github.com/kumarialeti/doctor-app",
    live: "https://doc-booking-online.vercel.app",
    features: [
      {
        title: "Authentication",
        details: ["JWT authentication", "bcrypt password hashing", "Forgot-password flow", "OTP generation", "OTP expiry validation"]
      },
      {
        title: "Role-Based System",
        details: ["Patient", "Doctor", "Admin"]
      },
      {
        title: "Real-Time Communication",
        details: ["Socket.io", "Patient-doctor chat", "Typing indicators"]
      },
      {
        title: "Video Consultation",
        details: ["Jitsi React SDK", "In-app video consultations", "Appointment-based unique rooms"]
      },
      {
        title: "Appointment System",
        details: ["Doctor search/filtering", "Slot-based appointment booking"]
      },
      {
        title: "File Management",
        details: ["Cloudinary profile uploads", "Medical report uploads"]
      },
      {
        title: "Admin",
        details: ["Admin analytics", "Payment status tracking"]
      },
      {
        title: "Deployment",
        details: ["Frontend deployed on Vercel"]
      }
    ]
  }
];

export const certifications = [
  "IBM SkillsBuild - Getting Started with Artificial Intelligence",
  "IBM SkillsBuild - Make Agentic AI Work for You",
  "Hugging Face - Fundamentals of Agents",
  "Microsoft Learn - Introduction to Generative AI and Agents"
];

export const focusAreas = [
  {
    id: "01",
    title: "Full-Stack Development",
    technologies: "React.js, Node.js, Express.js, FastAPI, REST APIs"
  },
  {
    id: "02",
    title: "AI Applications",
    technologies: "LangChain, LangGraph, Multi-Agent Architecture, RAG"
  },
  {
    id: "03",
    title: "Data & Backend",
    technologies: "PostgreSQL, MongoDB, ChromaDB, SQL"
  },
  {
    id: "04",
    title: "Engineering & Deployment",
    technologies: "Docker, Git, GitHub, Vercel, Render, CI/CD"
  }
];
