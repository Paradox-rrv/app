import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, ChevronRight, Home } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SellPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBrands();
    fetchQuestions();
  }, []);

  const fetchBrands = async () => {
    try {
      const response = await axios.get(`${API}/brands`);
      setBrands(response.data);
    } catch (error) {
      toast.error('Failed to load brands');
    }
  };

  const fetchQuestions = async () => {
    try {
      const response = await axios.get(`${API}/questions`);
      setQuestions(response.data);
    } catch (error) {
      toast.error('Failed to load questions');
    }
  };

  const fetchModels = async (brandId) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/models/${brandId}`);
      setModels(response.data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load models');
      setLoading(false);
    }
  };

  const handleBrandSelect = (brand) => {
    setSelectedBrand(brand);
    fetchModels(brand.id);
    setStep(2);
  };

  const handleModelSelect = (model) => {
    setSelectedModel(model);
    setStep(3);
  };

  const handleAnswer = (answer) => {
    const currentQuestion = questions[currentQuestionIndex];
    setAnswers({ ...answers, [currentQuestion.id]: answer });

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // All questions answered, calculate price
      calculatePrice();
    }
  };

  const calculatePrice = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`${API}/calculate-price`, {
        model_id: selectedModel.id,
        answers: answers
      });
      
      setLoading(false);
      navigate('/sell/price', { state: { priceData: response.data, model: selectedModel } });
    } catch (error) {
      toast.error('Failed to calculate price');
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 3 && currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else if (step > 1) {
      setStep(step - 1);
      if (step === 3) {
        setCurrentQuestionIndex(0);
        setAnswers({});
      }
    } else {
      navigate('/');
    }
  };

  const totalSteps = 2 + questions.length;
  const currentStep = step === 1 ? 1 : step === 2 ? 2 : 2 + currentQuestionIndex + 1;
  const progress = (currentStep / totalSteps) * 100;

  const currentQuestion = questions[currentQuestionIndex];
  const groupedByCategory = questions.reduce((acc, q, idx) => {
    if (!acc[q.category]) acc[q.category] = [];
    acc[q.category].push({ ...q, index: idx });
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-[#0A0A0A] py-8">
      {/* Progress Bar */}
      <div className="max-w-4xl mx-auto px-4 mb-8">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex justify-between items-center mt-4">
          <button
            data-testid="back-button"
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </button>
          <button
            data-testid="home-button"
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <Home className="w-5 h-5" />
            Home
          </button>
        </div>
      </div>

      {/* Step Content */}
      <div className="max-w-4xl mx-auto px-4">
        {/* Step 1: Brand Selection */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            data-testid="brand-selection-step"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-center mb-4">
              Select Your Phone <span className="text-gradient">Brand</span>
            </h2>
            <p className="text-center text-gray-400 mb-12">Choose the brand of your smartphone</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {brands.map((brand) => (
                <motion.div
                  key={brand.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="selection-card"
                  onClick={() => handleBrandSelect(brand)}
                  data-testid={`brand-${brand.id}`}
                >
                  <div className="text-center">
                    <div className="text-4xl mb-4">📱</div>
                    <h3 className="text-xl font-semibold">{brand.name}</h3>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 2: Model Selection */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            data-testid="model-selection-step"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-center mb-4">
              Select Your <span className="text-gradient">Model</span>
            </h2>
            <p className="text-center text-gray-400 mb-12">Choose your {selectedBrand?.name} model</p>
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00E599]"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {models.map((model) => (
                  <motion.div
                    key={model.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="selection-card flex items-center gap-4"
                    onClick={() => handleModelSelect(model)}
                    data-testid={`model-${model.id}`}
                  >
                    <img src={model.image} alt={model.name} className="w-20 h-20 object-cover rounded-lg" />
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-1">{model.name}</h3>
                      <p className="text-gray-400">Base: ₹{model.base_price.toLocaleString()}</p>
                    </div>
                    <ChevronRight className="w-6 h-6 text-gray-400" />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Step 3: Questions */}
        {step === 3 && currentQuestion && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            key={currentQuestionIndex}
            data-testid="question-step"
          >
            <div className="text-center mb-8">
              <span className="inline-block px-4 py-2 bg-[#00E599]/10 text-[#00E599] rounded-full text-sm font-semibold mb-4">
                {currentQuestion.category}
              </span>
              <h2 className="text-2xl md:text-4xl font-bold mb-4">{currentQuestion.text}</h2>
              <p className="text-gray-400 text-sm">
                Question {currentQuestionIndex + 1} of {questions.length}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-6 max-w-2xl mx-auto">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="selection-card flex-1 py-12"
                onClick={() => handleAnswer(true)}
                data-testid="answer-yes"
              >
                <div className="text-center">
                  <div className="text-5xl mb-4">✓</div>
                  <h3 className="text-2xl font-bold">YES</h3>
                </div>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="selection-card flex-1 py-12"
                onClick={() => handleAnswer(false)}
                data-testid="answer-no"
              >
                <div className="text-center">
                  <div className="text-5xl mb-4">✗</div>
                  <h3 className="text-2xl font-bold">NO</h3>
                </div>
              </motion.button>
            </div>
          </motion.div>
        )}

        {loading && step === 3 && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00E599] mb-4"></div>
            <p className="text-gray-400">Calculating your phone's value...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellPage;
