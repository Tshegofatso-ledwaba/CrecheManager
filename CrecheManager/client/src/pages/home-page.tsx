import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ChevronRight, Users, BookOpen, Calendar, MessageSquare } from "lucide-react";

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.2,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <header className={`
        fixed w-full z-50 transition-all duration-300
        ${scrolled ? "bg-white shadow-md py-2" : "bg-transparent py-4"}
      `}>
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-700">
              <BookOpen className="text-white h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-700">
              Little Stars Creche
            </h1>
          </div>
          <nav className="hidden md:flex space-x-6">
            <a href="#about" className="font-medium text-gray-600 hover:text-primary transition-colors">About</a>
            <a href="#services" className="font-medium text-gray-600 hover:text-primary transition-colors">Services</a>
            <a href="#testimonials" className="font-medium text-gray-600 hover:text-primary transition-colors">Testimonials</a>
            <a href="#contact" className="font-medium text-gray-600 hover:text-primary transition-colors">Contact</a>
          </nav>
          <div className="flex space-x-4">
            <Link href="/auth">
              <Button variant="outline">Login</Button>
            </Link>
            <Link href="/auth">
              <Button>Register</Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="min-h-screen flex items-center bg-gradient-to-br from-blue-50 to-purple-50 pt-16">
          <div className="container mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center">
            <motion.div 
              className="md:w-1/2 mb-12 md:mb-0"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
            >
              <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
                Quality Childcare in{" "}
                <motion.span 
                  className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-700"
                  initial={{ opacity: 0, scale: 0.8, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ 
                    duration: 0.8, 
                    delay: 0.8,
                    type: "spring",
                    stiffness: 100
                  }}
                  whileHover={{ 
                    scale: 1.05, 
                    filter: "drop-shadow(0px 0px 8px rgba(139, 92, 246, 0.4))"
                  }}
                >
                  Pretoria North
                </motion.span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Nurturing young minds in a safe, loving environment. We provide the best care for your little stars in South Africa.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 500 }}
                  >
                    <Button size="lg" className="group relative overflow-hidden">
                      <motion.span 
                        className="absolute inset-0 bg-gradient-to-r from-primary-700 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 0.15 }}
                      />
                      Enroll Today
                      <motion.div
                        animate={{ x: [0, 5, 0] }}
                        transition={{ repeat: Infinity, repeatDelay: 2, duration: 0.6 }}
                      >
                        <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </motion.div>
                    </Button>
                  </motion.div>
                </Link>
                <a href="#contact">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <Button size="lg" variant="outline" className="group relative overflow-hidden">
                      <motion.span 
                        className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 0.5 }}
                      />
                      <span className="relative z-10 group-hover:text-primary transition-colors">Contact Us</span>
                    </Button>
                  </motion.div>
                </a>
              </div>
            </motion.div>
            <motion.div 
              className="md:w-1/2"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <div className="relative">
                <div className="absolute -top-6 -left-6 w-24 h-24 bg-primary/10 rounded-full" />
                <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-primary/10 rounded-full" />
                <img 
                  src="/images/children-playing.svg"
                  alt="Happy children playing" 
                  className="rounded-xl shadow-2xl relative z-10 w-full"
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section id="about" className="py-20 bg-white">
          <div className="container mx-auto px-4 md:px-8">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Our Creche?</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                At Little Stars, we believe every child deserves the best start in life. 
                Located in the heart of{" "}
                <motion.span
                  className="font-medium inline-block"
                  initial={{ opacity: 0, y: 5 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  whileHover={{ 
                    color: "#8b5cf6", 
                    scale: 1.03,
                    filter: "drop-shadow(0px 0px 2px rgba(139, 92, 246, 0.3))"
                  }}
                >
                  Pretoria North
                </motion.span>, we provide exceptional care with a focus on education and fun.
              </p>
            </motion.div>

            <motion.div 
              className="grid md:grid-cols-3 gap-8"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <motion.div variants={itemVariants} className="bg-blue-50 p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-primary-100 w-14 h-14 rounded-full flex items-center justify-center mb-6">
                  <Users className="text-primary h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold mb-4">Qualified Staff</h3>
                <p className="text-gray-600">
                  Our team consists of experienced, qualified childcare professionals who are passionate about early childhood development.
                </p>
              </motion.div>

              <motion.div variants={itemVariants} className="bg-purple-50 p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-primary-100 w-14 h-14 rounded-full flex items-center justify-center mb-6">
                  <BookOpen className="text-primary h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold mb-4">Educational Curriculum</h3>
                <p className="text-gray-600">
                  We follow a structured learning approach incorporating South African educational standards and play-based learning.
                </p>
              </motion.div>

              <motion.div variants={itemVariants} className="bg-green-50 p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-primary-100 w-14 h-14 rounded-full flex items-center justify-center mb-6">
                  <Calendar className="text-primary h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold mb-4">Flexible Schedules</h3>
                <p className="text-gray-600">
                  We offer flexible hours to accommodate working parents, with options for full-day and half-day programs.
                </p>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="py-20 bg-gray-50">
          <div className="container mx-auto px-4 md:px-8">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Services</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                We provide comprehensive childcare services designed to nurture your child's development in all areas.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              <motion.div 
                className="bg-white p-8 rounded-xl shadow-sm"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <h3 className="text-2xl font-bold mb-4">Age Groups</h3>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <div className="bg-primary-100 p-1 rounded-full mr-3 mt-1">
                      <ChevronRight className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">Infants (3-12 months)</h4>
                      <p className="text-gray-600">Nurturing care in a stimulating environment. Monthly fee: R2,500</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-primary-100 p-1 rounded-full mr-3 mt-1">
                      <ChevronRight className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">Toddlers (1-2 years)</h4>
                      <p className="text-gray-600">Discovery and early learning activities. Monthly fee: R2,250</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-primary-100 p-1 rounded-full mr-3 mt-1">
                      <ChevronRight className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">Preschool (2-4 years)</h4>
                      <p className="text-gray-600">Structured learning and social skills development. Monthly fee: R2,000</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-primary-100 p-1 rounded-full mr-3 mt-1">
                      <ChevronRight className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">Kindergarten (4-5 years)</h4>
                      <p className="text-gray-600">School readiness and comprehensive development. Monthly fee: R1,750</p>
                    </div>
                  </li>
                </ul>
              </motion.div>

              <motion.div 
                className="bg-white p-8 rounded-xl shadow-sm"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <h3 className="text-2xl font-bold mb-4">Programs</h3>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <div className="bg-primary-100 p-1 rounded-full mr-3 mt-1">
                      <ChevronRight className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">Early Learning</h4>
                      <p className="text-gray-600">Age-appropriate activities focusing on cognitive and motor skills development.</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-primary-100 p-1 rounded-full mr-3 mt-1">
                      <ChevronRight className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">Creative Arts</h4>
                      <p className="text-gray-600">Music, dance, and visual arts to foster creativity and self-expression.</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-primary-100 p-1 rounded-full mr-3 mt-1">
                      <ChevronRight className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">Outdoor Play</h4>
                      <p className="text-gray-600">Safe, supervised outdoor activities to promote physical development.</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-primary-100 p-1 rounded-full mr-3 mt-1">
                      <ChevronRight className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">Language Development</h4>
                      <p className="text-gray-600">Activities to enhance communication skills in both English and local languages.</p>
                    </div>
                  </li>
                </ul>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-20 bg-white">
          <div className="container mx-auto px-4 md:px-8">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">What Parents Say</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Hear from parents who have entrusted us with their children's care and education.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              <motion.div 
                className="bg-blue-50 p-8 rounded-xl shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold mr-4">L</div>
                  <div>
                    <h4 className="font-bold">Lebo Molefe</h4>
                    <p className="text-gray-600 text-sm">Johannesburg</p>
                  </div>
                </div>
                <p className="text-gray-600 italic">
                  "Little Stars has been a blessing for our family. The teachers are caring and attentive, and my son has thrived in their care. I appreciate the regular updates and the focus on learning through play."
                </p>
              </motion.div>

              <motion.div 
                className="bg-purple-50 p-8 rounded-xl shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold mr-4">S</div>
                  <div>
                    <h4 className="font-bold">Sarah van der Merwe</h4>
                    <p className="text-gray-600 text-sm">Pretoria North</p>
                  </div>
                </div>
                <p className="text-gray-600 italic">
                  "The staff at Little Stars go above and beyond. My daughter has made so much progress since enrolling. The facilities are clean, safe, and well-maintained. It's worth every rand!"
                </p>
              </motion.div>

              <motion.div 
                className="bg-green-50 p-8 rounded-xl shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold mr-4">T</div>
                  <div>
                    <h4 className="font-bold">Thabo Nkosi</h4>
                    <p className="text-gray-600 text-sm">Durban</p>
                  </div>
                </div>
                <p className="text-gray-600 italic">
                  "As a working parent, I need reliable childcare, and Little Stars has never let me down. The flexible hours accommodate my schedule, and the online portal keeps me connected to my child's activities throughout the day."
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-20 bg-gradient-to-br from-primary-50 to-blue-50">
          <div className="container mx-auto px-4 md:px-8">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Contact Us</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Have questions or ready to enroll? Reach out to us today.
              </p>
            </motion.div>

            <div className="flex flex-col md:flex-row bg-white rounded-xl shadow-sm overflow-hidden">
              <motion.div 
                className="md:w-1/2 p-8"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <h3 className="text-2xl font-bold mb-6">Get in Touch</h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="bg-primary-100 p-2 rounded-full mr-4">
                      <MessageSquare className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">Email</h4>
                      <p className="text-gray-600">info@littlestars.co.za</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-primary-100 p-2 rounded-full mr-4">
                      <MessageSquare className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">Phone</h4>
                      <p className="text-gray-600">+27 12 555 1234</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-primary-100 p-2 rounded-full mr-4">
                      <MessageSquare className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">Address</h4>
                      <p className="text-gray-600">291 General Beyers Street, Pretoria North, 0182</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-primary-100 p-2 rounded-full mr-4">
                      <MessageSquare className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">Hours</h4>
                      <p className="text-gray-600">Monday - Friday: 7:00 AM - 6:00 PM</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                className="md:w-1/2 bg-gray-50 p-8"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <h3 className="text-2xl font-bold mb-6">Send a Message</h3>
                <form className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <input
                        type="text"
                        id="name"
                        className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        id="email"
                        className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                    <input
                      type="text"
                      id="subject"
                      className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                    <textarea
                      id="message"
                      rows={4}
                      className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    ></textarea>
                  </div>
                  <Button size="lg" className="w-full">
                    Send Message
                  </Button>
                </form>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary">
                  <BookOpen className="text-white h-5 w-5" />
                </div>
                <h2 className="text-xl font-bold">Little Stars Creche</h2>
              </div>
              <p className="text-gray-400">
                Providing quality childcare in Pretoria North since 2010. 
                Registered with the Department of Social Development.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="#about" className="text-gray-400 hover:text-white transition-colors">About Us</a></li>
                <li><a href="#services" className="text-gray-400 hover:text-white transition-colors">Services</a></li>
                <li><a href="#testimonials" className="text-gray-400 hover:text-white transition-colors">Testimonials</a></li>
                <li><a href="#contact" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4">Programs</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Infant Care</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Toddler Program</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Preschool</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Kindergarten</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4">Contact</h3>
              <ul className="space-y-2 text-gray-400">
                <li>291 General Beyers Street</li>
                <li>Pretoria North, 0182</li>
                <li>South Africa</li>
                <li>info@littlestars.co.za</li>
                <li>+27 12 555 1234</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Little Stars Creche. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}