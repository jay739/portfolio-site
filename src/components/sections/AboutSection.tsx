import Image from 'next/image';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

const imageVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: "easeOut"
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

export default function AboutSection() {
  return (
    <section className="relative py-16 px-2 sm:px-6 w-full overflow-hidden">
      <div className="w-full relative">
        <div className="absolute inset-0 overflow-hidden rounded-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-background to-background" />
        </div>
        <motion.div 
          className="relative w-full bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-4 sm:p-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          {/* Header with centered large profile image */}
          <motion.div 
            className="text-center mb-12"
            variants={itemVariants}
          >
            <motion.div 
              className="inline-block relative mb-6"
              variants={imageVariants}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div 
                className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 lg:w-72 lg:h-72 rounded-full overflow-hidden border-4 border-blue-600 shadow-2xl bg-gray-200 dark:bg-slate-700 flex items-center justify-center mx-auto relative group cursor-pointer"
                whileHover={{ 
                  borderColor: "#3b82f6",
                  boxShadow: "0 25px 50px -12px rgba(59, 130, 246, 0.4)"
                }}
                transition={{ duration: 0.3 }}
              >
                <Image 
                  src="/images/profile/profile.jpg" 
                  alt="Jayakrishna Konda - Data Scientist" 
                  width={288} 
                  height={288}
                  className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
                  priority
                />
                
                {/* Decorative rings around image */}
                <motion.div 
                  className="absolute inset-0 rounded-full border-2 border-blue-400/30"
                  animate={{ 
                    scale: [1, 1.1, 1],
                    opacity: [0.3, 0.6, 0.3]
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                <motion.div 
                  className="absolute -inset-2 rounded-full border border-blue-300/20"
                  animate={{ 
                    scale: [1, 1.05, 1],
                    opacity: [0.2, 0.4, 0.2]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.5
                  }}
                />
                <motion.div 
                  className="absolute -inset-4 rounded-full border border-purple-300/10"
                  animate={{ 
                    scale: [1, 1.03, 1],
                    opacity: [0.1, 0.3, 0.1]
                  }}
                  transition={{ 
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1
                  }}
                />
              </motion.div>
            </motion.div>
            
            <motion.h2 
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-blue-600 dark:text-blue-400 mb-4"
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              About Me
            </motion.h2>
            <motion.p 
              className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed"
              variants={itemVariants}
            >
              Hi! I'm Jayakrishna Konda, a <motion.span 
                className="font-semibold text-blue-600 dark:text-blue-400"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >Data Scientist</motion.span>, Full Stack Developer, and DevOps Engineer. My passion lies in building intelligent systems, extracting insights from data, and deploying scalable AI/ML solutions.
            </motion.p>
          </motion.div>

          {/* Content grid */}
          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12"
            variants={containerVariants}
          >
            {/* Left column */}
            <div className="space-y-8">
              <motion.div 
                className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-slate-700 dark:to-slate-600 rounded-xl p-6 shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] group"
                variants={cardVariants}
                whileHover={{ 
                  y: -5,
                  boxShadow: "0 25px 50px -12px rgba(59, 130, 246, 0.25)"
                }}
                transition={{ duration: 0.3 }}
              >
                <motion.h3 
                  className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-4 flex items-center gap-2"
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.span
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                  >📈</motion.span> 
                  Experience Highlights
                </motion.h3>
                <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                  {[
                    "4+ years of experience in data science, AI/ML, and software engineering",
                    "Expert in Python, deep learning, NLP, and data visualization",
                    "Extensive Android ROM development and embedded systems experience",
                    "Cloud, MLOps, and self-hosting advocate",
                    "Open-source contributor and lifelong learner"
                  ].map((item, index) => (
                    <motion.li 
                      key={index}
                      className="flex items-start gap-3 group/item"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ x: 5 }}
                    >
                      <motion.span 
                        className="text-blue-500 mt-1 transition-colors group-hover/item:text-blue-600"
                        whileHover={{ scale: 1.2 }}
                      >▶</motion.span>
                      <span className="transition-colors group-hover/item:text-gray-900 dark:group-hover/item:text-white">
                        {item}
                      </span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>

              <motion.div 
                className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-slate-700 dark:to-slate-600 rounded-xl p-6 shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] group"
                variants={cardVariants}
                whileHover={{ 
                  y: -5,
                  boxShadow: "0 25px 50px -12px rgba(168, 85, 247, 0.25)"
                }}
                transition={{ duration: 0.3 }}
              >
                <motion.h3 
                  className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-4 flex items-center gap-2"
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.span
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 1 }}
                  >🎯</motion.span> 
                  Data Science Highlights
                </motion.h3>
                <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                  {[
                    "Developed end-to-end ML pipelines for NLP, computer vision, and time series forecasting",
                    "Experience with TensorFlow, PyTorch, Scikit-learn, Pandas, and data wrangling",
                    "Built dashboards and analytics tools for actionable business insights",
                    "Deployed AI models to production using Docker, FastAPI, and cloud platforms"
                  ].map((item, index) => (
                    <motion.li 
                      key={index}
                      className="flex items-start gap-3 group/item"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ x: 5 }}
                    >
                      <motion.span 
                        className="text-purple-500 mt-1 transition-colors group-hover/item:text-purple-600"
                        whileHover={{ scale: 1.2 }}
                      >●</motion.span>
                      <span className="transition-colors group-hover/item:text-gray-900 dark:group-hover/item:text-white">
                        {item}
                      </span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </div>

            {/* Right column */}
            <div className="space-y-8">
              <motion.div 
                className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-slate-700 dark:to-slate-600 rounded-xl p-6 shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] group"
                variants={cardVariants}
                whileHover={{ 
                  y: -5,
                  boxShadow: "0 25px 50px -12px rgba(34, 197, 94, 0.25)"
                }}
                transition={{ duration: 0.3 }}
              >
                <motion.h3 
                  className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-4 flex items-center gap-2"
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.span
                    animate={{ rotateY: [0, 180, 360] }}
                    transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
                  >💻</motion.span> 
                  Android & Embedded Systems
                </motion.h3>
                <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                  {[
                    "Built custom Android ROMs and kernels for Motorola devices (MSM8953 platform)",
                    "Contributed to LineageOS and PixelExperience projects with device trees and vendor blobs",
                    "Experience with AOSP development, kernel compilation, and embedded systems programming",
                    "Hardware-software integration and low-level system optimization"
                  ].map((item, index) => (
                    <motion.li 
                      key={index}
                      className="flex items-start gap-3 group/item"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ x: 5 }}
                    >
                      <motion.span 
                        className="text-green-500 mt-1 transition-colors group-hover/item:text-green-600"
                        whileHover={{ scale: 1.2, rotate: 45 }}
                      >◆</motion.span>
                      <span className="transition-colors group-hover/item:text-gray-900 dark:group-hover/item:text-white">
                        {item}
                      </span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>

              <motion.div 
                className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-slate-700 dark:to-slate-600 rounded-xl p-6 shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] group"
                variants={cardVariants}
                whileHover={{ 
                  y: -5,
                  boxShadow: "0 25px 50px -12px rgba(249, 115, 22, 0.25)"
                }}
                transition={{ duration: 0.3 }}
              >
                <motion.h3 
                  className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-4 flex items-center gap-2"
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.span
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 2 }}
                  >🌟</motion.span> 
                  Featured Projects & Achievements
                </motion.h3>
                <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                  {[
                    "Top 5% in multiple Kaggle competitions",
                    "Published research on AI/ML applications in real-world domains",
                    "Open-source contributor to data science libraries and datasets",
                    "Led projects in NLP, Computer Vision, and Time Series Analysis"
                  ].map((item, index) => (
                    <motion.li 
                      key={index}
                      className="flex items-start gap-3 group/item"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ x: 5 }}
                    >
                      <motion.span 
                        className="text-orange-500 mt-1 transition-colors group-hover/item:text-orange-600"
                        whileHover={{ scale: 1.2, rotate: 360 }}
                        transition={{ duration: 0.5 }}
                      >★</motion.span>
                      <span className="transition-colors group-hover/item:text-gray-900 dark:group-hover/item:text-white">
                        {item === "Led projects in NLP, Computer Vision, and Time Series Analysis" ? (
                          <>Led projects in <span className='font-semibold text-blue-600 dark:text-blue-400'>NLP</span>, <span className='font-semibold text-blue-600 dark:text-blue-400'>Computer Vision</span>, and <span className='font-semibold text-blue-600 dark:text-blue-400'>Time Series Analysis</span></>
                        ) : item}
                      </span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
} 