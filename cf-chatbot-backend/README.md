# CF Chatbot Backend — Hostinger Deploy Steps

1. hPanel → Advanced → Node.js → Create Application
   - Node: 22.x • Mode: Production
   - App root: `cf-chatbot-backend`
   - App URL: `cf-chatbot.hiraya.digital`
   - Startup file: `app.js`

2. Upload this folder's contents to `~/cf-chatbot-backend/` (hPanel File Manager → upload zip → extract).

3. In hPanel Node.js app panel:
   - Click **Run NPM Install**
   - Then **Restart**

4. SSH in and run migrations + product sync:
   ```
   cd ~/cf-chatbot-backend
   source /home/u603392249/nodevenv/cf-chatbot-backend/22/bin/activate
   npm run migrate
   npm run sync-products
   ```

5. Visit https://cf-chatbot.hiraya.digital/health — should return `{"ok":true}`.
