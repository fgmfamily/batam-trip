# Batam Family Trip: Setup Guide (GitHub Pages + Supabase)

## What each file is for
- **index.html**: the trip app itself
- **config.js**: the ONLY file you edit. Holds your Supabase address and public key
- **shim.js**: lets the app talk to your Supabase (do not edit)
- **sw.js**: makes the app work with no internet (do not edit)
- **manifest.webmanifest** and **icons/**: let family add the app to their home screen
- **supabase.sql**: sets up the database (you paste it into Supabase)
- **img/, view/, files/**: pictures, menus and PDFs
- **.nojekyll**: tells GitHub to publish files as they are (keep it)

---

## PART A: Put the app online (GitHub Pages)

### A1. Make a GitHub account
- Open https://github.com on your computer
- Click **Sign up**
- Enter email, password, username. Verify the email code
- Pick a username without your full name (it shows in the link)

### A2. Make a repository (a folder online)
- Click the **+** at top right, then **New repository**
- Repository name: `batam-trip`
- Choose **Public** (GitHub Pages free plan needs Public)
- Do NOT tick "Add a README"
- Click **Create repository**

### A3. Upload the files
- Unzip the package on your computer first
- On the empty repository page click **uploading an existing file**
- Open the unzipped folder, select EVERYTHING inside (index.html, config.js, shim.js, sw.js, manifest.webmanifest, supabase.sql, SETUP-GUIDE.md, and the folders img, view, files, icons)
- Drag them all into the browser page
- Wait until every file shows a green tick
- Note: `.nojekyll` is a hidden file. If you cannot see it, skip it: the app still works
- Scroll down, click **Commit changes**

### A4. Switch on GitHub Pages
- Click **Settings** (top tab of the repository)
- Click **Pages** (left menu)
- Under **Branch** choose `main` and folder `/ (root)`, click **Save**
- Wait 1 to 3 minutes, refresh the page
- A green box shows your link: `https://YOURNAME.github.io/batam-trip/`
- Open it on your phone and check the app loads

---

## PART B: Live shared orders (Supabase)

Use a NEW Supabase project just for this trip. Do not use your other apps' projects.

### B1. Create the project
- Go to https://supabase.com, sign in
- Click **New project**
- Name: `batam-trip`
- Database password: click **Generate a password**, then SAVE it in your password manager
- Region: **Southeast Asia (Singapore)**
- Click **Create new project**. Wait about 2 minutes

### B2. Switch on anonymous sign-in
- Left menu: **Authentication**
- Click **Sign In / Providers**
- Find **Anonymous Sign-Ins**, switch it **ON**, click **Save**
- Why: family members join with one tap, no email or password

### B3. Choose your organiser passcode
- On your computer open `supabase.sql` in Notepad
- Find `CHANGE-ME-PASSCODE` (near the bottom)
- Replace it with your own passcode, keep the quote marks `'`
- Use 10+ characters. Do not reuse a real password

### B4. Run the SQL
- Left menu: **SQL Editor**, click **New query**
- Copy ALL text of `supabase.sql` and paste it in
- Click **Run**
- You should see "Success. No rows returned"
- Check: left menu **Table Editor** shows `site_docs`, `plans`, `orders`, `admin_secret`

### B5. Copy your two keys
- Left menu: **Project Settings** (gear icon), then **API Keys** (or **Data API**)
- Copy **Project URL** (looks like `https://abcd1234.supabase.co`)
- Copy the **anon / public** key (a long text starting `eyJ...` or `sb_publishable_...`)
- NEVER copy the **service_role** or **secret** key. It must never go in config.js

### B6. Put them in config.js
- On GitHub open your repository, click **config.js**, click the pencil (Edit)
- Paste the URL between the quotes after SUPABASE_URL
- Paste the key between the quotes after SUPABASE_ANON_KEY
- Click **Commit changes**
- Wait 1 to 2 minutes for GitHub to publish

### B7. Test it
- Open your link on your phone, go to **Info**
- "Live sharing: on" should show
- Tap **Organiser sign-in**, enter your passcode. It says "Signed in as organiser"
- Ask a family member to open the link and place an order
- Their order should appear on your phone within about 15 seconds

---

## PART C: Family installs it

### iPhone (Safari only)
- Open the link in Safari
- Tap the Share button (square with arrow)
- Tap **Add to Home Screen**, then **Add**

### Android (Chrome)
- Open the link in Chrome
- Tap the 3 dots, then **Install app** or **Add to Home screen**

### Make it work with no internet (everyone does this once)
- Open the app on Wi-Fi
- Go to **Info**, tap **Save everything for offline**
- Wait for "Saved ... files for offline use. Done."
- Test: switch on Airplane mode, open the app. The plan, menus and files should load
- Orders made offline are sent automatically when internet returns

---

## Updating later
- Edit a file on GitHub (pencil icon), or upload a new copy with the same name
- Wait 1 to 2 minutes
- Family may need to close and reopen the app to see changes
- If a change does not show: Settings in the browser, clear site data for the link

## Risks and safety (read once)
- **Public link**: anyone with the link can see the page, including children's names and ages (you chose to keep this). Only share the link in your family chat
- **The anon key is public by design**: it is safe ONLY because of the locks in supabase.sql. Do not turn off Row Level Security
- **Never use** the service_role key anywhere in these files
- **Passcode**: only the organiser edits shared notes and rates. Wrong guesses are possible, so use a long passcode. To change it, edit the passcode line in supabase.sql and run it again
- **Free plan pausing**: Supabase pauses free projects after about 1 week with no use. Open the app a few days before the trip. If paused, click **Restore** in the Supabase dashboard
- **Backup**: Supabase, Table Editor, each table, Export to CSV, after the final orders. GitHub also keeps every version of your files
- **Second admin**: write the Supabase login, GitHub login and passcode where a family member you trust can find them
- **Test vs live**: nothing here is connected to your other apps. After the trip you can delete the Supabase project and the GitHub repository
- **Costs**: all figures in the app are estimates. Confirm real prices at the counter
