import { Link, Navigate, useNavigate } from "react-router-dom";
import { useUserContext } from "../context/userContext";
import { useCartContext } from "../context/cartContext";
import { useState } from "react";
import useFetch from "../hooks/useFetch";
import LoadingIndicator from "../components/LoadingIndicator";
import LoadingPage from "../components/LoadingPage";
import { useEffect } from "react";

export default function CheckoutPage() {
  const [cardNumber, setCardNumber] = useState("");
  const [nameOnCard, setNameOnCard] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [CVV, setCVV] = useState("");

  useEffect(() => {
    document.title = "Checkout - LearnEx";
  }, []);

  const { user } = useUserContext();
  const { cartItems, cartLoading, resetCart } = useCartContext();

  const navigate = useNavigate();

  const { fetchData, loading } = useFetch({
    url: "/order",
    onSuccess(result) {
      resetCart();
      navigate(`/checkout/success?id=${result.data._id}`);
    },
    method: "POST",
    body: {
      cartItems: cartItems.map(({ course }) => course._id),
      totalPrice: cartItems.reduce((acc, curr) => acc + curr.course.price, 0),
      userId: user?._id,
    },
  });

  if (!user) return <Navigate to={"/login"} replace />;

  if (cartLoading) return <LoadingPage />;

  const totalPrice = (
    cartItems.reduce((acc, curr) => acc + curr.course.price, 0) / 100
  ).toFixed(2);

  const cannotSubmit =
    !cardNumber || !nameOnCard || expiryDate.length < 5 || CVV.length < 3;

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault();
    if (loading || cannotSubmit) return;
    fetchData();
  }

  if (cartItems.length < 1) {
    return (
      <main className="flex h-full flex-1 flex-col items-center justify-center text-zinc-500">
        You have no courses in your cart
        <Link to={"/courses"} className="text-blue-500 hover:underline">
          Keep shopping
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-[90%] max-w-7xl flex-1 flex-col gap-8 py-8 lg:flex-row">
      <div className="flex flex-col gap-2 lg:order-2 lg:flex-1">
        <h1 className="text-lg font-medium sm:text-xl">Order Details</h1>
        {cartItems.map(({ course }) => (
          <div
            key={course._id}
            className="flex gap-2 rounded-lg border border-blue-200 bg-blue-50 p-2"
          >
            <img
              src={course.thumbnail}
              alt={course.title}
              className="aspect-video w-24 rounded-sm object-cover"
            />
            <div className="flex-1 text-sm">
              <h3>{course.title}</h3>
              <p className="font-medium">${(course.price / 100).toFixed(2)}</p>
            </div>
          </div>
        ))}
        <div className="rounded-lg border border-zinc-200 p-4">
          <p className="flex items-center justify-between">
            Total Price: <span className="font-medium">${totalPrice}</span>
          </p>
        </div>
      </div>

      <form
        onSubmit={handleCheckout}
        className="flex h-fit flex-[2] flex-col gap-4 rounded-lg border border-zinc-300 p-4 text-sm"
      >
        <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-4 text-yellow-800">
          <p>
            This is a test transaction. You can use any card number, expiry
            date, and CVV.
          </p>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="card-number">Card Number</label>
          <input
            type="text"
            id="card-number"
            name="card-number"
            placeholder="XXXX XXXX XXXX XXXX"
            inputMode="numeric"
            value={cardNumber}
            onChange={(e) => {
              let value = e.target.value.replace(/\D/g, "");
              value = value.replace(/(.{4})/g, "$1 ").trim();
              if (value.length > 19) value = value.slice(0, 19);
              setCardNumber(value);
            }}
            className="w-full rounded-md border border-zinc-300 p-2"
          />
        </div>
        <div className="flex gap-4">
          <div className="flex flex-1 flex-col gap-1">
            <label htmlFor="expiry-date">Expiry Date</label>
            <input
              type="text"
              id="expiry-date"
              name="expiry-date"
              placeholder="MM/YY"
              inputMode="numeric"
              value={expiryDate}
              maxLength={5}
              onChange={(e) => {
                let value = e.target.value.replace(/\D/g, "");
                if (value.length > 4) value = value.slice(0, 4);
                if (value.length > 2)
                  value = `${value.slice(0, 2)}/${value.slice(2)}`;
                setExpiryDate(value);
              }}
              className="w-full rounded-md border border-zinc-300 p-2"
            />
          </div>
          <div className="flex flex-1 flex-col gap-1">
            <label htmlFor="cvv">CVV</label>
            <input
              type="text"
              id="cvv"
              name="cvv"
              placeholder="123"
              inputMode="numeric"
              maxLength={3}
              value={CVV}
              onChange={(e) => {
                if (isNaN(Number(e.target.value))) return;

                setCVV(e.target.value);
              }}
              className="w-full rounded-md border border-zinc-300 p-2"
            />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="name-on-card">Name on Card</label>
          <input
            type="text"
            id="name-on-card"
            name="name-on-card"
            placeholder="John Doe"
            value={nameOnCard}
            onChange={(e) => setNameOnCard(e.target.value)}
            className="w-full rounded-md border border-zinc-300 p-2"
          />
        </div>
        <button
          disabled={cannotSubmit || loading}
          type="submit"
          className="flex h-10 items-center justify-center rounded-lg bg-blue-500 px-4 py-2 text-center text-sm font-medium text-white ring-blue-400 ring-offset-2 duration-200 hover:bg-blue-600 focus-visible:ring-2 disabled:cursor-not-allowed disabled:bg-blue-500/50 sm:text-base"
        >
          {loading ? <LoadingIndicator /> : "Pay"}
        </button>
      </form>
    </main>
  );
}
