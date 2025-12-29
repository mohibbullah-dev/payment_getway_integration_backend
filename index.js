import express from "express";
import cors from "cors";
import { DB_CONNECT } from "./db.js";
import Stripe from "stripe";
import { Order } from "./model.js/order.model.js";

const app = express();

// webhook start here
const stripe = new Stripe(process.env.STRIPE_SECRET);

app.post(
  "/webhooks/stripe",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (error) {
      console.log("webhook verify faild :", error.message);
      return res.status(400).send(`webhook error : ${error.message}`);
    }

    try {
      if (event.type === "payment_intent.succeeded") {
        const pi = event.data.object;
        const orderId = event.metadata?.orderId;
        await Order.findByIdAndUpdate(orderId, {
          status: "PAID",
          paidTotal: pi?.amount,
          paymentIntendId: pi?.id,
        });
        console.log("✅ order paid vai webhook", orderId);
      }

      if (event.type === "payment_intent.payment_failed") {
        const pi = event.data?.object;
        const orderId = pi.metadata?.orderId;
        await Order.findByIdAndUpdate(orderId, {
          status: "FAILED",
          paymentIntendId: pi?.id,
        });
        console.log("❌ Webhook handler error:", orderId);
      }
      return res.json({ received: true });
    } catch (error) {
      console.log("webhook handler error ", error.message);
      return res.status(500).send(error.message);
    }
  }
);

DB_CONNECT();

app.use(express.json());
app.use(cors());

app.post("/", (req, res) => {
  try {
    return res.status(200).json({ message: "this is a test route" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// payment_intent_create

app.post("/api/orders/create-and-pay", async (req, res) => {
  // demo: fixed amount, বাস্তবে items থেকে calculate করবে
  const grandTotal = 1999;
  const currency = "usd";

  //  DB-তে order create

  try {
    const order = await Order.create({
      grandTotal,
      currency,
      status: "PENDING",
    });

    // Stripe PaymentIntent create
    const pi = await stripe.paymentIntents.create({
      amount: grandTotal,
      currency,
      automatic_payment_methods: { enabled: true },

      // ⭐ metadata super important:
      //    * webhook এ ফিরে এসে আমরা orderId ধরতে পারবো

      metadata: {
        orderId: order._id.toString(),
      },
    });

    order.paymentIntendId = pi?.id;
    await order.save();

    res.json({
      orderId: order._id,
      clientSecret: pi.client_secret,
      amount: grandTotal,
      currency,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/orders/:orderId", async (req, res) => {
  try {
    const order = await Order.findById(req?.params?.orderId);
    if (!order) return res.status(404).json({ er });
    res.json(order);
  } catch (error) {
    res.status(404).json({ error: "orders not found" });
  }
});

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log("server is running at 5000");
});
