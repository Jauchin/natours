import axios from 'axios';
import { showAlert } from './alert';
// 將 bookTour 函數定義在頂層範圍內
export const bookTour = async (tourId) => {
  try {
    // console.log(tourId);

    // 從 API 獲取結帳會話
    const session = await axios.get(
      `http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`,
    );

    // console.log(session);

    // 創建結帳表單並重定向到 Stripe 結帳頁面
    const stripe = Stripe(
      'pk_test_51PT3ZuIqsCSy7m8ldlJgfXsGcdMA49XhrhmotAw4ccJZCAQsYgQXbA8cHoLJzfIZIsYeuWbN54vgRScD9IRingsA00ECweNoBC',
    );

    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.error(err);
    // alert('Error: ' + err.message);
    showAlert('error', err);
  }
};
