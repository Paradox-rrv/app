import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { Phone, MessageCircle, MapPin, ArrowLeft } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PriceRevealPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [displayPrice, setDisplayPrice] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    area: '',
    preferred_time: '',
    remarks: ''
  });

  const { priceData, model } = location.state || {};

  useEffect(() => {
    if (!priceData) {
      navigate('/sell');
      return;
    }

    // Animate price counting up
    const targetPrice = priceData.final_price;
    const duration = 2000;
    const steps = 60;
    const increment = targetPrice / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(current + increment, targetPrice);
      setDisplayPrice(Math.floor(current));

      if (step >= steps) {
        clearInterval(timer);
        setDisplayPrice(targetPrice);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [priceData, navigate]);

  const handleSubmitLead = async (e) => {
    e.preventDefault();

    try {
      await axios.post(`${API}/submit-lead`, {
        ...formData,
        phone_model: model?.name,
        offered_price: priceData?.final_price,
        lead_type: 'sell'
      });

      toast.success('Request submitted successfully! We will contact you soon.');
      setShowModal(false);
      setFormData({ name: '', phone: '', area: '', preferred_time: '', remarks: '' });
    } catch (error) {
      toast.error('Failed to submit request. Please try again.');
    }
  };

  const handleWhatsApp = () => {
    const message = `Hi! I want to sell my ${model?.name}. Offered price: ₹${priceData?.final_price}`;
    window.open(`https://wa.me/919876543210?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (!priceData) return null;

  return (
    <div className="min-h-screen bg-[#0A0A0A] py-12">
      <div className="max-w-4xl mx-auto px-4">
        <button
          data-testid="back-to-home-btn"
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </button>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          {priceData.is_blocked ? (
            <div data-testid="blocked-offer">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                Sorry, We Cannot Make an Offer
              </h2>
              <div className="glass-card p-8 mb-8">
                <p className="text-xl text-gray-400 mb-4">Reason:</p>
                <p className="text-2xl font-semibold text-red-400">{priceData.block_reason}</p>
              </div>
              <p className="text-gray-400 mb-8">
                Unfortunately, we cannot accept phones with this condition.
              </p>
              <button
                className="btn-primary"
                onClick={() => navigate('/sell')}
                data-testid="try-another-phone-btn"
              >
                Try Another Phone
              </button>
            </div>
          ) : (
            <div data-testid="price-offer">
              <h2 className="text-2xl md:text-4xl font-bold mb-4">
                Your <span className="text-gradient">{model?.name}</span> is worth
              </h2>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="my-12"
              >
                <div className="text-6xl md:text-8xl font-bold text-[#00E599]" data-testid="price-display">
                  ₹{displayPrice.toLocaleString()}
                </div>
              </motion.div>

              <div className="glass-card p-6 mb-8 text-left max-w-2xl mx-auto">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-400">Base Price:</span>
                  <span className="font-semibold">₹{priceData.base_price.toLocaleString()}</span>
                </div>
                {priceData.deductions.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-400 mb-2">Deductions:</p>
                    {priceData.deductions.slice(0, 3).map((deduction, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm">
                        <span className="text-gray-400">{deduction.question}</span>
                        <span className="text-red-400">-{deduction.percentage}%</span>
                      </div>
                    ))}
                    {priceData.deductions.length > 3 && (
                      <p className="text-xs text-gray-500">+ {priceData.deductions.length - 3} more deductions</p>
                    )}
                  </div>
                )}
                <div className="h-px bg-[#27272A] my-4" />
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Final Offer:</span>
                  <span className="text-[#00E599]">₹{priceData.final_price.toLocaleString()}</span>
                </div>
              </div>

              <p className="text-sm text-gray-400 mb-8">
                * Final price subject to physical verification at store
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  data-testid="book-pickup-btn"
                  className="btn-primary flex items-center justify-center gap-2"
                  onClick={() => setShowModal(true)}
                >
                  <MapPin className="w-5 h-5" />
                  Book Free Pickup
                </button>
                <button
                  data-testid="whatsapp-btn"
                  className="btn-secondary flex items-center justify-center gap-2"
                  onClick={handleWhatsApp}
                >
                  <MessageCircle className="w-5 h-5" />
                  Contact on WhatsApp
                </button>
              </div>

              <div className="mt-12 glass-card p-6 max-w-2xl mx-auto">
                <h3 className="text-xl font-semibold mb-4">What Happens Next?</h3>
                <div className="space-y-3 text-left">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-[#00E599] rounded-full flex items-center justify-center flex-shrink-0 text-black font-bold text-sm">1</div>
                    <p className="text-gray-400 text-sm">Our executive will visit your location at scheduled time</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-[#00E599] rounded-full flex items-center justify-center flex-shrink-0 text-black font-bold text-sm">2</div>
                    <p className="text-gray-400 text-sm">Physical verification of phone condition</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-[#00E599] rounded-full flex items-center justify-center flex-shrink-0 text-black font-bold text-sm">3</div>
                    <p className="text-gray-400 text-sm">Instant payment via Cash/UPI after confirmation</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Lead Form Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="bg-[#1F1F1F] border-[#27272A] text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Book Free Pickup</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitLead} className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                data-testid="lead-name-input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="bg-[#27272A] border-[#3A3A3F] text-white"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                data-testid="lead-phone-input"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
                className="bg-[#27272A] border-[#3A3A3F] text-white"
              />
            </div>
            <div>
              <Label htmlFor="area">Area/Locality</Label>
              <Input
                id="area"
                data-testid="lead-area-input"
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                required
                className="bg-[#27272A] border-[#3A3A3F] text-white"
              />
            </div>
            <div>
              <Label htmlFor="time">Preferred Time</Label>
              <Input
                id="time"
                data-testid="lead-time-input"
                placeholder="e.g., Morning, Afternoon, Evening"
                value={formData.preferred_time}
                onChange={(e) => setFormData({ ...formData, preferred_time: e.target.value })}
                required
                className="bg-[#27272A] border-[#3A3A3F] text-white"
              />
            </div>
            <div>
              <Label htmlFor="remarks">Remarks (Optional)</Label>
              <Textarea
                id="remarks"
                data-testid="lead-remarks-input"
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                className="bg-[#27272A] border-[#3A3A3F] text-white"
              />
            </div>
            <Button
              type="submit"
              data-testid="submit-lead-btn"
              className="w-full bg-[#00E599] text-black hover:bg-[#00CC88]"
            >
              Submit Request
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PriceRevealPage;
