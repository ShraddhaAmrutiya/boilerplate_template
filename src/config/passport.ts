import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
import pool from "../config/db"; 

dotenv.config();

// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: process.env.GOOGLE_CLIENT_ID as string,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
//       callbackURL: process.env.GOOGLE_CALLBACK_URL as string,
//     },
//     async (accessToken, refreshToken, profile, done) => {
//       try {

//         const email = profile.emails ? profile.emails[0].value : null;
//         if (!email) {
//           console.log("Email not found in Google profile");
//           return done(null, false);
//         }

//         // Check if user exists
//         const result = await pool.query("SELECT * FROM users WHERE google_id = $1", [profile.id]);
//         let user = result.rows[0];

//         if (!user) {
//           // If user doesn't exist, create new user
//           const insertResult = await pool.query(
//             "INSERT INTO users (username, user_email, google_id) VALUES ($1, $2, $3) RETURNING *",
//             [profile.displayName, email, profile.id]
//           );
//           user = insertResult.rows[0];
//         }
//         return done(null, user);
//       } catch (err) {
//         console.error("Error in Google Strategy:", err);
//         return done(err, false);
//       }
//     }
//   )
// );

// Serialize user

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL: process.env.GOOGLE_CALLBACK_URL as string,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails ? profile.emails[0].value : null;
        if (!email) {
          console.log("Email not found in Google profile");
          return done(null, false);
        }

        // Check if user exists
        const result = await pool.query("SELECT * FROM users WHERE google_id = $1", [profile.id]);
        let user = result.rows[0];

        if (!user) {
          // If user doesn't exist, create a new user with login_by_google = true
          const insertResult = await pool.query(
            "INSERT INTO users (username, user_email, google_id, login_by_google) VALUES ($1, $2, $3, $4) RETURNING *",
            [profile.displayName, email, profile.id, true]
          );
          user = insertResult.rows[0];
        } else {
          // Update existing user to mark them as Google login
          await pool.query("UPDATE users SET login_by_google = $1 WHERE id = $2", [true, user.id]);
        }

        user.login_by_google = true; // Attach flag to user object
        return done(null, user);
      } catch (err) {
        console.error("Error in Google Strategy:", err);
        return done(err, false);
      }
    }
  )
);



passport.serializeUser((user: any, done) => {

  done(null, user.id);
});

// Deserialize user
passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    const user = result.rows[0] || null;
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

export default passport;
