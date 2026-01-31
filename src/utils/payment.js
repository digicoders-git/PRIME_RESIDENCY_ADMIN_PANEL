import api from '../api/api';

export const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

export const createRazorpayOrder = async (amount, receipt) => {
    try {
        const { data } = await api.post('/payment/create-order', {
            amount,
            receipt
        });
        return data;
    } catch (error) {
        throw error;
    }
};

export const verifyPayment = async (paymentData) => {
    try {
        const { data } = await api.post('/payment/verify', paymentData);
        return data;
    } catch (error) {
        throw error;
    }
};

export const initiatePayment = async (orderData, bookingData, onSuccess, onFailure) => {
    const isLoaded = await loadRazorpayScript();
    
    if (!isLoaded) {
        onFailure('Failed to load payment gateway');
        return;
    }

    const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Prime Residency',
        description: `Booking for ${bookingData.guest}`,
        order_id: orderData.id,
        handler: async (response) => {
            try {
                const verificationData = {
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                    bookingId: bookingData.bookingId,
                    amount: orderData.amount / 100 // Convert paise back to rupees
                };
                
                console.log('Sending payment verification data:', verificationData);
                
                const result = await verifyPayment(verificationData);
                onSuccess(result);
            } catch (error) {
                console.error('Payment verification error:', error);
                onFailure(error.response?.data?.message || 'Payment verification failed');
            }
        },
        prefill: {
            name: bookingData.guest,
            email: bookingData.email,
            contact: bookingData.phone
        },
        theme: {
            color: '#D4AF37'
        },
        modal: {
            ondismiss: () => {
                onFailure('Payment cancelled by user');
            }
        }
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
};