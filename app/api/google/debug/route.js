import { getServerSession } from "next-auth/next"; 
import { authOptions } from "../../auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: "Not logged in" });
  }

  const accessToken = session.accessToken;

  // 1. Fetch ALL Accounts (Personal + Organizations)
  const accountsRes = await fetch('https://mybusinessaccountmanagement.googleapis.com/v1/accounts', {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  const accountsData = await accountsRes.json();

  // 2. Fetch Locations for EACH account found
  let debugLog = [];
  
  if (accountsData.accounts) {
    for (const acc of accountsData.accounts) {
      const locRes = await fetch(`https://mybusinessbusinessinformation.googleapis.com/v1/${acc.name}/locations?readMask=name,title`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const locData = await locRes.json();
      
      debugLog.push({
        accountName: acc.accountName,
        accountId: acc.name,
        type: acc.type,
        locationsFound: locData.locations || "NONE"
      });
    }
  }

  return NextResponse.json({ 
    rawGoogleResponse: accountsData,
    debugAnalysis: debugLog 
  });
}