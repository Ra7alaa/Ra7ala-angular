# 🚍 Ra7ala (رحالة) - Angular Frontend

Ra7ala's frontend is a modern, responsive single-page application built with **Angular 19** using the Standalone Components architecture. It serves passengers, company admins, and system owners with a clean, role-aware UI.

---

## 🚀 Key Features

### 👤 Passenger Experience
- **Smart Trip Search:** Find trips by origin/destination city, date, and required seat count.
- **Interactive Booking Flow:** Multi-step booking with real-time price calculation and station sequence validation.
- **Stripe Payments:** Secure card payment via Stripe Elements with client-secret flow.
- **My Bookings & Tickets:** Paginated view of booking history and digital tickets with status badges.
- **Cancel Booking:** One-click cancellation with confirmation dialog.

### 🤖 AI Assistant (Ra7ala Bot)
- **Floating Chat Widget:** Accessible from any page without navigation.
- **Live Trip Context:** Powered by Google Gemini — knows all upcoming trips, prices, and routes in real-time.
- **Multilingual:** Detects and responds in the user's language and dialect automatically.
- **Markdown Rendering:** Responses rendered with bold text, bullet lists, and clean formatting.
- **Quick Suggestions:** Pre-defined prompts to help users get started.

### 👨‍💼 Admin Dashboard
- **Fleet Management:** Full CRUD for buses with amenity tracking.
- **Driver Management:** Register, view, and manage company drivers.
- **Route Management:** Create and delete routes with multi-station support.
- **Trip Operations:** Schedule trips, assign drivers/buses, update trip status.
- **Station Management:** Manage company-specific and system-level stations.
- **Company Profile:** View and update company information and ratings.

### 🏢 Owner Dashboard
- **Company Approval Pipeline:** Review, approve, or reject new company registration requests.
- **Company Directory:** Browse all registered companies with detailed profiles.
- **Platform Overview:** High-level stats across the entire ecosystem.

### 🌐 UI/UX
- **Responsive Design:** Works on mobile, tablet, and desktop.
- **PrimeNG + Bootstrap 5:** Rich component library with consistent styling.
- **Skeleton Loaders:** Professional loading states during data fetching.
- **Toast Notifications:** Real-time feedback via ngx-toastr.
- **Error Pages:** Dedicated 403, 404, and 500 error pages.

---

## 🏗️ Architecture

```
src/app/
├── core/           # Guards, Interceptors, Theme & Language Services
├── features/
│   ├── auth/       # Login, Register, Forgot Password, Company Register
│   ├── trips/      # Search, Booking, Payment, Trip Details
│   ├── profile/    # My Bookings & Tickets
│   ├── admin/      # Admin Dashboard (Buses, Drivers, Routes, Trips)
│   ├── owner/      # Owner Dashboard (Company Management)
│   ├── home/       # Landing Page
│   ├── about/      # About Page
│   └── settings/   # Language & Theme Settings
├── layout/         # Header, Footer, Sidebar, Main Layout
└── shared/         # Chatbot, Search, Booking Service, City Service
```

### Key Patterns
- **Standalone Components** — No NgModules for feature components
- **Lazy Loading** — All feature modules loaded on demand
- **Role-Based Guards** — `roleGuard()` factory protects routes per `UserRole`
- **Auth Interceptor** — Automatically attaches JWT Bearer token to all requests
- **RxJS BehaviorSubject** — Reactive user state, language, and theme management

---

## 🛠️ Technical Stack

| Category | Technology |
|---|---|
| Framework | Angular 19 |
| UI Library | PrimeNG 19 + Bootstrap 5.3 |
| State | RxJS 7.8 |
| Payments | @stripe/stripe-js |
| Icons | Bootstrap Icons + FontAwesome + PrimeIcons |
| Notifications | ngx-toastr |
| HTTP | Angular HttpClient + Interceptors |
| Auth | JWT + Role Guards |

---

## 🔑 Environment Configuration

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'https://localhost:7111/api',  // Change to your backend URL
};
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18+
- [Angular CLI](https://angular.dev/tools/cli) v19

### Installation

```bash
# Install dependencies
npm install

# Start development server
ng serve -o

# Build for production
ng build
```

The app runs at `http://localhost:4200` by default.

---

## 🔐 User Roles & Routes

| Role | Default Route | Access |
|---|---|---|
| Passenger | `/` | Home, Search, Booking, Payment, Profile |
| Admin | `/admin/dashboard` | Admin Dashboard |
| SuperAdmin | `/admin/dashboard` | Admin Dashboard (full access) |
| Owner | `/owner/dashboard` | Owner Dashboard |
| Driver | `/` | Home only |
| Guest | `/` | Home, About, Company Register |

---

**Crafted with precision by the Ra7ala Engineering Team**
