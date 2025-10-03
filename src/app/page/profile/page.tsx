"use client"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { getCurrentUser, logout } from "../../service/loginservice"
import type { User } from "firebase/auth"
import {
  User as UserIcon,
  Mail,
  Lock,
  Clock,
  MessageCircle,
  FileText,
  Star,
  Settings,
  History,
  BarChart3,
  Moon,
  Globe,
  Shield,
  CheckCircle,
  AlertCircle,
  Info
} from "lucide-react"

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [activeTab, setActiveTab] = useState<"profile" | "settings" | "history">("profile")
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      router.push("/page/login")
      return
    }
    setUser(currentUser)
    setIsLoading(false)
  }, [router])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logout()
      router.push("/")
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date)
  }

  const statsCards = [
    {
      id: "consultations",
      title: "Sesi Konsultasi",
      value: "0",
      icon: <MessageCircle className="w-6 h-6" />,
      color: "from-blue-500 to-cyan-500",
      bgColor: "from-blue-50 to-cyan-50",
      textColor: "text-blue-600"
    },
    {
      id: "articles",
      title: "Artikel Dibaca",
      value: "0",
      icon: <FileText className="w-6 h-6" />,
      color: "from-emerald-500 to-teal-500",
      bgColor: "from-emerald-50 to-teal-50",
      textColor: "text-emerald-600"
    },
    {
      id: "tests",
      title: "Tes Selesai",
      value: "0",
      icon: <Star className="w-6 h-6" />,
      color: "from-violet-500 to-purple-500",
      bgColor: "from-violet-50 to-purple-50",
      textColor: "text-violet-600"
    }
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#B3E5FC] via-[#FFF3E0] to-[#B3E5FC] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          className="w-12 h-12 border-4 border-[#1E498E]/30 border-t-[#1E498E] rounded-full"
        />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#B3E5FC] via-[#FFF3E0] to-[#B3E5FC] relative overflow-hidden">
      <motion.div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-[#1E498E]/10 to-transparent rounded-full blur-3xl"
        animate={{
          scale: [0.8, 1.2, 0.8],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 py-8 relative">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6, type: "spring" }}
            className="inline-block p-4 bg-white/60 backdrop-blur-lg rounded-3xl shadow-xl border border-white/50 mb-6"
          >
            <h1 className="text-5xl font-bold bg-gradient-to-r from-[#1E498E] to-[#2E5BBA] bg-clip-text text-transparent">
              Profil Saya
            </h1>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-[#1E498E]/70 text-lg"
          >
            Kelola informasi dan pengaturan akun Anda dengan mudah
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Enhanced Profile Header Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8, type: "spring" }}
            className="lg:col-span-4"
          >
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-white/60 shadow-2xl overflow-hidden hover:shadow-3xl transition-all duration-500">
              {/* Profile Header with Gradient */}
              <div className="bg-gradient-to-br from-[#1E498E] via-[#2E5BBA] to-[#3E6BCA] p-8 text-white relative">
                <div className="flex flex-col items-center text-center relative z-10">
                  <motion.div
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    className="relative mb-6"
                  >
                    <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border-4 border-white/30 shadow-xl">
                      {user.photoURL ? (
                        <Image
                          src={user.photoURL || "/placeholder.svg"}
                          alt="Profile"
                          width={120}
                          height={120}
                          className="w-28 h-28 rounded-full object-cover shadow-lg"
                        />
                      ) : (
                        <svg className="w-16 h-16 text-white/90" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                      )}
                    </div>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 1, type: "spring", stiffness: 500 }}
                      className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-400 rounded-full border-4 border-white flex items-center justify-center"
                    >
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    </motion.div>
                  </motion.div>

                  <div className="space-y-3">
                    <h2 className="text-2xl font-bold text-white">{user.displayName || "Pengguna"}</h2>
                    <p className="text-white/90 text-sm">{user.email}</p>

                    <div className="flex items-center justify-center gap-4 text-sm">
                      <motion.span
                        whileHover={{ scale: 1.05 }}
                        className="flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full backdrop-blur-sm"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                        </svg>
                        Terverifikasi
                      </motion.span>
                      <motion.span
                        whileHover={{ scale: 1.05 }}
                        className="flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full backdrop-blur-sm"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        Member Sejak {formatDate(new Date(user.metadata.creationTime!))}
                      </motion.span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-[#1E498E] mb-4 text-center">Ringkasan Aktivitas</h3>
                <div className="grid grid-cols-1 gap-3">
                  {statsCards.slice(0, 2).map((stat, index) => (
                    <motion.div
                      key={stat.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      className={`p-4 bg-gradient-to-r ${stat.bgColor} rounded-xl border border-gray-100 shadow-sm`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center text-white text-lg shadow-lg`}>
                          {stat.icon}
                        </div>
                        <div>
                          <div className={`text-xl font-bold ${stat.textColor}`}>{stat.value}</div>
                          <div className="text-xs text-gray-600">{stat.title}</div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
                    {/* Enhanced Logout Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="text-center mt-12"
        >
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-12 py-4 rounded-2xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-3 mx-auto text-lg"
          >
            {isLoggingOut ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full"
                />
                Keluar...
              </>
            ) : (
              <>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Keluar Akun
              </>
            )}
          </motion.button>
        </motion.div>
          </motion.div>

          {/* Main Content Area */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, x: 30 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.8, type: "spring" }}
            className="lg:col-span-8"
          >
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-white/60 shadow-2xl overflow-hidden">
              {/* Enhanced Tab Navigation */}
              <div className="border-b border-gray-200">
                <nav className="px-6 py-4">
                  <div className="flex space-x-8 mx-auto justify-center">
                    {[
                      { id: "profile", label: "Profil", icon: <UserIcon className="w-5 h-5" /> },
                      { id: "settings", label: "Pengaturan", icon: <Settings className="w-5 h-5" /> },
                      { id: "history", label: "Riwayat", icon: <History className="w-5 h-5" /> }
                    ].map((tab) => (
                      <motion.button
                        key={tab.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`relative px-4 py-3 text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                          activeTab === tab.id
                            ? "text-[#1E498E]"
                            : "text-gray-500 hover:text-[#1E498E]"
                        }`}
                      >
                        <span className="text-base">{tab.icon}</span>
                        {tab.label}
                        {activeTab === tab.id && (
                          <motion.div
                            layoutId="activeTab"
                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#1E498E] to-[#2E5BBA]"
                            initial={false}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          />
                        )}
                      </motion.button>
                    ))}
                  </div>
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-8">
                <AnimatePresence mode="wait">
                  {activeTab === "profile" && (
                    <motion.div
                      key="profile"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.5 }}
                      className="space-y-8"
                    >
                      <div className="text-center mb-8">
                        <h3 className="text-2xl font-bold text-[#1E498E] mb-2">Informasi Profil</h3>
                        <p className="text-gray-600">Kelola informasi pribadi Anda</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                          { label: "Nama Lengkap", value: user.displayName || "Belum diatur", icon: <UserIcon className="w-5 h-5" /> },
                          { label: "Email", value: user.email || "", icon: <Mail className="w-5 h-5" /> },
                          { label: "ID Pengguna", value: user.uid, icon: <Lock className="w-5 h-5" /> },
                          { label: "Terakhir Login", value: user.metadata.lastSignInTime ? formatDate(new Date(user.metadata.lastSignInTime)) : "Tidak tersedia", icon: <Clock className="w-5 h-5" /> }
                        ].map((item, index) => (
                          <motion.div
                            key={item.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                            whileHover={{ scale: 1.02, y: -2 }}
                            className="group"
                          >
                            <div className="p-6 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100 hover:border-[#1E498E]/30 hover:shadow-lg transition-all duration-300">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-8 h-8 bg-gradient-to-r from-[#1E498E] to-[#2E5BBA] rounded-lg flex items-center justify-center text-white">
                                  {item.icon}
                                </div>
                                <label className="font-semibold text-gray-700">{item.label}</label>
                              </div>
                              <div className="text-gray-900 font-medium pl-11">{item.value}</div>
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      {/* Enhanced Stats Cards */}
                      <div className="pt-8 border-t border-gray-200">
                        <h4 className="text-xl font-bold text-[#1E498E] mb-6 text-center">Statistik Aktivitas</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {statsCards.map((stat, index) => (
                            <motion.div
                              key={stat.id}
                              initial={{ opacity: 0, scale: 0.8, y: 20 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              transition={{ delay: 0.2 + index * 0.1, duration: 0.6, type: "spring" }}
                              whileHover={{
                                scale: 1.05,
                                y: -8,
                                transition: { duration: 0.2 }
                              }}
                              onHoverStart={() => setHoveredCard(stat.id)}
                              onHoverEnd={() => setHoveredCard(null)}
                              className={`relative p-6 bg-gradient-to-br ${stat.bgColor} rounded-2xl border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden`}
                            >
                              <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-0 hover:opacity-10 transition-opacity duration-300`}></div>

                              <div className="relative z-10">
                                <motion.div
                                  animate={{
                                    rotate: hoveredCard === stat.id ? [0, -10, 10, 0] : 0,
                                    scale: hoveredCard === stat.id ? 1.1 : 1
                                  }}
                                  className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center text-white text-xl shadow-lg mb-4`}
                                >
                                  {stat.icon}
                                </motion.div>

                                <motion.div
                                  animate={{
                                    scale: hoveredCard === stat.id ? 1.1 : 1
                                  }}
                                  className={`text-3xl font-bold ${stat.textColor} mb-1`}
                                >
                                  {stat.value}
                                </motion.div>
                                <div className="text-sm text-gray-600 font-medium">{stat.title}</div>
                              </div>

                              {hoveredCard === stat.id && (
                                <motion.div
                                  initial={{ scale: 0, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  className="absolute top-2 right-2 w-6 h-6 bg-white/80 rounded-full flex items-center justify-center"
                                >
                                  <Star className="w-3 h-3 text-[#1E498E]" />
                                </motion.div>
                              )}
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === "settings" && (
                    <motion.div
                      key="settings"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.5 }}
                      className="space-y-6"
                    >
                      <div className="text-center mb-8">
                        <h3 className="text-2xl font-bold text-[#1E498E] mb-2">Pengaturan Akun</h3>
                        <p className="text-gray-600">Sesuaikan pengalaman aplikasi Anda</p>
                      </div>

                      <div className="space-y-4">
                        {[
                          {
                            title: "Notifikasi Email",
                            description: "Terima notifikasi melalui email",
                            icon: <Mail className="w-6 h-6" />,
                            type: "toggle"
                          },
                          {
                            title: "Mode Gelap",
                            description: "Gunakan tema gelap untuk tampilan yang nyaman",
                            icon: <Moon className="w-6 h-6" />,
                            type: "toggle"
                          },
                          {
                            title: "Bahasa",
                            description: "Pilih bahasa antarmuka",
                            icon: <Globe className="w-6 h-6" />,
                            type: "select"
                          }
                        ].map((setting, index) => (
                          <motion.div
                            key={setting.title}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                            whileHover={{ scale: 1.02, x: 8 }}
                            className="p-6 bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-100 hover:border-[#1E498E]/30 hover:shadow-lg transition-all duration-300"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gradient-to-r from-[#1E498E] to-[#2E5BBA] rounded-xl flex items-center justify-center text-white text-lg shadow-lg">
                                  {setting.icon}
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-900">{setting.title}</h4>
                                  <p className="text-sm text-gray-600">{setting.description}</p>
                                </div>
                              </div>

                              <div className="flex items-center">
                                {setting.type === "toggle" && (
                                  <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-[#1E498E] focus:ring-offset-2"
                                  >
                                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1"></span>
                                  </motion.button>
                                )}
                                {setting.type === "select" && (
                                  <motion.select
                                    whileHover={{ scale: 1.05 }}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E498E] focus:border-[#1E498E] bg-white"
                                  >
                                    <option value="id">Bahasa Indonesia</option>
                                    <option value="en">English</option>
                                  </motion.select>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      <div className="pt-6 border-t border-gray-200">
                        <h4 className="text-lg font-semibold text-[#1E498E] mb-4">Keamanan</h4>
                        <div className="space-y-3">
                          {[
                            { title: "Ubah Password", description: "Perbarui kata sandi Anda", icon: <Shield className="w-5 h-5" /> },
                            { title: "Verifikasi Email", description: "Konfirmasi alamat email Anda", icon: <Mail className="w-5 h-5" /> }
                          ].map((security, index) => (
                            <motion.button
                              key={security.title}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1, duration: 0.5 }}
                              whileHover={{ scale: 1.02, x: 4 }}
                              whileTap={{ scale: 0.98 }}
                              className="w-full text-left p-5 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:border-red-200 hover:shadow-lg transition-all duration-300 group"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-red-400 to-red-500 rounded-lg flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                                  {security.icon}
                                </div>
                                <div>
                                  <div className="font-semibold text-gray-900">{security.title}</div>
                                  <div className="text-sm text-gray-600">{security.description}</div>
                                </div>
                                <div className="ml-auto">
                                  <svg className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                  </svg>
                                </div>
                              </div>
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === "history" && (
                    <motion.div
                      key="history"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.5 }}
                      className="space-y-6"
                    >
                      <div className="text-center mb-8">
                        <h3 className="text-2xl font-bold text-[#1E498E] mb-2">Riwayat Aktivitas</h3>
                        <p className="text-gray-600">Lihat jejak perjalanan kesehatan mental Anda</p>
                      </div>

                      <div className="space-y-4">
                        {[
                          {
                            title: "Akun Dibuat",
                            date: formatDate(new Date(user.metadata.creationTime!)),
                            status: "success",
                            icon: <CheckCircle className="w-6 h-6" />
                          },
                          {
                            title: "Login Terakhir",
                            date: user.metadata.lastSignInTime ? formatDate(new Date(user.metadata.lastSignInTime)) : "Tidak tersedia",
                            status: "info",
                            icon: <Info className="w-6 h-6" />
                          },
                          {
                            title: "Konsultasi Pertama",
                            date: "Belum ada konsultasi",
                            status: "pending",
                            icon: <MessageCircle className="w-6 h-6" />
                          }
                        ].map((activity, index) => (
                          <motion.div
                            key={activity.title}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                            whileHover={{ scale: 1.02, x: 4 }}
                            className={`p-6 rounded-2xl border transition-all duration-300 ${
                              activity.status === "success"
                                ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200"
                                : activity.status === "info"
                                ? "bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200"
                                : "bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-lg ${
                                  activity.status === "success"
                                    ? "bg-gradient-to-r from-green-400 to-emerald-500"
                                    : activity.status === "info"
                                    ? "bg-gradient-to-r from-blue-400 to-cyan-500"
                                    : "bg-gradient-to-r from-gray-400 to-gray-500"
                                }`}>
                                  {activity.icon}
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-900">{activity.title}</h4>
                                  <p className="text-sm text-gray-600">{activity.date}</p>
                                </div>
                              </div>
                              <div className={`w-3 h-3 rounded-full ${
                                activity.status === "success"
                                  ? "bg-green-400"
                                  : activity.status === "info"
                                  ? "bg-blue-400"
                                  : "bg-gray-400"
                              }`}></div>
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      <div className="pt-6 border-t border-gray-200">
                        <h4 className="text-lg font-semibold text-[#1E498E] mb-4 text-center">Grafik Aktivitas</h4>
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.3, duration: 0.6 }}
                          className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-12 text-center border border-gray-200"
                        >
                          <motion.div
                            animate={{
                              y: [0, -10, 0],
                            }}
                            className="w-20 h-20 bg-gradient-to-r from-[#1E498E] to-[#2E5BBA] rounded-full flex items-center justify-center text-white text-2xl shadow-xl mx-auto mb-6"
                          >
                            <BarChart3 className="w-10 h-10" />
                          </motion.div>
                          <h5 className="text-lg font-semibold text-gray-700 mb-2">Belum ada data aktivitas</h5>
                          <p className="text-sm text-gray-500 mb-4">Mulai gunakan layanan untuk melihat grafik aktivitas Anda</p>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-6 py-3 bg-gradient-to-r from-[#1E498E] to-[#2E5BBA] text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                          >
                            Mulai Jelajahi
                          </motion.button>
                        </motion.div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>


      </div>
    </div>
  )
}
