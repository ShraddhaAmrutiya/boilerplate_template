import pool from "../config/db";

const userModel = {
  async findByUsername(username: string) {
    const query = "SELECT * FROM v_users WHERE username = $1";
    const { rows } = await pool.query(query, [username]);
    return rows;
  },

  async findByEmail(email: string) {
    const query = "SELECT * FROM v_users WHERE user_email = $1";
    const { rows } = await pool.query(query, [email]);
    return rows;
  },

  async createUser(userData: any) {
    const query = `
      INSERT INTO v_users (username, user_email, password, token, add_date)
      VALUES ($1, $2, $3, $4, $5) RETURNING user_uuid
    `;
    const { rows } = await pool.query(query, [
      userData.username,
      userData.user_email,
      userData.password,
     
    ]);
    return rows;
  }
};

export default userModel;
