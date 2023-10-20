
import crypto from "crypto";
import axios from "axios";

export default async function handler(req, res) {
  if (req.method === "POST") {

    const signature = req.headers["x-hub-signature"];
    if (!signature) {
      throw new Error("Couldn't validate the signature.");
    } else {
      const elements = signature.split("=");
      const signatureHash = elements[1];
      const expectedHash = crypto
        .createHmac("sha1", process.env.APP_SECRET)
        .update(JSON.stringify(req.body))
        .digest("hex");
      if (signatureHash !== expectedHash) {
        throw new Error("Couldn't validate the request signature.");
      }
    }

    let body = req.body;
    if (body.object) {
      if (
        body.entry &&
        body.entry[0].changes &&
        body.entry[0].changes[0] &&
        body.entry[0].changes[0].value.messages
      ) {
        let message = body.entry[0].changes[0].value.messages[0];
        if (message) {
          let from = message.from;
          let type = message.type;
          var msg_body = "_System Error !_";
          if (type === "text") {
            msg_body = message.text.body;
          } else if (type === "interactive") {
            let interactiveType = message.interactive.type;

            if (interactiveType === "button_reply") {
              msg_body = message.interactive.button_reply.title;
              console.log(msg_body);
            } else if (interactiveType === "list_reply") {
              msg_body =
                message.interactive.list_reply.title +
                " " +
                message.interactive.list_reply.description;
            }
          }

          var resPost = {
            method: "POST",
            url:
              "https://graph.facebook.com/" +
              api_version +
              "/" +
              biz_phone_number_id +
              "/messages",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + whatsappToken,
            },
            data: {
              messaging_product: "whatsapp",
              to: from,
              text: {
                body: "You replied: _" + msg_body + "_",
              },
            },
          };
        }
        axios(resPost).catch((error) => {
          console.error("Error sending message:", error);
        });
      }
      res.status(200).end();
    } else {
      res.status(404).end();
    }
  } else if (req.method === "GET") {
    let mode = req.query["hub.mode"];
    let token = req.query["hub.verify_token"];
    let challenge = req.query["hub.challenge"];

    if (mode && token) {
      if (mode === "subscribe" && token === process.env.WHATSAPP_TOKEN) {
        console.log("WEBHOOK_VERIFIED");
        res.status(200).send(challenge);
      } else {
        res.status(403).end();
      }
    }
  } else {
    // Si la méthode de la requête n'est pas POST ou GET, renvoyez une erreur
    res.status(405).json({ message: "Méthode non autorisée" });
  }
}
