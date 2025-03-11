"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_session_1 = __importDefault(require("express-session"));
const authroutes_1 = __importDefault(require("./routes/authroutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const passport_1 = __importDefault(require("./config/passport")); // Import passport config
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Session middleware (for Passport)
app.use((0, express_session_1.default)({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: true,
}));
// Initialize passport
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
// Use authentication routes
app.use("/auth", authroutes_1.default);
// Use user routes
app.use("/api/users", userRoutes_1.default);
// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
