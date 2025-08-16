const pool = require('../db');
const bcrypt = require('bcrypt')
const { generateAccessToken } = require('../middleware/jwt')

exports.getAll = async () => {
    const conn = await pool.getConnection();
    const rows = await conn.query('SELECT * FROM tasks');
    conn.release();
    return rows;
};

exports.verifyUser = async (username, password) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query('SELECT * FROM users WHERE username = ?', [username]);
        if (rows.length === 0) {
            throw new Error("Invalid username or password!")
        }
        const user = rows[0];
        const correct_password = await bcrypt.compare(password, user.password);
        if (!correct_password) {
            throw new Error("Invalid username or password!")
        }
        const token = generateAccessToken({ username });
        return { id: user.id, username: user.username, authToken: token };
    } catch (error) {
        throw new Error("Error retreiving user: " + error.message)
    } finally {
        if (conn) conn.release();
    }
};

exports.create = async (username, password) => {
    let conn;
    try {
        conn = await pool.getConnection();

        const hash = await bcrypt.hash(password, saltRounds);

        const result = await conn.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hash]);
        return { id: Number(result.insertId), username };
    }
    catch (error) {
        throw new Error('Failed to create user: ' + error.message);
    }
    finally {
        if (conn) conn.release();
    }
};

exports.update = async (username, new_password) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const result = await conn.query(
            'UPDATE users SET username = ?, password = ?',
            [username, new_password]
        );
    } catch (error) {
        throw new Error("An error occured while updating: " + error.message);
    } finally {
        if (conn) { conn.release(); }
    }
    return { updated: result.affectedRows > 0 };
};

exports.remove = async (username) => {
    let conn;
    try {
        const conn = await pool.getConnection();
        const result = await conn.query('DELETE FROM users WHERE username = ?', [username]);
    } catch (error) {
        throw new Error("An error has occured while deleting a user: " + error.message);
    }
    finally {
        if (conn) {
            conn.release();
        }
    }
    return { deleted: result.affectedRows > 0 };
};