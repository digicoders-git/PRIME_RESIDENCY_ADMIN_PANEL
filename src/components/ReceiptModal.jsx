import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPrint, FaTimes, FaPhone, FaEnvelope, FaMapMarkerAlt, FaGlobe, FaDownload } from 'react-icons/fa';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import logo from '../assets/logo.png';

const ReceiptModal = ({ isOpen, onClose, booking }) => {
    const receiptRef = useRef(null);

    if (!isOpen || !booking) return null;

    const handlePrint = () => {
        window.print();
    };

    const handleDownload = async () => {
        try {
            // Show loading state
            const btn = document.getElementById('download-btn');
            const originalText = btn ? btn.innerText : 'Download PDF';
            if (btn) btn.innerText = 'Generating...';

            // 1. Create a "Clean Room" container for PDF generation
            // This is detached from the main app's CSS context (Tailwind/Variables)
            // to prevents oklch errors absolutely.
            const container = document.createElement('div');
            container.style.position = 'absolute';
            container.style.top = '-9999px';
            container.style.left = '-9999px';
            container.style.width = '800px'; // Fixed A4-like width
            container.style.backgroundColor = '#ffffff';
            container.style.color = '#000000';
            container.style.fontFamily = 'Arial, sans-serif';
            container.style.padding = '40px';
            document.body.appendChild(container);

            // 2. Manually construct the HTML string with INLINE STYLES only
            // We do not use any React components or Tailwind classes here.
            container.innerHTML = `
                <div style="padding: 20px; border: 1px solid #eee;">
                    <div style="display: flex; justify-content: space-between; border-bottom: 2px solid #f3f4f6; pb: 20px; margin-bottom: 20px;">
                        <div style="display: flex; align-items: center; gap: 15px;">
                            <div style="width: 60px; height: 60px; background-color: #fffbeb;">
                                <img src="${logo}" style="width: 100%; height: 100%; object-fit: contain;" />
                            </div>
                            <div>
                                <h1 style="font-size: 24px; font-weight: 900; margin: 0; text-transform: uppercase;">Prime Residency</h1>
                                <p style="font-size: 12px; color: #6b7280; margin: 0;">Premium Hotel & Suites</p>
                            </div>
                        </div>
                        <div style="text-align: right;">
                            <h2 style="font-size: 30px; font-weight: 900; color: #e5e7eb; margin: 0; text-transform: uppercase;">Receipt</h2>
                            <p style="font-size: 14px; font-weight: bold; color: #4b5563; margin: 5px 0 0;">NO: #${booking.bookingId || booking.id.slice(-6).toUpperCase()}</p>
                            <p style="font-size: 12px; color: #6b7280; margin: 0;">DATE: ${new Date().toLocaleDateString('en-IN')}</p>
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; font-size: 14px;">
                        <div>
                            <h3 style="font-size: 10px; font-weight: 900; color: #9ca3af; text-transform: uppercase; margin-bottom: 10px;">Billed To</h3>
                            <p style="font-weight: bold; font-size: 16px; margin: 0;">${booking.guest}</p>
                            <p style="margin: 2px 0; color: #6b7280;">${booking.phone}</p>
                            <p style="margin: 2px 0; color: #6b7280;">${booking.email}</p>
                        </div>
                        <div style="text-align: right;">
                            <h3 style="font-size: 10px; font-weight: 900; color: #9ca3af; text-transform: uppercase; margin-bottom: 10px;">Issued By</h3>
                            <p style="font-weight: bold; font-size: 16px; margin: 0;">Prime Residency</p>
                            <p style="margin: 2px 0; color: #6b7280;">123, Prime Location, City, State</p>
                            <p style="margin: 2px 0; color: #6b7280;">+91 98765 43210</p>
                            <p style="margin: 2px 0; color: #6b7280;">info@primeresidency.com</p>
                        </div>
                    </div>

                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                        <thead>
                            <tr style="background-color: #f9fafb; border-top: 1px solid #f3f4f6; border-bottom: 1px solid #f3f4f6;">
                                <th style="padding: 12px; text-align: left; font-size: 10px; font-weight: 900; color: #9ca3af; text-transform: uppercase;">Description</th>
                                <th style="padding: 12px; text-align: center; font-size: 10px; font-weight: 900; color: #9ca3af; text-transform: uppercase;">Rate</th>
                                <th style="padding: 12px; text-align: center; font-size: 10px; font-weight: 900; color: #9ca3af; text-transform: uppercase;">Qty/Nights</th>
                                <th style="padding: 12px; text-align: right; font-size: 10px; font-weight: 900; color: #9ca3af; text-transform: uppercase;">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style="padding: 12px; vertical-align: top;">
                                    <p style="font-weight: bold; margin: 0;">Room Charges - ${booking.room}</p>
                                    <p style="font-size: 11px; color: #6b7280; margin: 4px 0 0;">${formatDate(booking.checkIn)} to ${formatDate(booking.checkOut)}</p>
                                </td>
                                <td style="padding: 12px; text-align: center; color: #4b5563;">${formatCurrency(booking.amount / (booking.nights || 1))}</td>
                                <td style="padding: 12px; text-align: center; color: #4b5563;">${booking.nights}</td>
                                <td style="padding: 12px; text-align: right; font-weight: bold;">${formatCurrency(booking.amount)}</td>
                            </tr>
                            ${(booking.foodOrders || []).map(order => `
                                <tr>
                                    <td style="padding: 12px; vertical-align: top;">
                                        <p style="font-weight: bold; margin: 0;">Food: ${order.item}</p>
                                        <p style="font-size: 11px; color: #6b7280; margin: 4px 0 0;">${new Date(order.date).toLocaleDateString()}</p>
                                    </td>
                                    <td style="padding: 12px; text-align: center; color: #4b5563;">${formatCurrency(order.price)}</td>
                                    <td style="padding: 12px; text-align: center; color: #4b5563;">${order.quantity}</td>
                                    <td style="padding: 12px; text-align: right; font-weight: bold;">${formatCurrency(order.amount)}</td>
                                </tr>
                            `).join('')}
                            ${(booking.extraCharges || []).map(charge => `
                                <tr>
                                    <td style="padding: 12px; vertical-align: top;">
                                        <p style="font-weight: bold; margin: 0;">Extra: ${charge.description}</p>
                                        <p style="font-size: 11px; color: #6b7280; margin: 4px 0 0;">${new Date(charge.date).toLocaleDateString()}</p>
                                    </td>
                                    <td style="padding: 12px; text-align: center; color: #4b5563;">-</td>
                                    <td style="padding: 12px; text-align: center; color: #4b5563;">1</td>
                                    <td style="padding: 12px; text-align: right; font-weight: bold;">${formatCurrency(charge.amount)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>

                    <div style="display: flex; flex-direction: column; align-items: flex-end; margin-bottom: 30px; border-top: 2px solid #f3f4f6; padding-top: 20px;">
                        <div style="display: flex; justify-content: space-between; width: 300px; margin-bottom: 8px;">
                            <span style="font-size: 12px; color: #6b7280; font-weight: bold;">Subtotal</span>
                            <span style="font-weight: bold;">${formatCurrency(booking.amount)}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; width: 300px; margin-bottom: 8px;">
                            <span style="font-size: 12px; color: #6b7280; font-weight: bold;">Advance Paid</span>
                            <span style="font-weight: bold; color: #059669;">(-) ${formatCurrency(booking.advance)}</span>
                        </div>
                        <div style="width: 300px; border-top: 1px solid #f3f4f6; margin: 8px 0;"></div>
                         <div style="display: flex; justify-content: space-between; width: 300px;">
                            <span style="font-size: 14px; color: #111827; font-weight: 900; text-transform: uppercase;">Total Due</span>
                            <span style="font-size: 18px; color: #d97706; font-weight: 900;">${formatCurrency(booking.balance)}</span>
                        </div>
                    </div>

                    <div style="display: flex; justify-content: space-between; align-items: flex-end; padding-top: 20px;">
                        <div>
                            <p style="font-size: 12px; color: #9ca3af; margin: 0 0 5px;">Terms & Conditions:</p>
                            <p style="font-size: 10px; color: #9ca3af; margin: 0; max-width: 300px; line-height: 1.4;">
                                1. Amounts are non-refundable unless stated otherwise.<br/>
                                2. This receipt is computer generated and requires no signature.
                            </p>
                        </div>
                        <div style="text-align: center;">
                            <div style="padding: 8px 20px; border: 2px solid ${booking.paymentStatus === 'Paid' ? '#10b981' : '#f43f5e'}; border-radius: 8px; font-weight: 900; font-size: 18px; color: ${booking.paymentStatus === 'Paid' ? '#10b981' : '#f43f5e'}; text-transform: uppercase; transform: rotate(-12deg); opacity: 0.8; margin-bottom: 5px;">
                                ${booking.paymentStatus}
                            </div>
                            <p style="font-size: 10px; font-weight: bold; color: #d1d5db; letter-spacing: 2px;">AUTHORIZED SIGNATURE</p>
                        </div>
                    </div>
                </div>
            `;

            // 3. Generate PDF from this clean element
            const canvas = await html2canvas(container, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Receipt_${booking.bookingId || booking.id.slice(-6).toUpperCase()}.pdf`);

            // 4. Cleanup
            document.body.removeChild(container);
            if (btn) btn.innerText = originalText;

        } catch (error) {
            console.error("Error generating PDF", error);
            const btn = document.getElementById('download-btn');
            if (btn) btn.innerText = 'Failed';
        }
    };

    // Safe formatting helpers
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
    };

    const formatCurrency = (amount) => {
        return Number(amount || 0).toLocaleString('en-IN', {
            style: 'currency',
            currency: 'INR'
        });
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto print:p-0 print:block print:bg-white print:overflow-visible"
                onClick={onClose}
            >
                <div className="hidden print:block fixed inset-0 bg-white z-[100]"></div>

                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white rounded-xl shadow-2xl max-w-3xl w-full overflow-hidden print:shadow-none print:max-w-none print:w-full print:absolute print:top-0 print:left-0 print:m-0"
                >
                    {/* Header - Hidden when printing */}
                    <div className="bg-gray-900 px-6 py-4 flex justify-between items-center print:hidden">
                        <h3 className="text-white font-bold text-lg">Tax Invoice / Receipt</h3>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-white transition-colors p-2"
                        >
                            <FaTimes />
                        </button>
                    </div>

                    {/* Receipt Content */}
                    <div className="p-8 md:p-12 bg-white print:p-8 print:w-[210mm] print:h-[297mm] mx-auto" ref={receiptRef} id="receipt-content">

                        {/* Header */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b-2 border-gray-100 pb-8 mb-8 gap-6 print:flex-row print:justify-between print:mb-4 print:pb-4">
                            <div className="flex items-center gap-4">
                                {/* Replace with actual Logo */}
                                <div className="w-16 h-16 bg-amber-50 rounded-lg flex items-center justify-center p-2 print:bg-transparent print:border print:border-gray-200">
                                    <img src={logo} alt="Prime Residency" className="w-full h-full object-contain" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Prime Residency</h1>
                                    <p className="text-xs text-gray-500 font-medium tracking-wide">Premium Hotel & Suites</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <h2 className="text-4xl font-black text-gray-200 uppercase tracking-widest leading-none print:text-gray-400">Invoice</h2>
                                <div className="flex items-center justify-end gap-2 mt-2 text-sm font-bold text-gray-600">
                                    <span className="text-gray-400">NO:</span>
                                    <span>#{booking.bookingId || booking.id.slice(-6).toUpperCase()}</span>
                                </div>
                                <div className="flex items-center justify-end gap-2 text-xs font-medium text-gray-500">
                                    <span className="text-gray-400">DATE:</span>
                                    <span>{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                </div>
                            </div>
                        </div>

                        {/* Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 text-sm print:grid-cols-2 print:gap-8 print:mb-6">
                            <div className="space-y-4">
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Billed To</h3>
                                <div className="space-y-1">
                                    <p className="font-bold text-gray-900 text-lg">{booking.guest}</p>
                                    <p className="text-gray-500 font-medium">{booking.phone}</p>
                                    <p className="text-gray-500 font-medium">{booking.email}</p>
                                    <p className="text-gray-500 font-medium mt-2">{booking.address || ''}</p>
                                </div>
                            </div>
                            <div className="space-y-4 md:text-right print:text-right">
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Issued By</h3>
                                <div className="space-y-1">
                                    <p className="font-bold text-gray-900 text-lg">Prime Residency</p>
                                    <p className="text-gray-500 font-medium flex items-center justify-end gap-2 print:justify-end"><FaMapMarkerAlt size={10} /> 123, Prime Location, City, State</p>
                                    <p className="text-gray-500 font-medium flex items-center justify-end gap-2 print:justify-end"><FaPhone size={10} /> +91 98765 43210</p>
                                    <p className="text-gray-500 font-medium flex items-center justify-end gap-2 print:justify-end"><FaEnvelope size={10} /> info@primeresidency.com</p>
                                </div>
                            </div>
                        </div>

                        {/* Receipt Table */}
                        <div className="mb-10 print:mb-6">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50 border-y border-gray-100 print:bg-gray-100">
                                        <th className="py-4 px-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Description</th>
                                        <th className="py-4 px-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Rate</th>
                                        <th className="py-4 px-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Qty/Nights</th>
                                        <th className="py-4 px-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    <tr>
                                        <td className="py-4 px-4">
                                            <p className="font-bold text-gray-900">Room Charges - {booking.room}</p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {formatDate(booking.checkIn)} to {formatDate(booking.checkOut)}
                                            </p>
                                        </td>
                                        <td className="py-4 px-4 text-center text-gray-600 font-medium">
                                            {formatCurrency(booking.amount / (booking.nights || 1))}
                                        </td>
                                        <td className="py-4 px-4 text-center text-gray-600 font-medium">
                                            {booking.nights}
                                        </td>
                                        <td className="py-4 px-4 text-right font-bold text-gray-900">
                                            {formatCurrency(booking.amount)}
                                        </td>
                                    </tr>
                                    {(booking.foodOrders || []).map((order, idx) => (
                                        <tr key={`food-${idx}`}>
                                            <td className="py-4 px-4">
                                                <p className="font-bold text-gray-900">Food: {order.item}</p>
                                                <p className="text-xs text-gray-500 mt-1">{new Date(order.date).toLocaleDateString()}</p>
                                            </td>
                                            <td className="py-4 px-4 text-center text-gray-600 font-medium">{formatCurrency(order.price)}</td>
                                            <td className="py-4 px-4 text-center text-gray-600 font-medium">{order.quantity}</td>
                                            <td className="py-4 px-4 text-right font-bold text-gray-900">{formatCurrency(order.amount)}</td>
                                        </tr>
                                    ))}
                                    {(booking.extraCharges || []).map((charge, idx) => (
                                        <tr key={`extra-${idx}`}>
                                            <td className="py-4 px-4">
                                                <p className="font-bold text-gray-900">Extra: {charge.description}</p>
                                                <p className="text-xs text-gray-500 mt-1">{new Date(charge.date).toLocaleDateString()}</p>
                                            </td>
                                            <td className="py-4 px-4 text-center text-gray-600 font-medium">-</td>
                                            <td className="py-4 px-4 text-center text-gray-600 font-medium">1</td>
                                            <td className="py-4 px-4 text-right font-bold text-gray-900">{formatCurrency(charge.amount)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Totals */}
                        <div className="flex flex-col items-end gap-3 mb-12 border-t-2 border-gray-100 pt-8 print:mb-6 print:pt-4">
                            <div className="flex justify-between w-full md:w-1/2 lg:w-1/3">
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Subtotal</span>
                                <span className="font-bold text-gray-900">{formatCurrency(booking.amount)}</span>
                            </div>
                            <div className="flex justify-between w-full md:w-1/2 lg:w-1/3">
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Advance Paid</span>
                                <span className="font-bold text-emerald-600">(-) {formatCurrency(booking.advance)}</span>
                            </div>
                            <div className="w-full md:w-1/2 lg:w-1/3 border-t border-gray-100 my-2"></div>
                            <div className="flex justify-between w-full md:w-1/2 lg:w-1/3">
                                <span className="text-sm font-black text-gray-900 uppercase tracking-wide">Total Due</span>
                                <span className="text-xl font-black text-amber-600">{formatCurrency(booking.balance)}</span>
                            </div>
                        </div>

                        {/* Footer / Status */}
                        <div className="flex flex-col-reverse md:flex-row justify-between items-end md:items-center gap-8 pt-8 print:pt-4">
                            <div className="text-left w-full">
                                <p className="text-xs text-gray-400 font-medium">Terms & Conditions:</p>
                                <p className="text-[10px] text-gray-400 mt-1 max-w-sm leading-relaxed">
                                    1. Amounts are non-refundable unless stated otherwise.<br />
                                    2. This receipt is computer generated and requires no signature.<br />
                                    3. Please retain this receipt for your records.
                                </p>
                            </div>

                            <div className="flex flex-col items-center gap-2">
                                <div className={`px-8 py-2 border-2 rounded-lg uppercase tracking-[0.2em] font-black text-xl rotate-[-12deg] opacity-80 mix-blend-multiply
                    ${booking.paymentStatus === 'Paid' ? 'border-emerald-500 text-emerald-500' :
                                        booking.paymentStatus === 'Pending' ? 'border-rose-500 text-rose-500' :
                                            'border-amber-500 text-amber-500'}`}>
                                    {booking.paymentStatus}
                                </div>
                                <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mt-4">Authorized Signature</p>
                            </div>
                        </div>

                        {/* Decorative bottom bar */}
                        <div className="h-2 bg-gradient-to-r from-amber-400 to-amber-600 w-full rounded-full mt-12 opacity-20 print:mt-6"></div>

                    </div>

                    {/* Footer Actions - Hidden when printing */}
                    <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-end gap-3 print:hidden">
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-sm transition-colors cursor-pointer shadow-lg shadow-amber-500/20"
                        >
                            <FaPrint /> Print Receipt
                        </button>
                        <button
                            id="download-btn"
                            onClick={handleDownload}
                            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-colors cursor-pointer shadow-lg shadow-blue-600/20"
                        >
                            <FaDownload /> Download PDF
                        </button>
                        <button
                            onClick={onClose}
                            className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl font-bold text-sm transition-colors cursor-pointer"
                        >
                            Close
                        </button>
                    </div>
                </motion.div>

                {/* Global Print Styles */}
                <style>{`
          @media print {
            body {
              visibility: hidden;
              height: auto;
              overflow: visible !important;
              background-color: white !important;
            }
            
            #receipt-content {
              visibility: visible !important;
              position: fixed !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              height: 100% !important;
              margin: 0 !important;
              padding: 20px !important;
              background-color: white !important;
              z-index: 999999 !important;
              box-shadow: none !important;
            }
            
            #receipt-content * {
              visibility: visible !important;
            }

            .print\\:hidden, .no-print, button, nav, aside {
                display: none !important;
            }
            
            @page {
              size: A4;
              margin: 0;
            }
          }
        `}</style>
            </motion.div>
        </AnimatePresence>
    );
};

export default ReceiptModal;
