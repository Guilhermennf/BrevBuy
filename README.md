# 🛒 Product Management System for Reselling

A complete system built with Next.js to manage purchased and sold products, ideal for small entrepreneurs and resellers.

## ✨ Features

- **📦 Product Management**: Create, edit, and delete products
- **💰 Financial Tracking**: Monitor profits and losses
- **📊 Dashboard**: Real-time sales and product statistics
- **🔄 Product Status**: Mark products as sold or available
- **🌙 Dark Mode**: Elegant interface with dark theme by default
- **📱 Responsive**: Works perfectly on desktop and mobile

## 🚀 Technologies Used

### Frontend

- **Next.js 14** - React framework with App Router
- **TypeScript** - Static typing
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Modern UI components
- **Lucide React** - Consistent icon set

### Backend & Database

- **Prisma** - Modern ORM for TypeScript
- **SQLite** - Local database
- **Zod** - Schema validation

### Forms & UX

- **React Hook Form** - Form state management
- **React Hot Toast** - Elegant notifications
- **Next Themes** - Theme management

## 📋 Prerequisites

- Node.js 18.17 or higher
- npm or yarn

## ⚡ Installation and Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/Guilhermennf/BrevBuy.git
   cd BrevBuy
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up the database**

   ```bash
   npx prisma db push
   npx prisma generate
   ```

4. **Run the project**

   ```bash
   npm run dev
   ```

5. **Open the application**
   Visit [http://localhost:3000](http://localhost:3000) in your browser.

## 📖 How to Use

### Adding a Product

1. Click the "Add Product" button
2. Fill in the product information:
   - Name (required)
   - Description
   - Purchase price (required)
   - Category
   - Supplier
   - Image URL
3. Click "Add"

### Marking as Sold

1. Click the three-dot menu on the product
2. Select "Mark as Sold"
3. Enter the sale price
4. Confirm the operation

### Viewing Statistics

The dashboard automatically shows:

- Total invested
- Total sold
- Total profit and margin
- Available products

## 🎨 Project Structure

```
BrevBuy/
├── app/                    # Pages and API routes (App Router)
│   ├── api/               # API endpoints
│   │   └── products/      # Product CRUD
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Main layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # shadcn/ui base components
│   ├── product-form.tsx  # Product form
│   └── stats-cards.tsx   # Stats cards
├── hooks/                # Custom hooks
├── lib/                  # Utilities and configuration
│   ├── prisma.ts         # Prisma client
│   └── utils.ts          # Utility functions
├── prisma/               # Database schema
└── public/               # Static assets
```

## 🔧 Available Scripts

- `npm run dev` - Run in development mode
- `npm run build` - Build for production
- `npm run start` - Run production build
- `npm run lint` - Run linter
- `npx prisma studio` - Visual database interface

## 🤝 Contributing

1. Fork the project
2. Create a branch for your feature (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to your branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License. See the `LICENSE` file for details.

## 🐛 Report Issues

Found a bug? [Open an issue](https://github.com/Guilhermennf/BrevBuy/issues) with details.

---

Built by Guilherme Nunes
