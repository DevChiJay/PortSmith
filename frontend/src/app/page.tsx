'use client';

import { motion } from 'framer-motion';
import ScrollNavbar from "../components/scroll-navbar";
import Hero from "../components/Hero";
import Featured from "../components/Featured";
import CTA from "../components/CTA";
import Benefits from "../components/Benefits";
import Metrics from "../components/Metrics";
import FAQ from "../components/FAQ";
import Pricing from "../components/Pricing";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden">
      {/* Scroll-aware Navbar */}
      <ScrollNavbar />
      
      {/* Animated Background Elements */}
      <div className="fixed inset-0 -z-10">
        {/* Gradient Mesh Background */}
        <div className="absolute inset-0 gradient-mesh" />
        
        {/* Animated Grid Pattern */}
        <div className="absolute inset-0 grid-background opacity-50" />
        
        {/* Dot Pattern Overlay */}
        <div className="absolute inset-0 dot-pattern" />
        
        {/* Floating Gradient Orbs - Neutral with subtle green */}
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-gray-400/8 dark:bg-gray-600/8 rounded-full blur-3xl"
          animate={{
            y: [0, -30, 0],
            x: [0, 20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-40 right-20 w-96 h-96 bg-green-200/3 dark:bg-green-900/3 rounded-full blur-3xl"
          animate={{
            y: [0, 40, 0],
            x: [0, -30, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 left-1/3 w-80 h-80 bg-gray-300/8 dark:bg-gray-700/8 rounded-full blur-3xl"
          animate={{
            y: [0, -20, 0],
            x: [0, 30, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Main Content with Fade In Animation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10"
      >
        {/* Hero Section with Enhanced Animation */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Hero />
        </motion.section>

        {/* Social Proof / Featured Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <Featured />
        </motion.section>

        {/* Benefits Section with Stagger Animation */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <Benefits />
        </motion.section>

        {/* Metrics Section */}
        <motion.section
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <Metrics />
        </motion.section>

        {/* Pricing Section with Fade In */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <Pricing />
        </motion.section>

        {/* FAQ Section */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <FAQ />
        </motion.section>

        {/* CTA Section with Scale Animation */}
        <motion.section
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <CTA />
        </motion.section>

        {/* Footer */}
        <Footer />
      </motion.div>
    </div>
  );
}
