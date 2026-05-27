import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export const exportFormattedInvoice = async (booking, amountInWords, cgst, sgst, grandTotal, formatDate, logo) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Invoice');

    // Default column widths to match the 9 columns
    worksheet.columns = [
        { width: 12 }, // Room No
        { width: 12 }, // No of Days
        { width: 12 }, // Extra Bed
        { width: 15 }, // HSN/SAC
        { width: 12 }, // IGST
        { width: 12 }, // CGST
        { width: 12 }, // SGST
        { width: 15 }, // Price/Day
        { width: 18 }  // Amount
    ];

    // Helper for borders
    const borderStyle = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
    };

    // Row 1: Page No.1 | Hotel Bill | Original Copy
    const row1 = worksheet.addRow(['Page No.1', '', '', 'Hotel Bill', '', '', '', 'Original Copy', '']);
    worksheet.mergeCells('A1:C1');
    worksheet.mergeCells('D1:G1');
    worksheet.mergeCells('H1:I1');
    row1.eachCell((cell) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFCD5B4' } }; // #fcd5b4
        cell.font = { bold: true };
        cell.border = borderStyle;
    });
    worksheet.getCell('D1').alignment = { horizontal: 'center' };
    worksheet.getCell('D1').font = { bold: true, size: 14 };
    worksheet.getCell('H1').alignment = { horizontal: 'right' };

    // Row 2: Hotel Details
    const row2 = worksheet.addRow(['', '', '', 'Hotel Name - PRIME RESIDENCY', '', '', '', '', '']);
    worksheet.mergeCells('A2:C5'); // Merge for Logo space
    worksheet.mergeCells('D2:I2');
    worksheet.mergeCells('D3:I3');
    worksheet.mergeCells('D4:I4');
    worksheet.mergeCells('D5:I5');

    worksheet.getCell('A2').alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getCell('A2').font = { bold: true, size: 14 };
    worksheet.getCell('A2').border = borderStyle;
    // We will place the logo image on top of this merged cell later
    
    worksheet.getCell('D2').value = 'Hotel Name - PRIME RESIDENCY';
    worksheet.getCell('D2').font = { bold: true, size: 12 };
    
    worksheet.getCell('D3').value = 'Address - Harpur, Ballia (UP) 277001 India';
    worksheet.getCell('D4').value = 'Mobile: +91 09118808054, 7522808054 | Email: primeresidencyballia@gmail.com';
    worksheet.getCell('D5').value = 'GSTIN - 09DWBPS1315G1ZM | PAN - xxxxxxxxxx';
    
    ['D2', 'D3', 'D4', 'D5'].forEach(ref => {
        const cell = worksheet.getCell(ref);
        cell.border = { right: {style:'thin'} };
    });
    // Add missing borders for the merged D2:I5 block
    worksheet.getCell('I2').border = { right: {style:'thin'} };
    worksheet.getCell('I3').border = { right: {style:'thin'} };
    worksheet.getCell('I4').border = { right: {style:'thin'} };
    worksheet.getCell('I5').border = { right: {style:'thin'}, bottom: {style:'thin'} };
    worksheet.getCell('D5').border = { bottom: {style:'thin'} };
    worksheet.getCell('E5').border = { bottom: {style:'thin'} };
    worksheet.getCell('F5').border = { bottom: {style:'thin'} };
    worksheet.getCell('G5').border = { bottom: {style:'thin'} };
    worksheet.getCell('H5').border = { bottom: {style:'thin'} };

    // Row 3: Billing Details
    worksheet.addRow([]); // Spacer
    const rStart = 6;
    worksheet.mergeCells(`A${rStart}:E${rStart+5}`);
    worksheet.mergeCells(`F${rStart}:I${rStart+5}`);
    
    const billingLeft = worksheet.getCell(`A${rStart}`);
    billingLeft.value = `Billing Details\nName - ${booking.guest?.toUpperCase()}\nAddress - ${booking.address ? booking.address.toUpperCase() : ''}\nPhone No - ${booking.phone}\nEmail ID - ${booking.email}\n${booking.idType || 'Aadhar'} No - ${booking.idNumber}`;
    billingLeft.alignment = { wrapText: true, vertical: 'top' };
    billingLeft.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFCCE6EB' } }; // #cce6eb
    billingLeft.border = borderStyle;

    const billingRight = worksheet.getCell(`F${rStart}`);
    billingRight.value = `Invoice Number: ${booking.bookingId || booking.id?.slice(-6).toUpperCase()}\nInvoice Date: ${formatDate(new Date())}\n\nCheck In: ${formatDate(booking.checkIn)}\nCheck Out: ${formatDate(booking.checkOut)}`;
    billingRight.alignment = { wrapText: true, vertical: 'top' };
    billingRight.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFCCE6EB' } };
    billingRight.border = borderStyle;
    
    // Fix borders for merged cells manually
    ['B', 'C', 'D', 'E'].forEach(col => worksheet.getCell(`${col}${rStart+5}`).border = { bottom: {style:'thin'} });
    ['G', 'H', 'I'].forEach(col => worksheet.getCell(`${col}${rStart+5}`).border = { bottom: {style:'thin'} });
    ['E'].forEach(col => worksheet.getCell(`${col}${rStart}`).border = { right: {style:'thin'} });
    ['I'].forEach(col => worksheet.getCell(`${col}${rStart}`).border = { right: {style:'thin'} });


    // Row 4: Column Headers
    const headerRow = worksheet.addRow(['Room No', 'No of Days', 'Extra Bed', 'HSN/SAC', 'IGST 5%', 'CGST 2.5%', 'SGST 2.5%', 'Price/Day', 'Amount (₹)']);
    headerRow.eachCell(cell => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEEF5E0' } }; // #eef5e0
        cell.font = { bold: true };
        cell.alignment = { horizontal: 'center' };
        cell.border = borderStyle;
    });

    // Data Row
    const taxRate = booking.taxGST || 0;
    const gstType = booking.gstType || 'CGST+SGST';
    
    let pricePerDay = 0;
    cgst = 0;
    sgst = 0;
    let igst = 0;
    
    if (taxRate > 0) {
        const totalNights = booking.nights || 1;
        
        // Calculate total tax
        const totalBase = booking.amount / (1 + (taxRate / 100));
        const totalTax = booking.amount - totalBase;
        
        // Round tax amounts to 2 decimal places first
        if (gstType === 'CGST+SGST') {
            cgst = Math.round((totalTax / 2) * 100) / 100;
            sgst = Math.round((totalTax / 2) * 100) / 100;
        } else if (gstType === 'IGST') {
            igst = Math.round(totalTax * 100) / 100;
        }
        
        // Calculate base price dynamically from the exact remaining amount to prevent 1-paisa mismatches
        const baseAmount = booking.amount - (cgst + sgst + igst);
        pricePerDay = baseAmount / totalNights;
    } else {
        // No tax: price per day is total amount divided by nights
        pricePerDay = booking.amount / (booking.nights || 1);
    }
    const dataRow = worksheet.addRow([
        booking.room,
        booking.nights || 1,
        booking.extraBed ? '1' : '',
        '996311',
        igst > 0 ? igst.toFixed(2) : '0.00',
        cgst > 0 ? cgst.toFixed(2) : '0.00',
        sgst > 0 ? sgst.toFixed(2) : '0.00',
        pricePerDay.toFixed(2),
        booking.amount.toFixed(2)
    ]);
    dataRow.eachCell(cell => {
        cell.alignment = { horizontal: 'center' };
        cell.border = { left: {style:'thin'}, right: {style:'thin'} };
    });

    // Extra charges and food
    (booking.foodOrders || []).forEach(order => {
        const row = worksheet.addRow([`Food: ${order.item} (Qty: ${order.quantity})`, '', '', '', '', '', '', order.price.toFixed(2), order.amount.toFixed(2)]);
        worksheet.mergeCells(`A${row.number}:G${row.number}`);
        row.getCell(1).border = { left: {style:'thin'} };
        row.getCell(7).border = { right: {style:'thin'} };
        row.getCell(8).border = { left: {style:'thin'}, right: {style:'thin'} };
        row.getCell(9).border = { left: {style:'thin'}, right: {style:'thin'} };
    });
    
    (booking.extraCharges || []).forEach(charge => {
        const row = worksheet.addRow([`Extra Charge: ${charge.description}`, '', '', '', '', '', '', '-', charge.amount.toFixed(2)]);
        worksheet.mergeCells(`A${row.number}:G${row.number}`);
        row.getCell(1).border = { left: {style:'thin'} };
        row.getCell(7).border = { right: {style:'thin'} };
        row.getCell(8).border = { left: {style:'thin'}, right: {style:'thin'} };
        row.getCell(9).border = { left: {style:'thin'}, right: {style:'thin'} };
    });

    // Fill Empty Rows
    const currentRows = 1 + (booking.foodOrders?.length || 0) + (booking.extraCharges?.length || 0);
    const totalNeeded = 10;
    for (let i = currentRows; i < totalNeeded; i++) {
        const emptyRow = worksheet.addRow(['', '', '', '', '', '', '', '', '']);
        emptyRow.eachCell(cell => {
            cell.border = { left: {style:'thin'}, right: {style:'thin'} };
        });
    }

    // Totals
    const addFooterRow = (title, value, color) => {
        const r = worksheet.addRow([title, '', '', '', '', '', '', '', value]);
        worksheet.mergeCells(`A${r.number}:H${r.number}`);
        r.getCell(1).alignment = { horizontal: 'center' };
        r.getCell(1).font = { bold: true };
        r.getCell(9).font = { bold: true, color: { argb: color } };
        r.eachCell(cell => cell.border = borderStyle);
        return r;
    };

    addFooterRow('Rounded Off (+)', '+0.00');
    const totalRow = addFooterRow('Total', grandTotal.toFixed(2));
    totalRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFCCE6EB' } };
    totalRow.getCell(9).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFCCE6EB' } };
    
    addFooterRow('Advance Paid', Number(booking.advance || 0).toFixed(2), 'FF008000');
    
    const balanceRow = addFooterRow('Balance Due', Math.max(0, grandTotal - (booking.advance || 0)).toFixed(2), 'FFFF0000');
    balanceRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF3CD' } };
    balanceRow.getCell(9).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF3CD' } };

    // Amount in Words
    const wordsRow = worksheet.addRow([`In Words - Rs. ${amountInWords}`, '', '', '', '', '', '', '', '']);
    worksheet.mergeCells(`A${wordsRow.number}:I${wordsRow.number}`);
    wordsRow.getCell(1).font = { bold: true };
    wordsRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2DAE6' } }; // #e2dae6
    wordsRow.eachCell(cell => cell.border = borderStyle);

    // Signatures
    const sigRow = worksheet.addRow(['Please Note -\n1. Deposited your Key card at the receptionist\n2. Cross-check the room thoroughly before checking out', '', '', '', '', 
        `${booking.paymentStatus?.toUpperCase() || 'UNPAID'}\n\nBilling Officer's\nSignature`, '', 
        `\n\nGuest's\nSignature`, '']);
    
    worksheet.mergeCells(`A${sigRow.number}:E${sigRow.number}`);
    worksheet.mergeCells(`F${sigRow.number}:G${sigRow.number}`);
    worksheet.mergeCells(`H${sigRow.number}:I${sigRow.number}`);

    sigRow.getCell(1).alignment = { wrapText: true, vertical: 'top' };
    sigRow.getCell(1).font = { bold: true };
    sigRow.getCell(6).alignment = { wrapText: true, vertical: 'top', horizontal: 'center' };
    if (booking.paymentStatus === 'Paid') {
        sigRow.getCell(6).font = { color: { argb: 'FF008000' }, bold: true };
    } else {
        sigRow.getCell(6).font = { color: { argb: 'FFFF0000' }, bold: true };
    }
    sigRow.getCell(8).alignment = { wrapText: true, vertical: 'top', horizontal: 'center' };
    
    ['A', 'F', 'H'].forEach(col => {
        sigRow.getCell(col).border = borderStyle;
    });

    // Fetch and embed Logo Image
    if (logo) {
        try {
            // Using image elements drawn to canvas guarantees we get the pixels even in dev/prod modes
            const base64Str = await new Promise((resolve, reject) => {
                const img = new Image();
                img.crossOrigin = 'Anonymous';
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width || 120;
                    canvas.height = img.height || 100;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);
                    resolve(canvas.toDataURL('image/png').split(',')[1]);
                };
                img.onerror = () => reject(new Error('Image load failed'));
                // Append timestamp to prevent cache issues if any
                img.src = logo + '?t=' + new Date().getTime();
            });
            
            const logoId = workbook.addImage({
                base64: base64Str,
                extension: 'png',
            });
            
            worksheet.addImage(logoId, {
                tl: { col: 0.5, row: 1.2 }, // Centered in A2
                br: { col: 2.5, row: 4.8 }, 
                editAs: 'oneCell'
            });
        } catch (err) {
            console.error("Could not load logo for Excel export", err);
        }
    }

    // Generate Excel file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `Hotel_Bill_${booking.bookingId || booking.id?.slice(-6).toUpperCase() || 'Invoice'}.xlsx`);
};
