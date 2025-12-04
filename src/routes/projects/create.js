const { query } = require('../../sql/config');

async function main(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }
    const insertQuery = `
        INSERT INTO Projects (Id, Author, Title, Description, Instructions, LastModified, CreatedOn, Stats, Shared, Files)
        VALUES (NEWID(), @Author, @Title, @Description, @Instructions, GETDATE(), GETDATE(), @Stats, 'false', '{}')
    `;
    const cookie = req.cookies['session_id'];
    if (!cookie) {
        return res.send(403).json({ "error": "Unauthorized" });
    } 
    const usernameQuery = 'SELECT Username FROM Sessions WHERE SessionId = @SessionId';
    const users = await query(usernameQuery, { SessionId: cookie });
    if (users.length === 0) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const username = users[0].username;
    const params = {
        Author: username,
        Title: 'Untitled Project',
        Description: 'No description provided.',
        Instructions: `No instructions provided.`,
        Stats: JSON.stringify({ views: 0, likes: 0, upvotes: 0 }),
    };
    try {
        await query(insertQuery, params);
        res.status(201).json({ message: 'Project created successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create project' });
    }
}

module.exports = { main };
