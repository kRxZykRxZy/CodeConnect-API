const { query } = require('../../sql/config');
const argon2 = require('argon2');

async function main(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }
    const { name, country, email, password } = req.body;
    if (!name || !country || !email || !password) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    const userExistsQuery = 'SELECT 1 FROM Users WHERE Username = @username';
    const paramsCheck = { username: name };
    const existingUsers = await query(userExistsQuery, paramsCheck);
    if (existingUsers.length > 0) {
        return res.status(409).json({ error: 'User already exists' });
    }
    const insertQuery = `
        INSERT INTO Users (Id, Name, Country, Email, Password, CreatedOn)
        VALUES (NEWID(), @Name, @Country, @Email, @Password, GETDATE())
    `;
    const params = {
        Name: name,
        Country: country,
        Email: email,
        Password: await argon2.hash(password),
    };
    try {
        await query(insertQuery, params);
        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create user' });
    }
}

module.exports = { main };
