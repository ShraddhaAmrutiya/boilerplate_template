import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";
import authRoutes from "./routes/authroutes";
import userRoutes from "./routes/userRoutes";
import passport from "./config/passport"; 
import "./config/dbinit"; 
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Session middleware (for Passport)
app.use(
  session({
    secret: process.env.JWT_SECRET as string,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Use authentication routes
app.use("/auth", authRoutes);

// Use user routes
app.use("/api/users", userRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

