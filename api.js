const express = require("express");
const admin = require("firebase-admin");

const serviceAccount = require("./key/hf-fitness-17603-firebase-adminsdk-kelyx-c5b001af4c.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const app = express();

// Endpoint to trigger sending notifications with user-provided title and body
app.get("/sendCustomNotification", (req, res) => {
  const { title, body } = req.query; // Extract title and body from query params

  if (!title || !body) {
    res.status(400).send("Title and body are required");
    return;
  }

  db.collection("FCMtokens")
    .get()
    .then((snapshot) => {
      const tokens = [];
      snapshot.forEach((doc) => {
        tokens.push(doc.data().token); // Assuming the field name is 'token'
      });

      const message = {
        notification: {
          title: title, // Use user-provided title
          body: body, // Use user-provided body
        },
        tokens: tokens,
      };

      admin
        .messaging()
        .sendEachForMulticast(message)
        .then((response) => {
          console.log("Successfully sent notification:", response);
          res.status(200).send("Notifications sent successfully");
        })
        .catch((error) => {
          console.log("Error sending notification:", error);
          res.status(500).send("Failed to send notifications");
        });
    })
    .catch((error) => {
      console.log("Error getting documents:", error);
      res.status(500).send("Failed to retrieve tokens");
    });
});

// Start the server
const PORT = 3000; // Replace with your desired port number
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
