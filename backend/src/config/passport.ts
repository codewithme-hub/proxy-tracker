import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { env } from "./env.js";
import { User } from "../models/User.js";

// Only register the strategy if credentials are present, so local dev without
// Google creds doesn't crash on boot.
if (env.googleClientId && env.googleClientSecret) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: env.googleClientId,
        clientSecret: env.googleClientSecret,
        callbackURL: env.googleCallbackUrl,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value?.toLowerCase();
          if (!email) {
            return done(new Error("Google account has no email"), undefined);
          }

          let user = await User.findOne({ $or: [{ googleId: profile.id }, { email }] });

          if (!user) {
            user = await User.create({
              name: profile.displayName || "New User",
              email,
              googleId: profile.id,
              avatarUrl: profile.photos?.[0]?.value,
            });
          } else if (!user.googleId) {
            // Account previously created via email/password — link it.
            user.googleId = profile.id;
            if (!user.avatarUrl) user.avatarUrl = profile.photos?.[0]?.value;
            await user.save();
          }

          return done(null, user);
        } catch (err) {
          return done(err as Error, undefined);
        }
      }
    )
  );
}

export default passport;
