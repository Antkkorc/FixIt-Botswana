export function formatCurrency(amount){
  try{
    return new Intl.NumberFormat('en-BW', { style: 'currency', currency: 'BWP' }).format(amount);
  }catch(e){
    // Fallback
    return `BWP ${amount}`;
  }
}
