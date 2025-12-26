'use client';

import { Key, BookOpen, Zap, Shield } from "lucide-react";
import { motion } from "framer-motion";

const benefits = [
  {
    icon: Key,
    title: "Unified API Keys",
    description: "Single API key management for multiple services. Create, manage, and monitor all your API keys from one dashboard.",
  },
  {
    icon: BookOpen,
    title: "Interactive Documentation",
    description: "Browse comprehensive API docs with live Swagger UI. Test endpoints directly in your browser before implementation.",
  },
  {
    icon: Zap,
    title: "Quick Integration",
    description: "Get started in minutes with simple authentication. Copy your key and start making API calls immediately.",
  },
  {
    icon: Shield,
    title: "Secure & Reliable",
    description: "Enterprise-grade security with usage tracking. Monitor your API consumption and set custom rate limits.",
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4
    }
  }
};

function Benefits() {
  return (
    <section className="py-24 px-4">
      {/* Section Header */}
      <div className="text-center mb-16 max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            Built for Developers
          </h2>
          <p className="text-muted-foreground">
            Everything you need to integrate and manage APIs efficiently
          </p>
        </motion.div>
      </div>

      {/* Benefits Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto"
      >
        {benefits.map((benefit) => (
          <motion.div
            key={benefit.title}
            variants={itemVariants}
            className="group"
          >
            <div className="text-center space-y-4">
              {/* Icon */}
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
                <benefit.icon className="h-7 w-7 text-primary" strokeWidth={2} />
              </div>

              {/* Content */}
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  {benefit.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

export default Benefits;
