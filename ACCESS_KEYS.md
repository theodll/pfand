# Pfand Tracker - Access Keys

## User Accounts

Use these credentials to log in to the **shared Pfand stash**:

### Leander
- **Name:** `leander`
- **Key:** `pfand-leander-2024-key`

### Theo
- **Name:** `theo`
- **Key:** `pfand-theo-2024-key`

### Evan
- **Name:** `evan`
- **Key:** `pfand-evan-2024-key`

### Ronon
- **Name:** `ronon`
- **Key:** `pfand-ronon-2024-key`

---

## Features

- **Shared Pfand Pool** - Everyone sees the same total balance and bottle count
- **Transaction Attribution** - Each withdrawal shows who took the bottles
- **Deposit Tracking** - Everyone can add bottles to the shared pool
- **Transparent History** - Full transaction history visible to all users
- Data is stored in both Supabase (cloud) and localStorage (browser)
- Click "Show Access Keys" on the login page to see keys during development
- Logout button to switch between users
- Reset button clears ALL shared data (use with caution!)

## How It Works

1. **Adding Bottles**: Anyone can add bottles - they go into the shared pool
2. **Withdrawing Money**: When you cash out, it shows your name (e.g., "Cashed out • by theo")
3. **Shared Balance**: Everyone sees the same total money and bottle count
4. **Accountability**: Transaction history shows who withdrew what and when

## Security Note

These are hardcoded development keys stored in plain text. This is intentional for easy management among friends/roommates.
