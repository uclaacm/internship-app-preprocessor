import * as dotenv from "dotenv";
import { google } from "googleapis";

dotenv.config();
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const SERVICE_ACCOUNT = process.env.SERVICE_ACCOUNT ?? "";

async function processSheet() {
  const sheets = google.sheets("v4");
  // Get JWT Token to access sheet
  const service_account = JSON.parse(SERVICE_ACCOUNT);
  const jwtClient = new google.auth.JWT(
    service_account.client_email,
    "",
    service_account.private_key,
    ["https://www.googleapis.com/auth/spreadsheets"]
  );
  jwtClient.authorize(function (err) {
    if (err) {
      console.error(err);
      throw err;
    }
  });
}

processSheet();

// export default processSheet;
