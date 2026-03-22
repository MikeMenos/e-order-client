import { NextResponse } from "next/server";
import sql from "mssql";

const dbConfig = {
  user: process.env.DB_USER ?? "admin_bi",
  password: process.env.DB_PASSWORD ?? "your-password",
  server: process.env.DB_SERVER ?? "49.13.109.87",
  database: process.env.DB_NAME ?? "EORDER",
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

export async function GET() {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .query("SELECT * FROM VW_WEEKLY_COMPARISON_PROJECTION");
    return NextResponse.json(result.recordset);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Error in /api/weekly-stats:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
