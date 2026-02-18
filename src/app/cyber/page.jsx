"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import Link from "next/link"
import {
  AwardIcon,
  CalendarIcon,
  ClockIcon,
  CodepenIcon,
  LocateIcon,
  ShieldIcon,
  CheckCircle2,
} from "@/components/ui/icons"
import CubeCanvas from "@/components/ui/Cube"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"

export default function Component() {
  const [selectedSpeaker, setSelectedSpeaker] = useState(null)

  return (
    <div
      className="min-h-screen text-gray-100 relative overflow-hidden"
      style={{
        backgroundImage:
          "url('https://images.wallpapersden.com/image/download/cybersecurity-core_bmdrZ2mUmZqaraWkpJRmbmdsrWZlbWU.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px]" />

      {/* Grid */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.05] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-10">
        <div className="flex items-center justify-center gap-8 mb-10 animate-float">

          <Image
            src="/amity.jpg"
            alt="Amity Logo"
            width={200}
            height={200}
            className="rounded-xl shadow-2xl border border-white/10"
          />

          <CubeCanvas />

          <Image
            src="/cybercops.png"
            alt="Cyber Cops Logo"
            width={200}
            height={200}
            className="rounded-xl shadow-2xl border border-white/10"
          />
        </div>

        <div className="max-w-5xl w-full space-y-12">

          <div className="text-center space-y-4">
            <div className="inline-block px-5 py-2 rounded-full text-sm font-medium bg-white/5 border border-white/10 backdrop-blur-xl shadow-md">
              Pixel Club × Amity University Punjab × Cyber Cops
            </div>

            <h1 className={`text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight 
                bg-gradient-to-r from-pink-400 to-purple-300 bg-clip-text text-transparent 
                drop-shadow-[0_0_14px_#ff3fa955]`}>
              Zero Trust & Beyond: AI-Powered Cyber Defense
            </h1>

            <p className="text-gray-300 text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed">
              Dive into the future of cybersecurity, AI-integrated Zero Trust models, 
              and next-gen cyber warfare defense strategies.
            </p>
          </div>

          <Card className="bg-white/5 border-white/10 backdrop-blur-xl shadow-2xl rounded-2xl">
            <CardContent className="grid md:grid-cols-2 gap-10 p-8">

              {/* LEFT */}
              <div className="space-y-10">

                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold text-pink-300">Event Details</h2>

                  <div className="space-y-3 text-gray-200">
                    <div className="flex items-center gap-3">
                      <CalendarIcon className="w-5 h-5 text-pink-400" />
                      <span>17th November</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <ClockIcon className="w-5 h-5 text-pink-400" />
                      <span>2:00 PM – 4:00 PM</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <LocateIcon className="w-5 h-5 text-pink-400" />
                      <span>Seminar Hall B1, Amity University Punjab</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold text-pink-300">Perks</h2>

                  <ul className="space-y-3 text-gray-200">
                    <li className="flex items-center gap-3">
                      <AwardIcon className="w-5 h-5 text-pink-400" />
                      <span>E-Certificates for all participants</span>
                    </li>

                    <li className="flex items-center gap-3">
                      <CodepenIcon className="w-5 h-5 text-pink-400" />
                      <span>Hands-on Cyber Labs & Practical Scenarios</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* RIGHT */}
              <div className="space-y-10">

                <div className="space-y-5">
                  <h2 className="text-2xl font-semibold text-pink-300">Main Speaker</h2>

                  <div
                    className="flex items-center gap-4 cursor-pointer"
                    onClick={() =>
                      setSelectedSpeaker({
                        name: "Dr. Victor Monga",
                        image: "/VICTOR.jpg",
                        fallback: "VM",
                        details: {
                          role: "CISO, Virtually Testing Foundation",
                          location: "Los Angeles, California",
                          expertise: [
                            "Zero Trust Architecture",
                            "Cyber Forensics",
                            "Threat Modeling",
                            "AI-driven Cyber Defense",
                          ],
                        },
                      })
                    }
                  >
                    <Avatar className="w-20 h-20 border border-pink-500/30 shadow-xl">
                      <AvatarImage src="/VICTOR.jpg" />
                      <AvatarFallback>VM</AvatarFallback>
                    </Avatar>

                    <div>
                      <h3 className="text-xl font-semibold">Dr. Victor Monga</h3>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        CISO, Virtually Testing Foundation  
                        Zero Trust, Cyber Forensics & Threat Modeling Expert
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-5">
                  <h2 className="text-2xl font-semibold text-pink-300">Guest Speaker</h2>

                  <div
                    className="flex items-center gap-4 cursor-pointer"
                    onClick={() =>
                      setSelectedSpeaker({
                        name: "Tarun Malhotra",
                        image: "/tarun.jpg",
                        fallback: "TM",
                        details: {
                          role: "Cyber Security Auditor & Consultant, CyberSplunk",
                          location: "Chandigarh, India",
                          expertise: [
                            "SOC2 Audit",
                            "HIPAA Compliance",
                            "ISMS 27001",
                            "Cyber Security Consulting",
                          ],
                        },
                      })
                    }
                  >
                    <Avatar className="w-20 h-20 border border-pink-500/30 shadow-xl">
                      <AvatarImage src="/tarun.jpg" />
                      <AvatarFallback>TM</AvatarFallback>
                    </Avatar>

                    <div>
                      <h3 className="text-xl font-semibold">Tarun Malhotra</h3>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        Cyber Security Auditor & Consultant, CyberSplunk
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-5">
                  <h2 className="text-2xl font-semibold text-pink-300">Guest Speaker</h2>

                  <div
                    className="flex items-center gap-4 cursor-pointer"
                    onClick={() =>
                      setSelectedSpeaker({
                        name: "Rohit Heera",
                        image: "/rohit.jpg",
                        fallback: "R",
                        details: {
                          role: "Digital Forensics Lab Manager, Punjab Police",
                          location: "Punjab, India",
                          expertise: [
                            "Digital Forensics",
                            "Cybercrime Investigation",
                            "Forensic Technology",
                          ],
                        },
                      })
                    }
                  >
                    <Avatar className="w-20 h-20 border border-pink-500/30 shadow-xl">
                      <AvatarImage src="/rohit.jpg" />
                      <AvatarFallback>R</AvatarFallback>
                    </Avatar>

                    <div>
                      <h3 className="text-xl font-semibold">Rohit Heera</h3>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        Digital Forensics • Cybercrime Investigation Expert
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col items-center gap-4 mt-6">
            <h2 className="text-2xl font-semibold text-pink-300">Recognized Certifications</h2>

            <div className="flex items-center gap-6 sm:gap-8">
              {[1, 2, 3, 4].map((_, i) => (
                <Link key={i} href="#" className="text-gray-400 hover:text-pink-300 transition">
                  <ShieldIcon className="w-10 h-10" />
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* MODAL */}
      <AnimatePresence>
        {selectedSpeaker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative max-w-4xl w-full bg-gray-900/50 border border-pink-500/30 rounded-2xl shadow-2xl p-8 text-gray-200"
            >
            <button
              onClick={() => setSelectedSpeaker(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center md:col-span-1">
                <Avatar className="w-40 h-40 border-2 border-pink-400 shadow-xl mb-4">
                  <AvatarImage src={selectedSpeaker.image} />
                  <AvatarFallback>{selectedSpeaker.fallback}</AvatarFallback>
                </Avatar>

                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-300">
                  {selectedSpeaker.name}
                </h2>
                <p className="text-gray-400">{selectedSpeaker.details.role}</p>
                <p className="text-sm text-gray-500 mt-2">
                  {selectedSpeaker.details.location}
                </p>
              </div>

              <div className="md:col-span-2 space-y-4">
                {Object.entries(selectedSpeaker.details).map(([key, value]) => {
                  if (!value || key === "role" || key === "location") return null

                  const formattedKey = key.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase())

                  return (
                    <div key={key}>
                      <h4 className="font-semibold text-pink-300 mb-1">{formattedKey}</h4>

                      {Array.isArray(value) ? (
                        <ul className="space-y-1">
                          {value.map((item, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                              <span className="text-gray-300">{item}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-300">{value}</p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Animation */}
      <style jsx>
        {`
          .animate-float {
            animation: float 4s ease-in-out infinite;
          }
          @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
          }
        `}
      </style>
    </div>
  )
}
