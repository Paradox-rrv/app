import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Filter } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const BuyPage = () => {
  const navigate = useNavigate();
  const [phones, setPhones] = useState([]);
  const [filteredPhones, setFilteredPhones] = useState([]);
  const [brands, setBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPhones();
    fetchBrands();
  }, []);

  useEffect(() => {
    if (selectedBrand) {
      setFilteredPhones(phones.filter(p => p.brand === selectedBrand));
    } else {
      setFilteredPhones(phones);
    }
  }, [selectedBrand, phones]);

  const fetchPhones = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/phones-for-sale`);
      setPhones(response.data);
      setFilteredPhones(response.data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load phones');
      setLoading(false);
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await axios.get(`${API}/brands`);
      setBrands(response.data);
    } catch (error) {
      console.error('Failed to load brands');
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          data-testid="back-to-home-btn"
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Buy <span className="text-gradient">Certified</span> Phones
          </h1>
          <p className="text-gray-400 text-base md:text-lg mb-8">
            Quality checked smartphones with warranty. Great prices, trusted quality.
          </p>

          {/* Filters */}
          <div className="glass-card p-6 mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Filter className="w-5 h-5 text-[#00E599]" />
              <h3 className="text-lg font-semibold">Filters</h3>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                data-testid="filter-all"
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedBrand === ''
                    ? 'bg-[#00E599] text-black'
                    : 'bg-[#27272A] text-gray-400 hover:bg-[#3A3A3F]'
                }`}
                onClick={() => setSelectedBrand('')}
              >
                All Brands
              </button>
              {brands.map((brand) => (
                <button
                  key={brand.id}
                  data-testid={`filter-${brand.id}`}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    selectedBrand === brand.name
                      ? 'bg-[#00E599] text-black'
                      : 'bg-[#27272A] text-gray-400 hover:bg-[#3A3A3F]'
                  }`}
                  onClick={() => setSelectedBrand(brand.name)}
                >
                  {brand.name}
                </button>
              ))}
            </div>
          </div>

          {/* Phone Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00E599]"></div>
            </div>
          ) : filteredPhones.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">No phones found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPhones.map((phone, idx) => (
                <motion.div
                  key={phone.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="phone-card cursor-pointer"
                  onClick={() => navigate(`/buy/${phone.id}`)}
                  data-testid={`phone-card-${phone.id}`}
                >
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={phone.image}
                      alt={phone.model}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-lg">{phone.model}</h3>
                      <span
                        className={`badge ${
                          phone.condition === 'Excellent'
                            ? 'badge-excellent'
                            : 'badge-good'
                        }`}
                      >
                        {phone.condition}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mb-3">{phone.brand}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-[#00E599]">
                        ₹{phone.price.toLocaleString()}
                      </span>
                      <button className="text-sm text-gray-400 hover:text-white">
                        View Details →
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default BuyPage;
