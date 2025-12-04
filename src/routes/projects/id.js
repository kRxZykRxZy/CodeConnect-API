const { query } = require('../../sql/config');

async function main(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }
    const urlPath = req.path.split('/').filter(Boolean);
    const projectId = urlPath.map(s => Number(s)).find(n => !isNaN(n));
    const selectQuery = 'SELECT * FROM Projects WHERE Id = @ProjectId';
    try {
        const projects = await query(selectQuery, { ProjectId: projectId });
        if (projects.length === 0) {
            return res.status(404).json({ error: 'Project not found' });
        }
        res.status(200).json(projects[0]);
    } catch (error) {
        res.status(404).json({ error: 'Project Not Found' });
    }
}

module.exports = { main };
