exports.extractPayload = (body) => {
  const phone = String(body.customerPhone || '').replace(/\D/g, '');
  const name  = (body.customerName || 'Customer').trim();

  const productName = String(body.productInfo || '')
    .split('*')[0]
    .replace(/\s+\|\s+/, ' – ')
    .trim();

  const mrp  = Number(body.cartTotal     || 0);
  const off  = Number(body.discountTotal || 0);
  const pct  = off ? Math.round((off / mrp) * 100) + '%' : '0%';
  const final = (mrp - off).toFixed(2);

  return {
    phoneNumber: phone,
    countryCode: '+91',
    name,
    productName,
    discount: pct,
    finalPrice: final,
    headerImageUrl: `https://bwgrab-abandoned-cart.onrender.com/cart-image?token=${body.cartId}`,
    cartUrl: body.abandonedCartLink
  };
};