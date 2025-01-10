import livereload from "livereload";
import connectLivereload from "connect-livereload";
import express from "express";
import { dirname } from 'path';
import session from "express-session";
import path from 'path';
import { fileURLToPath } from 'url';

// import the router from the auth.js file
import user from "./routes/user.js";
import pages from "./routes/pages.js";
import auth from "./routes/auth.js";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";


const app = express();
const PORT = process.env.PORT || 3000;

app.use(session({
  secret: process.env.SESSION_SECRETE,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}))

app.set("view engine", "ejs");
app.use(express.static("public"));

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Middleware
app.use(express.json()); 
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser())
app.use('/files', express.static(path.join(__dirname, '..', 'folders')));

// Live Reload
const liveReloadServer = livereload.createServer({
  exts: ['ejs', 'css', 'js']
});


liveReloadServer.watch([`${__dirname}/public`, `${__dirname}/views`]);

app.use(connectLivereload());

liveReloadServer.server.once("connection", () => {
  setTimeout(() => {
    liveReloadServer.refresh("/"); 
  }, 1000);
});
  
// API Routes 
app.use("/api", user);

// Pages Routes
app.use("/", pages);

// Auth Routes
app.use('/auth', auth)
 
mongoose.connect('mongodb://localhost:27017/file_box',).then(() => {
  app.listen(PORT, () => {
    console.log(`Server @ http://localhost:${PORT}`);
  }); 
})
