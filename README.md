# node-passport-gmail-test

Here I am attempting to demonstration not only using OAuth2 to validate a user,
but to also USE THAT VALIDATION (access/refresh tokens) to make subsequent,
future offline API calls on behalf of that user.

# Code

```JavaScript
// EXPRESS ----------------------------------------------------------------------------------------

const express = require("express");
const app = express();
const session = require("express-session");

app.use(session({
   resave: false,
   saveUninitialized: true,
   secret: "SECRET"
}));

app.get("/", function(req, res) { res.render("pages/auth.ejs"); });

const port = process.env.PORT || 3000;

app.listen(port, () => console.log("App listening on port " + port));

// PASSPORT ---------------------------------------------------------------------------------------

const passport = require("passport");

var userProfile;

app.use(passport.initialize());
app.use(passport.session());

app.get("/success", (req, res) => res.send(userProfile));
app.get("/error", (req, res) => res.send("TODO: Login error!"));

passport.serializeUser(function(user, cb) { cb(null, user); });
passport.deserializeUser(function(obj, cb) { cb(null, obj); });

// GOOGLE -----------------------------------------------------------------------------------------

const GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;
const GOOGLE_CLIENT_ID = "";
const GOOGLE_CLIENT_SECRET = "";

passport.use(new GoogleStrategy({
   clientID: GOOGLE_CLIENT_ID,
   clientSecret: GOOGLE_CLIENT_SECRET,
   callbackURL: "http://localhost:3000/auth/google/callback"
},
function(accessToken, refreshToken, profile, done) {
   // TODO: HOW DO I USE THIS to do interesting things!? Grr.
   console.log(`accessToken = ${accessToken}`)
   console.log(`refreshToken = ${refreshToken}`)

   userProfile = profile;

   return done(null, userProfile);
}));

app.get("/auth/google", passport.authenticate("google", {
   scope: ["profile", "email"],
   // accessType: "offline"
}));

app.get("/auth/google/callback",
   passport.authenticate("google", {failureRedirect: "/error"}),
   function(req, res) {
      // Successful OAuth2 dance! Send the user to the route above.
      res.redirect("/success");
   }
);
```
# Questions

The code above works as it should: IF the application is properly created
and configured with the Google Deveopers Console then they can successfully
authorize (in my case the project is configured as a "web" app, and NOT a
"desktop" app). Eventually, the callback inside the ```GoogleStrategy``` is
invoked, giving me access to to the tokens and the user's profile. *HOWEVER*...

What I'm not clear on is how I **USE** the "results" of that authorization in
subsequent API calls (for example, listing all the outgoing draft in my GMail
outbox)? A naive approach that I tried was something like this:

```JavaScript
const generateConfig = (url, accessToken) => {
   return {
      method: "get",
      url: url,
      headers: {
         Authorization: `Bearer ${accessToken} `,
         "Content-type": "application/json",
      }
   };
}

async function getDrafts(accessToken) {
   try {
      const url = "https://gmail.googleapis.com/gmail/v1/users/me/drafts";
      const config = generateConfig(url, accessToken);
      const response = await axios(config);

      console.log(response.data);
   }

   catch(error) {
      console.log(error);
   }
}
```

I would then use the ```accessToken``` given to me in the ```GoogleStrategy```
callback and pass it to ```getDrafts```. I get different variations of 401/403
errors when trying this, so I suspect I'm fundamentally misunderstanding
something. :(
