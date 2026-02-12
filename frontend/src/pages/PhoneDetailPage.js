import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Phone, MessageCircle, MapPin, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PhoneDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [phone, setPhone] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    area: '',
    preferred_time: '',
    remarks: ''
  });

  useEffect(() => {
    fetchPhoneDetail();
  }, [id]);

  const fetchPhoneDetail = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/phones-for-sale/${id}`);
      setPhone(response.data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load phone details');
      setLoading(false);
    }
  };

  const handleSubmitInquiry = async (e) => {
    e.preventDefault();

    try {
      await axios.post(`${API}/submit-lead`, {
        ...formData,
        phone_model: phone?.model,
        lead_type: 'buy'
      });

      toast.success('Inquiry submitted successfully! We will contact you soon.');
      setShowModal(false);
      setFormData({ name: '', phone: '', area: '', preferred_time: '', remarks: '' });
    } catch (error) {
      toast.error('Failed to submit inquiry. Please try again.');
    }
  };

  const handleCall = () => {
    window.location.href = 'tel:+919876543210';
  };

  const handleWhatsApp = () => {
    const message = `Hi! I'm interested in buying ${phone?.model} for ₹${phone?.price}`;
    window.open(`https://wa.me/919876543210?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00E599]"></div>
      </div>
    );
  }

  if (!phone) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Phone not found</h2>
          <button className="btn-primary" onClick={() => navigate('/buy')}>
            Browse All Phones
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          data-testid="back-to-buy-btn"
          onClick={() => navigate('/buy')}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to All Phones
        </button>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Image Section */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="glass-card overflow-hidden">
              <img
                src={phone.image}
                alt={phone.model}
                className="w-full h-auto"
              />
            </div>
          </motion.div>

          {/* Details Section */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-4">
              <span className="text-gray-400 text-sm">{phone.brand}</span>
              <h1 className="text-3xl md:text-5xl font-bold mt-2 mb-4">{phone.model}</h1>
              <div className="flex items-center gap-4">
                <span
                  className={`badge ${
                    phone.condition === 'Excellent' ? 'badge-excellent' : 'badge-good'
                  }`}
                >
                  {phone.condition}
                </span>
                {phone.in_stock && (
                  <span className="text-[#00E599] text-sm font-semibold">In Stock</span>
                )}
              </div>
            </div>

            <div className="glass-card p-6 mb-6">
              <div className="text-4xl font-bold text-[#00E599] mb-2">
                ₹{phone.price.toLocaleString()}
              </div>
              <p className="text-gray-400 text-sm">Inclusive of all taxes</p>
            </div>

            <div className="glass-card p-6 mb-6">
              <h3 className="text-xl font-semibold mb-4">Description</h3>
              <p className="text-gray-400">{phone.description}</p>
            </div>

            <div className="glass-card p-6 mb-6">
              <h3 className="text-xl font-semibold mb-4">Specifications</h3>
              <div className="space-y-3">
                {Object.entries(phone.specs).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center">
                    <span className="text-gray-400">{key}</span>
                    <span className="font-semibold">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card p-6 mb-6">
              <h3 className="text-xl font-semibold mb-4">What You Get</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-[#00E599]" />
                  <span className="text-gray-400">Quality checked device</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-[#00E599]" />
                  <span className="text-gray-400">Warranty included</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-[#00E599]" />
                  <span className="text-gray-400">Original accessories (when available)</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-[#00E599]" />
                  <span className="text-gray-400">7-day return policy</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                data-testid="inquire-btn"
                className="btn-primary flex items-center justify-center gap-2 flex-1"
                onClick={() => setShowModal(true)}
              >
                <MapPin className="w-5 h-5" />
                Inquire Now
              </button>
              <button
                data-testid="call-btn"
                className="btn-secondary flex items-center justify-center gap-2"
                onClick={handleCall}
              >
                <Phone className="w-5 h-5" />
                Call
              </button>
              <button
                data-testid="whatsapp-detail-btn"
                className="btn-secondary flex items-center justify-center gap-2"
                onClick={handleWhatsApp}
              >
                <MessageCircle className="w-5 h-5" />
                WhatsApp
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Inquiry Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="bg-[#1F1F1F] border-[#27272A] text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Inquire About This Phone</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitInquiry} className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                data-testid="inquiry-name-input"
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
                data-testid="inquiry-phone-input"
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
                data-testid="inquiry-area-input"
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                required
                className="bg-[#27272A] border-[#3A3A3F] text-white"
              />
            </div>
            <div>
              <Label htmlFor="time">Preferred Time to Visit</Label>
              <Input
                id="time"
                data-testid="inquiry-time-input"
                placeholder="e.g., Morning, Afternoon, Evening"
                value={formData.preferred_time}
                onChange={(e) => setFormData({ ...formData, preferred_time: e.target.value })}
                required
                className="bg-[#27272A] border-[#3A3A3F] text-white"
              />
            </div>
            <div>
              <Label htmlFor="remarks">Message (Optional)</Label>
              <Textarea
                id="remarks"
                data-testid="inquiry-remarks-input"
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                className="bg-[#27272A] border-[#3A3A3F] text-white"
              />
            </div>
            <Button
              type="submit"
              data-testid="submit-inquiry-btn"
              className="w-full bg-[#00E599] text-black hover:bg-[#00CC88]"
            >
              Submit Inquiry
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PhoneDetailPage;
