'use client';

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Zap, Shield } from "lucide-react";

function Hero() {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
      {/* Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Left Column - Content */}
          <div className="space-y-8 text-center lg:text-left">
            {/* Announcement Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex justify-center lg:justify-start"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group">
                <Sparkles className="h-4 w-4 text-gray-700 dark:text-gray-300 animate-pulse" />
                <span className="bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent font-semibold">
                  New APIs available
                </span>
                <ArrowRight className="h-4 w-4 text-gray-700 dark:text-gray-300 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
            
            {/* Main Headline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="space-y-6"
            >
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight leading-tight">
                <span className="block gradient-text">
                  One Gateway.
                </span>
                <span className="block gradient-text">
                  Every API.
                </span>
              </h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-lg md:text-xl text-muted-foreground leading-relaxed"
              >
                Unify your API integrations through a single, powerful gateway. 
                <span className="block mt-2 text-foreground/80 font-medium">
                  Connect to multiple services with one API key.
                </span>
              </motion.p>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start items-center pt-4"
            >
              <Button 
                size="default" 
                className="btn-gradient text-white px-6 py-5 rounded-lg shadow-xl group relative overflow-hidden h-auto w-full sm:w-auto"
                asChild
              >
                <Link href="/signup" className="flex items-center gap-2">
                  Get Started Free
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              
              <Button 
                size="default" 
                variant="outline" 
                className="px-6 py-5 rounded-lg glass-card hover:glass-card border-2 hover:border-primary/50 transition-all duration-300 h-auto w-full sm:w-auto group"
                asChild
              >
                <Link href="/docs" className="flex items-center gap-2">
                  View Docs
                  <Zap className="h-4 w-4 group-hover:text-primary transition-colors" />
                </Link>
              </Button>
            </motion.div>

            {/* Feature Pills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap gap-3 justify-center lg:justify-start items-center pt-4"
            >
              {[
                { icon: Shield, text: "Secure" },
                { icon: Zap, text: "Fast" },
                { icon: Sparkles, text: "Simple" }
              ].map((feature, index) => (
                <motion.div
                  key={feature.text}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-card text-sm font-medium"
                >
                  <feature.icon className="h-3.5 w-3.5 text-gray-700 dark:text-gray-300" />
                  <span className="text-foreground/70">{feature.text}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Right Column - Visual Elements */}
          <motion.div
            initial={{ opacity: 0, x: 40, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative"
          >
            {/* Main Code Card */}
            <div className="glass-card rounded-2xl p-1 shadow-2xl card-3d relative z-10">
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-950 dark:to-gray-900 rounded-xl overflow-hidden">
                {/* Terminal Header */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-700/50">
                  <div className="flex gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-500/80"></div>
                    <div className="h-3 w-3 rounded-full bg-yellow-500/80"></div>
                    <div className="h-3 w-3 rounded-full bg-green-500/80"></div>
                  </div>
                  <span className="text-sm text-gray-400 ml-2 font-mono">api-gateway.js</span>
                </div>
                
                {/* Code Content */}
                <div className="p-5 font-mono text-xs overflow-x-auto">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                    className="space-y-1.5"
                  >
                    <div className="text-gray-500">// Simple API request</div>
                    <div className="text-gray-400">
                      <span className="text-purple-400">const</span>{" "}
                      <span className="text-blue-300">response</span>{" "}
                      <span className="text-gray-300">=</span>{" "}
                      <span className="text-purple-400">await</span>{" "}
                      <span className="text-yellow-300">fetch</span>
                      <span className="text-gray-300">(</span>
                    </div>
                    <div className="text-green-400 ml-4">
                      'https://api.portsmith.dev/api-slug'
                      <span className="text-gray-300">,</span>
                    </div>
                    <div className="text-gray-400 ml-4">
                      <span className="text-gray-300">{'{'}</span>
                    </div>
                    <div className="text-gray-400 ml-8">
                      <span className="text-blue-300">headers</span>
                      <span className="text-gray-300">: {'{'}</span>
                    </div>
                    <div className="text-gray-400 ml-12">
                      <span className="text-green-400">'X-API-Key'</span>
                      <span className="text-gray-300">:</span>{" "}
                      <span className="text-orange-400">apiKey</span>
                      <span className="text-gray-300">,</span>
                    </div>
                    <div className="text-gray-400 ml-8">
                      <span className="text-gray-300">{'}'}</span>
                    </div>
                    <div className="text-gray-400 ml-4">
                      <span className="text-gray-300">{'}'}</span>
                    </div>
                    <div className="text-gray-400">
                      <span className="text-gray-300">)</span>
                    </div>
                    <div className="mt-2"></div>
                    <div className="text-gray-400">
                      <span className="text-purple-400">const</span>{" "}
                      <span className="text-blue-300">data</span>{" "}
                      <span className="text-gray-300">=</span>{" "}
                      <span className="text-purple-400">await</span>{" "}
                      <span className="text-blue-300">response</span>
                      <span className="text-gray-300">.</span>
                      <span className="text-yellow-300">json</span>
                      <span className="text-gray-300">()</span>
                      <span className="text-blue-400 ml-2">✓</span>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Floating Stats Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1 }}
              className="absolute -right-6 glass-card rounded-xl p-4 shadow-xl hidden lg:block"
            >
              <div className="text-3xl font-bold gradient-text">50+</div>
              <div className="text-sm text-muted-foreground">APIs Available</div>
            </motion.div>

          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default Hero