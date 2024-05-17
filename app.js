import mariadb from "mariadb";

const pool = mariadb.createPool({
  host: "localhost",
  user: "foodreviewer",
  password: "foodreview123",
  database: "food_reviewer",
  connectionLimit: 5,
});

async function asyncFunction() {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query("SELECT 1 as val");
    console.log(rows);
  } catch (err) {
    throw err;
  } finally {
    if (conn) conn.release();
  }
}

asyncFunction();
