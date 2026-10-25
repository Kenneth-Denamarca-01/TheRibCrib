# The Rib Crib – setup (about 20 minutes, all free)

You need: a Google account, a free Netlify account (netlify.com), and the PC that is connected to your office printer.

## 1. Create the backend (Google Sheet + Apps Script)
1. Go to sheets.google.com and create a blank sheet named "Rib Crib Orders".
2. Menu: Extensions > Apps Script. Delete the sample code and paste everything from `Code.gs`.
3. On the first line, change `CHANGE-THIS-TO-A-LONG-SECRET` to your own staff password. Save.
4. Click Deploy > New deployment > type "Web app".
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Still in Apps Script, open Project Settings (gear icon) and set the time zone to your local one, so "today" matches your day. Then click Deploy, approve the permissions, and copy the **Web app URL** (it starts with https://script.google.com/...).
   Orders and reservations will appear as rows in the sheet's "Orders" and "Reservations" tabs.

## 2. Connect the app
Open `index.html` and `kitchen.html` in Notepad. In each, replace `PASTE_URL_HERE` with the Web app URL (keep the quotation marks). Save both.

## 3. Put it online
Go to app.netlify.com/drop and drag this whole folder onto the page. Netlify gives you a web address. (You can rename it in Site settings.)
- Customers open: `your-address/`
- Kitchen opens: `your-address/kitchen.html`

## 4. Kitchen PC and printer
1. Set your office printer as the PC's default printer.
2. Close Chrome. Right-click the Chrome shortcut > Properties. In "Target", add a space and `--kiosk-printing` after the closing quote, e.g.
   `"C:\Program Files\Google\Chrome\Application\chrome.exe" --kiosk-printing`
3. Open that Chrome, go to `your-address/kitchen.html`, and enter your staff key. Keep the page open.
New orders now print by themselves. Press Done when an order is finished. For reservations, press Confirm or Decline, then call or text the customer from the number shown.

## End-of-day sales
The Kitchen page has a **Sales** box at the top. It shows today's total sales, number of orders, average order, dine-in vs pickup totals and how many of each dish sold. Pick another date to see past days, or press **Print report** to print it. It counts every order received that day, whether or not it was marked Done.

## 5. Install on phones
Open your address on the phone: Android Chrome menu > Install app; iPhone Safari Share > Add to Home Screen.

## Notes
- Anyone with your web address can place an order, so check unusual orders. Only people with the staff key can read orders.
- Edit the menu in `index.html` (the `MENU` list near the top of the script).
- Change the currency symbol with `CUR` in `index.html`.
