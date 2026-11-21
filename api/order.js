const CATALOG = {
  orbit: { name: "The Orbit", price: 89, accent: "#5f7a5b" },
  "orbit-plus": { name: "The Orbit Plus", price: 109, accent: "#5f7a5b" },
  "full-den": { name: "The Full Den", price: 139, accent: "#5f7a5b" },
  "snuffle-mat": { name: "The Snuffle Mat", price: 34, accent: "#7c8f6b" },
  "lick-mat": { name: "The Lick Mat", price: 19, accent: "#c07a52" },
  "slow-bowl": { name: "The Slow Bowl", price: 28, accent: "#8a6a45" },
  "trail-harness": { name: "The Trail Harness", price: 54, accent: "#3f5d4a" },
  "cool-mat": { name: "The Cool Mat", price: 64, accent: "#5b7f8a" },
  "treat-pouch": { name: "The Treat Pouch", price: 32, accent: "#a85a37" },
  "dental-chew": { name: "The Dental Chew", price: 16, accent: "#b98a5a" },
  pawmatch: { name: "PawMatch", price: 39, accent: "#9b6b8f" }
};

const COLORS = {
  moss: "Moss",
  clay: "Clay",
  bone: "Bone",
  natural: "Natural"
};

const TAX_RATE = 0.08;
const FREE_SHIPPING_AT = 75;
const SHIPPING_FLAT = 8;
const MAX_QTY = 10;

const round = (value) => Math.round(value * 100) / 100;

function send(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.end(JSON.stringify(payload));
}

function readBody(req) {
  if (req.body && typeof req.body === "object" && !Buffer.isBuffer(req.body)) {
    return Promise.resolve(req.body);
  }
  if (Buffer.isBuffer(req.body)) {
    try {
      return Promise.resolve(JSON.parse(req.body.toString("utf8")));
    } catch (error) {
      return Promise.resolve(null);
    }
  }
  if (typeof req.body === "string") {
    try {
      return Promise.resolve(JSON.parse(req.body));
    } catch (error) {
      return Promise.resolve(null);
    }
  }
  return new Promise((resolve) => {
    let raw = "";
    let finished = false;
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 1000000 && !finished) {
        finished = true;
        resolve(null);
      }
    });
    req.on("end", () => {
      if (finished) return;
      try {
        resolve(raw ? JSON.parse(raw) : null);
      } catch (error) {
        resolve(null);
      }
    });
    req.on("error", () => resolve(null));
  });
}

function clean(value, max) {
  return String(value == null ? "" : value).trim().slice(0, max || 160);
}

function makeOrderId() {
  const stamp = Date.now().toString(36).toUpperCase().slice(-5);
  const random = Math.random().toString(36).toUpperCase().slice(2, 5);
  return "ROVE-" + stamp + random;
}

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.end();
    return;
  }

  if (req.method !== "POST") {
    send(res, 405, {
      ok: false,
      error: "Method not allowed. Send a POST request with your order as JSON."
    });
    return;
  }

  const data = await readBody(req);
  if (!data || typeof data !== "object") {
    send(res, 400, { ok: false, error: "Invalid JSON body." });
    return;
  }

  if (!Array.isArray(data.items) || data.items.length === 0) {
    send(res, 400, { ok: false, error: "Your cart is empty." });
    return;
  }

  if (data.items.length > 20) {
    send(res, 400, { ok: false, error: "Too many cart lines." });
    return;
  }

  const merged = new Map();
  for (const item of data.items) {
    if (!item || typeof item !== "object") {
      send(res, 400, { ok: false, error: "Each cart item must be an object." });
      return;
    }
    const id = clean(item.id, 40);
    const color = clean(item.color, 20).toLowerCase();
    const qty = Number(item.qty);
    if (!CATALOG[id]) {
      send(res, 400, { ok: false, error: "Unknown product: " + id });
      return;
    }
    if (!COLORS[color]) {
      send(res, 400, { ok: false, error: "Unknown colour: " + color });
      return;
    }
    if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QTY) {
      send(res, 400, {
        ok: false,
        error: "Quantity must be a whole number between 1 and " + MAX_QTY + "."
      });
      return;
    }
    const key = id + "|" + color;
    const existing = merged.get(key);
    if (existing) {
      existing.qty += qty;
      if (existing.qty > MAX_QTY) {
        send(res, 400, {
          ok: false,
          error: "Quantity limit is " + MAX_QTY + " per item."
        });
        return;
      }
    } else {
      merged.set(key, { id: id, color: color, qty: qty });
    }
  }

  const customer = data.customer && typeof data.customer === "object" ? data.customer : {};
  const required = [
    "firstName",
    "lastName",
    "email",
    "address1",
    "city",
    "region",
    "postal",
    "country"
  ];
  const missing = required.filter((field) => !clean(customer[field], 200));
  if (missing.length) {
    send(res, 400, {
      ok: false,
      error: "Missing required shipping details: " + missing.join(", ") + "."
    });
    return;
  }

  const email = clean(customer.email, 200).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    send(res, 400, { ok: false, error: "Please provide a valid email address." });
    return;
  }

  const paymentInput = data.payment && typeof data.payment === "object" ? data.payment : {};
  const method = paymentInput.method === "cod" ? "cod" : "card";
  let last4 = null;
  if (method === "card") {
    last4 = String(paymentInput.last4 == null ? "" : paymentInput.last4).replace(/\D/g, "");
    if (!/^\d{4}$/.test(last4)) {
      send(res, 400, {
        ok: false,
        error: "A valid card ending (last four digits) is required."
      });
      return;
    }
  }

  const items = Array.from(merged.values()).map((item) => {
    const unitPrice = CATALOG[item.id].price;
    return {
      id: item.id,
      name: CATALOG[item.id].name,
      color: item.color,
      colorName: COLORS[item.color],
      qty: item.qty,
      unitPrice: unitPrice,
      accent: CATALOG[item.id].accent,
      lineTotal: round(unitPrice * item.qty)
    };
  });

  const subtotal = round(items.reduce((sum, item) => sum + item.lineTotal, 0));
  const shipping = subtotal >= FREE_SHIPPING_AT ? 0 : SHIPPING_FLAT;
  const tax = round(subtotal * TAX_RATE);
  const total = round(subtotal + shipping + tax);

  const created = new Date();
  const delivery = new Date(created.getTime() + 6 * 24 * 60 * 60 * 1000);

  const order = {
    id: makeOrderId(),
    createdAt: created.toISOString(),
    estimatedDelivery: delivery.toISOString(),
    status: "confirmed",
    items: items,
    subtotal: subtotal,
    shipping: shipping,
    tax: tax,
    total: total,
    customer: {
      firstName: clean(customer.firstName, 120),
      lastName: clean(customer.lastName, 120),
      email: email,
      phone: clean(customer.phone, 60),
      address1: clean(customer.address1, 200),
      address2: clean(customer.address2, 200),
      city: clean(customer.city, 120),
      region: clean(customer.region, 120),
      postal: clean(customer.postal, 40),
      country: clean(customer.country, 120)
    },
    payment: {
      method: method,
      last4: last4
    }
  };

  send(res, 201, {
    ok: true,
    message: "Order confirmed.",
    order: order
  });
};
