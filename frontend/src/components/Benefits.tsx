'use client';

import { CheckCircle, Code2, ShieldCheck, Zap, KeyRound, Activity, Globe2 } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "./ui/badge";

const benefits = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Optimized gateway with response times under 50ms. Built for speed and scale.",
    features: [
      "Low latency responses",
      "Global CDN distribution",
      "Smart caching layer"
    ],
    color: "from-yellow-500 to-orange-500"
  },
  {
    icon: Code2,
    title: "Developer First",
    description: "Comprehensive docs, SDKs, and tools designed for modern developers.",
    features: [
      "Interactive API explorer",
      "Multiple SDK options",
      "Code generation"
    ],
    color: "from-blue-500 to-cyan-500"
  },
  {
    icon: ShieldCheck,
    title: "Enterprise Security",
    description: "Bank-grade encryption and security. Your data is safe with us.",
    features: [
      "End-to-end encryption",
      "SOC 2 compliant",
      "Key rotation & revocation"
    ],
    color: "from-green-500 to-emerald-500"
  },
  {
    icon: KeyRound,
    title: "Unified Authentication",
    description: "One API key for all services. Simplify your integration workflow.",
    features: [
      "Single sign-on",
      "Role-based access",
      "Audit logging"
    ],
    color: "from-purple-500 to-pink-500"
  },
  {
    icon: Activity,
    title: "Real-time Analytics",
    description: "Track every request with detailed metrics and insights.",
    features: [
      "Usage dashboards",
      "Custom reports",
      "Alerting & monitoring"
    ],
    color: "from-indigo-500 to-purple-500"
  },
  {
    icon: Globe2,
    title: "Global Scale",
    description: "Deploy worldwide with 99.99% uptime SLA and automatic failover.",
    features: [
      "Multi-region deployment",
      "Auto-scaling",
      "DDoS protection"
    ],
    color: "from-teal-500 to-green-500"
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5
    }
  }
};

function Benefits() {
  return (
    <section className="py-24 px-4 relative overflow-hidden">
      {/* Section Header */}
      <div className="text-center mb-16 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Badge className="mb-4 px-4 py-1.5 glass-card bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700">
            <Zap className="h-3 w-3 mr-1 inline" />
            Why PortSmith
          </Badge>
          <h2 className="text-4xl md:text-5xl font-black mb-4 gradient-text">
            Everything You Need to Build Fast
          </h2>
          <p className="text-lg text-muted-foreground">
            Built for developers, by developers. Scale from prototype to production seamlessly.
          </p>
        </motion.div>
      </div>

      {/* Benefits Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto"
      >
        {benefits.map((benefit, index) => (
          <motion.div
            key={benefit.title}
            variants={itemVariants}
            whileHover={{ y: -8, scale: 1.02 }}
            className="group relative"
          >
            {/* Card */}
            <div className="glass-card rounded-2xl p-8 h-full relative overflow-hidden transition-all duration-300 hover:shadow-2xl">
              {/* Gradient Accent on Hover */}
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${benefit.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              
              {/* Icon */}
              <div className="relative mb-6">
                <div className={`absolute inset-0 bg-gradient-to-br ${benefit.color} rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-300`} />
                <div className="relative glass-card p-4 rounded-2xl w-fit">
                  <benefit.icon className="h-8 w-8 text-foreground" strokeWidth={2} />
                </div>
              </div>

              {/* Content */}
              <div className="relative">
                <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">
                  {benefit.title}
                </h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {benefit.description}
                </p>

                {/* Features List */}
                <ul className="space-y-3">
                  {benefit.features.map((feature, idx) => (
                    <motion.li
                      key={feature}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.1 * idx }}
                      className="flex items-start text-sm"
                    >
                      <CheckCircle className="h-5 w-5 text-gray-700 dark:text-gray-300 mr-3 mt-0.5 flex-shrink-0" strokeWidth={2.5} />
                      <span className="text-foreground/80">{feature}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>

              {/* Decorative Element */}
              <div className={`absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl ${benefit.color} rounded-tl-full opacity-5 group-hover:opacity-10 transition-opacity duration-300 -mr-16 -mb-16`} />
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Bottom CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="text-center mt-16"
      >
        <p className="text-muted-foreground mb-4">
          Join thousands of developers building with PortSmith
        </p>
        <div className="flex items-center justify-center gap-2 text-sm">
          <div className="flex -space-x-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 w-10 rounded-full glass-card border-2 border-background flex items-center justify-center text-xs font-bold">
                {String.fromCharCode(64 + i)}
              </div>
            ))}
          </div>
          <span className="text-muted-foreground font-medium">
            <span className="text-foreground font-bold">2,500+</span> developers trust PortSmith
          </span>
        </div>
      </motion.div>
    </section>
  );
}

export default Benefits;
