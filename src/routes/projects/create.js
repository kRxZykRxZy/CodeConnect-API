const { query } = require('../../sql/conf');

async function main(req, res) {
    if (!name || !description || !startDate || !endDate) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    const insertQuery = `
        INSERT INTO Projects (Id, Author, Title, Description, Instructions, LastModified, CreatedOn, Stats)
        VALUES (NEWID(), @Author, @Title, @Description, @Instructions, GETDATE(), GETDATE(), @Stats)
    `;
    const params = {
        Author: req.headers['x-user-id'] || 'anonymous',
        Title: name,
        Description: description,
        Instructions: `Start Date: ${startDate}\nEnd Date: ${endDate}`,
        Stats: JSON.stringify({ views: 0, likes: 0 }),
    };
    try {
        await query(insertQuery, params);
        res.status(201).json({ message: 'Project created successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create project' });
    }
}

module.exports = { main };