const argon2 = require('argon2');
const { query } = require('../../sql/config');

async function main(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }
    const { username, password } = req.body;
    const selectQuery = 'SELECT Password FROM Users WHERE Username = @username';
    try {
        const users = await query(selectQuery, { username });
        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }
        const hashedPassword = users[0].password;
        if (await argon2.verify(hashedPassword, password)) {
            res.status(200).json({ message: 'Login successful' });
            const session = require('crypto').randomBytes(16).toString('hex');
            res.cookie('session_id', session, { httpOnly: true, secure: true, expiry: Date.now() + 3600000 });
            const insertSessionQuery = `
                INSERT INTO Sessions (SessionId, Username, CreatedOn, ExpiresOn)
                VALUES (@SessionId, @Username, GETDATE(), DATEADD(hour, 9, GETDATE()))
            `;
            await query(insertSessionQuery, { SessionId: session, Username: username });
        } else {
            res.status(401).json({ error: 'Invalid username or password' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
}

module.exports = { main };