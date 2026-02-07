import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  ArrowLeft,
  CreditCard,
  Lock,
  CheckCircle,
  AlertCircle,
  Loader,
  Shield,
  DollarSign,
  Zap,
  Star,
  Users,
} from 'lucide-react';
import { createPaymentIntent, confirmPayment, PAYMENT_STATUSES } from '../../config/paymentConfig';

/**
 * Checkout Page
 * Handles course purchase with payment processing
 */
export default function Checkout() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user, getCourseById, createTransaction, getEnrollment, validatePromoCode, applyPromoCode, enrollCourse } = useApp();

  const course = getCourseById(parseInt(courseId));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState('review'); // 'review', 'payment', 'processing', 'success'
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [promoCode, setPromoCode] = useState('');
  const [promoCodeResult, setPromoCodeResult] = useState(null);
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiry: '',
    cvc: '',
    name: '',
  });
  const [transaction, setTransaction] = useState(null);

  if (!course || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Loading...</p>
          <button
            onClick={() => navigate('/courses')}
            className="text-blue-600 hover:text-blue-700"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  // Check if already enrolled and paid
  const enrollment = getEnrollment(user.id, course.id);
  if (enrollment && enrollment.paid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Already Purchased</h1>
          <p className="text-gray-600 mb-6">You already have access to this course.</p>
          <button
            onClick={() => navigate(`/courses/${courseId}`)}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Go to Course
          </button>
        </div>
      </div>
    );
  }

  const handlePromoCodeCheck = () => {
    if (!promoCode.trim()) {
      setPromoCodeResult(null);
      return;
    }

    const result = validatePromoCode(promoCode, parseInt(courseId));
    setPromoCodeResult(result);
    
    if (result.valid) {
      setError('');
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Check if valid promo code is applied for free course
      if (promoCodeResult && promoCodeResult.valid && promoCodeResult.discountType === 'free') {
        // Apply promo code
        applyPromoCode(promoCode, parseInt(courseId));
        
        // Create free enrollment
        enrollCourse(user.id, parseInt(courseId), true);
        
        // Create transaction record (with 0 amount for free)
        const txn = {
          id: `txn_${Date.now()}`,
          userId: user.id,
          courseId: course.id,
          type: 'course_purchase',
          amount: 0,
          currency: 'USD',
          paymentIntentId: `free_${Date.now()}`,
          paymentMethod: 'promo_code',
          status: 'completed',
          timestamp: new Date().toISOString(),
          courseName: course.title,
          customerEmail: user.email,
          receiptUrl: `/receipt/free_${Date.now()}`,
          promoCode: promoCode.toUpperCase(),
        };

        createTransaction(txn);
        setStep('success');
        return;
      }

      // Regular payment flow
      // Create payment intent
      const intent = await createPaymentIntent(user.id, course.id, course.price * 100);

      setStep('processing');

      // Confirm payment
      const result = await confirmPayment(intent.paymentIntentId, paymentMethod);

      if (result.success) {
        // Create transaction record
        const txn = {
          id: `txn_${Date.now()}`,
          userId: user.id,
          courseId: course.id,
          type: 'course_purchase',
          amount: course.price,
          currency: 'USD',
          paymentIntentId: intent.paymentIntentId,
          paymentMethod,
          status: PAYMENT_STATUSES.COMPLETED,
          timestamp: new Date().toISOString(),
          courseName: course.title,
          customerEmail: user.email,
          receiptUrl: `/receipt/${intent.paymentIntentId}`,
        };

        createTransaction(txn);
        setTransaction(txn);
        setStep('success');
      } else {
        throw new Error('Payment confirmation failed');
      }
    } catch (err) {
      setError(err.message || 'Payment failed. Please try again.');
      setStep('payment');
    } finally {
      setLoading(false);
    }
  };

  const handleCardInputChange = (field, value) => {
    // Format inputs
    if (field === 'cardNumber') {
      value = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
    } else if (field === 'expiry') {
      value = value.replace(/\D/g, '');
      if (value.length >= 2) {
        value = value.slice(0, 2) + '/' + value.slice(2, 4);
      }
    } else if (field === 'cvc') {
      value = value.replace(/\D/g, '').slice(0, 4);
    }

    setCardDetails(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-6 flex items-center gap-4">
          <button
            onClick={() => navigate('/courses')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Order Review & Payment */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step Indicator */}
            <div className="flex gap-2 mb-8">
              {[
                { id: 'review', label: 'Review' },
                { id: 'payment', label: 'Payment' },
                { id: 'success', label: 'Complete' },
              ].map((s, idx) => (
                <div key={s.id} className="flex items-center gap-2 flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                      ['review', 'payment', 'success'].indexOf(step) >= idx
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {['review', 'payment', 'success'].indexOf(step) > idx ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      idx + 1
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-700 hidden sm:inline">{s.label}</span>
                  {idx < 2 && <div className="flex-1 h-0.5 bg-gray-300" />}
                </div>
              ))}
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-900">Payment Failed</h3>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            {/* Review Step */}
            {step === 'review' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
                <h2 className="text-xl font-bold text-gray-900">Order Review</h2>

                {/* Course Summary */}
                <div className="flex gap-4 pb-6 border-b">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-24 h-24 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-1">{course.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{course.description}</p>
                    <div className="flex gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-gray-700">4.8</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">1,234 students</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Course Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Instructor</p>
                    <p className="font-semibold text-gray-900">LearnSphere</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Access</p>
                    <p className="font-semibold text-gray-900">Lifetime</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Level</p>
                    <p className="font-semibold text-gray-900 capitalize">{course.level || 'Beginner'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Lessons</p>
                    <p className="font-semibold text-gray-900">{course.lessons?.length || 0} lessons</p>
                  </div>
                </div>

                {/* What's Included */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">What's Included</h4>
                  <ul className="space-y-2 text-sm">
                    {[
                      'Full course access',
                      'Video lessons and materials',
                      'Quiz and exercises',
                      'Certificate of completion',
                      'Lifetime updates',
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => setStep('payment')}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                >
                  Proceed to Payment
                </button>
              </div>
            )}

            {/* Payment Step */}
            {step === 'payment' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
                <h2 className="text-xl font-bold text-gray-900">Payment Details</h2>

                <form onSubmit={handlePayment} className="space-y-4">
                  {/* Promo Code Section */}
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-200">
                    <label className="block text-sm font-semibold text-gray-900 mb-3">
                      Have an Access Code? 🎁
                    </label>
                    <p className="text-xs text-gray-600 mb-3">
                      Enter a free access code issued by your instructor to enroll for free
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        placeholder="Enter code (e.g., FREECOURSE2024)"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono uppercase"
                      />
                      <button
                        type="button"
                        onClick={handlePromoCodeCheck}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors whitespace-nowrap"
                      >
                        Verify
                      </button>
                    </div>
                    
                    {/* Promo Code Result */}
                    {promoCodeResult && (
                      <div className={`mt-2 p-3 rounded-lg text-sm flex items-center gap-2 ${
                        promoCodeResult.valid 
                          ? 'bg-green-50 border border-green-200' 
                          : 'bg-red-50 border border-red-200'
                      }`}>
                        {promoCodeResult.valid ? (
                          <>
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-green-700 font-medium">{promoCodeResult.message}</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-4 h-4 text-red-600" />
                            <span className="text-red-700">{promoCodeResult.message}</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Show payment method only if no valid free promo code */}
                  {!(promoCodeResult?.valid && promoCodeResult?.discountType === 'free') && (
                    <>
                  {/* Payment Method Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3">Payment Method</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: 'card', label: 'Credit Card', icon: CreditCard },
                        { id: 'apple_pay', label: 'Apple Pay', icon: Zap },
                        { id: 'google_pay', label: 'Google Pay', icon: Zap },
                      ].map(method => (
                        <button
                          key={method.id}
                          type="button"
                          onClick={() => setPaymentMethod(method.id)}
                          className={`p-4 rounded-lg border-2 font-medium transition-all ${
                            paymentMethod === method.id
                              ? 'border-blue-600 bg-blue-50 text-blue-600'
                              : 'border-gray-200 text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          <method.icon className="w-6 h-6 mx-auto mb-2" />
                          {method.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Card Form */}
                  {paymentMethod === 'card' && (
                    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                      {/* Cardholder Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Cardholder Name</label>
                        <input
                          type="text"
                          value={cardDetails.name}
                          onChange={(e) => handleCardInputChange('name', e.target.value)}
                          placeholder="John Doe"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>

                      {/* Card Number */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
                        <input
                          type="text"
                          value={cardDetails.cardNumber}
                          onChange={(e) => handleCardInputChange('cardNumber', e.target.value)}
                          placeholder="4242 4242 4242 4242"
                          maxLength="19"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                          required
                        />
                        <p className="text-xs text-gray-500 mt-1">Test: 4242 4242 4242 4242</p>
                      </div>

                      {/* Expiry & CVC */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                          <input
                            type="text"
                            value={cardDetails.expiry}
                            onChange={(e) => handleCardInputChange('expiry', e.target.value)}
                            placeholder="MM/YY"
                            maxLength="5"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">CVC</label>
                          <input
                            type="text"
                            value={cardDetails.cvc}
                            onChange={(e) => handleCardInputChange('cvc', e.target.value)}
                            placeholder="123"
                            maxLength="4"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Apple/Google Pay Notice */}
                  {(paymentMethod === 'apple_pay' || paymentMethod === 'google_pay') && (
                    <div className="p-4 bg-blue-50 rounded-lg text-sm text-blue-800">
                      Click "Complete Purchase" to proceed with {paymentMethod === 'apple_pay' ? 'Apple Pay' : 'Google Pay'}
                    </div>
                  )}

                    </>
                  )}

                  {/* Show message when free promo code is applied */}
                  {promoCodeResult?.valid && promoCodeResult?.discountType === 'free' && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-green-700 font-medium">✓ You're all set! Click "Enroll for Free" to get instant access to this course.</p>
                    </div>
                  )}

                  {/* Security Notice */}
                  <div className="flex items-center gap-2 text-sm text-gray-600 p-4 bg-gray-50 rounded-lg">
                    <Lock className="w-4 h-4 text-blue-600" />
                    <span>Your payment information is encrypted and secure</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setStep('review')}
                      className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                      {loading && <Loader className="w-4 h-4 animate-spin" />}
                      {promoCodeResult?.valid && promoCodeResult?.discountType === 'free' ? 'Enroll for Free' : 'Complete Purchase'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Processing Step */}
            {step === 'processing' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Processing Payment</h3>
                <p className="text-gray-600">Please wait while we process your payment...</p>
              </div>
            )}

            {/* Success Step */}
            {step === 'success' && transaction && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Payment Successful!</h2>
                  <p className="text-gray-600 mt-2">Your course access has been activated</p>
                </div>

                {/* Receipt Details */}
                <div className="bg-gray-50 rounded-lg p-6 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transaction ID:</span>
                    <span className="font-mono text-gray-900">{transaction.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Course:</span>
                    <span className="font-semibold text-gray-900">{transaction.courseName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-semibold text-gray-900">${transaction.amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="text-gray-900">{new Date(transaction.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3">
                  <a
                    href={transaction.receiptUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 border border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors text-center"
                  >
                    Download Receipt
                  </a>
                  <button
                    onClick={() => {
                      // Navigate to first lesson of the course
                      if (course.lessons && course.lessons.length > 0) {
                        navigate(`/learn/${courseId}/${course.lessons[0].id}`);
                      } else {
                        navigate(`/courses/${courseId}`);
                      }
                    }}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                  >
                    Start Learning
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6 space-y-6">
              <h3 className="text-lg font-bold text-gray-900">Order Summary</h3>

              {/* Price Breakdown */}
              <div className="space-y-3 pb-4 border-b">
                {promoCodeResult?.valid && promoCodeResult?.discountType === 'free' ? (
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Original Price</span>
                      <span className="font-semibold text-gray-500 line-through">${course.price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between bg-green-50 p-2 rounded">
                      <span className="text-green-700 font-semibold">Free with Code</span>
                      <span className="text-green-700 font-bold">$0.00</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Course Price</span>
                      <span className="font-semibold text-gray-900">${course.price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax (10%)</span>
                      <span className="font-semibold text-gray-900">${(course.price * 0.1).toFixed(2)}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Total */}
              <div className="flex justify-between items-center bg-blue-50 rounded-lg p-4">
                <span className="font-bold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-blue-600">
                  {promoCodeResult?.valid && promoCodeResult?.discountType === 'free' ? 'FREE' : `$${(course.price * 1.1).toFixed(2)}`}
                </span>
              </div>

              {/* Features */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">This course includes:</h4>
                <ul className="space-y-2 text-sm">
                  {[
                    { icon: Shield, text: '30-day money-back guarantee' },
                    { icon: Zap, text: 'Instant access' },
                    { icon: CheckCircle, text: 'Certificate of completion' },
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-gray-700">
                      <item.icon className="w-4 h-4 text-blue-600" />
                      {item.text}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Trust Badge */}
              <div className="text-center pt-4 border-t">
                <p className="text-xs text-gray-600 flex items-center justify-center gap-1">
                  <Lock className="w-3 h-3" />
                  Secure payment by Stripe
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
