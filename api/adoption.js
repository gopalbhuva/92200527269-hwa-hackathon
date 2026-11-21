const DOGS = {
  biscuit: "Biscuit",
  nova: "Nova",
  miso: "Miso",
  rocky: "Rocky",
  juniper: "Juniper",
  peanut: "Peanut",
  atlas: "Atlas",
  clover: "Clover"
};

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
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 1000000) resolve(null);
    });
    req.on("end", () => {
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
  return String(value == null ? "" : value).trim().slice(0, max || 200);
}

function makeReference() {
  const stamp = Date.now().toString(36).toUpperCase().slice(-5);
  const random = Math.random().toString(36).toUpperCase().slice(2, 5);
  return "PAW-" + stamp + random;
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
      error: "Method not allowed. Send a POST request with your adoption request as JSON."
    });
    return;
  }

  const data = await readBody(req);
  if (!data || typeof data !== "object") {
    send(res, 400, { ok: false, error: "Invalid JSON body." });
    return;
  }

  const dogId = clean(data.dog, 40).toLowerCase();
  if (!DOGS[dogId]) {
    send(res, 400, { ok: false, error: "Please choose one of the available dogs." });
    return;
  }

  const name = clean(data.name, 120);
  const email = clean(data.email, 200).toLowerCase();
  const phone = clean(data.phone, 60);
  const message = clean(data.message, 5000);

  const missing = [];
  if (!name) missing.push("name");
  if (!email) missing.push("email");
  if (!message) missing.push("message");
  if (missing.length) {
    send(res, 400, {
      ok: false,
      error: "Missing required fields: " + missing.join(", ") + "."
    });
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    send(res, 400, { ok: false, error: "Please provide a valid email address." });
    return;
  }

  if (message.length < 10) {
    send(res, 400, {
      ok: false,
      error: "Please write a message of at least 10 characters."
    });
    return;
  }

  send(res, 201, {
    ok: true,
    message: "Adoption request received.",
    reference: makeReference(),
    received: {
      dog: DOGS[dogId],
      name: name,
      email: email,
      phone: phone
    }
  });
};
