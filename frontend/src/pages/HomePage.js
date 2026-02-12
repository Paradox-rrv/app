import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle, Shield, Zap, Phone, MapPin } from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();

  const features = [
    { icon: <Zap className="w-6 h-6" />, title: "Instant Pricing", desc: "Get accurate price in 60 seconds" },
    { icon: <Shield className="w-6 h-6" />, title: "Trusted & Safe", desc: "Verified store with local presence" },
    { icon: <CheckCircle className="w-6 h-6" />, title: "Free Pickup", desc: "We come to you, anywhere in Patna" },
    { icon: <Phone className="w-6 h-6" />, title: "Instant Payment", desc: "Get paid immediately after verification" },
  ];

  const howItWorks = [
    { step: "1", title: "Choose Your Phone", desc: "Select brand and model" },
    { step: "2", title: "Answer Questions", desc: "Tell us about phone condition" },
    { step: "3", title: "Get Instant Price", desc: "See your offer in seconds" },
    { step: "4", title: "Schedule Pickup", desc: "We come to you with payment" },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Hero Section */}
      <section className="hero-gradient relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
                Sell Your Old Phone <span className="text-gradient">Instantly</span> in Patna
              </h1>
              <p className="text-base md:text-lg text-gray-400 mb-8 leading-relaxed">
                Get the best price for your used smartphone in 60 seconds. Free pickup, instant cash, trusted by thousands.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  data-testid="hero-check-price-btn"
                  className="btn-primary flex items-center justify-center gap-2"
                  onClick={() => navigate('/sell')}
                >
                  Check Price Now
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  data-testid="hero-buy-phones-btn"
                  className="btn-secondary flex items-center justify-center gap-2"
                  onClick={() => navigate('/buy')}
                >
                  Buy Phones
                </button>
              </div>
              <div className="flex items-center gap-6 mt-8 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#00E599]" />
                  <span>Patna, Bihar</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#00E599]" />
                  <span>+91 98765-43210</span>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <img
                src="https://images.unsplash.com/photo-1769755411824-4afe29a8de2c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDN8MHwxfHNlYXJjaHwxfHxzbWFydHBob25lJTIwbW9kZXJuJTIwZGFyayUyMGJhY2tncm91bmR8ZW58MHx8fHwxNzcwODkyNTk1fDA&ixlib=rb-4.1.0&q=85"
                alt="Smartphones"
                className="w-full h-auto animate-float rounded-2xl"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="glass-card p-6"
                data-testid={`feature-card-${idx}`}
              >
                <div className="w-12 h-12 bg-[#00E599]/10 rounded-lg flex items-center justify-center mb-4 text-[#00E599]">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24 bg-[#0F0F0F]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-semibold mb-4">
              How It <span className="text-gradient">Works</span>
            </h2>
            <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto">
              Selling your phone has never been easier. Just 4 simple steps to get cash.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="relative"
                data-testid={`how-it-works-step-${idx}`}
              >
                <div className="glass-card p-6 h-full">
                  <div className="w-12 h-12 bg-[#00E599] rounded-full flex items-center justify-center mb-4 text-black font-bold text-xl">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-gray-400 text-sm">{item.desc}</p>
                </div>
                {idx < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-[#27272A]" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Trust Us */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-5xl font-semibold mb-6">
                Why <span className="text-gradient">Trust</span> Us?
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 bg-[#00E599] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-4 h-4 text-black" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">5+ Years in Patna</h3>
                    <p className="text-gray-400 text-sm">Established local presence with thousands of happy customers</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 bg-[#00E599] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-4 h-4 text-black" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Fair & Transparent Pricing</h3>
                    <p className="text-gray-400 text-sm">No hidden charges, what you see is what you get</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 bg-[#00E599] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-4 h-4 text-black" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Data Security Guaranteed</h3>
                    <p className="text-gray-400 text-sm">Complete data wipe and privacy protection included</p>
                  </div>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <img
                src="https://images.unsplash.com/photo-1769604031798-91ebd0b08db3?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODl8MHwxfHNlYXJjaHwzfHxJbmRpYW4lMjBwZXJzb24lMjB1c2luZyUyMHNtYXJ0cGhvbmUlMjBoYXBweXxlbnwwfHx8fDE3NzA4OTI2MjR8MA&ixlib=rb-4.1.0&q=85"
                alt="Happy Customer"
                className="w-full h-auto rounded-2xl"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-[#0F0F0F]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-semibold mb-6">
              Ready to Get the Best Price?
            </h2>
            <p className="text-gray-400 text-base md:text-lg mb-8">
              Join thousands of satisfied customers who chose PhoneXchange Patna
            </p>
            <button
              data-testid="cta-sell-now-btn"
              className="btn-primary flex items-center justify-center gap-2 mx-auto"
              onClick={() => navigate('/sell')}
            >
              Sell Your Phone Now
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
