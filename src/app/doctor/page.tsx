"use client"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Loader, 
  Users, 
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Activity,
  TrendingUp,
  FileText,
  AlertCircle,
  ChevronRight,
  Search,
  Filter,
  Download
} from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { db, auth } from "@/app/service/firebase"
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore"
import { onAuthStateChanged, User } from "firebase/auth"
import Navbar from "../component/navbar"

interface Appointment {
  orderId: string
  userName: string
  userEmail: string
  selectedDate: string
  selectedTimes: string[]
  amount: number
  status: string
  createdAt: Date
}

interface DoctorData {
  isDoctor: boolean
  name: string
  email: string
  specialty?: string
}

export default function DoctorDashboard() {
  const router = useRouter()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [doctorData, setDoctorData] = useState<DoctorData | null>(null)
  const [checking, setChecking] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)

  useEffect(() => {
    // Wait for auth state to be ready
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('Auth state changed:', user ? 'User logged in' : 'No user')
      if (user) {
        checkDoctorAccess(user)
      } else {
        console.log('No user logged in, redirecting to /login')
        router.push('/login')
        setChecking(false)
      }
    })

    // Cleanup subscription
    return () => unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const checkDoctorAccess = async (user: User) => {
    try {
      console.log('Checking doctor access for user:', user.uid)

      console.log('Fetching user document for UID:', user.uid)

      // Get user data from Firestore
      const userDocRef = doc(db, 'users', user.uid)
      const userDoc = await getDoc(userDocRef)

      console.log('User document exists:', userDoc.exists())

      if (!userDoc.exists()) {
        console.log('User document does not exist in Firestore')
        alert('Data user tidak ditemukan. Silakan logout dan login kembali.')
        router.push('/')
        return
      }

      const userData = userDoc.data()
      console.log('User data from Firestore:', userData)

      // Check if user is a doctor - handle both boolean and string values
      const isDoctorValue = userData?.isDoctor
      console.log('isDoctor value:', isDoctorValue, 'type:', typeof isDoctorValue)

      const isDoctor = isDoctorValue === true || isDoctorValue === 'true'

      if (!isDoctor) {
        console.log('User is not a doctor, access denied')
        alert('Akses ditolak! Halaman ini hanya untuk dokter.')
        router.push('/')
        return
      }

      console.log('User is a doctor, granting access')

      setDoctorData({
        isDoctor: true,
        name: userData.displayName || user.displayName || 'Unknown Doctor',
        email: userData.email || user.email || '',
        specialty: userData.specialty || undefined
      })

      const doctorName = userData.displayName || user.displayName || 'Unknown Doctor'
      console.log('Fetching appointments for doctor:', doctorName)
      
      await fetchAppointments(user.uid, doctorName)
    } catch (error) {
      console.error('Error checking doctor access:', error)
      alert('Terjadi kesalahan saat memeriksa akses: ' + (error instanceof Error ? error.message : 'Unknown error'))
      router.push('/')
    } finally {
      setChecking(false)
    }
  }

  const fetchAppointments = async (doctorId: string, doctorName: string) => {
    try {
      setLoading(true)
      
      // Query appointments by doctorId or doctorName
      const paymentsRef = collection(db, 'payments')
      
      // Try to find by doctorName first (since we're storing doctorName in konsultasi)
      const q = query(
        paymentsRef,
        where('doctorName', '==', doctorName)
      )

      const querySnapshot = await getDocs(q)
      const appointmentsData: Appointment[] = []

      console.log('Found appointments:', querySnapshot.size)

      querySnapshot.forEach((doc) => {
        const data = doc.data()
        console.log('Appointment data:', data)

        let createdAtDate = new Date()
        if (data.createdAt) {
          if (typeof data.createdAt.toDate === 'function') {
            createdAtDate = data.createdAt.toDate()
          } else if (data.createdAt instanceof Date) {
            createdAtDate = data.createdAt
          }
        }

        appointmentsData.push({
          orderId: data.orderId || doc.id,
          userName: data.userName || 'Unknown',
          userEmail: data.userEmail || '',
          selectedDate: data.selectedDate || new Date().toISOString(),
          selectedTimes: data.selectedTimes || [],
          amount: data.amount || 0,
          status: data.status || 'pending',
          createdAt: createdAtDate,
        })
      })

      // Sort by date (newest first)
      appointmentsData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

      setAppointments(appointmentsData)
    } catch (error) {
      console.error('Error fetching appointments:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"]
    const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"]
    
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'paid':
        return {
          label: 'Dikonfirmasi',
          color: 'bg-green-100 text-green-700',
          icon: <CheckCircle className="w-4 h-4" />
        }
      case 'pending':
        return {
          label: 'Menunggu',
          color: 'bg-yellow-100 text-yellow-700',
          icon: <Loader className="w-4 h-4 animate-spin" />
        }
      case 'failed':
        return {
          label: 'Dibatalkan',
          color: 'bg-red-100 text-red-700',
          icon: <XCircle className="w-4 h-4" />
        }
      default:
        return {
          label: 'Unknown',
          color: 'bg-gray-100 text-gray-700',
          icon: <Clock className="w-4 h-4" />
        }
    }
  }

  const stats = {
    total: appointments.length,
    confirmed: appointments.filter(a => a.status === 'paid').length,
    pending: appointments.filter(a => a.status === 'pending').length,
    cancelled: appointments.filter(a => a.status === 'failed').length,
  }

  // Filter appointments based on search and status
  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = 
      appointment.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.orderId.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterStatus === "all" || appointment.status === filterStatus
    
    return matchesSearch && matchesFilter
  })

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#B3E5FC] via-[#FFF3E0] to-[#B3E5FC] relative overflow-hidden">
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
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4 relative z-10"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            className="w-16 h-16 border-4 border-[#1E498E]/30 border-t-[#1E498E] rounded-full"
          />
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-[#1E498E] text-lg font-semibold"
          >
            Memeriksa akses...
          </motion.p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#B3E5FC] via-[#FFF3E0] to-[#B3E5FC] relative overflow-hidden">
      {/* Background Animation */}
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
      
      <Navbar />

      <div className="container mx-auto px-4 py-8 pt-24 max-w-7xl relative z-10">
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
              Dashboard Dokter
            </h1>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-[#1E498E]/70 text-lg"
          >
            Selamat datang, <span className="font-semibold text-[#1E498E]">{doctorData?.name}</span>
          </motion.p>
          {doctorData?.specialty && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="text-[#1E498E]/60 mt-2 flex items-center justify-center gap-2"
            >
              <Activity className="w-4 h-4" />
              Spesialisasi: {doctorData.specialty}
            </motion.p>
          )}
        </motion.div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              id: 'total',
              label: 'Total Janji Temu',
              value: stats.total,
              icon: <Calendar className="w-6 h-6" />,
              color: 'from-[#1E498E] to-[#2E5BBA]',
              bgColor: 'from-blue-50 to-cyan-50',
              textColor: 'text-[#1E498E]'
            },
            {
              id: 'confirmed',
              label: 'Dikonfirmasi',
              value: stats.confirmed,
              icon: <CheckCircle className="w-6 h-6" />,
              color: 'from-green-500 to-emerald-500',
              bgColor: 'from-green-50 to-emerald-50',
              textColor: 'text-green-700'
            },
            {
              id: 'pending',
              label: 'Menunggu',
              value: stats.pending,
              icon: <Clock className="w-6 h-6" />,
              color: 'from-yellow-500 to-amber-500',
              bgColor: 'from-yellow-50 to-amber-50',
              textColor: 'text-yellow-700'
            },
            {
              id: 'cancelled',
              label: 'Dibatalkan',
              value: stats.cancelled,
              icon: <XCircle className="w-6 h-6" />,
              color: 'from-red-500 to-rose-500',
              bgColor: 'from-red-50 to-rose-50',
              textColor: 'text-red-700'
            }
          ].map((stat, index) => (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ 
                type: "spring",
                stiffness: 100 
              }}
              onHoverStart={() => setHoveredCard(stat.id)}
              onHoverEnd={() => setHoveredCard(null)}
              className={`relative bg-gradient-to-br ${stat.bgColor} rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/60 overflow-hidden`}
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-0 hover:opacity-10 transition-opacity duration-300`}></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <motion.div
                    className={`w-14 h-14 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center text-white shadow-lg`}
                  >
                    {stat.icon}
                  </motion.div>
                  {hoveredCard === stat.id && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="w-6 h-6 bg-white/80 rounded-full flex items-center justify-center"
                    >
                      <TrendingUp className="w-3 h-3 text-[#1E498E]" />
                    </motion.div>
                  )}
                </div>
                <motion.p
                  className={`text-4xl font-bold ${stat.textColor} mb-2`}
                >
                  {stat.value}
                </motion.p>
                <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Enhanced Appointments List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8, type: "spring" }}
          className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/60"
        >
          {/* Header with Gradient */}
          <div className="bg-gradient-to-r from-[#1E498E] via-[#2E5BBA] to-[#3B82F6] p-6 text-white relative overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-white/10"
              animate={{
                x: [-1000, 1000],
              }}
              transition={{
                duration: 3,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
              }}
            />
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-3">
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                  className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm"
                >
                  <Users className="w-7 h-7" />
                </motion.div>
                <div>
                  <h2 className="text-2xl font-bold">Daftar Janji Temu</h2>
                  <p className="text-sm opacity-90">Kelola jadwal konsultasi pasien Anda</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-xl flex items-center gap-2 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span className="text-sm font-medium">Export</span>
              </motion.button>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="p-6 bg-gradient-to-r from-gray-50 to-blue-50/30 border-b border-gray-200">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari berdasarkan nama, email, atau order ID..."
                  className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E498E]/30 focus:border-[#1E498E] transition-all"
                />
              </div>

              {/* Filter Dropdown */}
              <div className="relative">
                <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="pl-12 pr-10 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E498E]/30 focus:border-[#1E498E] appearance-none cursor-pointer transition-all min-w-[180px]"
                >
                  <option value="all">Semua Status</option>
                  <option value="paid">Dikonfirmasi</option>
                  <option value="pending">Menunggu</option>
                  <option value="failed">Dibatalkan</option>
                </select>
              </div>
            </div>
            
            {/* Results Counter */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex items-center gap-2 text-sm text-gray-600"
            >
              <FileText className="w-4 h-4" />
              <span>
                Menampilkan <span className="font-bold text-[#1E498E]">{filteredAppointments.length}</span> dari{" "}
                <span className="font-bold text-[#1E498E]">{appointments.length}</span> janji temu
              </span>
            </motion.div>
          </div>

          {/* Content Area */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center py-12"
                >
                  <div className="flex flex-col items-center gap-4">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                      className="w-12 h-12 border-4 border-[#1E498E]/30 border-t-[#1E498E] rounded-full"
                    />
                    <p className="text-[#1E498E]/70 font-medium">Memuat data...</p>
                  </div>
                </motion.div>
              ) : filteredAppointments.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex flex-col items-center justify-center py-16 text-center"
                >
                  <motion.div
                    animate={{
                      y: [0, -10, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    }}
                    className="w-24 h-24 bg-gradient-to-br from-[#1E498E]/10 to-blue-100 rounded-full flex items-center justify-center mb-6"
                  >
                    <AlertCircle className="w-12 h-12 text-[#1E498E]/50" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-[#1E498E] mb-2">
                    {searchTerm || filterStatus !== 'all' ? 'Tidak Ada Hasil' : 'Belum Ada Janji Temu'}
                  </h3>
                  <p className="text-[#1E498E]/70 max-w-md">
                    {searchTerm || filterStatus !== 'all' 
                      ? 'Coba ubah kriteria pencarian atau filter Anda'
                      : 'Anda belum memiliki jadwal konsultasi'}
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="list"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  {filteredAppointments.map((appointment, index) => {
                    const statusConfig = getStatusConfig(appointment.status)
                    return (
                      <motion.div
                        key={appointment.orderId}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.01, x: 4 }}
                        className="bg-gradient-to-br from-[#FFF3E0]/30 to-[#B3E5FC]/30 rounded-2xl p-6 border border-[#1E498E]/10 hover:shadow-xl hover:border-[#1E498E]/20 transition-all duration-300"
                      >
                        {/* Patient Info */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <motion.div
                              whileHover={{ scale: 1.1, rotate: 5 }}
                              className="w-14 h-14 bg-gradient-to-br from-[#1E498E] to-[#2E5BBA] rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg"
                            >
                              {appointment.userName.charAt(0).toUpperCase()}
                            </motion.div>
                            <div>
                              <h3 className="font-bold text-[#1E498E] text-lg flex items-center gap-2">
                                {appointment.userName}
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ delay: 0.2 }}
                                >
                                  <UserIcon className="w-4 h-4 text-[#1E498E]/50" />
                                </motion.div>
                              </h3>
                              <p className="text-sm text-[#1E498E]/70 flex items-center gap-2 mt-1">
                                <Mail className="w-3 h-3" />
                                {appointment.userEmail}
                              </p>
                              <p className="text-xs text-[#1E498E]/50 mt-1 flex items-center gap-2">
                                <FileText className="w-3 h-3" />
                                Order: {appointment.orderId}
                              </p>
                            </div>
                          </div>
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full ${statusConfig.color} font-semibold text-sm shadow-md`}
                          >
                            {statusConfig.icon}
                            {statusConfig.label}
                          </motion.div>
                        </div>

                        {/* Appointment Details */}
                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                          <motion.div
                            whileHover={{ x: 4 }}
                            className="flex items-center gap-3 text-[#1E498E] bg-white/60 p-3 rounded-xl"
                          >
                            <div className="w-10 h-10 bg-[#1E498E]/10 rounded-lg flex items-center justify-center">
                              <Calendar className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-xs text-[#1E498E]/60 font-medium">Tanggal</p>
                              <p className="font-semibold">{formatDate(appointment.selectedDate)}</p>
                            </div>
                          </motion.div>

                          <motion.div
                            whileHover={{ x: 4 }}
                            className="flex items-start gap-3 text-[#1E498E] bg-white/60 p-3 rounded-xl"
                          >
                            <div className="w-10 h-10 bg-[#1E498E]/10 rounded-lg flex items-center justify-center">
                              <Clock className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                              <p className="text-xs text-[#1E498E]/60 font-medium mb-2">Waktu</p>
                              <div className="flex flex-wrap gap-2">
                                {appointment.selectedTimes.map((time, idx) => (
                                  <motion.span
                                    key={idx}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: idx * 0.1 }}
                                    whileHover={{ scale: 1.05 }}
                                    className="bg-white px-3 py-1 rounded-full text-sm font-medium shadow-sm"
                                  >
                                    {time}
                                  </motion.span>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        </div>

                        {/* Payment Info */}
                        <div className="flex items-center justify-between pt-4 border-t border-[#1E498E]/10">
                          <div className="flex items-center gap-2 text-[#1E498E]/70 text-sm">
                            <Activity className="w-4 h-4" />
                            <span className="font-medium">Total Pembayaran</span>
                          </div>
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="flex items-center gap-2"
                          >
                            <span className="text-[#1E498E] font-bold text-xl">
                              Rp {appointment.amount.toLocaleString('id-ID')}
                            </span>
                            <ChevronRight className="w-5 h-5 text-[#1E498E]/50" />
                          </motion.div>
                        </div>
                      </motion.div>
                    )
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
